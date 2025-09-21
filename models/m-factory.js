const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const factorySchema = mongoose.Schema({
  factoryID: { type: String, required: true, unique: true },
  fDescription: {type: String},
  companyID: {type: String},
  show : {type: Boolean},
  fInfo: {
    factoryName: {type: String, required: true},
    factoryName2: {type: String},
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
  nodeStationSetting: {
    scanNode: [{   // ## for special setting for temp time (computer not ready to use in every node department)
      nodeID : {type: String},
      lastNodeID : {type: String},
      active : {type: Boolean},
      nodeIDSetting: [{type: String}],
      stationID : {type: String},
    }],
  },
});

	



factorySchema.plugin(uniqueValidator);

module.exports = mongoose.model("Factory", factorySchema);
