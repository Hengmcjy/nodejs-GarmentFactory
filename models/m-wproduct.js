const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const wProductSchema = mongoose.Schema({

  companyID: { type: String},
  factoryID: { type: String},
  pType: { type: String},  // ## main , info , production, products
  pCategory: [{   // ## 
    brand: { type: String },
    pCategoryName: { type: String },
    seq: { type: Number },
    pdID: { type: String },
    colorID: { type: String },
    colorName: { type: String },
    imagePath: { type: String }
  }],

});

wProductSchema.plugin(uniqueValidator);
module.exports = mongoose.model("WProduct", wProductSchema);
					
