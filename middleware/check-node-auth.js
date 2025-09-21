const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

// const Session1hr = require('../models/m-session1hrs');  // check this for current login

// const Session1y = require('../models/m-session1ys');
// const moment = require('moment-timezone');

// const uclassPass = process.env.uclassPass.split(","); // class can pass everywhere

module.exports = async (req, res, next) => {
  try {
    // console.log('****************Auth********************');
    // console.log(process.env.JWT_KEY);
    // console.log(req.headers.authorization);

    let token = '';
    let userIDEncrypt = '';
    let uuid5Encrypt = '';
    let nodeAuth = '';
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
        mydatajson: req.headers.mydatajson,
      };
      // console.log(req.imageData.mydatajson);
      // console.log(JSON.parse(req.imageData.mydatajson));
    } else {  // ## auth normal way
      // console.log('auth normal way');
      token = req.headers.authorization.split(" ")[1];
      userIDEncrypt = req.headers.authorization.split(" ")[2];
      uuid5Encrypt = req.headers.authorization.split(" ")[3];
      nodeAuth = req.headers.authorization.split(" ")[4];
    }

    // console.log('****************Auth********************');

    // const token = req.headers.authorization.split(" ")[1];
    // const userIDEncrypt = req.headers.authorization.split(" ")[2];
    // const uuid5Encrypt = req.headers.authorization.split(" ")[3];
    // const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    // const tokenSet = {
    //   appName : decodedToken.appName,
    //   appVer: decodedToken.appVer, 
    //   userID: decodedToken.userID, 
    //   uuid5: decodedToken.uuid5, 
    //   browser: decodedToken.browser, 
    //   browserVer: decodedToken.browserVer, 
    //   deviceType: decodedToken.deviceType, 
    //   os: decodedToken.os, 
    //   osVer: decodedToken.osVer
    // };
    req.userData = {
      nodeAuth : nodeAuth
    };

    // console.log('aaa',req.userData);
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
    res.status(401).json({ message: "Auth node station failed!" , errid:"authNodeStationfailed"});
  }
};
