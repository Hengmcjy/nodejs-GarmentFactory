const express = require("express");

const admAccController = require("../../controllers/user/c-adm-acc");
const dailyAccController = require("../../controllers/user/c-daily-acc");
const workerScanController = require("../../controllers/user/c-worker-scan");   // Worker เหมา (worker zone)
const secureDeletionController = require("../../controllers/user/c-secure-deletion");  // Admin > Secure Deletion
const clearDataController = require("../../controllers/user/c-clear-data");            // Admin > Clear Data (ล้างข้อมูลทดสอบ ระดับโรงงาน)
const userPrefController = require("../../controllers/user/c-user-pref");              // live translate + ภาษา profile (useracc)
const loggingController = require("../../controllers/user/c-logging");                 // Logging Station (audit log ทุก module)
const outsourceCostController = require("../../controllers/user/c-outsource-cost");     // ต้นทุนค่าจ้างโรงงานนอก ต่อ stage
const fingerScanController = require("../../controllers/user/c-fingerscan");            // HR > Worker Finger Scan (สรุปเวลาสแกนนิ้ว)

const checkAuthA = require('../../middleware/check-authA');
const checkUUID  = require('../../middleware/check-uuid');
const checkAuthFactory = require('../../middleware/check-authFactory');   // ตรวจสิทธิ์โรงงาน (uFactory joined) — read+write

const router = express.Router();


// #############################################################
// ## Chart of Accounts (ผังบัญชี)

// ## GET  /api/a/admacc/chart/:companyID/:factoryID
router.get("/chart/:companyID/:factoryID", checkAuthA, checkUUID, checkAuthFactory, admAccController.getChart);
router.post("/chart/import-lang", checkAuthA, checkUUID, checkAuthFactory, admAccController.importChartLang);   // นำเข้าคำแปลชื่อบัญชี

// ## POST /api/a/admacc/chart/create
router.post("/chart/create", checkAuthA, checkUUID, checkAuthFactory, admAccController.createAccount);

// ## PUT  /api/a/admacc/chart/update
router.put("/chart/update", checkAuthA, checkUUID, checkAuthFactory, admAccController.updateAccount);

// ## DELETE /api/a/admacc/chart/:accountID
router.delete("/chart/:accountID", checkAuthA, checkUUID, checkAuthFactory, admAccController.deleteAccount);

// ## Chart of Accounts
// #############################################################


// #############################################################
// ## Accounting Firms (สนง.บัญชีภายนอก)

// ## GET  /api/a/admacc/firms/:companyID
router.get("/firms/:companyID", checkAuthA, checkUUID, checkAuthFactory, admAccController.getFirms);

// ## POST /api/a/admacc/firms/create
router.post("/firms/create", checkAuthA, checkUUID, checkAuthFactory, admAccController.createFirm);

// ## PUT  /api/a/admacc/firms/update
router.put("/firms/update", checkAuthA, checkUUID, checkAuthFactory, admAccController.updateFirm);

// ## PUT  /api/a/admacc/firms/toggle
router.put("/firms/toggle", checkAuthA, checkUUID, checkAuthFactory, admAccController.toggleFirmActive);

// ## DELETE /api/a/admacc/firms/:firmID
router.delete("/firms/:firmID", checkAuthA, checkUUID, checkAuthFactory, admAccController.deleteFirm);

// ## Accounting Firms
// #############################################################


// #############################################################
// ## Accounting Projects (โครงการ)

router.get("/projects/:companyID/:factoryID", checkAuthA, checkUUID, checkAuthFactory, admAccController.getProjects);
router.post("/projects/create",               checkAuthA, checkUUID, checkAuthFactory, admAccController.createProject);
router.put("/projects/update",                checkAuthA, checkUUID, checkAuthFactory, admAccController.updateProject);
router.put("/projects/toggle",                checkAuthA, checkUUID, checkAuthFactory, admAccController.toggleProjectActive);
router.delete("/projects/:projectID",         checkAuthA, checkUUID, checkAuthFactory, admAccController.deleteProject);

