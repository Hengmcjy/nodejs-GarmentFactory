const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');
// import { v5 as uuidv5 } from "uuid";
// const { v5 as uuidv5 } = require('uuid');
const { v5: uuidv5 } = require('uuid');
const { v4: uuidv4 } = require('uuid');

const io = require('../../socket');

const ShareFunc = require("../c-api-app-share-function");

const User = require("../../models/m-user");
const Company = require("../../models/m-company");
const Factory = require("../../models/m-factory");
const Order = require("../../models/m-order");
const OrderProduction = require("../../models/m-orderProduction");
const OrderProductionQueue = require("../../models/m-orderProductionQueue");
const OrderProductionQueueList = require("../../models/m-orderProductionQueueList");
const BundleSetGroup = require("../../models/m-bundleSetGroup");
// const Bundlesetgroup = require("../../models/m-bundlesetgroup");

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
// ## order

// // ## get order1
// router.get("/order/getlist1/:companyID/:userID/:orderID/:seasonyear", orderController.getOrder);
exports.getOrder = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const orderID = req.params.orderID;
  // const seasonYear = req.params.seasonyear;
  // console.log('getOrder');

  try {
    // ## get 1 order
    // exports.getOrder= async (companyID, orderID) 
    const order = await ShareFunc.getOrder(companyID, orderID);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      order: order
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO003', 
        mode:'errOrder1', 
        value: "error get Order 1"
      }
    });
  }
}

// router.get("/order5/getlist/:companyID/:orderStatus/:userID", checkAuth, checkUUID, orderController.getOrderStyles);
exports.getOrderStyles = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const orderStatus = JSON.parse(req.params.orderStatus);
  // const orderIDs = JSON.parse(req.params.orderids);

  try {
    // ## get 1 order
    // getOrderStyleByStatus= async (companyID, statusArr) 
    const orderStyles = await ShareFunc.getOrderStyleByStatus(companyID, orderStatus);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      orderStyles: orderStyles
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO013', 
        mode:'errOrderStyleList', 
        value: "error get Order style list"
      }
    });
  }
}

// router.get("/order/getlist4/seasonyearslist/:companyID/:userID", checkAuth, checkUUID, orderController.getOrderSeasonYears);
exports.getOrderSeasonYears = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  // const page = +req.params.page;
  // const limit = +req.params.limit;
  // const status = ['open'];

  // const MY_NAMESPACE = "a572fa0f-9bfa-5103-9882-16394770ad11";

  // const test = uuidv5("Hello World", process.env.IOID); // ⇨ 'a572fa0f-9bfa-5103-9882-16394770ad11'
  // console.log(test);
  // console.log(uuidv4());

  try {
    // exports.getOrders= async (companyID, page, limit)
    const orderSeasonYears = await ShareFunc.getOrderSeasonYears(companyID);
    // console.log(orders);
    // const ordersCount = await ShareFunc.getOrdersCount(companyID, status);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      orderSeasonYears: orderSeasonYears,
      // ordersCount: ordersCount
      // factory: factory
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO025', 
        mode:'errOrderSeasonYearsList', 
        value: "error get Order season years list"
      }
    });
  }
}


// // ## get order list /api/order/getlist/:companyID/:userID/:page/:limit
// router.get("/getlist/:companyID/:userID/:page/:limit/:seasonyear", checkAuth, checkUUID, productController.getOrders);
exports.getOrders = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const page = +req.params.page;
  const limit = +req.params.limit;
  const status = ['open'];
  let seasonYear = req.params.seasonyear;

  // const MY_NAMESPACE = "a572fa0f-9bfa-5103-9882-16394770ad11";

  // const test = uuidv5("Hello World", process.env.IOID); // ⇨ 'a572fa0f-9bfa-5103-9882-16394770ad11'
  // console.log(seasonYear);
  // console.log(uuidv4());

  try {

    // ## get season year
    let orderSeasonYears = await ShareFunc.getOrderSeasonYears(companyID);
    orderSeasonYears.sort((a,b)=>{return a.seasonYear <b.seasonYear?1:a.seasonYear >b.seasonYear?-1:0});  // ## desc
    // orderSeasonYears.sort((a,b)=>{return a.seasonYear >b.seasonYear?1:a.seasonYear <b.seasonYear?-1:0});  // ## asc
    // console.log(orderSeasonYears);
    // console.log(orderSeasonYears);

    if (seasonYear === 'last') {
      seasonYear = orderSeasonYears.length>0? orderSeasonYears[0].seasonYear:seasonYear;
    }
    // console.log(seasonYear);
    const seasonYearArr = [seasonYear];

    // exports.getOrders= async (companyID, page, limit)
    const orders = await ShareFunc.getOrders(companyID, status, page, limit, seasonYearArr);
    // console.log(orders);
    const ordersCount = await ShareFunc.getOrdersCount(companyID, status, seasonYearArr);

    // ## get opd lost list and lost group list
    const opdLosts = await ShareFunc.getOPDLosts(companyID, true);
    const lostGroups = await ShareFunc.getLostGroups(companyID, true);
    // console.log(opdLosts);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      orders: orders,
      ordersCount: ordersCount,
      orderSeasonYears: orderSeasonYears,
      seasonYear: seasonYear,
      opdLosts: opdLosts,
      lostGroups: lostGroups,
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO001', 
        mode:'errOrderList', 
        value: "error get Order list"
      }
    });
  }
}

// // ## get order list /api/order/getlist2/:companyID/:userID/:orderids  getOrdersByOrderIDs
// router.get("/getlist2/:companyID/:userID/:orderids", checkAuth, checkUUID, orderController.getOrdersByOrderIDs);
exports.getOrdersByOrderIDs = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getOrdersByOrderIDs');
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const orderIDs = JSON.parse(req.params.orderids);

  // const MY_NAMESPACE = "a572fa0f-9bfa-5103-9882-16394770ad11";

  // const test = uuidv5("Hello World", process.env.IOID); // ⇨ 'a572fa0f-9bfa-5103-9882-16394770ad11'
  // console.log(test);
  // console.log(uuidv4());

  try {
    // exports.getOrders= async (companyID, page, limit)
    const orders = await ShareFunc.getOrdersByOrderIDsAll(companyID, orderIDs);

    // currentCompanyOrderZoneStyleSize = await ShareFunc.getCurrentCompanyOrderZoneStyleSize(companyID, orderStatusArr);
    // console.log(orders);
    // const ordersCount = await ShareFunc.getOrdersCount(companyID);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: '',
      expiresIn: process.env.expiresIn,
      userID: userID,
      orders: orders,
      // ordersCount: ordersCount
      // factory: factory
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO001', 
        mode:'errOrderList', 
        value: "error get Order list"
      }
    });
  }
}


// // ## get order list /api/order/getlist2/:companyID/:userID/:orderids  getOrdersByOrderIDs
// router.get("/getlist3/:companyID/:userID/:orderids/:orderStatus", checkAuth, checkUUID, orderController.getOrdersZoneStyleSizeByOrderIDs);
exports.getOrdersZoneStyleSizeByOrderIDs = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getOrdersByOrderIDs');
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const orderIDs = JSON.parse(req.params.orderids);
  const orderStatusArr = JSON.parse(req.params.orderStatus);
  const mode = req.params.mode;

  // const MY_NAMESPACE = "a572fa0f-9bfa-5103-9882-16394770ad11";

  // const test = uuidv5("Hello World", process.env.IOID); // ⇨ 'a572fa0f-9bfa-5103-9882-16394770ad11'
  // console.log(userID);
  // console.log(uuidv4());

  try {
    // exports.getOrders= async (companyID, page, limit)
    const orders = await ShareFunc.getOrdersByOrderIDsAll(companyID, orderIDs);
    this.orderIDs = Array.from(new Set(orders.map((item) => item.orderID)));
    // console.log(orderIDs);
    currentCompanyOrderZoneStyleSize = await ShareFunc.getCurrentCompanyOrderZoneStyleSize(companyID, orderStatusArr, orderIDs);
    // console.log(orders);
    // const ordersCount = await ShareFunc.getOrdersCount(companyID);

    let token = '';
    if (!mode) {
      await ShareFunc.upsertUserSession1hr(userID);
      // console.log(req.userData.tokenSet);
      token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    }

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      orders: orders,
      currentCompanyOrderZoneStyleSize: currentCompanyOrderZoneStyleSize
      // factory: factory
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO001', 
        mode:'errOrderList', 
        value: "error get Order list"
      }
    });
  }
}

// // ## /api/order/creataenew
// router.post("/createnew", checkAuth, checkUUID, orderController.postOrderCreateNew);
exports.postOrderCreateNew = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  // console.log(err);

  try {
    // ##  create order 
    const companyID = data.order.companyID;
    const factoryID = data.order.factoryID;
    const bundleNo = data.order.bundleNo;
    const ver = +data.order.ver;
    const orderID = data.order.orderID;
    const seasonYear = data.order.seasonYear;
    const orderDetail = data.order.orderDetail;
    const orderDate = new Date(moment(data.order.orderDate).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    const deliveryDate = new Date(moment(data.order.deliveryDate).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    let productOR = data.order.productOR;
    const customerOR = data.order.customerOR;
    const createBy = data.order.createBy;

    // console.log(companyID, factoryID, ver, orderID, seasonYear, createBy, customerOR);

    // ## check productORInfo / delete for duplicate record
    const productORInfo = [...productOR.productORInfo];
    let productORInfo1 = [];
    await this.asyncForEach(productORInfo, async (item1) => {
      const idx = productORInfo1.findIndex( fi =>(
        fi.productBarcode === item1.productBarcode
        // && fi.targetPlace === item1.targetPlace
        // && fi.productColor === item1.productColor
        // && fi.productSize === item1.productSize
      ));
      if (idx < 0) {
        productORInfo1.push(item1);
      } else {
        productORInfo1[idx] = item1;
      }
    });
    productOR.productORInfo = productORInfo1;

    const orderUpsert = await Order.updateOne({$and: [
        {"companyID":companyID},
        {"orderID":orderID}, 
      ]} , 
      {
        "seasonYear": seasonYear,
        "factoryID": factoryID,
        "bundleNo": bundleNo,
        "ver": ver,
        "orderStatus": 'open',
        "orderDetail": orderDetail,
        "orderDate": orderDate,
        "deliveryDate": deliveryDate,
        "customerOR": customerOR,
        "orderTargetPlace": [],
        "orderColor": [],
        "productOR": productOR,
        "createBy": createBy,
      }, {upsert: true}); 

    // console.log(orderUpsert);

    // ## get 1 order
    // exports.getOrder= async (companyID, orderID) 
    const order = await ShareFunc.getOrder(companyID, orderID);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      order: order
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO002', 
        mode:'errCreateOrder', 
        value: "create Order error"
      }
    });
  }
}

// // ## /api/order/update
// router.put("/update", checkAuth, checkUUID, orderController.putOrderUpdate);
exports.putOrderUpdate = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  // console.log('putOrderUpdate');

  // return '';
  try {
    // ##  create order 
    const companyID = data.order.companyID;
    const orderID = data.order.orderID;
    const orderDetail = data.order.orderDetail;
    const orderDate = new Date(moment(data.order.orderDate).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    const deliveryDate = new Date(moment(data.order.deliveryDate).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    let productOR = data.order.productOR;
    const customerOR = data.order.customerOR;
    // console.log(productOR);

    // ## check productORInfo / delete for duplicate record
    const productORInfo = [...productOR.productORInfo];
    let productORInfo1 = [];
    await this.asyncForEach(productORInfo, async (item1) => {
      const idx = productORInfo1.findIndex( fi =>(
        fi.productBarcode === item1.productBarcode
        // && fi.targetPlace === item1.targetPlace
        // && fi.productColor === item1.productColor
        // && fi.productSize === item1.productSize
      ));
      if (idx < 0) {
        productORInfo1.push(item1);
      } else {
        productORInfo1[idx] = item1;
      }
    });
    productOR.productORInfo = productORInfo1;

    const orderUpdate = await Order.updateOne({$and: [
        {"companyID":companyID},
        {"orderID":orderID}, 
      ]} , 
      {
        "orderDetail": orderDetail,
        "orderDate": orderDate,
        "deliveryDate": deliveryDate,
        // "customerOR": customerOR,   // ## not allow to update customerOR , it can set at the new create only
        // "productOR": productOR,
        "productOR.productORDetail": productOR.productORDetail,
        $push: {"productOR.productORInfo": productOR.productORInfo},
      }); 

    // ## get 1 order
    // exports.getOrder= async (companyID, orderID) 
    const order = await ShareFunc.getOrder(companyID, orderID);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      order: order
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO004', 
        mode:'errEditOrder', 
        value: "error edit order"
      }
    });

  }
}

