const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');

const io = require('../../socket');

const ShareFunc = require("../c-api-app-share-function");

const User = require("../../models/m-user");
const Company = require("../../models/m-company");
const Factory = require("../../models/m-factory");
const NodeStation = require("../../models/m-nodeStation");
const NodeFlow = require("../../models/m-nodeFlow");
const NodeStationLoginRequest = require("../../models/m-nodeStationLoginRequest");
const OrderProduction = require("../../models/m-orderProduction");


moment.tz.setDefault('Asia/Bangkok');


exports.asyncForEach= async (array, callback) => {
// async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.asyncForEach2= async (array, callback) => {
// async function asyncForEach2(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.asyncForEach3= async (array, callback) => {
  // async function asyncForEach2(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.asyncForEach4= async (array, callback) => {
  // async function asyncForEach2(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

// #######################################################################################################
// ## general


// // ## get    factories by  companyID
// router.get("/get/factories/by/:companyID", nsController.getNodeDatageneral);
exports.getNodeDatageneral = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  // console.log('getNodeDatageneral', companyID);
  try {
    const factories = await ShareFunc.getFactoryArrByCompanyID(companyID);
    // console.log(factories);

    // await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      // token: token,
      // expiresIn: process.env.expiresIn,
      factories: factories,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errf002', 
        mode:'errGetFactoryInfo', 
        value: "get company info error"
      }
    });
  }

}

// ## general
// #######################################################################################################



// #######################################################################################################
// ## node station

// // ## get node stations
// router.get("/node/lists/:companyID/:factoryID/:status/:page/:limit", checkAuth, checkUUID, nsController.getNodeStations);
exports.getNodeStations = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const status = JSON.parse(req.params.status);
  const page = +req.params.page;
  const limit = +req.params.limit;
  const userID = req.userData.tokenSet.userID;
  // const page = +req.params.page;
  // const limit = +req.params.limit;
  // console.log('getNodeFlows');

  
  try {
    // exports.getNodeStations= async (companyID, factoryID, status, page, limit)
    const nodeStations = await ShareFunc.getNodeStations(companyID, factoryID, status, page, limit);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      nodeStations: nodeStations,
      success: true
      // factory: factory
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns002', 
        mode:'errNodeStationsList', 
        value: "error get node stations list"
      }
    });
  }
}

// // ## get node station1
// router.get("/getnode1/:companyID/:factoryID/:status/:nodeID", checkAuth, checkUUID, nsController.getNodeStations1);
exports.getNodeStations1 = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const status = JSON.parse(req.params.status);
  const nodeID = req.params.nodeID;

  const userID = req.userData.tokenSet.userID;
  // const page = +req.params.page;
  // const limit = +req.params.limit;
  // console.log('getNodeFlows');

  
  try {
    // getNodeStation= async (companyID, factoryID, status, nodeID)
    const nodeStation = await ShareFunc.getNodeStation(companyID, factoryID, status, nodeID);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      nodeStation: nodeStation,
      success: true
      // factory: factory
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns002-1', 
        mode:'errNodeStation1', 
        value: "error get node station 1"
      }
    });
  }
}


// // ## /api/ns/nodeflow/creataenew
// router.post("/nodeflow/createnew", checkAuth, checkUUID, nsController.postNodeFlowCreateNew);
exports.postNodeFlowCreateNew = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    const userID = req.userData.tokenSet.userID;
    // ##  
    const companyID = data.nodeFlow.companyID;
    const factoryID = data.nodeFlow.factoryID;
    const nodeFlowID = data.nodeFlow.nodeFlowID;
    data.nodeFlow.registDate = current;
    data.nodeFlow.editDate = current;
    const page = +data.page;
    const limit = +data.limit;

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    // ## check exist for err
    const existedNodeFlowID = await ShareFunc.checkExistNodeFlowID(companyID, factoryID, nodeFlowID);
    if (!existedNodeFlowID) {
      const nodeStationUpsert = await NodeFlow.updateOne({$and: [
        {"companyID":companyID},
        {"factoryID":factoryID}, 
        {"nodeFlowID":nodeFlowID},
      ]} , 
      {
        "flowType": data.nodeFlow.flowType,
        "registDate": current,
        "flowCondition": data.nodeFlow.flowCondition,
        "flowSeq": data.nodeFlow.flowSeq,
      }, {upsert: true}); 

      // ## get node flow 1 page
      nodeFlows = await ShareFunc.getNodeFlows(companyID, factoryID, page, limit);

    } else {  // ## err --> had nodeID  , existed
      return res.status(422).json({
        message: {
          messageID: 'errns005-1', 
          mode:'errNodeFlowCreateNodeIDExist', 
          value: "error node flow create nodeFlowID existed"
        },
        token: token,
        expiresIn: process.env.expiresIn,
        userID: userID,
        nodeFlows: [],
        success: false
      });
    }

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      nodeFlows: nodeFlows,
      success: true
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns005', 
        mode:'errNodeFlowCreate', 
        value: "error node flow create"
      }
    });
  }
}

// // ## /api/ns/nodeflow/edit
// router.put("/nodeflow/edit", checkAuth, checkUUID, nsController.putNodeFlowEdit);
exports.putNodeFlowEdit = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    const userID = req.userData.tokenSet.userID;
    // ##  
    const companyID = data.nodeFlow.companyID;
    const factoryID = data.nodeFlow.factoryID;
    const nodeFlowID = data.nodeFlow.nodeFlowID;
    const flowType = data.nodeFlow.flowType;
    const isFlowSequence = data.nodeFlow.flowCondition.isFlowSequence;
    const flowSeq = data.nodeFlow.flowSeq;
    data.nodeFlow.editDate = current;

    const editMode = data.editMode;
    const page = +data.page;
    const limit = +data.limit;

    let editnodeFlow;
    // ## check editMode   editMode === 'flowType'  'flowCondition'  'flowSeq'
    if (editMode === 'flowType') {
      // ## edit node flow , flowtype
      editnodeFlow = await ShareFunc.editNodeFlow_FlowType(companyID, factoryID, nodeFlowID, flowType);

    } else if (editMode === 'flowCondition') {
      // ## edit node flow , flowCondition
      editnodeFlow = await ShareFunc.editNodeFlow_FlowCondition(companyID, factoryID, nodeFlowID, isFlowSequence);
    } else if (editMode === 'flowSeq') {
      // ## edit node flow , flowSeq
      editnodeFlow = await ShareFunc.editNodeFlow_FlowSeq(companyID, factoryID, nodeFlowID, flowSeq);
    }
    
    // ## get node flow 1 page
    nodeFlows = await ShareFunc.getNodeFlows(companyID, factoryID, page, limit);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      nodeFlows: nodeFlows,
      success: true
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns005', 
        mode:'errNodeFlowCreate', 
        value: "error node flow create"
      }
    });
  }
}

// // ## get node flow
// router.get("/node/nodeflows/:companyID/:factoryID", nsController.getNodeFlows);
exports.getNodeFlows = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const userID = req.userData.tokenSet.userID;
  const page = +req.params.page;
  const limit = +req.params.limit;
  // console.log('getNodeFlows');

  
  try {
    // ## get node flow 1 page
    const nodeFlows = await ShareFunc.getNodeFlows(companyID, factoryID, page, limit);
    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      nodeFlows: nodeFlows,
      success: true
      // factory: factory
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns001', 
        mode:'errNodeFlowsList', 
        value: "error get node flow list"
      }
    });
  }
}

// router.get("/nodef/nodeflow/:companyID/:factoryID/:nodeFlowID", checkAuth, checkUUID, nsController.getNodeFlow);
exports.getNodeFlow = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const nodeFlowID = req.params.nodeFlowID;
  const userID = req.userData.tokenSet.userID;
  // console.log('getNodeFlows');
  const status = ['a','c'];

  
  try {
    // ## get node flow 1 page
    const nodeFlow = await ShareFunc.getNodeFlow(companyID, factoryID, nodeFlowID);

    // getNodeStations= async (companyID, factoryID, status, page, limit)
    const nodeStations = await ShareFunc.getNodeStations(companyID, factoryID, status, 1, 10000);
    // console.log(nodeStations);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      nodeFlow: nodeFlow,
      nodeStations: nodeStations,
      success: true
      // factory: factory
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns001', 
        mode:'errNodeFlowsList', 
        value: "error get node flow list"
      }
    });
  }
}

