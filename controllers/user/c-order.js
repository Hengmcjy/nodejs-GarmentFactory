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
// router.get("/order/getlist1/:companyID/:userID/:orderID", orderController.getOrder);
exports.getOrder = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const orderID = req.params.orderID;

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


// // ## get order list /api/order/getlist/:companyID/:userID/:page/:limit
// router.get("/getlist/:companyID/:userID/:page/:limit", checkAuth, checkUUID, productController.getOrders);
exports.getOrders = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const page = +req.params.page;
  const limit = +req.params.limit;

  // const MY_NAMESPACE = "a572fa0f-9bfa-5103-9882-16394770ad11";

  // const test = uuidv5("Hello World", process.env.IOID); // ⇨ 'a572fa0f-9bfa-5103-9882-16394770ad11'
  // console.log(test);
  // console.log(uuidv4());

  try {
    // exports.getOrders= async (companyID, page, limit)
    const orders = await ShareFunc.getOrders(companyID, page, limit);
    // console.log(orders);
    const ordersCount = await ShareFunc.getOrdersCount(companyID);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      orders: orders,
      ordersCount: ordersCount
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
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
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

  // const MY_NAMESPACE = "a572fa0f-9bfa-5103-9882-16394770ad11";

  // const test = uuidv5("Hello World", process.env.IOID); // ⇨ 'a572fa0f-9bfa-5103-9882-16394770ad11'
  // console.log(test);
  // console.log(uuidv4());

  try {
    // exports.getOrders= async (companyID, page, limit)
    const orders = await ShareFunc.getOrdersByOrderIDsAll(companyID, orderIDs);
    this.orderIDs = Array.from(new Set(orders.map((item) => item.orderID)));
    // console.log(orderIDs);
    currentCompanyOrderZoneStyleSize = await ShareFunc.getCurrentCompanyOrderZoneStyleSize(companyID, orderStatusArr, orderIDs);
    // console.log(orders);
    // const ordersCount = await ShareFunc.getOrdersCount(companyID);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

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
    const orderID = data.order.orderID;
    const orderDetail = data.order.orderDetail;
    const orderDate = new Date(moment(data.order.orderDate).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    const deliveryDate = new Date(moment(data.order.deliveryDate).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    const productOR = data.order.productOR;
    const customerOR = data.order.customerOR;
    const createBy = data.order.createBy;

    const orderUpsert = await Order.updateOne({$and: [
        {"companyID":companyID},
        {"orderID":orderID}, 
      ]} , 
      {
        "factoryID": factoryID,
        "bundleNo": bundleNo,
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
  // console.log(data);

  // return '';
  try {
    // ##  create order 
    const companyID = data.order.companyID;
    const orderID = data.order.orderID;
    const orderDetail = data.order.orderDetail;
    const orderDate = new Date(moment(data.order.orderDate).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    const deliveryDate = new Date(moment(data.order.deliveryDate).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    const productOR = data.order.productOR;
    const customerOR = data.order.customerOR;
    // console.log(productOR);
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

    // companyID: { type: String, required: true },
    // factoryID: { type: String, required: true },  // ## โรงงานไหน
    // orderID: { type: String, required: true}, // ## from orderID
    // productID : {type: String, required: true},  
    // queueInfo: [{   // ## 
    //   productBarcode : {type: String},   // ##
    //   queueDate : {type: Date},  // ## วันที่ queue
    //   toNode : {type: String},
    //   productCount : {type: Number},
    //   numberFrom : {type: Number},
    //   numberTo : {type: Number},
    //   createBy: {
    //     userID: {type: String},
    //     userName: {type: String},
    //   }
    // }]


    
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

// // ## /api/order2/orderProductionQueues/lists/createnew   postOrderProductionQueuesCreateNew
// router.post("/order2/orderProductionQueues/lists/createnew", checkAuth, checkUUID, orderController.postOrderProductionQueuesCreateNew);
exports.postOrderProductionQueuesCreateNew = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  // console.log('postOrderProductionQueuesCreateNew');
  // console.log(data);
  try {
    // ##  
    const companyID = data.companyID;
    const orderID = data.orderID;
    const productID = data.productID;
    const targetPlace = data.targetPlace;
    let queueInfo = data.queueInfo;  // array
    const qty = data.qty;
    const orderQty = data.orderQty; // full order zone qty
    const forLoss = data.forLoss;
    const productStatusArr = [''];

    const bundleNoFrom = queueInfo[0].bundleNo;
    const bundleNoTo = queueInfo[queueInfo.length-1].bundleNo;
    const toNode1 = queueInfo[0].toNode;
    const numberFrom1 = queueInfo[0].numberFrom;
    const numberTo1 = queueInfo[queueInfo.length-1].numberTo;
    const yarnLot = queueInfo[0].yarnLot;
    // console.log(bundleNoFrom,bundleNoTo,toNode1,numberFrom1,numberTo1);

    const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    // queueInfo.queueDate = current;
    // console.log(targetPlace);
    // console.log(queueInfo);

    await queueInfo.sort((a,b)=>{return a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0}); // ## เรียง น้อยไปมาก asec

    let productBarcodeNo = [];
    let productBarcodeNoUUID = [];
    let factoryID = '';
    let productBarcode = '';
    let toNode = '';
    let productCount = 0;
    let createBy = {};

    // const test = uuidv5("Hello World", process.env.IOID); // ⇨ 'a572fa0f-9bfa-5103-9882-16394770ad11'
    // console.log(test);
    // console.log(uuidv4());

    

    let maxNo = +queueInfo[0].numberFrom - 1;
    let numberTo = 0;
    // let maxNo = 0;
    await this.asyncForEach(queueInfo, async (item1) => {
      const uuid = uuidv4();
      // if (maxNo === 0) {
      //   // ## find max running number  getMaxProductIDRunningNo = async (companyID, productStatusArr)
      //   maxNo = await ShareFunc.getMaxProductIDRunningNo(companyID, item1.productBarcode);
      // }
      // console.log(maxNo);
      item1.queueDate = current;
      item1.bundleID = uuid;
      toNode = item1.toNode;
      createBy = item1.createBy;
      factoryID = item1.factoryID;
      productBarcode = item1.productBarcode;
      productCount = item1.productCount;
      // const numberFrom = item1.numberFrom;
      // const numberTo = item1.numberTo;
      const numberFrom = +maxNo + 1;
      numberTo = +maxNo + +productCount;
      item1.numberFrom = numberFrom;
      item1.numberTo = numberTo;
      let forLossQty = 0;
      for(let i = numberTo; i >= numberFrom;i--) {
        // console.log(i);
        if (i > orderQty) { forLossQty++; }
        const num5 = await ShareFunc.setStrLen(5, i);
        productBarcodeNo.push(productBarcode+num5);
        productBarcodeNoUUID.push(uuid);
        maxNo++;
      }
      item1.forLossQty = forLossQty;
      forLossQty = 0;
    });
    // console.log(productBarcodeNo);
    // console.log(queueInfo);
    
    // ## find forLossQty
    // ## get last running number order production  by barcodeNo
    // console.log(numberTo);
    const productBarcodeX = queueInfo[0].productBarcode; 
    const runningLastNo = await ShareFunc.getLastRunningNoOrderProduction(companyID, orderID, productID, productBarcodeX);
    let forLossQty = 0;
    if (numberTo > orderQty) {  // not over qty
      if (+runningLastNo <= orderQty) {
        forLossQty = numberTo - orderQty;
      } else { // +runningLastNo > orderQtyo
        forLossQty = numberTo - +runningLastNo;
      }
    }


    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    // console.log(data);

    // ## check running number exist
    const existed = await ShareFunc.checkExistOrderProductionByBarcodeNo(
                            companyID, factoryID, orderID, productID, productBarcodeNo);
    // console.log(existed);
    // console.log('existed' , existed);
    if (!existed) {
      // ## insert one orderProductionQueueList
      const orderProductionQueueList1 = [{
        companyID: companyID,
        orderID: orderID,
        productID: productID,
        factoryID: factoryID,
        queueDate: current,
        forLoss: forLoss,
        forLossQty: forLossQty,
        toNode: toNode1,
        numberFrom: numberFrom1,
        numberTo: numberTo1,
        bundleNoFrom: bundleNoFrom,
        bundleNoTo: bundleNoTo,
        yarnLot: yarnLot,
        createBy: createBy
      }];
      // console.log(companyID, current, userID, logID, note);
      const insertone = await OrderProductionQueueList.insertMany(orderProductionQueueList1);

      // ##  add array new queue 
      const result1 = await OrderProductionQueue.updateOne(
        {$and: [
          {"companyID":companyID},
          {"orderID":orderID},
          {"productID":productID},
        ]}, 
        {
          // "forLossQty": forLossQty,
          $push: {queueInfo: {$each:queueInfo,  $position: 0}}  // ## add new element at the first
        },
        {upsert: true});
  
      // ## add new record to orderProduction n record
      // const toNode = queueInfo.toNode;
      // const createBy = queueInfo.createBy;
      let orderProductionArr = [];
      let j = 0;
      await this.asyncForEach(productBarcodeNo , async (productBarcodeNo) => {
        const runningNO = +productBarcodeNo.substr(+process.env.runningNoPos, +process.env.runningNoDigit);
        const forLossX = runningNO > orderQty;
        orderProductionArr.push({
          companyID: companyID,
          factoryID: factoryID,
          orderID: orderID,
          bundleNo: await this.getbundleNoByRunningNo(queueInfo, productBarcodeNo),
          bundleID: productBarcodeNoUUID[j],
          productID: productID,
          productBarcodeNo: productBarcodeNo,
          productBarcodeNoReal: productBarcodeNo,
          productBarcodeNoReserve: [],
          targetPlace: targetPlace,
          productCount: productCount,
          productionDate: current,
          productStatus: 'normal',
          forLoss: forLossX,
          yarnLot: yarnLot,
          productionNode: [{
            fromNode: 'starterNode',
            toNode: toNode,
            datetime: current,
            status: 'normal',
            productProblemID: '',
            createBy: createBy
          }]
        });
        j++;
      });
      // console.log(orderProductionArr);
      const result2 = await OrderProduction.insertMany(orderProductionArr);

      // ## edit order if qty > orderQty ----> forLoss case
      if (forLossQty > 0) {
        const resultX = await ShareFunc.editOrderForLossToStyleZone
                              (companyID, factoryID, orderID, productBarcode, targetPlace,  forLossQty);
        // companyID factoryID orderID productBarcode targetPlace  forLossQty
      }

    } else {  // ## err --> had Order Production  BarcodeNo , existed
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
    
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO005-1', 
        mode:'errCreateOrderProductions', 
        value: "create Order Productions error"
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
  const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  const orderID = req.params.orderID;
  const productID = req.params.productID;
  const productBarcode = req.params.productBarcode;
  // const page = +req.params.page;
  // const limit = +req.params.limit;  // ## records we need to get
  const userID = req.userData.tokenSet.userID;
  // console.log('getLastProductionQueueBarcode');
  // console.log(companyID,orderID,productID, productBarcode );
  try {

    // ## get last running number order production  by barcodeNo
    const runningNo = await ShareFunc.getLastRunningNoOrderProduction(companyID, orderID, productID, productBarcode);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      runningNo: runningNo
      // orderProductionQueue: orderProductionQueue,
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
  // const repListNameArr = JSON.parse(req.params.repListName);
  // console.log(companyID, orderStatusArr);

  try {

    const currentProductQtyAllC = await ShareFunc.getCCurrentProductQtyAllByStyleC(companyID, style, productStatusArr);
    // currentOrder = await ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr);
    orderStyleColorSize = await ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
    currentCompanyOrder = await ShareFunc.getCurrentCompanyOrderByStyle(companyID, style, orderStatusArr);
    currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr);
    
    // console.log(orderStyleColorSize, currentCompanyOrder, currentOrderStyle);

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


// ## order
// #############################################################