// router.put("/update/setting/maxqty", checkAuth, checkUUID, orderController.putOrderMaxQTYUpdate);
exports.putOrderMaxQTYUpdate = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  // console.log('putOrderMaxQTYUpdate');

  // return '';
  try {
    // ##  create order 
    const companyID = data.order.companyID;
    const orderID = data.order.orderID;
    const seasonYear = data.seasonYear;
    // const orderDetail = data.order.orderDetail;
    // const orderDate = new Date(moment(data.order.orderDate).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    // const deliveryDate = new Date(moment(data.order.deliveryDate).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    // const productOR = data.order.productOR;
    const qtyMaxView = data.qtyMaxView;
    // const customerOR = data.order.customerOR;
    // console.log(productOR);
    const orderUpdate = await Order.updateOne({$and: [
        {"companyID":companyID},
        {"orderID":orderID}, 
        {"seasonYear":seasonYear},
      ]} , 
      {
        $set: { "orderSetting.qtyMaxView" : qtyMaxView },
        // "orderDetail": orderDetail,
        // "orderDate": orderDate,
        // "deliveryDate": deliveryDate,
        // // "customerOR": customerOR,   // ## not allow to update customerOR , it can set at the new create only
        // // "productOR": productOR,
        // "productOR.productORDetail": productOR.productORDetail,
        // $push: {"productOR.productORInfo": productOR.productORInfo},
      }); 

    // ## get 1 order
    // exports.getOrder= async (companyID, orderID) 
    const order = await ShareFunc.getOrder(companyID, orderID);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      order: order
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO004', 
        mode:'errEditOrder', 
        value: "error edit order"
      }
    });

  }
}

// // ## /api/order/update2/setzone
// router.put("/update2/setzone", checkAuth, checkUUID, orderController.putOrderZoneUpdate);
exports.putOrderZoneUpdate = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;

  try {
    // ##  create order 
    const companyID = data.order.companyID;
    const orderID = data.order.orderID;
    const orderTargetPlace = data.order.orderTargetPlace;

    const orderUpdate = await Order.updateOne({$and: [
        {"companyID":companyID},
        {"orderID":orderID}, 
      ]} , 
      {
        "orderTargetPlace": orderTargetPlace,
      }); 

    // ## get 1 order
    // exports.getOrder= async (companyID, orderID) 
    const order = await ShareFunc.getOrder(companyID, orderID);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      order: order
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO010', 
        mode:'errEditOrderZone', 
        value: "error edit order zone"
      }
    });
  }
}

// // ## /api/order/update2/setcolor
// router.put("/update3/setcolor", checkAuth, checkUUID, orderController.putOrderColorUpdate);
exports.putOrderColorUpdate = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('putOrderColorUpdate');
  const data = req.body;

  try {
    // ##  create order 
    const companyID = data.order.companyID;
    const orderID = data.order.orderID;
    const orderColor = data.order.orderColor;

    const orderUpdate = await Order.updateOne({$and: [
        {"companyID":companyID},
        {"orderID":orderID}, 
      ]} , 
      {
        "orderColor": orderColor,
      }); 

    // ## get 1 order
    // exports.getOrder= async (companyID, orderID) 
    const order = await ShareFunc.getOrder(companyID, orderID);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      order: order
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO011', 
        mode:'errEditOrderColor', 
        value: "error edit order color"
      }
    });
  }
}

// router.put("/update3/setmaxqtyview", checkAuth, checkUUID, orderController.updateOrderMaxQtyView);
exports.updateOrderMaxQtyView = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('updateOrderMaxQtyView');
  const data = req.body;

  try {
    // ##  create order 
    const companyID = data.companyID;
    const orderID = data.orderID;
    const seasonYear = data.seasonYear;
    const qtyMaxView = data.qtyMaxView;
    // console.log(companyID, orderID, seasonYear, qtyMaxView)
    const orderUpdate = await Order.updateOne({$and: [
        {"companyID":companyID},
        {"orderID":orderID}, 
        {"seasonYear":seasonYear}, 
      ]} , 
      {
        "orderSetting.qtyMaxView": qtyMaxView,
      }); 

    // ## get 1 order
    // exports.getOrder= async (companyID, orderID) 
    const order = await ShareFunc.getOrder(companyID, orderID);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      order: order
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO011', 
        mode:'errEditOrderColor', 
        value: "error edit order color"
      }
    });
  }
}

// // ## /api/order/update4/qrcode/replacement
// router.put("/update4/qrcode/replacement", checkAuth, checkUUID, orderController.putOrderProductionQrcodeReplacement);
exports.putOrderProductionQrcodeReplacement = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('putOrderColorUpdate');
  const data = req.body;

  try {
    // ##  create order 
    const companyID = data.companyID;
    const factoryID = data.factoryID;
    const orderID = data.orderID;
    const productBarcodeNo = data.productBarcodeNo;
    const productBarcodeNoNew = data.productBarcodeNoNew;
    let productBarcodeNoReserve = data.productBarcodeNoReserve;
    const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    productBarcodeNoReserve.datetime = current;

    const orderProductionUpdate = await OrderProduction.updateOne({$and: [
        {"companyID":companyID},
        // {"factoryID":factoryID},
        {"orderID":orderID}, 
        {"productBarcodeNoReal":productBarcodeNo}, 
      ]} , 
      {
        "productBarcodeNo": productBarcodeNoNew,
        $push: {productBarcodeNoReserve: {$each:[productBarcodeNoReserve],  $position: 0}}  // ## add new element at the first
      }); 


    // ## get 1 order
    const orderProduct = await ShareFunc.getOrderProduct01(companyID, factoryID, productBarcodeNoNew);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      orderProduct: orderProduct
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO015', 
        mode:'errEditOrderProductionQrcodeReplacement', 
        value: "error edit order production Qrcode replacement"
      }
    });
  }
}

// // ## /api/order/update5/setSubNodeFlowCost
// router.put("/update5/setSubNodeFlowCost", checkAuth, checkUUID, orderController.putOrderSubNodeFlowCostUpdate);
exports.putOrderSubNodeFlowCostUpdate = async (req, res, next) => {
  // console.log('putOrderSubNodeFlowCostUpdate');
  // try {} catch (err) {}
  const data = req.body;

  try {
    // ##  create order 
    const companyID = data.order.companyID;
    const orderID = data.order.orderID;
    const subNodeFlowCost = data.order.productOR.subNodeFlowCost;

    const orderUpdate = await Order.updateOne({$and: [
        {"companyID":companyID},
        {"orderID":orderID}, 
      ]} , 
      {
        "productOR.subNodeFlowCost": subNodeFlowCost,
      }); 

    // ## get 1 order
    // exports.getOrder= async (companyID, orderID) 
    const order = await ShareFunc.getOrder(companyID, orderID);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      order: order
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO019', 
        mode:'errEditOrderSubNodeFlowCost', 
        value: "error edit order subNodeFlowCost"
      }
    });
  }
}

// router.get("/get/Order/SubNodeFlowType/list/:companyID/:userID",checkAuth, checkUUID, orderController.getSubNodeFlowTypeList);
exports.getSubNodeFlowTypeList = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  // console.log(test);

  try {

    const subNodeFlowTypes = await ShareFunc.getSubNodeFlowTypeList(companyID);
    // console.log(subNodeFlowTypes);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      subNodeFlowTypes: subNodeFlowTypes,
      // ordersCount: ordersCount
      // factory: factory
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO025', 
        mode:'errgetSubNodeFlowTypeList', 
        value: "error get SubNodeFlowType List"
      }
    });
  }
}

// router.get("/get/OrderLost/list/:companyID/:userID/:orderID", orderController.getOrderLostList);
exports.getOrderLostList = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const orderID = req.params.orderID;
  // const userID = req.params.userID;
  // const page = +req.params.page;
  // const limit = +req.params.limit;
  // const status = ['open'];

  // const MY_NAMESPACE = "a572fa0f-9bfa-5103-9882-16394770ad11";

  // const test = uuidv5("Hello World", process.env.IOID); // ⇨ 'a572fa0f-9bfa-5103-9882-16394770ad11'
  // console.log(test);
  // console.log(uuidv4());

  try {
    // getOrderProductLostList= async (companyID, orderID, productStatus)
    const productStatus = 'lost';
    const orderProduct = await ShareFunc.getOrderProductLostList(companyID, orderID, productStatus);
    // console.log(orders);
    // const ordersCount = await ShareFunc.getOrdersCount(companyID, status);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      orderProduct: orderProduct,
      // ordersCount: ordersCount
      // factory: factory
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO025', 
        mode:'errgetOrderLostList', 
        value: "error get Order Lost List"
      }
    });
  }
}

// putOrderLost
// router.put("/update/opd/lost/putOrderLost", checkAuth, checkUUID, orderController.putOrderLost);
exports.putOrderLost = async (req, res, next) => {
  // console.log('putOrderLost');
  // try {} catch (err) {}
  const data = req.body;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  let session = await mongoose.startSession();

  try {
    await session.withTransaction(async (session) => {
      // ##  create order 
      const companyID = data.companyID;
      const orderID = data.orderID;
      const productBarcodeNoReal = data.productBarcodeNoReal;
      const bundleNo = +data.bundleNo;
      const bundleID = data.bundleID;
      let orLost = data.orLost;
      const mode = data.mode;  // ## set , unset
      orLost.datetime = current;

      

      if (mode === 'set') {
        const newuuid = uuidv4();
        const orderUpdate1 = await OrderProduction.updateOne({$and: [
            {"companyID":companyID},
            {"orderID":orderID}, 
            {"productBarcodeNoReal":productBarcodeNoReal}, 
          ]} , 
          {
            "productStatus": "lost",
            "productCount": 1,
            "bundleID": newuuid,
            // "orLost": orLost, 
            $set: { "orLost" : orLost },
          }).session(session); 
      } else if (mode === 'unset') {
        const orderUpdate2 = await OrderProduction.updateOne({$and: [
          {"companyID":companyID},
          {"orderID":orderID}, 
          {"productBarcodeNoReal":productBarcodeNoReal}, 
        ]} , 
        {
          "productStatus": "normal",
          $unset: {orLost: ""},
        }).session(session);
      }

      // ## get all product in a bundle / change productCount - 1  
      const orderProducts = await ShareFunc.getOrderProductsByBundleIDs(companyID, '', [bundleID]);
      const productBarcodeNoReals = Array.from(new Set(orderProducts.map((item) => item.productBarcodeNoReal)));
      const productBarcodeNoReals2 = productBarcodeNoReals.filter(i=>i !== productBarcodeNoReal);
      const productCount = orderProducts[0].productCount - 1;
      // console.log(productBarcodeNoReals2, productCount, productBarcodeNoReals2.length);

      result1 = await OrderProduction.updateMany(
        {$and: [
          {"companyID":companyID},
          {"orderID":orderID}, 
          {"productBarcodeNoReal":{$in: productBarcodeNoReals2}},
        ]},
        {
          "productCount": productCount,
        }).session(session); 


        await session.commitTransaction();
        session.endSession();
    });

    // ## get 1 order
    // exports.getOrder= async (companyID, orderID) 
    // const order = await ShareFunc.getOrder(companyID, orderID);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      success: true
    });

  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'errO019', 
        mode:'errEditOrderSubNodeFlowCost', 
        value: "error edit order subNodeFlowCost"
      }
    });
  }
}

// // // ## /api/order/orderProduction/createnew
// // router.post("/orderProduction/createnew", checkAuth, checkUUID, orderController.postOrderProductionCreateNew);
// exports.postOrderProductionCreateNew = async (req, res, next) => {
//   // try {} catch (err) {}
//   const data = req.body;

//   try {
//     // ##  create order 
//     const companyID = data.orderP.companyID;
//     const factoryID = data.orderP.factoryID;
//     const orderID = data.orderP.orderID;
//     const productID = data.orderP.productID;
//     const productBarcodeNo = data.orderP.productBarcodeNo;
//     const productProblem = [];
//     const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

//     // productionNode: [{   // ## อยู่ในการผลิตขั้นตอนไหน
//     //   fromNode : {type: String},
//     //   toNode : {type: String},
//     //   datetime : {type: Date},
//     //   createBy: {
//     //     userID: {type: String},
//     //     userName: {type: String},
//     //   }
//     // }]


//     // const productOR = data.order.productOR;
//     // const customerOR = data.order.customerOR;

