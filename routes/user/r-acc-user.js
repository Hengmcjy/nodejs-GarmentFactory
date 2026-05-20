const express = require("express");
const Multer = require("multer");
const { Storage } = require("@google-cloud/storage");

// const mailController = require("../../controllers/user/c-mail");
// const reportController = require("../../controllers/user/c-report");
const userAController = require("../../controllers/user/c-acc-user");
const checkAuth = require('../../middleware/check-auth');
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

// ## http://192.168.1.33:3968/api/a/user/acc/edit1/pass
router.put("/acc/edit1/pass", userAController.editAPassFactoryStaff);












module.exports = router;
