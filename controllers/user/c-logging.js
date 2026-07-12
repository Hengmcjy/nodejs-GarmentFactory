// ═══════════════════════════════════════════════════════════════════════════
// Controller: Logging Station — ดู audit log ทุก module (ระดับโรงงานที่เลือก)
// GET /api/a/admacc/log/station/:companyID/:factoryID
//   ?module=&action=&dateStart=&dateEnd=&userID=&q=&page=&limit=
// server-side pagination + filter · summary ใช้โชว์ลิสต์ได้ทุก module · meta = รายละเอียดเฉพาะ module
// ═══════════════════════════════════════════════════════════════════════════
const AccLog    = require("../../models/m-acc-log");
const ShareFunc = require("../c-api-app-share-function");

exports.getStationLogs = async (req, res, next) => {
    const { companyID, factoryID } = req.params;
    const { module, action, dateStart, dateEnd, userID, q } = req.query;
    const page  = Math.max(Number(req.query.page)  || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 200);
    const skip  = (page - 1) * limit;

    try {
        const filter = { companyID, factoryID };
        if (module) filter.module = module;
        if (action) filter.action = action;
        if (userID) filter['by.userID'] = userID;
        if (q && q.trim()) filter.summary = { $regex: q.trim(), $options: 'i' };
        // ช่วงวัน — อิงเวลาไทย (+07:00)
        if (dateStart || dateEnd) {
            filter.at = {};
            if (dateStart) filter.at.$gte = new Date(`${dateStart}T00:00:00+07:00`);
            if (dateEnd)   filter.at.$lte = new Date(`${dateEnd}T23:59:59.999+07:00`);
        }

        const [logs, total, modules] = await Promise.all([
            AccLog.find(filter).sort({ at: -1 }).skip(skip).limit(limit).lean(),
            AccLog.countDocuments(filter),
            AccLog.distinct('module', { companyID, factoryID }),   // สำหรับ dropdown filter
        ]);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({
            success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
            logs, total, page, limit, totalPages: Math.ceil(total / limit), modules,
        });
    } catch (err) { console.error('[getStationLogs]', err.message); return next(err); }
};