// // ## /api/ns/node/creataenew
// router.post("/node/createnew", checkAuth, checkUUID, nsController.postNodeStationCreateNew);
exports.postNodeStationCreateNew = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    // ##  create customer   imageProfile
    const companyID = data.nodeStation.companyID;
    const factoryID = data.nodeStation.factoryID;
    const nodeID = data.nodeStation.nodeID;
    const status = JSON.parse(data.status);
    const page = +data.page;
    const limit = +data.limit;

    const userID = data.nodeStation.nodeInfo.createBy.userID;
    const userName = data.nodeStation.nodeInfo.createBy.userName;
    data.nodeStation.nodeInfo.registDate = current;
    let nodeStations = [];

    // ## temporary nodeProblem
    const nodeProblem = {
      problemID: 'problem 1',
      problemName: 'problem name 1',
      problemDetail: 'detail 1'

    };

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    // ## check exist for err
    const existedNodeID = await ShareFunc.checkExistNodeID(companyID, factoryID, nodeID);
    if (!existedNodeID) {
      const nodeStationUpsert = await NodeStation.updateOne({$and: [
        {"companyID":companyID},
        {"factoryID":factoryID}, 
        {"nodeID":nodeID},
      ]} , 
      {
        "nodeName": "",
        "status": data.nodeStation.status,
        "editDate": current,
        "nodeInfo": data.nodeStation.nodeInfo,
        "userNode": data.nodeStation.userNode,
        "nStation": data.nodeStation.nStation,
        // "nodeProblem": data.nodeStation.nodeProblem,
        "nodeProblem": nodeProblem,
      }, {upsert: true}); 

      // ## get node station 1 page
      nodeStations = await ShareFunc.getNodeStations(companyID, factoryID, status, page, limit);

    } else {  // ## err --> had nodeID  , existed
      return res.status(422).json({
        message: {
          messageID: 'errns003-1', 
          mode:'errNodeStationsCreateNodeIDExist', 
          value: "error node station create nodeID existed"
        },
        token: token,
        expiresIn: process.env.expiresIn,
        userID: data.userID,
        nodeStations: [],
        success: false
      });
    }
    
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      nodeStations: nodeStations,
      success: true
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns003', 
        mode:'errNodeStationsCreate', 
        value: "error node station create"
      }
    });
  }
}

// // ## /api/ns/node/edit
// router.put("/node/edit", checkAuth, checkUUID, nsController.putNodeStationEdit);
exports.putNodeStationEdit = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    // ##  create customer   imageProfile
    const userID = req.userData.tokenSet.userID;
    const companyID = data.nodeStation.companyID;
    const factoryID = data.nodeStation.factoryID;
    const nodeID = data.nodeStation.nodeID;
    const nodeStation = data.nodeStation;

    const status = JSON.parse(data.status);
    const page = +data.page;
    const limit = +data.limit;
    // console.log(nodeStation);
    // ## edit nodestation
    const editNodeStation = await ShareFunc.editNodeStation(companyID, factoryID, nodeID, nodeStation);
   
    // ## get nodestation lists
    // ## get node station 1 page
    const nodeStations = await ShareFunc.getNodeStations(companyID, factoryID, status, page, limit);
    
    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      nodeStations: nodeStations,
      success: true
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns004', 
        mode:'errNodeStationsEdit', 
        value: "error node station edit"
      }
    });
  }
}

// // ## /api/ns/node2/edit/userpass/workstation
// router.put("/node2/edit/userpass/workstation", checkAuth, checkUUID, nsController.putNodeUserPassStationEdit);
exports.putNodeUserPassStationEdit = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    // ##  create customer   imageProfile
    const userID = req.userData.tokenSet.userID;
    const companyID = data.nodeStation.companyID;
    const factoryID = data.nodeStation.factoryID;
    const nodeID = data.nodeStation.nodeID;
    // const nodeStation = data.nodeStation;
    const userNode = data.nodeStation.userNode;
    // const userNodeID = data.nodeStation.userNode.userNodeID;
    // const userNodePass = data.nodeStation.userNode.userNodePass;

    const status = JSON.parse(data.status);

    // ## edit nodestation
    const editNodeStation = await ShareFunc.editUserNodeStation(companyID, factoryID, nodeID, userNode);
   
    // ## get nodestation lists
    // ## get node station 1 
    const nodeStation1 = await ShareFunc.getNodeStation(companyID, factoryID, status, nodeID);
    
    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      nodeStation: nodeStation1,
      success: true
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns006', 
        mode:'errNodeUserPassStationsEdit', 
        value: "error node user pass station edit"
      }
    });
  }
}

// // ## /api/ns/node3/edit/uuid/workstation
// router.put("/node3/edit/uuid/workstation", checkAuth, checkUUID, nsController.putNodeUUIDStationEdit);
exports.putNodeUUIDStationEdit = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    // ##  create customer   imageProfile
    const userID = req.userData.tokenSet.userID;
    const companyID = data.nodeStation.companyID;
    const factoryID = data.nodeStation.factoryID;
    const nodeID = data.nodeStation.nodeID;
    const nodeStation = data.nodeStation;
    const uuid = data.nodeStation.userNode.uuid;

    const status = JSON.parse(data.status);

    // ## edit uuid nodestation   editUserUUIDNodeStation= async (companyID, factoryID, nodeID, uuid)
    const editNodeStation = await ShareFunc.editUserUUIDNodeStation(companyID, factoryID, nodeID, uuid);
   
    // ## get nodestation lists
    // ## get node station 1 
    const nodeStation1 = await ShareFunc.getNodeStation(companyID, factoryID, status, nodeID);
    
    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      nodeStation: nodeStation1,
      success: true
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns007', 
        mode:'errNodeUUIDStationsEdit', 
        value: "error node uuid station edit"
      }
    });
  }
}

// // ## get check node user exist
// router.get("/check/existuserid/:companyID/:factoryID/:nodeID/:checkuserID", checkAuth, checkUUID, userController.getCheckExistNodeCompanyFactoryUserID);
exports.getCheckExistNodeCompanyFactoryUserID = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const nodeID = req.params.nodeID;
  const userID = req.userData.tokenSet.userID;
  const checkUserID = req.params.checkuserID;
  // console.log(companyID, factoryID, nodeID, checkUserID);

  try {
    // exports.checkUserIDExisted= async (userID)
    const isExistedUserNode = await ShareFunc.checkNodeUserIDExisted(companyID, factoryID, nodeID, checkUserID);
    // checkUserIDExisted= async (companyID, factoryID, checkUserID) 
    const isExistedUser = await ShareFunc.checkUserIDExisted(companyID, factoryID, checkUserID);
    const isExist = isExistedUserNode || isExistedUser ? true: false;
    // console.log(isExist);
    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      isExist: isExist,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errns008', 
        mode:'errNodeUserIDStationCheckExist', 
        value: "error node userID check exist"
      }
    });
  }
}


// // ## get node nodeStationLoginRequest
// router.get("/node4/list/usernodelogin", checkAuth, checkUUID, nsController.getNodeStationLoginRequest);
exports.getNodeStationLoginRequest = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getNodeStationLoginRequest');
  const userID = req.userData.tokenSet.userID;

  try {
    // get company array of userID  spu, adm, own, pnr, mng, acc, stf, gst  exports.getUserCompanyLists= async (userClassIDArr)
    const userClassIDArr = ['own', 'pnr', 'mng'];
    // const companyLists = await ShareFunc.getUserCompanyLists(userClassIDArr);
    // let companyIDArr = [];
    // await this.asyncForEach(companyLists, async (item) => {
    //   companyIDArr.push(item.companyID);
    // });

    // // ## get list nodeStationLoginRequest
    // const nodeStationLoginRequests = await ShareFunc.getNodeStationLoginRequests(companyIDArr);

    // exports.getListNodeStationLoginRequests= async (userClassIDArr)  (userID, userClassIDArr)
    const nodeStationLoginRequests = await ShareFunc.getListNodeStationLoginRequests(userID, userClassIDArr);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      nodeStationLoginRequests: nodeStationLoginRequests
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errns009', 
        mode:'errNodeStationLoginRequestList', 
        value: "error node station login request list"
      }
    });
  }
}

// // ## delete  node nodeStationLoginRequest
// router.delete("/node5/del/nodeStationLoginRequest", checkAuth, checkUUID, nsController.delNodeStationLoginRequest);
exports.delNodeStationLoginRequest = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('delNodeStationLoginRequest');
  const data = req.body.nodeStationLoginRequest;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    // ##  create customer   imageProfile
    const userID = req.userData.tokenSet.userID;
    const companyID = data.companyID;
    const factoryID = data.factoryID;
    const nodeID = data.nodeID;
    const stationID = data.stationID;
    const uuidUserNodeLoginWaiting = data.uuidUserNodeLoginWaiting;
    const msgTypeID = data.msgTypeID;
    const action = req.body.action;

    // ## del nodestation
    const delNodeStationLoginRequest = 
          await ShareFunc.delNodeStationLoginRequest(companyID, factoryID, nodeID, stationID, uuidUserNodeLoginWaiting, msgTypeID, action);

    const userClassIDArr = ['own', 'pnr', 'mng'];
    const nodeStationLoginRequests = await ShareFunc.getListNodeStationLoginRequests(userID, userClassIDArr);
    
    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      nodeStationLoginRequests: nodeStationLoginRequests
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns010', 
        mode:'errNodeStationLoginRequestListDel', 
        value: "error node station login request delete"
      }
    });
  }
}

