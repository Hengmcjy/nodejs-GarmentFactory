const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
// const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');

const io = require('../../socket');

const ShareFunc = require("../c-api-app-share-function");

const User = require("../../models/m-user");
const MailSignup = require("../../models/m-mailSignup");
const Factory = require("../../models/m-factory");
const Customer = require("../../models/m-customer");
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
  // console.log(companyID, productStatusArr, productionNodeStatusArr);
  try {
    // ## get Rep Company Current Production work in period
    currentProductionPeriod = await ShareFunc.getProductionPeriodC(companyID, productStatusArr, productionNodeStatusArr);
    // console.log(currentProductionPeriod);

    orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
    currentCompanyOrderStyleSize = await ShareFunc.getCurrentCompanyOrderStyleSize(companyID, orderStatusArr);

    // getTotalProductionQueueByFactoryProductIDs= async (companyID, factoryID, productIDArr) 
    // currentProductAllDetailCFN = await ShareFunc.getCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr, page, limit);
    // countCurrentProductAllDetailCFN = await ShareFunc.getCountCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: '',
      expiresIn: process.env.expiresIn,
      currentProductionPeriod: currentProductionPeriod,
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
  const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  // const nodeID = req.params.nodeID;
  // const page = +req.params.page;
  // const limit = +req.params.limit;  // ## records we need to get
  // const productIDArr = JSON.parse(req.params.productIDArr);
  const productStatusArr = JSON.parse(req.params.productStatus); // normal , problem, complete
  const productionNodeStatusArr = ['normal', 'complete'];
  const orderStatusArr = JSON.parse(req.params.orderStatus);
  // console.log(companyID, productStatusArr, productionNodeStatusArr);
  try {
    // ## get Rep Company Current Production work in period
    currentProductionZonePeriod = await ShareFunc.getProductionZonePeriodC(companyID, productStatusArr, productionNodeStatusArr);
    // console.log(currentProductionPeriod);

    orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
    // currentCompanyOrderZoneStyleSize = await ShareFunc.getCurrentCompanyOrderZoneStyleSize(companyID, orderStatusArr);
    
    // getTotalProductionQueueByFactoryProductIDs= async (companyID, factoryID, productIDArr) 
    // currentProductAllDetailCFN = await ShareFunc.getCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr, page, limit);
    // countCurrentProductAllDetailCFN = await ShareFunc.getCountCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: '',
      expiresIn: process.env.expiresIn,
      currentProductionZonePeriod: currentProductionZonePeriod,
      orderStyleColorSize: orderStyleColorSize,
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

// // ## get node getRepCurrentProductQtyCFN
// router.get("/noder/rep1/current/productqty/cfn/:companyID/:factoryID/:nodeID/:productStatus/:repListName", nsController.getRepCurrentProductQtyCFN);
exports.getRepCurrentProductQtyCFN = async (req, res, next) => {
  // try {} catch (err) {}
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCurrentProductQty');

  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const nodeID = req.params.nodeID;
  const productStatusArr = JSON.parse(req.params.productStatus);
  const productProbelmStatusArr = ['problem'];
  const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, factoryID, nodeID, productStatusArr);

  try {
    // ## get Rep CFN Current Product Qty  all
    let allProductQty = 0;
    let orderProductQtyByOrderIDRep;
    let orderProductQtyByOrderIDProductIDRep;
    let orderProductQtyBundleListRep;
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
      const orderProductAllQtyRep = await ShareFunc.getRepCFNCurrentProductQty(companyID, factoryID, nodeID, productStatusArr);
      allProductQty = orderProductAllQtyRep.length;  // ## current all product qty in nodeID 
      // console.log(orderProductAllQtyRep);
    }

    // console.log(' 2 - getRepCFNCurrentProductQtyByOrderID');
    if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderID')) {
      // ## get Rep CFN Current Product Qty by orderID
      orderProductQtyByOrderIDRep = await ShareFunc.getRepCFNCurrentProductQtyByOrderID(companyID, factoryID, nodeID, productStatusArr);
    }

    //  getRepCFNCurrentProductQtyByOrderIDProductID
    // console.log(' 3 - getRepCFNCurrentProductQtyByOrderIDProductID');
    if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderIDProductID')) {
      // ## get Rep CFN Current Product Qty by orderID productID
      orderProductQtyByOrderIDProductIDRep = await ShareFunc.getRepCFNCurrentProductQtyByOrderIDProductID(companyID, factoryID, nodeID, productStatusArr);
    }

    // console.log(' 4 - getRepCFNCurrentProductBundleList');
    if (repListNameArr.includes('getRepCFNCurrentProductBundleList')) {
      // ## get Rep CFN Current Product bundle list
      orderProductQtyBundleListRep = await ShareFunc.getRepCFNCurrentProductBundleList(companyID, factoryID, nodeID, productStatusArr);
    }

    // console.log(' 5 - getAllOrderAndProductFromOrderProduction');
    if (repListNameArr.includes('getAllOrderAndProductFromOrderProduction')) {
      // ## get all order product from orderProduction
      // const allOrder = await ShareFunc.getAllOrderFromOrderProductionCFN(companyID, factoryID, nodeID, productStatusArr);
      const allProduct = await ShareFunc.getAllProductFromOrderProductionCFN(companyID, factoryID, nodeID, productStatusArr);
      // console.log(allOrder, allProduct);
      // getOrders= async (companyID, statusArr, page, limit)
      orders = await ShareFunc.getOrders(companyID, ['open'], 1, 1000);
      products = await ShareFunc.getProductsByProductIDs(companyID, allProduct, 1, 1000);
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
    }

    // console.log(' 7 - getRepCFNCurrentProductionQueueCFN');
    if (repListNameArr.includes('getRepCFNCurrentProductionQueueCFN')) {
      // ## get Rep CFN Current Production Queue
      // exports.getProductionQueueCFN= async (companyID, factoryID, page, limit)
      queueInfoRep = await ShareFunc.getProductionQueueCFN(companyID, factoryID, 1, 20);
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
      orders: orders,
      products: products,
      productStateStyle: productStateStyle,
      productStateTargetPlace: productStateTargetPlace,
      productStateColor: productStateColor,
      productStateSize: productStateSize,
      productStateStyleTargetPlaceColorSize: productStateStyleTargetPlaceColorSize,
      queueInfoRep: queueInfoRep,
      currentProductAllDetailCFN: currentProductAllDetailCFN,
      productionRepairCount: productionRepairCount,
      productionProblemCount: productionProblemCount,
    };
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
  // const orderStatusArr = JSON.parse(req.params.ordertatus);
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, factoryIDArr, productStatusArr);
  try {
    // const orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);

    // ## get Rep C Current company Production  all
    const orderProductCFNodeRep = await ShareFunc.getCurrentProductQtyAllCFNode(companyID, factoryIDArr, productStatusArr);
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
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, factoryIDArr, productStatusArr);
  try {
    // const orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);

    // ## get Rep C Current company Production  all
    const currentProductQtyAllC = await ShareFunc.getCCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr);

    // ## get Rep CF Current factory Production  all
    const currentProductQtyAllCF = await ShareFunc.getCFCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr);
    
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
  // const orderStatusArr = JSON.parse(req.params.ordertatus);
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, factoryIDArr, productStatusArr);
  try {
    // const orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);

    // ## get Rep C Current company Production  all
    // const currentProductQtyAllC = await ShareFunc.getCCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr);

    // ## get Rep CF Current factory Production  all
    const currentProductQtyAllCF = await ShareFunc.getCFCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr);
    
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

