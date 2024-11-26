const express = require("express");

const orderController = require("../../controllers/user/c-order");
const checkAuth = require('../../middleware/check-auth');
const checkUUID = require('../../middleware/check-uuid');
const imageFindPath = require('../../middleware/image-find-path');
const imageNameSet = require('../../middleware/image-name-set');



const router = express.Router();

// order2



// ## get order / seasonYears
router.get("/order/getlist4/seasonyearslist/:companyID/:userID", checkAuth, checkUUID, orderController.getOrderSeasonYears);

// ## get order1
router.get("/order/getlist1/:companyID/:userID/:orderID", checkAuth, checkUUID, orderController.getOrder);

// ## get order all style
router.get("/order5/getlist/:companyID/:orderStatus/:userID", checkAuth, checkUUID, orderController.getOrderStyles);

// ## get order list /api/order/getlist/:companyID/:userID/:page/:limit
router.get("/getlist/:companyID/:userID/:page/:limit/:seasonyear", checkAuth, checkUUID, orderController.getOrders);

// ## get order list /api/order/getlist2/:companyID/:userID/:orderids  getOrdersByOrderIDs
router.get("/getlist2/:companyID/:userID/:orderids", orderController.getOrdersByOrderIDs);

// ## get order list /api/order/getlist3/:companyID/:userID/:orderids  getOrdersZoneStyleSizeByOrderIDs
router.get("/getlist3/:companyID/:userID/:orderids/:orderStatus", checkAuth, checkUUID, orderController.getOrdersZoneStyleSizeByOrderIDs);

// ## get order list /api/order/getlist3/:companyID/:userID/:orderids  getOrdersZoneStyleSizeByOrderIDs
router.get("/getlist3-1/:companyID/:userID/:orderids/:orderStatus/:mode", orderController.getOrdersZoneStyleSizeByOrderIDs);

// ## /api/order/creataenew
router.post("/createnew", checkAuth, checkUUID, orderController.postOrderCreateNew);



// ## /api/order/update
router.put("/update", checkAuth, checkUUID, orderController.putOrderUpdate);

// ## /api/order/update/setting/maxqty
router.put("/update/setting/maxqty", checkAuth, checkUUID, orderController.putOrderMaxQTYUpdate);

// ## /api/order/update2/setzone
router.put("/update2/setzone", checkAuth, checkUUID, orderController.putOrderZoneUpdate);

// ## /api/order/update2/setcolor
router.put("/update3/setcolor", checkAuth, checkUUID, orderController.putOrderColorUpdate);

// ## /api/order/update3/setmaxqtyview   updateOrderMaxQtyView
router.put("/update3/setmaxqtyview", checkAuth, checkUUID, orderController.updateOrderMaxQtyView);

// ## /api/order/update4/qrcode/replacement
router.put("/update4/qrcode/replacement", checkAuth, checkUUID, orderController.putOrderProductionQrcodeReplacement);

// ## /api/order/update5/setSubNodeFlowCost
router.put("/update5/setSubNodeFlowCost", checkAuth, checkUUID, orderController.putOrderSubNodeFlowCostUpdate);
// router.put("/update5/setsubnodeflowcost", checkAuth, checkUUID, orderController.putOrderSubNodeFlowCostUpdate);

// getSubNodeFlowTypeList
router.get("/get/Order/SubNodeFlowType/list/:companyID/:userID",checkAuth, checkUUID, orderController.getSubNodeFlowTypeList);


router.get("/get/OrderLost/list/:companyID/:userID/:orderID",checkAuth, checkUUID, orderController.getOrderLostList);

// putOrderLost
router.put("/update/opd/lost/putOrderLost", checkAuth, checkUUID, orderController.putOrderLost);

// // ## /api/order/orderProduction/createnew
// router.post("/orderProduction/createnew", checkAuth, checkUUID, orderController.postOrderProductionCreateNew);

// ## /api/order/orderrewrite/orderqty/rewrite  putOrderProductionQtyRewrite
router.put("/orderrewrite/orderqty/rewrite", checkAuth, checkUUID, orderController.putOrderProductionQtyRewrite);

// ## /api/order/orderProductionQueue/createnew   postOrderProductionQueueCreateNew
router.post("/orderProductionQueue/createnew", checkAuth, checkUUID, orderController.postOrderProductionQueueCreateNew);

// ## /api/order/delorder1/orderProductionQueues/cancel  deleteOrderProductionQueuesCancel
router.post("/delorder1/orderProductionQueues/cancel", checkAuth, checkUUID, orderController.deleteOrderProductionQueuesCancel);

// ## /api/order2/orderProductionQueues/lists/createnew   postOrderProductionQueuesCreateNew
router.post("/order2/orderProductionQueues/lists/createnew", checkAuth, checkUUID, orderController.postOrderProductionQueuesCreateNew);

