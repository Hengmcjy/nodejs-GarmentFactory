const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const factorySchema = mongoose.Schema({
  factoryID: { type: String, required: true, unique: true },
  fDescription: {type: String},
  companyID: {type: String},
  fInfo: {
    factoryName: {type: String, required: true},
    abbreviation: {type: String},
    pic: {type: String},
    tel: {type: String},
    email: {type: String},
    registDate: {type: Date, required: true},
    isOutsource: {type: Boolean},  // ## true = this factory is outsource
    createBy: {
      userID: {type: String},
      userName: {type: String},
    },
    problem: [{   // ## for return product by what reason
      problemID : {type: String},
      problemName : {type: String},
      problemDetail: {type: String}
    }],

  },
});


factorySchema.plugin(uniqueValidator);

module.exports = mongoose.model("Factory", factorySchema);