// // ## delete  node nodeStationLoginRequest  no auth
// router.post("/node6/del/noauth/nodeStationLoginRequest", nsController.delNodeStationLoginRequestNoAuth);
exports.delNodeStationLoginRequestNoAuth = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('delNodeStationLoginRequestNoAuth');
  const data = req.body.nodeStationLoginRequest;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    // ##  create customer   imageProfile  
    // const userID = req.userData.tokenSet.userID;
    const companyID = data.companyID;
    const factoryID = data.factoryID;
    const nodeID = data.nodeID;
    const stationID = data.stationID;
    const uuidUserNodeLoginWaiting = data.uuidUserNodeLoginWaiting;
    const msgTypeID = data.msgTypeID;
    const action = req.body.action;

    // ## del nodestation
    const delNodeStationLoginRequest = 
          await ShareFunc.delNodeStationLoginRequest(companyID, factoryID, nodeID, stationID, uuidUserNodeLoginWaiting, msgTypeID, action);

    // const userClassIDArr = ['own', 'pnr', 'mng'];
    // const nodeStationLoginRequests = await ShareFunc.getListNodeStationLoginRequests(userID, userClassIDArr);
    
    // await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: '',
      // expiresIn: process.env.expiresIn,
      // userID: userID,
      // nodeStationLoginRequests: nodeStationLoginRequests
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns010', 
        mode:'errNodeStationLoginRequestListDel', 
        value: "error node station login request delete"
      }
    });
  }
}

// // ## allow  node nodeStationLoginRequest
// router.put("/node6/allow/nodeStationLoginRequest", checkAuth, checkUUID, nsController.putAllowNodeStationLoginRequest);
exports.putAllowNodeStationLoginRequest = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('putAllNodeStationLoginRequest');
  const data = req.body.nodeStationLoginRequest;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    // ##  create customer   imageProfile
    const userID = req.userData.tokenSet.userID;
    const companyID = data.companyID;
    const factoryID = data.factoryID;
    const nodeID = data.nodeID;
    const stationID = data.stationID;
    const userNodeID = data.userNodeID;
    const uuidUserNodeLoginWaiting = data.uuidUserNodeLoginWaiting;
    const msgTypeID = data.msgTypeID;
    const action = req.body.action;

    // ## del nodestation
    const delNodeStationLoginRequest = 
          await ShareFunc.delNodeStationLoginRequest(companyID, factoryID, nodeID, stationID, uuidUserNodeLoginWaiting, msgTypeID, action);

    // exports.editUserUUIDNodeStation= async (companyID, factoryID, nodeID, stationID, uuid)
    const editUserUUIDNodeStation = await ShareFunc.editUserUUIDNodeStation(
                                            companyID, factoryID, nodeID, stationID, uuidUserNodeLoginWaiting);

    const userClassIDArr = ['own', 'pnr', 'mng'];
    const nodeStationLoginRequests = await ShareFunc.getListNodeStationLoginRequests(userID, userClassIDArr);

    const status = ['a'];  // ## only status = 'a'
    let nodeStationF = await ShareFunc.getNodeStation(companyID, factoryID, status, nodeID);
    let nodeStation = {};
    if (nodeStationF.length > 0) {
      nodeStationF[0].userNode ={
        userNodeID: '',
        userNodePass: '',
        uuid: '',
      };
      nodeStation = nodeStationF[0];
    }
    
    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      nodeStationLoginRequests: nodeStationLoginRequests,
      nodeStation: nodeStation
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns011', 
        mode:'errNodeStationLoginRequestListAllow', 
        value: "error node station login request allow"
      }
    });
  }
}

// // ## get node nodeStationLoginRequest
// router.get("/node9/getdata/nodelogin/:companyID/:factoryID/:nodeID/:status", checkAuth, checkUUID, nsController.getDataNodeStationLogin);
exports.getDataNodeStationLogin = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getDataNodeStationLogin');
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const nodeID = req.params.nodeID;
  const status = JSON.parse(req.params.status);
  // console.log(companyID, factoryID, nodeID, status);

  try {
    // ## get company  getCompany1Info= async (companyID)
    const company = await ShareFunc.getCompany1Info(companyID);
    // console.log('-------------------------------company-----------------------------------------------');
    // console.log(company);

    // ## get factory  exports.getFactory1Info= async (companyID, factoryID) 
    const factory = await ShareFunc.getFactory1Info(companyID, factoryID);
    // console.log('-------------------------------factory-----------------------------------------------');
    // console.log(factory);

    // ## get node  exports.getNodeStation= async (companyID, factoryID, status, nodeID)
    // const status = ['a', 'c', 'd'];
    let nodeStationf = await ShareFunc.getNodeStation(companyID, factoryID, status, nodeID);
    nodeStationf[0].userNode = [];
    const nodeStation = nodeStationf[0];

    // getNodeStations= async (companyID, factoryID, status, page, limit) 
    const nodeStations = await ShareFunc.getNodeStations(companyID, factoryID, status, 1, 1000);

    // console.log('-------------------------------nodeStation-----------------------------------------------');
    // console.log(nodeStation);

    // ## get nodeFlows   exports.getNodeFlows= async (companyID, factoryID, page, limit)
    const nodeFlows = await ShareFunc.getNodeFlows(companyID, factoryID, 1, 20);
    // console.log('-------------------------------nodeFlows-----------------------------------------------');
    // console.log(nodeFlows);

    // ## get nodeFlow  exports.getNodeFlow1= async (companyID, factoryID, nodeFlowID)
    const nodeFlowID = 'main';
    const nodeFlow = await ShareFunc.getNodeFlow1(companyID, factoryID, nodeFlowID);
    // console.log('-------------------------------nodeFlow-----------------------------------------------');
    // console.log(nodeFlow);

    // await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      // token: token,
      // expiresIn: process.env.expiresIn,
      // userID: userID,
      company: company,
      factory: factory,
      nodeStation: nodeStation,
      nodeStations: nodeStations,
      nodeFlows: nodeFlows,
      nodeFlow: nodeFlow
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errns013', 
        mode:'errGetNodeStationData', 
        value: "error get data node station"
      }
    });
  }
}

// // ## put log out  node putLogoutNodeStation
// router.put("/node7/logout/nodeStation", checkAuth, checkUUID, nsController.putLogoutNodeStation);
exports.putLogoutNodeStation = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('putLogoutNodeStation');
  const data = req.body;

  try {
    // ##  create customer   imageProfile
    const companyID = data.companyID;
    const factoryID = data.factoryID;
    const nodeID = data.nodeID;

    // exports.editUserUUIDNodeStation= async (companyID, factoryID, nodeID, uuid) 
    const editUserUUIDNodeStation = await ShareFunc.editUserUUIDNodeStation(companyID, factoryID, nodeID, '');

    res.status(200).json({
      tokenNS: '',
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errerr', 
        mode:'errorerror', 
        value: "error error"
      }
    });
  }
}

// // ## login  node nodeStation by uuid
// router.post("/node8/del/nodeStationLoginByUUID", nsController.postLoginNodeStationByUUID);
exports.postLoginNodeStationByUUID = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('');
  const data = req.body;
  const uuid = data.uuid;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    let canLogin = false;
    const statusArr = ['a'];
    const nodestationf = await ShareFunc.getNodeStationByUUID(uuid, statusArr);
    // console.log(nodestationf);
    const nodeStation = nodestationf?nodestationf.nodeStation:null;
    // console.log(nodeStation);
    if (!nodeStation) {
      return res.status(501).json({
        message: {
          messageID: 'errns016-1', 
          mode:'errUUIDLoginByUUIDNoExist', 
          value: "error uuid login UUID no exist"
        },
        success: false
      });

    } else {
      const stationID = nodestationf.stationID?nodestationf.stationID:'';
      if (nodeStation.nodeID) {  // ## check exist
        canLogin = true;
      }
      
      // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
      res.status(200).json({
        tokenNS: 'xx',
        // expiresIn: process.env.expiresIn,
        nodeStation: nodeStation,
        stationID: stationID,
        canLogin: canLogin,
        success: true
      });
    }

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns016', 
        mode:'errUUIDLogin', 
        value: "error uuid login"
      },
      success: false
    });

  }
}


// ## node station
// #############################################################



// #######################################################################################################
// ## staff/worker factory login to node workstation

// // ## staff login to node workstation staffNodeLogin
// router.post("/nodestation/staff/login", nsController.staffNodeLogin);
exports.staffNodeLogin = async (req, res, next) => {
  const data = req.body;
  // console.log(data);
  const userID = data.userID;
  const userPass = data.userPass;
  const companyID = data.companyID;
  const factoryID = data.factoryID;

  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    // ## get user
    // let userf = await User.findOne({ userID: userID });
    const statusArr = ['a'];
    const state = 'joined';
    const userfS = await ShareFunc.staffLogin(userID, userPass, companyID, factoryID, statusArr, state);
    // console.log(userfS);
    if (!userfS) {
      return res.status(401).json({
        message: {
          messageID: 'erru003-1', 
          mode:'errStaffLoginPass', 
          value: "Auth failed,  staff password incorrect"
        },
        success: false
      });
    } 

    let userf = await User.findOne({ userID: userID });
    // console.log(userf);
    const doMatch = await bcrypt.compare(userPass, userf.uInfo.userPass);
    // console.log('doMatch');
    if (!doMatch) { 
      return res.status(401).json({
        message: {
          messageID: 'erru003-1', 
          mode:'errStaffLoginPass', 
          value: "Auth failed,  staff password incorrect"
        },
        success: false
      });
    }

    // console.log('userf');
    // ## update user last login
    const userLastLogin = await User.updateOne({userID: userID} , {"uInfo.lastLogin": current});
    
    userf.uInfo.userPass = '';  // ## clear user password before send data to web

    await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      tokenNS: '',
      expiresIn: process.env.expiresIn,
      userID: userID,
      user: userf,
      success: true
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'erru003-1', 
        mode:'errStaffLoginPass', 
        value: "Auth failed,  staff password incorrect"
      },
      success: false
    });
  }
}

