
// ## share app function

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment-timezone');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");

const Session1hr = require('../models/m-session1hrs');  // check this for current login
const Session1ys = require('../models/m-session1ys');
const Session1mn = require('../models/m-session1mn');
const Session3mn = require('../models/m-session3mn');
const Session6mn = require('../models/m-session6mn');

const User = require("../models/m-user");
const UserClass = require("../models/m-userClass");
const MailSignup = require("../models/m-mailSignup");
const Company = require("../models/m-company");
const Factory = require("../models/m-factory");
const Product = require("../models/m-product");
const Order = require("../models/m-order");
const OrderProduction = require("../models/m-orderProduction");
const OrderProductionQueue = require("../models/m-orderProductionQueue");
const Yarn = require("../models/m-yarn");
const Customer = require("../models/m-customer");
const ControlApp = require("../models/m-controlApp");
const Color = require("../models/m-color");
const Size = require("../models/m-size");
const TargetPlace = require("../models/m-targetPlace");
const NodeFlow = require("../models/m-nodeFlow");
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
        seq: 1,		
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
// ## email zone ####################################################################

// ## signupSendMail  send mail
exports.signupSendMail= async (email, uuid) => {
  
  // ## test send mail ( nodemailer )
  let transporter =  nodemailer.createTransport({
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
    to: email,// ผู้รับ
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
              <a style="font-weight:bold">heng067@gmail.com</a> 
              as a recovery email for
              Google Account 
              <a style="font-weight:bold">go.garment.mail@gmail.com</a>
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
              <a style="font-weight:bold">go.garment.mail@gmail.com</a>
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
  };
  // console.log(controlApp);
  return controlApp;
}

// await ShareFunc.getControlAppClientControl();
exports.getControlAppClientControl= async () => {
  const controlAppf = await ControlApp.findOne();
  const controlApp = {
    clientControl: controlAppf.clientControl,
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
        fDescription: 1,	
        fInfo: 1,
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
  await this.asyncForEach(productIDs, async (item1) => {
    item1 = await this.setBackStrLen(process.env.productIDLen, item1, ' ');
    i++;
  });
  const productImageProfiles  = await Product.aggregate([
    { $match: { $and: [
      {"companyID":companyID} , 
      {"productID":{$in: productIDs}},
    ] } },
    { $project: { 
      _id: 0,	
      productID: 1, 
      imageProfile: 1, 
    } },
  ]);

  return productImageProfiles ? productImageProfiles : [];
}

// ## product zone ####################################################################
// #################################################################################




// #################################################################################
// ## order zone ####################################################################

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
    { $sort: { _id: -1 } }
  ]);
  // console.log(orders);
  return orders;
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
		
// ## get orders
exports.getOrders= async (companyID, page, limit) => {
  // limit = +limit; // ## change to number
  const orders = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID}
    ] } },
    { $project: {			
        _id: 1,	
        orderID: 1,
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

// ShareFunc.getOrdersCount(companyID);
exports.getOrdersCount= async (companyID, page, limit) => {
  rows = await Order.countDocuments({$and: [
    {"companyID":companyID}
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



// getLastProductionQueue
exports.getLastProductionQueue= async (companyID, orderID, productID, page, limit) => {
  // limit = +limit; // ## change to number
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const queueInfos = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":orderID},
      {"productID":productID},
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
    { $sort: { bundleNo: -1 } },
    { $skip: (page-1) *  limit},
    { $limit: limit }
  ]);

  // console.log(queueInfos);
  return queueInfos?queueInfos:[];
}

// const runningNo = await ShareFunc.getLastRunningNoOrderProduction(companyID, orderID, productID, productBarcode);
exports.getLastRunningNoOrderProduction= async (companyID, orderID, productID, productBarcode) => {
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const orderProduction = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderID":orderID},
      {"productID":productID},
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
  ]);
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
      {"productID":productID},
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
  ]);

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
      {"productID":productID},
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
      {"productID":productID},
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

exports.getTotalProductionQueued= async (companyID, orderID, productID) => {
  // limit = +limit; // ## change to number
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const totalProductionQueueByBarcode = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":orderID},
      {"productID":productID},
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
    item1 = await this.setBackStrLen(process.env.productIDLen, item1, ' ');
    i++;
  });
  // console.log(productIDArr);
  const countProductionQueueAll = await OrderProductionQueue.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"orderID":orderID},
      {"productID":{$in: productIDArr}},
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
    }	}
  ]);
  // console.log(orderProductionBundleNos);
  return orderProductionBundleNos;
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
      {"productID":productID},
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
  ]);
  // console.log(existed);
  return existed.length>0?true:false;
}