//     // const orderProductionUpsert = await OrderProduction.updateOne({$and: [
//     //     {"companyID":companyID},
//     //     {"orderID":orderID}, 
//     //   ]} , 
//     //   {
//     //     "orderDetail": orderDetail,
//     //     "orderDate": orderDate,
//     //     "deliveryDate": deliveryDate,
//     //     "customerOR": customerOR,
//     //     "productOR": productOR,
//     //   }, {upsert: true}); 

//     // // ## get 1 order
//     // // exports.getOrder= async (companyID, orderID) 
//     // const order = await ShareFunc.getOrder(companyID, orderID);

//     await ShareFunc.upsertUserSession1hr(data.userID);
//     const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
//     res.status(200).json({
//       token: token,
//       expiresIn: process.env.expiresIn,
//       userID: data.userID,
//       // order: order
//     });

//   } catch (err) {
//     console.log(err);
//     return res.status(501).json({
//       message: {
//         messageID: 'errO005', 
//         mode:'errCreateOrderProduction', 
//         value: "create Order Production error"
//       }
//     });
//   }
// }

// // ## /api/order/orderProductionQueue/createnew   postOrderProductionQueueCreateNew
// router.post("/orderProductionQueue/createnew", checkAuth, checkUUID, orderController.postOrderProductionQueueCreateNew);
exports.postOrderProductionQueueCreateNew = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  // console.log(data);
  try {
    // ##  
    const companyID = data.companyID;
    const orderID = data.orderID;
    const productID = data.productID;
    let queueInfo = data.queueInfo;
    const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    queueInfo.queueDate = current;

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    // console.log(data);

    // ## check running number exist
    let productBarcodeNo = [];
    const productBarcode = queueInfo.productBarcode;
    const factoryID = queueInfo.factoryID;
    const numberFrom = queueInfo.numberFrom;
    const numberTo = queueInfo.numberTo;
    for(let i = numberFrom; i <= numberTo;i++) {
      // console.log(i);
      const num5 = await ShareFunc.setStrLen(5, i);
      productBarcodeNo.push(productBarcode+num5);
    }
    // console.log(productBarcodeNo);
    const existed = await ShareFunc.checkExistOrderProductionByBarcodeNo(
                                      companyID, factoryID, orderID, productID, productBarcodeNo);
    //
    // console.log('existed' , existed);
    if (!existed) {
      // ##  add array new queue 
      result1 = await OrderProductionQueue.updateOne(
        {$and: [
          {"companyID":companyID},
          {"orderID":orderID},
          {"productID":productID},
        ]}, 
        {$push: {queueInfo: {$each:[queueInfo],  $position: 0}}},  // ## add new element at the first
        );
  
      // ## add new record to orderProduction n record
      const toNode = queueInfo.toNode;
      const createBy = queueInfo.createBy;
      let orderProductionArr = [];
      await this.asyncForEach(productBarcodeNo , async (productBarcodeNo) => {
        orderProductionArr.push({
          companyID: companyID,
          factoryID: factoryID,
          orderID: orderID,
          productID: productID,
          productBarcodeNo: productBarcodeNo,
          productBarcodeNoReal: productBarcodeNo,
          productBarcodeNoReserve: [],
          productionDate: current,
          productStatus: 'normal',
          //productProblem: [],
          productionNode: [{
            fromNode: 'starterNode',
            toNode: toNode,
            status: 'normal',
            productProblemID: '',
            datetime: current,
            createBy: createBy
          }]
        });
      });
      result1 = await OrderProduction.insertMany(orderProductionArr);

    } else {  // ## err --> had Order Production  BarcodeNo , existed
      return res.status(422).json({
        message: {
          messageID: 'errO007-1', 
          mode:'errCreateOrderProductionQueueByBarcodeNoExisted', 
          value: "create Order Production Queue error by barcodeNo Existed"
        },
        token: token,
        expiresIn: process.env.expiresIn,
        userID: data.userID,
        success: false
      });
    }

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      success: true
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO005', 
        mode:'errCreateOrderProduction', 
        value: "create Order Production error"
      }
    });
  }
}

