// ═══════════════════════════════════════════════════════════════════════════
// Controller: Clear Data (ล้างข้อมูลทดสอบ ระดับโรงงาน)
// จุดประสงค์: ตอนทดสอบระบบเสร็จ อยากเริ่มใช้จริง/เริ่มใหม่ → ลบข้อมูลของ "โรงงานที่เลือก" ทีละกลุ่ม
// requirement:
//   - ลบเฉพาะ { companyID, factoryID } เท่านั้น (ไม่แตะโรงงานอื่น)
//   - preview นับจำนวนก่อนลบ · execute ลบทีละกลุ่ม + คืนจำนวนที่ลบ
//   - ไม่ลบข้อมูลตั้งค่า (ร้าน/cashman/ธนาคาร/โปรเจค/gsconfig) — เฉพาะกลุ่มที่กำหนด
//   - action อันตราย: ฝั่ง Angular บังคับพิมพ์ยืนยันก่อน + ฝั่งนี้เช็คสิทธิ์โรงงาน (factoryAuth.verify)
// ═══════════════════════════════════════════════════════════════════════════
const ShareFunc   = require("../c-api-app-share-function");
const factoryAuth = require("../../middleware/check-authFactory");

const DailyEntry          = require("../../models/m-daily-entry");
const DailyPeriod         = require("../../models/m-daily-period");
const AccCashBook         = require("../../models/m-acc-cashbook");
const AccCashBookMonth    = require("../../models/m-acc-cashbook-month");
const AccCashBookPeriod   = require("../../models/m-acc-cashbook-period");
const AccPayable          = require("../../models/m-acc-payable");
const WorkerPayItem       = require("../../models/m-worker-pay-item");
const WorkerPayPeriod     = require("../../models/m-worker-pay-period");
const WorkerPayProduction = require("../../models/m-worker-pay-production");
const WpManualPiece       = require("../../models/m-wp-manual-piece");
const PayrollItem         = require("../../models/m-payroll-item");
const PayrollPeriod       = require("../../models/m-payroll-period");
const AccChart            = require("../../models/m-acc-chart");
const AccLog              = require("../../models/m-acc-log");   // audit log (System Log)
const OutsourceBill       = require("../../models/m-outsource-bill");       // ต้นทุน outsource + บิล manual (จัดการต้นทุนเสื้อ)
const OutsourcePaidUnit   = require("../../models/m-outsource-paid-unit");  // ledger กันจ่ายซ้ำ (ไม่มี factoryID — ลบผ่าน billID)
const FingerScanSummary   = require("../../models/m-fingerscan-summary");   // สรุปสแกนนิ้วรายงวด

// ## นิยามกลุ่ม → รายชื่อ collection + model (ลบด้วย filter { companyID, factoryID })
// ## model แต่ละตัวมี filter เริ่มต้น = { companyID, factoryID }
// ##   ถ้าใส่ `filter: async (companyID, factoryID) => ({...})` จะใช้ filter นั้นแทน (สำหรับ collection ที่ไม่มี factoryID)
// ## หมายเหตุ: AccChart เก็บเฉพาะ level 2/3 อยู่แล้ว (level 1 hardcoded ไม่เก็บใน DB)
function groupDefs() {
    return {
        daily:    { label: 'บัญชีรายวัน',      models: [ { n: 'dailyentries', m: DailyEntry }, { n: 'dailyperiods', m: DailyPeriod } ] },
        cashbook: { label: 'Cash Book',         models: [ { n: 'acccashbooks', m: AccCashBook }, { n: 'acccashbookmonths', m: AccCashBookMonth }, { n: 'acccashbookperiods', m: AccCashBookPeriod } ] },
        payable:  { label: 'เจ้าหนี้ (ซื้อเชื่อ)', models: [ { n: 'accpayables', m: AccPayable } ] },
        // ## ต้นทุน Outsource + จัดการต้นทุนเสื้อ = collection เดียวกัน (บิล manual แยกด้วย flag manual)
        // ## outsourcepaidunits ไม่มี factoryID → ลบผ่าน billID ของบิลโรงนี้ (resolve filter ก่อนลบ bill)
        outsource: { label: 'ต้นทุน Outsource + จัดการต้นทุนเสื้อ', models: [
            { n: 'outsourcepaidunits', m: OutsourcePaidUnit, filter: async (companyID, factoryID) => {
                const bills = await OutsourceBill.find({ companyID, factoryID }, { billID: 1 }).lean();
                const ids = bills.map(b => b.billID).filter(Boolean);
                return { companyID, billID: { $in: ids } };
            } },
            { n: 'outsourcebills', m: OutsourceBill },
        ] },
        worker:   { label: 'ค่าแรง / ค่าแรงเหมา worker', models: [ { n: 'workerpayitems', m: WorkerPayItem }, { n: 'workerpayperiods', m: WorkerPayPeriod }, { n: 'workerpayproductions', m: WorkerPayProduction }, { n: 'wpmanualpieces', m: WpManualPiece } ] },
        payroll:  { label: 'เงินเดือนพนักงาน',  models: [ { n: 'payrollitems', m: PayrollItem }, { n: 'payrollperiods', m: PayrollPeriod } ] },
        // ## Worker Finger Scan — เฉพาะสรุปสแกน (เครื่องที่ลงทะเบียน = ข้อมูลตั้งค่า ไม่ลบที่นี่)
        fingerscan: { label: 'Worker Finger Scan (สรุปสแกน)', models: [ { n: 'fingerscansummaries', m: FingerScanSummary } ] },
        chart:    { label: 'ผังบัญชี (level 2 / level 3)', models: [ { n: 'acccharts', m: AccChart } ] },
        logging:  { label: 'System Log (ประวัติ)', models: [ { n: 'acclogs', m: AccLog } ] },
    };
}

