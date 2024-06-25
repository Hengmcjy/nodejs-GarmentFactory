const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const scheduleSchema = mongoose.Schema({
  // orderProductionQueueID: { type: String, required: true },  // ## productBarcode+yyyymmddhhmm
  seasonYear: {type: String}, // ## 2024AW  2024SS …
  companyID: {type: String},
  factoryID: { type: String },
  sGroup: {type: String},
  sName: {type: String}, 
  sStatus: {type: String}, // ## on / off
  sMode: {type: String}, // ## 1, everyDay, everyHour, every15mn, every30mn  /   1= 1time  
  sDatetimeDiff : {type: Number}, // ## everyDay=1440 , everyHour=60 , every15mn=15 , every30mn= 30
  sNote: {type: String}, 
  sState: {type: String}, // ## normal, running = still calculating...
  lastDatetime : {type: Date},  // ## วันที่ล่าสุดที่อัพเดต
  sDatetime: [{   // ## 
    yyyy: {type: String},  // ## 'yyyy'
    mM: {type: String},  // ## 'hh:mm:ss'
    dd: {type: String}, 
    hh: {type: String}, 
    mm: {type: String}, 
    ss: {type: String}, 
  }],
  // show : {type: Boolean},
  // seq : {type: Number},
  // orderID: { type: String, required: true}, // ## from orderID
  // productID : {type: String, required: true},  
  // ver : {type: Number},
  // queueInfo: [{   // ## 
  //   productBarcode : {type: String},   // ## all product เสื้อทุกตัว barcode
  //   queueDate : {type: Date},  // ## วันที่ queue
  //   factoryID: { type: String, required: true },  // ## โรงงานไหน
  //   isOutsource : {type: Boolean},
  //   forLoss : {type: Boolean},
  //   forLossQty : {type: Number},
  //   bundleNo : {type: Number},
  //   bundleID : {type: String},
  //   toNode : {type: String},
  //   productCount : {type: Number},
  //   numberFrom : {type: Number},
  //   numberTo : {type: Number},
  //   yarnLot: [{   // ## 
  //     yarnLotID : {type: String},
  //   }],
  //   createBy: {
  //     userID: {type: String},
  //     userName: {type: String},
  //   }
  // }]
});

scheduleSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Schedule", scheduleSchema);