// // ## /api/order/delorder1/orderProductionQueues/cancel  deleteOrderProductionQueuesCancel
// router.post("/delorder1/orderProductionQueues/cancel", checkAuth, checkUUID, orderController.deleteOrderProductionQueuesCancel);
exports.deleteOrderProductionQueuesCancel = async (req, res, next) => {
  const data = req.body.orderProductionQueueList;
  const userID = req.userData.tokenSet.userID;
  // console.log('postOrderProductionQueuesCreateNew');
  // console.log(data);

  let session = await mongoose.startSession();
  // session.startTransaction();
  // let session2 = await mongoose.startSession();
  // session2.startTransaction();
  // let session3 = await mongoose.startSession();
  // session3.startTransaction();
  try {
    await session.withTransaction(async (session) => {
      // ##  
      // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
      const companyID = data.companyID;
      const orderID = data.orderID;
      const productID = data.productID;
      const productBarcode = data.productBarcode;
      const isOutsource = data.isOutsource;

      const bundleNoFrom = +data.bundleNoFrom;
      const bundleNoTo = +data.bundleNoTo;
      // const createBy = data.createBy;
      const numberFrom = +data.numberFrom;
      const numberTo = +data.numberTo;

      const page = +req.body.page;
      const limit = +req.body.limit;

      // ## gen productBarcodeNoArr
      const productBarcodeNoArr = await ShareFunc.genProductBarcodeNoArr(productBarcode, +numberFrom, +numberTo);

      // ## check first ===>  must orderProduction have to not scaned by somw staff for update to next station
      const checkArrLen = await OrderProduction.aggregate([
        { $match: { $and: [
          {"companyID":companyID}, 
          {"orderID":orderID}, 
          // {"productID":productID}, 
          {"productBarcodeNoReal":{$in: productBarcodeNoArr}},
          { $expr:{$gte: [{$size: "$productionNode"}, 2]}}
        ] } },
        { $project: {			
            _id: 1,	
            productBarcodeNo: 1,
            productBarcodeNoReal: 1,
        }	}
      ]);
      // console.log(checkArrLen);

      if (checkArrLen.length === 0) {

        //  ## delete orderProductionQueueList
        const result1 = await OrderProductionQueueList.deleteMany({$and: [
          {"companyID":companyID}, 
          {"orderID":orderID}, 
          // {"productID":productID}, 

          {"productBarcode":productBarcode}, 
          {"isOutsource":isOutsource}, 
          {"numberFrom":numberFrom}, 
          {"numberTo":numberTo}, 
          {"bundleNoFrom":bundleNoFrom}, 
          {"bundleNoTo":bundleNoTo}, 
        ]}).session(session); 


        //  ## update orderProductionQueue / delete array 1 element 
        const result2 = await OrderProductionQueue.updateOne(
          {$and: [
            {"companyID":companyID},
            {"orderID":orderID},
            // {"productID":productID},
          ]}, 
          {
            $pull: { queueInfo: {                // ## delete n element for this condition
              productBarcode: productBarcode, 
              isOutsource: isOutsource,

              numberFrom: { $gte: numberFrom},   // ## numberFrom ===>  >= numberFrom  && <= numberTo
              numberFrom: { $lte : numberTo},

              numberTo: { $gte: numberFrom},   // ## numberTo ===>  >= numberFrom  && <= numberTo
              numberTo: { $lte : numberTo},

              bundleNo: { $gte: bundleNoFrom},   // ## bundleNo ===>  >= bundleNoFrom  && <= bundleNoTo
              bundleNo: { $lte : bundleNoTo},
              
            } }  
          },
          {upsert: true}).session(session);

        // ## delete orderProduction
        const result3 = await OrderProduction.deleteMany({$and: [
          {"companyID":companyID}, 
          {"orderID":orderID}, 
          // {"productID":productID}, 
          {"productBarcodeNoReal":{$in: productBarcodeNoArr}},
        ]}).session(session);
        
      // ## err / have some orderProduction scanned already 
      } else {
        return res.status(501).json({
          message: {
            messageID: 'errO018', 
            mode:'errCancelOrderProduction', 
            value: "cancel Order Production error"
          }
        });
      }

      await session.commitTransaction();
      session.endSession();
      // await session2.commitTransaction();
      // session2.endSession();
      // await session3.commitTransaction();
      // session3.endSession();

      // queueList: OrderProductionQueueList[]; queueListCount: number
      const queueList = await ShareFunc.getOrderQueueSetList(companyID, orderID, page, limit);
      const queueListCount = await ShareFunc.getOrderQueueSetListCount(companyID, orderID);

      await ShareFunc.upsertUserSession1hr(userID);
      const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
      
      res.status(200).json({
        token: token,
        expiresIn: process.env.expiresIn,
        userID: userID,
        success: true,
        queueList: queueList,
        queueListCount: queueListCount
      });

    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    // await session2.abortTransaction(); 
    // session2.endSession();
    // await session3.abortTransaction(); 
    // session3.endSession();
    return res.status(501).json({
      message: {
        messageID: 'errO018', 
        mode:'errCancelOrderProduction', 
        value: "cancel Order Production error"
      }
    });
  }  finally {
    session.endSession();
    // session2.endSession();
    // session3.endSession();
  }
}



exports.getbundleNoByRunningNo= async (queueInfo, productBarcodeNo) => {
  let bundleNo = 0;
  const num = +productBarcodeNo.slice(-5);
  await this.asyncForEach2(queueInfo, async (item1) => {
    if (+item1.numberFrom <= +num && +item1.numberTo >= +num) {
      bundleNo = item1.bundleNo;
    }
  });
  return bundleNo;
}

exports.createRangeProductBarcodeNoArr= async (productBarcode, qty, startNo, toNo, createOrderQtyMaxPerRound, 
                                              bundleItems, bundleNoFrom, bundleNoTo) => {
  // bundleItems  12  (1 dozen = 12 pcs)
  // console.log(productBarcode, qty, startNo, toNo, createOrderQtyMaxPerRound, 
  //   bundleItems, bundleNoFrom, bundleNoTo);
  let productBarcodeNoRange = [];
  
  if (qty <= createOrderQtyMaxPerRound) {
    const range = {
      productBarcode: productBarcode,
      totalQty: toNo - startNo - 1,
      startNo: startNo,
      toNo: toNo,
      bundleItems: bundleItems,
      bundleNoFrom: bundleNoFrom,
      bundleNoTo: bundleNoTo,
    };
    productBarcodeNoRange.push(range);
    // console.log(productBarcodeNoRange);
    return productBarcodeNoRange;
  } else {  // roundSet
    const roundSet = Math.floor(qty / createOrderQtyMaxPerRound);
    const fraction = qty % createOrderQtyMaxPerRound;

    let startNoRun = startNo;
    let startNo1 = 0;
    let toNo1 = 0;
    let totalBundle = 0;

    let bundleNoFrom1 = bundleNoFrom;
    let bundleNoTo1 = 0;

    let i = 0;
    while (i < roundSet) {
      // const startNo = 
      // startNoRun = startNoRun + (createOrderQtyMaxPerRound * i);
      // startNo1 = startNoRun;

      startNo1 = startNoRun + (createOrderQtyMaxPerRound * i);
      toNo1 = startNo1 + createOrderQtyMaxPerRound - 1;

      totalBundle = (toNo1 - startNo1 - 1) / bundleItems;
      bundleNoFrom1 = +bundleNoFrom + (i * +createOrderQtyMaxPerRound / +bundleItems);
      bundleNoTo1 = +bundleNoFrom1 + (+createOrderQtyMaxPerRound / +bundleItems) - 1;
      const range2 = {
        productBarcode: productBarcode,
        totalQty: toNo1 - startNo1 + 1,
        startNo: startNo1,
        toNo: toNo1,
        bundleItems: bundleItems,
        bundleNoFrom: bundleNoFrom1,
        bundleNoTo: bundleNoTo1,
      };
      productBarcodeNoRange.push(range2);
      i++;
    }

    const startNo2 = toNo1 + 1;
    const toNo2 = startNo2 + fraction - 1;

    const qtyRemain = qty - (i * createOrderQtyMaxPerRound);
    const bundleRemain = (qtyRemain / bundleItems);
    const bundleNoFrom2 = bundleNoTo1 + 1;
    const bundleNoTo2 = bundleNoFrom2 + bundleRemain - 1;
    const range3 = {
      productBarcode: productBarcode,
      totalQty: fraction,
      startNo: startNo2,
      toNo: toNo2,
      bundleItems: bundleItems,
      bundleNoFrom: bundleNoFrom2,
      bundleNoTo: bundleNoTo2,
    };
    productBarcodeNoRange.push(range3);

    // console.log(productBarcodeNoRange);
    return productBarcodeNoRange;
  }
}

exports.createProductBarcodeNoArr= async (productBarcodeNoRange) => {
  let numberFrom = productBarcodeNoRange.startNo;
  let numberTo = productBarcodeNoRange.toNo;
  let productBarcodeNoArr = [];
  for(let i = numberFrom; i <= numberTo;i++) {
    // console.log(i);
    // if (i > orderQty) { forLossQty++; }
    const num5 = await ShareFunc.setStrLen(5, i);
    productBarcodeNoArr.push(productBarcodeNoRange.productBarcode+num5);
    // productBarcodeNoUUID.push(uuid);
    // maxNo++;
  }
  return productBarcodeNoArr;
}

exports.createQueueInfo= async (productBarcodeNoRange, productBarcodeNoUUID, current, 
    factoryID, isOutsource, forLoss, forLossQty,
    toNode, yarnLot, createBy) => {
  let noRunning = +productBarcodeNoRange.startNo;
  let j = 0;
  let queueInfo = [];
  for (i = +productBarcodeNoRange.bundleNoFrom; i <= +productBarcodeNoRange.bundleNoTo; i++) {
    const queueInfo1 = {
      productBarcode: productBarcodeNoRange.productBarcode,
      queueDate: current,
      factoryID: factoryID,
      isOutsource: isOutsource,
      forLoss: forLoss,
      forLossQty: forLossQty,
      bundleNo: +productBarcodeNoRange.bundleNoFrom + j,
      bundleID: productBarcodeNoUUID[j],
      toNode: toNode,
      productCount: +productBarcodeNoRange.bundleItems,
      numberFrom: +noRunning + (j * +productBarcodeNoRange.bundleItems),
      numberTo: +noRunning + (j * +productBarcodeNoRange.bundleItems) + +productBarcodeNoRange.bundleItems - 1,
      yarnLot: yarnLot,
      createBy: createBy,
    };
    queueInfo.push(queueInfo1);
    j++;
  }
  // console.log(queueInfo.length);
  return queueInfo;
}

// // ## /api/order2/orderProductionQueues/lists/createnew   postOrderProductionQueuesCreateNew
// router.post("/order2/orderProductionQueues/lists/createnew", checkAuth, checkUUID, orderController.postOrderProductionQueuesCreateNew);
exports.postOrderProductionQueuesCreateNew = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  // console.log('postOrderProductionQueuesCreateNew');
  // console.log(data);

  // let session = await mongoose.startSession();
  // session.startTransaction();
  // let session2 = await mongoose.startSession();
  // session2.startTransaction();
  // let session3 = await mongoose.startSession();
  // session3.startTransaction();
  let session = await mongoose.startSession();

  try {
    await session.withTransaction(async (session) => {
      // ##  
      const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
      const companyID = data.companyID;
      const factoryID = data.factoryID;
      
      const orderID = data.orderID;
      const productID = data.productID;
      const seasonYear = data.seasonYear;
      const ver = +data.ver;
      const productBarcode = data.productBarcode;
      const targetPlace = data.targetPlace;
      let queueInfo = data.queueInfo;  // array 
      const qty = data.qty;
      const orderQty = data.orderQty; // full order zone qty
      const forLoss = data.forLoss;
      const productStatusArr = [''];

      const startNo = +data.startNo;
      const toNo = +data.toNo;
      // console.log(startNo , toNo);
      // console.log(productBarcode );
      // console.log(data.ver);

      const bundleItems = +data.bundleItems;
      const bundleNoFrom = +data.bundleNoFrom;
      const bundleNoTo = +data.bundleNoTo;
      const toNode1 = data.toNode1;
      const toNode = data.toNode1;
      const numberFrom1 = startNo;
      const numberTo1 = toNo;
      const yarnLot = data.yarnLots;
      const isOutsource = data.isOutsource;
      const txtOutsource = 'outsource';
      let outsourceData = data.outsourceData;
      outsourceData.datetime = current;

      const createBy = data.createBy;
      let productCount = +bundleItems;

      await ShareFunc.upsertUserSession1hr(userID);
      const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

      // console.log(queueInfo[0]);
      // console.log(isOutsource, bundleNoFrom,bundleNoTo,toNode1,numberFrom1,numberTo1);
      // console.log(qty);

      // queueInfo.queueDate = current;
      // console.log(targetPlace);
      // console.log(queueInfo);

      // ## check T.orderProductionQueue  for bundleNo exist 
      let bundleNos = [];
      for (let i = +bundleNoFrom; i <= +bundleNoTo; i++) {
        bundleNos.push(i);
      }
      const bundleNoExisted = await ShareFunc.checkBundleNoExisted(companyID, orderID, productBarcode, bundleNos, ver);
      // console.log('bundleNoExisted = ', bundleNoExisted);
      if (bundleNoExisted) {
        await session.abortTransaction(); 
        session.endSession();
        return res.status(422).json({
          message: {
            messageID: 'errO007-2-1', 
            mode:'errCreateOrderProductionsListQueueBybundleNoExisted', 
            value: "create Order Productions list Queue error by bundleNo Existed"
          },
          token: token,
          expiresIn: process.env.expiresIn,
          userID: data.userID,
          success: false
        });
      }

      // console.log(yarnLot);
      let yarnLot2 = [];
      await this.asyncForEach(yarnLot, async (item1) => {
        yarnLot2.push({yarnLotID: item1.yarnLotID});
      });

      let outsourceData1 = [];
      if (outsourceData.factoryID !== '') {
        outsourceData1 = [outsourceData];
      }
      // console.log(yarnLot2);

      const createOrderQtyMaxPerRound = process.env.createOrderQtyMaxPerRound; // ## 1200 record

      // ## create range of productBarcodeNo
      // createRangeProductBarcodeNoArr= async (productBarcode, qty, startNo, toNo)
      const productBarcodeNoRange = await this.createRangeProductBarcodeNoArr(
        productBarcode, 
        +qty, 
        +startNo, 
        +toNo, 
        +createOrderQtyMaxPerRound,
        +bundleItems,
        bundleNoFrom,
        bundleNoTo
      );
      // console.log(productBarcodeNoRange);

      // ## find forLossQty
      let forLossQty = 0;
      if (+toNo > orderQty) {  // not over qty
        forLossQty = +toNo - +orderQty;
      }

      let maxRecordRound = 0;  // ## for * createOrderQtyMaxPerRound (createOrderQtyMaxPerRound * maxRecordRound)
      await this.asyncForEach(productBarcodeNoRange, async (item1) => {

        // ## gen productBarcodeNoArr
        const productBarcodeNoArr = await this.createProductBarcodeNoArr(item1);
        // console.log(productBarcodeNoArr);

        // ## gen uuid for by bundle count
        let productBarcodeNoUUID = [];
        for(let k = +item1.bundleNoFrom; k <= +item1.bundleNoTo;k++) {
          const uuid = uuidv4();
          productBarcodeNoUUID.push(uuid);
        }

        // console.log('0000');
        let bundleNoArr = [];
        for (i = +bundleNoFrom; i <= +bundleNoTo; i++) {
          bundleNoArr.push(i);
        }
        // console.log(bundleNoArr);
        // console.log('1111');

        // ## check running number exist /  check existed for productBarcodeNo
        const existed = await ShareFunc.checkExistOrderProductionByBarcodeNo(
                              companyID, factoryID, orderID, productID, productBarcodeNoArr);
        // console.log(existed);
        if (!existed) {
            // ## add new record to orderProduction n record
            let productionNode1;
            if (isOutsource) {  // ## case id outsource
              productionNode1 = {
                  factoryID: outsourceData1[0].factoryID,
                  fromNode: txtOutsource,
                  toNode: txtOutsource,
                  datetime: current,
                  status: txtOutsource,
                  isOutsource: isOutsource,
                  outsourceData: outsourceData1,
                  productProblemID: '',
                  createBy: createBy
                };
            } else {
              productionNode1 = {
                  factoryID: factoryID,
                  fromNode: 'starterNode',
                  toNode: toNode,
                  datetime: current,
                  status: 'normal',
                  isOutsource: isOutsource,
                  productProblemID: '',
                  createBy: createBy
                };
            }
            let orderProductionArr = [];
            let j = 0;
            let x = 1; // ## qty running
            await this.asyncForEach2(productBarcodeNoArr , async (productBarcodeNo) => {
              const runningNO = +productBarcodeNo.substr(+process.env.runningNoPos, +process.env.runningNoDigit);
              const forLossX = runningNO > orderQty;

              // ## find bundle no
              const bundleNoCount = Math.floor((x + (createOrderQtyMaxPerRound * maxRecordRound)) / +bundleItems)
              const bundleNofraction = ((x + (createOrderQtyMaxPerRound * maxRecordRound)) % +bundleItems) > 0 ? 1 : 0;
              const bundleNoF = +bundleNoCount + +bundleNofraction;

              // console.log('bundleNoF ' , bundleNoF);

              orderProductionArr.push({
                companyID: companyID,
                factoryID: factoryID,
                orderID: orderID,
                open: true,
                bundleNo: +bundleNoArr[bundleNoF - 1],
                bundleID: productBarcodeNoUUID[bundleNoF - 1],
                ver: +ver,
                productID: productID,
                productBarcodeNo: productBarcodeNo,
                productBarcodeNoReal: productBarcodeNo,
                productBarcodeNoReserve: [],
                targetPlace: targetPlace,
                productCount: +bundleItems,
                productionDate: current,
                productStatus: 'normal',
                forLoss: forLossX,
                isOutsourceTracking: false,
                yarnLot: yarnLot2,
                outsourceData: outsourceData1,
                productionNode: [productionNode1]
              });
              lastQty = +runningNO;
              // j++;
              x++;
            });
            // console.log('2222');
            // console.log(orderProductionArr);
            // console.log('orderProductionArr size = ', Buffer.byteLength(orderProductionArr));
            const bundleNoExisted2 = await ShareFunc.checkBundleNoExisted(companyID, orderID, productBarcode, bundleNos, ver);
            if (bundleNoExisted2) {
              await session.abortTransaction(); 
              session.endSession();
              return res.status(422).json({
                message: {
                  messageID: 'errO007-2-1', 
                  mode:'errCreateOrderProductionsListQueueBybundleNoExisted', 
                  value: "create Order Productions list Queue error by bundleNo Existed"
                },
                token: token,
                expiresIn: process.env.expiresIn,
                userID: data.userID,
                success: false
              });
            }
            const result3 = await OrderProduction.insertMany(orderProductionArr, { session: session });
            // console.log('3333');

            // ## gen queueInfo
            const queueInfo = await this.createQueueInfo(item1, productBarcodeNoUUID, current, 
                          factoryID, isOutsource, forLoss, forLossQty,
                          toNode, yarnLot, createBy);
            // console.log('444');

            // ## err for create queueInfo array
            if (queueInfo.length === 0) {
              await session.abortTransaction(); 
              session.endSession();
              // await session2.abortTransaction(); 
              // session2.endSession();
              // await session3.abortTransaction(); 
              // session3.endSession();
              return res.status(422).json({
                message: {
                  messageID: 'errO007-2-1', 
                  mode:'errCreateOrderProductionsListQueueBybundleNoExisted', 
                  value: "create Order Productions list Queue error by bundleNo Existed"
                },
                token: token,
                expiresIn: process.env.expiresIn,
                userID: data.userID,
                success: false
              });
            }

            // // ## edit queueInfo to OrderProductionQueue.queueInfo
            // queueInfo = []; // ## no need to add element to queueInfo 18-6-2024up.
            // const result5 = await OrderProductionQueue.updateOne(
            //   {$and: [
            //     {"companyID":companyID},
            //     {"orderID":orderID},
            //     {"ver":ver},
            //   ]}, 
            //   {
            //     // "forLossQty": forLossQty,
            //     $push: {queueInfo: {$each:queueInfo,  $position: 0}}  // ## add new element at the first
            //   },
            //   {upsert: true}).session(session);
            // console.log('5555');

        } else {  // ## err --> had Order Production  BarcodeNo , existed
          // console.log('666');
            await session.abortTransaction(); 
            session.endSession();
            // await session2.abortTransaction(); 
            // session2.endSession();
            // await session3.abortTransaction(); 
            // session3.endSession();
            return res.status(422).json({
              message: {
                messageID: 'errO007-2', 
                mode:'errCreateOrderProductionsListQueueByBarcodeNoExisted', 
                value: "create Order Productions list Queue error by barcodeNo Existed"
              },
              token: token,
              expiresIn: process.env.expiresIn,
              userID: data.userID,
              success: false
            });
        }

        maxRecordRound++;

      });

      // console.log('7777');

      // ## insert one orderProductionQueueList
      const orderProductionQueueList1 = [{
        companyID: companyID,
        orderID: orderID,
        productID: productID,
        seasonYear: seasonYear,
        ver: +ver,
        factoryID: factoryID,
        productBarcode: productBarcode,
        isOutsource: isOutsource,
        queueDate: current,
        forLoss: forLoss,
        forLossQty: forLossQty,
        productCount: +bundleItems,
        toNode: isOutsource ? txtOutsource: toNode1,
        numberFrom: numberFrom1,
        numberTo: numberTo1,
        bundleNoFrom: bundleNoFrom,
        bundleNoTo: bundleNoTo,
        yarnLot: yarnLot2,
        outsourceData: outsourceData1,
        createBy: createBy
      }];
      // console.log(companyID, current, userID, logID, note);
      const bundleNoExisted3 = await ShareFunc.checkBundleNoExisted(companyID, orderID, productBarcode, bundleNos, ver);
      if (bundleNoExisted3) {
        await session.abortTransaction(); 
        session.endSession();
        return res.status(422).json({
          message: {
            messageID: 'errO007-2-1', 
            mode:'errCreateOrderProductionsListQueueBybundleNoExisted', 
            value: "create Order Productions list Queue error by bundleNo Existed"
          },
          token: token,
          expiresIn: process.env.expiresIn,
          userID: data.userID,
          success: false
        });
      }
      const insertone = await OrderProductionQueueList.insertMany(orderProductionQueueList1, { session: session });

      // console.log('8888');

      // ## edit order if qty > orderQty ----> forLoss case
      if (forLossQty > 0) {
        const resultX = await ShareFunc.editOrderForLossToStyleZone
                              (companyID, factoryID, orderID, productBarcode, targetPlace,  forLossQty);
        // companyID factoryID orderID productBarcode targetPlace  forLossQty
      }

      await session.commitTransaction();
      session.endSession();
      // await session2.commitTransaction();
      // session2.endSession();
      // await session3.commitTransaction();
      // session3.endSession();
      
      res.status(200).json({
        token: token,
        expiresIn: process.env.expiresIn,
        userID: userID,
        success: true
      });

    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    // await session2.abortTransaction(); 
    // session2.endSession();
    // await session3.abortTransaction(); 
    // session3.endSession();
    return res.status(501).json({
      message: {
        messageID: 'errO005-1', 
        mode:'errCreateOrderProductions', 
        value: "create Order Productions error"
      }
    });
  }  finally {
    session.endSession();
    // session2.endSession();
    // session3.endSession();
  }
}

// // ## /api/order/orderrewrite/orderqty/rewrite  putOrderProductionQtyRewrite
// router.put("/orderrewrite/orderqty/rewrite", checkAuth, checkUUID, orderController.putOrderProductionQtyRewrite);
exports.putOrderProductionQtyRewrite = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('putOrderProductionQtyRewrite');
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const data = req.body;

  try {
    // ##  rewrite order qty 
    const companyID = data.companyID;
    const orderID = data.orderID;
    const productBarcode = data.productBarcode;
    const color = data.color;
    const size = data.size;
    const targetPlace = data.targetPlace;
    const year = data.year;
    const sex = data.sex;
    const orderQTY = +data.orderQTY;
    const orderQTYOld = +data.orderQTYOld;
    const createBy = data.createBy;
    // const orderColor = data.order.orderColor;

    // console.log(
    //         companyID,
    //         orderID,
    //         productBarcode,
    //         color,
    //         size,
    //         year,
    //         sex,
    //         targetPlace,
    //         orderQTY,
    //         orderQTYOld,
    // );

    // ## update 1 record for productORInfo  && insert push 1 record for productORRewriteInfo
    const productORRewriteInfo = {
      datetime: current,
      productBarcode: productBarcode,
      targetPlace: targetPlace,
      productColor: color,
      productSize: size,
      productQtyOld: orderQTYOld,
      productQty: orderQTY,
      productYear: year,
      productSex: sex,
      createBy: createBy,
    };

    

    const orderUpdate = await Order.updateOne({$and: [
      {"companyID":companyID},
      {"orderID":orderID}, 
    ]} , 
    {
      $push: {"productOR.productORRewriteInfo": productORRewriteInfo},
    }); 

    const orderUpdate2 = await Order.updateOne(
      {$and: [
        {"companyID":companyID},
        {"orderID":orderID},
      ]},
      {$set: { "productOR.productORInfo.$[elem].productQty" : orderQTY}}, 
      {
        multi: true,
        arrayFilters: [  {
          "elem.productBarcode": productBarcode , 
          // "elem.targetPlace.targetPlaceID": targetPlace.targetPlaceID, 
          // "elem.targetPlace.countryID": targetPlace.countryID,
        } ]
      });

      // userBetRunUpNum1 = await UserBet.updateMany(
      //   {$and: [
      //     {"companyID":companyID} , 
      //     {"lottoRoundID":lottoRoundID}, 
      //     {"lottoMainTypeID":lottoMainTypeID},
      //     {"betCancel":false} ,
      //   ]},
      //   {$set: { "bet.$[elem].jackpot" : true}}, 
      //   {
      //     multi: true,
      //     arrayFilters: [  {"elem.lottoBetType": "up2" , "elem.betNumber": upNum2, "elem.cancel": false} ]
      //   });

    // ## get 1 order
    // exports.getOrder= async (companyID, orderID) 
    const order = await ShareFunc.getOrder(companyID, orderID);

    const orderStatusArr = [''];
    orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpecByOrderID(companyID, orderStatusArr, orderID);
    currentCompanyOrder = await ShareFunc.getCurrentCompanyOrderByOrderID(companyID, orderStatusArr, orderID);
    currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyleByOrderID(companyID, orderStatusArr, orderID);
    

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      order: order,
      orderStyleColorSize: orderStyleColorSize,
      currentCompanyOrder: currentCompanyOrder,
      currentOrderStyle: currentOrderStyle,
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO017', 
        mode:'errEditOrderQtyRewrite', 
        value: "error edit order qty rewrite"
      }
    });
  }
}


