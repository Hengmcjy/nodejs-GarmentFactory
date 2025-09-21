const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
// const CryptoJS = require('node-cryptojs-aes').CryptoJS;
const CryptoJS = require("crypto-js");

// const Session1hr = require('../models/m-session1hrs');  // check this for current login

// const Session1y = require('../models/m-session1ys');
// const moment = require('moment-timezone');

// const uclassPass = process.env.uclassPass.split(","); // class can pass everywhere

module.exports = async (req, res, next) => {
  try {
    // console.log('****************Auth********************');
    // console.log(process.env.JWT_KEY);

    // console.log('999',req.userData);
    const tokenSet = req.userData.tokenSet;

    const userIDEncrypt = req.userData.userIDEncrypt;
    const uuid5Encrypt = req.userData.uuid5Encrypt;
    // console.log(userIDEncrypt,'-----------------',uuid5Encrypt);

    const decryptUserID = CryptoJS.AES.decrypt(userIDEncrypt.trim(), process.env.passEncryt.trim()).toString(CryptoJS.enc.Utf8);
    const decryptUUID5 = CryptoJS.AES.decrypt(uuid5Encrypt.trim(), process.env.passEncryt.trim()).toString(CryptoJS.enc.Utf8);
    // console.log(decryptUserID,'-----------------',decryptUUID5);

    // ## check uuid5  and userID
    if (decryptUserID != tokenSet.userID || decryptUUID5 != tokenSet.uuid5) {
      return res.status(401).json({
        message: {
          messageID: 'errt001', 
          mode:'errToken', 
          value: "token problem error!"
        }
      });
    }

    next();
  } catch (error) {
    // console.log(error);
    res.status(401).json({ message: "Auth failed!" , errid:"authfailed"});
  }
};
