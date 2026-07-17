const express = require("express");
const masterController = require("../../controllers/user/c-master");

const checkAuthA = require('../../middleware/check-authA');
const checkUUID  = require('../../middleware/check-uuid');

const router = express.Router();

// ---- Company ----
router.get("/company/:companyID", checkAuthA, checkUUID, masterController.getCompany);
router.put("/company/profile",    checkAuthA, checkUUID, masterController.updateCompanyProfile);

// ---- Factory (own + outsource) ----
router.get("/factory/:companyID", checkAuthA, checkUUID, masterController.getFactories);
router.put("/factory/profile",    checkAuthA, checkUUID, masterController.updateFactoryProfile);
router.post("/factory",           checkAuthA, checkUUID, masterController.createFactory);

// ---- Customer ----
router.get("/customer/:companyID", checkAuthA, checkUUID, masterController.getCustomers);
router.post("/customer/save",      checkAuthA, checkUUID, masterController.saveCustomer);

// ---- Product (Master Data > Product) ----
router.get("/product/:companyID", checkAuthA, checkUUID, masterController.getProducts);
router.post("/product/save",      checkAuthA, checkUUID, masterController.saveProduct);
router.post("/product/delete",    checkAuthA, checkUUID, masterController.deleteProduct);   // POST เพราะ productID มี space ท้าย

// ---- Color (per setName = per customer) ----
router.get("/color/:companyID/:setName", checkAuthA, checkUUID, masterController.getColors);
router.post("/color/save",               checkAuthA, checkUUID, masterController.saveColor);
router.delete("/color/:id",              checkAuthA, checkUUID, masterController.deleteColor);

// ---- Size (global) ----
router.get("/size",         checkAuthA, checkUUID, masterController.getSizes);
router.post("/size/save",   checkAuthA, checkUUID, masterController.saveSize);
router.delete("/size/:id",  checkAuthA, checkUUID, masterController.deleteSize);

// ---- Target Place ----
router.get("/targetplace",        checkAuthA, checkUUID, masterController.getTargetPlaces);
router.post("/targetplace/save",  checkAuthA, checkUUID, masterController.saveTargetPlace);
router.delete("/targetplace/:id", checkAuthA, checkUUID, masterController.deleteTargetPlace);

// ---- Subnode (SubNodeFlowC · ขั้นตอนย่อยต่อ node) — [AI ใหม่ 2026-07-17] ----
router.get("/subnode/:companyID", checkAuthA, checkUUID, masterController.getSubnodes);
router.post("/subnode/save",      checkAuthA, checkUUID, masterController.saveSubnode);
router.delete("/subnode/:id",     checkAuthA, checkUUID, masterController.deleteSubnode);

// ---- System Info (ดับเบิลคลิกชื่อ user ใน sidebar — ดู MGDB ว่าต่อ DB ไหน) ----
router.get("/sysinfo", checkAuthA, checkUUID, masterController.getSysInfo);

// ---- Country ----
router.get("/country/:companyID", checkAuthA, checkUUID, masterController.getCountries);
router.post("/country/save",      checkAuthA, checkUUID, masterController.saveCountry);

module.exports = router;
