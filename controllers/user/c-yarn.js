const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');

const { v5: uuidv5 } = require('uuid');
const { v4: uuidv4, fromString  } = require('uuid');

const io = require('../../socket');

const ShareFunc = require("../c-api-app-share-function");

const Yarn = require("../../models/m-yarn");
const YarnData = require("../../models/m-yarnData");
const YarnLotUsage = require("../../models/m-yarnLotUsage");
const YarnSeason = require("../../models/m-yarnSeason");
const YarnColor = require("../../models/m-yarnColor");
const YarnSupplier = require("../../models/m-yarnSupplier");
const YarnStockCardPCS = require("../../models/m-yarnStockCardPCS");
// const Company = require("../../models/m-company");
// const Factory = require("../../models/m-factory");
// const Product = require("../../models/m-product");

// const TargetPlace = require("../../models/m-targetPlace");
// const Color = require("../../models/m-color");
// const Size = require("../../models/m-size");

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
// ## yarn

// // ## get yarn list /api/yarn/getlists/:companyID/:userID
// router.get("/getlists/:companyID/:userID", checkAuth, checkUUID, yarnController.getYarnsList);
exports.getYarnsList = async (req, res, next) => {
  // console.log('getYarnsList');
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const yarnSeasonID = req.params.userID;
  // const page = +req.params.page;
  // const limit = +req.params.limit;
  // console.log(companyID, yarnSeasonID, 'getYarnsList');

  
  try {
    // getProducts= async (companyID, page, limit)
    const yarns = await ShareFunc.getYarns(companyID, yarnSeasonID);
    const yarnsCount = await ShareFunc.getYarnsCount(companyID, yarnSeasonID);
    // console.log(yarns, yarnsCount, 'getYarnsList');

    const showArr = [true]; 
    // ## get yarn season
    const yarnSeasons = await ShareFunc.getYarnSeasons(companyID, showArr);
    const yarnSuppliers = await ShareFunc.getYarnSuppliers(companyID, showArr);
    // const yarnColors = await ShareFunc.getYarnColors(companyID, showArr);

    
    
    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarns: yarns,
      yarnsCount: yarnsCount,
      yarnSeasons: yarnSeasons,
      yarnSuppliers: yarnSuppliers,
      yarnColors: [],
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry001', 
        mode:'errYarnList', 
        value: "error get yarn list"
      }
    });
  }
}

// // ## get yarn list /api/yarn/getlists/yarnseasons/:companyID/:userID
// router.get("/getlists/yarnseasons/:companyID/:userID", checkAuth, checkUUID, yarnController.getYarnsSeasons);
exports.getYarnsSeasons = async (req, res, next) => {
  // console.log('getYarnsSeasons');
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  // const yarnSeasonID = req.params.userID;
  // const page = +req.params.page;
  // const limit = +req.params.limit;
  // console.log(companyID);

  
  try {
    // // getProducts= async (companyID, page, limit)
    // const yarns = await ShareFunc.getYarns(companyID, yarnSeasonID);
    // const yarnsCount = await ShareFunc.getYarnsCount(companyID, yarnSeasonID);

    const showArr = [true]; 
    // ## get yarn season
    const yarnSeasons = await ShareFunc.getYarnSeasons(companyID, showArr);
    const yarnSuppliers = await ShareFunc.getYarnSuppliers(companyID, showArr);
    // const yarnColors = await ShareFunc.getYarnColors(companyID, showArr);

    
    
    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      // yarns: yarns,
      // yarnsCount: yarnsCount,
      yarnSeasons: yarnSeasons,
      yarnSuppliers: yarnSuppliers,
      yarnColors: [],
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry001', 
        mode:'errYarnList', 
        value: "error get yarn list"
      }
    });
  }
}

// ## get yart info for create new plan
// router.get("/getinfo1/:companyID/:factoryID/:customerID/:yarnSeason", checkAuth, checkUUID, yarnController.getYarnInfo1);
exports.getYarnInfo1 = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.userData.tokenSet.userID;
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const customerID = req.params.customerID;
  const setName = req.params.setName;
  const yarnSeason = req.params.yarnSeason;  // 2024SS
  // const season = yarnSeason.substr(0, 4);  // 2024
  const season = yarnSeason;  // 2024
  // const page = +req.params.page;
  // const limit = +req.params.limit;
  // console.log('getYarnInfo1');
  console.log(setName);
  try {

    const uuid = uuidv4();
    
    // getProducts= async (companyID, page, limit)
    const yarns = await ShareFunc.getYarnCuss(companyID, customerID, yarnSeason);
    const yarnsCount = await ShareFunc.getYarnCussCount(companyID, customerID, yarnSeason);

    const showArr = [true]; 
    // ## get yarn season
    // const yarnSeasons = await ShareFunc.getYarnCusSeasons(companyID, showArr);
    const yarnSuppliers = await ShareFunc.getYarnCusSuppliers(companyID, customerID, showArr);
    // const yarnColors = await ShareFunc.getYarnCusColors(companyID, customerID, showArr);

    // console.log(companyID, setName);
    const colorS = await ShareFunc.colorComSetName(companyID, setName);
    // console.log(colorS);

    let orderIDs = [];
    const orders = await ShareFunc.getYarnCusOrderIDs(companyID, customerID, season);
    await this.asyncForEach(orders , async (order) => {
      orderIDs.push(order.orderID);
    });

    let productIDs = [];
    await this.asyncForEach(orderIDs , async (orderID) => {
      productIDs.push(await ShareFunc.setBackStrLen(process.env.productIDLen, orderID, ' '));
    });
    const productImageProfiles = await ShareFunc.getProductImageProfiles(companyID, productIDs);

    
    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      uuid: uuid,
      yarns: yarns,
      yarnsCount: yarnsCount,
      orderIDs: orderIDs,
      yarnSuppliers: yarnSuppliers,
      yarnColors: [],
      colorS: colorS,
      productImageProfiles: productImageProfiles,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry002', 
        mode:'errYarnInfo1', 
        value: "error get yarn info 1"
      }
    });
  }
}

// router.put("/yarn/editYarnFullName", checkAuth, checkUUID, yarnController.putYarnFullName);
exports.putYarnFullName = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('putYarnFullName');
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const yarnID = data.yarnID;
  const yarnFullName2 = data.yarnFullName2;

  // const yarnSeasonID = data.yarnSeason;

  // console.log(companyID, yarnID, yarnFullName2);
  try {

    // ## 
    const bundlesetgroupUpdate = await Yarn.updateOne({$and: [
      {"companyID":companyID},
      {"yarnID":yarnID}, 
    ]}, 
    {
      "yarnFullName": yarnFullName2,
    })


    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry004', 
        mode:'errputYarnFullName', 
        value: "error put yarn full name"
      }
    });
  }
}

// // ## get yarn plan list /api/yarn/yarnplan/get/list1 getYarnPlansList1
// router.post("/yarnplan/get/list1", 
//   checkAuth, checkUUID, yarnController.getYarnPlansList1);
exports.getYarnPlansList1 = async (req, res, next) => {
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const customerID = data.customerID;
  const uuid = data.uuid;
  const yarnID = data.yarnID;
  const yarnSeasonID = data.yarnSeasonID;
  const yarnSeason = yarnSeasonID.substr(0, 4);  // 2024
  const status = ['open'];
  const type = JSON.parse(data.typeArr);
  // const orderStatusArr = JSON.parse(req.params.ordertatus);
  // console.log(companyID, factoryID, customerID, uuid, yarnSeasonID, yarnID);
  // console.log(companyID, factoryID, customerID, yarnSeasonID, uuidArr, type);

  try {

    // const yarnPlan = await ShareFunc.getYarnPlanMainLists(companyID, factoryID, customerID, yarnSeasonID, status);
    const yarnPlan = await ShareFunc.getYarnPlanMainList(companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, status);
    
    const uuidArr = [uuid];
    // const type1 = ['plan'];
    const yarnPlanDateGroup = await ShareFunc.getYarnPlanDateGroup(
        companyID, factoryID, customerID, yarnSeasonID, uuidArr, type
    );
    // console.log(companyID, factoryID, customerID, yarnSeasonID, uuidArr, type);
    // console.log(yarnPlanDateGroup, yarnPlanDateGroup.length);

    const yarns = await ShareFunc.getYarns(companyID, yarnSeasonID);
    const yarnsCount = await ShareFunc.getYarnsCount(companyID, yarnSeasonID);

    // const dateDetail = await ShareFunc.showMongoDBDateDetail(companyID);
    // console.log(dateDetail);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      dateDetail: undefined,
      yarnPlanDateGroup: yarnPlanDateGroup,
      yarns: yarns,
      yarnsCount: yarnsCount,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry004', 
        mode:'errYarnPlanList', 
        value: "error get yarn plan list"
      }
    });
  }
}

// // ## get yarn plan list /api/yarn/yarnplan/get/invoice/list2 getYarnPlansInvoiceList2
// router.put("/yarnplan/get/invoice/list2", checkAuth, checkUUID, yarnController.getYarnPlansInvoiceList2);
exports.getYarnPlansInvoiceList2 = async (req, res, next) => {
  // console.log('getYarnPlansInvoiceList2');
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const customerID = data.customerID;
  // const uuid = data.uuid;
  // const yarnID = data.yarnID;
  const yarnSeasonID = data.yarnSeasonID;
  // const yarnSeason = yarnSeasonID.substr(0, 4);  // 2024
  // const yarnSeason = yarnSeasonID;
  const status = ['open'];
  const invoiceID = data.invoiceID;
  const type = JSON.parse(data.typeArr);
  // const orderStatusArr = JSON.parse(req.params.ordertatus);
  // console.log(companyID, factoryID, customerID, uuid, yarnSeasonID, yarnID);
  // console.log(companyID, factoryID, customerID, yarnSeasonID, uuidArr, type);

  // console.log(companyID, factoryID, customerID, yarnSeasonID, type, invoiceID, status);
  try {

    // const yarnPlan = await ShareFunc.getYarnPlanMainLists(companyID, factoryID, customerID, yarnSeasonID, status);
    const yarnInvoiceList = await ShareFunc.getYarnPlanInvoiceList(companyID, factoryID, customerID, yarnSeasonID, type, invoiceID, status);
    // console.log(yarnPlan);

    // getYarnPlanMainListByYarnIDs= async (companyID, factoryID, customerID, yarnSeasonID, uuid, yarnIDs, status)
    // this.orderIDs = Array.from(new Set(this.currentCompanyOrder.map((item: any) => item.orderID)));
    const yarnIDs = Array.from(new Set(yarnInvoiceList.map((item) => item.yarnID)));
    // console.log(yarnIDs);
    const yarnPlans = await ShareFunc.getYarnPlanMainListByYarnIDs(companyID, factoryID, customerID, yarnSeasonID, yarnIDs, status);

    const yarns = await ShareFunc.getYarns(companyID, yarnSeasonID);
    const yarnsCount = await ShareFunc.getYarnsCount(companyID, yarnSeasonID);

    // await this.asyncForEach(yarnData, async (item1) => {
    //   await this.asyncForEach2(item1.yarnDataInfo.packageInfo, async (item2) => {
    //     await this.asyncForEach3(item2.yarnBoxInfo, async (item3) => {
    //       item3.yarnPlanWeight = parseFloat(item3.yarnPlanWeight);
    //       item3.yarnWeight = parseFloat(item3.yarnWeight);
    //       item3.useWeight = parseFloat(item3.useWeight);
    //     });
    //   });
    // });

    // const uuidArr = [uuid];
    // // const type1 = ['plan'];
    // const yarnPlanDateGroup = await ShareFunc.getYarnPlanDateGroup(
    //     companyID, factoryID, customerID, yarnSeasonID, uuidArr, type
    // );
    // // console.log(companyID, factoryID, customerID, yarnSeasonID, uuidArr, type);
    // // console.log(yarnPlanDateGroup, yarnPlanDateGroup.length);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarnInvoiceList: yarnInvoiceList,
      yarnPlans: yarnPlans,

      yarns: yarns,
      yarnsCount: yarnsCount,

    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry004', 
        mode:'errYarnPlanList', 
        value: "error get yarn plan list"
      }
    });
  }
}

// // getYarnStatData
// router.get("/yarnplan/statdata1/:companyID/:orderIDs", checkAuth, checkUUID, yarnController.getYarnStatData);
exports.getYarnStatData = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getYarnStatData');
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const yarnID = data.yarnID;
  const uuid = data.uuid;
  const yarnSeasonID = data.yarnSeason;
  const orderIDs = data.orderIDs
  const orderStatusArr = ['open'];
  // const factoryID = req.params.factoryID;
  // const customerID = req.params.customerID;
  // const setName = req.params.setName;
  // const yarnSeasonID = req.params.yarnSeason;  // 2024SS
  // const season = yarnSeasonID.substr(0, 4);  // 2024
  // const status = ['open'];
  // console.log(companyID, orderIDs, yarnID, uuid, yarnSeasonID);
  try {

    // ## 

    // ## get order sum qty group by zone and color
    currentCompanyOrderZoneStyleSize = await ShareFunc.getCurrentCompanyOrderZoneStyleSize(companyID, orderStatusArr, orderIDs);

    // ## get yarnStatCal  getYarnPlanStat= async (companyID, yarnID, uuid, yarnSeasonID)
    yarnStatCal = await ShareFunc.getYarnPlanStat(companyID, yarnID, uuid, yarnSeasonID);
    
    // const yarns = await ShareFunc.getYarnCuss(companyID, customerID, yarnSeasonID);
    // const yarnsCount = await ShareFunc.getYarnCussCount(companyID, customerID, yarnSeasonID);
    // // console.log(yarns, yarnsCount, 'getYarPlansList');

    // const yarnPlans = await ShareFunc.getYarnPlanMainLists(companyID, factoryID, customerID, yarnSeasonID, status);
    // const yarnPlansCount = await ShareFunc.getYarnPlanMainCount(companyID, factoryID, customerID, yarnSeasonID, status);
    // // console.log(yarnPlans, yarnPlansCount, 'getYarPlansList');

    // let productIDs = [];
    // await this.asyncForEach(orderIDs, async (item1) => {
    //   productIDs.push(await ShareFunc.setBackStrLen(process.env.productIDLen, item1, ' '));
    // });
    // const productImageProfiles = await ShareFunc.getProductImageProfiles(companyID, productIDs);

 

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      currentCompanyOrderZoneStyleSize: currentCompanyOrderZoneStyleSize,
      yarnStatCal: yarnStatCal,
      // yarnPlans: yarnPlans,
      // yarnPlansCount: yarnPlansCount,
      // productImageProfiles: productImageProfiles,

      // yarns: yarns,
      // yarnsCount: yarnsCount,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry004', 
        mode:'errgetYarnstatdata', 
        value: "error get yarn stat data"
      }
    });
  }
}

// // ## get yarn plan list /api/yarn/yarnplan/list/main/:companyID/:factoryID/:customerID/:setName/:yarnSeason getYarPlansList
// router.get("/yarnplan/list/main/:companyID/:factoryID/:customerID/:setName/:yarnSeason", checkAuth, checkUUID, yarnController.getYarPlansList);
exports.getYarPlansList = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.userData.tokenSet.userID;
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const customerID = req.params.customerID;
  const setName = req.params.setName;
  const yarnSeasonID = req.params.yarnSeason;  // 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024
  const status = ['open'];
  const orderIDs = JSON.parse(req.params.orderIDs);
  // const limit = +req.params.limit;
  // console.log(factoryID, customerID, yarnSeasonID, 'getYarPlansList');
  // console.log(setName);
  try {

    const yarns = await ShareFunc.getYarnCuss(companyID, customerID, yarnSeasonID);
    const yarnsCount = await ShareFunc.getYarnCussCount(companyID, customerID, yarnSeasonID);
    // console.log(yarns, yarnsCount, 'getYarPlansList');

    const yarnPlans = await ShareFunc.getYarnPlanMainLists(companyID, factoryID, customerID, yarnSeasonID, status);
    const yarnPlansCount = await ShareFunc.getYarnPlanMainCount(companyID, factoryID, customerID, yarnSeasonID, status);
    // console.log(yarnPlans, yarnPlansCount, 'getYarPlansList');

    let productIDs = [];
    await this.asyncForEach(orderIDs, async (item1) => {
      productIDs.push(await ShareFunc.setBackStrLen(process.env.productIDLen, item1, ' '));
    });
    const productImageProfiles = await ShareFunc.getProductImageProfiles(companyID, productIDs);

 

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarns: yarns,
      yarnsCount: yarnsCount,
      yarnPlans: yarnPlans,
      yarnPlansCount: yarnPlansCount,
      productImageProfiles: productImageProfiles,

      // yarns: yarns,
      // yarnsCount: yarnsCount,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry004', 
        mode:'errYarnPlanList', 
        value: "error get yarn plan list"
      }
    });
  }
}

