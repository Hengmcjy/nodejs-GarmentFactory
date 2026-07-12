const mongoose = require("mongoose");

// ## รายการรายรับ/รายหัก ของ worker แต่ละคน ในงวดนั้น
// ## type = 'income'    → หมวด 4 (รายรับ)
// ## type = 'deduction' → หมวด 5 (รายหัก)

const workerPayItemSchema = new mongoose.Schema({

    itemID:        { type: String, required: true, unique: true },
    companyID:     { type: String, required: true },
    factoryID:     { type: String, required: true },
    periodID:      { type: String, required: true },
    workerID:      { type: String, required: true },

    type:          { type: String, enum: ['income', 'deduction'], required: true },

    chartAccID:    { type: String, required: true },   // _id ของ AccChart
    chartAccCode:  { type: String, required: true },   // "4101"
    chartAccName:  { type: String, required: true },   // "ค่าแรงรายวัน"

    amount:        { type: Number, default: 0 },
    note:          { type: String, default: '' },
    itemDate:      { type: Date, default: Date.now },   // วันที่ของรายการ (ย้อนหลังได้)

    // ## หลักฐานรูปภาพ (อัปโหลดไปที่ image server)
    // ## path: uploads/acc/wage/[periodID]/[workerID]/[filename].webp
    images: [{
        baseName:     { type: String },
        filename:     { type: String },
        url:          { type: String },
        originalName: { type: String },
    }],

    createdAt:     { type: Date, default: Date.now },
    createBy:      { userID: { type: String } },

});

workerPayItemSchema.index({ companyID: 1, factoryID: 1, periodID: 1, workerID: 1 });
workerPayItemSchema.index({ periodID: 1, workerID: 1 });

module.exports = mongoose.model("WorkerPayItem", workerPayItemSchema);
