const express = require("express");

const nsController = require("../../controllers/user/c-node-station");
const reportController = require("../../controllers/user/c-report");
const checkAuth = require('../../middleware/check-auth');
const checkNodeAuth = require('../../middleware/check-node-auth');
const checkUUID = require('../../middleware/check-uuid');
const imageFindPath = require('../../middleware/image-find-path');
const imageNameSet = require('../../middleware/image-name-set');



const router = express.Router();

// ## /api/ns/

// ## get    factories by  companyID
router.get("/get/nodedatageneral/by/:companyID", nsController.getNodeDatageneral);

// ## get node stations
router.get("/node/lists/:companyID/:factoryID/:status/:page/:limit", checkAuth, checkUUID, nsController.getNodeStations);

// ## get node station1
router.get("/getnode1/:companyID/:factoryID/:status/:nodeID", checkAuth, checkUUID, nsController.getNodeStations1);


// ## /api/ns/nodeflow/creataenew
router.post("/nodeflow/createnew", checkAuth, checkUUID, nsController.postNodeFlowCreateNew);

// ## get node flow
router.get("/node/nodeflows/:companyID/:factoryID/:page/:limit", checkAuth, checkUUID, nsController.getNodeFlows);

// ## get node flow
router.get("/nodef/nodeflow/:companyID/:factoryID/:nodeFlowID", checkAuth, checkUUID, nsController.getNodeFlow);

// ## /api/ns/nodeflow/edit  editMode === 'flowType'  'flowCondition'  'flowSeq'
router.put("/nodeflow/edit", checkAuth, checkUUID, nsController.putNodeFlowEdit);

// // ## get order list /api/order/getlist/:companyID/:userID/:page/:limit
// router.get("/getlist/:companyID/:userID/:page/:limit", checkAuth, checkUUID, nsController.getOrders);

// ## /api/ns/node/creataenew
router.post("/node/createnew", checkAuth, checkUUID, nsController.postNodeStationCreateNew);

// ## /api/ns/node/edit
router.put("/node/edit", checkAuth, checkUUID, nsController.putNodeStationEdit);

// ## /api/ns/node2/edit/userpass/workstation
router.put("/node2/edit/userpass/workstation", checkAuth, checkUUID, nsController.putNodeUserPassStationEdit);

// ## /api/ns/node3/edit/uuid/workstation
router.put("/node3/edit/uuid/workstation", checkAuth, checkUUID, nsController.putNodeUUIDStationEdit);

// ## get check node user exist
router.get("/check/existuserid/:companyID/:factoryID/:nodeID/:checkuserID", 
  checkAuth, checkUUID, nsController.getCheckExistNodeCompanyFactoryUserID);

// ## get node nodeStationLoginRequest
router.get("/node4/list/usernodelogin", checkAuth, checkUUID, nsController.getNodeStationLoginRequest);

// ## delete  node nodeStationLoginRequest
router.post("/node5/del/nodeStationLoginRequest", checkAuth, checkUUID, nsController.delNodeStationLoginRequest);

// ## delete  node nodeStationLoginRequest  no auth
router.post("/node6/del/noauth/nodeStationLoginRequest", nsController.delNodeStationLoginRequestNoAuth);

// ## allow  node nodeStationLoginRequest
router.put("/node6/allow/nodeStationLoginRequest", checkAuth, checkUUID, nsController.putAllowNodeStationLoginRequest);

// ## get node nodeStationLoginRequest
router.get("/node9/getdata/nodelogin/:companyID/:factoryID/:nodeID/:status", nsController.getDataNodeStationLogin);

// ## get node getDataNodeStation
router.get("/node9-1/getdata/nodelogin/:companyID/:factoryID/:status", nsController.getDataNodeStation);

// ## put log out  node putLogoutNodeStation
router.put("/node7/logout/nodeStation",checkNodeAuth , nsController.putLogoutNodeStation);

// ## login  node nodeStation by uuid
router.post("/node8/del/nodeStationLoginByUUID", nsController.postLoginNodeStationByUUID);

// node10


// #########################################################################################
// ## worker zone 

// ## get node flow
router.get("/stf/nodef/nodeflow/:companyID/:factoryID/:nodeFlowID", nsController.stfGetNodeFlow)

router.get("/nodestation/lists/:companyID/:factoryID/:status/:page/:limit", nsController.getNodeStationsList);

// ## staff login to node workstation staffNodeLogin
router.post("/nodestation/staff/login", nsController.staffNodeLogin);