// ## get scan order production for send product to next department putScanOrderProductionBarcodeNo
// ## for check productBarcodeNo can scan this nodeID
// router.put("/scanroderProduction/productBarcodeNo", nsController.putScanOrderProductionBarcodeNo);
exports.putScanOrderProductionBarcodeNo = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = data.userID;
  // console.log('putScanOrderProductionBarcodeNo');
  // console.log(data);

  const productBarcodeNo = data.productBarcodeNo;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const nodeID = data.nodeID;
  const stationID = data.stationID;
  const mode = data.mode;
  // console.log(mode , productBarcodeNo);
  
  // console.log(nodeID , productBarcodeNo, mode);
  try {
    await ShareFunc.upsertUserSession1hr(userID);

    // ##  get data productBarcodeNo
    const orderProduction = await ShareFunc.getOrderProduct1(companyID, factoryID, productBarcodeNo);
    // console.log(orderProduction);
    if (!orderProduction) {
      return res.status(501).json({
        message: {
          messageID: 'errns012', 
          mode:'errWorkerScanOrderProduction', 
          value: "error worker scan order production"
        },
        success: false
      });
    } else {
      if (orderProduction.productionNode.length === 0) {
        return res.status(501).json({
          message: {
            messageID: 'errns012', 
            mode:'errWorkerScanOrderProduction', 
            value: "error worker scan order production"
          },
          success: false
        });
      } else {  // orderProduction.productionNode.length === 1
        // console.log(nodeID ,'--' , orderProduction.productionNode[0]);
        if (orderProduction.productionNode[0].fromNode === nodeID && mode === 'backfromrepair') { // ## back from repaired
        // if (orderProduction.productionNode[orderProduction.productionNode.length-1].fromNode === nodeID) { // ## back from repaired
          // console.log(nodeID ,'--' , orderProduction.productionNode[0].fromNode);
          return res.status(200).json({
            tokenNS: '',
            expiresIn: process.env.expiresIn,
            userID: userID,
            companyID: companyID,
            factoryID: factoryID,
            nodeID: nodeID,
            stationID: stationID,
            orderProduction: orderProduction,
            success: true,
            mode: 'backfromrepair'
          });

        } else if (orderProduction.productionNode[0].toNode === nodeID && mode === 'sendtorepair') {  // ## send to repair
        // } else if (orderProduction.productionNode[orderProduction.productionNode.length-1].toNode === nodeID) {  // ## send to repair
          // ## orderProduction.productionNode[0].toNode === nodeID
          // console.log(nodeID ,'--' , orderProduction.productionNode[0].toNode);
          return res.status(200).json({
            tokenNS: '',
            expiresIn: process.env.expiresIn,
            userID: userID,
            companyID: companyID,
            factoryID: factoryID,
            nodeID: nodeID,
            stationID: stationID,
            orderProduction: orderProduction,
            success: true,
            mode: 'sendtorepair'
          });
        } else if (orderProduction.productionNode[0].toNode === nodeID && mode === 'scan') {
          return res.status(200).json({
            tokenNS: '',
            expiresIn: process.env.expiresIn,
            userID: userID,
            companyID: companyID,
            factoryID: factoryID,
            nodeID: nodeID,
            stationID: stationID,
            orderProduction: orderProduction,
            success: true,
            mode: 'scan'
          });
        } else {
          
          // ## check last node = nodeID  , current nodeID
          return res.status(501).json({
            message: {
              messageID: 'errns012-1',
              mode:'errWorkerScanOrderProductionNodeIDCurrent', 
              value: "error worker scan order production for nodeID not current"
            },
            success: false
          });
        }
      }
    } 
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns012', 
        mode:'errWorkerScanOrderProduction', 
        value: "error worker scan order production"
      },
      success: false
    });
  }
}

// // ## edit order production  send product to next department 
// router.put("/node11/edit/oderProduction/nextnode", nsController.putOrderProductionNextNodeID);
exports.putOrderProductionNextNodeID = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = data.userID;
  // console.log('putOrderProductionNextNodeID');
  // console.log(data);
  const productBarcodeNos = data.productBarcodeNos;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const orderID = data.orderID;
  const productID = data.productID;
  let productionNode = data.productionNode;
  const washingAndPressingMerge = data.washingAndPressingMerge;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  productionNode.datetime = current;
  try {
    await ShareFunc.upsertUserSession1hr(userID);

    if (productionNode.toNode === 'completeNode') {
      productionNode.status = 'complete';
      result2 = await OrderProduction.updateMany(
        {$and: [
          {"companyID":companyID},
          {"factoryID":factoryID},
          {"orderID":orderID},
          {"productID":productID},
          {"productBarcodeNo":{$in: productBarcodeNos}}
        ]}, 
        {
          // {$push: {productionNode: {$each:[productionNode],  $position: 0}}},  // ## add new element at the first
          $push: {productionNode: productionNode},
          "productStatus": 'complete'
        },
        );


    // ## this for a moment for cross some department "6.pressing"
    } else if (productionNode.toNode === '6.PRESSING' && washingAndPressingMerge) {
      result1 = await OrderProduction.updateMany(
        {$and: [
          {"companyID":companyID},
          {"factoryID":factoryID},
          {"orderID":orderID},
          {"productID":productID},
          {"productBarcodeNo":{$in: productBarcodeNos}}
        ]}, 
        // {$push: {productionNode: {$each:[productionNode],  $position: 0}}},  // ## add new element at the first
        {
          $push: {productionNode: productionNode}
        },
      );
      productionNode.fromNode = '6.PRESSING';
      productionNode.toNode = '7.QC';
      result2 = await OrderProduction.updateMany(
        {$and: [
          {"companyID":companyID},
          {"factoryID":factoryID},
          {"orderID":orderID},
          {"productID":productID},
          {"productBarcodeNo":{$in: productBarcodeNos}}
        ]}, 
        // {$push: {productionNode: {$each:[productionNode],  $position: 0}}},  // ## add new element at the first
        {
          $push: {productionNode: productionNode}
        },
      );

    } else {
      // ##  edit next node productionNode
      result1 = await OrderProduction.updateMany(
        {$and: [
          {"companyID":companyID},
          {"factoryID":factoryID},
          {"orderID":orderID},
          {"productID":productID},
          {"productBarcodeNo":{$in: productBarcodeNos}}
        ]}, 
        // {$push: {productionNode: {$each:[productionNode],  $position: 0}}},  // ## add new element at the first
        {
          $push: {productionNode: productionNode}
        },
      );
    }
    return res.status(200).json({
      tokenNS: '',
      expiresIn: process.env.expiresIn,
      success: true,
      productBarcodeNos: productBarcodeNos
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns017', 
        mode:'errEditNextNode', 
        value: "err edit next node"
      },
      success: false
    });
  }
}

// // ## edit order production  set product back from repaired
// router.put("/node16r/edit/oderProduction/repaired", nsController.putOrderProductionRepaired);
exports.putOrderProductionRepaired = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = data.userID;
  // console.log('putOrderProductionProblem');
  // console.log(data);
  const productBarcodeNo = data.productBarcodeNo;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const orderID = data.orderID;
  const productID = data.productID;
  const nodeID = data.nodeID;
  const bundleID = data.bundleID;
  const createBy = data.createBy;
  let productionNode = data.productionNode;
  
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  productionNode.datetime = current;

  const productStatusArr = JSON.parse(data.productStatusArr);
  const page = +data.page;
  const limit = +data.limit;
  try {
    await ShareFunc.upsertUserSession1hr(userID);

    // console.log(companyID, factoryID, productBarcodeNo);
    // const uuid = uuidv4();
    const orderProduction = await ShareFunc.getOrderProduct1(companyID, factoryID, productBarcodeNo);
    // console.log(orderProduction);
    if (!orderProduction || orderProduction.productionNode.length === 0) {
      return res.status(501).json({
        message: {
          messageID: 'errns021', 
          mode:'errEditProductRepaired', 
          value: "error edit product repaired"
        },
        success: false
      });
    } else if (orderProduction && orderProduction.productionNode.length > 0) {
      // console.log(orderProduction.productionNode[0].fromNode , nodeID);
      if (orderProduction.productionNode[0].fromNode !== nodeID) {
        return res.status(501).json({
          message: {
            messageID: 'errns021', 
            mode:'errEditProductRepaired', 
            value: "error edit product repaired"
          },
          success: false
        });
      } else {
        // console.log(orderProduction);
        const status = 'repaired';
        const toNode = orderProduction.productionNode[0].fromNode;
        const fromNode = orderProduction.productionNode[0].toNode;
        const productionNode = {
          fromNode: fromNode,
          toNode: toNode,
          datetime: current,
          status: status,
          problemID: '',
          problemName: '',
          createBy: createBy,
        };
        // console.log(productionNode);
        // ## update repaired
        result1 = await OrderProduction.updateMany(
          {$and: [
            {"companyID":companyID},
            {"factoryID":factoryID},
            {"orderID":orderID},
            {"productID":productID},
            {"productBarcodeNo":productBarcodeNo},
            // {"productBarcodeNo":{$in: productBarcodeNos}}
          ]}, 
          {
            $push: {productionNode: productionNode},
            "productStatus": status,
          });  
      }    
    }
    const currentProductAllDetailCFN = 
          await ShareFunc.getCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr, page, limit);
    //
    return res.status(200).json({
      tokenNS: '',
      expiresIn: process.env.expiresIn,
      success: true,
      currentProductAllDetailCFN: currentProductAllDetailCFN
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns021', 
        mode:'errEditProductRepaired', 
        value: "error edit product repaired"
      },
      success: false
    });
  }
}