// // ## 
// router.get("/yarnlot/CF/transfer/yarn1/:companyID/:factoryID/:customerID/:setName/:yarnSeason/:yarnID/:usageMode", 
// checkAuth, checkUUID, yarnController.getYarnTransferUsageList);
exports.getYarnTransferUsageList = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getYarnTransferList');
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const companyID = data.companyID;
  const toFactoryID = data.toFactoryID;  // ## toFactory
  const customerID = data.customerID;

  const setName = data.setName;
  const yarnSeasonID = data.yarnSeasonID;  // 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024
  const yarnID = data.yarnID; 
  const usageMode = data.usageMode;
  const status = ['open'];
  // const orderIDs = JSON.parse(req.params.orderIDs);
  // const limit = +req.params.limit;
  // console.log(yarnID, companyID, toFactoryID, customerID, yarnSeasonID, usageMode);
  try {


    // // ## test getCFYarnUsageTransferII
    // const useWeight = 11.21;
    // const yarnTransferUsage2 = await ShareFunc.getCFYarnUsageTransferII(companyID, toFactoryID, customerID, yarnSeasonID, yarnID, usageMode, useWeight);
    // console.log(yarnTransferUsage2);


    const yarnTransferUsage = await ShareFunc.getCFYarnUsageTransfer(companyID, toFactoryID, customerID, yarnSeasonID, yarnID, usageMode);


    // const yarns = await ShareFunc.getYarnCuss(companyID, customerID);
    // const yarnsCount = await ShareFunc.getYarnCussCount(companyID, customerID);

    // const yarnPlans = await ShareFunc.getYarnPlanMainLists(companyID, factoryID, customerID, yarnSeasonID, status);
    // const yarnPlansCount = await ShareFunc.getYarnPlanMainCount(companyID, factoryID, customerID, yarnSeasonID, status);

    // let productIDs = [];
    // await this.asyncForEach(orderIDs, async (item1) => {
    //   productIDs.push(await ShareFunc.setBackStrLen(process.env.productIDLen, item1, ' '));
    // });
    // const productImageProfiles = await ShareFunc.getProductImageProfiles(companyID, productIDs);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarnTransferUsage: yarnTransferUsage,
      // yarnsCount: yarnsCount,
      // yarnPlans: yarnPlans,
      // yarnPlansCount: yarnPlansCount,
      // productImageProfiles: productImageProfiles,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry012', 
        mode:'errYarnTransfer', 
        value: "error get yarn transfer"
      }
    });
  }
}

// // ## get yarn plan list /api/yarn/yarnlot/CF/rep/fac/remain getYarnRemainCF
// router.put("/yarnlot/CF/rep/fac/remain", checkAuth, checkUUID, yarnController.getYarnRemainCF);
exports.getYarnRemainCF = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getYarnRemainCF');
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const companyID = data.companyID;
  const factoryIDs = data.factoryIDBoxArr;  // ## toFactory
  const customerID = data.customerID;

  const setName = data.setName;
  const yarnSeasonID = data.yarnSeasonID;  // 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024
  const yarnIDs = data.yarnIDArr;  // ## array of Yarn  uuidArr
  const uuids = data.uuidArr;  // ## 
  const type = data.type;  // ## ['receive']
  const used = data.used;  // ## false
  const state = data.state;  // ## ['verified']
  const status = data.status;  // ## ['open'];
  const weightVerified = data.weightVerified;  // ## false
  // const orderIDs = JSON.parse(req.params.orderIDs);
  // const limit = +req.params.limit;
  // console.log(factoryIDs, yarnIDs, uuids, type, state, status, used, weightVerified);
  try {

    const yarnData= await ShareFunc.getCFYarnStock(companyID, factoryIDs, customerID, yarnSeasonID, yarnIDs, uuids, status, type, state, used, weightVerified);
    // console.log(yarnData);

    // const yarns = await ShareFunc.getYarnCuss(companyID, customerID);
    // const yarnsCount = await ShareFunc.getYarnCussCount(companyID, customerID);

    // const yarnPlans = await ShareFunc.getYarnPlanMainLists(companyID, factoryID, customerID, yarnSeasonID, status);
    // const yarnPlansCount = await ShareFunc.getYarnPlanMainCount(companyID, factoryID, customerID, yarnSeasonID, status);

    // let productIDs = [];
    // await this.asyncForEach(orderIDs, async (item1) => {
    //   productIDs.push(await ShareFunc.setBackStrLen(process.env.productIDLen, item1, ' '));
    // });
    // const productImageProfiles = await ShareFunc.getProductImageProfiles(companyID, productIDs);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarnData: yarnData,
      // yarnsCount: yarnsCount,
      // yarnPlans: yarnPlans,
      // yarnPlansCount: yarnPlansCount,
      // productImageProfiles: productImageProfiles,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry013', 
        mode:'errgetYarnStock', 
        value: "error get yarn stock"
      }
    });
  }
}


// // ## /api/yarn/yarnplan/createnew   postYarnPlanCreateNew
// router.post("/yarnplan/createnew", checkAuth, checkUUID, yarnController.postYarnPlanCreateNew);
exports.postYarnPlanCreateNew = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const customerID = data.customerID;
  
  const uuid = data.uuid;
  const yarnSeasonID = data.yarnSeasonID;  // ## 2023AW,  2024SS
  const yarnID = data.yarnID;
  const orderID = data.orderID; // ##  array 
  const colorS = data.colorS;
  const yarnData = [];
  const status = 'open';

  // console.log('postYarnPlanCreateNew');
  // console.log(req.body);
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  let session = await mongoose.startSession();
  session.startTransaction();
  try {

    const yarnData1 = {
      companyID,
      factoryID,
      customerID,
      uuid: uuid,
      yarnSeasonID,
      status,
      datetime: current,
      editDate: current,
      yarnID,
      orderID: orderID,
      colorS: colorS,
      yarnData: []
    };
    const insertone = await YarnData.insertMany(yarnData1, { session: session });

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    const status1 = ['open'];
    const yarnPlans = await ShareFunc.getYarnPlanMainLists(companyID, factoryID, customerID, yarnSeasonID, status1);
    const yarnPlansCount = await ShareFunc.getYarnPlanMainCount(companyID, factoryID, customerID, yarnSeasonID, status1);

    const yarns = await ShareFunc.getYarnCuss(companyID, customerID);
    const yarnsCount = await ShareFunc.getYarnCussCount(companyID, customerID);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarns: yarns,
      yarnsCount: yarnsCount,
      yarnPlans: yarnPlans,
      yarnPlansCount: yarnPlansCount,
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry003', 
        mode:'errYarnPlanCreateNew', 
        value: "error yarn plan create new"
      }
    });
  }  finally {
    session.endSession();
  }
}

// // ## /api/yarn/yarnplan/edit/maindata   putYarnPlan
// router.put("/yarnplan/edit/maindata", checkAuth, checkUUID, yarnController.putYarnPlan);
exports.putYarnPlan = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const customerID = data.customerID;
  
  const uuid = data.uuid;
  const yarnSeasonID = data.yarnSeasonID;  // ## 2023AW,  2024SS
  const yarnID = data.yarnID;
  const orderID = data.orderID; // ##  array 
  const colorS = data.colorS;
  const yarnData = [];
  const status = 'open';

  // console.log('putYarnPlan');
  // console.log(userID,    companyID,    factoryID,    customerID,    uuid,    yarnSeasonID,    yarnID,    orderID,    colorS);
  // console.log(companyID, yarnSeasonID, yarnID, uuid);
  // console.log(orderID, colorS);
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  let session = await mongoose.startSession();
  session.startTransaction();
  try {

    const yarnDataUpdate = await YarnData.updateOne({$and: [
        {"companyID":companyID},
        {"yarnSeasonID":yarnSeasonID}, 
        {"yarnID":yarnID}, 
        {"uuid":uuid}, 
      ]} , 
      {
        "orderID": orderID,
        "colorS": colorS,
      }); 

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    const status1 = ['open'];
    const yarnPlans = await ShareFunc.getYarnPlanMainLists(companyID, factoryID, customerID, yarnSeasonID, status1);
    const yarnPlansCount = await ShareFunc.getYarnPlanMainCount(companyID, factoryID, customerID, yarnSeasonID, status1);

    const yarns = await ShareFunc.getYarnCuss(companyID, customerID);
    const yarnsCount = await ShareFunc.getYarnCussCount(companyID, customerID);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarns: yarns,
      yarnsCount: yarnsCount,
      yarnPlans: yarnPlans,
      yarnPlansCount: yarnPlansCount,
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry003', 
        mode:'errYarnPlanCreateNew', 
        value: "error yarn plan create new"
      }
    });
  }  finally {
    session.endSession();
  }
}

// // ## /api/yarn/yarnplan/edit/stat   putYarnPlanStat
// router.put("/yarnplan/edit/stat", checkAuth, checkUUID, yarnController.putYarnPlanStat);
exports.putYarnPlanStat = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;

  const companyID = data.companyID;
  const yarnStatCal = data.yarnStatCal;
  
  const yarnID = data.yarnID;
  const uuid = data.uuid;
  const yarnSeasonID = data.yarnSeason;  // ## 2023AW,  2024SS
  // const orderID = data.orderID; // ##  array 
  // const colorS = data.colorS;
  // const yarnData = [];
  // const status = 'open';

  // console.log('putYarnPlan');
  // console.log(userID,    companyID,    factoryID,    customerID,    uuid,    yarnSeasonID,    yarnID,    orderID,    colorS);
  // console.log(companyID, yarnSeasonID, yarnID, uuid);
  // console.log(orderID, colorS);
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  let session = await mongoose.startSession();
  session.startTransaction();
  try {

    const yarnDataUpdate = await YarnData.updateOne({$and: [
        {"companyID":companyID},
        {"yarnSeasonID":yarnSeasonID}, 
        {"yarnID":yarnID}, 
        {"uuid":uuid}, 
      ]} , 
      {
        "yarnStatCal": yarnStatCal,
        "editDate": current,
      }).session(session);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    // const status1 = ['open'];
    // const yarnPlans = await ShareFunc.getYarnPlanMainLists(companyID, factoryID, customerID, yarnSeasonID, status1);
    // const yarnPlansCount = await ShareFunc.getYarnPlanMainCount(companyID, factoryID, customerID, yarnSeasonID, status1);

    // const yarns = await ShareFunc.getYarnCuss(companyID, customerID);
    // const yarnsCount = await ShareFunc.getYarnCussCount(companyID, customerID);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      // yarns: yarns,
      // yarnsCount: yarnsCount,
      // yarnPlans: yarnPlans,
      // yarnPlansCount: yarnPlansCount,
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry003', 
        mode:'errPutYarnPlanStat', 
        value: "error put yarn plan stat"
      }
    });
  }  finally {
    session.endSession();
  }
}

// // ## /api/yarn/yarnplan/yarnDataInfo
// router.put("/yarnplan/yarnDataInfo", checkAuth, checkUUID, yarnController.putYarnPlanDataInfo);
exports.putYarnPlanDataInfo = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const toFactoryID = data.factoryID;
  const customerID = data.customerID;
  
  const uuid = data.uuid;
  const yarnSeasonID = data.yarnSeasonID;  // ## 2023AW,  2024SS
  const yarnID = data.yarnID;
  // const orderID = data.orderID; // ##  array 
  const yarnColorID = data.yarnColorID;
  const type = data.type;  // ## plan
  const yarnWeight = data.yarnWeight;
  // const yarnDataUUID = data.yarnDataUUID;
  // const type2 = JSON.parse(data.typeArr2);
  const type2 = data.type2;  // ## plan , receive

  // console.log('putYarnPlanDataInfo');
  // console.log(req.body);
  const datetime = new Date(moment(data.datetime).tz('Asia/Bangkok').format('YYYY/MM/DD 08:00:ss+07:00'));
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  // console.log(dateStart);

  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    // ## check existed
    const yarnPlanDataInfo1 = await ShareFunc.getYarnPlanDataInfo1(
      companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, datetime, yarnColorID, type, toFactoryID
    );
    if (yarnPlanDataInfo1.length > 0) {
      // ## edit case
      const yarnDataUpdate1 = await YarnData.updateOne(
        {$and: [
          {"companyID":companyID},
          {"factoryID":factoryID},
          {"customerID":customerID},
          {"yarnSeasonID":yarnSeasonID},
          {"uuid":uuid},
          {"yarnID":yarnID},
        ]},
        {$set: { 
          "yarnDataInfo.$[elem].yarnWeight" : yarnWeight,
          "yarnDataInfo.$[elem].editDate" : current,
          // "editDate": current
        }}, 
        {
          multi: true,
          arrayFilters: [  {
            "elem.datetime": datetime ,
            "elem.yarnColorID": yarnColorID , 
            "elem.type": type , 
            "elem.toFactoryID": toFactoryID , 
          } ]
        }).session(session);
    } else {
      // ## add new element to array case  
      const yarnDataUUID1 = uuidv4();
      const yarnDataInfo1 = {
        datetime: datetime,
        editDate: current,
        yarnDataUUID: yarnDataUUID1,
        yarnColorID: yarnColorID,
        type: type,
        toFactoryID: toFactoryID,
        yarnWeight: yarnWeight,
        // uuid: uuid,
      };
      const yarnDataUpdate2 = await YarnData.updateOne({$and: [
        {"companyID":companyID},
        {"factoryID":factoryID},
        {"customerID":customerID},
        {"yarnSeasonID":yarnSeasonID},
        {"uuid":uuid},
        {"yarnID":yarnID}, 
      ]} , 
      {
        // "orderDetail": orderDetail,
        // "orderDate": orderDate,
        // "deliveryDate": deliveryDate,
        // "customerOR": customerOR,   // ## not allow to update customerOR , it can set at the new create only
        // "productOR": productOR,
        // "productOR.productORDetail": productOR.productORDetail,
        $push: {"yarnDataInfo": yarnDataInfo1},
      }).session(session);
    }

    const yarns = await ShareFunc.getYarnCuss(companyID, customerID);
    const yarnsCount = await ShareFunc.getYarnCussCount(companyID, customerID);



    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    await session.commitTransaction();
    session.endSession();

    const status1 = ['open'];
    const yarnPlan = await ShareFunc.getYarnPlanMainList(companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, status1);

    const uuidArr = [uuid];
    // const type1 = ['plan'];
    const yarnPlanDateGroup = await ShareFunc.getYarnPlanDateGroup(
        companyID, factoryID, customerID, yarnSeasonID, uuidArr, type2
    );

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      yarnPlanDateGroup: yarnPlanDateGroup,

      yarns: yarns,
      yarnsCount: yarnsCount,
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry004', 
        mode:'errYarnPlanList', 
        value: "error get yarn plan list"
      }
    });
  }  finally {
    session.endSession();
  }
}

