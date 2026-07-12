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
//   Order → close, ลบอีก 3 collection ตามเงื่อนไข · คืนจำนวนที่ทำจริง
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
        const orderIDs = await getOrderIDsBySeason(companyID, season);
        const userID = req.userData?.userID || '';

        // 1) Order → orderStatus: 'close' (ไม่ลบ)
        const closed = await getOrder().updateMany(
            { companyID, seasonYear: season },
            { $set: { orderStatus: 'close' } }
        );

        // 2) OrderProduction → ลบด้วย orderID (กัน orderIDs ว่าง = ไม่ลบอะไร)
        const prodDel = orderIDs.length
            ? await getOrderProd().deleteMany({ companyID, orderID: { $in: orderIDs } })
            : { deletedCount: 0 };

        // 3) OrderProductionQueueList → ลบด้วย seasonYear
        const queueListDel = await getOPQueueList().deleteMany({ companyID, seasonYear: season });

        // 4) OrderProductionQueue → ลบด้วย orderID
        const queueDel = orderIDs.length
            ? await getOPQueue().deleteMany({ companyID, orderID: { $in: orderIDs } })
            : { deletedCount: 0 };

        console.log(`[SECURE-DELETION] company=${companyID} season=${season} by=${userID} `
            + `| ordersClosed=${closed.modifiedCount} prodDel=${prodDel.deletedCount} `
            + `queueListDel=${queueListDel.deletedCount} queueDel=${queueDel.deletedCount}`);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({
            success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
            season,
            result: {
                ordersClosed:    closed.modifiedCount ?? 0,
                prodDeleted:     prodDel.deletedCount ?? 0,
                queueListDeleted: queueListDel.deletedCount ?? 0,
                queueDeleted:    queueDel.deletedCount ?? 0,
            },
        });
    } catch (err) { return next(err); }
};
