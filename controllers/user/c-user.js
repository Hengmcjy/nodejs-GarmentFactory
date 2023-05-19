const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');

const io = require('../../socket');

const ShareFunc = require("../c-api-app-share-function");

const User = require("../../models/m-user");
const UserClass = require("../../models/m-userClass");
const Company = require("../../models/m-company");
const Factory = require("../../models/m-factory");
const NodeStation = require("../../models/m-nodeStation");

const UnitSize = require("../../models/m-unitSize");
const UnitWeight = require("../../models/m-unitWeight");


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

// // ## http://192.168.1.141:3968/api/user/test/test2
// router.get("/test/test2", userController.getTestTest2);
exports.getTestTest2 = async (req, res, next) => {
  
  // // xxFindCountry2
  // const updateTargetPlaceCountryIDOrder = await ShareFunc.xxFindOrder();

  // updateTargetPlaceOrderProduction
  // const updateTargetPlaceOrderProduction = await ShareFunc.updateTargetPlaceOrderProduction();

  // ## test array filter
  // https://www.mongodb.com/docs/manual/reference/operator/aggregation/filter/
  // productBarcodeNo    productBarcodeNoReserve  []

 
  // // editQueueInfoOfOrderProductionQueue
  // // orderProductionQueue
  // const result01 = await ShareFunc.editQueueInfoOfOrderProductionQueue_CancelOrderProduction01();

  // ## update QRcode real
  // const updateQrCodeRealOrderProduction = await ShareFunc.updateQrCodeRealOrderProduction();
  // console.log(updateQrCodeRealOrderProduction);

  //  edit OrderProduction
  // const editOrderProduction02 = await ShareFunc.editOrderProduction02();
  
  const editOrderProduction02 = await ShareFunc.getCCurrentProductQtyAllXX();

  const productBarcodeNo = '';

  // ## test socket IO
  io.getIO().emit(process.env.IOID+'/iomessage/user', {
    action: 'sent by socketIO',
    post: { socket: 'IO', creator: { _id: req.body.userID, name: 'namex' } }
  });

  
  const test = await ShareFunc.test1();
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>2.) test command mongodb</title><head>');
  res.write('<body>');
  res.write('<h1>2.) test command mongodb</h1></br>');
  res.write('<h1>Hello from my Node.js Server!</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}

// // ## http://192.168.1.10:3968/api/user/test/test
// router.get("/test/test", userController.getTestTest);
exports.getTestTest = async (req, res, next) => {
  // console.log('getTestTest');
  // user = await User.updateOne(  
  //   {$and: [
  //     {"userID": "heng067@gmail.com"},

  //   ]},
  //   {$unset: {status: ""} });

  // // updateTargetPlaceOrder
  // const updateTargetPlaceOrder = await ShareFunc.updateTargetPlaceOrder();

  // // updateTargetPlaceCountryIDOrder
  // const updateTargetPlaceCountryIDOrder = await ShareFunc.updateTargetPlaceCountryIDOrder();

  // // xxFindCountry2
  // const updateTargetPlaceCountryIDOrder = await ShareFunc.xxFindOrder();

  // ## test socket IO
  io.getIO().emit(process.env.IOID+'/iomessage/user', {
    action: 'sent by socketIO',
    post: { socket: 'IO', creator: { _id: req.body.userID, name: 'namex' } }
  });

  
  const test = await ShareFunc.test1();
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>1.) general test</title><head>');
  res.write('<body>');
  res.write('<h1>1.) general test</h1></br>');
  res.write('<h1>Hello from my Node.js Server!</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}


// ## general info
// router.get("/generalinfo", UserController.getGeneralInfo);
exports.getGeneralInfo = async (req, res, next) => {
  // try {} catch (err) {}
  const languageID = req.params.languageID;
  const classLimit = +req.params.classLimit;
  try {
    // controlApp = await ShareFunc.getControlApp();

    // ## 1 appVer , appName, appMail
    const generalInfo = await ShareFunc.generalInfo();

    // ## 2 targetPlace , color , size
    const colors = await ShareFunc.colorInfo();
    const sizes = await ShareFunc.sizeInfo();
    const targetPlaces = await ShareFunc.targetPlaceInfo();

    // ## get languages list
    const langs = await ShareFunc.getLangLists(true);
    // ## get language Data
    const langData = await ShareFunc.getLangData(languageID);
    // console.log(langData);

    // editLangData= async (languageID, lID)
    const editLangData = await ShareFunc.editLangData('th');

    // ## get user class
    const userClass = await ShareFunc.getUserClass(classLimit);

    // ## get io ID
    const controlApp = await ShareFunc.getControlAppClientControl();

    // const updateQrCodeRealOrderProduction = await ShareFunc.updateQrCodeRealOrderProduction();

    // ## system info'
    const sysInfo = [
      {id: 'mgdb', data: process.env.MGDB},
      {id: 'appVer', data: process.env.APPVER},
      {id: 'appName', data: process.env.APPNAME},
      {id: 'appMail', data: process.env.APPEMAIL},
    ];
    // const sysInfo2 = {
    //   mgdb: process.env.MGDB,
    //   appVer: process.env.APPVER,
    //   appName: process.env.APPNAME,
    //   appMail: process.env.APPEMAIL,

    // };
    // MGDB=nodeGarmentSystem2  APPVER=1.0  APPNAME=go.garment.com APPEMAIL=go.garment.mail@gmail.com

    return res.status(200).json({
      generalInfo: generalInfo,
      targetPlaces: targetPlaces,
      colors: colors,
      sizes: sizes,
      langs: langs,
      langData: langData,
      userClass: userClass,
      controlApp: controlApp,
      sysInfo: sysInfo,
      // updateQrCodeRealOrderProduction: updateQrCodeRealOrderProduction
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erru000', 
        mode:'generalInfo', 
        value: "error general info"
      }
    });
  }
}

// // ## get language  / starting data
// router.get("/generalinfo/langdata/:languageID", userController.getLangData);
exports.getLangData = async (req, res, next) => {
  // try {} catch (err) {}
  const languageID = req.params.languageID;
  try {
    const langData = await ShareFunc.getLangData(languageID);
    res.status(200).json({
      langData: langData
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erru000-1', 
        mode:'generalInfolang', 
        value: "error general info language"
      }
    });
  }
}


