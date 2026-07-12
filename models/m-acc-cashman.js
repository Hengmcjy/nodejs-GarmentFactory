const mongoose = require("mongoose");

// ## คนที่ถือเงินสดของโรงงาน (Cash Man / Cash Holder)
// ## แยกตาม factory, มีรูปโปรไฟล์

const accCashManSchema = new mongoose.Schema({

  cashManID: { type: String, required: true, unique: true },
  companyID: { type: String, required: true },
  factoryID: { type: String, required: true },

  name:      { type: String, required: true },   // ชื่อ-นามสกุล
  shortCode: { type: String, required: true },   // รหัสย่อ เช่น CM01
  tel:       { type: String, default: '' },
  note:      { type: String, default: '' },
  photo:     { type: String, default: '' },      // relative URL จาก image server

  active:    { type: Boolean, default: true },
  status:    { type: String, default: 'a' },     // 'a' | 'i'
  createdAt: { type: Date, default: Date.now },
  createBy:  { userID: { type: String } },

});

accCashManSchema.index({ companyID: 1, factoryID: 1, status: 1 });

module.exports = mongoose.model("AccCashMan", accCashManSchema);
