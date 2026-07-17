// ═══════════════════════════════════════════════════════════════════════════
// r-order2.js — routes: Order module ใหม่ (แอป angularGarmentAcc2)
//   mount: /api/a/order (ใน app.js) · controller: c-order2.js · ไม่แตะ r-order.js เก่า
// ═══════════════════════════════════════════════════════════════════════════
const express = require("express");
const orderController = require("../../controllers/user/c-order2");

const checkAuthA = require('../../middleware/check-authA');
const checkUUID  = require('../../middleware/check-uuid');

const router = express.Router();

// ---- อ่าน ----
router.get("/seasons/:companyID",           checkAuthA, checkUUID, orderController.getSeasons);
router.get("/list/:companyID/:seasonYear",  checkAuthA, checkUUID, orderController.getOrderList);
router.get("/one/:companyID/:orderID",      checkAuthA, checkUUID, orderController.getOrderOne);

// ---- เฟส 3: ล็อกงาน (lock job / สร้างคิวผลิต) — [AI ใหม่ 2026-07-17] ----
// summary = ตาราง สี×zone×ไซซ์ · next-numbers = ขอเลข preview ก่อนเซฟ ·
// create = บันทึกล็อก (transaction กัน bundleNo ซ้ำ 3 ชั้น) · history = log การล็อก
router.get("/lockjob/summary/:companyID/:orderID",      checkAuthA, checkUUID, orderController.lockjobSummary);
router.get("/lockjob/next-numbers/:companyID/:orderID", checkAuthA, checkUUID, orderController.lockjobNextNumbers);
router.post("/lockjob/create",                          checkAuthA, checkUUID, orderController.lockjobCreate);
router.get("/lockjob/history/:companyID/:orderID",      checkAuthA, checkUUID, orderController.lockjobHistory);
// yarnlots = ดึงล๊อตด้ายจาก yarn module เดิม (READ-ONLY) มาให้เลือกตอนล็อก แทนพิมพ์เอง
router.get("/lockjob/yarnlots/:companyID/:orderID",     checkAuthA, checkUUID, orderController.lockjobYarnLots);
// cancel = ยกเลิก/ลบการล็อก (ต้อง re-auth รหัสผ่าน + ทุกโหลยังไม่ถูกสแกน)
router.post("/lockjob/cancel",                          checkAuthA, checkUUID, orderController.lockjobCancel);

// ---- ตั้งค่า subnode (ขั้นตอนย่อย) ต่อรุ่น — [AI ใหม่ 2026-07-17] ----
router.get("/subnode/setup/:companyID/:factoryID/:orderID", checkAuthA, checkUUID, orderController.subnodeSetup);
router.put("/subnode/save",                                 checkAuthA, checkUUID, orderController.subnodeSave);

// ---- เฟส 4: Job Card (พิมพ์ใบงาน) — [AI ใหม่ 2026-07-17] ----
// data = กรอกช่วงเลขโหล → เช็คเงื่อนไข + คืนข้อมูลต่อโหล + subnode config
router.get("/jobcard/data/:companyID/:orderID", checkAuthA, checkUUID, orderController.jobcardData);
// pdf = render ใบงานเป็น PDF ด้วย Chromium (Puppeteer) — ?from=&to=&type=type1
router.get("/jobcard/pdf/:companyID/:orderID",  checkAuthA, checkUUID, orderController.jobcardPdf);

// ---- set max QTY view (override จำนวนที่จะแสดง ต่อ สี;ไซซ์;โซน) — [AI ใหม่ 2026-07-17] ----
router.get("/maxqty/:companyID/:orderID", checkAuthA, checkUUID, orderController.maxqtyData);
router.put("/maxqty/save",                checkAuthA, checkUUID, orderController.maxqtySave);

// ---- เขียน ----
router.post("/create",  checkAuthA, checkUUID, orderController.createOrder);
router.put("/header",   checkAuthA, checkUUID, orderController.updateHeader);
router.put("/color",    checkAuthA, checkUUID, orderController.updateColor);
router.put("/zone",     checkAuthA, checkUUID, orderController.updateZone);
router.put("/lines",      checkAuthA, checkUUID, orderController.saveLines);
router.put("/revise-qty",  checkAuthA, checkUUID, orderController.reviseQty);    // แก้จำนวน + เก็บประวัติใครแก้
router.post("/line/delete", checkAuthA, checkUUID, orderController.deleteLine);  // ลบรายการ (hard delete + log · กันลบถ้าผลิตแล้ว)

module.exports = router;
