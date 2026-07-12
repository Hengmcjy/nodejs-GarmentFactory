const mongoose = require("mongoose");

// ## งวดจ่ายเงิน — ระดับโรงงาน (shared ทุก worker ในโรงงานเดียวกัน)
// ## 1 งวด = 1 รอบการจ่าย เช่น "งวดที่ 1 มิถุนายน 2567"

const workerPayPeriodSchema = new mongoose.Schema({

    periodID:   { type: String, required: true, unique: true },
    companyID:  { type: String, required: true },
    factoryID:  { type: String, required: true },
    name:       { type: String, required: true },   // "25 เม.ย. 2569 – 24 พ.ค. 2569"
    startDate:  { type: Date,   required: true },
    endDate:    { type: Date,   required: true },
    month:      { type: String, default: '' },      // "2026-06" (derive จาก startDate, เก็บไว้เผื่อใช้)
    status:     { type: String, default: 'a' },     // 'a' = active, 'c' = closed/paid

    createdAt:  { type: Date, default: Date.now },
    createBy:   { userID: { type: String } },

});

workerPayPeriodSchema.index({ companyID: 1, factoryID: 1, month: 1 });

module.exports = mongoose.model("WorkerPayPeriod", workerPayPeriodSchema);
