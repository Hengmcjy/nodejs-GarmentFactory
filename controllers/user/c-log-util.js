// ═══════════════════════════════════════════════════════════════════════════
// Util กลาง: writeLog — เขียน audit log 1 action (ทุก module เรียกใช้ร่วมกัน)
// ใช้: const { writeLog } = require('./c-log-util');
//   await writeLog({ module:'cashbook', companyID, factoryID, action:'update',
//                    billID, billNo, summary, changes:[{field,from,to}], meta:{...}, userID, userName });
// swallow error เสมอ — audit ห้ามทำให้ธุรกรรมหลักล้ม
// ═══════════════════════════════════════════════════════════════════════════
const AccLog  = require("../../models/m-acc-log");
const Useracc = require("../../models/m-acc-user");   // resolve ชื่อคนทำ (actor) จาก userID → uInfo.userName

// ## อายุ log ต่อ module (วัน) — per-type retention · ปรับได้อิสระ (some 1y, some 6mo ...)
const RETENTION_DAYS = {
    daily:    730,   // บัญชีรายวัน — 2 ปี
    cashbook: 730,   // Cash Book — 2 ปี
    payable:  730,   // เจ้าหนี้ — 2 ปี
    worker:   365,   // ค่าแรง — 1 ปี
    report:   7,     // log เปิด/export รายงาน (Monitor) — เก็บ 7 วันแล้วลบเอง
    _default: 365,   // module ที่ยังไม่กำหนด — 1 ปี
};
function retentionDays(module) {
    return RETENTION_DAYS[module] != null ? RETENTION_DAYS[module] : RETENTION_DAYS._default;
}

async function writeLog(data) {
    try {
        const module  = data.module || 'daily';
        const expireAt = new Date(Date.now() + retentionDays(module) * 86400000);   // วันที่จะถูกลบ

        // ## ชื่อคนทำ (actor): ถ้า caller ไม่ส่ง userName มา → lookup จาก userID (login = Useracc)
        let userName = data.userName || '';
        if (!userName && data.userID) {
            const u = await Useracc.findOne({ userID: data.userID }, { 'uInfo.userName': 1, _id: 0 }).lean();
            userName = u?.uInfo?.userName || '';
        }

        await AccLog.create({
            logID:      `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            companyID:  data.companyID,
            factoryID:  data.factoryID,
            module,
            targetType: data.targetType || 'bill',
            billID:  data.billID  || '',
            billNo:  data.billNo  || '',
            entryID: data.entryID || '',
            action:  data.action,
            changes: data.changes || [],
            summary: data.summary || '',
            meta:    data.meta    || {},
            by: { userID: data.userID || '', userName },
            at: new Date(),
        });
    } catch (e) { console.error('[writeLog]', e.message); }
}

module.exports = { writeLog };