// // ## /api/yarn/yarnpackinglist1/add   putAddYarnPackingList1
// router.put("/yarnpackinglist1/add", checkAuth, checkUUID, yarnController.putAddYarnPackingList1);
exports.putAddYarnPackingList1 = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const toFactoryID = data.factoryID;
  const customerID = data.customerID;
  
  const uuid = data.uuid;
  const yarnSeasonID = data.yarnSeasonID;  // ## 2023AW,  2024SS
  const yarnID = data.yarnID;
  // const yarnDataUUID = data.yarnDataUUID; // ##   
  const yarnColorID = data.yarnColorID;
  const type = data.type;  // ## plan , receive
  // const yarnWeight = data.yarnWeight;
  // const yarnDataUUID = data.yarnDataUUID;

  // console.log('putYarnPlanDataInfo');
  // console.log(companyID, factoryID, customerID);
  // console.log(uuid, yarnSeasonID, yarnID, yarnColorID, type);

  const datetime = new Date(moment(data.datetime).tz('Asia/Bangkok').format('YYYY/MM/DD 08:00:ss+07:00'));
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  // console.log(dateStart);

  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    // ## check existed
    const yarnPackingList = await ShareFunc.getYarnPlanDataInfo1(
      companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, datetime, yarnColorID, type, toFactoryID
    );
    if (yarnPackingList.length === 0) {
      // ## add new element to array case  
      const yarnDataUUID1 = uuidv4();
      const yarnDataInfo1 = {
        datetime: datetime,
        editDate: current,
        yarnDataUUID: yarnDataUUID1,
        yarnColorID: yarnColorID,
        type: type,
        toFactoryID: toFactoryID,
        packageInfo: []
        // yarnWeight: yarnWeight,
        // uuid: uuid,
      };
      const yarnPackingListUpdate1 = await YarnData.updateOne({$and: [
        {"companyID":companyID},
        {"factoryID":factoryID},
        {"customerID":customerID},
        {"yarnSeasonID":yarnSeasonID},
        {"uuid":uuid},
        {"yarnID":yarnID}, 
      ]} , 
      {
        // "orderDetail": orderDetail,
        // "orderDate": orderDate,
        // "deliveryDate": deliveryDate,
        // "customerOR": customerOR,   // ## not allow to update customerOR , it can set at the new create only
        // "productOR": productOR,
        // "productOR.productORDetail": productOR.productORDetail,
        $push: {"yarnDataInfo": yarnDataInfo1},
      }).session(session);
    } 

    const yarns = await ShareFunc.getYarns(companyID, yarnSeasonID);
    const yarnsCount = await ShareFunc.getYarnsCount(companyID, yarnSeasonID);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    await session.commitTransaction();
    session.endSession();

    const status1 = ['open'];
    const yarnPlan = await ShareFunc.getYarnPlanMainList(companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, status1);

    const uuidArr = [uuid];
    const type1 = [type]; // ## receive
    const yarnPlanDateGroup = await ShareFunc.getYarnPlanDateGroup(
        companyID, factoryID, customerID, yarnSeasonID, uuidArr, type1
    );

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      yarnPlanDateGroup: yarnPlanDateGroup,

      yarns: yarns,
      yarnsCount: yarnsCount,
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry004', 
        mode:'errYarnPlanList', 
        value: "error get yarn plan list"
      }
    });
  }  finally {
    session.endSession();
  }
}

// // ## /api/yarn/yarnpackinglist1/cancel   putCancelYarnPackingList1
// router.put("/yarnpackinglist1/cancel", checkAuth, checkUUID, yarnController.putCancelYarnPackingList1);
exports.putCancelYarnPackingList1 = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const toFactoryID = data.factoryID;
  const customerID = data.customerID;
  const yarnDataUUID = data.yarnDataUUID; // ##   
  const uuid = data.uuid;
  const yarnSeasonID = data.yarnSeasonID;  // ## 2023AW,  2024SS
  const yarnID = data.yarnID;
  const yarnColorID = data.yarnColorID;
  const type = data.type;  // ## plan , receive
  
  // const yarnWeight = data.yarnWeight;
  // const yarnDataUUID = data.yarnDataUUID;

  // console.log('putYarnPlanDataInfo');
  // console.log(companyID, factoryID, customerID);
  // console.log(uuid, yarnSeasonID, yarnID, yarnColorID, type);

  // const datetime = new Date(moment(data.datetime).tz('Asia/Bangkok').format('YYYY/MM/DD 08:00:ss+07:00'));
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  // console.log(dateStart);

  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    // ## check existed
    const yarnPackingList = await ShareFunc.getYarnPlanDataInfo2(
      companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, yarnDataUUID, yarnColorID, type, toFactoryID
    );
    if (yarnPackingList.length > 0) {
      const packageInfo = yarnPackingList[0].packageInfo;
      if (packageInfo.length === 0) { // ## no have record , can delete
        // ## delete from orderProductionQueue
        result2 = await YarnData.updateOne({$and: [
          {"companyID":companyID},
          {"factoryID":factoryID},
          {"customerID":customerID},
          {"yarnSeasonID":yarnSeasonID},
          {"uuid":uuid},
          {"yarnID":yarnID}, 
        ]} , 
        {
          $pull: {
            yarnDataInfo: {
              "yarnDataUUID": yarnDataUUID,
              "yarnColorID": yarnColorID,
              "type": type,
              // "productBarcode":{$in: productBarcodes}, 
              // "bundleNo":{$in: bundleNos}, 
              // "numberFrom": { $gte: no1 } , 
              // "numberTo": { $lte: no2 }
            }
          }
          // $pull: {queueInfo: {"bundleNo":{$in: bundleNos}, "numberFrom": no1, "numberTo": no2, "productCount": productCount}}
          // $pull: { fruits: { $in: [ "apples", "oranges" ] }, vegetables: "carrots" }
        }).session(session);
      } else if (packageInfo.length > 0) { // ## have record , cannot delete
        return res.status(422).json({
          message: {
            messageID: 'erry005', 
            mode:'errYarnCancelPackingList', 
            value: "error cancel yarn packing list"
          },
          token: token,
          expiresIn: process.env.expiresIn,
          userID: data.userID,
          success: false
        });
      }
    } 

    const yarns = await ShareFunc.getYarns(companyID, yarnSeasonID);
    const yarnsCount = await ShareFunc.getYarnsCount(companyID, yarnSeasonID);


    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    await session.commitTransaction();
    session.endSession();

    const status1 = ['open'];
    const yarnPlan = await ShareFunc.getYarnPlanMainList(companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, status1);

    const uuidArr = [uuid];
    const type1 = [type]; // ## receive
    const yarnPlanDateGroup = await ShareFunc.getYarnPlanDateGroup(
        companyID, factoryID, customerID, yarnSeasonID, uuidArr, type1
    );

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},
      yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      yarnPlanDateGroup: yarnPlanDateGroup,

      yarns: yarns,
      yarnsCount: yarnsCount,
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry004', 
        mode:'errYarnPlanList', 
        value: "error get yarn plan list"
      }
    });
  }  finally {
    session.endSession();
  }
}

exports.putYarnDataInfoDatetime = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const toFactoryID = data.factoryID;
  const customerID = data.customerID;
  const yarnDataUUID = data.yarnDataUUID; // ##   
  const uuid = data.uuid;
  const yarnSeasonID = data.yarnSeasonID;  // ## 2023AW,  2024SS
  const yarnID = data.yarnID;
  const yarnColorID = data.yarnColorID;
  const type = data.type;  // ## plan , receive
  
  // const yarnWeight = data.yarnWeight;
  // const yarnDataUUID = data.yarnDataUUID;

  // console.log('putYarnPlanDataInfo');
  // console.log(companyID, factoryID, customerID);
  // console.log(uuid, yarnSeasonID, yarnID, yarnColorID, type);

  const datetime = new Date(moment(data.datetime).tz('Asia/Bangkok').format('YYYY/MM/DD 08:00:ss+07:00'));
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  // console.log(dateStart);

  let session = await mongoose.startSession();
  session.startTransaction();
  try {

    const yarnDataUpdate1 = await YarnData.updateOne(
      {$and: [
        {"companyID":companyID},
        {"factoryID":factoryID},
        {"customerID":customerID},
        {"yarnSeasonID":yarnSeasonID},
        {"uuid":uuid},
        {"yarnID":yarnID},
      ]},
      {$set: { 
        "yarnDataInfo.$[elem].datetime" : datetime,
        // "yarnDataInfo.$[elem].editDate" : current,
        // "editDate": current
      }}, 
      {
        multi: true,
        arrayFilters: [  {
          "elem.yarnDataUUID": yarnDataUUID ,
          "elem.yarnColorID": yarnColorID , 
          "elem.type": type , 
          // "elem.toFactoryID": toFactoryID , 
        } ]
      }).session(session);

    // // ## check existed
    // const yarnPackingList = await ShareFunc.getYarnPlanDataInfo2(
    //   companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, yarnDataUUID, yarnColorID, type, toFactoryID
    // );
    // if (yarnPackingList.length > 0) {
    //   const packageInfo = yarnPackingList[0].packageInfo;
    //   if (packageInfo.length === 0) { // ## no have record , can delete
    //     // ## delete from orderProductionQueue
    //     result2 = await YarnData.updateOne({$and: [
    //       {"companyID":companyID},
    //       {"factoryID":factoryID},
    //       {"customerID":customerID},
    //       {"yarnSeasonID":yarnSeasonID},
    //       {"uuid":uuid},
    //       {"yarnID":yarnID}, 
    //     ]} , 
    //     {
    //       $pull: {
    //         yarnDataInfo: {
    //           "yarnDataUUID": yarnDataUUID,
    //           "yarnColorID": yarnColorID,
    //           "type": type,
    //           // "productBarcode":{$in: productBarcodes}, 
    //           // "bundleNo":{$in: bundleNos}, 
    //           // "numberFrom": { $gte: no1 } , 
    //           // "numberTo": { $lte: no2 }
    //         }
    //       }
    //       // $pull: {queueInfo: {"bundleNo":{$in: bundleNos}, "numberFrom": no1, "numberTo": no2, "productCount": productCount}}
    //       // $pull: { fruits: { $in: [ "apples", "oranges" ] }, vegetables: "carrots" }
    //     }).session(session);

    //   } else if (packageInfo.length > 0) { // ## have record , cannot delete
    //     return res.status(422).json({
    //       message: {
    //         messageID: 'erry014', 
    //         mode:'errPutYarnDataInfoDatetime', 
    //         value: "error put yarn dataInfo datetime"
    //       },
    //       token: token,
    //       expiresIn: process.env.expiresIn,
    //       userID: data.userID,
    //       success: false
    //     });
    //   }
    // } 
    

    const yarns = await ShareFunc.getYarns(companyID, yarnSeasonID);
    const yarnsCount = await ShareFunc.getYarnsCount(companyID, yarnSeasonID);


    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    await session.commitTransaction();
    session.endSession();

    const status1 = ['open'];
    const yarnPlan = await ShareFunc.getYarnPlanMainList(companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, status1);

    const uuidArr = [uuid];
    const type1 = [type]; // ## receive
    const yarnPlanDateGroup = await ShareFunc.getYarnPlanDateGroup(
        companyID, factoryID, customerID, yarnSeasonID, uuidArr, type1
    );

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},
      yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      yarnPlanDateGroup: yarnPlanDateGroup,

      yarns: yarns,
      yarnsCount: yarnsCount,
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry014', 
        mode:'errPutYarnDataInfoDatetime', 
        value: "error put yarn dataInfo datetime"
      }
    });
  }  finally {
    session.endSession();
  }
}


// // ## /api/yarn/yarnpackageInfo/del   putDelYarnPackingList1
// router.put("/yarnpackageInfo/del", checkAuth, checkUUID, yarnController.putDelYarnPackingList1);
exports.putDelYarnPackingList1 = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const toFactoryID = data.factoryID;
  const customerID = data.customerID;
  const yarnDataUUID = data.yarnDataUUID; // ##   
  const uuid = data.uuid;
  const yarnSeasonID = data.yarnSeasonID;  // ## 2023AW,  2024SS
  const yarnID = data.yarnID;
  const yarnColorID = data.yarnColorID;
  const type = data.type;  // ## plan , receive

  const invoiceID = data.invoiceID;
  const yarnLotID = data.yarnLotID;
  const yarnLotUUID = data.yarnLotUUID;



  
  // const yarnWeight = data.yarnWeight;
  // const yarnDataUUID = data.yarnDataUUID;

  // console.log('putYarnPlanDataInfo');
  // console.log(companyID, factoryID, customerID);
  // console.log(uuid, yarnSeasonID, yarnID, yarnColorID, type);

  // const datetime = new Date(moment(data.datetime).tz('Asia/Bangkok').format('YYYY/MM/DD 08:00:ss+07:00'));
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  // console.log(dateStart);

  await ShareFunc.upsertUserSession1hr(userID);
  // console.log(req.userData.tokenSet);
  const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

  let session = await mongoose.startSession();
  session.startTransaction();
  try {

    // ## check existed
    const yarnPackingList = await ShareFunc.getYarnPlanDataInfo2(
      companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, yarnDataUUID, yarnColorID, type, toFactoryID
    );
    if (yarnPackingList.length > 0) {
      const packageInfo = yarnPackingList[0].packageInfo;
      // ## delete from YarnData > yarnDataInfo > packageInfo
      const result2 = await YarnData.updateOne(
        {$and: [
          {"companyID":companyID},
          {"factoryID":factoryID},
          {"customerID":customerID},
          {"yarnSeasonID":yarnSeasonID},
          {"uuid":uuid},
          {"yarnID":yarnID},
        ]},
        // {$push: {"yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo" : yarnBoxInfo}},
        // { $set: { 
        //   "yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo" : yarnBoxInfo 
        // }},
        {$pull: { 
          "yarnDataInfo.$[elem].packageInfo": {
            "invoiceID": invoiceID,
            "yarnLotID": yarnLotID,
            "yarnLotUUID": yarnLotUUID,
          }
        }},
        {
          multi: true,
          arrayFilters: [  
            {
              "elem.yarnDataUUID": yarnDataUUID ,
              "elem.yarnColorID": yarnColorID , 
              "elem.type": type , 
              // "elem.toFactoryID": toFactoryID , 
            },
            // {
            //   "elem2.yarnLotUUID": yarnLotUUID
            // }
          ]
        }).session(session);
    } 
    await session.commitTransaction();
    session.endSession();

    const status1 = ['open'];
    const yarnPlan = await ShareFunc.getYarnPlanMainList(companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, status1);

    const uuidArr = [uuid];
    const type1 = [type]; // ## receive
    const yarnPlanDateGroup = await ShareFunc.getYarnPlanDateGroup(
        companyID, factoryID, customerID, yarnSeasonID, uuidArr, type1
    );

    const yarns = await ShareFunc.getYarns(companyID, yarnSeasonID);
    const yarnsCount = await ShareFunc.getYarnsCount(companyID, yarnSeasonID);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},
      yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      yarnPlanDateGroup: yarnPlanDateGroup,

      yarns: yarns,
      yarnsCount: yarnsCount,
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry004', 
        mode:'errYarnPlanList', 
        value: "error get yarn plan list"
      }
    });
  }  finally {
    session.endSession();
  }
}

