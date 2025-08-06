const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
// const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');

const io = require('../../socket');

const ShareFunc = require("../c-api-app-share-function");
const ScheduleFunc = require("../user/c-schedule");

const User = require("../../models/m-user");
const MailSignup = require("../../models/m-mailSignup");
const Factory = require("../../models/m-factory");
const Customer = require("../../models/m-customer");
const OrderProduction = require("../../models/m-orderProduction");
const RepQTYEdit = require("../../models/m-repQTYEdit");


const Schedule = require("../../models/m-schedule");
const Dtproductionzoneperiodc = require("../../models/m-dt-productionzoneperiodc");
const Dtcurrentcfactoryorder = require("../../models/m-dt-currentcfactoryorder");
const Dtcurrentproductqtyall = require("../../models/m-dt-currentproductqtyall");
const Dtorderoutsourcefac = require("../../models/m-dt-currentcompanyorderoutsourcefac");
const Dtcompanyorderoutsource = require("../../models/m-dt-companyorderoutsource");

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




// ## general
// #######################################################################################################


// #######################################################################################################
// ## report

// // ## get node getRepCurrentProductQueue
// router.get("/noder/rep5/current/productqueue/cf/:companyID/:factoryID/:page/:limit"
//         , reportController.getRepCurrentProductQueue);
exports.getRepCurrentProductQueue = async (req, res, next) => {
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const page = +req.params.page;
  const limit = +req.params.limit;  // ## records we need to get
  const productIDArr = JSON.parse(req.params.productIDArr);
  try {
    // ## get Rep CFN Current Production Queue
    // exports.getProductionQueueCFN= async (companyID, factoryID, page, limit)
    queueInfoRep = await ShareFunc.getProductionQueueCFN(companyID, factoryID, page, limit);

    // getTotalProductionQueueByFactoryProductIDs= async (companyID, factoryID, productIDArr) 
    countProductionQueueAll = await ShareFunc.getTotalRowsProductionQueueByFactoryProductIDs(companyID, factoryID, productIDArr);
    
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: '',
      expiresIn: process.env.expiresIn,
      queueInfoRep: queueInfoRep,
      countProductionQueueAll: countProductionQueueAll,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp007', 
        mode:'errRepCurrentCompanyProductionQueue', 
        value: "error report current company production queue"
      }
    });
  }
}

// // ## get node getRepCurrentProductions
// router.get("/noder/rep6/current/productions/cf/:companyID/:factoryID/:productIDArr/:page/:limit"
//         , reportController.getRepCurrentProductions);
exports.getRepCurrentProductions = async (req, res, next) => {
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const nodeID = req.params.nodeID;
  const page = +req.params.page;
  const limit = +req.params.limit;  // ## records we need to get
  // const productIDArr = JSON.parse(req.params.productIDArr);
  const productStatusArr = JSON.parse(req.params.productStatus);
  // console.log(companyID, factoryID, nodeID, productStatusArr);
  try {

    // // getTotalProductionQueueByFactoryProductIDs= async (companyID, factoryID, productIDArr) 
    // currentProductAllDetailCFN = await ShareFunc.getCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr, page, limit);
    // countCurrentProductAllDetailCFN = await ShareFunc.getCountCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr);

    res.status(200).json({
      token: '',
      expiresIn: process.env.expiresIn,
      // currentProductAllDetailCFN: currentProductAllDetailCFN,
      // countProductionsAll: countCurrentProductAllDetailCFN,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp007', 
        mode:'errRepCurrentCompanyProductionQueue', 
        value: "error report current company production queue"
      }
    });
  }
}


// // ## get node getRepCurrentProductions
// router.get("/noder/rep7/current/productions/period/c/:companyID/:nodeID/:productStatus/:orderStatus"
//         , reportController.getRepCurrentProductionPeriod);
exports.getRepCurrentProductionPeriod = async (req, res, next) => {
  const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  // const nodeID = req.params.nodeID;
  // const page = +req.params.page;
  // const limit = +req.params.limit;  // ## records we need to get
  // const productIDArr = JSON.parse(req.params.productIDArr);
  const productStatusArr = JSON.parse(req.params.productStatus); // normal , problem, complete
  const productionNodeStatusArr = ['normal', 'complete'];
  const orderStatusArr = JSON.parse(req.params.orderStatus);
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  // console.log(companyID, productStatusArr, productionNodeStatusArr);
  try {
    // ## get Rep Company Current Production work in period
    currentProductionPeriod = await ShareFunc.getProductionPeriodC(companyID, productStatusArr, productionNodeStatusArr, orderIDArr);
    // console.log(currentProductionPeriod);
    // console.log('1');

    orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr, orderIDArr);
    // console.log('2');
                                              //   getCurrentCompanyOrderZoneStyleSize
    currentCompanyOrderStyleSize = await ShareFunc.getCurrentCompanyOrderStyleSize(companyID, orderStatusArr, orderIDArr);
    // console.log('3');

    const openArr = [true];
    const forLossArr = [true];
    // getProductionForLossQTYC = async (companyID, productStatusArr, productionNodeStatusArr, openArr, forLossArr)
    currentProductionForLoss = await ShareFunc.getProductionForLossQTYC(companyID, productStatusArr, productionNodeStatusArr, openArr, forLossArr, orderIDArr);
    // console.log(currentProductionForLoss);

    // getTotalProductionQueueByFactoryProductIDs= async (companyID, factoryID, productIDArr) 
    // currentProductAllDetailCFN = await ShareFunc.getCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr, page, limit);
    // countCurrentProductAllDetailCFN = await ShareFunc.getCountCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: '',
      expiresIn: process.env.expiresIn,
      currentProductionPeriod: currentProductionPeriod,
      currentProductionForLoss: currentProductionForLoss,
      orderStyleColorSize: orderStyleColorSize,
      currentCompanyOrderStyleSize: currentCompanyOrderStyleSize,
      
    });
  } catch (err) {
    
    return res.status(501).json({
      message: {
        messageID: 'errrp008', 
        mode:'errRepCurrentCompanyProductionPeroidAll', 
        value: "error report current company production period all"
      }
    });
  }
}

// // ## get node getRepCurrentProductions
// router.get("/noder/rep8/current/productions/zoneperiod/c/:companyID/:productStatus/:orderStatus"
//         , reportController.getRepCurrentProductionZonePeriod);
exports.getRepCurrentProductionZonePeriod = async (req, res, next) => {
  // console.log('getRepCurrentProductionZonePeriod');
  const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  // const nodeID = req.params.nodeID;
  // const page = +req.params.page;
  // const limit = +req.params.limit;  // ## records we need to get
  // const productIDArr = JSON.parse(req.params.productIDArr);
  const productStatusArr = JSON.parse(req.params.productStatus); // normal , problem, complete
  const productionNodeStatusArr = ['normal', 'complete'];
  const orderStatusArr = JSON.parse(req.params.orderStatus);
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  const seasonYear = req.params.seasonYear;
  // console.log(companyID, productStatusArr, productionNodeStatusArr, orderIDArr);
  try {
    // ## get Rep Company Current Production work in period
    // const currentProductionZonePeriod = await ShareFunc.getProductionZonePeriodC(companyID, productStatusArr, productionNodeStatusArr, orderIDArr);
    
    // exports.get_auto_getProductionZonePeriodC= async (companyID, seasonYear, sName)
    const sName = 'auto_getProductionZonePeriodC';
    const data = await ShareFunc.get_auto_getProductionZonePeriodC(companyID, seasonYear, sName);
    // console.log(data);
    
    const currentProductionZonePeriod = data[0].data;
    const currentProductionZonePeriodFake = data[0].dataFake;
    // console.log(currentProductionPeriod);
    // console.log('getRepCurrentProductionZonePeriod 1');
    // console.log(currentProductionZonePeriodFake);

    const orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr, orderIDArr);
    // console.log('getRepCurrentProductionZonePeriod 2');
    // currentCompanyOrderZoneStyleSize = await ShareFunc.getCurrentCompanyOrderZoneStyleSize(companyID, orderStatusArr);

    const openArr = [true];
    const forLossArr = [true];
    // getProductionForLossQTYC = async (companyID, productStatusArr, productionNodeStatusArr, openArr, forLossArr)
    const currentProductionZoneForLoss = await ShareFunc.getProductionZoneForLossQTYC(companyID, productStatusArr, productionNodeStatusArr, openArr, forLossArr, orderIDArr);
    // console.log(currentProductionZoneForLoss);
    // console.log('getRepCurrentProductionZonePeriod 3');

    // console.log(companyID, seasonYear);
    const repQTYEditList = await ShareFunc.getRepQTYEditBySeasonYear(companyID, seasonYear);
    // console.log(repQTYEditList);

    // getTotalProductionQueueByFactoryProductIDs= async (companyID, factoryID, productIDArr) 
    // currentProductAllDetailCFN = await ShareFunc.getCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr, page, limit);
    // countCurrentProductAllDetailCFN = await ShareFunc.getCountCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: '',
      expiresIn: process.env.expiresIn,
      currentProductionZonePeriod: currentProductionZonePeriod,
      currentProductionZonePeriodFake: currentProductionZonePeriodFake,
      currentProductionZoneForLoss: currentProductionZoneForLoss,
      orderStyleColorSize: orderStyleColorSize,
      repQTYEditList: repQTYEditList,
      // currentCompanyOrderZoneStyleSize: currentCompanyOrderZoneStyleSize,
    });
  } catch (err) {
    
    return res.status(501).json({
      message: {
        messageID: 'errrp009', 
        mode:'errRepCurrentCompanyProductionZonePeroidAll', 
        value: "error report current company production zone period all"
      }
    });
  }
}

// // ## put/get  getRepCurrentProductionZonePeriodDate12
// router.put("/noder/rep12/date12/productions/zoneperiod/c", reportController.getRepCurrentProductionZonePeriodDate12);
exports.getRepCurrentProductionZonePeriodDate12 = async (req, res, next) => {
  // console.log('getRepCurrentProductionZonePeriodDate12');
  // const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const userID = data.userID;
  const companyID = data.companyID;
  const productStatusArr = JSON.parse(data.productStatusArr);
  const productionNodeStatusArr = ['normal', 'complete'];
  const orderStatusArr = JSON.parse(data.orderStatusArr);
  const orderIDArr = JSON.parse(data.orderIDArr);
  const date12Arr = data.date12;
  const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+07:00'));
  const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));

  const userGroupScan1 = data.userGroupScan1;
  const userIDGroup = userGroupScan1.userIDGroup;

  const seasonYear = data.seasonYear;

  // console.log(companyID, userID, productStatusArr, productionNodeStatusArr);
  // console.log(date12Arr, dateStart, dateEnd, orderStatusArr);
  // console.log(orderIDArr);
  // console.log(userGroupScan1);
  try {
    // // ## get Rep Company Current Production work in period
    let currentProductionZonePeriod = [];
    if (userGroupScan1.groupScanID === '*' && userGroupScan1.userIDGroup.length === 0) {
      currentProductionZonePeriod = await ShareFunc.getProductionZonePeriodDate12C(companyID, productStatusArr, productionNodeStatusArr, orderIDArr, dateStart, dateEnd);
    } else if (userGroupScan1.userIDGroup.length > 0) {
      currentProductionZonePeriod = await ShareFunc.getProductionZonePeriodUserScanDate12C(companyID, productStatusArr, productionNodeStatusArr, orderIDArr, dateStart, dateEnd, userIDGroup);
    }
    // console.log(currentProductionZonePeriod);

    // exports.get_auto_getProductionZonePeriodC= async (companyID, seasonYear, sName)
    // const currentProductionZonePeriod = await ShareFunc.get_auto_getProductionZonePeriodC(companyID, productStatusArr, productionNodeStatusArr, orderIDArr);
    
    const orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr, orderIDArr);
    // console.log(orderStyleColorSize);



    // // **********
    // const sName = 'auto_getProductionZonePeriodC';
    // const currentProductionZonePeriodFull = await ShareFunc.get_auto_getProductionZonePeriodC(companyID, seasonYear, sName);
    
    // // console.log(currentProductionPeriod);
    // // console.log('getRepCurrentProductionZonePeriod 1');

    // const openArr = [true];
    // const forLossArr = [true];
    // // getProductionForLossQTYC = async (companyID, productStatusArr, productionNodeStatusArr, openArr, forLossArr)
    // const currentProductionZoneForLossFull = await ShareFunc.getProductionZoneForLossQTYC(companyID, productStatusArr, productionNodeStatusArr, openArr, forLossArr, orderIDArr);
    // // console.log(currentProductionZoneForLoss);
    // // console.log('getRepCurrentProductionZonePeriod 3');

    // // console.log(companyID, seasonYear);
    // const repQTYEditListFull = await ShareFunc.getRepQTYEditBySeasonYear(companyID, seasonYear);
    // // console.log(repQTYEditList);


    
    res.status(200).json({
      userID: userID,
      token: '',
      expiresIn: process.env.expiresIn,
      currentProductionZonePeriod: currentProductionZonePeriod,
      orderStyleColorSize: orderStyleColorSize,
      // *******************************
      // currentProductionZonePeriodFull: currentProductionZonePeriodFull,
      // currentProductionZoneForLossFull: currentProductionZoneForLossFull,
      // repQTYEditListFull: repQTYEditListFull,
    });
  } catch (err) {
    
    return res.status(501).json({
      message: {
        messageID: 'errrp009', 
        mode:'errRepCurrentCompanyProductionZonePeroidAll', 
        value: "error report current company production zone period all"
      }
    });
  }
}

