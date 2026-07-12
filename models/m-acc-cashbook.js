const mongoose = require("mongoose");

// ## รายการเงินสดของ cash man (Cash Book Entries)
// ## แต่ละ entry = 1 transaction ของ cash man คนนั้น
// ## transfer สร้าง 2 entries พร้อมกัน (transfer_out ↔ transfer_in)

const accCashBookSchema = new mongoose.Schema({

  entryID:       { type: String, required: true, unique: true },
  companyID:     { type: String, required: true },
  factoryID:     { type: String, required: true },
  cashManID:     { type: String, required: true },   // owner ของ entry นี้

  date:          { type: Date, required: true },
  type:          {
    type: String,
    enum: ['top_up', 'expense', 'transfer_out', 'transfer_in', 'return'],
    required: true,
  },
  amount:        { type: Number, required: true, min: 0 },  // เก็บบวกเสมอ sign มาจาก type
  description:   { type: String, default: '' },

  // สำหรับ transfer
  toCashManID:   { type: String, default: '' },   // ใช้เมื่อ type=transfer_out
  fromCashManID: { type: String, default: '' },   // ใช้เมื่อ type=transfer_in
  pairEntryID:   { type: String, default: '' },   // link transfer_out ↔ transfer_in

  // ── ลิงก์กลับ Daily bill (เมื่อ entry มาจากบัญชีรายวันแบบบิล) ──
  // billID เดียวกัน = entry ที่มาจากบิลเดียวกัน → Cash Book รวมแสดงเป็น 1 แถว
  billID:        { type: String, default: '' },
  billNo:        { type: String, default: '' },
  shopID:        { type: String, default: '' },
  shopName:      { type: String, default: '' },
  chartAccCode:  { type: String, default: '' },   // รหัสบัญชีของ line item นี้
  chartAccName:  { type: String, default: '' },
  note:          { type: String, default: '' },
  images:        { type: Array,  default: [] },    // รูปบิล (ซ้ำกันทุก entry ในบิล)

  status:    { type: String, default: 'a' },      // 'a' | 'i'
  createdAt: { type: Date, default: Date.now },
  createBy:  { userID: { type: String } },

});

accCashBookSchema.index({ companyID: 1, factoryID: 1, cashManID: 1, status: 1 });
accCashBookSchema.index({ companyID: 1, factoryID: 1, status: 1 });
accCashBookSchema.index({ cashManID: 1, date: -1 });
accCashBookSchema.index({ billID: 1 });

module.exports = mongoose.model("AccCashBook", accCashBookSchema);
