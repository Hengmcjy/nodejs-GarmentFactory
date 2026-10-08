// ═══════════════════════════════════════════════════════════════════════════
// c-secure-deletion.js — Admin > System > Secure Deletion (Data Management Lifecycle)
// จุดประสงค์: ลบข้อมูล production ของ season ที่จบแล้ว เพื่อลดขนาด DB (~2M records)
// ★★ ลบถาวร กู้คืนไม่ได้ — ต้อง backup ก่อนใช้เสมอ ★★
//
// เงื่อนไข (scope = ทั้ง company / companyID):
//   1. Order              → set orderStatus: 'close' (ไม่ลบ)                ตาม seasonYear
//   2. OrderProduction    → ลบหมด  (ไม่มี seasonYear → ลบด้วย orderID ที่ดึงจาก Order)
//   3. OrderProductionQueueList → ลบหมด (มี seasonYear → ลบด้วย seasonYear)
//   4. OrderProductionQueue     → ลบหมด (ไม่มี seasonYear → ลบด้วย orderID)
//
// Safety 2 ชั้น: preview (นับ ไม่ลบ) → execute ต้องส่ง confirmSeason ตรงกับ season
// หมายเหตุ: ดึง model ที่ register แล้วด้วย mongoose.model() (เลี่ยง OverwriteModelError)
//   ★ เช็คชื่อ model ให้ตรงของจริง — ถ้าต่างจะขึ้น MissingSchemaError
// ═══════════════════════════════════════════════════════════════════════════
const mongoose = require('mongoose');
const ShareFunc = require("../c-api-app-share-function");

const getOrder        = () => mongoose.model('Order');
const getOrderProd    = () => mongoose.model('OrderProduction');
const getOPQueue      = () => mongoose.model('OrderProductionQueue');
const getOPQueueList  = () => mongoose.model('OrderProductionQueueList');

// helper: ดึง orderID ของ season นั้น (Order เป็นตัวตั้ง — OrderProduction/Queue ไม่มี seasonYear)
async function getOrderIDsBySeason(companyID, season) {
    const orders = await getOrder().find({ companyID, seasonYear: season }, { orderID: 1, _id: 0 }).lean();
    return orders.map(o => o.orderID);
}

// ── GET /api/a/admacc/secure-deletion/preview/:companyID/:season ──────────────
// Requirement: นับจำนวนที่จะกระทบ (ไม่ลบอะไรทั้งสิ้น) → ให้ admin เห็นก่อนตัดสินใจ
exports.previewSeasonDeletion = async (req, res, next) => {
    const { companyID, season } = req.params;
    try {
        const orderIDs = await getOrderIDsBySeason(companyID, season);

        const [ordersToClose, prodToDelete, queueListToDelete, queueToDelete] = await Promise.all([
            getOrder().countDocuments({ companyID, seasonYear: season }),
            orderIDs.length ? getOrderProd().countDocuments({ companyID, orderID: { $in: orderIDs } }) : 0,
            getOPQueueList().countDocuments({ companyID, seasonYear: season }),
            orderIDs.length ? getOPQueue().countDocuments({ companyID, orderID: { $in: orderIDs } }) : 0,
        ]);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({
            success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
            season, orderCount: orderIDs.length,
            preview: { ordersToClose, prodToDelete, queueListToDelete, queueToDelete },
        });
    } catch (err) { return next(err); }
};

// ── POST /api/a/admacc/secure-deletion/execute ────────────────────────────────
// Requirement: ลบจริง — ต้องส่ง confirmSeason ตรงกับ season (กันกดพลาด)
//   ★ 08/10/2026: เดิมลบทีเดียวใน request เดียว (~1 ล้าน records ใช้หลายนาที) → proxy/nginx ตัด timeout
//     browser เห็นเป็น CORS error ทั้งที่ server ยังลบต่อ → เปลี่ยนเป็น "งานเบื้องหลัง"
//     · execute = เริ่มงานแล้วตอบกลับทันที · หน้าเว็บ poll GET status ทุก 2 วิ ดูความคืบหน้า
//     · ลบเป็นชุด (BATCH ต่อรอบ) → ไม่ล็อก DB นาน · กดซ้ำระหว่างทำงาน = คืนงานเดิม (ไม่เริ่มซ้อน)
//     · สถานะเก็บใน memory ของ process (restart server = หาย แต่ข้อมูลที่ลบไปแล้วก็ลบแล้ว · กดใหม่ได้ ลบต่อจากที่เหลือ)
const BATCH = 5000;
const jobs = new Map();   // companyID → job