// router.put("/noder/rep14/date12/productions/bundle/state/c", reportController.getRepCurrentProductionBundleStateDate12);
exports.getRepCurrentProductionBundleStateDate12 = async (req, res, next) => {
  // console.log('getRepCurrentProductionBundleStateDate12');
  // const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const userID = data.userID;
  const companyID = data.companyID;
  const productStatusArr = JSON.parse(data.productStatusArr);
  const productionNodeStatusArr = ['normal', 'complete'];
  const orderStatusArr = JSON.parse(data.orderStatusArr);
  const orderIDArr = data.orderIDArr;
  const date12Arr = data.date12;

  const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+07:00'));
  const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));

  // const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00-07:00'));
  // const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59-07:00'));

  // const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+00:00'));
  // const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+00:00'));

  const userGroupScan1 = data.userGroupScan1;
  const userIDGroup = userGroupScan1.userIDGroup;

  // console.log(companyID, userID, productStatusArr, productionNodeStatusArr);
  // console.log(date12Arr, dateStart, dateEnd, orderStatusArr);
  // console.log(orderIDArr);
  // console.log(userGroupScan1);
  try {
    // // ## get Rep Company Current Production work in period
    let currentProductionBundleState = [];
    if (userGroupScan1.groupScanID === '*' && userGroupScan1.userIDGroup.length === 0) {
      currentProductionBundleState = [];
      // currentProductionBundleState = await ShareFunc.getProductionZonePeriodDate12C(companyID, productStatusArr, productionNodeStatusArr, orderIDArr, dateStart, dateEnd);
    } else if (userGroupScan1.userIDGroup.length > 0) {
      currentProductionBundleState = await ShareFunc.getProductionBundleStateUserScanDate12C(companyID, productStatusArr, productionNodeStatusArr, orderIDArr, dateStart, dateEnd, userIDGroup);
    }
    // console.log(currentProductionBundleState);

    // const orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr, orderIDArr);
    // console.log(orderStyleColorSize);

    // const openArr = [true];
    // const forLossArr = [true];
    // // getProductionForLossQTYC = async (companyID, productStatusArr, productionNodeStatusArr, openArr, forLossArr)
    // currentProductionZoneForLoss = await ShareFunc.getProductionZoneForLossQTYC(companyID, productStatusArr, productionNodeStatusArr, openArr, forLossArr, orderIDArr);
    // // console.log(currentProductionZoneForLoss);
    
    // getTotalProductionQueueByFactoryProductIDs= async (companyID, factoryID, productIDArr) 
    // currentProductAllDetailCFN = await ShareFunc.getCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr, page, limit);
    // countCurrentProductAllDetailCFN = await ShareFunc.getCountCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      userID: userID,
      token: '',
      expiresIn: process.env.expiresIn,
      currentProductionBundleState: currentProductionBundleState,
      bundleStatePDF: [],
      // orderStyleColorSize: orderStyleColorSize,
      // currentProductionZoneForLoss: currentProductionZoneForLoss,
      // currentCompanyOrderZoneStyleSize: currentCompanyOrderZoneStyleSize,
    });
  } catch (err) {
    
    return res.status(501).json({
      message: {
        messageID: 'errrp009', 
        mode:'errRepCurrentCompanyProductionZonePeroidAll', 
        value: "error report current company production zone period all"
      }
    });
  }
}

exports.transformDataBundleStateStyle = async (currentProductionBundleState) => {
  let bundleStatePDF = [];
  const nodeIDNot = 'starterNode';

  // ## no need to get fromNode = 'starterNode'
  let currentProductionBundleStateF = currentProductionBundleState.filter(i=>i.fromNode !== nodeIDNot);

  // ## sort data bundle
  currentProductionBundleStateF.sort((a,b)=>{
    return a.targetPlaceID >b.targetPlaceID?1:a.targetPlaceID <b.targetPlaceID?-1:0
    || a.color >b.color?1:a.color <b.color?-1:0
    || a.size >b.size?1:a.size <b.size?-1:0
    || a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0
    || a.fromNode >b.fromNode?1:a.fromNode <b.fromNode?-1:0
  });
  // console.log('transformDataBundleStateStyle 1');
  await this.asyncForEach(currentProductionBundleStateF , async (item) => {
    // console.log('transformDataBundleStateStyle 11', item);
    let bundleStateF = bundleStatePDF.filter(i=>
      i.orderID == item.orderID
      && i.bundleNo == item.bundleNo
    );
    // console.log('transformDataBundleStateStyle 2');
    if (bundleStateF.length === 0) {
      let bundleStatePDF1 = await ShareFunc.clrBundleStatePDF();
      // console.log('transformDataBundleStateStyle 3');
      bundleStatePDF1.companyID = item.companyID;
      bundleStatePDF1.orderID = item.orderID;
      bundleStatePDF1.targetPlaceID = item.targetPlaceID;
      bundleStatePDF1.targetPlaceName = item.targetPlaceName;
      // bundleStatePDF1.targetPlaceSeq = 0;
      bundleStatePDF1.color = item.color;
      bundleStatePDF1.colorName = '';
      bundleStatePDF1.bundleNo = item.bundleNo;
      bundleStatePDF1.size = item.size;
      // bundleStatePDF1.sizeSeq = 0;
      bundleStatePDF1.productCount = item.productCount;

      let nodeGroupScanID2_1 = await ShareFunc.clrNodeGroupScanID2();
      // console.log('transformDataBundleStateStyle 4');
      nodeGroupScanID2_1.nodeID = item.fromNode;
      nodeGroupScanID2_1.sumProductQty = item.sumProductQty;
      // nodeGroupScanID2_1.userID = item.userID;
      // nodeGroupScanID2_1.groupScanID2 = item.groupScanID2;
      nodeGroupScanID2_1.status = item.productCount===item.sumProductQty?'done':'-'; // ## done= finished of this node,  '-'= not finished yet
      bundleStatePDF1.nodeGroupScanID2 = [nodeGroupScanID2_1];

      bundleStatePDF.push({...bundleStatePDF1});
    } else { // ## bundleState1.length > 0
      let nodeGroupScanID2_1 = await ShareFunc.clrNodeGroupScanID2();
      // console.log('transformDataBundleStateStyle 5');
      nodeGroupScanID2_1.nodeID = item.fromNode;
      nodeGroupScanID2_1.sumProductQty = item.sumProductQty;
      // nodeGroupScanID2_1.userID = item.userID;
      // nodeGroupScanID2_1.groupScanID2 = item.groupScanID2;
      nodeGroupScanID2_1.status = item.productCount===item.sumProductQty?'done':'-'; // ## done= finished of this node,  '-'= not finished yet
      bundleStateF[0].nodeGroupScanID2.push(nodeGroupScanID2_1);
    }
  });
  // console.log('transformDataBundleStateStyle 9');
  return bundleStatePDF;
}

// // ## put/get  getRepCurrentProductionBundleState
// router.put("/noder/rep15/productions/bundle/state/c", reportController.getRepCurrentProductionBundleState);
exports.getRepCurrentProductionBundleState = async (req, res, next) => {
  // console.log('getRepCurrentProductionBundleState');
  // const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const userID = data.userID;
  const companyID = data.companyID;
  const productStatusArr = JSON.parse(data.productStatusArr);
  const productionNodeStatusArr = ['normal', 'complete'];
  const orderStatusArr = JSON.parse(data.orderStatusArr);
  const orderIDArr = data.orderIDArr;
  // const date12Arr = data.date12;

  // const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+07:00'));
  // const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));

  // const userGroupScan1 = data.userGroupScan1;
  // const userIDGroup = userGroupScan1.userIDGroup;

  // console.log(companyID, userID, productStatusArr, productionNodeStatusArr);
  // console.log(date12Arr, dateStart, dateEnd, orderStatusArr);
  // console.log(orderStatusArr, orderIDArr);
  // console.log(userGroupScan1);
  try {
    // ## get Rep Company Current Production Bundle State
    const currentProductionBundleState = await ShareFunc.getProductionBundleStateUserScanC(companyID, productStatusArr, productionNodeStatusArr, orderIDArr);

    // ## transform data to --> BundleStatePDF object data
    const bundleStatePDF = await this.transformDataBundleStateStyle(currentProductionBundleState);
    // console.log(bundleStatePDF);

    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      userID: userID,
      token: '',
      expiresIn: process.env.expiresIn,
      currentProductionBundleState: [],
      bundleStatePDF: bundleStatePDF,
      // currentProductionZoneForLoss: currentProductionZoneForLoss,
      // currentCompanyOrderZoneStyleSize: currentCompanyOrderZoneStyleSize,
    });
  } catch (err) {
    
    return res.status(501).json({
      message: {
        messageID: 'errrp009', 
        mode:'errRepCurrentCompanyProductionZonePeroidAll', 
        value: "error report current company production zone period all"
      }
    });
  }
}

// // ## put/get  getRepCurrentProductionBundleStateNo
// router.put("/noder/rep15/productions/bundle/state/no/c", reportController.getRepCurrentProductionBundleStateNo);
exports.getRepCurrentProductionBundleStateNo = async (req, res, next) => {
  // console.log('getRepCurrentProductionBundleStateNo');
  // const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const userID = data.userID;
  const companyID = data.companyID;
  const productStatusArr = JSON.parse(data.productStatusArr);
  const productionNodeStatusArr = ['normal', 'complete'];
  const orderStatusArr = JSON.parse(data.orderStatusArr);
  const orderIDArr = data.orderIDArr;
  const bundleSetGroup = data.bundleSetGroup;
  const bundleNoSet = bundleSetGroup.bundleNoSet;

  // const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+07:00'));
  // const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));

  // const userGroupScan1 = data.userGroupScan1;
  // const userIDGroup = userGroupScan1.userIDGroup;

  // console.log(companyID, userID, productStatusArr, productionNodeStatusArr);
  // console.log(date12Arr, dateStart, dateEnd, orderStatusArr);
  // console.log(orderStatusArr, orderIDArr);
  // console.log(userGroupScan1);
  // console.log(bundleNoSet);
  try {

    // ## get bundle no range
    // genBundleNoFromRangeSetArr= async (bundleNoSet)
    const bundleNos = await ShareFunc.genBundleNoFromRangeSetArr(bundleNoSet);
    // console.log(bundleNos);

    // ## get Rep Company  Production Bundle State by bundle no range
    const currentProductionBundleState = await ShareFunc.getProductionBundleStateRangeUserScanC(companyID, productStatusArr, productionNodeStatusArr, orderIDArr, bundleNos);

    // ## transform data to --> BundleStatePDF object data
    const bundleStatePDF = await this.transformDataBundleStateStyle(currentProductionBundleState);
    // console.log(bundleStatePDF);

    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      userID: userID,
      token: '',
      expiresIn: process.env.expiresIn,
      // currentProductionBundleState: [],
      // bundleStatePDF: [],
      currentProductionBundleState: [],
      bundleStatePDF: bundleStatePDF,

    });
  } catch (err) {
    
    return res.status(501).json({
      message: {
        messageID: 'errrp009', 
        mode:'errRepCurrentCompanyProductionZonePeroidAll', 
        value: "error report current company production zone period all"
      }
    });
  }
}

// router.put("/noder/rep17/productions/bundle/state/no/c2", reportController.getRepCurrentProductionBundleStateNo2);
exports.getRepCurrentProductionBundleStateNo2 = async (req, res, next) => {
  // console.log('getRepCurrentProductionBundleStateNo2');
  // const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const userID = data.userID;
  const companyID = data.companyID;
  const productStatusArr = JSON.parse(data.productStatusArr);
  // const productionNodeStatusArr = ['normal', 'complete']; // 
  const productionNodeStatusArr = ['normal', 'complete', 'outsource']; // 'outsource'
  const orderStatusArr = JSON.parse(data.orderStatusArr);
  const orderIDArr = data.orderIDArr;
  const bundleNos = data.bundleNos;
  const productID = data.productID;
  // const bundleSetGroup = data.bundleSetGroup;
  // const bundleNoSet = bundleSetGroup.bundleNoSet;

  // const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+07:00'));
  // const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));

  // const userGroupScan1 = data.userGroupScan1;
  // const userIDGroup = userGroupScan1.userIDGroup;

  // console.log(companyID, userID, productStatusArr, productionNodeStatusArr);
  // console.log(date12Arr, dateStart, dateEnd, orderStatusArr);
  // console.log(orderStatusArr, orderIDArr);
  // console.log(userGroupScan1);
  // console.log(bundleNos);
  try {

    // // ## get bundle no range
    // // genBundleNoFromRangeSetArr= async (bundleNoSet)
    // const bundleNos = await ShareFunc.genBundleNoFromRangeSetArr(bundleNoSet);
    // // console.log(bundleNos);

    // console.log(companyID, productID);
    const product = await ShareFunc.getProduct(companyID, productID);
    // console.log(product);

    // ## get Rep Company  Production Bundle State by bundle no range
    const currentProductionBundleState = await ShareFunc.getProductionBundleStateRangeUserScanC(companyID, productStatusArr, productionNodeStatusArr, orderIDArr, bundleNos);

    // ## transform data to --> BundleStatePDF object data
    const bundleStatePDF = await this.transformDataBundleStateStyle(currentProductionBundleState);
    // console.log(bundleStatePDF);

    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      userID: userID,
      token: '',
      expiresIn: process.env.expiresIn,
      // currentProductionBundleState: [],
      // bundleStatePDF: [],
      currentProductionBundleState: [],
      bundleStatePDF: bundleStatePDF,
      product: product

    });
  } catch (err) {
    
    return res.status(501).json({
      message: {
        messageID: 'errrp009', 
        mode:'errRepCurrentCompanyProductionZonePeroidAll', 
        value: "error report current company production zone period all"
      }
    });
  }
}