// // ## /api/yarn/yarnlotID/add putAddYarnLotID1
// router.put("/yarnlotID/add", checkAuth, checkUUID, yarnController.putAddYarnLotID1);
exports.putAddYarnLotID1 = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const toFactoryID = data.factoryID;
  const customerID = data.customerID;
  const yarnDataUUID = data.yarnDataUUID; // ##   
  const uuid = data.uuid;
  const yarnSeasonID = data.yarnSeasonID;  // ## 2023AW,  2024SS
  const yarnID = data.yarnID;
  const yarnColorID = data.yarnColorID;
  const type = data.type;  // ##  receive

  const invoiceID = data.invoiceID;
  const yarnLotID = data.yarnLotID;
  const coneWeight = data.coneWeight;
  const boxWeight = data.boxWeight;
  let yarnBoxInfo = data.yarnBoxInfo;

  // console.log(yarnBoxInfo);
  // console.log(coneWeight, boxWeight);

  // console.log(yarnDataUUID, yarnColorID);

  // const yarnWeight = data.yarnWeight;
  // const yarnDataUUID = data.yarnDataUUID;

  // console.log('putYarnPlanDataInfo');
  // console.log(companyID, factoryID, customerID);
  // console.log(uuid, yarnSeasonID, yarnID, yarnColorID, type);

  // const datetime = new Date(moment(data.datetime).tz('Asia/Bangkok').format('YYYY/MM/DD 08:00:ss+07:00'));
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  // console.log(dateStart);

  let session = await mongoose.startSession();
  // session.startTransaction();
  try {
    await session.withTransaction(async (session) => {
      // ## check existed
      const yarnPackingList = await ShareFunc.getYarnPlanDataInfo2(
        companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, yarnDataUUID, yarnColorID, type, toFactoryID
      );
      if (yarnPackingList.length > 0) {
        await this.asyncForEach(yarnBoxInfo, async (item1) => {
          item1.boxID = item1.boxID.toUpperCase();
          item1.boxUUID = uuidv4();
          item1.used = false;
          item1.useWeight = item1.yarnWeightNet;
        });
        const state = 'wait';
        let packageInfo = {
          invoiceID: invoiceID,
          yarnLotID: yarnLotID,
          yarnLotUUID: uuidv4(),
          coneWeight: coneWeight,
          boxWeight: boxWeight,
          state: state,
          yarnBoxInfo: yarnBoxInfo
        };
        // console.log(packageInfo);

        // db.collection.update(
        //   {_id: "class_a", students: {$elemMatch: {_id: {$in: ["1a", "1b"]}}}},
        //   {$push: {"students.$[item].grades": "A+"}},
        //   {arrayFilters: [{"item._id": {$in: ["1a", "1b"]}}], upsert: true}
        // )

        const yarnLotIDUpdate1 = await YarnData.updateOne(
          {$and: [
            {"companyID":companyID},
            {"factoryID":factoryID},
            {"customerID":customerID},
            {"yarnSeasonID":yarnSeasonID},
            {"uuid":uuid},
            {"yarnID":yarnID},
          ]},
          {$push: {"yarnDataInfo.$[elem].packageInfo" : packageInfo}},
          {
            multi: true,
            arrayFilters: [  {
              "elem.yarnDataUUID": yarnDataUUID ,
              "elem.yarnColorID": yarnColorID , 
              "elem.type": type , 
              // "elem.toFactoryID": toFactoryID , 
            } ]
          }).session(session);

        

      } else if (packageInfo.length > 0) { // ## have record , cannot delete
        return res.status(422).json({
          message: {
            messageID: 'erry006', 
            mode:'errYarnLotODAdd', 
            value: "error yarn lotID addnew"
          },
          token: token,
          expiresIn: process.env.expiresIn,
          userID: data.userID,
          success: false
        });
      }

      await session.commitTransaction();
      session.endSession();
    });
    
    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    const status1 = ['open'];
    const yarnPlan = await ShareFunc.getYarnPlanMainList(companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, status1);

    const uuidArr = [uuid];
    const type1 = [type]; // ## receive
    const yarnPlanDateGroup = await ShareFunc.getYarnPlanDateGroup(
        companyID, factoryID, customerID, yarnSeasonID, uuidArr, type1
    );

    const yarns = await ShareFunc.getYarns(companyID, yarnSeasonID);
    const yarnsCount = await ShareFunc.getYarnsCount(companyID, yarnSeasonID);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},
      yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      yarnPlanDateGroup: yarnPlanDateGroup,

      yarns: yarns,
      yarnsCount: yarnsCount,
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry006', 
        mode:'errYarnLotODAdd', 
        value: "error yarn lotID addnew"
      },
    });
  }  finally {
    session.endSession();
  }
}

// // ## /api/yarn/yarnlotID/edit putEditYarnLotID1
// router.put("/yarnlotID/edit", checkAuth, checkUUID, yarnController.putEditYarnLotID1);
exports.putEditYarnLotID1 = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const toFactoryID = data.factoryID;
  const customerID = data.customerID;
  const yarnDataUUID = data.yarnDataUUID; // ##   
  const uuid = data.uuid;
  const yarnSeasonID = data.yarnSeasonID;  // ## 2023AW,  2024SS
  const yarnID = data.yarnID;
  const yarnColorID = data.yarnColorID;
  const type = data.type;  // ##  receive

  const yarnLotID = data.yarnLotID;
  let yarnBoxInfo = data.yarnBoxInfo;
  const yarnLotUUID = data.yarnLotUUID;
  const invoiceID = data.invoiceID;
  const coneWeight = data.coneWeight;
  const boxWeight = data.boxWeight;
  
  // console.log(yarnDataUUID, yarnColorID, yarnLotUUID);
  // console.log(invoiceID, coneWeight, boxWeight);

  // const yarnWeight = data.yarnWeight;
  // const yarnDataUUID = data.yarnDataUUID;

  // console.log('putYarnPlanDataInfo');
  // console.log(companyID, factoryID, customerID);
  // console.log(uuid, yarnSeasonID, yarnID, yarnColorID, type);

  // const datetime = new Date(moment(data.datetime).tz('Asia/Bangkok').format('YYYY/MM/DD 08:00:ss+07:00'));
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  // console.log(dateStart);

  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    // ## check existed
    const yarnPackingList = await ShareFunc.getYarnPlanDataInfo2(
      companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, yarnDataUUID, yarnColorID, type, toFactoryID
    );
    if (yarnPackingList.length > 0) {
      await this.asyncForEach(yarnBoxInfo, async (item1) => {
        if (item1.state === 'new') {
          item1.boxID = item1.boxID.toUpperCase();
          item1.boxUUID = uuidv4();
          item1.used = false;
        }
        item1.useWeight = item1.yarnWeightNet;
      });
      // const state = 'wait';
      // let packageInfo = {
      //   yarnLotID: yarnLotID,
      //   yarnLotUUID: uuidv4(),
      //   state: state,
      //   yarnBoxInfo: yarnBoxInfo
      // };
      // console.log(packageInfo);

      // console.log(invoiceID, coneWeight, boxWeight);

      const yarnLotIDUpdate1 = await YarnData.updateOne(
        {$and: [
          {"companyID":companyID},
          {"factoryID":factoryID},
          {"customerID":customerID},
          {"yarnSeasonID":yarnSeasonID},
          {"uuid":uuid},
          {"yarnID":yarnID},
        ]},
        // {$push: {"yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo" : yarnBoxInfo}},  
        { 
          $set: { 
            "yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo" : yarnBoxInfo ,
            "yarnDataInfo.$[elem].packageInfo.$[elem2].invoiceID" : invoiceID,
            "yarnDataInfo.$[elem].packageInfo.$[elem2].yarnLotID" : yarnLotID,
            "yarnDataInfo.$[elem].packageInfo.$[elem2].coneWeight" : coneWeight,
            "yarnDataInfo.$[elem].packageInfo.$[elem2].boxWeight" : boxWeight
          },
        },
        {
          multi: true,
          arrayFilters: [  
            {
              "elem.yarnDataUUID": yarnDataUUID ,
              "elem.yarnColorID": yarnColorID , 
              "elem.type": type , 
              // "elem.toFactoryID": toFactoryID , 
            },
            {
              "elem2.yarnLotUUID": yarnLotUUID
            }
         ]
        }).session(session);

    } else if (packageInfo.length > 0) { // ## have record , cannot delete
      return res.status(422).json({
        message: {
          messageID: 'erry007', 
          mode:'errYarnLotODEdit', 
          value: "error yarn lotID edit"
        },
        token: token,
        expiresIn: process.env.expiresIn,
        userID: data.userID,
        success: false
      });
    }

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    await session.commitTransaction();
    session.endSession();

    const status1 = ['open'];
    const yarnPlan = await ShareFunc.getYarnPlanMainList(companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, status1);

    const uuidArr = [uuid];
    const type1 = [type]; // ## receive
    const yarnPlanDateGroup = await ShareFunc.getYarnPlanDateGroup(
        companyID, factoryID, customerID, yarnSeasonID, uuidArr, type1
    );

    const yarns = await ShareFunc.getYarns(companyID, yarnSeasonID);
    const yarnsCount = await ShareFunc.getYarnsCount(companyID, yarnSeasonID);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},
      yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      yarnPlanDateGroup: yarnPlanDateGroup,

      yarns: yarns,
      yarnsCount: yarnsCount,
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry007', 
        mode:'errYarnLotODEdit', 
        value: "error yarn lotID edit"
      },
    });
  }  finally {
    session.endSession();
  }
}




// // ## /api/yarn/yarnlotID2/edit/state putEditYarnLotIDState2
// router.put("/yarnlotID2/edit/state", checkAuth, checkUUID, yarnController.putEditYarnLotIDState2);
exports.putEditYarnLotIDState2 = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const toFactoryID = data.factoryID;
  const customerID = data.customerID;
  const yarnDataUUID = data.yarnDataUUID; // ##   
  const uuid = data.uuid;
  const yarnSeasonID = data.yarnSeasonID;  // ## 2023AW,  2024SS
  const yarnID = data.yarnID;
  const yarnColorID = data.yarnColorID;
  const type = data.type;  // ##  receive

  const yarnLotID = data.yarnLotID;
  let yarnBoxInfo = data.yarnBoxInfo;
  const yarnLotUUID = data.yarnLotUUID;
  const state = data.state;

  const packageInfo = data.packageInfo; 
  const usageMode = data.usageMode;
  // console.log(companyID, factoryID, packageInfo);

  // console.log(yarnDataUUID, yarnColorID, yarnLotUUID);

  // const yarnWeight = data.yarnWeight;
  // const yarnDataUUID = data.yarnDataUUID;

  // console.log('putYarnPlanDataInfo');
  // console.log(companyID, factoryID, customerID);
  // console.log(uuid, yarnSeasonID, yarnID, yarnColorID, type);

  // const datetime = new Date(moment(data.datetime).tz('Asia/Bangkok').format('YYYY/MM/DD 08:00:ss+07:00'));
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const current2 = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD 08:00:ss+07:00'));
  // console.log(dateStart);

  let boxUUIDArr = [];
  await this.asyncForEach(packageInfo.yarnBoxInfo, async (item1) => {
    boxUUIDArr.push(item1.boxUUID);
  });

  let session = await mongoose.startSession();
  // let session2 = await mongoose.startSession();
  // session.startTransaction();
  // session2.startTransaction();
  try {

    await session.withTransaction(async (session) => {

      // ## check existed
      const yarnPackingList = await ShareFunc.getYarnPlanDataInfo3(
        companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, yarnDataUUID, yarnColorID, type, toFactoryID, yarnLotUUID, yarnLotID
      );
      if (yarnPackingList.length > 0) {
        const yarnLotIDUpdate1 = await YarnData.updateOne(
          {$and: [
            {"companyID":companyID},
            {"factoryID":factoryID},
            {"customerID":customerID},
            {"yarnSeasonID":yarnSeasonID},
            {"uuid":uuid},
            {"yarnID":yarnID},
          ]},
          { $set: { 
            "yarnDataInfo.$[elem].packageInfo.$[elem2].state" : state,
            "yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo.$[elem3].factoryID" : '*'
          }},
          {
            multi: true,
            arrayFilters: [  
              {
                "elem.yarnDataUUID": yarnDataUUID ,
                "elem.yarnColorID": yarnColorID , 
                "elem.type": type , 
                // "elem.toFactoryID": toFactoryID , 
              },
              {
                "elem2.yarnLotUUID": yarnLotUUID
              },
              {  
                "elem3.boxUUID": {$in: boxUUIDArr}   //  boxUUIDArr
              },
            ]
          }).session(session);


          // ## add new yarn lot usage
          let datetime1 = current2;
          const yarnDataInfo1 = await ShareFunc.getYarnPlanDataInfo2(
            companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, yarnDataUUID, yarnColorID, type, factoryID
          );
          if (yarnDataInfo1.length > 0) {
            datetime1 = yarnDataInfo1[0].datetime;
          } else {
            // ## err
            await session.abortTransaction(); 
            session.endSession();
            return res.status(422).json({
              message: {
                messageID: 'erry007', 
                mode:'errYarnLotODEdit', 
                value: "error yarn lotID edit"
              },
              token: token,
              expiresIn: process.env.expiresIn,
              userID: data.userID,
              success: false
            });
          }

          const yuUUID = uuidv4();
          const invoiceID = packageInfo.invoiceID;
          let yarnWeightNet = 0;  // ## total NET yarn receive
          let useWeight = 0;  // ## total actual yarn receive
          let yarnWeight = 0;  // ## total actual yarn receive
          let yarnInvoiceWeight = 0; // ## total  yarn from invoice
          await this.asyncForEach(packageInfo.yarnBoxInfo, async (item1) => {
            // console.log('useWeight yarnWeightNet', item1.useWeight, item1.yarnWeightNet);
            useWeight = +useWeight + item1.useWeight;
            yarnWeightNet = +yarnWeightNet + item1.yarnWeightNet;
            yarnWeight = +yarnWeight + item1.yarnWeight;
            yarnInvoiceWeight = +yarnInvoiceWeight + item1.yarnPlanWeight;
          });
          useWeight = useWeight.toFixed(2);
          yarnWeightNet = yarnWeightNet.toFixed(2);
          yarnWeight = yarnWeight.toFixed(2);
          yarnInvoiceWeight = yarnInvoiceWeight.toFixed(2);
          // console.log(useWeight, yarnWeightNet, yarnWeight, yarnInvoiceWeight);

          if (usageMode === 'ct') {  // ## ct= fromCustomer , t=transfer , p=produce
            // ## check exsist
            const yarnLotUsage = await ShareFunc.checkExistYarnLotUsage(
              companyID, factoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, invoiceID,
              yarnLotUUID, 'ct'
            );
            if (yarnLotUsage.length === 0) {
              const status1 = 'open';
              const yarnUsage1 = {
                datetime: datetime1,
                datetimeIssue: current2,
                yuUUID: yuUUID,
                
                yarnLotID: yarnLotID,
                yarnLotUUID: yarnLotUUID,
                invoiceID: invoiceID,
                usageMode: usageMode,
                yarnWeight: yarnWeight,
                yarnWeightNet: yarnWeightNet,
                useWeight: yarnWeightNet,
                yarnBoxInfo: [],
                usageInfo: {
                  yarnInvoiceWeight: yarnInvoiceWeight,
                  setFactoryID: ['*'],
                  toFactoryID: '*',
                },
              };

              const result1 = await YarnLotUsage.updateOne(
                {$and: [
                  {"companyID":companyID},
                  {"factoryID":factoryID},
                  {"customerID":customerID},
                  {"yarnSeasonID":yarnSeasonID},
                  {"yarnID":yarnID},
                  {"yarnDataUUID":yarnDataUUID},
                  {"uuid":uuid},
                  {"yarnColorID":yarnColorID},
                  // {"status":status1},
                ]}, 
                {
                  "status": status1,
                  // $push: {queueInfo: {$each:queueInfo,  $position: 0}}  // ## add new element at the first
                  $push: {"yarnUsage": yarnUsage1},
                },
                {upsert: true}).session(session);

            } else {
              // ## err
              await session.abortTransaction(); 
              session.endSession();
              return res.status(422).json({
                message: {
                  messageID: 'erry007', 
                  mode:'errYarnLotODEdit', 
                  value: "error yarn lotID edit"
                },
                token: token,
                expiresIn: process.env.expiresIn,
                userID: data.userID,
                success: false
              });
            }
          } else {

          }
          // checkExistYarnLotUsage= async (companyID, factoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, invoiceID,
          //   yarnLotUUID, usageMode)



          // const result5 = await YarnLotUsage.updateOne(
          //   {$and: [
          //     {"companyID":companyID},
          //     {"orderID":orderID},
          //     // {"productID":productID},
          //   ]}, 
          //   {
          //     // "forLossQty": forLossQty,
          //     $push: {queueInfo: {$each:queueInfo,  $position: 0}}  // ## add new element at the first
          //   },
          //   {upsert: true}).session(session2);



          // console.log('yarnWeight = ', yarnWeight.toFixed(2));
          // yarnWeight = (((yarnWeight * 1000) + 5) / 1000).toFixed(2);
          // console.log('yarnWeight = ', yarnWeight);
          // let yarnWeight2 = 0;
          // yarnWeight2 = packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0);
          // console.log('yarnWeight2 = ', yarnWeight2);
          // let yarnWeight3 = (((yarnWeight2 * 1000) + 5) / 1000).toFixed(2);
          // console.log('yarnWeight3 = ', yarnWeight3);

      } else if (yarnPackingList.length > 0) { // ## have record , cannot delete
        return res.status(422).json({
          message: {
            messageID: 'erry007', 
            mode:'errYarnLotODEdit', 
            value: "error yarn lotID edit"
          },
          token: token,
          expiresIn: process.env.expiresIn,
          userID: data.userID,
          success: false
        });
      }

      await session.commitTransaction();
      session.endSession();
    });

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    // await session.commitTransaction();
    // session.endSession();
    // await session2.commitTransaction();
    // session2.endSession();

    const status1 = ['open'];
    const yarnPlan = await ShareFunc.getYarnPlanMainList(companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, status1);

    const uuidArr = [uuid];
    const type1 = [type]; // ## receive
    const yarnPlanDateGroup = await ShareFunc.getYarnPlanDateGroup(
        companyID, factoryID, customerID, yarnSeasonID, uuidArr, type1
    );

    const yarns = await ShareFunc.getYarns(companyID, yarnSeasonID);
    const yarnsCount = await ShareFunc.getYarnsCount(companyID, yarnSeasonID);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},
      yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      yarnPlanDateGroup: yarnPlanDateGroup,

      yarns: yarns,
      yarnsCount: yarnsCount,
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    // await session2.abortTransaction(); 
    // session2.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry007', 
        mode:'errYarnLotODEdit', 
        value: "error yarn lotID edit"
      },
    });
  }  finally {
    session.endSession();
    // session2.endSession();
  }
}

