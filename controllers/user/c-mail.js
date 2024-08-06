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
// ## general



// ## general
// #######################################################################################################


// #######################################################################################################
// ## mail

// ## http://192.168.1.36:3968/api/user/test/mail/test1
exports.postSignupSendMail2 = async (req, res, next) => {
  // try {} catch (err) {}
  // const data = req.body;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    // ## 
    const uuid = uuidv4();
    const email = 'heng067@gmail.com';

    // ##  signup SendMail()
    const signupSendMail = await ShareFunc.signupSendMail(email, uuid);

    
    // console.log(uuid);
    
    // // ## create mail signup lifetime 60 mn 
    // const mailSignupUpsert = await MailSignup.updateOne({$and: [
    //   {"email":email},
    // ]} , 
    // {$set:{
    //   "uuid": uuid,
    //   "createdAt": new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'))
    // }}, {upsert: true}); 

    // res.status(200).json({
    //   message: {
    //     messageID: 'complete', 
    //     mode:'complete', 
    //     value: "send email completed"
    //   },
    //   success: true
    // });
    console.log('OK test sent email');
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>test sent email</title><head>');
    res.write('<body>');
    res.write('<h1>    </h1></br>');
    res.write('<h1>  </h1>');
    res.write('<h1>'+ ' OK '+'</h1>');
    res.write('</body>');
    res.write('</html>');
    return res.end();

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errml001', 
        mode:'errSendMailSignup', 
        value: "error send mail signup"
      },
      success: false
    });
  }
}

// // ## send mail when user signup
// router.post("/signup/sendmail", mailController.postSignupSendMail);
exports.postSignupSendMail = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    // ## 
    const uuid = uuidv4();
    const email = data.email;

    // ##  signup SendMail()
    const signupSendMail = await ShareFunc.signupSendMail(email, uuid);

    
    // console.log(uuid);
    
    // ## create mail signup lifetime 60 mn 
    const mailSignupUpsert = await MailSignup.updateOne({$and: [
      {"email":email},
    ]} , 
    {$set:{
      "uuid": uuid,
      "createdAt": new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'))
    }}, {upsert: true}); 

    res.status(200).json({
      message: {
        messageID: 'complete', 
        mode:'complete', 
        value: "send email completed"
      },
      success: true
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errml001', 
        mode:'errSendMailSignup', 
        value: "error send mail signup"
      },
      success: false
    });
  }
}

// // ## verify email user for sign up
// router.post("/signup/verifyemail", mailController.postSignupVerifyMail);
exports.postSignupVerifyMail = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    // ## 
    const uuid = data.uuid;

    // ##  signup SendMail() check exist
    const signupSendMailExisted = await ShareFunc.isSignupSendMailExist(uuid);
    console.log(signupSendMailExisted);
    if (signupSendMailExisted.length>0) {
      const userID = signupSendMailExisted[0].email;

      // ## delete field createAt@users
      const unsetCreateAtUsers = await ShareFunc.unsetCreateAtUsers(userID);

      // ## delete mail signup by uuid
      const delSignupSendMail = await ShareFunc.delSignupSendMail(uuid);

      res.status(200).json({
        message: {
          messageID: 'complete verified', 
          mode:'completeVerified', 
          value: "verify completed"
        },
        success: true
      });
    } else {
      return res.status(422).json({
        message: {
          messageID: 'errml002-1', 
          mode:'errSendMailVerifynotExist', 
          value: "error send mail verify not exist"
        },
        success: false
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'errml002', 
        mode:'errSendMailVerify', 
        value: "error send mail verify"
      },
      success: false
    });
  }
}



// // // ## get customer1 /api/customer/getlist1/:companyID/:userID/:customerID    getCustomer
// // router.get("/getlist1/:companyID/:userID/:customerID", checkAuth, checkUUID, cusController.getCustomer);
// exports.getCustomer = async (req, res, next) => {
//   // try {} catch (err) {}
//   const companyID = req.params.companyID;
//   const userID = req.params.userID;
//   const customerID = req.params.customerID;

//   try {
//     // ## get 1 customer
//     // exports.getCustomer= async (companyID, customerID)
//     const customer = await ShareFunc.getCustomer(companyID, customerID);

//     await ShareFunc.upsertUserSession1hr(userID);
//     const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
//     res.status(200).json({
//       token: token,
//       expiresIn: process.env.expiresIn,
//       userID: userID,
//       customer: customer
//     });

//   } catch (err) {
//     console.log(err);
//     return res.status(501).json({
//       message: {
//         messageID: 'errcus003', 
//         mode:'errcustomerList1', 
//         value: "error get customer 1"
//       }
//     });
//   }
// }


// // // ## get customer list /api/customer/getlist/:companyID/:userID/:page/:limit   getCustomers
// // router.get("/getlist/:companyID/:userID/:page/:limit", checkAuth, checkUUID, cusController.getCustomers);
// exports.getCustomers = async (req, res, next) => {
//   // try {} catch (err) {}
//   const companyID = req.params.companyID;
//   const userID = req.params.userID;
//   const page = +req.params.page;
//   const limit = +req.params.limit;

//   try {
//     // exports.getCustomers= async (companyID, page, limit)
//     const customers = await ShareFunc.getCustomers(companyID, page, limit);

//     await ShareFunc.upsertUserSession1hr(userID);
//     // console.log(req.userData.tokenSet);
//     const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

//     res.status(200).json({
//       token: token,
//       expiresIn: process.env.expiresIn,
//       userID: userID,
//       customers: customers,
//       // factory: factory
//     });

//   } catch (err) {
//     console.log(err);
//     return res.status(501).json({
//       message: {
//         messageID: 'errcus001', 
//         mode:'errCustomerList', 
//         value: "error get customer list"
//       }
//     });
//   }
// }



// ## mail
// #############################################################