// // ## get node getRepCurrentProductQtyCFN
// router.get("/noder/rep1/current/productqty/cfn/:companyID/:factoryID/:nodeID/:productStatus/:repListName", nsController.getRepCurrentProductQtyCFN);
exports.getRepCurrentProductQtyCFN = async (req, res, next) => {
  // try {} catch (err) {}
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCurrentProductQtyCFN');

  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const nodeID = req.params.nodeID;
  const productStatusArr = JSON.parse(req.params.productStatus);
  const productProbelmStatusArr = ['problem'];
  const repListNameArr = JSON.parse(req.params.repListName);
  const seasonYearsArr = JSON.parse(req.params.seasonYears);

  // console.log(companyID, factoryID, nodeID, productStatusArr);

  try {
    // ## get Rep CFN Current Product Qty  all
    let allProductQty = 0;
    let orderProductQtyByOrderIDRep;
    let orderProductQtyByOrderIDProductIDRep;
    let orderProductQtyBundleListRep;
    let orderIDs = [];
    let orders = [];
    let products = [];
    let productStateStyle = [];
    let productStateTargetPlace = [];
    let productStateColor = [];
    let productStateSize = [];
    let productStateStyleTargetPlaceColorSize = [];
    let queueInfoRep = [];

    // // ## test report 
    // const testReport = await ShareFunc.testReport(companyID, factoryID, nodeID, productStatusArr);
    
    // lottoRoundRows = await LottoRound.countDocuments({$and: [
    //   // {"roundShow":true} , 
    //   {"yeekeeSubList":false} ,
    //   {"company.companyID":companyID},
    //   // {"roundShow":true} ,
    //   {"del":'n'}
    // ]});


    //
    // ## getOrderSBySeasonYears= async (companyID, seasonYearsArr) 
    const orderD = await ShareFunc.getOrderSBySeasonYears(companyID, seasonYearsArr);
    // console.log(' orderD  ===' , orderD);
    // products
    await this.asyncForEach(orderD , async (item) => {
      orderIDs.push(item.orderID);
    });

    // allTotalProduct
    // console.log(' 0 - allTotalProduct');
    if (repListNameArr.includes('allTotalProduct')) {
      const orderProductAllQtyRep = await ShareFunc.getRepCFNCurrentProductQtyCount(companyID, factoryID, nodeID, productStatusArr);
      allProductQty = orderProductAllQtyRep;  // ## current all product qty in nodeID 
      // console.log(' 0 - allTotalProduct -->             allProductQty  ===' , allProductQty);
    }

    // const isRunNumberUp = runNumberUpType.includes(lottoBetTypeX);
    // console.log(' 1 - getRepCFNCurrentProductQty');
    if (repListNameArr.includes('getRepCFNCurrentProductQty')) {
      // const orderProductAllQtyRep = await ShareFunc.getRepCFNCurrentProductQty(companyID, factoryID, nodeID, productStatusArr);
      // allProductQty = orderProductAllQtyRep.length;  // ## current all product qty in nodeID 
      allProductQty = 0
      // console.log(orderProductAllQtyRep);
    }

    // console.log(' 2 - getRepCFNCurrentProductQtyByOrderID');
    if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderID')) {
      // ## get Rep CFN Current Product Qty by orderID
      orderProductQtyByOrderIDRep = await ShareFunc.getRepCFNCurrentProductQtyByOrderID(companyID, factoryID, nodeID, productStatusArr);
      // console.log(orderProductQtyByOrderIDRep);
      // console.log(' 2 - getRepCFNCurrentProductQtyByOrderID');
    }

    //  getRepCFNCurrentProductQtyByOrderIDProductID
    // console.log(' 3 - getRepCFNCurrentProductQtyByOrderIDProductID');
    if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderIDProductID')) {
      // ## get Rep CFN Current Product Qty by orderID productID
      orderProductQtyByOrderIDProductIDRep = await ShareFunc.getRepCFNCurrentProductQtyByOrderIDProductID(companyID, factoryID, nodeID, productStatusArr);
      // console.log(orderProductQtyByOrderIDProductIDRep);
      // console.log(' 3 - getRepCFNCurrentProductQtyByOrderIDProductID');
    }

    // console.log(' 4 - getRepCFNCurrentProductBundleList');
    if (repListNameArr.includes('getRepCFNCurrentProductBundleList')) {
      // ## get Rep CFN Current Product bundle list
      orderProductQtyBundleListRep = await ShareFunc.getRepCFNCurrentProductBundleList(companyID, factoryID, nodeID, productStatusArr);
      // console.log(orderProductQtyBundleListRep);    
    }

    // console.log(' 5 - getAllOrderAndProductFromOrderProduction');
    if (repListNameArr.includes('getAllOrderAndProductFromOrderProduction')) {
      // ## get all order product from orderProduction
      // const allOrder = await ShareFunc.getAllOrderFromOrderProductionCFN(companyID, factoryID, nodeID, productStatusArr);
      let productsX = [];
      await this.asyncForEach(orderProductQtyByOrderIDProductIDRep, async (item1) => {
        productsX.push(item1.productID);
      });
      // const allProduct = await ShareFunc.getAllProductFromOrderProductionCFN(companyID, factoryID, nodeID, productStatusArr);
      // console.log(' 5.1');
      // console.log(allOrder, allProduct);
      // getOrders= async (companyID, statusArr, page, limit)
      orders = await ShareFunc.getOrdersFromNode(companyID, ['open'], 1, 100);
      // console.log(' 5.2');
      products = await ShareFunc.getProductsByProductIDs(companyID, productsX, 1, 100);
      // console.log(' 5.3');
      // console.log(orders, products);
    }

    // console.log(' 6 - getRepCFNProductState');
    // ## style-targetPlace-year-5color-size-sex-#####    /   8   4	  2   10    3    1   99999
    if (repListNameArr.includes('getRepCFNProductState')) {
      // // ## get Rep CFN Current Product state style-targetPlace-year-5color-size-sex
      // productStateStyle = await ShareFunc.getRepCFNProductStateStyle(companyID, factoryID, nodeID, productStatusArr);
      // // console.log(productStateStyle);
      // productStateTargetPlace = await ShareFunc.getRepCFNProductStateTargetPlace(companyID, factoryID, nodeID, productStatusArr);
      // // console.log(productStateTargetPlace);
      // productStateColor = await ShareFunc.getRepCFNProductStateColor(companyID, factoryID, nodeID, productStatusArr);
      // // console.log(productStateColor);
      // productStateSize = await ShareFunc.getRepCFNProductStateSize(companyID, factoryID, nodeID, productStatusArr);
      // // console.log(productStateSize);
      productStateStyleTargetPlaceColorSize = await ShareFunc.getRepCFNProductStateStyleTargetPlaceColorSize(companyID, factoryID, nodeID, productStatusArr);
      // console.log(productStateStyleTargetPlaceColorSize);
      // console.log(' 6---- - getRepCFNProductState');
    }

    // console.log(' 7 - getRepCFNCurrentProductionQueueCFN');
    if (repListNameArr.includes('getRepCFNCurrentProductionQueueCFN')) {
      // ## get Rep CFN Current Production Queue
      // exports.getProductionQueueCFN= async (companyID, factoryID, page, limit)
      queueInfoRep = await ShareFunc.getProductionQueueCFN(companyID, factoryID, 1, 20);
      // console.log(queueInfoRep);
    }

    // console.log(' 8 - getRepCFNCurrentProductAllDetail');
    if (repListNameArr.includes('getRepCFNCurrentProductAllDetail')) {
      // ## get Rep CFN Current Production Queue
      // exports.getProductionQueueCFN= async (companyID, factoryID, page, limit)
      // currentProductAllDetailCFN = await ShareFunc.getCFNCurrentProductAllDetail(companyID, factoryID, nodeID, productStatusArr);
      currentProductAllDetailCFN = [];
    }

    // console.log(' 8.1 - getRepCFNCurrentProductAllDetailCount');
    if (repListNameArr.includes('getRepCFNCurrentProductAllDetailCount')) {
      // ## get Rep CFN Current Production Queue
      // exports.getProductionQueueCFN= async (companyID, factoryID, page, limit)
      // currentProductAllDetailCFN = await ShareFunc.getCFNCurrentProductAllDetailCount(companyID, factoryID, nodeID, productStatusArr);
    }

    // console.log(' 9 - getRepCFNCurrentProductAllRepairCount');
    // 'getRepCFNCurrentProductAllRepairCount',
    if (repListNameArr.includes('getRepCFNCurrentProductAllRepairCount')) {
      productionRepairCount = await ShareFunc.getCFNCurrentProductAllRepairCount(companyID, factoryID, nodeID, productProbelmStatusArr);
    }

    // console.log(' 10 -  getRepCFNCurrentProductAllProblemCount');
    // 'getRepCFNCurrentProductAllProblemCount',
    if (repListNameArr.includes('getRepCFNCurrentProductAllProblemCount')) {
      productionProblemCount = await ShareFunc.getCFNCurrentProductAllProblemCount(companyID, factoryID, nodeID, productProbelmStatusArr);
    }

    // await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    // console.log(' ---------- end  query ------------------');
    repDataFormat1 = {
      allProductQty: allProductQty,
      orderProductQtyByOrderIDRep: orderProductQtyByOrderIDRep,
      orderProductQtyByOrderIDProductIDRep: orderProductQtyByOrderIDProductIDRep,
      orderProductQtyBundleListRep: orderProductQtyBundleListRep,
      orderIDs: orderIDs,
      orders: orders,
      products: products,
      productStateStyle: productStateStyle,
      productStateTargetPlace: productStateTargetPlace,
      productStateColor: productStateColor,
      productStateSize: productStateSize,
      productStateStyleTargetPlaceColorSize: productStateStyleTargetPlaceColorSize,
      queueInfoRep: queueInfoRep,
      // currentProductAllDetailCFN: currentProductAllDetailCFN,
      // productionRepairCount: productionRepairCount,
      // productionProblemCount: productionProblemCount,
      currentProductAllDetailCFN: undefined,
      productionRepairCount: undefined,
      productionProblemCount: undefined,
    };
    // console.log(' ---------- end  query ------------------');
    const token = '';
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      repListNameArr: repListNameArr,
      repDataFormat1: repDataFormat1,
      // orders: orders,
      // products: products,
      // orderProductAllQtyRep: orderProductAllQtyRep,
      // factory: factory,
      // nodeStation: nodeStation,
      // nodeFlows: nodeFlows,
      // nodeFlow: nodeFlow
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp001', 
        mode:'errRepCurrentProductQty', 
        value: "error report current product qty"
      }
    });
  }
}

// // ## get node getRepCurrentProductQtyAllCFNode
// router.get("/node/rep5/current/productqty/all/cfnode/:companyID/:factoryIDArr/:ordertatus/:productStatus",
//         checkAuth, checkUUID, reportController.getRepCurrentProductQtyAllCFNode);
exports.getRepCurrentProductQtyAllCFNode = async (req, res, next) => {
  // try {} catch (err) {}
  // ## CF = /:companyID/:factoryID
  // console.log('getRepCurrentProductQtyAllCFNode');
  const companyID = req.params.companyID;
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  // const nodeID = req.params.nodeID;
  const productStatusArr = JSON.parse(req.params.productStatus);
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  // const orderStatusArr = JSON.parse(req.params.ordertatus);
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, factoryIDArr, productStatusArr);
  try {
    // const orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);

    // ## get Rep C Current company Production  all
    const orderProductCFNodeRep = await ShareFunc.getCurrentProductQtyAllCFNode(companyID, factoryIDArr, productStatusArr, orderIDArr);
    // console.log(orderProductCFNodeRep);
    // ## get Rep CF Current factory Production  all
    // const currentProductQtyAllCF = await ShareFunc.getCFCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr);
    
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: '',
      expiresIn: process.env.expiresIn,
      orderProductCFNodeRep: orderProductCFNodeRep,
      // currentProductQtyAllCF: currentProductQtyAllCF,

    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp006', 
        mode:'errRepCurrentCompanyFactoryNodeProductionAll', 
        value: "error report current company factory node production all"
      }
    });
  }
}

// // ## get node getRepCurrentProductQtyAllCF
// router.get("/node/rep2/current/productqty/all/cf/:companyID/:factoryIDArr/:ordertatus/:productStatus",
//         checkAuth, checkUUID, reportController.getRepCurrentProductQtyAllCF);
exports.getRepCurrentProductQtyAllCF = async (req, res, next) => {
  // try {} catch (err) {}
  // ## CF = /:companyID/:factoryID
  // console.log('getRepCurrentProductQtyAllCF');
  const companyID = req.params.companyID;
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  // const nodeID = req.params.nodeID;
  const productStatusArr = JSON.parse(req.params.productStatus);
  const orderStatusArr = JSON.parse(req.params.ordertatus);
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, factoryIDArr, productStatusArr);
  try {
    // const orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);

    // ## get Rep C Current company Production  all
    const currentProductQtyAllC = await ShareFunc.getCCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr, orderIDArr);

    // ## get Rep CF Current factory Production  all
    const currentProductQtyAllCF = await ShareFunc.getCFCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr, orderIDArr);
    
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      currentProductQtyAllC: currentProductQtyAllC,
      currentProductQtyAllCF: currentProductQtyAllCF,
      // orderStyleColorSize: orderStyleColorSize,
      // products: products,
      // orderProductAllQtyRep: orderProductAllQtyRep,
      // factory: factory,
      // nodeStation: nodeStation,
      // nodeFlows: nodeFlows,
      // nodeFlow: nodeFlow
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp003', 
        mode:'errRepCurrentFactoryProductionAll', 
        value: "error report current factory production all"
      }
    });
  }
}

// // ## get node getRepCurrentProductQtyAllCFactory
// router.get("/node/rep4/current/productqty/all/cf/:companyID/:factoryIDArr/:productStatus",
//         checkAuth, checkUUID, reportController.getRepCurrentProductQtyAllCFactory);
exports.getRepCurrentProductQtyAllCFactory = async (req, res, next) => {
  // try {} catch (err) {}
  // ## CF = /:companyID/:factoryID
  // console.log('getRepCurrentProductQtyAllCF');
  const companyID = req.params.companyID;
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  // const nodeID = req.params.nodeID;
  const productStatusArr = JSON.parse(req.params.productStatus);
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, factoryIDArr, productStatusArr);
  // console.log(orderIDArr);
  try {
    // const orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);

    // ## get Rep C Current company Production  all
    // const currentProductQtyAllC = await ShareFunc.getCCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr);

    // ## get Rep CF Current factory Production  all
    const currentProductQtyAllCF = await ShareFunc.getCFCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr, orderIDArr);
    
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      // currentProductQtyAllC: currentProductQtyAllC,
      currentProductQtyAllCF: currentProductQtyAllCF,
      // orderStyleColorSize: orderStyleColorSize,
      // products: products,
      // orderProductAllQtyRep: orderProductAllQtyRep,
      // factory: factory,
      // nodeStation: nodeStation,
      // nodeFlows: nodeFlows,
      // nodeFlow: nodeFlow
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp003-1', 
        mode:'errRepCurrentFactoryProductionAll', 
        value: "error report current factory production all"
      }
    });
  }
}


exports.findCompleteQty =  (companyCurrentProductQtyCompleteAll, companyID, orderID, productID, style) => {
  // console.log(companyCurrentProductQtyCompleteAll, companyID, orderID, productID, style);
  const completeQtyArr =  companyCurrentProductQtyCompleteAll.filter(i=>(
    i.companyID == companyID && i.orderID == orderID && i.productID == productID && i.style == style
  ));
  if (completeQtyArr.length > 0) {
    return completeQtyArr[0].countQty;
  }
  return 0;
}

