const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// ## dt = data temp
const dtproductionzoneperiodcSchema = mongoose.Schema({
  seasonYear: {type: String}, // ## 2024AW  2024SS …
  companyID: {type: String},
  factoryID: { type: String },
  sGroup: {type: String},
  sName: {type: String}, 
  // sStatus: {type: String}, // ## on / off
  sMode: {type: String}, // ## 1, everyDay, everyHour, every15mn, every30mn  /   1= 1time  
  sDatetimeDiff : {type: Number}, // ## everyDay=1440 , everyHour=60 , every15mn=15 , every30mn= 30
  sNote: {type: String}, 
  lastDatetime : {type: Date},  // ## วันที่ล่าสุดที่อัพเดต
  data: [{   // ## 
    companyID: {type: String},  // ## 
    orderID: {type: String},  // ## 
    targetPlaceID: {type: String},  // ## 
    targetPlaceName: {type: String},  // ## 
    style: {type: String},  // ## 
    color: {type: String},  // ## 
    size: {type: String},  // ## 
    fromNode: {type: String},  // ## 
    sumProductQty : {type: Number},
  }],
  dataFake: [{   // ## 
    companyID: {type: String},  // ## 
    orderID: {type: String},  // ## 
    targetPlaceID: {type: String},  // ## 
    targetPlaceName: {type: String},  // ## 
    style: {type: String},  // ## 
    color: {type: String},  // ## 
    size: {type: String},  // ## 
    fromNode: {type: String},  // ## 
    sumProductQty : {type: Number},
  }],
});

dtproductionzoneperiodcSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Dtproductionzoneperiodc", dtproductionzoneperiodcSchema);
