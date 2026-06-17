const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');
const fs=require('fs');
const path = require("path");

// const Synology = require("synology");

const io = require('../../socket');

const ShareFunc = require("../c-api-app-share-function");


const Menu = require("../../models/m-menu");
const MenuAuthor = require("../../models/m-menuAuthor");

const Useracc = require("../../models/m-acc-user");
const User = require("../../models/m-user");
const UserClass = require("../../models/m-userClass");
const UserGroupScan = require("../../models/m-userGroupScan");
const Company = require("../../models/m-company");
const Factory = require("../../models/m-factory");
const NodeStation = require("../../models/m-nodeStation");

const Order = require("../../models/m-order");
const OrderProduction = require("../../models/m-orderProduction");
const OrderProductionQueueList = require("../../models/m-orderProductionQueueList");
const OrderProductionQueue = require("../../models/m-orderProductionQueue");

const YarnData = require("../../models/m-yarnData");
const YarnLotUsage = require("../../models/m-yarnLotUsage");
const YarnStockCardPCS = require("../../models/m-yarnStockCardPCS");


const UnitSize = require("../../models/m-unitSize");
const UnitWeight = require("../../models/m-unitWeight");

const OrderSubNodeFlowSetCost = require("../../models/m-orderSubNodeFlowSetCost");


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

// #############################################################
// ## user for Acc Fin

exports.createAUser = async (req, res, next) => {
  const logID= 'usu';  // ## user sign up
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  // console.log('createAUser');
  // console.log(req.body);
  // console.log(process.env.JWT_KEY_ACC);

  userDocf = await Useracc.findOne({userID: req.body.userID});
  if (userDocf) {
    return res.status(422).json({
      message: {
        messageID: 'erru001-2', 
        mode:'errSignupUserID', 
        value: "already has userID!"
      }
    });
  }

  const createBy = {
    userID: req.body.userID,
    userName: 'xxxx',
  };

  // project: 'AccFinSystem',  // ## accounting finance system
  const pwd = req.body.pwd+'pwd'+req.body.pwd;
  bcrypt.hash(pwd, 10).then(hash => {
    const user = new Useracc({
      userID: req.body.userID,
      type: 'u',
      uInfo: {
        userName: 'xxxx',
        userPass: hash,
        registDate: current
      },
      status: 'a',
      state: 'userEmail',
      createdAt: current,
      createBy: createBy
    });
    user
    .save()
    .then(result => {

      // ## test socket IO
      io.getIO().emit('messageuser', {
        action: 'sent by socketIO',
        post: { socket: 'IO', creator: { _id: req.body.userID, name: 'namex' } }
      });
      // console.log(req.body.userPass, result);
      res.status(201).json({
        message: "User created!",
        result: result,
        user: user
      });
    })
    .catch(err => {
      // console.log(err.errors);
      res.status(500).json({
        message: {
          messageID: 'erru001', 
          mode:'errsignup', 
          value: "Invalid authentication credentials!"
        }
      });
    });
  });
}

// router.post("/acc/login", userController.userALogin);
exports.userALogin = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log(req.body);
  const logID= 'uli';  // ## user log in
  const body = req.body;
  const tokenSet = body.tokenSet;
  // console.log(tokenSet);
  const userID = req.body.userID;
  const uuidUserNodeLoginWaiting = body.uuidUserNodeLoginWaiting;
  let fetchedUser;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  try {
    const userf = await Useracc.findOne({ userID: userID });
    if (!userf) {
      return res.status(401).json({
        message: {
          messageID: 'erru002', 
          mode:'errLoginFound', 
          value: "Auth failed, userID not found"
        }
      });
    }
    // console.log('fetchedUser');
    const pwd = req.body.userPass+'pwd'+req.body.userPass;
    fetchedUser = userf;
    doMatch = await bcrypt.compare(pwd, userf.uInfo.userPass);
    // console.log('doMatch');
    if (!doMatch) { 
      return res.status(401).json({
        message: {
          messageID: 'erru003', 
          mode:'errLoginPass', 
          value: "Auth failed, password incorrect"
        }
      });
    }
    // ## update user last login
    const userLastLogin = await User.updateOne({userID: userID} , {"uInfo.lastLogin": current});


    fetchedUser.uInfo.userPass = '';  // ## clear user password before send data to web
    if (!fetchedUser.uCompany[0]) {
      console.log(err);
      return res.status(401).json({
        message: {
          messageID: 'erru005', 
          mode:'errLogout', 
          value: "Log out error"
        }
      });
    }

    const companyID = userf.uCompany[0].companyID;

        // ## get company
    const company = await ShareFunc.getCompany1Info(companyID);


    // ## get all factory under company
    const factories = await ShareFunc.getFactoryArrByCompanyID(companyID);

    // ## get company season
    const showArr = [true]; 
    const comSeasons = await ShareFunc.getComSeasons(companyID, showArr);

    // ## get subNodeflow
    const subNodeflowC = await ShareFunc.getSubNodeflowC(companyID);


    await ShareFunc.upsertUserSession1hr(body.comID, body.userID, tokenSet.userClassID);
    const token = await ShareFunc.genATokenSet(tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: fetchedUser.userID,
      user: fetchedUser,
      company: company,
      factories: factories,
      comSeasons: comSeasons,
      subNodeflowC: subNodeflowC
      // mode: 'user', // ## user = normal user  , userNode= work station login

    });
  } catch (err) {
    // console.log(err);
    return res.status(401).json({
      message: {
        messageID: 'erru004', 
        mode:'errLogin2', 
        value: "Invalid authentication credentials!"
      }
    });
  }
}


