const mongoose = require("mongoose");

// ## สำนักงานบัญชีภายนอก (Accounting Firms)
// ## ใช้สำหรับ mapping รหัสบัญชีภายนอกใน Chart of Accounts

const accFirmSchema = new mongoose.Schema({

  firmID:    { type: String, required: true, unique: true },
  companyID: { type: String, required: true },

  name:      { type: String, required: true },   // ชื่อเต็ม สนง.บัญชี
  shortCode: { type: String, required: true },   // ชื่อย่อ เช่น "ABC"
  tel:       { type: String, default: '' },
  email:     { type: String, default: '' },
  note:      { type: String, default: '' },

  active:    { type: Boolean, default: true },
  status:    { type: String, default: 'a' },     // 'a' = active, 'i' = inactive
  createdAt: { type: Date, default: Date.now },
  createBy:  { userID: { type: String } },

});

accFirmSchema.index({ companyID: 1, status: 1 });
accFirmSchema.index({ companyID: 1, shortCode: 1 });

module.exports = mongoose.model("AccFirm", accFirmSchema);