// ## get scan order production befor send product to next department putScanOrderProductionBarcodeNo
router.put("/scanroderProduction/productBarcodeNo", nsController.putScanOrderProductionBarcodeNo);

// ## get scan order production for send product to next department putScanNextDepCompleteOrderProductionBarcodeNo
router.put("/nextdep/scanroderProduction/productBarcodeNo", nsController.putScanNextDepCompleteOrderProductionBarcodeNo);

// ## get node product record productBarcodeNo  getDatarecordProductBarcodeNo
router.get("/node10/record/productBarcodeNo/:companyID/:factoryID/:productBarcodeNo", nsController.getDatarecordProductBarcodeNo);

// router.put("/oroderProduction/productBarcodeNo/qctocomplete", nsController.putOrderProductionBarcodeNoQCtoComplete);

// ## edit order production  send product to next department 
router.put("/node11/edit/oderProduction/nextnode", nsController.putOrderProductionNextNodeID);

// ## edit order production  set product back from repaired
router.put("/node16r/edit/oderProduction/repaired", nsController.putOrderProductionRepaired);

// ## edit order production  set product problem
router.put("/node12/edit/oderProduction/problem", nsController.putOrderProductionProblem);

// ## get product problem
router.get("/node14/orderProduction/problem/:companyID/:factoryID/:nodeID/:productStatus/:page/:limit", 
nsController.getProblemProductCFN);

// ## get product repair
router.get("/node15/orderProduction/repair/:companyID/:factoryID/:nodeID/:productStatus/:page/:limit", 
nsController.getRepairProductCFN);

// ##
router.get("/node16/orderProduction/qrcodelist/:companyID/:factoryID/:nodeID/:style/:productStatus/:page/:limit", 
nsController.getQRCodeListProductStyleCFN);

// ##
router.get("/node17/orderProductionZoneSizeColor/qrcodelist/:companyID/:factoryID/:nodeID/:style/:zone/:size/:color/:productStatus/:page/:limit", 
nsController.getQRCodeListProductStyleZoneSizeColorCFN);

// ## get staff worker for scan sub node / getWorkerInfoByQRCode1
router.get("/node18/get1/staffinfo/:companyID/:factoryID/:qrCode/:mode", nsController.getWorkerInfoByQRCode1);

// ## get subNodeFlowCost 1
router.get("/node19/get1/subNodeFlowCost/:companyID/:orderID", nsController.getsubNodeFlowCost1);

// ## get getOrderProductionQueueByBundleNo1
router.get("/node20/get1/orderProductionQueue/:companyID/:orderID/:bundleNo", nsController.getOrderProductionQueueByBundleNo1);

// ## get orderProduction   getorderProductionCNByORIDBunNo
router.get("/node21/orderProduction/lists/:companyID/:orderID/:bundleNo/:nodeID", 
nsController.getorderProductionCNByORIDBunNo);

// ## get staff scanned list   getorderProductionStaffScannedNameListCNByORIDQRs
router.get("/node24/orderProduction/staffscanned/lists/:orderID/:bundleNo/:nodeID/:qrcodeArr", 
nsController.getorderProductionStaffScannedNameListCNByORIDQRs);

// putDeleteSubNodeOrderProductionByBarcodeNo
router.put("/node26/editqr/oderProduction/subNodeFlow/del1", nsController.putDeleteSubNodeOrderProductionByBarcodeNo);

// getOrderProductionQueueByProductBarcodeNo
router.get("/node22/get1/orderProductionQueue/:companyID/:productBarcodeNo", nsController.getOrderProductionQueueByProductBarcodeNo);

// ## edit add order production  set putAddOrderProductionSubNodeFlow
router.put("/node23/editadd/oderProduction/subNodeFlow", nsController.putAddOrderProductionSubNodeFlow);

// ## edit add order production  set putEditOrderProductionSubNodeFlow
router.put("/node25/editqr/oderProduction/subNodeFlow", nsController.putEditOrderProductionSubNodeFlow);

// #############################################################################
// ## view qrcode ###########################################################################
// ## smd = show modal
// ## CFTN = companyID factoryID (toNode) nodeID 
// ## CFFN = companyID factoryID (fromNode) nodeID 
// ## szcs  = style zone color size
// ## tn = toNode
// ## fn = fromNode

