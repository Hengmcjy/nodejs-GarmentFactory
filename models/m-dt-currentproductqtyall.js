const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// ## dt = data temp  currentproductqtyall
const dtcurrentproductqtyallSchema = mongoose.Schema({
  seasonYear: {type: String}, // ## 2024AW  2024SS …
  companyID: {type: String},
  factoryID: { type: String },
  sGroup: {type: String},
  sName: {type: String}, 
  // sStatus: {type: String}, // ## on / off
  sMode: {type: String}, // ## 1, everyDay, everyHour, every15mn, every30mn  /   1= 1time  
  sDatetimeDiff : {type: Number}, // ## everyDay=1440 , everyHour=60 , every15mn=15 , every30mn= 30
  sNote: {type: String},   // ## noComplete , completed
  lastDatetime : {type: Date},  // ## วันที่ล่าสุดที่อัพเดต
  data: [{   // ## 
    companyID: {type: String},  // ## 
    orderID: {type: String},  // ## 
    productID: {type: String},  // ## 
    style: {type: String},  // ## 
    countQty: {type: Number},  // ## 
  }],
});

dtcurrentproductqtyallSchema.plugin(uniqueValidator);

module.exports = mongoose.model("DtcurrentproductqtyallSchema", dtcurrentproductqtyallSchema);