// // ## get node getRepCurrentProductQtyCom
// router.get("/node/rep3/current/productqty/com/:companyID/:factoryIDArr/:ordertatus/:productStatus", checkAuth, checkUUID, 
//         reportController.getRepCurrentProductQtyCom);
exports.getRepCurrentProductQtyCom = async (req, res, next) => {
  // try {} catch (err) {}
  // ## CF = /:companyID/:factoryID
  // console.log('getRepCurrentProductQtyCom');
  const companyID = req.params.companyID;
  // const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  // const nodeID = req.params.nodeID;
  const factoryIDArr = JSON.parse(req.params.factoryIDArr);
  const productStatusArr = JSON.parse(req.params.productStatus);
  const orderStatusArr = JSON.parse(req.params.ordertatus);
  const productStatusCompleteArr = ['complete'];
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, factoryIDArr, productStatusArr, orderStatusArr);
  try {
    // const orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
    // ## all in production
    const currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr);

    // exports.getCompanyCurrentProductQtyAll = async (companyID, factoryIDArr, productStatusArr)
    let companyCurrentProductQtyAllF = await ShareFunc.getCompanyCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr);
    const companyCurrentProductQtyCompleteAll = await ShareFunc.getCompanyCurrentProductQtyAll(companyID, factoryIDArr, productStatusCompleteArr);

    const companyCurrentProductQtyAllFF = await companyCurrentProductQtyAllF.map(  (fw) => ({
      companyID: fw.companyID, 
      orderID: fw.orderID,
      productID: fw.productID,
      style: fw.style,
      countQty: fw.countQty,
      completeQty:  this.findCompleteQty(companyCurrentProductQtyCompleteAll, fw.companyID, fw.orderID, fw.productID, fw.style),
    }));
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

    // console.log(companyCurrentProductQtyAll);
    const currentCompanyOrderCountry = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    const currentCompanyOrderZone = await ShareFunc.getCurrentCompanyOrderZone(companyID, orderStatusArr);

    const currentCompanyOrderZoneStyle = await ShareFunc.getCurrentCompanyOrderZoneStyle(companyID, orderStatusArr);
    const currentCompanyOrderCountryStyle = await ShareFunc.getCurrentCompanyOrderCountryStyle(companyID, orderStatusArr);
    
    // getComFCurrentProductQtyAll = async (companyID, factoryIDArr, productStatusArr)
    const currentCompanyProductQtyZoneAll = await ShareFunc.getComCurrentProductQtyZoneAll(companyID, factoryIDArr, productStatusArr);
    const currentCompanyProductQtyZoneCompleteAll = await ShareFunc.getComCurrentProductQtyZoneAll(companyID, factoryIDArr, productStatusCompleteArr);
    
    // ## get Rep C Current company Production  all
    // ## for check error    currentProductListAllC
    const currentProductListAllC = await ShareFunc.getCCurrentProductQtyAllList(companyID, factoryIDArr, productStatusArr);
    const currentProductQtyAllC = await ShareFunc.getCCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr);
    const currentProductQtyAllCompleteC = await ShareFunc.getCCurrentProductQtyAll(companyID, factoryIDArr, productStatusCompleteArr);
    
    const currentCompanyProductQtyCountryAll = await ShareFunc.getComCurrentProductQtyCountryAll(companyID, factoryIDArr, productStatusArr);
    const currentCompanyProductQtyCountryCompleteAll = await ShareFunc.getComCurrentProductQtyCountryAll(companyID, factoryIDArr, productStatusCompleteArr);
    
    //## cs = color size
    const currentCompanyProductQtyCountryCSAll = await ShareFunc.getComCurrentProductQtyCountryCSAll(companyID, factoryIDArr, productStatusArr);
    const currentCompanyProductQtyCountryCSCompleteAll = await ShareFunc.getComCurrentProductQtyCountryCSAll(companyID, factoryIDArr, productStatusCompleteArr);
    
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      currentOrderStyle: currentOrderStyle,

      currentCompanyOrderCountry: currentCompanyOrderCountry,
      currentCompanyOrderZone: currentCompanyOrderZone,

      currentCompanyOrderZoneStyle: currentCompanyOrderZoneStyle,
      currentCompanyOrderCountryStyle: currentCompanyOrderCountryStyle,

      companyCurrentProductQtyAll: companyCurrentProductQtyAll,
      companyCurrentProductQtyCompleteAll: companyCurrentProductQtyCompleteAll,

      currentCompanyProductQtyZoneAll: currentCompanyProductQtyZoneAll,
      currentCompanyProductQtyZoneCompleteAll: currentCompanyProductQtyZoneCompleteAll,

      currentProductListAllC: currentProductListAllC, // ## for check error
      currentProductQtyAllC: currentProductQtyAllC,
      currentProductQtyAllCompleteC: currentProductQtyAllCompleteC,

      currentCompanyProductQtyCountryAll: currentCompanyProductQtyCountryAll,
      currentCompanyProductQtyCountryCompleteAll: currentCompanyProductQtyCountryCompleteAll,

      currentCompanyProductQtyCountryCSAll: currentCompanyProductQtyCountryCSAll,
      currentCompanyProductQtyCountryCSCompleteAll: currentCompanyProductQtyCountryCSCompleteAll,

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
  
  try {

    // ## report staff scanned by date1 - date2
    const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:ss+07:00'));
    const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:ss+07:00'));
    // console.log(companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr);
    
    const nodeScanProductStyle = await ShareFunc.getCFStaffScannedByDate12Style(companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr);
    
    const nodeScanProductStyleZone = await ShareFunc.getCFStaffScannedByDate12StyleZone(companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr);
    

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
    const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:ss+07:00'));
    const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:ss+07:00'));
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
    const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:ss+07:00'));
    const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:ss+07:00'));
    // console.log(dateStart, dateEnd);

    // ## get orderIDs
    let orderIDArr = [];
    const status = ['open']
    const page = 1;
    const limit = 10000;
    const orders = await ShareFunc.getOrders(companyID, status, page, limit);
    await this.asyncForEach(orders, async (item1) => {
      orderIDArr.push(item1.orderID);
    });
    // console.log(orderIDArr);
    
    // ## scan subnode
    const subNodeStaffScan = 
      await ShareFunc.getCFSubNodeScanDate12Overall(companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd);
    // console.log(subNodeStaffScan);
    // const nodeScanProductStyleZoneColorSize = [];

    // ## get staff name , userID by qrCode
    const qrCodes = Array.from(new Set(subNodeStaffScan.map((item) => item.qrCode)));
    console.log(qrCodes);

    
    // ## const infoType = req.params.infoType;  // ##  infoType = call by who {staffOffice, 'staffProduction'}
    let token = '';
    if (infoType === 'staffOffice') {
      token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    }
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,

      subNodeStaffScan: subNodeStaffScan,


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
    const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:ss+07:00'));
    const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:ss+07:00'));
    // console.log(dateStart, dateEnd);

    // ## get orderIDs
    let orderIDArr = [];
    const status = ['open']
    const page = 1;
    const limit = 10000;
    const orders = await ShareFunc.getOrders(companyID, status, page, limit);
    await this.asyncForEach(orders, async (item1) => {
      orderIDArr.push(item1.orderID);
    });
    // console.log(orderIDArr);
    
    
    const subNodeStaffScan = 
      await ShareFunc.getCFSubNodeStaffScanDate12Overall(companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd);
    // console.log(subNodeStaffScan);
    // const nodeScanProductStyleZoneColorSize = [];

    
    // ## const infoType = req.params.infoType;  // ##  infoType = call by who {staffOffice, 'staffProduction'}
    let token = '';
    if (infoType === 'staffOffice') {
      token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    }
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,

      subNodeStaffScan: subNodeStaffScan,


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

  const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  // const nodeID = req.params.nodeID;
  const orderStatusArr = JSON.parse(req.params.ordertatus);
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, orderStatusArr);

  try {

    // currentOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    // currentCompanyOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    // orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
    currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr);

    // #################################
    // ## outsource

    // ## get orderIDs  
    let orderIDs = [];
    await this.asyncForEach(currentOrderStyle, async (item1) => {
      orderIDs.push(item1.orderID);
    });
    // console.log(orderIDs);

    orderProductFacOuts = await ShareFunc.getCurrentCompanyOrderOutsource(companyID, orderIDs);
    // console.log(factoryOutsource);
    let outsourcefactoryID = [];
    await this.asyncForEach(orderProductFacOuts, async (item1) => {
      outsourcefactoryID.push(item1.outsourcefactoryID);
    });
    
    // ## get outsource factory qty
    orderProductFacOutQTY = await ShareFunc.getCurrentCompanyOrderOutsourceQTY(companyID, orderIDs);
    // ## get outsource factory qty remain
    orderProductFacOutRemainQTY = await ShareFunc.getCurrentCompanyOrderOutsourceRemianQTY(companyID, orderIDs);
    // console.log(orderProductFacOutQTY);
    // console.log(orderProductFacOutRemainQTY);

    // ## style zone color size
    orderProductFacOutStyleColorSizeQTY = await ShareFunc.getCurrentCompanyOrderStyleColorSizeOutsourceQTY(companyID, orderIDs);
    orderProductFacOutStyleColorSizeRemainQTY = await ShareFunc.getCurrentCompanyOrderStyleColorSizeOutsourceRemainQTY(companyID, orderIDs);
    // console.log(orderProductFacOutStyleColorSizeQTY);

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      orderIDs: orderIDs,
      orderStyleColorSize: orderStyleColorSize,
      currentCompanyOrder: currentCompanyOrder,
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
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, orderStatusArr);

  try {

    // currentOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
    currentCompanyOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr);
    
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