// ## Accounting Projects
// #############################################################



// #############################################################
// ## Shops / Vendors (ร้านค้า / คนที่ซื้อของด้วย)

router.get("/shops/:companyID/:factoryID", checkAuthA, checkUUID, checkAuthFactory, admAccController.getShops);
router.post("/shops/create",               checkAuthA, checkUUID, checkAuthFactory, admAccController.createShop);
router.put("/shops/update",                checkAuthA, checkUUID, checkAuthFactory, admAccController.updateShop);
router.put("/shops/toggle",                checkAuthA, checkUUID, checkAuthFactory, admAccController.toggleShopActive);
router.delete("/shops/:shopID",            checkAuthA, checkUUID, checkAuthFactory, admAccController.deleteShop);

// ## Shops / Vendors
// #############################################################


// #############################################################
// ## Cash Men (คนถือเงินสด)

router.get("/cashmen/:companyID/:factoryID", checkAuthA, checkUUID, checkAuthFactory, admAccController.getCashMen);
router.post("/cashmen/create",               checkAuthA, checkUUID, checkAuthFactory, admAccController.createCashMan);
router.put("/cashmen/update",                checkAuthA, checkUUID, checkAuthFactory, admAccController.updateCashMan);
router.put("/cashmen/toggle",                checkAuthA, checkUUID, checkAuthFactory, admAccController.toggleCashManActive);
router.delete("/cashmen/:cashManID",         checkAuthA, checkUUID, checkAuthFactory, admAccController.deleteCashMan);

// ## Cash Men
// #############################################################


// #############################################################
// ## Cash Book (รายการเงินสด)

router.get("/cashbook/summary/:companyID/:factoryID",              checkAuthA, checkUUID, checkAuthFactory, admAccController.getCashBookSummary);
router.get("/cashbook/entries/:companyID/:factoryID/:cashManID",   checkAuthA, checkUUID, checkAuthFactory, admAccController.getCashBookEntries);
router.get("/cashbook/period/:companyID/:factoryID/:month",        checkAuthA, checkUUID, checkAuthFactory, admAccController.getCashBookPeriod);
router.post("/cashbook/entry",                                     checkAuthA, checkUUID, checkAuthFactory, admAccController.createCashBookEntry);
router.post("/cashbook/carryforward",                              checkAuthA, checkUUID, checkAuthFactory, admAccController.carryForward);
router.put("/cashbook/close-month",                               checkAuthA, checkUUID, checkAuthFactory, admAccController.closeCashBookMonth);
router.delete("/cashbook/entry/:entryID",                         checkAuthA, checkUUID, checkAuthFactory, admAccController.deleteCashBookEntry);

// ## Cash Book
// #############################################################


// #############################################################
// ## Worker Pay Periods (งวด — ระดับโรงงาน)

router.get("/wp-periods/lump-sum/:companyID/:factoryID",   checkAuthA, checkUUID, checkAuthFactory, admAccController.getWpLumpSum);
router.get("/wp-periods/:companyID/:factoryID",            checkAuthA, checkUUID, checkAuthFactory, admAccController.getWpPeriods);
router.get("/wp-summary/:companyID/:factoryID/:periodID",  checkAuthA, checkUUID, checkAuthFactory, admAccController.getWpSummaryByPeriod);
router.get("/wp-report/period/:companyID/:factoryID/:periodID", checkAuthA, checkUUID, checkAuthFactory, admAccController.getWpPeriodReport);
router.post("/wp-periods",                        checkAuthA, checkUUID, checkAuthFactory, admAccController.createWpPeriod);
router.put("/wp-periods/review",                  checkAuthA, checkUUID, checkAuthFactory, admAccController.sendForReview);
router.put("/wp-periods/close",                   checkAuthA, checkUUID, checkAuthFactory, admAccController.closeWpPeriod);
router.put("/wp-periods/:periodID",               checkAuthA, checkUUID, checkAuthFactory, admAccController.updateWpPeriod);
router.delete("/wp-periods/:periodID",            checkAuthA, checkUUID, checkAuthFactory, admAccController.deleteWpPeriod);

