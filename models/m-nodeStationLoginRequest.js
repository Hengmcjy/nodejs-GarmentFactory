const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const nodeStationLoginRequestSchema = mongoose.Schema({
  companyID: { type: String, required: true },
  factoryID: { type: String, required: true },
  nodeID: { type: String, required: true },
  stationID: { type: String, required: true },
  uuidUserNodeLoginWaiting: { type: String, required: true },
  userID: [{type: String}],
  userClass: [{type: String}],
  formName: [{type: String}],
  datetime: {type: Date, required: true},
  datetime: {type: Date, required: true},
  createdAt: {type: Date},
});

nodeStationLoginRequestSchema.plugin(uniqueValidator);

module.exports = mongoose.model("NodeStationLoginRequest", nodeStationLoginRequestSchema);


