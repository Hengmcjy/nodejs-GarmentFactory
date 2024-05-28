const mongoose = require("mongoose");
// const Double = require("@mongoosejs/double");
const uniqueValidator = require("mongoose-unique-validator");

const orderSchema = mongoose.Schema({
  orderID: { type: String, required: true },
  seasonYear: {type: String},
  ver: {type: Number},  // ## version
  orderDetail: {type: String},
  orderDate: {type: Date, required: true},
  deliveryDate: {type: Date},
  companyID: {type: String},
  factoryID: {type: String},
  bundleNo: {type: Number},
  orderStatus: {type: String},
  customerOR: {
    customerID: {type: String},
    customerName: {type: String},
  },
  orderTargetPlace:[{
    seq: {type: Number},
    deliveryDate: {type: Date},
    targetPlace: {
      targetPlaceID: {type: String},
      targetPlaceName: {type: String},
      countryID : {type: String},
      countryName : {type: String},
    }
  }],
  orderColor:[{
    seq: {type: Number},
    setName: {type: String},
    color: {
      colorID: {type: String},
      colorName: {type: String},
      colorValue: {type: String},
      colorCode: {type: String},
    }
  }],
  productOR: {
    productID: {type: String},
    productName: {type: String},
    productORDetail: {type: String},
    productCustomerCode: {type: String},
    productORInfo: [{   // ## sequence of work flow
      factoryID: {type: String},
      productBarcode : {type: String},
      targetPlace : {
        targetPlaceID : {type: String},
        targetPlaceName : {type: String},
        countryID : {type: String},
        countryName : {type: String},
      },
      productColor : {type: String},
      productSize : {type: String},
      productQty : {type: Number},
      productLossQty : {type: Number},
      productYear : {type: String},
      productSex : {type: String},
    }],
    productORRewriteInfo: [{   // ## rewrite order qty record
      datetime: {type: Date},
      factoryID: {type: String},
      productBarcode : {type: String},
      targetPlace : {
        targetPlaceID : {type: String},
        targetPlaceName : {type: String},
        countryID : {type: String},
        countryName : {type: String},
      },
      productColor : {type: String},
      productSize : {type: String},
      productQtyOld : {type: Number},
      productQty : {type: Number},
      productLossQty : {type: Number},
      productYear : {type: String},
      productSex : {type: String},
      createBy: {
        userID: {type: String},
        userName: {type: String},
        
      },
    }],
    subNodeFlowCost: [{   // ## 
      seq : {type: Number},
      nodeID : {type: String},
      subNodeID : {type: String},
      cost : {type: mongoose.Types.Decimal128},
      subNodeFlowTypeID : {type: String},
    }],
  },
  createBy: {
    userID: {type: String},
    userName: {type: String},
  },
  orderSetting: {
    qtyMaxView: [{
      zcs: {type: String}, // ## colorID ; size ; zone
      maxQty : {type: Number},
    }],
  },

});				

orderSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Order", orderSchema);

						
