const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const orderSubNodeFlowSetCostSchema = mongoose.Schema({
  companyID: { type: String },
  factoryID : {type: String},
  seasonYear : {type: String},  // ##  
  orderID : {type: String}, 
  datetime : {type: Date},
  facSubNodeCost: [{   // ## 
    targetPlaceID: { type: String },
    countryID : {type: String},
    nodeID : {type: String},
    subNodeID : {type: String},
    cost : {type: mongoose.Types.Decimal128},
  }],
  
});

orderSubNodeFlowSetCostSchema.plugin(uniqueValidator);

module.exports = mongoose.model("OrderSubNodeFlowSetCost", orderSubNodeFlowSetCostSchema);



