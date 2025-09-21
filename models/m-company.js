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
});

companySchema.plugin(uniqueValidator);

module.exports = mongoose.model("Company", companySchema);
