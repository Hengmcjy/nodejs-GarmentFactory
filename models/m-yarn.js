const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const yarnSchema = mongoose.Schema({
  companyID: {type: String},
  seq: {type: Number},
  yarnID: {type: String},
  yarnName: {type: String},
  yarnFullName: {type: String},
  detail: {type: String},

});

yarnSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Yarn", yarnSchema);

