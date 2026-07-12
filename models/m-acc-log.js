const mongoose = require("mongoose");

// ## Audit Log — บันทึกทุก action ที่มีผลต่อข้อมูล (รอบแรก: บัญชีรายวัน)
// ## 1 action = 1 document · เก็บเฉพาะ field ที่เปลี่ยน (ไม่ snapshot ทั้งบิล → เล็ก)
// ## TTL: ลบเองเมื่อเกิน 2 ปี (audit ทั่วไปพอ) — ตั้งครั้งเดียว ไม่ต้องดูแล
const accLogSchema = new mongoose.Schema({
    logID:      { type: String },
    companyID:  { type: String, required: true },
    factoryID:  { type: String, required: true },

    module:     { type: String, default: 'daily' },   // ขอบเขต: daily (รอบแรก) · เผื่ออนาคต cashbook/payable
    targetType: { type: String, default: 'bill' },     // bill | entry

    billID:     { type: String, default: '' },
    billNo:     { type: String, default: '' },
    entryID:    { type: String, default: '' },

    action:     { type: String, required: true },       // create | update | delete | ...
    changes:    [{ field: String, from: String, to: String }],   // เฉพาะตอน update — field ที่เปลี่ยน
    summary:    { type: String, default: '' },           // สรุปสั้น 1 บรรทัด (ใช้โชว์ในลิสต์ Station ได้ทุก module)
    meta:       { type: mongoose.Schema.Types.Mixed, default: {} },  // ข้อมูลเฉพาะ module (ไว้ render ตอนกดดู)

    by:  { userID: { type: String, default: '' }, userName: { type: String, default: '' } },
    at:  { type: Date, default: Date.now },

    // ## expireAt = "วันที่ต้องลบ doc นี้" (คำนวณตอนเขียน จาก retention ต่อ module)
    // ## → per-type retention: แต่ละ module อายุต่างกันได้ (Mongo ลบเมื่อ expireAt ถึงเวลา)
    expireAt: { type: Date },
});

// index — ต่อบิล + Station (ทั้งโรงงาน / กรอง module)
accLogSchema.index({ companyID: 1, factoryID: 1, billID: 1, at: -1 });
accLogSchema.index({ companyID: 1, factoryID: 1, module: 1, at: -1 });
accLogSchema.index({ companyID: 1, factoryID: 1, at: -1 });
// TTL แบบ per-document — ลบเมื่อ expireAt ผ่านไปแล้ว (แต่ละ module อายุต่างกันได้)
accLogSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AccLog", accLogSchema);
