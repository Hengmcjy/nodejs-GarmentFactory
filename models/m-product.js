const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const productSchema = mongoose.Schema({
  productID: { type: String, required: true },
  productName: {type: String},
  productDetail: {type: String},
  productCustomerCode: {type: String},
  productGroupCode: {type: String},
  seasonYear: {type: String},
  companyID: {type: String},
  imageProfile: {type: String},
  pdPic: [{type: String}],
  productFeature: [{
    featureName: {type: String},
    featureDetail: {type: String},
  }],
  // pdPic: [{   // ## 
  //   albumID : {type: String},
  //   albumName : {type: String},
  //   picName: [{type: String}]
  // }],
  // productsize: [{type: String}],
  // productcolorSet: [{type: String}],

});



productSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Product", productSchema);