// // ## getYarnUsage
// router.get("/usage/:companyID/:factoryID/:customerID/:yarnSeasonID/:yarnID/:yarnColorID/:yarnDataUUID/:statusArr", 
//   checkAuth, checkUUID, yarnController.getYarnUsage);
exports.getYarnUsage = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const companyID = data.companyID;
  const factoryID = data.factoryID;   // ## main factory 
  const toFactoryID = data.toFactoryID; 
  const customerID = data.customerID;
  const yarnSeasonID = data.yarnSeasonID;// 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024
  const yarnID = data.yarnID;
  const uuid = data.uuid;
  const yarnColorID = data.yarnColorID;
  const yarnDataUUID = data.yarnDataUUID;
  const status = data.status;
  
  // console.log('getYarnUsage');
  // console.log(yarnColorID);
  console.log(companyID, yarnSeasonID, yarnID, yarnColorID);

  await ShareFunc.upsertUserSession1hr(userID);
  // console.log(req.userData.tokenSet);
  const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

  try {
    
    // ## get yarn usage
    const yarnLotUsageList = await ShareFunc.getYarnUsage(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
    // console.log('000');
    
    // const types = ['pcs', 'zone'];
    const yarnStockCardPCS = await ShareFunc.getYarnStockCardPCS(companyID, yarnSeasonID, yarnID, yarnColorID);

    return res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarnLotUsageList: yarnLotUsageList,
      yarnStockCardPCS: yarnStockCardPCS,
    });

    // // ## get yarn usage
    // const oldYearSeason = ['2024AW'];  // ## old version
    // let yarnLotUsageList = [];
    // if (oldYearSeason.includes(yarnSeasonID)){

    //   yarnLotUsageList = await ShareFunc.getYarnUsage(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
    //   // console.log('000');
    //   return res.status(200).json({
    //     token: token,
    //     expiresIn: process.env.expiresIn,
    //     userID: userID,
    //     yarnLotUsageList: yarnLotUsageList,
    //   });

    // } else {  // ## new version
    //   yarnLotUsageList = await ShareFunc.getYarnUsageV2(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, uuid, yarnColorID, yarnDataUUID, status);
      
    //   return res.status(200).json({
    //     token: token,
    //     expiresIn: process.env.expiresIn,
    //     userID: userID,
    //     yarnLotUsageList: yarnLotUsageList,
    //   });
    // }
    // // console.log('111');

    // let productIDs = [];
    // await this.asyncForEach(orderIDs, async (item1) => {
    //   productIDs.push(await ShareFunc.setBackStrLen(process.env.productIDLen, item1, ' '));
    // });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry008', 
        mode:'errYarnUsage', 
        value: "error get yarn usage"
      }
    });
  }
}

// // ## getYarnUsageCF
// router.put("/usage/list2", checkAuth, checkUUID, yarnController.getYarnUsageCF);
exports.getYarnUsageCF = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const companyID = data.companyID;
  const setfactoryID = data.setfactoryID;  // ## sub factory 
  const toFactoryID = data.toFactoryID; 
  const customerID = data.customerID;
  const yarnSeasonID = data.yarnSeasonID;// 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024
  const yarnID = data.yarnID;
  const uuid = data.uuid;
  const yarnColorID = data.yarnColorID;
  const yarnDataUUID = data.yarnDataUUID;
  const status = data.status;
  
  // console.log('getYarnUsageCF');
  // console.log(yarnColorID);
  // console.log(companyID, setfactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);

  await ShareFunc.upsertUserSession1hr(userID);
  // console.log(req.userData.tokenSet);
  const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

  try {
    // ## get yarn usage
    const yarnLotUsageList = await ShareFunc.getYarnUsageCF(companyID, [setfactoryID], customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
    // // console.log(yarnLotUsageList);
    
    // ## yarnStockCardPCS  getYarnStockCardPCS= async (companyID, yarnSeasonID, yarnID, yarnColorID)
    // const types = ['pcs', 'zone'];
    const yarnStockCardPCS = await ShareFunc.getYarnStockCardPCS(companyID, yarnSeasonID, yarnID, yarnColorID);
    
    return res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarnLotUsageList: yarnLotUsageList,
      yarnStockCardPCS: yarnStockCardPCS,
    });

    // // ## get yarn usage
    // const oldYearSeason = ['2024AW'];  // ## old version
    // let yarnLotUsageList = [];
    // if (oldYearSeason.includes(yarnSeasonID)){
    //   yarnLotUsageList = await ShareFunc.getYarnUsageCF(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
    //   return res.status(200).json({
    //     token: token,
    //     expiresIn: process.env.expiresIn,
    //     userID: userID,
    //     yarnLotUsageList: yarnLotUsageList,
    //   });
    // } else {
    //   yarnLotUsageList = await ShareFunc.getYarnUsageCFV2(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, uuid, yarnColorID, yarnDataUUID, status);
      
    //   return res.status(200).json({
    //     token: token,
    //     expiresIn: process.env.expiresIn,
    //     userID: userID,
    //     yarnLotUsageList: yarnLotUsageList,
    //   });
    // }
    // console.log(yarnLotUsageList);
    
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry008', 
        mode:'errYarnUsage', 
        value: "error get yarn usage"
      }
    });
  }
}

// router.put("/usage/edit/sendto/newFac", checkAuth, checkUUID, yarnController.editYarnUsageNewFacSendTo);
exports.editYarnUsageNewFacSendTo = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const companyID = data.companyID;
  const factoryID = data.factoryID;   // ## main factory 
  const toFactoryID = data.toFactoryID; 
  const customerID = data.customerID;
  const yarnSeasonID = data.yarnSeasonID;// 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024
  const yarnID = data.yarnID;
  const yarnColorID = data.yarnColorID;
  const yarnDataUUID = data.yarnDataUUID;
  const status = data.status;
  const yuUUID = data.yuUUID;
  const invoiceID = data.invoiceID;
  const usageMode = data.usageMode;
  const yarnLotID = data.yarnLotID;

  const newFacIDSendTo = data.newFacIDSendTo;

  // console.log('editYarnUsageNewFacSendTo');
  // console.log(newFacIDSendTo);
  // console.log(companyID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status, toFactoryID);
  // console.log(yuUUID, invoiceID, usageMode, yarnLotID);

  let session = await mongoose.startSession();
  try {

    // ## edit new factoryID send to
    await session.withTransaction(async (session) => {

      const yarnLotUsageUpdate = await YarnLotUsage.updateOne(
        {$and: [
          {"companyID":companyID},
          // {"factoryID":factoryID},
          // {"yarnDataUUID":yarnDataUUID},
          {"yarnID":yarnID},
          {"yarnColorID":yarnColorID},
          {"yarnSeasonID":yarnSeasonID},
        ]},
        {$set: {"yarnUsage.$[elem].usageInfo.toFactoryID" : newFacIDSendTo}},
        {
          multi: true,
          arrayFilters: [  
            {
              "elem.yuUUID": yuUUID ,
              "elem.invoiceID": invoiceID , 
              "elem.usageMode": usageMode , 
              "elem.yarnLotID": yarnLotID , 
              // "elem.yarnLotUUID": yarnLotUUID , 
              // "elem.toFactoryID": toFactoryID , 
            },
            // {
            //   "elem2.yarnLotUUID": yarnLotUUID,
            //   "elem2.yarnLotID": yarnLotID,
            // }
          ]
        }).session(session);

        await session.commitTransaction();
        session.endSession();
    });

    // ## get yarn usage
    const yarnLotUsageList = await ShareFunc.getYarnUsage(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
  // console.log(yarnLotUsageList);



    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarnLotUsageList: yarnLotUsageList,
      // yarnsCount: yarnsCount,
      // yarnPlans: yarnPlans,
      // yarnPlansCount: yarnPlansCount,
      // productImageProfiles: productImageProfiles,
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry008', 
        mode:'errYarnUsage', 
        value: "error get yarn usage"
      }
    });
  }
}

// router.put("/edot/usage/transfer/date", checkAuth, checkUUID, yarnController.putYarnUsageTransfersDate); 
exports.putYarnUsageTransfersDate = async (req, res, next) => {
  // console.log('putEditYarnLotIDDevide');
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const companyID = data.companyID;
  const yarnSeasonID = data.yarnSeasonID;// 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024 
  const yarnID = data.yarnID;
  // const uuid = data.uuid;
  const yarnColorID = data.yarnColorID;
  const mode = data.mode; // ##  'yarn-packaging-list-stock-card'   'fac-lot'
  // const yarnDataUUID = data.yarnDataUUID;

  const invoiceID = data.invoiceID;
  const yuUUID = data.yuUUID;
  const yarnLotID = data.yarnLotID;
  // const yarnLotUUID = data.yarnLotUUID;
  const usageMode = data.usageMode;  // ## t = transfer
  // const type = data.type;  // ## ['receive']    
  // const yarnColorID = data.yarnColorID;

  const datetime = new Date(moment(data.datetime).tz('Asia/Bangkok').format('YYYY/MM/DD 08:00:ss+07:00'));


  const setfactoryID = data.setfactoryID;  // ## sub factory 
  const factoryID = data.factoryID;   // ## main factory 
  const toFactoryID = data.toFactoryID; 
  const customerID = data.customerID;
  const yarnDataUUID = data.yarnDataUUID;
  const status = data.status;

  // console.log(type);
  // console.log(companyID, yarnDataUUID, uuid, yarnSeasonID);
  // console.log(yarnID, yarnColorID, yarnLotID, yarnLotUUID, type, factoryIDBox);
  // console.log(uuid);

  // console.log(companyID, yarnDataUUID, yarnSeasonID);
  // console.log(yarnID, yarnColorID, yarnLotID);
  // console.log(setfactoryID, factoryID, toFactoryID, customerID, yarnDataUUID, status);
  // console.log( mode, yuUUID, yarnLotID, invoiceID, usageMode, datetime);

  let session = await mongoose.startSession();
  // let session2 = await mongoose.startSession();
  // session.startTransaction();
  // session2.startTransaction();
  try {
    await session.withTransaction(async (session) => {

      const oldYearSeason = ['2024AW'];  // ## old version
      if (oldYearSeason.includes(yarnSeasonID)) {
        const yarnLotUsageUpdate = await YarnLotUsage.updateOne(
          {$and: [
            {"companyID":companyID},
            // {"factoryID":factoryID},
            // {"yarnDataUUID":yarnDataUUID},
            {"yarnID":yarnID},
            {"yarnColorID":yarnColorID},
            {"yarnSeasonID":yarnSeasonID},
          ]},
          {$set: {"yarnUsage.$[elem].datetimeIssue" : datetime}},
          {
            multi: true,
            arrayFilters: [  
              {
                "elem.yuUUID": yuUUID ,
                "elem.invoiceID": invoiceID , 
                "elem.usageMode": usageMode , 
                "elem.yarnLotID": yarnLotID , 
                // "elem.yarnLotUUID": yarnLotUUID , 
                // "elem.toFactoryID": toFactoryID , 
              },
              // {
              //   "elem2.yarnLotUUID": yarnLotUUID,
              //   "elem2.yarnLotID": yarnLotID,
              // }
            ]
          }).session(session);
          await session.commitTransaction();
          session.endSession();
      } else { // ## new version
        const yarnLotUsageUpdate = await YarnLotUsage.updateOne(
          {$and: [
            {"companyID":companyID},
            // {"factoryID":factoryID},
            {"yarnDataUUID":yarnDataUUID},
            {"yarnID":yarnID},
            {"yarnColorID":yarnColorID},
            {"yarnSeasonID":yarnSeasonID},
          ]},
          {$set: {"yarnUsage.$[elem].datetimeIssue" : datetime}},
          {
            multi: true,
            arrayFilters: [  
              {
                "elem.yuUUID": yuUUID ,
                "elem.invoiceID": invoiceID , 
                "elem.usageMode": usageMode , 
                "elem.yarnLotID": yarnLotID , 
                // "elem.yarnLotUUID": yarnLotUUID , 
                // "elem.toFactoryID": toFactoryID , 
              },
              // {
              //   "elem2.yarnLotUUID": yarnLotUUID,
              //   "elem2.yarnLotID": yarnLotID,
              // }
            ]
          }).session(session);
          await session.commitTransaction();
          session.endSession();
      }

      // const yarnLotUsageUpdate = await YarnLotUsage.updateOne(
      //   {$and: [
      //     {"companyID":companyID},
      //     // {"factoryID":factoryID},
      //     {"yarnDataUUID":yarnDataUUID},
      //     {"yarnID":yarnID},
      //     {"yarnColorID":yarnColorID},
      //     {"yarnSeasonID":yarnSeasonID},
      //   ]},
      //   {$set: {"yarnUsage.$[elem].datetimeIssue" : datetime}},
      //   {
      //     multi: true,
      //     arrayFilters: [  
      //       {
      //         "elem.yuUUID": yuUUID ,
      //         "elem.invoiceID": invoiceID , 
      //         "elem.usageMode": usageMode , 
      //         "elem.yarnLotID": yarnLotID , 
      //         // "elem.yarnLotUUID": yarnLotUUID , 
      //         // "elem.toFactoryID": toFactoryID , 
      //       },
      //       // {
      //       //   "elem2.yarnLotUUID": yarnLotUUID,
      //       //   "elem2.yarnLotID": yarnLotID,
      //       // }
      //     ]
      //   }).session(session);
        // console.log(yarnLotUsageUpdate);
        // await session.commitTransaction();
        // session.endSession();
    });

    // const yarnLotUsageList = await ShareFunc.getYarnUsage(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);

    let yarnLotUsageList = [];
    if (mode === 'yarn-packaging-list-stock-card') {
      yarnLotUsageList = await ShareFunc.getYarnUsage(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
    } else if (mode === 'fac-lot') {
      yarnLotUsageList = await ShareFunc.getYarnUsageCF(companyID, [setfactoryID], customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
    }

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    // console.log('4');

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},
      yarnLotUsageList: yarnLotUsageList,
      // yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      // yarnPlanDateGroup: yarnPlanDateGroup
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    // await session2.abortTransaction(); 
    session.endSession();
    // session2.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry010', 
        mode:'errYarnLotDevide', 
        value: "error yarn lotID edit devide"
      },
    });
  }  finally {
    session.endSession();
    // session2.endSession();
  }
}

