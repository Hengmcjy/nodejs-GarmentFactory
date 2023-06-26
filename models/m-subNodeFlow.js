const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const subNodeFlowSchema = mongoose.Schema({
  seq: {type: Number},
  companyID: {type: String},
  nodeID: {type: String},
  subNodeID: {type: String},
  subNodeName: {type: String},
});

subNodeFlowSchema.plugin(uniqueValidator);

module.exports = mongoose.model("SubNodeFlow", subNodeFlowSchema);