// // ## edit order production  set product problem
// router.put("/node12/edit/oderProduction/problem", nsController.putOrderProductionProblem);
exports.putOrderProductionProblem = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = data.userID;
  // console.log('putOrderProductionProblem');
  // console.log(data);
  const productBarcodeNo = data.productBarcodeNo;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const orderID = data.orderID;
  const productID = data.productID;
  const nodeID = data.nodeID;
  const bundleID = data.bundleID;
  let productionNode = data.productionNode;
  
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  productionNode.datetime = current;

  const productStatusArr = JSON.parse(data.productStatusArr);
  const page = +data.page;
  const limit = +data.limit;
  try {
    await ShareFunc.upsertUserSession1hr(userID);

    const uuid = uuidv4();
    // const orderProduction = await ShareFunc.getOrderProduct1(companyID, factoryID, productBarcodeNo);
    // if (!orderProduction || orderProduction.productionNode.length === 0) {
    //   return res.status(501).json({
    //     message: {
    //       messageID: 'errns012', 
    //       mode:'errWorkerScanOrderProduction', 
    //       value: "error worker scan order production"
    //     },
    //     success: false
    //   });
    // } else {
    //   if (orderProduction.productCount > 1) {
    //     // ## update bundle productCount by bundleID
    //     result2 = await OrderProduction.updateMany(
    //       {$and: [
    //         {"companyID":companyID},
    //         {"factoryID":factoryID},
    //         {"orderID":orderID},
    //         {"productID":productID},
    //         {"bundleID":bundleID},
    //         // {"productBarcodeNo":{$in: productBarcodeNos}}
    //       ]}, 
    //       {
    //         $inc: {productCount: -1}
    //       });
    //   }
    // }

    result2 = await OrderProduction.updateMany(
      {$and: [
        {"companyID":companyID},
        {"factoryID":factoryID},
        {"orderID":orderID},
        {"productID":productID},
        {"bundleID":bundleID},
        // {"productBarcodeNo":{$in: productBarcodeNos}}
      ]}, 
      {
        $inc: {productCount: -1}
      });

    productionNode.status = 'problem';
    result1 = await OrderProduction.updateOne(
      {$and: [
        {"companyID":companyID},
        {"factoryID":factoryID},
        {"orderID":orderID},
        {"productID":productID},
        {"productBarcodeNo":productBarcodeNo},
        // {"productBarcodeNo":{$in: productBarcodeNos}}
      ]}, 
      {
        // {$push: {productionNode: {$each:[productionNode],  $position: 0}}},  // ## add new element at the first
        $push: {productionNode: productionNode},
        // $inc: {productCount: -1},
        "productCount": 1,
        "productStatus": 'problem',
        "bundleID": uuid
      });

      

    const currentProductAllDetailCFN = 
          await ShareFunc.getCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr, page, limit);
  
    return res.status(200).json({
      tokenNS: '',
      expiresIn: process.env.expiresIn,
      success: true,
      currentProductAllDetailCFN: currentProductAllDetailCFN
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns018', 
        mode:'errEditProductProblem', 
        value: "error edit product problem"
      },
      success: false
    });
  }
}

// // ## get product problem
// router.get("/node14/orderProduction/problem/:companyID/:factoryID/:nodeID/:productStatus/:page/:limit", 
// nsController.getProblemProductCFN);
exports.getProblemProductCFN = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getProblemProductCFN');
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const nodeID = req.params.nodeID;
  const page = +req.params.page;
  const limit = +req.params.limit;  // ## records we need to get
  const productStatusArr = JSON.parse(req.params.productStatus);

  // console.log(nodeID);
  try {
    // ## getCFNCurrentProductAllDetailToNodePL = async (companyID, factoryID, nodeID, productStatusArr, page, limit) 
    // ## getCFNCurrentProductAllDetailPL = async       (companyID, factoryID, nodeID, productStatusArr, page, limit)
    // getCFNCurrentProductAllDetailPL    getCFNCurrentProductAllDetailToNodePL
    const currentProductAllDetailCFN = 
      await ShareFunc.getCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr, page, limit);
    //
    
    const productionProblemCount = await ShareFunc.getCFNCurrentProductAllProblemCount(companyID, factoryID, nodeID, productStatusArr);

    // await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      // token: token,
      // expiresIn: process.env.expiresIn,
      // userID: userID,
      currentProductAllDetailCFN: currentProductAllDetailCFN,
      productionCount: productionProblemCount,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errns019', 
        mode:'errGetProductProblem', 
        value: "error get product problem"
      }
    });
  }
}

// // ## get product repair
// router.get("/node15/orderProduction/repair/:companyID/:factoryID/:nodeID/:productStatus/:page/:limit", 
// nsController.getRepairProductCFN);
exports.getRepairProductCFN = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getRepairProductCFN');
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const nodeID = req.params.nodeID;
  const page = +req.params.page;
  const limit = +req.params.limit;  // ## records we need to get
  const productStatusArr = JSON.parse(req.params.productStatus);

  // console.log(nodeID);
  try {
    // ## getCFNCurrentProductAllDetailToNodePL = async (companyID, factoryID, nodeID, productStatusArr, page, limit) 
    // ## getCFNCurrentProductAllDetailPL = async       (companyID, factoryID, nodeID, productStatusArr, page, limit)
    // getCFNCurrentProductAllDetailPL    getCFNCurrentProductAllDetailToNodePL
    const currentProductAllDetailCFN = 
      await ShareFunc.getCFNCurrentProductAllDetailToNodePL(companyID, factoryID, nodeID, productStatusArr, page, limit);
    //
    const productionRepairCount = await ShareFunc.getCFNCurrentProductAllRepairCount(companyID, factoryID, nodeID, productStatusArr);

    // await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      // token: token,
      // expiresIn: process.env.expiresIn,
      // userID: userID,
      currentProductAllDetailCFN: currentProductAllDetailCFN,
      productionCount: productionRepairCount,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errns020', 
        mode:'errGetProductRepair', 
        value: "error get product repair"
      }
    });
  }
}

// router.get("/node16/orderProduction/qrcodelist/:companyID/:factoryID/:nodeID/:style/:productStatus/:page/:limit", 
// nsController.getQRCodeListProductStyleCFN);
exports.getQRCodeListProductStyleCFN = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getRepairProductCFN');
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const nodeID = req.params.nodeID;
  const style = req.params.style;
  const page = +req.params.page;
  const limit = +req.params.limit;  // ## records we need to get
  const productStatusArr = JSON.parse(req.params.productStatus);

  // console.log(nodeID);
  try {


    const currentProductStyleQRCodeCFN = 
      await ShareFunc.getCFNCurrentProductStyleQRCode(companyID, factoryID, nodeID, style, productStatusArr, page, limit);
    //
    const currentProductStyleCount = await ShareFunc.getCFNCurrentProductStyleCount(companyID, factoryID, nodeID, style, productStatusArr);

    // await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      // token: token,
      // expiresIn: process.env.expiresIn,
      // userID: userID,
      currentProductStyleQRCodeCFN: currentProductStyleQRCodeCFN,
      currentProductStyleCount: currentProductStyleCount,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errns020', 
        mode:'errGetProductRepair', 
        value: "error get product repair"
      }
    });
  }
}

// router.get("/node17/orderProductionZoneSizeColor/qrcodelist/:companyID/:factoryID/:nodeID/:style/:zone/:size/:color/:productStatus/:page/:limit", 
// nsController.getQRCodeListProductStyleZoneSizeColorCFN);
exports.getQRCodeListProductStyleZoneSizeColorCFN = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getRepairProductCFN');
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const nodeID = req.params.nodeID;
  const style = req.params.style;
  const zone = req.params.zone;
  const size = req.params.size;
  const color = req.params.color;
  const page = +req.params.page;
  const limit = +req.params.limit;  // ## records we need to get
  const productStatusArr = JSON.parse(req.params.productStatus);

  // console.log(style, zone, size, color);
  try {


    const currentProductStyleQRCodeCFN = 
      await ShareFunc.getCFNCurrentProductStyleZoneSizeColorQRCode(companyID, factoryID, nodeID, style, zone, size, color, productStatusArr, page, limit);
    //
    const currentProductStyleCount = 
      await ShareFunc.getCFNCurrentProductStyleZoneSizeColorCount(companyID, factoryID, nodeID, style, zone, size, color, productStatusArr);

    // await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      // token: token,
      // expiresIn: process.env.expiresIn,
      // userID: userID,
      currentProductStyleQRCodeCFN: currentProductStyleQRCodeCFN,
      currentProductStyleCount: currentProductStyleCount,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errns020', 
        mode:'errGetProductRepair', 
        value: "error get product repair"
      }
    });
  }
}

