const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// function getCosts(value) {
//   if (typeof value !== 'undefined') {
//      return parseFloat(value.toString());
//   }
//   return value;
// };

const yarnDataDraftSchema = mongoose.Schema({
  draftName: {type: String},
  draftMode: {type: String}, // ## divide , transfer
  datetimeD: {type: Date},
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
  colorS: {
    seq: {type: Number},
    setName: {type: String},
    color: {
      colorID: {type: String},
      colorName: {type: String},
      colorValue: {type: String},
      colorCode: {type: String},
    }
  },
  yarnDataInfo: {
    datetime: {type: Date},
    editDate: {type: Date},
    yarnDataUUID: {type: String},
    yarnColorID: {type: String},
    type: {type: String},

    mode: {type: String},
    fromFactoryID: {type: String},
    toFactoryID: {type: String},

    packageInfo: {
      invoiceID: {type: String},
      yarnLotID: {type: String},
      yarnLotUUID: {type: String},
      state: {type: String},
      yarnBoxInfo: [{
        boxID: {type: String},
        boxUUID: {type: String},
        factoryID: {type: String},
        yarnPlanWeight: {type: mongoose.Types.Decimal128},
        yarnWeight: {type: mongoose.Types.Decimal128},   // ## cannot change value
        useWeight: {type: mongoose.Types.Decimal128},
        weightVerified: {type: Boolean},
        used: {type: Boolean},  // ## y = used / n = not use yet
      }],
    }
  },
});

yarnDataDraftSchema.plugin(uniqueValidator);

module.exports = mongoose.model("YarnDataDraft", yarnDataDraftSchema);


