const mongoose = require('mongoose');

// ── Finger Scan Machine — ทะเบียนเครื่องสแกนนิ้วต่อโรงงาน ─────────────────────
// ลงทะเบียนว่าโรงงานมีกี่เครื่อง รุ่นไหน
// fileFormat = บอกว่าไฟล์ที่ export จากเครื่องนี้ใช้ parser ตัวไหน (ver1/ver2...)
//   → ใช้เติม dropdown "รูปแบบไฟล์" ในหน้าวิเคราะห์ finger scan

const machineSchema = new mongoose.Schema({
    machineID:  { type: String, required: true },     // `${factoryID}-fsm-####`
    companyID:  { type: String, required: true },
    factoryID:  { type: String, required: true },
    name:       { type: String, default: '' },         // ชื่อ/ตำแหน่งเครื่อง เช่น "ประตูหน้า"
    brand:      { type: String, default: '' },          // รุ่น/ยี่ห้อ เช่น ZKTeco
    fileFormat: { type: String, default: 'ver1' },      // ฟอร์แมตไฟล์ export → เลือก parser
    note:       { type: String, default: '' },
    status:     { type: String, default: 'a' },         // 'a'=ใช้งาน · 'b'=ปิด
    createdAt:  { type: Date, default: Date.now },
    updatedAt:  { type: Date, default: Date.now },
    updatedBy:  { type: String, default: '' },
});

machineSchema.index({ companyID: 1, factoryID: 1 });
machineSchema.index({ machineID: 1 }, { unique: true });

module.exports = mongoose.model('FingerScanMachine', machineSchema);
