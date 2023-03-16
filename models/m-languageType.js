const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const languageTypeSchema = mongoose.Schema({
  lType: { type: String, required: true},
  lTypeName: { type: Number},
});

languageTypeSchema.plugin(uniqueValidator);

module.exports = mongoose.model("LanguageType", languageTypeSchema);