// ## get node getRepCurrentProductionOverview
exports.getRepCurrentProductionOverview = async (req, res, next) => {
  // try {} catch (err) {}
  // ## CF = /:companyID/:factoryID
  // console.log('getRepCurrentProductionOverview');
  const companyID = req.params.companyID;
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  const productStatusArr = JSON.parse(req.params.productStatus); // ['normal', 'problem', 'repaired'];
  const orderStatusArr = JSON.parse(req.params.ordertatus);
  const productStatusCompleteArr = ['complete'];
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  const seasonYear = req.params.seasonYear;
  // console.log(seasonYear , orderIDArr);

  try {
    // console.log('0');
    // const orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);

    // ## all in production
    const currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr, orderIDArr);
    // console.log('1');




    // // ## get factory relate to   /  OrderProduction.aggregate
    // const currentFactoryOrder = await ShareFunc.getCurrentCFactoryOrder(companyID, orderIDArr);
    // console.log('2');

    // //   OrderProduction.aggregate
    // let companyCurrentProductQtyAllF = await ShareFunc.getCompanyCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr, orderIDArr);
    // console.log('3');

    // //   OrderProduction.aggregate
    // const companyCurrentProductQtyCompleteAll = await ShareFunc.getCompanyCurrentProductQtyAll(companyID, factoryIDArr, productStatusCompleteArr, orderIDArr);
    // console.log('4');

    // ## get factory relate to   /  OrderProduction.aggregate
    // get_auto_getCurrentCFactoryOrder= async (companyID, seasonYear, sName)
    const sName1 = 'auto_getCurrentCFactoryOrder';
    const currentFactoryOrder = await ShareFunc.get_auto_getCurrentCFactoryOrder(companyID, seasonYear, sName1);
    // console.log('2');

    const sName2 = 'auto_getCompanyCurrentProductQtyAll_No_C';
    const sNote2 = 'noComplete';
    // get_auto_getCompanyCurrentProductQtyAll= async (companyID, seasonYear, sName, sNote)
    let companyCurrentProductQtyAllF = await ShareFunc.get_auto_getCompanyCurrentProductQtyAll(companyID, seasonYear, sName2, sNote2);
    // console.log('3');

    const sName3 = 'auto_getCompanyCurrentProductQtyAll_C';
    const sNote3 = 'completed';
    const companyCurrentProductQtyCompleteAll = await ShareFunc.get_auto_getCompanyCurrentProductQtyAll(companyID, seasonYear, sName3, sNote3);
    // console.log('4');

    const companyCurrentProductQtyAllFF = await companyCurrentProductQtyAllF.map(  (fw) => ({
      companyID: fw.companyID, 
      orderID: fw.orderID,
      productID: fw.productID,
      style: fw.style,
      countQty: fw.countQty,
      completeQty:  this.findCompleteQty(companyCurrentProductQtyCompleteAll, fw.companyID, fw.orderID, fw.productID, fw.style),
    }));
    // console.log('3');
    const companyCurrentProductQtyAll = await companyCurrentProductQtyAllFF.map(  (fw) => ({
      companyID: fw.companyID, 
      orderID: fw.orderID,
      productID: fw.productID,
      style: fw.style,
      countQty: fw.countQty,
      completeQty:  fw.completeQty,
      remainQty: 0
      // remainQty: fw.countQty - fw.completeQty
    }));

    
    // console.log('console.log(companyCurrentProductQtyAll');

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      currentOrderStyle: currentOrderStyle,
      currentFactoryOrder: currentFactoryOrder,

      // currentCompanyOrderCountry: [], // currentCompanyOrderCountry,
      // currentCompanyOrderZone: currentCompanyOrderZone,

      // currentCompanyOrderZoneStyle: currentCompanyOrderZoneStyle,
      // currentCompanyOrderCountryStyle: [], // currentCompanyOrderCountryStyle,

      companyCurrentProductQtyAll: companyCurrentProductQtyAll,
      // companyCurrentProductQtyCompleteAll: companyCurrentProductQtyCompleteAll,

      // currentCompanyProductQtyZoneAll: currentCompanyProductQtyZoneAll,
      // currentCompanyProductQtyZoneCompleteAll: currentCompanyProductQtyZoneCompleteAll,

      // currentProductListAllC: currentProductListAllC, // ## for check error
      // currentProductQtyAllC: currentProductQtyAllC,
      // currentProductQtyAllCompleteC: currentProductQtyAllCompleteC,

      // currentCompanyProductQtyCountryAll: currentCompanyProductQtyCountryAll,
      // currentCompanyProductQtyCountryCompleteAll: currentCompanyProductQtyCountryCompleteAll,

      // currentCompanyProductQtyCountryCSAll: currentCompanyProductQtyCountryCSAll,
      // currentCompanyProductQtyCountryCSCompleteAll: currentCompanyProductQtyCountryCSCompleteAll,

      currentCompanyProductQtyCountryAll: [],
      currentCompanyProductQtyCountryCompleteAll: [],

      currentCompanyProductQtyCountryCSAll: [],
      currentCompanyProductQtyCountryCSCompleteAll: [],

      // orderStyleColorSize: orderStyleColorSize,

    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp005', 
        mode:'errRepCurrentCompanyProductionAll', 
        value: "error report current company production all"
      }
    });
  }
}

// ## get node getRepCNCurrentProductQtyNode
// router.get("/node/rep11/cn/current/productqty/:companyID/:factoryIDArr/:ordertatus/:productStatus/:orderIDArr/:toNodeArr", checkAuth, checkUUID, 
//         reportController.getRepCNCurrentProductQtyNode);
exports.getRepCNCurrentProductQtyNode = async (req, res, next) => {
  // ## CN = /:companyID/:nodeID
  // console.log('getRepCNCurrentProductQtyNode');
  const companyID = req.params.companyID;
  // const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  // const nodeID = req.params.nodeID;
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  const productStatusArr = JSON.parse(req.params.productStatus);
  const orderStatusArr = JSON.parse(req.params.ordertatus);
  // const productStatusCompleteArr = ['complete'];
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  const toNodeArr = JSON.parse(req.params.toNodeArr);
  // console.log(companyID, factoryIDArr, productStatusArr, orderStatusArr, orderIDArr, toNodeArr);
  try {

    // ## get production each node + outsource
    const currentProductionNodeQty = 
      await ShareFunc.getCNCurrentProductionNodeQty(companyID, orderStatusArr, productStatusArr, orderIDArr, toNodeArr);

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      currentProductionNodeQty: currentProductionNodeQty,

      // currentCompanyOrderCountry: currentCompanyOrderCountry, // currentCompanyOrderCountry,
      // currentCompanyOrderZone: currentCompanyOrderZone,

      // currentCompanyOrderZoneStyle: currentCompanyOrderZoneStyle,
      // currentCompanyOrderCountryStyle: currentCompanyOrderCountryStyle, // currentCompanyOrderCountryStyle,

      // companyCurrentProductQtyAll: companyCurrentProductQtyAll,
      // companyCurrentProductQtyCompleteAll: companyCurrentProductQtyCompleteAll,

      // currentCompanyProductQtyZoneAll: currentCompanyProductQtyZoneAll,
      // currentCompanyProductQtyZoneCompleteAll: currentCompanyProductQtyZoneCompleteAll,

      // currentProductListAllC: currentProductListAllC, // ## for check error
      // currentProductQtyAllC: currentProductQtyAllC,
      // currentProductQtyAllCompleteC: currentProductQtyAllCompleteC,

      // currentCompanyProductQtyCountryAll: currentCompanyProductQtyCountryAll,
      // currentCompanyProductQtyCountryCompleteAll: currentCompanyProductQtyCountryCompleteAll,

      // currentCompanyProductQtyCountryCSAll: currentCompanyProductQtyCountryCSAll,
      // currentCompanyProductQtyCountryCSCompleteAll: currentCompanyProductQtyCountryCSCompleteAll,

      // currentCompanyProductQtyCountryAll: [],
      // currentCompanyProductQtyCountryCompleteAll: [],

      // currentCompanyProductQtyCountryCSAll: [],
      // currentCompanyProductQtyCountryCSCompleteAll: [],

      // orderStyleColorSize: orderStyleColorSize,

    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp015', 
        mode:'errRepProgressNode', 
        value: "error report progress node"
      }
    });
  }
}

// // ## get node getRepCurrentProductQtyCom
// router.get("/node/rep3/current/productqty/com/:companyID/:factoryIDArr/:ordertatus/:productStatus", checkAuth, checkUUID, 
//         reportController.getRepCurrentProductQtyCom);
exports.getRepCurrentProductQtyCom = async (req, res, next) => {
  // try {} catch (err) {}
  // ## CF = /:companyID/:factoryID
  // console.log('getRepCurrentProductQtyCom');
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  // const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  // const nodeID = req.params.nodeID;
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  const productStatusArr = JSON.parse(req.params.productStatus); // ['normal', 'problem', 'repaired'];
  const orderStatusArr = JSON.parse(req.params.ordertatus); // ['open'];
  const productStatusCompleteArr = ['complete'];
  const orderIDArr = JSON.parse(req.params.orderIDArr);

  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, factoryIDArr, productStatusArr, orderStatusArr);
  // console.log(orderIDArr);
  try {
    // console.log('0');
    // const orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
    // ## all in production
    const currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr, orderIDArr);
    // console.log('1');

    // exports.getCompanyCurrentProductQtyAll = async (companyID, factoryIDArr, productStatusArr)
    let companyCurrentProductQtyAllF = await ShareFunc.getCompanyCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr, orderIDArr);
    const companyCurrentProductQtyCompleteAll = await ShareFunc.getCompanyCurrentProductQtyAll(companyID, factoryIDArr, productStatusCompleteArr, orderIDArr);
    // console.log('2' , companyCurrentProductQtyAllF.length, companyCurrentProductQtyCompleteAll.length);

    const companyCurrentProductQtyAllFF = await companyCurrentProductQtyAllF.map(  (fw) => ({
      companyID: fw.companyID, 
      orderID: fw.orderID,
      productID: fw.productID,
      style: fw.style,
      countQty: fw.countQty,
      completeQty:  this.findCompleteQty(companyCurrentProductQtyCompleteAll, fw.companyID, fw.orderID, fw.productID, fw.style),
    }));
    // console.log('3', companyCurrentProductQtyAllFF.length);
    const companyCurrentProductQtyAll = await companyCurrentProductQtyAllFF.map(  (fw) => ({
      companyID: fw.companyID, 
      orderID: fw.orderID,
      productID: fw.productID,
      style: fw.style,
      countQty: fw.countQty,
      completeQty:  fw.completeQty,
      remainQty: 0
      // remainQty: fw.countQty - fw.completeQty
    }));
    // console.log('4' , companyCurrentProductQtyAll.length);


    // console.log(companyCurrentProductQtyAll);
    const currentCompanyOrderCountry = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr, orderIDArr);
    const currentCompanyOrderZone = await ShareFunc.getCurrentCompanyOrderZone(companyID, orderStatusArr, orderIDArr);
    // console.log('5');

    const currentCompanyOrderZoneStyle = await ShareFunc.getCurrentCompanyOrderZoneStyle(companyID, orderStatusArr, orderIDArr);
    const currentCompanyOrderCountryStyle = await ShareFunc.getCurrentCompanyOrderCountryStyle(companyID, orderStatusArr, orderIDArr);
    // console.log('6');
    
    // getComFCurrentProductQtyAll = async (companyID, factoryIDArr, productStatusArr)
    const currentCompanyProductQtyZoneAll = await ShareFunc.getComCurrentProductQtyZoneAll(companyID, factoryIDArr, productStatusArr, orderIDArr);
    // console.log('7', currentCompanyProductQtyZoneAll.length);
    const currentCompanyProductQtyZoneCompleteAll = await ShareFunc.getComCurrentProductQtyZoneAll(companyID, factoryIDArr, productStatusCompleteArr, orderIDArr);
    // console.log('8', currentCompanyProductQtyZoneCompleteAll.length);

    // ## get Rep C Current company Production  all
    // ## for check error    currentProductListAllC
    // const currentProductListAllC = await ShareFunc.getCCurrentProductQtyAllList(companyID, factoryIDArr, productStatusArr, orderIDArr);
    const currentProductListAllC = []
    // console.log('9');
    const currentProductQtyAllC = await ShareFunc.getCCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr, orderIDArr);
    // console.log('10', currentProductQtyAllC.length);
    const currentProductQtyAllCompleteC = await ShareFunc.getCCurrentProductQtyAll(companyID, factoryIDArr, productStatusCompleteArr, orderIDArr);
    // console.log('11', currentProductQtyAllCompleteC.length);

    // // ##  for country
    // const currentCompanyProductQtyCountryAll = await ShareFunc.getComCurrentProductQtyCountryAll(companyID, factoryIDArr, productStatusArr, orderIDArr);
    // const currentCompanyProductQtyCountryCompleteAll = await ShareFunc.getComCurrentProductQtyCountryAll(companyID, factoryIDArr, productStatusCompleteArr, orderIDArr);
    
    // //## cs = color size
    // const currentCompanyProductQtyCountryCSAll = await ShareFunc.getComCurrentProductQtyCountryCSAll(companyID, factoryIDArr, productStatusArr, orderIDArr);
    // const currentCompanyProductQtyCountryCSCompleteAll = await ShareFunc.getComCurrentProductQtyCountryCSAll(companyID, factoryIDArr, productStatusCompleteArr, orderIDArr);
    
    // console.log('console.log(companyCurrentProductQtyAll');

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      currentOrderStyle: currentOrderStyle,

      currentCompanyOrderCountry: currentCompanyOrderCountry, // currentCompanyOrderCountry,
      currentCompanyOrderZone: currentCompanyOrderZone,

      currentCompanyOrderZoneStyle: currentCompanyOrderZoneStyle,
      currentCompanyOrderCountryStyle: currentCompanyOrderCountryStyle, // currentCompanyOrderCountryStyle,

      companyCurrentProductQtyAll: companyCurrentProductQtyAll,
      companyCurrentProductQtyCompleteAll: companyCurrentProductQtyCompleteAll,

      currentCompanyProductQtyZoneAll: currentCompanyProductQtyZoneAll,
      currentCompanyProductQtyZoneCompleteAll: currentCompanyProductQtyZoneCompleteAll,

      currentProductListAllC: currentProductListAllC, // ## for check error
      currentProductQtyAllC: currentProductQtyAllC,
      currentProductQtyAllCompleteC: currentProductQtyAllCompleteC,

      // currentCompanyProductQtyCountryAll: currentCompanyProductQtyCountryAll,
      // currentCompanyProductQtyCountryCompleteAll: currentCompanyProductQtyCountryCompleteAll,

      // currentCompanyProductQtyCountryCSAll: currentCompanyProductQtyCountryCSAll,
      // currentCompanyProductQtyCountryCSCompleteAll: currentCompanyProductQtyCountryCSCompleteAll,

      currentCompanyProductQtyCountryAll: [],
      currentCompanyProductQtyCountryCompleteAll: [],

      currentCompanyProductQtyCountryCSAll: [],
      currentCompanyProductQtyCountryCSCompleteAll: [],

      // orderStyleColorSize: orderStyleColorSize,

    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp005', 
        mode:'errRepCurrentCompanyProductionAll', 
        value: "error report current company production all"
      }
    });
  }
}

