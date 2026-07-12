const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  qrCode: { type: String },
  type:   { type: String, required: true },

  uInfo: {
    userName:   { type: String, required: true },
    userPass:   { type: String, required: true },
    pic:        { type: String },
    tel:        { type: String },
    email:      { type: String },
    registDate: { type: Date, required: true },
    lastLogin:  { type: Date },
    // ── ข้อมูล worker (HR worker register) — controller เขียนอยู่แล้ว แต่ schema ต้องประกาศ ไม่งั้น strict ตัดทิ้ง ──
    nationality: { type: String, default: '' },   // สัญชาติ
    department:  { type: String, default: '' },    // แผนก (กลุ่มใหญ่ = tab ในไฟล์ payroll: ทอ/ปั่นด้าย/พ้ง...)
    position:    { type: String, default: '' },    // ตำแหน่ง (หน้าที่ในแผนก: ดึงจี่เบ้/ทอผ้า/หัวหน้า...)
    startDate:   { type: String, default: '' },    // วันเริ่มงาน "YYYY-MM-DD" (calendar date เก็บเป็น string)
    note:        { type: String, default: '' },    // โน้ต/บันทึกเกี่ยวกับ worker (multi-line)
    wageType:    { type: String, default: 'daily' },  // ประเภทค่าจ้าง (เลือก 1): 'daily'|'monthly'|'piecework' — ใช้ทำ payroll · แยกจาก payType[] เก่า
    scanID:      { type: String, default: '' },       // รหัสในเครื่องสแกนนิ้ว (No) — map finger scan → worker · เฉพาะ worker รายวัน/รายเดือน
    scanMachineID: { type: String, default: '' },     // เครื่องสแกนที่ใช้ (อ้าง FingerScanMachine.machineID) — HR ผูกเอง
  },

  uCompany: [{
    companyID : {type: String},
    state: {type: String},
    userComClass: {
      userClassID: {type: String},
      userClassName: {type: String},
      userType: {type: String},
    },
    
  }],

  uFactory: [{
    factoryID:  { type: String },
    companyID:  { type: String },
    state:      { type: String },
    userFacClass: {
      userClassID:   { type: String },
      userClassName: { type: String },
      userType:      { type: String },
    },
  }],

  status: { type: String, required: true },
  state:  { type: String},

  // ── ค่าจ้าง worker (HR worker register) — controller เขียนอยู่แล้ว ต้องประกาศใน schema ด้วย ──
  payType:    { type: [String], default: ['daily'] },  // 'daily' | 'monthly' | 'piecework'
  baseSalary: { type: Number,   default: 0 },

  createdAt: { type: Date },
  createBy: {
    userID:   { type: String },
    userName: { type: String },
  },

  // ── UI Permissions ─────────────────────────────────────
  // String array — เก็บเฉพาะ key ที่ allowed
  // key ที่ไม่มีใน array = denied (default)
  //
  // ตัวอย่าง:
  // ["hr", "hr__emp-register", "hr__emp-register__tab__info"]
  uiPerms: { type: [String], default: [] },

});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
