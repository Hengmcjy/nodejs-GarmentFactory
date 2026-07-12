/**
 * r-adm-gsconfig.js — Express Router Reference
 * วางที่: routes/user/r-adm-gsconfig.js
 *
 * Mount ใน server.js:
 *   const gsconfigRoutes = require('./routes/user/r-adm-gsconfig');
 *   app.use('/api/a/gsconfig', gsconfigRoutes);
 */

const express    = require('express');
const router     = express.Router();
const ctrl       = require('../../controllers/user/c-adm-gsconfig');
const checkAuthA = require('../../middleware/check-authA');
const checkAuthFactory = require('../../middleware/check-authFactory');   // ตรวจสิทธิ์โรงงาน

// GET — ดึง config ทั้งหมดของ factory (เรียกตอน login / factory select)
router.get('/all/:companyID/:factoryID', checkAuthA, ctrl.getAllConfigs);

// PUT — แก้ไข value (admin only) — type B: เช็คสิทธิ์โรงงานใน controller (updateConfig)
router.put('/update', checkAuthA, checkAuthFactory, ctrl.updateConfig);

// PUT — จัดลำดับแถวเอง (บันทึก seq ต่อ module) — เช็คสิทธิ์โรงงานใน controller
router.put('/reorder', checkAuthA, ctrl.reorderConfigs);

// POST — seed default configs สำหรับ factory ใหม่ (type A: มี factoryID ใน body)
router.post('/seed', checkAuthA, checkAuthFactory, ctrl.seedConfigs);

module.exports = router;
