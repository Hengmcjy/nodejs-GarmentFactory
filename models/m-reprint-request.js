const mongoose = require("mongoose");

// Requirement (user 2026-07-19): ใบขอ reprint QR — office สร้างจาก Report 11 (Node Bundle) → worker พิมพ์ที่หน้า Print QR
//   ★ ต้องข้ามคน/เครื่อง/เวลา (ออฟฟิสกับคนพิมคนละคน อาจห่างกันหลายชม./วัน) → เก็บฝั่ง server
//   collection: reprintrequests · requestID = rr_###### (per company) · status pending/done/cancelled
//   ★ ไม่ใช้ mongoose-unique-validator (schema ไม่มี field unique — เคยทำ 500)
const reprintRequestSchema = mongoose.Schema({
  companyID:  { type: String, required: true },
  requestID:  { type: String },                 // rr_000001
  factoryID:  { type: String },                 // โรงของชิ้น (จาก Report 11) · '*' = ทุกโรง
  orderID:    { type: String },
  style:      { type: String },
  seasonYear: { type: String },
  items:      [{ barcode: String, runNo: String, label: String, group: String }],   // barcode = productBarcodeNoReal เต็ม · group = zone·color (ไว้จัดกลุ่มบนใบพิมพ์ซ้ำ)
  count:      { type: Number, default: 0 },
  unlockCode: { type: String },                 // ★ รหัสเปิด 4-6 หลัก (ออฟฟิสตั้ง · พิมพ์บนใบให้ ผจก เซ็น · worker ต้องกรอกก่อนพิมพ์) · ไม่ส่งกลับใน list
  note:       { type: String },                 // หมายเหตุจากออฟฟิส (เช่น ด่วน / ชื่อคนขอ)
  status:     { type: String, default: 'pending' },   // pending | done | cancelled
  createBy:   { userID: { type: String }, userName: { type: String } },
  createdAt:  { type: Date },
  closeBy:    { userID: { type: String }, userName: { type: String } },   // คนพิมที่ปิดใบ
  closedAt:   { type: Date },
});

module.exports = mongoose.model("ReprintRequest", reprintRequestSchema);
