const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const mailSignupSchema = mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  email: {type: String},
  createdAt: { type: Date},
  // productCustomerCode: {type: String},
  // companyID: {type: String},
  // imageProfile: {type: String},
  // pdPic: [{type: String}],
  // pdPic: [{   // ## 
  //   albumID : {type: String},
  //   albumName : {type: String},
  //   picName: [{type: String}]
  // }],
  // productsize: [{type: String}],
  // productcolorSet: [{type: String}],

});


mailSignupSchema.plugin(uniqueValidator);

module.exports = mongoose.model("MailSignup", mailSignupSchema);
