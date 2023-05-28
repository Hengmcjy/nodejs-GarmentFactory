const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const controlAppSchema = mongoose.Schema({
  app: {
    appID: { type: String, required: true},
    companyRunID: { type: Number, required: true},
    factoryRunID: {type: Number, required: true},
    nodeRunID: {type: Number, required: true},
    customerRunID: {type: Number, required: true},
  },
  google: {
    storageAPIPath: { type: String, required: true},
    buckets: [{type: String}],
  },
  clientControl: {
    ioID: { type: String, required: true},
  },
  outSourceLocationDepartment: [{   // ## for location scan outsource in and out
    companyID : {type: String},
    factoryID : {type: String},
    nodeID : {type: String},
    scanOutsource : {type: Boolean}
  }],
});

controlAppSchema.plugin(uniqueValidator);
module.exports = mongoose.model("ControlApp", controlAppSchema);
					