// // ## get scan order production for send product to next department putScanNextDepCompleteOrderProductionBarcodeNo
// router.put("/nextdep/scanroderProduction/productBarcodeNo", nsController.putScanNextDepCompleteOrderProductionBarcodeNo);
exports.putScanNextDepCompleteOrderProductionBarcodeNo = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = data.createBy.userID;
  const createBy = data.createBy
  const tempID = data.tempID;
  // console.log('putScanOrderProductionBarcodeNo');
  // console.log(data);

  // const productBarcodeNo = data.productBarcodeNo;
  let orderProductionScan = data.orderProductionScan;
  const companyID = orderProductionScan.companyID;
  const factoryID = orderProductionScan.factoryID;
  const productID = orderProductionScan.productID;
  const orderID = orderProductionScan.orderID;
  const nodeID = orderProductionScan.nodeID;
  const nodeIDNext = orderProductionScan.nodeIDNext;
  const stationID = orderProductionScan.stationID;
  const bundleNo = orderProductionScan.bundleNo;
  
  // const bundleCount = data.bundleCount;
  
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  
  try {
    await ShareFunc.upsertUserSession1hr(userID);

    // ## check all scanItem , nodeID all on current nodeID
    // ## serverCheckState -->  ok, err
    let allServerCheckState = 'ok';
    await this.asyncForEach(orderProductionScan.scanItem, async (item1) => {
      const orderProduction = await ShareFunc.getOrderProductByOrderID1(companyID, factoryID, orderID, productID, item1.productBarcodeNo);
      if (nodeID === orderProduction.productionNode[0].toNode) {
        item1.serverCheckState = 'ok';
      } else {
        item1.serverCheckState = 'err';
        allServerCheckState = 'err';
      }
    });
    // console.log(orderProductionScan.scanItem);

    if (allServerCheckState === 'err') {
      return res.status(501).json({
        message: {
          messageID: 'errns014', 
          mode:'errWorkerScanConfirmNextOrderProduction', 
          value: "error worker scan confirm next order production"
        },
        success: false
      });
    } else {
      await this.asyncForEach(orderProductionScan.scanItem, async (item1) => {
        const productionNode = {
          fromNode: nodeID,
          toNode: nodeIDNext,
          datetime: current,
          createBy: createBy,
        };
        const result1 = await OrderProduction.updateOne(
          {$and: [
            {"companyID":companyID},
            {"factoryID":factoryID},
            {"orderID":orderID},
            {"productID":productID},
            {"productBarcodeNo":item1.productBarcodeNo},
            {"bundleNo":bundleNo},
          ]},
          {$push: {productionNode: productionNode}});
      });
    }
    
    return res.status(200).json({
      tokenNS: '',
      expiresIn: process.env.expiresIn,
      userID: userID,
      companyID: companyID,
      factoryID: factoryID,
      nodeID: nodeID,
      stationID: stationID,
      tempID: tempID,
      orderProductionScan: orderProductionScan,
      success: true
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns014', 
        mode:'errWorkerScanConfirmNextOrderProduction', 
        value: "error worker scan confirm next order production"
      },
      success: false
    });
  }
}

// ## get node product record productBarcodeNo  getDatarecordProductBarcodeNo
// router.get("/node10/record/productBarcodeNo/:companyID/:factoryID/:productBarcodeNo", nsController.getDatarecordProductBarcodeNo);
exports.getDatarecordProductBarcodeNo = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getDataNodeStationLogin');
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const productBarcodeNo = req.params.productBarcodeNo;

  try {
    // ## get getOrderProduct01= async (companyID, factoryID, productBarcodeNo)
    const orderProduct = await ShareFunc.getOrderProduct01(companyID, factoryID, productBarcodeNo);

    // await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      // token: token,
      // expiresIn: process.env.expiresIn,
      // userID: userID,
      orderProduct: orderProduct,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errns015', 
        mode:'errGetNodeProductionRecord', 
        value: "error node production record"
      }
    });
  }
}

// ## outsource  /////////////////////////////////////////////////////

// // ## get scan order production for receive from outsource putScanOrderProductionBarcodeNoReceiveOutsource
// router.put("/outsource1/receive/scanroderProduction/productBarcodeNo", nsController.putScanOrderProductionBarcodeNoReceiveOutsource);
exports.putScanOrderProductionBarcodeNoReceiveOutsource = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = data.userID;
  // console.log('putScanOrderProductionBarcodeNo');
  // console.log(data);

  const productBarcodeNo = data.productBarcodeNo;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const nodeID = data.nodeID;
  const stationID = data.stationID;
  const mode = data.mode;
  // console.log(mode , productBarcodeNo);
  
  // console.log(nodeID , productBarcodeNo, mode);
  try {
    await ShareFunc.upsertUserSession1hr(userID);

    // ##  get data productBarcodeNo  getOrderProductReceiveOutsource= async (companyID, productBarcodeNo)
    const orderProduction = await ShareFunc.getOrderProductReceiveOutsource(companyID, productBarcodeNo);
    // console.log(orderProduction);
    if (!orderProduction) {
      return res.status(501).json({
        message: {
          messageID: 'errns022', 
          mode:'errWorkerScanOrderProductionReceiveOutsource', 
          value: "error worker scan order production rceive outsource"
        },
        success: false
      });

    } else {
      if (orderProduction.productionNode.length === 0) {
        return res.status(501).json({
          message: {
            messageID: 'errns022', 
            mode:'errWorkerScanOrderProductionReceiveOutsource', 
            value: "error worker scan order production rceive outsource"
          },
          success: false
        });
      } else {  // orderProduction.productionNode.length === 1
        // console.log(nodeID ,'--' , orderProduction.productionNode[0]);
        if (!orderProduction.productionNode[orderProduction.productionNode.length - 1].isOutsource) {
          return res.status(501).json({
            message: {
              messageID: 'errns022-1', 
              mode:'errWorkerScanOrderProductionReceiveOutsource_notIsOutsource', 
              value: "error worker scan order production rceive outsource = 'this is not outsource product'"
            },
            success: false
          });
        } else if (orderProduction.productionNode[orderProduction.productionNode.length - 1].isOutsource &&
                  orderProduction.productionNode[orderProduction.productionNode.length - 1].toNode === 'outsource') { // product is outsource product 
          return res.status(200).json({
            tokenNS: '',
            expiresIn: process.env.expiresIn,
            userID: userID,
            companyID: companyID,
            factoryID: factoryID,
            nodeID: nodeID,
            stationID: stationID,
            orderProduction: orderProduction,
            success: true,
            mode: mode
          });
        } else {
          return res.status(501).json({
            message: {
              messageID: 'errns022-1', 
              mode:'errWorkerScanOrderProductionReceiveOutsource_notIsOutsource', 
              value: "error worker scan order production rceive outsource = 'this is not outsource product'"
            },
            success: false
          });
        }
      }
    } 
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns022', 
        mode:'errWorkerScanOrderProductionReceiveOutsource', 
        value: "error worker scan order production rceive outsource"
      },
      success: false
    });
  }
}

exports.putScanOrderProductionBarcodeNoReceiveOutsourceSendOut = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = data.userID;
  // console.log('putScanOrderProductionBarcodeNo');
  // console.log(data);

  const productBarcodeNo = data.productBarcodeNo;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const nodeID = data.nodeID;
  const stationID = data.stationID;
  const mode = data.mode;
  const toNode = data.toNode;
  // console.log(mode , productBarcodeNo);
  
  // console.log(nodeID , productBarcodeNo, mode);
  try {
    await ShareFunc.upsertUserSession1hr(userID);

    // ##  get data productBarcodeNo  getOrderProductReceiveOutsource= async (companyID, productBarcodeNo)
    const orderProduction = await ShareFunc.getOrderProductReceiveOutsource(companyID, productBarcodeNo);
    // console.log(orderProduction);
    if (!orderProduction) {
      return res.status(501).json({
        message: {
          messageID: 'errns022', 
          mode:'errWorkerScanOrderProductionReceiveOutsource', 
          value: "error worker scan order production rceive outsource"
        },
        success: false
      });

    } else {
      if (orderProduction.productionNode.length === 0) {
        return res.status(501).json({
          message: {
            messageID: 'errns022', 
            mode:'errWorkerScanOrderProductionReceiveOutsource', 
            value: "error worker scan order production rceive outsource"
          },
          success: false
        });
      } else {  // orderProduction.productionNode.length === 1
        // console.log(nodeID ,'--' , orderProduction.productionNode[0]);
        if (orderProduction.productionNode[orderProduction.productionNode.length - 1].toNode !== toNode) {
          return res.status(501).json({
            message: {
              messageID: 'errns022-2', 
              mode:'errWorkerScanOrderProductionReceiveOutsource_notNodeIDSame', 
              value: "error worker scan order production rceive outsource = this is not same for nodeID"
            },
            success: false
          });		

        } else if (orderProduction.productionNode[orderProduction.productionNode.length - 1].toNode === toNode) { // product is outsource product 
          return res.status(200).json({
            tokenNS: '',
            expiresIn: process.env.expiresIn,
            userID: userID,
            companyID: companyID,
            factoryID: factoryID,
            nodeID: nodeID,
            stationID: stationID,
            orderProduction: orderProduction,
            success: true,
            mode: mode
          });
        } else {
          return res.status(501).json({
            message: {
              messageID: 'errns022-2', 
              mode:'errWorkerScanOrderProductionReceiveOutsource_notNodeIDSame', 
              value: "error worker scan order production rceive outsource = this is not same for nodeID"
            },
            success: false
          });	
        }
      }
    } 
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns022', 
        mode:'errWorkerScanOrderProductionReceiveOutsource', 
        value: "error worker scan order production rceive outsource"
      },
      success: false
    });
  }
}