// ## Worker Finger Scan (HR > Worker Finger Scan) — สรุปเวลาสแกนนิ้ว ต่อ worker ต่องวด
router.get("/fs-summary/:companyID/:factoryID/:periodID", checkAuthA, checkUUID, checkAuthFactory, fingerScanController.getFsSummaryByPeriod);
router.post("/fs-summary/save",                           checkAuthA, checkUUID, checkAuthFactory, fingerScanController.saveFsSummary);
router.post("/fs-summary/save-bulk",                      checkAuthA, checkUUID, checkAuthFactory, fingerScanController.saveFsSummaryBulk);
// ทะเบียนเครื่อง finger scan (HR > Configuration > Finger Scan Setting)
router.get("/fs-machine/:companyID/:factoryID",           checkAuthA, checkUUID, checkAuthFactory, fingerScanController.getFsMachines);
router.post("/fs-machine/save",                           checkAuthA, checkUUID, checkAuthFactory, fingerScanController.saveFsMachine);
router.delete("/fs-machine/:machineID",                   checkAuthA, checkUUID, checkAuthFactory, fingerScanController.deleteFsMachine);

// ## Worker Pay Items (รายการต่อ worker ต่องวด)

router.get("/wp-items/:companyID/:factoryID/:periodID/:workerID", checkAuthA, checkUUID, checkAuthFactory, admAccController.getWpItems);
router.post("/wp-items",                          checkAuthA, checkUUID, checkAuthFactory, admAccController.createWpItem);
router.put("/wp-items",                           checkAuthA, checkUUID, checkAuthFactory, admAccController.updateWpItem);
router.delete("/wp-items/:itemID",                checkAuthA, checkUUID, checkAuthFactory, admAccController.deleteWpItem);

// #############################################################


// #############################################################
// ## Worker Pay Production (ข้อมูลการผลิตรายวัน → คำนวณค่าแรงเหมา)

// ## GET  /api/a/admacc/wp-production-preview/:companyID/:factoryID/:periodID/:workerID/:date?countryID=THA1
router.get("/wp-production-preview/:companyID/:factoryID/:periodID/:workerID/:date",
    checkAuthA, checkUUID, checkAuthFactory, admAccController.getWpProductionPreview);

// ## POST /api/a/admacc/wp-production
router.post("/wp-production",
    checkAuthA, checkUUID, checkAuthFactory, admAccController.saveWpProduction);

// ## POST /api/a/admacc/wp-daily-from-scan — ค่าแรงรายวัน auto จาก finger scan (worker รายวัน)
router.post("/wp-daily-from-scan",
    checkAuthA, checkUUID, checkAuthFactory, admAccController.saveWpDailyFromScan);

// ## GET /api/a/admacc/wp-payroll-excel — รายงานค่าแรง Excel แยก sheet ตามแผนก (ดาวน์โหลด .xlsx)
router.get("/wp-payroll-excel/:companyID/:factoryID/:periodID",
    checkAuthA, checkUUID, checkAuthFactory, admAccController.getPayrollExcel);

// ## GET /api/a/admacc/worker-scanids — scanID ที่ผูก worker (กรองเครื่องสแกนแชร์ office เอาเฉพาะ worker)
router.get("/worker-scanids/:companyID/:factoryID",
    checkAuthA, checkUUID, checkAuthFactory, admAccController.getWorkerScanIDs);

// ## GET /api/a/admacc/app-version/:companyID/:factoryID — เวอร์ชันแอปปัจจุบัน (สำหรับบังคับ reload)
// ## PUBLIC (ไม่ผ่าน checkAuthA) เพื่อไม่ให้ poll ไปต่ออายุ session / ทำให้ Monitor ขึ้นออนไลน์ค้าง
router.get("/app-version/:companyID/:factoryID", admAccController.getAppVersion);

// ## GET /api/a/admacc/admin/active-sessions — Monitor: user ที่ใช้งานอยู่ (near-live)
router.get("/admin/active-sessions",
    checkAuthA, checkUUID, admAccController.getActiveSessions);

