const mongoose = require("mongoose");

// ## โครงการ (Project Tag)
// ## ใช้ tag รายรับ-รายจ่ายเพื่อดูรายงานแยกตามโครงการ
// ## แยกตาม factory

const accProjectSchema = new mongoose.Schema({

  projectID:  { type: String, required: true, unique: true },
  companyID:  { type: String, required: true },
  factoryID:  { type: String, required: true },

  name:       { type: String, required: true },   // ชื่อโครงการ เช่น "สร้างอาคาร A"
  code:       { type: String, required: true },   // รหัสย่อ เช่น "BLDG-A"

  projectStatus: { type: String, enum: ['active', 'done', 'lock'], default: 'active' },
  active:     { type: Boolean, default: true },
  status:     { type: String, default: 'a' },     // 'a' = active, 'i' = inactive
  createdAt:  { type: Date, default: Date.now },
  createBy:   { userID: { type: String } },

});

accProjectSchema.index({ companyID: 1, factoryID: 1, status: 1 });
accProjectSchema.index({ companyID: 1, factoryID: 1, code: 1 }, { unique: true });

module.exports = mongoose.model("AccProject", accProjectSchema);
