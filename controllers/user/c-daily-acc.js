const moment = require('moment-timezone');

const ShareFunc = require("../c-api-app-share-function");

const DailyPeriod  = require("../../models/m-daily-period");
const DailyEntry   = require("../../models/m-daily-entry");
const AccCashBook  = require("../../models/m-acc-cashbook");
const AccCashMan   = require("../../models/m-acc-cashman");
const AccShop      = require("../../models/m-acc-shop");
const AccProject   = require("../../models/m-acc-project");
const AccBankAccount = require("../../models/m-acc-bankaccount");
const AccChart       = require("../../models/m-acc-chart");
const factoryAuth    = require("../../middleware/check-authFactory");   // เช็คสิทธิ์โรงงาน route แบบ B
const AccPayable     = require("../../models/m-acc-payable");           // เจ้าหนี้/หนี้ค้างชำระ (ซื้อเชื่อ)
const AccLog         = require("../../models/m-acc-log");               // audit log (query ใน getBillLog/Station)
const { writeLog }   = require("./c-log-util");                         // util กลางเขียน log (ได้ expireAt/retention ต่อ module)

// ## เขียน audit log บัญชีรายวัน → ผ่าน util กลาง (module='daily')
async function writeAccLog(data) { await writeLog({ ...data, module: 'daily' }); }

// ## ป้ายชื่อประเภท transaction Cash Book (ใช้ในสรุป log)
function cbTypeLabel(t) {
    return ({ income: 'รายรับ', expense: 'รายจ่าย', in: 'รายรับ', out: 'รายจ่าย',
              top_up: 'รับเงิน(เติม)', transfer_out: 'โอนออก', transfer_in: 'โอนเข้า' })[t] || t;
}

// ## soft-delete cashbook entry + เขียน log module='cashbook' (บอกว่าถูกยกเลิกเพราะอะไรในรายวัน)
// ## reason: สาเหตุที่ยกเลิก (ลบบิล/แก้บิล/ลบรายการ/ลบการจ่ายหนี้ ...) → โชว์ต่อ cash man ใน Station
async function voidCashbook(cashBookEntryID, reason, req) {
    if (!cashBookEntryID) return;
    const cb = await AccCashBook.findOne({ entryID: cashBookEntryID }).lean();
    await AccCashBook.findOneAndUpdate({ entryID: cashBookEntryID }, { $set: { status: 'i' } });
    if (!cb || cb.status === 'i') return;                       // ไม่มี/ถูกลบไปแล้ว → ไม่ log ซ้ำ
    const cm = await AccCashMan.findOne({ cashManID: cb.cashManID }).lean();
    const cmName = cm?.name || cm?.cashManName || cb.cashManID;
    const amt = Number(cb.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 });
    await writeLog({
        module: 'cashbook', targetType: 'entry',
        companyID: cb.companyID, factoryID: cb.factoryID, action: 'delete',
        summary: `ยกเลิก(${reason}) ${cbTypeLabel(cb.type)} ${amt} · ${cmName}`,
        meta: { entryID: cb.entryID, type: cb.type, amount: cb.amount, cashManID: cb.cashManID, cashManName: cmName, source: 'daily', reason },
        userID: req?.userData?.tokenSet?.userID || '', userName: req?.userData?.userName || '',
    });
}
const WorkerPayPeriod = require("../../models/m-worker-pay-period");   // สำหรับค่าแรงเหมา worker
const WorkerPayItem   = require("../../models/m-worker-pay-item");
const User            = require("../../models/m-user");                // worker → uInfo.wageType (แยกเหมา/รายวัน/รายเดือน)
const Gsconfig        = require("../../models/m-gsconfig");            // รหัสบัญชีค่าแรงรวมต่อประเภท

moment.tz.setDefault('Asia/Bangkok');

// ── computeLaborLumps ──────────────────────────────
// Requirement: หายอดค่าแรง worker รวมทั้งโรงงาน "แยกตามประเภทค่าจ้าง" (เหมา/รายวัน/รายเดือน)
//   เงื่อนไข: ต้องมีงวด reviewing 'r' ก่อน ไม่งั้นเอา open 'a' (draft) — ไม่เอา closed 'c' (จ่ายแล้ว)
//   ถ้าไม่มีงวด open/reviewing เลย → คืน null → frontend ซ่อนปุ่มดึงค่าแรง
//   net ต่อประเภท = Σ (income - deduction) ของ worker ที่ uInfo.wageType = ประเภทนั้น
//     - piecework → บัญชี WP_ALL_LABOR_CODE (เหมาทั้งหมด)
//     - daily     → บัญชี WP_ALL_LABOR_DAILY_CODE (รายวันทั้งหมด)
//     - monthly   → บัญชี WP_ALL_LABOR_MONTHLY_CODE (รายเดือนทั้งหมด)
//   ใช้ทั้งตอนโชว์ปุ่ม + ตอน save (recompute ยอด ล็อกไม่ให้ client แก้)
async function computeLaborLumps(companyID, factoryID) {
    let period = await WorkerPayPeriod.findOne({ companyID, factoryID, status: 'r' }).lean();
    if (!period) {
        period = await WorkerPayPeriod.findOne({ companyID, factoryID, status: 'a' }).lean();
    }
    if (!period) return null;

    // net ต่อ worker
    const per = await WorkerPayItem.aggregate([
        { $match: { periodID: period.periodID } },
        { $group: {
            _id: '$workerID',
            income:    { $sum: { $cond: [{ $eq: ['$type', 'income']    }, '$amount', 0] } },
            deduction: { $sum: { $cond: [{ $eq: ['$type', 'deduction'] }, '$amount', 0] } },
        }},
    ]);

    // workerID → wageType
    const ids = per.map(p => p._id);
    const workers = await User.find({ userID: { $in: ids } }, { userID: 1, 'uInfo.wageType': 1 }).lean();
    const typeMap = new Map(workers.map(w => [w.userID, w.uInfo?.wageType || 'daily']));

    // รหัสบัญชีค่าแรงรวมต่อประเภท (จาก gsconfig)
    const gc = await Gsconfig.find({ companyID, factoryID, key: { $in: ['WP_ALL_LABOR_CODE', 'WP_ALL_LABOR_DAILY_CODE', 'WP_ALL_LABOR_MONTHLY_CODE'] } }, { key: 1, value: 1, _id: 0 }).lean();
    const cfg = {}; for (const c of gc) cfg[c.key] = c.value;

    const types = {
        piecework: { code: (cfg.WP_ALL_LABOR_CODE         || '59030001').trim(), net: 0, count: 0 },
        daily:     { code: (cfg.WP_ALL_LABOR_DAILY_CODE   || '59030002').trim(), net: 0, count: 0 },
        monthly:   { code: (cfg.WP_ALL_LABOR_MONTHLY_CODE || '59030003').trim(), net: 0, count: 0 },
        // ★ worker ที่ยังไม่ระบุ wageType (ว่าง/ไม่รู้จัก) — แยกก้อน ไม่ยัดเข้า daily เงียบๆ (กันเงินหลุดผิดก้อน)
        unknown:   { code: '', net: 0, count: 0 },
    };
    for (const p of per) {
        const t = typeMap.get(p._id);
        const bucket = (t === 'piecework' || t === 'daily' || t === 'monthly') ? types[t] : types.unknown;
        bucket.net   += (p.income - p.deduction);
        bucket.count += 1;
    }
    return { period, types };
}

// ── ymdToUTC ──────────────────────────────
// Requirement: แปลง "YYYY-MM-DD" → Date ที่ UTC เที่ยงคืน — convention เดียวของ "วันปฏิทิน" (calendar date) ทั้งระบบ
//   เหตุผล: ประเทศไทย = UTC+7 ถ้าเก็บแบบ tz-shift (moment.tz().toDate()) วันที่ 1 จะกลายเป็นสิ้นเดือนก่อน (UTC 17:00)
//   ทำให้ "งวด" คาบเกี่ยวข้ามเดือน — ห้ามใช้กับวันปฏิทินเด็ดขาด ใช้ ymdToUTC แทน
function ymdToUTC(ymd) {
    return new Date(String(ymd).slice(0, 10) + 'T00:00:00.000Z');
}

// ── ymdStr ──────────────────────────────
// Requirement: อ่าน Date (เก็บแบบ UTC-midnight) กลับเป็น string "YYYY-MM-DD" ก่อนส่งให้ frontend
function ymdStr(d) {
    return d ? new Date(d).toISOString().slice(0, 10) : '';
}

// ## helper: หา/สร้าง period สำหรับ year/month นั้น
// ## คืน null ถ้า period ปิดแล้ว (caller รับผิดชอบ reject)
async function getOrCreatePeriod(companyID, factoryID, year, month, userID) {
    const periodID  = `dp_${factoryID}_${year}_${String(month).padStart(2, '0')}`;
    let period      = await DailyPeriod.findOne({ periodID }).lean();

    if (!period) {
        // ## period metadata — เก็บเป็น UTC ให้ตรง convention วันปฏิทิน (ดู ymdToUTC)
        const mm        = String(month).padStart(2, '0');
        const dateStart = ymdToUTC(`${year}-${mm}-01`);
        const lastDay   = new Date(Date.UTC(year, month, 0)).getUTCDate();  // month=1-based → วันสุดท้ายของเดือน
        const dateEnd   = new Date(`${year}-${mm}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`);
        const newPeriod = await DailyPeriod.create({
            periodID, companyID, factoryID, year, month,
            dateStart, dateEnd, status: 'open',
            createBy: { userID: userID || '' },
        });
        period = newPeriod.toObject();
    }

    return period;
}