// ## GET /api/a/admacc/admin/user-action-log/:userID — Monitor drill-down: การกระทำของ user (7 วัน)
router.get("/admin/user-action-log/:userID",
    checkAuthA, checkUUID, admAccController.getUserActionLog);

// ## GET  /api/a/admacc/wp-production-list/:companyID/:factoryID/:periodID/:workerID
router.get("/wp-production-list/:companyID/:factoryID/:periodID/:workerID",
    checkAuthA, checkUUID, checkAuthFactory, admAccController.getWpProductionList);

// ## DELETE /api/a/admacc/wp-production/:companyID/:factoryID/:periodID/:workerID/:wpProdID
router.delete("/wp-production/:companyID/:factoryID/:periodID/:workerID/:wpProdID",
    checkAuthA, checkUUID, checkAuthFactory, admAccController.deleteWpProduction);

// ## Worker Pay Production
// #############################################################


// #############################################################
// ## Bank Account Register (ทะเบียนบัญชีธนาคาร)

router.get("/bankaccounts/:companyID/:factoryID", checkAuthA, checkUUID, checkAuthFactory, admAccController.getBankAccounts);
router.post("/bankaccounts/create",               checkAuthA, checkUUID, checkAuthFactory, admAccController.createBankAccount);
router.put("/bankaccounts/update",                checkAuthA, checkUUID, checkAuthFactory, admAccController.updateBankAccount);
router.put("/bankaccounts/toggle",                checkAuthA, checkUUID, checkAuthFactory, admAccController.toggleBankAccount);
router.delete("/bankaccounts/:bankAccountID",     checkAuthA, checkUUID, checkAuthFactory, admAccController.deleteBankAccount);

// ## Bank Account Register
// #############################################################


// #############################################################
// ## Daily Accounting (บัญชีรายวัน)

// ## GET  /api/a/admacc/daily/periods/:companyID/:factoryID
router.get("/daily/periods/:companyID/:factoryID",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.getAllPeriods);

// ## GET  /api/a/admacc/daily/data/:companyID/:factoryID/:year/:month
router.get("/daily/data/:companyID/:factoryID/:year/:month",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.getDailyData);

// ## GET  /api/a/admacc/daily/bill-search/:companyID/:factoryID?dateStart=&dateEnd=&chartAccCode=&q=
// ## ค้นหาบิลย้อนหลังตามช่วงวัน (ไม่เกี่ยวงวด) + บัญชี level3 + คำค้น
router.get("/daily/bill-search/:companyID/:factoryID",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.searchBills);

// ## เจ้าหนี้ / หนี้ค้างชำระ (ซื้อเชื่อ)
router.get("/payable/report/:companyID/:factoryID",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.getPayableReport);   // ต้องมาก่อน :companyID
router.get("/payable/:companyID/:factoryID",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.listPayables);
router.post("/payable/payment",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.addPayablePayment);
router.post("/payable/payment/delete",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.deletePayablePayment);   // ลบการจ่าย 1 ครั้ง + คืน cashbook
router.delete("/payable/:payableID",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.deletePayable);   // ลบหนี้ orphan + คืน cashbook

// ## GET  /api/a/admacc/daily/master/:companyID/:factoryID
router.get("/daily/master/:companyID/:factoryID",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.getDailyMasterData);

// ## POST /api/a/admacc/daily/entry/create
router.post("/daily/entry/create",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.createDailyEntry);

// ## PUT  /api/a/admacc/daily/entry/update
router.put("/daily/entry/update",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.updateDailyEntry);

// ## GET  /api/a/admacc/daily/entry-by-cashbook/:cashBookEntryID
router.get("/daily/entry-by-cashbook/:cashBookEntryID",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.getDailyEntryByCashBook);

// ## GET  /api/a/admacc/daily/bill-by-id/:billID — บิลต้นทาง (items + รูป) ให้ Cash Book popup
router.get("/daily/bill-by-id/:billID",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.getBillById);

