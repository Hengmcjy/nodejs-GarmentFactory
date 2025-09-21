const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const yarnColorSchema = mongoose.Schema({
  companyID: {type: String},
  customerID: {type: String},
  yarnColorID: {type: String},
  yarnColorName: {type: String},
  yarnColorValue: {type: String},
  show: {type: Boolean},
  status: {type: String},
  note: {type: String},
});

yarnColorSchema.plugin(uniqueValidator);

module.exports = mongoose.model("YarnColor", yarnColorSchema);