// router.put("/edit/usage2/stockcard/pcs", checkAuth, checkUUID, yarnController.putYarnStockCardPCS); 
exports.putYarnStockCardPCS = async (req, res, next) => {
  // console.log('putYarnStockCardPCS'); 
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const yarnStockCardPCS = data.yarnStockCardPCS;
  const companyID = yarnStockCardPCS.companyID;
  const yarnSeasonID = yarnStockCardPCS.yarnSeasonID;// 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024 
  const yarnID = yarnStockCardPCS.yarnID;
  const yarnColorID = yarnStockCardPCS.yarnColorID;
  const type = yarnStockCardPCS.type;  // ## type = 'pcs'
  // const types = ['pcs', 'zone'];

  let dataPCS = yarnStockCardPCS.dataPCS[0];
  const pcs = dataPCS.pcs;

  // console.log(yarnStockCardPCS); 
  // console.log(dataPCS, pcs); 

  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  dataPCS.datetime = current;

  const yarnStockCardPCS1 = await ShareFunc.getYarnStockCardPCS(companyID, yarnSeasonID, yarnID, yarnColorID);

  let session = await mongoose.startSession();
  try {
    await session.withTransaction(async (session) => {

      if (pcs === 0 && yarnStockCardPCS1) {
        // ## remove element
        // console.log('pcs === 0 && yarnStockCardPCS1.length > 0'); 
        const result1 = await YarnStockCardPCS.updateMany(
          {$and: [
            {"companyID":companyID},
            {"yarnID":yarnID},
            {"yarnColorID":yarnColorID},
            {"yarnSeasonID":yarnSeasonID},
          ]}, 
          {
            $pull: {
              dataPCS: {
                "ddmmyyyy": dataPCS.ddmmyyyy , 
                "usageMode": dataPCS.usageMode , 
                "orderID": dataPCS.orderID , 
                "toFactoryID": dataPCS.toFactoryID , 
                "invoiceID": dataPCS.invoiceID , 

                "yarnBoxInfoLen": dataPCS.yarnBoxInfoLen ,
                "yarnLotID2": dataPCS.yarnLotID2 , 
                "yarnDataUUID": dataPCS.yarnDataUUID , 
                "yarnLotUUID": dataPCS.yarnLotUUID , 
                "yuUUID": dataPCS.yuUUID ,
              }
            }
          }).session(session);
        await session.commitTransaction();
        session.endSession();

      } else {
        // ##  mode upsert
        if (!yarnStockCardPCS1) {
          // console.log('mode upsert   ,  yarnStockCardPCS1.length === 0'); 
          const yarnStockCardPCSUpsert = await YarnStockCardPCS.updateOne({$and: [
            {"companyID":companyID},
            {"yarnID":yarnID},
            {"yarnColorID":yarnColorID},
            {"yarnSeasonID":yarnSeasonID},
            ]} , 
            {
              "dataPCS": dataPCS,
            }, {upsert: true}).session(session);
          await session.commitTransaction();
          session.endSession();

        // ##  mode edit
        } else {
          // console.log('mode edit   ,  yarnStockCardPCS1.length > 0'); 

          // ## check element exist
          const dataPCSSDataPCS1 = await ShareFunc.getYarnStockCardPCSDataPCS1(companyID, yarnSeasonID, yarnID, yarnColorID, dataPCS);
          if (dataPCSSDataPCS1.length === 0 ) {
            // ## add element
            const result1 = await YarnStockCardPCS.updateOne(
              {$and: [
                {"companyID":companyID},
                {"yarnID":yarnID},
                {"yarnColorID":yarnColorID},
                {"yarnSeasonID":yarnSeasonID}, 
              ]}, 
              {
                $push: {"dataPCS": dataPCS},
              },
              // {upsert: true});
              {upsert: true}).session(session);

          } else {
            // ## edit element
            const yarnStockCardPCSUpdate = await YarnStockCardPCS.updateOne(
              {$and: [
                {"companyID":companyID},
                {"yarnID":yarnID},
                {"yarnColorID":yarnColorID},
                {"yarnSeasonID":yarnSeasonID},
              ]},
              {$set: {
                "dataPCS.$[elem].datetime" : current,
                "dataPCS.$[elem].pcs" : pcs,
              }},
              {
                multi: true,
                arrayFilters: [  
                  {
                    "elem.ddmmyyyy": dataPCS.ddmmyyyy , 
                    "elem.usageMode": dataPCS.usageMode , 
                    "elem.orderID": dataPCS.orderID , 
                    "elem.toFactoryID": dataPCS.toFactoryID , 
                    "elem.invoiceID": dataPCS.invoiceID , 
  
                    "elem.yarnBoxInfoLen": dataPCS.yarnBoxInfoLen ,
                    "elem.yarnLotID2": dataPCS.yarnLotID2 , 
                    "elem.yarnDataUUID": dataPCS.yarnDataUUID , 
                    "elem.yarnLotUUID": dataPCS.yarnLotUUID , 
                    "elem.yuUUID": dataPCS.yuUUID ,
                  },
                ]
              }).session(session);
              await session.commitTransaction();
              session.endSession();
          }
        }
      }
    });

    // let yarnLotUsageList = [];
    // if (mode === 'yarn-packaging-list-stock-card') {
    //   yarnLotUsageList = await ShareFunc.getYarnUsage(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
    // } else if (mode === 'fac-lot') {
    //   yarnLotUsageList = await ShareFunc.getYarnUsageCF(companyID, [setfactoryID], customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
    // }

    const yarnStockCardPCS = await ShareFunc.getYarnStockCardPCS(companyID, yarnSeasonID, yarnID, yarnColorID);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    // console.log('4');

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},
      yarnStockCardPCS: yarnStockCardPCS,
      // yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      // yarnPlanDateGroup: yarnPlanDateGroup
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    // await session2.abortTransaction(); 
    session.endSession();
    // session2.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry010', 
        mode:'errYarnLotDevide', 
        value: "error yarn lotID edit devide"
      },
    });
  }  finally {
    session.endSession();
    // session2.endSession();
  }
}

// router.put("/edit/usage3/stockcard/zone", checkAuth, checkUUID, yarnController.putYarnStockCardPCSZONE); 
exports.putYarnStockCardPCSZONE = async (req, res, next) => {
  // console.log('putYarnStockCardPCSZONE'); 
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const yarnStockCardPCS = data.yarnStockCardPCS;
  const companyID = yarnStockCardPCS.companyID;
  const yarnSeasonID = yarnStockCardPCS.yarnSeasonID;// 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024 
  const yarnID = yarnStockCardPCS.yarnID;
  const yarnColorID = yarnStockCardPCS.yarnColorID;
  const type = yarnStockCardPCS.type;  // ## type = 'zone'
  // const types = ['pcs', 'zone'];

  let dataZONE = yarnStockCardPCS.dataZONE[0];
  const targetPlaceID = dataZONE.targetPlaceID;

  // console.log(yarnStockCardPCS); 
  // console.log(dataZONE, targetPlaceID); 

  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  dataZONE.datetime = current;

  const yarnStockCardPCS1 = await ShareFunc.getYarnStockCardPCS(companyID, yarnSeasonID, yarnID, yarnColorID);

  let session = await mongoose.startSession();
  try {
    await session.withTransaction(async (session) => {

      if (targetPlaceID === 'x' && yarnStockCardPCS1) {
        // ## remove element
        // console.log('pcs === 0 && yarnStockCardPCS1.length > 0'); 
        const result1 = await YarnStockCardPCS.updateMany(
          {$and: [
            {"companyID":companyID},
            {"yarnID":yarnID},
            {"yarnColorID":yarnColorID},
            {"yarnSeasonID":yarnSeasonID},
          ]}, 
          {
            $pull: {
              dataZONE: {
                "ddmmyyyy": dataZONE.ddmmyyyy , 
                "usageMode": dataZONE.usageMode , 
                "orderID": dataZONE.orderID , 
                "toFactoryID": dataZONE.toFactoryID , 
                "invoiceID": dataZONE.invoiceID , 

                "yarnBoxInfoLen": dataZONE.yarnBoxInfoLen ,
                "yarnLotID2": dataZONE.yarnLotID2 , 
                "yarnDataUUID": dataZONE.yarnDataUUID , 
                "yarnLotUUID": dataZONE.yarnLotUUID , 
                "yuUUID": dataZONE.yuUUID ,
              }
            }
          }).session(session);
        await session.commitTransaction();
        session.endSession();

      } else {
        // ##  mode upsert
        if (!yarnStockCardPCS1) {
          // console.log('mode upsert   ,  yarnStockCardPCS1.length === 0'); 
          const yarnStockCardPCSUpsert = await YarnStockCardPCS.updateOne({$and: [
            {"companyID":companyID},
            {"yarnID":yarnID},
            {"yarnColorID":yarnColorID},
            {"yarnSeasonID":yarnSeasonID},
            ]} , 
            {
              "dataZONE": dataZONE,
            }, {upsert: true}).session(session); 
          await session.commitTransaction();
          session.endSession();

        // ##  mode edit
        } else {
          // console.log('mode edit   ,  yarnStockCardPCS1.length > 0'); 

          // ## check element exist
          const dataPCSSDataPCSZONE1 = await ShareFunc.getYarnStockCardPCSDataZONE1(companyID, yarnSeasonID, yarnID, yarnColorID, dataZONE);
          if (dataPCSSDataPCSZONE1.length === 0 ) {
            // ## add element
            // console.log('add element'); 
            const result1 = await YarnStockCardPCS.updateOne(
              {$and: [
                {"companyID":companyID},
                {"yarnID":yarnID},
                {"yarnColorID":yarnColorID},
                {"yarnSeasonID":yarnSeasonID}, 
              ]}, 
              {
                $push: {"dataZONE": dataZONE},
              },
              // {upsert: true});
              {upsert: true}).session(session);

          } else {
            // ## edit element
            // console.log('edit element'); 
            const yarnStockCardPCSUpdate = await YarnStockCardPCS.updateOne(
              {$and: [
                {"companyID":companyID},
                {"yarnID":yarnID},
                {"yarnColorID":yarnColorID},
                {"yarnSeasonID":yarnSeasonID},
              ]},
              {$set: {
                "dataZONE.$[elem].datetime" : current,
                "dataZONE.$[elem].targetPlaceID" : targetPlaceID,
              }},
              {
                multi: true,
                arrayFilters: [  
                  {
                    "elem.ddmmyyyy": dataZONE.ddmmyyyy , 
                    "elem.usageMode": dataZONE.usageMode , 
                    "elem.orderID": dataZONE.orderID , 
                    "elem.toFactoryID": dataZONE.toFactoryID , 
                    "elem.invoiceID": dataZONE.invoiceID , 
  
                    "elem.yarnBoxInfoLen": dataZONE.yarnBoxInfoLen ,
                    "elem.yarnLotID2": dataZONE.yarnLotID2 , 
                    "elem.yarnDataUUID": dataZONE.yarnDataUUID , 
                    "elem.yarnLotUUID": dataZONE.yarnLotUUID , 
                    "elem.yuUUID": dataZONE.yuUUID ,
                  },
                ]
              }).session(session);
              await session.commitTransaction();
              session.endSession();
          }
        }
      }
    });

    // let yarnLotUsageList = [];
    // if (mode === 'yarn-packaging-list-stock-card') {
    //   yarnLotUsageList = await ShareFunc.getYarnUsage(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
    // } else if (mode === 'fac-lot') {
    //   yarnLotUsageList = await ShareFunc.getYarnUsageCF(companyID, [setfactoryID], customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
    // }

    const yarnStockCardPCS = await ShareFunc.getYarnStockCardPCS(companyID, yarnSeasonID, yarnID, yarnColorID);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    // console.log('4');

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},
      yarnStockCardPCS: yarnStockCardPCS,
      // yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      // yarnPlanDateGroup: yarnPlanDateGroup
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    // await session2.abortTransaction(); 
    session.endSession();
    // session2.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry010', 
        mode:'errYarnLotDevide', 
        value: "error yarn lotID edit devide"
      },
    });
  }  finally {
    session.endSession();
    // session2.endSession();
  }
}

// router.put("/edit/usage4/change/invoiceID", checkAuth, checkUUID, yarnController.putYarnChangeInvoiceID); 
exports.putYarnChangeInvoiceID = async (req, res, next) => {
  // console.log('putYarnChangeInvoiceID');
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const companyID = data.companyID;

  const yarnSeasonID = data.yarnSeasonID;

  const invoiceID1 = data.invoiceID1; // 'I-SHXN2024H116';  
  const invoiceID2 = data.invoiceID2; // 'I-SHXN2024H116-222';

  const type = ["plan", "receive"];  // plan, receive  

  let session = await mongoose.startSession();
  try {
    await session.withTransaction(async (session) => {
      // ## edit update yarnLotUsage
  const result1 = await YarnLotUsage.updateMany(
    {$and: [
      {"companyID":companyID},
      {"yarnSeasonID":yarnSeasonID},
    ]},
    {$set: { 
      "yarnUsage.$[elem].invoiceID" : invoiceID2, 
    }}, 
    {
      multi: true,
      arrayFilters: [  {
        "elem.invoiceID": invoiceID1 , 
      } ]
    }).session(session);

  // ## edit update yarnData
  const yarnLotIDUpdate1 = await YarnData.updateMany(
    {$and: [
      {"companyID":companyID},
      {"yarnSeasonID":yarnSeasonID},
    ]},
    { 
      $set: { 
        "yarnDataInfo.$[elem].packageInfo.$[elem2].invoiceID" : invoiceID2 ,
      },
    },
    {
      multi: true,
      arrayFilters: [  
        {
          "elem.type": {$in: type}  
        },
        {
          "elem2.invoiceID": invoiceID1
        }
     ]
    }).session(session);

    // ## edit update yarnLotUsage
    const yarnStockCardPCS2 = await YarnStockCardPCS.updateMany(
      {$and: [
        {"companyID":companyID},
        {"yarnSeasonID":yarnSeasonID},
      ]},
      { 
        $set: { 
          "dataPCS.$[elem].invoiceID" : invoiceID2 ,
          "dataZONE.$[elem].invoiceID" : invoiceID2 ,
        },
      },
      {
        multi: true,
        arrayFilters: [  
          {
            "elem.invoiceID": invoiceID1
            // "elem.type": {$in: type} 
          },
          {
            "elem2.invoiceID": invoiceID1
          }
       ]
      }).session(session);

      await session.commitTransaction();
      session.endSession();
    });

    // console.log('putYarnChangeInvoiceID  ok');

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},
    });

  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    // await session2.abortTransaction(); 
    session.endSession();
    // session2.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry010', 
        mode:'errYarnchangeInvoiceID', 
        value: "error edit yarn change invoiceID"
      },
    });
  }  finally {
    session.endSession();
    // session2.endSession();
  }
}

// // ## getYarnLotInfo
// router.put("/yarnlotID/getinfo", checkAuth, checkUUID, yarnController.getYarnLotInfo);
exports.getYarnLotInfo = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const companyID = data.companyID;
  const factoryIDBox = data.factoryIDBox;
  // const factoryID = data.factoryID;
  // const customerID = data.customerID;
  const yarnSeasonID = data.yarnSeasonID;// 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024
  const yarnID = data.yarnID;
  const yarnColorID = data.yarnColorID;
  const yarnLotID = data.yarnLotID;
  const yarnLotUUID = data.yarnLotUUID;
  const type = data.type;  // ## ['receive'] 

  // factoryIDBox

  // console.log('getYarnLotInfo');
  // console.log(yarnColorID);
  // console.log(companyID, factoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
  try {
    // ## get yarn usage
    const yarnLotInfo = await ShareFunc.getYarnLotInfoByYarnLotID(companyID, factoryIDBox, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type);
    // yarnLotInfo: yarnLotInfo,

    // let productIDs = [];
    // await this.asyncForEach(orderIDs, async (item1) => {
    //   productIDs.push(await ShareFunc.setBackStrLen(process.env.productIDLen, item1, ' '));
    // });

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarnLotInfo: yarnLotInfo,
      // yarnsCount: yarnsCount,
      // yarnPlans: yarnPlans,
      // yarnPlansCount: yarnPlansCount,
      // productImageProfiles: productImageProfiles,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry009', 
        mode:'errYarnLotInfo', 
        value: "error get yarn lot info"
      }
    });
  }
}

// // ## getYarnLotCFInfo
// router.put("/yarnlot/CF/getinfo", checkAuth, checkUUID, yarnController.getYarnLotCFInfo);
exports.getYarnLotCFInfo = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const companyID = data.companyID;
  const factoryID = data.factoryID;  // ## from setFactory
  // const customerID = data.customerID;
  const yarnSeasonID = data.yarnSeasonID;// 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024
  const yarnID = data.yarnID;
  const uuid = data.uuid;
  const type = data.type;  // ## ['receive'] 
  const state = data.state;  // ## verified
  const weightVerified = data.weightVerified;  // ## true

  // console.log('getYarnLotCFInfo');
  // console.log(yarnColorID);
  // console.log(companyID, factoryID, yarnSeasonID, yarnID, type, state);
  // console.log('weightVerified = ' + weightVerified);
  try {
    // ## get yarn usage                             (companyID, factoryID, yarnSeasonID, yarnID, type, state, weightVerified)
    const yarnData = await ShareFunc.getYarnLotInfoCF(companyID, factoryID, yarnSeasonID, yarnID, uuid, type, state, weightVerified);
    // console.log(yarnData);
    // yarnLotInfo: yarnLotInfo,

    // let productIDs = [];
    // await this.asyncForEach(orderIDs, async (item1) => {
    //   productIDs.push(await ShareFunc.setBackStrLen(process.env.productIDLen, item1, ' '));
    // });

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarnData: yarnData,
      // yarnsCount: yarnsCount,
      // yarnPlans: yarnPlans,
      // yarnPlansCount: yarnPlansCount,
      // productImageProfiles: productImageProfiles,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry009', 
        mode:'errYarnLotInfo', 
        value: "error get yarn lot info"
      }
    });
  }
}

