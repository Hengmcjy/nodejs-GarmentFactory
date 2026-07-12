const mongoose = require("mongoose");

// ## งวดเงินเดือนพนักงานออฟฟิศ (Payroll Period)
// ## 1 งวด = 1 เดือน ต่อ 1 โรงงาน

const payrollPeriodSchema = new mongoose.Schema({

  payrollPeriodID: { type: String, required: true, unique: true }, // "PR-2025-01-FAC001"
  companyID:       { type: String, required: true },
  factoryID:       { type: String, required: true },

  month:  { type: String, required: true }, // "2025-01" (YYYY-MM)
  note:   { type: String, default: '' },

  // สรุปยอด (คำนวณตอน generate / update)
  totalGross:  { type: Number, default: 0 }, // รวมเงินเดือนก่อนหัก
  totalDeduct: { type: Number, default: 0 }, // รวมยอดหักทั้งหมด
  totalNet:    { type: Number, default: 0 }, // รวมที่พนักงานได้รับจริง
  empCount:    { type: Number, default: 0 }, // จำนวนพนักงานในงวดนี้

  status: { type: String, default: 'open' }, // 'open' | 'closed'

  createdAt: { type: Date, default: Date.now },
  createBy:  { userID: { type: String }, userName: { type: String } },

});

payrollPeriodSchema.index({ companyID: 1, factoryID: 1, month: 1 }, { unique: true });
payrollPeriodSchema.index({ companyID: 1, factoryID: 1, status: 1 });

module.exports = mongoose.model("PayrollPeriod", payrollPeriodSchema);
