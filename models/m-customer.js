const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const customerSchema = mongoose.Schema({
  customerID: { type: String, required: true },
  customerName: {type: String},
  setName: {type: String},
  companyID: {type: String},
  registDate: {type: Date, required: true},
  imageProfile: {type: String},
  cusInfo: {
    customerDetail: {type: String, required: true},
    email: {type: String},
    tel: {type: String},
    web: {type: String},
    pic: {type: String},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    },
  },
});	


customerSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Customer", customerSchema);
