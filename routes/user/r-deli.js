const express = require("express");

const deliController = require("../../controllers/user/c-deli");
const checkAuth = require('../../middleware/check-auth');
const checkUUID = require('../../middleware/check-uuid');
const imageFindPath = require('../../middleware/image-find-path');
const imageNameSet = require('../../middleware/image-name-set');



const router = express.Router();

// ## get carton list 
router.get("/deli1/dcartons/:companyID", checkAuth, checkUUID, deliController.getDCartons);

router.put("/deli3/dcarton/update", checkAuth, checkUUID, deliController.putCartonUpdate);

router.post("/deli5/dcarton/createnew", checkAuth, checkUUID, deliController.postDCartonCreateNew);

// ## get country list 
router.get("/deli2/dcountries/:companyID", checkAuth, checkUUID, deliController.getDCountries);

router.put("/deli4/dcountry/update", checkAuth, checkUUID, deliController.putCountryUpdate);

router.post("/deli6/dcountry/createnew", checkAuth, checkUUID, deliController.postDCountryCreateNew);


// ## dPacking

router.get("/deli8/dPacking/get/:companyID/:seasonYear/:dStatus", checkAuth, checkUUID, deliController.getDPackings);

router.post("/deli7/dPacking/createnew", checkAuth, checkUUID, deliController.postDPackingCreateNew);

// ## get dPacking list 
// router.get("/deli01/dpackings/:companyID/:seasonYear", checkAuth, checkUUID, deliController.getDPackings);

module.exports = router;
