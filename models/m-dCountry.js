const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const dCountrySchema = mongoose.Schema({
  companyID: {type: String},
  seq: {type: Number},
  dCountryID: {type: String},
  dCountryName: {type: String},
  show: {type: Boolean},


});

dCountrySchema.plugin(uniqueValidator);

module.exports = mongoose.model("DCountry", dCountrySchema);