// // ## get order list /api/order/getqlist1/:companyID/:userID/:orderID/:productBarcode/:page/:limit  getOrdersQueueList
// router.get("/getqlist1/:companyID/:userID/:orderID/:productBarcode/:page/:limit", checkAuth, checkUUID, orderController.getOrdersQueueList);
exports.getOrdersQueueList = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const orderID = req.params.orderID;
  const productBarcode = req.params.productBarcode;
  const page = +req.params.page;
  const limit = +req.params.limit;  // ## records we need to get
  const userID = req.userData.tokenSet.userID;
  // console.log('getOrdersQueueList');
  // console.log(companyID, orderID, productBarcode);
  try {
    //  getOrderQueueList= async (companyID, orderID, productBarcode, page, limit)
    const queueList = await ShareFunc.getOrderQueueList(companyID, orderID, productBarcode, page, limit);
    const queueListCount = await ShareFunc.getOrderQueueListCount(companyID, orderID, productBarcode);
    // console.log(queueListCount, queueList);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      queueList: queueList,
      queueListCount: queueListCount,
      // sumProductionQueueByBarcode: sumProductionQueueByBarcode,
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO016', 
        mode:'errGetOrderListQueue', 
        value: "error get order list queue"
      }
    });
  }
}

// // ## get order list /api/order/getqsetlist2/:companyID/:userID/:orderID/:page/:limit  getOrdersQueueSetList
// router.get("/getqsetlist2/:companyID/:userID/:orderID/:page/:limit", checkAuth, checkUUID, 
// orderController.getOrdersQueueSetList);
exports.getOrdersQueueSetList = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const orderID = req.params.orderID;
  // const productBarcode = req.params.productBarcode;
  const page = +req.params.page;
  const limit = +req.params.limit;  // ## records we need to get
  const userID = req.userData.tokenSet.userID;
  // console.log('getOrdersQueueList');
  // console.log(companyID, orderID, productBarcode);
  try {
    //  getOrderQueueList= async (companyID, orderID, productBarcode, page, limit)
    const queueSetList = await ShareFunc.getOrderQueueSetList(companyID, orderID, page, limit);
    const queueSetListCount = await ShareFunc.getOrderQueueSetListCount(companyID, orderID);
    // console.log(queueSetListCount, queueSetList);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      queueSetList: queueSetList,
      queueSetListCount: queueSetListCount,
      // sumProductionQueueByBarcode: sumProductionQueueByBarcode,
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO016', 
        mode:'errGetOrderListQueue', 
        value: "error get order list queue"
      }
    });
  }
}


// // ## get getProductionQueueBarcodeSumQty
// router.get("/order3/getsumqty/queue/:companyID/:orderID/:productID", 
//       checkAuth, checkUUID, orderController.getProductionQueueBarcodeSumQty)
exports.getProductionQueueBarcodeSumQty = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  const orderID = req.params.orderID;
  const productID = req.params.productID;
  const productBarcode = req.params.productBarcode;
  const userID = req.userData.tokenSet.userID;
  // console.log('getProductionQueueBarcodeSumQty');
  try {
    // ## get last n record production queue by barcodeNo
    const productionQueuedQtySumf = await ShareFunc.getTotalProductionQueued
                              (companyID, orderID, productID);
    // console.log(productionQueuedQtySum);
    const productionQueuedQtySum = productionQueuedQtySumf.map(fw => ({
      productBarcode: fw._id.productBarcode, 
      forLoss: fw._id.forLoss, 
      countProductionQueueByBarcode: fw.countProductionQueueByBarcode,
      sumProductionQueueByBarcode: fw.sumProductionQueueByBarcode,
    }));



    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      productionQueuedQtySum: productionQueuedQtySum,
      // countProductionQueueByBarcode: countProductionQueueByBarcode,
      // sumProductionQueueByBarcode: sumProductionQueueByBarcode,
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO012', 
        mode:'errOrderQueuedSumQty', 
        value: "error get Order queued  sum qty"
      }
    });
  }
}

// // ## get last n record production queue by barcodeNo
// router.get("/lastProduction/getlists/:companyID/:orderID/:productID/:productBarcode/:page/:limit", 
//       checkAuth, checkUUID, orderController.getLastProductionQueueBarcode);
exports.getLastProductionQueueBarcode = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  const orderID = req.params.orderID;
  const productID = req.params.productID;
  const productBarcode = req.params.productBarcode;
  const page = +req.params.page;
  const limit = +req.params.limit;  // ## records we need to get
  const userID = req.userData.tokenSet.userID;
  // console.log('getLastProductionQueueBarcode');
  try {

    // ## get last n record production queue by barcodeNo
    const queueInfo = await ShareFunc.getLastProductionQueueByBarcode
                              (companyID, orderID, productID, productBarcode, page, limit);
    const orderProductionQueue = {
      companyID,
      orderID,
      productID,
      queueInfo,
    };
    const totalProductionQueueByBarcode = await ShareFunc.getTotalProductionQueueByBarcode
                                                (companyID, orderID, productID, productBarcode);
    let countProductionQueueByBarcode = 0;
    let sumProductionQueueByBarcode = 0;
    if (totalProductionQueueByBarcode.length>0) {
      countProductionQueueByBarcode = totalProductionQueueByBarcode[0].countProductionQueueByBarcode;
      sumProductionQueueByBarcode = totalProductionQueueByBarcode[0].sumProductionQueueByBarcode;
    }
    
    // console.log(countProductionQueueByBarcod, sumProductionQueueByBarcod);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      orderProductionQueue: orderProductionQueue,
      countProductionQueueByBarcode: countProductionQueueByBarcode,
      sumProductionQueueByBarcode: sumProductionQueueByBarcode,
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO007', 
        mode:'errCreateOrderProductionQueueByBarcodeNo', 
        value: "create Order Production Queue error by barcodeNo"
      }
    });
  }
}

