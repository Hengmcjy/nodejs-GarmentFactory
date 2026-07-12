// c-fingerscan.js — HR > Worker Finger Scan
// วางที่: controllers/user/c-fingerscan.js
// เฟส 1: get/save สรุปต่อ worker ต่องวด (import + วิเคราะห์ = เฟส 2)

const FingerScanSummary = require('../../models/m-fingerscan-summary');
const FingerScanMachine = require('../../models/m-fingerscan-machine');
const ShareFunc = require('../c-api-app-share-function');

// ## GET /api/a/admacc/fs-summary/:companyID/:factoryID/:periodID
// ## ดึงสรุป finger scan ทุก worker ในงวดนี้ (ที่บันทึกไว้แล้ว)
exports.getFsSummaryByPeriod = async (req, res, next) => {
    const { companyID, factoryID, periodID } = req.params;
    try {
        const summaries = await FingerScanSummary.find({ companyID, factoryID, periodID }).lean();
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), summaries });
    } catch (err) { next(err); }
};

// ## POST /api/a/admacc/fs-summary/save
// ## upsert สรุป 1 worker ต่องวด (HR กรอก/แก้: daysWorked / otHours / deductAmount / comment)
// ## body: { companyID, factoryID, periodID, workerID, scanID, daysWorked, otHours, deductAmount, comment, days?, status?, updatedBy }
exports.saveFsSummary = async (req, res, next) => {
    const b = req.body;
    try {
        if (!b.factoryID || !b.periodID || !b.workerID)
            return res.status(400).json({ success: false, message: 'factoryID/periodID/workerID required' });

        const fsSummaryID = `${b.factoryID}-${b.periodID}-${b.workerID}`;
        const set = {
            companyID:    b.companyID,
            factoryID:    b.factoryID,
            periodID:     b.periodID,
            workerID:     b.workerID,
            scanID:       b.scanID ?? '',
            workerName:   b.workerName ?? '',
            daysWorked:   Number(b.daysWorked)   || 0,
            otHours:      Number(b.otHours)      || 0,
            deductAmount: Number(b.deductAmount) || 0,
            comment:      b.comment ?? '',
            status:       b.status  ?? 'draft',
            updatedAt:    new Date(),
            updatedBy:    b.updatedBy ?? (req.userData?.tokenSet?.userID || ''),
        };
        if (Array.isArray(b.days)) set.days = b.days;

        const updated = await FingerScanSummary.findOneAndUpdate(
            { fsSummaryID },
            { $set: set, $setOnInsert: { fsSummaryID, createdAt: new Date() } },
            { new: true, upsert: true }
        );

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), summary: updated });
    } catch (err) { next(err); }
};

// ## POST /api/a/admacc/fs-summary/save-bulk
// ## บันทึกทั้งหมดทีเดียว (upsert หลาย worker ต่องวด) — ใช้ปุ่ม "บันทึกทั้งหมด"
// ## body: { companyID, factoryID, periodID, updatedBy, summaries: [{ workerID, scanID, workerName, daysWorked, otHours, deductAmount, comment, days, status }] }
exports.saveFsSummaryBulk = async (req, res, next) => {
    const b = req.body;
    try {
        if (!b.factoryID || !b.periodID || !Array.isArray(b.summaries))
            return res.status(400).json({ success: false, message: 'factoryID/periodID/summaries required' });

        const updatedBy = b.updatedBy ?? (req.userData?.tokenSet?.userID || '');
        const ops = b.summaries.filter(s => s && s.workerID).map(s => {
            const fsSummaryID = `${b.factoryID}-${b.periodID}-${s.workerID}`;
            return {
                updateOne: {
                    filter: { fsSummaryID },
                    update: {
                        $set: {
                            companyID: b.companyID, factoryID: b.factoryID, periodID: b.periodID,
                            workerID: s.workerID, scanID: s.scanID ?? '', workerName: s.workerName ?? '',
                            daysWorked: Number(s.daysWorked) || 0, otHours: Number(s.otHours) || 0,
                            deductAmount: Number(s.deductAmount) || 0, comment: s.comment ?? '',
                            days: Array.isArray(s.days) ? s.days : [],
                            status: s.status ?? 'confirmed', updatedAt: new Date(), updatedBy,
                        },
                        $setOnInsert: { fsSummaryID, createdAt: new Date() },
                    },
                    upsert: true,
                },
            };
        });
        if (ops.length) await FingerScanSummary.bulkWrite(ops);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), saved: ops.length });
    } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════
// ทะเบียนเครื่อง finger scan (HR > Configuration > Finger Scan Setting)
// ═══════════════════════════════════════════════════════════════════════════

// ## GET /api/a/admacc/fs-machine/:companyID/:factoryID — ดึงเครื่องทั้งหมดของโรงงาน
exports.getFsMachines = async (req, res, next) => {
    const { companyID, factoryID } = req.params;
    try {
        const machines = await FingerScanMachine.find({ companyID, factoryID }).sort({ createdAt: 1 }).lean();
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), machines });
    } catch (err) { next(err); }
};

// ## POST /api/a/admacc/fs-machine/save — เพิ่ม/แก้ไขเครื่อง (ไม่มี machineID = สร้างใหม่)
// ## body: { machineID?, companyID, factoryID, name, brand, fileFormat, note, status, updatedBy }
exports.saveFsMachine = async (req, res, next) => {
    const b = req.body;
    try {
        if (!b.factoryID) return res.status(400).json({ success: false, message: 'factoryID required' });
        let machineID = b.machineID;
        if (!machineID) {
            const count = await FingerScanMachine.countDocuments({ companyID: b.companyID, factoryID: b.factoryID });
            machineID = `${b.factoryID}-fsm-${String(count + 1).padStart(4, '0')}`;
        }
        const set = {
            companyID: b.companyID, factoryID: b.factoryID,
            name: b.name ?? '', brand: b.brand ?? '', fileFormat: b.fileFormat || 'ver1',
            note: b.note ?? '', status: b.status ?? 'a',
            updatedAt: new Date(), updatedBy: b.updatedBy ?? (req.userData?.tokenSet?.userID || ''),
        };
        const updated = await FingerScanMachine.findOneAndUpdate(
            { machineID },
            { $set: set, $setOnInsert: { machineID, createdAt: new Date() } },
            { new: true, upsert: true }
        );
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), machine: updated });
    } catch (err) { next(err); }
};

// ## DELETE /api/a/admacc/fs-machine/:machineID — ลบเครื่อง
exports.deleteFsMachine = async (req, res, next) => {
    try {
        await FingerScanMachine.deleteOne({ machineID: req.params.machineID });
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};