// // ## getYarnLotBoxLastStr
// router.put("/yarnlotbox/get/box/last/str", checkAuth, checkUUID, yarnController.getYarnLotBoxLastStr);
exports.getYarnLotBoxLastStr = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const companyID = data.companyID;
  const yarnSeasonID = data.yarnSeasonID;// 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024
  const yarnID = data.yarnID;
  const yarnColorID = data.yarnColorID;
  const yarnLotID = data.yarnLotID;
  const yarnLotUUID = data.yarnLotUUID;
  const type = data.type;  // ## ['receive'] 
  const boxID = data.boxID;
  const boxSign = data.boxSign;

  // console.log('getYarnLotBoxLastStr');
  // console.log(yarnColorID);
  // console.log(companyID, factoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
  try {
    // ## get yarn lot box last string
    const yarnData = await ShareFunc.getYarnLotBoxLastStr(companyID, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type, boxID, boxSign);
    // console.log(yarnData);
    let data1 = [];
    await this.asyncForEach(yarnData, async (item1) => {
      const strArr = item1.boxID.split(boxSign);
      data1.push({str1: strArr[0]?strArr[0]:'', str2: strArr[1]?strArr[1]:''});
    });
    data1.sort((a,b)=>{return a.str2 <b.str2?1:a.str2 >b.str2?-1:0});  // ## desc
    const data2 = data1.length > 0 ? data1[0].str2: undefined;
    let charE = '*';
    charE = data2 || data2 !== '' ? data2 : '*';

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      charE: charE,
      // yarnsCount: yarnsCount,
      // yarnPlans: yarnPlans,
      // yarnPlansCount: yarnPlansCount,
      // productImageProfiles: productImageProfiles,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erry009', 
        mode:'errYarnLotInfo', 
        value: "error get yarn lot info"
      }
    });
  }
}

// // ## /api/yarn/yarnlotID2/edit/devide putEditYarnLotIDDevide
// router.put("/yarnlotbox/edit/devide", checkAuth, checkUUID, yarnController.putEditYarnLotIDDevide);
exports.putEditYarnLotIDDevide = async (req, res, next) => {
  // console.log('putEditYarnLotIDDevide');
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const companyID = data.companyID;
  const yarnSeasonID = data.yarnSeasonID;// 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024 
  const yarnID = data.yarnID;
  const uuid = data.uuid;
  const yarnDataUUID = data.yarnDataUUID;
  const yarnColorID = data.yarnColorID;
  const yarnLotID = data.yarnLotID;
  const yarnLotUUID = data.yarnLotUUID;
  const type = data.type;  // ## ['receive']    
  const boxID = data.boxID;
  const boxUUID = data.boxUUID;
  const boxSign = data.boxSign;
  const boxNew = data.boxNew;
  const boxIDNew = boxNew.boxIDNew;
  const weightDevide = boxNew.weightDevide;
  const yarnWeightNew = boxNew.yarnWeightNew;  // ## old weight remain  
  const factoryIDBox = data.factoryIDBox;


  // console.log(type);
  // console.log(companyID, yarnDataUUID, uuid, yarnSeasonID);
  // console.log(yarnID, yarnColorID, yarnLotID, yarnLotUUID, type, factoryIDBox);
  // console.log(boxID, boxUUID, boxSign, boxNew);
  // console.log(boxIDNew, weightDevide, yarnWeightNew);

  let session = await mongoose.startSession();
  // let session2 = await mongoose.startSession();
  // session.startTransaction();
  // session2.startTransaction();
  try {
    await session.withTransaction(async (session) => {
      const yarnData = await ShareFunc.getYarnLotBoxExisted(companyID, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type, boxIDNew);
      // ## check exist box new
      // console.log(yarnData);
      if (yarnData.length > 0) {
        await session.abortTransaction(); 
        session.endSession();
        // await session2.abortTransaction(); 
        // session2.endSession();
        return res.status(501).json({
          message: {
            messageID: 'erry010', 
            mode:'errYarnLotDevide', 
            value: "error yarn lotID edit devide",
            success: false
          },
        });
      } else {  // ## not exist , can add new box
        // ## old box - weight
        const yarnBoxInfo = {
          boxID: boxIDNew,
          boxUUID: uuidv4(),
          coneQty: 0,
          factoryID: factoryIDBox,
          yarnPlanWeight: 0.00,
          yarnWeight: 0.00,
          yarnWeightNet: 0.00,
          useWeight: weightDevide,
          yarnTransferWeight: 0.00,
          weightVerified: true,
          used: false,
        };
        // console.log(yarnBoxInfo);

        const yarnLotIDUpdate1 = await YarnData.updateOne(
          {$and: [
            {"companyID":companyID},
            // {"factoryID":factoryID},
            // {"customerID":customerID},
            {"yarnSeasonID":yarnSeasonID},
            {"uuid":uuid},    //  f8ca2709-8d72-452a-ace6-0ff5709d75f4
            {"yarnID":yarnID},
          ]},
          { 
            // $push: {"yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo" : yarnBoxInfo},
            $set: { "yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo.$[elem3].useWeight" : yarnWeightNew },
          },
          {
            multi: true,
            arrayFilters: [  
              {
                "elem.yarnDataUUID": yarnDataUUID ,  // ecbf0e67-101b-4140-8f58-873d94cfacf0
                "elem.yarnColorID": yarnColorID , // muji;#001;OW
                "elem.type": type[0] ,   // receive
                // "elem.toFactoryID": toFactoryID , 
              },
              {
                "elem2.yarnLotUUID": yarnLotUUID,  // 2ff90782-3bb0-43be-ad89-e0930a165cea
                "elem2.yarnLotID": yarnLotID,  // KJJKGHFH-A
              },
              {
                "elem3.boxID": boxID,  // 2120
                "elem3.boxUUID": boxUUID  // 1b407f08-9555-47cf-94a1-e787351c9cbc
              }
          ]}
          ).session(session);
        // await session.commitTransaction();
        // session.endSession();
        // console.log(yarnLotIDUpdate1);
        // console.log('1');

        // // ## add new box
        // const yarnBoxInfo = {
        //   boxID: boxIDNew,
        //   boxUUID: uuidv4(),
        //   factoryID: factoryIDBox,
        //   yarnPlanWeight: 0.00,
        //   yarnWeight: 0.00,
        //   useWeight: weightDevide,
        //   weightVerified: true,
        //   used: false,
        // };

        const yarnLotIDUpdate2 = await YarnData.updateOne(
          {$and: [
            {"companyID":companyID},
            // {"factoryID":factoryID},
            // {"customerID":customerID},
            {"yarnSeasonID":yarnSeasonID},
            {"uuid":uuid},
            {"yarnID":yarnID},
          ]},
          {$push: {"yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo" : yarnBoxInfo}},
          {
            multi: true,
            arrayFilters: [  
              {
                "elem.yarnDataUUID": yarnDataUUID ,
                "elem.yarnColorID": yarnColorID , 
                "elem.type": type[0] , 
                // "elem.toFactoryID": toFactoryID , 
              },
              {
                "elem2.yarnLotUUID": yarnLotUUID,
                "elem2.yarnLotID": yarnLotID,
              }
            ]
          }).session(session);

          // await session2.commitTransaction();
          // session2.endSession();
          // console.log('2');
          // yarnLotIDUpdate1.save({ session });
        }

        await session.commitTransaction();
        session.endSession();
    });
    // console.log('3');
    // await session.commitTransaction();
    // session.endSession();
    // await session2.commitTransaction();
    // session2.endSession();

    // console.log('2', type);
                                                             //  (companyID, factoryIDBox, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type)
    const yarnLotInfo = await ShareFunc.getYarnLotInfoByYarnLotID(companyID, factoryIDBox, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type);
    // console.log('4');

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    // console.log('4');

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},
      yarnLotInfo: yarnLotInfo,
      // yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      // yarnPlanDateGroup: yarnPlanDateGroup
      
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction(); 
    // await session2.abortTransaction(); 
    session.endSession();
    // session2.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry010', 
        mode:'errYarnLotDevide', 
        value: "error yarn lotID edit devide"
      },
    });
  }  finally {
    session.endSession();
    // session2.endSession();
  }
}

exports.putYarnLotTransferCFCancelAndBackCenter = async (req, res, next) => {
  // console.log('putYarnLotTransferCFCancelAndBackCenter');
  const userID = req.userData.tokenSet.userID;
  const data = req.body;

  const yarnDataDraft = data.yarnDataDraft;

  const companyID = yarnDataDraft.companyID;
  const factoryID = yarnDataDraft.factoryID;
  const customerID = yarnDataDraft.customerID;
  const uuid = yarnDataDraft.uuid;
  
  const yarnSeasonID = yarnDataDraft.yarnSeasonID;// 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024 
  const yarnID = yarnDataDraft.yarnID;
  const orderIDs = yarnDataDraft.orderID;  // ## array orderID
  const orderID = orderIDs.length>0?orderIDs[0]:'';
  const colorS = yarnDataDraft.colorS;
  // console.log(companyID, factoryID, customerID ,yarnID, orderID, colorS);  yarnUsage_id

  const setName = yarnDataDraft.yarnDataInfo.setName;
  const yarnDataUUID = yarnDataDraft.yarnDataInfo.yarnDataUUID;
  const yarnColorID = yarnDataDraft.yarnDataInfo.yarnColorID;
  const yarnUsage_id = yarnDataDraft.yarnDataInfo.yarnUsage_id;
  const type = yarnDataDraft.yarnDataInfo.type;  // ## 'receive' 
  const fromFactoryID = yarnDataDraft.yarnDataInfo.fromFactoryID;
  const toFactoryID = yarnDataDraft.yarnDataInfo.toFactoryID;
  const invoiceID = yarnDataDraft.yarnDataInfo.packageInfo.invoiceID;
  const yarnLotID = yarnDataDraft.yarnDataInfo.packageInfo.yarnLotID;
  const yarnLotUUID = yarnDataDraft.yarnDataInfo.packageInfo.yarnLotUUID;
  const yuUUID = yarnDataDraft.yarnDataInfo.packageInfo.yuUUID;
  const state = yarnDataDraft.yarnDataInfo.packageInfo.state;

  // console.log(data); 
  // console.log(factoryID);
  // console.log(yarnID, orderIDs, setName , uuid , customerID, yuUUID, yarnUsage_id);
  // console.log(yarnDataUUID, yarnColorID, type ,fromFactoryID, toFactoryID, invoiceID, yarnLotID, yarnLotUUID, yuUUID, state);
  const usageMode = 't';
  let session = await mongoose.startSession();
  try {
    await session.withTransaction(async (session) => {

      
      // ## get yarnBoxInfo from YarnLotUsage by _id
      let yarnBoxInfo = [];
      let boxIDArr = [];
      let boxUUIDArr = [];
      let yarnUsage_idArr = [];
      
      const yarnLotUsage1 = await ShareFunc.getYarnUsage_YarnBoxInfo_By_id(companyID, customerID, yarnSeasonID, yarnID, uuid, yarnColorID, yarnDataUUID, 
            invoiceID, yuUUID, yarnLotID, usageMode, yarnLotUUID, fromFactoryID, toFactoryID, orderID, yarnUsage_id);
      // console.log(companyID, customerID, yarnSeasonID, yarnID, uuid, yarnColorID, yarnDataUUID, 
      //         invoiceID, yuUUID, yarnLotID, usageMode, yarnLotUUID, fromFactoryID, toFactoryID, orderID);
      // console.log(yarnLotUsage1);

      if (yarnLotUsage1.length > 0) {
        yarnBoxInfo = yarnLotUsage1[0].yarnBoxInfo;
        // console.log(yarnBoxInfo);
        // new ObjectId(yarnUsage_id)
        await this.asyncForEach4(yarnBoxInfo, async (item1) => {
          boxUUIDArr.push(item1.boxUUID);
          boxIDArr.push(item1.boxID);
          // yarnUsage_idArr.push(new ObjectId(item1._id));
        });
        // console.log(boxUUIDArr);
        // console.log(boxIDArr);


        // ## rollback, cancel back to center
        const factoryIDCenter = '*';  // ## *= available in center store
        const yarnLotIDUpdate1 = await YarnData.updateOne(
          {$and: [
            {"companyID":companyID},
            // {"factoryID":factoryID},
            {"customerID":customerID},
            {"yarnSeasonID":yarnSeasonID},
            {"uuid":uuid},
            {"yarnID":yarnID},
          ]},
          { 
            $set: { 
              "yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo.$[elem3].factoryID" : factoryIDCenter,
              "yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo.$[elem3].yarnTransferWeight" : 0},
            // $set: { "yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo.$[elem3].yarnTransferWeight" : 0 },
          },
          {
            multi: true,
            arrayFilters: [  
              {
                "elem.yarnDataUUID": yarnDataUUID ,
                "elem.yarnColorID": yarnColorID , 
                "elem.type": type , 
                // "elem.toFactoryID": toFactoryID ,
              },
              {
                "elem2.yarnLotUUID": yarnLotUUID,
                "elem2.yarnLotID": yarnLotID,
              },
              {
                // "elem3.factoryID": fromFactoryID,
                "elem3.boxUUID": {$in: boxUUIDArr},
                // "elem3._id": {$in: yarnUsage_idArr},
              }
          ]}).session(session);

        
          // console.log(companyID, factoryID, customerID , yarnSeasonID , yarnID, uuid, yarnColorID);
          // console.log(yuUUID, yarnLotID, yarnLotUUID , invoiceID , usageMode, fromFactoryID, toFactoryID, orderID);
          // ## update YarnLotUsage
          const result1 = await YarnLotUsage.updateOne(
            // { $addFields: {
            //   "useWeight"  : { "$add": [ "$value",  NumberDecimal(0.10) ] },
            // }},
            {$and: [
              {"companyID":companyID},
           //   {"factoryID":factoryID},
              {"customerID":customerID},
              {"yarnSeasonID":yarnSeasonID},
              {"yarnID":yarnID},
              {"yarnDataUUID":yarnDataUUID},
              {"uuid":uuid},
              {"yarnColorID":yarnColorID}, 
            ]}, 
            {
              $pull: {
                yarnUsage: {
                  "yuUUID": yuUUID,
                  "yarnLotID": yarnLotID,
                  "yarnLotUUID": yarnLotUUID,
                  "invoiceID": invoiceID,
                  "usageMode": usageMode,
                  "_id": new ObjectId(yarnUsage_id),
                  "usageInfo.fromFactoryID": fromFactoryID,
                  "usageInfo.toFactoryID": toFactoryID,
                  "usageInfo.orderID": orderID,
                  // "productBarcode":{$in: productBarcodes}, 
                  // "bundleNo":{$in: bundleNos}, 
                  // "numberFrom": { $gte: no1 } , 
                  // "numberTo": { $lte: no2 }
                }
              }
            }).session(session);
      }

      await session.commitTransaction();
      session.endSession();
    });

    // ## get  YarnUsageTransfer  after cancelled
    const yarnTransferUsage = await ShareFunc.getCFYarnUsageTransfer(companyID, toFactoryID, customerID, yarnSeasonID, yarnID, usageMode);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},  
      yarnTransferUsage: yarnTransferUsage,
    });
  } catch (err) {
    console.log(err);
    // await session.abortTransaction(); 
    // await session2.abortTransaction(); 
    await session.abortTransaction(); 
    // session.endSession();
    // session2.endSession();
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry011', 
        mode:'errYarnLotTransfer', 
        value: "error yarn lotID edit transfer"
      },
    });
  }  finally {
    // session.endSession();
    // session2.endSession();
    session.endSession();
  }
}

