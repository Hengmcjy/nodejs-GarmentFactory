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
  // console.log(isQuery_time1Group, isQuery_everyDayGroup, isQuery_everyHourGroup, isQuery_every30mnGroup, isQuery_every15mnGroup);
  if (!isQuery_time1Group  && !isQuery_everyDayGroup && !isQuery_everyHourGroup && !isQuery_every30mnGroup && !isQuery_every15mnGroup) { 
    // isQueryNow = true;
    await this.getSchedule(); 
  }
  // console.log('auto schedule');
},1000*intervalSecond*intervalMinute1); // intervalSecond*intervalMinute1


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
      // console.log('everyHourGroup'); function clearSStateToNormal(scheduleData)
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
      await this.asyncForEach(every15mnGroup, async (item1) => {
        await clearSStateToNormal(item1); // ## clear all sState = 'normal' in case minutes total over 
      });
      isQuery_every15mnGroup = false;
    }
    // console.log('finished loop update report ' , current);
  }
  return true;
}

async function getDataTempEvery30mn(scheduleData) {
  // ## report no.35 send out and receive report
  if (scheduleData.sState === 'normal') {
    if (scheduleData.sName === 'auto_getCurrentCompanyOrderOutsourceFac') {// ## report no.35
      await auto_getCurrentCompanyOrderOutsourceFac(scheduleData);
      return true;
    } else if (scheduleData.sName === 'auto_getCompanyOrderOutsource') {// ## report no.31 overall
      await auto_getCompanyOrderOutsource(scheduleData);
      return true;
    } else {
      return true;
    }
  }
  return true;
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

      // console.error(mm1,'updated auto_getCompanyOrderOutsource');
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
    let isTimeing = false;
    const sDatetimeF = scheduleData.sDatetime.filter(i=> +i.mm === +mm1);
    // console.log('sDatetimeF.length ',  sDatetimeF.length);
    if (sDatetimeF.length > 0) { isTimeing = true; }
    
    if (dateDiff3 >= sDatetimeDiff  || isTimeing) {
      // ## update state to running
      const result1 = await updateScheduleDataSState(scheduleData, 'running');
      // console.log('auto_getCurrentCompanyOrderOutsourceFac update running    +++++++++++++++++++++++');

      // ## get orderIDs
      const orders = await ShareFunc.getOrdersBySeasonYear(companyID, seasonYear);
      const orderIDArr = Array.from(new Set(orders.map((item) => item.orderID)));
      // console.log(orderIDArr);
      
      const isOutsource = true;
      const status = ['outsource', 'normal'];
      // ## get outsource factory sent out & factory receive
      const orderProduct = await ShareFunc.getCurrentCompanyOrderOutsourceFac(companyID, orderIDArr, isOutsource, status);
      
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
        "data": orderProduct,
      }, {upsert: true}); 
      // console.log(dtorderoutsourcefacUpsert);

      // console.error(mm1,'updated auto_getCurrentCompanyOrderOutsourceFac');
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
      return true;
    } else if (scheduleData.sName === 'auto_getCurrentCFactoryOrder') {// ## report no.1
      await auto_getCurrentCFactoryOrder(scheduleData);
      return true;
    } else if (scheduleData.sName === 'auto_getCompanyCurrentProductQtyAll_No_C') {// ## report no.1 / noComplete
      await auto_getCompanyCurrentProductQtyAll(scheduleData);
      return true;
    } else if (scheduleData.sName === 'auto_getCompanyCurrentProductQtyAll_C') {// ## report no.1 /completed
      await auto_getCompanyCurrentProductQtyAll(scheduleData);
      return true;
    } else {
      return true;
    }
  }
  return true;
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
      }, {upsert: true}); 
      // console.log(dtproductionzoneperiodcUpsert);

      // console.error(mm1,'updated auto_getProductionZonePeriodC');
    }
    return true;
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

      // console.error(mm1,'updated auto_getCurrentCFactoryOrder');
    }
    return true;
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
        return fasle;
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

      // console.error(seasonYear, sNote, mm1,'updated auto_getCompanyCurrentProductQtyAll');
    }
    return true;
  } catch (err) {
    console.error(err);
  }
}






// ## schedule
// #############################################################