// ## get order list /api/order/getqlist1/:companyID/:userID/:orderID/:productBarcode/:page/:limit  getOrdersQueueList
router.get("/getqlist1/:companyID/:userID/:orderID/:productBarcode/:page/:limit", checkAuth, checkUUID, orderController.getOrdersQueueList);

// ## get order list /api/order/getqsetlist2/:companyID/:userID/:orderID/:page/:limit  getOrdersQueueSetList
router.get("/getqsetlist2/:companyID/:userID/:orderID/:page/:limit", checkAuth, checkUUID, orderController.getOrdersQueueSetList);

// ## get getProductionQueueBarcodeSumQty
router.get("/order3/getsumqty/queue/:companyID/:orderID/:productID", 
      checkAuth, checkUUID, orderController.getProductionQueueBarcodeSumQty);

// ## get last n record production queue by barcodeNo
router.get("/lastProduction/getlists/:companyID/:orderID/:productID/:productBarcode/:page/:limit", 
      checkAuth, checkUUID, orderController.getLastProductionQueueBarcode);

// ## get count productionqueue by bundleno
router.get("/get/orderProductionQueue1/getcount/:companyID/:orderID/:startNo/:endNo", 
      checkAuth, checkUUID, orderController.getProductionQueueCount);

// ## get list productionqueue by bundleno
router.get("/get/orderProductionQueue2/getlists/:companyID/:orderID/:startNo/:endNo", 
      checkAuth, checkUUID, orderController.getProductionQueueList);

// ## get all size each orderIDs  getOrderIDsSizes
router.get("/get/orderProductionQueuelist/getsizes/:companyID/:orderIDs", 
      checkAuth, checkUUID, orderController.getOrderIDsSizes);

// ## get last n record production queue 
router.get("/lastProduction/getlists/:companyID/:orderID/:productID/:page/:limit", 
            checkAuth, checkUUID, orderController.getProductionQueue);

// ## get last running number order production  return last number
router.get("/lastroderProduction/runningno/:companyID/:orderID/:productID/:productBarcode/:ver", 
            checkAuth, checkUUID, orderController.getLastNoOrderProductionBarcode);
        
//
router.get("/order4/:companyID/:style/:ordertatus/:productStatus/:orderIDArr", checkAuth, checkUUID, orderController.getCompanyOrderByStyle);

// productBarcode  startNO   endNo
router.get("/order7/getbundlenos/:companyID/:productBarcode/:startNO/:endNo", checkAuth, checkUUID, orderController.getOrderProductBundleNos);



// ## set qc to complete
router.put("/order8/oroderProduction/productBarcodeNo/qctocomplete", checkAuth, checkUUID, orderController.putOrderProductionBarcodeNoQCtoComplete);



// ## outsource tracking zone

// ## get bundle no by style , zone , color , size
router.get("/orderoutsourcetracking1/getlists/:companyID/:factoryID/:orderIDs/:productionNodeStatusArr", 
      checkAuth, checkUUID, orderController.getOrderOursourceTracking);
//

// ## 
router.get("/orderoutsourcetracking3/getlists/:companyID/:factoryID/:orderIDs/:productionNodeStatusArr/:bundleNoArr", 
      checkAuth, checkUUID, orderController.getOrderOursourceTrackingByBundleNos);
//

// ## /api/order/orderoutsourcetracking2/productionNode  upsertOrderProducctionNodeFlow
router.put("/orderoutsourcetracking2/productionNode", checkAuth, checkUUID, orderController.upsertOrderProducctionNodeFlow);

// router.get("/order8/getqrcodelist/:companyID/:factoryID/:page/:limit", checkAuth, checkUUID, orderController.getOrderProductQRCodeList);

// ## for worker scan zone  for work station

// #############################################################################
// ## bundle set for tracking ###########################################################################

// ##  getBundlesetgroups
router.get("/bundlesetgroup/getlists/:companyID/:userID/:orderID/:seasonYear", checkAuth, checkUUID, orderController.getBundlesetgroups);

// ## /api/order/bundlesetgroup/createnew   postBundleSetGroupCreateNew
router.post("/bundlesetgroup/createnew", checkAuth, checkUUID, orderController.postBundleSetGroupCreateNew);

// ## /api/order/bundlesetgroup/del  deleteBundleSetGroupDel
router.post("/bundlesetgroup/del", checkAuth, checkUUID, orderController.deleteBundleSetGroupDel);

router.put("/bundlesetgroup/completed", checkAuth, checkUUID, orderController.editBundleSetGroupComplete);


// #############################################################################
// ## view qrcode ###########################################################################

// ## 1. we have nodeID style zone color size





            
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