// // ## get count productionqueue by bundleno
// router.get("/get/orderProductionQueue1/getcount/:companyID/:orderID", 
//       checkAuth, checkUUID, orderController.getProductionQueueCount);
exports.getProductionQueueCount = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  const orderID = req.params.orderID;
  const startNo = +req.params.startNo;
  const endNo = +req.params.endNo;
  // const productID = req.params.productID;
  // const productBarcode = req.params.productBarcode;
  // const page = +req.params.page;
  // const limit = +req.params.limit;  // ## records we need to get
  const userID = req.userData.tokenSet.userID;
  // console.log('getProductionQueueCount');
  // console.log(companyID, orderID, startNo, endNo);
  try {

    // ## get count production queues
    // const totalProductionQueueByBundleNo = await ShareFunc.getProductionQueueCountByBundleNo(companyID, orderID, startNo, endNo);
    // console.log(totalProductionQueueByBundleNo);

    const orderBundleList = await ShareFunc.getOrderBundleNoList(companyID, orderID, startNo, endNo);
    // console.log(orderBundleList, orderBundleList.length);
    const sumProductionQueueByBundleNo = Array.from(new Set(orderBundleList.map((item) => item.bundleNo))).sort();
    // console.log(sumProductionQueueByBundleNo, sumProductionQueueByBundleNo.length);
    const totalProductionQueueByBundleNo = {
      companyID, orderID,
      countProductionQueueByBundleNo: sumProductionQueueByBundleNo.length,
      sumProductionQueueByBundleNo: orderBundleList.length,
    };

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      totalProductionQueueByBundleNo: totalProductionQueueByBundleNo,
      orderProductionQueue: [],
      // countProductionQueueByBarcode: countProductionQueueByBarcode,
      // sumProductionQueueByBarcode: sumProductionQueueByBarcode,
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO020', 
        mode:'errGetCountOrderProductionQueueByBundleNo', 
        value: "error get count Order Production Queue error by bundleNo"
      }
    });
  }
}

exports.findOrderBundleList= async (bundleNo, orderBundleList) => {
  const orderBundleList1 = orderBundleList.filter(i=>i.bundleNo==bundleNo);
  return orderBundleList1.length>0?orderBundleList1[0]:{};
}

// // ## get list productionqueue by bundleno
// router.get("/get/orderProductionQueue2/getlists/:companyID/:orderID/:startNo/:endNo", 
//       checkAuth, checkUUID, orderController.getProductionQueueList);
exports.getProductionQueueList = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  const orderID = req.params.orderID;
  const startNo = +req.params.startNo;
  const endNo = +req.params.endNo;
  // const productID = req.params.productID;
  // const productBarcode = req.params.productBarcode;
  // const page = +req.params.page;
  // const limit = +req.params.limit;  // ## records we need to get
  const userID = req.userData.tokenSet.userID;
  // console.log('getProductionQueueList');
  // console.log(companyID, orderID, startNo, endNo);
  try {

    // ## get count production queues
    // const totalProductionQueueByBundleNo = await ShareFunc.getProductionQueueCountByBundleNo(companyID, orderID, startNo, endNo);
    // // console.log(totalProductionQueueByBundleNo);
    const orderBundleList = await ShareFunc.getOrderBundleNoList(companyID, orderID, startNo, endNo);
    // console.log(orderBundleList, orderBundleList.length);
    const sumProductionQueueByBundleNo = Array.from(new Set(orderBundleList.map((item) => item.bundleNo))).sort();
    // console.log(sumProductionQueueByBundleNo, sumProductionQueueByBundleNo.length);
    const totalProductionQueueByBundleNo = {
      companyID, orderID,
      countProductionQueueByBundleNo: sumProductionQueueByBundleNo.length,
      sumProductionQueueByBundleNo: orderBundleList.length,
    };

    // const orderProductionQueue = await ShareFunc.getProductionQueueListByBundleNo(companyID, orderID, startNo, endNo);
    // console.log(orderProductionQueue);
    let orderProductionQueue = [];
    await this.asyncForEach(sumProductionQueueByBundleNo, async (item1) => {
      const orderBundleList1 = await this.findOrderBundleList(item1, orderBundleList);
      const bundleBarcodeList = await ShareFunc.getOrderBarcodeNoList(companyID, orderID, item1);
      // console.log('--------------------------------',bundleBarcodeList);
      let orderProductionQueue1 = {
        companyID: companyID,
        orderID: orderID,
        productBarcode: orderBundleList1.productBarcode,
        bundleNo: item1,
        productCount: orderBundleList1.productCount,
        yarnLot: orderBundleList1.yarnLot,
        numberFrom: +bundleBarcodeList[0].no,
        numberTo: +bundleBarcodeList[bundleBarcodeList.length-1].no,
        forLossQty: orderBundleList1.forLoss?orderBundleList1.productCount:0,
      };
      orderProductionQueue.push(orderProductionQueue1);
    });
    // console.log(orderProductionQueue);

    // // getOrderBundleNoList= async (companyID, orderID, bunNoStart, bunNoEnd) 
    // const orderBundleList = await ShareFunc.getOrderBundleNoList(companyID, orderID, startNo, endNo);
    // // console.log(orderBundleList);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      totalProductionQueueByBundleNo: totalProductionQueueByBundleNo,
      orderProductionQueue: orderProductionQueue,
      orderBundleList: orderBundleList,
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO020', 
        mode:'errGetCountOrderProductionQueueByBundleNo', 
        value: "error get count Order Production Queue error by bundleNo"
      }
    });
  }
}

// // ## get all size each orderIDs  getOrderIDsSizes
// router.get("/get/orderProductionQueuelist/getsizes/:companyID/:orderIDs", 
//   checkAuth, checkUUID, orderController.getOrderIDsSizes);
exports.getOrderIDsSizes = async (req, res, next) => {
  // try {} catch (err) {}
  console.log('getOrderIDsSizes');
  const companyID = req.params.companyID;
  const orderIDs = JSON.parse(req.params.orderIDs);
  const userID = req.userData.tokenSet.userID;
  console.log(companyID, orderIDs);
  try {

    // // ## get count production queues
    // // const totalProductionQueueByBundleNo = await ShareFunc.getProductionQueueCountByBundleNo(companyID, orderID, startNo, endNo);
    // // // console.log(totalProductionQueueByBundleNo);
    // const orderBundleList = await ShareFunc.getOrderBundleNoList(companyID, orderID, startNo, endNo);
    // // console.log(orderBundleList, orderBundleList.length);
    // const sumProductionQueueByBundleNo = Array.from(new Set(orderBundleList.map((item) => item.bundleNo))).sort();
    // // console.log(sumProductionQueueByBundleNo, sumProductionQueueByBundleNo.length);
    // const totalProductionQueueByBundleNo = {
    //   companyID, orderID,
    //   countProductionQueueByBundleNo: sumProductionQueueByBundleNo.length,
    //   sumProductionQueueByBundleNo: orderBundleList.length,
    // };

    // // const orderProductionQueue = await ShareFunc.getProductionQueueListByBundleNo(companyID, orderID, startNo, endNo);
    // // console.log(orderProductionQueue);
    // let orderProductionQueue = [];
    // await this.asyncForEach(sumProductionQueueByBundleNo, async (item1) => {
    //   const orderBundleList1 = await this.findOrderBundleList(item1, orderBundleList);
    //   const bundleBarcodeList = await ShareFunc.getOrderBarcodeNoList(companyID, orderID, item1);
    //   // console.log('--------------------------------',bundleBarcodeList);
    //   let orderProductionQueue1 = {
    //     companyID: companyID,
    //     orderID: orderID,
    //     productBarcode: orderBundleList1.productBarcode,
    //     bundleNo: item1,
    //     productCount: orderBundleList1.productCount,
    //     yarnLot: orderBundleList1.yarnLot,
    //     numberFrom: +bundleBarcodeList[0].no,
    //     numberTo: +bundleBarcodeList[bundleBarcodeList.length-1].no,
    //     forLossQty: orderBundleList1.forLoss?orderBundleList1.productCount:0,
    //   };
    //   orderProductionQueue.push(orderProductionQueue1);
    // });
    // // console.log(orderProductionQueue);

    // // getOrderBundleNoList= async (companyID, orderID, bunNoStart, bunNoEnd) 
    // const orderBundleList = await ShareFunc.getOrderBundleNoList(companyID, orderID, startNo, endNo);
    // // console.log(orderBundleList);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      // totalProductionQueueByBundleNo: totalProductionQueueByBundleNo,
      // orderProductionQueue: orderProductionQueue,
      // orderBundleList: orderBundleList,
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO020', 
        mode:'errGetSizeOrderProductionQueueListByOrderIDs', 
        value: "error get sizes Order Production queue list by orderID"
      }
    });
  }
}

// // ## get last n record production queue 
// router.get("/lastProduction/getlists/:companyID/:orderID/:productID/:page/:limit", 
// checkAuth, checkUUID, orderController.getProductionQueue);
exports.getProductionQueue = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  const orderID = req.params.orderID;
  const productID = req.params.productID;
  const page = +req.params.page;
  const limit = +req.params.limit;  // ## records we need to get
  const userID = req.userData.tokenSet.userID;
  // let rows = 0; // ## count of record
  // console.log('getLastProductionQueueBarcode');
  try {

    // ## get last n record production queue by barcodeNo
    const queueInfo = await ShareFunc.getLastProductionQueue(companyID, orderID, productID, page, limit);
    const orderProductionQueue = {
      companyID,
      orderID,
      productID,
      queueInfo,
    };
    const totalProductionQueueAll = await ShareFunc.getTotalProductionQueue(companyID, orderID, productID);
    let countProductionQueueAll = 0;
    let sumProductionQueueAll = 0;
    if (totalProductionQueueAll.length>0) {
      countProductionQueueAll = totalProductionQueueAll[0].countProductionQueueAll;
      sumProductionQueueAll = totalProductionQueueAll[0].sumProductionQueueAll;
    }
    
    // console.log(countProductionQueueByBarcod, sumProductionQueueByBarcod);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      orderProductionQueue: orderProductionQueue,
      countProductionQueueAll: countProductionQueueAll,
      sumProductionQueueAll: sumProductionQueueAll,
      // rows: rows
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO008', 
        mode:'errCreateOrderProductionQueue', 
        value: "create Order Production Queue error"
      }
    });
  }
}

// // ## get last running number order production  return last number
// router.get("/lastroderProduction/runningno/:companyID/:orderID/:productID/:productBarcode", 
//             checkAuth, checkUUID, orderController.getLastNoOrderProductionBarcode);
exports.getLastNoOrderProductionBarcode = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getLastNoOrderProductionBarcode');
  const companyID = req.params.companyID;
  const ver = +req.params.ver;
  // const factoryID = req.params.factoryID;
  const orderID = req.params.orderID;
  const productID = req.params.productID;
  // const seasonYear = req.params.seasonYear;
  const productBarcode = req.params.productBarcode;
  // const page = +req.params.page;
  // const limit = +req.params.limit;  // ## records we need to get
  const userID = req.userData.tokenSet.userID;
  // console.log('getLastProductionQueueBarcode');
  // console.log(companyID,orderID,productID, productBarcode, 'ver= '+ ver );
  try {

    // ## get last running number order production  by barcodeNo
    const runningNo = await ShareFunc.getLastRunningNoOrderProduction(companyID, orderID, productID, productBarcode);
    // console.log(runningNo);

    // ## get last bundleNo
    const lastBundleNo = await ShareFunc.getLastBundleNoOrderProduction(companyID, ver);
    // console.log(lastBundleNo);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      runningNo: runningNo,
      lastBundleNo: lastBundleNo,
      ver: ver
      // countProductionQueueAll: countProductionQueueAll,
      // sumProductionQueueAll: sumProductionQueueAll,
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO009', 
        mode:'errGetLastRunningNoOrderProduction', 
        value: "error get last running number order production"
      }
    });
  }
}


// router.get("/order4/:companyID/:style/:ordertatus/:productStatus", checkAuth, checkUUID, reportController.getCompanyOrderByStyle);
exports.getCompanyOrderByStyle = async (req, res, next) => {
  // try {} catch (err) {}

  // console.log('getRepCompanyOrder');

  const companyID = req.params.companyID;
  const style = req.params.style;
  // const nodeID = req.params.nodeID;
  const orderStatusArr = JSON.parse(req.params.ordertatus);
  const productStatusArr = JSON.parse(req.params.productStatus);
  const orderIDArr = JSON.parse(req.params.orderIDArr);
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, orderStatusArr);
  // console.log(companyID, style , '.', orderIDArr);
  try {

    const currentProductQtyAllC = await ShareFunc.getCCurrentProductQtyAllByStyleC(companyID, style, productStatusArr);
    // currentOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr, orderIDArr);
    currentCompanyOrder = await ShareFunc.getCurrentCompanyOrderByStyle(companyID, style, orderStatusArr, orderIDArr);
    currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr, orderIDArr);
    
    // console.log(orderStyleColorSize, currentCompanyOrder, currentOrderStyle);
    // console.log( currentCompanyOrder);

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      orderStyleColorSize: orderStyleColorSize,
      currentCompanyOrder: currentCompanyOrder,
      currentOrderStyle: currentOrderStyle,
      currentProductQtyAllC: currentProductQtyAllC,
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

