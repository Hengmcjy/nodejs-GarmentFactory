// ═══════════════════════════════════════════════════════════════════════════
// m-bundleCounter.js — [AI ใหม่ 2026-07-17] counter จองเลข bundleNo แบบ atomic
//
// requirement (เฟส 3 ล็อกงาน — user ย้ำ: bundleNo "ห้ามซ้ำเด็ดขาด"):
//   - bundleNo รันร่วมกันทั้ง company (ทุกโรงงาน/ทุก order) แยกตาม ver
//   - วิธีเก่า (หา max แล้ว +1) มี race ตอนหลายคนล็อกงานพร้อมกัน → เลขชนกันได้
//   - ชั้นที่ 1 ของการกันซ้ำ: จองเลขด้วย findOneAndUpdate {$inc: seq} (atomic ระดับ DB)
//     ต่อให้ 2 คนกดพร้อมกัน แต่ละคนได้ช่วงเลขคนละช่วง ไม่มีทางทับกัน
//   - seed ครั้งแรก: ตั้งค่า seq = max(bundleNo) จริงที่มีอยู่ (ดูใน c-order2.js reserveBundleNos)
//   - เลขที่จองแล้วแต่ transaction ล้ม = เลขเว้นว่าง (ยอมรับได้ — ห้ามซ้ำสำคัญกว่าห้ามเว้น)
// ═══════════════════════════════════════════════════════════════════════════
const mongoose = require("mongoose");

const bundleCounterSchema = mongoose.Schema({
  companyID: { type: String, required: true },
  ver:       { type: Number, required: true },   // ## scope เดียวกับ checkBundleNoExisted เดิม (companyID + ver)
  seq:       { type: Number, required: true },   // ## bundleNo ล่าสุดที่ถูกจองไปแล้ว
});

// ## unique: 1 counter ต่อ (companyID, ver) — กันสร้าง counter ซ้อนกันตอน seed พร้อมกัน
bundleCounterSchema.index({ companyID: 1, ver: 1 }, { unique: true });

module.exports = mongoose.model("BundleCounter", bundleCounterSchema);
