const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const CryptoJS = require('node-cryptojs-aes').CryptoJS;

const ShareFunction = require('../controllers/api/c-api-share-function');
const moment = require('moment-timezone');

const uclassPass = process.env.uclassPass.split(","); // class can pass everywhere
// const uclassPass = ['spu','adm','own','mng']; // class can pass everywhere
const lifeTime = 60; // ## 60 minutes

module.exports = async (req, res, next) => {
  // console.log('checkCustomerAllow');
  try {
    // 10. 
    // 20. get user data
    // 30. check user class
    //    30.1 if adm, own can acccess 
    // console.log('req.body');
    // console.log(req.body);
    // console.log(req.userData);
    
    let canLoginByUserClass = false;
    reqBody = req.body;
    // console.log(reqBody.userID);
    if (req.userData) { 
      reqBody = req.userData; 
      reqBody.userClassID = reqBody.uclass;
      // console.log(reqBody);
    } else {
      const userf = await ShareFunction.findUser(reqBody.companyID, reqBody.userID);
      if (userf.length > 0) {reqBody.userClassID = userf[0].userClass.userClassID; 
      } else {reqBody.userClassID = 'noneClass'; }
      // console.log(reqBody);
    }
    // console.log(reqBody);

    // console.log(reqBody , uclassPass);
    const userIDx = req.params.userIDx;
    // console.log('userIDx  = ' + userIDx);
    allowByCustomer = await ShareFunction.checkCustomerAllowCheckInfo(reqBody, userIDx);
    // console.log('allowByCustomer  = ' + allowByCustomer);

    const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
    const allowDate = allowByCustomer.allowDate;
    const allowExpandTime = new Date(moment(allowDate).tz('Asia/Bangkok').add(lifeTime, 'm').format('YYYY/MM/DD HH:mm:ss+07:00'));
    inAllowTime = current < allowExpandTime;
    // console.log(allowDate , allowExpandTime , current);
    // console.log('inAllowTime  = ' + inAllowTime);

    // console.log('reqBody.userClassID  = ' + reqBody.userClassID);
    const checkClassExist = uclassPass.includes(reqBody.userClassID);
    // console.log('checkClassExist  = ' + checkClassExist);

    if ((allowByCustomer.allow && inAllowTime) || checkClassExist) {
      next();
    } else {
    // if (!allowByCustomer.allow && !checkClassExist && !inAllowTime) {
      return  res.status(404).json({
        message: "Scope Err!", errid:"acustomerallowscopefailed"
      });
    }
    //////////////////////////////////////////////
    // next();
  } catch (error) {
    res.status(401).json({ message: "IIqpII User Allow failed!" });
  }
};