// // productBarcode  startNO   endNo
// router.get("/order7/:companyID/:productBarcode/:startNO/:endNo", checkAuth, checkUUID, orderController.getOrderProductBundleNos);
exports.getOrderProductBundleNos = async (req, res, next) => {
  // try {} catch (err) {}

  // console.log('getRepCompanyOrder');

  const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  const productBarcode = req.params.productBarcode;
  // const nodeID = req.params.nodeID;
  const startNO = +req.params.startNO;
  const endNo = +req.params.endNo;
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, orderStatusArr);

  try {

    // ## gen barcodeNo
    let productBarcodeNoArr = [];
    let i = startNO;
    while (i <= endNo){
      const num5 = await ShareFunc.setStrLen(5, i);
      productBarcodeNoArr.push(productBarcode+num5);
      i++;
    }
    const orderProductionBundleNos = await ShareFunc.getCOrderProductionBundleNos(companyID, productBarcodeNoArr);

    // // currentOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    // orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
    // currentCompanyOrder = await ShareFunc.getCurrentCompanyOrderByStyle(companyID, style, orderStatusArr);
    // currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr);
    
    // console.log(orderStyleColorSize, currentCompanyOrder, currentOrderStyle);

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      orderProductionBundleNos: orderProductionBundleNos,
      // currentCompanyOrder: currentCompanyOrder,
      // currentOrderStyle: currentOrderStyle,
      // currentProductQtyAllC: currentProductQtyAllC,
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
        messageID: 'errO014', 
        mode:'errOrderProductionBundleNos', 
        value: "error get Order production bundle no list"
      }
    });
  }
}

// router.put("/oroderProduction/productBarcodeNo/qctocomplete", checkAuth, checkUUID, orderController.putOrderProductionBarcodeNoQCtoComplete);
exports.putOrderProductionBarcodeNoQCtoComplete = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const orderID = data.orderID;
  const productBarcodeNos = data.productBarcodeNos;
  const nodeIDLast = data.nodeIDLast; // ## 7.QC
  const toNode = data.toNode; // ## completeNode
  const userID = data.userID;
  const createBy = data.createBy;

  // console.log('putOrderProductionBarcodeNoQCtoComplete');
  // console.log(companyID, factoryID, orderID, productBarcodeNos, nodeIDLast, toNode);
  // console.log(userID, createBy);
  
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    await this.asyncForEach(productBarcodeNos, async (productBarcodeNo) => {

      const productionNode = {
        factoryID: factoryID,
        fromNode: nodeIDLast,
        toNode: toNode,
        datetime: current,
        status: 'normal',
        info: 'forcecomplete',
        sTypeOtus: '',
        problemID: '',
        problemName: '',
        isTracking: false,
        isOutsource: false,
        outsourceData: [],
        createBy: createBy
      }

      // ## check last nodeID for check error
      const orderProduction1 = await ShareFunc.getOrderProduct01(companyID, factoryID, productBarcodeNo);
      // console.log(orderProduction1);
      let productionNodeX = [];
      let nodeIDLast1 = '';

      if (orderProduction1) {
        productionNodeX = orderProduction1.productionNode;
        nodeIDLast1 = productionNodeX[productionNodeX.length - 1].toNode;
        // const nodeIDF = productionNodeX.filter(i=>i.fromNode === productionNode.fromNode);
        if (nodeIDLast === nodeIDLast1) { // ## check last node is = '7.QC'
          // console.log('nodeIDLast === nodeIDLast1', nodeIDLast , nodeIDLast1);

          result002 = await OrderProduction.updateOne(
            {$and: [
              {"companyID":companyID},
              // {"factoryID":factoryID},
              {"orderID":orderID},
              // {"productID":productID},
              {"productBarcodeNoReal":{$in: [productBarcodeNo]}}
            ]}, 
            {
              // {$push: {productionNode: {$each:[productionNode],  $position: 0}}},  // ## add new element at the first
              // $push: {productionNode: productionNode},
              $push: {productionNode: {$each: [productionNode]}},
              "productStatus": 'complete'
            },).session(session);

        } else {
          console.log('nodeIDLast != nodeIDLast1', nodeIDLast , nodeIDLast1);
        }
      }

    });
    await session.commitTransaction();
    session.endSession();

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      // bundleNos: bundleNos,
      // nodeIDs: nodeIDs,
      // forbiddenNodeIDs: forbiddenNodeIDs,
      // nodeStations: nodeStations,
      // flowSeq: flowSeq,
      // orderProductBundleNosOutsourceTracking: orderProductBundleNosOutsourceTracking,
      // orderProductOutsourceTrackingFlowseqNormal: orderProductOutsourceTrackingFlowseqNormal,
      // orderProductOutsourceTrackingFlowseqTracking: orderProductOutsourceTrackingFlowseqTracking,
      // currentOrderStyle: currentOrderStyle,
      // currentProductQtyAllC: currentProductQtyAllC,
      // orders: orders,
      // products: products,
      // orderProductAllQtyRep: orderProductAllQtyRep,
      // factory: factory,
      // nodeStation: nodeStation,
      // nodeFlows: nodeFlows,
    });

    

  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
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

// // ## get bundle no by style , zone , color , size
// router.get("/orderoutsourcetracking1/getlists/:companyID/:factoryID/:orderIDs/:productionNodeStatusArr", 
//       checkAuth, checkUUID, orderController.getOrderOursourceTracking);
exports.getOrderOursourceTracking = async (req, res, next) => {
  // try {} catch (err) {}

  // console.log('getOrderOursourceTracking');

  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const orderIDs = JSON.parse(req.params.orderIDs);
  // const zoneArr = JSON.parse(req.params.zoneArr);
  // const colorArr = JSON.parse(req.params.colorArr);
  // const sizeArr = JSON.parse(req.params.sizeArr);
  const productionNodeStatusArr = JSON.parse(req.params.productionNodeStatusArr);
  // console.log(companyID, orderIDs, productionNodeStatusArr);

  try {

    // // ## gen barcodeNo
    // let productBarcodeNoArr = [];
    // let i = startNO;
    // while (i <= endNo){
    //   const num5 = await ShareFunc.setStrLen(5, i);
    //   productBarcodeNoArr.push(productBarcode+num5);
    //   i++;
    // }

    // ## get stations
    const status = ['a', 'c'];
    const nodeStations = await ShareFunc.getNodeStations(companyID, factoryID, status, 1, 10000);

    // ## get nodeflow , flowseq
    // getNodeFlow= async (companyID, factoryID, nodeFlowID)
    const nodeFlowID = 'main';
    const nodeFlow = await ShareFunc.getNodeFlow(companyID, factoryID, nodeFlowID);
    const flowSeq = nodeFlow.flowSeq;
    let nodeIDs = [];
    await this.asyncForEach(flowSeq, async (item1) => {
      nodeIDs.push(item1.nodeID);
    });
    // console.log(nodeIDs);

    // ## list nodeiD for forbidden / cannot tracking /  no outsource / do ourself
    const forbiddenNodeIDs = ['4.MENDING', '5.WASHING', '6.PRESSING', '7.QC'];

    
    // ## get only bundleNo which isOutsource status
    const isOutsourceTracking1 = false;  // ## real orderProduction / not outsourceTracking
    const orderProductBundleNosOutsourceTracking = 
      await ShareFunc.getCSZCSOrderProductionBundleNos(
        companyID, orderIDs, isOutsourceTracking1, productionNodeStatusArr, nodeIDs
      );
    // console.log(orderProductionBundleNos);

    let bundleNos = [];
    await this.asyncForEach(orderProductBundleNosOutsourceTracking, async (item1) => {
      bundleNos.push(item1.bundleNo);
    });

    
    const orderProductOutsourceTrackingFlowseqNormal = 
      await ShareFunc.getCSZCSOrderProductOutsourceTrackingFlowseqs(
        companyID, orderIDs, isOutsourceTracking1, bundleNos, nodeIDs
      );

    const isOutsourceTracking2 = false; // ## outsourceTracking case
    const orderProductOutsourceTrackingFlowseqTracking =
      await ShareFunc.getCSZCSOrderProductOutsourceTrackingFlowseqs(
        companyID, orderIDs, isOutsourceTracking2, bundleNos, nodeIDs
      );

    // // currentOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    // orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
    // currentCompanyOrder = await ShareFunc.getCurrentCompanyOrderByStyle(companyID, style, orderStatusArr);
    // currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr);
    
    // console.log(orderStyleColorSize, currentCompanyOrder, currentOrderStyle);

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      bundleNos: bundleNos,
      nodeIDs: nodeIDs,
      forbiddenNodeIDs: forbiddenNodeIDs,
      nodeStations: nodeStations,
      flowSeq: flowSeq,
      orderProductBundleNosOutsourceTracking: orderProductBundleNosOutsourceTracking,
      orderProductOutsourceTrackingFlowseqNormal: orderProductOutsourceTrackingFlowseqNormal,
      orderProductOutsourceTrackingFlowseqTracking: orderProductOutsourceTrackingFlowseqTracking,
      // currentOrderStyle: currentOrderStyle,
      // currentProductQtyAllC: currentProductQtyAllC,
      // orders: orders,
      // products: products,
      // orderProductAllQtyRep: orderProductAllQtyRep,
      // factory: factory,
      // nodeStation: nodeStation,
      // nodeFlows: nodeFlows,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO026', 
        mode:'errGetOrderOutsourceTracking', 
        value: "error get order outsource tracking"
      }
    });
  }
}

// router.get("/orderoutsourcetracking3/getlists/:companyID/:factoryID/:orderIDs/:productionNodeStatusArr/:bundleNoArr", 
//   checkAuth, checkUUID, orderController.getOrderOursourceTrackingByBundleNos);
// //
exports.getOrderOursourceTrackingByBundleNos = async (req, res, next) => {
  // try {} catch (err) {}

  // console.log('getOrderOursourceTrackingByBundleNos');

  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const orderIDs = JSON.parse(req.params.orderIDs);
  // const zoneArr = JSON.parse(req.params.zoneArr);
  // const colorArr = JSON.parse(req.params.colorArr);
  // const sizeArr = JSON.parse(req.params.sizeArr);
  const productionNodeStatusArr = JSON.parse(req.params.productionNodeStatusArr);
  const bundleNos = JSON.parse(req.params.bundleNoArr);
  // console.log(companyID, orderIDs, productionNodeStatusArr);

  try {

    // // ## gen barcodeNo
    // let productBarcodeNoArr = [];
    // let i = startNO;
    // while (i <= endNo){
    //   const num5 = await ShareFunc.setStrLen(5, i);
    //   productBarcodeNoArr.push(productBarcode+num5);
    //   i++;
    // }

    // ## get stations
    const status = ['a', 'c'];
    const nodeStations = await ShareFunc.getNodeStations(companyID, factoryID, status, 1, 10000);

    // ## get nodeflow , flowseq
    // getNodeFlow= async (companyID, factoryID, nodeFlowID)
    const nodeFlowID = 'main';
    const nodeFlow = await ShareFunc.getNodeFlow(companyID, factoryID, nodeFlowID);
    const flowSeq = nodeFlow.flowSeq;
    let nodeIDs = [];
    await this.asyncForEach(flowSeq, async (item1) => {
      nodeIDs.push(item1.nodeID);
    });
    // console.log(nodeIDs);

    // ## list nodeiD for forbidden / cannot tracking /  no outsource / do ourself
    const forbiddenNodeIDs = ['4.MENDING', '5.WASHING', '6.PRESSING', '7.QC'];

    
    // ## get only bundleNo which isOutsource status
    const isOutsourceTracking1 = false;  // ## real orderProduction / not outsourceTracking
    const orderProductBundleNosOutsourceTracking = 
      await ShareFunc.getCSZCSOrderProductionBundleNosByBundleNo(
        companyID, orderIDs, isOutsourceTracking1, productionNodeStatusArr, nodeIDs, bundleNos
      );
    // console.log(orderProductBundleNosOutsourceTracking.length);

    const statusArr1 = ['normal', 'fake', 'complete'];
    const orderProductOutsourceTrackingFlowseqNormal = 
      await ShareFunc.getCSZCSOrderProductOutsourceTrackingFlowseqs(
        companyID, orderIDs, isOutsourceTracking1, bundleNos, nodeIDs, statusArr1
      );

    // const isOutsourceTracking2 = false; // ## outsourceTracking case
    // const orderProductOutsourceTrackingFlowseqTracking =
    //   await ShareFunc.getCSZCSOrderProductOutsourceTrackingFlowseqs(
    //     companyID, orderIDs, isOutsourceTracking2, bundleNos, nodeIDs
    //   );

    // // currentOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    // orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
    // currentCompanyOrder = await ShareFunc.getCurrentCompanyOrderByStyle(companyID, style, orderStatusArr);
    // currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr);
    
    // console.log(orderStyleColorSize, currentCompanyOrder, currentOrderStyle);

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      bundleNos: bundleNos,
      nodeIDs: nodeIDs,
      forbiddenNodeIDs: forbiddenNodeIDs,
      nodeStations: nodeStations,
      flowSeq: flowSeq,
      orderProductBundleNosOutsourceTracking: orderProductBundleNosOutsourceTracking,
      orderProductOutsourceTrackingFlowseqNormal: orderProductOutsourceTrackingFlowseqNormal,
      orderProductOutsourceTrackingFlowseqTracking: [],


      // currentOrderStyle: currentOrderStyle,
      // currentProductQtyAllC: currentProductQtyAllC,
      // orders: orders,
      // products: products,
      // orderProductAllQtyRep: orderProductAllQtyRep,
      // factory: factory,
      // nodeStation: nodeStation,
      // nodeFlows: nodeFlows,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO026', 
        mode:'errGetOrderOutsourceTracking', 
        value: "error get order outsource tracking"
      }
    });
  }
}


