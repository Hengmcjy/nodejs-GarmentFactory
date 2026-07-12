/**
 * c-adm-hr.js  — Node.js Controller Reference
 * วางที่: controllers/user/c-adm-hr.js
 *
 * Collections: employees, payrollPeriods, payrollItems
 */

const Employee      = require('../../models/m-employee');
const PayrollPeriod = require('../../models/m-payroll-period');
const PayrollItem   = require('../../models/m-payroll-item');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/a/hr/employee/list/:companyID/:factoryID/:page/:limit
// ?search=...  → ค้นหา employeeID หรือ name หรือ position
// ─────────────────────────────────────────────────────────────────────────────
exports.getEmployees = async (req, res) => {
    try {
        const { companyID, factoryID } = req.params;
        const page   = Math.max(parseInt(req.params.page)  || 1, 1);
        const limit  = Math.max(parseInt(req.params.limit) || 20, 1);
        const skip   = (page - 1) * limit;
        const search = (req.query.search || '').trim();

        const baseQuery = { companyID, factoryID, status: { $ne: 'deleted' } };

        const searchQuery = search
            ? { $or: [
                { employeeID: { $regex: search, $options: 'i' } },
                { name:       { $regex: search, $options: 'i' } },
                { position:   { $regex: search, $options: 'i' } },
              ]}
            : {};

        const query = { ...baseQuery, ...searchQuery };

        const [employees, total] = await Promise.all([
            Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Employee.countDocuments(query),
        ]);

        return res.json({ success: true, employees, total });
    } catch (err) {
        console.error('[getEmployees]', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/a/hr/employee/create
// ─────────────────────────────────────────────────────────────────────────────
exports.createEmployee = async (req, res) => {
    try {
        const { employeeID, companyID, factoryID } = req.body;

        if (!employeeID || !companyID || !factoryID || !req.body.name) {
            return res.status(400).json({ success: false, message: 'employeeID, companyID, factoryID, name are required' });
        }

        const exists = await Employee.findOne({ employeeID }).lean();
        if (exists) {
            return res.status(400).json({ success: false, message: `employeeID "${employeeID}" ซ้ำ` });
        }

        const employee = new Employee({
            ...req.body,
            createBy: {
                userID:   req.body.createByUserID   || '',
                userName: req.body.createByUserName || '',
            },
        });

        await employee.save();
        return res.json({ success: true, employee });
    } catch (err) {
        console.error('[createEmployee]', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/a/hr/employee/update
// ─────────────────────────────────────────────────────────────────────────────
exports.updateEmployee = async (req, res) => {
    try {
        const { employeeID } = req.body;
        if (!employeeID) return res.status(400).json({ success: false, message: 'employeeID required' });

        const { _id, createdAt, createBy, __v, ...updateData } = req.body;
        await Employee.updateOne({ employeeID }, { $set: updateData });
        return res.json({ success: true });
    } catch (err) {
        console.error('[updateEmployee]', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/a/hr/employee/status
// body: { employeeID, status }
// ─────────────────────────────────────────────────────────────────────────────
exports.updateEmployeeStatus = async (req, res) => {
    try {
        const { employeeID, status } = req.body;
        if (!employeeID || !status) return res.status(400).json({ success: false, message: 'employeeID and status required' });

        await Employee.updateOne({ employeeID }, { $set: { status } });
        return res.json({ success: true });
    } catch (err) {
        console.error('[updateEmployeeStatus]', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/a/hr/employee/pic
// body: { employeeID, pic }
// ─────────────────────────────────────────────────────────────────────────────
exports.updateEmployeePic = async (req, res) => {
    try {
        const { employeeID, pic } = req.body;
        if (!employeeID) return res.status(400).json({ success: false, message: 'employeeID required' });

        await Employee.updateOne({ employeeID }, { $set: { pic } });
        return res.json({ success: true });
    } catch (err) {
        console.error('[updateEmployeePic]', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ═════════════════════════════════════════════════════════════════════════════
// PAYROLL
// ═════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/a/hr/payroll/periods/:companyID/:factoryID
// ─────────────────────────────────────────────────────────────────────────────
exports.getPayrollPeriods = async (req, res) => {
    try {
        const { companyID, factoryID } = req.params;
        const periods = await PayrollPeriod
            .find({ companyID, factoryID })
            .sort({ month: -1 })
            .lean();
        return res.json({ success: true, periods });
    } catch (err) {
        console.error('[getPayrollPeriods]', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/a/hr/payroll/generate
// body: { companyID, factoryID, month, createByUserID }
// สร้าง period ใหม่ + generate items จากพนักงาน active ทั้งหมด
// ─────────────────────────────────────────────────────────────────────────────
exports.generatePayroll = async (req, res) => {
    try {
        const { companyID, factoryID, month, createByUserID } = req.body;
        if (!companyID || !factoryID || !month) {
            return res.status(400).json({ success: false, message: 'companyID, factoryID, month required' });
        }

        // ป้องกัน duplicate
        const exists = await PayrollPeriod.findOne({ companyID, factoryID, month }).lean();
        if (exists) {
            return res.status(400).json({ success: false, message: `งวด ${month} มีอยู่แล้ว` });
        }

        // ดึงพนักงาน active ทั้งหมด
        const employees = await Employee.find({ companyID, factoryID, status: 'a' }).lean();
        if (!employees.length) {
            return res.status(400).json({ success: false, message: 'ไม่มีพนักงาน active ในโรงงานนี้' });
        }

        const payrollPeriodID = `PR-${month}-${factoryID}`;

        // สร้าง items
        const items = employees.map(emp => {
            const socialSec = Math.round(emp.salary * (emp.socialSecRate || 5) / 100);
            const netPay    = emp.salary - socialSec;
            return {
                payrollPeriodID,
                employeeID:  emp.employeeID,
                companyID,   factoryID,
                name:        emp.name,
                position:    emp.position,
                department:  emp.department,
                bankAccount: emp.bankAccount,
                bankName:    emp.bankName,
                baseSalary:  emp.salary,
                bonus:       0,
                socialSec,
                tax:         0,
                otherDeduct: 0,
                netPay,
                note: '',
            };
        });

        const totalGross  = items.reduce((s, i) => s + i.baseSalary + i.bonus, 0);
        const totalDeduct = items.reduce((s, i) => s + i.socialSec + i.tax + i.otherDeduct, 0);
        const totalNet    = items.reduce((s, i) => s + i.netPay, 0);

        // บันทึก period + items พร้อมกัน
        const [period] = await Promise.all([
            PayrollPeriod.create({
                payrollPeriodID, companyID, factoryID, month,
                totalGross, totalDeduct, totalNet,
                empCount: items.length,
                status: 'open',
                createBy: { userID: createByUserID || '' },
            }),
            PayrollItem.insertMany(items),
        ]);

        return res.json({ success: true, period });
    } catch (err) {
        console.error('[generatePayroll]', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/a/hr/payroll/items/:payrollPeriodID
// ─────────────────────────────────────────────────────────────────────────────
exports.getPayrollItems = async (req, res) => {
    try {
        const { payrollPeriodID } = req.params;
        const items = await PayrollItem
            .find({ payrollPeriodID })
            .sort({ department: 1, name: 1 })
            .lean();
        return res.json({ success: true, items });
    } catch (err) {
        console.error('[getPayrollItems]', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/a/hr/payroll/item
// body: payroll item fields (bonus, tax, otherDeduct, note ฯลฯ)
// ─────────────────────────────────────────────────────────────────────────────
exports.updatePayrollItem = async (req, res) => {
    try {
        const { payrollPeriodID, employeeID, bonus = 0, tax = 0, otherDeduct = 0, note = '' } = req.body;
        if (!payrollPeriodID || !employeeID) {
            return res.status(400).json({ success: false, message: 'payrollPeriodID and employeeID required' });
        }

        const item = await PayrollItem.findOne({ payrollPeriodID, employeeID }).lean();
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        const netPay = item.baseSalary + bonus - item.socialSec - tax - otherDeduct;

        await PayrollItem.updateOne(
            { payrollPeriodID, employeeID },
            { $set: { bonus, tax, otherDeduct, netPay, note } }
        );

        // recalculate period totals
        const allItems = await PayrollItem.find({ payrollPeriodID }).lean();
        const totalGross  = allItems.reduce((s, i) => s + i.baseSalary + i.bonus, 0);
        const totalDeduct = allItems.reduce((s, i) => s + i.socialSec + i.tax + i.otherDeduct, 0);
        const totalNet    = allItems.reduce((s, i) => s + i.netPay, 0);
        await PayrollPeriod.updateOne({ payrollPeriodID }, { $set: { totalGross, totalDeduct, totalNet } });

        return res.json({ success: true, netPay });
    } catch (err) {
        console.error('[updatePayrollItem]', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/a/hr/payroll/close
// body: { payrollPeriodID }
// ─────────────────────────────────────────────────────────────────────────────
exports.closePayrollPeriod = async (req, res) => {
    try {
        const { payrollPeriodID } = req.body;
        if (!payrollPeriodID) return res.status(400).json({ success: false, message: 'payrollPeriodID required' });

        await PayrollPeriod.updateOne({ payrollPeriodID }, { $set: { status: 'closed' } });
        return res.json({ success: true });
    } catch (err) {
        console.error('[closePayrollPeriod]', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