// ## order zone ####################################################################
// #################################################################################


// #################################################################################
// ## yarn zone ####################################################################

exports.getYarnsCount= async (companyID) => {
  rows = await Yarn.countDocuments({$and: [
    {"companyID":companyID}
  ]});
  return rows;
}

// ## get yarns
exports.getYarns= async (companyID) => {
  // limit = +limit; // ## change to number
  const yarns = await Yarn.aggregate([
    { $match: { $and: [
      {"companyID":companyID}
    ] } },
    { $project: {			
        _id: 0,	
        yarnID: 1,
        yarnName: 1,		
        yarnFullName: 1,	
        detail: 1,
        companyID: 1,
        seq: 1,		
    }	},
    { $sort: { seq: 1 } }
  ]);
  // console.log(yarns);
  return yarns;
}


// ## yarn zone ####################################################################
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

exports.getOrderProduct01= async (companyID, factoryID, productBarcodeNo) => {
  const orderProduct = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"productBarcodeNo":productBarcodeNo},
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
        productionNode: 1 ,  
    }	}
  ]);
  // publicIP: { $slice: [ "$superAdmin.publicIP", 0, 1] },	
  // console.log(orderProduct);
  return orderProduct.length>0?orderProduct[0]:null;
}

// await ShareFunc.getOrderProduct1(companyID, factoryID, productBarcodeNo);
exports.getOrderProduct1= async (companyID, factoryID, productBarcodeNo) => {
  const orderProduct = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"productBarcodeNo":productBarcodeNo},
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
  ]);
  // publicIP: { $slice: [ "$superAdmin.publicIP", 0, 1] },	
  // console.log(orderProduct);
  return orderProduct.length>0?orderProduct[0]:null;
}

exports.getOrderProductByOrderID1= async (companyID, factoryID, orderID, productID, productBarcodeNo) => {
  productID = await this.setBackStrLen(process.env.productIDLen, productID, ' ');
  const orderProduct = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"orderID":orderID},
      {"productID":productID},
      {"productBarcodeNo":productBarcodeNo},
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
  ]);
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
      {$expr: {
        $eq: [{ $substr: ["$productBarcodeNoReal", 0, 37] }, productBarcode]
      }}
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
  ]);
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
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
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
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
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
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);



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
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
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
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
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
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);
  // console.log(currentProductAllDetailCFN);
  // return orderProductRep.length>0?orderProduct[0]:null;
  return currentProductAllDetailCFN;
}

exports.getCountCFNCurrentProductAllDetailPL = async (companyID, factoryID, nodeID, productStatusArr) => {
  // console.log('getRepCFNCurrentProductQty');
  const countCurrentProductAllDetailCFN = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
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
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);
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
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
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
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
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
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);
  // console.log(currentProductAllDetailCFNPL);
  // return orderProductRep.length>0?orderProduct[0]:null;
  return currentProductAllDetailCFN;
}

// getCFNCurrentProductStyleQRCode(companyID, factoryID, nodeID, style, productStatusArr, page, limit);
exports.getCFNCurrentProductStyleQRCode = async (companyID, factoryID, nodeID, style, productStatusArr, page, limit) => {
  // console.log('getRepCFNCurrentProductQty');
  const currentProductStyleQRCodeCFN = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"productID":style},
      {"productStatus":{$in: productStatusArr}}
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
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
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
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);
  // console.log(currentProductStyleQRCodeCFN);
  // return orderProductRep.length>0?orderProduct[0]:null;
  return currentProductStyleQRCodeCFN;
}