// // ## get node getRepNodeNoScanDatail
// router.get("/node/noscan2/rep/CFN/:companyID/:factoryIDArr/:nodeID/:orderIDArr/:targetPlaceID/:color/:size/:infoTypeArr/:page/:limit", 
//         reportController.getRepNodeNoScanDatail);
exports.getRepNodeNoScanDatail = async (req, res, next) => {
  // try {} catch (err) {}
  // ## CFN = /:companyID/:factoryID/:nodeID
  const companyID = req.params.companyID;
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  const nodeID = req.params.nodeID;
  // const orderID = req.params.orderID;
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  const targetPlaceID = req.params.targetPlaceID;
  const color = req.params.color;
  const size = req.params.size;
  const infoTypeArr = JSON.parse(req.params.infoTypeArr); // ## ['mainData', 'detailData'] / no 'mainData'
  // const date12Arr = JSON.parse(req.params.date12);  // have 2 date
  const page = +req.params.page;
  const limit = +req.params.limit;
  const statusArr = ['normal', 'complete'];

  // console.log('getRepNodeNoScanDatail');
  // console.log(factoryIDArr, nodeID, orderIDArr, infoTypeArr, targetPlaceID, color, size, page, limit);

  try {
    // ## menu was selected
    let mainDataBundleNoScanDetail = [];
    let mainDataBundleNoScanNo = [];

    let productBarcodeArr = [];
    let bundleNoArr = [];
    let bundleIDArr = [];
    if (infoTypeArr.includes('detailData')) {
      const mainDataBundleNoScanDetailF = 
        await ShareFunc.getRepCFNCurrentMainDataBundleNoscanDetail(
          companyID, factoryIDArr, nodeID, orderIDArr, statusArr, 
          targetPlaceID, color, size, page, limit
        );
      mainDataBundleNoScanDetail = mainDataBundleNoScanDetailF;  // ## current bundle no scan
      // console.log(mainDataBundleNoScanDetail);

      // ## get productBarcode, bundleNo, bundleID
      await this.asyncForEach(mainDataBundleNoScanDetail, async (item1) => {
        if (!productBarcodeArr.includes(item1.productBarcode)) {productBarcodeArr.push(item1.productBarcode);}
        if (!bundleNoArr.includes(item1.bundleNo)) {bundleNoArr.push(item1.bundleNo);}
        if (!bundleIDArr.includes(item1.bundleID)) {bundleIDArr.push(item1.bundleID);}
      });
      // console.log(productBarcodeArr, bundleNoArr, bundleIDArr);

      const mainDataBundleNoScanDetailFF = 
        await ShareFunc.getRepCFNCurrentMainDataBundleNoscanProductBarcode(
          companyID, factoryIDArr, nodeID, orderIDArr, statusArr,
          productBarcodeArr, bundleNoArr, bundleIDArr
        );
      mainDataBundleNoScanNo = mainDataBundleNoScanDetailFF;  // ## current bundle no scan , barcodeNo
    }
    // console.log(mainDataBundleNoScanDetail);

    res.status(200).json({
      token: '',
      expiresIn: process.env.expiresIn,
      mainDataBundleNoScanDetail: [],
      mainDataBundleNoScanNo: mainDataBundleNoScanNo,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp014-1', 
        mode:'errRepNodeIDNoScanDetail', 
        value: "error report nodeID no scan detail"
      }
    });
  }

}

// // ## get node getRepNodeNoScan
// router.get("/node/noscan1/rep/CFN/:companyID/:factoryIDArr/:nodeID/:orderIDsArr/:infoTypeArr", 
//         reportController.getRepNodeNoScan);
exports.getRepNodeNoScan = async (req, res, next) => {
  // try {} catch (err) {}
  // ## CFN = /:companyID/:factoryID/:nodeID
  const companyID = req.params.companyID;
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  const nodeID = req.params.nodeID;
  const orderIDs = JSON.parse(req.params.orderIDsArr);
  const orderIDArr = JSON.parse(req.params.orderIDsArr);
  const infoTypeArr = JSON.parse(req.params.infoTypeArr); // ## ['mainData', 'detailData']
  // const date12Arr = JSON.parse(req.params.date12);  // have 2 date
  const statusArr = ['normal', 'complete'];

  // console.log('getRepNodeNoScan');
  // console.log(factoryIDArr, nodeID, orderIDs, infoTypeArr);

  try {
    
    // ## main for show on tab selector
    let mainDataBundleNoScan = [];
    if (infoTypeArr.includes('mainData')) {
      const mainDataBundleNoScanF = await ShareFunc.getRepCFNCurrentMainDataBundleNoscan(companyID, factoryIDArr, nodeID, orderIDArr, statusArr);
      mainDataBundleNoScan = mainDataBundleNoScanF;  // ## current bundle no scan
    }

    // if (repListNameArr.includes('allTotalProduct')) {
    //   const mainDataBundleNoScanF = await ShareFunc.getRepCFNCurrentMainDataBundleNoscan(companyID, factoryID, nodeID, productStatusArr);
    //   mainDataBundleNoScan = mainDataBundleNoScanF;  // ## current all product qty in nodeID 
    //   // console.log(' 0 - allTotalProduct -->             allProductQty  ===' , allProductQty);
    // }


    // ## menu was selected
    if (infoTypeArr.includes('detailData')) {

    }


    res.status(200).json({
      token: '',
      expiresIn: process.env.expiresIn,
      mainDataBundleNoScan: mainDataBundleNoScan,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp014', 
        mode:'errRepNodeIDNoScan', 
        value: "error report nodeID no scan"
      }
    });
  }
}


// // ## get node getRepNodeStaffScannedByDate12
// router.get("/node/scan1/rep/current/productqty/com/:companyID/:factoryIDArr/:orderIDsArr/:date12/:infoType", checkAuth, checkUUID, 
//         reportController.getRepNodeStaffScannedByDate12);
// ##  infoType = call by who {staffOffice, 'staffProduction'}
exports.getRepNodeStaffScannedByDate12 = async (req, res, next) => { 
  // try {} catch (err) {}
  // ## CF = /:companyID/:factoryID
  // console.log('getRepNodeStaffScannedByDate12');
  const companyID = req.params.companyID;
  const infoType = req.params.infoType;  // ##  infoType = call by who {staffOffice, 'staffProduction'}
  // const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  // const nodeID = req.params.nodeID;
  const orderIDs = JSON.parse(req.params.orderIDsArr);
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  const date12Arr = JSON.parse(req.params.date12);  // have 2 date
  const statusArr = ['normal', 'complete'];
  // const orderStatusArr = JSON.parse(req.params.ordertatus);
  // console.log(companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr);
  // console.log(orderIDs);
  try {

    // ## report staff scanned by date1 - date2
    // console.log(date12Arr[0], date12Arr[1]);
    const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+07:00'));
    const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));
    // console.log(companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr);
    
    // console.log('1111');
    const nodeScanProductStyle = await ShareFunc.getCFStaffScannedByDate12Style(companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr);
    // console.log('222');
    const nodeScanProductStyleZone = await ShareFunc.getCFStaffScannedByDate12StyleZone(companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr);
    // console.log('333');

    // const nodeScanProductStyleZoneColorSize = await ShareFunc.getCFStaffScannedByDate12StyleZoneColorSize(companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr);
    // console.log(nodeScanProductStyleZoneColorSize);
    const nodeScanProductStyleZoneColorSize = [];

    
    // ## const infoType = req.params.infoType;  // ##  infoType = call by who {staffOffice, 'staffProduction'}
    let token = '';
    if (infoType === 'staffOffice') {
      token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    }
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,

      nodeScanProductStyle: nodeScanProductStyle,
      nodeScanProductStyleZone: nodeScanProductStyleZone,
      nodeScanProductStyleZoneColorSize: nodeScanProductStyleZoneColorSize,


    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp010', 
        mode:'errRepStaffScanned', 
        value: "error report staff scanned"
      }
    });
  }
}

// // ## get node getRepNodeStaffScannedByStyleZoneDate12
// router.get("/node/scan2/rep/CF/staff/:companyID/:factoryIDArr/:orderIDsArr/:zoneArr/:nodeID/:date12/:infoType", 
//         reportController.getRepNodeStaffScannedByStyleZoneDate12);
// ##  infoType = call by who {staffOffice, 'staffProduction'}
exports.getRepNodeStaffScannedByStyleZoneDate12 = async (req, res, next) => { 
  // try {} catch (err) {}
  // ## CF = /:companyID/:factoryID
  // console.log('getRepNodeStaffScannedByStyleZoneDate12');
  const companyID = req.params.companyID;
  const infoType = req.params.infoType;  // ##  infoType = call by who {staffOffice, 'staffProduction'}
  // const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  const nodeID = req.params.nodeID;
  const orderIDs = JSON.parse(req.params.orderIDsArr);
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  const zoneArr = JSON.parse(req.params.zoneArr);
  const date12Arr = JSON.parse(req.params.date12);  // have 2 date
  const statusArr = ['normal', 'complete'];
  // const orderStatusArr = JSON.parse(req.params.ordertatus);

  let i = 0;
  await this.asyncForEach(zoneArr, async (item1) => {
    zoneArr[i] = await ShareFunc.setBackStrLen(4, item1, '-');
    i++;
  });

  // console.log(companyID, factoryIDArr, orderIDs, zoneArr, nodeID, statusArr);

  // const zone = await ShareFunc.setBackStrLen(4, req.params.zone, '-');
  // const color = await ShareFunc.setBackStrLen(10, req.params.color, '-');
  // const size = await ShareFunc.setBackStrLen(3, req.params.size, '-');
  
  try {

    // ## report staff scanned by date1 - date2
    const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+07:00'));
    const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));
    // console.log(companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr);

    
    
    const nodeScanProductStyleZoneColorSize = 
      await ShareFunc.getCFFNStaffScannedByDate12StyleZone(companyID, factoryIDArr, orderIDs, zoneArr, nodeID, dateStart, dateEnd, statusArr);
    // console.log(nodeScanProductStyleZoneColorSize);
    // const nodeScanProductStyleZoneColorSize = [];

    
    // ## const infoType = req.params.infoType;  // ##  infoType = call by who {staffOffice, 'staffProduction'}
    let token = '';
    if (infoType === 'staffOffice') {
      token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    }
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,

      nodeScanProductStyleZoneColorSize: nodeScanProductStyleZoneColorSize,


    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp010', 
        mode:'errRepStaffScanned', 
        value: "error report staff scanned"
      }
    });
  }
}

// // ## get node getRepSubNodeScanDate12StaffOverall
// router.get("/node/scansub3/rep/CF/overall/:companyID/:factoryIDArr/:nodeIDs/:date12/:infoType/:qrCode", 
//         reportController.getRepSubNodeScanDate12StaffOverall);
exports.getRepSubNodeScanDate12StaffOverall = async (req, res, next) => { 
  // try {} catch (err) {}
  // ## CF = /:companyID/:factoryID
  // console.log('getRepSubNodeScanDate12StaffOverall');
  const companyID = req.params.companyID;
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  const nodeIDs = JSON.parse(req.params.nodeIDs);
  const infoType = req.params.infoType;  // ##  infoType = call by who {staffOffice, 'staffProduction'}
  const date12Arr = JSON.parse(req.params.date12);  // have 2 date
  const qrCode = req.params.qrCode;
  // const statusArr = ['normal', 'complete'];

  // const orderIDs = JSON.parse(req.params.orderIDsArr);
  // const zoneArr = JSON.parse(req.params.zoneArr);
  // const orderStatusArr = JSON.parse(req.params.ordertatus);

  // let i = 0;
  // await this.asyncForEach(zoneArr, async (item1) => {
  //   zoneArr[i] = await ShareFunc.setBackStrLen(4, item1, '-');
  //   i++;
  // });

  // console.log(companyID, factoryIDArr, infoType, nodeIDs, qrCode);

  // const zone = await ShareFunc.setBackStrLen(4, req.params.zone, '-');
  // const color = await ShareFunc.setBackStrLen(10, req.params.color, '-');
  // const size = await ShareFunc.setBackStrLen(3, req.params.size, '-');
  
  try {

    // ## report staff scanned by date1 - date2
    // console.log(date12Arr);
    const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+07:00'));
    const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));
    // console.log(dateStart, dateEnd);

    // ## get orderIDs
    let orderIDArr = [];
    const status = ['open']
    const page = 1;
    const limit = 10000;
    const orders = await ShareFunc.getOrdersFromNode(companyID, status, page, limit);
    await this.asyncForEach(orders, async (item1) => {
      orderIDArr.push(item1.orderID);
    });
    // console.log(orderIDArr);
    
    // ## scan subnode staff/qrcode
    const qrCodeArr = [qrCode];
    // console.log(companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd, qrCodeArr);
    const subNodeStaffScan = 
      await ShareFunc.getCFSubNodeScanDate12StaffOverall(companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd, qrCodeArr);
    // console.log(subNodeStaffScan);
    // const nodeScanProductStyleZoneColorSize = [];

    // ## scan subnode staff/qrcode Style Zone Color Size
    const subNodeStaffScanStyleZoneColorSize = 
      await ShareFunc.getCFSubNodeScanStyleZoneColorSizeDate12StaffOverall(companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd, qrCodeArr);
    // console.log(subNodeStaffScanStyleZoneColorSize);

    // // ## get staff name , userID by qrCode
    // const qrCodes = Array.from(new Set(subNodeStaffScan.map((item) => item.qrCode)));
    // console.log(qrCodes);

    
    // ## const infoType = req.params.infoType;  // ##  infoType = call by who {staffOffice, 'staffProduction'}
    let token = '';
    if (infoType === 'staffOffice') {
      token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    }
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,

      subNodeStaffScan: subNodeStaffScan,
      subNodeStaffScanStyleZoneColorSize: subNodeStaffScanStyleZoneColorSize,

    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp012', 
        mode:'errRepSubNodeScan', 
        value: "error report subnode scan"
      }
    });
  }
}