// ── createCashBookEntry ──────────────────────────────
// Requirement: จ่าย/รับเงินสดใน Daily → สร้าง AccCashBook entry คู่กันอัตโนมัติ
//   income → top_up (cash man รับเงิน) | expense → expense (จ่ายออก)
//   date ใช้ entry.entryDate (UTC-midnight) โดยตรง → งวด cash book ตรงกับ Daily เสมอ
// opts.skipLog = true → ไม่เขียน log ฝั่ง cashbook (ให้ caller log เอง เช่น จ่ายหนี้) · opts.reason/userName ปรับได้
async function createCashBookEntry(companyID, factoryID, entry, userID, opts = {}) {
    const count     = await AccCashBook.countDocuments({ companyID, factoryID });
    const cbEntryID = `cb_daily_${factoryID}_${String(count + 1).padStart(6, '0')}`;

    // income → cash man รับเงิน → top_up | expense → จ่ายออก → expense
    const cbType = entry.type === 'income' ? 'top_up' : 'expense';

    await AccCashBook.create({
        entryID:     cbEntryID,
        companyID,
        factoryID,
        cashManID:   entry.cashManID,
        date:        entry.entryDate,
        type:        cbType,
        amount:      entry.amount,
        description: `[Daily] ${entry.shopName} — ${entry.note || entry.chartAccName}`,
        // ## ลิงก์กลับ Daily bill — ให้ Cash Book รวมแสดงเป็น 1 แถวต่อบิล + คลิกดูรายการข้างในได้
        billID:       entry.billID       || '',
        billNo:       entry.billNo        || '',
        shopID:       entry.shopID        || '',
        shopName:     entry.shopName      || '',
        chartAccCode: entry.chartAccCode  || '',
        chartAccName: entry.chartAccName  || '',
        note:         entry.note          || '',
        images:       entry.images        || [],
        createBy:    { userID: userID || '' },
    });

    // ## log ฝั่ง Cash Book — เงินสดเข้า/ออก cash man จากรายวัน (สมมาตรกับตอนยกเลิก)
    if (!opts.skipLog) {
        const _cmName = entry.cashManName || entry.cashManID;
        const _amt = Number(entry.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 });
        await writeLog({
            module: 'cashbook', targetType: 'entry',
            companyID, factoryID, billNo: entry.billNo || '', action: 'create',
            summary: `${opts.reason || 'รายวัน'} ${cbTypeLabel(cbType)} ${_amt} · ${_cmName}${entry.shopName ? ' · ' + entry.shopName : ''}`,
            meta: { entryID: cbEntryID, type: cbType, amount: entry.amount, cashManID: entry.cashManID, cashManName: _cmName, source: 'daily', reason: opts.reason || 'รายวัน', billID: entry.billID || '' },
            userID: userID || '', userName: opts.userName || '',
        });
    }

    return cbEntryID;
}

// ── postSystemDailyEntry ──────────────────────────────
// ## สร้างรายการรายวันจาก "ระบบ" (เช่น จ่าย outsource) → auto-create Cash Book เงินออก
// ## locked=true → หน้ารายวันลบ/แก้ไม่ได้ (ต้องยกเลิกที่ต้นทาง) · post ตาม entryDate จริง
// ## คืน { ok, entryID, cashBookEntryID, error } — ถ้างวดของ entryDate ปิดแล้ว → ok:false + error
exports.postSystemDailyEntry = async (data, userID) => {
    const { companyID, factoryID, entryDate, amount, chartAccCode, chartAccName,
            cashManID, cashManName, shopID, shopName, note, source, billID, billNo, images,
            payMethod, cheque } = data;   // payMethod: 'cash'|'cheque' · cheque: {bankAccountID, chequeNo, chequeDate}
    const ymd   = String(entryDate).slice(0, 10);
    const year  = Number(ymd.slice(0, 4)), month = Number(ymd.slice(5, 7));

    const period = await getOrCreatePeriod(companyID, factoryID, year, month, userID);
    if (period.status === 'closed')
        return { ok: false, error: 'งวดรายวันของวันจ่ายปิดแล้ว — เลือกวันจ่ายในงวดที่เปิด' };
    const latestClosed = await DailyPeriod.findOne({ companyID, factoryID, status: 'closed' }, { year: 1, month: 1 })
        .sort({ year: -1, month: -1 }).lean();
    if (latestClosed && (year * 100 + month) <= (latestClosed.year * 100 + latestClosed.month))
        return { ok: false, error: 'วันจ่ายอยู่ในงวดที่ปิดแล้ว/ก่อนหน้า — เลือกวันจ่ายในงวดที่เปิด' };

    const count   = await DailyEntry.countDocuments({ companyID, factoryID });
    const entryID = `de_${factoryID}_${String(count + 1).padStart(6, '0')}`;
    const entryObj = {
        entryID, periodID: period.periodID, companyID, factoryID,
        entryDate: ymdToUTC(entryDate), type: 'expense',
        chartAccCode: chartAccCode || '', chartAccName: chartAccName || '',
        amount: Number(amount), shopID: shopID || source || 'system', shopName: shopName || '',
        payMethod: payMethod || 'cash',
        cheque: payMethod === 'cheque' ? {
            bankAccountID: cheque?.bankAccountID || '',
            chequeNo:      cheque?.chequeNo || '',
            chequeDate:    cheque?.chequeDate ? ymdToUTC(cheque.chequeDate) : null,
        } : undefined,
        cashManID: cashManID || '', cashManName: cashManName || '', cashBookEntryID: '',
        projectID: '', projectName: '', billID: billID || '', billNo: billNo || '',
        note: note || '', images: images || [], source: source || 'system', locked: true,
        createBy: { userID: userID || '' },
    };
    if (cashManID) {
        const cbID = await createCashBookEntry(companyID, factoryID, entryObj, userID, { reason: 'จ่าย ' + (source || 'ระบบ') });
        entryObj.cashBookEntryID = cbID;
    }
    await DailyEntry.create(entryObj);
    return { ok: true, entryID, cashBookEntryID: entryObj.cashBookEntryID };
};

// ── voidSystemDailyEntry ──────────────────────────────
// ## ยกเลิกรายการรายวันจากระบบ (ตอนยกเลิกจ่าย outsource) → soft-delete entry + cashbook
exports.voidSystemDailyEntry = async (entryID, reason, req) => {
    if (!entryID) return;
    const existing = await DailyEntry.findOne({ entryID, status: 'a' }).lean();
    if (!existing) return;
    await voidCashbook(existing.cashBookEntryID, reason || 'ยกเลิกจ่าย outsource', req);
    await DailyEntry.findOneAndUpdate({ entryID }, { $set: { status: 'i' } });
};

// ── setSystemDailyEntryImages ─────────────────────────
// ## sync รูปหลักฐาน (จาก outsource evidence) มาที่รายการรายวัน → หน้ารายวันดูรูปได้ (view-only)
exports.setSystemDailyEntryImages = async (entryID, images) => {
    if (!entryID) return;
    await DailyEntry.findOneAndUpdate({ entryID, status: 'a' }, { $set: { images: images || [] } });
};


// #############################################################
// ## GET /api/a/admacc/daily/periods/:companyID/:factoryID
// ## ดึงงวดทั้งหมด (สำหรับ month selector + cutoff logic)
exports.getAllPeriods = async (req, res, next) => {
    const { companyID, factoryID } = req.params;
    try {
        const periods = await DailyPeriod.find({ companyID, factoryID })
            .sort({ year: -1, month: -1 })
            .lean();
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), periods });
    } catch (err) { next(err); }
};


// ## GET /api/a/admacc/daily/data/:companyID/:factoryID/:year/:month?q=xxx
// ## ดึง period + entries ของเดือนนั้น (รองรับ ?q= สำหรับ server-side search)
exports.getDailyData = async (req, res, next) => {
    const { companyID, factoryID, year, month } = req.params;
    const q = (req.query.q || '').trim();
    try {
        const periodID = `dp_${factoryID}_${year}_${String(month).padStart(2, '0')}`;
        const period   = await DailyPeriod.findOne({ periodID }).lean();

        const filter = { periodID, status: 'a' };
        if (q) {
            const regex = new RegExp(q, 'i');
            filter.$or = [
                { shopName:     regex },
                { chartAccName: regex },
                { note:         regex },
            ];
        }

        const rawEntries = period
            ? await DailyEntry.find(filter).sort({ entryDate: -1, createdAt: -1 }).lean()
            : [];

        // ## format entryDate เป็น YYYY-MM-DD ในเขตเวลา Bangkok ก่อนส่ง
        // ## ป้องกัน UTC offset ทำให้วันเลื่อนไป 1 วัน เช่น 28 → 27
        const entries = rawEntries.map(e => ({
            ...e,
            entryDate: ymdStr(e.entryDate),   // ## UTC-midnight → "YYYY-MM-DD" (calendar date convention)
        }));

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), period, entries });
    } catch (err) { next(err); }
};


// ## GET /api/a/admacc/daily/master/:companyID/:factoryID
// ## ดึง master data สำหรับ dialog dropdowns (ครั้งเดียว)
exports.getDailyMasterData = async (req, res, next) => {
    const { companyID, factoryID } = req.params;
    try {
        const [shops, cashMen, bankAccounts, projects, accounts] = await Promise.all([
            AccShop.find({ companyID, factoryID, status: 'a', active: true }).sort({ name: 1 }).lean(),
            AccCashMan.find({ companyID, factoryID, status: 'a', active: true }).sort({ name: 1 }).lean(),
            AccBankAccount.find({ companyID, factoryID, status: 'a', active: true }).lean(),
            AccProject.find({ companyID, factoryID, status: 'a', active: true }).sort({ name: 1 }).lean(),
            AccChart.find({ companyID, factoryID, status: 'a' }).sort({ code: 1 }).lean(),
        ]);

        // ## ค่าแรง worker — บอก frontend ว่ามีงวดให้ดึงไหม + ยอดแยกตามประเภท (เหมา/รายวัน/รายเดือน)
        const lumps = await computeLaborLumps(companyID, factoryID);
        const laborLump = lumps
            ? { available: true, periodID: lumps.period.periodID, periodName: lumps.period.name,
                startDate: lumps.period.startDate, endDate: lumps.period.endDate, types: lumps.types }
            : { available: false, periodID: '', periodName: '',
                types: { piecework: { code: '', net: 0, count: 0 }, daily: { code: '', net: 0, count: 0 }, monthly: { code: '', net: 0, count: 0 }, unknown: { code: '', net: 0, count: 0 } } };

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
            shops, cashMen, bankAccounts, projects, accounts, laborLump });
    } catch (err) { next(err); }
};