// await ShareFunc.getCFNCurrentProductStyleZoneSizeColorQRCode(companyID, factoryID, nodeID, style, zone, size, color, productStatusArr, page, limit);
exports.getCFNCurrentProductStyleZoneSizeColorQRCode = async (companyID, factoryID, nodeID, style, zone, size, color, productStatusArr, page, limit) => {
  // console.log('getRepCFNCurrentProductQty');
  const currentProductStyleQRCodeCFN = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"productID":style},
      {"productStatus":{$in: productStatusArr}}
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
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
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
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      yarnLot: 1,
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);
  // console.log(currentProductStyleQRCodeCFN);
  // return orderProductRep.length>0?orderProduct[0]:null;
  return currentProductStyleQRCodeCFN;
}  

exports.getRepCFNCurrentProductQty = async (companyID, factoryID, nodeID, productStatusArr) => {
  // console.log('getRepCFNCurrentProductQty');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        yarnLot: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      yarnLot: 1,
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      status: "$productionNode.status",
      productProblemID: "$productionNode.productProblemID",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      productBarcodeNoReserve: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      yarnLot: 1,

      fromNode: 1,
      toNode: 1,
      status: 1,
      toNode: 1,
      productProblemID: 1,
      createBy: 1,
    }},
  ]);



  // console.log(orderProductRep);
  // return orderProductRep.length>0?orderProduct[0]:null;
  return orderProductRep;
}

// ShareFunc.getProductionPeriodC(companyID, productStatusArr, productionNodeStatusArr)
exports.getProductionPeriodC = async (companyID, productStatusArr, productionNodeStatusArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  // console.log(companyID, productStatusArr, productionNodeStatusArr);
  const productionPeriod = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
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
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
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
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
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
  ]);

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

exports.getProductionZonePeriodC = async (companyID, productStatusArr, productionNodeStatusArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  // console.log(companyID, productStatusArr, productionNodeStatusArr);
  const productionPeriod = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
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
      // bundleNo: 1,
      // productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
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
      // bundleNo: 1,
      // productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
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
        targetPlaceID: '$targetPlaceID',
        targetPlaceName: '$targetPlaceName',
        style: '$style',
        color: '$color',
        size: '$size',
        fromNode: '$fromNode',
    },
      sumProductQty: {$sum: 1} ,
    }}  
  ]);

  // console.log(productionPeriod);
  const productionPeriodM = await productionPeriod.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID,
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

// await ShareFunc.getRepCFNCurrentProductQtyByOrderID(companyID, factoryID, nodeID, productStatusArr);
exports.getRepCFNCurrentProductQtyByOrderID = async (companyID, factoryID, nodeID, productStatusArr) => {
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
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
      factoryID: 1,		
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
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
  ]);

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
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
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
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
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
  ]);

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
      {"factoryID":factoryID},
      {"productStatus":{$in: productProbelmStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
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
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);

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
  const currentProductStyleCount = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"productID":style},
      {"productStatus":{$in: productProbelmStatusArr}}
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
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);

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
  const currentProductStyleCount = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
      {"productID":style},
      {"productStatus":{$in: productProbelmStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
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
      factoryID: 1,		
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
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);

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
      {"factoryID":factoryID},
      {"productStatus":{$in: productProbelmStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
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
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);

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
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
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
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      productID: 1,
      // productBarcodeNo: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);

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
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
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
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
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
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);
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
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
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
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
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
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
        // bundleNo: '$bundleNo',
        // mode: '$mode',
    },
      // countOrder: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ]);
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
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
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
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      productBarcodeNo: 1,
      productBarcodeNoReal: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);
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
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
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
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);
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
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
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
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);
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
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
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
      factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);
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
      {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
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
      factoryID: 1,		
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
      fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      datetime: "$productionNode.datetime",
      createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
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
  ]);
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

