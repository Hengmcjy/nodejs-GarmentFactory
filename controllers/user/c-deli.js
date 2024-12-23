const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');

const io = require('../../socket');

const ShareFunc = require("../c-api-app-share-function");

const User = require("../../models/m-user");
const Company = require("../../models/m-company");
const Factory = require("../../models/m-factory");
// const Product = require("../../models/m-product");

const TargetPlace = require("../../models/m-targetPlace");
const Color = require("../../models/m-color");
const Size = require("../../models/m-size");

const DPacking = require("../../models/m-dPacking");
const DCarton = require("../../models/m-dCarton");
const DCountry = require("../../models/m-dCountry");

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
// ## delivery

// // ## get carton list 
// router.get("/deli1/carton/:companyID", checkAuth, checkUUID, productController.getDCartons);
exports.getDCartons = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getDCartons');
  const companyID = req.params.companyID;
  const userID = req.userData.tokenSet.userID;
  // const userID = req.params.userID;
  // const productID = req.params.productID;
  try {
    // console.log(companyID, userID);
    // ## get 1 product
    // exports.getProduct= async (companyID, productID) 
    // const product = await ShareFunc.getProduct(companyID, productID);

    // exports.getDCartons= async (companyID)

    const dCartons = await ShareFunc.getDCartons(companyID);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      dCartons: dCartons
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errdeli001', 
        mode:'errCarton1', 
        value: "error get cartons "
      }
    });
  }
}

// // ## get country list 
// router.get("/deli2/country/:companyID", checkAuth, checkUUID, productController.getDCountries);
exports.getDCountries = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.userData.tokenSet.userID;
  // const userID = req.params.userID;
  // const productID = req.params.productID;
  try {
    // console.log(companyID, productID);
    // ## get 1 product
    // exports.getProduct= async (companyID, productID) 
    // const product = await ShareFunc.getProduct(companyID, productID);

    // exports.getDCounties= async (companyID)
    const dCountries = await ShareFunc.getDCounties(companyID);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      // userID: userID,
      dCountries: dCountries
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errdeli001', 
        mode:'errCpountrys', 
        value: "error get countrys "
      }
    });
  }
}

// router.put("/deli3/carton/update", checkAuth, checkUUID, deliController.putCartonUpdate);
exports.putCartonUpdate = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const companyID = data.companyID;
  const dCarton = data.dCarton;
  // console.log('putCartonUpdate');
  // console.log(productOR);

  try {
    // ##  edit  carton
    const cartonUpdate = await DCarton.updateOne({$and: [
        {"companyID":companyID},
        {"cartonID":dCarton.cartonID}, 
      ]} , 
      {
        "seq": dCarton.seq,
        "cartonName": dCarton.cartonName,
        "cSize": dCarton.cSize,
      }); 

      const dCartons = await ShareFunc.getDCartons(companyID);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      dCartons: dCartons
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errdeli002', 
        mode:'errEditCarton', 
        value: "error edit carton"
      }
    });

  }
}

// router.put("/deli4/country/update", checkAuth, checkUUID, deliController.putCountryUpdate);
exports.putCountryUpdate = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const companyID = data.companyID;
  const dCountry = data.dCountry;
  // console.log('putCountryUpdate');
  // console.log(productOR);

  try {
    // ##  edit  dCountry
    const countryUpdate = await DCountry.updateOne({$and: [
        {"companyID":companyID},
        {"dCountryID":dCountry.dCountryID}, 
      ]} , 
      {
        "seq": dCountry.seq,
        "dCountryName": dCountry.dCountryName,
        // "cSize": dCountry.cSize,
      }); 

      const dCountries = await ShareFunc.getDCounties(companyID);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      dCountries: dCountries
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errdeli003', 
        mode:'errEditCountry', 
        value: "error edit country"
      }
    });

  }
}

// router.post("/deli5/dcarton/createnew", checkAuth, checkUUID, nsController.postDCartonCreateNew);
exports.postDCartonCreateNew = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  // console.log('postDCartonCreateNew');
  // console.log(data);

  try {
    const userID = req.userData.tokenSet.userID;
    // ##  
    const companyID = data.companyID;
    const dCarton = data.dCarton;
    const dCartonID = dCarton.dCartonID;
    // console.log(data);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    // ## check exist for err
    const existedDCartonID = await ShareFunc.checkExistDCartonID(companyID, dCartonID);
    if (!existedDCartonID) {
      const dCartonInsert = await DCarton.updateOne({$and: [
        {"companyID":companyID},
        {"dCartonID":dCartonID}, 
        // {"nodeFlowID":nodeFlowID},
      ]} , 
      {
        "seq": dCarton.seq,
        "cartonName": dCarton.cartonName,
        "cSize": dCarton.cSize,
        "show": dCarton.show,
      }, {upsert: true}); 

      const dCartons = await ShareFunc.getDCartons(companyID);

      res.status(200).json({
        token: token,
        expiresIn: process.env.expiresIn,
        userID: userID,
        dCartons: dCartons,
        // success: true
      });

    } else {  // ## err --> had dCartonID  , existed
      return res.status(422).json({
        message: {
          messageID: 'errdeli005-1', 
          mode:'errDCartonIDExist', 
          value: "error dCartonID existed"
        },
        token: token,
        expiresIn: process.env.expiresIn,
        userID: userID,
        nodeFlows: [],
        success: false
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errdeli005', 
        mode:'errDCartonIDCreate', 
        value: "error dCartonID create"
      }
    });
  }
}

