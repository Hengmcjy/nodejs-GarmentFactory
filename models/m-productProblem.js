const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const productProblemSchema = mongoose.Schema({

  productProblemID: { type: String, required: true},
  productProblemName: { type: String},
});

productProblemSchema.plugin(uniqueValidator);

module.exports = mongoose.model("ProductProblem", productProblemSchema);

