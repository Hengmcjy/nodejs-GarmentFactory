const express = require("express");

const yarnController = require("../../controllers/user/c-yarn");
const checkAuth = require('../../middleware/check-auth');
const checkUUID = require('../../middleware/check-uuid');
// const imageFindPath = require('../../middleware/image-find-path');
// const imageNameSet = require('../../middleware/image-name-set');



const router = express.Router();

// // ## get yarn list /api/product/getlist1/:companyID/:userID/:productID
// router.get("/getlist1/:companyID/:userID/:productID", checkAuth, checkUUID, yarnController.getYarn);

// ## get yarn list /api/yarn/getlists/:companyID/:userID
router.get("/getlists/:companyID/:userID", checkAuth, checkUUID, yarnController.getYarnsList);

// ## get yart info for create new
router.get("/getinfo1/:companyID/:factoryID/:customerID/:setName/:yarnSeason", checkAuth, checkUUID, yarnController.getYarnInfo1);



// #############################################################################
// ## yarn plan ###########################################################################

// ## get yarn plan list /api/yarn/yarnplan/list/:companyID/:factoryID/:customerID/:setName/:yarnSeason getYarPlansList
router.get("/yarnplan/list/main/:companyID/:factoryID/:customerID/:setName/:yarnSeason/:orderIDs", 
  checkAuth, checkUUID, yarnController.getYarPlansList);

// ## get yarn plan list /api/yarn/yarnplan/get/list1 getYarnPlansList1
router.post("/yarnplan/get/list1", 
  checkAuth, checkUUID, yarnController.getYarnPlansList1);

// ## /api/yarn/yarnplan/createnew   postYarnPlanCreateNew
router.post("/yarnplan/createnew", checkAuth, checkUUID, yarnController.postYarnPlanCreateNew);

// ## /api/yarn/yarnplan/yarnDataInfo    putYarnPlanDataInfo
router.put("/yarnplan/yarnDataInfo", checkAuth, checkUUID, yarnController.putYarnPlanDataInfo);

// ## /api/yarn/yarnpackinglist1/add   putAddYarnPackingList1
router.put("/yarnpackinglist1/add", checkAuth, checkUUID, yarnController.putAddYarnPackingList1);

// ## /api/yarn/yarnpackinglist1/cancel   putCancelYarnPackingList1
router.put("/yarnpackinglist1/cancel", checkAuth, checkUUID, yarnController.putCancelYarnPackingList1);

// ## /api/yarn/yarnpackageInfo/del   putDelYarnPackingList1
router.put("/yarnpackageInfo/del", checkAuth, checkUUID, yarnController.putDelYarnPackingList1);

// ## /api/yarn/yarnlotID/add putAddYarnLotID1
router.put("/yarnlotID/add", checkAuth, checkUUID, yarnController.putAddYarnLotID1);

// ## /api/yarn/yarnlotID/edit putEditYarnLotID1
router.put("/yarnlotID/edit", checkAuth, checkUUID, yarnController.putEditYarnLotID1);

// ## /api/yarn/yarnlotID2/edit/state putEditYarnLotIDState2
router.put("/yarnlotID2/edit/state", checkAuth, checkUUID, yarnController.putEditYarnLotIDState2);

// ## get yarn plan list /api/yarn/usage/list
// ## getYarnUsage
router.put("/usage/list", checkAuth, checkUUID, yarnController.getYarnUsage);

// ## getYarnLotInfo
router.put("/yarnlotID/getinfo", checkAuth, checkUUID, yarnController.getYarnLotInfo);

// ## getYarnLotBoxLastStr
router.put("/yarnlotbox/get/box/last/str", checkAuth, checkUUID, yarnController.getYarnLotBoxLastStr);

module.exports = router;


