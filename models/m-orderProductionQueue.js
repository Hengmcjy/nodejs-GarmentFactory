const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const orderProductionQueueSchema = mongoose.Schema({
  // orderProductionQueueID: { type: String, required: true },  // ## productBarcode+yyyymmddhhmm
  companyID: { type: String, required: true },
  orderID: { type: String, required: true}, // ## from orderID
  productID : {type: String, required: true},  
  queueInfo: [{   // ## 
    productBarcode : {type: String},   // ## all product เสื้อทุกตัว barcode
    queueDate : {type: Date},  // ## วันที่ queue
    factoryID: { type: String, required: true },  // ## โรงงานไหน
    bundleNo : {type: Number},
    bundleID : {type: String},
    toNode : {type: String},
    productCount : {type: Number},
    numberFrom : {type: Number},
    numberTo : {type: Number},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    }
  }]
});

orderProductionQueueSchema.plugin(uniqueValidator);

module.exports = mongoose.model("OrderProductionQueue", orderProductionQueueSchema);
