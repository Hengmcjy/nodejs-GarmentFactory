const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const yarnSeasonSchema = mongoose.Schema({
  companyID: {type: String},
  yarnSeasonID: {type: String},
  yarnSeasonName: {type: String},
  note: {type: String},
  show: {type: Boolean},
  status: {type: String},

});

yarnSeasonSchema.plugin(uniqueValidator);

module.exports = mongoose.model("YarnSeason", yarnSeasonSchema);

