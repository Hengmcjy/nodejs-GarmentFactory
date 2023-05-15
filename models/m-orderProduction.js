const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const orderProductionSchema = mongoose.Schema({
  companyID: { type: String, required: true },
  factoryID: { type: String, required: true },  // ## โรงงานไหน
  orderID: { type: String, required: true}, // ## from orderID
  bundleNo : {type: Number},  
  bundleID : {type: String},
  productID : {type: String, required: true},  
  productBarcodeNo : {type: String, required: true},   // ## all product เสื้อทุกตัว barcode
  productBarcodeNoReal : {type: String},  // ## qrcode แท้จิงจะอยู่ที่นี้ ในกรณีใช้ qrcode replacement
  productBarcodeNoReserve : [{       // ## last one @ first element   ตัวล่าสุดเอาไว้ช่องแรก
    productBarcodeNo : {type: String},
    datetimeReserve : {type: Date},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    }
  }],  
  targetPlace : {
    targetPlaceID : {type: String},
    targetPlaceName : {type: String},
    countryID : {type: String},
    countryName : {type: String},
  },
  productCount : {type: Number},  
  productionDate : {type: Date, required: true},  // ## วันที่เริ่มต้นผลิต
  productStatus : {type: String},  
  forLoss : {type: Boolean},  
  // productProblem: [{   // ## 
  //   productProblemID : {type: String},
  //   productProblemDate : {type: String}, 
  // }],
  productionNode: [{   // ## อยู่ในการผลิตขั้นตอนไหน
    fromNode : {type: String},
    toNode : {type: String},
    datetime : {type: Date},
    status : {type: String},
    problemID : {type: String},
    problemName : {type: String},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    }
  }]
});

orderProductionSchema.plugin(uniqueValidator);

module.exports = mongoose.model("OrderProduction", orderProductionSchema);
