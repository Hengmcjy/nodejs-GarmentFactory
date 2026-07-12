const mongoose = require("mongoose");

// ## ยอดยกมา (Carry Forward) ของแต่ละ cash man แต่ละเดือน
// ## เก็บแยกจาก entries เพื่อไม่ให้ balance นับซ้ำ
// ## สร้างเมื่อกด "ทำการยกยอด" — 1 record ต่อ (cashManID + month)

const accCashBookPeriodSchema = new mongoose.Schema({

  periodID:       { type: String, required: true, unique: true },
  companyID:      { type: String, required: true },
  factoryID:      { type: String, required: true },
  month:          { type: String, required: true },  // "2026-01" (YYYY-MM)
  cashManID:      { type: String, required: true },
  openingBalance: { type: Number, default: 0 },       // ยอดยกมาจากเดือนก่อน

  createdAt: { type: Date, default: Date.now },
  createBy:  { userID: { type: String } },

});

accCashBookPeriodSchema.index({ companyID: 1, factoryID: 1, month: 1 });
// unique ต่อ cashManID + month (upsert ได้)
accCashBookPeriodSchema.index({ cashManID: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("AccCashBookPeriod", accCashBookPeriodSchema);