// router.post("/deli6/dcountry/createnew", checkAuth, checkUUID, nsController.postDCountryCreateNew);
exports.postDCountryCreateNew = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  // console.log('postDCountryCreateNew');
  // console.log(data);

  try {
    const userID = req.userData.tokenSet.userID;
    // ##  
    const companyID = data.companyID;
    const dCountry = data.dCountry;
    const dCountryID = dCountry.dCountryID;
    // console.log(data);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    // ## check exist for err
    const existedDCountry = await ShareFunc.checkExistdCountryID(companyID, dCountryID);
    if (!existedDCountry) {
      const dCountryInsert = await DCountry.updateOne({$and: [
        {"companyID":companyID},
        {"dCountryID":dCountryID}, 
        // {"nodeFlowID":nodeFlowID},
      ]} , 
      {
        "seq": dCountry.seq,
        "cartonName": dCountry.dCountryName,
        // "cSize": dCountry.cSize,
        "show": dCountry.show,
      }, {upsert: true}); 

      const dCountries = await ShareFunc.getDCounties(companyID);

      res.status(200).json({
        token: token,
        expiresIn: process.env.expiresIn,
        userID: userID,
        dCountries: dCountries,
        // success: true
      });

    } else {  // ## err --> had dCountryID  , existed
      return res.status(422).json({
        message: {
          messageID: 'errdeli006-1', 
          mode:'errDCountryIDExist', 
          value: "error dCountryID existed"
        },
        token: token,
        expiresIn: process.env.expiresIn,
        userID: userID,
        nodeFlows: [],
        success: false
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errdeli006', 
        mode:'errDCountryIDCreate', 
        value: "error dCountryID create"
      }
    });
  }
}


// router.get("/deli8/dPacking/:companyID/:seasonYear", checkAuth, checkUUID, deliController.getDPackings);
exports.getDPackings = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  const dStatus = JSON.parse(req.params.dStatus);
  const userID = req.userData.tokenSet.userID;
  // const userID = req.params.userID;
  // const productID = req.params.productID;
  // const status = JSON.parse(req.params.status);
  try {
    // console.log(companyID, productID);
    // ## get 1 product
    // exports.getProduct= async (companyID, productID) 
    // const product = await ShareFunc.getProduct(companyID, productID);

    // exports.getDCounties= async (companyID)
    const dPackings = await ShareFunc.getDPackings(companyID, seasonYear, dStatus);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      // userID: userID,
      dPackings: dPackings
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errdeli001', 
        mode:'errCpountrys', 
        value: "error get countrys "
      }
    });
  }
}

// router.post("/deli7/dPacking/createnew", checkAuth, checkUUID, deliController.postDPackingCreateNew);
exports.postDPackingCreateNew = async (req, res, next) => {
  // try {} catch (err) {}
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const data = req.body;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  // console.log('postDPackingCreateNew');
  // console.log(data);
  
  try {
    const userID = req.userData.tokenSet.userID;
    // ##  
    const companyID = data.dPacking.companyID;
    const dPacking = data.dPacking;
    // const dCountryID = dpacking.dCountryID;
    // console.log(data);
    
    const dDate = new Date(moment(dPacking.dDate).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    const productionDate = new Date(moment(dPacking.productionDate).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    const dCountryInsert = await DPacking.updateOne({$and: [
      {"companyID":dPacking.companyID},
      {"seasonYear":dPacking.seasonYear}, 
      {"customerID":dPacking.customerID}, 
      {"orderID":dPacking.orderID}, 
      {"dID":dPacking.dID}, 
      {"dCountryID":dPacking.dCountryID}, 
    ]} , 
    {
      "factoryID": dPacking.factoryID,
      "dStatus": dPacking.dStatus,
      "isLock": dPacking.isLock,
      "isLockDCarton": dPacking.isLockDCarton,

      "seq": dPacking.seq,
      "dDate": dDate,
      "productionDate": productionDate,
      "dInfo": dPacking.dInfo,
      "dCarton": dPacking.dCarton,
    }, {upsert: true}); 

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errdeli007', 
        mode:'errDPackingCreate', 
        value: "error dPacking create",
        success: false
      }
    });
  }
}

// ## delivery
// #############################################################