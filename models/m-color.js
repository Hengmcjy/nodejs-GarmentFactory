const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const colorSchema = mongoose.Schema({
  seq: {type: Number},
  color: {
    colorID: {type: String},
    colorName: {type: String},
    colorValue: {type: String},
  }
});

colorSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Color", colorSchema);
