const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const lostGroupSchema = mongoose.Schema({
  // orderProductionQueueID: { type: String, required: true },  // ## productBarcode+yyyymmddhhmm
  companyID: {type: String},
  lostGroupID: {type: String}, // ##
  lostGroupName: {type: String},
  show : {type: Boolean},
  seq : {type: Number},
  // opdLostName: {type: String},
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

lostGroupSchema.plugin(uniqueValidator);

module.exports = mongoose.model("LostGroup", lostGroupSchema);