// // ## get node getRepSubNodeScanDate12Overall
// router.get("/node/scansub1/rep/CF/overall/:companyID/:factoryIDArr/:nodeIDs/:date12/:infoType", 
//         reportController.getRepSubNodeScanDate12Overall);
exports.getRepSubNodeScanDate12Overall = async (req, res, next) => { 
  // try {} catch (err) {}
  // ## CF = /:companyID/:factoryID
  // console.log('getRepSubNodeStaffScanDate12');
  const companyID = req.params.companyID;
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  const nodeIDs = JSON.parse(req.params.nodeIDs);
  const infoType = req.params.infoType;  // ##  infoType = call by who {staffOffice, 'staffProduction'}
  const date12Arr = JSON.parse(req.params.date12);  // have 2 date
  // const statusArr = ['normal', 'complete'];

  // const orderIDs = JSON.parse(req.params.orderIDsArr);
  // const zoneArr = JSON.parse(req.params.zoneArr);
  // const orderStatusArr = JSON.parse(req.params.ordertatus);

  // let i = 0;
  // await this.asyncForEach(zoneArr, async (item1) => {
  //   zoneArr[i] = await ShareFunc.setBackStrLen(4, item1, '-');
  //   i++;
  // });

  // console.log(companyID, factoryIDArr, infoType, nodeID);

  // const zone = await ShareFunc.setBackStrLen(4, req.params.zone, '-');
  // const color = await ShareFunc.setBackStrLen(10, req.params.color, '-');
  // const size = await ShareFunc.setBackStrLen(3, req.params.size, '-');
  
  try {

    // ## report staff scanned by date1 - date2
    // console.log(date12Arr);
    const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+07:00'));
    const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));
    // console.log(dateStart, dateEnd);

    // ## get orderIDs
    let orderIDArr = [];
    const status = ['open']
    const page = 1;
    const limit = 10000;
    const orders = await ShareFunc.getOrdersFromNode(companyID, status, page, limit);
    await this.asyncForEach(orders, async (item1) => {
      orderIDArr.push(item1.orderID);
    });
    // console.log(orderIDArr);
    
    // ## scan subnode
    const subNodeStaffScan = 
      await ShareFunc.getCFSubNodeScanDate12Overall(companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd);
    // console.log(subNodeStaffScan);
    // const nodeScanProductStyleZoneColorSize = [];

    // ## scan subnode Style Zone Color Size
    const subNodeStaffScanStyleZoneColorSize = 
      await ShareFunc.getCFSubNodeScanStyleZoneColorSizeDate12Overall(companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd);

    // // ## get staff name , userID by qrCode
    // const qrCodes = Array.from(new Set(subNodeStaffScan.map((item) => item.qrCode)));
    // console.log(qrCodes);

    
    // ## const infoType = req.params.infoType;  // ##  infoType = call by who {staffOffice, 'staffProduction'}
    let token = '';
    if (infoType === 'staffOffice') {
      token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    }
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,

      subNodeStaffScan: subNodeStaffScan,
      subNodeStaffScanStyleZoneColorSize: subNodeStaffScanStyleZoneColorSize,

    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp012', 
        mode:'errRepSubNodeScan', 
        value: "error report subnode scan"
      }
    });
  }
}

// // ## get node getRepSubNodeStaffScanDate12Overall
// router.get("/node/scansub2/staff/rep/CF/overall/:companyID/:factoryIDArr/:nodeIDs/:date12/:infoType", 
//         reportController.getRepSubNodeStaffScanDate12Overall);
// // // ##
exports.getRepSubNodeStaffScanDate12Overall = async (req, res, next) => { 
  // try {} catch (err) {}
  // ## CF = /:companyID/:factoryID
  // console.log('getRepSubNodeStaffScanDate12Overall....');
  const companyID = req.params.companyID;
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  const nodeIDs = JSON.parse(req.params.nodeIDs);
  const infoType = req.params.infoType;  // ##  infoType = call by who {staffOffice, 'staffProduction'}
  const date12Arr = JSON.parse(req.params.date12);  // have 2 date
  // const statusArr = ['normal', 'complete'];

  // const orderIDs = JSON.parse(req.params.orderIDsArr);
  // const zoneArr = JSON.parse(req.params.zoneArr);
  // const orderStatusArr = JSON.parse(req.params.ordertatus);

  // let i = 0;
  // await this.asyncForEach(zoneArr, async (item1) => {
  //   zoneArr[i] = await ShareFunc.setBackStrLen(4, item1, '-');
  //   i++;
  // });

  // console.log(companyID, factoryIDArr, infoType, nodeID);

  // const zone = await ShareFunc.setBackStrLen(4, req.params.zone, '-');
  // const color = await ShareFunc.setBackStrLen(10, req.params.color, '-');
  // const size = await ShareFunc.setBackStrLen(3, req.params.size, '-');
  
  try {

    // ## report staff scanned by date1 - date2
    // console.log(date12Arr);
    const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+07:00'));
    const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));
    // console.log(dateStart, dateEnd);

    // ## get orderIDs
    let orderIDArr = [];
    const status = ['open']
    const page = 1;
    const limit = 10000;
    const orders = await ShareFunc.getOrdersFromNode(companyID, status, page, limit);
    await this.asyncForEach(orders, async (item1) => {
      orderIDArr.push(item1.orderID);
    });
    // console.log(orderIDArr);
    
    
    const subNodeStaffScan = 
      await ShareFunc.getCFSubNodeStaffScanDate12Overall(companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd);
    // console.log(subNodeStaffScan);
    // const nodeScanProductStyleZoneColorSize = [];

    // ## get staff name , userID by qrCode
    const qrCodes = Array.from(new Set(subNodeStaffScan.map((item) => item.qrCode)));
    // console.log(qrCodes);

    // getStaffsByQRCodes
    const type = 's';  // ## s = staff
    const staffs = await ShareFunc.getStaffsByQRCodes(qrCodes, type);
    // console.log(staffs);
    
    // ## const infoType = req.params.infoType;  // ##  infoType = call by who {staffOffice, 'staffProduction'}
    let token = '';
    if (infoType === 'staffOffice') {
      token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    }
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,

      subNodeStaffScan: subNodeStaffScan,
      staffs: staffs,

    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errrp012', 
        mode:'errRepSubNodeScan', 
        value: "error report subnode scan"
      }
    });
  }
}


// ## report
// #############################################################

// ###################################################################################################
// ## report company order outsource ############################################################################

// router.get("/cpn/rep10/current/order/:companyID/:ordertatus", checkAuth, checkUUID, reportController.getRepCompanyOrderOutsource);
exports.getRepCompanyOrderOutsource = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getRepCompanyOrderOutsource');
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  const type = req.params.type;  // ## type = 'dt' , 'refresh' 
  // const factoryID = req.params.factoryID;
  // const nodeID = req.params.nodeID;
  const orderStatusArr = JSON.parse(req.params.ordertatus);
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, orderStatusArr);
  
  try {

    // currentOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    // currentCompanyOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    // orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
    currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr, orderIDArr);
    // console.log('0000');
    // #################################
    // ## outsource

    // ## get orderIDs  
    let orderIDs = [];
    await this.asyncForEach(currentOrderStyle, async (item1) => {
      orderIDs.push(item1.orderID);
    });
    // console.log(orderIDs);
    // console.log('1111');

    let orderProductFacOuts;
    let outsourcefactoryID = [];
    let orderProductFacOutQTY;
    let orderProductFacOutRemainQTY;
    let orderProductFacOutStyleColorSizeQTY;
    let orderProductFacOutStyleColorSizeRemainQTY;

    if (type === 'refresh') {
      
      orderProductFacOuts = await ShareFunc.getCurrentCompanyOrderOutsource(companyID, orderIDs);
      // console.log(orderProductFacOuts);
      // console.log('1');

      // let outsourcefactoryID = [];
      await this.asyncForEach(orderProductFacOuts, async (item1) => {
        outsourcefactoryID.push(item1.outsourcefactoryID);
      });
      // console.log('1.1');
      // console.log(companyID, orderIDs);
      
      // ## get outsource factory qty
      orderProductFacOutQTY = await ShareFunc.getCurrentCompanyOrderOutsourceQTY(companyID, orderIDs);
      // console.log('2');

      // ## get outsource factory qty remain
      orderProductFacOutRemainQTY = await ShareFunc.getCurrentCompanyOrderOutsourceRemianQTY(companyID, orderIDs);
      // console.log(orderProductFacOutQTY);
      // console.log(orderProductFacOutRemainQTY);
      // console.log('3');

      // ## style zone color size
      orderProductFacOutStyleColorSizeQTY = await ShareFunc.getCurrentCompanyOrderStyleColorSizeOutsourceQTY(companyID, orderIDs);
      // console.log('4');
      orderProductFacOutStyleColorSizeRemainQTY = await ShareFunc.getCurrentCompanyOrderStyleColorSizeOutsourceRemainQTY(companyID, orderIDs);
      // console.log(orderProductFacOutStyleColorSizeQTY);
      // console.log('5');

      // ##
      // ## update ProductionZonePeriodC > lastDatetime, data
      const sGroup = 'report';
      const sName = 'auto_getCompanyOrderOutsource';
      const sNote = '';
      const sMode = 'every30mn';
      const sDatetimeDiff = 30;
      const dtorderoutsourcefacUpsert  = await Dtcompanyorderoutsource.updateOne({$and: [
        {"seasonYear":seasonYear},
        {"companyID":companyID},
        // {"factoryID":factoryID}, 
        {"sGroup":sGroup}, 
        // {"sStatus":sStatus}, 
        {"sName":sName}, 
        {"sNote":sNote},
        {"sMode":sMode}, 
        {"sDatetimeDiff":sDatetimeDiff}, 
        // {"sDatetime":scheduleData.sDatetime}, 
      ]} , 
      {
        "lastDatetime": current,
        "data1": orderProductFacOuts,
        "data2": orderProductFacOutQTY,
        "data3": orderProductFacOutRemainQTY,
        "data4": orderProductFacOutStyleColorSizeQTY,
        "data5": orderProductFacOutStyleColorSizeRemainQTY,
      }, {upsert: true}); 

    } else if (type === 'dt') {
      
      // ## get data from dtCompanyOrderOutsource
      // get_auto_getCompanyOrderOutsource= async (companyID, seasonYear, sName)
      const sName = 'auto_getCompanyOrderOutsource';
      // console.log(companyID, seasonYear, sName);
      const orderProductFacOut = await ShareFunc.get_auto_getCompanyOrderOutsource(companyID, seasonYear, sName);
      // console.log(orderProductFacOut);
      
      if (orderProductFacOut) {
        orderProductFacOuts = orderProductFacOut.data1;
        await this.asyncForEach(orderProductFacOuts, async (item1) => {
          outsourcefactoryID.push(item1.outsourcefactoryID);
        });
        orderProductFacOutQTY = orderProductFacOut.data2;
        orderProductFacOutRemainQTY = orderProductFacOut.data3;
        orderProductFacOutStyleColorSizeQTY = orderProductFacOut.data4;
        orderProductFacOutStyleColorSizeRemainQTY = orderProductFacOut.data5;
  
      } else {
        return res.status(501).json({
          message: {
            messageID: 'errrp002', 
            mode:'errRepCurrentCompanyOrder', 
            value: "error report current company order"
          }
        });
      }
    }

    // console.log('0' || '1');
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn) || '';
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      orderIDs: orderIDs,
      // orderStyleColorSize: orderStyleColorSize,
      // currentCompanyOrder: currentCompanyOrder,
      currentOrderStyle: currentOrderStyle,
      outsourcefactoryID: outsourcefactoryID,
      orderProductFacOutQTY: orderProductFacOutQTY,
      orderProductFacOutRemainQTY: orderProductFacOutRemainQTY,
      orderProductFacOutStyleColorSizeQTY: orderProductFacOutStyleColorSizeQTY,
      orderProductFacOutStyleColorSizeRemainQTY: orderProductFacOutStyleColorSizeRemainQTY,
      // nodeStation: nodeStation,
      // nodeFlows: nodeFlows,
      // nodeFlow: nodeFlow
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errrp002', 
        mode:'errRepCurrentCompanyOrder', 
        value: "error report current company order"
      }
    });
  }
}