// ## general
// #######################################################################################################

// #######################################################################################################
// ## user

// ## auth
//  test getuserLogin
exports.getuserLogin = (req, res, next) => {
  console.log(req.body);
  res.send('<h1>Hello / get login ok</h1>');
}

exports.createUser = async (req, res, next) => {
  const logID= 'usu';  // ## user sign up
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  // console.log(req.body);
  // console.log(process.env.JWT_KEY);

  userDocf = await User.findOne({userID: req.body.userID});
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
    userName: 'xxxx'
  };

  bcrypt.hash(req.body.userPass, 10).then(hash => {
    const user = new User({
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

exports.userLogin = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log(req.body);
  const logID= 'uli';  // ## user log in
  const body = req.body;
  const tokenSet = body.tokenSet;
  const userID = req.body.userID;
  const uuidUserNodeLoginWaiting = body.uuidUserNodeLoginWaiting;
  let fetchedUser;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  try {
    const userf = await User.findOne({ userID: userID });
    if (!userf) {
      // ## check user node station
      // const statusArr = ["a","c","d"];   // ## a = active , c= close,  d= deleted - no use
      const statusArr = ["a"];   // ## a = active , c= close,  d= deleted - no use
      // {"userNode.userNodeID": userID}, 

      let nodeStationUserFF = await NodeStation.aggregate([
        { $match: { $and: [
          {"status":{$in: statusArr}} 
        ] } },
        { $unwind: "$userNode" },
        { $project: { _id: 0, 
          factoryID: 1,		
          companyID: 1,
          nodeID: 1,
          status: 1,
          editDate: 1,
          nodeInfo: 1,
          nStation: 1,
          nodeProblem: 1,
          stationID: "$userNode.stationID",
          userNodeID: "$userNode.userNodeID",
          userNodePass: "$userNode.userNodePass",
          uuid: "$userNode.uuid",
        }},
        { $match: { $and: [
          {"userNodeID":userID}, 
          {"userNodePass":req.body.userPass},
        ] } },
        { $project: {			
          _id: 0,	
          factoryID: 1,		
          companyID: 1,
          nodeID: 1,
          status: 1,
          editDate: 1,
          nodeInfo: 1,
          nStation: 1,
          nodeProblem: 1,
          stationID: 1
        }	},
      ]);
      if (nodeStationUserFF.length>0) {
        // nodeStationUserF[0].userNode ={
        //   userNodeID: '',
        //   userNodeID: '',
        //   userNodePass: '',
        //   uuid: '',
        // };
        const stationID = nodeStationUserFF[0].stationID;
        // console.log(stationID);

        //  ## get nodeStation by companyID factoryID nodeID
        let nodeStation = await ShareFunc.getNodeStation(
                    nodeStationUserFF[0].companyID, 
                    nodeStationUserFF[0].factoryID, 
                    [nodeStationUserFF[0].status], 
                    nodeStationUserFF[0].nodeID);
        nodeStation[0].userNode = [];
        const nodeStationUserF = nodeStation;

        // console.log(nodeStationUserF);

        // ## find user node ok
        const company = await ShareFunc.getCompany1Info(nodeStationUserF[0].companyID);
        const factory = await ShareFunc.getFactory1Info(nodeStationUserF[0].companyID, nodeStationUserF[0].factoryID);

        // ## add request user node login  and send request user node login to owner
        // exports.addNodeStationLoginRequest = async (companyID, factoryID, nodeID, stationID, uuidUserNodeLoginWaiting, minutePlus)
        const addNodeStationLoginRequest = await ShareFunc.addNodeStationLoginRequest(
                                                    nodeStationUserF[0].companyID,
                                                    nodeStationUserF[0].factoryID,
                                                    nodeStationUserF[0].nodeID,
                                                    stationID,
                                                    uuidUserNodeLoginWaiting,
                                                    5
                                                  );
        //
        const nodeStationLoginRequest = await ShareFunc.get1NodeStationLoginRequest(
                                          nodeStationUserF[0].companyID,
                                          nodeStationUserF[0].factoryID,
                                          nodeStationUserF[0].nodeID,
                                          stationID,
                                          uuidUserNodeLoginWaiting
                                        );
        //

        const token = await ShareFunc.genTokenSet(tokenSet, process.env.expire7day);
        return res.status(200).json({
          token: token,
          expiresIn: process.env.expire7day,
          userID: userID,
          user: {},
          mode: 'userNode', // ## user = normal user  , userNode= work station login
          nodeStation: nodeStationUserF[0],
          stationID: stationID,
          nodeStationLoginRequest: nodeStationLoginRequest,
          company: company,
          factory: factory
        });
      } else {
        return res.status(401).json({
          message: {
            messageID: 'erru002', 
            mode:'errLoginFound', 
            value: "Auth failed, userID not found"
          }
        });
      }
    }
    // console.log('fetchedUser');
    fetchedUser = userf;
    doMatch = await bcrypt.compare(req.body.userPass, userf.uInfo.userPass);
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
    await ShareFunc.upsertUserSession1hr(body.comID, body.userID, tokenSet.userClassID);
    const token = await ShareFunc.genTokenSet(tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: fetchedUser.userID,
      user: fetchedUser,
      mode: 'user', // ## user = normal user  , userNode= work station login
      nodeStation: {},
      stationID: '',
      company: {},
      factory: {}
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

// router.get("/uinfo", checkAuth , UserController.getuserInfo);
exports.getuserInfo = async (req, res, next) => {
  // try {  } catch (err) {}
  const userID = req.params.userID;
  // console.log(req.body);
  try {
    // exports.delUserSession1hr= async (comID, userID, userClassID)
    // await ShareFunc.delUserSession1hr(body.comID, body.userID, tokenSet.userClassID);
    let userf = await User.findOne({ userID: userID});
    userf.uInfo.userPass = '';
    res.status(200).json({
      status: 'get user info',
      user: userf
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

exports.userLogout = async (req, res, next) => {
  // try {  } catch (err) {}
  const logID= 'ulo';  // ## user log out
  const body = req.body;
  const tokenSet = body.tokenSet;
  try {
    // exports.delUserSession1hr= async (comID, userID, userClassID)
    await ShareFunc.delUserSession1hr(body.comID, body.userID, tokenSet.userClassID);
    res.status(200).json({
      status: 'logout completed'
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

// UserClass

// // ## edit editPassFactoryStaff 
// router.put("/useredit1/factory/staff", checkAuth, checkUUID, userController.editPassFactoryStaff);
exports.editPassFactoryStaff = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log('editPassFactoryStaff');
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const staffUserID = data.staffUserID;
  const newPass = data.newPass;
  const state = data.state;
  // console.log(staffUserID , newPass , state);
  try {

    // ## 
    const editStaffPassNew = await ShareFunc.editStaffPassNew(staffUserID, newPass, state);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
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


// ## user 
// #######################################################################################################

// #######################################################################################################
// ## user company

// ## create new company 
// router.post("/create/company", UserController.createUserCompany);
exports.createUserCompany = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log(req.body);
  const data = req.body;
  const userID = data.userID;
  const userClass = {userClassID: 'own', userClassName: 'owner', userType: 'user', seq: 800};
  const createBy = {userID: data.userID, userName: data.userName};
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const page = +data.page;
  const limit = +data.limit;

  try {
    // ## find control app
    const controlApp = await ShareFunc.getControlApp();
    // console.log(controlApp);

    let companyRunID = controlApp.companyRunID + 1;
    let companyID = 'c' + await ShareFunc.setStrLen(process.env.companyIDLen,companyRunID);
    let companyDocf = await Company.findOne({companyID:companyID});
    while (companyDocf){
      companyDocf = await Company.findOne({companyID:companyID});
      companyRunID++;
      companyID = 'c' + await ShareFunc.setStrLen(process.env.companyIDLen,companyRunID);
    }

    // ## create new company
    // const company = {};
    const companyUpsert = await Company.updateOne(
      {companyID:companyID} , 
      {
        cDescription: data.cDescription,
        "cInfo.companyName": data.companyName,
        "cInfo.registDate": current,
        "cInfo.createBy": createBy
      }, {upsert: true}); 

    // ## update company array in User
    const uCompany = {
      companyID: companyID,
      state: 'joined',
      userComClass: userClass
    };
    const userCompany = await User.updateOne({userID:data.userID} , {$push: {uCompany: uCompany}});

    // ## update control app --> companyRunID
    await ShareFunc.updateControlAppCompanyRunID(process.env.APPNAME, +companyRunID);

    // // ## get user company info
    // let userf = await User.findOne({ userID: data.userID });
    // let companyArr = [];
    // // let factoryArr = [];
    // await this.asyncForEach(userf.uCompany , async (item) => {
    //   if(!companyArr.some(i => i == item.companyID)) {
    //     companyArr.push(item.companyID);
    //   }
    // });
    // // await this.asyncForEach(userf.uFactory , async (item) => {
    // //   if(!factoryArr.some(i => i == item.factoryID)) {
    // //     factoryArr.push(item.factoryID);
    // //   }
    // // });
    // // ## getCompanylInfo= async (companyid, page, limit)
    // const company = await ShareFunc.getCompanyInfo(companyArr, +data.page , +data.limit);
    // // // ## getFactoryInfo= async (factoryIDArr, page, limit)
    // // const factory = await ShareFunc.getFactoryInfo(factoryArr, +page , +limit);

    const dataF = await ShareFunc.getCompanys(userID, page, limit);
    const company = dataF.company;
    let userf = dataF.userf;

    userf.uInfo.userPass = '';
    // console.log(company);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      company: company,
      // factory: factory,
      user: userf
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'errc001', 
        mode:'errCompanyCreate', 
        value: "company create error!"
      }
    });
  }
}

// ## get new company 
// router.get("/get/company/:user/:page/:limit", checkAuth, UserController.getUserCompany);
exports.getUserCompany = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.params.userID;
  const page = req.params.page;
  const limit = req.params.limit;
  // console.log(userID, page, limit);

  try {
    // // ## get user company info
    // const userf = await User.findOne({ userID: userID });
    // let companyArr = [];
    // // let factoryArr = [];
    // await this.asyncForEach(userf.uCompany , async (item) => {
    //   if(!companyArr.some(i => i == item.companyID)) {
    //     companyArr.push(item.companyID);
    //   }
    // });
    // // await this.asyncForEach(userf.uFactory , async (item) => {
    // //   if(!factoryArr.some(i => i == item.factoryID)) {
    // //     factoryArr.push(item.factoryID);
    // //   }
    // // });

    // // ## getCompanylInfo= async (companyidArr, page, limit)
    // const company = await ShareFunc.getCompanyInfo(companyArr, +page , +limit);
    // // console.log(company);
    // // // ## getFactoryInfo= async (factoryIDArr, page, limit)
    // // const factory = await ShareFunc.getFactoryInfo(factoryArr, +page , +limit);

    const dataF = await ShareFunc.getCompanys(userID, page, limit);
    const company = dataF.company;

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      company: company,
      // factory: factory
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errc002', 
        mode:'errGetCompanyInfo', 
        value: "get company info error"
      }
    });
  }
}

// // ## get user1 company 
// router.get("/getuser1/company/:userID", checkAuth, checkUUID, userController.getUser1Company);
exports.getUser1Company = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.params.userID;
  try {
    // // ## get user1 company info
    let userf = await User.findOne({ userID: userID});
    userf.uInfo.userPass = '';

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      user: userf,
      // factory: factory
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'erru011', 
        mode:'errGet1UserCompany', 
        value: "error get 1 user company"
      }
    });
  }
}


// // ## get member company 
// router.get("/get/member/company/:companyID/:page/:limit", checkAuth, checkUUID, userController.getMemberCompany);
exports.getMemberCompany = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.userData.tokenSet.userID;
  const companyID = req.params.companyID;
  const page = +req.params.page;
  const limit = +req.params.limit;
  // console.log(userID, page, limit);

  try {
    // // ## get members company 
    const membersCompany = await ShareFunc.getCompanyMembers(companyID, page, limit);
    // console.log(membersCompany);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      membersCompany: membersCompany,
      // factory: factory
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errc004', 
        mode:'errGetCompanyMember', 
        value: "get company member error"
      }
    });
  }
}


