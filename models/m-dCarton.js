const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const dCartonSchema = mongoose.Schema({
  companyID: {type: String},
  seq: {type: Number},
  cartonID: {type: String},
  cartonName: {type: String},
  cSize: {type: String},
  show: {type: Boolean},

});

dCartonSchema.plugin(uniqueValidator);

module.exports = mongoose.model("DCarton", dCartonSchema);


