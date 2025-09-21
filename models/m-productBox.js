const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const productBoxSchema = mongoose.Schema({
  seq: {type: Number},
  companyID: {type: String},
  pdBoxID: {type: String},
  pdBoxName: {type: String},
  pdBoxFullName: {type: String},
  dimension: {type: String},
  sizeID: {type: String},
  detail: {type: String},

});

productBoxSchema.plugin(uniqueValidator);

module.exports = mongoose.model("ProductBox", productBoxSchema);

