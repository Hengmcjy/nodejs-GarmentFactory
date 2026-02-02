const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');

const io = require('../../socket');
const { v4: uuidv4 } = require('uuid');

const ShareFunc = require("../c-api-app-share-function");

// ## www zone
const WInfo = require("../../models/m-winfo");
const WProduct = require("../../models/m-wproduct");

const User = require("../../models/m-user");
const Company = require("../../models/m-company");
const Factory = require("../../models/m-factory");
const Product = require("../../models/m-product");

const TargetPlace = require("../../models/m-targetPlace");
const Color = require("../../models/m-color");
const Size = require("../../models/m-size");

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

// ## get  /api/wtailin/getwdata1
exports.getWDataInfo1 = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('getWDataInfo1');
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  try {
    // console.log(companyID, factoryID);


    // getWInfo= async (companyID, factoryID)
    const wInfo = await ShareFunc.getWInfo(companyID, factoryID);
    // console.log(wInfo);

    // // ## www zone
    // const WInfo = require("../../models/m-winfo");
    // const WProduct = require("../../models/m-wproduct");

    // ## get 1 product
    // exports.getProduct= async (companyID, productID) 
    // const product = await ShareFunc.getProduct(companyID, productID);

    // await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: 'token',
      expiresIn: process.env.expiresIn,
      // userID: userID,
      // product: product
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errwtl001', 
        mode:'errWTailin001', 
        value: "error www tailin 001"
      }
    });
  }
}

exports.postEmailContactSend = async (req, res, next) => {
  // try {} catch (err) {}
  // console.log('postEmailContactSend');
  // const companyID = req.params.companyID;
  // const factoryID = req.params.factoryID;
  const data = req.body.dataSent;
  const factory = data.factory;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  // console.log(factory, data);

  const uuid = uuidv4();

  // ## get emails from database   // "heng067@gmail.com, heng@tailin.co.th";
  // getWInfo= async (companyID, factoryID)
  const wInfo = await ShareFunc.getWInfo(companyID, factoryID);
  // console.log(companyID, factoryID, wInfo);

  const email = wInfo[0].companyInfo.emails.toString();
  // console.log(factory, email, uuid, data);
  const tsendmail = await ShareFunc.TestSendMail(factory, email, uuid, data);
  // console.log('OK test sent email   11');
  res.status(200).json({
      message: {
        messageID: 'complete', 
        mode:'complete', 
        value: "send email completed"
      },
      success: true,
      txt: 'ok check'
  });
}


// ## general
// #######################################################################################################

// #######################################################################################################
// ## product


// ## product
// #############################################################