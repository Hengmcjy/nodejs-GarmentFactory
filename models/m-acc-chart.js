const mongoose = require("mongoose");

// ## ผังบัญชี (Chart of Accounts)
// ## level 1 = 5 หมวดหลัก (hardcoded: asset, liability, equity, revenue, expense)
// ## level 2 = บัญชีหลัก
// ## level 3 = บัญชีย่อย (parentCode = code ของ level 2)
// ## nameI18n ไม่เก็บชื่อตรงๆ แต่เก็บ reference ไปหา Language model

const accChartSchema = new mongoose.Schema({

  companyID:  { type: String, required: true },
  factoryID:  { type: String, required: true },

  code:       { type: String, required: true },   // เช่น "1100", "5101"

  // ## ชื่อบัญชี — lText ใช้ชื่อตรง (ไทย default), หรือ reference ไปหา Language model
  nameI18n: {
    lText: { type: String },   // ชื่อตรงๆ (pragmatic approach — ถือเป็นไทย)
    Idno:  { type: Number },   // matches languageData[].Idno
    lType: { type: String },   // matches languageData[].lType
    lID:   { type: String },   // matches languageData[].lID
  },

  // ## ชื่อบัญชีหลายภาษา — เติมผ่าน Excel (export/upload) · แสดง = nameLang[lang] || nameI18n.lText
  // ## AI จัดการ key ให้อัตโนมัติ (Idno=Number(code), lType='accChart', lID=code)
  nameLang: {
    th: { type: String, default: '' },
    en: { type: String, default: '' },
    cn: { type: String, default: '' },
    mm: { type: String, default: '' },
    jp: { type: String, default: '' },
  },

  level:    { type: Number, enum: [2, 3], required: true },
  category: {
    type: String,
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
    required: true,
  },

  // ## level 3 เท่านั้นที่มี parentCode
  parentCode: { type: String, default: null },

  // ## mapping กับรหัสบัญชีของ สนง.บัญชีภายนอก
  externalMappings: [{
    firmID:    { type: String },
    firmName:  { type: String },   // ชื่อเต็ม สนง. (snapshot)
    shortCode: { type: String },   // ชื่อย่อ (snapshot)
    extCode:   { type: String },   // เลขที่บัญชีของ สนง.
    extName:   { type: String },   // ชื่อบัญชีของ สนง.
  }],

  status:    { type: String, default: 'a' },   // 'a' = active, 'i' = inactive
  createdAt: { type: Date, default: Date.now },
  createBy:  { userID: { type: String } },

});

// ## Indexes
accChartSchema.index({ companyID: 1, factoryID: 1, status: 1, category: 1, level: 1 });
accChartSchema.index({ companyID: 1, factoryID: 1, code: 1 }, { unique: true });

module.exports = mongoose.model("AccChart", accChartSchema);
