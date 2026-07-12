const mongoose = require("mongoose");

// ## ทะเบียนบัญชีธนาคาร (Bank Account Register)
// ## 1 โรงงาน มีได้หลายบัญชีธนาคาร

const accBankAccountSchema = new mongoose.Schema({

  bankAccountID: { type: String, required: true, unique: true },
  companyID:     { type: String, required: true },
  factoryID:     { type: String, required: true },

  bankName:      { type: String, required: true },   // ชื่อธนาคาร เช่น "ธนาคารกสิกรไทย"
  bankShortName: { type: String, required: true },   // ชื่อย่อ เช่น "KBANK"
  accountNo:     { type: String, required: true },   // เลขบัญชี เช่น "123-4-56789-0"
  accountName:   { type: String, required: true },   // ชื่อบัญชี (ชื่อโรงงาน/เจ้าของ)
  note:          { type: String, default: '' },      // หมายเหตุ

  active:    { type: Boolean, default: true },
  status:    { type: String, default: 'a' },         // 'a' = active, 'i' = soft-deleted
  createdAt: { type: Date, default: Date.now },
  createBy:  { userID: { type: String } },

});

accBankAccountSchema.index({ companyID: 1, factoryID: 1, status: 1 });
accBankAccountSchema.index({ companyID: 1, factoryID: 1, bankAccountID: 1 });

module.exports = mongoose.model("AccBankAccount", accBankAccountSchema);