// ## GET  /api/a/admacc/daily/bill-log/:billID — audit log ของบิล (ใครทำอะไร)
router.get("/daily/bill-log/:billID",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.getBillLog);

// ## GET  /api/a/admacc/daily/logs/:companyID/:factoryID — audit log ทั้งโรงงาน (รวมบิลที่ถูกลบ)
router.get("/daily/logs/:companyID/:factoryID",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.getFactoryLog);

// ## GET  /api/a/admacc/log/station/:companyID/:factoryID — Logging Station (ทุก module + filter + pagination)
router.get("/log/station/:companyID/:factoryID",
    checkAuthA, checkUUID, checkAuthFactory, loggingController.getStationLogs);

// ## GET  /api/a/admacc/outsource/bills/:companyID/:factoryID/:seasonYear — โรงนอก → บิล (จาก cache)
router.get("/outsource/bills/:companyID/:factoryID/:seasonYear",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.getBills);

// ## GET  /api/a/admacc/outsource/bill-detail/:companyID/:factoryID/:seasonYear?billKey= — แจก size ต่อบิล
router.get("/outsource/bill-detail/:companyID/:factoryID/:seasonYear",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.getBillDetail);

// ## GET  /api/a/admacc/outsource/bill-bundles/:companyID/:factoryID/:seasonYear?billKey= — bundle เข้า/ยังไม่เข้า (ทำ PDF)
router.get("/outsource/bill-bundles/:companyID/:factoryID/:seasonYear",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.getBillBundles);

// ## POST /api/a/admacc/outsource/bill-cost — accounting ใส่ราคาต้นทุนต่อบิล
router.post("/outsource/bill-cost",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.saveBillCost);

// ## POST /api/a/admacc/outsource/bill-cost/delete — ล้างราคาบิล
router.post("/outsource/bill-cost/delete",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.deleteBillCost);

// ## GET /api/a/admacc/outsource/paid/... — รายการจ่ายที่สำเร็จแล้ว (จัดกลุ่ม)
router.get("/outsource/paid/:companyID/:factoryID/:seasonYear",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.getPaidPayments);

// ## POST /api/a/admacc/outsource/bill-pay — จ่ายเงินบิล outsource (สร้าง Cash Book เงินออก + status paid)
router.post("/outsource/bill-pay",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.payBill);

// ## POST /api/a/admacc/outsource/bill-pay/void — ยกเลิกการจ่าย (คืน billed + soft-delete cashbook)
router.post("/outsource/bill-pay/void",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.voidPayBill);

// ## POST /api/a/admacc/outsource/bill-pay/edit — แก้ไขวิธีจ่าย/เช็ค/cash man/หมายเหตุ (เฉพาะยังไม่ปิดจ๊อบ)
router.post("/outsource/bill-pay/edit",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.editPayment);

// ## POST /api/a/admacc/outsource/bill-evidence — บันทึกรายการรูปหลักฐานของบิล
router.post("/outsource/bill-evidence",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.saveEvidence);

// ## POST /api/a/admacc/outsource/bill-lock — ปิดจ๊อบ (ล็อก) / ปลดล็อก ทั้งกลุ่ม
router.post("/outsource/bill-lock",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.lockPayment);

// ## POST /api/a/admacc/outsource/manual-bill — สร้างบิลต้นทุน manual (งานเพิ่ม/ซ่อม)
router.post("/outsource/manual-bill",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.createManualBill);

// ## POST /api/a/admacc/outsource/manual-bill/update — แก้บิล manual (เฉพาะยังไม่จ่าย)
router.post("/outsource/manual-bill/update",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.updateManualBill);

// ## POST /api/a/admacc/outsource/manual-bill/delete — ลบบิล manual ทั้งใบ (เฉพาะยังไม่จ่าย)
router.post("/outsource/manual-bill/delete",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.deleteManualBill);

// ## POST /api/a/admacc/outsource/bill-freeze — ล็อกเตรียมจ่าย (freeze) / ปลด
router.post("/outsource/bill-freeze",
    checkAuthA, checkUUID, checkAuthFactory, outsourceCostController.freezeBill);

