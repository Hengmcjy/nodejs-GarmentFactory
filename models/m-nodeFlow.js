const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const nodeFlowSchema = mongoose.Schema({
  nodeFlowID: { type: String, required: true},
  companyID: { type: String, required: true },
  factoryID: { type: String, required: true },
  flowType: {type: String, required: true}, // ## main , sub , subL2 , subL3
  registDate: {type: Date},
  editDate: {type: Date},
  flowCondition: {
    isFlowSequence: {type: Boolean}, // ## force to sequence or not
  },
  flowSeq: [{   // ## sequence of work flow
    seqNo : {type: String},
    nodeID : {type: String},
    canScanSubNode: {type: Boolean},
  }],
  
});

nodeFlowSchema.plugin(uniqueValidator);

module.exports = mongoose.model("NodeFlow", nodeFlowSchema);

			
