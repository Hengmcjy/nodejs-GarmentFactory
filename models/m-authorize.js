const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const authorizeSchema = mongoose.Schema({
  companyID: { type: String, required: true },
  aUser : {type: String},  // ## adm , user-node , user-office , 
  aPage : {type: String},  // ## web , nodeWeb
  authorizeL: [{   // ## list
    position : {type: String},  // ##  top , right , ledt , buttom, body
    aGroup : {type: String},  // ## // ## menu ,  companyBody , factoryBody , ….
    authL: [{   // ##
      seq : {type: Number},
      aName : {type: String},
      show: {type: Boolean},
      disable: {type: Boolean},
    }],
  }],
  
});

authorizeSchema.plugin(uniqueValidator);

module.exports = mongoose.model("AuthorizeSchema", authorizeSchema);

			
