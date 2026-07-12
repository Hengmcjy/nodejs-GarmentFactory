const mongoose = require("mongoose");

// ## ร้านค้า / คนที่โรงงานซื้อของด้วย (Vendor / Supplier)
// ## แยกตาม factory

const accShopSchema = new mongoose.Schema({

  shopID:    { type: String, required: true, unique: true },
  companyID: { type: String, required: true },
  factoryID: { type: String, required: true },

  name:      { type: String, required: true },        // ชื่อร้าน / ชื่อคน
  shortCode: { type: String, required: true },        // รหัสย่อ
  type:      { type: String, enum: ['shop', 'person'], default: 'shop' },  // ร้านค้า หรือ บุคคล

  tel:       { type: String, default: '' },
  taxID:     { type: String, default: '' },           // เลขผู้เสียภาษี
  note:      { type: String, default: '' },

  active:    { type: Boolean, default: true },
  status:    { type: String, default: 'a' },          // 'a' = active, 'i' = soft-deleted
  createdAt: { type: Date, default: Date.now },
  createBy:  { userID: { type: String } },

});

accShopSchema.index({ companyID: 1, factoryID: 1, status: 1 });
accShopSchema.index({ companyID: 1, factoryID: 1, shortCode: 1 });

module.exports = mongoose.model("AccShop", accShopSchema);
