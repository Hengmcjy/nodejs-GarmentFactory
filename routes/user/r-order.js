const express = require("express");

const orderController = require("../../controllers/user/c-order");
const checkAuth = require('../../middleware/check-auth');
const checkUUID = require('../../middleware/check-uuid');
const imageFindPath = require('../../middleware/image-find-path');
const imageNameSet = require('../../middleware/image-name-set');



const router = express.Router();

// order2

// ## get order1
router.get("/order/getlist1/:companyID/:userID/:orderID", checkAuth, checkUUID, orderController.getOrder);

// ## get order list /api/order/getlist/:companyID/:userID/:page/:limit
router.get("/getlist/:companyID/:userID/:page/:limit", checkAuth, checkUUID, orderController.getOrders);

// ## get order list /api/order/getlist2/:companyID/:userID/:orderids  getOrdersByOrderIDs
router.get("/getlist2/:companyID/:userID/:orderids", checkAuth, checkUUID, orderController.getOrdersByOrderIDs);

// ## get order list /api/order/getlist3/:companyID/:userID/:orderids  getOrdersByOrderIDs
router.get("/getlist3/:companyID/:userID/:orderids/:orderStatus", checkAuth, checkUUID, orderController.getOrdersZoneStyleSizeByOrderIDs);

// ## /api/order/creataenew
router.post("/createnew", checkAuth, checkUUID, orderController.postOrderCreateNew);

// ## /api/order/update
router.put("/update", checkAuth, checkUUID, orderController.putOrderUpdate);

// ## /api/order/update2/setzone
router.put("/update2/setzone", checkAuth, checkUUID, orderController.putOrderZoneUpdate);

// ## /api/order/update2/setcolor
router.put("/update3/setcolor", checkAuth, checkUUID, orderController.putOrderColorUpdate);

// // ## /api/order/orderProduction/createnew
// router.post("/orderProduction/createnew", checkAuth, checkUUID, orderController.postOrderProductionCreateNew);

// ## /api/order/orderProductionQueue/createnew   postOrderProductionQueueCreateNew
router.post("/orderProductionQueue/createnew", checkAuth, checkUUID, orderController.postOrderProductionQueueCreateNew);

// ## /api/order2/orderProductionQueues/lists/createnew   postOrderProductionQueuesCreateNew
router.post("/order2/orderProductionQueues/lists/createnew", checkAuth, checkUUID, orderController.postOrderProductionQueuesCreateNew);

// ## get getProductionQueueBarcodeSumQty
router.get("/order3/getsumqty/queue/:companyID/:orderID/:productID", 
      checkAuth, checkUUID, orderController.getProductionQueueBarcodeSumQty);

// ## get last n record production queue by barcodeNo
router.get("/lastProduction/getlists/:companyID/:orderID/:productID/:productBarcode/:page/:limit", 
      checkAuth, checkUUID, orderController.getLastProductionQueueBarcode);

// ## get last n record production queue 
router.get("/lastProduction/getlists/:companyID/:orderID/:productID/:page/:limit", 
            checkAuth, checkUUID, orderController.getProductionQueue);

// ## get last running number order production  return last number
router.get("/lastroderProduction/runningno/:companyID/:orderID/:productID/:productBarcode", 
            checkAuth, checkUUID, orderController.getLastNoOrderProductionBarcode);
        
//
router.get("/order4/:companyID/:style/:ordertatus", checkAuth, checkUUID, orderController.getCompanyOrderByStyle);



// ## for worker scan zone  for work station





            
// ## get orders
// router.get("/login", checkAuth, checkUUID, orderController.getuserLogin);

// router.post("/signup", orderController.createUser);

// router.post("/login", orderController.userLogin);

// router.get("/uinfo/:userID", checkAuth, checkUUID, orderController.getuserInfo);

// router.post("/logout", orderController.userLogout);


// // ## user company

// // ## create new company 
// router.post("/create/company", checkAuth, checkUUID, orderController.createUserCompany);

// // ## get user company 
// router.get("/get/company/:userID/:page/:limit", checkAuth, checkUUID, orderController.getUserCompany);

// // ## user factory

// // ## create new factory 
// router.post("/create/factory", checkAuth, checkUUID, orderController.createUserFactory);

// // ## get  user  factory by userID companyID
// router.get("/get/factory/:userID/:companyID/:page/:limit", checkAuth, checkUUID, orderController.getUserFactory);


module.exports = router;
