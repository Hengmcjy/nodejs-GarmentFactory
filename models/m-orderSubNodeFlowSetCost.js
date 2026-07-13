const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const orderSubNodeFlowSetCostSchema = mongoose.Schema({
  companyID: { type: String },
  factoryID : {type: String},
  seasonYear : {type: String},  // ##  
  orderID : {type: String}, 
  datetime : {type: Date},
  // ## cost key = (orderID, targetPlaceID, color, subNodeID) · color='' = ใช้ทุกสี (default), color='BD' = override เฉพาะสีนั้น
  facSubNodeCost: [{
    targetPlaceID: { type: String },                 // ASIA / UK / JAPN / SGHI (4 กลุ่ม)
    color:         { type: String, default: '' },    // ''=ทุกสี (default) · ถ้าตั้ง = override สีนั้น
    countryID :    { type: String },                 // legacy — เลิกใช้ (เก็บไว้ backward-compat)
    nodeID :       { type: String },
    subNodeID :    { type: String },
    cost :         { type: mongoose.Types.Decimal128 },
  }],
  
});

orderSubNodeFlowSetCostSchema.plugin(uniqueValidator);

module.exports = mongoose.model("OrderSubNodeFlowSetCost", orderSubNodeFlowSetCostSchema);



