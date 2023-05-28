const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const orderProductionQueueListSchema = mongoose.Schema({
  // orderProductionQueueID: { type: String, required: true },  // ## productBarcode+yyyymmddhhmm
  companyID: { type: String, required: true },
  orderID: { type: String, required: true}, // ## from orderID
  productID : {type: String, required: true},  
  factoryID : {type: String},
  productBarcode : {type: String},
  isOutsource : {type: Boolean},
  queueDate : {type: Date},  // ## วันที่ queue
  forLoss : {type: Boolean},
  forLossQty : {type: Number},
  toNode : {type: String},
  numberFrom : {type: Number},
  numberTo : {type: Number},
  bundleNoFrom : {type: Number},
  bundleNoTo : {type: Number},
  yarnLot: [{   // ## 
    yarnLotID : {type: String},
    yarnWeight : {type: Number},
  }],
  createBy: {
    userID: {type: String},
    userName: {type: String},
  }

});

orderProductionQueueListSchema.plugin(uniqueValidator);

module.exports = mongoose.model("OrderProductionQueueList", orderProductionQueueListSchema);
