// ═══════════════════════════════════════════════════════════════════════════
// m-bundleReserve.js — [AI ใหม่ 2026-07-17] ทะเบียนจอง bundleNo (1 doc = 1 bundle)
//
// requirement (เฟส 3 ล็อกงาน — user ย้ำ: bundleNo "ห้ามซ้ำเด็ดขาด"):
//   - ชั้นที่ 2 ของการกันซ้ำ: insert 1 doc ต่อ bundle ใน transaction เดียวกับ OrderProduction
//   - unique index (companyID, ver, bundleNo) → DB การันตีระดับ index ว่าเลขซ้ำ insert ไม่ได้
//     ต่อให้โค้ดชั้นอื่นพลาดทุกชั้น MongoDB ก็จะ reject duplicate key เอง → transaction abort
//   - เก็บ orderID + productBarcode + คนล็อกไว้ด้วย → ตรวจย้อนได้ว่าเลขไหนถูกจองโดยการล็อกครั้งไหน
// ═══════════════════════════════════════════════════════════════════════════
const mongoose = require("mongoose");

const bundleReserveSchema = mongoose.Schema({
  companyID:      { type: String, required: true },
  ver:            { type: Number, required: true },
  bundleNo:       { type: Number, required: true },
  orderID:        { type: String },
  productBarcode: { type: String },   // ## zone barcode 37 หลักของการล็อกครั้งที่จองเลขนี้
  datetime:       { type: Date },
  createBy: {
    userID:   { type: String },
    userName: { type: String },
  },
});

// ## หัวใจของชั้นนี้: เลข bundle ซ้ำใน (companyID, ver) เดียวกัน = insert ไม่ผ่านเด็ดขาด
bundleReserveSchema.index({ companyID: 1, ver: 1, bundleNo: 1 }, { unique: true });

module.exports = mongoose.model("BundleReserve", bundleReserveSchema);
