const express = require("express");

const productController = require("../../controllers/user/c-product");
const checkAuth = require('../../middleware/check-auth');
const checkUUID = require('../../middleware/check-uuid');
const imageFindPath = require('../../middleware/image-find-path');
const imageNameSet = require('../../middleware/image-name-set');



const router = express.Router();

// ## get product list /api/product/getlist1/:companyID/:userID/:productID
router.get("/getlist1/:companyID/:userID/:productID", checkAuth, checkUUID, productController.getProduct);

// ## get product list /api/product/getlist/:companyID/:userID/:page/:limit
router.get("/getlist/:companyID/:userID/:page/:limit", checkAuth, checkUUID, productController.getProducts);

// ## /api/product/creataenew
router.post("/createnew", checkAuth, checkUUID, productController.postProductCreateNew);

// ## /api/product/get/image/profiles  postGetProductImageProfiles
router.post("/get/image/profiles", checkAuth, checkUUID, productController.postGetProductImageProfiles);

// ## /api/product/edit
router.put("/edit", checkAuth, checkUUID, productController.putEditProduct);

// // ## general info
// router.get("/generalinfo", productController.getGeneralInfo);

// // ## auth
// router.get("/login", checkAuth, checkUUID, c.getuserLogin);

// router.post("/signup", productController.createUser);

// router.post("/login", productController.userLogin);

// router.get("/uinfo/:userID", checkAuth, checkUUID, productController.getuserInfo);

// router.post("/logout", productController.userLogout);


// // ## user company

// // ## create new company 
// router.post("/create/company", checkAuth, checkUUID, productController.createUserCompany);

// // ## get user company 
// router.get("/get/company/:userID/:page/:limit", checkAuth, checkUUID, productController.getUserCompany);

// // ## user factory

// // ## create new factory 
// router.post("/create/factory", checkAuth, checkUUID, productController.createUserFactory);

// // ## get  user  factory by userID companyID
// router.get("/get/factory/:userID/:companyID/:page/:limit", checkAuth, checkUUID, productController.getUserFactory);


module.exports = router;
