const express = require("express");

const cusController = require("../../controllers/user/c-customer");
const checkAuth = require('../../middleware/check-auth');
const checkUUID = require('../../middleware/check-uuid');
const imageFindPath = require('../../middleware/image-find-path');
const imageNameSet = require('../../middleware/image-name-set');



const router = express.Router();



// ## get customer1 /api/customer/getlist1/:companyID/:userID/:customerID    getCustomer
router.get("/getlist1/:companyID/:userID/:customerID", checkAuth, checkUUID, cusController.getCustomer);

// ## get customer list /api/customer/getlist/:companyID/:userID/:page/:limit   getCustomers
router.get("/getlist/:companyID/:userID/:page/:limit", checkAuth, checkUUID, cusController.getCustomers);

// ## /api/customer/creataenew      postCustomerCreateNew
router.post("/createnew", checkAuth, checkUUID, cusController.postCustomerCreateNew);

// ## get orders
// router.get("/login", checkAuth, checkUUID, cusController.getuserLogin);

// router.post("/signup", cusController.createUser);

// router.post("/login", cusController.userLogin);

// router.get("/uinfo/:userID", checkAuth, checkUUID, cusController.getuserInfo);

// router.post("/logout", cusController.userLogout);


// // ## user company

// // ## create new company 
// router.post("/create/company", checkAuth, checkUUID, cusController.createUserCompany);

// // ## get user company 
// router.get("/get/company/:userID/:page/:limit", checkAuth, checkUUID, cusController.getUserCompany);

// // ## user factory

// // ## create new factory 
// router.post("/create/factory", checkAuth, checkUUID, cusController.createUserFactory);

// // ## get  user  factory by userID companyID
// router.get("/get/factory/:userID/:companyID/:page/:limit", checkAuth, checkUUID, cusController.getUserFactory);


module.exports = router;
