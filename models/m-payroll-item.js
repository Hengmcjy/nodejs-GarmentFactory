const mongoose = require("mongoose");

// ## รายการเงินเดือนรายคน ต่องวด (Payroll Item)
// ## 1 item = 1 พนักงาน ใน 1 งวด

const payrollItemSchema = new mongoose.Schema({

  payrollPeriodID: { type: String, required: true },
  employeeID:      { type: String, required: true },
  companyID:       { type: String, required: true },
  factoryID:       { type: String, required: true },

  // Snapshot ข้อมูลพนักงาน ณ วันที่ generate (เก็บไว้ไม่ให้เปลี่ยนตาม master)
  name:       { type: String, default: '' },
  position:   { type: String, default: '' },
  department: { type: String, default: '' },
  bankAccount: { type: String, default: '' },
  bankName:    { type: String, default: '' },

  // รายได้
  baseSalary: { type: Number, default: 0 }, // เงินเดือนฐาน
  bonus:      { type: Number, default: 0 }, // โบนัส / OT / เพิ่มพิเศษ

  // รายการหัก
  socialSec:   { type: Number, default: 0 }, // ประกันสังคม (คำนวณจาก rate)
  tax:         { type: Number, default: 0 }, // ภาษีหัก ณ ที่จ่าย
  otherDeduct: { type: Number, default: 0 }, // หักอื่นๆ

  // สุทธิ (คำนวณอัตโนมัติ: baseSalary + bonus - socialSec - tax - otherDeduct)
  netPay: { type: Number, default: 0 },

  note: { type: String, default: '' },

});

payrollItemSchema.index({ payrollPeriodID: 1, employeeID: 1 }, { unique: true });
payrollItemSchema.index({ payrollPeriodID: 1, companyID: 1, factoryID: 1 });

module.exports = mongoose.model("PayrollItem", payrollItemSchema);
