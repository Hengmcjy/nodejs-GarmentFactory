const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const subNodeFlowTypeSchema = mongoose.Schema({
  companyID: { type: String, required: true },
  seq: {type: Number},
  subNodeFlowTypeID: { type: String, required: true},
  subNodeFlowTypeName: { type: String, required: true },
});

subNodeFlowTypeSchema.plugin(uniqueValidator);

module.exports = mongoose.model("SubNodeFlowType", subNodeFlowTypeSchema);


	