// router.get("/get1/company/:companyID", checkAuth, checkUUID, userController.getCompany);
exports.getCompany1 = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  try {
    // exports.getCompany1Info= async (companyID) 
    const company = await ShareFunc.getCompany1Info(companyID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      company: company,
      // factory: factory
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errc002', 
        mode:'errGetCompanyInfo', 
        value: "get company info error"
      }
    });
  }
}

// // ## edit company 
// router.put("/edit/company", checkAuth, checkUUID, userController.editCompany);
exports.editCompany = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log('editCompany');
  const data = req.body;
  // console.log(data);
  const userID = req.userData.tokenSet.userID;
  const companyData = data.company;
  const page = +data.page;
  const limit = +data.limit;

  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  try {

    // ## editCompany (company)
    const editCompany = await ShareFunc.editCompany(companyData);
    // console.log('1');
    const dataF = await ShareFunc.getCompanys(userID, page, limit);
    const company = dataF.company;
    // console.log('2');

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      company: company,
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'errc003', 
        mode:'errCompanyEdit', 
        value: "company edit error"
      }
    });
  }
}

// // ## invite member 
// router.put("/invite/member/company", checkAuth, checkUUID, userController.putInviteMemberCompany);
exports.putInviteMemberCompany = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log('editCompany');
  const data = req.body;
  const memberUserID = data.memberUserID;
  const companyID = data.companyID;
  const status = 'a'; // ## a = active
  // console.log('putInviteMemberCompany');
  const userID = req.userData.tokenSet.userID;
  const userComClass = {userClassID: 'gst', userClassName: 'guest'};
  // const companyData = data.company;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  try {

    // ## check exist userID/memberUserID
    // findUserAndStatus= async (userID, status)
    // console.log(memberUserID, status);
    const userf = await ShareFunc.findUserAndStatus(memberUserID, status);
    // console.log(userf);
    if (userf) {
      const findCompany = await userf.uCompany.filter(i => (i.companyID == companyID));
      if (findCompany.length === 0) {
        const uCompany = {
          companyID: companyID,
          state: 'wait',
          userComClass: userComClass
        };
        // ## invite member/userID
        const inviteMember = await ShareFunc.inviteMemberToCompany(memberUserID, uCompany);
      } else {
        return res.status(422).json({
          message: {
            messageID: 'erru006-2', 
            mode:'errInviteMemberAlreadyInvited', 
            value: "error invite member , already invited"
          },
          success: false
        });
      }
    } else {
      // console.log('erru006-1');
      return res.status(422).json({
        message: {
          messageID: 'erru006-1', 
          mode:'errInviteMemberNoHasUserID', 
          value: "error invite member no has userID / not exist"
        },
        success: false
      });
    }
 
    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      message: {
        messageID: 'complete', 
        mode:'complete', 
        value: "invite member completed"
      },
      success: true
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'erru006', 
        mode:'errInviteMember', 
        value: "error invite member"
      }
    });
  }
}

