const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const subNodeFlowCSchema = mongoose.Schema({
  seq: {type: Number},
  companyID: {type: String},
  nodeID: {type: String},
  subNodeID: {type: String},
  subNodeName: {type: String},
});

subNodeFlowCSchema.plugin(uniqueValidator);

module.exports = mongoose.model("SubNodeFlowC", subNodeFlowCSchema);


