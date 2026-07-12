const mongoose = require("mongoose");

// ## พนักงานออฟฟิศ (Employee Register)
// ## แยกจาก user (login) — 1 คนอาจมีหรือไม่มี login ก็ได้
// ## collection: employees

const employeeSchema = new mongoose.Schema({

  employeeID: { type: String, required: true, unique: true }, // เช่น "EMP-001"
  companyID:  { type: String, required: true },
  factoryID:  { type: String, required: true },
  userID:     { type: String, default: '' },                  // optional — link กับ user login

  name:       { type: String, required: true },
  nickname:   { type: String, default: '' },
  position:   { type: String, default: '' },                  // ตำแหน่ง เช่น "ผู้จัดการ"
  department: { type: String, default: '' },                  // แผนก เช่น "HR", "บัญชี"
  startDate:  { type: String, default: '' },                  // วันเริ่มงาน "2025-01-01"

  salary:        { type: Number, default: 0 },                // เงินเดือนฐาน (บาท/เดือน)
  socialSecRate: { type: Number, default: 5 },                // % หักประกันสังคม (default 5%)
  bankAccount:   { type: String, default: '' },               // เลขบัญชี
  bankName:      { type: String, default: '' },               // ชื่อธนาคาร

  pic:    { type: String, default: '' },                      // ชื่อไฟล์รูปโปรไฟล์ (เก็บแค่ชื่อไฟล์)
  status: { type: String, default: 'a' },                     // 'a' = active, 'i' = inactive

  createdAt: { type: Date, default: Date.now },
  createBy:  { userID: { type: String }, userName: { type: String } },

});

employeeSchema.index({ companyID: 1, factoryID: 1, status: 1 });
employeeSchema.index({ companyID: 1, factoryID: 1, employeeID: 1 });

module.exports = mongoose.model("Employee", employeeSchema);
