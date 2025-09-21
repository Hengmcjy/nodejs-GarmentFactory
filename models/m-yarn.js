const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const yarnSchema = mongoose.Schema({
  companyID: {type: String},
  yarnSupplierID: {type: String},
  customerID: {type: String},
  seq: {type: Number},
  yarnSeasonID: {type: String},
  yarnID: {type: String},
  yarnName: {type: String},
  yarnFullName: {type: String},
  yarnUUID: {type: String},
  detail: {type: String},

});

yarnSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Yarn", yarnSchema);

