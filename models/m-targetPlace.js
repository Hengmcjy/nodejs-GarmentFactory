const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const targetPlaceSchema = mongoose.Schema({
  seq: {type: Number},
  targetPlace: {
    targetPlaceID: {type: String},
    targetPlaceName: {type: String},
    countryID : {type: String},
    countryName : {type: String},
  }
});

targetPlaceSchema.plugin(uniqueValidator);

module.exports = mongoose.model("TargetPlace", targetPlaceSchema);
