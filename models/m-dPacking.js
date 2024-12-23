const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const dPackingSchema = mongoose.Schema({
  companyID: {type: String},
  factoryID: [{type: String}],
  seasonYear: {type: String},
  orderID: {type: String},
  customerID: {type: String},
  seq: {type: Number},
  dID: {type: String},
  dCountryID: {type: String},
  dStatus: {type: String},  // ## hide, open , close,  delete
  isLock : {type: Boolean},  // ##  not update info 
  isLockDCarton : {type: Boolean},  // ## not update carton
  dDate : {type: Date},
  productionDate : {type: Date},
  dInfo: {
    packingName: {type: String},
    createDate : {type: Date},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    },
  },
  dCarton: [{   // ## 
    seq: {type: Number},
    dCartonID : {type: String},  // 
    dCartonName : {type: String},
    cartonID : {type: String},  // ##   box size  D55*W28*H25  D37*W37*H20 …
    dStatus : {type: String},   // ## 
    isLock : {type: Boolean},  // ## 
    dOpen : {type: Boolean},  // ## 
    dShow : {type: Boolean},
    lastEdit : {type: Date},
    dBox: [{   // ## 
      productColor : {type: String},  // ## 
      productSize : {type: String},  // ## 
      productQty: {type: Number},
    }],
  }],



});

dPackingSchema.plugin(uniqueValidator);

module.exports = mongoose.model("DPacking", dPackingSchema);


		


