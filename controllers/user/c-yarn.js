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
const YarnSeason = require("../../models/m-yarnSeason");
const YarnColor = require("../../models/m-yarnColor");
const YarnSupplier = require("../../models/m-yarnSupplier");
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
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  // const page = +req.params.page;
  // const limit = +req.params.limit;
  // console.log('getProducts');

  
  try {
    // getProducts= async (companyID, page, limit)
    const yarns = await ShareFunc.getYarns(companyID);
    const yarnsCount = await ShareFunc.getYarnsCount(companyID);

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
  const season = yarnSeason.substr(0, 4);  // 2024
  // const page = +req.params.page;
  // const limit = +req.params.limit;
  // console.log('getProducts');
  // console.log(setName);
  try {

    const uuid = uuidv4();
    
    // getProducts= async (companyID, page, limit)
    const yarns = await ShareFunc.getYarnCuss(companyID, customerID);
    const yarnsCount = await ShareFunc.getYarnCussCount(companyID, customerID);

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

  try {

    // const yarnPlan = await ShareFunc.getYarnPlanMainLists(companyID, factoryID, customerID, yarnSeasonID, status);
    const yarnPlan = await ShareFunc.getYarnPlanMainList(companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, status);
    
    const uuidArr = [uuid];
    // const type1 = ['plan'];
    const yarnPlanDateGroup = await ShareFunc.getYarnPlanDateGroup(
        companyID, factoryID, customerID, yarnSeasonID, uuidArr, type
    );

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
      yarnPlanDateGroup: yarnPlanDateGroup
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
  // console.log('getProducts');
  // console.log(setName);
  try {

    const yarns = await ShareFunc.getYarnCuss(companyID, customerID);
    const yarnsCount = await ShareFunc.getYarnCussCount(companyID, customerID);

    const yarnPlans = await ShareFunc.getYarnPlanMainLists(companyID, factoryID, customerID, yarnSeasonID, status);
    const yarnPlansCount = await ShareFunc.getYarnPlanMainCount(companyID, factoryID, customerID, yarnSeasonID, status);

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



    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    await session.commitTransaction();
    session.endSession();

    const status1 = ['open'];
    const yarnPlan = await ShareFunc.getYarnPlanMainList(companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, status1);

    const uuidArr = [uuid];
    const type1 = ['plan'];
    const yarnPlanDateGroup = await ShareFunc.getYarnPlanDateGroup(
        companyID, factoryID, customerID, yarnSeasonID, uuidArr, type1
    );

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      yarnPlanDateGroup: yarnPlanDateGroup
      
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
      yarnPlanDateGroup: yarnPlanDateGroup
      
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
      yarnPlanDateGroup: yarnPlanDateGroup
      
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

  const yarnLotID = data.yarnLotID;
  let yarnBoxInfo = data.yarnBoxInfo;

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
  session.startTransaction();
  try {
    // ## check existed
    const yarnPackingList = await ShareFunc.getYarnPlanDataInfo2(
      companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, yarnDataUUID, yarnColorID, type, toFactoryID
    );
    if (yarnPackingList.length > 0) {
      await this.asyncForEach(yarnBoxInfo, async (item1) => {
        item1.boxUUID = uuidv4();
      });
      const state = 'wait';
      let packageInfo = {
        yarnLotID: yarnLotID,
        yarnLotUUID: uuidv4(),
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
      yarnPlanDateGroup: yarnPlanDateGroup
      
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
  

  // console.log(yarnDataUUID, yarnColorID, yarnLotUUID);

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
          item1.boxUUID = uuidv4();
        }
      });
      // const state = 'wait';
      // let packageInfo = {
      //   yarnLotID: yarnLotID,
      //   yarnLotUUID: uuidv4(),
      //   state: state,
      //   yarnBoxInfo: yarnBoxInfo
      // };
      // console.log(packageInfo);

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
        { $set: { 
          "yarnDataInfo.$[elem].packageInfo.$[elem2].yarnBoxInfo" : yarnBoxInfo 
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

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true,
      message: {},
      yarnPlan: yarnPlan.length>0?yarnPlan[0]:undefined,
      yarnPlanDateGroup: yarnPlanDateGroup
      
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