// // ##  member join company
// router.put("/join/member/company", checkAuth, checkUUID, userController.putUserJoinCompany);
exports.putUserJoinCompany = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log('editCompany');
  const data = req.body;
  // const memberUserID = data.memberUserID;
  const companyID = data.companyID;
  const page = +data.page;
  const limit = +data.limit;

  const userID = req.userData.tokenSet.userID;

  try {

    // ## member join company
    const joinMember = await ShareFunc.userJoinToCompany(userID, companyID);

    // // ## get  user info
    let userf = await User.findOne({ userID: userID});
    userf.uInfo.userPass = '';

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      user: userf,
      message: {
        messageID: 'complete', 
        mode:'complete', 
        value: "user/member join company completed"
      },
      success: true
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'erru007', 
        mode:'errJoinMember', 
        value: "error member join company"
      }
    });
  }
}

// router.put("/edit/userclass/company", checkAuth, checkUUID, userController.putUserClassCompany);
exports.putUserClassCompany = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log('editCompany');
  const data = req.body;
  const memberUserID = data.memberUserID;
  const companyID = data.companyID;
  const userComClass = data.userComClass;
  // const companyID = data.companyID;

  const page = +data.page;
  const limit = +data.limit;

  const userID = req.userData.tokenSet.userID;

  try {

    // ## edit member class company
    const editMemberClass = await ShareFunc.editUserClassToCompany(memberUserID, companyID, userComClass);

    // ## get members company 
    const membersCompany = await ShareFunc.getCompanyMembers(companyID, page, limit);

    // // ## get  user info
    let userf = await User.findOne({ userID: memberUserID});
    userf.uInfo.userPass = '';

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      user: userf,
      membersCompany: membersCompany,
      message: {
        messageID: 'complete', 
        mode:'complete', 
        value: "user/member edit user class company completed"
      },
      success: true
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'erru008', 
        mode:'errEditMemberClassCompany', 
        value: "error edit member class company"
      },
      success: false,
      user: {}
    });
  }
}

