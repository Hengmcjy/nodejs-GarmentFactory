const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const unitSizeSchema = mongoose.Schema({
  seq: {type: Number},
  companyID: {type: String},
  sizeID: {type: String},
  sizeFullName: {type: String},
  sizeName: {type: String},
  detail: {type: String},

});

unitSizeSchema.plugin(uniqueValidator);

module.exports = mongoose.model("UnitSize", unitSizeSchema);

