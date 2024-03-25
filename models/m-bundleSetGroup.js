const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const bundleSetGroupSchema = mongoose.Schema({
  companyID: { type: String},
  uuid: { type: String},
  completed: { type: Boolean},
  groupName: { type: String},
  seq : {type: Number},
  seasonYear: { type: String},
  orderID: { type: String}, // ## from orderID   
  setName : {type: String},  
  color: {
    colorID: {type: String},
    colorName: {type: String},
    colorValue: {type: String},
    colorCode: {type: String},
  },
  targetPlaceID : {type: String},  
  yarnLotID : {type: String},   // ## 
  bundleNoSet : {type: String},
  bundleNoQty : {type: Number},
  datetime : {type: Date},  // ## วันที่ 
  createBy: {
    userID: {type: String},
    userName: {type: String},
  }
});

bundleSetGroupSchema.plugin(uniqueValidator);

module.exports = mongoose.model("BundleSetGroupSchema", bundleSetGroupSchema);
