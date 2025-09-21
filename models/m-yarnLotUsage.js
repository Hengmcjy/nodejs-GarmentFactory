const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const yarnLotUsageSchema = mongoose.Schema({
  companyID: {type: String},
  factoryID: {type: String},
  customerID: {type: String},
  yarnSeasonID: {type: String},
  yarnID: {type: String},
  uuid: {type: String},
  yarnDataUUID: {type: String},
  yarnColorID: {type: String},
  // receiveDate: {type: Date},
  status: {type: String},
  yarnUsage: [{
    datetimeIssue: {type: Date},
    datetime: {type: Date},
    yuUUID: {type: String},
    yarnLotID: {type: String},
    yarnLotUUID: {type: String},
    invoiceID: {type: String},
    usageMode: {type: String}, // ## ct= fromCustomer , t=transfer , p=produce , 
    yarnWeight: {type: mongoose.Types.Decimal128},
    yarnWeightNet: {type: mongoose.Types.Decimal128},
    useWeight: {type: mongoose.Types.Decimal128},
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
    }],
    usageInfo: {
      setFactoryID : [{type: String}], // ## array = transfer case that have 2 factory relate
      fromFactoryID: {type: String},
      toFactoryID: {type: String},
      orderID: {type: String},
      yarnPlanWeight : {type: mongoose.Types.Decimal128},
      yarnInvoiceWeight : {type: mongoose.Types.Decimal128},
    },
  }],
});

yarnLotUsageSchema.plugin(uniqueValidator);

module.exports = mongoose.model("YarnLotUsage", yarnLotUsageSchema);


