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
const Gsconfig = require("../../models/m-gsconfig");            // ## อ่าน SESSION_TAKEOVER_MINUTES (ป้องกัน login ซ้อน)
const UserActivity = require("../../models/m-user-activity");   // ## เช็คว่า session เก่ายัง active ไหม (จาก Monitor)

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
    // ═══════════════════════════════════════════════════════════════════════
    // ## ป้องกัน login ซ้อน (single session — Option C: บล็อก + เข้าใช้แทน)
    // requirement: 1 user 1 เครื่อง · ถ้ามีคนใช้อยู่ที่เครื่องอื่น → เข้าไม่ได้
    //   ยกเว้น (1) กด "เข้าใช้แทน" (forceLogin=true) หรือ (2) เครื่องเก่าเงียบเกิน SESSION_TAKEOVER_MINUTES
    // ═══════════════════════════════════════════════════════════════════════
    const newKey = tokenSet?.uuid5 || '';                         // uuid5 ของเครื่องที่กำลังจะ login
    const force  = body.forceLogin === true;                      // true = เข้าใช้แทน (เตะเครื่องเก่า)
    const prevKey = userf.uInfo?.activeSessionKey || '';          // เครื่องที่ถือตั๋วอยู่ก่อนหน้า
    const companyIDForCfg = userf.uCompany?.[0]?.companyID || '';

    if (prevKey && newKey && prevKey !== newKey && !force) {
        // มี session อื่นถือตั๋วอยู่ + เราไม่ได้กด force → เช็คว่ายัง active ไหม
        const cfg = await Gsconfig.findOne({ companyID: companyIDForCfg, key: 'SESSION_TAKEOVER_MINUTES' }, { value: 1, _id: 0 }).lean();
        const takeoverMin = Number(cfg?.value) || 5;             // default 5 นาที
        const prevAct = await UserActivity.findOne({ sessionKey: prevKey }).lean();
        const idleMs = prevAct ? (Date.now() - new Date(prevAct.lastSeen).getTime()) : Infinity;

        if (prevAct && idleMs < takeoverMin * 60 * 1000) {
            // ## เครื่องเก่ายังใช้อยู่ → บล็อก + ส่ง device info ให้ frontend โชว์ popup "เข้าใช้แทน?"
            return res.status(409).json({
                message: { messageID: 'erru006', mode: 'errLoginActive', value: 'บัญชีนี้กำลังใช้งานอยู่ที่อุปกรณ์อื่น' },
                activeSession: {
                    ip: prevAct.ip || '', deviceType: prevAct.deviceType || '',
                    browser: prevAct.browser || '', browserVer: prevAct.browserVer || '',
                    os: prevAct.os || '', osVer: prevAct.osVer || '',
                    lastSeen: prevAct.lastSeen, idleSec: Math.round(idleMs / 1000),
                },
            });
        }
        // เงียบเกิน takeover (หรือไม่มี activity แล้ว) → ถือว่าหลุด ปล่อยเข้าเลย (กันล็อกตัวเอง)
    }

    // ## เข้าได้ (เครื่องเดิม / force / เครื่องเก่าหลุด) → ตั้งตั๋วให้เป็นเครื่องนี้ (ตั๋วเก่าใช้ไม่ได้ทันที)
    await Useracc.updateOne({ userID }, { $set: { 'uInfo.activeSessionKey': newKey, 'uInfo.activeSessionAt': current } });

    // ## update useracc last login
    const userLastLogin = await Useracc.updateOne({userID: userID} , {"uInfo.lastLogin": current});


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
      subNodeflowC: subNodeflowC,
      uiPerms: fetchedUser.uiPerms ?? {},   // ← เพิ่มบรรทัดนี้
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


