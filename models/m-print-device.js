const mongoose = require("mongoose");

// Requirement: เครื่องพิมพ์ QR / care label (ระดับ company — ทุกโรงเห็นร่วม)
//   เก็บ config เครื่อง + ภาษา command (SBPL / TSPL2 / ZPL) + การเชื่อมต่อ (agent) + ขนาดป้าย + cutter
//   collection: printdevices · deviceID = pd_###### (per company)
const printDeviceSchema = mongoose.Schema({
  companyID:     { type: String, required: true },
  deviceID:      { type: String },                 // pd_000001
  name:          { type: String },                 // ชื่อเรียก เช่น "ไลน์ A - TSC"
  brand:         { type: String },                 // SBARCO / TSC / อื่นๆ
  model:         { type: String },                 // T43R+ / MA3410P
  language:      { type: String },                 // SBPL | TSPL2 | ZPL (ภาษา command)
  dpi:           { type: Number },                 // 203 | 300 | 600
  // ── การเชื่อมต่อ (agent เข้าถึงเครื่องยังไง) ──
  pcName:        { type: String },                 // ชื่อ/รหัสคอมที่ต่อ USB (1 เครื่องพิมพ์ : 1 คอม) — ใช้ map ตอนพิมพ์
  agentUrl:      { type: String },                 // http://localhost:9100 (ที่อยู่ agent บนคอมนั้น)
  connType:      { type: String },                 // usb | network
  usbName:       { type: String },                 // ชื่อ printer ที่เครื่องเห็น (USB)
  host:          { type: String },                 // IP (network)
  port:          { type: Number },                 // 9100 (network)
  // ── ป้าย & การพิมพ์ ──
  labelWidthMm:  { type: Number },
  labelHeightMm: { type: Number },
  gapMm:         { type: Number },
  cutter:        { type: String },                 // none | each | batch
  // ── ความเร็ว/ความเข้ม (ปรับได้จากหน้าเว็บ) ──
  //   SBARCO(ZPL): speed 1-6 ips (^PR) · density 0-15 (~SD)  |  TSC(TSPL2): speed 2-6 ips · density 0-15
  speed:         { type: Number },                 // ips
  density:       { type: Number },                 // 0-15 (ยิ่งมาก ยิ่งเข้ม)
  // ── ตั้งค่าพิมพ์เพิ่ม (จำต่อเครื่อง · ใช้เป็น default เมื่อสั่งพิมพ์) ──
  cutMode:       { type: String },                 // each = ตัดทีละดวง | bundle = 12 ดวง/มัด ตัดท้ายมัด
  headMm:        { type: Number },                 // TSC: เว้นหัวก่อนตัด (mm)
  tailMm:        { type: Number },                 // TSC: ท้าย +ยืด/-ย่อ (mm) · -30 = สั้นสุด
  shiftX:        { type: Number },                 // SBARCO: เลื่อนทั้งป้าย +ซ้าย/-ขวา (dots)
  rightEdge:     { type: Number },                 // ขั้นสูง: ขอบขวา override (dots · ว่าง=ค่า engine 410/395)
  leftX:         { type: Number },                 // ขั้นสูง: ขอบซ้าย override (dots · ว่าง=16)
  templateKey:   { type: String },                 // layout ป้ายที่ใช้
  // ── อื่นๆ ──
  line:          { type: String },                 // ตำแหน่ง/ไลน์ (ข้อมูลประกอบ)
  isDefault:     { type: Boolean, default: false },
  status:        { type: String, default: 'a' },   // a = active | i = inactive
  note:          { type: String },
  createBy:      { userID: { type: String }, userName: { type: String } },
  createdAt:     { type: Date },
});

module.exports = mongoose.model("PrintDevice", printDeviceSchema);
