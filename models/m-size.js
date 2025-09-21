const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const sizeSchema = mongoose.Schema({
  seq: {type: Number},
  size: {
    sizeID: {type: String},
    sizeName: {type: String},
  }
});

sizeSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Size", sizeSchema);
