const express = require("express");
// const Multer = require("multer");
// const { Storage } = require("@google-cloud/storage");

const mailController = require("../../controllers/user/c-mail");
// const checkAuth = require('../../middleware/check-auth');
// const checkUUID = require('../../middleware/check-uuid');
// const imageFindPath = require('../../middleware/image-find-path');
// const imageNameSet = require('../../middleware/image-name-set');
// const ShareFunc = require("../../controllers/c-api-app-share-function");

const router = express.Router();

// ##  /api/mail

// ## test send email
// /api/mail/test/sendmail
router.get("/test/tsendmail", mailController.getTestSendMail);

// /api/mail/signup/sendmail
// ## send mail when user signup
router.post("/signup/sendmail", mailController.postSignupSendMail);

// ## verify email user for sign up
router.post("/signup/verifyemail", mailController.postSignupVerifyMail);

// // ## create mail sign up
// router.post("/signup/sendmail", mailController.postSignupSendMail);

// // ## general info / starting data
// router.get("/generalinfo/:languageID", mailController.getGeneralInfo);

// // ## get language  / starting data
// router.get("/generalinfo/langdata/:languageID", mailController.getLangData);

// // // ## starting data
// // router.get("/startinginfo", mailController.getStartingInfo);

// // ## auth
// router.get("/login", checkAuth, checkUUID, mailController.getuserLogin);

// router.post("/signup", mailController.createUser);

// router.post("/login", mailController.userLogin);

// router.get("/uinfo/:userID", checkAuth, checkUUID, mailController.getuserInfo);

// router.post("/logout", mailController.userLogout);


// // ## user company

// // ## create new company 
// router.post("/create/company", checkAuth, checkUUID, mailController.createUserCompany);

// // ## get user company 
// router.get("/get/company/:userID/:page/:limit", checkAuth, checkUUID, mailController.getUserCompany);

// // ## get user company 1 "/get1/company/:companyID"
// router.get("/get1/company/:companyID", checkAuth, checkUUID, mailController.getCompany1);

// // ## user factory

// // ## create new factory 
// router.post("/create/factory", checkAuth, checkUUID, mailController.createUserFactory);

// // ## get  user  factory by userID companyID
// router.get("/get/factory/:userID/:companyID/:page/:limit", checkAuth, checkUUID, mailController.getUserFactory);

// // ## get  user  factory by  companyID factoryID
// router.get("/get1/factory/:companyID/:factoryID", checkAuth, checkUUID, mailController.getFactory1);

module.exports = router;
