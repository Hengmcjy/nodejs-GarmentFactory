const express = require("express");
// const Multer = require("multer");
// const { Storage } = require("@google-cloud/storage");

const reportController = require("../../controllers/user/c-report");
const checkAuth = require('../../middleware/check-auth');
const checkUUID = require('../../middleware/check-uuid');
// const imageFindPath = require('../../middleware/image-find-path');
// const imageNameSet = require('../../middleware/image-name-set');
// const ShareFunc = require("../../controllers/c-api-app-share-function");

const router = express.Router();

// ## last rep 10
// ##  /api/rep

// ###################################################################################################
// ## report node station ############################################################################

// ## get node getRepCurrentProductions
router.get("/noder/rep7/current/productions/period/c/:companyID/:productStatus/:orderStatus/:orderIDArr"
        , reportController.getRepCurrentProductionPeriod);
// // ##

// ## get node getRepCurrentProductions
router.get("/noder/rep8/current/productions/zoneperiod/c/:companyID/:productStatus/:orderStatus/:orderIDArr/:seasonYear"
        , reportController.getRepCurrentProductionZonePeriod);
// // ##


// ## put/get  getRepCurrentProductionZonePeriodDate12
router.put("/noder/rep12/date12/productions/zoneperiod/c", reportController.getRepCurrentProductionZonePeriodDate12);
// // ##

// ## put/get  getRepCurrentProductionBundleStateDate12
router.put("/noder/rep14/date12/productions/bundle/state/c", reportController.getRepCurrentProductionBundleStateDate12);
// // ##

// ## put/get  getRepCurrentProductionBundleState
router.put("/noder/rep15/productions/bundle/state/c", reportController.getRepCurrentProductionBundleState);
// // ##

// ## put/get  getRepCurrentProductionBundleStateNo
router.put("/noder/rep16/productions/bundle/state/no/c", reportController.getRepCurrentProductionBundleStateNo);
// // ##

// ## put/get  getRepCurrentProductionBundleStateNo2
router.put("/noder/rep17/productions/bundle/state/no/c2", reportController.getRepCurrentProductionBundleStateNo2);
// // ##

// ## get node getRepCurrentProductions
router.get("/noder/rep6/current/productions/cfn/:companyID/:factoryID/:nodeID/:productStatus/:page/:limit"
        , reportController.getRepCurrentProductions);
// // ##

// ## get node getRepCurrentProductQueue
router.get("/noder/rep5/current/productqueue/cf/:companyID/:factoryID/:productIDArr/:page/:limit"
        , reportController.getRepCurrentProductQueue);
// // ##

// ## get node getRepCurrentProductQtyCFN
router.get("/noder/rep1/current/productqty/cfn/:companyID/:factoryID/:nodeID/:productStatus/:repListName/:seasonYears"
        , reportController.getRepCurrentProductQtyCFN);
// // ##

// ## get node getRepCurrentProductQtyAllCFNode
router.get("/node/rep5/current/productqty/all/cfnode/:companyID/:factoryIDArr/:productStatus/:orderIDArr",
         reportController.getRepCurrentProductQtyAllCFNode);
// ##

// ## get node getRepCurrentProductQtyAllCF
router.get("/node/rep2/current/productqty/all/cf/:companyID/:factoryIDArr/:ordertatus/:productStatus/:orderIDArr",
        checkAuth, checkUUID, reportController.getRepCurrentProductQtyAllCF);
// ##

// ## get node getRepCurrentProductQtyAllCFactory
router.get("/node/rep4/current/productqty/all/cf/:companyID/:factoryIDArr/:productStatus/:orderIDArr",
        checkAuth, checkUUID, reportController.getRepCurrentProductQtyAllCFactory);
// ##

// ## get node getRepCurrentProductQtyCom
router.get("/node/rep3/current/productqty/com/:companyID/:factoryIDArr/:ordertatus/:productStatus/:orderIDArr/:seasonYear", checkAuth, checkUUID, 
        reportController.getRepCurrentProductQtyCom);
// // ##

// ## get node getRepCNCurrentProductQtyNode
router.get("/node/rep11/cn/current/productqty/:companyID/:factoryIDArr/:ordertatus/:productStatus/:orderIDArr/:toNodeArr", checkAuth, checkUUID, 
        reportController.getRepCNCurrentProductQtyNode);
// // ##

// ## get node getRepCurrentProductionOverview
router.get("/node/rep9/current/productqty/com/:companyID/:factoryIDArr/:ordertatus/:productStatus/:orderIDArr/:seasonYear", checkAuth, checkUUID, 
        reportController.getRepCurrentProductionOverview);
// // ##


// ## get node getRepNodeStaffScannedByDate12
router.get("/node/scan1/rep/CF/staff/:companyID/:factoryIDArr/:orderIDsArr/:date12/:infoType", checkAuth, checkUUID, 
        reportController.getRepNodeStaffScannedByDate12);
