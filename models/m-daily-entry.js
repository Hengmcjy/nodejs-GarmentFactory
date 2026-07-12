const mongoose = require("mongoose");

// ## รายการบัญชีรายวัน (Daily Accounting Entry)
// ## แต่ละ entry = 1 รายการ รายรับหรือรายจ่าย
// ## payMethod: 'cash' → ต้องระบุ cashManID และจะ auto-create AccCashBook entry
// ## payMethod: 'cheque' → ต้องระบุ cheque info

const dailyEntrySchema = new mongoose.Schema({

  entryID:   { type: String, required: true, unique: true },
  periodID:  { type: String, required: true },
  companyID: { type: String, required: true },
  factoryID: { type: String, required: true },

  entryDate: { type: Date, required: true },
  type:      { type: String, enum: ['income', 'expense'], required: true },

  // ## บัญชี (snapshot ไว้ด้วยเผื่อ chart เปลี่ยนภายหลัง)
  chartAccCode: { type: String, required: true },
  chartAccName: { type: String, default:  '' },

  amount:    { type: Number, required: true, min: 0 },

  // ## ร้าน/บุคคล (บังคับ)
  shopID:   { type: String, required: true },
  shopName: { type: String, default:  '' },  // snapshot

  // ## วิธีชำระ
  payMethod: { type: String, enum: ['cash', 'cheque', 'credit'], required: true },   // credit = ซื้อเชื่อ (ติดหนี้)

  // ## เงินสด
  cashManID:       { type: String, default: '' },
  cashManName:     { type: String, default: '' },    // snapshot
  cashBookEntryID: { type: String, default: '' },    // link ไปยัง AccCashBook

  // ## เช็ค
  cheque: {
    bankAccountID: { type: String, default: '' },
    bankName:      { type: String, default: '' },   // snapshot
    bankShortName: { type: String, default: '' },   // snapshot
    accountNo:     { type: String, default: '' },   // snapshot
    accountName:   { type: String, default: '' },   // snapshot
    chequeNo:      { type: String, default: '' },
    chequeDate:    { type: Date,   default: null  },
  },

  // ## โปรเจค (optional)
  projectID:   { type: String, default: '' },
  projectName: { type: String, default: '' },  // snapshot

  // ## บิล — กลุ่มหลายรายการในใบเดียวกัน (optional)
  billID:  { type: String, default: '' },   // รหัสบิล (nanoid) ใช้ group entries
  billNo:  { type: String, default: '' },   // เลขที่บิล (optional, กรอกเองหรือเว้นว่าง)

  // ## บิลค่าแรง worker รวมทั้งโรงงาน (เหมา/รายวัน/รายเดือน) — 1 งวด worker × 1 รหัสบัญชี = 1 record, ยอดล็อกจากระบบ
  isLaborLump:   { type: Boolean, default: false },
  laborPeriodID: { type: String,  default: '' },   // ## งวด worker (WorkerPayPeriod) ที่บิลนี้ดึงยอดมา — กันดึงงวดเดิมซ้ำ + ให้ตรงกับงวดบัญชี

  // ## รายการที่ระบบสร้างอัตโนมัติ (เช่น จ่าย outsource) — locked = ลบ/แก้จากหน้ารายวันไม่ได้
  // ## ต้องไปยกเลิกที่ต้นทาง (เช่น หน้าต้นทุน Outsource → ยกเลิกจ่าย)
  source: { type: String, default: '' },        // '' = ปกติ (คนลง), 'outsource' = มาจากจ่าย outsource
  locked: { type: Boolean, default: false },

  note:   { type: String, default: '' },
  images: [{
    baseName:     { type: String },
    filename:     { type: String },
    url:          { type: String },
    originalName: { type: String },
  }],

  status:    { type: String, default: 'a' },   // 'a' = active, 'i' = soft-deleted
  createdAt: { type: Date,   default: Date.now },
  createBy:  { userID: { type: String, default: '' } },

});

dailyEntrySchema.index({ companyID: 1, factoryID: 1, periodID: 1, status: 1 });
dailyEntrySchema.index({ companyID: 1, factoryID: 1, entryDate: -1, status: 1 });
dailyEntrySchema.index({ periodID: 1, status: 1 });

module.exports = mongoose.model("DailyEntry", dailyEntrySchema);
