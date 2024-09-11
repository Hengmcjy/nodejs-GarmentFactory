const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const yarnStockCardPCSSchema = mongoose.Schema({
  companyID: {type: String},
  yarnSeasonID: {type: String},
  yarnID: {type: String}, // ## 
  yarnColorID: {type: String},
  type: {type: String}, // ##   pcs , zone
  dataPCS: [{
    datetime: {type: Date},
    ddmmyyyy: {type: String},
    usageMode: {type: String},
    orderID: {type: String},
    toFactoryID: {type: String},
    invoiceID: {type: String},
    yarnBoxInfoLen: {type: Number},
    yarnLotID2: {type: String},
    yarnDataUUID: {type: String},
    yarnLotUUID: {type: String},
    yuUUID: {type: String},
    pcs: {type: Number},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    },
  }],
  dataZONE: [{
    datetime: {type: Date},
    ddmmyyyy: {type: String},
    usageMode: {type: String},
    orderID: {type: String},
    toFactoryID: {type: String},
    invoiceID: {type: String},
    yarnBoxInfoLen: {type: Number},
    yarnLotID2: {type: String},
    yarnDataUUID: {type: String},
    yarnLotUUID: {type: String},
    yuUUID: {type: String},
    targetPlaceID: {type: String},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    },
  }],
});

yarnStockCardPCSSchema.plugin(uniqueValidator);

module.exports = mongoose.model("YarnStockCardPCS", yarnStockCardPCSSchema);


