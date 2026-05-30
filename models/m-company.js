const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const companySchema = mongoose.Schema({
  companyID: { type: String, required: true, unique: true },
  seasonYear: {type: String},
  cDescription: {type: String},
  cInfo: {
    companyName: {type: String, required: true},
    abbreviation: {type: String},
    pic: {type: String},
    tel: {type: String},
    email: {type: String},
    registDate: {type: Date, required: true},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    },
  },
  deptC: [{   // ## production , store , finance,...
    deptCName: { type: Number }, // ## production , ....
    stateC: [{
      stateCName : {type: String}, // ## scanEmpState , …. / PPI=pay per item,  DP=daily pay  
      stateCInfo : {type: String}, // ## ppi,dp Btn
      factoryIDControl: [{
        factoryID: {type: String},
        btn: {type: Boolean},  // ##  able , disable
        visible: {type: Boolean},  // ##  show, no show
      }],
    }],
  }],
});

companySchema.plugin(uniqueValidator);

module.exports = mongoose.model("Company", companySchema);