exports.editAPassFactoryStaff = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log('editPassFactoryStaff');
  // const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const userID = data.userID;
  const newPass = data.pwd+'pwd'+data.pwd;
  const state = data.state;
  // console.log(userID , newPass , state);
  try {

    // ## 
    const editStaffPassNew = await ShareFunc.editAStaffPassNew(userID, newPass, state);

    await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: '',
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'erru012', 
        mode:'errEditStaffPass', 
        value: "error edit staff password"
      }
    });
  }
}

// router.get("/acc/uinfo/:userID", checkAuthA, checkUUID, userAController.getuserAInfo);
exports.getuserAInfo = async (req, res, next) => {
  // try {  } catch (err) {}
  // const userID = req.userData.userID;
  const userID = req.params.userID;
  // console.log(req.body);
  try {
    // exports.delUserSession1hr= async (comID, userID, userClassID)
    // await ShareFunc.delUserSession1hr(body.comID, body.userID, tokenSet.userClassID);
    let userf = await Useracc.findOne({ userID: userID});
    userf.uInfo.userPass = '';
    
    if (!userf.uCompany[0]) {
      console.log(err);
      return res.status(401).json({
        message: {
          messageID: 'erru005', 
          mode:'errLogout', 
          value: "Log out error"
        }
      });
    }

    const companyID = userf.uCompany[0].companyID;
    // console.log(companyID);
    // ## get company
    const company = await ShareFunc.getCompany1Info(companyID);
    // console.log(company);
    // ## get all factory under company
    const factories = await ShareFunc.getFactoryArrByCompanyID(companyID);
    // console.log(factories);

    // ## get company season
    const showArr = [true]; 
    const status = ['open'];
    const comSeasons = await ShareFunc.getComSeasons(companyID, showArr);

    await this.asyncForEach(comSeasons , async (item) => {
      const ordersCount = await ShareFunc.getOrdersCount(companyID, status, [item.seasonYear]);
      item.orderCount = ordersCount;
    });
    // console.log(comSeasons);

    // ## get subNodeflow
    const subNodeflowC = await ShareFunc.getSubNodeflowC(companyID);

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      status: 'get user info',
      token: token,
      expiresIn: process.env.expiresIn,
      user: userf,
      company: company,
      factories: factories,
      comSeasons: comSeasons,
      subNodeflowC: subNodeflowC
    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: {
        messageID: 'erru005', 
        mode:'errLogout', 
        value: "Log out error"
      }
    });
  }
}






// ## order zone  ##########################################################################

// router.get("/acc/orders/:companyID/:seasonYear", checkAuthA, checkUUID, userAController.getOrdersSeasonYear);
exports.getOrdersSeasonYear = async (req, res, next) => {
  // try {  } catch (err) {}
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  // console.log(req.body);
  try {
    
    // getOrdersBySeasonYearArr= async (companyID, statusArr, seasonYearArr) 
    const status = ['open'];
    const orders = await ShareFunc.getOrdersBySeasonYearArr(companyID, status, [seasonYear]);
    orders.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });

    // ## get product image path
    const productIDs = Array.from(new Set(orders.map((item) => item.orderID)));
    const productImageProfiles = await ShareFunc.getProductImageProfiles(companyID, productIDs);
    

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      status: 'get user info',
      token: token,
      expiresIn: process.env.expiresIn,
      orders: orders,
      productImageProfiles: productImageProfiles,

    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: {
        messageID: 'erru005', 
        mode:'errgetorders', 
        value: "get orders error"
      }
    });
  }
}

