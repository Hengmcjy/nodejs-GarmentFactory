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
// ── Scan sub node (บันทึกผลงาน worker-เหมา) ──
router.get("/subnode/worker/:qr", stationAuthController.stationSubnodeWorker);        // หา worker(เหมา) จาก qrCode
router.post("/subnode/resolve", stationAuthController.stationSubnodeResolve);         // job card scan → pieces + subnode cfg + info
router.post("/subnode/save", stationAuthController.stationSubnodeSave);               // เขียน subNodeFlow ทุกชิ้น (กันซ้ำ)
router.get("/subnode/scanned", stationAuthController.stationSubnodeScanned);          // edit workload: ใครสแกน subnode ไหนของมัด
router.post("/subnode/remove", stationAuthController.stationSubnodeRemove);           // ลบผลงาน subnode
router.post("/subnode/matrix", stationAuthController.stationSubnodeMatrix);           // viewer: ผลงาน subnode ทั้งมัด (ชิ้น × subnode → ใครทำ)
router.post("/daily/save", stationAuthController.stationDailySave);                   // ★ worker-รายวัน ทำงานเหมา (qrCode DAILY · ไม่คิดค่าเหมา)
router.post("/daily/remove", stationAuthController.stationDailyRemove);               // ★ ยกเลิกรายการรายวัน (ลบเฉพาะ DAILY)
router.get("/daily/report", stationAuthController.stationDailyReport);                // ★ รายงานสแกนรายวัน (เลือกวัน/ช่วงวัน) · โรงล็อกจาก token
router.get("/lang/:languageID", stationAuthController.stationLang);              // ★ คำแปลรายงาน/PDF station (rpt · st_*)
// ── Send to outsource (ส่งงานออกโรงรับจ้างช่วง) ──
router.get("/outsource/factories", stationAuthController.stationOutsourceFactories);      // ข้อ 1: เลือกโรง outsource (fInfo.isOutsource)
router.get("/outsource/nodes", stationAuthController.stationOutsourceNodes);              // ข้อ 2: เลือก node ที่งานอยู่ (+ โหมดสแกนของ node นั้น)
router.post("/outsource/scan", stationAuthController.stationOutsourceScan);               // ข้อ 3: สแกนส่งออก (gate: lastNode.toNode === node ที่เลือก)
router.post("/outsource/commit-bundle", stationAuthController.stationOutsourceCommitBundle); // linking: ครบมัดแล้วส่งออกทั้งมัด
// ── Cancel send-out (ยกเลิกการส่งออก — เลือกโรงเดิม + node เดิม แล้วสแกน) ──
router.post("/outsource/cancel", stationAuthController.stationOutsourceCancel);                     // สแกนยกเลิกส่งออก (gate: marker outsource โรงที่เลือก + node ก่อน marker = node ที่เลือก)
router.post("/outsource/cancel/commit-bundle", stationAuthController.stationOutsourceCancelCommitBundle); // linking/mending: ครบมัดแล้วยกเลิกทั้งมัด
// ── Receive outsource (รับงานกลับจากโรงรับจ้างช่วง) ──
router.post("/outsource/receive/scan", stationAuthController.stationOutsourceReceiveScan);                 // สแกนรับเข้า (gate: marker outsource + node ก่อน marker = node แรกที่เลือก)
router.post("/outsource/receive/commit-bundle", stationAuthController.stationOutsourceReceiveCommitBundle); // linking/mending: ครบมัดแล้วรับเข้าทั้งมัด
router.post("/outsource/receive/cancel", stationAuthController.stationOutsourceReceiveCancel);             // cancel receive: ตัด element ที่รับเข้าออก กลับไปอยู่ outsource
// ── ★ Scan Checking (ตรวจงานที่รับคืนจาก outsource) — เปิด/ปิดจาก config ระดับโรงงาน station-STATION_CHECK_ENABLE ──
router.get("/check/worklist", stationAuthController.stationCheckWorklist);            // คิวมัดที่รอตรวจของ node ที่ login
router.post("/check/scan", stationAuthController.stationCheckScan);                   // สแกนตรวจ (gate: checkPending[0] === node ที่ login)
router.post("/check/commit-bundle", stationAuthController.stationCheckCommitBundle);  // bundle-manual: สแกนครบมัดแล้ว commit
router.get("/check/report", stationAuthController.stationCheckReport);                // รายงาน "เหลือกี่ตัวที่ยังไม่ checking" ทั้งโรง

// ---- ฝั่ง admin (อนุมัติจาก badge บน topbar) ----
router.get("/requests/:companyID", checkAuthA, checkUUID, stationAuthController.getLoginRequests);
router.put("/requests/allow",      checkAuthA, checkUUID, stationAuthController.allowLoginRequest);
router.put("/requests/reject",     checkAuthA, checkUUID, stationAuthController.rejectLoginRequest);

module.exports = router;