// router.put("/orderoutsourcetracking2/productionNode", checkAuth, checkUUID, orderController.upsertOrderProducctionNodeFlow);
exports.upsertOrderProducctionNodeFlow = async (req, res, next) => {
  // console.log('upsertOrderProducctionNodeFlow');
  // try {} catch (err) {}
  const data = req.body;

  // ##  
  const companyID = data.companyID;
  const orderID = data.orderID;
  const bundleNos = data.bundleNos;
  // const bundleNosArr = data.bundleNosArr;
  const nodeIDs = data.nodeIDs;
  // const productCount = data.productCount;
  // const open = data.open;
  // const productStatusArr = data.productStatus;
  // const isOutsourceTracking = data.isOutsourceTracking;
  let productionNodes = data.productionNode; // ## arr
  
  const bundleNos2 = data.bundleNos2;  // ## for get orderProductOutsourceTrackingFlowseqNormal
  // const subNodeFlowCost = data.order.productOR.subNodeFlowCost;
  
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  // console.log(productionNodes);
  
  await this.asyncForEach(productionNodes, async (item1) => {
    item1.datetime = current;
  });

  let session = await mongoose.startSession();
  try {
    await session.withTransaction(async (session) => {
      // ## check existing orderProduction by bundleNo && isOutsourceTracking = true
      const orderProductionExist = await ShareFunc.checkExistOrderProductionbyBundleNo(companyID, orderID, bundleNos);
      if (orderProductionExist.length > 0) {
        const orderProduction1 = orderProductionExist[0].productionNode;
        const lastElement = orderProduction1.length - 1;
        // console.log(orderProduction1[lastElement]);
        const productionNodeLastElement = {
          factoryID: orderProduction1[lastElement].factoryID,
          fromNode: orderProduction1[lastElement].fromNode,
          toNode: orderProduction1[lastElement].toNode,
          datetime: orderProduction1[lastElement].datetime,
          status: 'outsource',
          sTypeOtus: orderProduction1[lastElement].sTypeOtus,
          problemID: orderProduction1[lastElement].problemID,
          problemName: orderProduction1[lastElement].problemName,
          isOutsource: true,
          outsourceData: orderProduction1[lastElement].outsourceData,
          createBy: orderProduction1[lastElement].createBy,
        }
        // ## new element for push new to array  orderProduction
        productionNodes[0].isTracking = true;
        productionNodes[0].factoryID = productionNodeLastElement.factoryID;
        productionNodes[0].outsourceData = productionNodeLastElement.outsourceData;
        const orderProductionArr2 = [productionNodes[0], productionNodeLastElement];

        // ## delete last element for  bundle / 12 pcs
        result0 = await OrderProduction.updateMany(
          {$and: [
            {"companyID":companyID} , 
            {"orderID":orderID} , 
            {"bundleNo":{$in: bundleNos}},
          ]}, 
          {
            $pop: { productionNode: 1 },  // ## delete last element of productionNode
          }).session(session);


        result2 = await OrderProduction.updateMany(
          {$and: [
            {"companyID":companyID},
            {"orderID":orderID},
            {"bundleNo":{$in: bundleNos}},
          ]}, 
          {
            $push: {productionNode: {$each: orderProductionArr2}},
            // $push: {productionNode: {$each: productionNodes,  $position: 0}},  // ## add new element at the first
          }).session(session);




          await session.commitTransaction();
          session.endSession();
      } else {
        await session.abortTransaction(); 
        session.endSession();
        return res.status(501).json({
          message: {
            messageID: 'errO027', 
            mode:'errEditOrderOutsourceTracking', 
            value: "error edit order outsource tracking"
          }
        });
      }
    });


    // const nodeIDs2 = data.nodeIDs2;
    // const bundleNos2 = data.bundleNos2;

    const orderIDs = [orderID];
    const isOutsourceTracking1 = false;  // ## real orderProduction / not outsourceTracking
    const statusArr1 = ['normal', 'fake', 'complete'];
    const orderProductOutsourceTrackingFlowseqNormal = 
      await ShareFunc.getCSZCSOrderProductOutsourceTrackingFlowseqs(
        companyID, orderIDs, isOutsourceTracking1, bundleNos2, nodeIDs, statusArr1
      );

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      // orderProductBundleNosOutsourceTracking: orderProductBundleNosOutsourceTracking,
      orderProductOutsourceTrackingFlowseqNormal: orderProductOutsourceTrackingFlowseqNormal,
      // orderProductOutsourceTrackingFlowseqTracking: [],
    });

  } catch (err) {
    await session.abortTransaction(); 
    session.endSession();
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO027', 
        mode:'errEditOrderOutsourceTracking', 
        value: "error edit order outsource tracking"
      }
    });
  }
}


// #############################################################################
// ## bundle set for tracking ###########################################################################

// // ##  getBundlesetgroups
// router.get("/bundlesetgroup/getlist1/:companyID/:userID/:orderID/:seasonYear", checkAuth, checkUUID, orderController.getBundlesetgroups);
exports.getBundlesetgroups = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const orderID = req.params.orderID;
  const seasonYear = req.params.seasonYear;
  // console.log(companyID, orderID, seasonYear);
  try {
    // ## 
    const bundleSetGroups = await ShareFunc.getBundlesetgroups(companyID, orderID, seasonYear);
    // console.log(bundleSetGroups);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      bundleSetGroups: bundleSetGroups
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO029', 
        mode:'errGetBundleGroupSetList', 
        value: "error get bundle group set list"
      }
    });
  }
}



// // ## /api/order/bundlesetgroup/createnew   postBundleSetGroupCreateNew
// router.post("/bundlesetgroup/createnew", checkAuth, checkUUID, orderController.postBundleSetGroupCreateNew);
exports.postBundleSetGroupCreateNew = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  // console.log('postBundleSetGroupCreateNew');

  try {
    // ##  
    const uuid = uuidv4();
    let bundleSetGroup = data.bundleSetGroup;
    const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    bundleSetGroup.datetime = current;

    const companyID = bundleSetGroup.companyID;
    const orderID = bundleSetGroup.orderID;
    const seasonYear = bundleSetGroup.seasonYear;

    // console.log(bundleSetGroup);

    const bundleSetGroupUpsert = await Bundlesetgroup.updateOne({$and: [
        {"companyID":companyID},
        {"orderID":orderID}, 
        {"uuid":uuid},
      ]} , 
      {
        "seasonYear": bundleSetGroup.seasonYear,
        "setName": bundleSetGroup.setName,
        "groupName": bundleSetGroup.groupName,
        "seq": bundleSetGroup.seq,
        "completed": bundleSetGroup.completed,

        "targetPlaceID": bundleSetGroup.targetPlaceID,
        "color": bundleSetGroup.color,
        "yarnLotID": bundleSetGroup.yarnLotID,
        "bundleNoSet": bundleSetGroup.bundleNoSet,
        "bundleNoQty": bundleSetGroup.bundleNoQty,
        "datetime": bundleSetGroup.current,

        "createBy": bundleSetGroup.createBy,
      }, {upsert: true}); 

    // ## get all bundlesetgroups
    const bundleSetGroups = await ShareFunc.getBundlesetgroups(companyID, orderID, seasonYear);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      bundleSetGroups: bundleSetGroups
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO028', 
        mode:'errEdit/postBundleGroupSet', 
        value: "error edit/post bundle group set"
      }
    });
  }
}

// // ## /api/order/bundlesetgroup/del  deleteBundleSetGroupDel
// router.post("/bundlesetgroup/del", checkAuth, checkUUID, orderController.deleteBundleSetGroupDel);
exports.deleteBundleSetGroupDel = async (req, res, next) => {
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  // console.log('deleteBundleSetGroupDel');
  // console.log(data);

  let session = await mongoose.startSession();
  // session.startTransaction();
  // let session2 = await mongoose.startSession();
  // session2.startTransaction();
  // let session3 = await mongoose.startSession();
  // session3.startTransaction();
  try {
    await session.withTransaction(async (session) => {
      // ##  
      const bundleSetGroup = data.bundleSetGroup;
      const companyID = bundleSetGroup.companyID;
      const orderID = bundleSetGroup.orderID;
      const uuid = bundleSetGroup.uuid;
      const seasonYear = bundleSetGroup.seasonYear;
      // console.log(companyID, orderID, uuid, seasonYear);

      // ## delete BundleSetGroup 1
      const result3 = await Bundlesetgroup.deleteMany({$and: [
        {"companyID":companyID}, 
        {"orderID":orderID}, 
        {"seasonYear":seasonYear}, 
        {"uuid":uuid}, 
        // {"productBarcodeNoReal":{$in: productBarcodeNoArr}},
      ]}).session(session);
        
      await session.commitTransaction();
      session.endSession();
      
      // ## get all bundlesetgroups
      const bundleSetGroups = await ShareFunc.getBundlesetgroups(companyID, orderID, seasonYear);

      await ShareFunc.upsertUserSession1hr(userID);
      const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
      
      res.status(200).json({
        token: token,
        expiresIn: process.env.expiresIn,
        userID: userID,
        success: true,
        bundleSetGroups: bundleSetGroups
        // queueListCount: queueListCount
      });

    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    // await session2.abortTransaction(); 
    // session2.endSession();
    // await session3.abortTransaction(); 
    // session3.endSession();
    return res.status(501).json({
      message: {
        messageID: 'errO018', 
        mode:'errCancelOrderProduction', 
        value: "cancel Order Production error"
      }
    });
  }  finally {
    session.endSession();
    // session2.endSession();
    // session3.endSession();
  }
}

// router.put("/bundlesetgroup/completed", checkAuth, checkUUID, orderController.editBundleSetGroupComplete);
exports.editBundleSetGroupComplete = async (req, res, next) => {
  // console.log('editBundleSetGroupComplete');
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;

  let session = await mongoose.startSession();
  try {
    await session.withTransaction(async (session) => {
      // ##  
      const bundleSetGroup1 = data.bundleSetGroup;
      const companyID = bundleSetGroup1.companyID;
      const orderID = bundleSetGroup1.orderID;
      const uuid = bundleSetGroup1.uuid;
      const seasonYear = bundleSetGroup1.seasonYear;
      const completed = !bundleSetGroup1.completed;
      const seq = bundleSetGroup1.seq;
      const mode = data.mode;  // ## complete, seq

      // console.log(mode, completed, seq);

      if (mode === 'complete') {
        const bundlesetgroupUpdate = await BundleSetGroup.updateOne({$and: [
          {"companyID":companyID},
          {"orderID":orderID}, 
          {"uuid":uuid}, 
          {"seasonYear":seasonYear}, 
        ]} , 
        {
          "completed": completed,
        }).session(session); 
      } else if (mode === 'seq') {
        const bundlesetgroupUpdate = await BundleSetGroup.updateOne({$and: [
          {"companyID":companyID},
          {"orderID":orderID}, 
          {"uuid":uuid}, 
          {"seasonYear":seasonYear}, 
        ]} , 
        {
          "seq": +seq,
        }).session(session); 
      }

      await session.commitTransaction();
      session.endSession();

      // ## get all bundlesetgroups
      const bundleSetGroups = await ShareFunc.getBundlesetgroups(companyID, orderID, seasonYear);

      await ShareFunc.upsertUserSession1hr(data.userID);
      const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
      res.status(200).json({
        token: token,
        expiresIn: process.env.expiresIn,
        userID: userID,
        bundleSetGroups: bundleSetGroups
      });

    });

  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'errO027', 
        mode:'errEditOrderOutsourceTracking', 
        value: "error edit order outsource tracking"
      }
    });
  }
}

// ## order
// #############################################################