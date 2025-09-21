
// ## share app function

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment-timezone');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");
const { v5: uuidv5 } = require('uuid');
const { v4: uuidv4, fromString  } = require('uuid');

const Authorize = require('../models/m-authorize');

const Session1hr = require('../models/m-session1hrs');  // check this for current login
const Session1ys = require('../models/m-session1ys');
const Session1mn = require('../models/m-session1mn');
const Session3mn = require('../models/m-session3mn');
const Session6mn = require('../models/m-session6mn');

const Schedule = require("../models/m-schedule");
const Dtproductionzoneperiodc = require("../models/m-dt-productionzoneperiodc");
const Dtcurrentcfactoryorder = require("../models/m-dt-currentcfactoryorder");
const Dtcurrentproductqtyall = require("../models/m-dt-currentproductqtyall");
const Dtorderoutsourcefac = require("../models/m-dt-currentcompanyorderoutsourcefac");
const Dtcompanyorderoutsource = require("../models/m-dt-companyorderoutsource");


const User = require("../models/m-user");
const UserGroupScan = require("../models/m-userGroupScan");
const UserClass = require("../models/m-userClass");
const MailSignup = require("../models/m-mailSignup");
const Company = require("../models/m-company");
const Factory = require("../models/m-factory");
const Product = require("../models/m-product");
const Order = require("../models/m-order");
const OrderProduction = require("../models/m-orderProduction");
const OrderProductionQueue = require("../models/m-orderProductionQueue");
const OrderProductionQueueList = require("../models/m-orderProductionQueueList");
const SubNodeFlowType = require("../models/m-subNodeFlowType");
const RepQTYEdit = require("../models/m-repQTYEdit");

const DPacking = require("../models/m-dPacking");
const DCarton = require("../models/m-dCarton");
const DCountry = require("../models/m-dCountry");

const OPDLost = require("../models/m-opdLost");
const LostGroup = require("../models/m-lostGroup");

const Bundlesetgroup = require("../models/m-bundleSetGroup");
const Yarn = require("../models/m-yarn");
const YarnData = require("../models/m-yarnData");
const YarnLotUsage = require("../models/m-yarnLotUsage");
const YarnSeason = require("../models/m-yarnSeason");
const YarnColor = require("../models/m-yarnColor");
const YarnSupplier = require("../models/m-yarnSupplier");
const YarnStockCardPCS = require("../models/m-yarnStockCardPCS");

const Customer = require("../models/m-customer");
const ControlApp = require("../models/m-controlApp");
const Color = require("../models/m-color");
const Size = require("../models/m-size");
const TargetPlace = require("../models/m-targetPlace");
const NodeFlow = require("../models/m-nodeFlow");
const SubNodeflowC = require("../models/m-subNodeFlowC");
const NodeStation = require("../models/m-nodeStation");
const NodeStationLoginRequest = require("../models/m-nodeStationLoginRequest");
const UnitSize = require("../models/m-unitSize");
const UnitWeight = require("../models/m-unitWeight");
const ProductBox = require("../models/m-productBox");


// ## declare route socketIO
const messageIOU = require("../socketio/user/socketioUser");

const Language = require("../models/m-language");
const LanguageType = require("../models/m-languageType");

const { BucketActionToHTTPMethod } = require('@google-cloud/storage/build/src/bucket');

// #################################################################################
// ## general zone ####################################################################

exports.test1= async () => {

  // user = await User.updateOne(  
  //   {$and: [
  //     {"userID": "heng067@gmail.com"},
  //   ]},
  //   {$unset: {status: ""} });

  user = await MailSignup.updateOne(  
    {$and: [
      {"email": "heng@gmail.com"},
    ]},
    {$unset: {sendtime: ""} });

}

exports.showMongoDBDateDetail= async (companyID) => {
  const showDateDetailf = await YarnData.aggregate([
    // 2019-06-15T04:18:28.000+00:00
    { $match: { $and: [
      {"companyID": companyID} , 
      // {"betCancel":false} ,
    ] } },
    { $project: {
      yearMonthDayUTC: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
      year: { $year: "$datetime" },
      month: { $month: "$datetime" },
      day: { $dayOfMonth: "$datetime" },
      hour: { $hour: "$datetime" },
      minutes: { $minute: "$datetime" },
      seconds: { $second: "$datetime" },
      milliseconds: { $millisecond: "$datetime" },
      dayOfYear: { $dayOfYear: "$datetime" },
      dayOfWeek: { $dayOfWeek: "$datetime" },
      week: { $week: "$datetime" }
    } }
  ]);
  console.log(showDateDetailf);
  return showDateDetailf;
}



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

// function escapeRegExp(str) {
//   return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
// }
exports.escapeRegExp= async (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// function strReplaceAll(str, find, replace) {
//   return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
// }
exports.strReplaceAll= async (str, find, replace) => {
  return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
}

exports.strReplaceAlll= async (str, find, replace) => {
  return (str.split(find)).join(replace);
}

function returnDDMMYYYY(numFromToday = 0, sign = '-'){
  let d = new Date();
  d.setDate(d.getDate() + numFromToday);
  const month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
  const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
  return `${day}${sign}${month}${sign}${d.getFullYear()}`;
}

function returnYYYYMMDD(numFromToday = 0){
  let d = new Date();
  d.setDate(d.getDate() + numFromToday);
  const month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
  const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
  return `${d.getFullYear()}${month}${day}`;
}

function returnYYYYMMDDHHMM(numFromToday = 0){
  let d = new Date();
  d.setDate(d.getDate() + numFromToday);
  const month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
  const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
  const hh = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
  const mm = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
  return `${d.getFullYear()}${month}${day}${hh}${mm}`;
}

function returnYYYYMMDDHHMMSS(numFromToday = 0){
  let d = new Date();
  d.setDate(d.getDate() + numFromToday);
  const month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
  const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
  const hh = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
  const mm = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
  const ss = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
  return `${d.getFullYear()}${month}${day}${hh}${mm}${ss}`;
}

function returnHHMM(date , plusM){
  let d = new Date(moment(date).tz('Asia/Bangkok').add(plusM, 'm').format('YYYY/MM/DD HH:mm:ss+07:00'));
  // d.setDate(d.getDate() + numFromToday);
  // const month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
  // const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
  const hh = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
  const mm = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
  // const ss = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
  return `${hh}:${mm}`;
}

exports.setStrLen= async (len, num) => {
// async function setStrLen(len, num) {
  while ((num+'').length < len ){num = '0'+num;}
  return num+'';
}

exports.setBackStrLen= async (len, str, strBack) => {
  // async function setStrLen(len, num) {
    while ((str+'').length < len ){str = str + strBack;}
    return str+'';
}

// ## gen/set tokenSet user  /   TOKENExpiresIn=1h
exports.genTokenSet= async (tokenSet, expiresIn) => {
  const token = jwt.sign(
    {
      appName: tokenSet.appName,
      appVer: tokenSet.appVer,
      userID: tokenSet.userID,
      uuid5: tokenSet.uuid5,
      browser: tokenSet.browser,
      browserVer: tokenSet.browserVer,
      deviceType: tokenSet.deviceType,
      os: tokenSet.os,
      osVer: tokenSet.osVer
    },
    process.env.JWT_KEY,
    { expiresIn: expiresIn }
  );
  return token;
}

// getMongoDBVer1
exports.getMongoDBVer1= async () => {
  // const mongoDBVer1 = await User.runCommand( { serverStatus: 1, mirroredReads: 1 } );
  // const mongoDBVer1 = await User.se
  return mongoDBVer1;
}

// db.runCommand( { serverStatus: 1, mirroredReads: 1 } )


// ## get general info
exports.generalInfo= async () => {
  const generalInfo = {
    appVer: process.env.APPVER,
    appName: process.env.APPNAME,
    appMail: process.env.APPEMAIL
  };
  return generalInfo;
}

// await ShareFunc.getUserClass();
exports.getUserClass= async (classLimit) => {
  // const classLimit = 899;  // ## 900 = adm / 999=superadmin
  const userClass = await UserClass.aggregate([
    { $match: { $and: [
      {"seq": {$lte: +classLimit}},
    ] } },
    { $project: {			
        _id: 0,	
        seq: 1,		
        userClassID: 1,
        userClassName: 1,
        userType: 1
    }	},
    { $sort: { seq: 1 } }
  ]);	
  
  return userClass;
}

// ## get color info
exports.colorInfo= async () => {
  const color = await Color.aggregate([

    { $project: {			
        _id: 0,	
        companyID: 1,	
        seq: 1,		
        setName: 1,
        color: 1
    }	},
    { $sort: { seq: 1 } }
  ]);	

  return color;
}

exports.colorComID= async (companyID) => {
  const color = await Color.aggregate([
    { $match: { $and: [
      {"companyID": companyID}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,	
        seq: 1,		
        setName: 1,
        color: 1
    }	},
    { $sort: { seq: 1 } }
  ]);	

  return color;
}

exports.colorComSetName= async (companyID, setName) => {
  const color = await Color.aggregate([
    { $match: { $and: [
      {"companyID": companyID}, 
      {"setName": setName},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,	
        seq: 1,		
        setName: 1,
        color: 1
    }	},
    { $sort: { seq: 1 } }
  ]);	

  return color;
}

// ## get size info
exports.sizeInfo= async () => {
  const size = await Size.aggregate([
    { $project: {			
        _id: 0,	
        seq: 1,		
        size: 1
    }	},
    { $sort: { seq: 1 } }
  ]);	
  return size;
}

// ## get targetPlace info
exports.targetPlaceInfo= async () => {
  const targetPlace = await TargetPlace.aggregate([
    { $project: {			
        _id: 0,	
        seq: 1,		
        targetPlace: 1
    }	},
    { $sort: { seq: 1 } }
  ]);
  return targetPlace;
}

// ## get company info
exports.getCompanyInfo= async (companyIDArr, page, limit) => {
  const company = await Company.aggregate([
    { $match: { $and: [
      {"companyID":{$in: companyIDArr}}
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,		
        cDescription: 1,	
        cInfo: 1,
    }	},
    { $sort: { _id: 1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);
  // console.log(company);
  
  return company;
}

// await ShareFunc.getCompanyMembers(companyID, page, limit)
exports.getCompanyMembers= async (companyID, page, limit) => {
  // console.log('getCompanyMembers');
  // console.log(companyID, page, limit);
  const membersCompany1 = await User.aggregate([
    { $unwind: "$uCompany" },
    { $project: { _id: 1, userID: 1, type: 1, uInfo: 1, uFactory: 1, status: 1, state: 1, createBy: 1,
      companyID: "$uCompany.companyID",
      stateCompany: "$uCompany.state",
      userComClass: "$uCompany.userComClass",
    }},
    { $match: { $and: [
      {"companyID":companyID} , 
    ] } },
    { $project: {			
        _id: 1,	
        userID: 1, type: 1, uInfo: 1, uFactory: 1, status: 1, state: 1, createBy: 1,
        companyID: 1,		
        stateCompany: 1,	
        userComClass: 1,
    }	},
    { $sort: { _id: 1 } },
    { $skip: (page-1) *  limit},
    { $limit: +limit }
  ]);
  // console.log(membersCompany1);

  const membersCompany = await membersCompany1.map(fw => ({
    userID: fw.userID, 
    type: fw.type,  
    uInfo: fw.uInfo, 
    uFactory: fw.uFactory, 
    status: fw.status, 
    state: fw.state, 
    createBy: fw.createBy, 
    uCompany: [{
      companyID: fw.companyID, 
      state: fw.stateCompany, 
      userComClass: fw.userComClass, 
    }]
  }));
  await this.asyncForEach(membersCompany , async (item) => {
    item.uInfo.userPass = ''; // ## clear userPass before send to outside
  });
  return membersCompany;
}


exports.getStaffsByQRCodes= async (qrCodes, type) => {
  const staffs = await User.aggregate([
    { $match: { $and: [
      // {"companyID":companyID}, 
      {"qrCode":{$in: qrCodes}},
      {"type": type}, 
    ] } },
    { $project: { 
      _id: 0, 
      userID: 1, 
      qrCode: 1, 
      userName: "$uInfo.userName",
      pic: "$uInfo.pic",
    }},
  ]);
  return staffs;
}


// userInvestStatementLottoRoundf = await UserInvest.aggregate([
//   { $match: { $and: [
//     {"companyID": companyID},
//     {"status":{$in: statusUserInvest}},
//   ] } },
//   { $unwind: "$lottoMainTypeInvest" },
//   { $project: { _id: 1, userID: 1, companyID: 1, status: 1, totalAmount: 1,
//                 lottoMainTypeID: "$lottoMainTypeInvest.lottoMainTypeID",
//                 amount: "$lottoMainTypeInvest.amount"} 
//   },
//   { $match: { $and: [
//     {"lottoMainTypeID": lottoMainTypeID},
//   ] } },
//   { $project: { _id: 1, userID: 1, companyID: 1, status: 1, totalAmount: 1,
//     lottoMainTypeID: 1,
//     amount: 1} },
// ]);

// ShareFunc.getUserGroupScanAll(companyID);
exports.getUserGroupScanAll= async (companyID, groupScanID) => {
  const userGroupScan = await UserGroupScan.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"groupScanID":groupScanID},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        detail: 1,
        open: 1,
        seq: 1,
        groupScanID: 1,	
        groupScanID2: 1,	
        userIDGroup: 1,
    }	}
  ]);
  return userGroupScan;
}

exports.getUserGroupScan1= async (companyID, groupScanID) => {
  const userGroupScan = await UserGroupScan.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"groupScanID":groupScanID},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        detail: 1,
        open: 1,
        seq: 1,
        groupScanID: 1,	
        groupScanID2: 1,	
        userIDGroup: 1,
    }	}
  ]);
  return userGroupScan;
}

exports.getCompanys= async (userID, page, limit) => {
  const userf = await User.findOne({ userID: userID });
  let companyArr = [];
  await this.asyncForEach(userf.uCompany , async (item) => {
    if(!companyArr.some(i => i == item.companyID)) {
      companyArr.push(item.companyID);
    }
  });
  const company = await this.getCompanyInfo(companyArr, +page , +limit);

  const data = {userf: userf, company: company};
  return data;
}

// await ShareFunc.editCompany(company)
exports.editCompany= async (company) => {
  // console.log(company);
  editCompany = await Company.updateOne(  
    {$and: [
      {"companyID":company.companyID} , 
    ]},
    { 
      "cDescription": company.cDescription,
      "cInfo.companyName": company.cInfo.companyName,
      "cInfo.abbreviation": company.cInfo.abbreviation,
      "cInfo.tel": company.cInfo.tel,
      "cInfo.email": company.cInfo.email,
    });
  return true;
}

// ShareFunc.editFactory(companyID, factoryData);
exports.editFactory= async (companyID, factory) => {
  // console.log(factory);
  editCompany = await Factory.updateOne(  
    {$and: [
      {"companyID":companyID} , 
      {"factoryID":factory.factoryID} , 
    ]},
    { 
      "fDescription": factory.fDescription,
      "fInfo.factoryName": factory.fInfo.factoryName,
      "fInfo.abbreviation": factory.fInfo.abbreviation,
      "fInfo.tel": factory.fInfo.tel,
      "fInfo.email": factory.fInfo.email,
    });
  return true;
}

// ## get 1 company info
exports.getCompany1Info= async (companyID) => {
  const company = await Company.aggregate([
    { $match: { $and: [
      {"companyID":companyID}
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,		
        cDescription: 1,	
        cInfo: 1,
    }	}
  ]);
  // console.log(company);
  return company[0]?company[0]:null;
}

// ShareFunc.getMembersFactory(companyID, factoryID, page, limit);
exports.getMembersFactory= async (companyID, factoryID, state, page, limit) => {
  const membersFactory1 = await User.aggregate([
    { $match: { $and: [
      {"state":state}, 
    ] } },
    { $unwind: "$uFactory" },
    { $project: { _id: 1, userID: 1, type: 1, uInfo: 1, uCompany: 1, status: 1, state: 1, createBy: 1,
      companyID: "$uFactory.companyID",
      factoryID: "$uFactory.factoryID",
      stateFactory: "$uFactory.state",
      userFacClass: "$uFactory.userFacClass",
    }},
    { $match: { $and: [
      {"companyID":companyID}, 
      {"factoryID":factoryID},
    ] } },
    { $project: {			
        _id: 1,	
        userID: 1, type: 1, uInfo: 1, uCompany: 1, status: 1, state: 1, createBy: 1,
        companyID: 1,	
        factoryID: 1,	
        stateFactory: 1,	
        userFacClass: 1,
    }	},
    { $sort: { _id: 1 } },
    { $skip: (page-1) *  limit},
    { $limit: +limit }
  ]);
  // console.log(membersCompany1);

  const membersFactory = await membersFactory1.map(fw => ({
    userID: fw.userID, 
    type: fw.type,  
    uInfo: fw.uInfo, 
    uCompany: fw.uCompany, 
    status: fw.status, 
    state: fw.state, 
    createBy: fw.createBy, 
    uFactory: [{
      companyID: fw.companyID, 
      factoryID: fw.factoryID, 
      state: fw.stateFactory, 
      userFacClass: fw.userFacClass, 
    }]
  }));
  await this.asyncForEach(membersFactory , async (item) => {
    item.uInfo.userPass = ''; // ## clear userPass before send to outside
  });
  return membersFactory;
}

// ## get factory info
exports.getFactoryInfo= async (factoryIDArr, companyID, page, limit) => {
  const factory = await Factory.aggregate([
    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"companyID":companyID}
    ] } },
    { $project: {			
        _id: 1,	
        factoryID: 1,
        companyID: 1,		
        show: 1,
        fDescription: 1,	
        fInfo: 1,
    }	},
    { $sort: { _id: 1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);
  // console.log(factory);
  return factory;
}

exports.getFactoryArrByCompanyID= async (companyID) => {
  const factory = await Factory.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":{$in: facIDs}},
    ] } },
    { $project: {			
        _id: 1,	
        factoryID: 1,
        companyID: 1,		
        show: 1,
        fDescription: 1,	
        fInfo: 1,
    }	},
    // { $sort: { _id: 1 } },
    // { $skip: (page-1) *  limit},
    // { $limit: limit }
  ]);
  // console.log(factory);
  return factory;
}

exports.getFactoryArrByFacIDs= async (companyID, facIDs) => {
  const factory = await Factory.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":{$in: facIDs}},
    ] } },
    { $project: {			
        _id: 1,	
        factoryID: 1,
        companyID: 1,		
        show: 1,
        fDescription: 1,	
        fInfo: 1,
    }	},
    // { $sort: { _id: 1 } },
    // { $skip: (page-1) *  limit},
    // { $limit: limit }
  ]);
  // console.log(factory);
  return factory;
}

// ShareFunc.getFactoryArrByCompanyID(companyID);
exports.getFactoryArrByCompanyID= async (companyID) => {
  const factory = await Factory.aggregate([
    { $match: { $and: [
      // {"factoryID":{$in: factoryIDArr}},
      {"companyID":companyID}
    ] } },
    { $project: {			
        _id: 1,	
        factoryID: 1,
        companyID: 1,		
        show: 1,
        fDescription: 1,	
        fInfo: 1,
    }	},
    // { $sort: { _id: 1 } },
    // { $skip: (page-1) *  limit},
    // { $limit: limit }
  ]);
  // console.log(factory);
  return factory;
}

exports.getFactoryArr2= async (companyID) => {
  const factorys = await Factory.aggregate([
    { $match: { $and: [
      {"companyID":companyID}
    ] } },
    { $project: {			
        _id: 1,	
        factoryID: 1,
    }	},
  ]);

  let factoryArr = [];
  await this.asyncForEach(factorys , async (item) => {
    if(!factoryArr.some(i => i == item.factoryID)) {
      factoryArr.push(item.factoryID);
    }
  });
  return factoryArr;
}

// await ShareFunc.getFactoryArr(userf.uFactory);
exports.getFactoryArr= async (uFactory) => {
  let factoryArr = [];
  await this.asyncForEach(uFactory , async (item) => {
    if(!factoryArr.some(i => i == item.factoryID)) {
      factoryArr.push(item.factoryID);
    }
  });
  return factoryArr;
}

// getLangLists
exports.getLangLists= async (show) => {
  const langs = await Language.aggregate([
    { $match: { $and: [
      {"show":show}
    ] } },
    { $project: {			
        _id: 0,	
        languageID: 1,		
        languageName: 1,	
    }	},
    { $sort: { seq: 1 } },
  ]);
  // console.log(langs);
  return langs;
}

// ShareFunc.getLangData(languageID);
exports.getLangData= async (languageID) => {
  const langData = await Language.aggregate([
    { $match: { $and: [
      {"languageID":languageID}
    ] } },
    { $project: {			
        _id: 0,	
        languageID: 1,		
        languageName: 1,	
        languageData: 1,
    }	}
  ]);
  // console.log(langData);
  return langData[0]?langData[0]:null;
}

// update array to json to mongodb 
exports.editLangData= async (languageID) => {
  // // ## for en  english
  // const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // const dayNamesMin = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  // const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  // const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // ## for th  thai
  // มกราคม กุมภาพันธ์ มีนาคม เมษายน พฤษภาคม มิถุนายน กรกฎาคม สิงหาคม กันยายน ตุลาคม พฤศจิกายน และธันวาคม
  // ม.ค. ก.พ. มี.ค. เม.ย. พ.ค. มิ.ย. ก.ค. ส.ค. ก.ย. ต.ค. พ.ย. ธ.ค.
  const dayNames = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  const dayNamesShort = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  const dayNamesMin = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  const monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  const monthNamesShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.','ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  // // ## for china 
  // const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  // const dayNamesShort = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  // const dayNamesMin = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  // const monthNames = ['一 月','二 月','三 月','四 月','五 月','六 月','七 月','八 月','九 月','十 月','十一 月','十二 月'];
  // const monthNamesShort = ['一 月','二 月','三 月','四 月','五 月','六 月','七 月','八 月','九 月','十 月','十一 月','十二 月'];



  const dayNamesJSON = JSON.stringify(dayNames);
  const dayNamesShortJSON = JSON.stringify(dayNamesShort);
  const dayNamesMinJSON = JSON.stringify(dayNamesMin);
  const monthNamesJSON = JSON.stringify(monthNames);
  const monthNamesShortJSON = JSON.stringify(monthNamesShort);


  const langDatadayNames = await Language.updateOne(  
    {$and: [
      {"languageID":languageID}
    ]},
    {$set: { "languageData.$[elem].lText" : dayNamesJSON}}, 
    {
      multi: true,
      arrayFilters: [  {"elem.lID": "dayNames"} ]
    });

  const langDatadayNamesShort = await Language.updateOne(  
    {$and: [
      {"languageID":languageID}
    ]},
    {$set: { "languageData.$[elem].lText" : dayNamesShortJSON}}, 
    {
      multi: true,
      arrayFilters: [  {"elem.lID": "dayNamesShort"} ]
    });

  const langDatadayNamesMin = await Language.updateOne(  
    {$and: [
      {"languageID":languageID}
    ]},
    {$set: { "languageData.$[elem].lText" : dayNamesMinJSON}}, 
    {
      multi: true,
      arrayFilters: [  {"elem.lID": "dayNamesMin"} ]
    });

  const langDatamonthNames = await Language.updateOne(  
    {$and: [
      {"languageID":languageID}
    ]},
    {$set: { "languageData.$[elem].lText" : monthNamesJSON}}, 
    {
      multi: true,
      arrayFilters: [  {"elem.lID": "monthNames"} ]
    });

  const langDatamonthNamesShort = await Language.updateOne(  
    {$and: [
      {"languageID":languageID}
    ]},
    {$set: { "languageData.$[elem].lText" : monthNamesShortJSON}}, 
    {
      multi: true,
      arrayFilters: [  {"elem.lID": "monthNamesShort"} ]
    });
  // console.log(langData);
  return true;
}

// result1 = await Controlsetting.updateOne(
//   {$and: [
//     {"company.companyID":companyID} 
//   ]},
//   {$set: { "menuControlAdminClass.$[elem].menuControlAdmin" : menuControlX.menuControl}}, 
//   {
//     multi: true,
//     arrayFilters: [  {"elem.userClassID": menuControlX.userClassID} ]
//   });

// ## general zone ####################################################################
// #################################################################################

// #################################################################################
// ## fff function zone ####################################################################

exports.getFactoryNameByFactoryID= async (factorys, factoryID) => {
  const factory = factorys.filter(i=>(i.factoryID === factoryID));
  if (factory.length > 0) {
      return factory[0].fInfo.factoryName;
  }
  return '';
}

exports.getFactoryName2ByFactoryID= async (factorys, factoryID) => {
  const factory = factorys.filter(i=>(i.factoryID === factoryID));
  if (factory.length > 0) {
      return factory[0].fInfo.factoryName2;
  }
  return '';
}


const dD = [
  {numName: 1, dayShortName: 'Mon', dayName: 'Monday'},
  {numName: 2, dayShortName: 'Tue', dayName: 'Tuesday'},
  {numName: 3, dayShortName: 'Wed', dayName: 'Wednesday'},
  {numName: 4, dayShortName: 'Thu', dayName: 'Thursday'},
  {numName: 5, dayShortName: 'Fri', dayName: 'Friday'},
  {numName: 6, dayShortName: 'Sat', dayName: 'Saturday'},
  {numName: 7, dayShortName: 'Sun', dayName: 'Sunday'},
];
const mM = [
  {monthID: '01', monthShortName: 'Jan', monthFullName: 'January'},
  {monthID: '02', monthShortName: 'Feb', monthFullName: 'February'},
  {monthID: '03', monthShortName: 'Mar', monthFullName: 'March'},
  {monthID: '04', monthShortName: 'Apr', monthFullName: 'April'},
  {monthID: '05', monthShortName: 'May', monthFullName: 'May'},
  {monthID: '06', monthShortName: 'Jun', monthFullName: 'June'},
  {monthID: '07', monthShortName: 'Jul', monthFullName: 'July'},
  {monthID: '08', monthShortName: 'Aug', monthFullName: 'August'},
  {monthID: '09', monthShortName: 'Sep', monthFullName: 'September'},
  {monthID: '10', monthShortName: 'Oct', monthFullName: 'October'},
  {monthID: '11', monthShortName: 'Nov', monthFullName: 'November'},
  {monthID: '12', monthShortName: 'Dec', monthFullName: 'December'},
];

// ## mode = short , full
exports.getMonthNamebyID= async (monthID, mode) => {
  const month = mM.filter(i=>i.monthID == monthID);
  if (mode === 'short') { return month.length > 0 ? month[0].monthShortName:'';}
  else if (mode === 'full') { return month.length > 0 ? month[0].monthFullName:'';}
  else { return ''}
}

exports.getYYYYMMDDInfo= async (yyyymmdd) => {
  const info ={
      yyyy: yyyymmdd.substr(0, 4),
      mm: yyyymmdd.substr(4, 2),
      dd: yyyymmdd.substr(6, 2),
  };
  return info;
}

exports.getDateShortByYYYYMMDD= async (yyyymmdd, formatStr, mode, sign) => {
  const dateInfo = await this.getYYYYMMDDInfo(yyyymmdd);
  const yyyy = dateInfo.yyyy;
  const mm = dateInfo.mm;
  const dd = dateInfo.dd;
  const monthName = await this.getMonthNamebyID(mm, mode);
  let dateName = '';
  if (formatStr === 'ddMMM') { dateName = dd+sign+monthName; }
  else if (formatStr === 'ddMMMyyyy') { dateName = dd+sign+monthName+sign+yyyy; }
  else if (formatStr === 'MMMdd') { dateName = monthName+sign+dd; }
  return dateName
}

// ## get setname , (orders, orderID)
exports.getSetNameFromOrderID= async (orders, orderID) => {
  const order1 = orders.filter(i=>i.orderID === orderID);
  if (order1.length > 0) {
    // console.log(order1, order1[0], order1[0].orderColor);
    if (order1[0].orderColor.length > 0 && order1[0].orderColor) {
      return order1[0].orderColor[0].setName;
    }
  }
  return '';
}

exports.getColorCodeByID_SetNmae= async (colors, colorID, setName) => {
  const idx = colors.findIndex( fi =>(fi.color.colorID === colorID && fi.setName === setName.trim()));
  if (idx >= 0) {
    // console.log(colorID, setName+'xxx');
    return colors[idx].color.colorCode;
  }
  return '';
}

exports.getColorNameByID_SetNmae= async (colors, colorID, setName) => {
  const idx = colors.findIndex( fi =>(fi.color.colorID === colorID && fi.setName === setName.trim()));
  if (idx >= 0) {
    return colors[idx].color.colorName;
  }
  return '';
}

exports.getColorValueByID_SetNmae= async (colors, colorID, setName) => {
  const idx = colors.findIndex( fi =>(fi.color.colorID === colorID && fi.setName === setName.trim()));
  if (idx >= 0) {
    return colors[idx].color.colorValue;
  }
  return '';
}


// ## function zone ####################################################################
// #################################################################################


// #################################################################################
// ## email zone ####################################################################

// ## signupSendMail  send mail
exports.signupSendMail= async (email, uuid) => {
  const emailFactory = 'go.garment.mail@gmail.com';
  // ## test send mail ( nodemailer )
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAILSENDER,
      pass: process.env.EMAILSENDERPWD,
    }
  });
    
  // http://localhost:4200?key=514cf9e3-6f42-4b0f-ba5e-7365988bd4d6
  // http://localhost:4200/#/confirmlink?key=4c53f2c8-6c23-4369-bf32-21db104550f0
  // http://localhost:4200/#/user/ufactory/station/nodepick?nodeFlowID=main
  // รายละเอียดอีเมล
  transporter.sendMail({
    from: process.env.EMAILSENDER,    // ผู้ส่ง
    to: email,// ผู้รับ / to: "bar@example.com, baz@example.com", // list of receivers
    subject: "comfirm email [KOJ Garment system]",                      // หัวข้อ
    // text: "There is a new article. It's about sending emails, check it out!", // plain text body
    html: `
      <div style="border-style:solid;border-width:thin;border-color:#dadce0;border-radius:8px;padding:40px 20px"
      align="center" class="m_-8934074721175062072mdv2rw">
      <div style="font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;border-bottom:thin solid #dadce0;color:rgba(0,0,0,0.87);line-height:32px;padding-bottom:24px;text-align:center;word-break:break-word">
          <div style="font-size:24px">Verify your email </div>
      </div>
      <div style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;font-size:14px;color:rgba(0,0,0,0.87);line-height:20px;padding-top:20px;text-align:left">
              Google received a request to use 
              <a style="font-weight:bold">${email}</a> 
              as a recovery email for
              Google Account 
              <a style="font-weight:bold">${emailFactory}</a>
              .<br><br>
              Use this code to finish setting
              up this recovery email:
              <br>
              <div style="text-align:center;font-size:36px;margin-top:20px;line-height:44px">
                <a href="http://localhost:4200/#/confirmlink/${uuid}" target="_blank">click link</a> 
              </div>
              <br>
              This code will
              expire in 24 hours.
              <br><br>
              If you don’t recognize 
              <a style="font-weight:bold">${emailFactory}</a>
              , you
              can safely ignore this email.
          </div>
      </div>
      `,
    // html body 
    // attachments: [
    //   {
    //     filename: `${name}.pdf`,
    //     path: path.join(__dirname, `../../src/assets/books/${name}.pdf`),
    //     contentType: 'application/pdf',
    //   },
    // ],
  }, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info.messageId);
    }
  });

  // console.log(controlApp);
  return true;
}

// await ShareFunc.isSignupSendMailExist(uuid)
exports.isSignupSendMailExist= async (uuid) => {
  const signupSendMailExisted = await MailSignup.aggregate([
    { $match: { $and: [
      {"uuid":uuid},
    ] } },
    { $project: {			
        _id: 1,	
        uuid: 1,
        email: 1,
    }	},
    { $limit: 1 }
  ]);
  // console.log(signupSendMailExisted);
  return signupSendMailExisted;
}

// await ShareFunc.delSignupSendMail(uuid)
exports.delSignupSendMail= async (uuid) => {
  result2 = await MailSignup.deleteOne({$and: [
    {"uuid":uuid},
    ]})
  return true;
}

// await ShareFunc.unsetCreateAtUsers(userID)
exports.unsetCreateAtUsers= async (userID) => {
  user = await User.updateOne(  
    {$and: [
      {"userID": userID},
    ]},
    {$unset: {createdAt: ""} });
  return true;
}

// ## email zone ####################################################################
// #################################################################################

// #######################################################################################################
// ## schedule

exports.getScheduleData= async () => {
  const sStatus = 'on';
  const scheduleData = await Schedule.aggregate([
    { $match: { $and: [
      {"sStatus":sStatus},
      // {"factoryID":factoryID},
    ] } },
    { $project: {			
        _id: 0,	
        seasonYear: 1,	
        companyID: 1,		
        factoryID: 1,	
        sGroup: 1,
        sName: 1,	
        sStatus: 1,	
        sMode: 1,
        sDatetimeDiff: 1,
        lastDatetime: 1,
        sNote: 1, 
        sState: 1,
        sDatetime: 1,
    }	}
  ]);
  // console.log(scheduleData);
  return scheduleData;
}

exports.get_auto_getProductionZonePeriodC= async (companyID, seasonYear, sName) => {
  const data = await Dtproductionzoneperiodc.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"seasonYear":seasonYear},
      {"sName":sName},
    ] } },
    { $project: {			
        _id: 0,	
        data: 1,	
        dataFake: 1,	
        // companyID: 1,		
        // factoryID: 1,	
        // sGroup: 1,
        // sName: 1,	
        // sStatus: 1,	
        // sMode: 1,
        // sDatetimeDiff: 1,
        // lastDatetime: 1,
        // sDatetime: 1,
    }	}
  ]);
  // console.log(data);
  return data;
}

// auto_getCompanyOrderOutsource
exports.get_auto_getCompanyOrderOutsource= async (companyID, seasonYear, sName) => {
  // console.log(companyID, seasonYear, sName);
  const data = await Dtcompanyorderoutsource.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"seasonYear":seasonYear},
      {"sName":sName},
    ] } },
    { $project: {			
        _id: 0,	
        data1: 1,	
        data2: 1,	
        data3: 1,	
        data4: 1,	
        data5: 1,	
        // companyID: 1,		
        // factoryID: 1,	
        // sGroup: 1,
        // sName: 1,	
        // sStatus: 1,	
        // sMode: 1,
        // sDatetimeDiff: 1,
        // lastDatetime: 1,
        // sDatetime: 1,
    }	}
  ]);
  // console.log(data);
  return data.length>0? data[0] : undefined;
}

exports.get_auto_getCurrentCompanyOrderOutsourceFac= async (companyID, seasonYear, sName) => {
  // console.log(companyID, seasonYear, sName);
  const data = await Dtorderoutsourcefac.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"seasonYear":seasonYear},
      {"sName":sName},
    ] } },
    { $project: {			
        _id: 0,	
        data: 1,	
        // companyID: 1,		
        // factoryID: 1,	
        // sGroup: 1,
        // sName: 1,	
        // sStatus: 1,	
        // sMode: 1,
        // sDatetimeDiff: 1,
        // lastDatetime: 1,
        // sDatetime: 1,
    }	}
  ]);
  // console.log(data);
  return data[0].data;
}

// const Dtcurrentcfactoryorder = require("../models/m-dt-currentcfactoryorder");
exports.get_auto_getCurrentCFactoryOrder= async (companyID, seasonYear, sName) => {
  const data = await Dtcurrentcfactoryorder.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"seasonYear":seasonYear},
      {"sName":sName},
    ] } },
    { $project: {			
        _id: 0,	
        data: 1,	
        // companyID: 1,		
        // factoryID: 1,	
        // sGroup: 1,
        // sName: 1,	
        // sStatus: 1,	
        // sMode: 1,
        // sDatetimeDiff: 1,
        // lastDatetime: 1,
        // sDatetime: 1,
    }	}
  ]);
  // console.log(data);
  return data[0].data;
}

// const Dtcurrentproductqtyall = require("../models/m-dt-currentproductqtyall");
exports.get_auto_getCompanyCurrentProductQtyAll= async (companyID, seasonYear, sName, sNote) => {
  const data = await Dtcurrentproductqtyall.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"seasonYear":seasonYear},
      {"sName":sName},
      {"sNote":sNote},
    ] } },
    { $project: {			
        _id: 0,	
        data: 1,	
        // companyID: 1,		
        // factoryID: 1,	
        // sGroup: 1,
        // sName: 1,	
        // sStatus: 1,	
        // sMode: 1,
        // sDatetimeDiff: 1,
        // lastDatetime: 1,
        // sDatetime: 1,
    }	}
  ]);
  // console.log(data);
  return data[0].data;
}

// ## schedule
// #######################################################################################################

// #################################################################################
// ## image google  ####################################################################

// ## get bucket name by callfrom
/*  bucket name
  // ## for email: go.garment.com@gmail.com
  companyfactorygarmentworld1sthighquality / 		company image, factory image
	locationplacegarmentworld1sthighquality / 		company , factory location image
	garmentproductgarmentworld1sthighquality / 		complete product image
	garmentcustomergarmentworld1sthighquality / 		customer image
	garmentusergarmentworld1sthighquality / 		user profile image

  // ## for email: go.garment.mail@gmail.com
	garmentproductionprocessgarmentworld001sthighquality / 		step production image
*/
const garmentproduct = [
  'productEditImageProfile',
];
const garmentUser = [
  'userEditImageProfile',
  'staffEditImageProfile',
];
const garmentCompanyFactory = [
  'companyEditImageProfile',
  'factoryEditImageProfile',
];
const garmentCustomer = [
  'customerEditImageProfile',
];
const garmentLocationPlace = [
  
];
const garmentProductionProcess = [
  
];

exports.getBucket = async (callfrom) => {
  let bucketName = '';
  if (garmentproduct.includes(callfrom)) {
    bucketName = 'garmentproductgarmentworld1sthighquality';
  } else if (garmentUser.includes(callfrom)) {
    bucketName = 'garmentusergarmentworld1sthighquality';
  } else if (garmentCompanyFactory.includes(callfrom)) {
    bucketName = 'companyfactorygarmentworld1sthighquality';
  } else if (garmentCustomer.includes(callfrom)) {
    bucketName = 'garmentcustomergarmentworld1sthighquality';
  } else if (garmentLocationPlace.includes(callfrom)) {
    bucketName = 'locationplacegarmentworld1sthighquality';
  } else if (garmentProductionProcess.includes(callfrom)) {
    bucketName = 'garmentproductionprocessgarmentworld001sthighquality';
  }

  return bucketName;
}

// ## image google  ####################################################################
// #################################################################################

// #################################################################################
// ## control app zone ####################################################################

// ## get control app
exports.getControlApp= async () => {
  const controlAppf = await ControlApp.findOne();
  const controlApp = {
    appID: controlAppf.app.appID,
    companyRunID: controlAppf.app.companyRunID,
    factoryRunID: controlAppf.app.factoryRunID,
    nodeRunID: controlAppf.app.nodeRunID,
    customerRunID: controlAppf.app.customerRunID,
    imgServer: controlAppf.app.imgServer,
    ver: controlAppf.app.ver,
  };
  // console.log(controlApp);
  return controlApp;
}

// await ShareFunc.getControlAppClientControl();
exports.getControlAppClientControl= async () => {
  // console.log('appControl');
  const controlAppf = await ControlApp.findOne();
  // console.log(controlAppf);
  const controlApp = {
    clientControl: controlAppf.clientControl,
  };
  // console.log(appControl);
  return controlApp;
}

exports.getControlAppOutSourceLocationDepartment= async () => {
  // console.log('appControl');
  const controlAppf = await ControlApp.findOne();
  // console.log(controlAppf);
  const controlApp = {
    outSourceLocationDepartment: controlAppf.outSourceLocationDepartment,
    outSourceSeasonShow: controlAppf.outSourceSeasonShow,
  };
  // console.log(appControl);
  return controlApp;
}

// ## update control app  --> companyRunID
exports.updateControlAppCompanyRunID= async (appID, companyRunID) => {
    result1 = await ControlApp.updateOne({"app.appID":appID}, {"app.companyRunID": companyRunID});
}

// ## update control app  --> factoryRunID
exports.updateControlAppFactoryRunID= async (appID, factoryRunID) => {
  result1 = await ControlApp.updateOne({"app.appID":appID}, {"app.factoryRunID": factoryRunID});
}

// ## update control app  --> nodeRunID
exports.updateControlAppNodeRunID= async (appID, nodeRunID) => {
  result1 = await ControlApp.updateOne({"app.appID":appID}, {"app.nodeRunID": nodeRunID});
}

// ## update control app  --> customerRunID
exports.updateControlAppCustomerRunID= async (appID, customerRunID) => {
  result1 = await ControlApp.updateOne({"app.appID":appID}, {"app.customerRunID": customerRunID});
}



// ## control app zone ####################################################################
// #################################################################################

// #################################################################################
// ## user zone ####################################################################

// ## get user data
exports.findUser= async (comID, userID) => {
  userf = await User.find({$and: [{userID:userID}, {"com.comID":comID}]});
  return userf;
}

// ## get user image profile 
exports.getUserImageProfile= async (userID) => {
  const user = await User.findOne({$and: [ {"userID":userID} ]});
  return user?user.uInfo.pic:'';
}

// ## get user data
exports.findUserAndStatus= async (userID, status) => {
  const userf = await User.findOne({$and: [{userID:userID}, {status:status}]});
  // console.log(userf);
  return userf;
}

// ## check userID exist
exports.checkUserIDExisted= async (companyID, factoryID, checkUserID) => {
  const userf = await User.findOne({$and: [{userID:checkUserID}]});
  if (userf) { return true; }
  return false;
}

// ## edit image profile user
exports.editUserImageProfile= async (userID, imageUserProfile) => {
  // console.log(companyID, productID, imageProfile);
  resulteditUserImageProfile = await User.updateOne(  
    {$and: [
      {"userID":userID} , 
    ]},
    { "uInfo.pic": imageUserProfile});
}

// getWorkerInfoByQRCode1
exports.getWorkerInfoByQRCode1= async (companyID, factoryID, qrCode, type, status) => {
  // console.log(companyID, productID, imageProfile);
  // resulteditUserImageProfile = await User.updateOne(  
  //   {$and: [
  //     {"userID":userID} , 
  //   ]},
  //   { "uInfo.pic": imageUserProfile});
  const user1 = await User.aggregate([
    { $match: { $and: [
      {"qrCode": qrCode},
      {"type": type},
      {"status": status},
    ] } },
    { $unwind: "$uFactory" },
    { $project: { _id: 0, 
      userID: 1,
      qrCode: 1,
      companyID: "$uFactory.companyID",
      factoryID: "$uFactory.factoryID",
      uInfo: 1,
      uFactory: 1
      
    }},
    { $match: { $and: [
      {"companyID": companyID}, 
      // {"companyID":{$in: userClassIDArr}}, 
      {"factoryID": factoryID},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,		
        factoryID: 1,	
        userID: 1,	
        qrCode: 1,	
        uInfo: 1,	
        uFactory: 1
    }	},
  ]);

  return user1[0]?user1[0]:{};
}

// ## upsert user session 60 mn.
exports.upsertUserSession1hr= async (userID) => {
  // deleteALL = await Session1hr.deleteMany({$and: [
  //     {"user.userID":userID} , 
  //     {"user.userClassID":userClassID} , 
  //     {"user.companyID":companyID} ,
  //   ]}); 
  result1hr = await Session1hr.updateOne({$and: [
      {"user.userID":userID} , 
      // {"user.userClassID":userClassID} , 
      // {"user.comID":comID}
    ]} ,
    {$set:{
      createdAt: new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'))
    }} , {upsert: true});
}

// ## delete user session by userID
exports.delUserSession1hr= async (comID, userID, userClassID) => {
  deleteALL = await Session1hr.deleteMany({$and: [
      {"user.userID":userID} , 
      {"user.userClassID":userClassID} , 
      {"user.comID":comID}
    ]}); 
}

// ShareFunc.inviteMemberToCompany(memberUserID, companyID);
exports.inviteMemberToCompany= async (memberUserID, uCompany) => {
  // console.log(companyID, productID, imageProfile);
  inviteMember = await User.updateOne(  
    {$and: [
      {"userID":memberUserID}, 
    ]},
    { $push: {uCompany: uCompany}});
  return true;
}

// ShareFunc.userJoinToCompany(memberUserID)
exports.userJoinToCompany= async (userID, companyID) => {
  // console.log(userID, companyID);
  joinMember = await User.updateOne(
    {$and: [
      {"userID":userID},

    ]},
    {$set: { "uCompany.$[elem].state" : 'joined'}}, 
    {
      multi: true, 
      arrayFilters: [  {"elem.state": 'wait', "elem.companyID": companyID } ] 
    });

  return true;
}

// await ShareFunc.editStaffPassNew(userStaff.userID, newPass);
// ## state =  userEmail  ,  staff
exports.editStaffPassNew= async (userID, newPass, state) => {
  let userPass = '';
  bcrypt.hash(newPass, 10).then(async (hash) => {
    userPass = hash;
    
    editStaffPass = await User.updateOne(  
      {$and: [
        {"userID":userID}, 
        {"state":state},
      ]},
      { "uInfo.userPass": userPass});
  });
  return true;
}

// ShareFunc.editUserClassToCompany(memberUserID, companyID, userComClass)
exports.editUserClassToCompany= async (memberUserID, companyID, userComClass) => {
  // console.log(memberUserID, companyID, userComClass);
  const joinMember = await User.updateOne(
    {$and: [
      {"userID":memberUserID},

    ]},
    {$set: { "uCompany.$[elem].userComClass" : userComClass}}, 
    {
      multi: true, 
      arrayFilters: [  {"elem.companyID": companyID } ] 
    });

  return true;
}

exports.getUserCompanyLists= async (userID, userClassIDArr) => {
  const companyLists = await User.aggregate([
    { $match: { $and: [
      {"userID": userID},
    ] } },
    { $unwind: "$uCompany" },
    { $project: { _id: 0, 
      companyID: "$uCompany.companyID",
      stateCompany: "$uCompany.state",
      userComClass: "$uCompany.userComClass",
    }},
    { $match: { $and: [
      {"userComClass.userClassID":{$in: userClassIDArr}}, 
      {"stateCompany": "joined"},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,		
    }	},
  ]);

  // console.log(companyLists);
  return companyLists;
}

// await ShareFunc.staffLogin(userID, userPass, companyID, factoryID);
exports.staffLogin= async (userID, userPass, companyID, factoryID, statusArr, state) => {
  // console.log(userID, userPass, companyID, factoryID, statusArr, state);
  const userfS = await User.aggregate([
    { $match: { $and: [
      {"userID": userID},
      {"status":{$in: statusArr}},
    ] } },
    { $unwind: "$uFactory" },
    { $project: { _id: 0, 
      userID: 1, type: 1, uInfo: 1, ucompany: 1, status: 1, state: 1, createBy: 1,
      companyID: "$uFactory.companyID",
      factoryID: "$uFactory.factoryID",
      stateFactory: "$uFactory.state",
      userFacClass: "$uFactory.userFacClass",
    }},
    { $match: { $and: [
      {"companyID": companyID},
      {"factoryID": factoryID},
      {"stateFactory": state},
    ] } },
    { $project: {			
        _id: 0,	
        userID: 1, type: 1, uInfo: 1, ucompany: 1, status: 1, state: 1, createBy: 1,
        companyID: 1,		
        factoryID: 1,	
        stateCompany: 1,	
        userFacClass: 1,		
    }	},
  ]);

  // console.log(userfS);
  return userfS.length>0?userfS[0]:null;
}

// ## user zone ####################################################################
// #################################################################################


// #################################################################################
// ## company zone ####################################################################

// ## get company image profile 
exports.getCompanyImageProfile= async (companyID) => {
  const company = await Company.findOne({$and: [ {"companyID":companyID} ]});
  return company?company.cInfo.pic:'';
}

// ## get company current seasonYear
exports.getCompanyCurrentSeasonYear= async (companyID) => {
  const company = await Company.findOne({$and: [ {"companyID":companyID} ]});
  return company?company.seasonYear:'';
}

// ## edit image profile company
exports.editCompanyImageProfile= async (companyID, imageCompanyProfile) => {
  // console.log(companyID, productID, imageProfile);
  resulteditCompanyImageProfile = await Company.updateOne(  
    {$and: [
      {"companyID":companyID} , 
    ]},
    { "cInfo.pic": imageCompanyProfile});
}

// ## company zone ####################################################################
// #################################################################################

// #################################################################################
// ## factory zone ####################################################################

// ## get factory 1 info
exports.getFactory1Info= async (companyID, factoryID) => {
  const factory = await Factory.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,		
        factoryID: 1,	
        show: 1,
        fDescription: 1,	
        fInfo: 1,
        nodeStationSetting: 1,
    }	}
  ]);
  // console.log(company);
  return factory[0]?factory[0]:null;
}

// ## get factory image profile 
exports.getFactoryImageProfile= async (companyID, factoryID) => {
  const factory = await Factory.findOne({$and: [ {"companyID":companyID}, {"factoryID":factoryID} ]});
  return factory?factory.fInfo.pic:'';
}

// ## edit image profile factory
exports.editFactoryImageProfile= async (companyID, factoryID, imageFactoryProfile) => {
  // console.log(companyID, productID, imageProfile);
  resulteditFactoryImageProfile = await Factory.updateOne(  
    {$and: [
      {"companyID":companyID}, 
      {"factoryID":factoryID},
    ]},
    { "fInfo.pic": imageFactoryProfile});
}

// ## factory zone ####################################################################
// #################################################################################


// #################################################################################
// ## product zone ####################################################################

// ## get products
exports.getProducts= async (companyID, page, limit) => {
  // limit = +limit; // ## change to number
  const products = await Product.aggregate([
    { $match: { $and: [
      {"companyID":companyID}
    ] } },
    { $project: {			
        _id: 1,	
        productID: 1,
        // seasonYear: 1,
        productName: 1,		
        productDetail: 1,	
        productCustomerCode: 1,
        productGroupCode: 1,
        seasonYear: 1,
        productFeature: 1,
        companyID: 1,
        imageProfile: 1,
        pic: 1,		
        productsize: 1,	
        productcolorSet: 1,
    }	},
    { $sort: { _id: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);
  // console.log(products);
  return products;
}

// ShareFunc.getOrdersCount(companyID);
exports.getProductsCount= async (companyID) => {
  rows = await Product.countDocuments({$and: [
    {"companyID":companyID}
  ]});
  return rows;
}

// 
exports.getProductsByProductIDs= async (companyID, productIDArr, page, limit) => {
  let i = 0;
  await this.asyncForEach(productIDArr, async (item1) => {
    item1 = await this.setBackStrLen(process.env.productIDLen, item1, ' ');
    i++;
  });
  // limit = +limit; // ## change to number
  const products = await Product.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"productID":{$in: productIDArr}},
    ] } },
    { $project: {			
        _id: 1,	
        productID: 1,
        // seasonYear: 1,
        productName: 1,		
        productDetail: 1,	
        productCustomerCode: 1,
        productGroupCode: 1,
        seasonYear: 1,
        productFeature: 1,
        companyID: 1,
        imageProfile: 1,
        pic: 1,		
        productsize: 1,	
        productcolorSet: 1,
    }	},
    { $sort: { _id: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);
  // console.log(products);
  return products;
}

// ## get 1 product
exports.getProduct= async (companyID, productID) => {
  // limit = +limit; // ## change to number
  // ## modify productID len = 12   (len, str, strBack)
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  // console.log(productID + '--');
  const product = await Product.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"productID":productID}
    ] } },
    { $project: {			
        _id: 1,	
        productID: 1,
        productName: 1,		
        productDetail: 1,	
        productCustomerCode: 1,	
        productGroupCode: 1,
        seasonYear: 1,
        productFeature: 1,
        companyID: 1,
        imageProfile: 1,
        pic: 1,		
        productsize: 1,	
        productcolorSet: 1,
    }	}
  ]);
  // console.log(product);
  return product[0]?product[0]:{};
}

// ## edit image profile product
exports.editProductImageProfile= async (companyID, productID, imageProfile) => {
  // console.log(companyID, productID, imageProfile);
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  resulteditProductImageProfile = await Product.updateOne(  
    {$and: [
      {"companyID":companyID} , 
      {"productID":productID} ,
    ]},
    { imageProfile: imageProfile});
}


// ## get image profile 
exports.getProductImageProfile= async (companyID, productID) => {
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const product = await Product.findOne({$and: [{"companyID":companyID} , {"productID":productID}]});
  return product?product.imageProfile:'';
}

// ## get image profiles    /  productIDs []
exports.getProductImageProfiles= async (companyID, productIDs) => {
  let i = 0;
  let productIDs1 = [];
  await this.asyncForEach(productIDs, async (item1) => {
    item1 = await this.setBackStrLen(process.env.productIDLen, item1, ' ');
    productIDs1.push(await this.setBackStrLen(process.env.productIDLen, item1, ' '));
    i++;
  });
  // console.log(productIDs1);
  const productImageProfiles  = await Product.aggregate([
    { $match: { $and: [
      {"companyID":companyID} , 
      {"productID":{$in: productIDs1}},
    ] } },
    { $project: { 
      _id: 0,	
      productID: 1, 
      imageProfile: 1, 
    } },
  ]);
  // console.log(productImageProfiles);
  return productImageProfiles ? productImageProfiles : [];
}

// ## product zone ####################################################################
// #################################################################################




// #################################################################################
// ## order zone ####################################################################

// ## get orders by seasonID
exports.getOrderSBySeasonYears= async (companyID, seasonYearsArr) => {
  // limit = +limit; // ## change to number
  // console.log('getOPDLosts');
  // console.log(companyID, show);
  const orderD = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"show":show},  seasonYear
      {"seasonYear":{$in: seasonYearsArr}} // ## 2024AW 2025SS ...
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        orderID: 1,
        // productBarcode: "$productOR.productORInfo.productBarcode",
        // opdLostName: 1,
        // lostGroupID: 1,
        // show: 1,
        // seq: 1,
    }	}
  ]);
  // console.log(orderD);
  return orderD;
}

// ## get opd lost list
exports.getOPDLosts= async (companyID, show) => {
  // limit = +limit; // ## change to number
  // console.log('getOPDLosts');
  // console.log(companyID, show);
  const opdlosts = await OPDLost.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"show":show},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        opdLostID: 1,
        opdLostName: 1,
        lostGroupID: 1,
        show: 1,
        seq: 1,
    }	}
  ]);
  // console.log(opdlosts);
  return opdlosts;
}

// ## get lost group list
exports.getLostGroups= async (companyID, show) => {
  // limit = +limit; // ## change to number
  const lostGroups = await LostGroup.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"show":show},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        lostGroupID: 1,
        lostGroupName: 1,
        opdLostName: 1,
        show: 1,
        seq: 1,
    }	}
  ]);
  // console.log(lostGroups);
  return lostGroups;
}

// ShareFunc.getBundlesetgroups(companyID, orderID, seasonYear);
exports.getBundlesetgroups= async (companyID, orderID, seasonYear) => {
  // limit = +limit; // ## change to number
  const bundleSetGroups = await Bundlesetgroup.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      {"seasonYear":seasonYear},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        uuid: 1,
        completed: 1,
        groupName: 1,
        seq: 1,
        seasonYear: 1,
        orderID: 1,
        setName: 1,
        color: 1,
        targetPlaceID: 1,		
        yarnLotID: 1,	
        bundleNoSet: 1,
        bundleNoQty: 1,		
        datetime: 1,	
        createBy: 1,

    }	}
  ]);
  // console.log(bundleSetGroups);
  return bundleSetGroups;
}

exports.getSubNodeFlowTypeList= async (companyID) => {
  // limit = +limit; // ## change to number
  // const subNodeFlowTypes = await ShareFunc.getSubNodeFlowTypeList(companyID);
  const subNodeFlowTypes = await SubNodeFlowType.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"orderID":orderID},
      // {"seasonYear":seasonYear},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        seq: 1,
        subNodeFlowTypeID: 1,
        subNodeFlowTypeName: 1,
    }	}
  ]);
  // console.log(subNodeFlowTypes);
  return subNodeFlowTypes;
}

exports.validateBundleNoQtyAndCount= async (bundleNoSet) => {
  if (bundleNoSet.trim() === '') { return -1; } // ## check empty data string

  let correctFormat = true; // ## is character and is NaN  --> incorrect format
  let bundleCount = 0;
  const setArr = bundleNoSet.split(',');
  await this.asyncForEach(setArr, async (item) => {
    const dataArr = item.split('-');
      // console.log(dataArr);
      if (dataArr.length >= 3 || !correctFormat) {
          correctFormat = false; // ## incorrect format
      } else {
        await this.asyncForEach2(dataArr, async (item2) => {
          if (Number.isNaN(+item2)) {
              // console.log(+item2, 'is nan');
              correctFormat = false; // ## incorrect format
          } else {
              // console.log(+item2, 'is number');
          }
        });

        if (dataArr.length === 2 && +dataArr[0] > +dataArr[1]) { // ##  '10-1' --> incorrect format
            correctFormat = false; // ## incorrect format
        }
        if (correctFormat && dataArr.length === 1) {
            if (+dataArr[0] <= 0) {
                correctFormat = false; // ## incorrect format
            } else {
                bundleCount++;
            }
        } else if (correctFormat && dataArr.length === 2) {
            if (dataArr[0].trim() === '') {
                correctFormat = false; // ## incorrect format
            } else {
                const num1 = +dataArr[0];
                const num2 = +dataArr[1];
                const range = +dataArr[1] - +dataArr[0] + 1;
                bundleCount = bundleCount + range;
            }
        }
      }
  });

  // console.log( '8888');
  if (!correctFormat) {
      return -1;
  }
  // console.log( '9999');
  return bundleCount;
  
}

exports.genBundleNoFromRangeSetArr= async (bundleNoSet) => {
  // console.log('genBundleNoFromRangeSetArr');
  let bundleNos = [];
  const dataRecord = await this.validateBundleNoQtyAndCount(bundleNoSet);
  if (dataRecord === -1) { // ## -1 = incorrect data set
    return [];
  } else if (dataRecord > 0) {
    // ## do here
    const setArr = bundleNoSet.split(',');
    await this.asyncForEach(setArr, async (item) => {
      const dataArr = item.split('-');
      if (dataArr.length === 1) {
        bundleNos.push(+dataArr[0]);
      } else if (dataArr.length === 2) {
        const startNo = +dataArr[0];
        const endNo = +dataArr[1];
        for (let j = startNo; j <= endNo; j++) {
          bundleNos.push(j);
        }
      }
    });
  }
  return bundleNos;
}

exports.genProductBarcodeNoArr= async (productBarcode, numberFrom, numberTo) => {

  let productBarcodeNoArr = [];
  for(let i = +numberFrom; i <= +numberTo; i++) {
    const num5 = await this.setStrLen(5, i);
    productBarcodeNoArr.push(productBarcode+num5);
  }
  return productBarcodeNoArr;
}

// ShareFunc.getYarnCusOrderIDs(companyID, customerID, season);
exports.getYarnCusOrderIDs= async (companyID, customerID, season) => {
  const orders = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"seasonYear":season},
      {"customerOR.customerID":customerID},
    ] } },
    { $project: {			
        _id: 0,	
        orderID: 1,
        companyID: 1,
    }	},
  ]);
  return orders;
}


exports.editOrderForLossToStyleZone= async (companyID, factoryID, orderID, productBarcode, targetPlace,  forLossQty) => {
  // this.strReplaceAll(barcodeNo.substr(this.targetIDPos, this.targetIDDigit), '-', '');
  // const runningNO = +productBarcodeNo.substr(+process.env.runningNoPos, +process.env.runningNoDigit);
  const productColor = productBarcode.substr(+process.env.colorPos, 2);
  const productSize = await this.strReplaceAll(productBarcode.substr(+process.env.sizePos, +process.env.sizeDigit), '-', '');
  // console.log(productColor, productSize);

  // find order zone list
  const order = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID}
    ] } },
    { $project: {			
        _id: 1,	
        orderID: 1,
        companyID: 1,
        // factoryID: 1,
        // bundleNo: 1,
        orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // orderTargetPlace: 1,	
        // orderColor: 1,
        productOR: 1,	
        // createBy: 1,

    }	},
    { $unwind: "$productOR.productORInfo" },
    { $project: { 
      _id: 0, 
      companyID: 1,	
      orderID: 1,	
      orderStatus: 1,
      // factoryID: "$productOR.factoryID",
      productBarcode: "$productOR.productORInfo.productBarcode",
      targetPlace: "$productOR.productORInfo.targetPlace",
      productColor: "$productOR.productORInfo.productColor",
      productSize: "$productOR.productORInfo.productSize",
      productQty: "$productOR.productORInfo.productQty",
      productLossQty: "$productOR.productORInfo.productLossQty",
      productYear: "$productOR.productORInfo.productYear",
      productSex: "$productOR.productORInfo.productSex",
    }},
    { $match: { $and: [
      // {"factoryID":factoryID},
      {"productColor":productColor},
      {"productSize":productSize},
      {"targetPlace.targetPlaceID":targetPlace.targetPlaceID},
      {"productQty": { $gt: 0}} , 
    ] } },
    { $project: {			
      _id: 1,	
      orderID: 1,
      companyID: 1,
      orderStatus: 1,
      factoryID: 1,	

      productBarcode: 1,	
      targetPlace: 1,
      // customerOR: 1,		
      // orderTargetPlace: 1,	
      productColor: 1,
      productSize: 1,	
      productQty: 1,
      productLossQty: 1,
      productYear: 1,
      productSex: 1,
    }	},
  ]);
  // console.log(order.length, order);
  // console.log(productBarcode );
  const order1 = order.length>0?order[0]:false;
  const forLossQtyTotal = +forLossQty + +order1.productLossQty;
  // console.log('order1 ==== ',order1 );
  // console.log(forLossQtyTotal );
  if (order1) {
    const result1 = await Order.updateOne(
      {$and: [
        {"companyID":companyID},
        {"orderID":order1.orderID}
        // {"factoryID":factoryID},
        // {"nodeID":nodeID},
      ]},
      {$set: { "productOR.productORInfo.$[elem].productLossQty" : forLossQtyTotal}}, 
      {
        multi: true, 
        arrayFilters: [  {
          "elem.productBarcode": order1.productBarcode,  
          "elem.targetPlace.targetPlaceID": order1.targetPlace.targetPlaceID,
          "elem.targetPlace.countryID": order1.targetPlace.countryID,
          "elem.productColor": order1.productColor,
          "elem.productSize": order1.productSize,
        } ] 
      });
  }
  return true;
}

// exports.updateAccJournallist= async (companyID, acID, journal, current) => {
//   const status = 'o'; // ## o= open
//   const journal_id = [journal._id];
//   resultAccJournal = await AccJournal.updateMany(
//     {$and: [
//       {"companyID":companyID} , 
//       {"acID":acID},
//       {"journalID":journal.journalID} , 
//       {"status":status} ,
//     ]},
//     {$set: { "journal.$[elem].editDate" : current, 
//       "journal.$[elem].amount" : journalArr[0].amount, "journal.$[elem].note" : journalArr[0].note}}, 
//     {
//       multi: true,
//       arrayFilters: [  {"elem.lottoBetType": "up2" , "elem.betNumber": upNum2, "elem.cancel": false} ]
//     });
// }

// const editUserUUIDNodeStation = await NodeStation.updateOne(
//   {$and: [
//     {"companyID":companyID},
//     {"factoryID":factoryID},
//     {"nodeID":nodeID},
//   ]},
//   {$set: { "userNode.$[elem].uuid" : uuid}}, 
//   {
//     multi: true, 
//     arrayFilters: [  {"elem.stationID": stationID } ] 
//   });



// ## get 1 order
exports.getOrder= async (companyID, orderID) => {
  // limit = +limit; // ## change to number
  const order = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID}
    ] } },
    { $project: {			
        _id: 1,	
        orderID: 1,
        seasonYear: 1,
        ver: 1,
        companyID: 1,
        factoryID: 1,
        bundleNo: 1,
        orderStatus: 1,
        orderDetail: 1,		
        orderDate: 1,	
        deliveryDate: 1,
        customerOR: 1,		
        orderTargetPlace: 1,	
        orderColor: 1,
        productOR: 1,	
        createBy: 1,
        orderSetting: 1,
    }	}
  ]);
  // console.log(order);
  return order[0]?order[0]:{};
}



// ShareFunc.getOrdersByOrderIDs(companyID, orderIDs);
exports.getOrdersByOrderIDsAll= async (companyID, orderIDs) => {
  // limit = +limit; // ## change to number
  const orders = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}}
    ] } },
    { $project: {			
        _id: 1,	
        orderID: 1,
        seasonYear: 1,
        ver: 1,
        companyID: 1,
        factoryID: 1,
        bundleNo: 1,
        orderStatus: 1,
        orderDetail: 1,		
        orderDate: 1,	
        deliveryDate: 1,
        customerOR: 1,		
        orderTargetPlace: 1,
        orderColor: 1,
        productOR: 1,
        createBy: 1,
        orderSetting: 1,
    }	},
    { $sort: { _id: -1 } }
  ]);
  // console.log(orders);
  return orders;
}

// ShareFunc.getOrderProductionSubNodeFlowCost1(companyID, orderID);
exports.getOrderProductionSubNodeFlowCost1= async (companyID, orderID) => {
  const order = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":orderID},
      // {"productID":productID},
    ] } },
    { $project: { 
      companyID: 1,
      orderID: 1,
      seasonYear: 1,
      ver: 1,
      orderTargetPlace: 1,
      orderColor: 1,
      subNodeFlowCost: "$productOR.subNodeFlowCost",
    } },
  ]);

  // console.log(totalProductionQueueByBarcode);
  return order[0]?order[0]:{};
}

// ## get orders
exports.getOrderStyleByStatus= async (companyID, statusArr) => {
  const orders = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderStatus":{$in: statusArr}} // ## open , close
    ] } },
    { $project: {			
        _id: 1,	
        orderID: 1,
        companyID: 1,
        // factoryID: 1,
        // bundleNo: 1,
        // orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // orderTargetPlace: 1,
        // orderColor: 1,
        // productOR: 1,
        // createBy: 1,
    }	},
    { $sort: { _id: -1 } }
  ]);
  // console.log(orders);
  return orders;
}

exports.getOrderSeasonYears= async (companyID) => {
  const orderSeasonYears = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        seasonYear: 1,
    }	},
    
    { $group: {			
      _id: { 
        companyID: '$companyID',
        seasonYear: '$seasonYear',
    },
      sumSeasonYearQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }},
    { $sort: { "_id.seasonYear": -1 } },
  ]);

  // console.log(orderProductRep);
  const orderSeasonYearsF = await orderSeasonYears.map(fw => ({
    companyID: fw._id.companyID, 
    seasonYear: fw._id.seasonYear,
    // productID: fw._id.productID,
    sumSeasonYearQty: fw.sumSeasonYearQty,
  }));
  // console.log(orderSeasonYearsF);
  return orderSeasonYearsF;
}

// getOrdersFromNode
exports.getOrdersFromNode= async (companyID, statusArr, page, limit) => {
  const orders = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderStatus":{$in: statusArr}},
      // {"seasonYear":{$in: seasonYearArr}}
    ] } },
    { $project: {			
        _id: 1,	
        orderID: 1,
        seasonYear: 1,
        ver: 1,
        companyID: 1,
        factoryID: 1,
        bundleNo: 1,
        orderStatus: 1,
        orderDetail: 1,		
        orderDate: 1,	
        deliveryDate: 1,
        customerOR: 1,		
        orderTargetPlace: 1,
        orderColor: 1,
        productOR: 1,
        createBy: 1,
    }	},
    { $sort: { _id: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);
  // console.log(orders);
  return orders;
}

// ## get orderIDs by seasonYear
exports.getOrderIDsBySeasonYear= async (companyID, orderStatus, seasonYearArr) => {
  // limit = +limit; // ## change to number
  const orderIDs = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderStatus":{$in: orderStatus}},
      {"seasonYear":{$in: seasonYearArr}}
    ] } },
    { $project: {			
        _id: 0,	
        orderID: 1,
        // seasonYear: 1,
        // ver: 1,
        // companyID: 1,
        // factoryID: 1,
        // bundleNo: 1,
        // orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // orderTargetPlace: 1,
        // orderColor: 1,
        // productOR: 1,
        // createBy: 1,
        // orderSetting: 1,
    }	}
  ]);
  // console.log(orderIDs);
  return orderIDs;
}
		
// ## get orders
exports.getOrders= async (companyID, statusArr, page, limit, seasonYearArr) => {
  // limit = +limit; // ## change to number
  const orders = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderStatus":{$in: statusArr}},
      {"seasonYear":{$in: seasonYearArr}}
    ] } },
    { $project: {			
        _id: 1,	
        orderID: 1,
        seasonYear: 1,
        ver: 1,
        companyID: 1,
        factoryID: 1,
        bundleNo: 1,
        orderStatus: 1,
        orderDetail: 1,		
        orderDate: 1,	
        deliveryDate: 1,
        customerOR: 1,		
        orderTargetPlace: 1,
        orderColor: 1,
        productOR: 1,
        createBy: 1,
        orderSetting: 1,
    }	},
    { $sort: { _id: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);
  // console.log(orders);
  return orders;
}

// getOrdersCountFromNode
exports.getOrdersCountFromNode= async (companyID, statusArr) => {
  rows = await Order.countDocuments({$and: [
    {"companyID":companyID},
    {"orderStatus":{$in: statusArr}},
    // {"seasonYear":{$in: seasonYearArr}}
  ]});
  return rows;
}

// ShareFunc.getOrdersCount(companyID);
exports.getOrdersCount= async (companyID, statusArr, seasonYearArr) => {
  rows = await Order.countDocuments({$and: [
    {"companyID":companyID},
    {"orderStatus":{$in: statusArr}},
    {"seasonYear":{$in: seasonYearArr}}
  ]});
  return rows;
}

exports.getOrdersByOrderIDs= async (companyID, orderIDArr, page, limit) => {
  // limit = +limit; // ## change to number
  const orders = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}}
    ] } },
    { $project: {			
        _id: 1,	
        orderID: 1,
        seasonYear: 1,
        ver: 1,
        companyID: 1,
        factoryID: 1,
        bundleNo: 1,
        orderStatus: 1,
        orderDetail: 1,		
        orderDate: 1,	
        deliveryDate: 1,
        customerOR: 1,	
        orderTargetPlace: 1,
        orderColor: 1,
        productOR: 1,

        createBy: 1,
    }	},
    { $sort: { _id: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);
  // console.log(orders);
  return orders;
}

// ShareFunc.getOrderProductionQueueByBundleNo(companyID, orderID);
exports.getOrderProductionQueueByBundleNo= async (companyID, orderID, bundleNo) => {
  const queueInfo = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":orderID},
      // {"productID":productID},
    ] } },
    { $unwind: "$queueInfo" },
    { $project: { 
      companyID: 1,
      orderID: 1,
      productBarcode: "$queueInfo.productBarcode",
      isOutsource: "$queueInfo.isOutsource",
      // queueDate: "$queueInfo.queueDate",
      factoryID: "$queueInfo.factoryID",
      bundleNo: "$queueInfo.bundleNo",
      productCount: "$queueInfo.productCount",
      numberFrom: "$queueInfo.numberFrom",
      numberTo: "$queueInfo.numberTo",
    } },
    { $match: { $and: [
      {"bundleNo":bundleNo},
      // {"factoryID":factoryID},
      // {"orderID":orderID},
      // {"productID":productID},
    ] } },
    { $project: { 
      companyID: 1,
      orderID: 1,
      productBarcode: 1,
      isOutsource: 1,
      // queueDate: 1,
      factoryID: 1,
      bundleNo: 1,
      productCount: 1,
      numberFrom: 1,
      numberTo: 1,
    } },
  ]);

  // console.log(queueInfo);
  return queueInfo[0]?queueInfo[0]:{};
}

// getLastProductionQueue
exports.getLastProductionQueue= async (companyID, orderID, productID, page, limit) => {
  // limit = +limit; // ## change to number
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const queueInfos = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":orderID},
      // {"productID":productID},
    ] } },
    { $unwind: "$queueInfo" },
    { $project: { 
      productBarcode: "$queueInfo.productBarcode",
      isOutsource: "$queueInfo.isOutsource",
      queueDate: "$queueInfo.queueDate",
      factoryID: "$queueInfo.factoryID",
      bundleNo: "$queueInfo.bundleNo",
      bundleID: "$queueInfo.bundleID",
      toNode: "$queueInfo.toNode",
      productCount: "$queueInfo.productCount",
      numberFrom: "$queueInfo.numberFrom",
      numberTo: "$queueInfo.numberTo",
      createBy: "$queueInfo.createBy",
    } },
    { $sort: { bundleNo: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);

  // console.log(queueInfos);
  return queueInfos?queueInfos:[];
}

exports.getOrderQueueList= async (companyID, orderID, productBarcode, page, limit) => {
  // limit = +limit; // ## change to number
  // productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const queueList = await OrderProductionQueueList.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":orderID},
      {"productBarcode":productBarcode},
    ] } },
    { $project: {			
      _id: 1,	
      orderID: 1,
      seasonYear: 1,
      ver: 1,
      companyID: 1,
      factoryID: 1,
      productID: 1,
      productBarcode: 1,
      isOutsource: 1,
      queueDate: 1,		
      forLossQty: 1,	
      toNode: 1,
      numberFrom: 1,
      numberTo: 1,
      bundleNoFrom: 1,
      bundleNoTo: 1,
      yarnLot: 1,
      createBy: 1,
    }	},
    { $sort: { queueDate: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);

  // console.log(queueInfos);
  return queueList?queueList:[];
}

// ShareFunc.getOrderQueueListCount(companyID, orderID, productBarcode);
exports.getOrderQueueListCount= async (companyID, orderID, productBarcode) => {
  rows = await OrderProductionQueueList.countDocuments({$and: [
    {"companyID":companyID},
    // {"factoryID":factoryID},
    {"orderID":orderID},
    {"productBarcode":productBarcode},
  ]});
  return rows;
}

// getOrderQueueSetList(companyID, orderID, productBarcode, page, limit);
exports.getOrderQueueSetList= async (companyID, orderID, page, limit) => {
  // limit = +limit; // ## change to number
  // productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const queueList = await OrderProductionQueueList.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":orderID},
      // {"productBarcode":productBarcode},
    ] } },
    { $project: {			
      _id: 1,	
      orderID: 1,
      seasonYear: 1,
      ver: 1,
      companyID: 1,
      factoryID: 1,
      productID: 1,
      productBarcode: 1,
      isOutsource: 1,
      queueDate: 1,		
      forLossQty: 1,	
      toNode: 1,
      numberFrom: 1,
      numberTo: 1,
      bundleNoFrom: 1,
      bundleNoTo: 1,
      yarnLot: 1,
      outsourceData: 1,
      createBy: 1,
    }	},
    { $sort: { queueDate: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);

  // console.log(queueInfos);
  return queueList?queueList:[];
}

// ShareFunc.getOrderQueueSetListCount(companyID, orderID, productBarcode);
exports.getOrderQueueSetListCount= async (companyID, orderID) => {
  rows = await OrderProductionQueueList.countDocuments({$and: [
    {"companyID":companyID},
    // {"factoryID":factoryID},
    {"orderID":orderID},
    // {"productBarcode":productBarcode},
  ]});
  return rows;
}

// ShareFunc.getLastBundleNoOrderProduction(companyID, ver);
exports.getLastBundleNoOrderProduction= async (companyID, ver) => {
  // ver = 1;
  const maxBundleNoF = await OrderProductionQueueList.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"ver": ver},
      // {$expr: { $eq: [{ $substr: ["$productBarcodeNoReal", 0, 37] }, productBarcode] }}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // ver: 1,
        bundleNoTo: 1,
    }	},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        // ver: '$ver',
      },
      maxBundleNo: { $max: "$bundleNoTo" }
    }}  
  ]).hint( { companyID: 1, bundleNoTo: 1 } );

  // const maxBundleNoF = await OrderProduction.aggregate([
  //   { $match: { $and: [
  //     {"companyID":companyID},
  //     {"ver": ver},
  //     // {$expr: { $eq: [{ $substr: ["$productBarcodeNoReal", 0, 37] }, productBarcode] }}
  //   ] } },
  //   { $project: {			
  //       _id: 0,	
  //       companyID: 1,
  //       ver: 1,
  //       bundleNo: 1,
  //   }	},

  //   { $group: {			
  //     _id: { 
  //       companyID: '$companyID',
  //       ver: '$ver',
  //     },
  //     maxBundleNo: { $max: "$bundleNo" }
  //   }}  
  // ]).hint( { companyID: 1, ver: 1 } );

  // console.log('ver= ', ver);
  // console.log(maxBundleNoF);
  return maxBundleNoF.length > 0 ? +maxBundleNoF[0].maxBundleNo : 0;
}

// const runningNo = await ShareFunc.getLastRunningNoOrderProduction(companyID, orderID, productID, productBarcode);
exports.getLastRunningNoOrderProduction= async (companyID, orderID, productID, productBarcode) => {
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const orderProduction = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      // {"productID":productID},
    ] } },
    { $project: { 
      productBarcode: { $substr: [ "$productBarcodeNoReal", 0, 37 ] },	
      barcodeNo: { $substr: [ "$productBarcodeNoReal", 37, 5 ] },	
      // queueDate: "$queueInfo.queueDate",
      // factoryID: "$queueInfo.factoryID",
      // toNode: "$queueInfo.toNode",
      productCount: "$queueInfo.productCount",
      numberFrom: "$queueInfo.numberFrom",
      numberTo: "$queueInfo.numberTo",
      // createBy: "$queueInfo.createBy",
    } },
    { $match: { $and: [
      {"productBarcode":productBarcode},
    ] } },
      { $project: {			
      _id: 0,			
      productBarcode: 1,		
      barcodeNo: 1,										
    }	},
    { $sort: { barcodeNo: -1 } },
    { $limit: 1 }
  ]).hint( { companyID: 1, orderID: 1, productBarcodeNoReal: 1 } );
  // console.log(orderProduction);

  let runningNo = 0;
  if (orderProduction.length > 0) {
    runningNo = +orderProduction[0].barcodeNo;
  }

  // console.log(orderProduction);
  return runningNo;
}

exports.getTotalProductionQueue= async (companyID, orderID, productID) => {
  // limit = +limit; // ## change to number
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const totalProductionQueueAll = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":orderID},
      // {"productID":productID},
    ] } },
    { $unwind: "$queueInfo" },
    { $project: { 
      companyID: 1,
      // queueDate: "$queueInfo.queueDate",
      // factoryID: "$queueInfo.factoryID",
      // toNode: "$queueInfo.toNode",
      productCount: "$queueInfo.productCount",
      // numberFrom: "$queueInfo.numberFrom",
      // numberTo: "$queueInfo.numberTo",
      // createBy: "$queueInfo.createBy",
    } },
    { $group: {			
      _id: { companyID: "$companyID"},
      countProductionQueueAll: {$sum: 1} ,
      sumProductionQueueAll: {$sum:  '$productCount'} ,
    }	},
  ]).hint( { companyID: 1, orderID: 1, productBarcodeNoReal: 1 } );

  // console.log(totalProductionQueueByBarcode);
  return totalProductionQueueAll.length>0?totalProductionQueueAll:[];
}



// // ShareFunc.getProductionQueuedQtySum(companyID, orderID, productID, productBarcode);
// exports.getProductionQueuedQtySum= async (companyID, orderID, productID, productBarcode) => {
//   // limit = +limit; // ## change to number
//   productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
//   const queueInfos = await OrderProductionQueue.aggregate([
//     { $match: { $and: [
//       {"companyID":companyID},
//       // {"factoryID":factoryID},
//       {"orderID":orderID},
//       {"productID":productID},
//     ] } },
//     { $unwind: "$queueInfo" },
//     { $project: { 
//       productBarcode: "$queueInfo.productBarcode",
//       // queueDate: "$queueInfo.queueDate",
//       // factoryID: "$queueInfo.factoryID",
//       // bundleNo: "$queueInfo.bundleNo",
//       // bundleID: "$queueInfo.bundleID",
//       // toNode: "$queueInfo.toNode",
//       productCount: "$queueInfo.productCount",
//       // numberFrom: "$queueInfo.numberFrom",
//       // numberTo: "$queueInfo.numberTo",
//       // createBy: "$queueInfo.createBy",
//     } },
//     { $match: { $and: [
//       {"productBarcode":productBarcode},
//     ] } },
//     { $project: { 
//       productBarcode: 1,
//       // queueDate: 1,
//       // factoryID: 1,
//       // bundleNo: 1,
//       // bundleID: 1,
//       // toNode: 1,
//       productCount: 1,
//       // numberFrom: 1,
//       // numberTo: 1,
//       // createBy: 1,
//     } },
//     { $group: {			
//       _id: { productBarcode: "$productBarcode"},
//       countProductionQueuedBundle: {$sum: 1} ,
//       sumProductionQueued: {$sum:  '$productCount'} ,
//     }	},
//   ]);

//   // console.log(queueInfos);
//   return queueInfos?queueInfos:[];
// }

// ShareFunc.getLastProductionQueueByBarcodeNo(companyID, orderID, productID, limit)
exports.getLastProductionQueueByBarcode= async (companyID, orderID, productID, productBarcode, page, limit) => {
  // limit = +limit; // ## change to number
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const queueInfos = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":orderID},
      // {"productID":productID},
    ] } },
    { $unwind: "$queueInfo" },
    { $project: { 
      productBarcode: "$queueInfo.productBarcode",
      queueDate: "$queueInfo.queueDate",
      factoryID: "$queueInfo.factoryID",
      bundleNo: "$queueInfo.bundleNo",
      bundleID: "$queueInfo.bundleID",
      toNode: "$queueInfo.toNode",
      productCount: "$queueInfo.productCount",
      numberFrom: "$queueInfo.numberFrom",
      numberTo: "$queueInfo.numberTo",
      createBy: "$queueInfo.createBy",
    } },
    { $match: { $and: [
      {"productBarcode":productBarcode},
    ] } },
    { $project: { 
      productBarcode: 1,
      queueDate: 1,
      factoryID: 1,
      bundleNo: 1,
      bundleID: 1,
      toNode: 1,
      productCount: 1,
      numberFrom: 1,
      numberTo: 1,
      createBy: 1,
    } },
    { $sort: { numberTo: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);

  // console.log(queueInfos);
  return queueInfos?queueInfos:[];
}

exports.getProductionQueueCFN= async (companyID, factoryID, page, limit) => {
  // limit = +limit; // ## change to number
  const queueInfos = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"orderID":orderID},
      // {"productID":productID},
    ] } },
    { $unwind: "$queueInfo" },
    { $project: { 
      companyID: 1,
      orderID: 1,
      productID: 1,
      productBarcode: "$queueInfo.productBarcode",
      queueDate: "$queueInfo.queueDate",
      factoryID: "$queueInfo.factoryID",
      bundleNo: "$queueInfo.bundleNo",
      bundleID: "$queueInfo.bundleID",
      toNode: "$queueInfo.toNode",
      productCount: "$queueInfo.productCount",
      numberFrom: "$queueInfo.numberFrom",
      numberTo: "$queueInfo.numberTo",
      createBy: "$queueInfo.createBy",
    } },
    { $match: { $and: [
      {"factoryID":factoryID},
    ] } },
    { $project: { 
      companyID: 1,
      orderID: 1,
      productID: 1,
      productBarcode: 1,
      queueDate: 1,
      factoryID: 1,
      bundleNo: 1,
      bundleID: 1,
      toNode: 1,
      productCount: 1,
      numberFrom: 1,
      numberTo: 1,
      createBy: 1,
    } },
    { $sort: { queueDate: -1,  bundleNo: -1} },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);

  // console.log(queueInfos);
  return queueInfos?queueInfos:[];
}

// getTotalProductionQueueByBarcode
exports.getTotalProductionQueueByBarcode= async (companyID, orderID, productID, productBarcode) => {
  // limit = +limit; // ## change to number
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const totalProductionQueueByBarcode = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":orderID},
      // {"productID":productID},
    ] } },
    { $unwind: "$queueInfo" },
    { $project: { 
      productBarcode: "$queueInfo.productBarcode",
      queueDate: "$queueInfo.queueDate",
      factoryID: "$queueInfo.factoryID",
      toNode: "$queueInfo.toNode",
      productCount: "$queueInfo.productCount",
      numberFrom: "$queueInfo.numberFrom",
      numberTo: "$queueInfo.numberTo",
      createBy: "$queueInfo.createBy",
    } },
    { $match: { $and: [
      {"productBarcode":productBarcode},
    ] } },
    { $project: { 
      productBarcode: 1,
      queueDate: 1,
      factoryID: 1,
      toNode: 1,
      productCount: 1,
      numberFrom: 1,
      numberTo: 1,
      createBy: 1,
    } },
    { $group: {			
      _id: { productBarcode: "$productBarcode"},
      countProductionQueueByBarcode: {$sum: 1} ,
      sumProductionQueueByBarcode: {$sum:  '$productCount'} ,
    }	},
  ]);

  // console.log(totalProductionQueueByBarcode);
  return totalProductionQueueByBarcode.length>0?totalProductionQueueByBarcode:[];
}

exports.getProductionQueueCountByBundleNo= async (companyID, orderID, startNo, endNo) => {
  // limit = +limit; // ## change to number
  // productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const totalProductionQueueByBundleNo = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      // {"datetime": { $gte: dateStart}} , 
      // {"datetime": { $lte : dateEnd}} ,
    ] } },
    { $unwind: "$queueInfo" },
    { $project: { 
      companyID: 1,
      orderID: 1,
      // productBarcode: "$queueInfo.productBarcode",
      // queueDate: "$queueInfo.queueDate",
      // factoryID: "$queueInfo.factoryID",
      bundleNo: "$queueInfo.bundleNo",
      productCount: "$queueInfo.productCount",
      // numberFrom: "$queueInfo.numberFrom",
      // numberTo: "$queueInfo.numberTo",
      // createBy: "$queueInfo.createBy",
    } },

    { $match: { $and: [
      {"bundleNo": { $gte: startNo}} , 
      {"bundleNo": { $lte : endNo}} ,
    ] } },
    { $project: { 
      companyID: 1,
      orderID: 1,
      // productBarcode: 1,
      bundleNo: 1,
      productCount: 1,
      // queueDate: 1,
      // factoryID: 1,
      // toNode: 1,
      // numberFrom: 1,
      // numberTo: 1,
      // createBy: 1,
    } },
    { $group: {			
      _id: { 
        companyID: "$companyID",
        orderID: "$orderID",
      },
      countProductionQueueByBundleNo: {$sum: 1} ,
      sumProductionQueueByBundleNo: {$sum:  '$productCount'} ,
    }	},
  ]);
  // console.log(totalProductionQueueByBundleNo);

  const totalProductionQueueByBundleNoF = await totalProductionQueueByBundleNo.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    countProductionQueueByBundleNo: fw.countProductionQueueByBundleNo,
    sumProductionQueueByBundleNo: fw.sumProductionQueueByBundleNo,
  }));
  // console.log(totalProductionQueueByBundleNo);
  return totalProductionQueueByBundleNoF.length>0?totalProductionQueueByBundleNoF[0]:[];
}

// ShareFunc.getProductionQueueListByBundleNo(companyID, orderID, startNo, endNo)
exports.getProductionQueueListByBundleNo= async (companyID, orderID, startNo, endNo) => {
  // limit = +limit; // ## change to number
  // productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const orderProductionQueue = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      // {"datetime": { $gte: dateStart}} , 
      // {"datetime": { $lte : dateEnd}} ,
    ] } },
    { $unwind: "$queueInfo" },
    { $project: { 
      companyID: 1,
      orderID: 1,
      productBarcode: "$queueInfo.productBarcode",
      // queueDate: "$queueInfo.queueDate",
      bundleNo: "$queueInfo.bundleNo",
      productCount: "$queueInfo.productCount",
      yarnLot: "$queueInfo.yarnLot",
      numberFrom: "$queueInfo.numberFrom",
      numberTo: "$queueInfo.numberTo",
      // createBy: "$queueInfo.createBy",
      forLossQty: "$queueInfo.forLossQty",
    } },

    { $match: { $and: [
      {"bundleNo": { $gte: startNo}} , 
      {"bundleNo": { $lte : endNo}} ,
    ] } },
    { $project: { 
      companyID: 1,
      orderID: 1,
      productBarcode: 1,
      bundleNo: 1,
      productCount: 1,
      yarnLot: 1,
      // toNode: 1,
      numberFrom: 1,
      numberTo: 1,
      forLossQty: 1,
    } },

  ]);

  // console.log(orderProductionQueue);
  return orderProductionQueue;
}

exports.getProductionQueueListByBundleNoXXX= async (companyID, orderID, startNo, endNo) => {
  const orderProductionQueue = await OrderProductionQueueList.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      {"bundleNoFrom": { $gte: startNo}} ,  // bundleNo
      {"bundleNoTo": { $lte : endNo}} ,
    ] } },
    // { $unwind: "$queueInfo" },
    { $project: { 
      companyID: 1,
      orderID: 1,
      seasonYear: 1,
      ver: 1,
      productBarcode: 1,
      // queueDate: "$queueInfo.queueDate",
      // bundleNo: 1,
      productCount: 1,
      yarnLot: 1,
      numberFrom: 1,
      numberTo: 1,
      bundleNoFrom: 1,
      bundleNoTo: 1,
      // createBy: "$queueInfo.createBy",
      forLossQty: 1,
    } },
  ]);

  // console.log(orderProductionQueue);
  return orderProductionQueue;
}

exports.getTotalProductionQueued= async (companyID, orderID, productID) => {
  // limit = +limit; // ## change to number
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const totalProductionQueueByBarcode = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":orderID},
      // {"productID":productID},
    ] } },
    { $unwind: "$queueInfo" },
    { $project: { 
      productBarcode: "$queueInfo.productBarcode",
      forLoss: "$queueInfo.forLoss",
      // queueDate: "$queueInfo.queueDate",
      // factoryID: "$queueInfo.factoryID",
      // toNode: "$queueInfo.toNode",
      productCount: "$queueInfo.productCount",
      // numberFrom: "$queueInfo.numberFrom",
      // numberTo: "$queueInfo.numberTo",
      // createBy: "$queueInfo.createBy",
    } },
    // { $match: { $and: [
    //   {"productBarcode":productBarcode},
    // ] } },
    // { $project: { 
    //   productBarcode: 1,
    //   queueDate: 1,
    //   factoryID: 1,
    //   toNode: 1,
    //   productCount: 1,
    //   numberFrom: 1,
    //   numberTo: 1,
    //   createBy: 1,
    // } },
    { $group: {			
      _id: { 
        productBarcode: "$productBarcode",
        forLoss: "$forLoss",
      },
      countProductionQueueByBarcode: {$sum: 1} ,
      sumProductionQueueByBarcode: {$sum:  '$productCount'} ,
    }	},
  ]);

  // console.log(totalProductionQueueByBarcode);
  return totalProductionQueueByBarcode.length>0?totalProductionQueueByBarcode:[];
}

exports.getTotalRowsProductionQueueByFactoryProductIDs= async (companyID, factoryID, productIDArr) => {
  // limit = +limit; // ## change to number
  // const productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  let i = 0;
  await this.asyncForEach(productIDArr, async (item1) => {
    // item1 = await this.setBackStrLen(process.env.productIDLen, item1, ' ');
    item1 = item1.trim();
    i++;
  });
  // console.log(productIDArr);
  const countProductionQueueAll = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"orderID":orderID},
      // {"productID":{$in: productIDArr}},
      {"orderID":{$in: productIDArr}},
    ] } },
    { $unwind: "$queueInfo" },
    { $project: { 
      _id: 1,
      productBarcode: "$queueInfo.productBarcode",
      queueDate: "$queueInfo.queueDate",
      factoryID: "$queueInfo.factoryID",
      toNode: "$queueInfo.toNode",
      productCount: "$queueInfo.productCount",
      numberFrom: "$queueInfo.numberFrom",
      numberTo: "$queueInfo.numberTo",
      createBy: "$queueInfo.createBy",
    } },
    { $match: { $and: [
      {"factoryID":factoryID},
    ] } },
    { $project: { 
      _id: 1,
      productBarcode: 1,
      queueDate: 1,
      factoryID: 1,
      toNode: 1,
      productCount: 1,
      numberFrom: 1,
      numberTo: 1,
      createBy: 1,
    } },
    { $group: { _id: null, count: { $sum: 1 } } } // ## count record all 
    // { $group: {			
    //   _id: { _id: "$_id"},
    //   countProductionQueueByBarcode: {$sum: 1} ,
    //   sumProductionQueueByBarcode: {$sum:  '$productCount'} ,
    // }	},
  ]);

  // console.log(countProductionQueueAll);
  let rows = 0;
  if (countProductionQueueAll.length > 0 ) {
    rows = countProductionQueueAll[0].count;
  }
  return rows;
}

// ShareFunc.getCOrderProductionBundleNos(companyID, productBarcodeNo);
exports.getCOrderProductionBundleNos= async (companyID, productBarcodeNoArr) => {
  // productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  // limit = +limit; // ## change to number
  const orderProductionBundleNos = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"orderID":orderID},
      // {"productID":productID},
      {"productBarcodeNoReal":{$in: productBarcodeNoArr}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        bundleNo: 1,
        isOutsourceTracking:1,
    }	}
  ]).hint( { companyID: 1, productBarcodeNoReal: 1 } );
  // console.log(orderProductionBundleNos);
  return orderProductionBundleNos;
}

exports.getOrderProductionbyBundleNo= async (companyID, orderID, bundleNo) => {
  const orderProduct = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      {"bundleNo":bundleNo},
      // {"productBarcodeNo":productBarcodeNo},
      // {"productBarcodeNoReal":{$in: productBarcodeNos}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        // outsourceData: 1,
        subNodeFlow: 1,
        productionNode: 1
    }	}
  ]).hint( {"companyID" : 1, "orderID": 1, "bundleNo": 1, "bundleID": 1} );

  return orderProduct;
}

// getProductBarcodeNosOrderProductionbyBundleNo
exports.getProductBarcodeNosOrderProductionbyBundleNo= async (companyID, orderID, bundleNos, productCount) => {
  const orderProduction = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      // {"bundleNo":bundleNo},
      // {"open":open},
      // {"productCount":productCount},
      // {"isOutsourceTracking":isOutsourceTracking},
      // {"productStatus":{$in: productStatusArr}},
      {"bundleNo":{$in: bundleNos}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        orderID: 1,	
        bundleNo: 1,
        productCount: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,

        // open: 1,		
        // isOutsourceTracking:1,
        // productStatus: 1,
        // productBarcodeNoReal: 1,
    }	}
  ]).hint( { companyID : 1, orderID: 1, bundleNo: 1, bundleID: 1 } );
  // console.log(orderProduction);

  // let ProductBarcodeNos = [];
  const ProductBarcodeNos = await orderProduction.map(fw => ({
    productBarcodeNoReal: fw.productBarcodeNoReal, 
    bundleNo: fw.bundleNo,
  }));

  return ProductBarcodeNos;

}

// checkExistOrderProductionbyBundleNo
exports.checkExistOrderProductionbyBundleNo= async (companyID, orderID, bundleNos) => {
  // productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  // limit = +limit; // ## change to number
  const orderProductionBundleNo = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      // {"bundleNo":bundleNo},
      // {"productCount":productCount},
      {"bundleNo":{$in: bundleNos}},
      // {"productStatus":{$in: productStatusArr}},
      // {"isOutsourceTracking":isOutsourceTracking},
      // {"open":open},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        orderID: 1,	
        bundleNo: 1,
        open: 1,		
        productCount: 1,
        isOutsourceTracking:1,
        productStatus: 1,
        productionNode: 1,
        // productBarcodeNoReal: 1,
    }	}
  ]).hint( { companyID : 1, orderID: 1, bundleNo: 1, bundleID: 1 } );
  // console.log(orderProductionBundleNo);
  return orderProductionBundleNo;
}

// getCSZCSOrderProductionBundleNos(companyID, orderIDs, zoneArr, colorArr, sizeArr)
exports.getCSZCSOrderProductionBundleNos= async (companyID, orderIDs, isOutsourceTracking1, 
    productionNodeStatusArr, nodeIDs) => {

  const orderProduction1 = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"isOutsourceTracking":isOutsourceTracking1},
      {"orderID":{$in: orderIDs}},

      // {"productionNode":  {$elemMatch: {"status":{$in: productionNodeStatusArr}}}},
      // { $expr: { $in: [{ "$arrayElemAt": ["$productionNode.status", -1] }, productionNodeStatusArr] } },
      
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // productID: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        bundleNo: 1,  // ## system running no
        // bundleID: 1,
        productCount: 1,
        isOutsourceTracking: 1,
        // productionNode: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},

    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      productCount: 1,
      isOutsourceTracking: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},

      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      status: "$productionNode.status",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      // {"targetPlace":{$in: zoneArr}},
      // {"color":{$in: colorArr}},
      // {"size":{$in: sizeArr}},
      {"status":{$in: productionNodeStatusArr}},
      // {"fromNode":{$in: nodeIDs}},
      // {"status":productionNodeStatusArr},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,	
      orderID: 1,
      bundleNo: 1,
      nodeID: "$fromNode",
      productCount: 1,
      isOutsourceTracking: 1,
      targetPlace: 1,
      color: 1,
      size: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        bundleNo: '$bundleNo',
        productCount: '$productCount',
        nodeID: '$nodeID',
        isOutsourceTracking: '$isOutsourceTracking',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
    },
      // countProductQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  

  ])
  .hint( { companyID: 1, orderID: 1, "productionNode.status": 1 } );
  

  // console.log(orderProduction1);
  const orderProduction1F = await orderProduction1.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    bundleNo: fw._id.bundleNo,
    productCount: fw._id.productCount,
    nodeID: fw._id.nodeID,
    isOutsourceTracking: fw._id.isOutsourceTracking,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    size: fw._id.size,
    // productID: fw._id.productID,
    // countProductQty: fw.countProductQty,
  }))
  
  
  // console.log(orderProduction1F);
  return orderProduction1F;
}

exports.getCSZCSOrderProductionBundleNosByBundleNo= async (companyID, orderIDs, isOutsourceTracking1, 
  productionNodeStatusArr, nodeIDs, bundleNos) => {

  const orderProduction1 = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"isOutsourceTracking":isOutsourceTracking1},
      {"orderID":{$in: orderIDs}},
      {"bundleNo":{$in: bundleNos}},
      
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // productID: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        bundleNo: 1,  // ## system running no
        // bundleID: 1,
        productCount: 1,
        isOutsourceTracking: 1,
        productionNode: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},

    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      productCount: 1,
      isOutsourceTracking: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},

      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      status: "$productionNode.status",
      isTracking: "$productionNode.isTracking",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      // {"targetPlace":{$in: zoneArr}},
      // {"color":{$in: colorArr}},
      // {"size":{$in: sizeArr}},
      {"status":{$in: productionNodeStatusArr}},
      // {"fromNode":{$in: nodeIDs}},
      // {"status":productionNodeStatusArr},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,	
      orderID: 1,
      bundleNo: 1,
      nodeID: "$fromNode",
      productCount: 1,
      isOutsourceTracking: 1,
      targetPlace: 1,
      color: 1,
      size: 1,
      isTracking: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        // factoryID: '$factoryID',
        orderID: '$orderID',
        bundleNo: '$bundleNo',
        productCount: '$productCount',
        nodeID: '$nodeID',
        isOutsourceTracking: '$isOutsourceTracking',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        isTracking: '$isTracking',
    },
      // countProductQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  

  ])
  .hint( { companyID: 1, orderID: 1, bundleNo: 1, "productionNode.status": 1 } );


  // console.log(orderProduction1);
  const orderProduction1F = await orderProduction1.map(fw => ({
    companyID: fw._id.companyID, 
    // factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    bundleNo: fw._id.bundleNo,
    productCount: fw._id.productCount,
    nodeID: fw._id.nodeID,
    isOutsourceTracking: fw._id.isOutsourceTracking,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    size: fw._id.size,
    isTracking: fw._id.isTracking,
    // productID: fw._id.productID,
    // countProductQty: fw.countProductQty,
  }))


  // console.log(orderProduction1F);
  return orderProduction1F;
}

exports.getOrderProductbundleID= async (companyID, orderID, ver, productBarcodeNoReal) => {
  const orderProduction1 = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      {"productBarcodeNoReal":productBarcodeNoReal},
      {"ver":ver},
      // {"orderID":{$in: orderIDs}},
      // {"bundleNo":{$in: bundleNos}},
      // {"productionNode":  {$elemMatch: {"fromNode":{$in: nodeIDs}}}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // productID: 1,
        productBarcodeNoReal: 1,
        bundleID: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // bundleNo: 1,  // ## system running no
        // productCount: 1,
        // isOutsourceTracking: 1,
        // productionNode: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
  ])
  .hint( {"companyID" : 1, "orderID": 1, "productBarcodeNoReal": 1} );
  return orderProduction1.length>0?orderProduction1[0].bundleID:'';
}

// getCSZCSOrderProductOutsourceTrackingFlowseqs
exports.getCSZCSOrderProductOutsourceTrackingFlowseqs= async (companyID, orderIDs, isOutsourceTracking, bundleNos, nodeIDs, statusArr) => {
  const orderProduction1 = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: orderIDs}},
      {"bundleNo":{$in: bundleNos}},
      {"isOutsourceTracking":isOutsourceTracking},

      // {"productionNode":  {$elemMatch: {"fromNode":{$in: nodeIDs}}}},
      {"productionNode":  {$elemMatch: {
        "fromNode": {$in: nodeIDs}, 
        "status": {$in: statusArr},     
      }}},


    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // productID: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        bundleNo: 1,  // ## system running no
        // bundleID: 1,
        productCount: 1,
        isOutsourceTracking: 1,
        productionNode: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},

    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      productCount: 1,
      isOutsourceTracking: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},

      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      status: "$productionNode.status",
      isTracking: "$productionNode.isTracking",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      // {"targetPlace":{$in: zoneArr}},
      // {"color":{$in: colorArr}},
      // {"size":{$in: sizeArr}},
      {"fromNode":{$in: nodeIDs}},
      {"status":{$in: statusArr}},
      // {"status":productionNodeStatusArr},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,	
      orderID: 1,
      bundleNo: 1,
      nodeID: "$fromNode",
      productCount: 1,
      isOutsourceTracking: 1,
      targetPlace: 1,
      color: 1,
      size: 1,
      isTracking: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      status: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        bundleNo: '$bundleNo',
        productCount: '$productCount',
        nodeID: '$nodeID',
        isOutsourceTracking: '$isOutsourceTracking',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        status: '$status',
        isTracking: '$isTracking',
    },
      // countProductQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  

  ])
  .hint( {"companyID" : 1, "orderID": 1, "bundleNo": 1, "isOutsourceTracking": 1, "productionNode.fromNode": 1, "productionNode.status": 1} );

  // console.log(orderProduction1);
  const orderProduction1F = await orderProduction1.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    bundleNo: fw._id.bundleNo,
    productCount: fw._id.productCount,
    nodeID: fw._id.nodeID,
    isOutsourceTracking: fw._id.isOutsourceTracking,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    size: fw._id.size,
    status: fw._id.status,
    isTracking: fw._id.isTracking,
    // productID: fw._id.productID,
    // countProductQty: fw.countProductQty,
  }));
  // console.log(orderProduction1F);
  return orderProduction1F;
}

// checkBundleNoExisted(companyID, orderID, productBarcode, bundleNos)
exports.checkBundleNoExisted= async (companyID, orderID, productBarcode, bundleNos, ver) => {
  const orderIDs = [orderID];
  // console.log(bundleNos);
  const OrderProductionRow = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"ver":ver},
      // {"orderID":{$in: orderIDs}},
      {"bundleNo":{$in: bundleNos}},
    ] } },
    { $unwind: "$queueInfo"},
    { $project: {		
      _id: 1,	
      companyID: 1,	
      // orderID: 1,	
      // productBarcodeNo: 1,	
      // productBarcode: "$queueInfo.productBarcode",	
      bundleNo: 1,	
      // toNode: "$queueInfo.toNode",	
    }	},
    // { $match: { $and: [
    //   // {"productBarcode":productBarcode},
    //   {"bundleNo":{$in: bundleNos}},
    // ] } },
    // { $project: {		
    //   _id: 1,	
    //   companyID: 1,	
    //   orderID: 1,	
    //   // productBarcodeNo: 1,	
    //   // productBarcode: 1,	
    //   bundleNo: 1,	
    //   // toNode: "$queueInfo.toNode",	
    // }	},
  ]).hint( {"companyID" : 1, "ver": 1, "bundleNo": 1} );
  // console.log(OrderProductionRow);
  if (OrderProductionRow.length > 0) {
    return true; // ## existed
  } else {
    return false; // ## not existed
  }
}

// checkExistOrderProductionByBarcodeNo
// checkExistOrderProductionByBarcodeNo(companyID, factoryID, orderID, productID, productBarcodeNo);
exports.checkExistOrderProductionByBarcodeNo= async (companyID, factoryID, orderID, productID, productBarcodeNo) => {
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  // limit = +limit; // ## change to number
  const existed = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"orderID":orderID},
      // {"productID":productID},
      {"productBarcodeNoReal":{$in: productBarcodeNo}},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
    }	},
    { $limit: 1 }
  ]).hint( {"companyID" : 1, "factoryID": 1, "orderID": 1, "productBarcodeNoReal": 1} );
  // console.log(existed);
  return existed.length>0?true:false;
}

// ## order zone ####################################################################
// #################################################################################


// #################################################################################
// ## yarn zone ####################################################################

exports.getYarnPlanDateGroup= async (companyID, factoryID, customerID, yarnSeasonID, uuidArr, type) => {
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      {"uuid":{$in: uuidArr}},
    ] } },
    { $project: {			
        _id: 0,	
        // companyID: 1,
        // factoryID: 1,		
        // customerID: 1,	
        // yarnSeasonID: 1,
        uuid: 1,
        // yarnID: 1,		
        yarnDataInfo: 1,
    }	},
    { $unwind: "$yarnDataInfo" },
    { $project: { _id: 0, 
      // companyID: 1,
      // factoryID: 1,		
      // customerID: 1,	
      // yarnSeasonID: 1,
      uuid: 1,
      // yarnID: 1,
      datetime: "$yarnDataInfo.datetime",
      // yarnColorID: "$yarnDataInfo.yarnColorID",
      type: "$yarnDataInfo.type",
      // toFactoryID: "$yarnDataInfo.toFactoryID",
    }},
    { $match: { $and: [
      // {"datetime":datetime},
      // {"yarnColorID":yarnColorID},
      // {"type":type},
      {"type":{$in: type}},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
      _id: 0,	
      // companyID: 1,
      // factoryID: 1,		
      // customerID: 1,	
      // yarnSeasonID: 1,
      uuid: 1,
      // yarnID: 1,		
      // yarnDataInfo: 1,
      // datetime: 1,
      // yarnColorID: 1,
      type: 1,		
      // toFactoryID: 1,
      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
    }	},
    { $group: {			
      _id: { 
        mmdd: '$mmdd',
        yyyymmdd: '$yyyymmdd',
        type: '$type',
    },
      // sumProductQty: {$sum: 1} ,
    }},
    { $sort: { "_id.yyyymmdd": 1 } },
  ]);
  const yarnDataF = await yarnData.map(fw => ({
    type: fw._id.type, 
    mmdd: fw._id.mmdd, 
    yyyymmdd: fw._id.yyyymmdd,
    // productID: fw._id.productID,
    // style: fw._id.style,
    // countQty: fw.countQty,
  }));
  // console.log(yarnDataF);
  return yarnDataF;
}

// getYarnPlanDataInfo2
exports.getYarnPlanDataInfo2= async (companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, 
  yarnDataUUID, yarnColorID, type, toFactoryID) => {
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      {"uuid":uuid},
      {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        uuid: 1,
        yarnID: 1,		
        yarnDataInfo: 1,
        
    }	},
    { $unwind: "$yarnDataInfo" },
    { $project: { _id: 0, 
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,
      yarnDataUUID: "$yarnDataInfo.yarnDataUUID",
      datetime: "$yarnDataInfo.datetime",
      yarnColorID: "$yarnDataInfo.yarnColorID",
      type: "$yarnDataInfo.type",
      toFactoryID: "$yarnDataInfo.toFactoryID",
      packageInfo: "$yarnDataInfo.packageInfo",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      {"yarnDataUUID":yarnDataUUID},
      {"yarnColorID":yarnColorID},
      {"type":type},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      yarnDataInfo: 1,
      datetime: 1,
      yarnColorID: 1,
      type: 1,		
      toFactoryID: 1,
      packageInfo:1,
      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
  }	},
  ]);
  // console.log(yarnData);
  return yarnData;
}

// getYarnLotBoxLists
exports.getYarnLotBoxLists= async (companyID, yarnSeasonID, yarnID, uuid, yarnColorID, invoiceID, yarnLotID, yarnLotUUID, type, boxUUIDArr) => {
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"yarnSeasonID":yarnSeasonID},
      {"uuid":uuid},
      {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // customerID: 1,	
        yarnSeasonID: 1,
        uuid: 1,
        yarnID: 1,		
        // orderID: 1,
        // colorS: 1,
        yarnDataInfo: 1,
    }	},
    { $unwind: "$yarnDataInfo" },
    { $project: { _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      // orderID: 1,
      // colorS: 1,
      datetime: "$yarnDataInfo.datetime",
      yarnDataUUID: "$yarnDataInfo.yarnDataUUID",
      yarnColorID: "$yarnDataInfo.yarnColorID",
      type: "$yarnDataInfo.type",
      // fromFactoryID: "$yarnDataInfo.fromFactoryID",
      // toFactoryID: "$yarnDataInfo.toFactoryID",
      packageInfo: "$yarnDataInfo.packageInfo",
    }},

    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      // {"datetime":datetime},
      {"yarnColorID":yarnColorID},
      {"type":type},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"type":{$in: type}},
    ] } },
    { $unwind: "$packageInfo" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      // factoryID: 1,		
      // customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      // orderID: 1,
      // colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      // fromFactoryID: 1,
      // toFactoryID: 1,

      invoiceID: "$packageInfo.invoiceID",
      yarnLotID: "$packageInfo.yarnLotID",
      yarnLotUUID: "$packageInfo.yarnLotUUID",
      coneWeight: "$packageInfo.coneWeight",
      boxWeight: "$packageInfo.boxWeight",
      yarnBoxInfo: "$packageInfo.yarnBoxInfo",

      datetime: 1,
      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
    }	},

    { $match: { $and: [
      {"invoiceID":invoiceID},
      {"yarnLotID":yarnLotID},
      {"yarnLotUUID":yarnLotUUID},
      // {"status":{$in: status}},
    ] } },
    { $unwind: "$yarnBoxInfo" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      // factoryID: 1,		
      // customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      // orderID: 1,
      // colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      // fromFactoryID: 1,
      // toFactoryID: 1,

      invoiceID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      coneWeight: 1,
      boxWeight: 1,

      // datetime: 1,
      // yyyymmdd: 1,
      // mmdd: 1,

      boxID: "$yarnBoxInfo.boxID",
      boxUUID: "$yarnBoxInfo.boxUUID",
      factoryIDBox: "$yarnBoxInfo.factoryID",
      yarnPlanWeight: "$yarnBoxInfo.yarnPlanWeight",
      yarnWeight: "$yarnBoxInfo.yarnWeight",
      useWeight: "$yarnBoxInfo.useWeight",
      weightVerified: "$yarnBoxInfo.weightVerified",
      used: "$yarnBoxInfo.used",
      coneQty: "$yarnBoxInfo.coneQty",
      yarnWeightNet: "$yarnBoxInfo.yarnWeightNet",
      yarnTransferWeight: "$yarnBoxInfo.yarnTransferWeight",
    }	},

    { $match: { $and: [
      // {"boxID":boxIDNew},
      // {"yarnLotUUID":yarnLotUUID},
      {"boxUUID":{$in: boxUUIDArr}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      // factoryID: 1,		
      // customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      // orderID: 1,
      // colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      // fromFactoryID: 1,
      // toFactoryID: 1,

      invoiceID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      coneWeight: 1,
      boxWeight: 1,

      // datetime: 1,
      // yyyymmdd: 1,
      // mmdd: 1,

      boxID: 1,
      boxUUID: 1,
      factoryIDBox: 1,
      yarnPlanWeight: 1,
      yarnWeight: 1,
      useWeight: 1,
      weightVerified: 1,
      used: 1,
      coneQty: 1,
      yarnWeightNet: 1,
      yarnTransferWeight: 1,
    }	},

  ]);
  
  await this.asyncForEach(yarnData, async (item1) => {
    if (item1.coneWeight) { item1.coneWeight = parseFloat(item1.coneWeight); }
    if (item1.boxWeight) { item1.boxWeight = parseFloat(item1.boxWeight); }

    if (item1.yarnPlanWeight) { item1.yarnPlanWeight = parseFloat(item1.yarnPlanWeight); }
    if (item1.yarnWeight) { item1.yarnWeight = parseFloat(item1.yarnWeight); }
    if (item1.useWeight) { item1.useWeight = parseFloat(item1.useWeight); }
    if (item1.yarnWeightNet) { item1.yarnWeightNet = parseFloat(item1.yarnWeightNet); }
    if (item1.yarnTransferWeight) { item1.yarnTransferWeight = parseFloat(item1.yarnTransferWeight); }
  });

  return yarnData;
  // return yarnData.length > 0 ? true : false;
}

// getYarnLotBoxExisted(companyID, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type, boxIDNew);
exports.getYarnLotBoxExisted= async (companyID, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type, boxIDNew) => {
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        uuid: 1,
        yarnID: 1,		
        orderID: 1,
        colorS: 1,
        yarnDataInfo: 1,
    }	},
    { $unwind: "$yarnDataInfo" },
    { $project: { _id: 0, 
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,
      datetime: "$yarnDataInfo.datetime",
      yarnDataUUID: "$yarnDataInfo.yarnDataUUID",
      yarnColorID: "$yarnDataInfo.yarnColorID",
      type: "$yarnDataInfo.type",
      fromFactoryID: "$yarnDataInfo.fromFactoryID",
      toFactoryID: "$yarnDataInfo.toFactoryID",
      packageInfo: "$yarnDataInfo.packageInfo",
    }},

    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      // {"datetime":datetime},
      {"yarnColorID":yarnColorID},
      // {"type":type},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      {"type":{$in: type}},
    ] } },
    { $unwind: "$packageInfo" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      fromFactoryID: 1,
      toFactoryID: 1,

      invoiceID: "$packageInfo.invoiceID",
      yarnLotID: "$packageInfo.yarnLotID",
      yarnLotUUID: "$packageInfo.yarnLotUUID",
      coneWeight: "$packageInfo.coneWeight",
      boxWeight: "$packageInfo.boxWeight",
      yarnBoxInfo: "$packageInfo.yarnBoxInfo",

      datetime: 1,
      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
    }	},

    { $match: { $and: [
      {"yarnLotID":yarnLotID},
      {"yarnLotUUID":yarnLotUUID},
      // {"status":{$in: status}},
    ] } },
    { $unwind: "$yarnBoxInfo" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      fromFactoryID: 1,
      toFactoryID: 1,

      invoiceID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      coneWeight: 1,
      boxWeight: 1,

      datetime: 1,
      yyyymmdd: 1,
      mmdd: 1,

      boxID: "$yarnBoxInfo.boxID",
      boxUUID: "$yarnBoxInfo.boxUUID",
      factoryIDBox: "$yarnBoxInfo.factoryID",
      yarnPlanWeight: "$yarnBoxInfo.yarnPlanWeight",
      yarnWeight: "$yarnBoxInfo.yarnWeight",
      useWeight: "$yarnBoxInfo.useWeight",
      weightVerified: "$yarnBoxInfo.weightVerified",
      used: "$yarnBoxInfo.used",
      coneQty: "$yarnBoxInfo.coneQty",
      yarnWeightNet: "$yarnBoxInfo.yarnWeightNet",
      yarnTransferWeight: "$yarnBoxInfo.yarnTransferWeight",
    }	},

    { $match: { $and: [
      {"boxID":boxIDNew},
      // {"yarnLotUUID":yarnLotUUID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      fromFactoryID: 1,
      toFactoryID: 1,

      invoiceID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      coneWeight: 1,
      boxWeight: 1,

      datetime: 1,
      yyyymmdd: 1,
      mmdd: 1,

      boxID: 1,
      boxUUID: 1,
      factoryIDBox: 1,
      yarnPlanWeight: 1,
      yarnWeight: 1,
      useWeight: 1,
      weightVerified: 1,
      used: 1,
      coneQty: 1,
      yarnWeightNet: 1,
      yarnTransferWeight: 1,
    }	},

  ]);
  // console.log(yarns);  yarnLotUUID, yarnLotID
  return yarnData;
  // return yarnData.length > 0 ? true : false;
}

exports.getYarnPlanDataInfo3= async (companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, 
  yarnDataUUID, yarnColorID, type, toFactoryID, yarnLotUUID, yarnLotID) => {
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      {"uuid":uuid},
      {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        uuid: 1,
        yarnID: 1,		
        yarnDataInfo: 1,
    }	},
    { $unwind: "$yarnDataInfo" },
    { $project: { _id: 0, 
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,
      yarnDataUUID: "$yarnDataInfo.yarnDataUUID",
      datetime: "$yarnDataInfo.datetime",
      yarnColorID: "$yarnDataInfo.yarnColorID",
      type: "$yarnDataInfo.type",
      toFactoryID: "$yarnDataInfo.toFactoryID",
      packageInfo: "$yarnDataInfo.packageInfo",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      {"yarnDataUUID":yarnDataUUID},
      {"yarnColorID":yarnColorID},
      {"type":type},
      {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $unwind: "$packageInfo" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      yarnDataInfo: 1,
      datetime: 1,
      yarnColorID: 1,
      type: 1,		
      toFactoryID: 1,
      packageInfo:1,
      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
      invoiceID: "$packageInfo.invoiceID",
      yarnLotID: "$packageInfo.yarnLotID",
      yarnLotUUID: "$packageInfo.yarnLotUUID",
      coneWeight: "$packageInfo.coneWeight",
      boxWeight: "$packageInfo.boxWeight",
      state: "$packageInfo.state",
      coneQty: "$yarnBoxInfo.coneQty",
      yarnWeightNet: "$yarnBoxInfo.yarnWeightNet",
      yarnTransferWeight: "$yarnBoxInfo.yarnTransferWeight",
    }	},
    { $match: { $and: [
      {"yarnLotUUID":yarnLotUUID},
      {"yarnLotID":yarnLotID},
      // {"yarnColorID":yarnColorID},
      // {"type":type},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      yarnDataInfo: 1,
      datetime: 1,
      yarnColorID: 1,
      type: 1,		
      toFactoryID: 1,
      packageInfo:1,
      yyyymmdd: 1,
      mmdd: 1,
      invoiceID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      coneWeight: 1,
      boxWeight: 1,
      state: 1,
      coneQty: 1,
      yarnWeightNet: 1,
      yarnTransferWeight: 1,
      // invoiceID: "$packageInfo.invoiceID",
    }	},
  ]);
  // console.log(yarns);  yarnLotUUID, yarnLotID
  return yarnData;
}

// getYarnPlanDataInfoExist(
//   companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, datetime, yarnColorID, type, toFactoryID
// )
exports.getYarnPlanDataInfo1= async (companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, 
  datetime, yarnColorID, type, toFactoryID) => {
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      {"uuid":uuid},
      {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        uuid: 1,
        yarnID: 1,		
        yarnDataInfo: 1,
    }	},
    { $unwind: "$yarnDataInfo" },
    { $project: { _id: 0, 
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,
      yarnDataUUID: "$yarnDataInfo.yarnDataUUID",
      datetime: "$yarnDataInfo.datetime",
      yarnColorID: "$yarnDataInfo.yarnColorID",
      type: "$yarnDataInfo.type",
      toFactoryID: "$yarnDataInfo.toFactoryID",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      {"datetime":datetime},
      {"yarnColorID":yarnColorID},
      {"type":type},
      {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      yarnDataInfo: 1,
      datetime: 1,
      yarnColorID: 1,
      type: 1,		
      toFactoryID: 1,
      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
    }	},
  ]);
  // console.log(yarns);
  return yarnData;
}


// ShareFunc.getYarnStockCardPCS(companyID, yarnSeasonID, yarnID, yarnColorID)
exports.getYarnStockCardPCS= async (companyID, yarnSeasonID, yarnID, yarnColorID) => {
  const yarnStockCardPCS = await YarnStockCardPCS.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      {"yarnColorID":yarnColorID},
      // {"type":type},
      // {"type":{$in: type}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      yarnSeasonID: 1,
      yarnID: 1,
      yarnColorID: 1,
      type: 1,
      dataPCS: 1,
      dataZONE: 1,
    }	},
    
  ]);
  return yarnStockCardPCS.length > 0 ? yarnStockCardPCS[0]: undefined;
}

// getYarnStockCardPCSDataPCS(companyID, yarnSeasonID, yarnID, yarnColorID, dataPCS)
exports.getYarnStockCardPCSDataPCS1= async (companyID, yarnSeasonID, yarnID, yarnColorID, dataPCS) => {
  const yarnStockCardPCS = await YarnStockCardPCS.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      {"yarnColorID":yarnColorID},
      // {"type":type},
      // {"type":{$in: type}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      yarnSeasonID: 1,
      yarnID: 1,
      yarnColorID: 1,
      type: 1,
      dataPCS: 1,
      dataZONE: 1,
    }	},
    { $unwind: "$dataPCS" },
    { $project: { _id: 0, 
      companyID: 1,
      yarnSeasonID: 1,
      yarnID: 1,
      yarnColorID: 1,
      type: 1,

      ddmmyyyy: "$dataPCS.ddmmyyyy",
      usageMode: "$dataPCS.usageMode",
      orderID: "$dataPCS.orderID",
      toFactoryID: "$dataPCS.toFactoryID",
      invoiceID: "$dataPCS.invoiceID",

      yarnBoxInfoLen: "$dataPCS.yarnBoxInfoLen",
      yarnLotID2: "$dataPCS.yarnLotID2",
      yarnDataUUID: "$dataPCS.yarnDataUUID",
      yarnLotUUID: "$dataPCS.yarnLotUUID",
      yuUUID: "$dataPCS.yuUUID",

      datetime: "$dataPCS.datetime",
      pcs: "$dataPCS.pcs",
      createBy: "$dataPCS.createBy",

    }},
    { $match: { $and: [
      {"ddmmyyyy":dataPCS.ddmmyyyy},
      {"usageMode":dataPCS.usageMode},
      {"orderID":dataPCS.orderID},
      {"toFactoryID":dataPCS.toFactoryID},
      {"invoiceID":dataPCS.invoiceID},

      {"yarnBoxInfoLen":dataPCS.yarnBoxInfoLen},
      {"yarnLotID2":dataPCS.yarnLotID2},
      {"yarnDataUUID":dataPCS.yarnDataUUID},
      {"yarnLotUUID":dataPCS.yarnLotUUID},
      {"yuUUID":dataPCS.yuUUID},
    ] } },
    { $project: { _id: 0, 
      companyID: 1,
      yarnSeasonID: 1,
      yarnID: 1,
      yarnColorID: 1,
      type: 1,

      ddmmyyyy: 1,
      usageMode: 1,
      orderID: 1,
      toFactoryID: 1,
      invoiceID: 1,

      yarnBoxInfoLen: 1,
      yarnLotID2: 1,
      yarnDataUUID: 1,
      yarnLotUUID: 1,
      yuUUID: 1,

      datetime: 1,
      pcs: 1,
      createBy: 1,

    }},
    
  ]);
  return yarnStockCardPCS;
}

exports.getYarnStockCardPCSDataZONE1= async (companyID, yarnSeasonID, yarnID, yarnColorID, dataZONE) => {
  const yarnStockCardPCS = await YarnStockCardPCS.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      {"yarnColorID":yarnColorID},
      // {"type":type},
      // {"type":{$in: type}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      yarnSeasonID: 1,
      yarnID: 1,
      yarnColorID: 1,
      type: 1,
      dataPCS: 1,
      dataZONE: 1,
    }	},
    { $unwind: "$dataZONE" },
    { $project: { _id: 0, 
      companyID: 1,
      yarnSeasonID: 1,
      yarnID: 1,
      yarnColorID: 1,
      type: 1,

      ddmmyyyy: "$dataZONE.ddmmyyyy",
      usageMode: "$dataZONE.usageMode",
      orderID: "$dataZONE.orderID",
      toFactoryID: "$dataZONE.toFactoryID",
      invoiceID: "$dataZONE.invoiceID",

      yarnBoxInfoLen: "$dataZONE.yarnBoxInfoLen",
      yarnLotID2: "$dataZONE.yarnLotID2",
      yarnDataUUID: "$dataZONE.yarnDataUUID",
      yarnLotUUID: "$dataZONE.yarnLotUUID",
      yuUUID: "$dataZONE.yuUUID",

      datetime: "$dataZONE.datetime",
      targetPlaceID: "$dataZONE.targetPlaceID",
      createBy: "$dataZONE.createBy",

    }},
    { $match: { $and: [
      {"ddmmyyyy":dataZONE.ddmmyyyy},
      {"usageMode":dataZONE.usageMode},
      {"orderID":dataZONE.orderID},
      {"toFactoryID":dataZONE.toFactoryID},
      {"invoiceID":dataZONE.invoiceID},

      {"yarnBoxInfoLen":dataZONE.yarnBoxInfoLen},
      {"yarnLotID2":dataZONE.yarnLotID2},
      {"yarnDataUUID":dataZONE.yarnDataUUID},
      {"yarnLotUUID":dataZONE.yarnLotUUID},
      {"yuUUID":dataZONE.yuUUID},
    ] } },
    { $project: { _id: 0, 
      companyID: 1,
      yarnSeasonID: 1,
      yarnID: 1,
      yarnColorID: 1,
      type: 1,

      ddmmyyyy: 1,
      usageMode: 1,
      orderID: 1,
      toFactoryID: 1,
      invoiceID: 1,

      yarnBoxInfoLen: 1,
      yarnLotID2: 1,
      yarnDataUUID: 1,
      yarnLotUUID: 1,
      yuUUID: 1,

      datetime: 1,
      targetPlaceID: 1,
      createBy: 1,

    }},
    
  ]);
  return yarnStockCardPCS;
}

// getYarnLotBoxLastStr(companyID, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type, boxID, boxSign);
exports.getYarnLotBoxLastStr= async (companyID, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type, boxID, boxSign) => {
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
      _id: 0,	
      // companyID: 1,
      // yarnSeasonID: 1,
      yarnDataInfo: 1,
    }	},
    { $unwind: "$yarnDataInfo" },
    { $project: { _id: 0, 
      companyID: 1,
      yarnSeasonID: 1,
      yarnDataInfo: 1,
      type: "$yarnDataInfo.type",
      packageInfo: "$yarnDataInfo.packageInfo",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      // {"datetime":datetime},
      // {"yarnColorID":yarnColorID},
      // {"type":type},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      {"type":{$in: type}},
    ] } },
    { $unwind: "$packageInfo" },
    { $project: {			
      _id: 0,	
      // companyID: 1,
      // yarnSeasonID: 1,
      // yarnDataInfo: 1,

      // type: 1,		

      invoiceID: "$packageInfo.invoiceID",
      yarnLotID: "$packageInfo.yarnLotID",
      yarnLotUUID: "$packageInfo.yarnLotUUID",
      yarnBoxInfo: "$packageInfo.yarnBoxInfo",

      datetime: 1,
      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
    }	},
    { $match: { $and: [
      {"yarnLotID":yarnLotID},
      {"yarnLotUUID":yarnLotUUID},
      // {"status":{$in: status}},
    ] } },
    { $unwind: "$yarnBoxInfo" },
    { $project: {			
      _id: 0,	
      // companyID: 1,
      // yarnSeasonID: 1,
      // yarnDataInfo: 1,

      // type: 1,		

      // invoiceID: 1,
      // yarnLotID: 1,
      // yarnLotUUID: 1,

      // datetime: 1,
      // yyyymmdd: 1,
      // mmdd: 1,

      boxID: "$yarnBoxInfo.boxID",
    }	},
    // db.collection.find({name:{'$regex' : '^string', '$options' : 'i'}})
    { $match: { $and: [
      {"boxID":{'$regex' : '^'+boxID.toUpperCase(), '$options' : 'i'}},
      // {"boxID":{'$regex' : '^string', '$options' : 'i'}},
      // {"yarnLotUUID":yarnLotUUID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
      _id: 0,	
      // companyID: 1,
      // yarnSeasonID: 1,
      // yarnDataInfo: 1,

      // type: 1,		

      // invoiceID: 1,
      // yarnLotID: 1,
      // yarnLotUUID: 1,

      // datetime: 1,
      // yyyymmdd: 1,
      // mmdd: 1,

      boxID: 1,
    }	},
  ]);
  return yarnData;
}

// getCFYarnStock(companyID, factoryID, customerID, yarnSeasonID, yarnID, state, used);
exports.getCFYarnStock= async (companyID, factoryIDs, customerID, yarnSeasonID, yarnIDs, uuids, status, type, state, used, weightVerified) => {
  //  console.log(companyID, factoryID, yarnSeasonID, yarnID, type, state);
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"yarnSeasonID":yarnSeasonID},
      // {"yarnID":yarnID},
      {"uuid":{$in: uuids}},
      {"yarnID":{$in: yarnIDs}},
      {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        uuid: 1,
        yarnID: 1,		
        orderID: 1,
        colorS: 1,
        yarnDataInfo: 1,
    }	},
    { $unwind: "$yarnDataInfo" },
    { $project: { _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,
      datetime: "$yarnDataInfo.datetime",
      yarnDataUUID: "$yarnDataInfo.yarnDataUUID",
      yarnColorID: "$yarnDataInfo.yarnColorID",
      type: "$yarnDataInfo.type",
      fromFactoryID: "$yarnDataInfo.fromFactoryID",
      toFactoryID: "$yarnDataInfo.toFactoryID",
      packageInfo: "$yarnDataInfo.packageInfo",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      // {"datetime":datetime},
      // {"yarnColorID":yarnColorID},
      // {"type":type},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      {"type":{$in: type}},
    ] } },
    { $unwind: "$packageInfo" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      // factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      fromFactoryID: 1,
      toFactoryID: 1,

      invoiceID: "$packageInfo.invoiceID",
      yarnLotID: "$packageInfo.yarnLotID",
      yarnLotUUID: "$packageInfo.yarnLotUUID",
      coneWeight: "$packageInfo.coneWeight",
      boxWeight: "$packageInfo.boxWeight",
      state: "$packageInfo.state",
      yarnBoxInfo: "$packageInfo.yarnBoxInfo",

      datetime: 1,
      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
    }	},

    { $match: { $and: [
      // {"yarnLotID":yarnLotID},
      // {"yarnLotUUID":yarnLotUUID},
      // {"status":{$in: status}},
      // {"state": state},
      {"state":{$in: state}},
    ] } },
    { $unwind: "$yarnBoxInfo" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      // factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      fromFactoryID: 1,
      toFactoryID: 1,

      invoiceID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      coneWeight: 1,
      boxWeight: 1,
      state: 1,

      datetime: 1,
      yyyymmdd: 1,
      mmdd: 1,

      boxID: "$yarnBoxInfo.boxID",
      boxUUID: "$yarnBoxInfo.boxUUID",
      factoryIDBox: "$yarnBoxInfo.factoryID",
      yarnPlanWeight: "$yarnBoxInfo.yarnPlanWeight",
      yarnWeight: "$yarnBoxInfo.yarnWeight",
      useWeight: "$yarnBoxInfo.useWeight",
      weightVerified: "$yarnBoxInfo.weightVerified",
      used: "$yarnBoxInfo.used",
      coneQty: "$yarnBoxInfo.coneQty",
      yarnWeightNet: "$yarnBoxInfo.yarnWeightNet",
      yarnTransferWeight: "$yarnBoxInfo.yarnTransferWeight",
      yarnBoxInfo: 1,
    }	},

    { $match: { $and: [
      // {"factoryIDBox":factoryID},
      {"factoryIDBox":{$in: factoryIDs}},
      {"weightVerified":weightVerified},
      {"used":used},
      // {"status":{$in: status}},
      // {"type":{$in: type}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      // factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      fromFactoryID: 1,
      toFactoryID: 1,

      invoiceID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      coneWeight: 1,
      boxWeight: 1,


      datetime: 1,
      yyyymmdd: 1,
      mmdd: 1,

      boxID: 1,
      boxUUID: 1,
      factoryIDBox: 1,
      yarnPlanWeight: 1,
      yarnWeight: 1,
      useWeight: 1,
      weightVerified: 1,
      used: 1,
      coneQty: 1,
      yarnWeightNet: 1,
      yarnTransferWeight: 1,
      // yarnBoxInfo: 1,
    }	},
  ]);
  // console.log(yarnData);

  await this.asyncForEach(yarnData, async (item1) => {
    if (item1.boxWeight) { item1.boxWeight = parseFloat(item1.boxWeight); }
    if (item1.coneWeight) { item1.coneWeight = parseFloat(item1.coneWeight); }

    if (item1.yarnPlanWeight) { item1.yarnPlanWeight = parseFloat(item1.yarnPlanWeight); }
    if (item1.yarnWeight) { item1.yarnWeight = parseFloat(item1.yarnWeight); }
    if (item1.useWeight) { item1.useWeight = parseFloat(item1.useWeight); }
    if (item1.useWeight) { item1.useWeight = parseFloat(item1.useWeight); }
    if (item1.yarnWeightNet) { item1.yarnWeightNet = parseFloat(item1.yarnWeightNet); }
    if (item1.yarnTransferWeight) { item1.yarnTransferWeight = parseFloat(item1.yarnTransferWeight); }
  });
  
  let yarnLotInfo = [];
  if (yarnData.length > 0) {
    // console.log(yarnData.length);

    // yarnLotInfo = {
    //   companyID: yarnData[0].companyID,
    //   // factoryID: yarnData[0].factoryID,		
    //   customerID: yarnData[0].customerID,	
    //   yarnSeasonID: yarnData[0].yarnSeasonID,
    //   uuid: yarnData[0].uuid,
    //   yarnID: yarnData[0].yarnID,		
    //   orderID: yarnData[0].orderID,
    //   colorS: yarnData[0].colorS,
    // };

    await this.asyncForEach(yarnData, async (item1) => {
      const yarnLotInfo1 = {
        companyID: item1.companyID,
        // factoryID: item1.factoryID,		
        customerID: item1.customerID,	
        yarnSeasonID: item1.yarnSeasonID,
        uuid: item1.uuid,
        yarnID: item1.yarnID,		
        orderID: item1.orderID,
        colorS: item1.colorS,
      }
      const yarnLotInfoF = yarnLotInfo.filter(i=>i.uuid === yarnLotInfo1.uuid);
      if (yarnLotInfoF.length <= 0) {
        yarnLotInfo.push(yarnLotInfo1);
      }
    });
    // console.log(yarnLotInfo);

    await this.asyncForEach(yarnLotInfo, async (item1) => {
      let yarnDataInfo = [];
      await this.asyncForEach2(yarnData, async (item2) => {
        const yarnDataInfoF = yarnDataInfo.filter(i => i.yarnDataUUID === item2.yarnDataUUID);
        if (yarnDataInfoF.length <= 0) {
          yarnDataInfo.push({
            yarnDataUUID: item2.yarnDataUUID,
            yarnColorID: item2.yarnColorID,
            type: item2.type,		
            fromFactoryID: item2.fromFactoryID,
            toFactoryID: item2.toFactoryID,
            packageInfo: []
          });
        }
      });
      item1.yarnDataInfo = yarnDataInfo;
    });
    // console.log(yarnLotInfo[0].yarnDataInfo);

    await this.asyncForEach(yarnLotInfo, async (item1) => {
      await this.asyncForEach2(item1.yarnDataInfo, async (item2) => {
        const yarnDataInfoF = yarnData.filter(i => i.yarnDataUUID === item2.yarnDataUUID);
        let packageInfo = [];
        await this.asyncForEach3(yarnDataInfoF, async (item3) => {
          const packageInfoF = packageInfo.filter(i => i.yarnLotUUID === item3.yarnLotUUID);
          if (packageInfoF.length <= 0) {
            packageInfo.push({
              invoiceID: item3.invoiceID,
              yarnLotID: item3.yarnLotID,
              yarnLotUUID: item3.yarnLotUUID,
              coneWeight: item3.coneWeight,
              boxWeight: item3.boxWeight,
              yarnBoxInfo: []
            });
          }
        });
        item2.packageInfo = packageInfo;
      });
    });
    // console.log(yarnLotInfo[0]);
    // console.log(yarnLotInfo[0].yarnDataInfo[0]);

    await this.asyncForEach(yarnLotInfo, async (item1) => {
      await this.asyncForEach2(item1.yarnDataInfo, async (item2) => {
        await this.asyncForEach3(item2.packageInfo, async (item3) => {
          let yarnBoxInfoF = yarnData.filter(i => i.yarnDataUUID === item2.yarnDataUUID && i.yarnLotUUID === item3.yarnLotUUID);
          yarnBoxInfoF.sort((a,b)=>{ return a.boxID >b.boxID?1:a.boxID <b.boxID?-1:0 });  // ## sort asc
          let yarnBoxInfo = [];
          await this.asyncForEach4(yarnBoxInfoF, async (item4) => {
            yarnBoxInfo.push({
              boxID: item4.boxID,
              boxUUID: item4.boxUUID,
              factoryID: item4.factoryIDBox,
              yarnPlanWeight: item4.yarnPlanWeight,
              yarnWeight: item4.yarnWeight,
              useWeight: item4.useWeight,
              weightVerified: item4.weightVerified,
              used: item4.used,
              coneQty: item4.coneQty,
              yarnWeightNet: item4.yarnWeightNet,
              yarnTransferWeight: item4.yarnTransferWeight,
            });
          });
          item3.yarnBoxInfo = yarnBoxInfo;
        });
      });
    });
    // console.log(yarnLotInfo[0].yarnDataInfo[0]);

    // let yarnDataInfo = [];
    // await this.asyncForEach(yarnData, async (item1) => {
    //   const yarnDataInfoF = yarnDataInfo.filter(i => i.yarnDataUUID === item1.yarnDataUUID);
    //   if (yarnDataInfoF.length <= 0) {
    //     yarnDataInfo.push({
    //       yarnDataUUID: item1.yarnDataUUID,
    //       yarnColorID: item1.yarnColorID,
    //       type: item1.type,		
    //       fromFactoryID: item1.fromFactoryID,
    //       toFactoryID: item1.toFactoryID,
    //       packageInfo: []
    //     });
    //   }
    // });
    // yarnLotInfo.yarnDataInfo = yarnDataInfo;

    // await this.asyncForEach(yarnLotInfo.yarnDataInfo, async (item2) => {
    //   const yarnDataInfoF = yarnData.filter(i => i.yarnDataUUID === item2.yarnDataUUID);
    //   let packageInfo = [];
    //   await this.asyncForEach2(yarnDataInfoF, async (item3) => {
    //     const packageInfoF = packageInfo.filter(i => i.yarnLotUUID === item3.yarnLotUUID);
    //     if (packageInfoF.length <= 0) {
    //       packageInfo.push({
    //         yarnLotID: item3.yarnLotID,
    //         yarnLotUUID: item3.yarnLotUUID,
    //         coneWeight: item3.coneWeight,
    //         boxWeight: item3.boxWeight,
    //         yarnBoxInfo: []
    //       });
    //     }
    //   });
    //   item2.packageInfo = packageInfo;
    // });

    // await this.asyncForEach2(yarnLotInfo.yarnDataInfo, async (item2) => {
    //   await this.asyncForEach3(item2.packageInfo, async (item3) => {
    //     let yarnBoxInfoF = yarnData.filter(i => i.yarnDataUUID === item2.yarnDataUUID && i.yarnLotUUID === item3.yarnLotUUID);
    //     yarnBoxInfoF.sort((a,b)=>{ return a.boxID >b.boxID?1:a.boxID <b.boxID?-1:0 });  // ## sort asc
    //     let yarnBoxInfo = [];
    //     await this.asyncForEach4(yarnBoxInfoF, async (item4) => {
    //       yarnBoxInfo.push({
    //         boxID: item4.boxID,
    //         boxUUID: item4.boxUUID,
    //         factoryID: item4.factoryIDBox,
    //         yarnPlanWeight: item4.yarnPlanWeight,
    //         yarnWeight: item4.yarnWeight,
    //         useWeight: item4.useWeight,
    //         weightVerified: item4.weightVerified,
    //         used: item4.used,
    //         coneQty: item4.coneQty,
    //         yarnWeightNet: item4.yarnWeightNet,
    //         yarnTransferWeight: item4.yarnTransferWeight,
    //       });
    //     });
    //     item2.yarnBoxInfo = yarnBoxInfo;
    //   });
    // });

  }
  return yarnLotInfo;
}

// getYarnLotInfoCF(companyID, factoryID, yarnSeasonID, yarnID, type);
exports.getYarnLotInfoCF= async (companyID, factoryID, yarnSeasonID, yarnID, uuid, type, state, weightVerified) => {
  //  console.log(companyID, factoryID, yarnSeasonID, yarnID, type, state);
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      {"uuid":uuid},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        uuid: 1,
        yarnID: 1,		
        orderID: 1,
        colorS: 1,
        yarnDataInfo: 1,
    }	},
    { $unwind: "$yarnDataInfo" },
    { $project: { _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,
      datetime: "$yarnDataInfo.datetime",
      yarnDataUUID: "$yarnDataInfo.yarnDataUUID",
      yarnColorID: "$yarnDataInfo.yarnColorID",
      type: "$yarnDataInfo.type",
      fromFactoryID: "$yarnDataInfo.fromFactoryID",
      toFactoryID: "$yarnDataInfo.toFactoryID",
      packageInfo: "$yarnDataInfo.packageInfo",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      // {"datetime":datetime},
      // {"yarnColorID":yarnColorID},
      // {"type":type},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      {"type":{$in: type}},
    ] } },
    { $unwind: "$packageInfo" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      // factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      fromFactoryID: 1,
      toFactoryID: 1,

      invoiceID: "$packageInfo.invoiceID",
      yarnLotID: "$packageInfo.yarnLotID",
      yarnLotUUID: "$packageInfo.yarnLotUUID",
      coneWeight: "$packageInfo.coneWeight",
      boxWeight: "$packageInfo.boxWeight",
      state: "$packageInfo.state",
      yarnBoxInfo: "$packageInfo.yarnBoxInfo",

      datetime: 1,
      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
    }	},

    { $match: { $and: [
      // {"yarnLotID":yarnLotID},
      // {"yarnLotUUID":yarnLotUUID},
      // {"status":{$in: status}},
      {"state": state},
    ] } },
    { $unwind: "$yarnBoxInfo" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      // factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      fromFactoryID: 1,
      toFactoryID: 1,

      invoiceID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      coneWeight: 1,
      boxWeight: 1,
      state: 1,

      datetime: 1,
      yyyymmdd: 1,
      mmdd: 1,

      boxID: "$yarnBoxInfo.boxID",
      boxUUID: "$yarnBoxInfo.boxUUID",
      factoryIDBox: "$yarnBoxInfo.factoryID",
      yarnPlanWeight: "$yarnBoxInfo.yarnPlanWeight",
      yarnWeight: "$yarnBoxInfo.yarnWeight",
      useWeight: "$yarnBoxInfo.useWeight",
      weightVerified: "$yarnBoxInfo.weightVerified",
      used: "$yarnBoxInfo.used",
      coneQty: "$yarnBoxInfo.coneQty",
      yarnWeightNet: "$yarnBoxInfo.yarnWeightNet",
      yarnTransferWeight: "$yarnBoxInfo.yarnTransferWeight",
      yarnBoxInfo: "$packageInfo.yarnBoxInfo",
    }	},

    { $match: { $and: [
      {"factoryIDBox":factoryID},
      {"weightVerified":weightVerified},
      // {"status":{$in: status}},
      // {"type":{$in: type}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      // factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      fromFactoryID: 1,
      toFactoryID: 1,

      invoiceID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      coneWeight: 1,
      boxWeight: 1,


      datetime: 1,
      yyyymmdd: 1,
      mmdd: 1,

      boxID: 1,
      boxUUID: 1,
      factoryIDBox: 1,
      yarnPlanWeight: 1,
      yarnWeight: 1,
      useWeight: 1,
      weightVerified: 1,
      used: 1,
      coneQty: 1,
      yarnWeightNet: 1,
      yarnTransferWeight: 1,
    }	},
  ]);
  // console.log(yarnData);

  await this.asyncForEach(yarnData, async (item1) => {
    if (item1.boxWeight) { item1.boxWeight = parseFloat(item1.boxWeight); }
    if (item1.coneWeight) { item1.coneWeight = parseFloat(item1.coneWeight); }

    if (item1.yarnPlanWeight) { item1.yarnPlanWeight = parseFloat(item1.yarnPlanWeight); }
    if (item1.yarnWeight) { item1.yarnWeight = parseFloat(item1.yarnWeight); }
    if (item1.useWeight) { item1.useWeight = parseFloat(item1.useWeight); }
    if (item1.useWeight) { item1.useWeight = parseFloat(item1.useWeight); }
    if (item1.yarnWeightNet) { item1.yarnWeightNet = parseFloat(item1.yarnWeightNet); }
    if (item1.yarnTransferWeight) { item1.yarnTransferWeight = parseFloat(item1.yarnTransferWeight); }
  });
  
  let yarnLotInfo;
  if (yarnData.length > 0) {
    yarnLotInfo = {
      companyID: yarnData[0].companyID,
      // factoryID: yarnData[0].factoryID,		
      customerID: yarnData[0].customerID,	
      yarnSeasonID: yarnData[0].yarnSeasonID,
      uuid: yarnData[0].uuid,
      yarnID: yarnData[0].yarnID,		
      orderID: yarnData[0].orderID,
      colorS: yarnData[0].colorS,
    };

    let yarnDataInfo = [];
    await this.asyncForEach(yarnData, async (item1) => {
      const yarnDataInfoF = yarnDataInfo.filter(i => i.yarnDataUUID === item1.yarnDataUUID);
      if (yarnDataInfoF.length <= 0) {
        yarnDataInfo.push({
          yarnDataUUID: item1.yarnDataUUID,
          yarnColorID: item1.yarnColorID,
          type: item1.type,		
          fromFactoryID: item1.fromFactoryID,
          toFactoryID: item1.toFactoryID,
          packageInfo: []
        });
      }
    });
    yarnLotInfo.yarnDataInfo = yarnDataInfo;

    await this.asyncForEach(yarnLotInfo.yarnDataInfo, async (item1) => {
      const yarnDataInfoF = yarnData.filter(i => i.yarnDataUUID === item1.yarnDataUUID);
      let packageInfo = [];
      await this.asyncForEach2(yarnDataInfoF, async (item2) => {
        const packageInfoF = packageInfo.filter(i => i.yarnLotUUID === item2.yarnLotUUID);
        if (packageInfoF.length <= 0) {
          packageInfo.push({
            yarnLotID: item2.yarnLotID,
            yarnLotUUID: item2.yarnLotUUID,
            coneWeight: item2.coneWeight,
            boxWeight: item2.boxWeight,
            yarnBoxInfo: []
          });
        }
      });
      item1.packageInfo = packageInfo;
    });

    await this.asyncForEach(yarnLotInfo.yarnDataInfo, async (item1) => {
      await this.asyncForEach2(item1.packageInfo, async (item2) => {
        let yarnBoxInfoF = yarnData.filter(i => i.yarnDataUUID === item1.yarnDataUUID && i.yarnLotUUID === item2.yarnLotUUID);
        yarnBoxInfoF.sort((a,b)=>{ return a.boxID >b.boxID?1:a.boxID <b.boxID?-1:0 });  // ## sort asc
        let yarnBoxInfo = [];
        await this.asyncForEach3(yarnBoxInfoF, async (item3) => {
          yarnBoxInfo.push({
            boxID: item3.boxID,
            boxUUID: item3.boxUUID,
            factoryID: item3.factoryIDBox,
            yarnPlanWeight: item3.yarnPlanWeight,
            yarnWeight: item3.yarnWeight,
            useWeight: item3.useWeight,
            weightVerified: item3.weightVerified,
            used: item3.used,
            coneQty: item3.coneQty,
            yarnWeightNet: item3.yarnWeightNet,
            yarnTransferWeight: item3.yarnTransferWeight,
          });
        });
        item2.yarnBoxInfo = yarnBoxInfo;
      });
    });

  }
  return yarnLotInfo;
}



// const yarnLotInfo = await ShareFunc.getYarnLotInfoByYarnLotID(companyID, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID);
exports.getYarnLotInfoByYarnLotID= async (companyID, factoryIDBox, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type) => {
  // console.log(companyID, factoryIDBox, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type);
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        uuid: 1,
        yarnID: 1,		
        orderID: 1,
        colorS: 1,
        yarnDataInfo: 1,
    }	},
    { $unwind: "$yarnDataInfo" },
    { $project: { _id: 0, 
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,
      datetime: "$yarnDataInfo.datetime",
      yarnDataUUID: "$yarnDataInfo.yarnDataUUID",
      yarnColorID: "$yarnDataInfo.yarnColorID",
      type: "$yarnDataInfo.type",
      fromFactoryID: "$yarnDataInfo.fromFactoryID",
      toFactoryID: "$yarnDataInfo.toFactoryID",
      packageInfo: "$yarnDataInfo.packageInfo",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      // {"datetime":datetime},
      // {"yarnColorID":yarnColorID},
      // {"type":type},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      {"type":{$in: type}},
    ] } },
    { $unwind: "$packageInfo" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      fromFactoryID: 1,
      toFactoryID: 1,

      invoiceID: "$packageInfo.invoiceID",
      yarnLotID: "$packageInfo.yarnLotID",
      yarnLotUUID: "$packageInfo.yarnLotUUID",
      boxWeight: "$packageInfo.boxWeight",
      coneWeight: "$packageInfo.coneWeight",
      yarnBoxInfo: "$packageInfo.yarnBoxInfo",

      datetime: 1,
      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
    }	},
    { $match: { $and: [
      {"yarnLotID":yarnLotID},
      {"yarnLotUUID":yarnLotUUID},
      // {"status":{$in: status}},
    ] } },
    { $unwind: "$yarnBoxInfo" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      fromFactoryID: 1,
      toFactoryID: 1,

      invoiceID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      boxWeight: 1,
      coneWeight: 1,

      datetime: 1,
      yyyymmdd: 1,
      mmdd: 1,

      boxID: "$yarnBoxInfo.boxID",
      boxUUID: "$yarnBoxInfo.boxUUID",
      factoryIDBox: "$yarnBoxInfo.factoryID",
      yarnPlanWeight: "$yarnBoxInfo.yarnPlanWeight",
      yarnWeight: "$yarnBoxInfo.yarnWeight",
      useWeight: "$yarnBoxInfo.useWeight",
      weightVerified: "$yarnBoxInfo.weightVerified",
      used: "$yarnBoxInfo.used",
      coneQty: "$yarnBoxInfo.coneQty",
      yarnWeightNet: "$yarnBoxInfo.yarnWeightNet",
      yarnTransferWeight: "$yarnBoxInfo.yarnTransferWeight",
    }	},
    { $match: { $and: [
      {"factoryIDBox":factoryIDBox},
      // {"yarnLotUUID":yarnLotUUID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      uuid: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,
      type: 1,		
      fromFactoryID: 1,
      toFactoryID: 1,

      invoiceID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      boxWeight: 1,
      coneWeight: 1,

      datetime: 1,
      yyyymmdd: 1,
      mmdd: 1,

      boxID: 1,
      boxUUID: 1,
      factoryIDBox: 1,
      yarnPlanWeight: 1,
      yarnWeight: 1,
      useWeight: 1,
      weightVerified: 1,
      used: 1,
      coneQty: 1,
      yarnWeightNet: 1,
      yarnTransferWeight: 1,
    }	},
  ]);
  // console.log(yarnData);
  await this.asyncForEach(yarnData, async (item1) => {
    if (item1.boxWeight) { item1.boxWeight = parseFloat(item1.boxWeight); }
    if (item1.coneWeight) { item1.coneWeight = parseFloat(item1.coneWeight); }

    if (item1.yarnPlanWeight) { item1.yarnPlanWeight = parseFloat(item1.yarnPlanWeight); }
    if (item1.yarnWeight) { item1.yarnWeight = parseFloat(item1.yarnWeight); }
    if (item1.useWeight) { item1.useWeight = parseFloat(item1.useWeight); }
    if (item1.useWeight) { item1.useWeight = parseFloat(item1.useWeight); }
    if (item1.yarnWeightNet) { item1.yarnWeightNet = parseFloat(item1.yarnWeightNet); }
    if (item1.yarnTransferWeight) { item1.yarnTransferWeight = parseFloat(item1.yarnTransferWeight); }
  });
  let yarnLotInfo;
  let yarnBoxInfo = [];
  await this.asyncForEach(yarnData, async (item1) => {
    yarnBoxInfo.push({
      boxID: item1.boxID,
      boxUUID: item1.boxUUID,
      factoryID: item1.factoryIDBox,
      yarnPlanWeight: item1.yarnPlanWeight,
      yarnWeight: item1.yarnWeight,
      useWeight: item1.useWeight,
      weightVerified: item1.weightVerified,
      used: item1.used,
    });
  });
  if (yarnData.length > 0) {
    yarnLotInfo = {
      companyID: yarnData[0].companyID,
      factoryID: yarnData[0].factoryID,		
      customerID: yarnData[0].customerID,	
      yarnSeasonID: yarnData[0].yarnSeasonID,
      uuid: yarnData[0].uuid,
      yarnID: yarnData[0].yarnID,		
      orderID: yarnData[0].orderID,
      colorS: yarnData[0].colorS,

      yarnDataUUID: yarnData[0].yarnDataUUID,
      yarnColorID: yarnData[0].yarnColorID,
      type: yarnData[0].type,		
      fromFactoryID: yarnData[0].fromFactoryID,
      toFactoryID: yarnData[0].toFactoryID,

      invoiceID: yarnData[0].invoiceID,
      yarnLotID: yarnData[0].yarnLotID,
      yarnLotUUID: yarnData[0].yarnLotUUID,
      coneWeight: yarnData[0].coneWeight,
      boxWeight: yarnData[0].boxWeight,

      datetime: yarnData[0].datetime,
      yyyymmdd: yarnData[0].yyyymmdd,
      mmdd: yarnData[0].mmdd,
    };
  }
  yarnLotInfo.yarnBoxInfo = yarnBoxInfo;

  // console.log(yarnLotInfo);
  return yarnLotInfo;
}

// ShareFunc.getCFYarnTransfer(companyID, factoryID, customerID, yarnSeasonID, yarnID, usageMode);
// ## factoryID --> toFactory
exports.getCFYarnUsageTransfer= async (companyID, toFactoryID, customerID, yarnSeasonID, yarnID, usageMode) => {
  const yarnLotUsage = await YarnLotUsage.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      // {"yarnColorID":yarnColorID},
      // {"yarnDataUUID":yarnDataUUID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        yarnID: 1,		
        yarnColorID: 1,
        yarnDataUUID: 1,
        yarnUsage: 1,
        status: 1,
    }	},
    { $unwind: "$yarnUsage" },
    { $project: { 
      // _id: 0, 
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      datetimeIssue: "$yarnUsage.datetimeIssue",
      datetime: "$yarnUsage.datetime",
      yuUUID: "$yarnUsage.yuUUID",
      yarnLotID: "$yarnUsage.yarnLotID",
      yarnLotUUID: "$yarnUsage.yarnLotUUID",
      invoiceID: "$yarnUsage.invoiceID",
      usageMode: "$yarnUsage.usageMode",
      yarnWeight: "$yarnUsage.yarnWeight",
      yarnWeightNet: "$yarnUsage.yarnWeightNet",
      useWeight: "$yarnUsage.useWeight",
      yarnBoxInfo: "$yarnUsage.yarnBoxInfo",
      usageInfo: "$yarnUsage.usageInfo",
      _id: "$yarnUsage._id",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      // {"yarnColorID":yarnColorID},
      {"usageMode":usageMode},
      // {"type":type},
      {"usageInfo.toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    // { $unwind: "$usageInfo.setFactoryID" },
    { $project: {			
      _id: 1,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },

      yyyymmdd2: { $dateToString: { format: "%Y-%m-%d", date: "$datetimeIssue" } },
      mmdd2: { $dateToString: { format: "%m-%d", date: "$datetimeIssue" } },

      yyyymmdd3: { $dateToString: { format: "%Y%m%d", date: "$datetimeIssue" } },
      mmdd3: { $dateToString: { format: "%m%d", date: "$datetimeIssue" } },

      datetime: 1,
      datetimeIssue: 1,
      yuUUID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      invoiceID: 1,
      usageMode: 1,
      yarnWeight: 1,
      yarnWeightNet: 1,
      useWeight: 1,
      yarnBoxInfo: 1,
      usageInfo: 1,
      // setFactoryID: "$usageInfo.setFactoryID",
    }	},
  ]);

  await this.asyncForEach(yarnLotUsage, async (item1) => {
    item1.yarnWeightNet = parseFloat(item1.yarnWeightNet);
    item1.useWeight = parseFloat(item1.useWeight);
    item1.yarnWeight = parseFloat(item1.yarnWeight);
    if (item1.usageInfo.yarnPlanWeight) { item1.usageInfo.yarnPlanWeight = parseFloat(item1.usageInfo.yarnPlanWeight); }
    if (item1.usageInfo.yarnInvoiceWeight) { item1.usageInfo.yarnInvoiceWeight = parseFloat(item1.usageInfo.yarnInvoiceWeight); }
    if (item1.yarnBoxInfo && item1.yarnBoxInfo.length > 0) {
      await this.asyncForEach2(item1.yarnBoxInfo, async (item2) => {
        if (item2.yarnPlanWeight) { item2.yarnPlanWeight = parseFloat(item2.yarnPlanWeight); }
        if (item2.yarnWeight) { item2.yarnWeight = parseFloat(item2.yarnWeight); }
        if (item2.yarnWeightNet) { item2.yarnWeightNet = parseFloat(item2.yarnWeightNet); }
        if (item2.useWeight) { item2.useWeight = parseFloat(item2.useWeight); }
        if (item2.yarnTransferWeight) { item2.yarnTransferWeight = parseFloat(item2.yarnTransferWeight); }
      });
    }
  });

  return yarnLotUsage;
}

exports.getCFYarnUsageTransferII= async (companyID, toFactoryID, customerID, yarnSeasonID, yarnID, usageMode, useWeight) => {
  const yarnLotUsage = await YarnLotUsage.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      // {"yarnColorID":yarnColorID},
      // {"yarnDataUUID":yarnDataUUID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        yarnID: 1,		
        yarnColorID: 1,
        yarnDataUUID: 1,
        yarnUsage: 1,
        status: 1,
    }	},
    { $unwind: "$yarnUsage" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      datetimeIssue: "$yarnUsage.datetimeIssue",
      datetime: "$yarnUsage.datetime",
      yuUUID: "$yarnUsage.yuUUID",
      yarnLotID: "$yarnUsage.yarnLotID",
      yarnLotUUID: "$yarnUsage.yarnLotUUID",
      invoiceID: "$yarnUsage.invoiceID",
      usageMode: "$yarnUsage.usageMode",
      yarnWeight: "$yarnUsage.yarnWeight",
      yarnWeightNet: "$yarnUsage.yarnWeightNet",
      useWeight: "$yarnUsage.useWeight",
      yarnBoxInfo: "$yarnUsage.yarnBoxInfo",
      usageInfo: "$yarnUsage.usageInfo",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      // {"yarnColorID":yarnColorID},
      {"usageMode":usageMode},
      // {"type":type},
      {"usageInfo.toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    // { $unwind: "$usageInfo.setFactoryID" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },

      yyyymmdd2: { $dateToString: { format: "%Y-%m-%d", date: "$datetimeIssue" } },
      mmdd2: { $dateToString: { format: "%m-%d", date: "$datetimeIssue" } },

      yyyymmdd3: { $dateToString: { format: "%Y%m%d", date: "$datetimeIssue" } },
      mmdd3: { $dateToString: { format: "%m%d", date: "$datetimeIssue" } },

      datetime: 1,
      datetimeIssue: 1,
      yuUUID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      invoiceID: 1,
      usageMode: 1,
      yarnWeight: 1,
      yarnWeightNet: 1,
      useWeight: 1,
      yarnBoxInfo: 1,
      usageInfo: 1,
      // setFactoryID: "$usageInfo.setFactoryID",
    }	},

    // $toDouble  toLong
    { $addFields: {
      value: {"$toString" : "$yarnWeight"},
      // value1: { $round: [{"$toString" : "$yarnWeight"}, 2]},
      value2: { $round: [{"$toDouble" : "$yarnWeight"}, 2]},
      value3: { $round: [{"$toInt" : "$yarnWeight"}, 2]},
      value4: { $round: [{"$toLong" : "$yarnWeight"}, 2]},

      size: { $size: "$yarnBoxInfo" },
    }},

  ]);

  await this.asyncForEach(yarnLotUsage, async (item1) => {
    item1.yarnWeightNet = parseFloat(item1.yarnWeightNet);
    item1.useWeight = parseFloat(item1.useWeight);
    item1.yarnWeight = parseFloat(item1.yarnWeight);
    if (item1.usageInfo.yarnPlanWeight) { item1.usageInfo.yarnPlanWeight = parseFloat(item1.usageInfo.yarnPlanWeight); }
    if (item1.usageInfo.yarnInvoiceWeight) { item1.usageInfo.yarnInvoiceWeight = parseFloat(item1.usageInfo.yarnInvoiceWeight); }
    if (item1.yarnBoxInfo && item1.yarnBoxInfo.length > 0) {
      await this.asyncForEach2(item1.yarnBoxInfo, async (item2) => {
        if (item2.yarnPlanWeight) { item2.yarnPlanWeight = parseFloat(item2.yarnPlanWeight); }
        if (item2.yarnWeight) { item2.yarnWeight = parseFloat(item2.yarnWeight); }
        if (item2.yarnWeightNet) { item2.yarnWeightNet = parseFloat(item2.yarnWeightNet); }
        if (item2.useWeight) { item2.useWeight = parseFloat(item2.useWeight); }
        if (item2.yarnTransferWeight) { item2.yarnTransferWeight = parseFloat(item2.yarnTransferWeight); }
      });
    }
  });

  return yarnLotUsage;
}

// ShareFunc.getYarnUsage(companyID, factoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
exports.getYarnUsage= async (companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status) => {
  let yarnLotUsage = [];
  const oldYearSeason = ['2024AW'];  // ## old version
  if (oldYearSeason.includes(yarnSeasonID)) {
    yarnLotUsage = await this.getYarnUsageV1(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
  } else { // ## new version
    yarnLotUsage = await this.getYarnUsageV2(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
  }
  return yarnLotUsage;
}

// getYarnUsageCF
exports.getYarnUsageCF= async (companyID, setfactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status) => {
  let yarnLotUsage = [];
  const oldYearSeason = ['2024AW'];  // ## old version
  if (oldYearSeason.includes(yarnSeasonID)) {
    yarnLotUsage = await this.getYarnUsageCFV1(companyID, setfactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
  } else { // ## new version
    yarnLotUsage = await this.getYarnUsageCFV2(companyID, setfactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
  }
  return yarnLotUsage;
}

// 
exports.getYarnUsageV1= async (companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status) => {
  const yarnLotUsage = await YarnLotUsage.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      // {"uuid":uuid},
      {"yarnColorID":yarnColorID},
      // {"yarnDataUUID":yarnDataUUID},
      {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        yarnID: 1,		
        yarnColorID: 1,
        yarnDataUUID: 1,
        yarnUsage: 1,
        status: 1,
    }	},
    { $unwind: "$yarnUsage" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      datetimeIssue: "$yarnUsage.datetimeIssue",
      datetime: "$yarnUsage.datetime",
      yuUUID: "$yarnUsage.yuUUID",
      yarnLotID: "$yarnUsage.yarnLotID",
      yarnLotUUID: "$yarnUsage.yarnLotUUID",
      invoiceID: "$yarnUsage.invoiceID",
      usageMode: "$yarnUsage.usageMode",
      yarnWeight: "$yarnUsage.yarnWeight",
      yarnWeightNet: "$yarnUsage.yarnWeightNet",
      useWeight: "$yarnUsage.useWeight",
      yarnBoxInfo: "$yarnUsage.yarnBoxInfo",
      usageInfo: "$yarnUsage.usageInfo",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      {"yarnColorID":yarnColorID},
      // {"usageMode":usageMode},
      // {"type":type},
      // {"usageInfo.toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $unwind: "$usageInfo.setFactoryID" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },

      yyyymmdd2: { $dateToString: { format: "%Y-%m-%d", date: "$datetimeIssue" } },
      mmdd2: { $dateToString: { format: "%m-%d", date: "$datetimeIssue" } },

      yyyymmdd3: { $dateToString: { format: "%Y%m%d", date: "$datetimeIssue" } },
      mmdd3: { $dateToString: { format: "%m%d", date: "$datetimeIssue" } },

      datetime: 1,
      datetimeIssue: 1,
      yuUUID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      invoiceID: 1,
      usageMode: 1,
      yarnWeight: 1,
      yarnWeightNet: 1,
      useWeight: 1,
      yarnBoxInfo: 1,
      usageInfo: 1,
      setFactoryID: "$usageInfo.setFactoryID",
    }	},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      {"setFactoryID":toFactoryID},
      // {"usageMode":usageMode},
      // {"type":type},
      // {"usageInfo.toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      yyyymmdd: 1,
      mmdd: 1,

      yyyymmdd2: 1,
      mmdd2: 1,

      yyyymmdd3: 1,
      mmdd3: 1,

      datetime: 1,
      datetimeIssue: 1,
      yuUUID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      invoiceID: 1,
      usageMode: 1,
      yarnWeight: 1,
      yarnWeightNet: 1,
      useWeight: 1,
      yarnBoxInfo: 1,
      usageInfo: 1,
      // setFactoryID: "$usageInfo.setFactoryID",
    }	},
  ]);

  await this.asyncForEach(yarnLotUsage, async (item1) => {
    item1.yarnWeightNet = parseFloat(item1.yarnWeightNet);
    item1.useWeight = parseFloat(item1.useWeight);
    item1.yarnWeight = parseFloat(item1.yarnWeight);
    if (item1.usageInfo.yarnPlanWeight) { item1.usageInfo.yarnPlanWeight = parseFloat(item1.usageInfo.yarnPlanWeight); }
    if (item1.usageInfo.yarnInvoiceWeight) { item1.usageInfo.yarnInvoiceWeight = parseFloat(item1.usageInfo.yarnInvoiceWeight); }
    if (item1.yarnBoxInfo && item1.yarnBoxInfo.length > 0) {
      await this.asyncForEach2(item1.yarnBoxInfo, async (item2) => {
        if (item2.yarnPlanWeight) { item2.yarnPlanWeight = parseFloat(item2.yarnPlanWeight); }
        if (item2.yarnWeight) { item2.yarnWeight = parseFloat(item2.yarnWeight); }
        if (item2.yarnWeightNet) { item2.yarnWeightNet = parseFloat(item2.yarnWeightNet); }
        if (item2.useWeight) { item2.useWeight = parseFloat(item2.useWeight); }
        if (item2.yarnTransferWeight) { item2.yarnTransferWeight = parseFloat(item2.yarnTransferWeight); }
      });
    }
  });

  return yarnLotUsage;
}


// ## get yarnBoxInfo from YarnLotUsage by _id 
exports.getYarnUsage_YarnBoxInfo_By_id= 
  async (companyID, customerID, yarnSeasonID, yarnID, uuid, yarnColorID, yarnDataUUID, 
        invoiceID, yuUUID, yarnLotID, usageMode, yarnLotUUID, fromFactoryID, toFactoryID, orderID, yarnUsage_id) => {

  // console.log(companyID, customerID, yarnSeasonID, yarnID, uuid, yarnColorID, yarnDataUUID, 
  //   invoiceID, yuUUID, yarnLotID, usageMode, yarnLotUUID, fromFactoryID, toFactoryID, orderID, yarnUsage_id);

  const yarnLotUsage = await YarnLotUsage.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      // {"uuid":uuid},
      {"yarnColorID":yarnColorID},
      {"yarnDataUUID":yarnDataUUID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        yarnID: 1,		
        yarnColorID: 1,
        yarnDataUUID: 1,
        yarnUsage: 1,
        status: 1,
    }	},
    { $unwind: "$yarnUsage" },
    { $project: { 

      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      // datetimeIssue: "$yarnUsage.datetimeIssue",
      // datetime: "$yarnUsage.datetime",
      yuUUID: "$yarnUsage.yuUUID",
      yarnLotID: "$yarnUsage.yarnLotID",
      yarnLotUUID: "$yarnUsage.yarnLotUUID",
      invoiceID: "$yarnUsage.invoiceID",
      usageMode: "$yarnUsage.usageMode",

      yarnWeight: "$yarnUsage.yarnWeight",
      yarnWeightNet: "$yarnUsage.yarnWeightNet",
      useWeight: "$yarnUsage.useWeight",

      yarnBoxInfo: "$yarnUsage.yarnBoxInfo",
      usageInfo: "$yarnUsage.usageInfo",
      _id: "$yarnUsage._id",
    }},

    { $match: { $and: [
      {"invoiceID":invoiceID},
      {"yuUUID":yuUUID},
      {"yarnLotID":yarnLotID},
      {"usageMode":usageMode},
      {"yarnLotUUID":yarnLotUUID},
      {"_id":new ObjectId(yarnUsage_id)},
      {"usageInfo.fromFactoryID":fromFactoryID},
      {"usageInfo.toFactoryID":toFactoryID},
      {"usageInfo.orderID":orderID},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      yuUUID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      invoiceID: 1,
      usageMode: 1,
      yarnWeight: 1,
      yarnWeightNet: 1,
      useWeight: 1,
      yarnBoxInfo: 1,
      usageInfo: 1,
      // setFactoryID: "$usageInfo.setFactoryID",
    }	},
    
  ]);

  await this.asyncForEach(yarnLotUsage, async (item1) => {
    item1.yarnWeightNet = parseFloat(item1.yarnWeightNet);
    item1.useWeight = parseFloat(item1.useWeight);
    item1.yarnWeight = parseFloat(item1.yarnWeight);
    if (item1.usageInfo.yarnPlanWeight) { item1.usageInfo.yarnPlanWeight = parseFloat(item1.usageInfo.yarnPlanWeight); }
    if (item1.usageInfo.yarnInvoiceWeight) { item1.usageInfo.yarnInvoiceWeight = parseFloat(item1.usageInfo.yarnInvoiceWeight); }
    if (item1.yarnBoxInfo && item1.yarnBoxInfo.length > 0) {
      await this.asyncForEach2(item1.yarnBoxInfo, async (item2) => {
        if (item2.yarnPlanWeight) { item2.yarnPlanWeight = parseFloat(item2.yarnPlanWeight); }
        if (item2.yarnWeight) { item2.yarnWeight = parseFloat(item2.yarnWeight); }
        if (item2.yarnWeightNet) { item2.yarnWeightNet = parseFloat(item2.yarnWeightNet); }
        if (item2.useWeight) { item2.useWeight = parseFloat(item2.useWeight); }
        if (item2.yarnTransferWeight) { item2.yarnTransferWeight = parseFloat(item2.yarnTransferWeight); }
      });
    }
  });

  return yarnLotUsage;
}

// getYarnUsageCF
exports.getYarnUsageCFV1= async (companyID, setfactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status) => {
  const yarnLotUsage = await YarnLotUsage.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      // {"uuid":uuid},
      {"yarnColorID":yarnColorID},
      // {"yarnDataUUID":yarnDataUUID},
      {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        yarnID: 1,		
        yarnColorID: 1,
        yarnDataUUID: 1,
        yarnUsage: 1,
        status: 1,
    }	},
    { $unwind: "$yarnUsage" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      datetimeIssue: "$yarnUsage.datetimeIssue",
      datetime: "$yarnUsage.datetime",
      yuUUID: "$yarnUsage.yuUUID",
      yarnLotID: "$yarnUsage.yarnLotID",
      yarnLotUUID: "$yarnUsage.yarnLotUUID",
      invoiceID: "$yarnUsage.invoiceID",
      usageMode: "$yarnUsage.usageMode",
      yarnWeight: "$yarnUsage.yarnWeight",
      yarnWeightNet: "$yarnUsage.yarnWeightNet",
      useWeight: "$yarnUsage.useWeight",
      yarnBoxInfo: "$yarnUsage.yarnBoxInfo",
      usageInfo: "$yarnUsage.usageInfo",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      {"yarnColorID":yarnColorID},
      // {"usageMode":usageMode},
      // {"type":type},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },

      yyyymmdd2: { $dateToString: { format: "%Y-%m-%d", date: "$datetimeIssue" } },
      mmdd2: { $dateToString: { format: "%m-%d", date: "$datetimeIssue" } },

      yyyymmdd3: { $dateToString: { format: "%Y%m%d", date: "$datetimeIssue" } },
      mmdd3: { $dateToString: { format: "%m%d", date: "$datetimeIssue" } },

      datetime: 1,
      datetimeIssue: 1,
      yuUUID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      invoiceID: 1,
      usageMode: 1,
      yarnWeight: 1,
      yarnWeightNet: 1,
      useWeight: 1,
      yarnBoxInfo: 1,
      usageInfo: 1,
      setFactoryID: "$usageInfo.setFactoryID",
    }	},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      // {"setFactoryID":setfactoryID},
      // {"usageMode":usageMode},
      // {"type":type},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      {"setFactoryID":{$in: setfactoryID}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      yyyymmdd: 1,
      mmdd: 1,

      yyyymmdd2: 1,
      mmdd2: 1,

      yyyymmdd3: 1,
      mmdd3: 1,

      datetime: 1,
      datetimeIssue: 1,
      yuUUID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      invoiceID: 1,
      usageMode: 1,
      yarnWeight: 1,
      yarnWeightNet: 1,
      useWeight: 1,
      yarnBoxInfo: 1,
      usageInfo: 1,
      setFactoryID: 1,
    }	},
  ]);

  await this.asyncForEach(yarnLotUsage, async (item1) => {
    item1.yarnWeightNet = parseFloat(item1.yarnWeightNet);
    item1.useWeight = parseFloat(item1.useWeight);
    item1.yarnWeight = parseFloat(item1.yarnWeight);
    if (item1.usageInfo.yarnPlanWeight) { item1.usageInfo.yarnPlanWeight = parseFloat(item1.usageInfo.yarnPlanWeight); }
    if (item1.usageInfo.yarnInvoiceWeight) { item1.usageInfo.yarnInvoiceWeight = parseFloat(item1.usageInfo.yarnInvoiceWeight); }
    if (item1.yarnBoxInfo && item1.yarnBoxInfo.length > 0) {
      await this.asyncForEach2(item1.yarnBoxInfo, async (item2) => {
        if (item2.yarnPlanWeight) { item2.yarnPlanWeight = parseFloat(item2.yarnPlanWeight); }
        if (item2.yarnWeight) { item2.yarnWeight = parseFloat(item2.yarnWeight); }
        if (item2.yarnWeightNet) { item2.yarnWeightNet = parseFloat(item2.yarnWeightNet); }
        if (item2.useWeight) { item2.useWeight = parseFloat(item2.useWeight); }
        if (item2.yarnTransferWeight) { item2.yarnTransferWeight = parseFloat(item2.yarnTransferWeight); }
      });
    }
  });

  return yarnLotUsage;
}

exports.getYarnUsageV2= async (companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status) => {
  // console.log(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
  const yarnLotUsage = await YarnLotUsage.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      // {"uuid":uuid},
      {"yarnColorID":yarnColorID},
      // {"yarnDataUUID":yarnDataUUID},
      {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        yarnID: 1,		
        yarnColorID: 1,
        yarnDataUUID: 1,
        yarnUsage: 1,
        status: 1,
    }	},
    { $unwind: "$yarnUsage" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      datetimeIssue: "$yarnUsage.datetimeIssue",
      datetime: "$yarnUsage.datetime",
      yuUUID: "$yarnUsage.yuUUID",
      yarnLotID: "$yarnUsage.yarnLotID",
      yarnLotUUID: "$yarnUsage.yarnLotUUID",
      invoiceID: "$yarnUsage.invoiceID",
      usageMode: "$yarnUsage.usageMode",
      yarnWeight: "$yarnUsage.yarnWeight",
      yarnWeightNet: "$yarnUsage.yarnWeightNet",
      useWeight: "$yarnUsage.useWeight",
      yarnBoxInfo: "$yarnUsage.yarnBoxInfo",
      usageInfo: "$yarnUsage.usageInfo",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      {"yarnColorID":yarnColorID},
      // {"usageMode":usageMode},
      // {"type":type},
      // {"usageInfo.toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $unwind: "$usageInfo.setFactoryID" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },

      yyyymmdd2: { $dateToString: { format: "%Y-%m-%d", date: "$datetimeIssue" } },
      mmdd2: { $dateToString: { format: "%m-%d", date: "$datetimeIssue" } },

      yyyymmdd3: { $dateToString: { format: "%Y%m%d", date: "$datetimeIssue" } },
      mmdd3: { $dateToString: { format: "%m%d", date: "$datetimeIssue" } },

      datetime: 1,
      datetimeIssue: 1,
      yuUUID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      invoiceID: 1,
      usageMode: 1,
      yarnWeight: 1,
      yarnWeightNet: 1,
      useWeight: 1,
      yarnBoxInfo: 1,
      usageInfo: 1,
      setFactoryID: "$usageInfo.setFactoryID",
    }	},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      {"setFactoryID":toFactoryID},
      // {"usageMode":usageMode},
      // {"type":type},
      // {"usageInfo.toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      yyyymmdd: 1,
      mmdd: 1,

      yyyymmdd2: 1,
      mmdd2: 1,

      yyyymmdd3: 1,
      mmdd3: 1,

      datetime: 1,
      datetimeIssue: 1,
      yuUUID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      invoiceID: 1,
      usageMode: 1,
      yarnWeight: 1,
      yarnWeightNet: 1,
      useWeight: 1,
      yarnBoxInfo: 1,
      usageInfo: 1,
      // setFactoryID: "$usageInfo.setFactoryID",
    }	},
  ]);

  await this.asyncForEach(yarnLotUsage, async (item1) => {
    item1.yarnWeightNet = parseFloat(item1.yarnWeightNet);
    item1.useWeight = parseFloat(item1.useWeight);
    item1.yarnWeight = parseFloat(item1.yarnWeight);
    if (item1.usageInfo.yarnPlanWeight) { item1.usageInfo.yarnPlanWeight = parseFloat(item1.usageInfo.yarnPlanWeight); }
    if (item1.usageInfo.yarnInvoiceWeight) { item1.usageInfo.yarnInvoiceWeight = parseFloat(item1.usageInfo.yarnInvoiceWeight); }
    if (item1.yarnBoxInfo && item1.yarnBoxInfo.length > 0) {
      await this.asyncForEach2(item1.yarnBoxInfo, async (item2) => {
        if (item2.yarnPlanWeight) { item2.yarnPlanWeight = parseFloat(item2.yarnPlanWeight); }
        if (item2.yarnWeight) { item2.yarnWeight = parseFloat(item2.yarnWeight); }
        if (item2.yarnWeightNet) { item2.yarnWeightNet = parseFloat(item2.yarnWeightNet); }
        if (item2.useWeight) { item2.useWeight = parseFloat(item2.useWeight); }
        if (item2.yarnTransferWeight) { item2.yarnTransferWeight = parseFloat(item2.yarnTransferWeight); }
      });
    }
  });

  return yarnLotUsage;
}

// getYarnUsageCF
exports.getYarnUsageCFV2= async (companyID, setfactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status) => {
  const yarnLotUsage = await YarnLotUsage.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      // {"uuid":uuid},
      {"yarnColorID":yarnColorID},
      // {"yarnDataUUID":yarnDataUUID},
      {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        yarnID: 1,		
        yarnColorID: 1,
        yarnDataUUID: 1,
        yarnUsage: 1,
        status: 1,
    }	},
    { $unwind: "$yarnUsage" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      datetimeIssue: "$yarnUsage.datetimeIssue",
      datetime: "$yarnUsage.datetime",
      yuUUID: "$yarnUsage.yuUUID",
      yarnLotID: "$yarnUsage.yarnLotID",
      yarnLotUUID: "$yarnUsage.yarnLotUUID",
      invoiceID: "$yarnUsage.invoiceID",
      usageMode: "$yarnUsage.usageMode",
      yarnWeight: "$yarnUsage.yarnWeight",
      yarnWeightNet: "$yarnUsage.yarnWeightNet",
      useWeight: "$yarnUsage.useWeight",
      yarnBoxInfo: "$yarnUsage.yarnBoxInfo",
      usageInfo: "$yarnUsage.usageInfo",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      {"yarnColorID":yarnColorID},
      // {"usageMode":usageMode},
      // {"type":type},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },

      yyyymmdd2: { $dateToString: { format: "%Y-%m-%d", date: "$datetimeIssue" } },
      mmdd2: { $dateToString: { format: "%m-%d", date: "$datetimeIssue" } },

      yyyymmdd3: { $dateToString: { format: "%Y%m%d", date: "$datetimeIssue" } },
      mmdd3: { $dateToString: { format: "%m%d", date: "$datetimeIssue" } },

      datetime: 1,
      datetimeIssue: 1,
      yuUUID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      invoiceID: 1,
      usageMode: 1,
      yarnWeight: 1,
      yarnWeightNet: 1,
      useWeight: 1,
      yarnBoxInfo: 1,
      usageInfo: 1,
      setFactoryID: "$usageInfo.setFactoryID",
    }	},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      // {"setFactoryID":setfactoryID},
      // {"usageMode":usageMode},
      // {"type":type},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      {"setFactoryID":{$in: setfactoryID}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      status: 1,

      yyyymmdd: 1,
      mmdd: 1,

      yyyymmdd2: 1,
      mmdd2: 1,

      yyyymmdd3: 1,
      mmdd3: 1,

      datetime: 1,
      datetimeIssue: 1,
      yuUUID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      invoiceID: 1,
      usageMode: 1,
      yarnWeight: 1,
      yarnWeightNet: 1,
      useWeight: 1,
      yarnBoxInfo: 1,
      usageInfo: 1,
      setFactoryID: 1,
    }	},
  ]);

  await this.asyncForEach(yarnLotUsage, async (item1) => {
    item1.yarnWeightNet = parseFloat(item1.yarnWeightNet);
    item1.useWeight = parseFloat(item1.useWeight);
    item1.yarnWeight = parseFloat(item1.yarnWeight);
    if (item1.usageInfo.yarnPlanWeight) { item1.usageInfo.yarnPlanWeight = parseFloat(item1.usageInfo.yarnPlanWeight); }
    if (item1.usageInfo.yarnInvoiceWeight) { item1.usageInfo.yarnInvoiceWeight = parseFloat(item1.usageInfo.yarnInvoiceWeight); }
    if (item1.yarnBoxInfo && item1.yarnBoxInfo.length > 0) {
      await this.asyncForEach2(item1.yarnBoxInfo, async (item2) => {
        if (item2.yarnPlanWeight) { item2.yarnPlanWeight = parseFloat(item2.yarnPlanWeight); }
        if (item2.yarnWeight) { item2.yarnWeight = parseFloat(item2.yarnWeight); }
        if (item2.yarnWeightNet) { item2.yarnWeightNet = parseFloat(item2.yarnWeightNet); }
        if (item2.useWeight) { item2.useWeight = parseFloat(item2.useWeight); }
        if (item2.yarnTransferWeight) { item2.yarnTransferWeight = parseFloat(item2.yarnTransferWeight); }
      });
    }
  });

  return yarnLotUsage;
}

exports.checkExistYarnLotUsage= async (companyID, factoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, invoiceID,
    yarnLotUUID, usageMode) => {
    //
  const yarnLotUsage = await YarnLotUsage.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      {"yarnID":yarnID},
      {"yarnColorID":yarnColorID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        yarnID: 1,		
        yarnColorID: 1,
        yarnDataUUID: 1,
        yarnUsage: 1,
    }	},
    { $unwind: "$yarnUsage" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,
      datetimeIssue: "$yarnUsage.datetimeIssue",
      datetime: "$yarnUsage.datetime",
      yuUUID: "$yarnUsage.yuUUID",
      yarnLotID: "$yarnUsage.yarnLotID",
      yarnLotUUID: "$yarnUsage.yarnLotUUID",
      invoiceID: "$yarnUsage.invoiceID",
      usageMode: "$yarnUsage.usageMode",
      yarnWeight: "$yarnUsage.yarnWeight",
      yarnWeightNet: "$yarnUsage.yarnWeightNet",
      useWeight: "$yarnUsage.useWeight",
      yarnBoxInfo: "$yarnUsage.yarnBoxInfo",
      usageInfo: "$yarnUsage.usageInfo",
    }},
    { $match: { $and: [
      // {"yarnDataUUID":yarnDataUUID},
      {"yarnLotUUID":yarnLotUUID},
      {"usageMode":usageMode},
      // {"type":type},
      // {"toFactoryID":toFactoryID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      yarnID: 1,		
      yarnColorID: 1,
      yarnDataUUID: 1,

      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },

      yyyymmdd2: { $dateToString: { format: "%Y-%m-%d", date: "$datetimeIssue" } },
      mmdd2: { $dateToString: { format: "%m-%d", date: "$datetimeIssue" } },

      yuUUID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      invoiceID: 1,
      usageMode: 1,
      yarnWeight: 1,
      yarnWeightNet: 1,
      useWeight: 1,
      yarnBoxInfo: 1,
      usageInfo: 1,
    }	},
  ]);

  await this.asyncForEach(yarnLotUsage, async (item1) => {
    item1.yarnWeightNet = parseFloat(item1.yarnWeightNet);
    item1.useWeight = parseFloat(item1.useWeight);
    item1.yarnWeight = parseFloat(item1.yarnWeight);
    if (item1.usageInfo.yarnPlanWeight) { item1.usageInfo.yarnPlanWeight = parseFloat(item1.usageInfo.yarnPlanWeight); }
    if (item1.usageInfo.yarnInvoiceWeight) { item1.usageInfo.yarnInvoiceWeight = parseFloat(item1.usageInfo.yarnInvoiceWeight); }
    if (item1.yarnBoxInfo && item1.yarnBoxInfo.length > 0) {
      await this.asyncForEach2(item1.yarnBoxInfo, async (item2) => {
        if (item2.yarnPlanWeight) { item2.yarnPlanWeight = parseFloat(item2.yarnPlanWeight); }
        if (item2.yarnWeight) { item2.yarnWeight = parseFloat(item2.yarnWeight); }
        if (item2.yarnWeightNet) { item2.yarnWeightNet = parseFloat(item2.yarnWeightNet); }
        if (item2.useWeight) { item2.useWeight = parseFloat(item2.useWeight); }
        if (item2.yarnTransferWeight) { item2.yarnTransferWeight = parseFloat(item2.yarnTransferWeight); }
      });
    }
  });

  return yarnLotUsage;
}

exports.getYarnPlanMainCount= async (companyID, factoryID, customerID, yarnSeasonID, status) => {
  rows = await YarnData.countDocuments({$and: [
    {"companyID":companyID},
    {"factoryID":factoryID},
    {"customerID":customerID},
    {"yarnSeasonID":yarnSeasonID},
    {"status":{$in: status}},
  ]});
  return rows;
}

exports.getYarnPlanMainList= async (companyID, factoryID, customerID, yarnSeasonID, uuid, yarnID, status) => {
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      {"uuid":uuid},
      {"yarnID":yarnID},
      {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        status: 1,
        uuid: 1,
        datetime: 1,
        editDate: 1,
        yarnID: 1,		
        orderID: 1,
        colorS: 1,
        yarnDataInfo: 1,
        yarnStatCal: 1,
        yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
        mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
    }	},
    // { $sort: { datetime: 1 } }
  ]);
  // console.log(yarns);

  // const yarnDataF = await yarnData.map(fw => ({
  //   companyID: fw._id.companyID, 
  //   productID: fw._id.productID,
  //   style: fw._id.style,
  //   size: fw._id.size,
  //   targetPlace: fw._id.targetPlace,
  //   color: fw._id.color,
  //   countQty: fw.countQty,
  // }));
  const yarnDataInfo = yarnData.length>0 ? yarnData[0].yarnDataInfo : [];

  
  await this.asyncForEach(yarnDataInfo, async (item1) => {
    item1.yarnWeight = parseFloat(item1.yarnWeight);
    await this.asyncForEach2(item1.packageInfo, async (item2) => {
      item2.coneWeight = parseFloat(item2.coneWeight);
      item2.boxWeight = parseFloat(item2.boxWeight);
      await this.asyncForEach3(item2.yarnBoxInfo, async (item3) => {
        item3.yarnPlanWeight = parseFloat(item3.yarnPlanWeight);
        item3.yarnWeight = parseFloat(item3.yarnWeight);
        item3.useWeight = parseFloat(item3.useWeight);
        item3.yarnWeightNet = parseFloat(item3.yarnWeightNet);
        item3.yarnTransferWeight = parseFloat(item3.yarnTransferWeight);
      });
    });
  });

  return yarnData;
}

exports.getYarnPlanMainListByYarnIDs= async (companyID, factoryID, customerID, yarnSeasonID, yarnIDs, status) => {
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      // {"uuid":uuid},
      {"yarnID":{$in: yarnIDs}},
      {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        status: 1,
        uuid: 1,
        datetime: 1,
        editDate: 1,
        yarnID: 1,		
        orderID: 1,
        colorS: 1,
        yarnDataInfo: 1,
        yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
        mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
    }	},
    // { $sort: { datetime: 1 } }
  ]);
  // console.log(yarns);

  // const yarnDataF = await yarnData.map(fw => ({
  //   companyID: fw._id.companyID, 
  //   productID: fw._id.productID,
  //   style: fw._id.style,
  //   size: fw._id.size,
  //   targetPlace: fw._id.targetPlace,
  //   color: fw._id.color,
  //   countQty: fw.countQty,
  // }));
  // const yarnDataInfo = yarnData.length>0 ? yarnData[0].yarnDataInfo : [];

  await this.asyncForEach4(yarnData, async (item0) => {
    await this.asyncForEach(item0.yarnDataInfo, async (item1) => {
      item1.yarnWeight = parseFloat(item1.yarnWeight);
      await this.asyncForEach2(item1.packageInfo, async (item2) => {
        item2.coneWeight = parseFloat(item2.coneWeight);
        item2.boxWeight = parseFloat(item2.boxWeight);
        await this.asyncForEach3(item2.yarnBoxInfo, async (item3) => {
          item3.yarnPlanWeight = parseFloat(item3.yarnPlanWeight);
          item3.yarnWeight = parseFloat(item3.yarnWeight);
          item3.useWeight = parseFloat(item3.useWeight);
          item3.yarnWeightNet = parseFloat(item3.yarnWeightNet);
          item3.yarnTransferWeight = parseFloat(item3.yarnTransferWeight);
        });
      });
    });
  });

  return yarnData;
}

exports.getYarnPlanInvoiceList= async (companyID, factoryID, customerID, yarnSeasonID, type, invoiceID, status) => {
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      // {"uuid":uuid},
      // {"yarnID":yarnID},
      {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        status: 1,
        uuid: 1,
        // datetime: 1,
        // editDate: 1,
        yarnID: 1,		
        orderID: 1,
        colorS: 1,
        yarnDataInfo: 1,
        // yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
        // mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
    }	},
    { $unwind: "$yarnDataInfo" },
    { $project: { _id: 0, 
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      status: 1,
      uuid: 1,
      // datetime: 1,
      // editDate: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,
      // yarnDataInfo: 1,
      // yyyymmdd: 1,
      // mmdd: 1,
      datetime: "$yarnDataInfo.datetime",
      editDate: "$yarnDataInfo.editDate",
      type: "$yarnDataInfo.type",
      packageInfo: "$yarnDataInfo.packageInfo",
      yarnDataUUID: "$yarnDataInfo.yarnDataUUID",
      yarnColorID: "$yarnDataInfo.yarnColorID",
    }},
    { $match: { $and: [
      {"type":{$in: type}},
    ] } },
    { $unwind: "$packageInfo" },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      status: 1,
      uuid: 1,
      datetime: 1,
      editDate: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,
      // yarnDataInfo: 1,
      // yyyymmdd: 1,
      // mmdd: 1,
      yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },

      type: 1,
      yarnDataUUID: 1,
      yarnColorID: 1,
      // packageInfo: 1,



      invoiceID: "$packageInfo.invoiceID",
      yarnLotID: "$packageInfo.yarnLotID",
      yarnLotUUID: "$packageInfo.yarnLotUUID",
      yarnLotUUID: "$packageInfo.yarnLotUUID",
      coneWeight: "$packageInfo.coneWeight",
      boxWeight: "$packageInfo.boxWeight",
      yarnBoxInfo: "$packageInfo.yarnBoxInfo",
    }	},
    { $match: { $and: [
      // {"type":{$in: type}},
      {"invoiceID":invoiceID},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      factoryID: 1,		
      customerID: 1,	
      yarnSeasonID: 1,
      status: 1,
      uuid: 1,
      datetime: 1,
      editDate: 1,
      yarnID: 1,		
      orderID: 1,
      colorS: 1,
      // yarnDataInfo: 1,
      yyyymmdd: 1,
      mmdd: 1,

      yarnDataUUID: 1,
      yarnColorID: 1,

      invoiceID: 1,
      yarnLotID: 1,
      yarnLotUUID: 1,
      coneWeight: 1,
      boxWeight: 1,
      yarnBoxInfo: 1


      // invoiceID: "$packageInfo.invoiceID",
    }	},
  ]);
  // console.log(yarnData);

  await this.asyncForEach(yarnData, async (item1) => {
    item1.coneWeight = parseFloat(item1.coneWeight);
    item1.boxWeight = parseFloat(item1.boxWeight);
    await this.asyncForEach2(item1.yarnBoxInfo, async (item2) => {
      item2.yarnPlanWeight = parseFloat(item2.yarnPlanWeight);
      item2.yarnWeight = parseFloat(item2.yarnWeight);
      item2.useWeight = parseFloat(item2.useWeight);
      item2.yarnWeightNet = parseFloat(item2.yarnWeightNet);
      item2.yarnTransferWeight = parseFloat(item2.yarnTransferWeight);
    });
  });

  return yarnData;
}

// getYarnPlanMainLists
exports.getYarnPlanMainLists= async (companyID, factoryID, customerID, yarnSeasonID, status) => {
  // limit = +limit; // ## change to number
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
      {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        customerID: 1,	
        yarnSeasonID: 1,
        status: 1,
        uuid: 1,
        datetime: 1,
        editDate: 1,
        yarnID: 1,		
        orderID: 1,
        colorS: 1,
        yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
        mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
        // yarnDataInfo: 1
    }	},
    { $sort: { datetime: 1 } }
  ]);
  // console.log(yarns);
  return yarnData;
}

exports.getYarnPlanStat= async (companyID, yarnID, uuid, yarnSeasonID) => {
  // limit = +limit; // ## change to number
  const yarnData = await YarnData.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"yarnID":yarnID},
      {"uuid":uuid},
      {"yarnSeasonID":yarnSeasonID},
      // {"status":{$in: status}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // customerID: 1,	
        yarnSeasonID: 1,
        // status: 1,
        uuid: 1,
        // datetime: 1,
        // editDate: 1,
        yarnID: 1,		
        // orderID: 1,
        // colorS: 1,
        // yyyymmdd: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
        // mmdd: { $dateToString: { format: "%m-%d", date: "$datetime" } },
        // yarnDataInfo: 1
        yarnStatCal: 1,
    }	},
    // { $sort: { datetime: 1 } }
  ]);
  // console.log(yarnData);


  if (yarnData.length>0) {
    if (yarnData[0].yarnStatCal && yarnData[0].yarnStatCal.length>0) {
      await this.asyncForEach(yarnData, async (item1) => {
        // console.log('5555', item1);
        // item1.coneWeight = parseFloat(item1.coneWeight);
        // item1.boxWeight = parseFloat(item1.boxWeight);
        await this.asyncForEach2(item1.yarnStatCal, async (item2) => {
          await this.asyncForEach3(item2.mainZoneYarn, async (item3) => {
            item3.pcWeight = parseFloat(item3.pcWeight);
            item3.totalWeight = parseFloat(item3.totalWeight);
          });
        });
      });
      return yarnData[0].yarnStatCal;
    }
  }

  return [];
}

// ShareFunc.getYarnCussCount(companyID, customerID);
exports.getYarnCussCount= async (companyID, customerID, yarnSeasonID) => {
  rows = await Yarn.countDocuments({$and: [
    {"companyID":companyID},
    {"customerID":customerID},
    {"yarnSeasonID":yarnSeasonID},
  ]});
  return rows;
}

// getYarnCuss(companyID, customerID);
exports.getYarnCuss= async (companyID, customerID, yarnSeasonID) => {
  // limit = +limit; // ## change to number
  const yarns = await Yarn.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"customerID":customerID},
      {"yarnSeasonID":yarnSeasonID},
    ] } },
    { $project: {			
        _id: 0,	
        yarnID: 1,
        yarnName: 1,		
        yarnFullName: 1,	
        detail: 1,
        companyID: 1,
        yarnSupplierID: 1,
        customerID: 1,
        yarnSeasonID: 1,
        yarnUUID: 1,
        seq: 1,		
    }	},
    { $sort: { seq: 1 } }
  ]);
  // console.log(yarns);
  return yarns;
}

// ShareFunc.getYarnCusSuppliers(companyID, customerID, showArr);
exports.getYarnCusSuppliers= async (companyID, customerID, showArr) => {
  // limit = +limit; // ## change to number
  const yarn = await YarnSupplier.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"customerID":customerID},
      {"show":{$in: showArr}} 
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        yarnSupplierID: 1,
        yarnSupplierName: 1,			
        customerID: 1,	
    }	},
    { $sort: { yarnSupplierID: 1 } }
  ]);
  // console.log(yarns);
  return yarn;
}

// ShareFunc.getYarnCusColors(companyID, customerID, showArr);
exports.getYarnCusColors= async (companyID, customerID, showArr) => {
  // limit = +limit; // ## change to number
  const yarn = await YarnColor.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"show":{$in: showArr}} 
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        yarnColorID: 1,
        yarnColorName: 1,			
        customerID: 1,		
    }	},
    { $sort: { customerID: 1, yarnColorID: 1 } }
  ]);
  // console.log(yarns);
  return yarn;
}


exports.getYarnsCount= async (companyID, yarnSeasonID) => {
  rows = await Yarn.countDocuments({$and: [
    {"companyID":companyID},
    {"yarnSeasonID":yarnSeasonID},
  ]});
  return rows;
}

// ## get yarns
exports.getYarns= async (companyID, yarnSeasonID) => {
  // limit = +limit; // ## change to number
  const yarns = await Yarn.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"yarnSeasonID":yarnSeasonID},
    ] } },
    { $project: {			
        _id: 0,	
        yarnID: 1,
        yarnName: 1,		
        yarnFullName: 1,	
        detail: 1,
        companyID: 1,
        yarnSupplierID: 1,
        customerID: 1,
        yarnSeasonID: 1,
        yarnUUID: 1,
        seq: 1,		
    }	},
    { $sort: { seq: 1 } }
  ]);
  // console.log(yarns);
  return yarns;
}

exports.getYarnSeasons= async (companyID, showArr) => {
  // limit = +limit; // ## change to number
  const yarn = await YarnSeason.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"show":{$in: showArr}} 
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        yarnSeasonID: 1,
        yarnSeasonName: 1,			
    }	},
    { $sort: { yarnSeasonID: 1 } }
  ]);
  // console.log(yarn);
  return yarn;
}

exports.getYarnSuppliers= async (companyID, showArr) => {
  // limit = +limit; // ## change to number
  const yarn = await YarnSupplier.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"show":{$in: showArr}} 
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        yarnSupplierID: 1,
        yarnSupplierName: 1,			
        customerID: 1,	
    }	},
    { $sort: { yarnSupplierID: 1 } }
  ]);
  // console.log(yarns);
  return yarn;
}

exports.getYarnColors= async (companyID, showArr) => {
  // limit = +limit; // ## change to number
  const yarn = await YarnColor.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"show":{$in: showArr}} 
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        yarnColorID: 1,
        yarnColorName: 1,			
        customerID: 1,		
    }	},
    { $sort: { customerID: 1, yarnColorID: 1 } }
  ]);
  // console.log(yarns);
  return yarn;
}



// ## yarn zone ####################################################################
// #################################################################################

// #################################################################################
// ## delivery zone ####################################################################
// const DPacking = require("../models/m-dPacking");
// const DCarton = require("../models/m-dCarton");
// const DCountry = require("../models/m-dCountry");

exports.getDCartons= async (companyID) => {
  // limit = +limit; // ## change to number
  const cartons = await DCarton.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"show":{$in: showArr}} 
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        seq: 1,
        cartonID: 1,			
        cartonName: 1,		
        cSize: 1,	
        show: 1,
    }	},
    { $sort: { seq: 1, cartonID: 1 } }
  ]);
  // console.log(cartons);
  return cartons;
}

exports.getDCounties= async (companyID) => {
  // limit = +limit; // ## change to number
  const countries = await DCountry.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"show":{$in: showArr}} 
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        seq: 1,
        dCountryID: 1,			
        dCountryName: 1,		
        show: 1,	
    }	},
    { $sort: { seq: 1, dCountryID: 1 } }
  ]);
  // console.log(countries);
  return countries;
}

// ShareFunc.checkExistDCartonID(companyID, dCartonID);
exports.checkExistDCartonID= async (companyID, dCartonID) => {
  // limit = +limit; // ## change to number
  const carton = await DCarton.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"dCartonID":dCartonID},
      // {"show":{$in: showArr}} 
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        seq: 1,
        cartonID: 1,			
        cartonName: 1,		
        cSize: 1,	
        show: 1,	
    }	},
    // { $sort: { seq: 1, dCountryID: 1 } }
  ]);
  // console.log(countries);
  return carton.length > 0 ? true : false;
}

exports.checkExistdCountryID= async (companyID, dCountryID) => {
  // limit = +limit; // ## change to number
  const country = await DCountry.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"dCountryID":dCountryID},
      // {"show":{$in: showArr}} 
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        seq: 1,
        dCountryID: 1,			
        dCountryName: 1,		
        show: 1,	
    }	},
    // { $sort: { seq: 1, dCountryID: 1 } }
  ]);
  // console.log(countries);
  return country.length > 0 ? true : false;
}

// ShareFunc.getDPackings(companyID, seasonYear);
exports.getDPackings= async (companyID, seasonYear, dStatusArr) => {
  // limit = +limit; // ## change to number
  const dPackings = await DPacking.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"seasonYear":seasonYear},
      {"dStatus":{$in: dStatusArr}} 
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,
        seasonYear: 1,			
        customerID: 1,

        orderID: 1,
        dID: 1,
        dCountryID: 1,
        dStatus: 1,
        isLock: 1,
        isLockDCarton: 1,
        seq: 1,
        dDate: 1,
        productionDate: 1,
        dInfo: 1,	
        dCarton: 1,
    }	},
    { $sort: { seq: 1, cartonID: 1 } }
  ]);
  // console.log(dPackings);
  return dPackings;
}


// ## delivery zone ####################################################################
// #################################################################################


// #################################################################################
// ## customer zone ####################################################################

// ## get customers
exports.getCustomers= async (companyID, page, limit) => {
  // limit = +limit; // ## change to number
  const customers = await Customer.aggregate([
    { $match: { $and: [
      {"companyID":companyID}
    ] } },
    { $project: {			
        _id: 1,	
        customerID: 1,
        customerName: 1,		
        setName: 1,	
        companyID: 1,	
        registDate: 1,
        imageProfile: 1,
        cusInfo: 1,
    }	},
    { $sort: { _id: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);
  // console.log(customers);
  return customers;
}

// ## get 1 customer
exports.getCustomer= async (companyID, customerID) => {
  // limit = +limit; // ## change to number
  const customer = await Customer.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"customerID":customerID}
    ] } },
    { $project: {			
      _id: 1,	
      customerID: 1,
      customerName: 1,	
      setName: 1,	
      companyID: 1,	
      registDate: 1,
      imageProfile: 1,
      cusInfo: 1,	

    }	}
  ]);
  // console.log(customer);
  return customer[0]?customer[0]:{};
}


// ## get customer image profile 
exports.getCustomerImageProfile= async (companyID, customerID) => {
  const customer = await Customer.findOne({$and: [ {"companyID":companyID}, {"customerID":customerID} ]});
  return customer?customer.imageProfile:'';
}

// ## edit image profile customer
exports.editCustomerImageProfile= async (companyID, customerID, imageCustomerProfile) => {
  // console.log(companyID, productID, imageProfile);
  resulteditCustomerImageProfile = await Customer.updateOne(  
    {$and: [
      {"companyID":companyID}, 
      {"customerID":customerID},
    ]},
    { "imageProfile": imageCustomerProfile});
}


// ## customer zone ####################################################################
// #################################################################################


// #################################################################################
// ## node station zone ####################################################################

// ## get node station   status -> array
exports.getNodeStations= async (companyID, factoryID, status, page, limit) => {
  // console.log(status);
  // console.log(companyID, factoryID, page, limit);
  const nodeStations = await NodeStation.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      // {"status":{$in: status}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,		
        factoryID: 1,	
        nodeID: 1,	
        nodeName: 1,
        status: 1,
        nodeInfo: 1,
        userNode: 1,
        nStation: 1,
        nodeProblem: 1,
    }	},
    { $sort: { _id: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);
  // console.log(nodeStations);
  return nodeStations;
}

// await ShareFunc.getNodeStationByUUID(uuid);
exports.getNodeStationByUUID= async (uuid, statusArr) => {
  // limit = +limit; // ## change to number
  // console.log(uuid, statusArr);
  let nodeStationUserFF = await NodeStation.aggregate([
    { $match: { $and: [
      {"status":{$in: statusArr}} 
    ] } },
    { $unwind: "$userNode" },
    { $project: { _id: 0, 
      factoryID: 1,		
      companyID: 1,
      nodeID: 1,
      nodeName: 1,
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
      {"uuid":uuid}
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
  let stationID = '';
  // console.log(nodeStationUserFF);
  if (nodeStationUserFF.length>0) {
    // const stationID = nodeStationUserFF[0].stationID;
    // console.log(stationID);

    stationID = nodeStationUserFF[0].stationID;
    //  ## get nodeStation by companyID factoryID nodeID
    let nodeStation = await this.getNodeStation(
                nodeStationUserFF[0].companyID, 
                nodeStationUserFF[0].factoryID, 
                [nodeStationUserFF[0].status], 
                nodeStationUserFF[0].nodeID);
    nodeStation[0].userNode = [];
    let nodestationf = {
      nodeStation: nodeStation[0],
      stationID: stationID
    };
    return nodestationf;
  }

  return null;
}

exports.getNodeStation= async (companyID, factoryID, status, nodeID) => {
  // console.log(status);
  // console.log(companyID, factoryID, page, limit);
  const nodeStation = await NodeStation.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"nodeID":nodeID},
      {"status":{$in: status}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,		
        factoryID: 1,	
        nodeID: 1,	
        nodeName: 1,
        status: 1,
        nodeInfo: 1,
        userNode: 1,
        nStation: 1,
        problem: 1,
    }	},

  ]);
  // console.log(nodeStation);
  return nodeStation;
}

// ShareFunc.checkNodeUserIDExisted(companyID, factoryID, checkUserID)
exports.checkNodeUserIDExisted= async (companyID, factoryID, nodeID, checkUserID) => {
  // limit = +limit; // ## change to number
  const existedNodeUserID = await NodeStation.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      // {"nodeID":{$ne: ""}},
      {"userNode.userNodeID":checkUserID},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        nodeID: 1,	
    }	},
    { $limit: 2 }
  ]);
  // console.log(existedNodeUserID);
  if (existedNodeUserID.length > 1) {
    return true;  // ## exist err
  } else if (existedNodeUserID.length === 1 && existedNodeUserID[0].nodeID === nodeID) {
    return false;
  } else if (existedNodeUserID.length === 1 && existedNodeUserID[0].nodeID !== nodeID) {
    return true;  // ## exist err
  }
  return existedNodeUserID.length>0?true:false;
}

// NodeStationLoginRequest
exports.addNodeStationLoginRequest = async (companyID, factoryID, nodeID, stationID, uuidUserNodeLoginWaiting, minutePlus) => {
  const datetime = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const expiretime = new Date(moment(datetime).tz('Asia/Bangkok').add(minutePlus, 'm').format('YYYY/MM/DD HH:mm:ss+07:00'));

  //  ## send request user node login to owner  --io--
  const userClassArr = ['owner'];
  const path = '/iomessage/koj/node/request/login';
  const userArr = [];
  const formNameArr = [];
  const dataMsgIO = {
    msgTypeID: 'userRequestNodeLoginWaiting',  // ## msgID = message type
    sendIO: {
      userIO: {
        uAll: false,
        userClass: userClassArr,  //
        userID: userArr,  //
      },
      companyIO: {
        comAll: false,
        companyID: [companyID]
      },
      factoryIO: {
        facAll: false,
        factoryID: [factoryID]
      }
    },
    toForm: {   // ## form location alert
      frmAll: true,
      formName: formNameArr,
    },
    dataIO: {
      // ## data messagee any
      // ## data structure depend on function
      userRequestNodeLoginWaiting: {
        mode: 'add',
        companyID: companyID,
        factoryID: factoryID,
        nodeID: nodeID,
        stationID: stationID,
        uuidUserNodeLoginWaiting: uuidUserNodeLoginWaiting,
        datetime: datetime,
        expiretime: expiretime,
        userID: userArr,
        userClass: userClassArr,
        formName: formNameArr,
      }
    }
  };

  
  const resultAddNodeStationLoginRequest = await NodeStationLoginRequest.updateOne({$and: [
    {"companyID":companyID}, 
    {"factoryID":factoryID},
    {"nodeID":nodeID},
    {"stationID":stationID},
  ]} ,
  {$set:{
    uuidUserNodeLoginWaiting: uuidUserNodeLoginWaiting,
    userID: userArr,
    userClass: userClassArr,
    formName: formNameArr,
    datetime: datetime,
    createdAt: datetime,
    expiretime: expiretime,
  }} , {upsert: true});

  // exports.onSendMessageUser = async (dataMsgIO, path)
  messageIOU.onSendMessageUser(dataMsgIO, path);

  return resultAddNodeStationLoginRequest;
}

// await ShareFunc.checkExistNodeFlowID(companyID, factoryID, nodeFlowID)
exports.checkExistNodeFlowID= async (companyID, factoryID, nodeFlowID) => {
  // limit = +limit; // ## change to number
  const existedNodeFlowID = await NodeFlow.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"nodeFlowID":nodeFlowID},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        nodeFlowID: 1,	
    }	},
    { $limit: 1 }
  ]);
  // console.log(existedNodeID);
  return existedNodeFlowID.length>0?true:false;
}

// await ShareFunc.editNodeFlow_FlowType(companyID, factoryID, nodeFlowID, flowType)
exports.editNodeFlow_FlowType= async (companyID, factoryID, nodeFlowID, flowType) => {
  // ## 
  editnodeFlow = await NodeFlow.updateOne(  
    {$and: [
      {"companyID":companyID}, 
      {"factoryID":factoryID},
      {"nodeFlowID":nodeFlowID},
    ]},
    { "flowType": flowType});
  return true;
}

// ShareFunc.editNodeFlow_FlowCondition(companyID, factoryID, nodeFlowID, isFlowSequence);
exports.editNodeFlow_FlowCondition= async (companyID, factoryID, nodeFlowID, isFlowSequence) => {
  // ## 
  editnodeFlow = await NodeFlow.updateOne(  
    {$and: [
      {"companyID":companyID}, 
      {"factoryID":factoryID},
      {"nodeFlowID":nodeFlowID},
    ]},
    { "flowCondition.isFlowSequence": isFlowSequence});
  return true;
}

// editnodeFlow = await ShareFunc.editNodeFlow_FlowSeq(companyID, factoryID, nodeFlowID, flowSeq);
exports.editNodeFlow_FlowSeq= async (companyID, factoryID, nodeFlowID, flowSeq) => {
  // ## 
  editnodeFlow = await NodeFlow.updateOne(  
    {$and: [
      {"companyID":companyID}, 
      {"factoryID":factoryID},
      {"nodeFlowID":nodeFlowID},
    ]},
    { "flowSeq": flowSeq});
  return true;
}

// ## get node flow  companyID, factoryID, page, limit
exports.getNodeFlows= async (companyID, factoryID, page, limit) => {
  const nodeFlows = await NodeFlow.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
    ] } },
    { $project: {			
        _id: 0,	
        nodeFlowID: 1,	
        companyID: 1,		
        factoryID: 1,	
        flowType: 1,
        registDate: 1,
        flowCondition: 1,
        flowSeq: 1,
    }	},
    { $sort: { _id: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);
  // console.log(nodeFlow);
  return nodeFlows;
}

// getSubNodeFlow
exports.getSubNodeflowC= async (companyID) => {
  const subNodeflowC = await SubNodeflowC.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"nodeFlowID":nodeFlowID},
    ] } },
    { $project: {			
        _id: 0,	
        seq: 1,	
        companyID: 1,		
        nodeID: 1,	
        subNodeID: 1,
        subNodeName: 1,

    }	},
  ]);
  // console.log(subNodeflowC);
  return subNodeflowC.length>0?subNodeflowC:[];
}
// seq
// companyID
// nodeID
// subNodeID
// subNodeName


// ShareFunc.getNodeFlow(companyID, factoryID, nodeFlowID);
exports.getNodeFlow= async (companyID, factoryID, nodeFlowID) => {
  const nodeFlow = await NodeFlow.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"nodeFlowID":nodeFlowID},
    ] } },
    { $project: {			
        _id: 0,	
        nodeFlowID: 1,	
        companyID: 1,		
        factoryID: 1,	
        flowType: 1,
        registDate: 1,
        flowCondition: 1,
        flowSeq: 1,
    }	},
  ]);
  // console.log(nodeFlow);
  return nodeFlow.length>0?nodeFlow[0]:null;
}

exports.getNodeFlow1= async (companyID, factoryID, nodeFlowID) => {
  const nodeFlow = await NodeFlow.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"nodeFlowID":nodeFlowID},
    ] } },
    { $project: {			
        _id: 0,	
        nodeFlowID: 1,	
        companyID: 1,		
        factoryID: 1,	
        flowType: 1,
        registDate: 1,
        flowCondition: 1,
        flowSeq: 1,
    }	}
  ]);
  // console.log(nodeFlow);
  return nodeFlow.length>0?nodeFlow[0]:null;
}



// checkExistNodeID(companyID, factoryID, nodeID)
exports.checkExistNodeID= async (companyID, factoryID, nodeID) => {
  // limit = +limit; // ## change to number
  const existedNodeID = await NodeStation.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"nodeID":nodeID},

    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        nodeID: 1,	
    }	},
    { $limit: 1 }
  ]);
  // console.log(existedNodeID);
  return existedNodeID.length>0?true:false;
}

// await ShareFunc.editNodeStation(companyID, factoryID, nodeID)
exports.editNodeStation= async (companyID, factoryID, nodeID, nodeStation) => {
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  // console.log(nodeStation);
  

  const editNodeStation = await NodeStation.updateOne(  
    {$and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"nodeID":nodeID},
    ]},
    { 
      "nodeName": nodeStation.nodeName,
      "status": nodeStation.status,
      "editDate": current,
      "nodeInfo.nodeType": nodeStation.nodeInfo.nodeType,
      "nodeInfo.mustBundleScan": nodeStation.nodeInfo.mustBundleScan,
      "nodeInfo.haveSubWorkflow": nodeStation.nodeInfo.haveSubWorkflow,
      // "nodeInfo.scan1ForAll": nodeStation.nodeInfo.scan1ForAll,
      "nodeInfo.location": nodeStation.nodeInfo.location,
      "nodeInfo.nodeDescription": nodeStation.nodeInfo.nodeDescription,
      "nodeInfo.pic": nodeStation.nodeInfo.pic,
      "userNode": nodeStation.userNode,
      "nStation.stationNo": nodeStation.nStation.stationNo,
      "nodeProblem": nodeStation.nodeProblem,
    });
  // console.log(editNodeStation);
  return editNodeStation;
}

// ShareFunc.editUserNodeStation(companyID, factoryID, nodeID, userNodeID, userNodePass)
exports.editUserNodeStation= async (companyID, factoryID, nodeID, userNode) => {
  // console.log(companyID, factoryID, nodeID, userNodeID, userNodePass);
  const editUserNodeStation = await NodeStation.updateOne(  
    {$and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"nodeID":nodeID},
    ]},
    { 
      "userNode": userNode
    });
  // console.log(editUserNodeStation);
  return editUserNodeStation;
}

exports.editUserUUIDNodeStation= async (companyID, factoryID, nodeID, stationID, uuid) => {

  const editUserUUIDNodeStation = await NodeStation.updateOne(
    {$and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"nodeID":nodeID},
    ]},
    {$set: { "userNode.$[elem].uuid" : uuid}}, 
    {
      multi: true, 
      arrayFilters: [  {"elem.stationID": stationID } ] 
    });

//     stationID
// userNodeID

// arrayFilters: [  {"elem.lottoBetType": "up2" , "elem.betNumber": upNum2, "elem.cancel": false} ]


  // const editUserUUIDNodeStation2 = await NodeStation.updateOne(  
  //   {$and: [
  //     {"companyID":companyID},
  //     {"factoryID":factoryID},
  //     {"nodeID":nodeID},
  //   ]},
  //   { 
  //     "userNode.uuid": uuid,
  //   });

  // console.log(editUserUUIDNodeStation);
  return editUserUUIDNodeStation;
}

// ShareFunc.getNodeStationLoginRequests(companyIDArr)
exports.getNodeStationLoginRequests= async (companyIDArr) => {
  const nodeStationLoginRequests = await NodeStationLoginRequest.aggregate([
    { $match: { $and: [
      {"companyID":{$in: companyIDArr}},
    ] } },
    { $project: {			
        _id: 0,	
        factoryID: 1,	
        companyID: 1,		
        nodeID: 1,	
        stationID: 1,	
        uuidUserNodeLoginWaiting: 1,
        msgTypeID: 1,
        userID: 1,
        userClass: 1,
        formName: 1,
        datetime: 1,
        expiretime: 1,
    }	},

  ]);
  // console.log(nodeFlow);
  return nodeStationLoginRequests;
}

exports.getListNodeStationLoginRequests= async (userID, userClassIDArr) => {

  const companyLists = await this.getUserCompanyLists(userID, userClassIDArr);
  let companyIDArr = [];
  await this.asyncForEach(companyLists, async (item) => {
    companyIDArr.push(item.companyID);
  });

  // ## get list nodeStationLoginRequest
  const nodeStationLoginRequests = await this.getNodeStationLoginRequests(companyIDArr);

  return nodeStationLoginRequests;
}

// const delNodeStationLoginRequest = 
// await ShareFunc.delNodeStationLoginRequest(companyID, factoryID, nodeID, uuidUserNodeLoginWaiting, msgTypeID);
exports.delNodeStationLoginRequest= async (companyID, factoryID, nodeID, stationID, uuidUserNodeLoginWaiting, msgTypeID, action) => {
  result1 = await NodeStationLoginRequest.deleteMany({$and: [
    {"companyID":companyID},
    {"factoryID":factoryID}, 
    {"nodeID":nodeID}, 
    {"uuidUserNodeLoginWaiting":uuidUserNodeLoginWaiting}, 
    {"msgTypeID":msgTypeID}, 
  ]}); 

  //  ## send response user node login to owner  --io--
  const userClassArr = ['owner'];
  const path = '/iomessage/koj/node/response/login';
  const userArr = [];
  const formNameArr = [];
  const dataMsgIO = {
    msgTypeID: 'userResponseNodeLoginWaiting',  // ## msgID = message type
    sendIO: {
      userIO: {
        uAll: false,
        userClass: userClassArr,  //
        userID: userArr,  //
      },
      companyIO: {
        comAll: false,
        companyID: [companyID]
      },
      factoryIO: {
        facAll: false,
        factoryID: [factoryID]
      }
    },
    toForm: {   // ## form location alert
      frmAll: true,
      formName: formNameArr,
    },
    dataIO: {
      // ## data messagee any
      // ## data structure depend on function
      userResponseNodeLoginWaiting: {
        mode: 'answer',
        companyID: companyID,
        factoryID: factoryID,
        nodeID: nodeID,
        stationID: stationID,
        uuidUserNodeLoginWaiting: uuidUserNodeLoginWaiting,
        action: action

      }
    }
  };
  messageIOU.onSendMessageUser(dataMsgIO, path);
  return true;
}

// await ShareFunc.get1NodeStationLoginRequest
exports.get1NodeStationLoginRequest= async (companyID, factoryID, nodeID, stationID, uuidUserNodeLoginWaiting) => {
  const nodeStationLoginRequest = await NodeStationLoginRequest.findOne({$and: [
    {"companyID":companyID}, 
    {"factoryID":factoryID},
    {"nodeID":nodeID},
    {"stationID":stationID},
    {"uuidUserNodeLoginWaiting":uuidUserNodeLoginWaiting},
  ]});
  return nodeStationLoginRequest;
}

exports.getOrderSBySeasonYear= async (companyID, seasonYear) => {
  // limit = +limit; // ## change to number
  const orders = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"seasonYear":seasonYear},
      // {"orderID":{$in: orderIDs}}
    ] } },
    { $project: {			
        _id: 1,	
        orderID: 1,
        seasonYear: 1,
        ver: 1,
        companyID: 1,
        factoryID: 1,
        bundleNo: 1,
        orderStatus: 1,
        orderDetail: 1,		
        orderDate: 1,	
        deliveryDate: 1,
        customerOR: 1,		
        orderTargetPlace: 1,
        orderColor: 1,
        productOR: 1,
        createBy: 1,
        orderSetting: 1,
    }	},
    { $sort: { _id: -1 } }
  ]);
  // console.log(orders);
  return orders;
}

exports.getOrdersBySeasonYear= async (companyID, seasonYear) => {
  const orderIDs = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"seasonYear":seasonYear},
    ] } },
    { $project: {	
        _id: 0,	
        orderID: 1,	
    }	}
  ]);
  // console.log(orderIDs);
  const orderIDsF = await orderIDs.map(fw => ({
    orderID: fw.orderID, 
  }));
  return orderIDsF;
}

// getOrderIDs(companyID, season);
exports.getOrderIDs= async (companyID, seasonYear) => {
  const orderIDs = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"seasonYear":seasonYear},
    ] } },
    { $project: {	
        _id: 0,	
        orderID: 1,	
    }	}
  ]);
  // console.log(orderIDs);
  const orderIDsF = await orderIDs.map(fw => ({
    orderID: fw.orderID, 
  }));
  return orderIDsF;
}

exports.getOrderProduct01= async (companyID, factoryID, productBarcodeNo) => {
  const orderProduct = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productBarcodeNoReal":productBarcodeNo},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        productionNode: 1 ,  
    }	}
  ]).hint( {"companyID" : 1, "productBarcodeNoReal": 1} );
  // publicIP: { $slice: [ "$superAdmin.publicIP", 0, 1] },	
  // console.log(orderProduct);
  return orderProduct.length>0?orderProduct[0]:null;
}

exports.getOrderProductLostList= async (companyID, orderID, productStatus) => {
  const orderProduct = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      {"productStatus":productStatus},
      // {"productBarcodeNo":productBarcodeNo},
      // {"productBarcodeNoReal":{$in: productBarcodeNos}}
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // bundleID: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productBarcodeNoReserve: 1,
        // productCount: 1,
        // productionDate: 1,
        productStatus: 1,
        orLost: 1,
        yarnLot: 1,
        // outsourceData: 1,
        // subNodeFlow: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	}
  ]).hint( {"companyID" : 1, "orderID": 1, "productStatus": 1, "open": 1, "forLoss": 1} );
  // publicIP: { $slice: [ "$superAdmin.publicIP", 0, 1] },	
  // console.log(orderProduct);
  return orderProduct;
}

exports.getOrderProductListByByORIDBunNo= async (companyID, orderID, bundleNo) => {
  const orderProduct = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      {"bundleNo":bundleNo},
      // {"productBarcodeNo":productBarcodeNo},
      // {"productBarcodeNoReal":{$in: productBarcodeNos}}
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        // outsourceData: 1,
        subNodeFlow: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	}
  ]).hint( {"companyID" : 1, "orderID": 1, "bundleNo": 1, "bundleID": 1} );
  // publicIP: { $slice: [ "$superAdmin.publicIP", 0, 1] },	
  // console.log(orderProduct);
  return orderProduct.length>0?orderProduct:[];
}

exports.getOrderProductListByByORIDBunNo2= async (companyID, orderID, bundleNo, bundleID) => {
  const orderProduct = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      {"bundleNo":bundleNo},
      {"bundleID":bundleID},
      // {"productBarcodeNo":productBarcodeNo},
      // {"productBarcodeNoReal":{$in: productBarcodeNos}}
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        // outsourceData: 1,
        subNodeFlow: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	}
  ]).hint( {"companyID" : 1, "orderID": 1, "bundleNo": 1, "bundleID": 1} );
  // publicIP: { $slice: [ "$superAdmin.publicIP", 0, 1] },	
  // console.log(orderProduct);
  return orderProduct.length>0?orderProduct:[];
}

exports.getCOrderProduct1= async (companyID, productBarcodeNos) => {
  const orderProduct = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"productBarcodeNo":productBarcodeNo},
      {"productBarcodeNoReal":{$in: productBarcodeNos}}
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        outsourceData: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	}
  ]);
  // publicIP: { $slice: [ "$superAdmin.publicIP", 0, 1] },	
  // console.log(orderProduct);
  return orderProduct.length>0?orderProduct:[];
}



exports.getOrderProductsByBundleNos= async (companyID, factoryID, bundleNos, bundleID) => {
  const orderProducts = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"bundleID":bundleID},
      // {"productBarcodeNoReal":productBarcodeNo},
      {"bundleNo":{$in: bundleNos}}
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        outsourceData: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	}
  ]);
  // publicIP: { $slice: [ "$superAdmin.publicIP", 0, 1] },	
  // console.log(orderProducts);
  return orderProducts;
}

exports.getOrderProductsByBundleIDs= async (companyID, factoryID, bundleIDs) => {
  const orderProducts = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"productBarcodeNoReal":productBarcodeNo},
      {"bundleID":{$in: bundleIDs}}
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        outsourceData: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	}
  ]);
  // publicIP: { $slice: [ "$superAdmin.publicIP", 0, 1] },	
  // console.log(orderProducts);
  return orderProducts;
}

// await ShareFunc.getOrderProduct1(companyID, factoryID, productBarcodeNo);
exports.getOrderProduct1= async (companyID, factoryID, productBarcodeNo) => {
  const orderProduct = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productBarcodeNoReal":productBarcodeNo},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        outsourceData: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	}
  ]).hint( {"companyID" : 1, "productBarcodeNoReal": 1} );
  // publicIP: { $slice: [ "$superAdmin.publicIP", 0, 1] },	
  // console.log(orderProduct);
  return orderProduct.length>0?orderProduct[0]:null;
}

// getOrderProductReceiveOutsource(companyID, productBarcodeNo);
exports.getOrderProductReceiveOutsource= async (companyID, productBarcodeNo) => {
  const orderProduct = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productBarcodeNoReal":productBarcodeNo},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        outsourceData: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	}
  ]).hint( {"companyID" : 1, "productBarcodeNoReal": 1} );
  // publicIP: { $slice: [ "$superAdmin.publicIP", 0, 1] },	
  // console.log(orderProduct);
  return orderProduct.length>0?orderProduct[0]:null;
}

exports.getOrderProductReceiveOutsource01= async (companyID, productBarcodeNos) => {
  const orderProduct = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"productBarcodeNo":productBarcodeNo},
      {"productBarcodeNoReal":{$in: productBarcodeNos}}
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        outsourceData: 1,
        productionNode: 1,  // ## 
    }	}
  ]).hint( {"companyID" : 1, "productBarcodeNoReal": 1} );
  // publicIP: { $slice: [ "$superAdmin.publicIP", 0, 1] },	
  // console.log(orderProduct);
  return orderProduct.length>0?orderProduct[0]:null;
}

exports.getOrderBarcodeNoList= async (companyID, orderID, bundleNo) => {
  // {"datetime": { $gte: dateStart, $lte : dateEnd}},

  const bundleNoList = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: [orderID]}},
      {"bundleNo":bundleNo},
      // {"bundleNo": { $gte: bunNoStart, $lte : bunNoEnd}},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,	
        orderID: 1,	
        bundleNo: 1,
        // productCount: 1,
        // productBarcodeNo: 1,
        no: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.runningNoPos, +process.env.runningNoDigit ] }},
        // productBarcode: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.productBarcodePos, +process.env.productBarcodeDigit ] }},
        // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
        // color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
        // size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
        // yarnLot: 1,
        // forLoss: 1,
    }	},  
  ])
  .hint( { companyID: 1, orderID: 1, bundleNo: 1, bundleID: 1 } );
  // console.log(bundleNoList);
  const bundleNoListF = await bundleNoList.map(fw => ({
    companyID: fw.companyID, 
    orderID: fw.orderID, 
    // productBarcode: fw._id.productBarcode, 
    bundleNo: fw.bundleNo,
    no: fw.no, 
    // targetPlace: fw._id.targetPlace, 
    // color: fw._id.color, 
    // size: fw._id.size,
    // yarnLot: fw._id.yarnLot,
    // forLoss: fw._id.forLoss,
  }));
  bundleNoListF.sort((a,b)=>{return a.no >b.no?1:a.no <b.no?-1:0});  // ## asc

  // this.orderIDs = Array.from(new Set(this.currentCompanyOrder.map((item: any) => item.orderID)));
  // const bundleNoListN = Array.from(new Set(bundleNoListF.map((item) => item.bundleNo))).sort();

  return bundleNoListF;
}

exports.getOrderBundleNoList= async (companyID, orderID, bunNoStart, bunNoEnd) => {
  // {"datetime": { $gte: dateStart, $lte : dateEnd}},

  const bundleNoList = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: [orderID]}},
      {"bundleNo": { $gte: bunNoStart, $lte : bunNoEnd}},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,	
        orderID: 1,	
        bundleNo: 1,
        productCount: 1,
        productBarcode: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.productBarcodePos, +process.env.productBarcodeDigit ] }},
        targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
        color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
        size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
        yarnLot: 1,
        forLoss: 1,
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productBarcode: '$productBarcode',
        bundleNo: '$bundleNo',
        productCount: '$productCount',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        yarnLot: '$yarnLot',
        forLoss: '$forLoss',
      },
      // sumFactoryOutsQty: {$sum: 1} ,
      // sumFactoryOutsQty: {$sum: '$productCount'} ,
    }}   
  ])
  .hint( { companyID: 1, orderID: 1, bundleNo: 1, bundleID: 1 } );

  const bundleNoListF = await bundleNoList.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    productBarcode: fw._id.productBarcode, 
    bundleNo: fw._id.bundleNo,
    productCount: fw._id.productCount, 
    targetPlace: fw._id.targetPlace, 
    color: fw._id.color, 
    size: fw._id.size,
    yarnLot: fw._id.yarnLot,
    forLoss: fw._id.forLoss,
  }));
  

  // this.orderIDs = Array.from(new Set(this.currentCompanyOrder.map((item: any) => item.orderID)));
  // const bundleNoListN = Array.from(new Set(bundleNoListF.map((item) => item.bundleNo))).sort();

  return bundleNoListF;
}

exports.getCurrentCompanyOrderOutsourceFac1BY1= async (companyID, orderIDs, isOutsource, status, sTypeOtus, sTypeOtusExist) => {
  const orderProductFacOutQTY = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},

      // {"productionNode":  {$elemMatch: {"status": {$in: productionNodeStatusArr} }}},
      {"productionNode":  {$elemMatch: {
        "isOutsource": isOutsource, 
        "status": {$in: status},

        "sTypeOtus": sTypeOtus, 
        // $or: [ { "sTypeOtus": sTypeOtus }, { "sTypeOtus": { $exists: sTypeOtusExist } } ]
        
      }}},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,	
        orderID: 1,	
        // productionNode: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
        color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
        size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
        runningNo: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.runningNoPos, +process.env.runningNoDigit ] }},
        // bundleNo: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element

    }	},
    { $unwind: "$productionNode"},
    { $project: {			
      _id: 1,	
      companyID: 1,	
      orderID: 1,
      targetPlace: 1,
      color: 1,
      size: 1,
      runningNo: 1,
      // bundleNo: 1,
      // productCount: 1,
      productBarcodeNoReal: 1,
      factoryID: "$productionNode.factoryID",	
      // fromNode: "$productionNode.fromNode",
      datetime: "$productionNode.datetime",
      status: "$productionNode.status",
      sTypeOtus: "$productionNode.sTypeOtus",
      isOutsource: "$productionNode.isOutsource",
      outsourceData: "$productionNode.outsourceData",
      // createBy: "$productionNode.createBy",
    }	},

    { $match: { $and: [
      // {"status":status},
      {"status":{$in: status}},
      {"isOutsource":isOutsource},
      
      {"sTypeOtus":sTypeOtus},
      { "sTypeOtus": { $exists: sTypeOtusExist } }
      // {$or: [ { "sTypeOtus": sTypeOtus }, { "sTypeOtus": { $exists: sTypeOtusExist } } ]}
    ] } },
    { $unwind: "$outsourceData"},
    { $project: {			
      _id: 1,
      companyID: 1,	
      orderID: 1,
      targetPlace: 1,
      color: 1,
      size: 1,
      runningNo: 1,
      // bundleNo: 1,
      // productCount: 1,
      productBarcodeNoReal: 1,
      factoryID: 1,
      // fromNode: 1,
      toFactoryID: "$outsourceData.factoryID",
      fromFactoryID: "$outsourceData.fromFactoryID",
      datetime: 1,
      yyyymmdd: { $dateToString: { format: "%Y%m%d", date: "$datetime", timezone : process.env.timezone } },
      // mmdd: { $dateToString: { format: "%m%d", date: "$datetime" } },
      // yearMonthDayUTC: { $dateToString: { format: "%Y-%m-%d", date: "$datetime", timezone : process.env.timezone } },
      // dayMonthUTC: { $dateToString: { format: "%d/%m", date: "$datetime", timezone : process.env.timezone } },
      status: 1,
      sTypeOtus: 1,
      isOutsource: 1,
      // createBy: 1,
    }	},

    // ********** distinct *************************
    { $group: {	
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        runningNo: '$runningNo',
        productBarcodeNoReal: '$productBarcodeNoReal',

        factoryID: "$factoryID",	
        // fromNode: "$fromNode",
        toFactoryID: "$toFactoryID",
        fromFactoryID: "$fromFactoryID",
        datetime: "$datetime",
        yyyymmdd: "$yyyymmdd",
        // yearMonthDayUTC: "$yearMonthDayUTC",
        // dayMonthUTC: "$dayMonthUTC",
        status: "$status",
        sTypeOtus: "$sTypeOtus",
        isOutsource: "$isOutsource",
      }
    }},
    { $project: {	
      companyID: '$_id.companyID',
      orderID: '$_id.orderID',
      targetPlace: '$_id.targetPlace',
      color: '$_id.color',
      size: '$_id.size',
      runningNo: '$_id.runningNo',
      productBarcodeNoReal: '$_id.productBarcodeNoReal',

      factoryID: "$_id.factoryID",	
      // fromNode: "$_id.fromNode",
      toFactoryID: "$_id.toFactoryID",
      fromFactoryID: "$_id.fromFactoryID",
      datetime: "$_id.datetime",
      yyyymmdd: "$_id.yyyymmdd",
      // yearMonthDayUTC: "$_id.yearMonthDayUTC",
      // dayMonthUTC: "$_id.dayMonthUTC",

      status: "$_id.status",
      sTypeOtus: "$_id.sTypeOtus",
      isOutsource: "$_id.isOutsource",
      // outsourceData: "$_id.outsourceData",
    }},
    // ********** distinct *************************

    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        targetPlace: '$targetPlace',
        color: '$color',
        // bundleNo: '$bundleNo',
        // productCount: '$productCount',
        // productBarcodeNoReal: '$productBarcodeNoReal',
        status: '$status',
        // sTypeOtus: '$sTypeOtus',
        factoryID: '$factoryID',
        toFactoryID: '$toFactoryID',
        fromFactoryID: '$fromFactoryID',
        yyyymmdd: '$yyyymmdd',
        // createBy: '$createBy',
      },
      sumFactoryOutsQty: {$sum: 1} ,
      // sumFactoryOutsQty: {$sum: '$productCount'} ,
    }}   
  ])
  .hint( { companyID: 1, orderID: 1, "productionNode.isOutsource": 1, "productionNode.status": 1, "productionNode.sTypeOtus": 1 } );

  const orderProductFacOutQTYF = await orderProductFacOutQTY.map(fw => ({
    // companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    // bundleNo: fw._id.bundleNo, 
    // productCount: fw._id.productCount, 
    // productBarcodeNoReal: fw._id.productBarcodeNoReal, 
    status: fw._id.status, 
    factoryID: fw._id.factoryID,
    toFactoryID: fw._id.toFactoryID,
    fromFactoryID: fw._id.fromFactoryID,
    yyyymmdd: fw._id.yyyymmdd,
    // createBy: fw._id.createBy,
    sumFactoryOutsQty: fw.sumFactoryOutsQty,
  }));

  return orderProductFacOutQTYF;
}

exports.getCurrentCompanyOrderOutsourceFac= async (companyID, orderIDs, isOutsource, status, sTypeOtus, sTypeOtusExist) => {
  // const status = 'outsource';
  const orderProductFacOutQTY = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},

      // {"productionNode":  {$elemMatch: {"status": {$in: productionNodeStatusArr} }}},
      {"productionNode":  {$elemMatch: {
        "isOutsource": isOutsource, 
        "status": {$in: status},

        // "sTypeOtus": sTypeOtus, 
        $or: [ { "sTypeOtus": sTypeOtus }, { "sTypeOtus": { $exists: sTypeOtusExist } } ]
        
      }}},

      // {$or: [ { "sTypeOtus": sTypeOtus }, { "sTypeOtus": { $exists: true } } ]}

      // {"productionNode":  {$elemMatch: {"isOutsource": isOutsource, "status": status }}},
      // { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.isOutsource", -1] }, true] } },
      // { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.status", -1] }, status] } },

      // {"productionNode":  {$elemMatch: {"status": status, "isOutsource": true }}},
      // { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.status", -1] }, status] } },
      // { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.isOutsource", -1] }, true] } },

    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,	
        orderID: 1,	
        // productionNode: 1,
        // productBarcodeNo: 1,
        // productBarcodeNoReal: 1,
        targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
        color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
        // size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
        bundleNo: 1,
        productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element

    }	},
    { $unwind: "$productionNode"},
    { $project: {			
      _id: 1,	
      companyID: 1,	
      orderID: 1,
      targetPlace: 1,
      color: 1,
      // size: 1,
      bundleNo: 1,
      productCount: 1,
      // productBarcodeNoReal: 1,
      factoryID: "$productionNode.factoryID",	
      fromNode: "$productionNode.fromNode",
      datetime: "$productionNode.datetime",
      status: "$productionNode.status",
      sTypeOtus: "$productionNode.sTypeOtus",
      isOutsource: "$productionNode.isOutsource",
      outsourceData: "$productionNode.outsourceData",
      // createBy: "$productionNode.createBy",
    }	},
    { $match: { $and: [
      // {"status":status},
      {"status":{$in: status}},
      {"isOutsource":isOutsource},
      
      // {"sTypeOtus":sTypeOtus},
      {$or: [ { "sTypeOtus": sTypeOtus }, { "sTypeOtus": { $exists: sTypeOtusExist } } ]}
    ] } },
    { $unwind: "$outsourceData"},
    { $project: {			
      _id: 1,	
      companyID: 1,	
      orderID: 1,
      targetPlace: 1,
      color: 1,
      bundleNo: 1,
      productCount: 1,
      // productBarcodeNoReal: 1,
      factoryID: 1,
      fromNode: 1,
      toFactoryID: "$outsourceData.factoryID",
      fromFactoryID: "$outsourceData.fromFactoryID",
      datetime: 1,
      yyyymmdd: { $dateToString: { format: "%Y%m%d", date: "$datetime", timezone : process.env.timezone } },
      // mmdd: { $dateToString: { format: "%m%d", date: "$datetime" } },
      yearMonthDayUTC: { $dateToString: { format: "%Y-%m-%d", date: "$datetime", timezone : process.env.timezone } },
      dayMonthUTC: { $dateToString: { format: "%d/%m", date: "$datetime", timezone : process.env.timezone } },
      status: 1,
      sTypeOtus: 1,
      isOutsource: 1,
      // createBy: 1,
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        targetPlace: '$targetPlace',
        color: '$color',
        bundleNo: '$bundleNo',
        productCount: '$productCount',
        // productBarcodeNoReal: '$productBarcodeNoReal',
        status: '$status',
        // sTypeOtus: '$sTypeOtus',
        factoryID: '$factoryID',
        toFactoryID: '$toFactoryID',
        fromFactoryID: '$fromFactoryID',
        yyyymmdd: '$yyyymmdd',
        // createBy: '$createBy',
      },
      sumFactoryOutsQty: {$sum: 1} ,
      // sumFactoryOutsQty: {$sum: '$productCount'} ,
    }}   
  ])
  .hint( { companyID: 1, orderID: 1, "productionNode.isOutsource": 1, "productionNode.status": 1, "productionNode.sTypeOtus": 1 } );

  const orderProductFacOutQTYF = await orderProductFacOutQTY.map(fw => ({
    // companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    bundleNo: fw._id.bundleNo, 
    productCount: fw._id.productCount, 
    // productBarcodeNoReal: fw._id.productBarcodeNoReal, 
    status: fw._id.status, 
    factoryID: fw._id.factoryID,
    toFactoryID: fw._id.toFactoryID,
    fromFactoryID: fw._id.fromFactoryID,
    yyyymmdd: fw._id.yyyymmdd,
    // createBy: fw._id.createBy,
    sumFactoryOutsQty: fw.sumFactoryOutsQty,
  }));

  return orderProductFacOutQTYF;
}

// ShareFunc.getCurrentCompanyOrderOutsource(companyID, orderIDs)
exports.getCurrentCompanyOrderOutsource= async (companyID, orderIDs) => {
  const orderProductFacOuts = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},

      {"productionNode":  {$elemMatch: {"isOutsource": true }}},
      // { $expr: { $in: [{ "$arrayElemAt": ["$productionNode.fromNode", -1] }, nodeIDs] } },

    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,	
        // orderID: 1,	
        productionNode: 1
    }	},
    { $unwind: "$productionNode"},
    { $project: {			
      _id: 1,	
      companyID: 1,	
      isOutsource: "$productionNode.isOutsource",
      outsourceData: "$productionNode.outsourceData",
    }	},
    { $match: { $and: [
      {"isOutsource":true},
    ] } },
    { $unwind: "$outsourceData"},
    { $project: {			
      _id: 1,	
      companyID: 1,	
      outsourcefactoryID: "$outsourceData.factoryID",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        // orderID: '$orderID',
        outsourcefactoryID: '$outsourcefactoryID',
      }
    }}  
 
  ])
  .hint( { companyID: 1, orderID: 1, "productionNode.isOutsource": 1, "productionNode.status": 1, "productionNode.sTypeOtus": 1 } );

// // console.log(orderProductFacOuts);
const orderProductFacOutsF = await orderProductFacOuts.map(fw => ({
  // companyID: fw._id.companyID, 
  outsourcefactoryID: fw._id.outsourcefactoryID,
}));
    
  return orderProductFacOutsF;
}



// ShareFunc.getCurrentCompanyOrderOutsourceQTY(companyID, orderIDs);
exports.getCurrentCompanyOrderOutsourceQTY= async (companyID, orderIDs) => {
  const orderProductFacOutQTY = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,	
        orderID: 1,	
        outsourceData: 1
    }	},
    { $unwind: "$outsourceData"},
    { $project: {			
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      outsourcefactoryID: "$outsourceData.factoryID",
    }	},
    // { $match: { $and: [
    //   {"isOutsource":true},
    // ] } },
    // { $unwind: "$outsourceData"},
    // { $project: {			
    //   _id: 1,	
    //   companyID: 1,	
    //   orderID: 1,	
    //   outsourcefactoryID: "$outsourceData.factoryID",
    // }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        outsourcefactoryID: '$outsourcefactoryID',
      },
      sumFactoryOutsQty: {$sum: 1} ,
    }}   
  ]).hint( {"companyID" : 1, "orderID": 1, "productBarcodeNoReal": 1} );

  const orderProductFacOutQTYF = await orderProductFacOutQTY.map(fw => ({
    // companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    outsourcefactoryID: fw._id.outsourcefactoryID,
    sumFactoryOutsQty: fw.sumFactoryOutsQty,
  }));

  return orderProductFacOutQTYF;
}

// orderProductFacOutRemainQTY = await ShareFunc.getCurrentCompanyOrderOutsourceRemianQTY(companyID, orderIDs);
exports.getCurrentCompanyOrderOutsourceRemianQTY= async (companyID, orderIDs) => {
  const status = 'outsource';
  const orderProductFacOutQTY = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},

      {"productionNode":  {$elemMatch: {"status": status, "isOutsource": true }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.status", -1] }, status] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.isOutsource", -1] }, true] } },

    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,	
        orderID: 1,	
        // productionNode: 1,
        // productBarcodeNo: 1,
        // productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element

    }	},
    { $unwind: "$productionNode"},
    { $project: {			
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      status: "$productionNode.status",
      isOutsource: "$productionNode.isOutsource",
      outsourceData: "$productionNode.outsourceData",
    }	},
    { $match: { $and: [
      {"status":status},
      {"isOutsource":true},
    ] } },
    { $unwind: "$outsourceData"},
    { $project: {			
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      outsourcefactoryID: "$outsourceData.factoryID",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        outsourcefactoryID: '$outsourcefactoryID',
      },
      sumFactoryOutsQty: {$sum: 1} ,
    }}   
  ])
  .hint( { companyID: 1, orderID: 1, "productionNode.isOutsource": 1, "productionNode.status": 1, "productionNode.sTypeOtus": 1 } );
  // .hint( { companyID: 1, orderID: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );

  const orderProductFacOutQTYF = await orderProductFacOutQTY.map(fw => ({
    // companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    outsourcefactoryID: fw._id.outsourcefactoryID,
    sumFactoryOutsQty: fw.sumFactoryOutsQty,
  }));

  return orderProductFacOutQTYF;
}

// ShareFunc.getCurrentCompanyOrderStyleColorSizeOutsourceQTY(companyID, orderIDs);
exports.getCurrentCompanyOrderStyleColorSizeOutsourceQTY= async (companyID, orderIDs) => {
  const orderProductFacOutQTY = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,	
        orderID: 1,	
        outsourceData: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
    }	},
    { $unwind: "$outsourceData"},
    { $project: {			
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},

      outsourcefactoryID: "$outsourceData.factoryID",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        // factoryID: '$factoryID',
        orderID: '$orderID',
        outsourcefactoryID: '$outsourcefactoryID',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }} ,
 
  ]).hint( {"companyID" : 1, "orderID": 1, "productBarcodeNoReal": 1} );

  const result = await orderProductFacOutQTY.map(fw => ({
    // companyID: fw._id.companyID, 
    orderID: fw._id.orderID,
    outsourcefactoryID: fw._id.outsourcefactoryID,
    // style: fw._id.style,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    size: fw._id.size,
    countQty: fw.countQty,
  }));

  return result;
}

// ShareFunc.getCurrentCompanyOrderStyleColorSizeOutsourceRemainQTY(companyID, orderIDs);
exports.getCurrentCompanyOrderStyleColorSizeOutsourceRemainQTY= async (companyID, orderIDs) => {
  const status = 'outsource';
  const orderProductFacOutQTY = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},

      {"productionNode":  {$elemMatch: {"status": status, "isOutsource": true }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.status", -1] }, status] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.isOutsource", -1] }, true] } },

    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,	
        orderID: 1,	
        // productionNode: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element

    }	},
    { $unwind: "$productionNode"},
    { $project: {			
      _id: 1,	
      companyID: 1,	
      orderID: 1,	

      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},

      status: "$productionNode.status",
      isOutsource: "$productionNode.isOutsource",
      outsourceData: "$productionNode.outsourceData",
    }	},
    { $match: { $and: [
      {"status":status},
      {"isOutsource":true},
    ] } },
    { $unwind: "$outsourceData"},
    { $project: {			
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      outsourcefactoryID: "$outsourceData.factoryID",
      style: 1,	
      targetPlace: 1,	
      color: 1,	
      size: 1,	
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        // factoryID: '$factoryID',
        orderID: '$orderID',
        outsourcefactoryID: '$outsourcefactoryID',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }} ,  
  ])
  .hint( { companyID: 1, orderID: 1, "productionNode.isOutsource": 1, "productionNode.status": 1, "productionNode.sTypeOtus": 1 } );

  const result = await orderProductFacOutQTY.map(fw => ({
    // companyID: fw._id.companyID, 
    orderID: fw._id.orderID,
    outsourcefactoryID: fw._id.outsourcefactoryID,
    // style: fw._id.style,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    size: fw._id.size,
    countQty: fw.countQty,
  }));

  return result;
}


exports.getOrderProductByOrderID1= async (companyID, factoryID, orderID, productID, productBarcodeNo) => {
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const orderProduct = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"orderID":orderID},
      // {"productID":productID},
      {"productBarcodeNoReal":productBarcodeNo},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	}
  ]).hint( {"companyID" : 1, "factoryID": 1, "orderID": 1, "productBarcodeNoReal": 1} );
  // publicIP: { $slice: [ "$superAdmin.publicIP", 0, 1] },	
  // console.log(orderProduct);
  return orderProduct.length>0?orderProduct[0]:null;
}




// ## node station zone ####################################################################
// #################################################################################


// #######################################################################################################
// ## report..... staff/worker factory login to node workstation

// ## find max running number of productID
exports.getMaxProductIDRunningNo = async (companyID, productBarcode) => {
  // console.log(productBarcode);
  const orderProductNo = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {$expr: { $eq: [{ $substr: ["$productBarcodeNoReal", 0, 37] }, productBarcode] }}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        no: { $toUpper:{ $substr: [ "$productBarcodeNoReal", 37, 5 ] }},
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element

    }	},

    // { $unwind: "$productionNode" },

    // { $project: { 
    //   _id: 0, 
    //   companyID: 1,
    //   factoryID: 1,		
    //   // orderID: 1,	
    //   // bundleNo: 1,
    //   productID: 1,
    //   // productBarcodeNo: 1,
    //   style: { $toUpper:{ $substr: [ "$productBarcodeNo", 0, 12 ] }},
    //   targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNo", 12, 4 ] }},		
    //   color: { $toUpper:{ $substr: [ "$productBarcodeNo", 18, 10 ] }},
    //   size: { $toUpper:{ $substr: [ "$productBarcodeNo", 28, 3 ] }},
    //   // productCount: 1,
    //   // productionDate: 1,
    //   // productStatus: 1,
    //   // fromNode: "$productionNode.fromNode",
    //   // toNode: "$productionNode.toNode",
    //   // datetime: "$productionNode.datetime",
    //   // createBy: "$productionNode.createBy",
    // }},

    // { $match: { $and: [
    //   {"toNode":nodeID},
    // ] } },
    // { $project: { 
    //   _id: 0, 
    //   companyID: 1,
    //   factoryID: 1,	
    //   productID: 1,	
    //   style: 1,	
    //   targetPlace: 1,
    //   color: 1,
    //   size: 1,
    //   // productID: 1,
    //   // productBarcodeNo: 1,
    //   // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNo", 8, 4 ] }},	
    //   // lottoMainTypeID: { $substr: [ "$lottoRoundID", 9, 3 ] },	
    //   // item: { $toUpper: "$item" },
    //   // productCount: 1,
    //   // productionDate: 1,
    //   // productStatus: 1,
    //   // productProblem: 1,
    //   // fromNode: 1,
    //   // toNode: 1,
    //   // datetime: 1,
    //   // createBy: 1,
    // }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        // factoryID: '$factoryID',
        // productID: '$productID',
        // style: '$style',
        // targetPlace: '$targetPlace',
        // color: '$color',
        // size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      maxNo: { $max : "$no" } ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ]).hint( {"companyID" : 1, "productBarcodeNoReal": 1} );
  // console.log(orderProductRep);

  // const orderProductRepF = await orderProductRep.map(fw => ({
  //   companyID: fw._id.companyID, 
  //   factoryID: fw._id.factoryID,
  //   productID: fw._id.productID,
  //   style: fw._id.style,
  //   size: fw._id.size,
  //   targetPlace: fw._id.targetPlace,
  //   color: fw._id.color,
  //   countQty: fw.countQty,
  // }));

  // console.log(orderProductNo);
  return orderProductNo.length>0? +orderProductNo[0].maxNo : 0;
}


// ShareFunc.getCFNCurrentProductAllDetail(companyID, factoryID, nodeID, productStatusArr)
exports.getCFNCurrentProductAllDetail = async (companyID, factoryID, nodeID, productStatusArr) => {
  // console.log('getRepCFNCurrentProductQty');
  const currentProductAllDetailCFN = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },
      // {"factoryID":factoryID},
      // {"toNode":nodeID},
      
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      productCount: 1,
      productionDate: 1,
      productStatus: 1,
      yarnLot: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      productCount: 1,
      productionDate: 1,
      productStatus: 1,
      yarnLot: 1,

      fromNode: 1,
      toNode: 1,
      status: 1,
      toNode: 1,
      productProblemID: 1,
      createBy: 1,
    }},
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );

  // console.log(orderProductRep);
  // return orderProductRep.length>0?orderProduct[0]:null;
  return currentProductAllDetailCFN;
}

// PL = page , limit
exports.getCFNCurrentProductAllDetailPL = async (companyID, factoryID, nodeID, productStatusArr, page, limit) => {
  // console.log('getRepCFNCurrentProductQty');
  // console.log(nodeID, productStatusArr, page, limit);
  const currentProductAllDetailCFN = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "fromNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.fromNode", -1] }, nodeID] } },
      // {"factoryID":factoryID},
      // {"fromNode":nodeID},

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      productCount: 1,
      productionDate: 1,
      productStatus: 1,
      yarnLot: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"fromNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      productCount: 1,
      productionDate: 1,
      productStatus: 1,
      yarnLot: 1,

      fromNode: 1,
      toNode: 1,
      status: 1,
      toNode: 1,
      productProblemID: 1,
      datetime: 1,
      createBy: 1,
    }},
    { $sort: { datetime: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: +limit }
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.fromNode": 1 } );
  // console.log(currentProductAllDetailCFN);
  // return orderProductRep.length>0?orderProduct[0]:null;
  return currentProductAllDetailCFN;
}

exports.getCountCFNCurrentProductAllDetailPL = async (companyID, factoryID, nodeID, productStatusArr) => {
  // console.log('getRepCFNCurrentProductQty');
  const countCurrentProductAllDetailCFN = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "fromNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.fromNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1 ,
        productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      productCount: 1,
      productionDate: 1,
      productStatus: 1,
      yarnLot: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"fromNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      productCount: 1,
      productionDate: 1,
      productStatus: 1,
      yarnLot: 1,

      fromNode: 1,
      toNode: 1,
      status: 1,
      toNode: 1,
      productProblemID: 1,
      datetime: 1,
      createBy: 1,
    }},
    { $group: { _id: null, count: { $sum: 1 } } }
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.fromNode": 1 } );
  // console.log(countCurrentProductAllDetailCFN);
  let rows = 0;
  if (countCurrentProductAllDetailCFN.length > 0 ) {
    rows = countCurrentProductAllDetailCFN[0].count;
  }
  return rows;

  // console.log(countCurrentProductAllDetailCFN);
  // return orderProductRep.length>0?orderProduct[0]:null;
  // return countCurrentProductAllDetailCFN;
}

exports.getCFNCurrentProductAllDetailToNodePL = async (companyID, factoryID, nodeID, productStatusArr, page, limit) => {
  // console.log('getRepCFNCurrentProductQty');
  const currentProductAllDetailCFN = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      productCount: 1,
      productionDate: 1,
      productStatus: 1,
      yarnLot: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      productCount: 1,
      productionDate: 1,
      productStatus: 1,
      yarnLot: 1,

      fromNode: 1,
      toNode: 1,
      status: 1,
      toNode: 1,
      productProblemID: 1,
      datetime: 1,
      createBy: 1,
    }},
    { $sort: { datetime: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: +limit }
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // console.log(currentProductAllDetailCFNPL);
  // return orderProductRep.length>0?orderProduct[0]:null;
  return currentProductAllDetailCFN;
}

// getCFNCurrentProductStyleQRCode(companyID, factoryID, nodeID, style, productStatusArr, page, limit);
exports.getCFNCurrentProductStyleQRCode = async (companyID, factoryID, nodeID, style, productStatusArr, page, limit) => {
  // console.log('getRepCFNCurrentProductQty');
  const style1 = (style+'').trim();
  const currentProductStyleQRCodeCFN = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"productID":style},
      {"orderID":style1},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        yarnLot: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      yarnLot: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      yarnLot: 1,

      fromNode: 1,
      toNode: 1,
      status: 1,
      toNode: 1,
      productProblemID: 1,
      datetime: 1,
      createBy: 1,
    }},
    { $sort: { productBarcodeNoReal: 1 } },
    { $skip: (page-1) *  limit},
    { $limit: +limit }
  ])
  .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // console.log(currentProductStyleQRCodeCFN);
  // return orderProductRep.length>0?orderProduct[0]:null;
  return currentProductStyleQRCodeCFN;
}

// await ShareFunc.getCFNCurrentProductStyleZoneSizeColorQRCode(companyID, factoryID, nodeID, style, zone, size, color, productStatusArr, page, limit);
exports.getCFNCurrentProductStyleZoneSizeColorQRCode = async (companyID, factoryID, nodeID, style, zone, size, color, productStatusArr, page, limit) => {
  // console.log('getRepCFNCurrentProductQty');
  const style1 = (style+'').trim();
  const currentProductStyleQRCodeCFN = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":style1},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        yarnLot: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      yarnLot: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
      {"targetPlace":zone},
      {"color":color},
      {"size":size},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      yarnLot: 1,

      fromNode: 1,
      toNode: 1,
      status: 1,
      toNode: 1,
      productProblemID: 1,
      datetime: 1,
      createBy: 1,
    }},
    { $sort: { productBarcodeNoReal: 1 } },
    { $skip: (page-1) *  limit},
    { $limit: +limit }
  ])
  .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // console.log(currentProductStyleQRCodeCFN);
  // return orderProductRep.length>0?orderProduct[0]:null;
  return currentProductStyleQRCodeCFN;
}

// ShareFunc.getQRCodeCFTNszcsList(companyID, factoryID, toNode, style, zone, color, size, page, limit);
exports.getQRCodeCFTNszcsList = async (companyID, factoryID, nodeID, style, zone, color, size, page, limit) => {
  // console.log('getQRCodeCFTNszcsList');
  const qrCodeList = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":style},
      // {"productStatus":{$in: productStatusArr}}

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        // bundleID: 1,
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        yarnLot: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},

    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      yarnLot: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
      {"targetPlace":zone},
      {"color":color},
      {"size":size},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      // targetPlace: 1,
      // color: 1,
      // size: 1,
      productCount: 1,
      yarnLot: 1,
      fromNode: 1,
      toNode: 1,
      status: 1,
      // toNode: 1,
      productProblemID: 1,
      datetime: 1,
      createBy: 1,
    }},

    { $sort: { productBarcodeNoReal: 1 } },
    { $skip: (page-1) *  limit},
    { $limit: +limit }
  ])
  .hint( { companyID: 1, orderID: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // console.log(qrCodeList);
  // return orderProductRep.length>0?orderProduct[0]:null;
  return qrCodeList;
}  

// ShareFunc.getQRCodeCFTNszcsCount(companyID, factoryID, toNode, style, zone, color, size);
exports.getQRCodeCFTNszcsCount = async (companyID, factoryID, nodeID, style, zone, color, size) => {
  // console.log('getQRCodeCFTNszcsCount');
  const qrCodeCount = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":style},
      // {"productStatus":{$in: productStatusArr}}

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // bundleID: 1,
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // yarnLot: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},

    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      // bundleNo: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // yarnLot: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      // productProblemID: "$productionNode.productProblemID",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
      {"targetPlace":zone},
      {"color":color},
      {"size":size},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      // bundleNo: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // yarnLot: 1,
      
      factoryID: 1,
      // fromNode: 1,
      toNode: 1,
      // status: 1,
      // toNode: 1,
      // productProblemID: 1,
      // datetime: 1,
      // createBy: 1,
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        nodeID: '$toNode',
        // productID: '$productID',
        // userID: '$userID',
        // mode: '$mode',
    },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );

  // console.log(qrCodeCount);
  const qrCodeCountF = await qrCodeCount.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    nodeID: fw._id.nodeID,
    countQty: fw.countQty,
  }));
  // console.log(qrCodeCountF);
  // return orderProductRep.length>0?orderProduct[0]:null;
  return qrCodeCountF.length>0?qrCodeCountF[0]:{};
}  



// exports.getRepCFNCurrentProductQty = async (companyID, factoryID, nodeID, productStatusArr) => {
//   // lottoRoundRows = await LottoRound.countDocuments({$and: [
//   //   // {"roundShow":true} , 
//   //   {"yeekeeSubList":false} ,
//   //   {"company.companyID":companyID},
//   //   // {"roundShow":true} ,
//   //   {"del":'n'}
//   // ]});
// }

exports.getRepCFNCurrentProductQty = async (companyID, factoryID, nodeID, productStatusArr) => {
  // console.log('getRepCFNCurrentProductQty');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        // productBarcodeNoReal: 1,
        // productBarcodeNoReserve: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // yarnLot: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productBarcodeNoReserve: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // yarnLot: 1,
      factoryID: "$productionNode.factoryID",
      // fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      // status: "$productionNode.status",
      // productProblemID: "$productionNode.productProblemID",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productBarcodeNoReserve: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // yarnLot: 1,

      // fromNode: 1,
      toNode: 1,
      // status: 1,
      // toNode: 1,
      // productProblemID: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        // factoryID: '$factoryID',
        // orderID: '$orderID',
        // nodeID: '$toNode',
        // productID: '$productID',
        // userID: '$userID',
        // mode: '$mode',
    },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );



  console.log(orderProductRep);
  // return orderProductRep.length>0?orderProduct[0]:null;
  return orderProductRep;
}

exports.getRepCFNCurrentProductQtyCount = async (companyID, factoryID, nodeID, productStatusArr) => {
  // console.log('getRepCFNCurrentProductQty');
  // console.log(companyID, factoryID, nodeID, productStatusArr);

  // rows = await Product.countDocuments({$and: [
  //   {"companyID":companyID}
  // ]});
  // return rows;

  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },
      // {"factoryID":factoryID},
      // {"toNode":nodeID},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        // productBarcodeNoReal: 1,
        // productBarcodeNoReserve: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // yarnLot: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productBarcodeNoReserve: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // yarnLot: 1,
      factoryID: "$productionNode.factoryID",
      // fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      // status: "$productionNode.status",
      // productProblemID: "$productionNode.productProblemID",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productBarcodeNoReserve: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // yarnLot: 1,

      // fromNode: 1,
      // toNode: 1,
      // status: 1,
      // toNode: 1,
      // productProblemID: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
    },
      sumProductQty: {$sum: 1} ,
    }} 
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // console.log(orderProductRep);

  // const productionPeriodM = await productionPeriod.map(fw => ({
  //   companyID: fw._id.companyID, 
  //   orderID: fw._id.orderID,
  //   style: fw._id.style,
  //   color: fw._id.color,
  //   size: fw._id.size,
  //   fromNode: fw._id.fromNode,
  //   sumProductQty: fw.sumProductQty,
  // }));

  // console.log(orderProductRep);

  // const allQTY = orderProductRep[0]?orderProductRep[0].sumProductQty:0;

  // console.log(orderProductRep[0].sum);
  const orderProductRepS = orderProductRep.length > 0 ? orderProductRep[0].sumProductQty : 0;

  return orderProductRepS;
}

// getProductionZoneForLossQTYC
exports.getProductionZoneForLossQTYC = async (companyID, productStatusArr, productionNodeStatusArr, openArr, forLossArr, orderIDArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  // console.log(companyID, productStatusArr, productionNodeStatusArr);
  const productionPeriod = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},
      {"open":{$in: openArr}},
      {"forLoss":{$in: forLossArr}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
        // productionNode: 1,
        style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
        targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
        // countryID: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.countryIDPos, +process.env.countryIDDigit ] }},
        // year: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.yearPos, +process.env.yearDigit ] }},
        color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
        size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
    }	},


    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        // fromNode: '$fromNode',
    },
      sumProductQty: {$sum: 1} ,
    }}  
  ]).hint( {"companyID" : 1, "orderID": 1, "productStatus": 1, "open": 1, "forLoss": 1} );

  // console.log(productionPeriod);
  const productionPeriodM = await productionPeriod.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID,
    style: fw._id.style,
    targetPlaceID: fw._id.targetPlace,
    color: fw._id.color,
    size: fw._id.size,
    // fromNode: fw._id.fromNode,
    sumProductQty: fw.sumProductQty,
  }));
  // console.log(productionPeriodM);
  return productionPeriodM;
}

exports.getProductionForLossQTYC = async (companyID, productStatusArr, productionNodeStatusArr, openArr, forLossArr, orderIDArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  // console.log(companyID, productStatusArr, productionNodeStatusArr);
  const productionPeriod = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},
      {"open":{$in: openArr}},
      {"forLoss":{$in: forLossArr}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
        // productionNode: 1,
        style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
        // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", process.env.targetIDPos, process.env.targetIDDigit ] }},
        // countryID: { $toUpper:{ $substr: [ "$productBarcodeNoReal", process.env.countryIDPos, process.env.countryIDDigit ] }},
        // year: { $toUpper:{ $substr: [ "$productBarcodeNoReal", process.env.yearPos, process.env.yearDigit ] }},
        color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
        size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
    }	},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        style: '$style',
        color: '$color',
        size: '$size',
        // fromNode: '$fromNode',
    },
      sumProductQty: {$sum: 1} ,
    }}  
  ]).hint( {"companyID" : 1, "orderID": 1, "productStatus": 1, "open": 1, "forLoss": 1} );

  // console.log(productionPeriod);
  const productionPeriodM = await productionPeriod.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID,
    style: fw._id.style,
    color: fw._id.color,
    size: fw._id.size,
    // fromNode: fw._id.fromNode,
    sumProductQty: fw.sumProductQty,
  }));
  // console.log(productionPeriodM);
  return productionPeriodM;
}

// ShareFunc.getProductionPeriodC(companyID, productStatusArr, productionNodeStatusArr)
exports.getProductionPeriodC = async (companyID, productStatusArr, productionNodeStatusArr, orderIDArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  // console.log(companyID, productStatusArr, productionNodeStatusArr);
  const productionPeriod = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"status": {$in: productionNodeStatusArr} }}},  // {"status":{$in: productionNodeStatusArr}}

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // isOutsourceTracking: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
        productionNode: 1,
    }	},

    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      // isOutsourceTracking: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", process.env.targetIDPos, process.env.targetIDDigit ] }},
      // countryID: { $toUpper:{ $substr: [ "$productBarcodeNoReal", process.env.countryIDPos, process.env.countryIDDigit ] }},
      // year: { $toUpper:{ $substr: [ "$productBarcodeNoReal", process.env.yearPos, process.env.yearDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"status":{$in: productionNodeStatusArr}}
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // isOutsourceTracking: 1,
      style: 1,
      color: 1,
      size: 1,
      // productProblem: 1,
      // fromNode: 1,
      fromNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        style: '$style',
        color: '$color',
        size: '$size',
        fromNode: '$fromNode',
    },
      sumProductQty: {$sum: 1} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.status": 1 } );

  // console.log(productionPeriod);
  const productionPeriodM = await productionPeriod.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID,
    style: fw._id.style,
    color: fw._id.color,
    size: fw._id.size,
    fromNode: fw._id.fromNode,
    sumProductQty: fw.sumProductQty,
  }));
  // console.log(productionPeriodM);
  return productionPeriodM;
}

exports.getProductionZonePeriodC = async (companyID, productStatusArr, productionNodeStatusArr, orderIDArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  // console.log(companyID, productStatusArr, productionNodeStatusArr);
  const productionPeriod = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"status": {$in: productionNodeStatusArr} }}},

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // forLoss: 1,
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // targetPlace: 1,
        targetPlaceID: "$targetPlace.targetPlaceID",
        targetPlaceName: "$targetPlace.targetPlaceName",
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
        productionNode: 1,
    }	},

    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      // forLoss: 1,
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // targetPlace: 1,
      targetPlaceID: 1,
      targetPlaceName: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"status":{$in: productionNodeStatusArr}}
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      // forLoss: 1,
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // targetPlace: 1,
      targetPlaceID: 1,
      targetPlaceName: 1,
      style: 1,
      color: 1,
      size: 1,
      // productProblem: 1,
      // fromNode: 1,
      fromNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        // forLoss: '$forLoss',
        targetPlaceID: '$targetPlaceID',
        targetPlaceName: '$targetPlaceName',
        style: '$style',
        color: '$color',
        size: '$size',
        fromNode: '$fromNode',
    },
      sumProductQty: {$sum: 1} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.status": 1 } );

  // console.log(productionPeriod);
  const productionPeriodM = await productionPeriod.map(fw => ({
    // companyID: fw._id.companyID, 
    orderID: fw._id.orderID,
    // forLoss: fw._id.forLoss,
    targetPlaceID: fw._id.targetPlaceID,
    // targetPlaceName: fw._id.targetPlaceName,
    // style: fw._id.style,
    color: fw._id.color,
    size: fw._id.size,
    fromNode: fw._id.fromNode,
    sumProductQty: fw.sumProductQty,
  }));
  // console.log(productionPeriodM);
  return productionPeriodM;
}

exports.getProductionZonePeriodDate12C = async (companyID, productStatusArr, productionNodeStatusArr, orderIDArr, dateStart, dateEnd) => {
  const productionPeriod = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {
        "datetime": { $gte: dateStart, $lte : dateEnd}, 
        "status": {$in: productionNodeStatusArr},
      }}},

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        productBarcodeNoReal: 1,
        // targetPlace: 1,
        targetPlaceID: "$targetPlace.targetPlaceID",
        targetPlaceName: "$targetPlace.targetPlaceName",
        productionNode: 1,
    }	},

    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	

      targetPlaceID: 1,
      targetPlaceName: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},

      fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"datetime": { $gte: dateStart, $lte : dateEnd}},
      {"status":{$in: productionNodeStatusArr}},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	

      targetPlaceID: 1,
      targetPlaceName: 1,
      style: 1,
      color: 1,
      size: 1,
      // productProblem: 1,
      // fromNode: 1,
      fromNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        // forLoss: '$forLoss',
        targetPlaceID: '$targetPlaceID',
        targetPlaceName: '$targetPlaceName',
        style: '$style',
        color: '$color',
        size: '$size',
        fromNode: '$fromNode',
    },
      sumProductQty: {$sum: 1} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.status": 1 } );

  // console.log(productionPeriod);
  const productionPeriodM = await productionPeriod.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID,
    // forLoss: fw._id.forLoss,
    targetPlaceID: fw._id.targetPlaceID,
    targetPlaceName: fw._id.targetPlaceName,
    style: fw._id.style,
    color: fw._id.color,
    size: fw._id.size,
    fromNode: fw._id.fromNode,
    sumProductQty: fw.sumProductQty,
  }));
  // console.log(productionPeriodM);
  return productionPeriodM;
}

exports.getProductionZonePeriodUserScanDate12C = async (companyID, productStatusArr, productionNodeStatusArr, orderIDArr, dateStart, dateEnd, userIDGroup) => {
  // console.log(userIDGroup);
  const productionPeriod = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {
        "datetime": { $gte: dateStart, $lte : dateEnd}, 
        "status": {$in: productionNodeStatusArr},
        "createBy.userID": {$in: userIDGroup},
      }}},

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        productBarcodeNoReal: 1,
        // targetPlace: 1,
        targetPlaceID: "$targetPlace.targetPlaceID",
        targetPlaceName: "$targetPlace.targetPlaceName",
        productionNode: 1,
    }	},

    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	

      targetPlaceID: 1,
      targetPlaceName: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},

      fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
      userID: "$productionNode.createBy.userID",
    }},

    { $match: { $and: [
      {"datetime": { $gte: dateStart, $lte : dateEnd}},
      {"status":{$in: productionNodeStatusArr}},
      {"createBy.userID":{$in: userIDGroup}},
      // {"userID":{$in: userIDGroup}},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	

      targetPlaceID: 1,
      targetPlaceName: 1,
      style: 1,
      color: 1,
      size: 1,
      // productProblem: 1,
      // fromNode: 1,
      fromNode: 1,
      // datetime: 1,
      // createBy: 1,
      // userID: 1
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        // forLoss: '$forLoss',
        targetPlaceID: '$targetPlaceID',
        targetPlaceName: '$targetPlaceName',
        style: '$style',
        color: '$color',
        size: '$size',
        fromNode: '$fromNode',
    },
      sumProductQty: {$sum: 1} ,
    }}  
  ])
  // .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.status": 1 } );
  // .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.datetime": -1, "productionNode.status": 1 } );
  .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.datetime": -1, "productionNode.status": 1, "productionNode.createBy.userID": 1 } );

  // console.log(productionPeriod);
  const productionPeriodM = await productionPeriod.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID,
    // forLoss: fw._id.forLoss,
    targetPlaceID: fw._id.targetPlaceID,
    targetPlaceName: fw._id.targetPlaceName,
    style: fw._id.style,
    color: fw._id.color,
    size: fw._id.size,
    fromNode: fw._id.fromNode,
    sumProductQty: fw.sumProductQty,
  }));
  // console.log(productionPeriodM);
  return productionPeriodM;
}

exports.getProductionBundleStateUserScanDate12C = async (companyID, productStatusArr, productionNodeStatusArr, orderIDArr, dateStart, dateEnd, userIDGroup) => {
  // console.log(userIDGroup);
  const productionPeriod = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {
        "datetime": { $gte: dateStart, $lte : dateEnd}, 
        "status": {$in: productionNodeStatusArr},
        "createBy.userID": {$in: userIDGroup},
      }}},

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        productCount: 1,
        productBarcodeNoReal: 1,
        // targetPlace: 1,
        targetPlaceID: "$targetPlace.targetPlaceID",
        targetPlaceName: "$targetPlace.targetPlaceName",
        productionNode: 1,
    }	},

    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      bundleNo: 1,
      productCount: 1,
      orderID: 1,	

      targetPlaceID: 1,
      targetPlaceName: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},

      fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
      userID: "$productionNode.createBy.userID",
    }},

    { $match: { $and: [
      {"datetime": { $gte: dateStart, $lte : dateEnd}},
      {"status":{$in: productionNodeStatusArr}},
      {"createBy.userID":{$in: userIDGroup}},
      // {"userID":{$in: userIDGroup}},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,	
      bundleNo: 1,
      productCount: 1,
      orderID: 1,	

      targetPlaceID: 1,
      targetPlaceName: 1,
      style: 1,
      color: 1,
      size: 1,
      // productProblem: 1,
      // fromNode: 1,
      fromNode: 1,
      // datetime: 1,
      // createBy: 1,
      userID: 1
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        bundleNo: '$bundleNo',
        orderID: '$orderID',
        productCount: '$productCount',
        targetPlaceID: '$targetPlaceID',
        targetPlaceName: '$targetPlaceName',
        style: '$style',
        color: '$color',
        size: '$size',
        fromNode: '$fromNode',
        userID: '$userID',
    },
      sumProductQty: {$sum: 1} ,
    }}  
  ])
  // .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.status": 1 } );
  // .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.datetime": -1, "productionNode.status": 1 } );
  .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.datetime": -1, "productionNode.status": 1, "productionNode.createBy.userID": 1 } );

  // console.log(productionPeriod);
  const productionPeriodM = await productionPeriod.map(fw => ({
    companyID: fw._id.companyID, 
    bundleNo: fw._id.bundleNo,
    orderID: fw._id.orderID,
    productCount: fw._id.productCount,
    targetPlaceID: fw._id.targetPlaceID,
    targetPlaceName: fw._id.targetPlaceName,
    style: fw._id.style,
    color: fw._id.color,
    size: fw._id.size,
    fromNode: fw._id.fromNode,
    userID: fw._id.userID,
    sumProductQty: fw.sumProductQty,
  }));
  // console.log(orderIDArr);
  // console.log(productionPeriodM);
  return productionPeriodM;
}

// const currentProductionBundleState = await ShareFunc.getProductionBundleStateUserScanC(companyID, productStatusArr, productionNodeStatusArr, orderIDArr);
exports.getProductionBundleStateUserScanC = async (companyID, productStatusArr, productionNodeStatusArr, orderIDArr) => {
  // console.log(userIDGroup);
  const productionPeriod = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {
        // "datetime": { $gte: dateStart, $lte : dateEnd}, 
        "status": {$in: productionNodeStatusArr},
        // "createBy.userID": {$in: userIDGroup},
      }}},

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        productCount: 1,
        productBarcodeNoReal: 1,
        // targetPlace: 1,
        targetPlaceID: "$targetPlace.targetPlaceID",
        targetPlaceName: "$targetPlace.targetPlaceName",
        productionNode: 1,
    }	},

    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      bundleNo: 1,
      productCount: 1,
      orderID: 1,	

      targetPlaceID: 1,
      targetPlaceName: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},

      fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
      // userID: "$productionNode.createBy.userID",
    }},

    { $match: { $and: [
      // {"datetime": { $gte: dateStart, $lte : dateEnd}},
      {"status":{$in: productionNodeStatusArr}},
      // {"createBy.userID":{$in: userIDGroup}},
      // {"userID":{$in: userIDGroup}},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,	
      bundleNo: 1,
      productCount: 1,
      orderID: 1,	

      targetPlaceID: 1,
      targetPlaceName: 1,
      style: 1,
      color: 1,
      size: 1,
      // productProblem: 1,
      // fromNode: 1,
      fromNode: 1,
      // datetime: 1,
      // createBy: 1,
      // userID: 1
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        bundleNo: '$bundleNo',
        orderID: '$orderID',
        productCount: '$productCount',
        targetPlaceID: '$targetPlaceID',
        targetPlaceName: '$targetPlaceName',
        style: '$style',
        color: '$color',
        size: '$size',
        fromNode: '$fromNode',
        // userID: '$userID',
    },
      sumProductQty: {$sum: 1} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.status": 1 } );
  // .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.datetime": -1, "productionNode.status": 1 } );
  // .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.datetime": -1, "productionNode.status": 1, "productionNode.createBy.userID": 1 } );

  // console.log(productionPeriod);
  const productionPeriodM = await productionPeriod.map(fw => ({
    companyID: fw._id.companyID, 
    bundleNo: fw._id.bundleNo,
    orderID: fw._id.orderID,
    productCount: fw._id.productCount,
    targetPlaceID: fw._id.targetPlaceID,
    targetPlaceName: fw._id.targetPlaceName,
    style: fw._id.style,
    color: fw._id.color,
    size: fw._id.size,
    fromNode: fw._id.fromNode,
    // userID: fw._id.userID,
    sumProductQty: fw.sumProductQty,
  }));
  // console.log(orderIDArr);
  // console.log(productionPeriodM);
  return productionPeriodM;
}

exports.getProductionBundleStateRangeUserScanC = async (companyID, productStatusArr, productionNodeStatusArr, orderIDArr, bundleNos) => {
  // console.log(userIDGroup);
  const productionPeriod = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: orderIDArr}},
      {"bundleNo":{$in: bundleNos}},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {
        // "datetime": { $gte: dateStart, $lte : dateEnd}, 
        "status": {$in: productionNodeStatusArr},
        // "createBy.userID": {$in: userIDGroup},
      }}},

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        productCount: 1,
        productBarcodeNoReal: 1,
        // targetPlace: 1,
        targetPlaceID: "$targetPlace.targetPlaceID",
        targetPlaceName: "$targetPlace.targetPlaceName",
        productionNode: 1,
    }	},

    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      bundleNo: 1,
      productCount: 1,
      orderID: 1,	

      targetPlaceID: 1,
      targetPlaceName: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},

      fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
      // userID: "$productionNode.createBy.userID",
    }},

    { $match: { $and: [
      // {"datetime": { $gte: dateStart, $lte : dateEnd}},
      {"status":{$in: productionNodeStatusArr}},
      // {"createBy.userID":{$in: userIDGroup}},
      // {"userID":{$in: userIDGroup}},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,	
      bundleNo: 1,
      productCount: 1,
      orderID: 1,	

      targetPlaceID: 1,
      targetPlaceName: 1,
      style: 1,
      color: 1,
      size: 1,
      // productProblem: 1,
      // fromNode: 1,
      fromNode: 1,
      // datetime: 1,
      // createBy: 1,
      // userID: 1
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        bundleNo: '$bundleNo',
        orderID: '$orderID',
        productCount: '$productCount',
        targetPlaceID: '$targetPlaceID',
        targetPlaceName: '$targetPlaceName',
        style: '$style',
        color: '$color',
        size: '$size',
        fromNode: '$fromNode',
        // userID: '$userID',
    },
      sumProductQty: {$sum: 1} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, bundleNo: 1, productStatus: 1, "productionNode.status": 1 } );
  // .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.status": 1 } );
  // .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.datetime": -1, "productionNode.status": 1 } );
  // .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.datetime": -1, "productionNode.status": 1, "productionNode.createBy.userID": 1 } );

  // console.log(productionPeriod);
  const productionPeriodM = await productionPeriod.map(fw => ({
    companyID: fw._id.companyID, 
    bundleNo: fw._id.bundleNo,
    orderID: fw._id.orderID,
    productCount: fw._id.productCount,
    targetPlaceID: fw._id.targetPlaceID,
    targetPlaceName: fw._id.targetPlaceName,
    style: fw._id.style,
    color: fw._id.color,
    size: fw._id.size,
    fromNode: fw._id.fromNode,
    // userID: fw._id.userID,
    sumProductQty: fw.sumProductQty,
  }));
  // console.log(orderIDArr);
  // console.log(productionPeriodM);
  return productionPeriodM;
}

// await ShareFunc.getRepCFNCurrentProductQtyByOrderID(companyID, factoryID, nodeID, productStatusArr);
exports.getRepCFNCurrentProductQtyByOrderID = async (companyID, factoryID, nodeID, productStatusArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        // productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      // fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        // userID: '$userID',
        // mode: '$mode',
    },
      sumProductQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );

  // console.log(orderProductRep);
  const orderProductRepF = await orderProductRep.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    sumProductQty: fw.sumProductQty,
  }));
  // console.log(orderProductRepF);
  return orderProductRepF;
}

// await ShareFunc.getRepCFNCurrentProductQtyByOrderIDProductID(companyID, factoryID, nodeID, productStatusArr);
exports.getRepCFNCurrentProductQtyByOrderIDProductID = async (companyID, factoryID, nodeID, productStatusArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        productID: 1,
        // productBarcodeNo: 1,
        // productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      // fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        // orderID: '$orderID',
        productID: '$productID',
        // userID: '$userID',
        // mode: '$mode',
    },
      sumProductQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );

  // console.log(orderProductRep);
  const orderProductRepF = await orderProductRep.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    productID: fw._id.productID,
    sumProductQty: fw.sumProductQty,
  }));
  // console.log(orderProductRepF);
  return orderProductRepF;
}

// productionRepairCount = await ShareFunc.getCFNCurrentProductAllRepairCount(companyID, factoryID, nodeID, productProbelmStatusArr);
exports.getCFNCurrentProductAllRepairCount = async (companyID, factoryID, nodeID, productProbelmStatusArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const currentProductAllRepairCount = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productProbelmStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,	
      nodeID: "$toNode",
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        nodeID: '$nodeID',
        // productID: '$productID',
        // userID: '$userID',
        // mode: '$mode',
    },
      countProductQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );

  // console.log(orderProductRep);
  const currentProductAllRepairCountF = await currentProductAllRepairCount.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    nodeID: fw._id.nodeID,
    countProductQty: fw.countProductQty,
  }));
  // console.log(currentProductAllRepairCountF);
  return currentProductAllRepairCountF;
}

// ShareFunc.getCFNCurrentProductStyleCount(companyID, factoryID, nodeID, style, productStatusArr)
exports.getCFNCurrentProductStyleCount = async (companyID, factoryID, nodeID, style, productProbelmStatusArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const style1 = (style+'').trim();
  const currentProductStyleCount = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":style1},
      {"productStatus":{$in: productProbelmStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        // productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,	
      nodeID: "$toNode",
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        nodeID: '$nodeID',
        // productID: '$productID',
        // userID: '$userID',
        // mode: '$mode',
    },
      countProductQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );

  // console.log(orderProductRep);
  const currentProductStyleCountF = await currentProductStyleCount.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    nodeID: fw._id.nodeID,
    countProductQty: fw.countProductQty,
  }));
  // console.log(currentProductStyleCountF);
  return currentProductStyleCountF;
}

// getCFNCurrentProductStyleZoneSizeColorCount(companyID, factoryID, nodeID, style, zone, size, color, productStatusArr);
exports.getCFNCurrentProductStyleZoneSizeColorCount = async (companyID, factoryID, nodeID, style, zone, size, color, productProbelmStatusArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const style1 = (style+'').trim();
  const currentProductStyleCount = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":style1},
      {"productStatus":{$in: productProbelmStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
      {"targetPlace":zone},
      {"color":color},
      {"size":size},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,	
      nodeID: "$toNode",
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        nodeID: '$nodeID',
        // productID: '$productID',
        // userID: '$userID',
        // mode: '$mode',
    },
      countProductQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );

  // console.log(orderProductRep);
  const currentProductStyleCountF = await currentProductStyleCount.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    nodeID: fw._id.nodeID,
    countProductQty: fw.countProductQty,
  }));
  // console.log(currentProductStyleCountF);
  return currentProductStyleCountF;
}

// ShareFunc.getCFNCurrentProductAllProblemCount(companyID, factoryID, nodeID, productProbelmStatusArr);
exports.getCFNCurrentProductAllProblemCount = async (companyID, factoryID, nodeID, productProbelmStatusArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const currentProductAllProblemCount = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productProbelmStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "fromNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.fromNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"fromNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,	
      nodeID: "$fromNode",
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        nodeID: '$nodeID',
        // productID: '$productID',
        // userID: '$userID',
        // mode: '$mode',
    },
      countProductQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.fromNode": 1 } );

  // console.log(orderProductRep);
  const currentProductAllProblemCountF = await currentProductAllProblemCount.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    nodeID: fw._id.nodeID,
    // productID: fw._id.productID,
    countProductQty: fw.countProductQty,
  }));
  // console.log(currentProductAllProblemCountF);
  return currentProductAllProblemCountF;
}

// ShareFunc.getRepCFNCurrentProductBundleList(companyID, factoryID, nodeID, productStatusArr);
exports.getRepCFNCurrentProductBundleList = async (companyID, factoryID, nodeID, productStatusArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        // productBarcodeNo: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      // bundleID: 1,
      productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      // fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      // bundleID: 1,
      productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        productID: '$productID',
        bundleNo: '$bundleNo',
        // mode: '$mode',
    },
      sumProductQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );

  // console.log(orderProductRep);
  const orderProductRepF = await orderProductRep.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    productID: fw._id.productID,
    bundleNo: fw._id.bundleNo,
    sumProductQty: fw.sumProductQty,
  }));
  // console.log(orderProductRepF);
  return orderProductRepF;
}

// ShareFunc.getAllOrderFromOrderProductionCFN(companyID, factoryID, nodeID, productStatusArr);
exports.getAllOrderFromOrderProductionCFN = async (companyID, factoryID, nodeID, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
    },
      // countOrder: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // console.log(orderProductRep);

  let orders = [];
  await this.asyncForEach(orderProductRep, async (item1) => {
    orders.push(item1._id.orderID);
  });
  // console.log(orders);
  return orders;
}

// ShareFunc.getAllProductFromOrderProductionCFN(companyID, factoryID, nodeID, productStatusArr)
exports.getAllProductFromOrderProductionCFN = async (companyID, factoryID, nodeID, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        productID: 1,
        // productBarcodeNo: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      // fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        // orderID: '$orderID',
        productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
    },
      // countOrder: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // console.log(orderProductRep);

  let products = [];
  await this.asyncForEach(orderProductRep, async (item1) => {
    products.push(item1._id.productID);
  });
  // console.log(products);
  return products;
}

// productStateStyle = await ShareFunc.getRepCFNProductStateStyle(companyID, factoryID, nodeID, productStatusArr);
exports.getRepCFNProductStateStyle = async (companyID, factoryID, nodeID, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      // lottoMainTypeID: { $substr: [ "$lottoRoundID", 9, 3 ] },	
      // item: { $toUpper: "$item" },
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        style: '$style',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
    },
      countStyle: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // console.log(orderProductRep);

  const orderProductRepF = await orderProductRep.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    style: fw._id.style,
    countStyle: fw.countStyle,
  }));
  // console.log(orderProductRepF);
  return orderProductRepF;
}

// productStateTargetPlace = await ShareFunc.getRepCFNProductStateTargetPlace(companyID, factoryID, nodeID, productStatusArr);
exports.getRepCFNProductStateTargetPlace = async (companyID, factoryID, nodeID, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      style: 1,	
      targetPlace: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNo", 8, 4 ] }},	
      // lottoMainTypeID: { $substr: [ "$lottoRoundID", 9, 3 ] },	
      // item: { $toUpper: "$item" },
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        style: '$style',
        targetPlace: '$targetPlace',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
    },
      countTargetPlace: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // console.log(orderProductRep);

  const orderProductRepF = await orderProductRep.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    style: fw._id.style,
    targetPlace: fw._id.targetPlace,
    countTargetPlace: fw.countTargetPlace,
  }));
  // console.log(orderProductRepF);
  return orderProductRepF;
}

// productStateColor = await ShareFunc.getRepCFNProductStateColor(companyID, factoryID, nodeID, productStatusArr);
exports.getRepCFNProductStateColor = async (companyID, factoryID, nodeID, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      style: 1,	
      color: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNo", 8, 4 ] }},	
      // lottoMainTypeID: { $substr: [ "$lottoRoundID", 9, 3 ] },	
      // item: { $toUpper: "$item" },
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        style: '$style',
        color: '$color',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
    },
      countColor: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // console.log(orderProductRep);

  const orderProductRepF = await orderProductRep.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    style: fw._id.style,
    color: fw._id.color,
    countColor: fw.countColor,
  }));
  // console.log(orderProductRepF);
  return orderProductRepF;
}

// productStateSize = await ShareFunc.getRepCFNProductStateSize(companyID, factoryID, nodeID, productStatusArr);
exports.getRepCFNProductStateSize = async (companyID, factoryID, nodeID, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      style: 1,	
      size: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNo", 8, 4 ] }},	
      // lottoMainTypeID: { $substr: [ "$lottoRoundID", 9, 3 ] },	
      // item: { $toUpper: "$item" },
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        style: '$style',
        size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
    },
      countSize: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // console.log(orderProductRep);

  const orderProductRepF = await orderProductRep.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    style: fw._id.style,
    size: fw._id.size,
    countSize: fw.countSize,
  }));
  // console.log(orderProductRepF);
  return orderProductRepF;
}

// productStateStyleTargetPlaceColorSize = await ShareFunc.getRepCFNProductStateStyleTargetPlaceColorSize(companyID, factoryID, nodeID, productStatusArr);
exports.getRepCFNProductStateStyleTargetPlaceColorSize = async (companyID, factoryID, nodeID, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        productID: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$productionNode.factoryID",
      // fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,	
      productID: 1,	
      style: 1,	
      targetPlace: 1,
      color: 1,
      size: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNo", 8, 4 ] }},	
      // lottoMainTypeID: { $substr: [ "$lottoRoundID", 9, 3 ] },	
      // item: { $toUpper: "$item" },
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // fromNode: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        productID: '$productID',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      countStyleTargetPlaceColorSize: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // console.log(orderProductRep);

  const orderProductRepF = await orderProductRep.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    productID: fw._id.productID,
    style: fw._id.style,
    size: fw._id.size,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    countStyleTargetPlaceColorSize: fw.countStyleTargetPlaceColorSize,
  }));
  // console.log(orderProductRepF);
  return orderProductRepF;
}

// ## report..... staff/worker factory login to node workstation
// #######################################################################################################



// #######################################################################################################
// ## report..... company

// ShareFunc.getRepQTYEditBySeasonYear(companyID, seasonYear);
exports.getRepQTYEditBySeasonYear = async (companyID, seasonYear) => {
  const repQTYEdit = await RepQTYEdit.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"orderID":orderID},
      // {"editType":editType},
      {"seasonYear":seasonYear},
    ] } },
    { $unwind: "$dataRQTYE" },
    { $project: {			
        _id: 0,	
        companyID: 1,
        orderID: 1,		
        editType: 1,	
        seasonYear: 1,
        setName: 1,	
        // dataRQTYE: 1,
        fromNode: "$dataRQTYE.fromNode",
        color: "$dataRQTYE.color",
        productColor: "$dataRQTYE.productColor",
        productSize: "$dataRQTYE.productSize",
        size: "$dataRQTYE.size",
        sizeSeq: "$dataRQTYE.sizeSeq",
        targetPlaceID: "$dataRQTYE.targetPlaceID",
        targetPlaceSeq: "$dataRQTYE.targetPlaceSeq",
        sumProductQty: "$dataRQTYE.sumProductQty",
    }	},
  ]);
  // console.log(repQTYEdit);
  return repQTYEdit;
}

// ShareFunc.getRepQTYEdit1(companyID, orderID, editType, seasonYear);
exports.getRepQTYEdit1 = async (companyID, orderID, editType, seasonYear) => {
  const repQTYEdit = await RepQTYEdit.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      {"editType":editType},
      {"seasonYear":seasonYear},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        orderID: 1,		
        editType: 1,	
        seasonYear: 1,
        setName: 1,	
        dataRQTYE: 1,
    }	}
  ]);
  // console.log(repQTYEdit);
  return repQTYEdit;
}

exports.getRepQTYEditByDataRQTYE = async (companyID, orderID, editType, seasonYear, dataRQTYE) => {
  const repQTYEdit = await RepQTYEdit.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      {"editType":editType},
      {"seasonYear":seasonYear},
    ] } },
    { $unwind: "$dataRQTYE" },
    { $project: {			
        _id: 0,	
        companyID: 1,
        orderID: 1,		
        editType: 1,	
        seasonYear: 1,
        setName: 1,	
        // dataRQTYE: 1,
        fromNode: "$dataRQTYE.fromNode",
        color: "$dataRQTYE.color",
        productColor: "$dataRQTYE.productColor",
        productSize: "$dataRQTYE.productSize",
        size: "$dataRQTYE.size",
        sizeSeq: "$dataRQTYE.sizeSeq",
        targetPlaceID: "$dataRQTYE.targetPlaceID",
        targetPlaceSeq: "$dataRQTYE.targetPlaceSeq",
        sumProductQty: "$dataRQTYE.sumProductQty",
    }	},
    { $match: { $and: [
      {"fromNode":dataRQTYE.fromNode},
      {"productColor":dataRQTYE.productColor},
      {"size":dataRQTYE.size},
      {"targetPlaceID":dataRQTYE.targetPlaceID},
    ] } },
    { $project: {			
      _id: 0,	
      companyID: 1,
      orderID: 1,		
      editType: 1,	
      seasonYear: 1,
      setName: 1,	
      // dataRQTYE: 1,
      fromNode: 1,	
      color: 1,
      productColor: 1,	
      productSize: 1,	
      size: 1,	
      sizeSeq: 1,	
      targetPlaceID: 1,	
      targetPlaceSeq: 1,	
      sumProductQty: 1,
  }	},
  ]);
  // console.log(repQTYEdit);
  return repQTYEdit;
}






exports.getCNCurrentProductionNodeQty = async (companyID, orderStatusArr, productStatusArr, orderIDArr, toNodeArr) => {
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"factoryID":{$in: factoryIDArr}},
      // {"open":orderStatusArr},
      // {"productStatus":{$in: productStatusArr}},
      {"orderID":{$in: orderIDArr}},

      {"productionNode":  {$elemMatch: {"toNode": {$in: toNodeArr}, "status": {$in: productStatusArr} }}},
      { $expr: { $in: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, toNodeArr] } },
      { $expr: { $in: [{ "$arrayElemAt": ["$productionNode.status", -1] }, productStatusArr] } },
      // {"toNode":{$in: toNodeArr}},
      // {"status":{$in: productStatusArr}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        // productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      // color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      // size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
      // factoryID: "$productionNode.factoryID",
    }},

    { $match: { $and: [
      {"toNode":{$in: toNodeArr}},
      {"status":{$in: productStatusArr}},
      // {"factoryID":{$in: factoryIDArr}},
      // {"companyID":companyID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,
      toNode: 1,
      // status: 1,
      // color: 1,
      // size: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
      // factoryID: 1,
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        // factoryID: '$factoryID',
        orderID: '$orderID',
        toNode: '$toNode',
        // status: '$status',
        // color: '$color',
        // size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, "productionNode.toNode": 1, "productionNode.status": 1 } );
  // console.log(orderProductRep);

  const orderProductRepF = await orderProductRep.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID,
    toNode: fw._id.toNode,
    // size: fw._id.size,
    // targetPlace: fw._id.targetPlace,
    // color: fw._id.color,
    countQty: fw.countQty,
  }));
  // console.log(orderProductRepF);
  return orderProductRepF;
}

exports.getCompanyCurrentProductQtyAll = async (companyID, factoryIDArr, productStatusArr, orderIDArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const companyCurrentProductQtyAll = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"factoryID":{$in: factoryIDArr}},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", 12, 4 ] }},		
      // color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", 18, 10 ] }},
      // size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", 28, 3 ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productID: '$productID',
        style: '$style',
        // targetPlace: '$targetPlace',
        // color: '$color',
        // size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ]).hint( { companyID : 1, orderID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1} );
  // console.log(companyCurrentProductQtyAll);

  const companyCurrentProductQtyAllF = await companyCurrentProductQtyAll.map(fw => ({
    // companyID: fw._id.companyID, 
    orderID: fw._id.orderID,
    productID: fw._id.productID,
    // style: fw._id.style,
    countQty: fw.countQty,
  }));
  // console.log(companyCurrentProductQtyAllF);
  return companyCurrentProductQtyAllF;
}

// ShareFunc.getCCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr);
exports.getCCurrentProductQtyAll = async (companyID, factoryIDArr, productStatusArr, orderIDArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  // console.log(companyID, factoryIDArr, productStatusArr);
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"factoryID":{$in: factoryIDArr}},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
      factoryID: "$productionNode.factoryID",
    }},

    // { $match: { $and: [
    //   // {"factoryID":{$in: factoryIDArr}},
    //   {"companyID":companyID},
    // ] } },
    // { $project: { 
    //   _id: 0, 
    //   companyID: 1,
    //   productID: 1,
    //   style: 1,
    //   targetPlace: 1,
    //   color: 1,
    //   size: 1,
    //   // productCount: 1,
    //   // productionDate: 1,
    //   // productStatus: 1,
    //   // fromNode: "$productionNode.fromNode",
    //   // toNode: "$productionNode.toNode",
    //   // datetime: "$productionNode.datetime",
    //   // createBy: "$productionNode.createBy",
    //   factoryID: 1,
    // }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        // factoryID: '$factoryID',
        productID: '$productID',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ]).hint( { companyID : 1, orderID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1} );
  // console.log(orderProductRep);

  const orderProductRepF = await orderProductRep.map(fw => ({
    companyID: fw._id.companyID, 
    productID: fw._id.productID,
    style: fw._id.style,
    size: fw._id.size,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    countQty: fw.countQty,
  }));
  // console.log(orderProductRepF);
  return orderProductRepF;
}

exports.getCCurrentProductQtyAllList = async (companyID, factoryIDArr, productStatusArr, orderIDArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  // console.log(companyID, factoryIDArr, productStatusArr);
  // const orderID = 'AA0Q1A3A';
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"orderID":orderID},
      {"orderID":{$in: orderIDArr}},
      // {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: 1,  // ## 
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    // { $unwind: "$productionNode" },
    // { $project: { 
    //   _id: 0, 
    //   companyID: 1,
    //   // factoryID: 1,		
    //   // orderID: 1,	
    //   // bundleNo: 1,
    //   productID: 1,
    //   productBarcodeNo: 1,
    //   productBarcodeNoReal: 1,
    //   style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
    //   targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
    //   color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
    //   size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
    //   // productCount: 1,
    //   // productionDate: 1,
    //   // productStatus: 1,

    //   fromNode: "$productionNode.fromNode",
    //   toNode: "$productionNode.toNode",
    //   datetime: "$productionNode.datetime",
    //   createBy: "$productionNode.createBy",
    // }},

    // { $group: {			
    //   _id: { 
    //     companyID: '$companyID',
    //     // factoryID: '$factoryID',
    //     productID: '$productID',
    //     style: '$style',
    //     targetPlace: '$targetPlace',
    //     color: '$color',
    //     size: '$size',
    //     // productID: '$productID',
    //     // bundleNo: '$bundleNo',
    //     // mode: '$mode',
    //   },
    //   countQty: {$sum: 1} ,
    //   // sumProductQty: {$sum:  '$amount'} ,
    // }}  
  ]).hint( { companyID : 1, orderID: 1, bundleNo: 1, bundleID: 1 } );
  // console.log(orderProductRep);

  // const orderProductRepF = await orderProductRep.map(fw => ({
  //   companyID: fw._id.companyID, 
  //   productID: fw._id.productID,
  //   style: fw._id.style,
  //   size: fw._id.size,
  //   targetPlace: fw._id.targetPlace,
  //   color: fw._id.color,
  //   countQty: fw.countQty,
  // }));
  // // console.log(orderProductRepF);
  return orderProductRep;
}

exports.getCCurrentProductQtyAllByStyleC = async (companyID, style, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const style1 = (style+'').trim();
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":style1},
      // {"factoryID":{$in: factoryIDArr}},
      // {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        // factoryID: '$factoryID',
        productID: '$productID',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ]).hint( { companyID : 1, orderID: 1, bundleNo: 1, bundleID: 1 } );
  // console.log(orderProductRep);

  const orderProductRepF = await orderProductRep.map(fw => ({
    companyID: fw._id.companyID, 
    productID: fw._id.productID,
    style: fw._id.style,
    size: fw._id.size,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    countQty: fw.countQty,
  }));
  // console.log(orderProductRepF);
  return orderProductRepF;
}

exports.getRepCFNCurrentMainDataBundleNoscanProductBarcode = async (companyID, factoryIDArr, nodeID, orderIDArr, statusArr,
  productBarcodeArr, bundleNoArr, bundleIDArr) => {

  // console.log(targetPlaceID, color, size);
  const mainDataBundleNoScan = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: orderIDArr}},
      {"bundleNo":{$in: bundleNoArr}},
      {"bundleID":{$in: bundleIDArr}},
      {"productStatus":{$in: statusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": {$in: factoryIDArr} }}},
      { $expr: { $in: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryIDArr] } },
      // {"factoryID":{$in: factoryIDArr}},
      // {"productBarcode":{$in: productBarcodeArr}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        // productID: 1,
        // targetPlace: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      // productID: 1,
      // targetPlaceID: "$targetPlace.targetPlaceID",
      productBarcodeNo: 1,
      productBarcode: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.productBarcodePos, +process.env.productBarcodeDigit ] }},
      // style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      // color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      // size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      no: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.runningNoPos, +process.env.runningNoDigit ] }},

      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      factoryID: "$productionNode.factoryID",
      toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      // {"toNode":nodeID},
      {"factoryID":{$in: factoryIDArr}},
      {"productBarcode":{$in: productBarcodeArr}},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      // productID: 1,
      // targetPlaceID: "$targetPlace.targetPlaceID",
      productBarcode: 1,
      // style: 1,
      // targetPlace: 1,
      // color: 1,
      // size: 1,
      no: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      // factoryID: "$productionNode.factoryID",
      toNode: 1,
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        productBarcode: '$productBarcode',
        bundleNo: '$bundleNo',
        bundleID: '$bundleID',
        // style: '$style',
        // targetPlace: '$targetPlace',
        // color: '$color',
        // size: '$size',
        no: '$no',
        toNode: '$toNode',
        // productCount: '$productCount',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      // countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }},
    { $sort: { '_id.bundleNo': 1,  '_id.no': 1} },
    // { $skip: (page-1) *  limit},
    // { $limit: limit }
  ]);
  // { $sort : { age : -1, posts: 1 } }
  // console.log(mainDataBundleNoScan);

  const mainDataBundleNoScanF = await mainDataBundleNoScan.map(fw => ({
    // companyID: fw._id.companyID, 
    // factoryID: fw._id.factoryID, 
    orderID: fw._id.orderID,
    productBarcode: fw._id.productBarcode,
    bundleNo: fw._id.bundleNo,
    bundleID: fw._id.bundleID,
    // style: fw._id.style,
    // targetPlace: fw._id.targetPlace,
    // color: fw._id.color,
    // size: fw._id.size,
    no: fw._id.no,
    toNode: fw._id.toNode,
    // productCount: fw._id.productCount,
    // countQty: fw.countQty,
  }));
  // console.log(mainDataBundleNoScanF);
  return mainDataBundleNoScanF;
}

exports.getRepCFNCurrentMainDataBundleNoscanDetail = async (companyID, factoryIDArr, nodeID, orderIDArr, statusArr, 
  targetPlaceID, color, size, page, limit) => {

  // ## make targetPlaceID 4 len , size 3 len
  targetPlaceID = await this.setBackStrLen(4, targetPlaceID, '-'); // (len, str, strBack)
  color = await this.setBackStrLen(10, color, '-'); // (len, str, strBack)
  size = await this.setBackStrLen(3, size, '-'); // (len, str, strBack)
  // console.log(targetPlaceID, color, size);
  const mainDataBundleNoScan = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"factoryID":{$in: factoryIDArr}},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: statusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": {$in: factoryIDArr}, "toNode": nodeID }}},
      { $expr: { $in: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryIDArr] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },
      // {"factoryID":{$in: factoryIDArr}},
      // {"toNode":nodeID},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        // productID: 1,
        // targetPlace: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      // productID: 1,
      // targetPlaceID: "$targetPlace.targetPlaceID",
      // productBarcodeNo: 1,

      productBarcode: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.productBarcodePos, +process.env.productBarcodeDigit ] }},
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      factoryID: "$productionNode.factoryID",
      toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"toNode":nodeID},
      {"targetPlace":targetPlaceID},
      {"color":color},
      {"size":size},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      // productID: 1,
      // targetPlaceID: "$targetPlace.targetPlaceID",
      productBarcode: 1,
      style: 1,
      targetPlace: 1,
      color: 1,
      size: 1,
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      // factoryID: "$productionNode.factoryID",
      toNode: 1,
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $group: {			
      _id: { 
        // companyID: '$companyID',
        // factoryID: '$factoryID',
        orderID: '$orderID',
        productBarcode: '$productBarcode',
        bundleNo: '$bundleNo',
        bundleID: '$bundleID',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        toNode: '$toNode',
        productCount: '$productCount',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }},
    { $sort: { countQty: 1, bundleNo: 1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ])
  .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // { $sort : { age : -1, posts: 1 } }
  // console.log(mainDataBundleNoScan);

  const mainDataBundleNoScanF = await mainDataBundleNoScan.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID, 
    orderID: fw._id.orderID,
    productBarcode: fw._id.productBarcode,
    bundleNo: fw._id.bundleNo,
    bundleID: fw._id.bundleID,
    style: fw._id.style,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    size: fw._id.size,
    toNode: fw._id.toNode,
    productCount: fw._id.productCount,
    countQty: fw.countQty,
  }));
  // console.log(mainDataBundleNoScanF);
  return mainDataBundleNoScanF;
}

// getRepCFNCurrentMainDataBundleNoscan(companyID, factoryIDArr, nodeID, orderIDArr, statusArr)
exports.getRepCFNCurrentMainDataBundleNoscan = async (companyID, factoryIDArr, nodeID, orderIDArr, statusArr) => {
  const mainDataBundleNoScan = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"factoryID":{$in: factoryIDArr}},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: statusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": {$in: factoryIDArr}, "toNode": nodeID }}},
      { $expr: { $in: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryIDArr] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },
      // {"factoryID":{$in: factoryIDArr}},
      // {"toNode":nodeID},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        // productID: 1,
        // targetPlace: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      // productID: 1,
      // targetPlaceID: "$targetPlace.targetPlaceID",
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      factoryID: "$productionNode.factoryID",
      toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      // productID: 1,
      // targetPlaceID: "$targetPlace.targetPlaceID",
      // productBarcodeNo: 1,
      style: 1,
      targetPlace: 1,
      color: 1,
      size: 1,
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      // factoryID: "$productionNode.factoryID",
      toNode: 1,
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        bundleNo: '$bundleNo',
        bundleID: '$bundleID',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        toNode: '$toNode',
        productCount: '$productCount',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      // countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } );
  // console.log(mainDataBundleNoScan);

  const mainDataBundleNoScanF = await mainDataBundleNoScan.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID, 
    orderID: fw._id.orderID,
    bundleNo: fw._id.bundleNo,
    bundleID: fw._id.bundleID,
    style: fw._id.style,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    size: fw._id.size,
    toNode: fw._id.toNode,
    productCount: fw._id.productCount,
    // countQty: fw.countQty,
  }));
  // console.log(mainDataBundleNoScanF);
  return mainDataBundleNoScanF;
}

exports.getCurrentProductQtyAllCFNode = async (companyID, factoryIDArr, productStatusArr, orderIDArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductCFNodeRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"factoryID":{$in: factoryIDArr}},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": {$in: factoryIDArr} }}},
      { $expr: { $in: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryIDArr] } },
      // { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        productID: 1,
        targetPlace: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      targetPlaceID: "$targetPlace.targetPlaceID",
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      factoryID: "$productionNode.factoryID",
      toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      targetPlaceID: 1,
      // productBarcodeNo: 1,
      style: 1,	
      color: 1,	
      size: 1,	
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      factoryID: 1,	
      toNode: 1,	
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        productID: '$productID',
        style: '$style',
        targetPlaceID: '$targetPlaceID',
        color: '$color',
        size: '$size',
        toNode: '$toNode',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID : 1, orderID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1} );
  // console.log(orderProductRep);

  const orderProductCFNodeRepF = await orderProductCFNodeRep.map(fw => ({
    companyID: fw._id.companyID, 
    productID: fw._id.productID,
    style: fw._id.style,
    targetPlaceID: fw._id.targetPlaceID,
    color: fw._id.color,
    size: fw._id.size,
    toNode: fw._id.toNode,
    countQty: fw.countQty,
  }));
  // console.log(orderProductCFNodeRepF);
  return orderProductCFNodeRepF;
}

exports.getComCurrentProductQtyZoneAll = async (companyID, factoryIDArr, productStatusArr, orderIDArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const currentCompanyProductQtyAll = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"factoryID":{$in: factoryIDArr}},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},		
      // color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", 18, 10 ] }},
      // size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", 28, 3 ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
      factoryID: "$productionNode.factoryID",
    }},

    // { $match: { $and: [
    //   // {"factoryID":{$in: factoryIDArr}},
    //   {"companyID":companyID},
    // ] } },
    // { $project: { 
    //   _id: 0, 
    //   companyID: 1,
    //   productID: 1,
    //   style: 1,
    //   targetPlace: 1,		
    //   factoryID: 1,
    // }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        // factoryID: '$factoryID',
        productID: '$productID',
        style: '$style',
        targetPlace: '$targetPlace',
        // color: '$color',
        // size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}
  ]).hint( { companyID : 1, orderID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1} );
  // console.log(currentCompanyProductQtyAll);

  const currentCompanyProductQtyAllF = await currentCompanyProductQtyAll.map(fw => ({
    companyID: fw._id.companyID, 
    // factoryID: fw._id.factoryID,
    productID: fw._id.productID,
    style: fw._id.style,
    // size: fw._id.size,
    targetPlace: fw._id.targetPlace,
    // color: fw._id.color,
    countQty: fw.countQty,
  }));
  // console.log(currentCompanyProductQtyAllF);
  return currentCompanyProductQtyAllF;
}

// getComCurrentProductQtyCountryCSAll
exports.getComCurrentProductQtyCountryCSAll = async (companyID, factoryIDArr, productStatusArr, orderIDArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const currentCompanyProductQtyCountryAll = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"factoryID":{$in: factoryIDArr}},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},
    ] } },

    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        productID: 1,
        targetPlace: 1,
        // productBarcodeNo: 1,
        style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
        color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
        size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        // factoryID: '$factoryID',
        productID: '$productID',
        style: '$style',
        countryID: '$targetPlace.countryID',
        color: '$color',
        size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ]).hint( { companyID: 1, factoryID: 1, orderID: 1, productStatus: 1 } );
  // console.log(currentCompanyProductQtyCountryAll);

  const currentCompanyProductQtyCountryAllF = await currentCompanyProductQtyCountryAll.map(fw => ({
    companyID: fw._id.companyID, 
    // factoryID: fw._id.factoryID,
    productID: fw._id.productID,
    style: fw._id.style,
    countryID: fw._id.countryID,
    color: fw._id.color,
    size: fw._id.size,
    countQty: fw.countQty,
  }));
  // console.log(currentCompanyProductQtyAllF);
  return currentCompanyProductQtyCountryAllF;
}

exports.getComCurrentProductQtyCountryAll = async (companyID, factoryIDArr, productStatusArr, orderIDArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const currentCompanyProductQtyCountryAll = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"factoryID":{$in: factoryIDArr}},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        productID: 1,
        targetPlace: 1,
        // productBarcodeNo: 1,
        style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        // factoryID: '$factoryID',
        productID: '$productID',
        style: '$style',
        countryID: '$targetPlace.countryID',
        // color: '$color',
        // size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ]).hint( { companyID: 1, factoryID: 1, orderID: 1, productStatus: 1 } );
  // console.log(currentCompanyProductQtyCountryAll);

  const currentCompanyProductQtyCountryAllF = await currentCompanyProductQtyCountryAll.map(fw => ({
    companyID: fw._id.companyID, 
    // factoryID: fw._id.factoryID,
    productID: fw._id.productID,
    style: fw._id.style,
    // size: fw._id.size,
    countryID: fw._id.countryID,
    // color: fw._id.color,
    countQty: fw.countQty,
  }));
  // console.log(currentCompanyProductQtyAllF);
  return currentCompanyProductQtyCountryAllF;
}

// ShareFunc.getCFCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr);
exports.getCFCurrentProductQtyAll = async (companyID, factoryIDArr, productStatusArr, orderIDArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"factoryID":{$in: factoryIDArr}},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": {$in: factoryIDArr}}}},
      { $expr: { $in: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryIDArr] } },
      // { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        productID: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
      factoryID: "$productionNode.factoryID",
    }},

    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      productID: 1,
      style: 1,
      targetPlace: 1,
      color: 1,
      size: 1,
      factoryID: 1,
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        productID: '$productID',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID : 1, orderID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1} );
  // console.log(orderProductRep);

  const orderProductRepF = await orderProductRep.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    productID: fw._id.productID,
    style: fw._id.style,
    size: fw._id.size,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    countQty: fw.countQty,
  }));
  // console.log(orderProductRepF);
  return orderProductRepF;
}

// getCurrentCFactoryOrder
exports.getCurrentCFactoryOrder = async (companyID, orderIDs) => {
  const factoryOrder = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        // productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: 1,  // ## 
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      // color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      // size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // datetime: "$productionNode.datetime",
      factoryID: "$productionNode.factoryID",	
      // fromNode: "$productionNode.fromNode",
      // status: "$productionNode.status",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},
    
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        factoryID: '$factoryID',
        // fromNode: '$fromNode',
        // dayMonthUTC: '$dayMonthUTC',
        // style: '$style',
        // targetPlace: '$targetPlace',
        // color: '$color',
        // size: '$size',

      },
      // countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID : 1, orderID: 1, bundleNo: 1, bundleID: 1 } );

  const factoryOrderF = await factoryOrder.map(fw => ({
    // companyID: fw._id.companyID, 
    orderID: fw._id.orderID,
    factoryID: fw._id.factoryID,
    // fromNode: fw._id.fromNode,
    // dayMonthUTC: fw._id.dayMonthUTC,
    // style: fw._id.style,
    // targetPlace: fw._id.targetPlace,
    // color: fw._id.color,
    // size: fw._id.size,
    // countQty: fw.countQty,
  }));
  return factoryOrderF;
}

exports.getCFStaffScannedByDate12Style = async (companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr) => {
  const staffScan = await OrderProduction.aggregate([
    // { $unwind: "$productionNode" },
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},

      // {"productionNode":  {$elemMatch: { 
      //   "factoryID":{$in: factoryIDArr},
      //   "datetime": { $gte: dateStart, $lte : dateEnd}, 
      //   "status":{$in: statusArr},
      // }}},

      // {"productionNode.factoryID":{$in: factoryIDArr}},
      // {"productionNode.datetime": { $gte: dateStart, $lte : dateEnd}} , 
      // // {"productionNode.datetime": { $lte : dateEnd}} ,
      // {"productionNode.status":{$in: statusArr}},

      {"productionNode":  {$elemMatch: {
        "factoryID": {$in: factoryIDArr}, 
        "datetime": { $gte: dateStart, $lte : dateEnd}, 
        "status": {$in: statusArr}, 
      }}},

    ] } },

    // { $project: {			
    //     _id: 0,	
    //     companyID: 1,		
    //     orderID: 1,	
    //     productBarcodeNoReal: 1,
    //     productionNode: 1,  // ## 
    // }	},
    { $unwind: "$productionNode" },

    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      datetime: "$productionNode.datetime",
      factoryID: "$productionNode.factoryID",	
      fromNode: "$productionNode.fromNode",
      status: "$productionNode.status",
    }},

    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"datetime": { $gte: dateStart, $lte : dateEnd}} , 
      // {"datetime": { $lte : dateEnd}} ,
      {"status":{$in: statusArr}},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      style: 1,	
      factoryID: 1,	
      fromNode: 1,
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        fromNode: '$fromNode',
        style: '$style',
      },
      countQty: {$sum: 1} ,
    }}  
  // ]).explain("executionStats");
  ])
  .hint( { companyID: 1, orderID: 1, "productionNode.datetime": 1, "productionNode.factoryID": 1, "productionNode.status": 1 } );

  // const staffScan = await OrderProduction.aggregate([
  //   { $match: { $and: [
  //     {"companyID":companyID},
  //     {"orderID":{$in: orderIDs}},
  //     {"productionNode":  {$elemMatch: { 
  //       "factoryID":{$in: factoryIDArr},
  //       "datetime": { $gte: dateStart}, 
  //       "datetime": { $lte : dateEnd},
  //       "status":{$in: statusArr},
  //     }}},
  //   ] } },
  //   { $project: {			
  //       _id: 0,	
  //       companyID: 1,		
  //       orderID: 1,	
  //       productBarcodeNoReal: 1,
  //       productionNode: 1,  // ## 
  //   }	},
  //   { $unwind: "$productionNode" },
  //   { $project: { 
  //     _id: 0, 
  //     companyID: 1,
  //     orderID: 1,	
  //     style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
  //     datetime: "$productionNode.datetime",
  //     factoryID: "$productionNode.factoryID",	
  //     fromNode: "$productionNode.fromNode",
  //     status: "$productionNode.status",
  //   }},
  //   { $match: { $and: [
  //     {"factoryID":{$in: factoryIDArr}},
  //     {"datetime": { $gte: dateStart}} , 
  //     {"datetime": { $lte : dateEnd}} ,
  //     {"status":{$in: statusArr}},
  //   ] } },
  //   { $project: { 
  //     _id: 0, 
  //     companyID: 1,
  //     orderID: 1,	
  //     style: 1,	
  //     factoryID: 1,	
  //     fromNode: 1,
  //   }},
  //   { $group: {			
  //     _id: { 
  //       companyID: '$companyID',
  //       factoryID: '$factoryID',
  //       orderID: '$orderID',
  //       fromNode: '$fromNode',
  //       style: '$style',
  //     },
  //     countQty: {$sum: 1} ,
  //   }}  
  // // ]).explain("executionStats");
  // ]);

  // console.log(staffScan);

  const staffScanF = await staffScan.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    fromNode: fw._id.fromNode,
    dayMonthUTC: fw._id.dayMonthUTC,
    style: fw._id.style,
    // targetPlace: fw._id.targetPlace,
    // color: fw._id.color,
    // size: fw._id.size,
    countQty: fw.countQty,
  }));
  return staffScanF;
}

exports.getCFStaffScannedByDate12StyleZone = async (companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr) => {
  // console.log('getCFStaffScannedByDate12StyleZone');
  const staffScan = await OrderProduction.aggregate([
    // { $unwind: "$productionNode" },
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},

      // {"productionNode":  {$elemMatch: {"status":{$in: productionNodeStatusArr}}}},
      // {"productionNode":  {$elemMatch: { "factoryID": factoryID }}},

      // {"datetime": { $gte: dateStart}} , 
      // {"datetime": { $lte : dateEnd}} ,
      // {"productionNode":  {$elemMatch: { "datetime": { $gte: dateStart}, "datetime": { $lte : dateEnd} }}},
      // {"productionNode":  {$elemMatch: { 
      //   "factoryID":{$in: factoryIDArr},
      //   "datetime": { $gte: dateStart}, 
      //   "datetime": { $lte : dateEnd},
      //   "status":{$in: statusArr},
      // }}},

      // {"productionNode.factoryID":{$in: factoryIDArr}},
      // {"productionNode.datetime": { $gte: dateStart, $lte : dateEnd}} , 
      // // {"productionNode.datetime": { $lte : dateEnd}} ,
      // {"productionNode.status":{$in: statusArr}},

      {"productionNode":  {$elemMatch: {
        "factoryID": {$in: factoryIDArr}, 
        "datetime": { $gte: dateStart, $lte : dateEnd}, 
        "status": {$in: statusArr}, 
      }}},

    ] } },


    // { $project: {			
    //     _id: 0,	
    //     companyID: 1,		
    //     orderID: 1,	
    //     productBarcodeNoReal: 1,
    //     productionNode: 1,  // ## 
    // }	},
    { $unwind: "$productionNode" },

    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      datetime: "$productionNode.datetime",
      factoryID: "$productionNode.factoryID",	
      fromNode: "$productionNode.fromNode",
      status: "$productionNode.status",
    }},
    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"datetime": { $gte: dateStart, $lte : dateEnd}} , 
      // {"datetime": { $lte : dateEnd}} ,
      {"status":{$in: statusArr}},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      style: 1,	
      targetPlace: 1,
      factoryID: 1,	
      fromNode: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        fromNode: '$fromNode',
        style: '$style',
        targetPlace: '$targetPlace',
      },
      countQty: {$sum: 1} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, "productionNode.datetime": 1, "productionNode.factoryID": 1, "productionNode.status": 1 } );

  // const staffScan = await OrderProduction.aggregate([
  //   { $match: { $and: [
  //     {"companyID":companyID},
  //     {"orderID":{$in: orderIDs}},

  //     // {"productionNode":  {$elemMatch: {"status":{$in: productionNodeStatusArr}}}},
  //     // {"productionNode":  {$elemMatch: { "factoryID": factoryID }}},

  //     // {"datetime": { $gte: dateStart}} , 
  //     // {"datetime": { $lte : dateEnd}} ,
  //     // {"productionNode":  {$elemMatch: { "datetime": { $gte: dateStart}, "datetime": { $lte : dateEnd} }}},
  //     {"productionNode":  {$elemMatch: { 
  //       "factoryID":{$in: factoryIDArr},
  //       "datetime": { $gte: dateStart}, 
  //       "datetime": { $lte : dateEnd},
  //       "status":{$in: statusArr},
  //     }}},
  //   ] } },
  //   { $project: {			
  //       _id: 0,	
  //       companyID: 1,		
  //       orderID: 1,	
  //       productBarcodeNoReal: 1,
  //       productionNode: 1,  // ## 
  //   }	},
  //   { $unwind: "$productionNode" },
  //   { $project: { 
  //     _id: 0, 
  //     companyID: 1,
  //     orderID: 1,	
  //     style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
  //     targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
  //     datetime: "$productionNode.datetime",
  //     factoryID: "$productionNode.factoryID",	
  //     fromNode: "$productionNode.fromNode",
  //     status: "$productionNode.status",
  //   }},
  //   { $match: { $and: [
  //     {"factoryID":{$in: factoryIDArr}},
  //     {"datetime": { $gte: dateStart}} , 
  //     {"datetime": { $lte : dateEnd}} ,
  //     {"status":{$in: statusArr}},
  //   ] } },
  //   { $project: { 
  //     _id: 0, 
  //     companyID: 1,
  //     orderID: 1,	
  //     style: 1,	
  //     targetPlace: 1,
  //     factoryID: 1,	
  //     fromNode: 1,
  //   }},
  //   { $group: {			
  //     _id: { 
  //       companyID: '$companyID',
  //       factoryID: '$factoryID',
  //       orderID: '$orderID',
  //       fromNode: '$fromNode',
  //       style: '$style',
  //       targetPlace: '$targetPlace',
  //     },
  //     countQty: {$sum: 1} ,
  //   }}  
  // ]);

  const staffScanF = await staffScan.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    fromNode: fw._id.fromNode,
    // dayMonthUTC: fw._id.dayMonthUTC,
    style: fw._id.style,
    targetPlace: fw._id.targetPlace,
    // color: fw._id.color,
    // size: fw._id.size,
    countQty: fw.countQty,
  }));
  return staffScanF;
}

// ShareFunc.getCFStaffScannedByDate12(companyID, factoryIDArr, orderIDs, dateStart, dateEnd)
exports.getCFStaffScannedByDate12StyleZoneColorSize = async (companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr) => {
  const staffScan = await OrderProduction.aggregate([
    // { $unwind: "$productionNode" },
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},
      
      // {"productionNode.factoryID":{$in: factoryIDArr}},
      // {"productionNode.datetime": { $gte: dateStart, $lte : dateEnd}} , 
      // // {"productionNode.datetime": { $lte : dateEnd}} ,
      // {"productionNode.status":{$in: statusArr}},

      {"productionNode":  {$elemMatch: {
        "factoryID": {$in: factoryIDArr}, 
        // "fromNode": nodeID, 
        "datetime": { $gte: dateStart, $lte : dateEnd}, 
        "status": {$in: statusArr}, 
      }}},

      // {"productionNode":  {$elemMatch: { "datetime": { $gte: dateStart}, "datetime": { $lte : dateEnd} }}},

    ] } },
    // { $project: {			
    //     _id: 0,	
    //     companyID: 1,
    //     // factoryID: 1,		
    //     orderID: 1,	
    //     // bundleNo: 1,
    //     // productID: 1,
    //     productBarcodeNo: 1,
    //     productBarcodeNoReal: 1,
    //     // productCount: 1,
    //     // productionDate: 1,
    //     // productStatus: 1,
    //     productionNode: 1,  // ## 
    // }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      datetime: "$productionNode.datetime",
      factoryID: "$productionNode.factoryID",	
      fromNode: "$productionNode.fromNode",
      status: "$productionNode.status",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"datetime": { $gte: dateStart, $lte : dateEnd}} , 
      // {"datetime": { $lte : dateEnd}} ,
      {"status":{$in: statusArr}},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      style: 1,	
      targetPlace: 1,
      color: 1,
      size: 1,
      factoryID: 1,	
      fromNode: 1,
      // yearMonthDayUTC: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      dayMonthUTC: { $dateToString: { format: "%d/%m", date: "$datetime" } },
      // productID: 1,
      // productBarcodeNo: 1,
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNo", 8, 4 ] }},	
      // lottoMainTypeID: { $substr: [ "$lottoRoundID", 9, 3 ] },	
      // item: { $toUpper: "$item" },
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        fromNode: '$fromNode',
        // dayMonthUTC: '$dayMonthUTC',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',

      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, "productionNode.datetime": 1, "productionNode.factoryID": 1, "productionNode.status": 1 } );

  const staffScanF = await staffScan.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    fromNode: fw._id.fromNode,
    dayMonthUTC: fw._id.dayMonthUTC,
    style: fw._id.style,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    size: fw._id.size,
    countQty: fw.countQty,
  }));
  return staffScanF;
}

// ShareFunc.getCFFNStaffScannedByDate12StyleZone(companyID, factoryIDArr, orderIDs, zoneArr, dateStart, dateEnd, statusArr);
exports.getCFFNStaffScannedByDate12StyleZone = async (companyID, factoryIDArr, orderIDs, zoneArr, nodeID, dateStart, dateEnd, statusArr) => {
  const staffScan = await OrderProduction.aggregate([
    // { $unwind: "$productionNode" },
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},

      // {"productionNode.factoryID":{$in: factoryIDArr}},
      // {"productionNode.fromNode":nodeID},
      // {"productionNode.datetime": { $gte: dateStart, $lte : dateEnd}} , 
      // // {"productionNode.datetime": { $lte : dateEnd}} ,
      // {"productionNode.status":{$in: statusArr}},

      {"productionNode":  {$elemMatch: {
        "factoryID": {$in: factoryIDArr}, 
        "fromNode": nodeID, 
        "datetime": { $gte: dateStart, $lte : dateEnd}, 
        "status": {$in: statusArr}, 
      }}},

      // {"productionNode":  {$elemMatch: {"factoryID": {$in: factoryIDArr}, "fromNode": nodeID }}},
      // { $expr: { $in: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryIDArr] } },
      // { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.fromNode", -1] }, nodeID] } },
      // {"factoryID":{$in: factoryIDArr}},
      // {"fromNode":nodeID},
    ] } },
    // { $project: {			
    //     _id: 0,	
    //     companyID: 1,
    //     // factoryID: 1,		
    //     orderID: 1,	
    //     // bundleNo: 1,
    //     // productID: 1,
    //     productBarcodeNo: 1,
    //     productBarcodeNoReal: 1,
    //     // productCount: 1,
    //     // productionDate: 1,
    //     // productStatus: 1,
    //     productionNode: 1,  // ## 
    // }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      datetime: "$productionNode.datetime",
      factoryID: "$productionNode.factoryID",	
      fromNode: "$productionNode.fromNode",
      status: "$productionNode.status",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"fromNode":nodeID},
      {"datetime": { $gte: dateStart, $lte : dateEnd}} , 
      // {"datetime": { $lte : dateEnd}} ,
      {"status":{$in: statusArr}},
      {"targetPlace":{$in: zoneArr}},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      style: 1,	
      targetPlace: 1,
      color: 1,
      size: 1,
      factoryID: 1,	
      fromNode: 1,
      // yearMonthDayUTC: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      dayMonthUTC: { $dateToString: { format: "%d/%m", date: "$datetime" } },
      // productID: 1,
      // productBarcodeNo: 1,
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNo", 8, 4 ] }},	
      // lottoMainTypeID: { $substr: [ "$lottoRoundID", 9, 3 ] },	
      // item: { $toUpper: "$item" },
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        fromNode: '$fromNode',
        // dayMonthUTC: '$dayMonthUTC',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',

      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, "productionNode.factoryID": 1, "productionNode.fromNode": 1, "productionNode.datetime": -1, "productionNode.status": 1 } );

  const staffScanF = await staffScan.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    fromNode: fw._id.fromNode,
    dayMonthUTC: fw._id.dayMonthUTC,
    style: fw._id.style,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    size: fw._id.size,
    countQty: fw.countQty,
  }));
  // console.log(staffScan);
  return staffScanF;
}

// getCFSubNodeScanDate12StaffOverall
exports.getCFSubNodeScanDate12StaffOverall= async (companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd, qrCodeArr) => {
  
  const subNodeStaffScan = await OrderProduction.aggregate([
    { $unwind: "$subNodeFlow" },
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}},

      {"subNodeFlow":  {$elemMatch: {
        "factoryID": {$in: factoryIDArr}, 
        "nodeID": {$in: nodeIDs}, 
        "qrCode": {$in: qrCodeArr}, 
        "datetime": { $gte: dateStart, $lte : dateEnd}, 
        // "datetime": { $lte : dateEnd} 
      }}},

      // {"factoryID":{$in: factoryIDArr}},
      // {"nodeID":{$in: nodeIDs}},
      // {"qrCode":{$in: qrCodeArr}},
      // {"datetime": { $gte: dateStart}} , 
      // {"datetime": { $lte : dateEnd}} ,

      // {"subNodeFlow":  {$elemMatch: {"factoryID": {$in: factoryIDArr}, "fromNode": {$in: nodeIDs}, "qrCode": {$in: qrCodeArr} }}},

    ] } },
    // { $project: {			
    //     _id: 0,	
    //     companyID: 1,
    //     // factoryID: 1,		
    //     orderID: 1,	
    //     // bundleNo: 1,
    //     // productID: 1,
    //     productBarcodeNo: 1,
    //     productBarcodeNoReal: 1,
    //     // productCount: 1,
    //     // productionDate: 1,
    //     // productStatus: 1,
    //     // productionNode: 1,  // ## 
    //     subNodeFlow: 1,  // ## 
    // }	},
    // { $unwind: "$subNodeFlow" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$subNodeFlow.factoryID",
      datetime: "$subNodeFlow.datetime",
      nodeID: "$subNodeFlow.nodeID",
      subNodeID: "$subNodeFlow.subNodeID",	
      qrCode: "$subNodeFlow.qrCode",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"nodeID":{$in: nodeIDs}},
      {"qrCode":{$in: qrCodeArr}},
      // {"status":{$in: statusArr}},
      {"datetime": { $gte: dateStart, $lte : dateEnd}} , 
      // {"datetime": { $lte : dateEnd}} ,
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,	
      orderID: 1,	
      nodeID: 1,
      subNodeID: 1,	
      qrCode: 1,	
      // dayMonthUTC: { $dateToString: { format: "%d/%m", date: "$datetime" } },

      // targetPlace: 1,
      // color: 1,
      // size: 1,
      // yearMonthDayUTC: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      // productID: 1,
      // productBarcodeNo: 1,
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNo", 8, 4 ] }},	
      // lottoMainTypeID: { $substr: [ "$lottoRoundID", 9, 3 ] },	
      // item: { $toUpper: "$item" },
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        nodeID: '$nodeID',
        subNodeID: '$subNodeID',
        qrCode: '$qrCode',
        // dayMonthUTC: '$dayMonthUTC',
        // targetPlace: '$targetPlace',
        // color: '$color',
        // size: '$size',

      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, "subNodeFlow.factoryID": 1, "subNodeFlow.nodeID": 1, "subNodeFlow.qrCode": 1, "subNodeFlow.datetime": -1 } );
  // console.log(subNodeStaffScan);

  const subNodeStaffScanF = await subNodeStaffScan.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    nodeID: fw._id.nodeID,
    subNodeID: fw._id.subNodeID,
    qrCode: fw._id.qrCode,
    // dayMonthUTC: fw._id.dayMonthUTC,
    // targetPlace: fw._id.targetPlace,
    // color: fw._id.color,
    // size: fw._id.size,
    countQty: fw.countQty,
  }));

  return subNodeStaffScanF;
}

// ShareFunc.getCFSubNodeStaffScanDate12Overall(companyID, factoryIDArr, nodeID, dateStart, dateEnd, statusArr);
exports.getCFSubNodeScanDate12Overall= async (companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd) => {
  const subNodeStaffScan = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}},
      // {"productionNode":  {$elemMatch: { "datetime": { $gte: dateStart}, "datetime": { $lte : dateEnd} }}},

      {"subNodeFlow":  {$elemMatch: {
        "factoryID": {$in: factoryIDArr}, 
        "nodeID": {$in: nodeIDs}, 
        // "qrCode": {$in: qrCodeArr}, 
        "datetime": { $gte: dateStart, $lte : dateEnd}, 
        // "datetime": { $lte : dateEnd} 
      }}},
      // {"factoryID":{$in: factoryIDArr}},
      // {"nodeID":{$in: nodeIDs}},
      // {"datetime": { $gte: dateStart}} , 
      // {"datetime": { $lte : dateEnd}} ,

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // productionNode: 1,  // ## 
        subNodeFlow: 1,  // ## 
    }	},
    { $unwind: "$subNodeFlow" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$subNodeFlow.factoryID",
      datetime: "$subNodeFlow.datetime",
      nodeID: "$subNodeFlow.nodeID",
      subNodeID: "$subNodeFlow.subNodeID",	
      // status: "$subNodeFlow.status",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"nodeID":{$in: nodeIDs}},
      {"datetime": { $gte: dateStart, $lte : dateEnd}} , 
      // {"datetime": { $lte : dateEnd}} ,
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,	
      orderID: 1,	
      nodeID: 1,
      subNodeID: 1,	
      // dayMonthUTC: { $dateToString: { format: "%d/%m", date: "$datetime" } },

      // targetPlace: 1,
      // color: 1,
      // size: 1,
      // yearMonthDayUTC: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      // productID: 1,
      // productBarcodeNo: 1,
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNo", 8, 4 ] }},	
      // lottoMainTypeID: { $substr: [ "$lottoRoundID", 9, 3 ] },	
      // item: { $toUpper: "$item" },
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        nodeID: '$nodeID',
        subNodeID: '$subNodeID',
        // dayMonthUTC: '$dayMonthUTC',
        // targetPlace: '$targetPlace',
        // color: '$color',
        // size: '$size',

      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, "subNodeFlow.factoryID": 1, "subNodeFlow.nodeID": 1, "subNodeFlow.datetime": -1 } );
  
  // console.log(subNodeStaffScan);

  const subNodeStaffScanF = await subNodeStaffScan.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    nodeID: fw._id.nodeID,
    subNodeID: fw._id.subNodeID,
    // dayMonthUTC: fw._id.dayMonthUTC,
    // targetPlace: fw._id.targetPlace,
    // color: fw._id.color,
    // size: fw._id.size,
    countQty: fw.countQty,
  }));

  return subNodeStaffScanF;
}

// getCFSubNodeScanStyleZoneColorSizeDate12StaffOverall
exports.getCFSubNodeScanStyleZoneColorSizeDate12StaffOverall= async (companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd, qrCodeArr) => {
  const subNodeStaffScan = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}},

      {"subNodeFlow":  {$elemMatch: { "datetime": { $gte: dateStart}, "datetime": { $lte : dateEnd} }}},

      {"subNodeFlow":  {$elemMatch: {
        "factoryID": {$in: factoryIDArr}, 
        "nodeID": {$in: nodeIDs}, 
        "qrCode": {$in: qrCodeArr}, 
        "datetime": { $gte: dateStart, $lte : dateEnd}, 
        // "datetime": { $lte : dateEnd} 
      }}},
      // {"factoryID":{$in: factoryIDArr}},
      // {"nodeID":{$in: nodeIDs}},
      // {"qrCode":{$in: qrCodeArr}},
      // {"datetime": { $gte: dateStart}} , 
      // {"datetime": { $lte : dateEnd}} ,

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // productionNode: 1,  // ## 
        subNodeFlow: 1,  // ## 
    }	},
    { $unwind: "$subNodeFlow" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$subNodeFlow.factoryID",
      datetime: "$subNodeFlow.datetime",
      nodeID: "$subNodeFlow.nodeID",
      subNodeID: "$subNodeFlow.subNodeID",	
      qrCode: "$subNodeFlow.qrCode",
      // status: "$subNodeFlow.status",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"nodeID":{$in: nodeIDs}},
      {"qrCode":{$in: qrCodeArr}},
      // {"status":{$in: statusArr}},
      {"datetime": { $gte: dateStart, $lte : dateEnd}} , 
      // {"datetime": { $lte : dateEnd}} ,
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,	
      orderID: 1,	
      nodeID: 1,
      subNodeID: 1,	
      qrCode: 1,	
      // dayMonthUTC: { $dateToString: { format: "%d/%m", date: "$datetime" } },

      targetPlace: 1,
      color: 1,
      size: 1,
      // yearMonthDayUTC: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      // productID: 1,
      // productBarcodeNo: 1,
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNo", 8, 4 ] }},	
      // lottoMainTypeID: { $substr: [ "$lottoRoundID", 9, 3 ] },	
      // item: { $toUpper: "$item" },
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        nodeID: '$nodeID',
        subNodeID: '$subNodeID',
        qrCode: '$qrCode',
        // dayMonthUTC: '$dayMonthUTC',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',

      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, "subNodeFlow.factoryID": 1, "subNodeFlow.nodeID": 1, "subNodeFlow.subNodeID": 1, "subNodeFlow.qrCode": 1, "subNodeFlow.datetime": -1 } );
  
  // console.log(subNodeStaffScan);

  const subNodeStaffScanF = await subNodeStaffScan.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    nodeID: fw._id.nodeID,
    subNodeID: fw._id.subNodeID,
    qrCode: fw._id.qrCode,
    // dayMonthUTC: fw._id.dayMonthUTC,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    size: fw._id.size,
    countQty: fw.countQty,
  }));

  return subNodeStaffScanF;
}

// getCFSubNodeScanStyleZoneColorSizeDate12Overall
exports.getCFSubNodeScanStyleZoneColorSizeDate12Overall= async (companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd) => {
  const subNodeStaffScan = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}},
      {"subNodeFlow":  {$elemMatch: { "datetime": { $gte: dateStart}, "datetime": { $lte : dateEnd} }}},

      {"subNodeFlow":  {$elemMatch: {
        "factoryID": {$in: factoryIDArr}, 
        "nodeID": {$in: nodeIDs}, 
        // "qrCode": {$in: qrCodeArr}, 
        "datetime": { $gte: dateStart, $lte : dateEnd}, 
        // "datetime": { $lte : dateEnd} 
      }}},
      // {"factoryID":{$in: factoryIDArr}},
      // {"nodeID":{$in: nodeIDs}},
      // {"datetime": { $gte: dateStart}} , 
      // {"datetime": { $lte : dateEnd}} ,

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // productionNode: 1,  // ## 
        subNodeFlow: 1,  // ## 
    }	},
    { $unwind: "$subNodeFlow" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$subNodeFlow.factoryID",
      datetime: "$subNodeFlow.datetime",
      nodeID: "$subNodeFlow.nodeID",
      subNodeID: "$subNodeFlow.subNodeID",	
      // status: "$subNodeFlow.status",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"nodeID":{$in: nodeIDs}},
      // {"targetPlace":{$in: zoneArr}},
      // {"status":{$in: statusArr}},
      {"datetime": { $gte: dateStart, $lte : dateEnd}} , 
      // {"datetime": { $lte : dateEnd}} ,
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,	
      orderID: 1,	
      nodeID: 1,
      subNodeID: 1,	
      // dayMonthUTC: { $dateToString: { format: "%d/%m", date: "$datetime" } },

      targetPlace: 1,
      color: 1,
      size: 1,
      // yearMonthDayUTC: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      // productID: 1,
      // productBarcodeNo: 1,
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNo", 8, 4 ] }},	
      // lottoMainTypeID: { $substr: [ "$lottoRoundID", 9, 3 ] },	
      // item: { $toUpper: "$item" },
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        nodeID: '$nodeID',
        subNodeID: '$subNodeID',
        // dayMonthUTC: '$dayMonthUTC',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',

      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, "subNodeFlow.factoryID": 1, "subNodeFlow.nodeID": 1, "subNodeFlow.datetime": -1 } );
  
  // console.log(subNodeStaffScan);

  const subNodeStaffScanF = await subNodeStaffScan.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    nodeID: fw._id.nodeID,
    subNodeID: fw._id.subNodeID,
    // dayMonthUTC: fw._id.dayMonthUTC,
    targetPlace: fw._id.targetPlace,
    color: fw._id.color,
    size: fw._id.size,
    countQty: fw.countQty,
  }));

  return subNodeStaffScanF;
}

// getCFSubNodeStaffScanDate12Overall
exports.getCFSubNodeStaffScanDate12Overall= async (companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd) => {
  const subNodeStaffScan = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}},
      {"subNodeFlow":  {$elemMatch: { "datetime": { $gte: dateStart}, "datetime": { $lte : dateEnd} }}},

      {"subNodeFlow":  {$elemMatch: {
        "factoryID": {$in: factoryIDArr}, 
        "nodeID": {$in: nodeIDs}, 
        // "qrCode": {$in: qrCodeArr}, 
        "datetime": { $gte: dateStart, $lte : dateEnd}, 
        // "datetime": { $lte : dateEnd} 
      }}},
      // {"factoryID":{$in: factoryIDArr}},
      // {"nodeID":{$in: nodeIDs}},
      // {"datetime": { $gte: dateStart}} , 
      // {"datetime": { $lte : dateEnd}} ,

    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // productionNode: 1,  // ## 
        subNodeFlow: 1,  // ## 
    }	},
    { $unwind: "$subNodeFlow" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      factoryID: "$subNodeFlow.factoryID",
      nodeID: "$subNodeFlow.nodeID",
      subNodeID: "$subNodeFlow.subNodeID",	
      qrCode: "$subNodeFlow.qrCode",	
      datetime: "$subNodeFlow.datetime",
      // createBy: "$subNodeFlow.createBy",
      // toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"nodeID":{$in: nodeIDs}},
      // {"targetPlace":{$in: zoneArr}},
      // {"status":{$in: statusArr}},
      {"datetime": { $gte: dateStart, $lte : dateEnd}} , 
      // {"datetime": { $lte : dateEnd}} ,
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,	
      orderID: 1,	
      nodeID: 1,
      subNodeID: 1,	
      qrCode: 1,	
      // createBy: 1,
      // dayMonthUTC: { $dateToString: { format: "%d/%m", date: "$datetime" } },

      // targetPlace: 1,
      // color: 1,
      // size: 1,
      // yearMonthDayUTC: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
      // productID: 1,
      // productBarcodeNo: 1,
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNo", 8, 4 ] }},	
      // lottoMainTypeID: { $substr: [ "$lottoRoundID", 9, 3 ] },	
      // item: { $toUpper: "$item" },
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // productProblem: 1,
      // toNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        nodeID: '$nodeID',
        subNodeID: '$subNodeID',
        qrCode: '$qrCode',
        // qrCode: '$subNodeID',
        // dayMonthUTC: '$dayMonthUTC',
        // targetPlace: '$targetPlace',
        // color: '$color',
        // size: '$size',

      },
      countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
  .hint( { companyID: 1, orderID: 1, "subNodeFlow.factoryID": 1, "subNodeFlow.nodeID": 1, "subNodeFlow.datetime": -1 } );
  // console.log(subNodeStaffScan);

  const subNodeStaffScanF = await subNodeStaffScan.map(fw => ({
    companyID: fw._id.companyID, 
    factoryID: fw._id.factoryID,
    orderID: fw._id.orderID,
    nodeID: fw._id.nodeID,
    subNodeID: fw._id.subNodeID,
    qrCode: fw._id.qrCode,
    // dayMonthUTC: fw._id.dayMonthUTC,
    // targetPlace: fw._id.targetPlace,
    // color: fw._id.color,
    // size: fw._id.size,
    countQty: fw.countQty,
  }));

  return subNodeStaffScanF;
}

// ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
exports.getCurrentCompanyOrderSpec= async (companyID, orderStatusArr, orderIDArr) => {
  // console.log(+process.env.stylePos, +process.env.styleDigit);
  // console.log('getCurrentCompanyOrderSpec',companyID, orderStatusArr, orderIDArr);
  // ## get group style color size
  const orderStyleColorSizef = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}},
      {"orderStatus":{$in: orderStatusArr}},
    ] } },
    { $unwind: "$productOR.productORInfo" },
    { $project: {			
        _id: 0,	
        orderID: 1,
        // seasonYear: 1,
        companyID: 1,
        // bundleNo: 1,
        // orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // createBy: 1,

        productID: "$productOR.productID",
        // productName: "$productOR.productName",
        // productORDetail: "$productOR.productORDetail",
        // productCustomerCode: "$productOR.productCustomerCode",

        // productBarcode: "$productOR.productORInfo.productBarcode",
        style: { $substr: [ "$productOR.productORInfo.productBarcode", +process.env.stylePos, +process.env.styleDigit ] },	
        // targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
        // targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
        // countryID: "$productOR.productORInfo.targetPlace.countryID",
        // countryName: "$productOR.productORInfo.targetPlace.countryName",
        productColor: "$productOR.productORInfo.productColor",
        productSize: "$productOR.productORInfo.productSize",
        // productQty: "$productOR.productORInfo.productQty",
        // productYear: "$productOR.productORInfo.productYear",
        // productSex: "$productOR.productORInfo.productSex",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productID: '$productID',
        style: '$style',
        productColor: '$productColor',
        productSize: '$productSize',
        // betPrice: '$betPrice',
    },
      // countBetNumber: {$sum: 1} ,
      // sumQty: {$sum:  '$productQty'} ,
      // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
      // sumRewardBetNumber: {$sum:  '$reward'} ,
    }	},
  ]);
  const orderStyleColorSize = await orderStyleColorSizef.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    productID: fw._id.productID,
    style: fw._id.style,
    productColor: fw._id.productColor,
    productSize: fw._id.productSize,
  }));
  // console.log(orderStyleColorSize);
  return orderStyleColorSize;
}

exports.getCurrentCompanyOrderSpecByOrderID= async (companyID, orderStatusArr, orderID) => {
  // console.log(+process.env.stylePos, +process.env.styleDigit);
  // ## get group style color size
  const orderStyleColorSizef = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      // {"orderStatus":{$in: orderStatusArr}}
    ] } },
    { $unwind: "$productOR.productORInfo" },
    { $project: {			
        _id: 0,	
        orderID: 1,
        companyID: 1,
        // bundleNo: 1,
        orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // createBy: 1,

        productID: "$productOR.productID",
        // productName: "$productOR.productName",
        // productORDetail: "$productOR.productORDetail",
        // productCustomerCode: "$productOR.productCustomerCode",

        productBarcode: "$productOR.productORInfo.productBarcode",
        style: { $substr: [ "$productOR.productORInfo.productBarcode", +process.env.stylePos, +process.env.styleDigit ] },	
        // targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
        // targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
        // countryID: "$productOR.productORInfo.targetPlace.countryID",
        // countryName: "$productOR.productORInfo.targetPlace.countryName",
        productColor: "$productOR.productORInfo.productColor",
        productSize: "$productOR.productORInfo.productSize",
        // productQty: "$productOR.productORInfo.productQty",
        // productYear: "$productOR.productORInfo.productYear",
        // productSex: "$productOR.productORInfo.productSex",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productID: '$productID',
        style: '$style',
        // productBarcode: '$productBarcode',
        productColor: '$productColor',
        productSize: '$productSize',
        // betPrice: '$betPrice',
    },
      // countBetNumber: {$sum: 1} ,
      // sumQty: {$sum:  '$productQty'} ,
      // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
      // sumRewardBetNumber: {$sum:  '$reward'} ,
    }	},
  ]);
  const orderStyleColorSize = await orderStyleColorSizef.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    productID: fw._id.productID,
    style: fw._id.style,
    // productBarcode: fw._id.productBarcode,
    productColor: fw._id.productColor,
    productSize: fw._id.productSize,
  }));
  // console.log(orderStyleColorSize);
  return orderStyleColorSize;
}

// exports.getCurrentCompanyOrderZoneSpec= async (companyID, orderStatusArr) => {
//   // ## get group style color size
//   const orderStyleColorSizef = await Order.aggregate([
//     { $match: { $and: [
//       {"companyID":companyID},
//       {"orderStatus":{$in: orderStatusArr}}
//     ] } },
//     { $unwind: "$productOR.productORInfo" },
//     { $project: {			
//         _id: 0,	
//         orderID: 1,
//         companyID: 1,
//         // bundleNo: 1,
//         orderStatus: 1,
//         // orderDetail: 1,		
//         // orderDate: 1,	
//         // deliveryDate: 1,
//         // customerOR: 1,		
//         // createBy: 1,

//         productID: "$productOR.productID",
//         // productName: "$productOR.productName",
//         // productORDetail: "$productOR.productORDetail",
//         // productCustomerCode: "$productOR.productCustomerCode",

//         productBarcode: "$productOR.productORInfo.productBarcode",
//         style: { $substr: [ "$productOR.productORInfo.productBarcode", 0, 12 ] },	
//         // targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
//         // targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
//         // countryID: "$productOR.productORInfo.targetPlace.countryID",
//         // countryName: "$productOR.productORInfo.targetPlace.countryName",
//         productColor: "$productOR.productORInfo.productColor",
//         productSize: "$productOR.productORInfo.productSize",
//         // productQty: "$productOR.productORInfo.productQty",
//         // productYear: "$productOR.productORInfo.productYear",
//         // productSex: "$productOR.productORInfo.productSex",
//     }	},
//     { $group: {			
//       _id: { 
//         companyID: '$companyID',
//         orderID: '$orderID',
//         productID: '$productID',
//         style: '$style',
//         productColor: '$productColor',
//         productSize: '$productSize',
//         // betPrice: '$betPrice',
//     },
//       // countBetNumber: {$sum: 1} ,
//       // sumQty: {$sum:  '$productQty'} ,
//       // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
//       // sumRewardBetNumber: {$sum:  '$reward'} ,
//     }	},
//   ]);
//   const orderStyleColorSize = await orderStyleColorSizef.map(fw => ({
//     companyID: fw._id.companyID, 
//     orderID: fw._id.orderID, 
//     productID: fw._id.productID,
//     style: fw._id.style,
//     productColor: fw._id.productColor,
//     productSize: fw._id.productSize,
//   }));
//   // console.log(orderStyleColorSize);
//   return orderStyleColorSize;
// }

// ShareFunc.getCurrentCompanyOrderCountryStyle(companyID, orderStatusArr);
exports.getCurrentCompanyOrderCountryStyle= async (companyID, orderStatusArr, orderIDArr) => {
  // ##
  const currentCompanyOrderCountryStylef = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}},
      {"orderStatus":{$in: orderStatusArr}},
    ] } },
    { $unwind: "$productOR.productORInfo" },
    { $project: {			
        _id: 0,	
        orderID: 1,
        companyID: 1,
        // bundleNo: 1,
        orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // createBy: 1,

        productID: "$productOR.productID",
        // productName: "$productOR.productName",
        // productORDetail: "$productOR.productORDetail",
        // productCustomerCode: "$productOR.productCustomerCode",

        productBarcode: "$productOR.productORInfo.productBarcode",
        style: { $substr: [ "$productOR.productORInfo.productBarcode", +process.env.stylePos, +process.env.styleDigit ] },	
        targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
        targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
        countryID: "$productOR.productORInfo.targetPlace.countryID",
        countryName: "$productOR.productORInfo.targetPlace.countryName",
        // productColor: "$productOR.productORInfo.productColor",
        // productSize: "$productOR.productORInfo.productSize",
        productQty: "$productOR.productORInfo.productQty",
        // productYear: "$productOR.productORInfo.productYear",
        // productSex: "$productOR.productORInfo.productSex",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productID: '$productID',
        style: '$style',
        // productColor: '$productColor',
        // productSize: '$productSize',
        targetPlaceID: '$targetPlaceID',
        countryID: '$countryID',
    },
      // countBetNumber: {$sum: 1} ,
      sumQty: {$sum:  '$productQty'} ,
      // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
      // sumRewardBetNumber: {$sum:  '$reward'} ,
    }	},

  ]);
  // console.log(currentCompanyOrderf);
  const currentCompanyOrderCountryStyle = await currentCompanyOrderCountryStylef.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    productID: fw._id.productID,
    style: fw._id.style,
    // productColor: fw._id.productColor,
    // productSize: fw._id.productSize,
    targetPlaceID: fw._id.targetPlaceID,
    countryID: fw._id.countryID,
    sumQty: fw.sumQty
  }));
  // console.log(currentCompanyOrderCountryStyle);

  return currentCompanyOrderCountryStyle;
}

// ShareFunc.getCurrentCompanyOrderZoneStyle(companyID, orderStatusArr);
exports.getCurrentCompanyOrderZoneStyle= async (companyID, orderStatusArr, orderIDArr) => {
  // ##
  const currentCompanyOrderZoneStylef = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}},
      {"orderStatus":{$in: orderStatusArr}},
    ] } },
    { $unwind: "$productOR.productORInfo" },
    { $project: {			
        _id: 0,	
        orderID: 1,
        companyID: 1,
        // bundleNo: 1,
        orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // createBy: 1,

        productID: "$productOR.productID",
        // productName: "$productOR.productName",
        // productORDetail: "$productOR.productORDetail",
        // productCustomerCode: "$productOR.productCustomerCode",

        productBarcode: "$productOR.productORInfo.productBarcode",
        style: { $substr: [ "$productOR.productORInfo.productBarcode", +process.env.stylePos, +process.env.styleDigit ] },	
        targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
        targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
        // countryID: "$productOR.productORInfo.targetPlace.countryID",
        // countryName: "$productOR.productORInfo.targetPlace.countryName",
        // productColor: "$productOR.productORInfo.productColor",
        // productSize: "$productOR.productORInfo.productSize",
        productQty: "$productOR.productORInfo.productQty",
        // productYear: "$productOR.productORInfo.productYear",
        // productSex: "$productOR.productORInfo.productSex",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productID: '$productID',
        style: '$style',
        // productColor: '$productColor',
        // productSize: '$productSize',
        targetPlaceID: '$targetPlaceID',
        // countryID: '$countryID',
    },
      // countBetNumber: {$sum: 1} ,
      sumQty: {$sum:  '$productQty'} ,
      // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
      // sumRewardBetNumber: {$sum:  '$reward'} ,
    }	},

  ]);
  // console.log(currentCompanyOrderf);
  const currentCompanyOrderZoneStyle = await currentCompanyOrderZoneStylef.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    productID: fw._id.productID,
    style: fw._id.style,
    // productColor: fw._id.productColor,
    // productSize: fw._id.productSize,
    targetPlaceID: fw._id.targetPlaceID,
    // countryID: fw._id.countryID,
    sumQty: fw.sumQty
  }));
  // console.log(currentCompanyOrderZoneStyle);

  return currentCompanyOrderZoneStyle;
}

// await ShareFunc.getCurrentCompanyOrderZone(companyID, orderStatusArr);
exports.getCurrentCompanyOrderZone= async (companyID, orderStatusArr, orderIDArr) => {
  // ##
  const currentCompanyOrderZonef = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}},
      {"orderStatus":{$in: orderStatusArr}},
    ] } },
    { $unwind: "$productOR.productORInfo" },
    { $project: {			
        _id: 0,	
        orderID: 1,
        companyID: 1,
        // bundleNo: 1,
        orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // createBy: 1,

        productID: "$productOR.productID",
        // productName: "$productOR.productName",
        // productORDetail: "$productOR.productORDetail",
        // productCustomerCode: "$productOR.productCustomerCode",

        productBarcode: "$productOR.productORInfo.productBarcode",
        style: { $substr: [ "$productOR.productORInfo.productBarcode", +process.env.stylePos, +process.env.styleDigit ] },	
        targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
        targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
        // countryID: "$productOR.productORInfo.targetPlace.countryID",
        // countryName: "$productOR.productORInfo.targetPlace.countryName",
        productColor: "$productOR.productORInfo.productColor",
        productSize: "$productOR.productORInfo.productSize",
        productQty: "$productOR.productORInfo.productQty",
        // productYear: "$productOR.productORInfo.productYear",
        // productSex: "$productOR.productORInfo.productSex",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productID: '$productID',
        style: '$style',
        productColor: '$productColor',
        productSize: '$productSize',
        targetPlaceID: '$targetPlaceID',
        // countryID: '$countryID',
    },
      // countBetNumber: {$sum: 1} ,
      sumQty: {$sum:  '$productQty'} ,
      // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
      // sumRewardBetNumber: {$sum:  '$reward'} ,
    }	},

  ]);
  // console.log(currentCompanyOrderf);
  const currentCompanyOrderZone = await currentCompanyOrderZonef.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    productID: fw._id.productID,
    style: fw._id.style,
    productColor: fw._id.productColor,
    productSize: fw._id.productSize,
    targetPlaceID: fw._id.targetPlaceID,
    // countryID: fw._id.countryID,
    sumQty: fw.sumQty
  }));
  // console.log(currentCompanyOrderZone);

  return currentCompanyOrderZone;
}

// ShareFunc.getCurrentCompanyOrderByStyle(companyID, style, orderStatusArr);
exports.getCurrentCompanyOrderByStyle= async (companyID, style, orderStatusArr, orderIDArr) => {
  // ##
  const currentCompanyOrderf = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}},
      {"orderStatus":{$in: orderStatusArr}},
    ] } },
    { $unwind: "$productOR.productORInfo" },
    { $project: {			
        _id: 0,	
        orderID: 1,
        companyID: 1,
        // bundleNo: 1,
        orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // createBy: 1,

        productID: "$productOR.productID",
        // productName: "$productOR.productName",
        // productORDetail: "$productOR.productORDetail",
        // productCustomerCode: "$productOR.productCustomerCode",

        productBarcode: "$productOR.productORInfo.productBarcode",
        style: { $substr: [ "$productOR.productORInfo.productBarcode", +process.env.stylePos, +process.env.styleDigit ] },	
        targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
        targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
        // countryID: "$productOR.productORInfo.targetPlace.countryID",
        // countryName: "$productOR.productORInfo.targetPlace.countryName",
        productColor: "$productOR.productORInfo.productColor",
        productSize: "$productOR.productORInfo.productSize",
        productQty: "$productOR.productORInfo.productQty",
        // productYear: "$productOR.productORInfo.productYear",
        // productSex: "$productOR.productORInfo.productSex",
    }	},
    { $match: { $and: [
      {"style":style}
    ] } },
    { $project: {			
      _id: 0,	
      orderID: 1,
      companyID: 1,
      orderStatus: 1,
      productID: 1,
      productBarcode: 1,
      style: 1,	
      targetPlaceID: 1,
      targetPlaceName: 1,
      // countryID: 1,
      // countryName: 1,
      productColor: 1,
      productSize: 1,
      productQty: 1,
  }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productID: '$productID',
        style: '$style',
        productColor: '$productColor',
        productSize: '$productSize',
        targetPlaceID: '$targetPlaceID',
        // countryID: '$countryID',
    },
      // countBetNumber: {$sum: 1} ,
      sumQty: {$sum:  '$productQty'} ,
      // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
      // sumRewardBetNumber: {$sum:  '$reward'} ,
    }	},

  ]);
  // console.log(currentCompanyOrderf);
  const currentCompanyOrder = await currentCompanyOrderf.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    productID: fw._id.productID,
    style: fw._id.style,
    productColor: fw._id.productColor,
    productSize: fw._id.productSize,
    targetPlaceID: fw._id.targetPlaceID,
    // countryID: fw._id.countryID,
    sumQty: fw.sumQty
  }));
  // console.log(currentCompanyOrder);

  // const currentOrder = {
  //   orderStyleColorSize: orderStyleColorSize,
  //   currentCompanyOrder: currentCompanyOrder
  // };
  // console.log(currentOrder);

  return currentCompanyOrder;
}

// ShareFunc.getCurrentCompanyOrder(companyID, orderStatusArr)
exports.getCurrentCompanyOrder= async (companyID, orderStatusArr, orderIDArr) => {
  // ##
  const currentCompanyOrderf = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}},
      {"orderStatus":{$in: orderStatusArr}},
    ] } },
    { $unwind: "$productOR.productORInfo" },
    { $project: {			
        _id: 0,	
        orderID: 1,
        companyID: 1,
        // bundleNo: 1,
        orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // createBy: 1,

        productID: "$productOR.productID",
        // productName: "$productOR.productName",
        // productORDetail: "$productOR.productORDetail",
        // productCustomerCode: "$productOR.productCustomerCode",

        productBarcode: "$productOR.productORInfo.productBarcode",
        style: { $substr: [ "$productOR.productORInfo.productBarcode", +process.env.stylePos, +process.env.styleDigit ] },	
        targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
        targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
        countryID: "$productOR.productORInfo.targetPlace.countryID",
        countryName: "$productOR.productORInfo.targetPlace.countryName",
        productColor: "$productOR.productORInfo.productColor",
        productSize: "$productOR.productORInfo.productSize",
        productQty: "$productOR.productORInfo.productQty",
        // productYear: "$productOR.productORInfo.productYear",
        // productSex: "$productOR.productORInfo.productSex",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productID: '$productID',
        style: '$style',
        productBarcode: '$productBarcode',
        productColor: '$productColor',
        productSize: '$productSize',
        targetPlaceID: '$targetPlaceID',
        countryID: '$countryID',
    },
      // countBetNumber: {$sum: 1} ,
      sumQty: {$sum:  '$productQty'} ,
      // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
      // sumRewardBetNumber: {$sum:  '$reward'} ,
    }	},

  ]);
  // console.log(currentCompanyOrderf);
  const currentCompanyOrder = await currentCompanyOrderf.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    productID: fw._id.productID,
    style: fw._id.style,
    productBarcode: fw._id.productBarcode,
    productColor: fw._id.productColor,
    productSize: fw._id.productSize,
    targetPlaceID: fw._id.targetPlaceID,
    countryID: fw._id.countryID,
    sumQty: fw.sumQty
  }));
  // console.log(currentCompanyOrder);

  // const currentOrder = {
  //   orderStyleColorSize: orderStyleColorSize,
  //   currentCompanyOrder: currentCompanyOrder
  // };
  // console.log(currentOrder);

  return currentCompanyOrder;
}

exports.getCurrentCompanyOrderByOrderID= async (companyID, orderStatusArr, orderID) => {
  // ##
  const currentCompanyOrderf = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      // {"orderStatus":{$in: orderStatusArr}}
    ] } },
    { $unwind: "$productOR.productORInfo" },
    { $project: {			
        _id: 0,	
        orderID: 1,
        companyID: 1,
        // bundleNo: 1,
        orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // createBy: 1,

        productID: "$productOR.productID",
        // productName: "$productOR.productName",
        // productORDetail: "$productOR.productORDetail",
        // productCustomerCode: "$productOR.productCustomerCode",

        productBarcode: "$productOR.productORInfo.productBarcode",
        style: { $substr: [ "$productOR.productORInfo.productBarcode", +process.env.stylePos, +process.env.styleDigit ] },	
        targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
        targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
        countryID: "$productOR.productORInfo.targetPlace.countryID",
        countryName: "$productOR.productORInfo.targetPlace.countryName",
        productColor: "$productOR.productORInfo.productColor",
        productSize: "$productOR.productORInfo.productSize",
        productQty: "$productOR.productORInfo.productQty",
        // productYear: "$productOR.productORInfo.productYear",
        // productSex: "$productOR.productORInfo.productSex",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productID: '$productID',
        style: '$style',
        productBarcode: '$productBarcode',
        productColor: '$productColor',
        productSize: '$productSize',
        targetPlaceID: '$targetPlaceID',
        countryID: '$countryID',
    },
      // countBetNumber: {$sum: 1} ,
      sumQty: {$sum:  '$productQty'} ,
      // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
      // sumRewardBetNumber: {$sum:  '$reward'} ,
    }	},

  ]);
  // console.log(currentCompanyOrderf);
  const currentCompanyOrder = await currentCompanyOrderf.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    productID: fw._id.productID,
    style: fw._id.style,
    productBarcode: fw._id.productBarcode,
    productColor: fw._id.productColor,
    productSize: fw._id.productSize,
    targetPlaceID: fw._id.targetPlaceID,
    countryID: fw._id.countryID,
    sumQty: fw.sumQty
  }));
  // console.log(currentCompanyOrder);

  // const currentOrder = {
  //   orderStyleColorSize: orderStyleColorSize,
  //   currentCompanyOrder: currentCompanyOrder
  // };
  // console.log(currentOrder);

  return currentCompanyOrder;
}

// getCurrentCompanyOrderZoneStyleSize
exports.getCurrentCompanyOrderZoneStyleSize= async (companyID, orderStatusArr, orderIDs) => {
  // ##
  const currentCompanyOrderStyleSizef = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},
      {"orderStatus":{$in: orderStatusArr}}
    ] } },
    { $unwind: "$productOR.productORInfo" },
    { $project: {			
        _id: 0,	
        orderID: 1,
        companyID: 1,
        // bundleNo: 1,
        // orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // createBy: 1,

        productID: "$productOR.productID",
        // productName: "$productOR.productName",
        // productORDetail: "$productOR.productORDetail",
        // productCustomerCode: "$productOR.productCustomerCode",

        // productBarcode: "$productOR.productORInfo.productBarcode",
        style: { $substr: [ "$productOR.productORInfo.productBarcode", +process.env.stylePos, +process.env.styleDigit ] },	
        targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
        targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
        // countryID: "$productOR.productORInfo.targetPlace.countryID",
        // countryName: "$productOR.productORInfo.targetPlace.countryName",
        productColor: "$productOR.productORInfo.productColor",
        productSize: "$productOR.productORInfo.productSize",
        productQty: "$productOR.productORInfo.productQty",
        // productYear: "$productOR.productORInfo.productYear",
        // productSex: "$productOR.productORInfo.productSex",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productID: '$productID',
        targetPlaceID: '$targetPlaceID',
        targetPlaceName: '$targetPlaceName',
        style: '$style',
        productColor: '$productColor',
        productSize: '$productSize',
        // targetPlaceID: '$targetPlaceID',
        // countryID: '$countryID',
    },
      // countBetNumber: {$sum: 1} ,
      sumQty: {$sum:  '$productQty'} ,
      // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
      // sumRewardBetNumber: {$sum:  '$reward'} ,
    }	},

  ]);
  // console.log(currentCompanyOrderf);
  const currentCompanyOrderStyleSize = await currentCompanyOrderStyleSizef.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    productID: fw._id.productID,
    targetPlaceID: fw._id.targetPlaceID,
    targetPlaceName: fw._id.targetPlaceName,
    style: fw._id.style,
    productColor: fw._id.productColor,
    productSize: fw._id.productSize,
    sumQty: fw.sumQty
  }));
  // console.log(currentCompanyOrderStyleSize);

  // console.log(currentCompanyOrderStyleSize);
  return currentCompanyOrderStyleSize;
}

exports.getCurrentCompanyOrderStyleSize= async (companyID, orderStatusArr, orderIDArr) => {
  // ##
  const currentCompanyOrderStyleSizef = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}},
      {"orderStatus":{$in: orderStatusArr}},
    ] } },
    { $unwind: "$productOR.productORInfo" },
    { $project: {			
        _id: 0,	
        orderID: 1,
        companyID: 1,
        // bundleNo: 1,
        // orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // createBy: 1,

        productID: "$productOR.productID",
        // productName: "$productOR.productName",
        // productORDetail: "$productOR.productORDetail",
        // productCustomerCode: "$productOR.productCustomerCode",

        // productBarcode: "$productOR.productORInfo.productBarcode",
        style: { $substr: [ "$productOR.productORInfo.productBarcode", +process.env.stylePos, +process.env.styleDigit ] },	
        // targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
        // targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
        // countryID: "$productOR.productORInfo.targetPlace.countryID",
        // countryName: "$productOR.productORInfo.targetPlace.countryName",
        productColor: "$productOR.productORInfo.productColor",
        productSize: "$productOR.productORInfo.productSize",
        productQty: "$productOR.productORInfo.productQty",
        // productYear: "$productOR.productORInfo.productYear",
        // productSex: "$productOR.productORInfo.productSex",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productID: '$productID',
        style: '$style',
        productColor: '$productColor',
        productSize: '$productSize',
        // targetPlaceID: '$targetPlaceID',
        // countryID: '$countryID',
    },
      // countBetNumber: {$sum: 1} ,
      sumQty: {$sum:  '$productQty'} ,
      // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
      // sumRewardBetNumber: {$sum:  '$reward'} ,
    }	},

  ]);
  // console.log(currentCompanyOrderf);
  const currentCompanyOrderStyleSize = await currentCompanyOrderStyleSizef.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    productID: fw._id.productID,
    style: fw._id.style,
    productColor: fw._id.productColor,
    productSize: fw._id.productSize,
    sumQty: fw.sumQty
  }));
  // console.log(currentCompanyOrderStyleSize);

  // console.log(currentCompanyOrderStyleSize);
  return currentCompanyOrderStyleSize;
}



// ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr);
exports.getCurrentCompanyOrderStyle= async (companyID, orderStatusArr, orderIDArr) => {
  // ##
  const currentCompanyOrderf = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDArr}},
      {"orderStatus":{$in: orderStatusArr}},
    ] } },
    { $unwind: "$productOR.productORInfo" },
    { $project: {			
        _id: 0,	
        orderID: 1,
        companyID: 1,
        // bundleNo: 1,
        // orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        customerOR: 1,		
        // createBy: 1,

        productID: "$productOR.productID",
        // productName: "$productOR.productName",
        // productORDetail: "$productOR.productORDetail",
        // productCustomerCode: "$productOR.productCustomerCode",

        // productBarcode: "$productOR.productORInfo.productBarcode",
        style: { $substr: [ "$productOR.productORInfo.productBarcode", +process.env.stylePos, +process.env.styleDigit ] },	
        // targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
        // targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
        // countryID: "$productOR.productORInfo.targetPlace.countryID",
        // countryName: "$productOR.productORInfo.targetPlace.countryName",
        // productColor: "$productOR.productORInfo.productColor",
        // productSize: "$productOR.productORInfo.productSize",
        productQty: "$productOR.productORInfo.productQty",
        // productYear: "$productOR.productORInfo.productYear",
        // productSex: "$productOR.productORInfo.productSex",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productID: '$productID',
        style: '$style',
        customerOR: '$customerOR',
        // productSize: '$productSize',
        // targetPlaceID: '$targetPlaceID',
        // countryID: '$countryID',
    },
      // countBetNumber: {$sum: 1} ,
      sumQty: {$sum:  '$productQty'} ,
      // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
      // sumRewardBetNumber: {$sum:  '$reward'} ,
    }	},

  ]);
  // console.log(currentCompanyOrderf);
  const currentCompanyOrder = await currentCompanyOrderf.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    productID: fw._id.productID,
    style: fw._id.style,
    customerOR: fw._id.customerOR,
    sumQty: fw.sumQty
  }));
  // console.log(currentCompanyOrder);

  // console.log(currentOrder);
  return currentCompanyOrder;
}

exports.getCurrentCompanyOrderStyleByOrderID= async (companyID, orderStatusArr, orderID) => {
  // ##
  const currentCompanyOrderf = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      // {"orderStatus":{$in: orderStatusArr}}
    ] } },
    { $unwind: "$productOR.productORInfo" },
    { $project: {			
        _id: 0,	
        orderID: 1,
        companyID: 1,
        // bundleNo: 1,
        // orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        customerOR: 1,		
        // createBy: 1,

        productID: "$productOR.productID",
        // productName: "$productOR.productName",
        // productORDetail: "$productOR.productORDetail",
        // productCustomerCode: "$productOR.productCustomerCode",

        // productBarcode: "$productOR.productORInfo.productBarcode",
        style: { $substr: [ "$productOR.productORInfo.productBarcode", +process.env.stylePos, +process.env.styleDigit ] },	
        // targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
        // targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
        // countryID: "$productOR.productORInfo.targetPlace.countryID",
        // countryName: "$productOR.productORInfo.targetPlace.countryName",
        // productColor: "$productOR.productORInfo.productColor",
        // productSize: "$productOR.productORInfo.productSize",
        productQty: "$productOR.productORInfo.productQty",
        // productYear: "$productOR.productORInfo.productYear",
        // productSex: "$productOR.productORInfo.productSex",
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        productID: '$productID',
        style: '$style',
        customerOR: '$customerOR',
        // productSize: '$productSize',
        // targetPlaceID: '$targetPlaceID',
        // countryID: '$countryID',
    },
      // countBetNumber: {$sum: 1} ,
      sumQty: {$sum:  '$productQty'} ,
      // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
      // sumRewardBetNumber: {$sum:  '$reward'} ,
    }	},

  ]);
  // console.log(currentCompanyOrderf);
  const currentCompanyOrder = await currentCompanyOrderf.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    productID: fw._id.productID,
    style: fw._id.style,
    customerOR: fw._id.customerOR,
    sumQty: fw.sumQty
  }));
  // console.log(currentCompanyOrder);

  // console.log(currentOrder);
  return currentCompanyOrder;
}



// ## report..... company
// #######################################################################################################



// #######################################################################################################
// ## update manual data

// const outsourcefactoryID = [ 'f000009', 'f000004', 'f000005', 'f000006' ];
//   const factoryID1 = 'f000001';
//   const companyID = 'c000001';
//   const order1 = await OrderProduction.updateMany(
//     {$and: [
//       {"companyID":companyID},
//       {"orderID":{$in: orderIDs}}
//     ]},
//     { $set: { 
//       "productionNode.$[pn].outsourceData.$[outs].fromFactoryID" : factoryID1, 
//     }},
//     {
//       multi: true,
//       arrayFilters: [
//         {
//           "pn.outsourceData": {
//             $exists: true
//           }
//         },
//         {
//           // "outs.factoryID": "f000005"
//           "outs.factoryID": {$in: outsourcefactoryID}
//         }
//       ]
// });

exports.updateOrderAboutFactory= async () => {
  const fromFactoryID = 'f000001';
  const toFactoryID = 'f000003';
  const orderID = 'GL-92B';

  const result1 = await OrderProduction.updateMany(
    {$and: [
      {"orderID":orderID} , 
      // {"lottoRoundID":lottoRoundID}, 
      // {"lottoMainTypeID":lottoMainTypeID},
    ]},
    { $set: { 
      "productionNode.$[elem].factoryID" : toFactoryID, 
      "factoryID": toFactoryID,

    }},
    {
      multi: true,
      arrayFilters: [  {"elem.factoryID": fromFactoryID } ]
    });

    const result2 = await OrderProductionQueueList.updateMany(
      {$and: [
        {"orderID":orderID}  ,
        {"factoryID":fromFactoryID}  ,
      ]},
      {
        "factoryID": toFactoryID,

      }); 

    //
    const result3 = await OrderProductionQueue.updateMany(
      {$and: [
        {"orderID":orderID} , 
        // {"lottoRoundID":lottoRoundID}, 
        // {"lottoMainTypeID":lottoMainTypeID},
      ]},
      { $set: { 
        "queueInfo.$[elem].factoryID" : toFactoryID, 
  
      }},
      {
        multi: true,
        arrayFilters: [  {"elem.factoryID": fromFactoryID } ]
      });  



  console.log('update order about factoryID complete');
}

exports.updateQrCodeRealOrderProduction= async () => {
  const orderProduction = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID": 'c000001'},
      // {"orderStatus":{$in: orderStatusArr}}
    ] } },
    { $project: {			
      _id: 0,	
      orderID: 1,
      companyID: 1,
      productBarcodeNo: 1,
      
  }	},
  ]).hint( {"companyID" : 1, "productBarcodeNoReal": 1} );
  // console.log(orderProduction);

  await this.asyncForEach(orderProduction , async (item) => {
    const barcode = item.productBarcodeNo;
    result1 = await OrderProduction.updateMany(
      {$and: [
        {"companyID": 'c000001'},
        {"productBarcodeNo": item.productBarcodeNo}, 
      ]},
      {
        "productBarcodeNoReal": barcode,

      }); 
  });
  console.log('updateQrCodeRealOrderProduction complete');
  // return orderProduction;
}

exports.updateTargetPlaceOrderProduction= async () => {
  result1 = await OrderProduction.updateMany(
    {$and: [
      {"companyID":'c000001'} ,
    ]},
    {
      "targetPlace.targetPlaceID": 'SGHI',
      "targetPlace.targetPlaceName": 'SHANGHAI',
    }); 
}

// ## update targetPlace / countryID all
exports.updateTargetPlaceOrder= async () => {
  // const countryID1 = '';
  // const countryName1 = '';
  // const countryID2 = '';
  // const countryName2 = '';
  const countryAll = [
    {countryID1: 'HGKG', countryID2: 'HKG1', countryName2: 'HONGKONG1'},
    {countryID1: 'MEH', countryID2: 'MEH1', countryName2: 'MEH1'},
    {countryID1: 'JAPN', countryID2: 'JPN1', countryName2: 'JAPAN1'},
    {countryID1: 'SGHI', countryID2: 'SGHI1', countryName2: 'SHANGHAI1'},
    {countryID1: 'KORE', countryID2: 'KOR1', countryName2: 'KOREA1'},
    {countryID1: 'TAWN', countryID2: 'TWN1', countryName2: 'TAIWAN1'},
    {countryID1: 'MALA', countryID2: 'MLS1', countryName2: 'MALAYSIA1'},
    {countryID1: 'SGP', countryID2: 'SGP1', countryName2: 'SINGAPORE1'},
    {countryID1: 'AUS', countryID2: 'AUS1', countryName2: 'AUS1'},
    {countryID1: 'INDI', countryID2: 'IND1', countryName2: 'INDIA1'},
    {countryID1: 'CAD', countryID2: 'CAD1', countryName2: 'CAD1'},
    {countryID1: 'NY', countryID2: 'NY1', countryName2: 'NY1'},
    {countryID1: 'UAE', countryID2: 'UAE1', countryName2: 'UAE1'},
    {countryID1: 'MEH', countryID2: 'MEH1', countryName2: 'MEH1'}
  ];

  await this.asyncForEach(countryAll , async (item) => {
    result1 = await OrderProduction.updateMany(
      {$and: [
        {"targetPlace.countryID":item.countryID1} , 
      ]},
      {
        "targetPlace.countryID": item.countryID2,
        "targetPlace.countryName": item.countryID2,
      }); 

    result2 = await TargetPlace.updateMany(
      {$and: [
        {"targetPlace.countryID":item.countryID1} , 
      ]},
      {
        "targetPlace.countryID": item.countryID2,
        "targetPlace.countryName": item.countryID2,
      }); 

    const order1 = await Order.updateMany(
      {$and: [
        {"companyID":'c000001'} , 
        // {"lottoRoundID":lottoRoundID}, 
        // {"lottoMainTypeID":lottoMainTypeID},
      ]},
      { $set: { 
        "orderTargetPlace.$[elem].targetPlace.countryID" : item.countryID2, 
        "orderTargetPlace.$[elem].targetPlace.countryName" :item.countryID2
      }},
      {
        multi: true,
        arrayFilters: [  {"elem.targetPlace.countryID": item.countryID1 } ]
      });

    const order2 = await Order.updateMany(
      {$and: [
        {"companyID":'c000001'} , 
        // {"lottoRoundID":lottoRoundID}, 
        // {"lottoMainTypeID":lottoMainTypeID},
      ]},
      { $set: { 
        "productOR.productORInfo.$[elem].targetPlace.countryID" : item.countryID2, 
        "productOR.productORInfo.$[elem].targetPlace.countryName" :item.countryID2
      }},
      {
        multi: true,
        arrayFilters: [  {"elem.targetPlace.countryID": item.countryID1 } ]
      });

  });
  console.log('updated targetPlace');
}

// countryID : {type: String},
// countryName : {type: String},

// ## update productBarcodeNo
exports.updateTargetPlaceCountryIDOrder= async () => {
  const companyID = 'c000001';
  const countryAll = [
    
    {countryID1: 'JPN1', countryID2: 'JPN1-', countryName2: 'JPN1'},
    {countryID1: 'JPN2', countryID2: 'JPN2-', countryName2: 'JPN2'},
    {countryID1: 'JPN3', countryID2: 'JPN3-', countryName2: 'JPN3'},
    {countryID1: 'JPN4', countryID2: 'JPN4-', countryName2: 'JPN4'},

    {countryID1: 'SGHI1', countryID2: 'SGHI1', countryName2: 'SGHI1'},
    {countryID1: 'SGHI2', countryID2: 'SGHI2', countryName2: 'SGHI2'},
    {countryID1: 'SGHI3', countryID2: 'SGHI3', countryName2: 'SGHI3'},

    {countryID1: 'HKG1', countryID2: 'HKG1-', countryName2: 'HKG1'},
    {countryID1: 'HKG2', countryID2: 'HKG2-', countryName2: 'HKG2'},
    {countryID1: 'HKG3', countryID2: 'HKG3-', countryName2: 'HKG3'},
    {countryID1: 'KOR1', countryID2: 'KOR1-', countryName2: 'KOR1'},
    {countryID1: 'KOR2', countryID2: 'KOR2-', countryName2: 'KOR2'},
    {countryID1: 'KOR3', countryID2: 'KOR3-', countryName2: 'KOR3'},
    {countryID1: 'TWN1', countryID2: 'TWN1-', countryName2: 'TWN1'},
    {countryID1: 'TWN2', countryID2: 'TWN2-', countryName2: 'TWN2'},
    {countryID1: 'TWN3', countryID2: 'TWN3-', countryName2: 'TWN3'},
    {countryID1: 'MLS1', countryID2: 'MLS1-', countryName2: 'MLS1'},
    {countryID1: 'MLS2', countryID2: 'MLS2-', countryName2: 'MLS2'},
    {countryID1: 'MLS3', countryID2: 'MLS3-', countryName2: 'MLS3'},
    {countryID1: 'SGP1', countryID2: 'SGP1-', countryName2: 'SGP1'},
    {countryID1: 'SGP2', countryID2: 'SGP2-', countryName2: 'SGP2'},
    {countryID1: 'SGP3', countryID2: 'SGP3-', countryName2: 'SGP3'},
    {countryID1: 'AUS1', countryID2: 'AUS1-', countryName2: 'AUS1'},
    {countryID1: 'AUS2', countryID2: 'AUS2-', countryName2: 'AUS2'},
    {countryID1: 'AUS3', countryID2: 'AUS3-', countryName2: 'AUS3'},
    {countryID1: 'IND1', countryID2: 'IND1-', countryName2: 'IND1'},
    {countryID1: 'IND2', countryID2: 'IND2-', countryName2: 'IND2'},
    {countryID1: 'IND3', countryID2: 'IND3-', countryName2: 'IND3'},

    {countryID1: 'THA1', countryID2: 'THA1-', countryName2: 'THA1'},
    {countryID1: 'THA2', countryID2: 'THA2-', countryName2: 'THA2'},
    {countryID1: 'THA3', countryID2: 'THA3-', countryName2: 'THA3'},
    {countryID1: 'VTN1', countryID2: 'VTN1-', countryName2: 'VTN1'},
    {countryID1: 'VTN2', countryID2: 'VTN2-', countryName2: 'VTN2'},
    {countryID1: 'VTN3', countryID2: 'VTN3-', countryName2: 'VTN3'},
    {countryID1: 'PHL1', countryID2: 'PHL1-', countryName2: 'PHL1'},
    {countryID1: 'PHL2', countryID2: 'PHL2-', countryName2: 'PHL2'},
    {countryID1: 'PHL3', countryID2: 'PHL3-', countryName2: 'PHL3'},

    {countryID1: 'CAD1', countryID2: 'CAD1-', countryName2: 'CAD1'},
    {countryID1: 'CAD2', countryID2: 'CAD2-', countryName2: 'CAD2'},
    {countryID1: 'CAD3', countryID2: 'CAD3-', countryName2: 'CAD3'},
    {countryID1: 'NY1', countryID2: 'NY1--', countryName2: 'NY1'},
    {countryID1: 'NY2', countryID2: 'NY2--', countryName2: 'NY2'},
    {countryID1: 'NY3', countryID2: 'NY3--', countryName2: 'NY3'},
    {countryID1: 'UAE1', countryID2: 'UAE1-', countryName2: 'UAE1'},
    {countryID1: 'UAE2', countryID2: 'UAE2-', countryName2: 'UAE2'},
    {countryID1: 'UAE3', countryID2: 'UAE3-', countryName2: 'UAE3'},
    {countryID1: 'MEH1', countryID2: 'MEH1-', countryName2: 'MEH1'},
    {countryID1: 'MEH2', countryID2: 'MEH2-', countryName2: 'MEH2'},
    {countryID1: 'MEH3', countryID2: 'MEH3-', countryName2: 'MEH3'},
  ];

  const xx = [
    { _id: { countryID: 'NY2', countryName: 'NY2' } },
    { _id: { countryID: 'SGP1', countryName: 'SGP1' } },
    { _id: { countryID: 'MEH3', countryName: 'MEH3' } },
    { _id: { countryID: 'NY1', countryName: 'NY1' } },
    { _id: { countryID: 'KOR1', countryName: 'KOR1' } },
    { _id: { countryID: 'MEH2', countryName: 'MEH2' } },
    { _id: { countryID: 'HKG1', countryName: 'HKG1' } },
    { _id: { countryID: 'UAE1', countryName: 'UAE1' } },
    { _id: { countryID: 'MLS1', countryName: 'MLS1' } },
    { _id: { countryID: 'IND1', countryName: 'IND1' } },
    { _id: { countryID: 'JPN1', countryName: 'JPN1' } },
    { _id: { countryID: 'AUS1', countryName: 'AUS1' } },
    { _id: { countryID: 'HKG2', countryName: 'HKG2' } },
    { _id: { countryID: 'VTN1', countryName: 'VTN1' } },
    { _id: { countryID: 'MEH1', countryName: 'MEH1' } },
    { _id: { countryID: 'CAD1', countryName: 'CAD1' } },
    { _id: { countryID: 'THA1', countryName: 'THA1' } },
    { _id: { countryID: 'TWN1', countryName: 'TWN1' } },
    { _id: { countryID: 'SGHI1', countryName: 'SGHI1' } }
  ];

  const order = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID}
    ] } },
    { $project: {			
        _id: 1,	
        orderID: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // bundleNo: 1,
        companyID: 1,
        factoryID: 1,
        // customerOR: 1,	
        // orderTargetPlace: 1,	
        // orderColor: 1,
        productOR: 1,	
        // orderStatus: 1,
        // createBy: 1,

    }	}
  ]);

  await this.asyncForEach(order , async (item) => {
    // console.log(item);
    // console.log(item.productOR.productORInfo);
    
    await this.asyncForEach2(item.productOR.productORInfo , async (item2) => {
      // console.log(item2);
      const countryID2 = await this.xxFindCountry(countryAll, item2.targetPlace.countryID);
      item2.targetPlace.countryID = countryID2;
      item2.factoryID = 'f000001';
      // console.log(item2.targetPlace.countryID);
    });
    // console.log(item);
    // console.log(item.productOR.productORInfo);


    orderUpdate2 = await Order.updateOne(
      {$and: [
        {"companyID": item.companyID},
        {"orderID": item.orderID},
      ]},
      {
        // "factoryID":'f000001',
        "productOR":item.productOR,
      });

  });
  

  // // ## update order --> set field factoryID
  // orderUpdate = await Order.updateMany(
  //   {$and: [
  //     {"companyID":companyID}
  //   ]},
  //   {
  //     "factoryID":'f000001',
  //   });

  console.log('update complete');
}

exports.xxFindCountry= async (countryAll, countryID) => {
  const countryF = await countryAll.filter(i=>(i.countryID1 == countryID));
  // const hilo = await userBetTotalNumberf.filter(i=>(i._id.lottoBetType == 'hilo'));
  if (countryF.length > 0) {
    return countryF[0].countryID2;
  }
  return countryID;
}

exports.xxFindCountry2= async (countryAll, countryName) => {
  const countryF = await countryAll.filter(i=>(i.countryName == countryName));
  // const hilo = await userBetTotalNumberf.filter(i=>(i._id.lottoBetType == 'hilo'));
  if (countryF.length > 0) {
    return countryF[0].countryID2;
  }
  // console.log('not found');
  return countryName;
}

exports.xxFindOrder= async () => {
  const companyID = 'c000001';
  const order = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
    ] } },
    { $unwind: "$productOR.productORInfo" },
    { $project: {			
        _id: 0,	
        orderID: 1,
        companyID: 1,
        // bundleNo: 1,
        orderStatus: 1,
        // orderDetail: 1,		
        // orderDate: 1,	
        // deliveryDate: 1,
        // customerOR: 1,		
        // createBy: 1,

        productID: "$productOR.productID",
        // productName: "$productOR.productName",
        // productORDetail: "$productOR.productORDetail",
        // productCustomerCode: "$productOR.productCustomerCode",

        productBarcode: "$productOR.productORInfo.productBarcode",
        style: { $substr: [ "$productOR.productORInfo.productBarcode", 0, 12 ] },	
        targetPlaceID: "$productOR.productORInfo.targetPlace.targetPlaceID",
        targetPlaceName: "$productOR.productORInfo.targetPlace.targetPlaceName",
        countryID: "$productOR.productORInfo.targetPlace.countryID",
        countryName: "$productOR.productORInfo.targetPlace.countryName",
        // productColor: "$productOR.productORInfo.productColor",
        // productSize: "$productOR.productORInfo.productSize",
        // productQty: "$productOR.productORInfo.productQty",
        // productYear: "$productOR.productORInfo.productYear",
        // productSex: "$productOR.productORInfo.productSex",
    }	},
    { $group: {			
      _id: { 
        // companyID: '$companyID',
        // orderID: '$orderID',
        // productID: '$productID',
        // style: '$style',
        // productColor: '$productColor',
        // productSize: '$productSize',
        // targetPlaceID: '$targetPlaceID',
        countryID: '$countryID',
        countryName: '$countryName',
    },
      // countBetNumber: {$sum: 1} ,
      // sumQty: {$sum:  '$productQty'} ,
      // sumAffBetNumber: {$sum:  '$betAffNumber'} ,
      // sumRewardBetNumber: {$sum:  '$reward'} ,
    }	},
  ]);
  console.log(order);

}

exports.getviewBundleNoOrderProductionQueue= async () => {
  const companyID = 'c000001';
  const orderIDs = [  // 'GL-115B'
    'GL-115B',
    // 'JBAD9A3A', '23F-YM505',
    // '23F-BP1508', 'GL-92B',
    // 'GL-116B',
  ];

  const orderProductionQ = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},
    ] } },
    { $unwind: "$queueInfo"},
    { $project: {		
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      // productBarcodeNo: 1,	
      // productBarcodeNoReal: 1,	
      bundleNo: "$queueInfo.bundleNo",	
      // toNode: "$queueInfo.toNode",	
    }	},
    // { $group: {			
    //   _id: { 
    //     companyID: '$companyID',
    //     orderID: '$orderID',
    //     bundleNo: '$bundleNo',
    //   },
    //   sumQty: {$sum: 1} ,
    // }}
 
  ]);

  // const orderProductionQF = await orderProductionQ.map(fw => ({
  //   companyID: fw._id.companyID, 
  //   orderID: fw._id.orderID, 
  //   bundleNo: fw._id.bundleNo,
  //   sumQty: fw.sumQty
  // }));

  return orderProductionQ;
}

// getviewGroupBundleNoOrderProductionQueue
exports.getviewGroupBundleNoOrderProductionQueue= async () => {
  const companyID = 'c000001';
  const orderIDs = [ // JBAD9A3A  23F-YM505  23F-BP1508  GL-92B  GL-116B  GL-115B
    'JBAD9A3A', '23F-YM505',
    '23F-BP1508', 'GL-92B',
    'GL-116B', 'GL-115B'
    
  ];
  // const outsourcefactoryID = [ 'f000009', 'f000004', 'f000005', 'f000006' ];
  // const factoryID1 = 'f000001';

  const orderProductionQ = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},
    ] } },
    { $unwind: "$queueInfo"},
    { $project: {		
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      // productBarcodeNo: 1,	
      // productBarcodeNoReal: 1,	
      bundleNo: "$queueInfo.bundleNo",	
      // toNode: "$queueInfo.toNode",	
    }	},
    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        bundleNo: '$bundleNo',
      },
      sumQty: {$sum: 1} ,
    }}
 
  ]);

  const orderProductionQF = await orderProductionQ.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID, 
    bundleNo: fw._id.bundleNo,
    sumQty: fw.sumQty
  }));
  console.log(orderProductionQF.length);

  const resultF = orderProductionQF.filter(i=>(i.sumQty > 1));
  console.log(resultF);

  let bundleNos = [];
  await this.asyncForEach(resultF, async (item1) => {
    bundleNos.push(item1.bundleNo);
  });
  // console.log(bundleNos.length, bundleNos);

  const orderProductionQL = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},
    ] } },
    { $unwind: "$queueInfo"},
    { $project: {		
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      // productBarcodeNo: 1,	
      // productBarcodeNoReal: 1,	
      bundleNo: "$queueInfo.bundleNo",	
      productBarcode: "$queueInfo.productBarcode",	
      size: { $toUpper:{ $substr: [ "$queueInfo.productBarcode", +process.env.sizePos, +process.env.sizeDigit ] }},
      numberFrom: "$queueInfo.numberFrom",	
      numberTo: "$queueInfo.numberTo",	
    }	},
    { $match: { $and: [
      // {"companyID":companyID},
      {"bundleNo":{$in: bundleNos}},
    ] } },
    { $project: {		
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      // productBarcodeNo: 1,	
      // productBarcodeNoReal: 1,	
      bundleNo: 1,	
      productBarcode: 1,	
      size: 1,
      numberFrom: 1,	
      numberTo: 1,	
    }	},
    { $sort: { bundleNo: 1 } },
  ]);

  return orderProductionQL;

}

exports.editQueueInfoOfOrderProductionQueue_CancelOrderProduction01= async () => {
  // const orderID = 'AA0Q1A3A';
  // const productBarcode = 'AA0Q1A3A    UK-------23BK--------M---';
  // const productBarcode2 = 'AA0Q1A3A    JAPN-----23GR--------M---';
  
  result1 = await OrderProductionQueue.updateOne({$and: [
    {"companyID":'c000001'} , 
    {"orderID":orderID} ,
  ]} , 
  {
    $pull: {queueInfo: {productBarcode: productBarcode}}
  });
  // result1 = await User.updateOne({userID:userID} , {$pull: {numberSet: {numberSetID: numberSetID}}}).session(session);
  console.log('editQueueInfoOfOrderProductionQueue ok');
}

exports.editOrderProduction02= async () => {
  // const orderID = 'AA0Q1A3A';
  // const orderID2 = 'AA0PKA3A';
  // // const productBarcodeNo = '';
  // const productBarcode = 'AA0Q1A3A    UK-------23BK--------M---'; 
  // const productBarcode2 = 'AA0PKA3A    SGHI-----23RW--------S--F';

  // deleteALL = await OrderProduction.deleteMany({$and: [
  //   {"companyID":'c000001'} , 
  //   {"orderID":orderID} ,
  //   {"productBarcodeNo": new RegExp(productBarcode) }  // function "like" = sql
  // ]}); 

  console.log('editOrderProduction02 ok');
}

exports.getCCurrentProductQtyAllXX = async () => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  // const
  // const productStatus = ['normal', 'problem', 'repaired'];
  // const factoryIDArrx = [ 'f000001', 'f000002', 'f000003' ];
  // const orderProductRep = await OrderProduction.aggregate([
  //   { $match: { $and: [
  //     {"companyID":'c000001'} , 
  //     {"factoryID":{$in: factoryIDArrx}},
  //     {"productStatus":{$in: productStatus}}
  //   ] } },
  //   { $project: {			
  //       _id: 0,	
  //       companyID: 1,
  //       // factoryID: 1,		
  //       // orderID: 1,	
  //       // bundleNo: 1,
  //       productID: 1,
  //       productBarcodeNo: 1,
  //       productBarcodeNoReal: 1,
  //       // productCount: 1,
  //       // productionDate: 1,
  //       // productStatus: 1,
  //       productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
  //   }	},
  //   { $unwind: "$productionNode" },
  //   { $project: { 
  //     _id: 0, 
  //     companyID: 1,
  //     // factoryID: 1,		
  //     // orderID: 1,	
  //     // bundleNo: 1,
  //     productID: 1,
  //     productBarcodeNo: 1,
  //     productBarcodeNoReal: 1,
  //     targetPlace: 1,
  //     style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
  //     targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
  //     color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
  //     size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
  //     bundleNo: 1,
  //     bundleID: 1,

  //     // productStatus: 1,
  //     // fromNode: "$productionNode.fromNode",
  //     // toNode: "$productionNode.toNode",
  //     // datetime: "$productionNode.datetime",
  //     // createBy: "$productionNode.createBy",
  //   }},
  //   { $match: { $and: [
  //     {"size":'---'} , 

  //   ] } },

  // ]);
  console.log(orderProductRep);

  // const orderProductRepF = await orderProductRep.map(fw => ({
  //   companyID: fw._id.companyID, 
  //   productID: fw._id.productID,
  //   style: fw._id.style,
  //   size: fw._id.size,
  //   targetPlace: fw._id.targetPlace,
  //   color: fw._id.color,
  //   countQty: fw.countQty,
  // }));
  // console.log(orderProductRepF);
  // return orderProductRepF;

//   const barcodes = [
//     'AA0Q1A3A    ---------23--------------00001',
//     'AA0Q1A3A    ---------23--------------00002',
//     'AA0Q1A3A    ---------23--------------00003',
//     'AA0Q1A3A    ---------23--------------00004',
//     'AA0Q1A3A    ---------23--------------00005'
//   ];
//   deleteALL = await OrderProduction.deleteMany({$and: [
//     {"companyID":'c000001'} , 
//     {"orderID":'AA0Q1A3A'} , 
//       {"factoryID":{$in: factoryIDArrx}},
//       {"productStatus":{$in: productStatus}},
//       {"productBarcodeNoReal":{$in: barcodes}},
//   ]}); 
}

exports.testview2 = async () => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  // console.log(companyID, factoryIDArr, productStatusArr);
  const companyID = 'c000001';
  const factoryIDArr = ['f000001'];
  const productIDArr = ['BA1ODA3A    '];
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"factoryID":{$in: factoryIDArr}},
      // {"productStatus":{$in: productStatusArr}}
      // {"productID":{$in: factoryIDArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
  ]);
  // console.log(orderProductRep);

  // console.log(orderProductRep);
  return orderProductRep;
}

exports.getOrderProductionQueueByOrderIDProductBarcode= async (companyID, orderID, productBarcode) => {
  const queueInfo = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":orderID},
      // {"productID":productID},
    ] } },
    { $unwind: "$queueInfo" },
    { $project: { 
      companyID: 1,
      orderID: 1,
      productBarcode: "$queueInfo.productBarcode",
      // isOutsource: "$queueInfo.isOutsource",
      // queueDate: "$queueInfo.queueDate",
      factoryID: "$queueInfo.factoryID",
      bundleNo: "$queueInfo.bundleNo",
      productCount: "$queueInfo.productCount",
      numberFrom: "$queueInfo.numberFrom",
      numberTo: "$queueInfo.numberTo",
    } },
    { $match: { $and: [
      {"productBarcode":productBarcode},
      // {"factoryID":factoryID},
      // {"orderID":orderID},
      // {"productID":productID},
    ] } },
    { $project: { 
      companyID: 1,
      orderID: 1,
      productBarcode: 1,
      isOutsource: 1,
      // queueDate: 1,
      factoryID: 1,
      bundleNo: 1,
      productCount: 1,
      numberFrom: 1,
      numberTo: 1,
    } },
  ]);

  // console.log(queueInfo);
  return queueInfo;
}



exports.getOrderProductionByProductBarcode= async (companyID, orderID, productBarcode) => {
  const orderProductionList = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      // {"orderID":{$in: orderIDs}},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,	
        orderID: 1,	
        productBarcodeNo: 1,	
        productBarcodeNoReal: 1,	
        bundleNo: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    // { $unwind: "$productionNode"},
    { $project: {		
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      productBarcodeNo: 1,	
      productBarcodeNoReal: 1,	
      bundleNo: 1,	

      productBarcode: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.productBarcodePos, +process.env.productBarcodeDigit ] }},
      // style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      // color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      // size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // fromNode: "$productionNode.fromNode",	
      // isOutsource: "$productionNode.isOutsource",
      // outsourceData: "$productionNode.outsourceData",
    }	},
    { $match: { $and: [
      // {"isOutsource":true},
      {"productBarcode":productBarcode},
      // {"targetPlace":targetPlace},
      // {"style":style},
      // {"color":color},
      // {"toNode":toNode},
    ] } },
    { $project: {			
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      productBarcodeNo: 1,	
      productBarcodeNoReal: 1,
      productBarcode: 1,	
      bundleNo: 1,	

      // fromNode: 1,

    }	},
 
  ]);
  return orderProductionList;

}

exports.createBundleNoArr= async (bundleNo1, bundleNo2) => {
  let bundleNoArr = [];
  for (let i = +bundleNo1; i <= +bundleNo2; i++) {
    // setBackStrLen= async (len, str, strBack)
    // setStrLen= async (len, num)
    // const num1 = await this.setStrLen(5, i);
    bundleNoArr.push(i);
  }
  return bundleNoArr;
}

// item1.companyID, 
//       item1.factoryID,
//       item1.orderID, 
//       item1.productBarcode, 
//       +item1.bundleNo1, 
//       +item1.bundleNo2, 
//       +item1.no1, 
//       +item1.no2,
//       +item1.productCount,
//       item1.forLoss

exports.editOrderProductionForloss = async (companyID, factoryID, orderID, productBarcode, bundleNo1, bundleNo2, no1, no2, productCount, forLoss) => {

  let bundleNos = [];
  bundleNos = await this.createBundleNoArr(+bundleNo1, +bundleNo2);
  // console.log(bundleNos);
  const bundleNoFrom = +bundleNo1;
  const bundleNoTo = +bundleNo2;
  const productBarcodeNo1Arr1 = await this.createArrElementN(productBarcode, no1, no2);
  // console.log(productBarcodeNo1Arr1);

  // ## edit order production
  const result1 = await OrderProduction.updateMany(
    {$and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: [orderID]}},
      {"productBarcodeNoReal":{$in: productBarcodeNo1Arr1}}
    ]}, 
    {
      "forLoss": forLoss
    });
    // console.log('edit order production --------------------------------');

    // // ## edit orderProductionQueue
    // const result2 = await OrderProductionQueue.updateMany(
    //   {$and: [
    //     {"companyID":companyID},
    //     {"orderID":{$in: [orderID]}},
    //   ]},
    //   {
    //     // "factoryID": toFactoryID,
    //     $set: { 
    //       "queueInfo.$[elem].forLossQty" : 0,
    //       "queueInfo.$[elem].forLoss" : forLoss,
    //     }
    //   }, 
    //   {
    //     multi: true, 
    //     arrayFilters: [  {
    //       "elem.factoryID": factoryID,
    //       "elem.bundleNo":{$in: bundleNos}, 
    //       // "elem.numberFrom": { $gte: no1 } , 
    //       // "elem.numberTo": { $lte: no2 },
    //       "elem.productBarcode": productBarcode
    //     } ] 
    //   });  


  // ## edit orderProductionQueueList
  const result3 = await OrderProductionQueueList.updateMany(
    {$and: [
      {"orderID":orderID},
      {"companyID":companyID},

      {"bundleNoFrom":bundleNo1},
      {"bundleNoTo":bundleNo2},
      {"numberFrom":no1},
      {"numberTo":no2},
    ]},
    {
      "forLossQty": 0,
      "forLoss": forLoss,
    }); 

  console.log('edit ok');
  return true;
}



exports.getDelOrderProductionV3 = async (companyID, orderID, productBarcode, bundleNo1, bundleNo2, no1, no2, productCount) => {
  const productBarcodes = [productBarcode];
  let bundleNos = [];
  bundleNos = await this.createBundleNoArr(+bundleNo1, +bundleNo2);
  const bundleNoFrom = +bundleNo1;
  const bundleNoTo = +bundleNo2;

  // console.log(productBarcodes , ' ==>  productBarcodes');
  // console.log(bundleNos , ' ==>  bundleNos');
  // console.log(bundleNo1, bundleNo2, no1, no2, productCount);

  if (bundleNo1 > -1) {  // ## -1 = no need use bundleNo
    
    // ## delete from orderProductionQueueList
    result001 = await OrderProductionQueueList.deleteMany({$and: [
      {"companyID":companyID} , 
      {"orderID":orderID} ,
      {"productBarcode":{$in: productBarcodes}},
      {"bundleNoFrom":bundleNoFrom} ,
      {"bundleNoTo":bundleNoTo} ,
      {"numberFrom": +no1} ,
      {"numberTo": +no2} ,
    ]});

    // ## delete from orderProductionQueue
    result2 = await OrderProductionQueue.updateOne({$and: [
      {"companyID":companyID} , 
      {"orderID":orderID} ,
    ]} , 
    {
      $pull: {
        queueInfo: {
          "productBarcode":{$in: productBarcodes}, 
          "bundleNo":{$in: bundleNos}, 
          "numberFrom": { $gte: no1 } , 
          "numberTo": { $lte: no2 }
        }
      }
      // $pull: {queueInfo: {"bundleNo":{$in: bundleNos}, "numberFrom": no1, "numberTo": no2, "productCount": productCount}}
      // $pull: { fruits: { $in: [ "apples", "oranges" ] }, vegetables: "carrots" }
    });
  }
  // queueInfo: {"productBarcode":{$in: productBarcodes}}, 
  // db.profiles.updateOne( { _id: 1 }, { $pull:    { votes: { $gte: 6 } }     } )


  // ## delete from orderProduction
  const productBarcodeNo1Arr1 = await this.createArrElementN(productBarcode, no1, no2);
  result01 = await OrderProduction.deleteMany({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
    {"productBarcodeNoReal":{$in: productBarcodeNo1Arr1}},
    // {"factoryID":factoryID} ,
    // {"orderID":orderID} ,
  ]}); 

  console.log('delete ok');
  return true;
}

// getDelOrderProductionV2
exports.getDelOrderProductionV2 = async (companyID, orderID, productBarcode, bundleNo, no1, no2, productCount) => {
  // {
  //   productBarcode: 'BA1OPA4S    UK-------24BK--------2XL-',
  //   bundleNo: 1418131,
  //   no1: 35,
  //   no2: 46,
  //   productCount: 12,
  // },
  const productBarcodes = [productBarcode];

  let bundleNos = [];
  bundleNos = await this.createBundleNoArr(bundleNo, bundleNo);

  if (bundleNo > -1) {  // ## -1 = no need use bundleNo
    const bundleNoFrom = bundleNo;
    const bundleNoTo = bundleNo;
    
    // ## delete from orderProductionQueueList
    result001 = await OrderProductionQueueList.deleteMany({$and: [
      {"companyID":companyID} , 
      {"orderID":orderID} ,
      {"productBarcode":{$in: productBarcodes}},
      {"bundleNoFrom":bundleNoFrom} ,
      {"bundleNoTo":bundleNoTo} ,
      {"numberFrom":no1} ,
      {"numberTo":no2} ,
    ]});

    // ## delete from orderProductionQueue
    result2 = await OrderProductionQueue.updateOne({$and: [
      {"companyID":companyID} , 
      {"orderID":orderID} ,
    ]} , 
    {
      $pull: {queueInfo: {"bundleNo":{$in: bundleNos}, "numberFrom": no1, "numberTo": no2, "productCount": productCount}}
    });
  }
  // { $pull: { fruits: { $in: [ "apples", "oranges" ] }, vegetables: "carrots" } }

  // ## delete from orderProduction
  const productBarcodeNo1Arr1 = await this.createArrElementN(productBarcode, no1, no2);
  result01 = await OrderProduction.deleteMany({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
    {"productBarcodeNoReal":{$in: productBarcodeNo1Arr1}},
    // {"factoryID":factoryID} ,
    // {"orderID":orderID} ,
  ]}); 

  console.log('delete ok');
  return true;
}

exports.adjustGroupProductNo = async (productCount, bundleNoFrom, bundleNoTo , no1, no2) => {
  // console.log(productCount, bundleNoFrom, bundleNoTo , no1, no2);
  let numGroup = [];
  const round1 = (+no2 - +no1 + 1) / +productCount;
  let num1 = +no1;
  let num2 = +no1 + +productCount - 1;
  let bundleNoFrom1 = bundleNoFrom;
  for (let i = 1; i <= round1; i++) {
    // const uuid = uuidv4();
    numGroup.push({
      bundleNo: bundleNoFrom1,
      numberFrom: num1,
      numberTo: num2,
      bundleID: uuidv4()
    });
    num1 = num1 + 12;
    num2 = num2 + 12;
    bundleNoFrom1 = bundleNoFrom1 + 1;
  }
  return numGroup;
}

// test1_addnewArrOrderQueue
exports.test1_addnewArrOrderQueue = async (companyID, factoryID, orderID, productBarcode, productCount, bundleNoFrom, bundleNoTo, no1, no2,
  isOutsource, forLoss, forLossQty, toNode, yarnLot, createBy) => {
  // const companyID = 'c000001';
  // const factoryID = 'f000001';
  // const orderID = 'BA1OOA4S';
  // const productBarcode = 'BA1OOA4S    UK-------24BL--------L---';
  // const bundleNoFrom = 1421435;
  // const bundleNoTo = 1421455;
  // const no1 = 1;
  // const no2 = 252;
  // const productCount = 12;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  // ## adjust group of number 1-12 , 13- 24, ...
  const numGroup = await this.adjustGroupProductNo(productCount, bundleNoFrom, bundleNoTo, no1, no2);
  // console.log(numGroup);

  let queueInfo = [];
  await this.asyncForEach(numGroup , async (item) => {
    const data1 = {
      productBarcode: productBarcode,
      queueDate: current,
      factoryID: factoryID,
      isOutsource: isOutsource,
      forLoss: forLoss,
      forLossQty: forLossQty,
      bundleNo: item.bundleNo,
      bundleID: item.bundleID,
      toNode: toNode,
      productCount: productCount,
      numberFrom: item.numberFrom,
      numberTo: item.numberTo,
      yarnLot: yarnLot,
      createBy: createBy,
    };
    queueInfo.push(data1);
  });
  // console.log(queueInfo);

  result1 = await OrderProductionQueue.updateOne(
    {$and: [
      {"companyID":companyID},
      {"orderID":orderID},
      // {"productID":productID},
    ]}, 
    {$push: {queueInfo: {$each:queueInfo,  $position: 0}}},  // ## add new element at the first
    );

  /**  
   {
      "productBarcode": "BA1OOA4S    UK-------24BL--------M---",
      "queueDate": {
        "$date": "2023-08-24T11:23:05.000Z"
      },
      "factoryID": "f000001",
      "isOutsource": false,
      "forLoss": false,
      "forLossQty": 0,
      "bundleNo": 1421403,
      "bundleID": "abeb7d27-eec9-49f6-b89c-45ab6e76dfe6",
      "toNode": "1.COMPUTER-KNITTING",
      "productCount": 12,
      "numberFrom": 1,
      "numberTo": 12,
      "yarnLot": [
        {
          "yarnLotID": "35292",
          "_id": {
            "$oid": "64e73d9b049b62e26936eb7d"
          }
        }
      ],
      "createBy": {
        "userID": "1x1",
        "userName": "xxxx"
      },
      "_id": {
        "$oid": "64e73d9b049b62e26936eb7c"
      }
    },
   */

    console.log('add to arrary for order queue ok');
  return true;
}

exports.getDelOrderProduction2 = async (companyID, orderID, productBarcode, no1, no2) => {
  // ## delete from orderProduction
  // 911  -  1342
  // const no1 = 911;  // ##   <<---- input number here
  // const no2 = 1342; // ##   <<---- input number here
  const productBarcodeNo1Arr1 = await this.createArrElementN(productBarcode, no1, no2);
  // console.log(productBarcodeNo1Arr1);
  result01 = await OrderProduction.deleteMany({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
    {"productBarcodeNoReal":{$in: productBarcodeNo1Arr1}},
    // {"factoryID":factoryID} ,
    // {"orderID":orderID} ,
  ]}); 
  console.log('delete ok');
  return true;
}

exports.getDelOrderProduction1 = async () => {
  const companyID = 'c000001';
  const orderID = 'BA1OPA4S';
  const productBarcodes = [ 'BA1OPA4S    ASIA-----24WH--------S---', 'BA1OPA4S    ASIA-----24WH--------M---',
                            'BA1OPA4S    ASIA-----24WH--------L---', 'BA1OPA4S    ASIA-----24WH--------XL--'];
  const productBarcode1 = 'BA1OPA4S    ASIA-----24WH--------S---';
  const productBarcode2 = 'BA1OPA4S    ASIA-----24WH--------M---';
  const productBarcode3 = 'BA1OPA4S    ASIA-----24WH--------L---';
  const productBarcode4 = 'BA1OPA4S    ASIA-----24WH--------XL--';

  const bundleNo1 = 1435951;
  const bundleNo2 = 1436098;
  let bundleNos = [];
  bundleNos = await this.createBundleNoArr(bundleNo1, bundleNo2);

  // xl  1436071  -  1436098    777 - 1112
  // l   1436034  -  1436070   1023 - 1466
  // m   1435987   -   1436033    1251 - 1814
  // s    1435951  -  1435986    911  -  1342
  const bundleNoFrom = 1435951;
  const bundleNoTo = 1435986;
  
  // ## delete from orderProductionQueueList
  result001 = await OrderProductionQueueList.deleteMany({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
    {"productBarcode":{$in: productBarcodes}},
    {"bundleNoFrom":bundleNoFrom} ,
    {"bundleNoTo":bundleNoTo} ,
  ]});


  
  // ## delete from orderProductionQueue
  result2 = await OrderProductionQueue.updateOne({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
  ]} , 
  {
    $pull: {queueInfo: {"bundleNo":{$in: bundleNos}}}
  });


  // ## delete from orderProduction
  // 911  -  1342
  const no1 = 911;  // ##   <<---- input number here
  const no2 = 1342; // ##   <<---- input number here
  const productBarcodeNo1Arr1 = await this.createArrElementN(productBarcode1, no1, no2);
  result01 = await OrderProduction.deleteMany({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
    {"productBarcodeNoReal":{$in: productBarcodeNo1Arr1}},
    // {"factoryID":factoryID} ,
    // {"orderID":orderID} ,
  ]}); 

  // 1251 - 1814
  const no3 = 1251; // ##   <<---- input number here
  const no4 = 1814; // ##   <<---- input number here
  const productBarcodeNo1Arr2 = await this.createArrElementN(productBarcode2, no3, no4);
  result02 = await OrderProduction.deleteMany({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
    {"productBarcodeNoReal":{$in: productBarcodeNo1Arr2}},
    // {"factoryID":factoryID} ,
    // {"orderID":orderID} ,
  ]}); 

  // 1023 - 1466
  const no5 = 1023; // ##   <<---- input number here
  const no6 = 1466; // ##   <<---- input number here
  const productBarcodeNo1Arr3 = await this.createArrElementN(productBarcode3, no5, no6);
  result03 = await OrderProduction.deleteMany({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
    {"productBarcodeNoReal":{$in: productBarcodeNo1Arr3}},
    // {"factoryID":factoryID} ,
    // {"orderID":orderID} ,
  ]}); 

  // 777 - 1112
  const no7 = 777; // ##   <<---- input number here
  const no8 = 1112; // ##   <<---- input number here
  const productBarcodeNo1Arr4 = await this.createArrElementN(productBarcode4, no7, no8);
  result04 = await OrderProduction.deleteMany({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
    {"productBarcodeNoReal":{$in: productBarcodeNo1Arr4}},
    // {"factoryID":factoryID} ,
    // {"orderID":orderID} ,
  ]}); 

  console.log('delete ok');
  return true;
}

// delAllOrderProduction
exports.delAllOrderProduction = async (companyID, orderID) => {

  // ## del all order production
  result01 = await OrderProduction.deleteMany({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
    // {"productBarcodeNo":{$in: productBarcodeNo1Arr1}},
    // {"factoryID":factoryID} ,
    // {"orderID":orderID} ,
  ]}); 

  // ## delete all order queue
  result2 = await OrderProductionQueue.updateOne({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
  ]} , 
  {
    "queueInfo": [],
    // $pull: {queueInfo: {"productBarcode":{$in: productBarcodes}}}
  });

  // ## delete al order queue list
  result3 = await OrderProductionQueueList.deleteMany({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
    // {"productBarcode":{$in: productBarcodes}},
    // {"factoryID":factoryID} ,
    // {"orderID":orderID} ,
  ]}); 

  console.log('delete ok');
  return true;
}


exports.cancelOrderQueueAllByProductBarcode = async () => {
  const companyID = 'c000001';
  const orderID = 'BA1OPA4S';
  const productBarcodes = [ 'BA1OPA4S    ASIA-----24WH--------S---', 'BA1OPA4S    ASIA-----24WH--------M---',
                            'BA1OPA4S    ASIA-----24WH--------L---', 'BA1OPA4S    ASIA-----24WH--------XL--'];
  const productBarcode1 = 'BA1OPA4S    ASIA-----24WH--------S---';
  const productBarcode2 = 'BA1OPA4S    ASIA-----24WH--------M---';
  const productBarcode3 = 'BA1OPA4S    ASIA-----24WH--------L---';
  const productBarcode4 = 'BA1OPA4S    ASIA-----24WH--------XL--';


  // ## delete from orderProductionQueueList
  result1 = await OrderProductionQueueList.deleteMany({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
    {"productBarcode":{$in: productBarcodes}},
    // {"factoryID":factoryID} ,
    // {"orderID":orderID} ,
  ]}); 


  // ## delete from orderProductionQueue
  result2 = await OrderProductionQueue.updateOne({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
  ]} , 
  {
    $pull: {queueInfo: {"productBarcode":{$in: productBarcodes}}}
  });

  // result3 = await OrderProductionQueue.updateOne({$and: [
  //   {"companyID":companyID} , 
  //   {"orderID":orderID} ,
  // ]} , 
  // {
  //   $pull: {queueInfo: {productBarcode: productBarcode2}}
  // });


  // ## delete record from orderProduction
  const no1 = 1;
  const no2 = 142;
  const productBarcodeNo1Arr1 = await this.createArrElementN(productBarcode1, no1, no2);
  result01 = await OrderProduction.deleteMany({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
    {"productBarcodeNoReal":{$in: productBarcodeNo1Arr1}},
    // {"factoryID":factoryID} ,
    // {"orderID":orderID} ,
  ]}); 

  // const no3 = 1;
  // const no4 = 163;
  // const productBarcodeNo1Arr2 = await this.createArrElementN(productBarcode2, no3, no4);
  // result02 = await OrderProduction.deleteMany({$and: [
  //   {"companyID":companyID} , 
  //   {"orderID":orderID} ,
  //   {"productBarcodeNo":{$in: productBarcodeNo1Arr2}},
  //   // {"factoryID":factoryID} ,
  //   // {"orderID":orderID} ,
  // ]}); 

  // const no5 = 1;
  // const no6 = 119;
  // const productBarcodeNo1Arr3 = await this.createArrElementN(productBarcode3, no5, no6);
  // result03 = await OrderProduction.deleteMany({$and: [
  //   {"companyID":companyID} , 
  //   {"orderID":orderID} ,
  //   {"productBarcodeNo":{$in: productBarcodeNo1Arr3}},
  //   // {"factoryID":factoryID} ,
  //   // {"orderID":orderID} ,
  // ]}); 

  // const no7 = 1;
  // const no8 = 90;
  // const productBarcodeNo1Arr4 = await this.createArrElementN(productBarcode4, no7, no8);
  // result04 = await OrderProduction.deleteMany({$and: [
  //   {"companyID":companyID} , 
  //   {"orderID":orderID} ,
  //   {"productBarcodeNo":{$in: productBarcodeNo1Arr4}},
  //   // {"factoryID":factoryID} ,
  //   // {"orderID":orderID} ,
  // ]}); 

  console.log('delete ok');

  return true;
}

// updateOrderProductionForBundleNo() 
// ## http://192.168.1.35:3968/api/user/test/test6
// ## add productionNode to orderProduction
exports.updateOrderProductionForBundleNo = async () => {
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const companyID = 'c000001';
  const factoryID = 'f000001';
  const orderID = 'JBAD9A3A';
  const productBarcode1 = 'JBAD9A3A    JAPN-----23RW--------M---';  // JBAD9A3A    JAPN-----23RW--------M---03982

  // ## get bundleNO all 
  const bundleNOs = await this.getOrderProductionQueueByOrderIDProductBarcode(companyID, orderID, productBarcode1);
  // console.log(bundleNOs, bundleNOs.length);

  // ## get orderProduction
  const orderProductions = await this.getOrderProductionByProductBarcode(companyID, orderID, productBarcode1);
  // console.log(orderProductions, orderProductions.length);

  console.log('starting update .... ');
  await this.asyncForEach(orderProductions , async (item) => {
    const num1 = +item.productBarcodeNoReal.substr(37, 5);
    // console.log(num1);
    const f1 = bundleNOs.filter(i=>(i.numberFrom <= num1 && i.numberTo >= num1));
    if (f1.length > 0) {

      // console.log(f1[0].bundleNo);
      result1 = await OrderProduction.updateOne(
        {$and: [
          {"companyID":companyID},
          {"orderID":orderID},
          {"productBarcodeNoReal": item.productBarcodeNoReal}, 
        ]},
        {
          "bundleNo": +f1[0].bundleNo,
  
        }); 
        // console.log('updated ' + f1[0].bundleNo);
    }
  });


  console.log('updated all complete' );
  return true;
}

// await ShareFunc.updateProductionNodeCrossStebPosition
// http://192.168.1.35:3968/api/user/test/test5_1
exports.updateProductionNodeCrossStebPosition = async (companyID, factoryID, toNode, productStatus, productionNodeArr ) => {
  console.log('updateProductionNodeCrossStebPosition');

  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"factoryID":{$in: factoryIDArr}},
      {"productStatus":{$in: productStatus}},
      // {"orderID":{$in: orderIDArr}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      productBarcodeNoReal: 1,
      // style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      // color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      // size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
      factoryID: "$productionNode.factoryID",
    }},

    { $match: { $and: [
      {"factoryID":factoryID},
      {"toNode":toNode},
      // {"factoryID":{$in: factoryIDArr}},
    ] } },
    { $project: { 
      _id: 0, 
      productBarcodeNoReal: 1,
      // productID: 1,
      // style: 1,
      // targetPlace: 1,
      // color: 1,
      // size: 1,
      // factoryID: 1,
    }},

    { $group: {			
      _id: { 
        productBarcodeNoReal: '$productBarcodeNoReal',
        // factoryID: '$factoryID',
        // productID: '$productID',
        // style: '$style',
        // targetPlace: '$targetPlace',
        // color: '$color',
        // size: '$size',
        // productID: '$productID',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      // countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ]);

  // console.log(orderProductRep, 'next ----------------------------------------------------------');

  const orderProductRepF = await orderProductRep.map(fw => ({
    productBarcodeNoReal: fw._id.productBarcodeNoReal, 
    // factoryID: fw._id.factoryID,
    // productID: fw._id.productID,
    // style: fw._id.style,
    // size: fw._id.size,
    // targetPlace: fw._id.targetPlace,
    // color: fw._id.color,
    // countQty: fw.countQty,
  }));

  const orderProductRepFF = Array.from(new Set(orderProductRepF.map((item) => item.productBarcodeNoReal)))

  // console.log(orderProductRepFF, 'next ........................................................');

  result1 = await OrderProduction.updateMany(
    {$and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatus}},
      {"productBarcodeNoReal":{$in: orderProductRepFF}}
      // {"productBarcodeNoReal":{$in: productBarcodeNos}}
      // {"productBarcodeNo":{$in: productBarcodeNos}}
    ]}, 
    {
      // {$push: {productionNode: {$each:[productionNode],  $position: 0}}},  // ## add new element at the first
      $push: {productionNode: {$each: productionNodeArr}},
      // $push: {productionNode: productionNode},
      // $push: {productionNode: {$each: productionNodeArr}},
    });
    console.log('updateProductionNode @ position nodeID update complete');

  return true;
}

// ShareFunc.updateProductionNodeForTest();
// ## http://192.168.1.50:3968/api/user/test/test5
exports.updateProductionNodeForTest = async () => {
  console.log('updateProductionNodeForTest');
  // ## add push to nodeID we need to
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const companyID = 'c000001';
  const factoryID = 'f000001';
  // 23F-BP1508   23F-YM505
  const orderIDs = [
    '23F-BP1508'
  ];
  // 1.COMPUTER-KNITTING 2.PANAL-INSPECTION 3.LINKING  4.MENDING  5.WASHING    6.PRESSING
  const productionNodeArr = [
    {
      factoryID: factoryID,
      fromNode: '1.COMPUTER-KNITTING',
      toNode: '2.PANAL-INSPECTION',
      datetime: current,
      status: 'normal',
      isOutsource: false,
      outsourceData: [],
      problemID: '',
      problemName: '',
      createBy: {userID: '', userName: ''}
    },
    {
      factoryID: factoryID,
      fromNode: '2.PANAL-INSPECTION',
      toNode: '3.LINKING',
      datetime: current,
      status: 'normal',
      isOutsource: false,
      outsourceData: [],
      problemID: '',
      problemName: '',
      createBy: {userID: '', userName: ''}
    }
  ];

  result1 = await OrderProduction.updateMany(
    {$and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"orderID":{$in: orderIDs}}
      // {"productID":productID},
      // {"productBarcodeNoReal":{$in: productBarcodeNos}}
      // {"productBarcodeNo":{$in: productBarcodeNos}}
    ]}, 
    {
      // {$push: {productionNode: {$each:[productionNode],  $position: 0}}},  // ## add new element at the first
      $push: {productionNode: {$each: productionNodeArr}},
      // $push: {productionNode: productionNode},
      // $push: {productionNode: {$each: productionNodeArr}},
    });
    console.log('updateProductionNodeForTest update complete');
    return true;
}

// ## update nested array 
exports.updateOrderProduction2 = async () => {
  const orderIDs = [
    'AA0PVA3A', 'BA1ODA3A',
    'BAI13A3A', 'BA1NIA3A',
    'AA0PKA3A', 'AA0Q1A3A',
    'BA1NWA3A', 'AA0PJA3A',
    'AA0Q6A3A', 'BA1NUA3A',
    'BA1O0A3A', 'BA1OEA3A'
  ];
  const outsourcefactoryID = [ 'f000009', 'f000004', 'f000005', 'f000006' ];
  const factoryID1 = 'f000001';
  const companyID = 'c000001';
  const order1 = await OrderProduction.updateMany(
    {$and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}}
    ]},
    { $set: { 
      "productionNode.$[pn].outsourceData.$[outs].fromFactoryID" : factoryID1, 
    }},
    {
      multi: true,
      arrayFilters: [
        {
          "pn.outsourceData": {
            $exists: true
          }
        },
        {
          // "outs.factoryID": "f000005"
          "outs.factoryID": {$in: outsourcefactoryID}
        }
      ]
    });
    // console.log(order1);
    console.log('completed');
}


exports.updateColorSetOrderProductionMuji = async () => {
  
}

exports.getOrderProduction0001 = async () => {
  const companyID = 'c000001';
  const targetPlace = 'JAPN';
  const factoryID3 = 'f000003';
  const style = 'GL-115B     ';
  const color = 'OW--------';
  const toNode = '1.COMPUTER-KNITTING';
  // const no20 = 1408;
  // const no100 = 817;
  // const no200 = 984;
  // const productBarcode = 'GL-92B      JAPN-----23OW--------F---';
  const orderProductionList = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"orderID":{$in: orderIDs}},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,	
        orderID: 1,	
        productBarcodeNo: 1,	
        productBarcodeNoReal: 1,	
        // productionNode: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode"},
    { $project: {		
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      productBarcodeNo: 1,	
      productBarcodeNoReal: 1,	
      factoryID: "$productionNode.factoryID",	
      toNode: "$productionNode.toNode",	

      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // fromNode: "$productionNode.fromNode",	
      // isOutsource: "$productionNode.isOutsource",
      // outsourceData: "$productionNode.outsourceData",
    }	},
    { $match: { $and: [
      // {"isOutsource":true},
      {"factoryID":factoryID3},
      {"targetPlace":targetPlace},
      {"style":style},
      {"color":color},
      {"toNode":toNode},
    ] } },
    { $project: {			
      _id: 1,	
      companyID: 1,	
      factoryID: 1,	
      orderID: 1,	
      productBarcodeNo: 1,	
      productBarcodeNoReal: 1,

      toNode: 1,	
      fromNode: 1,

    }	},
 
  ]);
  return orderProductionList;
}


exports.getBlankRows = async () => {

  const companyID = 'c000001';
  // const blankValue = '';

  const orderProductionList = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"orderID":{$in: orderIDs}},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,	
        orderID: 1,	
        productBarcodeNo: 1,	
        productBarcodeNoReal: 1,	
        productionNode: 1
    }	},
    { $unwind: "$productionNode"},
    { $project: {		
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      productBarcodeNo: 1,	
      productBarcodeNoReal: 1,	
      toNode: "$productionNode.toNode",	
      fromNode: "$productionNode.fromNode",	
      isOutsource: "$productionNode.isOutsource",
      outsourceData: "$productionNode.outsourceData",
    }	},
    { $match: { $and: [
      // {"isOutsource":true},
      {"toNode":blankValue},
      {"fromNode":blankValue},
    ] } },
    { $project: {			
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      productBarcodeNo: 1,	
      productBarcodeNoReal: 1,

      toNode: 1,	
      fromNode: 1,

    }	},
 
  ]);
  return orderProductionList;

}

// edit to factory when lock/pay job to knitting
exports.editOrderProductionFactory = async () => {
  const companyID = 'c000001';
  const orderIDs = ['UR37-12B004', 'UR37-12B005'];
  const fromFactoryID = 'f000001';
  const toFactoryID = 'f000003';

  // const result1 = await OrderProduction.updateMany(
  //   {$and: [
  //     {"companyID": 'c000001'},
  //     {"orderID":{$in: orderIDs}},
  //   ]},
  //   {
  //     "factoryID": toFactoryID,
  //   }); 

  //
  const result2 = await OrderProduction.updateMany(
    {$and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},
    ]},
    {
      "factoryID": toFactoryID,
      $set: { "productionNode.$[elem].factoryID" : toFactoryID}
    }, 
    {
      multi: true, 
      arrayFilters: [  {
        "elem.factoryID": fromFactoryID,
        "elem.fromNode": 'starterNode',
      } ] 
    });  

    console.log('EditOrderProductionFactory , edit to factory completed ');
    return true;
}

// setOpenOrderProduction
exports.setOpenOrderProduction = async () => {
  console.log('starting .... updating Many Open OrderProduction ');
  const companyID = 'c000001';

  const result2 = await OrderProduction.updateMany(
    {$and: [
      {"companyID":companyID}  ,
      // {"factoryID":fromFactoryID}  ,
    ]},
    {$set: { 
      "isOutsourceTracking": false
    }}, 
  );
  console.log('updateMany Open OrderProduction ok finished');
}

exports.createArrElementN= async (productBarcodeNo1, no1, no2) => {
  // console.log(productBarcodeNo1, no1, no2);
  let productBarcodeNo1Arr = [];
  for (let i = no1; i <= no2; i++) {
    // setBackStrLen= async (len, str, strBack)
    // setStrLen= async (len, num)
    const num1 = await this.setStrLen(5, i);
    productBarcodeNo1Arr.push(productBarcodeNo1 + num1);
  }
  return productBarcodeNo1Arr;
}


exports.delManyOrderProduction = async () => {
  const companyID = 'c000001';
  const orderID = 'BA1ONA4S';
  const factoryID1 = 'f000001';
  const factoryIDx = 'f000003';
  const no1 = 144;
  const no2 = 167;
  let productBarcodeNo1 = 'BA1ONA4S    UK-------23BB--------XL--';  // off white
  let productBarcodeNo1Arr = [];
  const rounds = [''];

  
  productBarcodeNo1Arr = await this.createArrElementN(productBarcodeNo1, no1, no2);
  console.log(productBarcodeNo1Arr);

  result1 = await OrderProduction.deleteMany({$and: [
    {"companyID":companyID} , 
    {"orderID":orderID} ,
    {"productBarcodeNoReal":{$in: productBarcodeNo1Arr}},
    // {"factoryID":factoryID} ,
    // {"orderID":orderID} ,
  ]}); 
  console.log('delete ok');
}

// await ShareFunc.getOrderProductionByBundleNo();
exports.getOrderProductionByBundleNo = async () => {

  const companyID = 'c000001';
  const factoryID1 = 'f000001';
  const factoryIDx = 'f000003';
  const no1 = 1;
  const no2 = 1959;
  const no10 = 1225;
  const no20 = 1408;
  const no100 = 817;
  const no200 = 984;
  let productBarcodeNo1 = 'GL-92B      JAPN-----23OW--------F---';  // off white
  let productBarcodeNo2 = 'GL-92B      JAPN-----23MG--------F---0';  // mid gray
  let productBarcodeNo3 = 'GL-92B      JAPN-----23NV--------F---00';  // navy
  // const blankValue = '';
  let productBarcodeNo1Arr = [];
  let productBarcodeNo2Arr = [];
  let productBarcodeNo3Arr = [];
  for (let i = no1; i <= no2; i++) {
    // setBackStrLen= async (len, str, strBack)
    // setStrLen= async (len, num)
    const num1 = this.setStrLen(5, i);
    productBarcodeNo1Arr.push(productBarcodeNo1 + num1);
  }
  // for (let i = no10; i <= no20; i++) {
  //   productBarcodeNo2Arr.push(productBarcodeNo2 + i);
  // }
  // for (let i = no100; i <= no200; i++) {
  //   productBarcodeNo3Arr.push(productBarcodeNo3 + i);
  // }

  const orderProductionList = await OrderProduction.updateMany(
    {$and: [
      {"companyID":companyID},
      // {"productBarcodeNo":factoryID},
      {"productBarcodeNoReal":{$in: productBarcodeNo1Arr}}
    ]},
    {
      "factoryID": factoryIDx,
      $set: { "productionNode.$[elem].factoryID" : factoryIDx}
    }, 
    {
      multi: true, 
      arrayFilters: [  {"elem.factoryID": factoryID1 } ] 
    });

  // const orderProductionList = await OrderProduction.aggregate([
  //   { $match: { $and: [
  //     {"companyID":companyID},
  //     // {"bundleNo": { $gte: bundleNo1}} , 
  //     // {"bundleNo": { $lte : bundleNo2}} ,
  //     // {"bundleNo": bundleNo2} 
  //     // {"productBarcodeNo": 'GL-92B      JAPN-----23NV--------F---00817'}
  //   ] } },
  //   { $project: {			
  //       _id: 1,	
  //       companyID: 1,	
  //       orderID: 1,	
  //       productBarcodeNo: 1,	
  //       productBarcodeNoReal: 1,	
  //       productionNode: 1
  //   }	},
  //   { $unwind: "$productionNode"},
  //   { $project: {		
  //     _id: 1,	
  //     companyID: 1,	
  //     orderID: 1,	
  //     productBarcodeNo: 1,	
  //     productBarcodeNoReal: 1,	
  //     toNode: "$productionNode.toNode",	
  //     fromNode: "$productionNode.fromNode",	
  //     isOutsource: "$productionNode.isOutsource",
  //     outsourceData: "$productionNode.outsourceData",
  //   }	},
  //   // { $match: { $and: [
  //   //   // {"isOutsource":true},
  //   //   // {"toNode":blankValue},
  //   //   // {"fromNode":blankValue},
  //   // ] } },
  //   // { $project: {			
  //   //   _id: 1,	
  //   //   companyID: 1,	
  //   //   orderID: 1,	
  //   //   productBarcodeNo: 1,	
  //   //   productBarcodeNoReal: 1,

  //   //   toNode: 1,	
  //   //   fromNode: 1,

  //   // }	},
 
  // ]);
  return true;

}

// getTestOrderProduction2
exports.getTestOrderProduction2 = async () => {
  const companyID = 'c000001';
  const orderIDs = ['AA0Q1A3A'];  // AA0Q1A3A   GL-92B
  const fromNode = '4.MENDING';  // 1.COMPUTER-KNITTING 2.PANAL-INSPECTION 3.LINKING  4.MENDING  5.WASHING    6.PRESSING
  const toNode = 'completeNode';
  const toNode2 = '5.WASHING';

  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,	
        orderID: 1,	
        // productionNode: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element

    }	},
    { $unwind: "$productionNode"},
    { $project: {			
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      productBarcodeNoReal: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      // outsourceData: "$productionNode.outsourceData",
    }	},
    { $match: { $and: [
      {"fromNode":fromNode},
      {"toNode":toNode},
    ] } },
    { $project: {			
      _id: 1,	
      companyID: 1,	
      orderID: 1,	
      productBarcodeNoReal: 1,
      style: 1,
      fromNode: 1,
      toNode: 1,
    }	},
    // { $group: {			
    //   _id: { 
    //     companyID: '$companyID',
    //     orderID: '$orderID',
    //     // outsourcefactoryID: '$outsourcefactoryID',
    //   },
    //   sumFactoryOutsQty: {$sum: 1} ,
    // }}
  
  ]);
 
  // productStatus  status
  const result1 = await OrderProduction.updateMany(
    {$and: [
      {"companyID":companyID},
      {"orderID":{$in: orderIDs}},
      // {"factoryID":factoryID},
      // {"nodeID":nodeID},
    ]},
    {$set: { 
      "productionNode.$[elem].toNode" : toNode2,
      "productionNode.$[elem].status" : 'normal',
      "productStatus": 'normal'
    }}, 
    {
      multi: true, 
      arrayFilters: [  {
        "elem.fromNode": fromNode,  
        "elem.toNode": toNode,
      } ] 
    });

  return orderProductRep;
}

exports.getTestOrderProduction1 = async () => {

  const companyID = 'c000001';
  const orderID = 'AA0Q1A3A';
  const productBarcodeM = 'AA0Q1A3A    JAPN-----23BK--------M---';
  const productBarcodeL = 'AA0Q1A3A    JAPN-----23BK--------L---';
  const number1 = '05257';  // '04525' '05257'
  const number2 = 0;

  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      // {"factoryID":{$in: factoryIDArr}},
      // {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,

        productBarcode: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.productBarcodePos, +process.env.productBarcodeDigit ] }},
        targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
        color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
        size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
        runNo: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.runningNoPos, +process.env.runningNoDigit ] }},
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: 1,  // ## 
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $match: { $and: [
      {"productBarcode":productBarcodeL},
      {"runNo": { $gte: number1}} , 
      // {"orderID":orderID},
      // {"factoryID":{$in: factoryIDArr}},
      // {"productStatus":{$in: productStatusArr}}
      // {"datetime": { $gte: dateStart}} , 
      // {"datetime": { $lte : dateEnd}} ,
    ] } },
    { $project: { 
    //   _id: 0, 
      // companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      productBarcodeNoReal: 1,

      // productBarcode: 1,
      // targetPlace: 1,
      // color: 1,
      // size: 1,
      // runNo: 1,
      // productionNode: 1,
    //   style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
    //   targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
    //   color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
    //   size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
    //   // productCount: 1,
    //   // productionDate: 1,
    //   // productStatus: 1,

    //   fromNode: "$productionNode.fromNode",
    //   toNode: "$productionNode.toNode",
    //   datetime: "$productionNode.datetime",
    //   createBy: "$productionNode.createBy",
    }},
  ]);
  

  console.log('ok 1');

  let orderProductIDArr = [];
  await this.asyncForEach(orderProductRep , async (item) => {
    orderProductIDArr.push(item.productBarcodeNoReal);
  });
  console.log(orderProductIDArr);

  console.log('ok 2');

  const delOrderProduction1 = await OrderProduction.deleteMany({$and: [
    {"companyID":companyID},
    {"orderID":orderID},
    {"productBarcodeNoReal":{$in: orderProductIDArr}}
  ]});
  console.log('ok 3 = delOrderProduction1');

  const delOrderProductionQueue = await OrderProductionQueue.updateOne(
    {$and: [
      {"companyID":companyID},
      {"orderID":orderID},
    ]}, 
    {
      $pull: { queueInfo: {                // ## delete n element for this condition
        productBarcode: productBarcodeL, 
        // isOutsource: isOutsource,

        numberFrom: { $gte: +number1},   // ## numberFrom ===>  >= numberFrom  && <= numberTo
        // numberFrom: { $lte : numberTo},

        // numberTo: { $gte: numberFrom},   // ## numberTo ===>  >= numberFrom  && <= numberTo
        // numberTo: { $lte : numberTo},

        // bundleNo: { $gte: bundleNoFrom},   // ## bundleNo ===>  >= bundleNoFrom  && <= bundleNoTo
        // bundleNo: { $lte : bundleNoTo},
        
      } }  
    });
    console.log('ok 4 = delOrderProductionQueue');


  return true;

}



// ## update manual data
// #######################################################################################################


// #######################################################################################################
// ## xlsx

// ## import language master
exports.readXLSXFileForLang = async () => {

  // ## initial langs
  let en = {
    languageID: 'en',
    languageName: 'english',
    seq: 100,
    show: true,
    languageData: [],
  };
  let th = {
    languageID: 'th',
    languageName: 'thai',
    seq: 200,
    show: true,
    languageData: [],
  };
  let cn = {
    languageID: 'cn',
    languageName: 'china',
    seq: 300,
    show: true,
    languageData: [],
  };
  let mm = {
    languageID: 'mm',
    languageName: 'myanmar',
    seq: 400,
    show: true,
    languageData: [],
  };
  let jp = {
    languageID: 'jp',
    languageName: 'japan',
    seq: 500,
    show: false,
    languageData: [],
  };


  // const xlsx = require('xlsx'); // # add line at the top
  let workbook = XLSX.readFile('lang.xlsx'); // ## file location ==> app root path
  let worksheet = workbook.Sheets[workbook.SheetNames[0]];  // ## sheet #1
  // console.log(worksheet);
  let posts = [];
  let post = {};

  for (let cell in worksheet) {
    const cellAsString = cell.toString();
    // console.log(cellAsString);
    // console.log(cellAsString[0]);
    // console.log(cellAsString[1]);

    // if (cellAsString[1] !== 'r' && cellAsString[1] !== 'm' && cellAsString[1] > 1) {
        if (cellAsString[0] === 'B') {
            post.Idno = worksheet[cell].v;
        }
        if (cellAsString[0] === 'C') {
            post.lType = worksheet[cell].v;
        }
        if (cellAsString[0] === 'D') {
          post.lID = worksheet[cell].v;
        }
        if (cellAsString[0] === 'E') {
          post.en = worksheet[cell].v;
        }
        if (cellAsString[0] === 'F') {
          post.th = worksheet[cell].v;
        }
        if (cellAsString[0] === 'G') {
          post.cn = worksheet[cell].v;
        }
        if (cellAsString[0] === 'H') {
          post.mm = worksheet[cell].v;
        }
        if (cellAsString[0] === 'I') {
          post.jp = worksheet[cell].v;
        }
        if (cellAsString[0] === 'A') {         // ## this cell have to have value , not blank
            post.endofcol = worksheet[cell].v;
            posts.push(post);
            post = {};
        }
      }
  // }
  // console.log(posts);
  // console.log('len = ',posts.length);

  await this.asyncForEach(posts , async (item) => {
    const Idno = +item.Idno?+item.Idno:0;
    const lType = item.lType;
    const lID = item.lID;
    if (item.en) { en.languageData.push({Idno, lType, lID, lText: item.en}); }
    if (item.th) { th.languageData.push({Idno, lType, lID, lText: item.th}); }
    if (item.cn) { cn.languageData.push({Idno, lType, lID, lText: item.cn}); }
    if (item.mm) { mm.languageData.push({Idno, lType, lID, lText: item.mm}); }
    if (item.jp) { jp.languageData.push({Idno, lType, lID, lText: item.jp}); }
  });

  const langs = [en, th ,cn, mm, jp];

  const delAll = await Language.deleteMany();  // ## delete all langs

  const insertAll = await Language.insertMany(langs);

  return langs;
}

// ## import yarn master data
exports.readXLSXFileForYarn = async () => {
  // const xlsx = require('xlsx'); // # add line at the top
  let workbook = XLSX.readFile('yarn.xlsx'); // ## file location ==> app root path
  let worksheet = workbook.Sheets[workbook.SheetNames[0]];  // ## sheet #1
  // console.log(worksheet);
  let posts = [];
  let post = {};

  for (let cell in worksheet) {
    const cellAsString = cell.toString();
    // console.log(cellAsString);
    // console.log(cellAsString[0]);
    // console.log(cellAsString[1]);

    // if (cellAsString[1] !== 'r' && cellAsString[1] !== 'm' && cellAsString[1] > 1) {
        if (cellAsString[0] === 'B') {   // ## Idno	lType	lID	en	th	cn	mm	jp
            post.yarnID = worksheet[cell].v;
        }
        if (cellAsString[0] === 'C') { // ## 	lType	
            post.yarnName = worksheet[cell].v;
        }
        if (cellAsString[0] === 'D') { // ## lID	
          post.yarn1 = worksheet[cell].v;
        }
        if (cellAsString[0] === 'E') { // ## en
          post.yarn2 = worksheet[cell].v;
        }
        if (cellAsString[0] === 'F') { // ## th
          post.yarn3 = worksheet[cell].v;
        }
        if (cellAsString[0] === 'G') { // ## cn
          post.yarn4 = worksheet[cell].v;
        }
        if (cellAsString[0] === 'H') { // ## mm
          post.yarn5 = worksheet[cell].v;
        }
        if (cellAsString[0] === 'I') { // ## jp
          post.yarn5 = worksheet[cell].v;
        }
        if (cellAsString[0] === 'A') {         // ## this cell have to have value , not blank / ===  'ok'
            post.endofcol = worksheet[cell].v;
            posts.push(post);
            post = {};
        }
      }
  // }
  // console.log(posts);
  // console.log('len = ',posts.length);

  return posts;

}


exports.deleteManyOrderProductionbyOrderID = async () => {
  const orderID = 'BA1OEA3A';
  const factoryID = 'f000001';
  const companyID = 'c000001';
  result1 = await OrderProduction.deleteMany({$and: [
    {"companyID":companyID} , 
    {"factoryID":factoryID} ,
    {"orderID":orderID} ,
  ]}); 
  console.log('delete ok');
}
// ## xlsx
// #######################################################################################################




// ###################################################################################################
// ## report heng test ############################################################################

// ShareFunc.getOrderProductionfilter01(companyID, factoryID, orderID, productBarcodeNo, problemName, status)
exports.getOrderProductionfilter01= async (companyID, factoryID, orderID, toNode) => {
  const OrderProduction1 = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"orderID":{$in: [orderID]}},
      // {"productBarcodeNo":productBarcodeNo},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,	
        orderID: 1,	
        factoryID: 1,	
        // productionNode: 1,
        // productBarcodeNo: 1,
        // productBarcodeNoReal: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,

        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element

        


        // productionNode: {"$slice": []   },  
    }	},
    { $project: {	
      _id: 0,	
        companyID: 1,	
        orderID: 1,	
        factoryID: 1,

        productionNode: {
          $filter: {
            input: "$productionNode",
            as: "pd",
            cond: {$and: [
              {"$$pd.toNode":toNode},
            ]},
          }
        },

        // productionNode: {"$elemMatch": { $and: [
        //   {"toNode":toNode},
        // ]}},

      }	},	



      { $group: {			
        _id: { 
          companyID: '$companyID',
          orderID: '$orderID',
          // outsourcefactoryID: '$outsourcefactoryID',
        },
        sumFactoryQty: {$sum: 1} ,
      }} 

    // { $unwind: "$productionNode"},
    // { $project: {			
    //   _id: 1,	
    //   companyID: 1,	
    //   orderID: 1,	
    //   status: "$productionNode.status",
    //   isOutsource: "$productionNode.isOutsource",
    //   outsourceData: "$productionNode.outsourceData",
    // }	},

    // { $match: { $and: [
    //   {"isOutsource":true},
    //   {"status":status},
    // ] } },
    // { $unwind: "$outsourceData"},
    // { $project: {			
    //   _id: 1,	
    //   companyID: 1,	
    //   orderID: 1,	
    //   outsourcefactoryID: "$outsourceData.factoryID",
    // }	},

    // { $group: {			
    //   _id: { 
    //     companyID: '$companyID',
    //     orderID: '$orderID',
    //     outsourcefactoryID: '$outsourcefactoryID',
    //   },
    //   sumFactoryOutsQty: {$sum: 1} ,
    // }}   
  ]);

  // console.log(OrderProduction1);
  // const orderProductFacOutQTYF = await orderProductFacOutQTY.map(fw => ({
  //   companyID: fw._id.companyID, 
  //   orderID: fw._id.orderID, 
  //   outsourcefactoryID: fw._id.outsourcefactoryID,
  //   sumFactoryOutsQty: fw.sumFactoryOutsQty,
  // }));

  return OrderProduction1;
}

// ## report heng test ############################################################################
// ###################################################################################################


// ###################################################################################################
// ## get clear data ############################################################################

exports.clrBundleStatePDF= async () => {
  const bundleStatePDF = {
    companyID: '',  // ##
    orderID: '',
    targetPlaceID: '',
    targetPlaceName: '',
    targetPlaceSeq: 0,  // ##
    color: '',
    colorName: '',
    colorSeq: 0,
    bundleNo: 0,
    size: '',
    sizeSeq: 0,
    nodeIDCurrent: '',
    completed: false,
    groupNamePDF: '',
    groupScanID2: '',
    nodeGroupScanID2: [],
    productCount: 0,
  };
  return bundleStatePDF;
}

exports.clrNodeGroupScanID2= async () => {
  const nodeGroupScanID2 = {
    nodeID: '',  // ##
    sumProductQty: 0,
    userID: '',
    groupScanID2: '',
    status: '',
  };
  return nodeGroupScanID2;
}

// ## get clear data ############################################################################
// ###################################################################################################