// ## DELETE /api/a/admacc/daily/entry/:entryID
router.delete("/daily/entry/:entryID",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.deleteDailyEntry);

// ## PUT  /api/a/admacc/daily/period/close
router.put("/daily/period/close",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.closeDailyPeriod);

// ## POST /api/a/admacc/daily/bill/create
router.post("/daily/bill/create",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.createDailyBill);

// ## PUT /api/a/admacc/daily/bill/update
router.put("/daily/bill/update",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.updateDailyBill);

// ## DELETE /api/a/admacc/daily/bill/:billID
router.delete("/daily/bill/:billID",
    checkAuthA, checkUUID, checkAuthFactory, dailyAccController.deleteDailyBill);

// ## Daily Accounting
// #############################################################


// #############################################################
// ## Worker เหมา (worker zone) — รายงานยอดสแกนงาน worker

// ## GET /api/a/admacc/worker-scan/nodes/:companyID  → dropdown node (distinct nodeID)
router.get("/worker-scan/nodes/:companyID",
    checkAuthA, checkUUID, checkAuthFactory, workerScanController.getWorkerScanNodes);

// ## GET /api/a/admacc/worker-scan/report/:companyID/:factoryID/:nodeID?dateStart=&dateEnd=
router.get("/worker-scan/report/:companyID/:factoryID/:nodeID",
    checkAuthA, checkUUID, checkAuthFactory, workerScanController.getWorkerScanReport);

// ## Worker เหมา
// #############################################################


// #############################################################
// ## Secure Deletion (Data Management Lifecycle) — admin เท่านั้น · ลบถาวร

// ## GET  preview (นับ ไม่ลบ)
router.get("/secure-deletion/preview/:companyID/:season",
    checkAuthA, checkUUID, secureDeletionController.previewSeasonDeletion);

// ## POST execute (ลบจริง — ต้องส่ง confirmSeason ตรง)
router.post("/secure-deletion/execute",
    checkAuthA, checkUUID, secureDeletionController.executeSeasonDeletion);

// ## Secure Deletion
// #############################################################


// #############################################################
// ## Clear Data (ล้างข้อมูลทดสอบ ระดับโรงงาน — เฉพาะ factory ที่เลือก)
// ## Live translate + ภาษา profile (ไม่ผูกโรงงาน)
router.post("/translate",   checkAuthA, checkUUID, userPrefController.translateText);
router.get("/trans-pref",   checkAuthA, checkUUID, userPrefController.getTransPref);
router.put("/trans-pref",   checkAuthA, checkUUID, userPrefController.setTransPref);

router.post("/admin/clear-data/preview",
    checkAuthA, checkUUID, checkAuthFactory, clearDataController.previewClearData);
router.post("/admin/clear-data/execute",
    checkAuthA, checkUUID, checkAuthFactory, clearDataController.executeClearData);

// ## Secure Deletion
// #############################################################


// #############################################################
// ## ค่าแรงเหมา ลงเอง (Manual Piece) — กรณีสแกนไม่ติด

// ## pickers
router.get("/manual-piece/orders/:companyID/:factoryID/:season",
    checkAuthA, checkUUID, checkAuthFactory, admAccController.getManualOrders);
router.get("/manual-piece/subnodes/:companyID/:factoryID/:orderID",
    checkAuthA, checkUUID, checkAuthFactory, admAccController.getManualSubnodeCost);

// ## list / create / delete
router.get("/manual-piece/:companyID/:factoryID/:periodID/:workerID",
    checkAuthA, checkUUID, checkAuthFactory, admAccController.listManualPieces);
router.post("/manual-piece",
    checkAuthA, checkUUID, checkAuthFactory, admAccController.createManualPiece);
router.delete("/manual-piece/:manualID",
    checkAuthA, checkUUID, checkAuthFactory, admAccController.deleteManualPiece);

// ## Manual Piece
// #############################################################


module.exports = router;
