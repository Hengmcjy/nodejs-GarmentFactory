const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const orderSchema = mongoose.Schema({
  orderID: { type: String, required: true },
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
  },
  createBy: {
    userID: {type: String},
    userName: {type: String},
  },
});				

orderSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Order", orderSchema);