// router.post("/acc/logout", checkAuthA, userAController.userALogout);
// ## logout: เคลียร์ activeSessionKey (ป้องกัน login ซ้อน) — เคลียร์เฉพาะถ้าตั๋วปัจจุบันเป็นของเครื่องนี้
// (กันเครื่องที่ถูกเตะไปแล้วมาเคลียร์ตั๋วของเครื่องที่ชนะ) · logout ห้าม fail
exports.userALogout = async (req, res, next) => {
  try {
    const userID = req.userData?.tokenSet?.userID;
    const uuid5  = req.userData?.tokenSet?.uuid5;
    if (userID && uuid5) {
      await Useracc.updateOne(
        { userID, 'uInfo.activeSessionKey': uuid5 },
        { $set: { 'uInfo.activeSessionKey': '' } }
      );
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(200).json({ success: true });
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
      // console.log(err);
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
      subNodeflowC: subNodeflowC,
      uiPerms: userf.uiPerms ?? {},   // ← เพิ่ม
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




// #############################################################
// ## worker

// ## create Worker
// router.post('/create/worker', checkAuthA, checkUUID, hrController.createWorker);
exports.createWorker = async (req, res, next) => {
    const {
        userID, uInfo, uCompany, uFactory,
        state, createByUserID,
        payType, baseSalary, onboardingExpenses
    } = req.body;

    if (!userID) {
        return res.status(400).json({ message: 'userID จำเป็น' });
    }
    if (!uInfo?.userName) {
        return res.status(400).json({ message: 'userName จำเป็น' });
    }
    if (!uFactory?.length) {
        return res.status(400).json({ message: 'ต้องมีอย่างน้อย 1 factory' });
    }

    try {
        const exists = await User.findOne({ userID });
        if (exists) {
            return res.status(400).json({ message: `userID "${userID}" มีอยู่แล้ว` });
        }

        const worker = new User({
            userID,
            qrCode:  userID,
            type:    's',
            uInfo: {
                userName:    uInfo.userName,
                userPass:    '-',
                pic:         uInfo.pic         || '',
                tel:         uInfo.tel         || '',
                email:       uInfo.email       || '',
                registDate:  new Date(),
                nationality: uInfo.nationality || '',
                department:  uInfo.department  || '',
                position:    uInfo.position    || '',   // ตำแหน่ง (หน้าที่ในแผนก)
                startDate:   uInfo.startDate   || '',
                note:        uInfo.note        || '',
                wageType:    uInfo.wageType    || 'daily',   // ประเภทค่าจ้าง (เลือก 1) — ใช้ทำ payroll
                scanID:        uInfo.scanID        || '',      // รหัสในเครื่องสแกนนิ้ว (map finger scan)
                scanMachineID: uInfo.scanMachineID || '',      // เครื่องสแกนที่ใช้
            },
            uCompany:           uCompany           || [],
            uFactory:           uFactory,
            status:             'a',
            state:              state              || '',
            payType:            payType            || ['daily'],
            baseSalary:         baseSalary         || 0,
            onboardingExpenses: onboardingExpenses || [],
            createdAt: new Date(),
            createBy:  { userID: createByUserID || '' },
        });

        await worker.save();

        res.status(201).json({ success: true, worker: worker.toObject() });

    } catch (err) {
        console.error('[createWorker]', err);
        next(err);
    }
};

// ## put  Worker  image
// ## http://192.168.1.33:3968/api/a/user/edit/workerpic
// router.put('/edit/workerpic', checkAuthA, checkUUID, userAController.workerpic);
exports.workerpic = async (req, res, next) => {
  try {
    const { userID, pic } = req.body;
    if (!userID || !pic) {
        return res.status(400).json({ message: 'userID และ pic จำเป็น' });
    }

    await User.findOneAndUpdate(
        { userID },
        { $set: { 'uInfo.pic': pic } }
    );

    res.json({ success: true });

  } catch (err) {
      console.error('[PUT /hr/worker/pic]', err);
      res.status(500).json({ message: 'Server error', error: err.message });
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

    // get subNodeFlowCost from Order doc (for no-data branch in Angular)
    const orderDoc = await Order.findOne(
      { companyID, orderID },
      { 'productOR.subNodeFlowCost': 1, _id: 0 }
    ).lean();
    const subNodeFlowCost = orderDoc?.productOR?.subNodeFlowCost || [];

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      status: 'get user info',
      token: token,
      expiresIn: process.env.expiresIn,
      orderSubNodeFlowSetCost: orderSubNodeFlowSetCost,
      subNodeFlowCost: subNodeFlowCost,
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
// exports.getEmpList = async (req, res, next) => {
//   // try {  } catch (err) {}
//   const companyID = req.params.companyID;
//   const factoryID = req.params.factoryID;
//   const status = req.params.status;
//   const type = req.params.type;
//   const state = req.params.state;
//   const page = +req.params.page;
//   const limit = +req.params.limit;  // ## records we need to get
//   // console.log('getEmpList');
//   try {

//     // const states = state === 'blank' ? [''] : state.split(',');
//     // ## factoryID = 'all' → getEmpListCF ต้อง skip filter factory
    
//     // getEmpListCF= async (companyID, factoryID, status, type, state, page, limit)
//     // status = 'a'
//     // type = 's'
//     // state = ''
//     const workers = 
//       await ShareFunc.getEmpListCF(companyID, factoryID, [status], [type], [state], page, limit);
//     // console.log(users);

//     // getEmpsCount= async (companyID, factoryID, status, type, state) 
//     const workersCount = await ShareFunc.getEmpsCount(companyID, factoryID, [status], [type], [state]);

//     // const orderSubNodeFlowSetCost = 
//     //   await ShareFunc.getOrderSubNodeCostBySeasonYear(companyID, factoryID, [orderID], [seasonYear]);
//     // orders.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });

//     // ## 
//     // const productIDs = Array.from(new Set(orders.map((item) => item.orderID)));
//     // const productImageProfiles = await ShareFunc.getProductImageProfiles(companyID, productIDs);

//     const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

//     res.status(200).json({
//       status: 'get workers info',
//       token: token,
//       expiresIn: process.env.expiresIn,
//       workers: workers,
//       workersCount: workersCount,
//       page: page,
//       limit: limit,
//       // productImageProfiles: productImageProfiles,

//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(401).json({
//       message: {
//         messageID: 'erru005', 
//         mode:'errgetWorkers', 
//         value: "get workers error"
//       }
//     });
//   }
// }

exports.getEmpList = async (req, res) => {
    try {
        const { companyID, factoryID, status, type } = req.params;
        const page  = Math.max(+req.params.page  || 1, 1);
        const limit = Math.max(+req.params.limit || 20, 1);
        const skip  = (page - 1) * limit;
        const search = req.query.search?.trim() || '';

        // base query — ใช้นับ count ทุก status
        const baseQuery = {
            type: type || 's',
            'uFactory.companyID': companyID,
            'uFactory.factoryID': factoryID,
        };

        // status filter — 'all' = ไม่กรอง
        const query = {
            ...baseQuery,
            ...(status === 'all' ? {} : { status }),
        };

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { userID:           { $regex: regex } },
                { 'uInfo.userName': { $regex: regex } },
            ];
        }

        const [workers, workersCount, activeCount, waitCount, banCount, token] = await Promise.all([
            User.find(query)
                .select('-uInfo.userPass')
                .sort({ 'uInfo.userName': 1 })
                .skip(skip).limit(limit).lean(),
            User.countDocuments(query),
            User.countDocuments({ ...baseQuery, status: 'a' }),
            User.countDocuments({ ...baseQuery, status: 'w' }),
            User.countDocuments({ ...baseQuery, status: 'b' }),
            ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn),
        ]);

        res.json({
            token,
            expiresIn: process.env.expiresIn,
            workers,
            workersCount,
            activeCount,
            waitCount,
            banCount,
            page,
            limit,
        });

    } catch (err) {
        console.error('[getEmpList]', err);
        res.status(500).json({ message: err.message });
    }
};




// ## get EmpList LK %text%
// router.get("/hr/emplist/lk/:companyID/:factoryID/:status/:type/:state/:page/:limit", 
// checkAuthA, checkUUID, userAController.getEmpListLK);
exports.getEmpListLK = async (req, res) => {
    try {
        const { companyID, factoryID, status, page, limit } = req.params;
        const search = req.query.search?.trim() || '';

        // base query — ใช้นับ count ทุก status
        const baseQuery = {
            type: 's',
            'uFactory.factoryID': factoryID,
            'uFactory.companyID': companyID,
        };

        // status filter — 'all' = ไม่กรอง
        const statusQuery = (status === 'all') ? {} : { status };

        const query = { ...baseQuery, ...statusQuery };

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { userID:           { $regex: regex } },
                { 'uInfo.userName': { $regex: regex } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [workers, workersCount, activeCount, waitCount, banCount] = await Promise.all([
            User.find(query)
                .select('-uInfo.userPass')
                .sort({ 'uInfo.userName': 1 })
                .skip(skip).limit(parseInt(limit)).lean(),
            User.countDocuments(query),
            User.countDocuments({ ...baseQuery, status: 'a' }),
            User.countDocuments({ ...baseQuery, status: 'w' }),
            User.countDocuments({ ...baseQuery, status: 'b' }),
        ]);

        res.json({ workers, workersCount, activeCount, waitCount, banCount });
    } catch (err) {
        console.error('[getEmpListLK]', err);
        res.status(500).json({ message: err.message });
    }
};

// ## update worker info
// router.put("/hr/worker", checkAuthA, checkUUID, userAController.updateWorker);
exports.updateWorker = async (req, res) => {
    try {
        const f = req.body;
        if (!f.userID) return res.status(400).json({ message: 'userID required' });

        await User.findOneAndUpdate(
            { userID: f.userID },
            {
                $set: {
                    'uInfo.userName':    f.uInfo?.userName    ?? '',
                    'uInfo.tel':         f.uInfo?.tel         ?? '',
                    'uInfo.email':       f.uInfo?.email       ?? '',
                    'uInfo.nationality': f.uInfo?.nationality ?? '',
                    'uInfo.department':  f.uInfo?.department  ?? '',
                    'uInfo.position':    f.uInfo?.position    ?? '',   // ตำแหน่ง (หน้าที่ในแผนก)
                    'uInfo.startDate':   f.uInfo?.startDate   ?? '',
                    'uInfo.note':        f.uInfo?.note        ?? '',
                    'uInfo.wageType':    f.uInfo?.wageType    ?? 'daily',   // ประเภทค่าจ้าง (เลือก 1) — ใช้ทำ payroll
                    'uInfo.scanID':        f.uInfo?.scanID        ?? '',    // รหัสในเครื่องสแกนนิ้ว (map finger scan)
                    'uInfo.scanMachineID': f.uInfo?.scanMachineID ?? '',    // เครื่องสแกนที่ใช้
                    status:             f.status             ?? 'a',
                    payType:            f.payType            ?? ['daily'],
                    baseSalary:         f.baseSalary         ?? 0,
                    onboardingExpenses: f.onboardingExpenses ?? [],
                },
            },
            { new: true }
        );

        res.json({ success: true });

    } catch (err) {
        console.error('[updateWorker]', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};




