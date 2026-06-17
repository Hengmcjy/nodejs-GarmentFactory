const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const comSeasonSchema = mongoose.Schema({
  companyID: {type: String},
  seasonYear: {type: String},
  seasonYearName: {type: String},
  note: {type: String},
  show: {type: Boolean},
  status: {type: String},
  orderCount: {type: Number},

});

comSeasonSchema.plugin(uniqueValidator);

module.exports = mongoose.model("ComSeason", comSeasonSchema);

