const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const menuAuthorSchema = mongoose.Schema({
  // orderProductionQueueID: { type: String, required: true },  // ## productBarcode+yyyymmddhhmm
  companyID: {type: String},
  groupID: {type: String},
  menuAuthor: [{   // ## 
    menuID : {type: String},
    menuName : {type: String},
    visible : {type: Boolean},
    enable : {type: Boolean},
    state: {type: String},  // ## normal , close , wait …
  }],


});

menuAuthorSchema.plugin(uniqueValidator);

module.exports = mongoose.model("MenuAuthor", menuAuthorSchema);
