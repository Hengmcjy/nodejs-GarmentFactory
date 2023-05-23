const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const languageSchema = mongoose.Schema({
  languageID: { type: String, required: true, unique: true },
  languageName : {type: String},
  seq: { type: Number },
  show: { type: Boolean},
  languageData: [{   // ## 
    Idno: { type: Number },
    lType : {type: String},
    lID : {type: String},
    lText : {type: String},
  }],
  
});

languageSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Language", languageSchema);
		