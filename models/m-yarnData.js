const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// function getCosts(value) {
//   if (typeof value !== 'undefined') {
//      return parseFloat(value.toString());
//   }
//   return value;
// };

const yarnDataSchema = mongoose.Schema({
  companyID: {type: String},
  factoryID: {type: String},
  customerID: {type: String},
  uuid: {type: String},
  yarnSeasonID: {type: String},
  status: {type: String},
  datetime: {type: Date},
  editDate: {type: Date},
  yarnID: {type: String},
  orderID: [{type: String}],
  colorS: [{
    seq: {type: Number},
    setName: {type: String},
    color: {
      colorID: {type: String},
      colorName: {type: String},
      colorValue: {type: String},
      colorCode: {type: String},
    }
  }],
  yarnDataInfo: [{
    datetime: {type: Date},
    editDate: {type: Date},
    yarnDataUUID: {type: String},
    
    yarnColorID: {type: String},
    type: {type: String},
    lastEdit: {type: Boolean},
    mode: {type: String},
    fromFactoryID: {type: String},
    toFactoryID: {type: String},
    isOutsource: {type: Boolean},
    outsourceData: [{   // ## 
      factoryID : {type: String},
      fromFactoryID : {type: String},
    }],
    yarnPlanWeight : {type: mongoose.Types.Decimal128},
    yarnWeight : {
      type: mongoose.Types.Decimal128
    },
    packageInfo: [{
      invoiceID: {type: String},
      yarnLotID: {type: String},
      yarnLotUUID: {type: String},
      coneWeight: {type: mongoose.Types.Decimal128},
      boxWeight: {type: mongoose.Types.Decimal128},
      state: {type: String},
      yarnBoxInfo: [{
        boxID: {type: String},
        boxUUID: {type: String},
        coneQty: {type: Number},
        factoryID: {type: String},
        yarnPlanWeight: {type: mongoose.Types.Decimal128},
        yarnWeight: {type: mongoose.Types.Decimal128},   // ## cannot change value
        yarnWeightNet: {type: mongoose.Types.Decimal128},  // ## cannot change value
        useWeight: {type: mongoose.Types.Decimal128},
        yarnTransferWeight: {type: mongoose.Types.Decimal128},
        weightVerified: {type: Boolean},
        used: {type: Boolean},  // ## y = used / n = not use yet
      }],
    }],
    yarnInfo: {
      orderID: {type: String},
      productBarcode: {type: String},
      yarnSupplierID: {type: String},
    }
  }],
  yarnStatCal: [{
    seq: {type: Number},
    setName: {type: String},
    color: {
      colorID: {type: String},
      colorName: {type: String},
      colorValue: {type: String},
      colorCode: {type: String},
    },
    mainZoneYarn: [{
      color: {
        colorID: {type: String},
        colorName: {type: String},
        colorValue: {type: String},
        colorCode: {type: String},
      },
      seq: {type: Number},
      seqCut: {type: Number},
      orderID: {type: String},
      sizeStr: {type: String},  // ##  xs - 2xl
      targetPlaceID : {type: String},
      targetPlaceName : {type: String},
      orderQty: {type: Number},
      pcWeight: {type: mongoose.Types.Decimal128}, // ##  weight average
      totalWeight: {type: mongoose.Types.Decimal128}, // ##
    }],
  }],
});

yarnDataSchema.plugin(uniqueValidator);

module.exports = mongoose.model("YarnData", yarnDataSchema);


