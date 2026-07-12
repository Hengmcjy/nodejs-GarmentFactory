/**
 * r-adm-hr.js  — Route Reference
 * วางที่:   routes/user/r-adm-hr.js
 * ลงทะเบียนใน server.js:
 *   const hrRoutes = require('./routes/user/r-adm-hr');
 *   app.use('/api/a/hr', hrRoutes);
 */

const express    = require('express');
const router     = express.Router();
const ctrl       = require('../../controllers/user/c-adm-hr');
const checkAuthA = require('../../middleware/check-authA');
const checkUUID  = require('../../middleware/check-uuid');

// ── Employee Register ─────────────────────────────────────────────────────
// GET  /api/a/hr/employee/list/:companyID/:factoryID/:page/:limit
router.get('/employee/list/:companyID/:factoryID/:page/:limit', checkAuthA, checkUUID, ctrl.getEmployees);

// POST /api/a/hr/employee/create
router.post('/employee/create', checkAuthA, checkUUID, ctrl.createEmployee);

// PUT  /api/a/hr/employee/update
router.put('/employee/update', checkAuthA, checkUUID, ctrl.updateEmployee);

// PUT  /api/a/hr/employee/status
router.put('/employee/status', checkAuthA, checkUUID, ctrl.updateEmployeeStatus);

// PUT  /api/a/hr/employee/pic
router.put('/employee/pic', checkAuthA, checkUUID, ctrl.updateEmployeePic);

// ── Payroll ───────────────────────────────────────────────────────────────
// GET  /api/a/hr/payroll/periods/:companyID/:factoryID
router.get('/payroll/periods/:companyID/:factoryID', checkAuthA, checkUUID, ctrl.getPayrollPeriods);

// POST /api/a/hr/payroll/generate
router.post('/payroll/generate', checkAuthA, checkUUID, ctrl.generatePayroll);

// GET  /api/a/hr/payroll/items/:payrollPeriodID
router.get('/payroll/items/:payrollPeriodID', checkAuthA, checkUUID, ctrl.getPayrollItems);

// PUT  /api/a/hr/payroll/item
router.put('/payroll/item', checkAuthA, checkUUID, ctrl.updatePayrollItem);

// PUT  /api/a/hr/payroll/close
router.put('/payroll/close', checkAuthA, checkUUID, ctrl.closePayrollPeriod);

module.exports = router;