// // ## putYarnLotTransferCF
// router.put("/yarnlot/CF/transfer", checkAuth, checkUUID, yarnController.putYarnLotTransferCF);
exports.putYarnLotTransferCF = async (req, res, next) => {
  // console.log('putEditYarnLotIDDevide');
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const yarnDataDraft = data.yarnDataDraft;
  const yarnLotUsage1 = data.yarnLotUsage1;
  const yarnUsage1 = data.yarnUsage1;
  const orderIDTransfer = data.orderIDTransfer;

  const companyID = yarnDataDraft.companyID;
  const factoryID = yarnDataDraft.factoryID;
  const customerID = yarnDataDraft.customerID;
  const uuid = yarnDataDraft.uuid;
  const yarnSeasonID = yarnDataDraft.yarnSeasonID;// 2024SS
  const season = yarnSeasonID.substr(0, 4);  // 2024 
  const yarnID = yarnDataDraft.yarnID;
  const orderID = yarnDataDraft.orderID;  // ## array orderID
  const colorS = yarnDataDraft.colorS;
  // console.log(companyID, factoryID, customerID ,yarnID, orderID, colorS);

  const yarnDataUUID = yarnDataDraft.yarnDataInfo.yarnDataUUID;
  const yarnColorID = yarnDataDraft.yarnDataInfo.yarnColorID;
  const type = yarnDataDraft.yarnDataInfo.type;  // ## 'receive' 
  const fromFactoryID = yarnDataDraft.yarnDataInfo.fromFactoryID;
  const toFactoryID = yarnDataDraft.yarnDataInfo.toFactoryID;
  const invoiceID = yarnDataDraft.yarnDataInfo.packageInfo.invoiceID;
  const yarnLotID = yarnDataDraft.yarnDataInfo.packageInfo.yarnLotID;
  const yarnLotUUID = yarnDataDraft.yarnDataInfo.packageInfo.yarnLotUUID;
  const state = yarnDataDraft.yarnDataInfo.packageInfo.state;
  
  // console.log(factoryID);
  // console.log(yarnDataUUID, yarnColorID, type ,fromFactoryID, toFactoryID, invoiceID, yarnLotID, yarnLotUUID, state);

  // console.log(yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo);
  const yarnBoxInfo01 = [...yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo];
  const yarnBoxInfo = yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo;
  let boxUUIDArr = [];
  await this.asyncForEach(yarnBoxInfo, async (item1) => {
    item1.yarnWeightNet = item1.useWeight;
    boxUUIDArr.push(item1.boxUUID);
  });
  // console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
  // console.log(yarnBoxInfo, boxUUIDArr);

  // ## gen yarnBoxInfo for yarnUsage
  let yarnBoxInfoUsage = [];
  await this.asyncForEach(yarnBoxInfo, async (item1) => {
    let yarnBoxInfo1 = {};
    yarnBoxInfo1.factoryID = toFactoryID;
    yarnBoxInfo1.boxID = item1.boxID;
    yarnBoxInfo1.boxUUID = item1.boxUUID;
    if (item1.coneQty) { yarnBoxInfo1.coneQty = item1.coneQty; }
    if (item1.yarnWeight) { yarnBoxInfo1.yarnWeight = item1.yarnWeight; }
    if (item1.useWeight) { 
      yarnBoxInfo1.useWeight = item1.useWeight;
      yarnBoxInfo1.yarnTransferWeight = item1.useWeight;
    }
    // if (item1.yarnTransferWeight) { yarnBoxInfo1.yarnTransferWeight = item1.yarnTransferWeight; }
    if (item1.yarnWeightNet) { yarnBoxInfo1.yarnWeightNet = item1.yarnWeightNet; }
    yarnBoxInfoUsage.push(yarnBoxInfo1);
  });
  // console.log(yarnBoxInfoUsage);

  const datetime = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const current2 = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD 08:00:ss+07:00'));

  // console.log(yarnBoxInfo, boxUUIDArr);

  // return res.status(501).json({
  //   message: {
  //     messageID: 'erry011', 
  //     mode:'errYarnLotTransfer', 
  //     value: "error yarn lotID edit transfer"
  //   },
  // });

  // console.log('------------------------------------------------------------------------------------------');
  // console.log(yarnDataDraft);
  // console.log( yarnLotUsage1);
  // console.log('..................................................................................');
  // console.log( yarnUsage1);

  // console.log(yarnID, yarnColorID, yarnLotID, yarnLotUUID, type, factoryIDBox);
  // console.log(boxID, boxSign, boxNew);

  // let session = await mongoose.startSession();
  // let session2 = await mongoose.startSession();
  let session = await mongoose.startSession();
  // session.startTransaction();
  // session2.startTransaction();
  // session3.startTransaction();
  try {

    await session.withTransaction(async (session) => {

      // ## check exist and weight correct all box
      const yarnDataBox = await ShareFunc.getYarnLotBoxLists(companyID, yarnSeasonID, yarnID, uuid, yarnColorID, invoiceID, yarnLotID, yarnLotUUID, type, boxUUIDArr);
      // console.log('------------------------------------------------------------------------------------------');
      // console.log(yarnDataBox);
      let boxDataErr = false;
      let useWeight = 0.00;
      await this.asyncForEach(yarnBoxInfo, async (item1) => {
        const yarnDataBoxF = yarnDataBox.filter(i=> i.boxUUID === item1.boxUUID);
        if (yarnDataBoxF.length === 1) {
          const useWeight1 = yarnDataBoxF[0].useWeight;
          if (useWeight1 !== item1.useWeight) {
            boxDataErr = true;
          } else {
            useWeight = useWeight + item1.useWeight;
          }
        } else  {
          boxDataErr = true;
        }
      });
      // console.log('boxDataErr == ' , boxDataErr);

      


      // ## no have any err , can edit
      if (!boxDataErr) {  // ## no have any err , can edit
        // console.log('boxDataErr == ' , boxDataErr);
        // ## edit box all to (new) toFactoryID
        const yarnLotIDUpdate1 = await YarnData.updateOne(
          {$and: [
            {"companyID":companyID},
            // {"factoryID":factoryID},
            // {"customerID":customerID},
            {"yarnSeasonID":yarnSeasonID},
            {"uuid":uuid},
            {"yarnID":yarnID},
          ]},
          { 
            // $push: {"yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo" : yarnBoxInfo},  // yarnPlanWeight
            $set: { "yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo.$[elem3].factoryID" : toFactoryID},
            // $set: { "yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo.$[elem3].yarnTransferWeight" : 0 },
          },
          {
            multi: true,
            arrayFilters: [  
              {
                "elem.yarnDataUUID": yarnDataUUID ,
                "elem.yarnColorID": yarnColorID , 
                "elem.type": type , 
                // "elem.toFactoryID": toFactoryID , 
              },
              {
                "elem2.yarnLotUUID": yarnLotUUID,
                "elem2.yarnLotID": yarnLotID,
              },
              {
                "elem3.factoryID": fromFactoryID,
                "elem3.boxUUID": {$in: boxUUIDArr}
              }
          ]}
          // );
          ).session(session);


        // ## push new element for yarnLotUsage.yarnUsage
        const yarnUsage01 = {
          datetime: datetime,
          datetimeIssue: current2,
          yuUUID: uuidv4(),
          
          yarnLotID: yarnLotID,
          yarnLotUUID: yarnLotUUID,
          invoiceID: invoiceID,
          usageMode: 't',  // ## transfer
          yarnWeight: useWeight,
          yarnWeightNet: 0,
          useWeight: useWeight,
          yarnBoxInfo: yarnBoxInfoUsage,
          usageInfo: {
            fromFactoryID: fromFactoryID,
            toFactoryID: toFactoryID,
            setFactoryID: [fromFactoryID, toFactoryID],
            orderID: orderIDTransfer,
          },
        };
        const result1 = await YarnLotUsage.updateOne(
          {$and: [
            {"companyID":companyID},
            {"factoryID":factoryID},
            {"customerID":customerID},
            {"yarnSeasonID":yarnSeasonID},
            {"yarnID":yarnID},
            {"yarnDataUUID":yarnDataUUID},
            {"uuid":uuid},
            {"yarnColorID":yarnColorID},
            // {"status":status1}, 
          ]}, 
          {
            // $push: {queueInfo: {$each:queueInfo,  $position: 0}}  // ## add new element at the first
            $push: {"yarnUsage": yarnUsage01},
          },
          // {upsert: true});
          {upsert: true}).session(session);



          // console.log(yarnBoxInfo01);
        let t2 = 0;
        let yarnLotIDUpdateX = []
        await this.asyncForEach(yarnBoxInfo01, async (item1) => {
          yarnLotIDUpdateX[t2] = await YarnData.updateOne(
            {$and: [
              {"companyID":companyID},
              // {"factoryID":factoryID},
              // {"customerID":customerID},
              {"yarnSeasonID":yarnSeasonID},
              {"uuid":uuid},
              {"yarnID":yarnID},
            ]},
            { 
              // $push: {"yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo" : yarnBoxInfo},  // item1.useWeight
              // $set: { "yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo.$[elem3].factoryID" : toFactoryID },
              $set: { "yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo.$[elem3].yarnTransferWeight" : item1.useWeight },
            },
            {
              multi: true,
              arrayFilters: [  
                {
                  "elem.yarnDataUUID": yarnDataUUID ,
                  "elem.yarnColorID": yarnColorID , 
                  "elem.type": type , 
                  // "elem.toFactoryID": toFactoryID , 
                },
                {
                  "elem2.yarnLotUUID": yarnLotUUID,
                  "elem2.yarnLotID": yarnLotID,
                },
                {
                  "elem3.boxID": item1.boxID,
                  "elem3.boxUUID": item1.boxUUID
                }
            ]}
            // );
            ).session(session);
            t2++;
        });

      } else {  // ## have any err , cannot edit
        // await session.abortTransaction(); 
        // await session2.abortTransaction(); 
        await session.abortTransaction(); 
        // session.endSession();
        // session2.endSession();
        session.endSession();
        return res.status(501).json({
          message: {
            messageID: 'erry011', 
            mode:'errYarnLotTransfer', 
            value: "error yarn lotID edit transfer"
          },
        });
      }

      // await session.commitTransaction();
      // await session2.commitTransaction();
      // session.endSession();
      // session2.endSession();
      await session.commitTransaction();
      session.endSession();
    });

    // const yarnLotInfo = await ShareFunc.getYarnLotInfoByYarnLotID(companyID, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type);
    
    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},
      // yarnLotInfo: yarnLotInfo,
      // yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      // yarnPlanDateGroup: yarnPlanDateGroup
      
    });
  } catch (err) {
    console.log(err);
    // await session.abortTransaction(); 
    // await session2.abortTransaction(); 
    await session.abortTransaction(); 
    // session.endSession();
    // session2.endSession();
    session.endSession();
    return res.status(501).json({
      message: {
        messageID: 'erry011', 
        mode:'errYarnLotTransfer', 
        value: "error yarn lotID edit transfer"
      },
    });
  }  finally {
    // session.endSession();
    // session2.endSession();
    session.endSession();
  }
}



// // // ## get product list /api/product/getlist1/:companyID/:userID/:productID
// // router.get("/getlist1/:companyID/:userID/:productID", checkAuth, checkUUID, productController.getProduct);
// exports.getProduct = async (req, res, next) => {
//   // try {} catch (err) {}
//   const companyID = req.params.companyID;
//   const userID = req.params.userID;
//   const productID = req.params.productID;
//   try {
//     // console.log(companyID, productID);
//     // ## get 1 product
//     // exports.getProduct= async (companyID, productID) 
//     const product = await ShareFunc.getProduct(companyID, productID);

//     await ShareFunc.upsertUserSession1hr(userID);
//     const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
//     res.status(200).json({
//       token: token,
//       expiresIn: process.env.expiresIn,
//       userID: userID,
//       product: product
//     });

//   } catch (err) {
//     console.log(err);
//     return res.status(501).json({
//       message: {
//         messageID: 'errp003', 
//         mode:'errProduct1', 
//         value: "error get product 1"
//       }
//     });
//   }
// }



// // ## /api/product/creataenew
// // ## router.post("/createnew", userController.postProductCreateNew);
// exports.postProductCreateNew = async (req, res, next) => {
//   const data = req.body;
//   // try {} catch (err) {}
//   // companyID userID page limit
//   // console.log('postProductCreateNew');
  
//   try {
//     // ##  create product   productCustomerCode
//     const companyID = data.product.companyID;
//     const productID = data.product.productID;
//     const productName = data.product.productName;
//     const productDetail = data.product.productDetail;
//     const productGroupCode = data.product.productGroupCode;
//     const productCustomerCode = data.product.productCustomerCode;
//     const productFeature = [];
    
//     const imageProfile = data.product.imageProfile;
//     const pdPic = data.product.pdPic;
//     // const productsize = data.product.productsize;
//     // const productcolorSet = data.product.productcolorSet;

//     const productUpsert = await Product.updateOne({$and: [
//         {"companyID":companyID},
//         {"productID":productID}, 
//       ]} , 
//       {
//         "productName": productName,
//         "productDetail": productDetail,
//         "productGroupCode": productGroupCode,
//         "productCustomerCode": productCustomerCode,
//         "productFeature": productFeature,
//         "imageProfile": imageProfile,
//         "pdPic": pdPic,
//         // "productsize": productsize,
//         // "productcolorSet": productcolorSet
//       }, {upsert: true}); 

//     // ## get 1 product
//     // exports.getProduct= async (companyID, productID) 
//     const product = await ShareFunc.getProduct(companyID, productID);

//     await ShareFunc.upsertUserSession1hr(data.userID);
//     const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
//     res.status(200).json({
//       token: token,
//       expiresIn: process.env.expiresIn,
//       userID: data.userID,
//       product: product
//     });
//   } catch (err) {
//     return res.status(501).json({
//       message: {
//         messageID: 'errp002', 
//         mode:'errCreateProduct', 
//         value: "create product error"
//       }
//     });
//   }

// }

// // // ## /api/product/edit
// // router.put("/edit", checkAuth, checkUUID, productController.putEditProduct);
// exports.putEditProduct = async (req, res, next) => {
//   const data = req.body;
//   // try {} catch (err) {}
//   // companyID userID page limit
//   // console.log('postProductCreateNew');
  
//   try {
//     const userID = req.userData.tokenSet.userID;
//     // ##  create product   productCustomerCode
//     const companyID = data.product.companyID;
//     const productID = data.product.productID;
//     const productName = data.product.productName;
//     const productDetail = data.product.productDetail;
//     const productGroupCode = data.product.productGroupCode;
//     const productCustomerCode = data.product.productCustomerCode;
//     const productFeature = data.product.productFeature;
    
//     const imageProfile = data.product.imageProfile;
//     const pdPic = data.product.pdPic;
//     // const productsize = data.product.productsize;
//     // const productcolorSet = data.product.productcolorSet;

//     const productUpsert = await Product.updateOne({$and: [
//         {"companyID":companyID},
//         {"productID":productID}, 
//       ]} , 
//       {
//         "productName": productName,
//         "productDetail": productDetail,
//         "productGroupCode": productGroupCode,
//         "productCustomerCode": productCustomerCode,
//         "productFeature": productFeature,
//         // "imageProfile": imageProfile,
//         // "pdPic": pdPic,
//         // "productsize": productsize,
//         // "productcolorSet": productcolorSet
//       }); 

//     // ## get 1 product
//     // exports.getProduct= async (companyID, productID) 
//     // console.log(companyID, productID);
//     const product = await ShareFunc.getProduct(companyID, productID);

//     await ShareFunc.upsertUserSession1hr(userID);
//     const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
//     res.status(200).json({
//       token: token,
//       expiresIn: process.env.expiresIn,
//       userID: userID,
//       product: product
//     });
//   } catch (err) {
//     return res.status(501).json({
//       message: {
//         messageID: 'errp005', 
//         mode:'errEditProduct', 
//         value: "Edit product error"
//       }
//     });
//   }
// }

// // // ## /api/product/get/image/profiles  postGetProductImageProfile
// // router.post("/get/image/profiles", checkAuth, checkUUID, productController.postGetProductImageProfiles);
// exports.postGetProductImageProfiles = async (req, res, next) => {
//   // try {} catch (err) {}
//   const data = req.body;
//   const companyID = data.companyID;
//   const productIDs = data.productIDs;
//   // console.log(data);
//   try {
//     // exports.getProductImageProfiles= async (companyID, productIDs)
//     const productImageProfiles = await ShareFunc.getProductImageProfiles(companyID, productIDs);
//     // console.log(productImageProfiles);

//     await ShareFunc.upsertUserSession1hr(data.userID);
//     const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
//     res.status(200).json({
//       token: token,
//       expiresIn: process.env.expiresIn,
//       userID: data.userID,
//       productImageProfiles: productImageProfiles
//     });
//   } catch (err) {
//     return res.status(501).json({
//       message: {
//         messageID: 'errp004', 
//         mode:'errGetProductImageProfiles', 
//         value: "err get product image profiles"
//       }
//     });
//   }
// }

// ## yarn
// #############################################################