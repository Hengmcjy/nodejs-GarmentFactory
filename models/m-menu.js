const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const menuSchema = mongoose.Schema({
  // orderProductionQueueID: { type: String, required: true },  // ## productBarcode+yyyymmddhhmm
  companyID: {type: String},
  menuID: {type: String},
  menuName: {type: String},

});

menuSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Menu", menuSchema);
