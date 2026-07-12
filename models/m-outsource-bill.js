const mongoose = require("mongoose");

// ## Outsource Cost — บิลค่าจ้างโรงงานนอก
// ## 1 บิล = season + โรงนอก + orderID + targetPlace + color (จากฝั่ง out ใน cache)
// ## จ่ายเมื่อเสื้อกลับมาครบ · ยอดเงิน "ใส่เอง" ต่อ size · กันจ่ายซ้ำด้วย billKey (unique)

// ## ราคาต่อ stage × size (accounting ใส่เรตต่อตัว → amount = เรต × qty)
const costLineSchema = new mongoose.Schema({
    nodeID:    { type: String, default: '' },   // stage เช่น 4.MENDING
    size:      { type: String, default: '' },
    qty:       { type: Number, default: 0 },    // snapshot จำนวนตัว
    unitPrice: { type: Number, default: 0 },    // เรตต่อตัว
    amount:    { type: Number, default: 0 },    // = unitPrice × qty
}, { _id: false });

// ## รูปหลักฐานการจ่าย (อัปขึ้น image server แล้วเก็บ url) — type: sign(ใบเซ็นอนุมัติ)/transfer(ใบโอน/จ่าย)/other
// ## location บน image server: uploads/acc/outspay/<outsFacID>/<season>/<payDate>
const evidenceSchema = new mongoose.Schema({
    url:          { type: String, default: '' },   // relative path จาก image server เช่น /images/acc/outspay/.../xxx.webp
    baseName:     { type: String, default: '' },   // ใช้ลบไฟล์บน image server
    filename:     { type: String, default: '' },
    originalName: { type: String, default: '' },
    type:         { type: String, default: 'other' },   // sign | transfer | other
    note:         { type: String, default: '' },
    uploadedAt:   { type: Date, default: Date.now },
    by:           { userID: { type: String, default: '' }, userName: { type: String, default: '' } },
}, { _id: false });

const outsourceBillSchema = new mongoose.Schema({
    billID:     { type: String },
    billKey:    { type: String },   // `${sendDate}|${outsourceFactoryID}|${orderID}|${targetPlaceID}|${color}` — กันซ้ำ
    companyID:  { type: String, required: true },
    factoryID:  { type: String, default: '' },   // โรงงานเราที่ตั้งบิล (อ้างอิง)
    seasonYear: { type: String, required: true },

    outsourceFactoryID:   { type: String, required: true },
    outsourceFactoryName: { type: String, default: '' },
    orderID:       { type: String, required: true },
    targetPlaceID: { type: String, default: '' },   // ASIA/JAPN/SGHI/UK
    color:         { type: String, default: '' },   // colorCode เช่น #007
    colorName:     { type: String, default: '' },
    sendDate:      { type: String, default: '' },   // วันที่ส่ง เช่น "05-Jul-2026"

    qty:          { type: Number, default: 0 },    // จำนวนตัวรวมของบิล
    totalBundles: { type: Number, default: 0 },    // จำนวนมัด
    // ราคาต้นทุน: แยกต่อ stage × size — accounting ลง
    lines:        [costLineSchema],
    totalAmount:  { type: Number, default: 0 },

    // ## บิล manual (งานเพิ่ม/ซ่อม เช่น รีดซ้ำ) — ลอย ไม่มี bundleNos/qr, ไม่แตะ ledger กันซ้ำ
    // ## จ่ายเงิน/ปิดจ๊อบ/ใบสำคัญจ่าย ใช้ระบบเดียวกับบิลปกติ
    manual:       { type: Boolean, default: false },

    status:      { type: String, default: 'billed' },   // billed | paid
    payableID:   { type: String, default: '' },

    // ── การจ่ายเงิน (จ่ายเต็ม · จ่ายจริงหลังเจ้าของเซ็นเท่านั้น) ──
    // ## รวมได้หลายบิล (โรงนอกเดียว + orderID เดียว) จ่ายทีเดียว → paymentGroupID เดียวกัน + Cash Book ก้อนเดียว
    paymentGroupID:  { type: String, default: '' },   // กลุ่มการจ่าย (บิลที่จ่ายพร้อมกันใช้ค่าเดียวกัน)
    paidDate:        { type: String, default: '' },   // วันจ่ายจริง "DD-Mmm-YYYY" (calendar)
    paidAt:          { type: Date },                  // timestamp ตอนกดจ่าย
    payMethod:       { type: String, default: 'cash' },   // cash | cheque | transfer | other
    cheque: {                                             // ข้อมูลเช็ค (เมื่อ payMethod='cheque')
        bankAccountID: { type: String, default: '' },
        chequeNo:      { type: String, default: '' },
        chequeDate:    { type: String, default: '' },     // 'YYYY-MM-DD'
    },
    cashManID:       { type: String, default: '' },   // จ่ายจากกระเป๋า cash man ไหน (คู่กับ Cash Book เงินออก)
    cashManName:     { type: String, default: '' },
    cashBookEntryID: { type: String, default: '' },   // ลิงก์ Cash Book expense ก้อนเดียวของกลุ่ม
    dailyEntryID:    { type: String, default: '' },   // ลิงก์รายการรายวัน (auto post ตอนจ่าย) — ไว้ยกเลิก
    payNote:         { type: String, default: '' },
    ownerSigned:     { type: Boolean, default: false },   // ยืนยันเจ้าของเซ็นอนุมัติแล้ว (กั้นก่อนจ่าย)
    paidBy:          { userID: { type: String, default: '' }, userName: { type: String, default: '' } },

    // ── ปิดจ๊อบ (ล็อก) — จ่าย+แนบเอกสารครบแล้ว → view อย่างเดียว (แก้/ลบ/ยกเลิก/เพิ่มรูป ไม่ได้) ปลดได้ ──
    locked:          { type: Boolean, default: false },
    lockedAt:        { type: Date },
    lockedBy:        { userID: { type: String, default: '' }, userName: { type: String, default: '' } },

    // ── ล็อกเตรียมจ่าย (freeze) — กดก่อนส่งจ่าย/พิมพ์ PDF → กันคนอื่นมาแก้/ลบ/ตั้งราคาใหม่ ระหว่างรอจ่าย ──
    frozen:          { type: Boolean, default: false },
    frozenAt:        { type: Date },
    frozenBy:        { userID: { type: String, default: '' }, userName: { type: String, default: '' } },

    // ── หลักฐาน (ใบเซ็นอนุมัติ / ใบโอน-จ่าย / อื่น ๆ) เพิ่มได้หลังจ่าย ──
    evidence:        [evidenceSchema],

    note:  { type: String, default: '' },
    by:    { userID: { type: String, default: '' }, userName: { type: String, default: '' } },
    createdAt: { type: Date, default: Date.now },
});

outsourceBillSchema.index({ companyID: 1, seasonYear: 1, billKey: 1 }, { unique: true });
outsourceBillSchema.index({ companyID: 1, seasonYear: 1, outsourceFactoryID: 1 });
outsourceBillSchema.index({ companyID: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("OutsourceBill", outsourceBillSchema);
