// Requirement: Route ใหม่สำหรับชุดรายงาน Production (clean) — mount /api/a/report ใน app.js
//   ใช้ middleware checkAuthA + checkUUID เหมือน stack ใหม่อื่นๆ (r-adm, r-master, r-order2)
const express = require("express");

const report2Controller = require("../../controllers/user/c-report2");
const nodeBundleController = require("../../controllers/user/c-report2-nodebundle");

const checkAuthA = require('../../middleware/check-authA');
const checkUUID = require('../../middleware/check-uuid');

const router = express.Router();

// ## รายงาน no.1 Production Overview — drill ราย Zone / Node (ต้องมาก่อน route generic /overview/:companyID/:seasonYear)
// ## GET /api/a/report/overview/zone/:companyID/:orderID
router.get("/overview/zone/:companyID/:orderID", checkAuthA, checkUUID, report2Controller.repOverviewZone);
// ## GET /api/a/report/overview/node/:companyID/:orderID
router.get("/overview/node/:companyID/:orderID", checkAuthA, checkUUID, report2Controller.repOverviewNode);

// ## รายงาน no.1 Production Overview
// ## GET /api/a/report/overview/:companyID/:seasonYear
router.get("/overview/:companyID/:seasonYear", checkAuthA, checkUUID, report2Controller.repOverview);

// ## รายงาน no.2 Order — on-demand (ลิสต์ → กด order โหลด matrix ทีละตัว)
// ## GET /api/a/report/order/list/:companyID/:seasonYear
router.get("/order/list/:companyID/:seasonYear", checkAuthA, checkUUID, report2Controller.repOrderList);
// ## GET /api/a/report/order/matrix/:companyID/:orderID
router.get("/order/matrix/:companyID/:orderID", checkAuthA, checkUUID, report2Controller.repOrderMatrix);

// ## รายงาน no.3 Scan overview — สแกนตามช่วงวัน (date = YYYY-MM-DD)
// ## GET /api/a/report/scan/:companyID/:seasonYear/:date1/:date2
router.get("/scan/:companyID/:seasonYear/:date1/:date2", checkAuthA, checkUUID, report2Controller.repScan);

// ## รายงาน no.11 Node Bundle (ความคืบหน้า % ระดับชิ้น/มัด) — เลือก node+order(+โรง) → ดูแต่ละชิ้นอยู่ node ไหน
// ## drill รายละเอียด (index → combo zone/color/size · detail → ทุกชิ้นในมัด)
// ## GET /api/a/report/node-bundle/index/:companyID/:orderID/:nodeID/:factoryID  (factoryID='*' = ทุกโรง)
router.get("/node-bundle/index/:companyID/:orderID/:nodeID/:factoryID", checkAuthA, checkUUID, nodeBundleController.repNodeBundleIndex);
// ## GET /api/a/report/node-bundle/detail/:companyID/:orderID/:nodeID/:factoryID/:zone/:color/:size
router.get("/node-bundle/detail/:companyID/:orderID/:nodeID/:factoryID/:zone/:color/:size", checkAuthA, checkUUID, nodeBundleController.repNodeBundleDetail);
// ## PUT set QC to complete — ดันชิ้นที่ค้างอยู่ 7.QC ให้ complete (เขียน production · เช็คสิทธิ์ + audit)
router.put("/node-bundle/qc-complete", checkAuthA, checkUUID, nodeBundleController.setQcComplete);
// ## Product Flow — ป้อน bundleNo/productBarcodeNo/productBarcodeNoReal → เส้นทางเสื้อ (productionNode history)
router.get("/product-flow/:companyID/:code", checkAuthA, checkUUID, nodeBundleController.productFlow);

// ## รายงาน no.26 Factory Scan (group) — ชิ้นที่ค้างอยู่แต่ละ node ตอนนี้ (ต่อ order+factory) แยก สี×ไซซ์×โซน
// ## detail (ต้องมาก่อน route generic) — ดับเบิลคลิก qty → รายชิ้น bundleNo/barcode ที่ค้างตรงนั้น
router.get("/factory-scan-group/detail/:companyID/:factoryID/:orderID/:node/:zone/:color/:size", checkAuthA, checkUUID, nodeBundleController.repFactoryScanGroupDetail);
// ## GET /api/a/report/factory-scan-group/:companyID/:factoryID/:orderID
router.get("/factory-scan-group/:companyID/:factoryID/:orderID", checkAuthA, checkUUID, nodeBundleController.repFactoryScanGroup);

// ## พิมพ์ QR Code (Order > หน้า worker) — bundles = "log ล็อกงาน" ให้เลือก · data = ข้อมูลป้ายทุกชิ้น (preview/gen)
// ## GET /api/a/report/qr-print/bundles/:companyID/:orderID/:factoryID  (factoryID='*' = ทุกโรง)
router.get("/qr-print/bundles/:companyID/:orderID/:factoryID", checkAuthA, checkUUID, nodeBundleController.qrPrintBundles);
// ## POST /api/a/report/qr-print/data  body:{ companyID, orderID, bundleNos[], runNos[], barcodes[], factoryID } → ป้ายทุกชิ้น + warnMultiYarn
router.post("/qr-print/data", checkAuthA, checkUUID, nodeBundleController.qrPrintData);