// ## แปลง model → filter (default { companyID, factoryID } · ถ้ามี mm.filter ใช้ตัวนั้น)
async function resolveFilter(mm, companyID, factoryID) {
    return mm.filter ? await mm.filter(companyID, factoryID) : { companyID, factoryID };
}

// ## POST /api/a/admacc/admin/clear-data/preview  body { companyID, factoryID }
// requirement: นับจำนวนเอกสารแต่ละกลุ่ม/แต่ละ collection (ของโรงงานนี้) ให้ user เห็นก่อนลบ
exports.previewClearData = async (req, res, next) => {
    const { companyID, factoryID } = req.body;
    if (!companyID || !factoryID)
        return res.status(400).json({ success: false, message: 'ต้องระบุ companyID และ factoryID' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const defs = groupDefs();
        const groups = [];
        for (const key of Object.keys(defs)) {
            const g = defs[key];
            const collections = [];
            let total = 0;
            for (const mm of g.models) {
                const q = await resolveFilter(mm, companyID, factoryID);
                const n = await mm.m.countDocuments(q);
                collections.push({ collection: mm.n, count: n });
                total += n;
            }
            groups.push({ key, label: g.label, total, collections });
        }
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), groups });
    } catch (err) { next(err); }
};

// ## POST /api/a/admacc/admin/clear-data/execute  body { companyID, factoryID, group }
// requirement: ลบข้อมูลกลุ่มที่ระบุ (เฉพาะโรงงานนี้) → คืนจำนวนที่ลบต่อ collection
exports.executeClearData = async (req, res, next) => {
    const { companyID, factoryID, group } = req.body;
    if (!companyID || !factoryID || !group)
        return res.status(400).json({ success: false, message: 'ต้องระบุ companyID, factoryID และ group' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    const defs = groupDefs();
    const g = defs[group];
    if (!g) return res.status(400).json({ success: false, message: 'กลุ่มข้อมูลไม่ถูกต้อง' });
    try {
        // resolve filter ทุก model ก่อน (สำคัญ: paidunit ต้อง lookup billID จาก bill ก่อนที่ bill จะถูกลบ)
        const plans = [];
        for (const mm of g.models) {
            plans.push({ n: mm.n, m: mm.m, q: await resolveFilter(mm, companyID, factoryID) });
        }
        const deleted = [];
        let totalDeleted = 0;
        for (const p of plans) {
            const r = await p.m.deleteMany(p.q);   // ลบเฉพาะโรงงานนี้
            deleted.push({ collection: p.n, deleted: r.deletedCount || 0 });
            totalDeleted += (r.deletedCount || 0);
        }
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), group, deleted, totalDeleted });
    } catch (err) { next(err); }
};
