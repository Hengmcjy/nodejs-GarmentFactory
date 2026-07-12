const mongoose = require("mongoose");

// ## สถานะงวดประจำเดือนของ Cash Book ระดับ factory
// ## 1 record ต่อ (factoryID + month) — ใช้ควบคุมการปิดงวด
// ## เมื่อ status = 'closed' → ไม่สามารถเพิ่ม/แก้ไข/ลบ entry ในเดือนนั้นได้อีก

const accCashBookMonthSchema = new mongoose.Schema({

  monthID:   { type: String, required: true, unique: true },  // cbm_${factoryID}_${YYYY-MM}
  companyID: { type: String, required: true },
  factoryID: { type: String, required: true },
  month:     { type: String, required: true },  // "YYYY-MM"

  status:   { type: String, enum: ['open', 'closed'], default: 'open' },
  closedAt: { type: Date, default: null },
  closedBy: { userID: { type: String, default: '' } },

  createdAt: { type: Date, default: Date.now },

});

accCashBookMonthSchema.index({ companyID: 1, factoryID: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("AccCashBookMonth", accCashBookMonthSchema);
