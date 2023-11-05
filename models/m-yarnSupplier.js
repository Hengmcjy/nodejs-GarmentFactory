const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const yarnSupplierSchema = mongoose.Schema({
  companyID: {type: String},
  yarnSupplierID: {type: String},
  yarnSupplierName: {type: String},
  customerID: {type: String},
  show: {type: Boolean},
  note: {type: String},
  status: {type: String},

});

yarnSupplierSchema.plugin(uniqueValidator);

module.exports = mongoose.model("YarnSupplier", yarnSupplierSchema);

