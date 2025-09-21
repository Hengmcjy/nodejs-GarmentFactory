const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userClassSchema = mongoose.Schema({
  userClassID: { type: String, required: true},
  userClassName: {type: String, required: true},
  userType: {type: String, required: true},
  seq: {type: Number},
});

userClassSchema.plugin(uniqueValidator);

module.exports = mongoose.model("UserClass", userClassSchema);