// router.get("/acc/subnodecostseason/:companyID/:factoryID/:orderID/:seasonYear",
//         checkAuthA, checkUUID, userAController.getOrderSubnodeCostSeason);
exports.getOrderSubnodeCostSeason = async (req, res, next) => {
  // try {  } catch (err) {}
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const orderID = req.params.orderID;
  const seasonYear = req.params.seasonYear;

  try {
    
    const orderSubNodeFlowSetCost = 
      await ShareFunc.getOrderSubNodeCostBySeasonYear(companyID, factoryID, [orderID], [seasonYear]);
    // orders.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });

    // ## 
    // const productIDs = Array.from(new Set(orders.map((item) => item.orderID)));
    // const productImageProfiles = await ShareFunc.getProductImageProfiles(companyID, productIDs);
    

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      status: 'get user info',
      token: token,
      expiresIn: process.env.expiresIn,
      orderSubNodeFlowSetCost: orderSubNodeFlowSetCost,
      // productImageProfiles: productImageProfiles,

    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: {
        messageID: 'erru005', 
        mode:'errgetordersubnodecost', 
        value: "get order sub node cost error"
      }
    });
  }
}


// router.post("/acc/edit/OrderSubNodeFlowSetCost", 
// checkAuthA, checkUUID, orderController.postOrderSubNodeFlowSetCost);
exports.postOrderSubNodeFlowSetCost = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  // console.log('postOrderSubNodeFlowSetCost');
  // console.log(data);

  try {
    // ##  
    const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

    // // console.log(bundleSetGroup);
    const companyID = data.orderSubNodeFlowSetCost.companyID;
    const factoryID = data.orderSubNodeFlowSetCost.factoryID;
    const seasonYear = data.orderSubNodeFlowSetCost.seasonYear;
    const orderID = data.orderSubNodeFlowSetCost.orderID;
    const subNodeSetCost = await OrderSubNodeFlowSetCost.updateOne({$and: [
        {"companyID":companyID},
        {"factoryID":factoryID}, 
        {"orderID":orderID}, 
        {"seasonYear":seasonYear},
      ]} , 
      {
        "facSubNodeCost": data.orderSubNodeFlowSetCost.facSubNodeCost,
        "datetime": current
      }, {upsert: true}); 

    // // ## get all bundlesetgroups
    // const bundleSetGroups = await ShareFunc.getBundlesetgroups(companyID, orderID, seasonYear);

    // token: string; expiresIn: number; userID: string; success: boolean; message: any;

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      success: true,
      message: 'post OrderSubNodeFlowSetCost ok',
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errO028', 
        mode:'errEdit/OrderSubNodeFlowSetCost', 
        value: "error edit/OrderSubNodeFlowSetCost"
      }
    });
  }
}




// ## hr zone  ############################################################################

// router.get("/hr/emplist/:companyID/:factoryID/:status/:type/:state/:page/:limit", 
//                 checkAuthA, checkUUID, userAController.getEmpList);
exports.getEmpList = async (req, res, next) => {
  // try {  } catch (err) {}
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const status = req.params.status;
  const type = req.params.type;
  const state = req.params.state;
  const page = +req.params.page;
  const limit = +req.params.limit;  // ## records we need to get
  // console.log('getEmpList');
  try {
    
    // getEmpListCF= async (companyID, factoryID, status, type, state, page, limit)
    // status = 'a'
    // type = 's'
    // state = ''
    const workers = 
      await ShareFunc.getEmpListCF(companyID, factoryID, [status], [type], [state], page, limit);
    // console.log(users);

    // getEmpsCount= async (companyID, factoryID, status, type, state) 
    const workersCount = await ShareFunc.getEmpsCount(companyID, factoryID, [status], [type], [state]);

    // const orderSubNodeFlowSetCost = 
    //   await ShareFunc.getOrderSubNodeCostBySeasonYear(companyID, factoryID, [orderID], [seasonYear]);
    // orders.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });

    // ## 
    // const productIDs = Array.from(new Set(orders.map((item) => item.orderID)));
    // const productImageProfiles = await ShareFunc.getProductImageProfiles(companyID, productIDs);

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      status: 'get workers info',
      token: token,
      expiresIn: process.env.expiresIn,
      workers: workers,
      workersCount: workersCount,
      page: page,
      limit: limit,
      // productImageProfiles: productImageProfiles,

    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: {
        messageID: 'erru005', 
        mode:'errgetWorkers', 
        value: "get workers error"
      }
    });
  }
}






