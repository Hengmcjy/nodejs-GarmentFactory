const express = require("express");
const Multer = require("multer");
const { Storage } = require("@google-cloud/storage");

// const mailController = require("../../controllers/user/c-mail");
// const reportController = require("../../controllers/user/c-report");
const userAController = require("../../controllers/user/c-acc-user");
const checkAuthA = require('../../middleware/check-authA');
const checkUUID = require('../../middleware/check-uuid');
// const imageFindPath = require('../../middleware/image-find-path');
// const imageNameSet = require('../../middleware/image-name-set');
// const ShareFunc = require("../../controllers/c-api-app-share-function");







const router = express.Router();

// ## http://localhost:3022/api/user/test/test
// ## http://192.168.1.30:3022/api/user/test/test
// ## test

// #############################################################
// ## user for Acc Fin



// ## http://192.168.1.33:3968/api/a/user/acc/signup
router.post("/acc/signup", userAController.createAUser);

// ## http://192.168.1.33:3968/api/a/user/acc/login
router.post("/acc/login", userAController.userALogin);

// ## logout — เคลียร์ activeSessionKey (ป้องกัน login ซ้อน) เฉพาะถ้าเป็นเครื่องนี้เอง
router.post("/acc/logout", checkAuthA, userAController.userALogout);

// ## http://192.168.1.33:3968/api/a/user/acc/edit1/pass
router.put("/acc/edit1/pass", userAController.editAPassFactoryStaff);

router.get("/acc/uinfo/:userID", checkAuthA, checkUUID, userAController.getuserAInfo);


// #############################################################
// ## worker

// ## create Worker
// ## http://192.168.1.33:3968/api/a/user/create/worker
router.post('/create/worker', checkAuthA, checkUUID, userAController.createWorker);

// ## put  Worker  image
// ## http://192.168.1.33:3968/api/a/user/edit/workerpic
router.put('/edit/workerpic', checkAuthA, checkUUID, userAController.workerpic);


// ## order zone  ##########################################################################

router.get("/acc/orders/:companyID/:seasonYear", checkAuthA, checkUUID, userAController.getOrdersSeasonYear);

router.get("/acc/subnodecostseason/:companyID/:factoryID/:orderID/:seasonYear", 
        checkAuthA, checkUUID, userAController.getOrderSubnodeCostSeason);

// postOrderSubNodeFlowSetCost
router.post("/acc/edit/OrderSubNodeFlowSetCost", 
        checkAuthA, checkUUID, userAController.postOrderSubNodeFlowSetCost);




// ## hr zone  ############################################################################

router.get("/hr/emplist/:companyID/:factoryID/:status/:type/:state/:page/:limit", 
                checkAuthA, checkUUID, userAController.getEmpList);

// ## get EmpList LK %text%
router.get("/hr/emplist/lk/:companyID/:factoryID/:status/:type/:state/:page/:limit", 
                checkAuthA, checkUUID, userAController.getEmpListLK);


// ## updateWorker
router.put("/hr/worker", checkAuthA, checkUUID, userAController.updateWorker);



// ## admin zone  ############################################################################








module.exports = router;