// // ## edit order production  send product to next department 
// router.put("/outsource2/edit/oderProduction/nextnode", nsController.putOutsourceOrderProductionNextNodeID);
exports.putOutsourceOrderProductionNextNodeID = async (req, res, next) => {
  // try {} catch (err) {}
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const data = req.body;
  const userID = data.userID;
  // console.log('putOutsourceOrderProductionNextNodeID');
  // console.log(data);
  const productBarcodeNos = data.productBarcodeNos;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const orderID = data.orderID;
  const productID = data.productID;
  let productionNodeArr = data.productionNode;
  // const washingAndPressingMerge = data.washingAndPressingMerge;
  // productionNode.datetime = current;
  try {
    await ShareFunc.upsertUserSession1hr(userID);

    // console.log('productionNodeArr  ===' ,productionNodeArr);
    const uuid = uuidv4();
    // ## update datetime
    await this.asyncForEach2(productionNodeArr , async (productionNode) => {
      productionNode.datetime = current;
      productionNode.outsourceData[0].datetime = current;
    });

    // ## old last record (toNode) have to the same  first element of new record (fromNode)
    // ## or old last record (toNode) is outsource and has 1 element  / first element of new record

    const orderProduct = await ShareFunc.getOrderProductReceiveOutsource01(companyID, productBarcodeNos);
    let canUpdate = false; // set default
    let productionNode;
    if (orderProduct) {
      // console.log(orderProduct.productionNode);
      productionNode = orderProduct.productionNode;
      if (productionNode[productionNode.length - 1].toNode === 'outsource') {
        if (productionNode.length === 1 && productionNodeArr[0].fromNode === 'starterNode') {
          canUpdate = true;
        } else if (productionNode.length > 1) {  // ## productionNode.length  > 1  ///
          if (productionNode[productionNode.length - 2].toNode === productionNodeArr[0].fromNode) {
            canUpdate = true;
          }
        }

      } else {
        canUpdate = false;
      }
    }


    if (canUpdate) {
      result1 = await OrderProduction.updateOne(
        {$and: [
          {"companyID":companyID},
          {"factoryID":factoryID},
          {"orderID":orderID},
          {"productID":productID},
          {"productBarcodeNoReal":{$in: productBarcodeNos}}
          // {"productBarcodeNo":{$in: productBarcodeNos}}
        ]}, 
        {
          // {$push: {productionNode: {$each:[productionNode],  $position: 0}}},  // ## add new element at the first
          $push: {productionNode: {$each: productionNodeArr}},
          // $inc: {productCount: -1},
          "productCount": 1,
          "bundleID": uuid
        });
    } else {
      return res.status(501).json({
        message: {
          messageID: 'errns023', 
          mode:'errEditNextNodeOutsource', 
          value: "err edit next node outsource"
        },
        success: false
      });
    }

    

    // // ## update datetime
    // await this.asyncForEach2(productionNodeArr , async (productionNode) => {
    //   productionNode.datetime = current;
    //   productionNode.outsourceData[0].datetime = current;
    // });

    // result1 = await OrderProduction.updateMany(
    //   {$and: [
    //     {"companyID":companyID},
    //     {"factoryID":factoryID},
    //     {"orderID":orderID},
    //     {"productID":productID},
    //     {"productBarcodeNo":{$in: productBarcodeNos}}
    //   ]}, 
    //   // {$push: {productionNode: {$each:[productionNode],  $position: 0}}},  // ## add new element at the first
    //   {
    //     $push: {productionNode: {$each: productionNodeArr}}
    //   });

    return res.status(200).json({
      tokenNS: '',
      expiresIn: process.env.expiresIn,
      success: true,
      productBarcodeNos: productBarcodeNos
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns023', 
        mode:'errEditNextNodeOutsource', 
        value: "err edit next node outsource"
      },
      success: false
    });
  }
}

