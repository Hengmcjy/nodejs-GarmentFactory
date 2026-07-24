// Requirement: routes Station Scan Login (/api/a/station/*) — คู่กับ controllers/user/c-station-auth.js
//   ★ กลุ่ม station (login/poll/cancel/logout) = public — เครื่อง station ยังไม่มี token office
//   ★ กลุ่ม admin (requests list/allow/reject) = checkAuthA + checkUUID เหมือน /api/a/* อื่นๆ
const express = require("express");
const stationAuthController = require("../../controllers/user/c-station-auth");

const checkAuthA = require('../../middleware/check-authA');
const checkUUID  = require('../../middleware/check-uuid');

const router = express.Router();

// ---- ฝั่งเครื่อง station (public) ----
router.post("/login",      stationAuthController.stationLogin);       // login ด้วย user/pass station + uuid เครื่อง → ออก token 30 วัน
router.get("/session",     stationAuthController.stationSession);     // เปิดแอป/F5: verify token + ★ ต่ออายุ (sliding 30 วัน — ไม่เคลื่อนไหว 30 วัน = เด้งออก)
router.get("/poll/:uuid",  stationAuthController.stationPoll);        // poll ระหว่างรออนุมัติ (allowed = ออก token)
router.post("/cancel",     stationAuthController.stationCancel);      // ยกเลิกคำขอ (กดยกเลิก/หมดเวลา)
router.post("/logout",     stationAuthController.stationLogout);      // ปลดผูกเครื่องตัวเอง (uuid ตรงเท่านั้น)
router.post("/staff-login", stationAuthController.staffLogin);        // staff login เข้ากะ (users state='staff' · เครื่องต้องผูกแล้ว)
router.get("/workload",     stationAuthController.stationWorkload);   // รายงานค่าแรงเหมา (สแกน) — node ล็อกจาก token · ดูอย่างเดียว ไม่มี PDF
router.get("/product-flow/:companyID/:code", stationAuthController.stationProductFlow);   // Product Flow (หน้าต่างลอย) · companyID จาก token
router.get("/orders", stationAuthController.stationOrders);   // รายการ order ทุก season active (station ไม่เลือก season)
router.get("/scan-overview", stationAuthController.stationScanOverview);   // report #2 (ภาพรวมการสแกน) · เลือกช่วงวัน · โรงล็อกจาก token
router.get("/prod-scan", stationAuthController.stationProdScanPeriod);   // report #4 (WIP by period) · เลือกช่วงวัน · โรงล็อกจาก token
router.get("/outsource-state", stationAuthController.stationOutsourceState);   // outsource ส่งออก-รับกลับ ตามวัน (cache ทุก season active)
router.get("/node-bundle/index/:orderID/:nodeID", stationAuthController.stationNodeBundleIndex);   // report #3 (Node Bundle) index · โรงล็อกจาก token
router.get("/node-bundle/detail/:orderID/:nodeID/:zone/:color/:size", stationAuthController.stationNodeBundleDetail);   // report #3 detail (รายชิ้นในมัด)
router.get("/factory-scan-flat/:orderID", stationAuthController.stationFactoryScanFlat);   // report #1 (ชิ้นค้างในโรง ไม่แบ่ง node)
router.get("/factory-scan-group/detail/:orderID/:node/:zone/:color/:size", stationAuthController.stationFactoryScanGroupDetail);   // ดับเบิลคลิก qty → รายชิ้น
router.get("/factory-scan-group/:orderID", stationAuthController.stationFactoryScanGroup);   // รายงาน no.26 (ชิ้นค้างแต่ละ node) · factory จาก token
router.post("/scan-product", stationAuthController.stationScanProduct);   // ★ สแกน QR ดันงานไป node ถัดไป · โหมดตาม nodeInfo (single / bundle-auto / bundle-manual)
router.post("/scan-product/commit-bundle", stationAuthController.stationScanCommitBundle);   // ★ commit ทั้งมัด (โหมด mustBundleScan=true & scan1ForAll=false)

// ---- ฝั่ง admin (อนุมัติจาก badge บน topbar) ----
router.get("/requests/:companyID", checkAuthA, checkUUID, stationAuthController.getLoginRequests);
router.put("/requests/allow",      checkAuthA, checkUUID, stationAuthController.allowLoginRequest);
router.put("/requests/reject",     checkAuthA, checkUUID, stationAuthController.rejectLoginRequest);

module.exports = router;
