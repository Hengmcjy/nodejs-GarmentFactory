const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const orderProductionSchema = mongoose.Schema({
  companyID: { type: String, required: true },
  factoryID: { type: String, required: true },  // ## โรงงานไหน
  orderID: { type: String, required: true}, // ## from orderID
  ver : {type: Number}, // ## version
  open : {type: Boolean},  
  bundleNo : {type: Number},  
  bundleID : {type: String},
  productID : {type: String, required: true},  
  productBarcodeNo : {type: String, required: true},   // ## all product เสื้อทุกตัว barcode
  productBarcodeNoReal : {type: String},  // ## qrcode แท้จิงจะอยู่ที่นี้ ในกรณีใช้ qrcode replacement
  productBarcodeNoReserve : [{       // ## last one @ first element   ตัวล่าสุดเอาไว้ช่องแรก
    productBarcodeNo : {type: String},
    datetime : {type: Date},
    nodeID : {type: String},
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
  orLost : {
    datetime : {type: Date},
    odpLostID : {type: String},
    lostGroupID : {type: String},
    nodeID : [{type: String}],
    note : {type: String},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    },
  },

  forLoss : {type: Boolean},  
  isOutsourceTracking : {type: Boolean},
  yarnLot: [{   // ## 
    yarnLotID : {type: String},
  }],
  outsourceData: [{   // ## 
    factoryID : {type: String},
    fromFactoryID : {type: String},
    datetime : {type: Date},
  }],
  subNodeFlow: [{   // ## 
    factoryID: { type: String},
    nodeID : {type: String},
    subNodeID : {type: String},
    qrCode : {type: String}, // staffID , qrCode of staff
    datetime : {type: Date},
    monthlyID: {type: String},  // ## งวด ID  เอาไว้ใช้เวลาทำเกี่ยวกับ บัญชี
    cost : {type: mongoose.Types.Decimal128},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    },
  }],
  productionNode: [{   // ## อยู่ในการผลิตขั้นตอนไหน
    factoryID : {type: String},  // that factory did / ฝีมือโรงงานไหน
    fromNode : {type: String},
    toNode : {type: String},
    datetime : {type: Date},
    status : {type: String},
    info : {type: String},  // ## 
    sTypeOtus : {type: String},  // ## b =bundle , 1= 1by 1 / sType=scanType
    problemID : {type: String},
    problemName : {type: String},
    isTracking : {type: Boolean},  // ## scan by user-office check by themselve
    isOutsource : {type: Boolean}, 
    outsourceData: [{   // ## 
      factoryID : {type: String},
      fromFactoryID : {type: String},
    }],
    createBy: {
      userID: {type: String},
      userName: {type: String},
    }
  }]
});

				


orderProductionSchema.plugin(uniqueValidator);

module.exports = mongoose.model("OrderProduction", orderProductionSchema);