// ## POST /api/a/admacc/daily/entry/create
exports.createDailyEntry = async (req, res, next) => {
    const {
        companyID, factoryID,
        entryDate, type,
        chartAccCode, chartAccName,
        amount,
        shopID, shopName,
        payMethod,
        cashManID, cashManName,
        cheque,
        projectID, projectName,
        note, images,
    } = req.body;

    const userID = req.userData?.tokenSet?.userID || '';

    try {
        // ## entryDate = "YYYY-MM-DD" ล้วน → หา year/month จาก string ตรงๆ (ไม่ผ่าน tz) กัน bug งวดเพี้ยน
        const ymd   = String(entryDate).slice(0, 10);
        const year  = Number(ymd.slice(0, 4));
        const month = Number(ymd.slice(5, 7));

        // ## check/create period
        const period = await getOrCreatePeriod(companyID, factoryID, year, month, userID);
        if (period.status === 'closed') {
            return res.status(400).json({ success: false, message: 'งวดเดือนนี้ปิดแล้ว ไม่สามารถเพิ่มรายการได้' });
        }

        // ## check cutoff: ห้ามลงใน month ที่ <= latest closed period
        const latestClosed = await DailyPeriod.findOne(
            { companyID, factoryID, status: 'closed' },
            { year: 1, month: 1 }
        ).sort({ year: -1, month: -1 }).lean();

        if (latestClosed) {
            const cutoffVal = latestClosed.year * 100 + latestClosed.month;
            const entryVal  = year * 100 + month;
            if (entryVal <= cutoffVal) {
                return res.status(400).json({ success: false, message: 'ไม่สามารถลงรายการในงวดที่ปิดแล้วหรือก่อนหน้า' });
            }
        }

        // ## สร้าง entryID
        const count   = await DailyEntry.countDocuments({ companyID, factoryID });
        const entryID = `de_${factoryID}_${String(count + 1).padStart(6, '0')}`;

        const entryObj = {
            entryID,
            periodID:  period.periodID,
            companyID, factoryID,
            entryDate: ymdToUTC(entryDate),
            type,
            chartAccCode,
            chartAccName: chartAccName || '',
            amount:    Number(amount),
            shopID,
            shopName:  shopName || '',
            payMethod,
            cashManID:       payMethod === 'cash' ? (cashManID || '') : '',
            cashManName:     payMethod === 'cash' ? (cashManName || '') : '',
            cashBookEntryID: '',
            cheque:    payMethod === 'cheque' ? (cheque || {}) : {},
            projectID:   projectID   || '',
            projectName: projectName || '',
            note:   note   || '',
            images: images || [],
            createBy: { userID },
        };

        // ## auto-create cashbook entry ถ้าจ่ายเงินสด
        if (payMethod === 'cash' && cashManID) {
            const cbID = await createCashBookEntry(companyID, factoryID, entryObj, userID);
            entryObj.cashBookEntryID = cbID;
        }

        await DailyEntry.create(entryObj);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};


// ## PUT /api/a/admacc/daily/entry/update
exports.updateDailyEntry = async (req, res, next) => {
    const {
        entryID,
        entryDate, type,
        chartAccCode, chartAccName,
        amount,
        shopID, shopName,
        payMethod,
        cashManID, cashManName,
        cheque,
        projectID, projectName,
        note, images,
    } = req.body;

    const userID = req.userData?.tokenSet?.userID || '';

    try {
        const existing = await DailyEntry.findOne({ entryID, status: 'a' }).lean();
        if (!existing) return res.status(404).json({ success: false, message: 'ไม่พบรายการ' });
        // ## เช็คสิทธิ์โรงงานของรายการนี้ (route แบบ B)
        if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, existing.factoryID)))
            return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });

        // ## รายการล็อกจากระบบ (เช่น จ่าย outsource) → แก้ที่นี่ไม่ได้
        if (existing.locked)
            return res.status(400).json({ success: false, message: 'รายการนี้มาจากระบบ (เช่น จ่าย Outsource) แก้ที่นี่ไม่ได้ — ไปแก้ที่หน้าต้นทาง' });

        // ## check period ยังเปิดอยู่
        const period = await DailyPeriod.findOne({ periodID: existing.periodID }).lean();
        if (period?.status === 'closed') {
            return res.status(400).json({ success: false, message: 'งวดเดือนนี้ปิดแล้ว ไม่สามารถแก้ไขได้' });
        }

        // ## ลบ cashbook เก่าถ้ามี (+ log ต่อ cash man ว่าถูกยกเลิกเพราะแก้รายการ)
        await voidCashbook(existing.cashBookEntryID, 'แก้รายการ', req);

        const updatedEntry = {
            ...existing,
            entryDate:   ymdToUTC(entryDate),
            type,
            chartAccCode,
            chartAccName: chartAccName || '',
            amount:      Number(amount),
            shopID,
            shopName:    shopName || '',
            payMethod,
            cashManID:       payMethod === 'cash' ? (cashManID || '') : '',
            cashManName:     payMethod === 'cash' ? (cashManName || '') : '',
            cashBookEntryID: '',
            cheque:      payMethod === 'cheque' ? (cheque || {}) : {},
            projectID:   projectID   || '',
            projectName: projectName || '',
            note:   note   || '',
            images: images || [],
        };

        // ## สร้าง cashbook ใหม่ถ้าจ่ายเงินสด
        if (payMethod === 'cash' && cashManID) {
            const cbID = await createCashBookEntry(
                existing.companyID, existing.factoryID,
                { ...updatedEntry, entryDate: ymdToUTC(entryDate) },
                userID
            );
            updatedEntry.cashBookEntryID = cbID;
        }

        await DailyEntry.findOneAndUpdate(
            { entryID },
            { $set: updatedEntry }
        );

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};


// ## DELETE /api/a/admacc/daily/entry/:entryID
exports.deleteDailyEntry = async (req, res, next) => {
    const { entryID } = req.params;
    try {
        const existing = await DailyEntry.findOne({ entryID, status: 'a' }).lean();
        if (!existing) return res.status(404).json({ success: false, message: 'ไม่พบรายการ' });
        // ## เช็คสิทธิ์โรงงานของรายการนี้ (route แบบ B)
        if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, existing.factoryID)))
            return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });

        // ## รายการล็อกจากระบบ (เช่น จ่าย outsource) → ลบที่นี่ไม่ได้ ต้องยกเลิกที่ต้นทาง
        if (existing.locked)
            return res.status(400).json({ success: false, message: 'รายการนี้มาจากระบบ (เช่น จ่าย Outsource) ลบที่นี่ไม่ได้ — ไปยกเลิกที่หน้าต้นทาง' });

        const period = await DailyPeriod.findOne({ periodID: existing.periodID }).lean();
        if (period?.status === 'closed') {
            return res.status(400).json({ success: false, message: 'งวดเดือนนี้ปิดแล้ว ไม่สามารถลบได้' });
        }

        // ## ลบ cashbook entry ถ้ามี (+ log ต่อ cash man ว่าถูกยกเลิกเพราะลบรายการ)
        await voidCashbook(existing.cashBookEntryID, 'ลบรายการ', req);

        await DailyEntry.findOneAndUpdate({ entryID }, { $set: { status: 'i' } });

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};


// ## GET /api/a/admacc/daily/entry-by-cashbook/:cashBookEntryID
exports.getDailyEntryByCashBook = async (req, res, next) => {
    const { cashBookEntryID } = req.params;
    try {
        const entry = await DailyEntry.findOne({ cashBookEntryID }).lean();
        if (!entry) return res.status(404).json({ success: false, message: 'ไม่พบรายการ' });
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), entry });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/daily/bill-by-id/:billID
// requirement: ดึง "บิลต้นทาง" (รายการที่ซื้อ + รูป) จาก DailyEntry ตาม billID
//   use case: หน้า Cash Book คลิกแถวจ่ายชำระหนี้ (บิลเชื่อ) → อยากเห็นว่าซื้ออะไร + รูปใบเสร็จ
exports.getBillById = async (req, res, next) => {
    const { billID } = req.params;
    try {
        const entries = await DailyEntry.find({ billID, status: 'a' }).sort({ createdAt: 1 }).lean();
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        if (!entries.length)
            return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), bill: null });
        // เช็คสิทธิ์โรงงานของบิลนี้ (route แบบ B — ไม่มี factoryID ใน request)
        if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, entries[0].factoryID)))
            return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
        const rep = entries[0];
        // รูปจาก entry แรก + ตัดซ้ำตาม baseName/url กันรูปเบิ้ล
        const seen = new Set();
        const images = (rep.images || []).filter(im => {
            const k = im.baseName || im.url || '';
            if (!k || seen.has(k)) return false;
            seen.add(k); return true;
        });
        const bill = {
            billID,
            billNo:    rep.billNo || '',
            entryDate: rep.entryDate,
            shopName:  rep.shopName || '',
            type:      rep.type,
            payMethod: rep.payMethod,
            total:     entries.reduce((s, e) => s + (e.amount || 0), 0),
            items:     entries.map(e => ({
                chartAccCode: e.chartAccCode, chartAccName: e.chartAccName, amount: e.amount, note: e.note || '',
            })),
            images,
        };
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), bill });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/daily/bill-log/:billID
// ## audit log ของบิล (ใครสร้าง/แก้/ลบ · เรียงล่าสุดก่อน)
exports.getBillLog = async (req, res, next) => {
    const { billID } = req.params;
    try {
        const logs = await AccLog.find({ billID }).sort({ at: -1 }).limit(100).lean();
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), logs });
    } catch (err) { console.error('[getBillLog]', err.message); return next(err); }
};

// ## GET /api/a/admacc/daily/logs/:companyID/:factoryID?action=&limit=
// ## audit log ทั้งโรงงาน (รวมบิลที่ถูกลบไปแล้ว) · filter action ได้ (create/update/delete)
exports.getFactoryLog = async (req, res, next) => {
    const { companyID, factoryID } = req.params;
    const { action } = req.query;
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    try {
        const filter = { companyID, factoryID, module: 'daily' };
        if (action && ['create', 'update', 'delete'].includes(action)) filter.action = action;
        const logs = await AccLog.find(filter).sort({ at: -1 }).limit(limit).lean();
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), logs });
    } catch (err) { console.error('[getFactoryLog]', err.message); return next(err); }
};