// ## user company
// #######################################################################################################


// #######################################################################################################
// ## user factory

// // ## create new factory 
// router.post("/create/factory", checkAuth, UserController.createUserFactory);
exports.createUserFactory = async (req, res, next) => {
  // try {  } catch (err) {}
  // companyID userID page limit
  // console.log(req.body);
  // const factory = [];
  const data = req.body;
  const userFacClass = {userClassID: 'own', userClassName: 'owner', userType: 'user', seq: 800};
  const createBy = {userID: data.userID, userName: data.userName};
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {

    // ## find control app
    const controlApp = await ShareFunc.getControlApp();
    // console.log(controlApp);

    let factoryRunID = controlApp.factoryRunID + 1;
    let factoryID = 'f' + await ShareFunc.setStrLen(process.env.factoryIDLen,factoryRunID);
    let factoryDocf = await Factory.findOne({$and: [{"factoryID":factoryID}, {"companyID":data.companyID}]});
    while (factoryDocf){
      factoryDocf = await Factory.findOne({$and: [{"factoryID":factoryID}, {"companyID":data.companyID}]});
      factoryRunID++;
      factoryID = 'f' + await ShareFunc.setStrLen(process.env.factoryIDLen,factoryRunID);
    }
    // console.log(factoryID);
    // ## create new factory
    const factoryUpsert = await Factory.updateOne({$and: [
        {"factoryID":factoryID}, 
        {"companyID":data.companyID}
      ]} , 
      {
        fDescription: data.fDescription,
        "fInfo.factoryName": data.factoryName,
        "fInfo.registDate": current,
        "fInfo.createBy": createBy
      }, {upsert: true}); 

    // ## update factory array in User
    const uFactory = {
      factoryID: factoryID,
      companyID: data.companyID,
      state: 'joined',
      userFacClass: userFacClass      
    };
    const userCompany = await User.updateOne({userID:data.userID} , {$push: {uFactory: uFactory}});

    // ## update control app --> companyRunID
    await ShareFunc.updateControlAppFactoryRunID(process.env.APPNAME, +factoryRunID);

    // ## get user factory info
    let userf = await User.findOne({ userID: data.userID });
    const factoryArr = await ShareFunc.getFactoryArr(userf.uFactory);

    // ## getFactoryInfo= async (factoryIDArr, page, limit)
    const factory = await ShareFunc.getFactoryInfo(factoryArr, data.companyID, +data.page , +data.limit);
    userf.uInfo.userPass = '';



    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      factory: factory,
      user: userf
    });
  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'errf001', 
        mode:'errFactoryCreate', 
        value: "factory create error!"
      }
    });
  }

}