exports.getCompanyCurrentProductQtyAll = async (companyID, factoryIDArr, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const companyCurrentProductQtyAll = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"factoryID":{$in: factoryIDArr}},
      {"productStatus":{$in: productStatusArr}}
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
  ]);
  // console.log(companyCurrentProductQtyAll);

  const companyCurrentProductQtyAllF = await companyCurrentProductQtyAll.map(fw => ({
    companyID: fw._id.companyID, 
    orderID: fw._id.orderID,
    productID: fw._id.productID,
    style: fw._id.style,
    countQty: fw.countQty,
  }));
  // console.log(companyCurrentProductQtyAllF);
  return companyCurrentProductQtyAllF;
}

// ShareFunc.getCCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr);
exports.getCCurrentProductQtyAll = async (companyID, factoryIDArr, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"factoryID":{$in: factoryIDArr}},
      {"productStatus":{$in: productStatusArr}}
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
  ]);
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

exports.getCCurrentProductQtyAllByStyleC = async (companyID, style, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"productID":style},
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
  ]);
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

exports.getCurrentProductQtyAllCFNode = async (companyID, factoryIDArr, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductCFNodeRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"factoryID":{$in: factoryIDArr}},
      {"productStatus":{$in: productStatusArr}}
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
      toNode: "$productionNode.toNode",
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
  ]);
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

exports.getComCurrentProductQtyZoneAll = async (companyID, factoryIDArr, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const currentCompanyProductQtyAll = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"factoryID":{$in: factoryIDArr}},
      {"productStatus":{$in: productStatusArr}}
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
    }},
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
  ]);
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
exports.getComCurrentProductQtyCountryCSAll = async (companyID, factoryIDArr, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const currentCompanyProductQtyCountryAll = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"factoryID":{$in: factoryIDArr}},
      {"productStatus":{$in: productStatusArr}}
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
  ]);
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

exports.getComCurrentProductQtyCountryAll = async (companyID, factoryIDArr, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const currentCompanyProductQtyCountryAll = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"factoryID":{$in: factoryIDArr}},
      {"productStatus":{$in: productStatusArr}}
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
  ]);
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
exports.getCFCurrentProductQtyAll = async (companyID, factoryIDArr, productStatusArr) => {
  // ## CFN = /:companyID/:factoryID/:nodeID
  // console.log('getRepCFNCurrentProductQtyByOrderID');
  const orderProductRep = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"factoryID":{$in: factoryIDArr}},
      {"productStatus":{$in: productStatusArr}}
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        factoryID: 1,		
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
      factoryID: 1,		
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
  ]);
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

// ShareFunc.getCurrentCompanyOrderSpec(companyID, orderStatusArr);
exports.getCurrentCompanyOrderSpec= async (companyID, orderStatusArr) => {
  // console.log(+process.env.stylePos, +process.env.styleDigit);
  // ## get group style color size
  const orderStyleColorSizef = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderStatus":{$in: orderStatusArr}}
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
exports.getCurrentCompanyOrderCountryStyle= async (companyID, orderStatusArr) => {
  // ##
  const currentCompanyOrderCountryStylef = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderStatus":{$in: orderStatusArr}}
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
exports.getCurrentCompanyOrderZoneStyle= async (companyID, orderStatusArr) => {
  // ##
  const currentCompanyOrderZoneStylef = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderStatus":{$in: orderStatusArr}}
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
exports.getCurrentCompanyOrderZone= async (companyID, orderStatusArr) => {
  // ##
  const currentCompanyOrderZonef = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderStatus":{$in: orderStatusArr}}
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
exports.getCurrentCompanyOrderByStyle= async (companyID, style, orderStatusArr) => {
  // ##
  const currentCompanyOrderf = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderStatus":{$in: orderStatusArr}}
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
exports.getCurrentCompanyOrder= async (companyID, orderStatusArr) => {
  // ##
  const currentCompanyOrderf = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderStatus":{$in: orderStatusArr}}
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

exports.getCurrentCompanyOrderStyleSize= async (companyID, orderStatusArr) => {
  // ##
  const currentCompanyOrderStyleSizef = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"orderStatus":{$in: orderStatusArr}}
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
exports.getCurrentCompanyOrderStyle= async (companyID, orderStatusArr) => {
  // ##
  const currentCompanyOrderf = await Order.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
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
  ]);
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

// ## pdate manual data
// #######################################################################################################