const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  qrCode: {type: String},
  type: { type: String, required: true},
  uInfo: {
    userName: {type: String, required: true},
    userPass: {type: String, required: true},
    pic: {type: String},
    tel: {type: String},
    email: {type: String},
    registDate: {type: Date, required: true},
    lastLogin: {type: Date},
    menuAuthor: [{   // ## 
      menuID : {type: String},
      menuName : {type: String},
      visible : {type: Boolean},
      enable : {type: Boolean},
      state: {type: String},  // ## normal , close , wait …
    }],
  },
  uCompany: [{
    companyID : {type: String},
    state: {type: String},
    userComClass: {
      userClassID: {type: String},
      userClassName: {type: String},
      userType: {type: String},
    },
    
  }],
  uFactory: [{
    factoryID : {type: String},
    companyID : {type: String},
    state: {type: String},
    userFacClass: {
      userClassID: {type: String},
      userClassName: {type: String},
      userType: {type: String},
    }
  }],
  status: {type: String, required: true},
  state: {type: String, required: true},
  createdAt: { type: Date},
  createBy: {
    userID: {type: String},
    userName: {type: String},
  },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
