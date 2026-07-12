const mongoose = require("mongoose");

// ## Ledger กันจ่ายซ้ำ Outsource
// ## 1 หน่วยงาน = order + bundleNo + stage(nodeID) → จ่ายได้ "ครั้งเดียว" ต่อ season
// ## unique index เป็นหลักประกันระดับ DB: ถึง UI พลาด ก็ insert ซ้ำไม่ได้ (dup key)
// ## งานซ่อม/ทำซ้ำ (rework) จะลงผ่านหน้าจอ manual แยก (ไม่ผ่าน ledger ตัวนี้)
const outsourcePaidUnitSchema = new mongoose.Schema({
    companyID:          { type: String, required: true },
    seasonYear:         { type: String, required: true },
    orderID:            { type: String, required: true },
    outsourceFactoryID: { type: String, default: '' },
    bundleNo:           { type: Number, required: true },
    nodeID:             { type: String, required: true },   // stage เช่น 4.MENDING
    size:               { type: String, default: '' },      // snapshot size (อ้างอิง)
    qty:                { type: Number, default: 0 },        // จำนวนตัวใน bundle+stage นี้ (snapshot)
    billID:             { type: String, default: '' },       // บิลที่จ่าย (ไว้ลบตอนยกเลิกจ่าย)
    paymentGroupID:     { type: String, default: '' },
    paidAt:             { type: Date, default: Date.now },
});

// กันซ้ำ: order+bundle+stage จ่ายได้ครั้งเดียว/บริษัท/ซีซัน
outsourcePaidUnitSchema.index({ companyID: 1, seasonYear: 1, orderID: 1, bundleNo: 1, nodeID: 1 }, { unique: true });
// ไว้ลบตอน void
outsourcePaidUnitSchema.index({ companyID: 1, billID: 1 });

module.exports = mongoose.model("OutsourcePaidUnit", outsourcePaidUnitSchema);