exports.getRepCompanyOrderOutsource2 = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getRepCompanyOrderOutsource2');

  const companyID = req.params.companyID;
  let seasonYear = req.params.seasonYear;
  // const factoryID = req.params.factoryID;
  // const nodeID = req.params.nodeID;
  const orderStatusArr = JSON.parse(req.params.ordertatus);
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, orderStatusArr);
  // console.log(seasonYear, orderIDArr);
  try {

    const seasonYear1 = await ShareFunc.getCompanyCurrentSeasonYear(companyID);
    if (seasonYear === 'last') {
      seasonYear = seasonYear1;
    } 

    // currentOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    // currentCompanyOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    // orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
    currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr, orderIDArr);

    // #################################
    // ## outsource

    // ## get orderIDs  
    let orderIDs = [];
    await this.asyncForEach(currentOrderStyle, async (item1) => {
      orderIDs.push(item1.orderID);
    });
    // console.log(orderIDs);
    // console.log('1111');

    // ## get data from dtCompanyOrderOutsource
    // get_auto_getCompanyOrderOutsource= async (companyID, seasonYear, sName)
    const sName = 'auto_getCompanyOrderOutsource';
    // console.log(companyID, seasonYear, sName);
    const orderProductFacOut = await ShareFunc.get_auto_getCompanyOrderOutsource(companyID, seasonYear, sName);
    // console.log(orderProductFacOut);
    let orderProductFacOuts;
    let outsourcefactoryID = [];
    let orderProductFacOutQTY;
    let orderProductFacOutRemainQTY;
    let orderProductFacOutStyleColorSizeQTY;
    let orderProductFacOutStyleColorSizeRemainQTY;

    if (orderProductFacOut) {
      orderProductFacOuts = orderProductFacOut.data1;
      await this.asyncForEach(orderProductFacOuts, async (item1) => {
        outsourcefactoryID.push(item1.outsourcefactoryID);
      });
      orderProductFacOutQTY = orderProductFacOut.data2;
      orderProductFacOutRemainQTY = orderProductFacOut.data3;
      orderProductFacOutStyleColorSizeQTY = orderProductFacOut.data4;
      orderProductFacOutStyleColorSizeRemainQTY = orderProductFacOut.data5;


    } else {
      return res.status(501).json({
        message: {
          messageID: 'errrp002', 
          mode:'errRepCurrentCompanyOrder', 
          value: "error report current company order"
        }
      });
    }




    // // ## get orderIDs  
    // let orderIDs = [];
    // await this.asyncForEach(currentOrderStyle, async (item1) => {
    //   orderIDs.push(item1.orderID);
    // });
    // // console.log(orderIDs);

    // orderProductFacOuts = await ShareFunc.getCurrentCompanyOrderOutsource(companyID, orderIDs);
    // // console.log(factoryOutsource);
    // let outsourcefactoryID = [];
    // await this.asyncForEach(orderProductFacOuts, async (item1) => {
    //   outsourcefactoryID.push(item1.outsourcefactoryID);
    // });
    
    // // ## get outsource factory qty
    // orderProductFacOutQTY = await ShareFunc.getCurrentCompanyOrderOutsourceQTY(companyID, orderIDs);
    // // ## get outsource factory qty remain
    // orderProductFacOutRemainQTY = await ShareFunc.getCurrentCompanyOrderOutsourceRemianQTY(companyID, orderIDs);
    // // console.log(orderProductFacOutQTY);
    // // console.log(orderProductFacOutRemainQTY);

    // // ## style zone color size
    // orderProductFacOutStyleColorSizeQTY = await ShareFunc.getCurrentCompanyOrderStyleColorSizeOutsourceQTY(companyID, orderIDs);
    // orderProductFacOutStyleColorSizeRemainQTY = await ShareFunc.getCurrentCompanyOrderStyleColorSizeOutsourceRemainQTY(companyID, orderIDs);
    // // console.log(orderProductFacOutStyleColorSizeQTY);

    // console.log('0' || '1');
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn) || '';
    res.status(200).json({
      token: '',
      expiresIn: process.env.expiresIn,
      orderIDs: orderIDs,
      // orderStyleColorSize: orderStyleColorSize,
      // currentCompanyOrder: currentCompanyOrder,
      currentOrderStyle: currentOrderStyle,
      outsourcefactoryID: outsourcefactoryID,
      orderProductFacOutQTY: orderProductFacOutQTY,
      orderProductFacOutRemainQTY: orderProductFacOutRemainQTY,
      orderProductFacOutStyleColorSizeQTY: orderProductFacOutStyleColorSizeQTY,
      orderProductFacOutStyleColorSizeRemainQTY: orderProductFacOutStyleColorSizeRemainQTY,
      // nodeStation: nodeStation,
      // nodeFlows: nodeFlows,
      // nodeFlow: nodeFlow
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errrp002', 
        mode:'errRepCurrentCompanyOrder', 
        value: "error report current company order"
      }
    });
  }
}


// router.put("/edit/productions/OutsourceState", reportController.putEditSchedule01);
// ## putEditSchedule01 = auto_getCurrentCompanyOrderOutsourceFac
exports.putEditSchedule01 = async (req, res, next) => {
  // console.log('putEditSchedule01');
  // const userID = req.userData.tokenSet.userID;  
  const data = req.body;
  const userID = data.userID;
  const companyID = data.companyID;
  const dataOutsState = data.dataOutsState;
  const scheduleData = data.scheduleData;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  // console.log(companyID, userID, scheduleData);
  // console.log( dataOutsState);
  try {

    // ## update 
    const seasonYear = scheduleData.seasonYear;
    const sGroup = scheduleData.sGroup;
    const sName = scheduleData.sName;
    const sMode = scheduleData.sMode;
    const sDatetimeDiff = scheduleData.sDatetimeDiff;
    const sNote = scheduleData.sNote;
    const dtorderoutsourcefacUpsert  = await Dtorderoutsourcefac.updateOne({$and: [
      {"seasonYear":seasonYear},
      {"companyID":companyID},
      {"sGroup":sGroup}, 
      {"sName":sName}, 
      {"sNote":sNote},
      {"sMode":sMode}, 
      {"sDatetimeDiff":sDatetimeDiff}, 
    ]} , 
    {
      "lastDatetime": current,
      "data": dataOutsState,
    }, {upsert: true}); 

    // ## update record to state = 'normal'
    const scheduleUpsert = await Schedule.updateOne({$and: [
      {"seasonYear":seasonYear},
      {"companyID":companyID},
      {"sGroup":sGroup}, 
      {"sName":sName}, 
      {"sNote":sNote},
      {"sMode":sMode}, 
      {"sDatetimeDiff":sDatetimeDiff}, 
    ]} , 
    {
      "lastDatetime": current,
      "sState": "normal",
    }, {upsert: true}); 


    res.status(200).json({
      userID: userID,
      token: '',
      expiresIn: process.env.expiresIn,
      // currentProductionBundleState: currentProductionBundleState,
      // bundleStatePDF: [],
      // orderStyleColorSize: orderStyleColorSize,
      // currentProductionZoneForLoss: currentProductionZoneForLoss,
      // currentCompanyOrderZoneStyleSize: currentCompanyOrderZoneStyleSize,
    });
  } catch (err) {
    
    return res.status(501).json({
      message: {
        messageID: 'errrp009', 
        mode:'errEditSchedule', 
        value: "error edit schedule"
      }
    });
  }
}

// router.get("/cpn/rep14/current/order/state/:companyID/:ordertatus/:orderIDArr", checkAuth, checkUUID, reportController.getRepCompanyOrderOutsourceState);
exports.getRepCompanyOrderOutsourceState = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getRepCompanyOrderOutsourceState');

  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  const type = req.params.type;  // ## type = 'dt' , 'refresh' 
  // const factoryID = req.params.factoryID;
  // const nodeID = req.params.nodeID;
  const orderStatusArr = JSON.parse(req.params.ordertatus);
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, orderStatusArr);
  // console.log(orderIDArr);   

  try {

    let orderProduct = [];
    let orderProduct1BY1 = [];
    let dataOutsState = [];
    let orderProductFacReceive = [];
    let orderProductFacOut = [];
    let orderProductFac1BY1Out = [];
    let orderProductFac1BY1Receive = [];
    if (type === 'refresh') {
      // console.log('refresh');
      // ## update record to state = 'running'
      const scheduleData = {
        seasonYear: seasonYear,	
        companyID: companyID,			
        sGroup: 'report',
        sName: 'auto_getCurrentCompanyOrderOutsourceFac',	
        sMode: 'every30mn',
        sDatetimeDiff: 30,
        sNote: '', 
      };
      // console.log('00000000000000000000000000000000');
      const result1 = await ScheduleFunc.updateScheduleDataSState(scheduleData, 'running');
      // console.log('11111111111111111111111111111');
      // console.log('..........................updateScheduleDataSState  ok');
      const isOutsource = true;
      const status = ['outsource', 'normal'];
      // ## get outsource factory sent out & factory receive

      const sTypeOtus1 = 'b'; // ## b = bundle mode
      const sTypeOtusExist1 = false;
      orderProduct = await ShareFunc.getCurrentCompanyOrderOutsourceFac(companyID, orderIDArr, isOutsource, status, sTypeOtus1, sTypeOtusExist1);
      // console.log(orderProduct , orderProduct.length);
      
      const sTypeOtus2 = '1'; // ## 1 = 1 by 1
      const sTypeOtusExist2 = true;
      orderProduct1BY1 = await ShareFunc.getCurrentCompanyOrderOutsourceFac1BY1(companyID, orderIDArr, isOutsource, status, sTypeOtus2, sTypeOtusExist2);
      // console.log(orderProduct1BY1 , orderProduct1BY1.length);

    
      // ## get outsource factory sent out
      const status1 = 'outsource';  // ## sent out  outsource
      orderProductFacOut = await orderProduct.filter(i=>i.status === status1);
      orderProductFac1BY1Out = await orderProduct1BY1.filter(i=>i.status === status1);

      // ## get outsource factory receive
      const status2 = 'normal';  // ## sent out  outsource
      orderProductFacReceive = await orderProduct.filter(i=>i.status === status2);
      orderProductFac1BY1Receive = await orderProduct1BY1.filter(i=>i.status === status2);

        
      // // ## get outsource factory sent out
      // const status1 = 'outsource';  // ## sent out  outsource
      // const orderProductFacOut = await orderProduct.filter(i=>i.status === status1);
      // const orderProductFac1BY1Out = await orderProduct1BY1.filter(i=>i.status === status1);
      // // console.log(orderProductFacOut);
      // // console.log('** 5555 ');

      // // ## get outsource factory receive
      // const status2 = 'normal';  // ## sent out  outsource
      // const orderProductFacReceive = await orderProduct.filter(i=>i.status === status2);
      // const orderProductFac1BY1Receive = await orderProduct1BY1.filter(i=>i.status === status2);
      // // console.log(orderProductFacReceive);
      // // console.log('** 6666 ');




      // console.log('%% 3333 ');
      // dataOutsState = await ScheduleFunc.repCurrentCompanyOrderOutsourceFac_Transform(orderProduct, orderProduct1BY1, companyID, seasonYear);
      // // console.log(dataOutsState, '=====================');
      // console.log('%% 4444 ');



      // // ## update ProductionZonePeriodC > lastDatetime, data
      // const sGroup = 'report';
      // const sName = 'auto_getCurrentCompanyOrderOutsourceFac';
      // const sNote = '';
      // const sMode = 'every30mn';
      // const sDatetimeDiff = 30;
      // const dtorderoutsourcefacUpsert  = await Dtorderoutsourcefac.updateOne({$and: [
      //   {"seasonYear":seasonYear},
      //   {"companyID":companyID},
      //   {"sGroup":sGroup}, 
      //   {"sName":sName}, 
      //   {"sNote":sNote},
      //   {"sMode":sMode}, 
      //   {"sDatetimeDiff":sDatetimeDiff}, 
      // ]} , 
      // {
      //   "lastDatetime": current,
      //   "data": dataOutsState,
      // }, {upsert: true}); 

      // // ## update record to state = 'normal'
      // const scheduleUpsert = await Schedule.updateOne({$and: [
      //   {"seasonYear":seasonYear},
      //   {"companyID":companyID},
      //   {"sGroup":sGroup}, 
      //   {"sName":sName}, 
      //   {"sNote":sNote},
      //   {"sMode":sMode}, 
      //   {"sDatetimeDiff":sDatetimeDiff}, 
      // ]} , 
      // {
      //   "lastDatetime": current,
      //   "sState": "normal",
      // }, {upsert: true}); 

    } else if (type === 'dt') {
      // ## get data from dtcurrentcompanyorderoutsourcefac
      const sName = 'auto_getCurrentCompanyOrderOutsourceFac';
      dataOutsState = await ShareFunc.get_auto_getCurrentCompanyOrderOutsourceFac(companyID, seasonYear, sName);
    }

    // console.log('%% end ');


    // // const orderProductFacOut = [];
    // // ## get outsource factory sent out
    // const status1 = 'outsource';  // ## sent out  outsource
    // orderProductFacOut = await orderProduct.filter(i=>i.status === status1);
    // // console.log(orderProductFacOut);

    // // const orderProductFacReceive = [];
    // // ## get outsource factory receive
    // const status2 = 'normal';  // ## sent out  outsource
    // orderProductFacReceive = await orderProduct.filter(i=>i.status === status2);
    // // console.log(orderProductFacReceive);

    // // ## get outsource factory sent out
    // const status1 = 'outsource';  // ## sent out  outsource
    // const orderProductFacOut = await ShareFunc.getCurrentCompanyOrderOutsourceFac(companyID, orderIDArr, isOutsource, status1);
    // // console.log(orderProductFacOut);

    // // ## get outsource factory receive
    // const status2 = 'normal';  // ## receive
    // const orderProductFacReceive = await ShareFunc.getCurrentCompanyOrderOutsourceFac(companyID, orderIDArr, isOutsource, status2);
    // // console.log(orderProductFacReceive);

    // console.log('0' || '1');   
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn) || '';
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      orderIDArr: orderIDArr,
      orderProductFacOut: orderProductFacOut,
      orderProductFacReceive: orderProductFacReceive,
      orderProductFac1BY1Out: orderProductFac1BY1Out,
      orderProductFac1BY1Receive: orderProductFac1BY1Receive,
      dataOutsState: dataOutsState

    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errrp002', 
        mode:'errRepCurrentCompanyOrder', 
        value: "error report current company order"
      }
    });
  }
}