// // router.get("/cpn/rep2/current/orderstyle/:companyID/:ordertatus", checkAuth, checkUUID, reportController.getRepCompanyOrderStyle);
// exports.getRepCompanyOrderStyle = async (req, res, next) => {
//   // try {} catch (err) {}
//   // console.log('getRepCompanyOrderStyle');
//   const companyID = req.params.companyID;
//   // const factoryID = req.params.factoryID;
//   // const nodeID = req.params.nodeID;
//   const orderStatusArr = JSON.parse(req.params.ordertatus);
//   // const repListNameArr = JSON.parse(req.params.repListName);
//   // console.log(companyID, factoryID, nodeID, productStatusArr);

//   try {
//     // currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr);
//     // const currentOrder = {
//     //   orderStyleColorSize: orderStyleColorSize,
//     //   currentCompanyOrder: currentCompanyOrder
//     // };
    
//     const token = '';
//     res.status(200).json({
//       token: token,
//       expiresIn: process.env.expiresIn,
//       // currentOrderStyle: currentOrderStyle,
//       // currentCompanyOrder: currentCompanyOrder,
//       // repDataFormat1: repDataFormat1,
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
//         messageID: 'errrp004', 
//         mode:'errRepCurrentCompanyOrderStyle', 
//         value: "error report current company order style"
//       }
//     });
//   }
// }


// ## report company ############################################################################
// ###################################################################################################