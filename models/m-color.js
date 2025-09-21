const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const colorSchema = mongoose.Schema({
  companyID: {type: String},
  seq: {type: Number},
  setName: {type: String},
  color: {
    colorID: {type: String},
    colorName: {type: String},
    colorValue: {type: String},
    colorCode: {type: String},
  }
});

colorSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Color", colorSchema);
