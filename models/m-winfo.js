const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const wInfoSchema = mongoose.Schema({
  companyID: { type: String},
  factoryID: { type: String},
  companyInfo: {
    companyName: { type: String},
    email: { type: String},
    emails: [{ type: String}],
    langs: [{ type: String}],
  },
  
  // outSourceLocationDepartment: [{   // ## for location scan outsource in and out
  //   companyID : {type: String},
  //   factoryID : {type: String},
  //   nodeID : {type: String},
  //   scanOutsource : {type: Boolean}
  // }],
  // outSourceSeasonShow: [{type: String}],
});

wInfoSchema.plugin(uniqueValidator);
module.exports = mongoose.model("WInfo", wInfoSchema);
					
