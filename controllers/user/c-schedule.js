const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');

const io = require('../../socket');

const ShareFunc = require("../c-api-app-share-function");

const User = require("../../models/m-user");
const MailSignup = require("../../models/m-mailSignup");
const Factory = require("../../models/m-factory");
const Customer = require("../../models/m-customer");

const Schedule = require("../../models/m-schedule");
const Dtproductionzoneperiodc = require("../../models/m-dt-productionzoneperiodc");
const Dtcurrentcfactoryorder = require("../../models/m-dt-currentcfactoryorder");
const Dtcurrentproductqtyall = require("../../models/m-dt-currentproductqtyall");
const Dtorderoutsourcefac = require("../../models/m-dt-currentcompanyorderoutsourcefac");
const Dtcompanyorderoutsource = require("../../models/m-dt-companyorderoutsource");



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
// ## main scheduler #################################

const intervalSecond = 60;   //check every 60 second
const intervalMinute01 = 0.1;   //check every 6 second
const intervalMinute05 = 0.5;   //check every 30 second
const intervalMinute1 = 1;   //check every 1 mn
const intervalMinute5 = 5;   //check every 5 mn
const intervalMinute10 = 10;   //check every 10 mn
const intervalMinute15 = 15;   //check every 15 mn
const intervalMinute30 = 30;   //check every 30 mn
const intervalMinute60 = 60;   //check every 60 mn


// let i = 0;

// const time1Group = scheduleData.filter(i=>i.sMode === '1');
// const everyDayGroup = scheduleData.filter(i=>i.sMode === 'everyDay');
// const everyHourGroup = scheduleData.filter(i=>i.sMode === 'everyHour');
// const every30mnGroup = scheduleData.filter(i=>i.sMode === 'every30mn');
// const every15mnGroup = scheduleData.filter(i=>i.sMode === 'every15mn');

// ## 1 minutes for loop check
let isQuery_time1Group = false;
let isQuery_everyDayGroup = false;
let isQuery_everyHourGroup = false;
let isQuery_every30mnGroup = false;
let isQuery_every15mnGroup = false;
setInterval(async() => {
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  if (!isQuery_time1Group  && !isQuery_everyDayGroup && !isQuery_everyHourGroup && !isQuery_every30mnGroup && !isQuery_every15mnGroup) { 
    // ## real server database // ## from file config2.env
    // console.log(process.env.PRODUCTION === 'false', process.env.PRODUCTION);
    if (process.env.PRODUCTION === 'true') { 
      await this.getSchedule(); 
    }
  }
},1000*intervalSecond*intervalMinute1); // intervalSecond*intervalMinute1

// console.log(process.env.PRODUCTION === 'false', process.env.PRODUCTION);

// ## main scheduler #################################
// #######################################################################################################


// #######################################################################################################
// ## schedule

// exports.checkTimeMN = async () => {

//   return false;
// }

exports.updateScheduleDataSState = async (scheduleData, sState) => {
  const result1 = await updateScheduleDataSState(scheduleData, sState);
}

// exports.updateScheduleDataSState = async (scheduleData, sState) => {
async function updateScheduleDataSState(scheduleData, sState) {
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const seasonYear = scheduleData.seasonYear;
  // const seasonYearArr = [scheduleData.seasonYear];
  const companyID = scheduleData.companyID;
  const factoryID = scheduleData.factoryID;
  const sGroup = scheduleData.sGroup;
  const sStatus = scheduleData.sStatus;
  const sName = scheduleData.sName;
  const sMode = scheduleData.sMode;
  const sDatetimeDiff = scheduleData.sDatetimeDiff;
  const sNote = scheduleData.sNote;

  const scheduleUpsert = await Schedule.updateOne({$and: [
    {"seasonYear":seasonYear},
    {"companyID":companyID},
    // {"factoryID":factoryID}, 
    {"sGroup":sGroup}, 
    // {"sStatus":sStatus}, 
    {"sName":sName}, 
    {"sNote":sNote},
    {"sMode":sMode}, 
    {"sDatetimeDiff":sDatetimeDiff}, 
    // {"sDatetime":scheduleData.sDatetime}, 
  ]} , 
  {
    "lastDatetime": current,
    "sState": sState,
  }, {upsert: true}); 
  return true;
}

