// ═══════════════════════════════════════════════════════════════════════════
// Outsource Cost — คิดต้นทุนค่าจ้างโรงงานนอก (ยึด cache dtcurrentcompanyorderoutsourcefac)
//
// โครง: โรงงานนอก → บิล[] → รายละเอียด+size
//   1 บิล = โรงนอก + orderID + วันที่ส่ง (จากฝั่ง out[] ใน cache)
//   สถานะ: ครบ = bundleNos ของบิลกลับมาครบ (อยู่ใน receive) · จ่ายแล้ว = records เราเอง
//   size = ดึงจาก OrderProduction เฉพาะ bundleNos ของบิล (lazy · เลขตรง cache)
//   ยอดเงิน "ใส่เอง" ต่อบิล/ต่อ size · กันจ่ายซ้ำ: OutsourceBill (billKey)
// ═══════════════════════════════════════════════════════════════════════════
const ShareFunc     = require("../c-api-app-share-function");
const factoryAuth   = require("../../middleware/check-authFactory");
const OutsCache     = require("../../models/m-dt-currentcompanyorderoutsourcefac");
const OutsourceBill = require("../../models/m-outsource-bill");
const OutsourcePaidUnit = require("../../models/m-outsource-paid-unit");   // ledger กันจ่ายซ้ำ (order+bundle+stage)
const OrderProduction = require("../../models/m-orderProduction");
const Gsconfig      = require("../../models/m-gsconfig");
const AccCashBook   = require("../../models/m-acc-cashbook");   // จ่าย outsource → Cash Book เงินออก
const AccCashMan    = require("../../models/m-acc-cashman");    // ชื่อ cash man (fallback)
const AccChart      = require("../../models/m-acc-chart");      // lookup ชื่อบัญชี (ค่า Outsource)
const DailyPeriod   = require("../../models/m-daily-period");   // เช็คงวดเปิดล่าสุด (min วันจ่าย)
const DailyEntry    = require("../../models/m-daily-entry");    // อ่าน entry รายวันเดิมตอนแก้ไขวิธีจ่าย
const dailyAcc      = require("./c-daily-acc");                 // post/void รายวัน auto (จ่ายจริง → รายวัน)
const { writeLog }  = require("./c-log-util");   // audit log (module='outsource')
// ## หมายเหตุ: การปลดล็อกคุมด้วยระบบสิทธิ์ (ซ่อนปุ่มจากบัญชีทั่วไป) — จะผูกกับ tab สิทธิ์ทีหลัง

const CACHE_SNAME = 'auto_getCurrentCompanyOrderOutsourceFac';

// ## calendar date "YYYY-MM-DD" → UTC-midnight Date (กฎ date-handling: ห้าม toISOString/getMonth บน local)
function ymdToUTC(ymd) {
    const [y, m, d] = String(ymd || '').split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(Date.UTC(y, m - 1, d));
}
// ## Date → "DD-Mmm-YYYY" (รูปแบบเดียวกับ sendDate ใน cache) จาก UTC parts
const _MMM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function toDDMmmYYYY(dt) {
    return `${String(dt.getUTCDate()).padStart(2,'0')}-${_MMM[dt.getUTCMonth()]}-${dt.getUTCFullYear()}`;
}
// ## ป้ายชื่อวิธีจ่าย (ใช้ในสรุป log)
function payMethodLabel(m) { return ({ cash:'เงินสด', cheque:'เช็ค', transfer:'โอน', other:'อื่นๆ' })[m] || m; }

// ## รูป evidence (เฉพาะรูป ไม่เอา pdf) → รูปแบบ images ของรายวัน (ให้ดูรูปในหน้ารายวันได้)
function evidenceToImages(evidence) {
    return (evidence || []).filter(e => !/\.pdf$/i.test(e.url || e.filename || '')).map(e => ({
        baseName: e.baseName || '', filename: e.filename || '', url: e.url || '', originalName: e.originalName || e.type || '',
    }));
}

// ## รวม qty/มัด/ชื่อสี/ชื่อโรง ของบิล 1 ใบ จาก cache (ใช้ตอนบันทึกราคา)
function billInfoFromCache(cache, billKey) {
    const [sendDate, outsFacID, orderID, targetPlaceID, colorCode] = billKey.split('|');
    const fac = (cache.data || []).find(f => f.factoryID === outsFacID);
    let qty = 0; const bset = new Set(); let colorName = colorCode;
    for (const dl of (fac?.dateList || [])) if (dl.dateName === sendDate)
        for (const e of (dl.out || [])) if (e.orderID === orderID && e.targetPlaceID === targetPlaceID && e.colorCode === colorCode) {
            qty += (e.qty || 0); (e.bundleNos || []).forEach(b => bset.add(b)); colorName = e.colorName || colorCode;
        }
    return { sendDate, outsFacID, orderID, targetPlaceID, colorCode, colorName,
             outsourceFactoryName: fac?.factoryName || outsFacID, qty, totalBundles: bset.size };
}

// ## billKey = วันที่ส่ง + โรงนอก + order + targetPlace + color  (season อยู่ที่ระดับ query)
function billKey(sendDate, outsFacID, orderID, targetPlaceID, colorCode) {
    return [sendDate, outsFacID, orderID, targetPlaceID, colorCode].join('|');
}

// ## bundleNos ของบิล 1 ใบ จาก cache (ใช้ตอนบันทึก ledger)
function bundlesOfBill(cache, bKey) {
    const [sendDate, outsFacID, orderID, targetPlaceID, colorCode] = bKey.split('|');
    const fac = (cache.data || []).find(f => f.factoryID === outsFacID);
    const arr = [];
    for (const dl of (fac?.dateList || [])) if (dl.dateName === sendDate)
        for (const e of (dl.out || [])) if (e.orderID === orderID && e.targetPlaceID === targetPlaceID && e.colorCode === colorCode)
            arr.push(...(e.bundleNos || []));
    return { bundles: arr, outsFacID, orderID };
}

// ## units ต่อ (stage,size,bundle) — "นับ 1 ตัว/1 stage" (piece ผ่าน stage เดิมซ้ำในตัวเดียว = นับครั้งเดียว)
// ## ใช้ทั้งตอนคิดเงิน (getBillDetail) และตอนบันทึก ledger (payBill)
// ## ★ stage ที่ "ทำจริง" ของ node = fromNode (ไม่ใช่ toNode) — toNode คือขั้นถัดไป ทำให้ชื่อ stage เลื่อน +1
// ##   ยืนยันกับข้อมูลจริง: node outsource `3.LINKING→4.MENDING` = ทำ LINKING (fromNode) · toNode ยังพลาด QC
// ##   (`7.QC→completeNode` → toNode=completeNode ไม่อยู่ใน STAGE_NODES) · fromNode จับครบ K–QC พอดี
async function computeStageUnits(companyID, orderID, outsFacID, bundles, STAGE_NODES, sPos, sDig) {
    if (!bundles.length || !STAGE_NODES.length) return [];
    const rows = await OrderProduction.aggregate([
        { $match: { companyID, orderID, bundleNo: { $in: bundles },
            productionNode: { $elemMatch: { isOutsource: true, factoryID: outsFacID, status: 'normal' } } } },
        { $unwind: "$productionNode" },
        { $match: { "productionNode.isOutsource": true, "productionNode.factoryID": outsFacID,
            "productionNode.status": 'normal', "productionNode.fromNode": { $in: STAGE_NODES } } },
        // ชั้น 1: dedup passes — 1 piece นับครั้งเดียวต่อ stage (stage = fromNode = ขั้นที่ทำจริง)
        { $group: { _id: { doc: "$_id", node: "$productionNode.fromNode" },
            size: { $first: { $rtrim: { input: { $toUpper: { $substr: ["$productBarcodeNoReal", sPos, sDig] } }, chars: '-' } } },
            bundleNo: { $first: "$bundleNo" } } },
        // ชั้น 2: นับ distinct pieces ต่อ (stage, size, bundle)
        { $group: { _id: { node: "$_id.node", size: "$size", bundleNo: "$bundleNo" }, qty: { $sum: 1 } } },
    ]).allowDiskUse(true);
    return rows.map(r => ({ nodeID: r._id.node, size: r._id.size, bundleNo: r._id.bundleNo, qty: r.qty }));
}