// ## 1. we have factoryID nodeID(toNode) style zone color size
router.get("/node/smd/qrlist1/tn/:companyID/:factoryID/:toNode/:style/:zone/:color/:size/:page/:limit", nsController.getQRListCFTNszcs);


// ## outsource  /////////////////////////////////////////////////////

// ## get scan order production for receive from outsource putScanOrderProductionBarcodeNoReceiveOutsource
router.put("/outsource1/receive/scanroderProduction/productBarcodeNo", nsController.putScanOrderProductionBarcodeNoReceiveOutsource);

// putScanOrderProductionBarcodeNoReceiveOutsourceSendOut
// ## get scan order production for sendout from us putScanOrderProductionBarcodeNoReceiveOutsourceSendOut
router.put("/outsource3/sendout/scanroderProduction/productBarcodeNo", nsController.putScanOrderProductionBarcodeNoReceiveOutsourceSendOut);

// ## edit order production  send product to next department 
router.put("/outsource2/edit/oderProduction/nextnode", nsController.putOutsourceOrderProductionNextNodeID);

// ## edit order production  send product to send out
router.put("/outsource4/edit/oderProduction/sendout", nsController.putOutsourceOrderProductionSendOut);

// ## edit order production  send product to next department 
router.put("/outsource5/editcancel/oderProduction/received", nsController.putCancelOutsourceOrderProductionReceived);

// ## edit order production  send product to next department 
router.put("/outsource6/editcancel/oderProduction/sendout", nsController.putCancelOutsourceOrderProductionsendout);

// ## put add factory affiliate 
// ## edit order production  send product to next department 
router.put("/affiliate1/edit/oderProduction/nextnode", nsController.putAffiliateOrderProductionNextNodeID);

// ## worker zone 
// #########################################################################################


// #######################################################################################################
// ## report..... 

// cfn = /:companyID/:factoryID/:nodeID

// ## qrcode no scan on nodeID

// ## get node getRepNodeNoScan
router.get("/node/noscan1/rep/CFN/:companyID/:factoryIDArr/:nodeID/:orderIDsArr/:infoTypeArr", 
        reportController.getRepNodeNoScan);
// // ##

// ## get node getRepNodeNoScanDatail
router.get("/node/noscan2/rep/CFN/:companyID/:factoryIDArr/:nodeID/:orderIDArr/:targetPlaceID/:color/:size/:infoTypeArr/:page/:limit", 
        reportController.getRepNodeNoScanDatail);
// // ##


// ## get node getRepNodeStaffScannedByDate12
router.get("/node/scan1/rep/CF/staff/:companyID/:factoryIDArr/:orderIDsArr/:date12/:infoType", 
        reportController.getRepNodeStaffScannedByDate12);
// // ##

// ## get node getRepNodeStaffScannedByStyleZoneDate12
router.get("/node/scan2/rep/CF/staff/:companyID/:factoryIDArr/:orderIDsArr/:zoneArr/:nodeID/:date12/:infoType", 
        reportController.getRepNodeStaffScannedByStyleZoneDate12);
// // ##


// ## scan subnode report

// ## get node getRepSubNodeScanDate12Overall
router.get("/node/scansub1/rep/CF/overall/:companyID/:factoryIDArr/:nodeIDs/:date12/:infoType", 
        reportController.getRepSubNodeScanDate12Overall);
// // ##

// ## get node getRepSubNodeScanDate12StaffOverall
router.get("/node/scansub3/rep/CF/overall/:companyID/:factoryIDArr/:nodeIDs/:date12/:infoType/:qrCode", 
        reportController.getRepSubNodeScanDate12StaffOverall);
// // ##

// ## get node getRepSubNodeStaffScanDate12Overall
router.get("/node/scansub2/staff/rep/CF/overall/:companyID/:factoryIDArr/:nodeIDs/:date12/:infoType", 
        reportController.getRepSubNodeStaffScanDate12Overall);
// // ##


// // ## get node getRepCurrentProductQtyCFN
// router.get("/noder/rep1/current/productqty/cfn/:companyID/:factoryID/:nodeID/:productStatus/:repListName"
//         , nsController.getRepCurrentProductQtyCFN);

// ## outsource


// ## report..... 
// #######################################################################################################


// #######################################################################################################
// ## order 


// ## get order list /api/order/getlist/:companyID/:userID/:page/:limit
router.get("/getlist/:companyID/:userID/:page/:limit", nsController.getOrders);

// ## order 
// #######################################################################################################

module.exports = router;
