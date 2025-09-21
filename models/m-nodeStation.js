const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const nodeStationSchema = mongoose.Schema({
  companyID: { type: String, required: true },
  factoryID: { type: String, required: true },
  nodeID: { type: String, required: true },
  nodeName: {type: String},
  status: {type: String},
  editDate: {type: Date, required: true},
  nodeInfo: {
    nodeType: {type: String, required: true},
    mustBundleScan: {type: Boolean, required: true},
    haveSubWorkflow: {type: Boolean, required: true},
    scan1ForAll: {type: Boolean},
    location: {type: String},
    nodeDescription: {type: String},
    pic: [{type: String}],
    registDate: {type: Date, required: true},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    },
  },
  userNode: [{
    stationID: {type: String},
    userNodeID: {type: String},
    userNodePass: {type: String},
    uuid: {type: String},
    canScanNode: {type: Boolean},
    canScanSubNode: {type: Boolean},
  }],

  nStation: {
    stationNo: {type: Number},
    loginList: [{
      stationID: {type: String},
      userID: {type: String},
      userName: {type: String},
      datetime: {type: Date},
    }],
  },
  nodeProblem: [{
    problemID: {type: String},
    problemName: {type: String},
    problemDetail: {type: String},
  }],
});

nodeStationSchema.plugin(uniqueValidator);

module.exports = mongoose.model("NodeStation", nodeStationSchema);


