const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const repQTYEditSchema = mongoose.Schema({
  companyID: { type: String, required: true },
  orderID: { type: String, required: true}, // ## from orderID
  editType : {type: String},  // ## edit-qty , plan-adjust
  seasonYear : {type: String},  // ## 2025SS
  setName : {type: String},  // ## muji

  dataRQTYE : [{       // ## 
    datetime : {type: Date},
    color : {type: String},  // ##  BL BK  WH ...
    fromNode : {type: String},

    productColor : {type: String},
    productSize : {type: String},
    size : {type: String},
    sizeSeq : {type: Number},
    sumProductQty : {type: Number},
    targetPlaceID : {type: String},
    targetPlaceSeq : {type: Number},

    createBy: {
      userID: {type: String},
      userName: {type: String},
    }
  }],  
});

repQTYEditSchema.plugin(uniqueValidator);

module.exports = mongoose.model("RepQTYEdit", repQTYEditSchema);
