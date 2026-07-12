const mongoose = require('mongoose');

// ── Finger Scan Summary ───────────────────────────────────────────────────────
// สรุปเวลาสแกนนิ้ว ต่อ worker ต่องวด (งวดตรงกับค่าแรงเหมา)
// HR ตรวจ/แก้ค่าสรุป (มากี่วัน / OT กี่ชั่วโมง / หัก...บาท / คอมเมนต์) แล้ว save
// ต่อมา push เข้าค่าแรง (WorkerPayItem รายวัน 59010004 + OT) — เก็บ collection แยกก่อน
// days[] = รายวันจาก finger scan (AM/PM/Over In/Out) → ตัวช่วยให้ HR ตัดสินใจ

const daySchema = new mongoose.Schema({
    date:    { type: String, default: '' },      // 'YYYY-MM-DD'
    // ── จาก sheet 'ระบบ' + ระบบวิเคราะห์ (โชว์ + ลงสีให้ HR ดู) ──
    punches: { type: [String], default: [] },    // เวลาสแกนดิบ ['08:02','11:58',...]
    otHint:  { type: Number, default: 0 },        // OT ชั่วโมงที่ระบบแนะนำ (แค่ hint)
    flags:   { type: [String], default: [] },     // 'late'|'late_over'|'early'|'ot'|'no_evening'|'partial'|'odd'
    // ── HR ตัดสินใจเอง ต่อบรรทัด (แยกจากที่ระบบวิเคราะห์) ──
    hrDay:   { type: Number, default: 0 },        // HR ใส่ "วัน" ต่อบรรทัด (ปกติ 1)
    hrOt:    { type: Number, default: 0 },        // HR ใส่ "OT ชั่วโมง" ต่อบรรทัด
    note:    { type: String, default: '' },       // HR โน้ตต่อบรรทัด
}, { _id: false });

const fsSummarySchema = new mongoose.Schema({
    fsSummaryID: { type: String, required: true },   // `${factoryID}-${periodID}-${workerID}`
    companyID:   { type: String, required: true },
    factoryID:   { type: String, required: true },
    periodID:    { type: String, required: true },   // งวด (ตรงกับค่าแรงเหมา)
    workerID:    { type: String, required: true },
    scanID:      { type: String, default: '' },       // No จาก finger scan (= uInfo.scanID)
    workerName:  { type: String, default: '' },       // ชื่อ (จากไฟล์/worker) — เก็บไว้โชว์ตอน reload

    // ── ค่าสรุปที่ HR กรอก/ยืนยัน (ต่องวด) ──
    daysWorked:   { type: Number, default: 0 },
    otHours:      { type: Number, default: 0 },
    deductAmount: { type: Number, default: 0 },   // หักค่ามาสาย ฯลฯ (บาท)
    comment:      { type: String, default: '' },   // คอมเมนต์ 1 อัน ต่องวด

    days:         { type: [daySchema], default: [] },   // รายวัน (finger scan) — ตัวช่วย HR
    sourceFiles:  { type: [String], default: [] },      // ชื่อไฟล์ที่ import
    status:       { type: String, default: 'draft' },   // 'draft' | 'confirmed' | 'pushed'
    pushedItemID: { type: String, default: '' },        // WorkerPayItem ที่ push ไป (เผื่อ update/ลบ)

    createdAt:    { type: Date, default: Date.now },
    updatedAt:    { type: Date, default: Date.now },
    updatedBy:    { type: String, default: '' },
});

fsSummarySchema.index({ companyID: 1, factoryID: 1, periodID: 1 });
fsSummarySchema.index({ fsSummaryID: 1 }, { unique: true });

module.exports = mongoose.model('FingerScanSummary', fsSummarySchema);