// // ##


// ## report node station ############################################################################
// ###################################################################################################

// ###################################################################################################
// ## report outsource ############################################################################

router.get("/cpn/rep10/current/order/:companyID/:ordertatus/:orderIDArr/:seasonYear/:type"
        , checkAuth, checkUUID, reportController.getRepCompanyOrderOutsource);

// ##
router.get("/node/outs/rep10/CF/:companyID/:ordertatus/:orderIDArr/:seasonYear", reportController.getRepCompanyOrderOutsource2);

router.get("/cpn/rep14/current/order/state/:companyID/:ordertatus/:orderIDArr/:seasonYear/:type", 
        checkAuth, checkUUID, reportController.getRepCompanyOrderOutsourceState);

router.get("/cpn/rep14_2/current/order/state/:companyID/:ordertatus/:orderIDArr/:seasonYear/:type", 
        reportController.getRepCompanyOrderOutsourceState2);
//

// ## putEditSchedule01 = auto_getCurrentCompanyOrderOutsourceFac
router.put("/edit/productions/OutsourceState", reportController.putEditSchedule01);



// // ##
// router.get("/node/outs/rep14/statet/CF/:companyID/:ordertatus/:orderIDArr", reportController.getRepCompanyOrderOutsourceState);


// ## report outsource ############################################################################s
// ###################################################################################################


// ###################################################################################################
// ## report company ############################################################################

router.get("/cpn/rep1/current/order/:companyID/:ordertatus/:orderIDArr", checkAuth, checkUUID, reportController.getRepCompanyOrder);

router.get("/cpn/rep9/current/order/:companyID/:ordertatus/:orderID", checkAuth, checkUUID, reportController.getRepCompanyOrderByOrderID);


router.post("/cpn/rep/edit1/order/zoneperiod/qty", 
        checkAuth, checkUUID, reportController.postRepCompanyOrderZonePeriod);


router.get("/cpn/RepQTYEdit/current/seasonYear/:companyID/:seasonYear", 
        checkAuth, checkUUID, reportController.getRepQTYEditBySeasonYear);


// // ## 
// router.get("/cpn/rep2/current/orderstyle/:companyID/:ordertatus", checkAuth, checkUUID, reportController.getRepCompanyOrderStyle);

// ## report company ############################################################################
// ###################################################################################################


// ###################################################################################################
// ## report yarn  ############################################################################


// ## report yarn  ############################################################################
// ###################################################################################################

// ###################################################################################################
// ## report heng test ############################################################################

// ## getHengtestRep1
router.get("/hengtest/rep1", checkAuth, checkUUID, reportController.getHengtestRep1);

// ## report heng test ############################################################################
// ###################################################################################################



// ###################################################################################################
// ## report worker report ############################################################################

// // ## get 

// // ##

// ## report worker report ############################################################################
// ###################################################################################################

// /api/mail/signup/sendmail
// // ## send mail when user signup
// router.post("/signup/sendmail", reportController.postSignupSendMail);

// // ## verify email user for sign up
// router.post("/signup/verifyemail", reportController.postSignupVerifyMail);

// // ## create mail sign up
// router.post("/signup/sendmail", reportController.postSignupSendMail);

// // ## general info / starting data
// router.get("/generalinfo/:languageID", reportController.getGeneralInfo);

// // ## get language  / starting data
// router.get("/generalinfo/langdata/:languageID", reportController.getLangData);

// // // ## starting data
// // router.get("/startinginfo", reportController.getStartingInfo);

// // ## auth
// router.get("/login", checkAuth, checkUUID, reportController.getuserLogin);

// router.post("/signup", reportController.createUser);

// router.post("/login", reportController.userLogin);

// router.get("/uinfo/:userID", checkAuth, checkUUID, reportController.getuserInfo);

// router.post("/logout", reportController.userLogout);


// // ## user company

// // ## create new company 
// router.post("/create/company", checkAuth, checkUUID, reportController.createUserCompany);

// // ## get user company 
// router.get("/get/company/:userID/:page/:limit", checkAuth, checkUUID, reportController.getUserCompany);

// // ## get user company 1 "/get1/company/:companyID"
// router.get("/get1/company/:companyID", checkAuth, checkUUID, reportController.getCompany1);

// // ## user factory

// // ## create new factory 
// router.post("/create/factory", checkAuth, checkUUID, reportController.createUserFactory);

// // ## get  user  factory by userID companyID
// router.get("/get/factory/:userID/:companyID/:page/:limit", checkAuth, checkUUID, reportController.getUserFactory);

// // ## get  user  factory by  companyID factoryID
// router.get("/get1/factory/:companyID/:factoryID", checkAuth, checkUUID, reportController.getFactory1);

module.exports = router;