// ## GET /api/a/admacc/outsource/bills/:companyID/:factoryID/:seasonYear?outsFactoryID=&fac2=
// requirement: คืน โรงงานนอก → สรุปจำนวนบิล (ทั้งหมด/ครบ/ไม่ครบ/จ่ายแล้ว) + รายการบิล (จาก cache)
//   กฎ "fac1 ส่ง / fac1 รับ": แสดงเฉพาะบิลของ "โรงเราที่ login เลือก" (fac2 = factoryName2 ของโรงที่เลือก)
//   → กรอง out[]/receive[] ด้วย e.factoryID2 === fac2 (โรงผู้ส่ง/รับ) + บิล manual ด้วย factoryID === โรงที่เลือก
exports.getBills = async (req, res, next) => {
    const { companyID, factoryID, seasonYear } = req.params;
    const outsFactoryID = req.query.outsFactoryID || '';
    const myFac2 = req.query.fac2 || '';   // factoryName2 ของโรงที่เลือก — ว่าง = ไม่กรอง (backward compat)
    if (!companyID || !factoryID || !seasonYear)
        return res.status(400).json({ success: false, message: 'companyID, factoryID, seasonYear required' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        // วันจ่ายเริ่มต้นที่ post รายวันได้ = วันแรกหลังงวดรายวันที่ปิดล่าสุด (ล็อก calendar หน้าจ่าย)
        const latestClosed = await DailyPeriod.findOne({ companyID, factoryID, status: 'closed' }, { year: 1, month: 1 })
            .sort({ year: -1, month: -1 }).lean();
        let minPayYmd = '';
        if (latestClosed) {
            const ny = latestClosed.month === 12 ? latestClosed.year + 1 : latestClosed.year;
            const nm = latestClosed.month === 12 ? 1 : latestClosed.month + 1;
            minPayYmd = `${ny}-${String(nm).padStart(2, '0')}-01`;
        }

        const cache = await OutsCache.findOne({ companyID, seasonYear, sName: CACHE_SNAME })
            .sort({ lastDatetime: -1 }).lean();
        if (!cache)
            return res.json({ success: true, token: await tk(req), expiresIn: exp(), factories: [], cacheAt: null, minPayYmd });

        // ## บิลที่บันทึกแล้ว (billed/paid) → map billKey → { status, billID, amount, ข้อมูลจ่าย }
        const saved = await OutsourceBill.find({ companyID, seasonYear },
            { billID: 1, billKey: 1, status: 1, totalAmount: 1, lines: 1,
              paidDate: 1, cashManID: 1, cashManName: 1, payMethod: 1, cheque: 1, payNote: 1,
              cashBookEntryID: 1, evidence: 1, paymentGroupID: 1, ownerSigned: 1, locked: 1, frozen: 1 }).lean();
        const savedMap = new Map();
        for (const s of saved) savedMap.set(s.billKey, s);

        const factories = [];
        for (const fac of (cache.data || [])) {
            if (outsFactoryID && fac.factoryID !== outsFactoryID) continue;

            // receive bundleNos ของโรงเราที่เลือกเท่านั้น (ใช้เช็คครบ) — กรองด้วย factoryID2 = โรงที่รับกลับ
            const recvSet = new Set();
            for (const dl of (fac.dateList || [])) for (const e of (dl.receive || [])) {
                if (myFac2 && e.factoryID2 !== myFac2) continue;
                for (const b of (e.bundleNos || [])) recvSet.add(b);
            }

            // group out[] → บิล (วันที่ส่ง + order + targetPlace + color) — เฉพาะที่ "โรงเราที่เลือก" เป็นผู้ส่ง
            const billsMap = new Map();
            for (const dl of (fac.dateList || [])) for (const e of (dl.out || [])) {
                if (myFac2 && e.factoryID2 !== myFac2) continue;   // ## fac1 ส่ง/fac1 รับ — ข้ามบิลของโรงอื่น
                const k = billKey(dl.dateName, fac.factoryID, e.orderID, e.targetPlaceID, e.colorCode);
                if (!billsMap.has(k)) billsMap.set(k, {
                    billKey: k, outsourceFactoryID: fac.factoryID, outsourceFactoryName: fac.factoryName,
                    sendDate: dl.dateName, orderID: e.orderID, targetPlaceID: e.targetPlaceID,
                    color: e.colorCode, colorName: e.colorName || e.colorCode, qty: 0, bundles: [],
                });
                const bl = billsMap.get(k);
                bl.qty += (e.qty || 0);
                bl.bundles.push(...(e.bundleNos || []));
            }

            const bills = [];
            let cComplete = 0, cIncomplete = 0, cPaid = 0;
            for (const bl of billsMap.values()) {
                const total = bl.bundles.length;
                const got = bl.bundles.filter(b => recvSet.has(b)).length;
                const complete = got >= total && total > 0;
                const sv = savedMap.get(bl.billKey);
                const status = sv ? sv.status : (complete ? 'complete' : 'incomplete');   // billed|paid|complete|incomplete
                if (sv && sv.status === 'paid') cPaid++;
                else if (complete) cComplete++;
                else cIncomplete++;
                bills.push({
                    billKey: bl.billKey, sendDate: bl.sendDate, orderID: bl.orderID, targetPlaceID: bl.targetPlaceID,
                    color: bl.color, colorName: bl.colorName, qty: bl.qty,
                    totalBundles: total, receivedBundles: got, complete, status,
                    billID: sv?.billID || '', amount: sv?.totalAmount || 0,
                    lines: sv?.lines || [],
                    // ── ข้อมูลการจ่าย (ถ้าจ่ายแล้ว) ──
                    paidDate: sv?.paidDate || '', cashManID: sv?.cashManID || '', cashManName: sv?.cashManName || '',
                    payMethod: sv?.payMethod || '', cheque: sv?.cheque || null, payNote: sv?.payNote || '', cashBookEntryID: sv?.cashBookEntryID || '',
                    paymentGroupID: sv?.paymentGroupID || '', ownerSigned: !!sv?.ownerSigned,
                    locked: !!sv?.locked, frozen: !!sv?.frozen, evidence: sv?.evidence || [],
                });
            }
            // ## ไม่โชว์โรงนอกที่ไม่มีบิลของโรงเราที่เลือก (0 บิล) — บิล manual เติมทีหลัง (สร้าง group เองถ้ามี)
            if (!bills.length) continue;
            bills.sort((a, b) => (a.orderID + a.targetPlaceID + a.colorName + a.sendDate).localeCompare(b.orderID + b.targetPlaceID + b.colorName + b.sendDate));
            factories.push({
                outsourceFactoryID: fac.factoryID, outsourceFactoryName: fac.factoryName,
                summary: { total: bills.length, complete: cComplete, incomplete: cIncomplete, paid: cPaid },
                bills,
            });
        }

        // ── รวมบิล manual (งานเพิ่ม/ซ่อม · ไม่มีใน cache) เข้า factories — เฉพาะของโรงที่เลือก ──
        const manualDocs = await OutsourceBill.find({ companyID, seasonYear, manual: true, factoryID }).lean();
        for (const md of manualDocs) {
            if (outsFactoryID && md.outsourceFactoryID !== outsFactoryID) continue;
            let fg = factories.find(f => f.outsourceFactoryID === md.outsourceFactoryID);
            if (!fg) {
                fg = { outsourceFactoryID: md.outsourceFactoryID, outsourceFactoryName: md.outsourceFactoryName || md.outsourceFactoryID,
                       summary: { total: 0, complete: 0, incomplete: 0, paid: 0 }, bills: [] };
                factories.push(fg);
            }
            fg.bills.push({
                billKey: md.billKey, sendDate: md.sendDate, orderID: md.orderID, targetPlaceID: md.targetPlaceID || '-',
                color: md.color || '', colorName: md.colorName || 'งานเพิ่ม', qty: md.qty || 0,
                totalBundles: 0, receivedBundles: 0, complete: true, status: md.status || 'billed',
                billID: md.billID || '', amount: md.totalAmount || 0, lines: md.lines || [],
                paidDate: md.paidDate || '', cashManID: md.cashManID || '', cashManName: md.cashManName || '',
                payMethod: md.payMethod || '', cheque: md.cheque || null, payNote: md.payNote || '', cashBookEntryID: md.cashBookEntryID || '',
                paymentGroupID: md.paymentGroupID || '', ownerSigned: !!md.ownerSigned,
                locked: !!md.locked, frozen: !!md.frozen, evidence: md.evidence || [], manual: true,
                note: md.note || '',
            });
            fg.summary.total++;
            if (md.status === 'paid') fg.summary.paid++; else fg.summary.complete++;
        }

        factories.sort((a, b) => (a.outsourceFactoryName || '').localeCompare(b.outsourceFactoryName || ''));

        return res.json({ success: true, token: await tk(req), expiresIn: exp(), factories, cacheAt: cache.lastDatetime, minPayYmd });
    } catch (err) { return next(err); }
};

// ## GET /api/a/admacc/outsource/bill-detail/:companyID/:factoryID/:seasonYear?billKey=
// requirement: รายละเอียดบิล 1 ใบ — แจกจำนวนตาม size (ดึง OrderProduction เฉพาะ bundleNos ของบิลนี้)
exports.getBillDetail = async (req, res, next) => {
    const { companyID, factoryID, seasonYear } = req.params;
    const bKey = req.query.billKey || '';
    if (!companyID || !factoryID || !seasonYear || !bKey)
        return res.status(400).json({ success: false, message: 'companyID, factoryID, seasonYear, billKey required' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const [sendDate, outsFacID, orderID, targetPlaceID, colorCode] = bKey.split('|');
        const cache = await OutsCache.findOne({ companyID, seasonYear, sName: CACHE_SNAME }).sort({ lastDatetime: -1 }).lean();
        if (!cache) return res.status(404).json({ success: false, message: 'ไม่พบ cache' });

        // รวม bundleNos ของบิลนี้ (วันที่ส่ง+โรงนอก+order+target+color) จาก out
        const fac = (cache.data || []).find(f => f.factoryID === outsFacID);
        const bundles = [];
        for (const dl of (fac?.dateList || [])) if (dl.dateName === sendDate)
            for (const e of (dl.out || []))
                if (e.orderID === orderID && e.targetPlaceID === targetPlaceID && e.colorCode === colorCode)
                    bundles.push(...(e.bundleNos || []));
        if (!bundles.length) return res.json({ success: true, token: await tk(req), expiresIn: exp(), sizes: [], totalQty: 0 });

        // config จาก gsconfig (size position + stage nodes)
        const cfg = await Gsconfig.find({ companyID, factoryID, key: { $in: ['BARCODE_SIZE_POS', 'BARCODE_SIZE_DIGIT', 'OUTS_STAGE_NODES'] } }, { key: 1, value: 1, _id: 0 }).lean();
        const cm = {}; for (const c of cfg) cm[c.key] = c.value;
        const sPos = +cm.BARCODE_SIZE_POS, sDig = +cm.BARCODE_SIZE_DIGIT;
        const STAGE_NODES = (cm.OUTS_STAGE_NODES || '').split(',').map(s => s.trim()).filter(Boolean);

        // แจก size จาก OrderProduction เฉพาะ bundleNos ของบิล (scoped → เร็ว · target/color อยู่ใน key แล้ว)
        // ## 1 doc = 1 ตัว (piece) → นับ doc ($sum:1) = จำนวนตัวจริง (productCount = ขนาดมัด เก็บซ้ำทุก piece ห้าม sum)
        const rows = await OrderProduction.aggregate([
            { $match: { companyID, orderID, bundleNo: { $in: bundles } } },
            { $group: {
                _id: { $rtrim: { input: { $toUpper: { $substr: ["$productBarcodeNoReal", sPos, sDig] } }, chars: '-' } },
                qty: { $sum: 1 },
            }},
        ]).allowDiskUse(true);
        const sizes = rows.map(r => ({ size: r._id, qty: r.qty })).sort((a, b) => sizeOrder(a.size) - sizeOrder(b.size));
        const totalQty = sizes.reduce((s, x) => s + x.qty, 0);

        // ── กันจ่ายซ้ำ: units (order+bundle+stage) ที่ "จ่ายไปแล้ว" ของ bundleNos นี้ ──
        const paid = await OutsourcePaidUnit.find(
            { companyID, seasonYear, orderID, bundleNo: { $in: bundles } },
            { bundleNo: 1, nodeID: 1, _id: 0 }).lean();
        const paidSet = new Set(paid.map(u => `${u.nodeID}|${u.bundleNo}`));

        // stage + matrix = "เฉพาะที่ยังไม่จ่าย" (นับ 1 ตัว/1 stage · ตัด unit ที่จ่ายแล้วออก)
        let matrix = [], stages = [];
        if (STAGE_NODES.length) {
            const units = await computeStageUnits(companyID, orderID, outsFacID, bundles, STAGE_NODES, sPos, sDig);
            const mMap = new Map();    // "node|size" → qty (ยังไม่จ่าย)
            const stMap = new Map();   // node → { bundles:Set, pieces }
            for (const u of units) {
                if (paidSet.has(`${u.nodeID}|${u.bundleNo}`)) continue;   // จ่ายไปแล้ว → ไม่คิดซ้ำ
                const mk = `${u.nodeID}|${u.size}`;
                mMap.set(mk, (mMap.get(mk) || 0) + u.qty);
                if (!stMap.has(u.nodeID)) stMap.set(u.nodeID, { bundles: new Set(), pieces: 0 });
                const s = stMap.get(u.nodeID); s.bundles.add(u.bundleNo); s.pieces += u.qty;
            }
            matrix = [...mMap].map(([k, qty]) => { const [nodeID, size] = k.split('|'); return { nodeID, size, qty }; })
                .sort((a, b) => a.nodeID.localeCompare(b.nodeID) || (sizeOrder(a.size) - sizeOrder(b.size)));
            stages = [...stMap].map(([nodeID, v]) => ({ nodeID, bundleCount: v.bundles.size, pieceCount: v.pieces }))
                .sort((a, b) => a.nodeID.localeCompare(b.nodeID));
        }

        return res.json({ success: true, token: await tk(req), expiresIn: exp(), sizes, totalQty, stages, matrix,
            bundleCount: bundles.length, paidUnitCount: paidSet.size });
    } catch (err) { return next(err); }
};

function sizeOrder(s) { return ({ XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6, '2XL': 6, '3XL': 7 })[s] || 99; }

// ## GET /api/a/admacc/outsource/bill-bundles/:companyID/:factoryID/:seasonYear?billKey=
// requirement: รายละเอียด bundle ของบิล — แต่ละ bundleNo (+size) เข้ามาแล้ว/ยังไม่เข้า → ทำรายงาน PDF
exports.getBillBundles = async (req, res, next) => {
    const { companyID, factoryID, seasonYear } = req.params;
    const bKey = req.query.billKey || '';
    if (!companyID || !factoryID || !seasonYear || !bKey)
        return res.status(400).json({ success: false, message: 'companyID, factoryID, seasonYear, billKey required' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const [sendDate, outsFacID, orderID, targetPlaceID, colorCode] = bKey.split('|');
        const cache = await OutsCache.findOne({ companyID, seasonYear, sName: CACHE_SNAME }).sort({ lastDatetime: -1 }).lean();
        if (!cache) return res.status(404).json({ success: false, message: 'ไม่พบ cache' });
        const fac = (cache.data || []).find(f => f.factoryID === outsFacID);

        // bundleNos ของบิลนี้ (out วันนั้น) + colorName
        const outBundles = new Set(); let colorName = colorCode;
        for (const dl of (fac?.dateList || [])) if (dl.dateName === sendDate)
            for (const e of (dl.out || [])) if (e.orderID === orderID && e.targetPlaceID === targetPlaceID && e.colorCode === colorCode) {
                for (const b of (e.bundleNos || [])) outBundles.add(b);
                colorName = e.colorName || colorCode;
            }
        // receive bundleNos ทั้งหมดของโรงนี้ (เช็คเข้าแล้ว)
        const recvSet = new Set();
        for (const dl of (fac?.dateList || [])) for (const e of (dl.receive || []))
            for (const b of (e.bundleNos || [])) recvSet.add(b);

        const bundleArr = Array.from(outBundles);
        // size + qty ต่อ bundle จาก OrderProduction (1 doc = 1 ตัว → นับ doc)
        const cfg = await Gsconfig.find({ companyID, factoryID, key: { $in: ['BARCODE_SIZE_POS', 'BARCODE_SIZE_DIGIT'] } }, { key: 1, value: 1, _id: 0 }).lean();
        const cm = {}; for (const c of cfg) cm[c.key] = c.value;
        const sPos = +cm.BARCODE_SIZE_POS, sDig = +cm.BARCODE_SIZE_DIGIT;
        const rows = await OrderProduction.aggregate([
            { $match: { companyID, orderID, bundleNo: { $in: bundleArr } } },
            { $group: {
                _id: "$bundleNo",
                size: { $first: { $rtrim: { input: { $toUpper: { $substr: ["$productBarcodeNoReal", sPos, sDig] } }, chars: '-' } } },
                qty:  { $sum: 1 },
            }},
        ]).allowDiskUse(true);
        const sizeMap = new Map(); for (const r of rows) sizeMap.set(r._id, { size: r.size, qty: r.qty });

        const bundles = bundleArr.map(b => {
            const sm = sizeMap.get(b) || { size: '', qty: 0 };
            return { bundleNo: b, size: sm.size, qty: sm.qty, received: recvSet.has(b) };
        }).sort((a, b) => (sizeOrder(a.size) - sizeOrder(b.size)) || (a.bundleNo - b.bundleNo));

        const totalQty = bundles.reduce((s, x) => s + x.qty, 0);
        const recvBundles = bundles.filter(b => b.received).length;
        const recvQty = bundles.filter(b => b.received).reduce((s, x) => s + x.qty, 0);
        return res.json({
            success: true, token: await tk(req), expiresIn: exp(),
            header: { orderID, targetPlaceID, color: colorCode, colorName, sendDate,
                      outsourceFactoryID: outsFacID, outsourceFactoryName: fac?.factoryName || outsFacID,
                      totalBundles: bundles.length, totalQty, receivedBundles: recvBundles, receivedQty: recvQty },
            bundles,
        });
    } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/outsource/bill-cost — accounting ใส่ราคาต้นทุนต่อบิล (แยกต่อ stage × size)
// body { companyID, factoryID, seasonYear, billKey, lines:[{nodeID,size,qty,unitPrice}], note }
exports.saveBillCost = async (req, res, next) => {
    const { companyID, factoryID, seasonYear, billKey, note } = req.body;
    if (!companyID || !factoryID || !seasonYear || !billKey)
        return res.status(400).json({ success: false, message: 'companyID, factoryID, seasonYear, billKey required' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const exist = await OutsourceBill.findOne({ companyID, seasonYear, billKey }, { frozen: 1, status: 1 }).lean();
        if (exist?.status === 'paid') return res.status(400).json({ success: false, message: 'บิลจ่ายแล้ว แก้ราคาไม่ได้' });
        if (exist?.frozen)           return res.status(400).json({ success: false, message: 'บิลถูกล็อกเตรียมจ่าย — ปลดล็อกก่อนจึงแก้ราคาได้' });

        const cache = await OutsCache.findOne({ companyID, seasonYear, sName: CACHE_SNAME }).sort({ lastDatetime: -1 }).lean();
        if (!cache) return res.status(404).json({ success: false, message: 'ไม่พบ cache' });
        const bi = billInfoFromCache(cache, billKey);

        // ราคาต่อ stage × size → amount = unitPrice × qty
        const inLines = Array.isArray(req.body.lines) ? req.body.lines : [];
        const lines = inLines.map(l => {
            const q = Number(l.qty) || 0, up = Number(l.unitPrice) || 0;
            return { nodeID: l.nodeID || '', size: l.size || '', qty: q, unitPrice: up, amount: up * q };
        });
        const totalAmount = lines.reduce((s, l) => s + l.amount, 0);

        const doc = await OutsourceBill.findOneAndUpdate(
            { companyID, seasonYear, billKey },
            { $set: {
                factoryID, outsourceFactoryID: bi.outsFacID, outsourceFactoryName: bi.outsourceFactoryName,
                orderID: bi.orderID, targetPlaceID: bi.targetPlaceID, color: bi.colorCode, colorName: bi.colorName,
                sendDate: bi.sendDate, qty: bi.qty, totalBundles: bi.totalBundles,
                lines, totalAmount, status: 'billed', note: note || '',
                by: { userID: req.userData?.tokenSet?.userID || '', userName: '' },
            }, $setOnInsert: { billID: `outs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date() } },
            { upsert: true, new: true }
        ).lean();

        await writeLog({
            module: 'outsource', targetType: 'bill', companyID, factoryID, billNo: bi.orderID, action: 'update',
            summary: `ตั้งราคา outsource ${bi.outsourceFactoryName} · ${bi.orderID}/${bi.targetPlaceID}/${bi.colorName} · ${bi.sendDate} = ${totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} (${lines.length} line)`,
            meta: { billKey, totalAmount, lines },
            userID: req.userData?.tokenSet?.userID || '',
        });
        return res.json({ success: true, token: await tk(req), expiresIn: exp(), bill: doc });
    } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/outsource/bill-cost/delete — ล้างราคาบิล (คืนสถานะ)
// body { companyID, factoryID, seasonYear, billKey }
exports.deleteBillCost = async (req, res, next) => {
    const { companyID, factoryID, seasonYear, billKey } = req.body;
    if (!companyID || !factoryID || !seasonYear || !billKey)
        return res.status(400).json({ success: false, message: 'required fields missing' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const ex = await OutsourceBill.findOne({ companyID, seasonYear, billKey }).lean();
        // ## บิล manual มี endpoint ลบของตัวเอง (manual-bill/delete) — endpoint นี้ไว้ "ล้างราคา" บิลปกติเท่านั้น
        if (ex && ex.manual)
            return res.status(400).json({ success: false, message: 'บิล manual — ลบที่หน้าจัดการต้นทุนเสื้อ' });
        if (ex && ex.status === 'paid')
            return res.status(400).json({ success: false, message: 'บิลนี้จ่ายแล้ว ลบราคาไม่ได้' });
        if (ex && ex.frozen)
            return res.status(400).json({ success: false, message: 'บิลถูกล็อกเตรียมจ่าย — ปลดล็อกก่อนจึงลบได้' });
        await OutsourceBill.deleteOne({ companyID, seasonYear, billKey });
        await writeLog({
            module: 'outsource', targetType: 'bill', companyID, factoryID, billNo: ex?.orderID || '', action: 'delete',
            summary: `ล้างราคา outsource · ${ex?.outsourceFactoryName || ''} ${ex?.orderID || ''}`,
            meta: { billKey }, userID: req.userData?.tokenSet?.userID || '',
        });
        return res.json({ success: true, token: await tk(req), expiresIn: exp() });
    } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/outsource/manual-bill — สร้างบิลต้นทุน manual (งานเพิ่ม/ซ่อม เช่น รีดซ้ำ)
// requirement: ลอย ไม่ผูก bundle/qr — เลือกแค่ order + โรงนอก + stage + จำนวน + ราคา/ตัว → ออกบิลจ่ายได้เหมือนบิลปกติ
// body { companyID, factoryID, seasonYear, orderID, outsourceFactoryID, outsourceFactoryName, dateYmd, note, lines:[{nodeID,size,qty,unitPrice}] }
exports.createManualBill = async (req, res, next) => {
    const { companyID, factoryID, seasonYear, orderID, outsourceFactoryID, outsourceFactoryName, targetPlaceID, dateYmd, note } = req.body;
    if (!companyID || !factoryID || !seasonYear || !orderID || !outsourceFactoryID)
        return res.status(400).json({ success: false, message: 'companyID, factoryID, seasonYear, orderID, outsourceFactoryID required' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const inLines = Array.isArray(req.body.lines) ? req.body.lines : [];
        const lines = inLines.map(l => {
            const q = Number(l.qty) || 0, up = Number(l.unitPrice) || 0;
            return { nodeID: l.nodeID || '', size: l.size || '', qty: q, unitPrice: up, amount: up * q };
        }).filter(l => l.qty > 0);
        if (!lines.length) return res.status(400).json({ success: false, message: 'ต้องมีอย่างน้อย 1 รายการ (จำนวน > 0)' });

        const totalAmount = lines.reduce((s, l) => s + l.amount, 0);
        const qty = lines.reduce((s, l) => s + l.qty, 0);
        const userID = req.userData?.tokenSet?.userID || '';
        const billID = `outsm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const dateStr = toDDMmmYYYY(dateYmd ? ymdToUTC(dateYmd) : new Date());

        const doc = await OutsourceBill.create({
            billID, billKey: `manual|${billID}`, companyID, factoryID, seasonYear,
            outsourceFactoryID, outsourceFactoryName: outsourceFactoryName || outsourceFactoryID,
            orderID, targetPlaceID: targetPlaceID || '-', color: '', colorName: 'งานเพิ่ม (manual)',
            sendDate: dateStr, qty, totalBundles: 0,
            lines, totalAmount, status: 'billed', manual: true, note: note || '',
            by: { userID, userName: '' }, createdAt: new Date(),
        });

        await writeLog({
            module: 'outsource', targetType: 'bill', companyID, factoryID, billNo: orderID, action: 'create',
            summary: `เพิ่มต้นทุน manual ${outsourceFactoryName || outsourceFactoryID} · ${orderID} · ${qty} ตัว = ${totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
            meta: { billID, lines, totalAmount, manual: true }, userID,
        });
        return res.json({ success: true, token: await tk(req), expiresIn: exp(), bill: doc });
    } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/outsource/manual-bill/update — แก้บิล manual (เฉพาะยังไม่จ่าย)
// body { companyID, factoryID, seasonYear, billKey, orderID, outsourceFactoryID, outsourceFactoryName, targetPlaceID, dateYmd, note, lines }
exports.updateManualBill = async (req, res, next) => {
    const { companyID, factoryID, seasonYear, billKey, orderID, outsourceFactoryID, outsourceFactoryName, targetPlaceID, dateYmd, note } = req.body;
    if (!companyID || !factoryID || !seasonYear || !billKey)
        return res.status(400).json({ success: false, message: 'required fields missing' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const ex = await OutsourceBill.findOne({ companyID, seasonYear, billKey }).lean();
        if (!ex || !ex.manual) return res.status(400).json({ success: false, message: 'ไม่พบบิล manual' });
        if (ex.status === 'paid') return res.status(400).json({ success: false, message: 'บิลจ่ายแล้ว แก้ไม่ได้ (ยกเลิกจ่ายก่อน)' });
        if (ex.frozen) return res.status(400).json({ success: false, message: 'บิลถูกล็อกเตรียมจ่าย — ปลดล็อกก่อนจึงแก้ได้' });

        const inLines = Array.isArray(req.body.lines) ? req.body.lines : [];
        const lines = inLines.map(l => {
            const q = Number(l.qty) || 0, up = Number(l.unitPrice) || 0;
            return { nodeID: l.nodeID || '', size: l.size || '', qty: q, unitPrice: up, amount: up * q };
        }).filter(l => l.qty > 0);
        if (!lines.length) return res.status(400).json({ success: false, message: 'ต้องมีอย่างน้อย 1 รายการ (จำนวน > 0)' });

        const totalAmount = lines.reduce((s, l) => s + l.amount, 0);
        const qty = lines.reduce((s, l) => s + l.qty, 0);
        const userID = req.userData?.tokenSet?.userID || '';
        const dateStr = toDDMmmYYYY(dateYmd ? ymdToUTC(dateYmd) : new Date());

        const doc = await OutsourceBill.findOneAndUpdate(
            { companyID, seasonYear, billKey },
            { $set: {
                orderID: orderID || ex.orderID,
                outsourceFactoryID: outsourceFactoryID || ex.outsourceFactoryID,
                outsourceFactoryName: outsourceFactoryName || ex.outsourceFactoryName,
                targetPlaceID: targetPlaceID || '-', colorName: 'งานเพิ่ม (manual)',
                sendDate: dateStr, qty, lines, totalAmount, note: note || '',
            } }, { new: true }
        ).lean();

        await writeLog({
            module: 'outsource', targetType: 'bill', companyID, factoryID, billNo: doc.orderID, action: 'update',
            summary: `แก้ต้นทุน manual ${doc.outsourceFactoryName} · ${doc.orderID} · ${qty} ตัว = ${totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
            meta: { billKey, lines, totalAmount, manual: true }, userID,
        });
        return res.json({ success: true, token: await tk(req), expiresIn: exp(), bill: doc });
    } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/outsource/manual-bill/delete — ลบบิลต้นทุน manual "ทั้งใบ" (เฉพาะยังไม่จ่าย)
// requirement: แยกจาก bill-cost/delete (ที่ใช้ "ล้างราคา" บิลปกติ ซึ่งยัง billable ใน cache) —
//   บิล manual ไม่มีใน cache · ลบแล้วหายจากระบบเลย → ต้องมี endpoint + log ของตัวเองให้ audit ตรงความจริง
// body { companyID, factoryID, seasonYear, billKey }
exports.deleteManualBill = async (req, res, next) => {
    const { companyID, factoryID, seasonYear, billKey } = req.body;
    if (!companyID || !factoryID || !seasonYear || !billKey)
        return res.status(400).json({ success: false, message: 'required fields missing' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const ex = await OutsourceBill.findOne({ companyID, seasonYear, billKey }).lean();
        if (!ex || !ex.manual) return res.status(400).json({ success: false, message: 'ไม่พบบิล manual' });
        if (ex.status === 'paid') return res.status(400).json({ success: false, message: 'บิลจ่ายแล้ว ลบไม่ได้ (ยกเลิกจ่ายก่อน)' });
        if (ex.frozen)            return res.status(400).json({ success: false, message: 'บิลถูกล็อกเตรียมจ่าย — ปลดล็อกก่อนจึงลบได้' });

        await OutsourceBill.deleteOne({ companyID, seasonYear, billKey });
        await writeLog({
            module: 'outsource', targetType: 'bill', companyID, factoryID, billNo: ex.orderID || '', action: 'delete',
            summary: `ลบต้นทุน manual · ${ex.outsourceFactoryName || ''} ${ex.orderID || ''} · ${(ex.qty || 0).toLocaleString('th-TH')} ตัว = ${(ex.totalAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
            meta: { billKey, manual: true }, userID: req.userData?.tokenSet?.userID || '',
        });
        return res.json({ success: true, token: await tk(req), expiresIn: exp() });
    } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/outsource/bill-pay — จ่ายเงินบิล outsource (รวมได้หลายบิล → จ่ายก้อนเดียว)
// requirement: จ่ายจริงหลังเจ้าของเซ็นเท่านั้น (ownerSigned ต้อง true) · บิลต้อง "ตั้งราคาแล้ว" (billed)
//   รวมบิลได้เฉพาะ โรงนอกเดียวกัน + orderID เดียวกัน → Cash Book เงินออก "ก้อนเดียว" (ยอดรวม) + paymentGroupID เดียว
//   รูปหลักฐานอัปทีหลังได้ (evidence optional · ใช้ร่วมทั้งกลุ่ม)
// body { companyID, factoryID, seasonYear, billKeys[], paidYmd:"YYYY-MM-DD", cashManID, cashManName, payMethod, payNote, ownerSigned, evidence[] }
exports.payBill = async (req, res, next) => {
    const { companyID, factoryID, seasonYear, paidYmd, cashManID, cashManName, payMethod, payNote, ownerSigned } = req.body;
    // ## เช็ค: ต้องมีธนาคาร + เลขที่เช็ค (วันที่เช็คไม่บังคับ) — ลงบัญชีรายวันเป็น payMethod='cheque'
    const cheque = (payMethod === 'cheque') ? {
        bankAccountID: (req.body.cheque?.bankAccountID || '').trim(),
        chequeNo:      (req.body.cheque?.chequeNo || '').trim(),
        chequeDate:    req.body.cheque?.chequeDate || '',
    } : null;
    if (payMethod === 'cheque' && (!cheque.bankAccountID || !cheque.chequeNo))
        return res.status(400).json({ success: false, message: 'จ่ายด้วยเช็ค: ต้องเลือกธนาคาร + กรอกเลขที่เช็ค' });
    // รองรับทั้ง billKeys[] (รวมบิล) และ billKey เดี่ยว (backward compat)
    const billKeys = Array.isArray(req.body.billKeys) && req.body.billKeys.length ? req.body.billKeys
                   : (req.body.billKey ? [req.body.billKey] : []);
    if (!companyID || !factoryID || !seasonYear || !billKeys.length)
        return res.status(400).json({ success: false, message: 'companyID, factoryID, seasonYear, billKeys required' });
    // ## cash man = เฉพาะจ่ายเงินสด · เช็คไม่ต้องมี (เงินออกจากธนาคาร ไม่ใช่กระเป๋า cash man)
    if (payMethod !== 'cheque' && !cashManID)
        return res.status(400).json({ success: false, message: 'ต้องเลือก cash man (จ่ายเงินสด)' });
    if (ownerSigned !== true)
        return res.status(400).json({ success: false, message: 'ต้องยืนยันว่าเจ้าของเซ็นอนุมัติแล้วก่อนจ่าย' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const bills = await OutsourceBill.find({ companyID, seasonYear, billKey: { $in: billKeys } }).lean();
        if (bills.length !== billKeys.length)
            return res.status(400).json({ success: false, message: 'บางบิลยังไม่ได้ตั้งราคา' });
        if (bills.some(b => b.status === 'paid'))
            return res.status(400).json({ success: false, message: 'มีบิลที่จ่ายแล้วอยู่ในรายการ' });
        if (bills.some(b => !(b.totalAmount > 0)))
            return res.status(400).json({ success: false, message: 'มีบิลยอดเงินเป็น 0 — ตั้งราคาก่อน' });
        // รวมบิลได้เฉพาะ โรงนอกเดียวกัน + orderID เดียวกัน
        const facSet = new Set(bills.map(b => b.outsourceFactoryID));
        const ordSet = new Set(bills.map(b => b.orderID));
        if (facSet.size !== 1 || ordSet.size !== 1)
            return res.status(400).json({ success: false, message: 'รวมบิลได้เฉพาะโรงงานนอกเดียวกันและ orderID เดียวกัน' });

        const userID     = req.userData?.tokenSet?.userID || '';
        const payUTC     = ymdToUTC(paidYmd);
        const payDateStr = toDDMmmYYYY(payUTC);
        const cmDoc      = await AccCashMan.findOne({ cashManID }).lean();
        const cmName     = cashManName || cmDoc?.name || cmDoc?.cashManName || cashManID;
        const facName    = bills[0].outsourceFactoryName;
        const orderID    = bills[0].orderID;
        const combined   = bills.reduce((s, b) => s + (b.totalAmount || 0), 0);
        const groupID    = `outspay_${factoryID}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

        const _amt     = combined.toLocaleString('th-TH', { minimumFractionDigits: 2 });
        const totalQty = bills.reduce((s, b) => s + (b.qty || 0), 0);

        // ── บัญชีที่ผูก (config ได้ · default 5201001 ค่า Outsource) + ชื่อบัญชี ──
        const chCfg     = await Gsconfig.findOne({ companyID, factoryID, key: 'OUTS_PAY_CHART_CODE' }, { value: 1 }).lean();
        const chartCode = (chCfg?.value || '5201001').trim();
        const chDoc     = await AccChart.findOne({ companyID, factoryID, code: chartCode }, { nameI18n: 1, name: 1 }).lean();
        const chartName = chDoc?.nameI18n?.lText || chDoc?.name || 'ค่า Outsource';

        // ── comment auto (โรงนอก/order/จำนวน/ยอด + breakdown ต่อบิล) ──
        const brk = bills.map(b => `${b.sendDate} ${b.targetPlaceID}/${b.colorName} ${(b.qty || 0).toLocaleString('th-TH')}ตัว=${(b.totalAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`).join(' | ');
        const dailyNote = `จ่ายค่า Outsource · ${facName} · order ${orderID} · ${bills.length} บิล · ${totalQty.toLocaleString('th-TH')} ตัว · รวม ${_amt} บาท${payNote ? ' · ' + payNote : ''}  [${brk}]`;

        // ── post "รายวัน" (expense) → สร้าง Cash Book เงินออกให้เอง · locked ลบ/แก้ที่รายวันไม่ได้ ──
        const posted = await dailyAcc.postSystemDailyEntry({
            companyID, factoryID, entryDate: paidYmd, amount: combined,
            chartAccCode: chartCode, chartAccName: chartName,
            cashManID, cashManName: cmName,
            shopID: bills[0].outsourceFactoryID, shopName: facName,
            note: dailyNote, source: 'outsource',
            payMethod: payMethod || 'cash', cheque,   // ลงบัญชีรายวันตามวิธีจ่าย (cash/cheque)
            images: evidenceToImages(Array.isArray(req.body.evidence) ? req.body.evidence : []),
        }, userID);
        if (!posted.ok) return res.status(400).json({ success: false, message: posted.error || 'ลงรายวันไม่สำเร็จ' });
        const cbEntryID    = posted.cashBookEntryID;
        const dailyEntryID = posted.entryID;

        // ── รูปหลักฐาน (ใช้ร่วมทั้งกลุ่ม) ──
        const evidence = Array.isArray(req.body.evidence) ? req.body.evidence.map(e => ({
            url: e.url || '', baseName: e.baseName || '', filename: e.filename || '', originalName: e.originalName || '',
            type: e.type || 'other', note: e.note || '', uploadedAt: new Date(), by: { userID, userName: '' },
        })) : [];

        // ── set ทุกบิลในกลุ่ม = จ่ายแล้ว (paymentGroupID + cashBookEntryID เดียวกัน) ──
        await OutsourceBill.updateMany(
            { companyID, seasonYear, billKey: { $in: billKeys } },
            { $set: {
                status: 'paid', paymentGroupID: groupID, paidDate: payDateStr, paidAt: new Date(),
                payMethod: payMethod || 'cash', cheque: cheque || undefined, cashManID, cashManName: cmName,
                cashBookEntryID: cbEntryID, dailyEntryID, payNote: payNote || '', ownerSigned: true,
                paidBy: { userID, userName: '' }, evidence,
            } }
        );
        const docs = await OutsourceBill.find({ companyID, seasonYear, billKey: { $in: billKeys } }).lean();

        // ── บันทึก ledger กันจ่ายซ้ำ (order+bundle+stage) ต่อบิล ──
        // unique index กันซ้ำระดับ DB: unit ที่จ่ายแล้วจะ insert ซ้ำไม่ได้ (ordered:false → ข้าม dup)
        try {
            const cache2 = await OutsCache.findOne({ companyID, seasonYear, sName: CACHE_SNAME }).sort({ lastDatetime: -1 }).lean();
            const cfg2 = await Gsconfig.find({ companyID, factoryID, key: { $in: ['BARCODE_SIZE_POS', 'BARCODE_SIZE_DIGIT', 'OUTS_STAGE_NODES'] } }, { key: 1, value: 1, _id: 0 }).lean();
            const cm2 = {}; for (const c of cfg2) cm2[c.key] = c.value;
            const sPos2 = +cm2.BARCODE_SIZE_POS, sDig2 = +cm2.BARCODE_SIZE_DIGIT;
            const STAGE2 = (cm2.OUTS_STAGE_NODES || '').split(',').map(s => s.trim()).filter(Boolean);
            if (cache2 && STAGE2.length) {
                const ledger = [];
                for (const bl of docs) {
                    const { bundles: bBundles, outsFacID: bFac } = bundlesOfBill(cache2, bl.billKey);
                    if (!bBundles.length) continue;
                    const units = await computeStageUnits(companyID, bl.orderID, bFac, bBundles, STAGE2, sPos2, sDig2);
                    for (const u of units) ledger.push({
                        companyID, seasonYear, orderID: bl.orderID, outsourceFactoryID: bFac,
                        bundleNo: u.bundleNo, nodeID: u.nodeID, size: u.size, qty: u.qty,
                        billID: bl.billID, paymentGroupID: groupID, paidAt: new Date(),
                    });
                }
                if (ledger.length) await OutsourcePaidUnit.insertMany(ledger, { ordered: false }).catch(() => {});
            }
        } catch (e) { console.error('[payBill ledger]', e.message); }

        // log ฝั่ง Cash Book มาจาก createCashBookEntry (ใน postSystemDailyEntry) แล้ว — ไม่ต้อง log ซ้ำ
        // log ฝั่ง outsource
        await writeLog({
            module: 'outsource', targetType: 'bill', companyID, factoryID, billNo: orderID, action: 'pay',
            summary: `จ่าย outsource ${facName} · ${orderID} · ${bills.length} บิล รวม ${_amt} (${payMethodLabel(payMethod || 'cash')}${cheque ? ' เลขที่ ' + cheque.chequeNo : ''} · ${cmName}) เจ้าของเซ็นแล้ว · วันจ่าย ${payDateStr} · ลงรายวัน ${chartCode}`,
            meta: { paymentGroupID: groupID, billKeys, totalAmount: combined, cashManID, cashManName: cmName, payMethod: payMethod || 'cash', cheque: cheque || null, cashBookEntryID: cbEntryID, dailyEntryID, chartCode, paidDate: payDateStr, ownerSigned: true },
            userID,
        });
        return res.json({ success: true, token: await tk(req), expiresIn: exp(), bills: docs, paymentGroupID: groupID, cashBookEntryID: cbEntryID, dailyEntryID });
    } catch (err) { return next(err); }
};

// ## GET /api/a/admacc/outsource/paid/:companyID/:factoryID/:seasonYear
// ## รายการจ่ายที่สำเร็จแล้ว (บิล status='paid' ของโรงเรา) จัดกลุ่มตาม paymentGroupID
exports.getPaidPayments = async (req, res, next) => {
    const { companyID, factoryID, seasonYear } = req.params;
    try {
        const bills = await OutsourceBill.find(
            { companyID, seasonYear, factoryID, status: 'paid' },
            { billKey:1, orderID:1, outsourceFactoryID:1, outsourceFactoryName:1, sendDate:1, targetPlaceID:1, colorName:1,
              qty:1, totalAmount:1, paidDate:1, paidAt:1, paymentGroupID:1, payMethod:1, cheque:1, cashManID:1, cashManName:1,
              cashBookEntryID:1, dailyEntryID:1, payNote:1, locked:1, evidence:1 }
        ).lean();
        const groups = {};
        for (const b of bills) {
            const gid = b.paymentGroupID || b.billKey;
            if (!groups[gid]) groups[gid] = {
                paymentGroupID: gid, paidDate: b.paidDate || '', paidAt: b.paidAt || null,
                outsourceFactoryID: b.outsourceFactoryID, outsourceFactoryName: b.outsourceFactoryName, orderID: b.orderID,
                payMethod: b.payMethod || 'cash', cheque: b.cheque || null, cashManID: b.cashManID || '', cashManName: b.cashManName || '',
                cashBookEntryID: b.cashBookEntryID || '', dailyEntryID: b.dailyEntryID || '', payNote: b.payNote || '',
                locked: !!b.locked, evidenceCount: (b.evidence || []).length, evidence: b.evidence || [],
                total: 0, qty: 0, billCount: 0, bills: [],
            };
            const g = groups[gid];
            g.total += b.totalAmount || 0; g.qty += b.qty || 0; g.billCount++;
            g.bills.push({ billKey: b.billKey, sendDate: b.sendDate, targetPlaceID: b.targetPlaceID, colorName: b.colorName, qty: b.qty || 0, totalAmount: b.totalAmount || 0 });
        }
        const payments = Object.values(groups).sort((a, b) =>
            (b.paidAt ? new Date(b.paidAt).getTime() : 0) - (a.paidAt ? new Date(a.paidAt).getTime() : 0));
        res.json({ success: true, token: await tk(req), expiresIn: exp(), payments });
    } catch (err) { next(err); }
};

// ## POST /api/a/admacc/outsource/bill-pay/void — ยกเลิกการจ่าย (ทั้งกลุ่ม · soft-delete Cash Book + คืน billed)
// body { companyID, factoryID, seasonYear, billKey | paymentGroupID, reason }
exports.voidPayBill = async (req, res, next) => {
    const { companyID, factoryID, seasonYear, billKey, reason } = req.body;
    let { paymentGroupID } = req.body;
    if (!companyID || !factoryID || !seasonYear || (!billKey && !paymentGroupID))
        return res.status(400).json({ success: false, message: 'required fields missing' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        // หา group จาก billKey ถ้าไม่ได้ส่ง paymentGroupID มา
        if (!paymentGroupID) {
            const one = await OutsourceBill.findOne({ companyID, seasonYear, billKey }).lean();
            if (!one || one.status !== 'paid')
                return res.status(400).json({ success: false, message: 'บิลนี้ยังไม่ได้จ่าย' });
            paymentGroupID = one.paymentGroupID || '';
        }
        // กลุ่มของบิล (ถ้าไม่มี groupID ให้ตกไปที่บิลเดียว)
        const filter = paymentGroupID
            ? { companyID, seasonYear, paymentGroupID }
            : { companyID, seasonYear, billKey };
        const bills = await OutsourceBill.find(filter).lean();
        if (!bills.length || bills.every(b => b.status !== 'paid'))
            return res.status(400).json({ success: false, message: 'ไม่พบกลุ่มที่จ่ายแล้ว' });
        if (bills.some(b => b.locked))
            return res.status(400).json({ success: false, message: 'ใบจ่ายถูกปิดจ๊อบแล้ว — ปลดล็อกก่อนจึงยกเลิกได้' });

        const userID = req.userData?.tokenSet?.userID || '';
        const cbID   = bills[0].cashBookEntryID;
        const dEntryID = bills[0].dailyEntryID;
        const facName = bills[0].outsourceFactoryName, orderID = bills[0].orderID;

        // ยกเลิกรายวัน (soft-delete รายวัน + Cash Book + log) ผ่าน helper
        if (dEntryID) {
            await dailyAcc.voidSystemDailyEntry(dEntryID, 'ยกเลิกจ่าย outsource', req);
        } else if (cbID) {
            // fallback บิลเก่าที่จ่ายก่อนต่อรายวัน (มีแต่ cashbook)
            const cb = await AccCashBook.findOne({ entryID: cbID }).lean();
            await AccCashBook.findOneAndUpdate({ entryID: cbID }, { $set: { status: 'i' } });
            if (cb && cb.status !== 'i') {
                const _amt = Number(cb.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 });
                await writeLog({
                    module: 'cashbook', targetType: 'entry', companyID, factoryID, billNo: orderID, action: 'delete',
                    summary: `ยกเลิก(ยกเลิกจ่าย outsource) รายจ่าย ${_amt} · ${bills[0].cashManName || bills[0].cashManID}`,
                    meta: { entryID: cb.entryID, type: 'expense', amount: cb.amount, cashManID: cb.cashManID, cashManName: bills[0].cashManName, source: 'outsource', reason: reason || 'ยกเลิกจ่าย', paymentGroupID },
                    userID,
                });
            }
        }

        // คืนทุกบิลในกลุ่มเป็น billed (เก็บราคาไว้) · เคลียร์ข้อมูลจ่าย (คงรูปหลักฐานไว้อ้างอิง)
        await OutsourceBill.updateMany(filter,
            { $set: { status: 'billed', paymentGroupID: '', paidDate: '', paidAt: null, payMethod: 'cash',
                      cashManID: '', cashManName: '', cashBookEntryID: '', dailyEntryID: '', payNote: '', ownerSigned: false,
                      paidBy: { userID: '', userName: '' } } });

        // ── คืน ledger กันซ้ำ: ลบ units ของบิลในกลุ่ม → กลับมาคิดเงินได้ใหม่ ──
        await OutsourcePaidUnit.deleteMany({ companyID, billID: { $in: bills.map(b => b.billID) } });

        const docs = await OutsourceBill.find(filter).lean();

        await writeLog({
            module: 'outsource', targetType: 'bill', companyID, factoryID, billNo: orderID, action: 'void',
            summary: `ยกเลิกจ่าย outsource ${facName} · ${orderID} · ${bills.length} บิล${reason ? ' — ' + reason : ''}`,
            meta: { paymentGroupID, billKeys: bills.map(b => b.billKey), reason: reason || '', cashBookEntryID: cbID }, userID,
        });
        return res.json({ success: true, token: await tk(req), expiresIn: exp(), bills: docs });
    } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/outsource/bill-pay/edit — แก้ไขวิธีจ่าย/เช็ค/cash man/หมายเหตุ ของใบจ่าย
// requirement: หน้า "รายการจ่ายที่สำเร็จแล้ว" คลิกแก้ได้เฉพาะใบที่ยังไม่ปิดจ๊อบ (locked=false) · ปิดจ๊อบ = view อย่างเดียว
//   แก้ได้: payMethod(cash/cheque) · cash man(เมื่อ cash) · เช็ค bank/no/date(เมื่อ cheque) · payNote
//   ยอด/วันจ่าย/บิลในกลุ่ม ไม่เปลี่ยน → ledger กันจ่ายซ้ำ (OutsourcePaidUnit) ไม่กระทบ
//   วิธี sync บัญชี: post รายวันใหม่ตามวิธีใหม่ก่อน (กันพลาด) แล้วค่อย void รายวันเดิม (คืน cashbook เดิม)
//     → สลับ cash↔cheque จัดการ cashbook ให้เองครบทุกกรณี (reuse helper ที่พิสูจน์แล้ว)
// body { companyID, factoryID, seasonYear, paymentGroupID | billKey, payMethod, cashManID, cashManName, payNote, cheque:{bankAccountID,chequeNo,chequeDate} }
exports.editPayment = async (req, res, next) => {
    const { companyID, factoryID, seasonYear, payMethod, cashManID, cashManName, payNote } = req.body;
    let { paymentGroupID, billKey } = req.body;
    const cheque = (payMethod === 'cheque') ? {
        bankAccountID: (req.body.cheque?.bankAccountID || '').trim(),
        chequeNo:      (req.body.cheque?.chequeNo || '').trim(),
        chequeDate:    req.body.cheque?.chequeDate || '',
    } : null;
    if (!companyID || !factoryID || !seasonYear || (!paymentGroupID && !billKey))
        return res.status(400).json({ success: false, message: 'required fields missing' });
    if (payMethod === 'cheque' && (!cheque.bankAccountID || !cheque.chequeNo))
        return res.status(400).json({ success: false, message: 'จ่ายด้วยเช็ค: ต้องเลือกธนาคาร + กรอกเลขที่เช็ค' });
    if (payMethod !== 'cheque' && !cashManID)
        return res.status(400).json({ success: false, message: 'จ่ายเงินสด: ต้องเลือก cash man' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        if (!paymentGroupID) {
            const one = await OutsourceBill.findOne({ companyID, seasonYear, billKey }).lean();
            if (!one) return res.status(400).json({ success: false, message: 'ไม่พบบิล' });
            paymentGroupID = one.paymentGroupID || '';
        }
        const filter = paymentGroupID
            ? { companyID, seasonYear, paymentGroupID }
            : { companyID, seasonYear, billKey };
        const bills = await OutsourceBill.find(filter).lean();
        if (!bills.length || bills.every(b => b.status !== 'paid'))
            return res.status(400).json({ success: false, message: 'ไม่พบกลุ่มที่จ่ายแล้ว' });
        if (bills.some(b => b.locked))
            return res.status(400).json({ success: false, message: 'ใบจ่ายถูกปิดจ๊อบแล้ว — ปลดล็อกก่อนจึงแก้ได้' });

        const userID   = req.userData?.tokenSet?.userID || '';
        const oldDaily = bills[0].dailyEntryID;
        const facName  = bills[0].outsourceFactoryName, orderID = bills[0].orderID;
        const combined = bills.reduce((s, b) => s + (b.totalAmount || 0), 0);
        const totalQty = bills.reduce((s, b) => s + (b.qty || 0), 0);
        const _amt     = combined.toLocaleString('th-TH', { minimumFractionDigits: 2 });

        // อ่าน entry รายวันเดิม → reuse วันจ่าย/บัญชี/รูป เดิม (บิลเก่าก่อนต่อรายวันจะไม่มี → ให้ใช้ยกเลิกจ่ายแล้วจ่ายใหม่แทน)
        const oldEntry = oldDaily ? await DailyEntry.findOne({ entryID: oldDaily }).lean() : null;
        if (!oldEntry)
            return res.status(400).json({ success: false, message: 'ใบจ่ายนี้ไม่มีรายการรายวัน (บิลเก่า) — โปรดใช้ "ยกเลิกจ่าย" แล้วจ่ายใหม่' });

        // วันจ่ายเดิม (คงเดิม) — entryDate เป็น Date (UTC-midnight) ต้องแปลงด้วย UTC parts ห้าม String().slice
        const _ed    = new Date(oldEntry.entryDate);
        const payYmd = `${_ed.getUTCFullYear()}-${String(_ed.getUTCMonth() + 1).padStart(2, '0')}-${String(_ed.getUTCDate()).padStart(2, '0')}`;
        const cmDoc  = (payMethod !== 'cheque' && cashManID) ? await AccCashMan.findOne({ cashManID }).lean() : null;
        const cmName = cashManName || cmDoc?.name || cmDoc?.cashManName || cashManID || '';

        // note ใหม่ (คง breakdown เดิม เปลี่ยนเฉพาะ payNote ต่อท้าย)
        const brk = bills.map(b => `${b.sendDate} ${b.targetPlaceID}/${b.colorName} ${(b.qty||0).toLocaleString('th-TH')}ตัว=${(b.totalAmount||0).toLocaleString('th-TH',{minimumFractionDigits:2})}`).join(' | ');
        const dailyNote = `จ่ายค่า Outsource · ${facName} · order ${orderID} · ${bills.length} บิล · ${totalQty.toLocaleString('th-TH')} ตัว · รวม ${_amt} บาท${payNote ? ' · ' + payNote : ''}  [${brk}]`;

        // 1) post รายวันใหม่ตามวิธีใหม่ก่อน — ถ้าไม่ผ่าน (งวดปิด ฯลฯ) ของเดิมยังอยู่ครบ
        const posted = await dailyAcc.postSystemDailyEntry({
            companyID, factoryID, entryDate: payYmd, amount: combined,
            chartAccCode: oldEntry.chartAccCode, chartAccName: oldEntry.chartAccName,
            cashManID:   payMethod === 'cheque' ? '' : cashManID,
            cashManName: payMethod === 'cheque' ? '' : cmName,
            shopID: bills[0].outsourceFactoryID, shopName: facName,
            note: dailyNote, source: 'outsource',
            payMethod: payMethod || 'cash', cheque,
            images: oldEntry.images || [],
        }, userID);
        if (!posted.ok)
            return res.status(400).json({ success: false, message: posted.error || 'อัพเดตรายวันไม่สำเร็จ' });

        // 2) void รายวันเดิม (soft-delete + คืน cashbook เดิม) — ทำหลังของใหม่ผ่านแล้ว
        if (oldDaily) await dailyAcc.voidSystemDailyEntry(oldDaily, 'แก้ไขวิธีจ่าย outsource', req);

        // 3) อัพเดตบิลทั้งกลุ่ม → วิธีจ่ายใหม่ + ชี้ไป entry รายวันใหม่
        await OutsourceBill.updateMany(filter, { $set: {
            payMethod: payMethod || 'cash',
            cheque: cheque || undefined,
            cashManID:   payMethod === 'cheque' ? '' : cashManID,
            cashManName: payMethod === 'cheque' ? '' : cmName,
            payNote: payNote || '',
            dailyEntryID: posted.entryID, cashBookEntryID: posted.cashBookEntryID || '',
        } });
        const docs = await OutsourceBill.find(filter).lean();

        await writeLog({
            module: 'outsource', targetType: 'bill', companyID, factoryID, billNo: orderID, action: 'update',
            summary: `แก้ไขวิธีจ่าย outsource ${facName} · ${orderID} · ${bills.length} บิล → ${payMethodLabel(payMethod || 'cash')}${cheque ? ' เลขที่ ' + cheque.chequeNo : ' · ' + cmName}`,
            meta: { paymentGroupID, billKeys: bills.map(b => b.billKey), payMethod: payMethod || 'cash', cheque: cheque || null, cashManID: cashManID || '', cashManName: cmName, payNote: payNote || '', oldDailyEntryID: oldDaily, dailyEntryID: posted.entryID, cashBookEntryID: posted.cashBookEntryID || '' },
            userID,
        });
        return res.json({ success: true, token: await tk(req), expiresIn: exp(), bills: docs, paymentGroupID, dailyEntryID: posted.entryID, cashBookEntryID: posted.cashBookEntryID || '' });
    } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/outsource/bill-evidence — บันทึกรูปหลักฐาน (ทั้งกลุ่มถ้าจ่ายรวม)
// frontend อัป/ลบไฟล์กับ image server เอง แล้วส่ง array ล่าสุดมา persist (mirror pattern รายวัน)
// body { companyID, factoryID, seasonYear, billKey, evidence[] }
exports.saveEvidence = async (req, res, next) => {
    const { companyID, factoryID, seasonYear, billKey } = req.body;
    if (!companyID || !factoryID || !seasonYear || !billKey)
        return res.status(400).json({ success: false, message: 'required fields missing' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const userID = req.userData?.tokenSet?.userID || '';
        const bill = await OutsourceBill.findOne({ companyID, seasonYear, billKey },
            { evidence: 1, orderID: 1, outsourceFactoryName: 1, paymentGroupID: 1, locked: 1, dailyEntryID: 1 }).lean();
        if (!bill) return res.status(400).json({ success: false, message: 'ไม่พบบิล (ต้องตั้งราคาก่อน)' });
        if (bill.locked) return res.status(400).json({ success: false, message: 'ใบจ่ายถูกปิดจ๊อบแล้ว — ปลดล็อกก่อนจึงแก้รูปได้' });

        const evidence = Array.isArray(req.body.evidence) ? req.body.evidence.map(e => ({
            url: e.url || '', baseName: e.baseName || '', filename: e.filename || '', originalName: e.originalName || '',
            type: e.type || 'other', note: e.note || '',
            uploadedAt: e.uploadedAt ? new Date(e.uploadedAt) : new Date(),
            by: e.by && e.by.userID ? e.by : { userID, userName: '' },
        })) : [];

        // ถ้าจ่ายรวม (มี paymentGroupID) → อัปเดตรูปทั้งกลุ่ม, ไม่งั้นเฉพาะบิลนี้
        const filter = bill.paymentGroupID
            ? { companyID, seasonYear, paymentGroupID: bill.paymentGroupID }
            : { companyID, seasonYear, billKey };
        await OutsourceBill.updateMany(filter, { $set: { evidence } });
        const doc = await OutsourceBill.findOne({ companyID, seasonYear, billKey }).lean();

        // sync รูป (เฉพาะรูป) ไปที่รายการรายวัน → ดูรูปในหน้ารายวันได้
        if (bill.dailyEntryID) await dailyAcc.setSystemDailyEntryImages(bill.dailyEntryID, evidenceToImages(evidence));

        const before = (bill.evidence || []).length, after = evidence.length;
        await writeLog({
            module: 'outsource', targetType: 'bill', companyID, factoryID, billNo: bill.orderID, action: 'update',
            summary: `แก้รูปหลักฐาน outsource ${bill.outsourceFactoryName} · ${bill.orderID} (${before}→${after} รูป)`,
            meta: { billKey, paymentGroupID: bill.paymentGroupID || '', count: after }, userID,
        });
        return res.json({ success: true, token: await tk(req), expiresIn: exp(), bill: doc });
    } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/outsource/bill-lock — ปิดจ๊อบ (ล็อก) / ปลดล็อก ทั้งกลุ่มการจ่าย
// requirement: ล็อก → view อย่างเดียว (ยกเลิกจ่าย/แก้รูป ทำไม่ได้) · ปลดล็อกคุมด้วยสิทธิ์ (ซ่อนปุ่มจากบัญชีทั่วไป)
// body { companyID, factoryID, seasonYear, billKey | paymentGroupID, lock:true/false }
exports.lockPayment = async (req, res, next) => {
    const { companyID, factoryID, seasonYear, billKey, lock } = req.body;
    let { paymentGroupID } = req.body;
    if (!companyID || !factoryID || !seasonYear || (!billKey && !paymentGroupID))
        return res.status(400).json({ success: false, message: 'required fields missing' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const userID = req.userData?.tokenSet?.userID || '';
        const doLock = lock !== false;   // default = ล็อก

        if (!paymentGroupID) {
            const one = await OutsourceBill.findOne({ companyID, seasonYear, billKey }).lean();
            if (!one) return res.status(400).json({ success: false, message: 'ไม่พบบิล' });
            if (one.status !== 'paid') return res.status(400).json({ success: false, message: 'บิลนี้ยังไม่ได้จ่าย' });
            paymentGroupID = one.paymentGroupID || '';
        }
        const filter = paymentGroupID
            ? { companyID, seasonYear, paymentGroupID }
            : { companyID, seasonYear, billKey };
        const bills = await OutsourceBill.find(filter).lean();
        if (!bills.length || bills.every(b => b.status !== 'paid'))
            return res.status(400).json({ success: false, message: 'ไม่พบกลุ่มที่จ่ายแล้ว' });

        await OutsourceBill.updateMany(filter, doLock
            ? { $set: { locked: true, lockedAt: new Date(), lockedBy: { userID, userName: '' } } }
            : { $set: { locked: false, lockedAt: null, lockedBy: { userID: '', userName: '' } } });
        const docs = await OutsourceBill.find(filter).lean();

        await writeLog({
            module: 'outsource', targetType: 'bill', companyID, factoryID, billNo: bills[0].orderID,
            action: doLock ? 'lock' : 'unlock',
            summary: `${doLock ? 'ปิดจ๊อบ(ล็อก)' : 'ปลดล็อก'} outsource ${bills[0].outsourceFactoryName} · ${bills[0].orderID} · ${bills.length} บิล`,
            meta: { paymentGroupID, billKeys: bills.map(b => b.billKey), lock: doLock }, userID,
        });
        return res.json({ success: true, token: await tk(req), expiresIn: exp(), bills: docs });
    } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/outsource/bill-freeze — ล็อกเตรียมจ่าย (freeze) / ปลด — กันแก้ระหว่างรอจ่าย
// requirement: กดก่อนส่งจ่าย/พิมพ์ PDF → แก้ราคา/ลบ/แก้ manual ไม่ได้จนปลดหรือจ่าย · จ่ายได้ปกติ (freeze = พร้อมจ่าย)
// body { companyID, factoryID, seasonYear, billKey, freeze:true/false }
exports.freezeBill = async (req, res, next) => {
    const { companyID, factoryID, seasonYear, billKey, freeze } = req.body;
    if (!companyID || !factoryID || !seasonYear || !billKey)
        return res.status(400).json({ success: false, message: 'required fields missing' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const ex = await OutsourceBill.findOne({ companyID, seasonYear, billKey }).lean();
        if (!ex) return res.status(400).json({ success: false, message: 'ไม่พบบิล (ต้องตั้งราคาก่อน)' });
        if (ex.status === 'paid') return res.status(400).json({ success: false, message: 'บิลจ่ายแล้ว (ล็อกอยู่แล้ว)' });

        const userID = req.userData?.tokenSet?.userID || '';
        const doFreeze = freeze !== false;
        const doc = await OutsourceBill.findOneAndUpdate({ companyID, seasonYear, billKey }, doFreeze
            ? { $set: { frozen: true, frozenAt: new Date(), frozenBy: { userID, userName: '' } } }
            : { $set: { frozen: false, frozenAt: null, frozenBy: { userID: '', userName: '' } } }, { new: true }).lean();

        await writeLog({
            module: 'outsource', targetType: 'bill', companyID, factoryID, billNo: ex.orderID, action: doFreeze ? 'freeze' : 'unfreeze',
            summary: `${doFreeze ? 'ล็อกเตรียมจ่าย' : 'ปลดล็อกเตรียมจ่าย'} outsource ${ex.outsourceFactoryName} · ${ex.orderID}${ex.manual ? ' (manual)' : ''}`,
            meta: { billKey, freeze: doFreeze }, userID,
        });
        return res.json({ success: true, token: await tk(req), expiresIn: exp(), bill: doc });
    } catch (err) { return next(err); }
};

// helper token
async function tk(req) { return ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn); }
function exp() { return Number(process.env.TOKENExpiresIn); }
