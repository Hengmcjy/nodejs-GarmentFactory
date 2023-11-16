const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');

const io = require('../../socket');

const ShareFunc = require("../c-api-app-share-function");

const User = require("../../models/m-user");
const Company = require("../../models/m-company");
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
// ## customer

// // ## get customer1 /api/customer/getlist1/:companyID/:userID/:customerID    getCustomer
// router.get("/getlist1/:companyID/:userID/:customerID", checkAuth, checkUUID, cusController.getCustomer);
exports.getCustomer = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const customerID = req.params.customerID;

  try {
    // ## get 1 customer
    // exports.getCustomer= async (companyID, customerID)
    const customer = await ShareFunc.getCustomer(companyID, customerID);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      customer: customer
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errcus003', 
        mode:'errcustomerList1', 
        value: "error get customer 1"
      }
    });
  }
}


// // ## get customer list /api/customer/getlist/:companyID/:userID/:page/:limit   getCustomers
// router.get("/getlist/:companyID/:userID/:page/:limit", checkAuth, checkUUID, cusController.getCustomers);
exports.getCustomers = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const page = +req.params.page;
  const limit = +req.params.limit;

  try {
    // exports.getCustomers= async (companyID, page, limit)
    const customers = await ShareFunc.getCustomers(companyID, page, limit);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      customers: customers,
      // factory: factory
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errcus001', 
        mode:'errCustomerList', 
        value: "error get customer list"
      }
    });
  }
}

// // ## /api/customer/creataenew      postCustomerCreateNew
// router.post("/createnew", checkAuth, checkUUID, cusController.postCustomerCreateNew);
exports.postCustomerCreateNew = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    // ##  create customer   imageProfile
    const companyID = data.customer.companyID;
    // let customerID = data.customer.customerID;
    const customerName = data.customer.customerName;
    const registDate = current;
    const imageProfile = data.customer.imageProfile;
    const cusInfo = data.customer.cusInfo;
    const userID = data.customer.userID;
    const userName = data.customer.userName;
    // cusInfo.createBy.userID = userID;
    // cusInfo.createBy.userName = userName;

    // ## find control app
    const controlApp = await ShareFunc.getControlApp();
    // console.log(controlApp);

    let customerRunID = controlApp.customerRunID + 1;
    let customerID = 'ctm' + await ShareFunc.setStrLen(process.env.customerIDLen,customerRunID);
    let customerDocf = await Customer.findOne({$and: [{"customerID":customerID}, {"companyID":companyID}]});
    while (customerDocf){
      customerDocf = await Customer.findOne({$and: [{"customerID":customerID}, {"companyID":companyID}]});
      customerRunID++;
      customerID = 'ctm' + await ShareFunc.setStrLen(process.env.customerIDLen,customerRunID);
    }

    const customerUpsert = await Customer.updateOne({$and: [
        {"companyID":companyID},
        {"customerID":customerID}, 
      ]} , 
      {
        "customerName": customerName,
        "setName": customerName,
        "registDate": registDate,
        "imageProfile": imageProfile,
        "cusInfo": cusInfo,
      }, {upsert: true}); 


    // ## update control app  exports.updateControlAppCustomerRunID= async (appID, customerRunID) --> customerRunID
    await ShareFunc.updateControlAppCustomerRunID(process.env.APPNAME, +customerRunID);

    // ## get 1 customer
    // exports.getCustomer= async (companyID, customerID) 
    const customer = await ShareFunc.getCustomer(companyID, customerID);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      customer: customer
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errcus002', 
        mode:'errCreateCustomer', 
        value: "create customer error"
      }
    });
  }
}

// ## customer
// #############################################################