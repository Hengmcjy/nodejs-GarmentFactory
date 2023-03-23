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
    // ## get Rep Company Current Production work in period
    // queueInfoRep = await ShareFunc.getProductionQueueC(companyID, factoryID, nodeID, productStatusArr);

    // getTotalProductionQueueByFactoryProductIDs= async (companyID, factoryID, productIDArr) 
    currentProductAllDetailCFN = await ShareFunc.getCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr, page, limit);
    countCurrentProductAllDetailCFN = await ShareFunc.getCountCFNCurrentProductAllDetailPL(companyID, factoryID, nodeID, productStatusArr);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
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
  const productionNodeStatusArr = ['normal'];
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
    

    // const isRunNumberUp = runNumberUpType.includes(lottoBetTypeX);
    if (repListNameArr.includes('getRepCFNCurrentProductQty')) {
      const orderProductAllQtyRep = await ShareFunc.getRepCFNCurrentProductQty(companyID, factoryID, nodeID, productStatusArr);
      allProductQty = orderProductAllQtyRep.length;  // ## current all product qty in nodeID 
      // console.log(orderProductAllQtyRep);
    }

    if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderID')) {
      // ## get Rep CFN Current Product Qty by orderID
      orderProductQtyByOrderIDRep = await ShareFunc.getRepCFNCurrentProductQtyByOrderID(companyID, factoryID, nodeID, productStatusArr);
    }

    if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderIDProductID')) {
      // ## get Rep CFN Current Product Qty by orderID productID
      orderProductQtyByOrderIDProductIDRep = await ShareFunc.getRepCFNCurrentProductQtyByOrderIDProductID(companyID, factoryID, nodeID, productStatusArr);
    }

    if (repListNameArr.includes('getRepCFNCurrentProductBundleList')) {
      // ## get Rep CFN Current Product bundle list
      orderProductQtyBundleListRep = await ShareFunc.getRepCFNCurrentProductBundleList(companyID, factoryID, nodeID, productStatusArr);
    }

    if (repListNameArr.includes('getAllOrderAndProductFromOrderProduction')) {
      // ## get all order product from orderProduction
      const allOrder = await ShareFunc.getAllOrderFromOrderProductionCFN(companyID, factoryID, nodeID, productStatusArr);
      const allProduct = await ShareFunc.getAllProductFromOrderProductionCFN(companyID, factoryID, nodeID, productStatusArr);
      // console.log(allOrder, allProduct);
      orders = await ShareFunc.getOrdersByOrderIDs(companyID, allOrder, 1, 1000);
      products = await ShareFunc.getProductsByProductIDs(companyID, allProduct, 1, 1000);
      // console.log(orders, products);
    }

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

    if (repListNameArr.includes('getRepCFNCurrentProductionQueueCFN')) {
      // ## get Rep CFN Current Production Queue
      // exports.getProductionQueueCFN= async (companyID, factoryID, page, limit)
      queueInfoRep = await ShareFunc.getProductionQueueCFN(companyID, factoryID, 1, 20);
    }

    
    if (repListNameArr.includes('getRepCFNCurrentProductAllDetail')) {
      // ## get Rep CFN Current Production Queue
      // exports.getProductionQueueCFN= async (companyID, factoryID, page, limit)
      currentProductAllDetailCFN = await ShareFunc.getCFNCurrentProductAllDetail(companyID, factoryID, nodeID, productStatusArr);
    }

    // 'getRepCFNCurrentProductAllRepairCount',
    if (repListNameArr.includes('getRepCFNCurrentProductAllRepairCount')) {
      productionRepairCount = await ShareFunc.getCFNCurrentProductAllRepairCount(companyID, factoryID, nodeID, productProbelmStatusArr);
    }

    // 'getRepCFNCurrentProductAllProblemCount',
    if (repListNameArr.includes('getRepCFNCurrentProductAllProblemCount')) {
      productionProblemCount = await ShareFunc.getCFNCurrentProductAllProblemCount(companyID, factoryID, nodeID, productProbelmStatusArr);
    }

    // await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

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

// ## report
// #############################################################


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
  // console.log(companyID, factoryID, nodeID, productStatusArr);

  try {

    // currentOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
    currentCompanyOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr);
    
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