const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const unitWeightSchema = mongoose.Schema({
  seq: {type: Number},
  companyID: {type: String},
  weightID: {type: String},
  weightFullName: {type: String},
  weightName: {type: String},
  detail: {type: String},

});

unitWeightSchema.plugin(uniqueValidator);

module.exports = mongoose.model("UnitWeight", unitWeightSchema);