// // ## edit order production  send product to send out
// router.put("/outsource4/edit/oderProduction/sendout", nsController.putOutsourceOrderProductionSendOut);
exports.putOutsourceOrderProductionSendOut = async (req, res, next) => {
  // try {} catch (err) {}
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const data = req.body;
  const userID = data.userID;
  // console.log('putOutsourceOrderProductionSendOut');
  // console.log(data);
  const productBarcodeNos = data.productBarcodeNos;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const orderID = data.orderID;
  const productID = data.productID;
  let productionNode = data.productionNode;  // ## object
  // const washingAndPressingMerge = data.washingAndPressingMerge;
  // productionNode.datetime = current;

  let session = await mongoose.startSession();
  session.startTransaction();
  // let session2 = await mongoose.startSession();
  // session2.startTransaction();

  try {
    await ShareFunc.upsertUserSession1hr(userID);

    // ## check last node it collect to add next

    // ## udate-upsert outsourceData  / check existing in outsourceData
    const orderProduct = await ShareFunc.getOrderProductReceiveOutsource01(companyID, productBarcodeNos);
    let outsourceDataF = [];
    if (orderProduct.outsourceData) {
      outsourceDataF = orderProduct.outsourceData.filter(i=>(i.factoryID === productionNode.outsourceData[0].factoryID));
    }

    if (outsourceDataF.length === 0 || !orderProduct.outsourceData) {
      const outsourceData1 = productionNode.outsourceData[0];
      // console.log(outsourceData1);
      result0 = await OrderProduction.updateMany(
        {$and: [
          {"companyID":companyID},
          {"factoryID":factoryID},
          {"orderID":orderID},
          {"productID":productID},
          {"productBarcodeNo":{$in: productBarcodeNos}}
        ]}, 
        // {$push: {productionNode: {$each:[productionNode],  $position: 0}}},  // ## add new element at the first
        {
          $push: {
            outsourceData: outsourceData1,
            productionNode: productionNode,
          }
        },
      ).session(session);
    } else {
      result0 = await OrderProduction.updateMany(
        {$and: [
          {"companyID":companyID},
          {"factoryID":factoryID},
          {"orderID":orderID},
          {"productID":productID},
          {"productBarcodeNo":{$in: productBarcodeNos}}
        ]}, 
        // {$push: {productionNode: {$each:[productionNode],  $position: 0}}},  // ## add new element at the first
        {
          $push: {productionNode: productionNode}
        },
      ).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    // await session2.commitTransaction();
    // session2.endSession();

    return res.status(200).json({
      tokenNS: '',
      expiresIn: process.env.expiresIn,
      success: true,
      productBarcodeNos: productBarcodeNos
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    // await session2.abortTransaction(); 
    // session2.endSession();
    return res.status(501).json({
      message: {
        messageID: 'errns023', 
        mode:'errEditNextNodeOutsource', 
        value: "err edit next node outsource"
      },
      success: false
    });
  } finally {
    session.endSession();
    // session2.endSession();
  }
}

// // ## edit order production  send product to next department 
// router.put("/outsource5/editcancel/oderProduction/received", nsController.putCancelOutsourceOrderProductionReceived);
exports.putCancelOutsourceOrderProductionReceived = async (req, res, next) => {
  // try {} catch (err) {}
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const data = req.body;
  const userID = data.userID;
  // console.log('putOutsourceOrderProductionNextNodeID');
  // console.log(data);
  const productBarcodeNos = data.productBarcodeNos;
  const companyID = data.companyID;
  // const factoryID = data.factoryID;
  // const orderID = data.orderID;
  // const productID = data.productID;
  // let productionNodeArr = data.productionNode;
  // const washingAndPressingMerge = data.washingAndPressingMerge;
  // productionNode.datetime = current;
  try {
    await ShareFunc.upsertUserSession1hr(userID);

    // ## check productBarcodeNos , are ever received or not 
    // ## and orderProduction.productionNode.length > 1
    // ## and last element of orderProduction.productionNode.toNode !== 'outsource'
    // ## and .status = 'normal' and .isOutsource = true

    const orderProduct = await ShareFunc.getOrderProductReceiveOutsource01(companyID, productBarcodeNos);
    let canUpdateDelete = false; // set default
    let productionNode;
    if (orderProduct) {
      // console.log(orderProduct.productionNode);
      productionNode = orderProduct.productionNode;
      if (productionNode[productionNode.length - 1].toNode !== 'outsource' && productionNode.length > 1 
          && productionNode[productionNode.length - 1].status === 'normal' 
          && productionNode[productionNode.length - 1].isOutsource === true) {
          canUpdateDelete = true
      } else {
        canUpdate = false;
      }
    }

  //   let productionNode: ProductionNode = {
  //     fromNode: 'outsource',
  //     toNode: 'outsource',
  //     datetime: new Date(),
  //     status: 'outsource',
  //     problemID: '',
  //     problemName: '',
  //     isOutsource: isOutsource,
  //     outsourceData: outsourceData,
  //     createBy: createBy
  // };

    const productionNode1 = [...orderProduct.productionNode];
    let i = 0;
    let idx = -1;  // ## index of productionNode , we need to
    // ## gen orderProduction.productionNode array new
    await this.asyncForEach(productionNode1 , async (productionNode) => {
      if (productionNode.toNode === 'outsource' && productionNode.status === 'outsource' && productionNode.isOutsource === true) {
        idx = i;
      }
      i++;
    });

    let productionNode2 = [];
    if (idx > -1) {

      for (let ii = 0; ii <= idx; ii++){
        productionNode2.push(productionNode1[ii]);
      }
    }

    // console.log(canUpdateDelete , productionNode2);
    if (canUpdateDelete) {

      result1 = await OrderProduction.updateOne(
        {$and: [
          {"companyID":companyID},
          // {"factoryID":factoryID},
          // {"orderID":orderID},
          // {"productID":productID},
          {"productBarcodeNoReal":{$in: productBarcodeNos}}
          // {"productBarcodeNo":{$in: productBarcodeNos}}
        ]}, 
        {
          // {$push: {productionNode: {$each:[productionNode],  $position: 0}}},  // ## add new element at the first
          // $push: {productionNode: {$each: productionNodeArr}},
          // $inc: {productCount: -1},
          // "productCount": 1,
          "productionNode": productionNode2
        });

    } else {
      return res.status(501).json({
        message: {
          messageID: 'errns024', 
          mode:'errEditCancelRecivedOutsource', 
          value: "err edit cancel received  outsource"
        },
        success: false
      });
    }

    return res.status(200).json({
      tokenNS: '',
      expiresIn: process.env.expiresIn,
      success: true,
      productBarcodeNos: productBarcodeNos
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errns024', 
        mode:'errEditCancelRecivedOutsource', 
        value: "err edit cancel received  outsource"
      },
      success: false
    });
  }
}



// ## staff/worker factory login to node workstation
// #######################################################################################################



// #######################################################################################################
// ## report..... staff/worker factory login to node workstation

// // // ## get node getRepCurrentProductQtyCFN
// // router.get("/noder/rep1/current/productqty/cfn/:companyID/:factoryID/:nodeID/:productStatus/:repListName", nsController.getRepCurrentProductQtyCFN);
// exports.getRepCurrentProductQtyCFN = async (req, res, next) => {
//   // try {} catch (err) {}
//   // ## CFN = /:companyID/:factoryID/:nodeID
//   // console.log('getRepCurrentProductQty');

//   const companyID = req.params.companyID;
//   const factoryID = req.params.factoryID;
//   const nodeID = req.params.nodeID;
//   const productStatusArr = JSON.parse(req.params.productStatus);
//   const repListNameArr = JSON.parse(req.params.repListName);
//   // console.log(companyID, factoryID, nodeID, productStatusArr);

//   try {
//     // ## get Rep CFN Current Product Qty  all
//     let allProductQty = 0;
//     let orderProductQtyByOrderIDRep;
//     let orderProductQtyByOrderIDProductIDRep;
//     let orderProductQtyBundleListRep;
//     let orders = [];
//     let products = [];
//     let productStateStyle = [];
//     let productStateTargetPlace = [];
//     let productStateColor = [];
//     let productStateSize = [];
//     let productStateStyleTargetPlaceColorSize = [];
//     let queueInfoRep = [];

//     // // ## test report 
//     // const testReport = await ShareFunc.testReport(companyID, factoryID, nodeID, productStatusArr);
    

//     // const isRunNumberUp = runNumberUpType.includes(lottoBetTypeX);
//     if (repListNameArr.includes('getRepCFNCurrentProductQty')) {
//       const orderProductAllQtyRep = await ShareFunc.getRepCFNCurrentProductQty(companyID, factoryID, nodeID, productStatusArr);
//       allProductQty = orderProductAllQtyRep.length;  // ## current all product qty in nodeID 
//       // console.log(orderProductAllQtyRep);
//     }

//     if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderID')) {
//       // ## get Rep CFN Current Product Qty by orderID
//       orderProductQtyByOrderIDRep = await ShareFunc.getRepCFNCurrentProductQtyByOrderID(companyID, factoryID, nodeID, productStatusArr);
//     }

//     if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderIDProductID')) {
//       // ## get Rep CFN Current Product Qty by orderID productID
//       orderProductQtyByOrderIDProductIDRep = await ShareFunc.getRepCFNCurrentProductQtyByOrderIDProductID(companyID, factoryID, nodeID, productStatusArr);
//     }

//     if (repListNameArr.includes('getRepCFNCurrentProductBundleList')) {
//       // ## get Rep CFN Current Product bundle list
//       orderProductQtyBundleListRep = await ShareFunc.getRepCFNCurrentProductBundleList(companyID, factoryID, nodeID, productStatusArr);
//     }

//     if (repListNameArr.includes('getAllOrderAndProductFromOrderProduction')) {
//       // ## get all order product from orderProduction
//       const allOrder = await ShareFunc.getAllOrderFromOrderProductionCFN(companyID, factoryID, nodeID, productStatusArr);
//       const allProduct = await ShareFunc.getAllProductFromOrderProductionCFN(companyID, factoryID, nodeID, productStatusArr);
//       // console.log(allOrder, allProduct);
//       orders = await ShareFunc.getOrdersByOrderIDs(companyID, allOrder, 1, 1000);
//       products = await ShareFunc.getProductsByProductIDs(companyID, allProduct, 1, 1000);
//       // console.log(orders, products);
//     }

//     // ## style-targetPlace-year-5color-size-sex-#####    /   8   4	  2   10    3    1   99999
//     if (repListNameArr.includes('getRepCFNProductState')) {
//       // // ## get Rep CFN Current Product state style-targetPlace-year-5color-size-sex
//       // productStateStyle = await ShareFunc.getRepCFNProductStateStyle(companyID, factoryID, nodeID, productStatusArr);
//       // // console.log(productStateStyle);
//       // productStateTargetPlace = await ShareFunc.getRepCFNProductStateTargetPlace(companyID, factoryID, nodeID, productStatusArr);
//       // // console.log(productStateTargetPlace);
//       // productStateColor = await ShareFunc.getRepCFNProductStateColor(companyID, factoryID, nodeID, productStatusArr);
//       // // console.log(productStateColor);
//       // productStateSize = await ShareFunc.getRepCFNProductStateSize(companyID, factoryID, nodeID, productStatusArr);
//       // // console.log(productStateSize);
//       productStateStyleTargetPlaceColorSize = await ShareFunc.getRepCFNProductStateStyleTargetPlaceColorSize(companyID, factoryID, nodeID, productStatusArr);
//       // console.log(productStateStyleTargetPlaceColorSize);
//     }

//     if (repListNameArr.includes('getRepCFNCurrentProductionQueueCFN')) {
//       // ## get Rep CFN Current Production Queue
//       // exports.getProductionQueueCFN= async (companyID, factoryID, page, limit)
//       queueInfoRep = await ShareFunc.getProductionQueueCFN(companyID, factoryID, 1, 20);
//     }

    
//     if (repListNameArr.includes('getRepCFNCurrentProductAllDetail')) {
//       // ## get Rep CFN Current Production Queue
//       // exports.getProductionQueueCFN= async (companyID, factoryID, page, limit)
//       currentProductAllDetailCFN = await ShareFunc.getCFNCurrentProductAllDetail(companyID, factoryID, nodeID, productStatusArr);
//     }

//     // await ShareFunc.upsertUserSession1hr(userID);
//     // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

//     repDataFormat1 = {
//       allProductQty: allProductQty,
//       orderProductQtyByOrderIDRep: orderProductQtyByOrderIDRep,
//       orderProductQtyByOrderIDProductIDRep: orderProductQtyByOrderIDProductIDRep,
//       orderProductQtyBundleListRep: orderProductQtyBundleListRep,
//       orders: orders,
//       products: products,
//       productStateStyle: productStateStyle,
//       productStateTargetPlace: productStateTargetPlace,
//       productStateColor: productStateColor,
//       productStateSize: productStateSize,
//       productStateStyleTargetPlaceColorSize: productStateStyleTargetPlaceColorSize,
//       queueInfoRep: queueInfoRep,
//       currentProductAllDetailCFN: currentProductAllDetailCFN,
//     };
//     const token = '';
//     res.status(200).json({
//       token: token,
//       expiresIn: process.env.expiresIn,
//       repListNameArr: repListNameArr,
//       repDataFormat1: repDataFormat1,
//       // orders: orders,
//       // products: products,
//       // orderProductAllQtyRep: orderProductAllQtyRep,
//       // factory: factory,
//       // nodeStation: nodeStation,
//       // nodeFlows: nodeFlows,
//       // nodeFlow: nodeFlow
//     });
//   } catch (err) {
//     return res.status(501).json({
//       message: {
//         messageID: 'errrp001', 
//         mode:'errRepCurrentProductQty', 
//         value: "error report current product qty"
//       }
//     });
//   }
// }


// ## report..... staff/worker factory login to node workstation
// #######################################################################################################