function jobView(j) {
    if (!j) return null;
    return { season: j.season, status: j.status, step: j.step, startedAt: j.startedAt, finishedAt: j.finishedAt,
             error: j.error, by: j.by, total: j.total, result: j.result };
}

// ลบเป็นชุดตาม _id · อัปเดตตัวนับใน job ทุกรอบ
async function deleteInBatches(Model, filter, onBatch) {
    let n = 0;
    for (;;) {
        const ids = await Model.find(filter, { _id: 1 }).limit(BATCH).lean();
        if (!ids.length) break;
        const r = await Model.deleteMany({ _id: { $in: ids.map(d => d._id) } });
        n += r.deletedCount || 0;
        onBatch(n);
        if (ids.length < BATCH) break;
    }
    return n;
}

async function runDeletionJob(job) {
    const { companyID, season } = job;
    try {
        const orderIDs = await getOrderIDsBySeason(companyID, season);

        // ยอดตั้งต้น (ไว้คำนวณ % บนหน้าเว็บ)
        job.step = 'count';
        const [p, ql, q] = await Promise.all([
            orderIDs.length ? getOrderProd().countDocuments({ companyID, orderID: { $in: orderIDs } }) : 0,
            getOPQueueList().countDocuments({ companyID, seasonYear: season }),
            orderIDs.length ? getOPQueue().countDocuments({ companyID, orderID: { $in: orderIDs } }) : 0,
        ]);
        job.total = { prod: p, queueList: ql, queue: q };

        // 1) Order → close (ไม่ลบ)
        job.step = 'order';
        const closed = await getOrder().updateMany({ companyID, seasonYear: season }, { $set: { orderStatus: 'close' } });
        job.result.ordersClosed = closed.modifiedCount ?? 0;

        // 2) OrderProduction
        job.step = 'prod';
        if (orderIDs.length) await deleteInBatches(getOrderProd(), { companyID, orderID: { $in: orderIDs } }, n => { job.result.prodDeleted = n; });

        // 3) OrderProductionQueueList
        job.step = 'queueList';
        await deleteInBatches(getOPQueueList(), { companyID, seasonYear: season }, n => { job.result.queueListDeleted = n; });

        // 4) OrderProductionQueue
        job.step = 'queue';
        if (orderIDs.length) await deleteInBatches(getOPQueue(), { companyID, orderID: { $in: orderIDs } }, n => { job.result.queueDeleted = n; });

        job.step = 'done';
        job.status = 'done';
    } catch (err) {
        job.status = 'error';
        job.error = String(err && err.message || err);
        console.error('[SECURE-DELETION] error', companyID, season, job.error);
    } finally {
        job.finishedAt = new Date();
        const r = job.result;
        console.log(`[SECURE-DELETION] company=${companyID} season=${season} by=${job.by} status=${job.status} `
            + `| ordersClosed=${r.ordersClosed} prodDel=${r.prodDeleted} queueListDel=${r.queueListDeleted} queueDel=${r.queueDeleted}`);
    }
}

exports.executeSeasonDeletion = async (req, res, next) => {
    const { companyID, season, confirmSeason } = req.body;
    if (!companyID || !season) {
        return res.status(400).json({ success: false, message: 'companyID, season required' });
    }
    // guard: ต้องพิมพ์ชื่อ season ยืนยันให้ตรง
    if (confirmSeason !== season) {
        return res.status(400).json({ success: false, message: 'ยืนยัน season ไม่ตรง — ยกเลิกการลบ' });
    }
    try {
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        const cur = jobs.get(companyID);
        if (cur && cur.status === 'running') {
            // มีงานลบค้างอยู่ (season เดิมหรือ season อื่น) → ไม่เริ่มซ้อน
            return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), started: false, job: jobView(cur) });
        }
        const job = {
            companyID, season, status: 'running', step: 'start', by: req.userData?.userID || '',
            startedAt: new Date(), finishedAt: null, error: '',
            total: { prod: 0, queueList: 0, queue: 0 },
            result: { ordersClosed: 0, prodDeleted: 0, queueListDeleted: 0, queueDeleted: 0 },
        };
        jobs.set(companyID, job);
        runDeletionJob(job);   // ★ ไม่ await — ทำงานเบื้องหลัง
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), started: true, job: jobView(job) });
    } catch (err) { return next(err); }
};

// ── GET /api/a/admacc/secure-deletion/status/:companyID ───────────────────────
// Requirement: ความคืบหน้างานลบ (หน้าเว็บ poll) · ไม่มีงาน = job null
exports.statusSeasonDeletion = async (req, res, next) => {
    try {
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), job: jobView(jobs.get(req.params.companyID)) });
    } catch (err) { return next(err); }
};