// ## POST /api/a/admacc/daily/bill/create
// ## สร้างหลาย entries ในบิลเดียวกัน (billID เดียวกัน)
// ## ทุกบิลต้องมี images อย่างน้อย 1 รูป (validate ฝั่ง backend ด้วย)
exports.createDailyBill = async (req, res, next) => {
    const {
        companyID, factoryID,
        entryDate, type,
        billNo,
        shopID, shopName,
        payMethod,
        cashManID, cashManName,
        cheque,
        projectID, projectName,
        note,
        images,     // ## รูปภาพ บังคับอย่างน้อย 1 รูป
        items,      // ## [{ chartAccCode, chartAccName, amount }]
        isLaborLump, // ## true = บิลค่าแรงเหมา worker รวมทั้งโรงงาน
    } = req.body;

    const userID = req.userData?.tokenSet?.userID || '';

    // ## validate: ต้องมีรูปอย่างน้อย 1 รูป
    if (!images || images.length === 0) {
        return res.status(400).json({ success: false, message: 'ต้องอัพโหลดรูปอย่างน้อย 1 รูปต่อบิล' });
    }
    // ## validate: ต้องมีรายการอย่างน้อย 1 รายการ
    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'ต้องมีรายการบัญชีอย่างน้อย 1 รายการ' });
    }

    try {
        // ## entryDate = "YYYY-MM-DD" ล้วน → หา year/month จาก string ตรงๆ (ไม่ผ่าน tz) กัน bug งวดเพี้ยน
        const ymd   = String(entryDate).slice(0, 10);
        const year  = Number(ymd.slice(0, 4));
        const month = Number(ymd.slice(5, 7));

        // ## check/create period
        const period = await getOrCreatePeriod(companyID, factoryID, year, month, userID);
        if (period.status === 'closed') {
            return res.status(400).json({ success: false, message: 'งวดเดือนนี้ปิดแล้ว ไม่สามารถเพิ่มรายการได้' });
        }

        // ## check cutoff
        const latestClosed = await DailyPeriod.findOne(
            { companyID, factoryID, status: 'closed' },
            { year: 1, month: 1 }
        ).sort({ year: -1, month: -1 }).lean();

        if (latestClosed) {
            const cutoffVal = latestClosed.year * 100 + latestClosed.month;
            const entryVal  = year * 100 + month;
            if (entryVal <= cutoffVal) {
                return res.status(400).json({ success: false, message: 'ไม่สามารถลงรายการในงวดที่ปิดแล้วหรือก่อนหน้า' });
            }
        }

        // ## บิลค่าแรง worker (เหมา/รายวัน/รายเดือน) — กฎพิเศษ (หัวใจของระบบ ต้องเป๊ะ)
        let laborPeriodIDForEntry = '';
        if (isLaborLump) {
            // 1 บิล = 1 รายการเท่านั้น
            if (items.length !== 1) {
                return res.status(400).json({ success: false, message: 'บิลค่าแรงต้องมีรายการบัญชีเดียวเท่านั้น' });
            }
            const laborCode = String(items[0].chartAccCode || '').trim();

            // ## recompute ยอดจากงวด worker เอง (ล็อก — ไม่เชื่อค่าจาก client) · จับคู่ยอดตาม "รหัสบัญชี" ของประเภทนั้น
            const lumps = await computeLaborLumps(companyID, factoryID);
            if (!lumps) {
                return res.status(400).json({ success: false, message: 'ไม่พบงวดค่าแรง worker' });
            }
            const match = Object.values(lumps.types).find(t => t.code === laborCode);
            if (!match) {
                return res.status(400).json({ success: false, message: 'รหัสบัญชีค่าแรงไม่ตรงกับที่ตั้งค่าไว้ (เหมา/รายวัน/รายเดือน)' });
            }

            // ## งวดบัญชีต้องตรงกับ "เดือนเริ่มงวด worker" (เช่น 6มิ.ย.-3ก.ค. = เดือน มิ.ย.)
            const wpMonth  = moment(lumps.period.startDate).tz('Asia/Bangkok').format('YYYY-MM');
            const accMonth = `${year}-${String(month).padStart(2, '0')}`;
            if (wpMonth !== accMonth) {
                return res.status(400).json({ success: false, message: `งวดค่าแรง worker นี้ = เดือน ${wpMonth} — ต้องลงในงวดบัญชีเดือน ${wpMonth} (ตอนนี้กำลังลงเดือน ${accMonth})` });
            }

            // ## กันดึง "งวด worker เดียวกัน" ลงบัญชีประเภทเดิมซ้ำ — แม้คนละเดือนบัญชี (นับเฉพาะ active)
            const existed = await DailyEntry.findOne({ companyID, factoryID, laborPeriodID: lumps.period.periodID, chartAccCode: laborCode, isLaborLump: true, status: 'a' }).lean();
            if (existed) {
                return res.status(400).json({ success: false, message: 'งวดค่าแรงนี้ลงบัญชีประเภทนี้ไปแล้ว — ลบของเดิมก่อนถ้าต้องการลงใหม่' });
            }

            items[0].amount   = match.net;               // override ยอดตามที่คำนวณจริงของประเภทนั้น (อนุญาต 0)
            laborPeriodIDForEntry = lumps.period.periodID;
        }

        // ## สร้าง billID ด้วย timestamp + random
        const billID = `bill_${factoryID}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

        let count = await DailyEntry.countDocuments({ companyID, factoryID });

        const createdEntries = [];

        for (const item of items) {
            count++;
            const entryID = `de_${factoryID}_${String(count).padStart(6, '0')}`;

            const entryObj = {
                entryID,
                periodID:  period.periodID,
                companyID, factoryID,
                entryDate: ymdToUTC(entryDate),
                type,
                chartAccCode: item.chartAccCode,
                chartAccName: item.chartAccName || '',
                amount:    Number(item.amount),
                shopID,
                shopName:  shopName || '',
                payMethod,
                cashManID:       payMethod === 'cash' ? (cashManID || '') : '',
                cashManName:     payMethod === 'cash' ? (cashManName || '') : '',
                cashBookEntryID: '',
                cheque:    payMethod === 'cheque' ? (cheque || {}) : {},
                projectID:   projectID   || '',
                projectName: projectName || '',
                note:   note   || '',
                images: images,         // ## รูปภาพเดียวกันทุก entry ในบิล
                billID,
                billNo:  billNo || '',
                isLaborLump: !!isLaborLump,   // ## มาร์คบิลค่าแรง worker
                laborPeriodID: laborPeriodIDForEntry,   // ## งวด worker ที่ดึงมา (กันซ้ำ + งวดตรงกัน)
                createBy: { userID },
            };

            // ## auto-create cashbook entry ถ้าจ่ายเงินสด (ต่อ item)
            if (payMethod === 'cash' && cashManID) {
                const cbID = await createCashBookEntry(companyID, factoryID, entryObj, userID);
                entryObj.cashBookEntryID = cbID;
            }

            await DailyEntry.create(entryObj);
            createdEntries.push(entryID);
        }

        // ## ซื้อเชื่อ (payMethod credit) → สร้างหนี้ค้างชำระ 1 record ต่อบิล
        //   accrual: ค่าใช้จ่ายลงที่บิลรายวันแล้ว (entries ข้างบน) → payable ไว้ "ตามหนี้" อย่างเดียว
        //   ไม่หักเงินสด (createCashBookEntry ไม่ทำงานเพราะ payMethod != 'cash')
        if (payMethod === 'credit') {
            const totalAmount = items.reduce((s, it) => s + Number(it.amount || 0), 0);
            const payableID   = `pay_${factoryID}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const purchaseDate = ymdToUTC(entryDate);

            // ## จ่ายบางส่วนตอนซื้อ (down payment) — เงินสด "หรือเช็ค" (optional): 1 บิล = จ่ายบางส่วน + ติดหนี้ได้
            const payments = [];
            let paidAmount = 0;
            const dp = req.body.downPayment;   // { amount, payMethod('cash'|'cheque'), cashManID, cashManName, cheque }
            if (dp && Number(dp.amount) > 0) {
                const dpAmt    = Number(dp.amount);
                const dpMethod = dp.payMethod === 'cheque' ? 'cheque' : 'cash';
                if (dpAmt > totalAmount + 0.001)
                    return res.status(400).json({ success: false, message: 'ยอดจ่ายตอนซื้อเกินยอดบิล' });
                let dpCbID = '';
                if (dpMethod === 'cash') {
                    if (!dp.cashManID)
                        return res.status(400).json({ success: false, message: 'จ่ายเงินสดตอนซื้อต้องเลือก cash man' });
                    // เงินสดออกจาก cash man → cashbook expense (เช็คไม่เข้า cashbook)
                    dpCbID = await createCashBookEntry(companyID, factoryID, {
                        type: 'expense', cashManID: dp.cashManID, cashManName: dp.cashManName || '',
                        entryDate: purchaseDate, amount: dpAmt,
                        shopName: shopName || '', note: `จ่ายบางส่วนตอนซื้อ${billNo ? ' บิล ' + billNo : ''}`,
                        chartAccName: 'จ่ายชำระหนี้', chartAccCode: '',
                        billID, billNo: billNo || '', shopID, images: [],
                    }, userID, { reason: 'มัดจำ', userName: req.userData?.userName || '' });
                }
                payments.push({
                    paymentID: `pmt_${payableID}_${Date.now()}`, date: purchaseDate, amount: dpAmt,
                    payMethod: dpMethod,
                    cashManID:   dpMethod === 'cash' ? dp.cashManID : '',
                    cashManName: dpMethod === 'cash' ? (dp.cashManName || '') : '',
                    cashBookEntryID: dpCbID,
                    cheque: dpMethod === 'cheque' ? (dp.cheque || {}) : {},
                    note: 'จ่ายตอนซื้อ',
                    createdAt: new Date(), createBy: { userID },
                });
                paidAmount = dpAmt;
            }

            await AccPayable.create({
                payableID, companyID, factoryID,
                shopID, shopName: shopName || '',
                billID, billNo: billNo || '',
                purchaseDate,
                items: items.map(it => ({ chartAccCode: it.chartAccCode, chartAccName: it.chartAccName || '', amount: Number(it.amount || 0) })),
                totalAmount, paidAmount, payments,
                status: paidAmount >= totalAmount - 0.001 ? 'paid' : 'open',
                note: note || '',
                createdAt: new Date(), createBy: { userID },
            });

            // ## audit log (module=payable) — เกิดหนี้ใหม่จากซื้อเชื่อ
            const _out = totalAmount - paidAmount;
            await writeLog({
                module: 'payable', targetType: 'payable',
                companyID, factoryID, billID, billNo: billNo || '', action: 'create',
                summary: `สร้างหนี้ ${totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}${shopName ? ' · ' + shopName : ''} · จ่ายแล้ว ${paidAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} · ค้าง ${_out.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
                meta: { payableID, totalAmount, paidAmount, outstanding: _out, shopName: shopName || '', billID },
                userID, userName: req.userData?.userName || '',
            });
        }

        // ## audit log — สร้างบิล
        const _cTotal = (items || []).reduce((s, it) => s + Number(it.amount || 0), 0);
        await writeAccLog({
            companyID, factoryID, billID, billNo: billNo || '', action: 'create',
            summary: `สร้างบิล ${(items || []).length} รายการ · ยอด ${_cTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })} · ${payMethod === 'credit' ? 'เชื่อ' : payMethod === 'cheque' ? 'เช็ค' : 'สด'}${shopName ? ' · ' + shopName : ''}`,
            userID, userName: req.userData?.userName || '',
        });

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), billID, createdEntries });
    } catch (err) { next(err); }
};


// ## PUT /api/a/admacc/daily/bill/update
// ## อัปเดตบิล: soft-delete entries เก่า แล้วสร้างใหม่ด้วย billID เดิม
exports.updateDailyBill = async (req, res, next) => {
    const {
        billID,
        companyID, factoryID,
        entryDate, type,
        billNo,
        shopID, shopName,
        payMethod,
        cashManID, cashManName,
        cheque,
        projectID, projectName,
        note,
        images,
        items,
    } = req.body;

    const userID = req.userData?.tokenSet?.userID || '';

    if (!billID) return res.status(400).json({ success: false, message: 'ต้องระบุ billID' });
    if (!images || images.length === 0) {
        return res.status(400).json({ success: false, message: 'ต้องมีรูปอย่างน้อย 1 รูปต่อบิล' });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'ต้องมีรายการบัญชีอย่างน้อย 1 รายการ' });
    }

    try {
        // ## ดึง entries เก่า
        const oldEntries = await DailyEntry.find({ billID, status: 'a' }).lean();
        if (!oldEntries.length) return res.status(404).json({ success: false, message: 'ไม่พบบิลนี้' });

        // ## check period ยังเปิดอยู่
        const period = await DailyPeriod.findOne({ periodID: oldEntries[0].periodID }).lean();
        if (period?.status === 'closed') {
            return res.status(400).json({ success: false, message: 'งวดเดือนนี้ปิดแล้ว ไม่สามารถแก้ไขได้' });
        }

        // ## soft-delete cashbook ของ entries เก่า (+ log ต่อ cash man ว่าถูกยกเลิกเพราะแก้บิล)
        for (const e of oldEntries) {
            await voidCashbook(e.cashBookEntryID, 'แก้บิล', req);
        }

        // ## soft-delete entries เก่า
        await DailyEntry.updateMany({ billID }, { $set: { status: 'i' } });

        // ## สร้าง entries ใหม่ด้วย billID เดิม (entryDate → UTC-midnight)
        let count = await DailyEntry.countDocuments({ companyID, factoryID });

        for (const item of items) {
            count++;
            const entryID = `de_${factoryID}_${String(count).padStart(6, '0')}`;

            const entryObj = {
                entryID,
                periodID:  period.periodID,
                companyID, factoryID,
                entryDate: ymdToUTC(entryDate),
                type,
                chartAccCode: item.chartAccCode,
                chartAccName: item.chartAccName || '',
                amount:    Number(item.amount),
                shopID,
                shopName:  shopName || '',
                payMethod,
                cashManID:       payMethod === 'cash' ? (cashManID || '') : '',
                cashManName:     payMethod === 'cash' ? (cashManName || '') : '',
                cashBookEntryID: '',
                cheque:    payMethod === 'cheque' ? (cheque || {}) : {},
                projectID:   projectID   || '',
                projectName: projectName || '',
                note:   note   || '',
                images,
                billID,
                billNo:  billNo || '',
                createBy: { userID },
            };

            if (payMethod === 'cash' && cashManID) {
                const cbID = await createCashBookEntry(companyID, factoryID, entryObj, userID);
                entryObj.cashBookEntryID = cbID;
            }

            await DailyEntry.create(entryObj);
        }

        // ## บิลเชื่อ: sync payable (เจ้าหนี้) ให้ตรงกับบิลที่แก้ — items/ยอดรวม/ร้าน/วันที่
        // ## payments[] (down payment ที่จ่ายไปแล้ว) คงเดิม, recompute status จากยอดใหม่
        if (payMethod === 'credit') {
            const payable = await AccPayable.findOne({ billID, companyID, factoryID });
            if (payable) {
                const newTotal = items.reduce((s, it) => s + Number(it.amount || 0), 0);
                payable.items = items.map(it => ({
                    chartAccCode: it.chartAccCode,
                    chartAccName: it.chartAccName || '',
                    amount:       Number(it.amount || 0),
                }));
                payable.totalAmount  = newTotal;
                payable.purchaseDate = ymdToUTC(entryDate);
                payable.shopID       = shopID;
                payable.shopName     = shopName || '';
                payable.billNo       = billNo || '';
                payable.status       = (payable.paidAmount >= newTotal - 0.001) ? 'paid' : 'open';
                await payable.save();
            }
        }

        // ## audit log — แก้ไขบิล (diff เฉพาะที่เปลี่ยน)
        const _uOldTotal = (oldEntries || []).reduce((s, e) => s + (e.amount || 0), 0);
        const _uNewTotal = (items || []).reduce((s, it) => s + Number(it.amount || 0), 0);
        const _uOld = oldEntries[0] || {};
        const _uChanges = [];
        const _uPush = (field, from, to) => { if (String(from) !== String(to)) _uChanges.push({ field, from: String(from), to: String(to) }); };
        _uPush('ยอดรวม', _uOldTotal.toFixed(2), _uNewTotal.toFixed(2));
        _uPush('จำนวนรายการ', (oldEntries || []).length, (items || []).length);
        _uPush('หมายเหตุ', _uOld.note || '', note || '');
        _uPush('วิธีจ่าย', _uOld.payMethod || '', payMethod || '');
        _uPush('ร้าน', _uOld.shopName || '', shopName || '');
        await writeAccLog({
            companyID, factoryID, billID, billNo: billNo || '', action: 'update',
            changes: _uChanges, summary: `แก้ไขบิล${_uChanges.length ? ' (' + _uChanges.length + ' จุด)' : ''}`,
            userID, userName: req.userData?.userName || '',
        });

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};


// ## DELETE /api/a/admacc/daily/bill/:billID
// ## ลบทุก entry ใน bill นั้น (soft delete)
exports.deleteDailyBill = async (req, res, next) => {
    const { billID } = req.params;
    try {
        const entries = await DailyEntry.find({ billID, status: 'a' }).lean();
        if (!entries.length) return res.status(404).json({ success: false, message: 'ไม่พบบิลนี้' });
        // ## เช็คสิทธิ์โรงงานของบิลนี้ก่อนลบ (route แบบ B)
        if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, entries[0].factoryID)))
            return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });

        // ## check period ยังเปิดอยู่ (เช็คจาก entry แรก)
        const period = await DailyPeriod.findOne({ periodID: entries[0].periodID }).lean();
        if (period?.status === 'closed') {
            return res.status(400).json({ success: false, message: 'งวดเดือนนี้ปิดแล้ว ไม่สามารถลบได้' });
        }

        // ## ลบ cashbook entries ทั้งหมดใน bill (+ log ต่อ cash man ว่าถูกยกเลิกเพราะลบบิล)
        for (const e of entries) {
            await voidCashbook(e.cashBookEntryID, 'ลบบิล', req);
        }

        // ## soft delete ทุก entry ใน bill
        await DailyEntry.updateMany({ billID }, { $set: { status: 'i' } });

        // ## บิลเชื่อ: ลบ payable (เจ้าหนี้) ของบิลนี้ + คืน cashbook ของทุก payment (down payment/จ่ายชำระ)
        // ## เพื่อให้ลบบิล = ล้างหนี้ + คืนเงินสด ครบ ไม่เหลือขยะ
        const payable = await AccPayable.findOne({ billID, companyID: entries[0].companyID, factoryID: entries[0].factoryID });
        if (payable) {
            for (const p of (payable.payments || [])) {
                await voidCashbook(p.cashBookEntryID, 'ลบบิล(คืนจ่ายหนี้)', req);
            }
            // ## audit log (module=payable) — ลบหนี้เพราะลบบิลต้นทาง
            await writeLog({
                module: 'payable', targetType: 'payable',
                companyID: payable.companyID, factoryID: payable.factoryID, billID: payable.billID, billNo: payable.billNo || '', action: 'delete',
                summary: `ลบหนี้ (ลบบิลต้นทาง) ${Number(payable.totalAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}${payable.shopName ? ' · ' + payable.shopName : ''}`,
                meta: { payableID: payable.payableID, totalAmount: payable.totalAmount, paidAmount: payable.paidAmount, reason: 'ลบบิลต้นทาง' },
                userID: req.userData?.tokenSet?.userID || '', userName: req.userData?.userName || '',
            });
            await AccPayable.deleteOne({ payableID: payable.payableID });
        }

        // ## audit log — ลบบิล
        const _dTotal = (entries || []).reduce((s, e) => s + (e.amount || 0), 0);
        const _dRep = entries[0] || {};
        await writeAccLog({
            companyID: _dRep.companyID, factoryID: _dRep.factoryID, billID, billNo: _dRep.billNo || '', action: 'delete',
            summary: `ลบบิล ${(entries || []).length} รายการ · ยอด ${_dTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}${_dRep.shopName ? ' · ' + _dRep.shopName : ''}`,
            userID: req.userData?.tokenSet?.userID || '', userName: req.userData?.userName || '',
        });

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};


// ## PUT /api/a/admacc/daily/period/close
// ## ปิดงวด — ทำได้เฉพาะ status = 'open'
exports.closeDailyPeriod = async (req, res, next) => {
    const { companyID, factoryID, year, month } = req.body;
    const userID = req.userData?.tokenSet?.userID || '';

    try {
        const periodID = `dp_${factoryID}_${year}_${String(month).padStart(2, '0')}`;

        // ## ถ้าไม่มี period → auto-create แล้วปิดเลย
        const period = await getOrCreatePeriod(companyID, factoryID, year, month, userID);
        if (period.status === 'closed') {
            return res.status(400).json({ success: false, message: 'งวดนี้ปิดแล้ว' });
        }

        await DailyPeriod.findOneAndUpdate(
            { periodID },
            { $set: { status: 'closed', closedAt: new Date(), closedBy: { userID } } }
        );

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};


// #############################################################
// ## ค้นหาบิลย้อนหลัง (Bill Search) — ตาม "ช่วงวัน" อย่างเดียว ไม่เกี่ยวงวด
// ##   use case: จำได้ลางๆ ว่าเดือนนั้นซื้ออะไร เท่าไร → ค้นดู + ดูรูปทุกบิลรวมกัน (ระบุว่าบิลไหน)

// ## GET /api/a/admacc/daily/bill-search/:companyID/:factoryID?dateStart=&dateEnd=&chartAccCode=&q=
exports.searchBills = async (req, res, next) => {
    const { companyID, factoryID } = req.params;
    const { dateStart, dateEnd, chartAccCode, q } = req.query;
    if (!dateStart || !dateEnd)
        return res.status(400).json({ success: false, message: 'dateStart, dateEnd required' });
    try {
        // entryDate เก็บแบบ UTC-midnight (calendar date) → สร้างช่วงตรงๆ ไม่ต้อง tz shift
        const start = new Date(String(dateStart).slice(0, 10) + 'T00:00:00.000Z');
        const end   = new Date(String(dateEnd).slice(0, 10)   + 'T00:00:00.000Z');

        const filter = {
            companyID, factoryID, status: 'a',
            entryDate: { $gte: start, $lte: end },
        };
        // บัญชี level 3 — รับได้หลายตัว (comma-separated) → $in; ไม่ส่ง = ทุกบัญชี
        if (chartAccCode) {
            const codes = String(chartAccCode).split(',').map(s => s.trim()).filter(Boolean);
            if (codes.length) filter.chartAccCode = { $in: codes };
        }
        if (q && q.trim()) {
            const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ shopName: rx }, { note: rx }, { billNo: rx }, { chartAccName: rx }];
        }

        const entries = await DailyEntry.find(filter).sort({ entryDate: -1, createdAt: -1 }).lean();

        // ตัดรูปซ้ำในชุดเดียว (กันกรณี entry เก็บรูปซ้ำในตัวเอง)
        const dedupeImgs = (arr) => {
            const seen = new Set(); const out = [];
            for (const im of (arr || [])) {
                const k = im.url || im.baseName || im.filename;
                if (k && seen.has(k)) continue;
                if (k) seen.add(k);
                out.push(im);
            }
            return out;
        };

        // group เป็นบิล (billID; ไม่มี billID = บิลเดี่ยว ใช้ entryID)
        // ★ รูป: ทุก entry ในบิลเก็บรูป "ชุดเดียวกัน" (createDailyBill: images:images ทุก entry)
        //   → เอารูปจาก entry แรกของบิลพอ ห้ามรวมจาก entry ถัดไป (ไม่งั้นจำนวนรูปเบิ้ล)
        const map = new Map();
        for (const e of entries) {
            const key = e.billID || `single_${e.entryID}`;
            if (!map.has(key)) {
                map.set(key, {
                    billKey:   key,
                    billNo:    e.billNo || '',
                    entryDate: new Date(e.entryDate).toISOString().slice(0, 10),   // YYYY-MM-DD (UTC-midnight)
                    shopName:  e.shopName || '',
                    type:      e.type,
                    total:     0,
                    items:     [],
                    images:    dedupeImgs(e.images),   // ← รูปจาก entry แรกเท่านั้น + ตัดซ้ำในตัว
                });
            }
            const b = map.get(key);
            b.total += e.amount || 0;
            b.items.push({ chartAccCode: e.chartAccCode, chartAccName: e.chartAccName, amount: e.amount, note: e.note || '' });
            // ไม่รวมรูปจาก entry ถัดไป — ซ้ำกับ entry แรก
        }
        const bills = Array.from(map.values());
        const totalImages = bills.reduce((s, b) => s + b.images.length, 0);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({
            success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
            bills, totalBills: bills.length, totalImages,
        });
    } catch (err) { next(err); }
};

// ## Bill Search
// #############################################################


// #############################################################
// ## เจ้าหนี้ / หนี้ค้างชำระ (Accounts Payable)

// ## GET /api/a/admacc/payable/:companyID/:factoryID?status=open|paid|all
// requirement: list หนี้ + คำนวณ outstanding (คงค้าง = total - paid)
exports.listPayables = async (req, res, next) => {
    const { companyID, factoryID } = req.params;
    const status = req.query.status || 'all';
    try {
        const filter = { companyID, factoryID };
        if (status === 'open' || status === 'paid') filter.status = status;
        const list = await AccPayable.find(filter).sort({ status: 1, purchaseDate: -1 }).lean();
        const payables = list.map(p => ({ ...p, outstanding: (p.totalAmount || 0) - (p.paidAmount || 0) }));
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), payables });
    } catch (err) { next(err); }
};

// ## POST /api/a/admacc/payable/payment
// requirement: จ่ายชำระหนี้ (เต็ม/บางส่วน) → เงินสด: หัก cash man ที่เลือก (เข้า cashbook), ลด outstanding
//   body: payableID, amount, payMethod('cash'|'cheque'), cashManID, cashManName, cheque, date, note
exports.addPayablePayment = async (req, res, next) => {
    const { payableID, amount, payMethod, cashManID, cashManName, cheque, date, note } = req.body;
    const userID = req.userData?.tokenSet?.userID || '';
    const amt = Number(amount);
    if (!payableID || !(amt > 0))
        return res.status(400).json({ success: false, message: 'payableID และ amount (>0) จำเป็น' });
    if (payMethod === 'cash' && !cashManID)
        return res.status(400).json({ success: false, message: 'จ่ายเงินสดต้องเลือก cash man' });
    try {
        const payable = await AccPayable.findOne({ payableID });
        if (!payable) return res.status(404).json({ success: false, message: 'ไม่พบหนี้' });
        // เช็คสิทธิ์โรงงาน (route แบบ B — ไม่มี factoryID ใน request)
        if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, payable.factoryID)))
            return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });

        const outstanding = (payable.totalAmount || 0) - (payable.paidAmount || 0);
        if (amt > outstanding + 0.001)
            return res.status(400).json({ success: false, message: `จ่ายเกินยอดคงค้าง (คงค้าง ${outstanding.toFixed(2)})` });

        const payDate   = date ? ymdToUTC(date) : ymdToUTC(new Date().toISOString());
        const paymentID = `pmt_${payableID}_${Date.now()}`;

        // จ่ายเงินสด → สร้าง cashbook entry (จ่ายออกจาก cash man) reuse helper เดิม
        let cashBookEntryID = '';
        if (payMethod === 'cash') {
            cashBookEntryID = await createCashBookEntry(payable.companyID, payable.factoryID, {
                type:         'expense',
                cashManID,
                entryDate:    payDate,
                amount:       amt,
                shopName:     payable.shopName,
                note:         `จ่ายเจ้าหนี้${payable.billNo ? ' บิล ' + payable.billNo : ''}`,
                chartAccName: 'จ่ายชำระหนี้',
                chartAccCode: '',
                billID:       payable.billID, billNo: payable.billNo, shopID: payable.shopID,
                images:       [],
            }, userID, { skipLog: true });   // ## skipLog — จ่ายหนี้ log เองด้านล่าง (กัน log ซ้ำ)

            // ## log cashbook — จ่ายหนี้ด้วยเงินสด (เงินออกจาก cash man)
            await writeLog({
                module: 'cashbook', targetType: 'entry',
                companyID: payable.companyID, factoryID: payable.factoryID, billNo: payable.billNo || '', action: 'create',
                summary: `จ่ายหนี้ ${amt.toLocaleString('th-TH', { minimumFractionDigits: 2 })} · ${cashManName || cashManID}${payable.shopName ? ' · ' + payable.shopName : ''}`,
                meta: { entryID: cashBookEntryID, type: 'expense', amount: amt, cashManID, cashManName: cashManName || '', reason: 'จ่ายหนี้', billID: payable.billID },
                userID, userName: req.userData?.userName || '',
            });
        }

        payable.payments.push({
            paymentID, date: payDate, amount: amt, payMethod,
            cashManID:   payMethod === 'cash' ? cashManID : '',
            cashManName: payMethod === 'cash' ? (cashManName || '') : '',
            cashBookEntryID,
            cheque:      payMethod === 'cheque' ? (cheque || {}) : {},
            note: note || '', createdAt: new Date(), createBy: { userID },
        });
        payable.paidAmount = (payable.paidAmount || 0) + amt;
        if (payable.paidAmount >= payable.totalAmount - 0.001) payable.status = 'paid';   // จ่ายครบ → ปิด
        await payable.save();

        // ## audit log (module=payable) — จ่ายหนี้ (ลดยอดค้าง + ปิดหนี้ถ้าครบ)
        const _out = (payable.totalAmount || 0) - (payable.paidAmount || 0);
        await writeLog({
            module: 'payable', targetType: 'payable',
            companyID: payable.companyID, factoryID: payable.factoryID, billID: payable.billID, billNo: payable.billNo || '', action: 'update',
            summary: `จ่ายหนี้ ${amt.toLocaleString('th-TH', { minimumFractionDigits: 2 })} (${payMethod === 'cheque' ? 'เช็ค' : 'สด'})${payable.shopName ? ' · ' + payable.shopName : ''} · คงเหลือ ${_out.toLocaleString('th-TH', { minimumFractionDigits: 2 })}${payable.status === 'paid' ? ' · ปิดหนี้' : ''}`,
            meta: { payableID: payable.payableID, paymentID, amount: amt, payMethod, paidAmount: payable.paidAmount, outstanding: _out, status: payable.status, cashManName: cashManName || '' },
            userID, userName: req.userData?.userName || '',
        });

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({
            success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
            payable: { ...payable.toObject(), outstanding: payable.totalAmount - payable.paidAmount },
        });
    } catch (err) { next(err); }
};

// ## POST /api/a/admacc/payable/payment/delete
// requirement: ลบการจ่าย 1 ครั้ง (เช่น เลือก cash man ผิด) → คืน cashbook + ลด paidAmount + ปรับ status
//   body: { payableID, paymentID }
exports.deletePayablePayment = async (req, res, next) => {
    const { payableID, paymentID } = req.body;
    if (!payableID || !paymentID)
        return res.status(400).json({ success: false, message: 'payableID และ paymentID จำเป็น' });
    try {
        const payable = await AccPayable.findOne({ payableID });
        if (!payable) return res.status(404).json({ success: false, message: 'ไม่พบหนี้' });
        if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, payable.factoryID)))
            return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });

        const pmt = (payable.payments || []).find(p => p.paymentID === paymentID);
        if (!pmt) return res.status(404).json({ success: false, message: 'ไม่พบรายการจ่ายนี้' });

        // ## การจ่ายตอนซื้อ (down payment ครั้งแรก) ลบไม่ได้ — ผูกกับบิล ถ้าจะแก้ให้ลบบิลทำใหม่
        if (pmt.note === 'จ่ายตอนซื้อ')
            return res.status(400).json({ success: false, message: 'การจ่ายตอนซื้อ (ครั้งแรก) ลบที่นี่ไม่ได้ — ถ้าจะแก้ให้ลบบิลที่หน้าบัญชีรายวันแล้วทำใหม่' });

        // คืน cashbook ของ payment นี้ (เงินสด) + log ต่อ cash man ว่ายกเลิกจ่ายหนี้
        await voidCashbook(pmt.cashBookEntryID, 'ยกเลิกจ่ายหนี้', req);
        // เอา payment ออก + ลดยอดจ่าย + ปรับสถานะ (ถ้าเคย paid แล้วลบจนไม่ครบ → กลับเป็น open)
        payable.payments   = (payable.payments || []).filter(p => p.paymentID !== paymentID);
        payable.paidAmount = Math.max(0, (payable.paidAmount || 0) - (pmt.amount || 0));
        payable.status     = (payable.paidAmount >= payable.totalAmount - 0.001) ? 'paid' : 'open';
        await payable.save();

        // ## audit log (module=payable) — ยกเลิกจ่ายหนี้ (ยอดค้างเด้งกลับ)
        const _out = (payable.totalAmount || 0) - (payable.paidAmount || 0);
        await writeLog({
            module: 'payable', targetType: 'payable',
            companyID: payable.companyID, factoryID: payable.factoryID, billID: payable.billID, billNo: payable.billNo || '', action: 'update',
            summary: `ยกเลิกจ่ายหนี้ ${Number(pmt.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}${payable.shopName ? ' · ' + payable.shopName : ''} · ค้างเพิ่มเป็น ${_out.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
            meta: { payableID: payable.payableID, paymentID, amount: pmt.amount, paidAmount: payable.paidAmount, outstanding: _out, status: payable.status, cashManName: pmt.cashManName || '' },
            userID: req.userData?.tokenSet?.userID || '', userName: req.userData?.userName || '',
        });

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({
            success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
            payable: { ...payable.toObject(), outstanding: payable.totalAmount - payable.paidAmount },
        });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/payable/report/:companyID/:factoryID
// requirement: รายงานเจ้าหนี้ — สรุปหนี้ค้างต่อร้าน (เฉพาะ open) + รวม
exports.getPayableReport = async (req, res, next) => {
    const { companyID, factoryID } = req.params;
    try {
        // ## หนี้ที่ยังค้าง (open) — ใช้ทำ byShop/aging/KPI
        const open = await AccPayable.find({ companyID, factoryID, status: 'open' })
            .sort({ purchaseDate: 1 }).lean();

        // ## "วันนี้" + "เดือนนี้" อิงเวลาไทย (UTC+7) — กัน tz เพี้ยน
        const nowBkk   = new Date(Date.now() + 7 * 3600 * 1000);
        const todayUTC = Date.UTC(nowBkk.getUTCFullYear(), nowBkk.getUTCMonth(), nowBkk.getUTCDate());
        const thisYM   = nowBkk.toISOString().slice(0, 7);   // YYYY-MM

        const byShopMap = new Map();
        const aging = { b0_30: 0, b31_60: 0, b61_90: 0, b90plus: 0 };
        let totalOutstanding = 0, totalPurchased = 0, totalPaid = 0;

        for (const p of open) {
            const out = (p.totalAmount || 0) - (p.paidAmount || 0);
            totalOutstanding += out;
            totalPurchased   += (p.totalAmount || 0);
            totalPaid        += (p.paidAmount || 0);

            // ## อายุหนี้ = จำนวนวันนับจากวันซื้อ (purchaseDate เก็บ UTC-midnight)
            const pdDate = p.purchaseDate ? new Date(p.purchaseDate) : nowBkk;
            const pdUTC  = Date.UTC(pdDate.getUTCFullYear(), pdDate.getUTCMonth(), pdDate.getUTCDate());
            const ageDays = Math.max(0, Math.floor((todayUTC - pdUTC) / 86400000));
            if      (ageDays <= 30) aging.b0_30   += out;
            else if (ageDays <= 60) aging.b31_60  += out;
            else if (ageDays <= 90) aging.b61_90  += out;
            else                    aging.b90plus += out;

            if (!byShopMap.has(p.shopID))
                byShopMap.set(p.shopID, {
                    shopID: p.shopID, shopName: p.shopName,
                    billCount: 0, totalPurchased: 0, totalPaid: 0, outstanding: 0, bills: [],
                });
            const s = byShopMap.get(p.shopID);
            s.billCount      += 1;
            s.totalPurchased += (p.totalAmount || 0);
            s.totalPaid      += (p.paidAmount || 0);
            s.outstanding    += out;
            s.bills.push({
                payableID: p.payableID, billID: p.billID, billNo: p.billNo,
                purchaseDate: p.purchaseDate, ageDays,
                total: p.totalAmount || 0, paid: p.paidAmount || 0, outstanding: out,
                items: (p.items || []).map(it => ({ chartAccCode: it.chartAccCode, chartAccName: it.chartAccName, amount: it.amount })),
                payments: (p.payments || []).map(pm => ({
                    date: pm.date, amount: pm.amount, payMethod: pm.payMethod,
                    cashManName: pm.cashManName || '', chequeNo: pm.cheque?.chequeNo || '', note: pm.note || '',
                })),
            });
        }

        const byShop = Array.from(byShopMap.values()).sort((a, b) => b.outstanding - a.outstanding);

        // ## ซื้อเชื่อเดือนนี้ (รวมทุกสถานะ open+paid ที่ purchaseDate อยู่ในเดือนปัจจุบัน)
        const allThisFactory = await AccPayable.find({ companyID, factoryID })
            .select('purchaseDate totalAmount').lean();
        let purchasedThisMonth = 0;
        for (const p of allThisFactory) {
            const ym = p.purchaseDate ? new Date(p.purchaseDate).toISOString().slice(0, 7) : '';
            if (ym === thisYM) purchasedThisMonth += (p.totalAmount || 0);
        }

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({
            success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
            reportDate: nowBkk.toISOString().slice(0, 10),
            byShop, aging,
            totalOutstanding, totalPurchased, totalPaid,
            creditorCount: byShop.length, billCount: open.length,
            purchasedThisMonth,
        });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/report/cheques/:companyID/:factoryID/:month   (month = 'YYYY-MM')
// requirement: รายงานรายการจ่ายด้วยเช็ค ประจำงวดเดือน — รวมเช็คจาก 2 แหล่ง
//   1) บิลบัญชีรายวัน payMethod='cheque' (1 บิล = เช็ค 1 ใบ — group รายการตาม billID รวมยอด)
//   2) การจ่ายชำระหนี้ (AccPayable.payments[]) ที่ payMethod='cheque' และวันที่จ่ายอยู่ในเดือนนั้น
//   คืน rows (เรียงวันที่ใหม่→เก่า) + สรุป จำนวนใบ/ยอดรวม/แยกธนาคาร
exports.getChequeReport = async (req, res, next) => {
    const { companyID, factoryID, month } = req.params;
    try {
        // ## ขอบเขตงวด = วันที่ 1 ถึงก่อนวันที่ 1 เดือนถัดไป (UTC-midnight ตามกฎวันปฏิทิน)
        const start = ymdToUTC(`${month}-01`);
        const [y, m] = String(month).split('-').map(Number);
        const nextYM = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
        const end = ymdToUTC(`${nextYM}-01`);

        const rows = [];

        // ── 1) บิลรายวันที่จ่ายเช็ค — group ตาม billID (บิลเดียวหลายรายการบัญชี = เช็คใบเดียว) ──
        const entries = await DailyEntry.find({
            companyID, factoryID, status: 'a', payMethod: 'cheque',
            entryDate: { $gte: start, $lt: end },
        }).sort({ entryDate: 1 }).lean();

        const billMap = new Map();
        for (const e of entries) {
            const row = {
                date: ymdStr(e.entryDate), source: 'daily', type: e.type,
                shopName: e.shopName || '', billNo: e.billNo || '',
                bankName: e.cheque?.bankShortName || e.cheque?.bankName || '',
                accountNo: e.cheque?.accountNo || '',
                chequeNo: e.cheque?.chequeNo || '',
                chequeDate: e.cheque?.chequeDate ? ymdStr(e.cheque.chequeDate) : '',
                amount: e.amount || 0,
            };
            if (e.billID) {
                if (billMap.has(e.billID)) {
                    billMap.get(e.billID).amount += (e.amount || 0);   // รวมยอดรายการในบิลเดียวกัน
                } else {
                    billMap.set(e.billID, row);
                    rows.push(row);
                }
            } else {
                rows.push(row);   // รายการเดี่ยวไม่มีบิล
            }
        }

        // ── 2) จ่ายชำระหนี้ด้วยเช็ค (จากงวดจ่ายใน AccPayable) ──
        const payables = await AccPayable.find({
            companyID, factoryID,
            payments: { $elemMatch: { payMethod: 'cheque', date: { $gte: start, $lt: end } } },
        }).lean();
        for (const p of payables) {
            for (const pm of (p.payments || [])) {
                if (pm.payMethod !== 'cheque' || !pm.date) continue;
                const d = new Date(pm.date);
                if (d < start || d >= end) continue;
                rows.push({
                    date: ymdStr(pm.date), source: 'payable', type: 'expense',
                    shopName: p.shopName || '', billNo: p.billNo || '',
                    bankName: pm.cheque?.bankName || '',
                    accountNo: '',
                    chequeNo: pm.cheque?.chequeNo || '',
                    chequeDate: pm.cheque?.chequeDate ? ymdStr(pm.cheque.chequeDate) : '',
                    amount: pm.amount || 0,
                });
            }
        }

        // ## เรียงวันที่ใหม่ → เก่า (string YYYY-MM-DD เทียบตรงได้)
        rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

        // ── สรุป: จำนวนใบ / ยอดรวม / แยกตามธนาคาร ──
        let totalAmount = 0;
        const bankMap = new Map();
        for (const r of rows) {
            totalAmount += r.amount;
            const key = r.bankName || 'ไม่ระบุ';
            if (!bankMap.has(key)) bankMap.set(key, { bank: key, count: 0, amount: 0 });
            const b = bankMap.get(key);
            b.count += 1;
            b.amount += r.amount;
        }
        const byBank = Array.from(bankMap.values()).sort((a, b) => b.amount - a.amount);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({
            success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
            month, rows, byBank,
            chequeCount: rows.length, totalAmount,
        });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/report/cashman-summary/:companyID/:factoryID/:month   (month = 'YYYY-MM')
// requirement: สรุปรายการบัญชีรายวันประจำงวดเดือน แยกตาม Cash Man
//   ★ เฉพาะรายการที่เกี่ยวข้องกับ cash man เท่านั้น (payMethod='cash') — ไม่รวมเช็ค/ซื้อเชื่อ
//   แต่ละ cash man: จำนวนรายการ / รายรับ / รายจ่าย / สุทธิ + ยอดแยกตามบัญชี (chart account)
exports.getCashManSummaryReport = async (req, res, next) => {
    const { companyID, factoryID, month } = req.params;
    try {
        // ## ขอบเขตงวด = วันที่ 1 ถึงก่อนวันที่ 1 เดือนถัดไป (UTC-midnight ตามกฎวันปฏิทิน)
        const start = ymdToUTC(`${month}-01`);
        const [y, m] = String(month).split('-').map(Number);
        const nextYM = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
        const end = ymdToUTC(`${nextYM}-01`);

        const entries = await DailyEntry.find({
            companyID, factoryID, status: 'a', payMethod: 'cash',
            entryDate: { $gte: start, $lt: end },
        }).sort({ entryDate: 1 }).lean();

        // ── group ตาม cashManID + ข้างในแยกตามบัญชี ──
        const cmMap = new Map();
        let totalIncome = 0, totalExpense = 0, totalCount = 0;

        for (const e of entries) {
            const key = e.cashManID || 'unknown';
            if (!cmMap.has(key))
                cmMap.set(key, {
                    cashManID: key,
                    cashManName: e.cashManName || 'ไม่ระบุ',
                    count: 0, income: 0, expense: 0, net: 0,
                    accMap: new Map(),
                });
            const cm = cmMap.get(key);
            cm.count += 1;
            totalCount += 1;

            const amt = e.amount || 0;
            if (e.type === 'income') { cm.income += amt; totalIncome += amt; }
            else                     { cm.expense += amt; totalExpense += amt; }

            // ## ยอดแยกตามบัญชี (chart account) ของ cash man คนนี้
            const accKey = e.chartAccCode || '-';
            if (!cm.accMap.has(accKey))
                cm.accMap.set(accKey, { chartAccCode: accKey, chartAccName: e.chartAccName || '', income: 0, expense: 0, count: 0 });
            const acc = cm.accMap.get(accKey);
            acc.count += 1;
            if (e.type === 'income') acc.income += amt; else acc.expense += amt;
        }

        // ## แปลง Map → array: cash man เรียงตามยอดรวมมาก→น้อย · บัญชีเรียงตามรหัส
        const byCashMan = Array.from(cmMap.values()).map(cm => ({
            cashManID: cm.cashManID,
            cashManName: cm.cashManName,
            count: cm.count,
            income: cm.income,
            expense: cm.expense,
            net: cm.income - cm.expense,
            byAccount: Array.from(cm.accMap.values())
                .sort((a, b) => (a.chartAccCode > b.chartAccCode ? 1 : a.chartAccCode < b.chartAccCode ? -1 : 0)),
        })).sort((a, b) => (b.income + b.expense) - (a.income + a.expense));

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({
            success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
            month, byCashMan,
            totalIncome, totalExpense, totalNet: totalIncome - totalExpense,
            totalCount, cashManCount: byCashMan.length,
        });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/report/credit/:companyID/:factoryID/:month   (month = 'YYYY-MM')
// requirement: รายงานติดหนี้ (ซื้อเชื่อ) ประจำงวดเดือน — บิลเชื่อที่ "ซื้อในเดือนนั้น" + สถานะล่าสุด
//   จัดกลุ่มต่อร้าน (เรียงค้างมาก→น้อย) · แต่ละบิลมี ยอดซื้อ/จ่ายแล้ว/ค้าง/อายุหนี้/งวดจ่าย
exports.getCreditReport = async (req, res, next) => {
    const { companyID, factoryID, month } = req.params;
    try {
        const start = ymdToUTC(`${month}-01`);
        const [y, m] = String(month).split('-').map(Number);
        const nextYM = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
        const end = ymdToUTC(`${nextYM}-01`);

        const list = await AccPayable.find({
            companyID, factoryID,
            purchaseDate: { $gte: start, $lt: end },
        }).sort({ purchaseDate: 1 }).lean();

        // ## "วันนี้" อิงเวลาไทย — ใช้คำนวณอายุหนี้ (เหมือน getPayableReport)
        const nowBkk   = new Date(Date.now() + 7 * 3600 * 1000);
        const todayUTC = Date.UTC(nowBkk.getUTCFullYear(), nowBkk.getUTCMonth(), nowBkk.getUTCDate());

        const byShopMap = new Map();
        let totalPurchased = 0, totalPaid = 0, totalOutstanding = 0, openBillCount = 0;

        for (const p of list) {
            const out = (p.totalAmount || 0) - (p.paidAmount || 0);
            totalPurchased   += (p.totalAmount || 0);
            totalPaid        += (p.paidAmount || 0);
            totalOutstanding += out;
            if (out > 0) openBillCount += 1;

            const pdDate = p.purchaseDate ? new Date(p.purchaseDate) : nowBkk;
            const pdUTC  = Date.UTC(pdDate.getUTCFullYear(), pdDate.getUTCMonth(), pdDate.getUTCDate());
            const ageDays = Math.max(0, Math.floor((todayUTC - pdUTC) / 86400000));

            if (!byShopMap.has(p.shopID))
                byShopMap.set(p.shopID, {
                    shopID: p.shopID, shopName: p.shopName || '',
                    billCount: 0, totalPurchased: 0, totalPaid: 0, outstanding: 0, bills: [],
                });
            const s = byShopMap.get(p.shopID);
            s.billCount      += 1;
            s.totalPurchased += (p.totalAmount || 0);
            s.totalPaid      += (p.paidAmount || 0);
            s.outstanding    += out;
            s.bills.push({
                payableID: p.payableID, billNo: p.billNo || '',
                purchaseDate: ymdStr(p.purchaseDate), ageDays,
                total: p.totalAmount || 0, paid: p.paidAmount || 0, outstanding: out,
                items: (p.items || []).map(it => ({ chartAccCode: it.chartAccCode, chartAccName: it.chartAccName, amount: it.amount })),
                payments: (p.payments || []).map(pm => ({
                    date: ymdStr(pm.date), amount: pm.amount || 0, payMethod: pm.payMethod,
                    cashManName: pm.cashManName || '', chequeNo: pm.cheque?.chequeNo || '', note: pm.note || '',
                })),
            });
        }

        const byShop = Array.from(byShopMap.values()).sort((a, b) => b.outstanding - a.outstanding);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({
            success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
            month, byShop,
            totalPurchased, totalPaid, totalOutstanding,
            billCount: list.length, openBillCount,
            creditorCount: byShop.length,
        });
    } catch (err) { next(err); }
};

// ## DELETE /api/a/admacc/payable/:payableID
// requirement: ลบหนี้ "orphan" (บิลต้นทางถูกลบไปแล้ว) + คืน cashbook ของทุก payment
//   ป้องกัน: ถ้าบิลต้นทางยังอยู่ (active) ห้ามลบตรงนี้ → ให้ไปลบที่บัญชีรายวัน (จะล้างหนี้ให้เอง)
exports.deletePayable = async (req, res, next) => {
    const { payableID } = req.params;
    try {
        const payable = await AccPayable.findOne({ payableID });
        if (!payable) return res.status(404).json({ success: false, message: 'ไม่พบหนี้' });
        if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, payable.factoryID)))
            return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });

        // บิลต้นทางยังอยู่ → ไม่ให้ลบหนี้เดี่ยวๆ (กันข้อมูลไม่ตรงกัน)
        const activeBill = await DailyEntry.findOne({ billID: payable.billID, status: 'a' });
        if (activeBill)
            return res.status(400).json({
                success: false,
                message: 'บิลต้นทางยังอยู่ — กรุณาลบที่หน้าบัญชีรายวันแทน (ระบบจะล้างหนี้ + คืนเงินสดให้อัตโนมัติ)',
            });

        // orphan → คืน cashbook ของทุก payment (down payment/จ่ายหนี้) + log แล้วลบ payable
        for (const p of (payable.payments || [])) {
            await voidCashbook(p.cashBookEntryID, 'ลบหนี้(orphan)', req);
        }
        // ## audit log (module=payable) — ลบหนี้ orphan (บิลต้นทางถูกลบไปแล้ว)
        await writeLog({
            module: 'payable', targetType: 'payable',
            companyID: payable.companyID, factoryID: payable.factoryID, billID: payable.billID, billNo: payable.billNo || '', action: 'delete',
            summary: `ลบหนี้ (orphan) ${Number(payable.totalAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}${payable.shopName ? ' · ' + payable.shopName : ''}`,
            meta: { payableID, totalAmount: payable.totalAmount, paidAmount: payable.paidAmount, reason: 'orphan' },
            userID: req.userData?.tokenSet?.userID || '', userName: req.userData?.userName || '',
        });
        await AccPayable.deleteOne({ payableID });

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};

// ## เจ้าหนี้ / หนี้ค้างชำระ
// #############################################################
