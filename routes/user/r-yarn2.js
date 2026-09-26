const express = require("express");
const yarn2Controller = require("../../controllers/user/c-yarn2");

const checkAuthA = require('../../middleware/check-authA');
const checkUUID  = require('../../middleware/check-uuid');

// ============================================================================
// r-yarn2.js — routes Yarn module ใหม่ · mount /api/a/yarn (app.js)
//   /api/yarn เก่า (r-yarn.js) ยังทำงานปกติ ไม่เกี่ยวกัน
// ============================================================================

const router = express.Router();

// ---- ลูกค้า (dropdown) ----
router.get("/customers/:companyID", checkAuthA, checkUUID, yarn2Controller.getYarnCustomers);

// ---- หน้า yarn plan: yarns + plans + orders + colors ต่อ customer/season ----
router.get("/plans/:companyID/:factoryID/:customerID/:seasonYear", checkAuthA, checkUUID, yarn2Controller.getYarnPlans);

// ---- yarn master ----
router.post("/yarn/create", checkAuthA, checkUUID, yarn2Controller.createYarn);
router.put("/yarn/rename",  checkAuthA, checkUUID, yarn2Controller.renameYarn);

// ---- yarn plan ----
router.post("/plan/create", checkAuthA, checkUUID, yarn2Controller.createYarnPlan);
router.put("/plan/update",  checkAuthA, checkUUID, yarn2Controller.updateYarnPlan);

// ---- plan detail (เฟส 2: ตาราง Plan & receive + แผนรับ ETD) ----
router.get("/plan/detail/:companyID/:uuid", checkAuthA, checkUUID, yarn2Controller.getYarnPlanDetail);
router.put("/plan/etd/save",   checkAuthA, checkUUID, yarn2Controller.saveYarnPlanEtd);
router.put("/plan/etd/delete", checkAuthA, checkUUID, yarn2Controller.deleteYarnPlanEtd);

// ---- packing list (เฟส 3: วันที่ด้ายเข้า + lot/ลัง + confirm ของหัวหน้า) ----
router.put("/packing/date/add",    checkAuthA, checkUUID, yarn2Controller.addPackingDate);
router.put("/packing/date/change", checkAuthA, checkUUID, yarn2Controller.changePackingDate);
router.put("/packing/date/cancel", checkAuthA, checkUUID, yarn2Controller.cancelPackingDate);
router.put("/packing/lot/add",     checkAuthA, checkUUID, yarn2Controller.addYarnLot);
router.put("/packing/lot/edit",    checkAuthA, checkUUID, yarn2Controller.editYarnLot);
router.put("/packing/lot/delete",  checkAuthA, checkUUID, yarn2Controller.deleteYarnLot);
router.put("/packing/lot/confirm", checkAuthA, checkUUID, yarn2Controller.confirmYarnLot);

// ---- stock card (บัญชีคุมด้าย ต่อสี: รับเข้า/จ่ายออก/คงเหลือ) ----
router.put("/stockcard", checkAuthA, checkUUID, yarn2Controller.getStockCard);
router.put("/stockcard/sendto", checkAuthA, checkUUID, yarn2Controller.changeSendTo);   // ดับเบิลคลิก Send to (re-auth)
router.put("/stockcard/pcs",    checkAuthA, checkUUID, yarn2Controller.setStockCardPcs);  // ดับเบิลคลิก Pcs.
router.put("/stockcard/zone",   checkAuthA, checkUUID, yarn2Controller.setStockCardZone); // ดับเบิลคลิก Style > ZONE

// ---- lot management (จัดการลัง: คงเหลือ · ดูลัง · แบ่งลัง) ----
router.put("/lot/boxes",       checkAuthA, checkUUID, yarn2Controller.getLotBoxes);
router.put("/lot/box/divide",  checkAuthA, checkUUID, yarn2Controller.divideLotBox);
router.put("/lot/transfer",    checkAuthA, checkUUID, yarn2Controller.transferLotBoxes);   // จ่ายด้ายออกจากคลังกลาง

// ---- invoice: หา plan สำหรับรายงาน rep02 + เปลี่ยนเลข invoice ทั้ง season ----
router.put("/packing/invoice/find",   checkAuthA, checkUUID, yarn2Controller.findInvoicePlans);
router.put("/packing/invoice/change", checkAuthA, checkUUID, yarn2Controller.changeInvoiceID);

module.exports = router;
