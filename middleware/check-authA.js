const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const UserActivity = require('../models/m-user-activity');   // ## Monitor: เก็บ session ที่ใช้งานอยู่
const Useracc = require('../models/m-acc-user');             // ## ป้องกัน login ซ้อน: เช็ค activeSessionKey

// ## ป้องกัน login ซ้อน (single session): token นี้ยังเป็น session ที่ถูกต้องของ user ไหม?
// เทียบ uuid5 ใน token กับ Useracc.uInfo.activeSessionKey (ตั๋วใบล่าสุดที่ login/force)
// - ตรง → ผ่าน · ไม่ตรง → เครื่องนี้ถูกเตะแล้ว (มีคน login ที่อื่น)
// - ยังไม่เคยตั้ง (login เก่าก่อนมีฟีเจอร์) หรือ DB error → ผ่าน (fail-open · ห้ามล็อกทุกคน)
async function isSessionValid(userID, uuid5) {
    if (!userID || !uuid5) return true;
    try {
        const u = await Useracc.findOne({ userID }, { 'uInfo.activeSessionKey': 1, _id: 0 }).lean();
        const key = u?.uInfo?.activeSessionKey || '';
        if (!key) return true;
        return key === uuid5;
    } catch { return true; }
}

// ## throttle การเขียน activity (ครั้ง/15วิ ต่ออุปกรณ์) — กันเขียน DB ถี่เกิน
const _actLastWrite = new Map();
function trackActivity(req, tokenSet) {
    try {
        const key = tokenSet.uuid5 || (tokenSet.userID + '_' + (tokenSet.deviceType || ''));
        if (!key) return;
        const now = Date.now();
        if (_actLastWrite.has(key) && now - _actLastWrite.get(key) < 15000) return;
        _actLastWrite.set(key, now);
        const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim().replace(/^::ffff:/, '');   // ตัด prefix IPv4-mapped-IPv6 ให้โชว์ IP สวยๆ
        // fire-and-forget — ไม่บล็อก request
        UserActivity.updateOne(
            { sessionKey: key },
            { $set: {
                userID: tokenSet.userID, ip,
                appName: tokenSet.appName, appVer: tokenSet.appVer,
                browser: tokenSet.browser, browserVer: tokenSet.browserVer,
                deviceType: tokenSet.deviceType, os: tokenSet.os, osVer: tokenSet.osVer,
                lastSeen: new Date(),
            }, $setOnInsert: { loginAt: new Date() } },
            { upsert: true }
        ).catch(() => {});
    } catch { /* ไม่ให้กระทบ auth */ }
}

// const Session1hr = require('../models/m-session1hrs');  // check this for current login

// const Session1y = require('../models/m-session1ys');
// const moment = require('moment-timezone');

// const uclassPass = process.env.uclassPass.split(","); // class can pass everywhere

module.exports = async (req, res, next) => {
  try {
    // console.log('****************Auth********************');
    // console.log(process.env.JWT_KEY);
    // console.log(req);
    // console.log('****************Auth********************');
    // console.log(req.headers);
    // console.log(req.headers.authorization);

    let token = '';
    let userIDEncrypt = '';
    let uuid5Encrypt = '';
    // console.log(req);
    // const referer = req.headers.referer
    // const getUserStr = referer.substring(referer.length-5, referer.length);
    // console.log(req);
    // console.log(req.socket.parser.incoming.rawHeaders);
    // console.log('auth zone');

    // console.log(req.headers);
    if (req.headers.tkimg) {  // ## from upload images
      // console.log(req.headers);
      // console.log('from upload images');
      token = req.headers.tkimg;
      userIDEncrypt = req.headers.userIDEncrypt;
      uuid5Encrypt = req.headers.uuid5Encrypt;
      req.imageData = {
        path: req.headers.path,
        userID: req.headers.userid,
        mode: req.headers.mode, // updateImageUserProfile ,updateImageMB, updateImageMBSold
        __idx: req.headers.__idx,
        folder: req.headers.folder,
        mydatajson: req.headers.mydatajson,
      };
      // console.log(req.imageData.mydatajson);
      // console.log(JSON.parse(req.imageData.mydatajson));
    } else {  // ## auth normal way
      // console.log('auth normal way');
      token = req.headers.authorization.split(" ")[1];
      userIDEncrypt = req.headers.authorization.split(" ")[2];
      uuid5Encrypt = req.headers.authorization.split(" ")[3];
      
      // console.log('token', token);
      // console.log('userIDEncrypt', userIDEncrypt);
      // console.log('uuid5Encrypt', uuid5Encrypt);
    }

    // console.log('****************Auth********************');
    // console.log('process.env.JWT_KEY_ACC', process.env.JWT_KEY_ACC);

    // const token = req.headers.authorization.split(" ")[1];
    // const userIDEncrypt = req.headers.authorization.split(" ")[2];
    // const uuid5Encrypt = req.headers.authorization.split(" ")[3]; JWT_KEY_ACC
    // const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const decodedToken = jwt.verify(token, process.env.JWT_KEY_ACC);
    // console.log('decodedToken', decodedToken);
    const tokenSet = {
      appName : decodedToken.appName,
      appVer: decodedToken.appVer, 
      userID: decodedToken.userID, 
      uuid5: decodedToken.uuid5, 
      browser: decodedToken.browser, 
      browserVer: decodedToken.browserVer, 
      deviceType: decodedToken.deviceType, 
      os: decodedToken.os, 
      osVer: decodedToken.osVer
    };
    req.userData = {
      tokenSet : tokenSet,
      uuid5Encrypt : uuid5Encrypt,
      userIDEncrypt : userIDEncrypt,
    };

    trackActivity(req, tokenSet);   // ## Monitor: บันทึกว่า user นี้ใช้งานอยู่ (throttle + fire-and-forget)

    // ## ป้องกัน login ซ้อน: ถ้า uuid5 นี้ไม่ใช่ session ล่าสุด → เด้งออก (มีคน login ที่อื่น)
    if (!(await isSessionValid(tokenSet.userID, tokenSet.uuid5))) {
      return res.status(401).json({
        message: { messageID: 'errs001', mode: 'sessionReplaced', value: 'บัญชีนี้ถูกเข้าใช้จากอุปกรณ์อื่น' },
        errid: 'session_replaced',
      });
    }

    // console.log('req.userData',req.userData);
    // console.log('tokenSet',tokenSet);
    // // ## check uuid5  and userID
    // if (userID != tokenSet.userID || uuid5 != tokenSet.uuid5) {
    //   return res.status(401).json({
    //     message: {
    //       messageID: 'errt001', 
    //       mode:'errToken', 
    //       value: "token problem error!"
    //     }
    //   });
    // }

    next();
  } catch (error) {
    // console.log(error);
    res.status(401).json({ message: "Auth failed!" , errid:"authfailed"});
  }
};