// // ## create company factory user/staff
// router.post("/create/companyID/factory/user", checkAuth, checkUUID, userController.createUserCompanyFactory);
exports.createUserCompanyFactory = async (req, res, next) => {
  // try {  } catch (err) {}
  // companyID userID page limit
  // console.log(req.body);
  // const factory = [];
  const data = req.body;
  const user = data.user;
  const companyID = user.uFactory[0].companyID;
  const factoryID = user.uFactory[0].factoryID;
  const checkUserID = user.userID;
  // const userClass = {userClassID: 'own', userClassName: 'owner'};
  const createBy = data.createBy;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const userID = req.userData.tokenSet.userID;
  // console.log('companyID, factoryID, checkUserID')
  // console.log(companyID, factoryID, checkUserID, userID)
  try {
    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    // console.log(companyID, factoryID, checkUserID, userID)
    // exports.checkUserIDExisted= async (userID)
    const isExist = await ShareFunc.checkUserIDExisted(companyID, factoryID, checkUserID);
    if (isExist) {
      return res.status(422).json({
        message: {
          messageID: 'erru010-1', 
          mode:'errCreateCompanyFactoryUserExisted', 
          value: "error create company factory user existed"
        },
        success: false,
        user: {}
      });
    } else {
      // ## create user	
      // console.log('1');
      // ## start new user password
      let userPass = '';
      bcrypt.hash(process.env.NEWPASSWORD, 10).then(async (hash) => {
        userPass = hash;
        // console.log('2');
        const uInfo = {
          userName : user.uInfo.userName,
          userPass : userPass,
          pic : '',
          tel : user.uInfo.tel,
          email : user.uInfo.email,
          registDate : current,
          lastLogin : current
        };
        const type = user.type;  // u=user , s=staff/worker , us=userstaff
        const status = user.status;
        const state = user.state;  // ## staff = worker , user office
        const uCompany = [];
        const uFactory = user.uFactory;
        // console.log(uFactory);
  
        const userUpsert = await User.updateOne({$and: [
          {"userID":user.userID},
        ]} , 
        {
          "type": type,
          "uInfo": uInfo,
          "uCompany": uCompany,
          "uFactory": uFactory,
          "status": status,
          "state": state,
          "createBy": createBy,
        }, {upsert: true}); 
  
        // ## get  user info
        let userf = await User.findOne({ userID: user.userID});
        userf.uInfo.userPass = '';
        // console.log(userf);

        res.status(200).json({
          token: token,
          expiresIn: process.env.expiresIn,
          userID: userID,
          user: userf,
          message: {
            messageID: 'complete', 
            mode:'complete', 
            value: "create user/staff completed"
          },
          success: true
        });
      });
    }
  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'erru010', 
        mode:'errCreateCompanyFactoryUser', 
        value: "error create company factory user!"
      },
      success: false,
      user: {}
    });
  }
}

