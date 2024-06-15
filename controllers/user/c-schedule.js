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

// ## 1 minutes for loop check
setInterval(async() => {
  await this.getSchedule();
  // console.log('auto schedule');
},1000*intervalSecond*intervalMinute1); // intervalSecond*intervalMinute1


// ## main scheduler #################################
// #######################################################################################################


// #######################################################################################################
// ## schedule

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
  // console.log(scheduleData, scheduleData[0].sDatetime);

  // if ((scheduleData.length > 0 && i <= 1) || i == 21) {
  if ( scheduleData.length > 0 ) {
    const time1Group = scheduleData.filter(i=>i.sMode === '1');
    const everyDayGroup = scheduleData.filter(i=>i.sMode === 'everyDay');
    const everyHourGroup = scheduleData.filter(i=>i.sMode === 'everyHour');
    const every30mnGroup = scheduleData.filter(i=>i.sMode === 'every30mn');
    const every15mnGroup = scheduleData.filter(i=>i.sMode === 'every15mn');

    if (time1Group.length > 0) {
      console.log('time1Group');
    }

    if (everyDayGroup.length > 0) {
      console.log('everyDayGroup');
    }

    if (everyHourGroup.length > 0) {
      // console.log('everyHourGroup');
      // console.log(everyHourGroup[0].sDatetimeDiff, everyHourGroup[0].sDatetime);
      await this.asyncForEach(everyHourGroup, async (item1) => {
        await getDataTemp(item1);
      });
    }

    if (every30mnGroup.length > 0) {
      console.log('every30mnGroup');
    }

    if (every15mnGroup.length > 0) {
      console.log('every15mnGroup');
    }
  }
}

async function getDataTemp(scheduleData) {

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

// ## auto getRepCurrentProductionZonePeriod
// ## if (scheduleData.sName === 'auto_getProductionZonePeriodC') {// ## report no.21
async function auto_getProductionZonePeriodC(scheduleData) {
  // console.log('scheduleData' , scheduleData);
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
  const mm = scheduleData.sDatetime[0].mm;
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
    if (dateDiff3 >= sDatetimeDiff  || mm1 === +mm) {
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
    }
  } catch (err) {
    console.error(err);
  }
}

// const Dtcurrentcfactoryorder = require("../../models/m-dt-currentcfactoryorder");

// else if (scheduleData.sName === 'auto_getCurrentCFactoryOrder') {// ## report no.1
async function auto_getCurrentCFactoryOrder(scheduleData) {
  // console.log('scheduleData' , scheduleData);
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
  const mm = scheduleData.sDatetime[0].mm;
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
    if (dateDiff3 >= sDatetimeDiff  || mm1 === +mm) {
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
    }
  } catch (err) {
    console.error(err);
  }
}


// const Dtcurrentproductqtyall = require("../../models/m-dt-currentproductqtyall");
// else if (scheduleData.sName === 'auto_getCompanyCurrentProductQtyAll_C') {// ## report no.1
// else if (scheduleData.sName === 'auto_getCompanyCurrentProductQtyAll_No_C') {// ## report no.1
async function auto_getCompanyCurrentProductQtyAll(scheduleData) {
  // console.log('scheduleData' , scheduleData);
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
  const mm = scheduleData.sDatetime[0].mm;
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
    if (dateDiff3 >= sDatetimeDiff  || mm1 === +mm) {
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
    }
  } catch (err) {
    console.error(err);
  }
}






// ## schedule
// #############################################################