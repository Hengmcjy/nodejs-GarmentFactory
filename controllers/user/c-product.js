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



// ## general
// #######################################################################################################

// #######################################################################################################
// ## product

// // ## get product list /api/product/getlist1/:companyID/:userID/:productID
// router.get("/getlist1/:companyID/:userID/:productID", checkAuth, checkUUID, productController.getProduct);
exports.getProduct = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const productID = req.params.productID;
  try {
    // console.log(companyID, productID);
    // ## get 1 product
    // exports.getProduct= async (companyID, productID) 
    const product = await ShareFunc.getProduct(companyID, productID);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      product: product
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errp003', 
        mode:'errProduct1', 
        value: "error get product 1"
      }
    });
  }
}

// // ## get product list /api/product/getlist/:companyID/:userID/:page/:limit
// router.get("/getlist/:companyID/:userID/:page/:limit", checkAuth, checkUUID, productController.getProducts);
exports.getProducts = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const userID = req.params.userID;
  const page = +req.params.page;
  const limit = +req.params.limit;
  // console.log('getProducts', page, limit);

  
  try {
    // getProducts= async (companyID, page, limit)
    const products = await ShareFunc.getProducts(companyID, page, limit);
    const productsCount = await ShareFunc.getProductsCount(companyID);

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      products: products,
      productsCount: productsCount
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errp001', 
        mode:'errProductList', 
        value: "error get product list"
      }
    });
  }
}

// ## /api/product/creataenew
// ## router.post("/createnew", userController.postProductCreateNew);
exports.postProductCreateNew = async (req, res, next) => {
  const data = req.body;
  // try {} catch (err) {}
  // companyID userID page limit
  // console.log('postProductCreateNew');
  
  try {
    // ##  create product   productCustomerCode
    const companyID = data.product.companyID;
    const productID = data.product.productID;
    const productName = data.product.productName;
    const productDetail = data.product.productDetail;
    const productGroupCode = data.product.productGroupCode;
    const productCustomerCode = data.product.productCustomerCode;
    const productFeature = [];
    
    const imageProfile = data.product.imageProfile;
    const pdPic = data.product.pdPic;
    // const productsize = data.product.productsize;
    // const productcolorSet = data.product.productcolorSet;

    const productUpsert = await Product.updateOne({$and: [
        {"companyID":companyID},
        {"productID":productID}, 
      ]} , 
      {
        "productName": productName,
        "productDetail": productDetail,
        "productGroupCode": productGroupCode,
        "productCustomerCode": productCustomerCode,
        "productFeature": productFeature,
        "imageProfile": imageProfile,
        "pdPic": pdPic,
        // "productsize": productsize,
        // "productcolorSet": productcolorSet
      }, {upsert: true}); 

    // ## get 1 product
    // exports.getProduct= async (companyID, productID) 
    const product = await ShareFunc.getProduct(companyID, productID);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      product: product
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errp002', 
        mode:'errCreateProduct', 
        value: "create product error"
      }
    });
  }

}

// // ## /api/product/edit
// router.put("/edit", checkAuth, checkUUID, productController.putEditProduct);
exports.putEditProduct = async (req, res, next) => {
  const data = req.body;
  // try {} catch (err) {}
  // companyID userID page limit
  // console.log('putEditProduct');
  
  try {
    const userID = req.userData.tokenSet.userID;
    // ##  create product   productCustomerCode
    const companyID = data.product.companyID;
    const productID = data.product.productID;
    const productName = data.product.productName;
    const seasonYear = data.product.seasonYear;
    const productDetail = data.product.productDetail;
    const productGroupCode = data.product.productGroupCode;
    const productCustomerCode = data.product.productCustomerCode;
    const productFeature = data.product.productFeature;
    
    const imageProfile = data.product.imageProfile;
    const pdPic = data.product.pdPic;
    // const productsize = data.product.productsize;
    // const productcolorSet = data.product.productcolorSet;

    const productUpsert = await Product.updateOne({$and: [
        {"companyID":companyID},
        {"productID":productID}, 
      ]} , 
      {
        "productName": productName,
        "productDetail": productDetail,
        "productGroupCode": productGroupCode,
        "productCustomerCode": productCustomerCode,
        "productFeature": productFeature,
        "seasonYear": seasonYear,
        // "pdPic": pdPic,
        // "productsize": productsize,
        // "productcolorSet": productcolorSet
      }); 

    // ## get 1 product
    // exports.getProduct= async (companyID, productID) 
    // console.log(companyID, productID);
    const product = await ShareFunc.getProduct(companyID, productID);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      product: product
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errp005', 
        mode:'errEditProduct', 
        value: "Edit product error"
      }
    });
  }
}

// // ## /api/product/get/image/profiles  postGetProductImageProfile
// router.post("/get/image/profiles", checkAuth, checkUUID, productController.postGetProductImageProfiles);
exports.postGetProductImageProfiles = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const companyID = data.companyID;
  const productIDs = data.productIDs;
  // console.log(data);
  try {
    // exports.getProductImageProfiles= async (companyID, productIDs)
    const productImageProfiles = await ShareFunc.getProductImageProfiles(companyID, productIDs);
    // console.log(productImageProfiles);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      productImageProfiles: productImageProfiles
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errp004', 
        mode:'errGetProductImageProfiles', 
        value: "err get product image profiles"
      }
    });
  }
}

// ## product
// #############################################################