// ## clear all sState = 'normal' in case minutes total over 
async function clearSStateToNormal(scheduleData) {
  const seasonYear = scheduleData.seasonYear;
  // const seasonYearArr = [scheduleData.seasonYear];
  const companyID = scheduleData.companyID;
  // const factoryID = scheduleData.factoryID;
  const sGroup = scheduleData.sGroup;
  const sStatus = scheduleData.sStatus;
  const sName = scheduleData.sName;
  const sMode = scheduleData.sMode;
  const sDatetimeDiff = scheduleData.sDatetimeDiff;
  const sNote = scheduleData.sNote;
  // const mm = +scheduleData.sDatetime[0].mm;
  // const lastDatetime = current;

  // ## clear all sState = 'normal' in case minutes total over 
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  // const hour1Daymn = 1440; // minute
  const hour3mn = 180; // minute
  const hour2mn = 120; // minute
  const hour1_30mn = 90; // minute

  const lastDatetime1 = new Date(moment(scheduleData.lastDatetime).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const dateDiff3 = moment(current).diff(moment(lastDatetime1), 'minutes');

  if (dateDiff3 > hour1_30mn && sStatus !== 'normal') {
    // ## update  Schedule>  lastDatetime
    const scheduleUpsert = await Schedule.updateOne({$and: [
      {"seasonYear":seasonYear},
      {"companyID":companyID},
      // {"factoryID":factoryID}, 
      {"sGroup":sGroup}, 
      // {"sStatus":sStatus}, 
      {"sName":sName}, 
      {"sNote":sNote},
      {"sMode":sMode}, 
      {"sDatetimeDiff":sDatetimeDiff}, 
      // {"sDatetime":scheduleData.sDatetime}, 
    ]} , 
    {
      // "lastDatetime": current,
      "sState": "normal",
      // "sDatetime": scheduleData.sDatetime,
    }, {upsert: true}); 
  }
  return true;
}

exports.getSchedule = async () => {
// async function getSchedule() {
// async function getSchedule() {

  // i = i+1;
  // console.log(i);

  // ## mn everyDay=1440 , everyHour=60 , every15mn=15 , every30mn= 30
  const date1 = '2024/05/29';
  const time1 = '13:59:59';
  const datetime = new Date(moment().tz('Asia/Bangkok').format(date1+' ' +time1+ '+07:00'));
  const mm1 = datetime.getMinutes();

  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const mm2 = current.getMinutes();

  // const dateStart = new Date(moment(date12Arr[0]).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+07:00'));
  // const dateEnd = new Date(moment(date12Arr[1]).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));

  // const dateDiff = moment(current).diff(moment(datetime), 'days');
  // const dateDiff2 = moment(current).diff(moment(datetime), 'hours');
  // const dateDiff3 = moment(current).diff(moment(datetime), 'minutes');
  // type Base = (
  //   "year" | "years" | "y" |
  //   "month" | "months" | "M" |
  //   "week" | "weeks" | "w" |
  //   "day" | "days" | "d" |
  //   "hour" | "hours" | "h" |
  //   "minute" | "minutes" | "m" |
  //   "second" | "seconds" | "s" |
  //   "millisecond" | "milliseconds" | "ms"
  // );


  // console.log('date time = ' , datetime, mm1);
  // console.log('now = ' , current, mm2);
  // console.log('dateDiff = ' , dateDiff, dateDiff2, dateDiff3);


  // // ## get data from schedule
  const scheduleData = await ShareFunc.getScheduleData();
  // console.log(scheduleData);
  // console.log('------------------------------------scheduleData----------------------------------------------');
  // console.log(scheduleData, scheduleData[0].sDatetime);

  
  //   let isQuery_time1Group = false;
  // let isQuery_everyDayGroup = false;
  // let isQuery_everyHourGroup = false;
  // let isQuery_every30mnGroup = false;
  // let isQuery_every15mnGroup = false;

  // if ((scheduleData.length > 0 && i <= 1) || i == 21) {
  if ( scheduleData.length > 0 ) {
    const time1Group = scheduleData.filter(i=>i.sMode === '1');
    const everyDayGroup = scheduleData.filter(i=>i.sMode === 'everyDay');
    const everyHourGroup = scheduleData.filter(i=>i.sMode === 'everyHour');
    const every30mnGroup = scheduleData.filter(i=>i.sMode === 'every30mn');
    const every15mnGroup = scheduleData.filter(i=>i.sMode === 'every15mn');

    if (time1Group.length > 0) {
      isQuery_time1Group = true;
      // console.log('time1Group');
      isQuery_time1Group = false;
    }

    if (everyDayGroup.length > 0) {
      isQuery_everyDayGroup = true;
      isQuery_everyDayGroup = false;
      // console.log('everyDayGroup');
    }

    if (everyHourGroup.length > 0) {
      // console.log('everyHourGroup');
      isQuery_everyHourGroup = true;
      await this.asyncForEach(everyHourGroup, async (item1) => {
        await clearSStateToNormal(item1); // ## clear all sState = 'normal' in case minutes total over 
        await getDataTempEveryHour(item1);
      });
      isQuery_everyHourGroup = false;
    }

    if (every30mnGroup.length > 0) {
      // console.log('every30mnGroup');
      isQuery_every30mnGroup = true;
      await this.asyncForEach(every30mnGroup, async (item1) => {
        await clearSStateToNormal(item1); // ## clear all sState = 'normal' in case minutes total over 
        await getDataTempEvery30mn(item1);
      });
      isQuery_every30mnGroup = false;
    }

    if (every15mnGroup.length > 0) {
      // console.log('every15mnGroup');
      isQuery_every15mnGroup = true;
      // await this.asyncForEach(every15mnGroup, async (item1) => {
      //   await clearSStateToNormal(item1); // ## clear all sState = 'normal' in case minutes total over 
      // });
      isQuery_every15mnGroup = false;
    }

    // const current2 = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    // console.log('finished loop update report ' , current2);
    // console.log('---------------------------------------------------------------');
  }
  return true;
}

async function getDataTempEvery30mn(scheduleData) {
  // ## report no.35 send out and receive report
  if (scheduleData.sState === 'normal') {
    if (scheduleData.sName === 'auto_getCurrentCompanyOrderOutsourceFac') {// ## report no.35
      
      await auto_getCurrentCompanyOrderOutsourceFac(scheduleData);
      // return true;
    } else if (scheduleData.sName === 'auto_getCompanyOrderOutsource') {// ## report no.31 overall
      
      await auto_getCompanyOrderOutsource(scheduleData);
      // return true;
    } else {
      // return true;
    }
  }
  // return true;
}

async function auto_getCompanyOrderOutsource(scheduleData) {
  // console.log('scheduleData' , scheduleData);
  // console.log('auto_getCompanyOrderOutsource' , ' every 30 mn');
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const mm1 = current.getMinutes();

  const seasonYear = scheduleData.seasonYear;
  const seasonYearArr = [scheduleData.seasonYear];
  const companyID = scheduleData.companyID;
  const factoryID = scheduleData.factoryID;
  const sGroup = scheduleData.sGroup;
  const sStatus = scheduleData.sStatus;
  const sName = scheduleData.sName;
  const sMode = scheduleData.sMode;
  const sDatetimeDiff = scheduleData.sDatetimeDiff;
  const sNote = scheduleData.sNote;
  const mm = +scheduleData.sDatetime[0].mm;
  const lastDatetime = current;
  // console.log(companyID, seasonYear);

  // ## check period for >= sDatetimeDiff
  // const sDatetimeDiff = scheduleData.sDatetimeDiff;
  const lastDatetime1 = new Date(moment(scheduleData.lastDatetime).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const mm2 = lastDatetime.getMinutes();

  const dateDiff = moment(current).diff(moment(lastDatetime1), 'days');
  const dateDiff2 = moment(current).diff(moment(lastDatetime1), 'hours');
  const dateDiff3 = moment(current).diff(moment(lastDatetime1), 'minutes');

  try {

    // console.log('timing ',  mm1 , mm);
    let isTimeing = false;
    const sDatetimeF = scheduleData.sDatetime.filter(i=> +i.mm === +mm1);
    if (sDatetimeF.length > 0) { isTimeing = true; }
    
    if (dateDiff3 >= sDatetimeDiff  || isTimeing) {
      // console.log('[ ..  *** dateDiff3 = ', dateDiff3 +  ' / sDatetimeDiff = ', sDatetimeDiff + ' / isTimeing = ' + isTimeing+ ' mn = '+mm1);
      // console.log(scheduleData.seasonYear+' '+' 30mn  '  + scheduleData.sName);

      // ## update state to running
      const result1 = await updateScheduleDataSState(scheduleData, 'running');
      // console.log('auto_getCompanyOrderOutsource update running    +++++++++++++++++++++++');

      // ## get orderIDs
      const orders = await ShareFunc.getOrdersBySeasonYear(companyID, seasonYear);
      const orderIDArr = Array.from(new Set(orders.map((item) => item.orderID)));
      // console.log(orderIDArr);

      const orderProductFacOuts = await ShareFunc.getCurrentCompanyOrderOutsource(companyID, orderIDArr);

      const orderProductFacOutQTY = await ShareFunc.getCurrentCompanyOrderOutsourceQTY(companyID, orderIDArr);

      const orderProductFacOutRemainQTY = await ShareFunc.getCurrentCompanyOrderOutsourceRemianQTY(companyID, orderIDArr);

      const orderProductFacOutStyleColorSizeQTY = await ShareFunc.getCurrentCompanyOrderStyleColorSizeOutsourceQTY(companyID, orderIDArr);
    
      const orderProductFacOutStyleColorSizeRemainQTY = await ShareFunc.getCurrentCompanyOrderStyleColorSizeOutsourceRemainQTY(companyID, orderIDArr);
    
      // ## update  Schedule>  lastDatetime
      const scheduleUpsert = await Schedule.updateOne({$and: [
        {"seasonYear":seasonYear},
        {"companyID":companyID},
        {"factoryID":factoryID}, 
        {"sGroup":sGroup}, 
        {"sStatus":sStatus}, 
        {"sName":sName}, 
        {"sNote":sNote},
        {"sMode":sMode}, 
        {"sDatetimeDiff":sDatetimeDiff}, 
        // {"sDatetime":scheduleData.sDatetime}, 
      ]} , 
      {
        "lastDatetime": current,
        "sState": "normal",
        "sDatetime": scheduleData.sDatetime,
      }, {upsert: true}); 
      // console.log(scheduleUpsert);

      // ## update ProductionZonePeriodC > lastDatetime, data
      const dtorderoutsourcefacUpsert  = await Dtcompanyorderoutsource.updateOne({$and: [
        {"seasonYear":seasonYear},
        {"companyID":companyID},
        {"factoryID":factoryID}, 
        {"sGroup":sGroup}, 
        // {"sStatus":sStatus}, 
        {"sName":sName}, 
        {"sNote":sNote},
        {"sMode":sMode}, 
        {"sDatetimeDiff":sDatetimeDiff}, 
        // {"sDatetime":scheduleData.sDatetime}, 
      ]} , 
      {
        "lastDatetime": current,
        "data1": orderProductFacOuts,
        "data2": orderProductFacOutQTY,
        "data3": orderProductFacOutRemainQTY,
        "data4": orderProductFacOutStyleColorSizeQTY,
        "data5": orderProductFacOutStyleColorSizeRemainQTY,
      }, {upsert: true}); 
      // console.log(dtorderoutsourcefacUpsert);

      // // console.error(mm1,'updated auto_getCompanyOrderOutsource');
      // const current2 = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
      // console.log(scheduleData.seasonYear+' '+' EveryHour ' + scheduleData.sName +' / '+ current2+'done! ........]');
    }
    return true;
  } catch (err) {
    console.error(err);
  }
}

async function auto_getCurrentCompanyOrderOutsourceFac(scheduleData) {
  // console.log('scheduleData' , scheduleData);
  // console.log('auto_getCurrentCompanyOrderOutsourceFac' , ' every 30 mn');
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const mm1 = current.getMinutes();

  const seasonYear = scheduleData.seasonYear;
  const seasonYearArr = [scheduleData.seasonYear];
  const companyID = scheduleData.companyID;
  const factoryID = scheduleData.factoryID;
  const sGroup = scheduleData.sGroup;
  const sStatus = scheduleData.sStatus;
  const sName = scheduleData.sName;
  const sMode = scheduleData.sMode;
  const sDatetimeDiff = scheduleData.sDatetimeDiff;
  const sNote = scheduleData.sNote;
  const mm = +scheduleData.sDatetime[0].mm;
  const lastDatetime = current;
  // console.log(companyID, seasonYear);

  // ## check period for >= sDatetimeDiff
  // const sDatetimeDiff = scheduleData.sDatetimeDiff;
  const lastDatetime1 = new Date(moment(scheduleData.lastDatetime).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const mm2 = lastDatetime.getMinutes();

  const dateDiff = moment(current).diff(moment(lastDatetime1), 'days');
  const dateDiff2 = moment(current).diff(moment(lastDatetime1), 'hours');
  const dateDiff3 = moment(current).diff(moment(lastDatetime1), 'minutes');

  try {
    
    // console.log('fac timing ',  mm1 , mm);
    let dataOutsState = [];
    let isTimeing = false;
    const sDatetimeF = scheduleData.sDatetime.filter(i=> +i.mm === +mm1);
    // console.log('sDatetimeF.length ',  sDatetimeF.length);
    if (sDatetimeF.length > 0) { isTimeing = true; }
    
    if (dateDiff3 >= sDatetimeDiff  || isTimeing) {
      // console.log('[ .. *** dateDiff3 = ', dateDiff3 +  ' / sDatetimeDiff = ', sDatetimeDiff + ' / isTimeing = ' + isTimeing+ ' mn = '+mm1);
      // console.log(scheduleData.seasonYear+' '+' 30mn ' + scheduleData.sName);

      // ## update state to running
      const result1 = await updateScheduleDataSState(scheduleData, 'running');
      // console.log('auto_getCurrentCompanyOrderOutsourceFac update running    +++++++++++++++++++++++');

      // ## get orderIDs
      const orders = await ShareFunc.getOrdersBySeasonYear(companyID, seasonYear);
      const orderIDArr = Array.from(new Set(orders.map((item) => item.orderID)));
      // console.log(orderIDArr);
      
      const isOutsource = true;
      const status = ['outsource', 'normal'];
      const sTypeOtus1 = 'b'; // ## bundle mode
      const sTypeOtusExist1 = false;
      // ## get outsource factory sent out & factory receive
      // getCurrentCompanyOrderOutsourceFac= async (companyID, orderIDs, isOutsource, status, sTypeOtus, sTypeOtusExist)

      // console.log('1111 ');
      const orderProduct = await ShareFunc.getCurrentCompanyOrderOutsourceFac(companyID, orderIDArr, isOutsource, status, sTypeOtus1, sTypeOtusExist1);
      // console.log('2222 ');
      const sTypeOtus2 = '1'; // ## 1 = 1 by 1
      const sTypeOtusExist2 = true;
      const orderProduct1BY1 = await ShareFunc.getCurrentCompanyOrderOutsourceFac1BY1(companyID, orderIDArr, isOutsource, status, sTypeOtus2, sTypeOtusExist2);
      // console.log('3333 ');
      const dataOutsState = await repCurrentCompanyOrderOutsourceFac_Transform(orderProduct, orderProduct1BY1, companyID, seasonYear);
      // console.log('44444 ');
      const repCurrentCompanyOrderOutsourceFac = 
        await repCurrentCompanyOrderOutsourceFac_Transform(orderProduct, orderProduct1BY1, companyID, seasonYear);
        // console.log('xxxxx ');
      
      // ## update  Schedule>  lastDatetime
      const scheduleUpsert = await Schedule.updateOne({$and: [
        {"seasonYear":seasonYear},
        {"companyID":companyID},
        {"factoryID":factoryID}, 
        {"sGroup":sGroup}, 
        {"sStatus":sStatus}, 
        {"sName":sName}, 
        {"sNote":sNote},
        {"sMode":sMode}, 
        {"sDatetimeDiff":sDatetimeDiff}, 
        // {"sDatetime":scheduleData.sDatetime}, 
      ]} , 
      {
        "lastDatetime": current,
        "sState": "normal",
        "sDatetime": scheduleData.sDatetime,
      }, {upsert: true}); 
      // console.log(scheduleUpsert);
      // console.log('yyyyyy ');

      // ## update ProductionZonePeriodC > lastDatetime, data
      const dtorderoutsourcefacUpsert  = await Dtorderoutsourcefac.updateOne({$and: [
        {"seasonYear":seasonYear},
        {"companyID":companyID},
        {"factoryID":factoryID}, 
        {"sGroup":sGroup}, 
        // {"sStatus":sStatus}, 
        {"sName":sName}, 
        {"sNote":sNote},
        {"sMode":sMode}, 
        {"sDatetimeDiff":sDatetimeDiff}, 
        // {"sDatetime":scheduleData.sDatetime}, 
      ]} , 
      {
        "lastDatetime": current,
        // "data": orderProduct,
        "data": dataOutsState,
      }, {upsert: true}); 
      // console.log(dtorderoutsourcefacUpsert);
      // console.log('zzzzzz ');

      // // console.error(mm1,'updated auto_getCurrentCompanyOrderOutsourceFac');
      // const current2 = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
      // console.log(scheduleData.seasonYear+' '+' EveryHour ' + scheduleData.sName +' / '+ current2+'done! ......... ]');
    }
    return true;
  } catch (err) {
    console.error(err);
  }
}

async function getDataTempEveryHour(scheduleData) {

  if (scheduleData.sState === 'normal') {
    if (scheduleData.sName === 'auto_getProductionZonePeriodC') {// ## report no.21
      
      await auto_getProductionZonePeriodC(scheduleData);
      // return true;
    } else if (scheduleData.sName === 'auto_getCurrentCFactoryOrder') {// ## report no.1
      
      await auto_getCurrentCFactoryOrder(scheduleData);
      // return true;
    } else if (scheduleData.sName === 'auto_getCompanyCurrentProductQtyAll_No_C') {// ## report no.1 / noComplete
      
      await auto_getCompanyCurrentProductQtyAll(scheduleData);
      // return true;
    } else if (scheduleData.sName === 'auto_getCompanyCurrentProductQtyAll_C') {// ## report no.1 /completed
      
      await auto_getCompanyCurrentProductQtyAll(scheduleData);
      // return true;
    } else {
      // return true;
    }
  }
  // return true;
}



// ## auto getRepCurrentProductionZonePeriod
// ## if (scheduleData.sName === 'auto_getProductionZonePeriodC') {// ## report no.21
async function auto_getProductionZonePeriodC(scheduleData) {
  // console.log('scheduleData' , scheduleData);
  // console.log('auto_getProductionZonePeriodC' , ' every 1 hr');
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const mm1 = current.getMinutes();

  const seasonYear = scheduleData.seasonYear;
  const seasonYearArr = [scheduleData.seasonYear];
  const companyID = scheduleData.companyID;
  const factoryID = scheduleData.factoryID;
  const sGroup = scheduleData.sGroup;
  const sStatus = scheduleData.sStatus;
  const sName = scheduleData.sName;
  const sMode = scheduleData.sMode;
  const sDatetimeDiff = scheduleData.sDatetimeDiff;
  const sNote = scheduleData.sNote;
  const mm = +scheduleData.sDatetime[0].mm;
  const lastDatetime = current;
  // console.log(companyID, orderStatus, seasonYearArr);

  // ## check period for >= sDatetimeDiff
  // const sDatetimeDiff = scheduleData.sDatetimeDiff;
  const lastDatetime1 = new Date(moment(scheduleData.lastDatetime).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const mm2 = lastDatetime.getMinutes();

  const dateDiff = moment(current).diff(moment(lastDatetime1), 'days');
  const dateDiff2 = moment(current).diff(moment(lastDatetime1), 'hours');
  const dateDiff3 = moment(current).diff(moment(lastDatetime1), 'minutes');

  // console.log('lastDatetime1 = ' , lastDatetime1, mm2);
  // console.log('now = ' , current, mm);
  // console.log('dateDiff = ' , dateDiff, dateDiff2, dateDiff3);
  try {
    
    let isTimeing = false;
    const sDatetimeF = scheduleData.sDatetime.filter(i=> +i.mm === +mm1);
    if (sDatetimeF.length > 0) { isTimeing = true; }
    
    if (dateDiff3 >= sDatetimeDiff  || isTimeing) {
      // console.log('[ .. *** dateDiff3 = ', dateDiff3 +  ' / sDatetimeDiff = ', sDatetimeDiff + ' / isTimeing = ' + isTimeing+ ' mn = '+mm1);
      // console.log(scheduleData.seasonYear+' '+' EveryHour ' + scheduleData.sName);

      // ## update state to running
      const result1 = await updateScheduleDataSState(scheduleData, 'running');
      // console.log('auto_getProductionZonePeriodC update running    +++++++++++++++++++++++');

      // console.log('currentProductionZonePeriod start ');
      // ##  getRepCurrentProductionZonePeriod
      // ## get season for report  // 2024AW  2024SS

      
      // getOrderIDsBySeasonYear= async (companyID, orderStatus, seasonYearArr)
      const orderStatus = ['open'];
      // console.log(companyID, orderStatus, seasonYearArr);
      const orderIDs1 = await ShareFunc.getOrderIDsBySeasonYear(companyID, orderStatus, seasonYearArr);
      const orderIDs = Array.from(new Set(orderIDs1.map((item) => item.orderID)));
      // console.log('orderIDs = ' , orderIDs);
      
      const productStatusArr = ['normal', 'problem', 'repaired', 'complete'];
      const productionNodeStatusArr = ['normal', 'complete'];
      // console.log(companyID, productStatusArr, productionNodeStatusArr, orderIDs);
      const currentProductionZonePeriod = await ShareFunc.getProductionZonePeriodC(companyID, productStatusArr, productionNodeStatusArr, orderIDs);
      // console.log(currentProductionZonePeriod);
      // console.log('currentProductionZonePeriod ok ');

      const productionNodeStatusArrFake = ['fake'];
      const currentProductionZonePeriodFake = await ShareFunc.getProductionZonePeriodC(companyID, productStatusArr, productionNodeStatusArrFake, orderIDs);
      
      
      
      // ## update  Schedule>  lastDatetime
      const scheduleUpsert = await Schedule.updateOne({$and: [
        {"seasonYear":seasonYear},
        {"companyID":companyID},
        {"factoryID":factoryID}, 
        {"sGroup":sGroup}, 
        {"sStatus":sStatus}, 
        {"sName":sName}, 
        {"sNote":sNote},
        {"sMode":sMode}, 
        {"sDatetimeDiff":sDatetimeDiff}, 
        // {"sDatetime":scheduleData.sDatetime}, 
      ]} , 
      {
        "lastDatetime": current,
        "sState": "normal",
        "sDatetime": scheduleData.sDatetime,
      }, {upsert: true}); 
      // console.log(scheduleUpsert);

      // ## update ProductionZonePeriodC > lastDatetime, data
      const dtproductionzoneperiodcUpsert  = await Dtproductionzoneperiodc.updateOne({$and: [
        {"seasonYear":seasonYear},
        {"companyID":companyID},
        {"factoryID":factoryID}, 
        {"sGroup":sGroup}, 
        // {"sStatus":sStatus}, 
        {"sName":sName}, 
        {"sNote":sNote},
        {"sMode":sMode}, 
        {"sDatetimeDiff":sDatetimeDiff}, 
        // {"sDatetime":scheduleData.sDatetime}, 
      ]} , 
      {
        "lastDatetime": current,
        "data": currentProductionZonePeriod,
        "dataFake": currentProductionZonePeriodFake,
      }, {upsert: true}); 
      // console.log(dtproductionzoneperiodcUpsert);

      // // console.error(mm1,'updated auto_getProductionZonePeriodC');
      // const current2 = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
      // console.log(scheduleData.seasonYear+' '+' EveryHour ' + scheduleData.sName +' / '+ current2+'done! ..... ] ');
    }
    // return true;
  } catch (err) {
    console.error(err);
  }
}

// const Dtcurrentcfactoryorder = require("../../models/m-dt-currentcfactoryorder");

// else if (scheduleData.sName === 'auto_getCurrentCFactoryOrder') {// ## report no.1
async function auto_getCurrentCFactoryOrder(scheduleData) {
  // console.log('scheduleData' , scheduleData);
  // console.log('auto_getCurrentCFactoryOrder' , ' every 1 hr');
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const mm1 = current.getMinutes();

  const seasonYear = scheduleData.seasonYear;
  const seasonYearArr = [scheduleData.seasonYear];
  const companyID = scheduleData.companyID;
  const factoryID = scheduleData.factoryID;
  const sGroup = scheduleData.sGroup;
  const sStatus = scheduleData.sStatus;
  const sName = scheduleData.sName;
  const sMode = scheduleData.sMode;
  const sDatetimeDiff = scheduleData.sDatetimeDiff;
  const sNote = scheduleData.sNote;
  const mm = +scheduleData.sDatetime[0].mm;
  const lastDatetime = current;
  // console.log(companyID, orderStatus, seasonYearArr);

  // ## check period for >= sDatetimeDiff
  // const sDatetimeDiff = scheduleData.sDatetimeDiff;
  const lastDatetime1 = new Date(moment(scheduleData.lastDatetime).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const mm2 = lastDatetime.getMinutes();

  const dateDiff = moment(current).diff(moment(lastDatetime1), 'days');
  const dateDiff2 = moment(current).diff(moment(lastDatetime1), 'hours');
  const dateDiff3 = moment(current).diff(moment(lastDatetime1), 'minutes');

  // console.log('lastDatetime1 = ' , lastDatetime1, mm2);
  // console.log('now = ' , current, mm);
  // console.log('dateDiff = ' , dateDiff, dateDiff2, dateDiff3);
  try {
    
    let isTimeing = false;
    const sDatetimeF = scheduleData.sDatetime.filter(i=> +i.mm === +mm1);
    if (sDatetimeF.length > 0) { isTimeing = true; }
    
    if (dateDiff3 >= sDatetimeDiff  || isTimeing) {
      // console.log(' [ .. *** dateDiff3 = ', dateDiff3 +  ' / sDatetimeDiff = ', sDatetimeDiff + ' / isTimeing = ' + isTimeing+ ' mn = '+mm1);
      // console.log(scheduleData.seasonYear+' '+' EveryHour  ' + scheduleData.sName);

      // ## update state to running
      const result1 = await updateScheduleDataSState(scheduleData, 'running');
      // console.log('auto_getCurrentCFactoryOrder update running    +++++++++++++++++++++++');

      // console.log('auto_getCurrentCFactoryOrder start ');
      // ##  const currentFactoryOrder = await ShareFunc.getCurrentCFactoryOrder(companyID, orderIDArr);
      // ## get season for report  // 2024AW  2024SS
      
      
      // getOrderIDsBySeasonYear= async (companyID, orderStatus, seasonYearArr)
      const orderStatus = ['open'];
      // console.log(companyID, orderStatus, seasonYearArr);
      const orderIDs1 = await ShareFunc.getOrderIDsBySeasonYear(companyID, orderStatus, seasonYearArr);
      const orderIDs = Array.from(new Set(orderIDs1.map((item) => item.orderID)));
      // console.log('orderIDs = ' , orderIDs);
      
      // const productStatusArr = ['normal', 'problem', 'repaired', 'complete'];
      // const productionNodeStatusArr = ['normal', 'complete'];
      // const currentFactoryOrder = await ShareFunc.getCurrentCFactoryOrder(companyID, orderIDArr);
      const currentFactoryOrder = await ShareFunc.getCurrentCFactoryOrder(companyID, orderIDs);
      // console.log(currentFactoryOrder);
      // console.log('currentFactoryOrder ok ');
      
      
      
      // ## update  Schedule>  lastDatetime
      const scheduleUpsert = await Schedule.updateOne({$and: [
        {"seasonYear":seasonYear},
        {"companyID":companyID},
        {"factoryID":factoryID}, 
        {"sGroup":sGroup}, 
        {"sStatus":sStatus}, 
        {"sName":sName}, 
        {"sNote":sNote},
        {"sMode":sMode}, 
        {"sDatetimeDiff":sDatetimeDiff}, 
        // {"sDatetime":scheduleData.sDatetime}, 
      ]} , 
      {
        "lastDatetime": current,
        "sState": "normal",
        "sDatetime": scheduleData.sDatetime,
      }, {upsert: true}); 
      // console.log(scheduleUpsert);

      // ## update dtcurrentcfactoryorder > lastDatetime, data
      const dtcurrentcfactoryorderUpsert  = await Dtcurrentcfactoryorder.updateOne({$and: [
        {"seasonYear":seasonYear},
        {"companyID":companyID},
        {"factoryID":factoryID}, 
        {"sGroup":sGroup}, 
        // {"sStatus":sStatus}, 
        {"sName":sName}, 
        {"sNote":sNote},
        {"sMode":sMode}, 
        {"sDatetimeDiff":sDatetimeDiff}, 
        // {"sDatetime":scheduleData.sDatetime}, 
      ]} , 
      {
        "lastDatetime": current,
        "data": currentFactoryOrder,
      }, {upsert: true}); 
      // console.log(dtproductionzoneperiodcUpsert);

      // // console.error(mm1,'updated auto_getCurrentCFactoryOrder');
      // const current2 = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
      // console.log(scheduleData.seasonYear+' '+' EveryHour ' + scheduleData.sName +' / '+ current2+'done! ........]');
    }
    // return true;
  } catch (err) {
    console.error(err);
  }
}


// const Dtcurrentproductqtyall = require("../../models/m-dt-currentproductqtyall");
// else if (scheduleData.sName === 'auto_getCompanyCurrentProductQtyAll_C') {// ## report no.1
// else if (scheduleData.sName === 'auto_getCompanyCurrentProductQtyAll_No_C') {// ## report no.1
async function auto_getCompanyCurrentProductQtyAll(scheduleData) {
  // console.log('scheduleData' , scheduleData);
  // console.log('auto_getCompanyCurrentProductQtyAll' , ' every 1 hr');
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const mm1 = current.getMinutes();

  const seasonYear = scheduleData.seasonYear;
  const seasonYearArr = [scheduleData.seasonYear];
  const companyID = scheduleData.companyID;
  const factoryID = scheduleData.factoryID;
  const sGroup = scheduleData.sGroup;
  const sStatus = scheduleData.sStatus;
  const sName = scheduleData.sName;
  const sMode = scheduleData.sMode;
  const sDatetimeDiff = scheduleData.sDatetimeDiff;
  const sNote = scheduleData.sNote;
  const mm = +scheduleData.sDatetime[0].mm;
  const lastDatetime = current;
  // console.log(companyID, orderStatus, seasonYearArr);

  // ## check period for >= sDatetimeDiff
  // const sDatetimeDiff = scheduleData.sDatetimeDiff;
  const lastDatetime1 = new Date(moment(scheduleData.lastDatetime).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const mm2 = lastDatetime.getMinutes();

  const dateDiff = moment(current).diff(moment(lastDatetime1), 'days');
  const dateDiff2 = moment(current).diff(moment(lastDatetime1), 'hours');
  const dateDiff3 = moment(current).diff(moment(lastDatetime1), 'minutes');

  // console.log('lastDatetime1 = ' , lastDatetime1, mm2);
  // console.log('now = ' , current, mm);
  // console.log('dateDiff = ' , dateDiff, dateDiff2, dateDiff3);
  try {
    
    let isTimeing = false;
    const sDatetimeF = scheduleData.sDatetime.filter(i=> +i.mm === +mm1);
    if (sDatetimeF.length > 0) { isTimeing = true; }
    
    if (dateDiff3 >= sDatetimeDiff  || mm1 === isTimeing) {
      // console.log('[ ..  *** dateDiff3 = ', dateDiff3 +  ' / sDatetimeDiff = ', sDatetimeDiff + ' / isTimeing = ' + isTimeing + ' mn = '+mm1);
      // console.log(scheduleData.seasonYear+' '+' EveryHour --> ' + scheduleData.sName);

      // ## update state to running
      const result1 = await updateScheduleDataSState(scheduleData, 'running');
      // console.log('auto_getCompanyCurrentProductQtyAll update running    +++++++++++++++++++++++');

      // console.log('auto_getCurrentCFactoryOrder start ');
      // ##  const currentFactoryOrder = await ShareFunc.getCurrentCFactoryOrder(companyID, orderIDArr);
      // ## get season for report  // 2024AW  2024SS

      
      // getOrderIDsBySeasonYear= async (companyID, orderStatus, seasonYearArr)
      const orderStatus = ['open'];
      // console.log(companyID, orderStatus, seasonYearArr);
      const orderIDs1 = await ShareFunc.getOrderIDsBySeasonYear(companyID, orderStatus, seasonYearArr);
      const orderIDs = Array.from(new Set(orderIDs1.map((item) => item.orderID)));
      // console.log('orderIDs = ' , orderIDs);
      
      const productStatusNoCompleteArr = ['normal', 'problem', 'repaired'];
      const productStatusCompletedArr = ['complete'];
      const factoryIDArr = []; // ## no need to use
      let companyCurrentProductQty = [];
      if (sNote === 'noComplete') { // ## noComplete
        companyCurrentProductQty= await ShareFunc.getCompanyCurrentProductQtyAll(companyID, factoryIDArr, productStatusNoCompleteArr, orderIDs);
      } else if (sNote === 'completed') { // ##  completed
        companyCurrentProductQty= await ShareFunc.getCompanyCurrentProductQtyAll(companyID, factoryIDArr, productStatusCompletedArr, orderIDs);
      }else {
        return false;
      }
      // companyCurrentProductQtyCompleteAll
      // companyCurrentProductQtyAll = await ShareFunc.getCompanyCurrentProductQtyAll(companyID, factoryIDArr, productStatusArr, orderIDs);
      // console.log(companyCurrentProductQty);
      // console.log('companyCurrentProductQty ok ');

      

      // ## update  Schedule>  lastDatetime
      const scheduleUpsert = await Schedule.updateOne({$and: [
        {"seasonYear":seasonYear},
        {"companyID":companyID},
        {"factoryID":factoryID}, 
        {"sGroup":sGroup}, 
        {"sStatus":sStatus}, 
        {"sName":sName}, 
        {"sNote":sNote},
        {"sMode":sMode}, 
        {"sDatetimeDiff":sDatetimeDiff}, 
        // {"sDatetime":scheduleData.sDatetime}, 
      ]} , 
      {
        "lastDatetime": current,
        "sState": "normal",
        "sDatetime": scheduleData.sDatetime,
      }, {upsert: true}); 
      // console.log(scheduleUpsert);

      // ## update dtcurrentproductqtyall > lastDatetime, data
      const dtcurrentproductqtyallUpsert  = await Dtcurrentproductqtyall.updateOne({$and: [
        {"seasonYear":seasonYear},
        {"companyID":companyID},
        {"factoryID":factoryID}, 
        {"sGroup":sGroup}, 
        // {"sStatus":sStatus}, 
        {"sName":sName}, 
        {"sNote":sNote},
        {"sMode":sMode}, 
        {"sDatetimeDiff":sDatetimeDiff}, 
        // {"sDatetime":scheduleData.sDatetime}, 
      ]} , 
      {
        "lastDatetime": current,
        "data": companyCurrentProductQty,
      }, {upsert: true}); 
      // console.log(dtproductionzoneperiodcUpsert);

      // // console.error(seasonYear, sNote, mm1,'updated auto_getCompanyCurrentProductQtyAll');
      // const current2 = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
      // console.log(scheduleData.seasonYear+' '+' EveryHour ' + scheduleData.sName +' / '+ current2+'done!  ........ ]');
    }
    // return true;
  } catch (err) {
    console.error(err);
  }
}






// ## schedule
// #############################################################



// #######################################################################################################
// ## transform report

exports.repCurrentCompanyOrderOutsourceFac_Transform = async (orderProduct, orderProduct1BY1, companyID, seasonYear) => {
  const result1 = await repCurrentCompanyOrderOutsourceFac_Transform(orderProduct, orderProduct1BY1, companyID, seasonYear);

  return result1;
}

// repCurrentCompanyOrderOutsourceFac_Transform(orderProduct)
async function repCurrentCompanyOrderOutsourceFac_Transform(orderProduct, orderProduct1BY1, companyID, seasonYear) {

  // ## initialize data

  // console.log(orderProduct1BY1);
  // console.log('-**************************************************************');

  // console.log('** 1111 ');
  // ## get colors  colorComID= async (companyID) 
  const colors = await ShareFunc.colorComID(companyID);
  // console.log(colors);
  // console.log('** 22222 ');

  // ## get orderIDs
  const orders = await ShareFunc.getOrderSBySeasonYear(companyID, seasonYear);
  // console.log('** 3333 ');
  const orderIDArr = Array.from(new Set(orders.map((item) => item.orderID)));
  // console.log(orderIDArr);
  // console.log('** 4444 ');

  // ## get outsource factory sent out
  const status1 = 'outsource';  // ## sent out  outsource
  const orderProductFacOut = await orderProduct.filter(i=>i.status === status1);
  const orderProductFac1BY1Out = await orderProduct1BY1.filter(i=>i.status === status1);
  // console.log(orderProductFacOut);
  // console.log('** 5555 ');

  // ## get outsource factory receive
  const status2 = 'normal';  // ## sent out  outsource
  const orderProductFacReceive = await orderProduct.filter(i=>i.status === status2);
  const orderProductFac1BY1Receive = await orderProduct1BY1.filter(i=>i.status === status2);
  // console.log(orderProductFacReceive);
  // console.log('** 6666 ');

  const factoryIDsOut = Array.from(new Set(orderProductFacOut.map((item) => item.factoryID)));
  const factoryIDs1BY1 = Array.from(new Set(orderProductFac1BY1Out.map((item) => item.factoryID)));
  let factoryIDs = [...factoryIDsOut];
  await ShareFunc.asyncForEach(factoryIDs1BY1, async (item) => {
    const fac = factoryIDs.filter(i=>i === item);
    if (fac.length === 0) {factoryIDs.push(item);}
  });
  factoryIDs.sort();
  // console.log('** 7777 ');
  // console.error(factoryIDs);
  const factorys = await ShareFunc.getFactoryArrByCompanyID(companyID);
  // console.error(factorys);
  // console.log('** 8888 ');

  let dataOutsState = [];

  // ## orderProductFacOut
  await ShareFunc.asyncForEach(orderProductFacOut, async (item) => {
    const sTypeOtus = 'b';
    const setName = await ShareFunc.getSetNameFromOrderID([...orders], item.orderID);
    item.setname = setName;
    const color = await ShareFunc.strReplaceAlll(item.color, '-', '');
    item.color = color+'';
    const targetPlace = await ShareFunc.strReplaceAlll(item.targetPlace, '-', '');
    item.targetPlace = targetPlace;

    const colorCode = await ShareFunc.getColorCodeByID_SetNmae(colors, color, setName);
    const colorName = await ShareFunc.getColorNameByID_SetNmae(colors, color, setName);
    const colorValue = await ShareFunc.getColorValueByID_SetNmae(colors, color, setName);
    item.colorCode = colorCode;
    item.colorName = colorName;
    item.colorValue = colorValue;
    item.setGroup = item.orderID
      +':'+setName
      +':'+targetPlace
      +':'+colorName+':'+colorCode+':'+color+':'+colorValue
      +':'+item.factoryID
      +':'+item.yyyymmdd
      +':'+item.fromFactoryID // ## factory who scan send out
      +':'+sTypeOtus; // ## b = bundle mode
  });
  // console.error(orderProductFacOut);
  // console.log('## 1111 ');

  // ## orderProductFacReceive
  await ShareFunc.asyncForEach(orderProductFacReceive, async (item) => {
    const sTypeOtus = 'b';  // ## b = bundle mode
    const setName = await ShareFunc.getSetNameFromOrderID([...orders], item.orderID);
    item.setname = setName;
    const color = await ShareFunc.strReplaceAlll(item.color, '-', '');
    item.color = color+'';
    const targetPlace = await ShareFunc.strReplaceAlll(item.targetPlace, '-', '');
    item.targetPlace = targetPlace;

    const colorCode = await ShareFunc.getColorCodeByID_SetNmae(colors, color, setName);
    const colorName = await ShareFunc.getColorNameByID_SetNmae(colors, color, setName);
    const colorValue = await ShareFunc.getColorValueByID_SetNmae(colors, color, setName);
    item.colorCode = colorCode;
    item.colorName = colorName;
    item.colorValue = colorValue;
    item.setGroup = item.orderID
      +':'+setName
      +':'+targetPlace
      +':'+colorName+':'+colorCode+':'+color+':'+colorValue
      +':'+item.factoryID
      +':'+item.yyyymmdd
      +':'+item.fromFactoryID // ## factory who scan send out
      +':'+sTypeOtus; // ## b = bundle mode
  });
  // console.error(orderProductFacReceive);
  // console.log('## 2222 ');

  await ShareFunc.asyncForEach(orderProductFac1BY1Out, async (item) => {
    const sTypeOtus = '1';  // ## 1 = 1by1scan
    const setName = await ShareFunc.getSetNameFromOrderID([...orders], item.orderID);
    item.setname = setName;
    const color = await ShareFunc.strReplaceAlll(item.color, '-', '');
    item.color = color+'';
    const targetPlace = await ShareFunc.strReplaceAlll(item.targetPlace, '-', '');
    item.targetPlace = targetPlace;

    const colorCode = await ShareFunc.getColorCodeByID_SetNmae(colors, color, setName);
    const colorName = await ShareFunc.getColorNameByID_SetNmae(colors, color, setName);
    const colorValue = await ShareFunc.getColorValueByID_SetNmae(colors, color, setName);
    item.colorCode = colorCode;
    item.colorName = colorName;
    item.colorValue = colorValue;
    item.setGroup = item.orderID
      +':'+setName
      +':'+targetPlace
      +':'+colorName+':'+colorCode+':'+color+':'+colorValue
      +':'+item.factoryID
      +':'+item.yyyymmdd
      +':'+item.fromFactoryID // ## factory who scan send out
      +':'+sTypeOtus; // ## 1 = 1by1scan
  });
  // console.error(orderProductFac1BY1Out);
  // console.log('## 3333 ');

  await ShareFunc.asyncForEach(orderProductFac1BY1Receive, async (item) => {
    const sTypeOtus = '1';  // ## 1 = 1by1scan
    const setName = await ShareFunc.getSetNameFromOrderID([...orders], item.orderID);
    item.setname = setName;
    const color = await ShareFunc.strReplaceAlll(item.color, '-', '');
    item.color = color+'';
    const targetPlace = await ShareFunc.strReplaceAlll(item.targetPlace, '-', '');
    item.targetPlace = targetPlace;

    const colorCode = await ShareFunc.getColorCodeByID_SetNmae(colors, color, setName);
    const colorName = await ShareFunc.getColorNameByID_SetNmae(colors, color, setName);
    const colorValue = await ShareFunc.getColorValueByID_SetNmae(colors, color, setName);
    item.colorCode = colorCode;
    item.colorName = colorName;
    item.colorValue = colorValue;
    item.setGroup = item.orderID
      +':'+setName
      +':'+targetPlace
      +':'+colorName+':'+colorCode+':'+color+':'+colorValue
      +':'+item.factoryID
      +':'+item.yyyymmdd
      +':'+item.fromFactoryID // ## factory who scan send out
      +':'+sTypeOtus; // ## 1 = 1by1scan
  });
  // console.error(orderProductFac1BY1Receive);
  // console.log('## 4444 ++++++++++++++++++++++++++++++++++++++++');

  // ## find  date  list
  await ShareFunc.asyncForEach(factoryIDs, async (item) => {
    let dateL = [];
    let dateList = [];
    let dataOutsState1 = {};

    // orderProductFac1BY1Out  orderProductFac1BY1Receive
    // ## 1 by 1 scan case
    const orderProductFac1BY1OutF = orderProductFac1BY1Out.filter(i=>i.factoryID==item);
    const orderProductFac1BY1ReceiveF = orderProductFac1BY1Receive.filter(i=>i.factoryID==item);
    let date1BY1Out = Array.from(new Set(orderProductFac1BY1OutF.map((item) => item.yyyymmdd)));
    let date1BY1Receive = Array.from(new Set(orderProductFac1BY1ReceiveF.map((item) => item.yyyymmdd)));
    date1BY1Out.sort();  // ## sort asc
    date1BY1Receive.sort();  // ## sort asc

    const orderProductFacOutF = orderProductFacOut.filter(i=>i.factoryID==item);
    const orderProductFacReceiveF = orderProductFacReceive.filter(i=>i.factoryID==item);
    let dateOut = Array.from(new Set(orderProductFacOutF.map((item) => item.yyyymmdd)));
    let dateReceive = Array.from(new Set(orderProductFacReceiveF.map((item) => item.yyyymmdd)));
    dateOut.sort();  // ## sort asc
    dateReceive.sort();  // ## sort asc
    dateList = [...dateOut];

    // console.log('## 5555 ');

    // ## insert dateReceive to dateList
    await ShareFunc.asyncForEach2(dateReceive, async (item2) => {
      const dateListF = dateList.filter(i=>i==item2);
          if (dateListF.length === 0) {
              dateList.push(item2);
          }
    });

    // ## insert date1BY1Out to dateList
    await ShareFunc.asyncForEach2(date1BY1Out, async (item2) => {
      const dateListF = dateList.filter(i=>i==item2);
          if (dateListF.length === 0) {
              dateList.push(item2);
          }
    });

    // ## insert date1BY1Receive to dateList
    await ShareFunc.asyncForEach2(date1BY1Receive, async (item2) => {
      const dateListF = dateList.filter(i=>i==item2);
          if (dateListF.length === 0) {
              dateList.push(item2);
          }
    });
    dateList.sort();  // ## sort asc
    // console.error(dateList);

    // console.log('## 6666 ');

    await ShareFunc.asyncForEach2(dateList, async (item2) => {
      let date1 = {
        yyyymmdd: item2,
        dateName: await ShareFunc.getDateShortByYYYYMMDD(item2, 'ddMMMyyyy', 'short', '-')
      };
      dateL.push(date1);
    });

    // console.log('## 7777 ');

    dataOutsState1.factoryID = item;
    dataOutsState1.factoryName = await ShareFunc.getFactoryNameByFactoryID(factorys, item);
    dataOutsState1.factoryName2 = await ShareFunc.getFactoryName2ByFactoryID(factorys, item);
    dataOutsState1.dateList = dateL;
    dataOutsState.push(dataOutsState1);
    // console.error(dateL);
  });
  // console.log('## 5555 ++++++++++++++++++++++++++++++++++++++++');

  // console.log(' delay 10 sec ');
  // await new Promise(resolve => setTimeout(resolve, 10000));  // ## delay 10 sec
  // console.log(' stop delay ');

  // console.error(dataOutsState);
  // console.error('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
  // let round1 = 0;
  // console.log('@@ 1111 ');
  // console.log('dataOutsState.length',dataOutsState.length);  
  await ShareFunc.asyncForEach(dataOutsState, async (item) => {
    // console.log('item.dateList.length',item.dateList.length);

    const factoryID = item.factoryID; // ## to factory , outsource factory
    await ShareFunc.asyncForEach2(item.dateList, async (item2) => {
      const yyyymmdd = item2.yyyymmdd;

      // ## bundle
      const orderProductFacOutF = orderProductFacOut.filter(i=>i.factoryID==factoryID && i.yyyymmdd==yyyymmdd);
      const orderProductFacReceiveF = orderProductFacReceive.filter(i=>i.factoryID==factoryID && i.yyyymmdd==yyyymmdd);
      const setGroupOutArr = Array.from(new Set(orderProductFacOutF.map((item) => item.setGroup)));
      const setGroupReceiveArr = Array.from(new Set(orderProductFacReceiveF.map((item) => item.setGroup)));

      // ## 1by1 scan  // orderProductFac1BY1Out  orderProductFac1BY1Receive
      const orderProductFac1BY1OutF = orderProductFac1BY1Out.filter(i=>i.factoryID==factoryID && i.yyyymmdd==yyyymmdd);
      const orderProductFac1BY1ReceiveF = orderProductFac1BY1Receive.filter(i=>i.factoryID==factoryID && i.yyyymmdd==yyyymmdd);
      const setGroup1BY1OutArr = Array.from(new Set(orderProductFac1BY1OutF.map((item) => item.setGroup)));
      const setGroup1BY1ReceiveArr = Array.from(new Set(orderProductFac1BY1ReceiveF.map((item) => item.setGroup)));
      // await getQty1BY1_001(item3, orderProductFac1BY1Out);
      // await getQty1BY1_001(item3, orderProductFac1BY1Receive);

      let setGroupInfoOut = [];
      // ## b = bundle mode
      // console.log('setGroupOutArr.length',setGroupOutArr.length); round1 = round1 + setGroupOutArr.length;
      await ShareFunc.asyncForEach3(setGroupOutArr, async (item3) => {

        const qty = await getQty001(item3, orderProductFacOut);
        const bundleNos = await getBundleNos001(item3, orderProductFacOut);
        const setGroupInfo = item3.split(':'); // BA1P4A4A:muji:JAPN:OATMEAL:#013:OM:f000004:20240327
        const orderID = setGroupInfo[0];
        const setName = setGroupInfo[1];
        const targetPlaceID = setGroupInfo[2];
        const colorName = setGroupInfo[3];
        const colorCode = setGroupInfo[4];
        const color = setGroupInfo[5];
        const colorValue = setGroupInfo[6];
        const factoryID1 = await ShareFunc.getFactoryName2ByFactoryID(factorys, setGroupInfo[7]); // ## factory outsource
        const factoryID2 = await ShareFunc.getFactoryName2ByFactoryID(factorys, setGroupInfo[9]); // ## factory who scan send out
        const sTypeOtus = setGroupInfo[10];  // ## b = bundle mode , 1 = 1by1
        const setGroupInfo1 = {
            setGroup: item3,
            qty, bundleNos, orderID, setName, targetPlaceID, colorName, colorCode, color, colorValue,
            factoryID1, factoryID2, sTypeOtus
        };
        setGroupInfoOut.push(setGroupInfo1);
      });

      
      // ## 1 = 1by1
      // console.log('setGroup1BY1OutArr.length',setGroup1BY1OutArr.length); round1 = round1 + setGroup1BY1OutArr.length;
      await ShareFunc.asyncForEach3(setGroup1BY1OutArr, async (item3) => {
        const qty = await getQty1BY1_001(item3, orderProductFac1BY1Out);
        const bundleNos = [];
        const setGroupInfo = item3.split(':'); // BA1P4A4A:muji:JAPN:OATMEAL:#013:OM:f000004:20240327
        const orderID = setGroupInfo[0];
        const setName = setGroupInfo[1];
        const targetPlaceID = setGroupInfo[2];
        const colorName = setGroupInfo[3];
        const colorCode = setGroupInfo[4];
        const color = setGroupInfo[5];
        const colorValue = setGroupInfo[6];
        const factoryID1 = await ShareFunc.getFactoryName2ByFactoryID(factorys, setGroupInfo[7]); // ## factory outsource
        const factoryID2 = await ShareFunc.getFactoryName2ByFactoryID(factorys, setGroupInfo[9]); // ## factory who scan send out
        const sTypeOtus = setGroupInfo[10];  // ## b = bundle mode , 1 = 1by1
        const setGroupInfo1 = {
            setGroup: item3,
            qty, bundleNos, orderID, setName, targetPlaceID, colorName, colorCode, color, colorValue,
            factoryID1, factoryID2, sTypeOtus
        };
        setGroupInfoOut.push(setGroupInfo1);
      });

      
      let setGroupInfoReceive = [];
      // console.log('setGroupReceiveArr.length',setGroupReceiveArr.length); round1 = round1 + setGroupReceiveArr.length;
      // ## b = bundle mode
      await ShareFunc.asyncForEach3(setGroupReceiveArr, async (item3) => {
        const qty = await getQty001(item3, orderProductFacReceive);
        const bundleNos = await getBundleNos001(item3, orderProductFacReceive);
        const setGroupInfo = item3.split(':'); // BA1P4A4A:muji:JAPN:OATMEAL:#013:OM:f000004:20240327
        const orderID = setGroupInfo[0];
        const setName = setGroupInfo[1];
        const targetPlaceID = setGroupInfo[2];
        const colorName = setGroupInfo[3];
        const colorCode = setGroupInfo[4];
        const color = setGroupInfo[5];
        const colorValue = setGroupInfo[6];
        const factoryID1 = await ShareFunc.getFactoryName2ByFactoryID(factorys, setGroupInfo[7]); // ## factory outsource
        const factoryID2 = await ShareFunc.getFactoryName2ByFactoryID(factorys, setGroupInfo[9]); // ## factory who scan receice back
        const sTypeOtus = setGroupInfo[10];  // ## b = bundle mode , 1 = 1by1
        const setGroupInfo1 = {
            setGroup: item3,
            qty, bundleNos, orderID, setName, targetPlaceID, colorName, colorCode, color, colorValue,
            factoryID1, factoryID2, sTypeOtus
        };
        setGroupInfoReceive.push(setGroupInfo1);
      });

      
      // console.log('setGroup1BY1ReceiveArr.length',setGroup1BY1ReceiveArr.length); round1 = round1 + setGroup1BY1ReceiveArr.length;
      // ## 1 = 1by1
      await ShareFunc.asyncForEach3(setGroup1BY1ReceiveArr, async (item3) => {
        // console.error('---------------item3, orderProductFac1BY1Receive------------------');
        // console.error(item3, orderProductFac1BY1Receive);
        const qty = await getQty1BY1_001(item3, orderProductFac1BY1Receive);
        const bundleNos = [];
        const setGroupInfo = item3.split(':'); // BA1P4A4A:muji:JAPN:OATMEAL:#013:OM:f000004:20240327
        const orderID = setGroupInfo[0];
        const setName = setGroupInfo[1];
        const targetPlaceID = setGroupInfo[2];
        const colorName = setGroupInfo[3];
        const colorCode = setGroupInfo[4];
        const color = setGroupInfo[5];
        const colorValue = setGroupInfo[6];
        const factoryID1 = await ShareFunc.getFactoryName2ByFactoryID(factorys, setGroupInfo[7]); // ## factory outsource
        const factoryID2 = await ShareFunc.getFactoryName2ByFactoryID(factorys, setGroupInfo[9]); // ## factory who scan receice back
        const sTypeOtus = setGroupInfo[10];  // ## b = bundle mode , 1 = 1by1
        const setGroupInfo1 = {
            setGroup: item3,
            qty, bundleNos, orderID, setName, targetPlaceID, colorName, colorCode, color, colorValue,
            factoryID1, factoryID2, sTypeOtus
        };
        setGroupInfoReceive.push(setGroupInfo1);
      });
      

      item2.out = setGroupInfoOut;
      item2.receive = setGroupInfoReceive;
      // console.error(setGroupInfoOut);
      // console.error(setGroupInfoReceive);
    });
  });
  // console.log("================= round1 = " , round1)

  dataOutsState.sort((a,b)=>{ return a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0 });
  dataOutsState.forEach( (item1, index1) => {
      item1.dateList.sort((a,b)=>{ return a.yyyymmdd <b.yyyymmdd?1:a.yyyymmdd >b.yyyymmdd?-1:0 }); // sort desc
  });
  // console.error(dataOutsState);
  // console.log('@@ ----------------- ');

  return dataOutsState;
}

async function getQty001(setGroup, facOutArr) {
  const facOutF = facOutArr.filter(i=> i.setGroup == setGroup);
  if (facOutF.length > 0) {
      const facOutTotalQTY = +facOutF.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
      return facOutTotalQTY;
  }
  return 0;
}

async function getBundleNos001(setGroup, facOutArr) {
  const facOutF = facOutArr.filter(i=> i.setGroup == setGroup);
  if (facOutF.length > 0) {
      const bundleNos = Array.from(new Set(facOutF.map((item) => item.bundleNo)));
      return bundleNos;
  }
  return [];
}

async function getQty1BY1_001(setGroup, facOutArr) {
  const facOutF = facOutArr.filter(i=> i.setGroup == setGroup);
  if (facOutF.length > 0) {
    // console.error(facOutF);
      const facOutTotalQTY = +facOutF.reduce((prev, cur) => {return prev + cur.sumFactoryOutsQty;}, 0);
      return facOutTotalQTY;
  }
  return 0;
}




// ## transform report
// #######################################################################################################