// // ## get  user  factory by userID companyID
// router.get("/get/factory/:userID/:companyID/:page/:limit", checkAuth, UserController.getUserFactory);
exports.getUserFactory = async (req, res, next) => {
  // try {} catch (err) {}
  // companyID userID page limit
  // console.log(req.params);
  const userID = req.params.userID;
  const companyID = req.params.companyID;
  const page = +req.params.page;
  const limit = +req.params.limit;

  try {
    // ## get user factory info
    let userf = await User.findOne({ userID: userID });
    const factoryArr = await ShareFunc.getFactoryArr(userf.uFactory);
    // console.log(factoryArr);

    // ## getFactoryInfo= async (factoryIDArr, page, limit)
    const factory = await ShareFunc.getFactoryInfo(factoryArr, companyID, +page , +limit);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      factory: factory,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errf002', 
        mode:'errGetFactoryInfo', 
        value: "get company info error"
      }
    });
  }

}

// // ## get  user  factory by  companyID factoryID
// router.get("/get1/factory/:companyID/:factoryID", checkAuth, checkUUID, userController.getFactory1);
exports.getFactory1 = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;

  try {
    // exports.getFactory1Info= async (companyID, factoryID)
    const factory = await ShareFunc.getFactory1Info(companyID, factoryID);

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      factory: factory,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errf002', 
        mode:'errGetFactoryInfo', 
        value: "get company info error"
      }
    });
  }
}

