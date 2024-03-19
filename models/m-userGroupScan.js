const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userGroupScanSchema = mongoose.Schema({
  factoryID: { type: String},
  companyID: {type: String},
  groupScanID: { type: String},  // ## tailin, taian, sd, boda
  groupScanID2: { type: String},  // ## TL TN SD BD
  detail : {type: String},
  seq: { type: Number},
  open: { type: Boolean},
  userIDGroup : [{type: String}],

});

userGroupScanSchema.plugin(uniqueValidator);

module.exports = mongoose.model("UserGroupScan", userGroupScanSchema);
		