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

// // ## /api/product/creataenew
// router.post("/createnew", checkAuth, checkUUID, yarnController.postProductCreateNew);

// // ## /api/product/get/image/profiles  postGetProductImageProfiles
// router.post("/get/image/profiles", checkAuth, checkUUID, yarnController.postGetProductImageProfiles);

// // ## /api/product/edit
// router.put("/edit", checkAuth, checkUUID, yarnController.putEditProduct);

module.exports = router;
