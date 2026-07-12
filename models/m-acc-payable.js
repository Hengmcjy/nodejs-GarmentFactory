const mongoose = require("mongoose");

// ## เจ้าหนี้การค้า / หนี้ค้างชำระ (Accounts Payable)
// ## เกิดเมื่อ "ซื้อเชื่อ" (payMethod: 'credit') ในบัญชีรายวัน — 1 บิลเชื่อ = 1 payable
// ## accrual: ค่าใช้จ่ายถูกบันทึกที่บิลรายวันแล้ว (ตอนซื้อ) → payable นี้ไว้ "ตามหนี้" อย่างเดียว
// ## จ่ายชำระ (เต็ม/บางส่วน) เก็บใน payments[] → เงินสดเข้า cashbook, ลด outstanding
// ## เจ้าหนี้ = ร้าน/บุคคล (shopID) ที่มีอยู่แล้ว

const paymentSchema = new mongoose.Schema({
    paymentID:       { type: String, required: true },
    date:            { type: Date, required: true },        // วันที่จ่าย (UTC-midnight)
    amount:          { type: Number, required: true, min: 0 },
    payMethod:       { type: String, enum: ['cash', 'cheque'], required: true },
    // เงินสด — ต้องระบุว่าเอาจาก cash man คนไหน
    cashManID:       { type: String, default: '' },
    cashManName:     { type: String, default: '' },
    cashBookEntryID: { type: String, default: '' },         // ลิงก์ AccCashBook (จ่ายออก)
    // เช็ค
    cheque: {
        bankAccountID: { type: String, default: '' },
        bankName:      { type: String, default: '' },
        chequeNo:      { type: String, default: '' },
        chequeDate:    { type: Date,   default: null },
    },
    note:      { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    createBy:  { userID: { type: String, default: '' } },
}, { _id: false });

const accPayableSchema = new mongoose.Schema({
    payableID:  { type: String, required: true, unique: true },
    companyID:  { type: String, required: true },
    factoryID:  { type: String, required: true },

    shopID:     { type: String, required: true },    // เจ้าหนี้ (ร้าน/บุคคล)
    shopName:   { type: String, default: '' },       // snapshot

    billID:     { type: String, default: '' },       // ผูกกับบิลรายวันที่ซื้อเชื่อ
    billNo:     { type: String, default: '' },
    purchaseDate: { type: Date, required: true },     // วันที่ซื้อ (UTC-midnight)

    // รายการที่ซื้อ (snapshot จากบิล)
    items: [{
        chartAccCode: { type: String },
        chartAccName: { type: String },
        amount:       { type: Number },
    }],

    totalAmount: { type: Number, required: true, min: 0 },   // ยอดซื้อเชื่อรวม
    paidAmount:  { type: Number, default: 0 },               // Σ payments (denormalize)
    payments:    [paymentSchema],

    status:    { type: String, default: 'open' },   // 'open' = ยังค้าง | 'paid' = จ่ายครบ
    note:      { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    createBy:  { userID: { type: String, default: '' } },
});

// index สำหรับ list หนี้ค้าง + รายงานเจ้าหนี้
accPayableSchema.index({ companyID: 1, factoryID: 1, status: 1, purchaseDate: -1 });
accPayableSchema.index({ companyID: 1, factoryID: 1, shopID: 1 });

module.exports = mongoose.model("AccPayable", accPayableSchema);
