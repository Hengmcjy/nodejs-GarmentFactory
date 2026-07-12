const mongoose = require("mongoose");

// ## งวดบัญชีรายวัน (Daily Accounting Period)
// ## 1 งวด = 1 เดือนเต็ม (วันที่ 1 – วันสุดท้ายของเดือน)
// ## periodID ใช้รูปแบบ dp_${factoryID}_${year}_${month2d}  เพื่อ upsert ง่าย
// ## ปิดงวดได้หลังสิ้นเดือน (ไม่จำกัดวัน)

const dailyPeriodSchema = new mongoose.Schema({

  periodID:  { type: String, required: true, unique: true },
  companyID: { type: String, required: true },
  factoryID: { type: String, required: true },

  year:      { type: Number, required: true },
  month:     { type: Number, required: true },  // 1-12
  dateStart: { type: Date,   required: true },  // วันที่ 1 ของเดือน
  dateEnd:   { type: Date,   required: true },  // วันสุดท้ายของเดือน

  status:    { type: String, enum: ['open', 'closed'], default: 'open' },
  closedAt:  { type: Date,   default: null },
  closedBy:  {
    userID: { type: String, default: '' },
    name:   { type: String, default: '' },
  },

  createdAt: { type: Date, default: Date.now },
  createBy:  { userID: { type: String, default: '' } },

});

dailyPeriodSchema.index({ companyID: 1, factoryID: 1, year: 1, month: 1 }, { unique: true });
dailyPeriodSchema.index({ companyID: 1, factoryID: 1, status: 1 });

module.exports = mongoose.model("DailyPeriod", dailyPeriodSchema);