// ## ใบขอ reprint QR (office สร้างจาก Report 11 → worker พิมพ์ที่หน้า Print QR) — ข้ามคน/เครื่อง/เวลา
router.post("/reprint-request", checkAuthA, checkUUID, nodeBundleController.createReprintRequest);
// detail (full doc + unlockCode + items) — ต้องมาก่อน route generic /reprint-request/:companyID · office ใช้พิมพ์ใบซ้ำ
router.get("/reprint-request/detail/:companyID/:requestID", checkAuthA, checkUUID, nodeBundleController.getReprintRequestFull);
router.get("/reprint-request/:companyID", checkAuthA, checkUUID, nodeBundleController.listReprintRequests);
router.post("/reprint-request/unlock", checkAuthA, checkUUID, nodeBundleController.unlockReprintRequest);
router.put("/reprint-request/close", checkAuthA, checkUUID, nodeBundleController.closeReprintRequest);

// ## รายงาน no.12 %WIP by period [zone] — on-demand ต่อ order × zone (zone='-' = zone แรก)
// ## drill bundleNo (ต้องมาก่อน route generic /wip/:companyID/:seasonYear/:orderID/:zone)
// ## GET /api/a/report/wip/bundles/:companyID/:orderID/:zone/:color/:size/:node/:type
router.get("/wip/bundles/:companyID/:orderID/:zone/:color/:size/:node/:type", checkAuthA, checkUUID, report2Controller.repWipBundles);
// ## GET /api/a/report/wip/:companyID/:seasonYear/:orderID/:zone
router.get("/wip/:companyID/:seasonYear/:orderID/:zone", checkAuthA, checkUUID, report2Controller.repWip);

// ## รายงาน no.21 Work in Process by Period — โหลดทั้ง season (2 โหมด + พิมพ์ PDF ทำฝั่ง client)
// ## GET /api/a/report/prod-period/:companyID/:seasonYear
router.get("/prod-period/:companyID/:seasonYear", checkAuthA, checkUUID, report2Controller.repProdPeriod);

// ## รายงาน no.22 Factory Scan Production by Period — ดึงสด (date range + factory)
// ## GET /api/a/report/prod-scan/:companyID/:seasonYear/:date1/:date2/:factoryID  (factoryID='*' = ทุกโรงในเครือ)
router.get("/prod-scan/:companyID/:seasonYear/:date1/:date2/:factoryID", checkAuthA, checkUUID, report2Controller.repProdScanPeriod);

// ## รายงาน no.23 Factory Scan sub-node Production (ดึงสด, สะสม)
// ## GET /api/a/report/subnode/init/:companyID/:seasonYear  (order+node dropdown)
router.get("/subnode/init/:companyID/:seasonYear", checkAuthA, checkUUID, report2Controller.repSubNodeInit);
// ## GET /api/a/report/subnode/:companyID/:orderID/:nodeID
router.get("/subnode/:companyID/:orderID/:nodeID", checkAuthA, checkUUID, report2Controller.repSubNodeScan);

// ## รายงาน no.31 Outsource Overall — on-demand (overview + detail รายโรง+order)
// ## GET /api/a/report/outsource-overall/detail/:companyID/:seasonYear/:factoryID/:orderID (ต้องมาก่อน route generic)
router.get("/outsource-overall/detail/:companyID/:seasonYear/:factoryID/:orderID", checkAuthA, checkUUID, report2Controller.repOutsourceOverallDetail);
// ## GET /api/a/report/outsource-overall/:companyID/:seasonYear
router.get("/outsource-overall/:companyID/:seasonYear", checkAuthA, checkUUID, report2Controller.repOutsourceOverall);

// ## รายงาน no.35 Send Out & Receive (Outsource state) — on-demand
// ## GET /api/a/report/outsource-state/bundles/:companyID/:seasonYear/:factoryID (PDF data · ต้องมาก่อน)
router.get("/outsource-state/bundles/:companyID/:seasonYear/:factoryID", checkAuthA, checkUUID, report2Controller.repOutsourceStateBundles);
// ## GET /api/a/report/outsource-state/detail/:companyID/:seasonYear/:factoryID
router.get("/outsource-state/detail/:companyID/:seasonYear/:factoryID", checkAuthA, checkUUID, report2Controller.repOutsourceStateDetail);
// ## GET /api/a/report/outsource-state/:companyID/:seasonYear
router.get("/outsource-state/:companyID/:seasonYear", checkAuthA, checkUUID, report2Controller.repOutsourceStateOverview);

module.exports = router;