// router.get("/cpn/rep14_2/current/order/state/:companyID/:ordertatus/:orderIDArr", 
// checkAuth, checkUUID, reportController.getRepCompanyOrderOutsourceState2);
exports.getRepCompanyOrderOutsourceState2 = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getRepCompanyOrderOutsourceState2');

  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const companyID = req.params.companyID;
  let seasonYear = req.params.seasonYear;
  const type = req.params.type;  // ## type = 'dt' , 'refresh' 
  // const factoryID = req.params.factoryID;
  // const nodeID = req.params.nodeID;
  const orderStatusArr = JSON.parse(req.params.ordertatus);
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, orderStatusArr);
  // console.log(orderIDArr, type);

  try {
    // let orderProduct = [];
    // let dataOutsState = [];
    // let orderProduct1BY1 = [];
    // getCompanyCurrentSeasonYear= async (companyID)
    if (seasonYear === 'last') {
      const seasonYear1 = await ShareFunc.getCompanyCurrentSeasonYear(companyID);
      seasonYear = seasonYear1;
    } 

    // console.log(seasonYear);
    let orderProduct = [];
    let orderProduct1BY1 = [];
    let dataOutsState = [];
    let orderProductFacReceive = [];
    let orderProductFacOut = [];
    let orderProductFac1BY1Out = [];
    let orderProductFac1BY1Receive = [];

    // let orderProduct = [];
    if (type === 'refresh') {
      const isOutsource = true;
      const status = ['outsource', 'normal'];
      // ## get outsource factory sent out & factory receive
      const sTypeOtus1 = 'b'; // ## b = bundle mode
      const sTypeOtusExist1 = false;
      orderProduct = await ShareFunc.getCurrentCompanyOrderOutsourceFac(companyID, orderIDArr, isOutsource, status, sTypeOtus1, sTypeOtusExist1);
      // console.log(orderProduct , orderProduct.length);
      const sTypeOtus2 = '1'; // ## 1 = 1 by 1
      const sTypeOtusExist2 = true;
      orderProduct1BY1 = await ShareFunc.getCurrentCompanyOrderOutsourceFac1BY1(companyID, orderIDArr, isOutsource, status, sTypeOtus2, sTypeOtusExist2);
      // console.log(orderProduct1BY1 , orderProduct1BY1.length);

      // ## get outsource factory sent out
      const status1 = 'outsource';  // ## sent out  outsource
      orderProductFacOut = await orderProduct.filter(i=>i.status === status1);
      orderProductFac1BY1Out = await orderProduct1BY1.filter(i=>i.status === status1);

      // ## get outsource factory receive
      const status2 = 'normal';  // ## sent out  outsource
      orderProductFacReceive = await orderProduct.filter(i=>i.status === status2);
      orderProductFac1BY1Receive = await orderProduct1BY1.filter(i=>i.status === status2);



      // dataOutsState = await ScheduleFunc.repCurrentCompanyOrderOutsourceFac_Transform(orderProduct, companyID, seasonYear);
    
      // // ## update ProductionZonePeriodC > lastDatetime, data
      // const sGroup = 'report';
      // const sName = 'auto_getCurrentCompanyOrderOutsourceFac';
      // const sNote = '';
      // const sMode = 'every30mn';
      // const sDatetimeDiff = 30;
      // const dtorderoutsourcefacUpsert  = await Dtorderoutsourcefac.updateOne({$and: [
      //   {"seasonYear":seasonYear},
      //   {"companyID":companyID},
      //   {"sGroup":sGroup}, 
      //   {"sName":sName}, 
      //   {"sNote":sNote},
      //   {"sMode":sMode}, 
      //   {"sDatetimeDiff":sDatetimeDiff}, 
      // ]} , 
      // {
      //   "lastDatetime": current,
      //   "data": dataOutsState,
      // }, {upsert: true}); 

    } else if (type === 'dt') {
      // ## get data from dtcurrentcompanyorderoutsourcefac
      const sName = 'auto_getCurrentCompanyOrderOutsourceFac';
      dataOutsState = await ShareFunc.get_auto_getCurrentCompanyOrderOutsourceFac(companyID, seasonYear, sName);
    }


    // const orderProductFacOut = [];
    // const orderProductFacReceive = [];
    // // ## get outsource factory sent out
    // const status1 = 'outsource';  // ## sent out  outsource
    // const orderProductFacOut = await orderProduct.filter(i=>i.status === status1);
    // // console.log(orderProductFacOut);

    // // ## get outsource factory receive
    // const status2 = 'normal';  // ## sent out  outsource
    // const orderProductFacReceive = await orderProduct.filter(i=>i.status === status2);
    // // console.log(orderProductFacReceive);

    // // ## get outsource factory sent out
    // const status1 = 'outsource';  // ## sent out  outsource
    // const orderProductFacOut = await ShareFunc.getCurrentCompanyOrderOutsourceFac(companyID, orderIDArr, isOutsource, status1);
    // // console.log(orderProductFacOut);

    // // ## get outsource factory receive
    // const status2 = 'normal';  // ## receive
    // const orderProductFacReceive = await ShareFunc.getCurrentCompanyOrderOutsourceFac(companyID, orderIDArr, isOutsource, status2);
    // // console.log(orderProductFacReceive);

    // console.log('0' || '1');
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn) || '';
    res.status(200).json({
      token: '',
      expiresIn: process.env.expiresIn,
      orderIDArr: orderIDArr,
      orderProductFacOut: orderProductFacOut,
      orderProductFacReceive: orderProductFacReceive,
      orderProductFac1BY1Out: orderProductFac1BY1Out,
      orderProductFac1BY1Receive: orderProductFac1BY1Receive,
      dataOutsState: dataOutsState

    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errrp002', 
        mode:'errRepCurrentCompanyOrder', 
        value: "error report current company order"
      }
    });
  }
}

// ## report company order outsource ############################################################################
// ###################################################################################################


// ###################################################################################################
// ## report company ############################################################################

// router.get("/cpn/rep1/current/order/:companyID/:ordertatus", reportController.getRepCompanyOrder);
exports.getRepCompanyOrder = async (req, res, next) => {
  // try {} catch (err) {}

  // console.log('getRepCompanyOrder');

  const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  // const nodeID = req.params.nodeID;
  const orderStatusArr = JSON.parse(req.params.ordertatus);
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, orderStatusArr);

  try {

    // currentOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr, orderIDArr);
    currentCompanyOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr, orderIDArr);
    currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr, orderIDArr);
    
    // console.log(orderStyleColorSize, currentCompanyOrder, currentOrderStyle);

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      orderStyleColorSize: orderStyleColorSize,
      currentCompanyOrder: currentCompanyOrder,
      currentOrderStyle: currentOrderStyle,
      // repDataFormat1: repDataFormat1,
      // orders: orders,
      // products: products,
      // orderProductAllQtyRep: orderProductAllQtyRep,
      // factory: factory,
      // nodeStation: nodeStation,
      // nodeFlows: nodeFlows,
      // nodeFlow: nodeFlow
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errrp002', 
        mode:'errRepCurrentCompanyOrder', 
        value: "error report current company order"
      }
    });
  }
}

// router.get("/cpn/rep9/current/order/:companyID/:ordertatus/:orderID", checkAuth, checkUUID, reportController.getRepCompanyOrderByOrderID);
exports.getRepCompanyOrderByOrderID = async (req, res, next) => {
  // try {} catch (err) {}

  // console.log('getRepCompanyOrder');

  const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  const orderID = req.params.orderID;
  const orderStatusArr = JSON.parse(req.params.ordertatus);
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, orderStatusArr);

  try {

    // currentOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpecByOrderID(companyID, orderStatusArr, orderID);
    currentCompanyOrder = await ShareFunc.getCurrentCompanyOrderByOrderID(companyID, orderStatusArr, orderID);
    currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyleByOrderID(companyID, orderStatusArr, orderID);
    
    // console.log(orderStyleColorSize, currentCompanyOrder, currentOrderStyle);

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      orderStyleColorSize: orderStyleColorSize,
      currentCompanyOrder: currentCompanyOrder,
      currentOrderStyle: currentOrderStyle,
      // repDataFormat1: repDataFormat1,
      // orders: orders,
      // products: products,
      // orderProductAllQtyRep: orderProductAllQtyRep,
      // factory: factory,
      // nodeStation: nodeStation,
      // nodeFlows: nodeFlows,
      // nodeFlow: nodeFlow
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errrp002', 
        mode:'errRepCurrentCompanyOrder', 
        value: "error report current company order"
      }
    });
  }
}

// router.get("/cpn/RepQTYEdit/current/seasonYear/:companyID/:seasonYear", 
//   checkAuth, checkUUID, reportController.getRepQTYEditBySeasonYear);
exports.getRepQTYEditBySeasonYear = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getRepQTYEditBySeasonYear');
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;

  // console.log(companyID, seasonYear);

  try {

    const repQTYEditList = await ShareFunc.getRepQTYEditBySeasonYear(companyID, seasonYear);
    // console.log(repQTYEditList);

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      repQTYEditList: repQTYEditList,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errrp002', 
        mode:'errRepQTYEditBySeasonYear', 
        value: "error report QTYEdit By SeasonYear"
      }
    });
  }
}

// router.post("/cpn/rep/edit1/order/zoneperiod/qty", 
//   checkAuth, checkUUID, reportController.postRepCompanyOrderZonePeriod);
exports.postRepCompanyOrderZonePeriod = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('postRepCompanyOrderZonePeriod');
  const data = req.body;
  // console.log(err);

  try {
    // ##  
    const companyID = data.companyID;
    const orderID = data.orderID;
    const editType = data.editType;  // ## edit-qty , plan-adjust
    const seasonYear = data.seasonYear;  // ## 2025SS
    const setName = data.setName;   // ## muji
    const dataRQTYE = data.dataRQTYE;   // ##
    const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    // console.log(companyID, orderID, editType, setName);
    // ## update current date
    await this.asyncForEach(dataRQTYE, async (item1) => {
      item1.datetime = current;
    });

    if (dataRQTYE.sumProductQty === 0) {
      // ## delete element
      const result1 = await RepQTYEdit.updateMany(
        {$and: [
          {"companyID":companyID},
          {"orderID":orderID}, 
          {"editType":editType}, 
          {"seasonYear":seasonYear}, 
        ]}, 
        {
          $pull: {
            dataRQTYE: {
              "fromNode": dataRQTYE.fromNode,
              "productColor": dataRQTYE.productColor,
              "size": dataRQTYE.size,
              "targetPlaceID": dataRQTYE.targetPlaceID,
            }
          }
        });

    } else {

      const repQTYEdit1 = await ShareFunc.getRepQTYEdit1(companyID, orderID, editType, seasonYear);
      if (repQTYEdit1.length === 0) {
        // console.log('add new');
        const repQTYEditUpsert = await RepQTYEdit.updateOne({$and: [
            {"companyID":companyID},
            {"orderID":orderID}, 
            {"editType":editType}, 
            {"seasonYear":seasonYear}, 
          ]} , 
          {
            "dataRQTYE": dataRQTYE,
          }, {upsert: true}); 
      } else {  // ## repQTYEdit1.length > 0
        // edit
        // getRepQTYEditByDataRQTYE = async (companyID, orderID, editType, seasonYear, dataRQTYE)
        const repQTYEdit01 = await ShareFunc.getRepQTYEditByDataRQTYE(companyID, orderID, editType, seasonYear, dataRQTYE);
        if (repQTYEdit01.length === 0) {
          // ## edit push new element
          const result1 = await RepQTYEdit.updateOne(
            {$and: [
              {"companyID":companyID},
              {"orderID":orderID}, 
              {"editType":editType}, 
              {"seasonYear":seasonYear}, 
            ]}, 
            {$push: {dataRQTYE: {$each: [dataRQTYE],  $position: 0}}},  // ## add new element at the first
            );
  
        } else {  // ## repQTYEdit01.length > 0
          // ## edit update old element qty and datetime
          const result1 = await RepQTYEdit.updateMany(
            {$and: [
              {"companyID":companyID},
              {"orderID":orderID}, 
              {"editType":editType}, 
              {"seasonYear":seasonYear}, 
            ]},
            {
              $set: { 
                "dataRQTYE.$[elem].sumProductQty" : dataRQTYE.sumProductQty,
                "dataRQTYE.$[elem].datetime" : current,
              }
            }, 
            {
              multi: true, 
              arrayFilters: [  {
                "elem.fromNode": dataRQTYE.fromNode,
                "elem.productColor": dataRQTYE.productColor,
                "elem.size": dataRQTYE.size,
                "elem.targetPlaceID": dataRQTYE.targetPlaceID,
              } ] 
            }); 
        }
      }
    }

    // console.log(repQTYEditUpsert);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      success: true
      // order: order
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      success: false,
      message: {
        messageID: 'errO002A', 
        mode:'errCreateRepQTYEdit', 
        value: "create RepQTYEdit error"
      }
    });
  }
}




// ## report company ############################################################################
// ###################################################################################################


// ###################################################################################################
// ## report heng test ############################################################################

// // ## getHengtestRep1
// router.get("/hengtest/rep1", checkAuth, checkUUID, reportController.getHengtestRep1);
exports.getHengtestRep1 = async (req, res, next) => {
  // try {} catch (err) {}

  // console.log('getHengtestRep1');

  const companyID = 'c000001';
  const factoryID = 'f000001';
  const orderID = 'BA1OFA4S';
  // const productBarcodeNo = 'AA0PKA3A    SGHI-----23RW--------S--F00039';

  // 1.COMPUTER-KNITTING 2.PANAL-INSPECTION 3.LINKING  4.MENDING  5.WASHING    6.PRESSING
  const toNode = '1.COMPUTER-KNITTING';
  const problemName = 'pb';
  const status = 'normal';


  try {

    const data01 = await ShareFunc.getOrderProductionfilter01(companyID, factoryID, orderID, toNode);
    // orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpecByOrderID(companyID, orderStatusArr, orderID);
    // currentCompanyOrder = await ShareFunc.getCurrentCompanyOrderByOrderID(companyID, orderStatusArr, orderID);
    // currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyleByOrderID(companyID, orderStatusArr, orderID);
    
    // console.log(orderStyleColorSize, currentCompanyOrder, currentOrderStyle);

    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      success: true,
      data01: data01,
      // expiresIn: process.env.expiresIn,
      // orderStyleColorSize: orderStyleColorSize,
      // currentCompanyOrder: currentCompanyOrder,
      // currentOrderStyle: currentOrderStyle,
      // repDataFormat1: repDataFormat1,
      // orders: orders,
      // products: products,
      // orderProductAllQtyRep: orderProductAllQtyRep,
      // factory: factory,
      // nodeStation: nodeStation,
      // nodeFlows: nodeFlows,
      // nodeFlow: nodeFlow
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'rep-errHeng01', 
        mode:'rep-errheng01', 
        value: "rep-error test heng01"
      }
    });
  }
}


// ## report heng test ############################################################################
// ###################################################################################################