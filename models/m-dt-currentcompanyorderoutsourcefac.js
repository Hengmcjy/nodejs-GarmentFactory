const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// ## dt = data temp  dtcurrentcompanyorderoutsourcefac
const dtcurrentcompanyorderoutsourcefacSchema = mongoose.Schema({


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
    factoryID: {type: String},  // ## 
    factoryName: {type: String},  // ## 
    factoryName2: {type: String},  // ## 
    dateList: [{
      dateName: {type: String}, 
      out: [{
        bundleNos : [{type: Number}],
        color: {type: String}, 
        colorCode: {type: String}, 
        colorName: {type: String}, 
        colorValue: {type: String}, 
        factoryID1: {type: String},
        factoryID2: {type: String},
        orderID: {type: String},
        qty : {type: Number},
        setGroup: {type: String},
        setName: {type: String},
        targetPlaceID: {type: String},
        sTypeOtus: {type: String},
      }],
      receive: [{
        bundleNos : [{type: Number}],
        color: {type: String}, 
        colorCode: {type: String}, 
        colorName: {type: String}, 
        colorValue: {type: String}, 
        factoryID1: {type: String},
        factoryID2: {type: String},
        orderID: {type: String},
        qty : {type: Number},
        setGroup: {type: String},
        setName: {type: String},
        targetPlaceID: {type: String},
        sTypeOtus: {type: String},
      }],
    }],


    // color: {type: String},  // ## 
    // bundleNo: {type: Number},  // ## 
    // productCount: {type: Number},  // ## 
    // status: {type: String},  // ## 
    // factoryID: {type: String},  // ## 
    // toFactoryID : {type: String},
    // fromFactoryID : {type: String},
    // yyyymmdd : {type: String},
    // sumFactoryOutsQty : {type: Number},
  }],
});


dtcurrentcompanyorderoutsourcefacSchema.plugin(uniqueValidator);

module.exports = mongoose.model("DtcurrentcompanyorderoutsourcefacSchema", dtcurrentcompanyorderoutsourcefacSchema);