// // ## get  user member  factory by userID companyID
// router.get("/getmembers/factory/:companyID/:factoryID/:page/:limit", checkAuth, checkUUID, userController.getUserMemberFactory);
exports.getUserMemberFactory = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const state = req.params.state;
  const page = +req.params.page;
  const limit = +req.params.limit;

  try {
    // exports.getFactory1Info= async (companyID, factoryID)
    const membersFactory = await ShareFunc.getMembersFactory(companyID, factoryID, state, page, limit);

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      membersFactory: membersFactory,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errf004', 
        mode:'errGetFactoryMember', 
        value: "get company member error"
      }
    });
  }
}

// // ## edit factoery 
// router.put("/edit/factory", checkAuth, checkUUID, userController.editFactory);
exports.editFactory = async (req, res, next) => {
  const data = req.body;
  // console.log(data);
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryData = data.factoryData;
  const page = +data.page;
  const limit = +data.limit;

  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  try {

    // ## edit factory
    const editFactory = await ShareFunc.editFactory(companyID, factoryData);

    // ## get user factory info
    let userf = await User.findOne({ userID: userID });
    const factoryArr = await ShareFunc.getFactoryArr(userf.uFactory);

    // ## getFactoryInfo= async (factoryIDArr, page, limit)
    const factorys = await ShareFunc.getFactoryInfo(factoryArr, companyID, +page , +limit);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      factorys: factorys,
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'errf003', 
        mode:'errFactoryEdit', 
        value: "factory edit error"
      }
    });
  }
}

// router.get("/check/existuserid/:companyID/:factory/:checkuserID", checkAuth, checkUUID, userController.getCheckExistCompanyFactoryUserID);
exports.getCheckExistCompanyFactoryUserID = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const userID = req.userData.tokenSet.userID;
  const checkUserID = req.params.checkuserID;
  

  try {
    // exports.checkUserIDExisted= async (userID)
    const isExist = await ShareFunc.checkUserIDExisted(companyID, factoryID, checkUserID);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      isExist: isExist,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'erru009', 
        mode:'checkUserIDExist', 
        value: "error check userID exist"
      }
    });
  }
}



// ## user factory
// #######################################################################################################




// #############################################################
// ## image upload

// postUpdateUploadImages
exports.postUpdateUploadImages = async (req, res, next) => {
  const file = req.file;
  const filename = file.filename;
  // console.log(file);
  try {

    res.status(201).json({
      message: "postMBUpdateProfileImage",
      status: 'imageProfileUpdated'
    });
  } catch (err) {

  }
}

// // ## /api/user/update/upload/images/gcs postUpdateUploadImagesGCS
// exports.postUpdateUploadImagesGCS = async (req, res, next) => {
//   const file = req.file;
//   const filename = file.filename;
//   // console.log(file);
//   try {

//     if (req.file) {
//       console.log("File found, trying to upload...");
//       const blob = bucket.file(req.file.originalname);
//       const blobStream = blob.createWriteStream();

//       blobStream.on("finish", () => {
//         res.status(200).send("Success");
//         console.log("Success");
//       });
//       blobStream.end(req.file.buffer);
//     } else throw "error with img";
//     res.status(201).json({
//       message: "postMBUpdateProfileImage",
//       status: 'imageProfileUpdated'
//     });
//   } catch (err) {

//   }
// }


// ## image upload
// #############################################################