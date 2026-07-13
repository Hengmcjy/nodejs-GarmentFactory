const mongoose = require('mongoose');
const moment   = require('moment-timezone');

const ShareFunc = require("../c-api-app-share-function");

const AccChart    = require("../../models/m-acc-chart");
const AccFirm     = require("../../models/m-acc-firm");
const AccProject  = require("../../models/m-acc-project");
const AccShop     = require("../../models/m-acc-shop");
const AccCashMan          = require("../../models/m-acc-cashman");
const AccCashBook         = require("../../models/m-acc-cashbook");
const AccCashBookPeriod   = require("../../models/m-acc-cashbook-period");
const AccCashBookMonth    = require("../../models/m-acc-cashbook-month");
const AccBankAccount      = require("../../models/m-acc-bankaccount");
const DailyPeriod         = require("../../models/m-daily-period");   // ## ต้นน้ำ: Cash Book ปิดได้ต่อเมื่อ Daily ปิดงวดเดือนนั้นแล้ว

const WorkerPayPeriod      = require("../../models/m-worker-pay-period");
const WorkerPayItem        = require("../../models/m-worker-pay-item");
const WorkerPayProduction  = require("../../models/m-worker-pay-production");
const WpManualPiece        = require("../../models/m-wp-manual-piece");   // ค่าแรงเหมา ลงเอง (manual)

const factoryAuth = require("../../middleware/check-authFactory");   // เช็คสิทธิ์โรงงาน route แบบ B (update/delete by ID)

const { writeLog } = require("./c-log-util");   // audit log กลาง (module='cashbook')

// ## ป้ายชื่อประเภท transaction Cash Book (ใช้ในสรุป log)
function cbTypeLabel(t) {
    return ({ income: 'รายรับ', expense: 'รายจ่าย', in: 'รายรับ', out: 'รายจ่าย',
              transfer_out: 'โอนออก', transfer_in: 'โอนเข้า' })[t] || t;
}

// ## format เงินไทย 2 ตำแหน่ง
function fmtB(n) { return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 }); }
// ## ชื่อ worker สำหรับ log (workerID = User.userID → uInfo.userName)
async function wkName(workerID) {
    if (!workerID) return '';
    const u = await User.findOne({ userID: workerID }).lean();
    return u?.uInfo?.userName || workerID;
}
// ## เขียน audit log module='worker' (ค่าแรง worker) — ผ่าน util กลาง (ได้ expireAt/retention)
async function writeWorkerLog(data, req) {
    await writeLog({
        ...data, module: 'worker', targetType: data.targetType || 'workeritem',
        userID: req?.userData?.tokenSet?.userID || '', userName: req?.userData?.userName || '',
    });
}

const User                    = require("../../models/m-user");
const FingerScanSummary       = require("../../models/m-fingerscan-summary");   // สรุปสแกน (วัน/OT) → ค่าแรงรายวัน auto
const Gsconfig                = require("../../models/m-gsconfig");              // config รหัสบัญชี + OT
const UserActivity            = require("../../models/m-user-activity");         // Monitor: session ที่ใช้งานอยู่
const AccLog                  = require("../../models/m-acc-log");                // audit log (drill-down การกระทำต่อ user)
const Useracc                 = require("../../models/m-acc-user");                // login user (ชื่อ+รูป สำหรับ Monitor)
const OrderProduction         = require("../../models/m-orderProduction");
const OrderSubNodeFlowSetCost = require("../../models/m-orderSubNodeFlowSetCost");

moment.tz.setDefault('Asia/Bangkok');

// ── ymdToUTC ──────────────────────────────
// Requirement: แปลง "YYYY-MM-DD" → Date ที่ UTC เที่ยงคืน — convention เดียวของ "วันปฏิทิน" (calendar date) ทั้งระบบ
//   เหตุผล: ประเทศไทย = UTC+7 ถ้าเก็บแบบ tz-shift/local วันที่ 1 จะเพี้ยนไปเดือนก่อน ทำให้งวดคาบเกี่ยว
//   หมายเหตุ: ใช้กับ "วันปฏิทิน" เท่านั้น (entryDate, cashbook date, period start/end) — ไม่ใช้กับ timestamp จริง (scan datetime)
function ymdToUTC(ymd) {
    return new Date(String(ymd).slice(0, 10) + 'T00:00:00.000Z');
}

// ── ymdStr ──────────────────────────────
// Requirement: อ่าน Date (เก็บแบบ UTC-midnight) กลับเป็น string "YYYY-MM-DD" ก่อนส่งให้ frontend
function ymdStr(d) {
    return d ? new Date(d).toISOString().slice(0, 10) : '';
}

// ── dailyPeriodStatus ──────────────────────────────
// Requirement: คืนสถานะงวดบัญชีรายวัน (Daily) ของเดือน "YYYY-MM" เป็น 3 แบบ
//   'none'   = ไม่มีงวดเลย (ไม่มีกิจกรรม Daily) → ไม่ต้องรอ ปิด Cash Book ได้เลย
//   'open'   = มีงวดและเปิดอยู่ (รายการ cash ยังแก้ได้) → Cash Book ต้องรอ Daily ปิดก่อน
//   'closed' = Daily ปิดแล้ว → ปิด Cash Book ได้
async function dailyPeriodStatus(companyID, factoryID, month) {
    const year = Number(String(month).slice(0, 4));
    const mm   = Number(String(month).slice(5, 7));
    const dp = await DailyPeriod.findOne({ companyID, factoryID, year, month: mm }).lean();
    if (!dp) return 'none';
    return dp.status === 'closed' ? 'closed' : 'open';
}

// WP_AUTO_INCOME_CODE ย้ายไปรับจาก req.body / req.query แทน (ค่าอยู่ใน gsconfig)


// #############################################################
// ## Chart of Accounts (ผังบัญชี)

// ## GET /api/a/admacc/chart/:companyID/:factoryID
// ## ดึงบัญชีทั้งหมดของ factory นั้น (level 2 + 3)
exports.getChart = async (req, res, next) => {
  const { companyID, factoryID } = req.params;

  try {
    const accounts = await AccChart.find({
      companyID,
      factoryID,
      status: 'a',
    })
    .sort({ category: 1, code: 1 })
    .lean();

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), accounts });

  } catch (err) {
    console.error('[getChart]', err.message);
    return next(err);
  }
};


// ## POST /api/a/admacc/chart/import-lang
// ## นำเข้าคำแปลชื่อบัญชีหลายภาษา (จาก Excel) → เก็บใน accChart.nameLang (match ด้วย code)
// ## body: { companyID, factoryID, rows: [{ code, th, en, cn, mm, jp }] }
// ## th ที่กรอกมา = sync กลับไป nameI18n.lText ด้วย (ให้ไทย default ตรงกัน)
exports.importChartLang = async (req, res, next) => {
  const { companyID, factoryID, rows } = req.body;
  if (!companyID || !factoryID || !Array.isArray(rows))
    return res.status(400).json({ success: false, message: 'ต้องระบุ companyID, factoryID และ rows' });
  try {
    let updated = 0, notFound = 0;
    for (const r of rows) {
      const code = String(r.code || '').trim();
      if (!code) continue;
      const setData = {
        'nameLang.th': r.th || '',
        'nameLang.en': r.en || '',
        'nameLang.cn': r.cn || '',
        'nameLang.mm': r.mm || '',
        'nameLang.jp': r.jp || '',
      };
      // ถ้ากรอกไทยมา → ให้ชื่อหลัก (nameI18n.lText) ตรงกันด้วย
      if (r.th && r.th.trim()) setData['nameI18n.lText'] = r.th.trim();
      const res1 = await AccChart.updateOne(
        { companyID, factoryID, code },
        { $set: setData }
      );
      if (res1.matchedCount > 0) updated++; else notFound++;
    }
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), updated, notFound });
  } catch (err) {
    console.error('[importChartLang]', err.message);
    return next(err);
  }
};


// ## POST /api/a/admacc/chart/create
// ## สร้างบัญชีใหม่ (level 2 หรือ level 3)
exports.createAccount = async (req, res, next) => {
  const { companyID, factoryID, code, nameI18n, level, category, parentCode } = req.body;
  const createByUserID = req.userData?.tokenSet?.userID || '';

  if (!companyID || !factoryID || !code || !level || !category) {
    return res.status(400).json({ success: false, message: 'companyID, factoryID, code, level, category required' });
  }
  if (level === 3 && !parentCode) {
    return res.status(400).json({ success: false, message: 'level 3 ต้องมี parentCode' });
  }

  try {
    const exists = await AccChart.findOne({ companyID, factoryID, code });
    if (exists) {
      // ## code ซ้ำที่ยัง active → ซ้ำจริง ปฏิเสธ
      if (exists.status !== 'i') {
        return res.status(400).json({ success: false, message: `code "${code}" มีอยู่แล้วใน factory นี้` });
      }
      // ## code เดิมที่เคยถูกลบ (soft delete status:'i') → นำกลับมาใช้ใหม่ + อัปเดตข้อมูลใหม่
      exists.status     = 'a';
      exists.nameI18n   = nameI18n || exists.nameI18n || {};
      exists.level      = level;
      exists.category   = category;
      exists.parentCode = parentCode || null;
      exists.updatedAt  = new Date();
      await exists.save();
      const rToken = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
      return res.status(200).json({ success: true, token: rToken, expiresIn: Number(process.env.TOKENExpiresIn), account: exists, reactivated: true });
    }

    const account = new AccChart({
      companyID,
      factoryID,
      code:        code.trim(),
      nameI18n:    nameI18n || {},
      level,
      category,
      parentCode:  parentCode || null,
      externalMappings: [],
      status:      'a',
      createdAt:   new Date(),
      createBy:    { userID: createByUserID },
    });

    await account.save();

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.status(201).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), account });

  } catch (err) {
    console.error('[createAccount]', err.message);
    return next(err);
  }
};


// ## PUT /api/a/admacc/chart/update
// ## แก้ไขบัญชี (code, nameI18n, externalMappings)
exports.updateAccount = async (req, res, next) => {
  const { accountID, code, nameI18n, externalMappings } = req.body;

  if (!accountID) {
    return res.status(400).json({ success: false, message: 'accountID required' });
  }

  try {
    // ## เช็คสิทธิ์โรงงานของบัญชีนี้ก่อนแก้ (route แบบ B — ไม่มี factoryID ใน request)
    const rec = await factoryAuth.assertRecord(req, res, AccChart, { _id: accountID });
    if (!rec) return;

    const setData = {};
    if (code)             setData.code             = code.trim();
    if (nameI18n)         setData.nameI18n         = nameI18n;
    if (externalMappings) setData.externalMappings = externalMappings;

    await AccChart.findByIdAndUpdate(accountID, { $set: setData });

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });

  } catch (err) {
    console.error('[updateAccount]', err.message);
    return next(err);
  }
};


// ## DELETE /api/a/admacc/chart/:accountID
// ## soft delete — set status: 'i'
// ## ถ้าเป็น level 2 จะ inactive level 3 ทั้งหมดที่อยู่ใต้ด้วย
exports.deleteAccount = async (req, res, next) => {
  const { accountID } = req.params;

  try {
    const account = await AccChart.findById(accountID).lean();
    if (!account) {
      return res.status(404).json({ success: false, message: 'ไม่พบบัญชีนี้' });
    }
    // ## เช็คสิทธิ์โรงงานของบัญชีนี้ก่อนลบ (route แบบ B)
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, account.factoryID))) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    }

    // inactive ตัวนี้
    await AccChart.findByIdAndUpdate(accountID, { $set: { status: 'i' } });

    // ถ้าเป็น level 2 → inactive level 3 ทั้งหมดใต้มัน
    if (account.level === 2) {
      await AccChart.updateMany(
        { companyID: account.companyID, factoryID: account.factoryID, parentCode: account.code },
        { $set: { status: 'i' } }
      );
    }

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });

  } catch (err) {
    console.error('[deleteAccount]', err.message);
    return next(err);
  }
};

// ## Chart of Accounts
// #############################################################


// #############################################################
// ## Accounting Firms (สนง.บัญชีภายนอก)

// ## GET /api/a/admacc/firms/:companyID
exports.getFirms = async (req, res, next) => {
  const { companyID } = req.params;

  try {
    const firms = await AccFirm.find({ companyID, status: 'a' })
      .sort({ name: 1 })
      .lean();

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), firms });

  } catch (err) {
    console.error('[getFirms]', err.message);
    return next(err);
  }
};


// ## POST /api/a/admacc/firms/create
exports.createFirm = async (req, res, next) => {
  const { companyID, name, shortCode, tel, email, note } = req.body;
  const createByUserID = req.userData?.tokenSet?.userID || '';

  if (!companyID || !name || !shortCode) {
    return res.status(400).json({ success: false, message: 'companyID, name, shortCode required' });
  }

  try {
    // generate firmID
    const count = await AccFirm.countDocuments({ companyID });
    const firmID = `firm_${companyID}_${String(count + 1).padStart(3, '0')}`;

    const firm = new AccFirm({
      firmID,
      companyID,
      name:      name.trim(),
      shortCode: shortCode.trim().toUpperCase(),
      tel:       tel   || '',
      email:     email || '',
      note:      note  || '',
      active:    true,
      status:    'a',
      createdAt: new Date(),
      createBy:  { userID: createByUserID },
    });

    await firm.save();

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.status(201).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), firm });

  } catch (err) {
    console.error('[createFirm]', err.message);
    return next(err);
  }
};


// ## PUT /api/a/admacc/firms/update
exports.updateFirm = async (req, res, next) => {
  const { firmID, name, shortCode, tel, email, note } = req.body;

  if (!firmID) {
    return res.status(400).json({ success: false, message: 'firmID required' });
  }

  try {
    await AccFirm.findOneAndUpdate(
      { firmID },
      { $set: {
          name:      name      || '',
          shortCode: shortCode ? shortCode.trim().toUpperCase() : '',
          tel:       tel       || '',
          email:     email     || '',
          note:      note      || '',
      }}
    );

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });

  } catch (err) {
    console.error('[updateFirm]', err.message);
    return next(err);
  }
};


// ## PUT /api/a/admacc/firms/toggle
// ## toggle active/inactive
exports.toggleFirmActive = async (req, res, next) => {
  const { firmID } = req.body;

  if (!firmID) {
    return res.status(400).json({ success: false, message: 'firmID required' });
  }

  try {
    const firm = await AccFirm.findOne({ firmID }).lean();
    if (!firm) {
      return res.status(404).json({ success: false, message: 'ไม่พบ สนง.บัญชีนี้' });
    }

    await AccFirm.findOneAndUpdate({ firmID }, { $set: { active: !firm.active } });

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), active: !firm.active });

  } catch (err) {
    console.error('[toggleFirmActive]', err.message);
    return next(err);
  }
};


// ## DELETE /api/a/admacc/firms/:firmID
// ## soft delete
exports.deleteFirm = async (req, res, next) => {
  const { firmID } = req.params;

  try {
    await AccFirm.findOneAndUpdate({ firmID }, { $set: { status: 'i', active: false } });

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });

  } catch (err) {
    console.error('[deleteFirm]', err.message);
    return next(err);
  }
};

// ## Accounting Firms
// #############################################################


// #############################################################
// ## Accounting Projects (โครงการ)

// ## GET /api/a/admacc/projects/:companyID/:factoryID
exports.getProjects = async (req, res, next) => {
  const { companyID, factoryID } = req.params;
  try {
    const projects = await AccProject.find({ companyID, factoryID, status: 'a' })
      .sort({ code: 1 }).lean();
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), projects });
  } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/projects/create
exports.createProject = async (req, res, next) => {
  const { companyID, factoryID, name, code, projectStatus } = req.body;
  if (!companyID || !factoryID || !name || !code)
    return res.status(400).json({ success: false, message: 'companyID, factoryID, name, code required' });
  try {
    const exists = await AccProject.findOne({ companyID, factoryID, code: code.trim().toUpperCase(), status: 'a' });
    if (exists) return res.status(400).json({ success: false, message: `code "${code}" มีอยู่แล้วใน factory นี้` });

    const count = await AccProject.countDocuments({ companyID, factoryID });
    const projectID = `proj_${factoryID}_${String(count + 1).padStart(3, '0')}`;

    const project = new AccProject({
      projectID,
      companyID,
      factoryID,
      name:          name.trim(),
      code:          code.trim().toUpperCase(),
      projectStatus: projectStatus || 'active',
      active:        true,
      status:        'a',
      createdAt: new Date(),
      createBy:  { userID: req.userData?.tokenSet?.userID || '' },
    });
    await project.save();
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.status(201).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), project });
  } catch (err) { return next(err); }
};

// ## PUT /api/a/admacc/projects/update
exports.updateProject = async (req, res, next) => {
  const { projectID, name, code, projectStatus } = req.body;
  if (!projectID) return res.status(400).json({ success: false, message: 'projectID required' });
  try {
    // ## เช็คสิทธิ์โรงงานของโครงการนี้ก่อนแก้ (route แบบ B)
    const rec = await factoryAuth.assertRecord(req, res, AccProject, { projectID });
    if (!rec) return;
    const setData = { name: name || '', code: code ? code.trim().toUpperCase() : '' };
    if (projectStatus) setData.projectStatus = projectStatus;
    await AccProject.findOneAndUpdate({ projectID }, { $set: setData });
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
  } catch (err) { return next(err); }
};

// ## PUT /api/a/admacc/projects/toggle
exports.toggleProjectActive = async (req, res, next) => {
  const { projectID } = req.body;
  if (!projectID) return res.status(400).json({ success: false, message: 'projectID required' });
  try {
    const project = await AccProject.findOne({ projectID }).lean();
    if (!project) return res.status(404).json({ success: false, message: 'ไม่พบโครงการนี้' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, project.factoryID)))
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    await AccProject.findOneAndUpdate({ projectID }, { $set: { active: !project.active } });
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), active: !project.active });
  } catch (err) { return next(err); }
};

// ## DELETE /api/a/admacc/projects/:projectID
exports.deleteProject = async (req, res, next) => {
  const { projectID } = req.params;
  try {
    const project = await AccProject.findOne({ projectID }).lean();
    if (!project) return res.status(404).json({ success: false, message: 'ไม่พบโครงการ' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, project.factoryID)))
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    if (project.projectStatus === 'done' || project.projectStatus === 'lock')
      return res.status(400).json({ success: false, message: `ไม่สามารถลบได้ สถานะ: ${project.projectStatus}` });
    await AccProject.findOneAndUpdate({ projectID }, { $set: { status: 'i', active: false } });
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
  } catch (err) { return next(err); }
};

// ## Accounting Projects
// #############################################################


// #############################################################
// ## Shops / Vendors (ร้านค้า / คนที่โรงงานซื้อของด้วย)

// ## GET /api/a/admacc/shops/:companyID/:factoryID
exports.getShops = async (req, res, next) => {
  const { companyID, factoryID } = req.params;
  try {
    const shops = await AccShop.find({ companyID, factoryID, status: 'a' })
      .sort({ name: 1 }).lean();
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), shops });
  } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/shops/create
exports.createShop = async (req, res, next) => {
  const { companyID, factoryID, name, shortCode, type, tel, taxID, note } = req.body;
  if (!companyID || !factoryID || !name || !shortCode)
    return res.status(400).json({ success: false, message: 'companyID, factoryID, name, shortCode required' });
  try {
    const exists = await AccShop.findOne({
      companyID, factoryID,
      shortCode: shortCode.trim().toUpperCase(),
      status: 'a',
    });
    if (exists)
      return res.status(400).json({ success: false, message: `shortCode "${shortCode}" มีอยู่แล้วใน factory นี้` });

    const count = await AccShop.countDocuments({ companyID, factoryID });
    const shopID = `shop_${factoryID}_${String(count + 1).padStart(4, '0')}`;

    const shop = new AccShop({
      shopID,
      companyID,
      factoryID,
      name:      name.trim(),
      shortCode: shortCode.trim().toUpperCase(),
      type:      type || 'shop',
      tel:       tel   || '',
      taxID:     taxID || '',
      note:      note  || '',
      active:    true,
      status:    'a',
      createdAt: new Date(),
      createBy:  { userID: req.userData?.tokenSet?.userID || '' },
    });
    await shop.save();

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.status(201).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), shop });
  } catch (err) { return next(err); }
};

// ## PUT /api/a/admacc/shops/update
exports.updateShop = async (req, res, next) => {
  const { shopID, name, shortCode, type, tel, taxID, note } = req.body;
  if (!shopID) return res.status(400).json({ success: false, message: 'shopID required' });
  try {
    // ## เช็คสิทธิ์โรงงานของร้านค้านี้ก่อนแก้ (route แบบ B)
    const rec = await factoryAuth.assertRecord(req, res, AccShop, { shopID });
    if (!rec) return;
    await AccShop.findOneAndUpdate(
      { shopID },
      { $set: {
          name:      name      ? name.trim()                       : '',
          shortCode: shortCode ? shortCode.trim().toUpperCase()    : '',
          type:      type      || 'shop',
          tel:       tel       || '',
          taxID:     taxID     || '',
          note:      note      || '',
      }}
    );
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
  } catch (err) { return next(err); }
};

// ## PUT /api/a/admacc/shops/toggle
exports.toggleShopActive = async (req, res, next) => {
  const { shopID } = req.body;
  if (!shopID) return res.status(400).json({ success: false, message: 'shopID required' });
  try {
    const shop = await AccShop.findOne({ shopID }).lean();
    if (!shop) return res.status(404).json({ success: false, message: 'ไม่พบร้านค้านี้' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, shop.factoryID)))
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    await AccShop.findOneAndUpdate({ shopID }, { $set: { active: !shop.active } });
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), active: !shop.active });
  } catch (err) { return next(err); }
};

// ## DELETE /api/a/admacc/shops/:shopID
exports.deleteShop = async (req, res, next) => {
  const { shopID } = req.params;
  try {
    // ## เช็คสิทธิ์โรงงานของร้านค้านี้ก่อนลบ (route แบบ B)
    const rec = await factoryAuth.assertRecord(req, res, AccShop, { shopID });
    if (!rec) return;
    await AccShop.findOneAndUpdate({ shopID }, { $set: { status: 'i', active: false } });
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
  } catch (err) { return next(err); }
};

// ## Shops / Vendors
// #############################################################


// #############################################################
// ## Cash Man (คนถือเงินสด)

// ## GET /api/a/admacc/cashmen/:companyID/:factoryID
exports.getCashMen = async (req, res, next) => {
  const { companyID, factoryID } = req.params;
  try {
    const cashMen = await AccCashMan.find({ companyID, factoryID, status: 'a' })
      .sort({ shortCode: 1 }).lean();
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), cashMen });
  } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/cashmen/create
exports.createCashMan = async (req, res, next) => {
  const { companyID, factoryID, name, shortCode, tel, note, photo } = req.body;
  if (!companyID || !factoryID || !name || !shortCode)
    return res.status(400).json({ success: false, message: 'companyID, factoryID, name, shortCode required' });
  try {
    const count = await AccCashMan.countDocuments({ companyID, factoryID });
    const cashManID = `cm_${factoryID}_${String(count + 1).padStart(3, '0')}`;

    const cashMan = new AccCashMan({
      cashManID, companyID, factoryID,
      name:      name.trim(),
      shortCode: shortCode.trim().toUpperCase(),
      tel:       tel   || '',
      note:      note  || '',
      photo:     photo || '',
      active:    true,
      status:    'a',
      createdAt: new Date(),
      createBy:  { userID: req.userData?.tokenSet?.userID || '' },
    });
    await cashMan.save();

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.status(201).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), cashMan });
  } catch (err) { return next(err); }
};

// ## PUT /api/a/admacc/cashmen/update
exports.updateCashMan = async (req, res, next) => {
  const { cashManID, name, shortCode, tel, note, photo } = req.body;
  if (!cashManID) return res.status(400).json({ success: false, message: 'cashManID required' });
  try {
    // ## เช็คสิทธิ์โรงงานของ cash man ก่อนแก้ (route แบบ B)
    const rec = await factoryAuth.assertRecord(req, res, AccCashMan, { cashManID });
    if (!rec) return;
    const setData = {
      name:      name      ? name.trim()                     : '',
      shortCode: shortCode ? shortCode.trim().toUpperCase()  : '',
      tel:       tel       || '',
      note:      note      || '',
    };
    if (photo !== undefined) setData.photo = photo;
    await AccCashMan.findOneAndUpdate({ cashManID }, { $set: setData });
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
  } catch (err) { return next(err); }
};

// ## PUT /api/a/admacc/cashmen/toggle
exports.toggleCashManActive = async (req, res, next) => {
  const { cashManID } = req.body;
  if (!cashManID) return res.status(400).json({ success: false, message: 'cashManID required' });
  try {
    const cm = await AccCashMan.findOne({ cashManID }).lean();
    if (!cm) return res.status(404).json({ success: false, message: 'ไม่พบ cash man' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, cm.factoryID)))
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    await AccCashMan.findOneAndUpdate({ cashManID }, { $set: { active: !cm.active } });
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), active: !cm.active });
  } catch (err) { return next(err); }
};

// ## DELETE /api/a/admacc/cashmen/:cashManID
exports.deleteCashMan = async (req, res, next) => {
  const { cashManID } = req.params;
  try {
    // ## เช็คสิทธิ์โรงงานของ cash man ก่อนลบ (route แบบ B)
    const rec = await factoryAuth.assertRecord(req, res, AccCashMan, { cashManID });
    if (!rec) return;
    await AccCashMan.findOneAndUpdate({ cashManID }, { $set: { status: 'i', active: false } });
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
  } catch (err) { return next(err); }
};

// ## Cash Man
// #############################################################


// #############################################################
// ## Cash Book (รายการเงินสด)

// ## GET /api/a/admacc/cashbook/summary/:companyID/:factoryID
// ## ยอดเงินปัจจุบันของ cash man แต่ละคน (aggregate)
exports.getCashBookSummary = async (req, res, next) => {
  const { companyID, factoryID } = req.params;
  try {
    const cashMen = await AccCashMan.find({ companyID, factoryID, status: 'a' })
      .sort({ shortCode: 1 }).lean();

    const balances = await AccCashBook.aggregate([
      { $match: { companyID, factoryID, status: 'a' } },
      { $group: {
        _id: '$cashManID',
        balance: { $sum: {
          $cond: [
            { $in: ['$type', ['top_up', 'transfer_in']] },
            '$amount',
            { $multiply: ['$amount', -1] }
          ]
        }}
      }}
    ]);

    const balMap = {};
    balances.forEach(b => { balMap[b._id] = b.balance; });

    const result = cashMen.map(cm => ({
      ...cm,
      balance: balMap[cm.cashManID] ?? 0,
    }));

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), cashMen: result });
  } catch (err) { return next(err); }
};

// ## GET /api/a/admacc/cashbook/entries/:companyID/:factoryID/:cashManID
// ## รายการทั้งหมดของ cash man คนนั้น พร้อม enrich ชื่อ transfer counterpart
exports.getCashBookEntries = async (req, res, next) => {
  const { companyID, factoryID, cashManID } = req.params;
  try {
    const entries = await AccCashBook.find({ companyID, factoryID, cashManID, status: 'a' })
      .sort({ date: -1, createdAt: -1 }).lean();

    // Collect counterpart cashManIDs เพื่อ enrich ชื่อ
    const counterIDs = new Set();
    entries.forEach(e => {
      if (e.toCashManID)   counterIDs.add(e.toCashManID);
      if (e.fromCashManID) counterIDs.add(e.fromCashManID);
    });

    let nameMap = {};
    if (counterIDs.size > 0) {
      const counterMen = await AccCashMan.find({ cashManID: { $in: [...counterIDs] } })
        .select('cashManID name shortCode').lean();
      counterMen.forEach(cm => { nameMap[cm.cashManID] = `${cm.name} (${cm.shortCode})`; });
    }

    const enriched = entries.map(e => ({
      ...e,
      date:            ymdStr(e.date),   // ## UTC-midnight → "YYYY-MM-DD" ให้ frontend group เดือนตรง (กัน bug ข้ามเดือน)
      toCashManName:   e.toCashManID   ? (nameMap[e.toCashManID]   || e.toCashManID)   : '',
      fromCashManName: e.fromCashManID ? (nameMap[e.fromCashManID] || e.fromCashManID) : '',
    }));

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), entries: enriched });
  } catch (err) { return next(err); }
};

// ## Helper: "YYYY-MM" → next month "YYYY-MM"
function nextYM(month) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m); // JS Date(y, m) = 1st of month index m (0-based) = next month
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ## POST /api/a/admacc/cashbook/entry
// ## สร้าง entry (transfer สร้าง 2 entries อัตโนมัติ)
exports.createCashBookEntry = async (req, res, next) => {
  const { companyID, factoryID, cashManID, date, type, amount, description, toCashManID } = req.body;
  if (!companyID || !factoryID || !cashManID || !date || !type || !amount)
    return res.status(400).json({ success: false, message: 'companyID, factoryID, cashManID, date, type, amount required' });
  if (type === 'transfer_out' && !toCashManID)
    return res.status(400).json({ success: false, message: 'toCashManID required for transfer' });

  try {
    // Lock check: ถ้าเดือนที่ entry ตกอยู่ปิดงวดแล้ว → ห้ามเพิ่ม
    const entryMonth = date.slice(0, 7);           // "2026-05"
    const locked = await AccCashBookMonth.findOne({ factoryID, month: entryMonth, status: 'closed' }).lean();
    if (locked)
      return res.status(400).json({ success: false, message: `เดือน ${entryMonth} ปิดงวดแล้ว ไม่สามารถเพิ่มรายการได้` });

    const count = await AccCashBook.countDocuments({ companyID, factoryID });

    if (type === 'transfer_out') {
      // สร้าง 2 entries พร้อมกัน
      const entryID_A = `cb_${factoryID}_${String(count + 1).padStart(5, '0')}`;
      const entryID_B = `cb_${factoryID}_${String(count + 2).padStart(5, '0')}`;

      await AccCashBook.insertMany([
        {
          entryID: entryID_A, companyID, factoryID,
          cashManID,
          date: ymdToUTC(date), type: 'transfer_out',
          amount: Number(amount),
          description: description || '',
          toCashManID,
          pairEntryID: entryID_B,
          status: 'a', createdAt: new Date(),
          createBy: { userID: req.userData?.tokenSet?.userID || '' },
        },
        {
          entryID: entryID_B, companyID, factoryID,
          cashManID: toCashManID,
          date: ymdToUTC(date), type: 'transfer_in',
          amount: Number(amount),
          description: description || '',
          fromCashManID: cashManID,
          pairEntryID: entryID_A,
          status: 'a', createdAt: new Date(),
          createBy: { userID: req.userData?.tokenSet?.userID || '' },
        },
      ]);
    } else {
      const entryID = `cb_${factoryID}_${String(count + 1).padStart(5, '0')}`;
      await AccCashBook.create({
        entryID, companyID, factoryID, cashManID,
        date: ymdToUTC(date), type,
        amount: Number(amount),
        description: description || '',
        status: 'a', createdAt: new Date(),
        createBy: { userID: req.userData?.tokenSet?.userID || '' },
      });
    }

    // ## audit log — เพิ่ม transaction Cash Book
    const _cm = await AccCashMan.findOne({ cashManID }).lean();
    const _cmName = _cm?.name || _cm?.cashManName || cashManID;
    const _amt = Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 });
    await writeLog({
      module: 'cashbook', targetType: 'entry',
      companyID, factoryID, billNo: '', action: 'create',
      summary: `เพิ่ม ${cbTypeLabel(type)} ${_amt} · ${_cmName}${description ? ' · ' + description : ''}`,
      meta: { type, amount: Number(amount), cashManID, cashManName: _cmName, date, toCashManID: toCashManID || '', description: description || '' },
      userID: req.userData?.tokenSet?.userID || '', userName: req.userData?.userName || '',
    });

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.status(201).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
  } catch (err) { return next(err); }
};

// ## DELETE /api/a/admacc/cashbook/entry/:entryID
// ## soft delete — ถ้าเป็น transfer ลบ pair entry ด้วย
exports.deleteCashBookEntry = async (req, res, next) => {
  const { entryID } = req.params;
  try {
    const entry = await AccCashBook.findOne({ entryID }).lean();
    if (!entry) return res.status(404).json({ success: false, message: 'ไม่พบ entry' });
    // ## เช็คสิทธิ์โรงงานของ entry นี้ก่อนลบ (route แบบ B)
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, entry.factoryID)))
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });

    // Lock check: เดือนของ entry ปิดงวดแล้วหรือเปล่า (date เก็บ UTC-midnight → slice ได้เดือนปฏิทินตรง)
    const entryMonth = ymdStr(entry.date).slice(0, 7);
    const locked = await AccCashBookMonth.findOne({ factoryID: entry.factoryID, month: entryMonth, status: 'closed' }).lean();
    if (locked)
      return res.status(400).json({ success: false, message: `เดือน ${entryMonth} ปิดงวดแล้ว ไม่สามารถลบรายการได้` });

    await AccCashBook.findOneAndUpdate({ entryID }, { $set: { status: 'i' } });

    // ถ้าเป็น transfer → ลบ pair ด้วย
    if (entry.pairEntryID) {
      await AccCashBook.findOneAndUpdate({ entryID: entry.pairEntryID }, { $set: { status: 'i' } });
    }

    // ## audit log — ลบ transaction Cash Book (ลบเองในหน้า Cash Book)
    const _cm = await AccCashMan.findOne({ cashManID: entry.cashManID }).lean();
    const _cmName = _cm?.name || _cm?.cashManName || entry.cashManID;
    const _amt = Number(entry.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 });
    await writeLog({
      module: 'cashbook', targetType: 'entry',
      companyID: entry.companyID, factoryID: entry.factoryID, billNo: '', action: 'delete',
      summary: `ลบ ${cbTypeLabel(entry.type)} ${_amt} · ${_cmName}${entry.description ? ' · ' + entry.description : ''}`,
      meta: { entryID: entry.entryID, type: entry.type, amount: entry.amount, cashManID: entry.cashManID, cashManName: _cmName, source: 'cashbook-page', pairEntryID: entry.pairEntryID || '' },
      userID: req.userData?.tokenSet?.userID || '', userName: req.userData?.userName || '',
    });

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
  } catch (err) { return next(err); }
};

// ── getCashBookPeriod ──────────────────────────────
// Requirement: ดึง opening balance ของ cash man ทุกคน + สถานะงวด (open/closed) ของเดือนนั้น
//   ★ Provisional opening: ถ้าเดือนก่อน "ยังไม่ปิดงวด" → ยังไม่มี AccCashBookPeriod (committed)
//     → คำนวณ opening สดจาก Σ ทุก entry ก่อนวันที่ 1 ของเดือนนี้ ส่งกลับทันที (เลขตรงกับหลังปิดเป๊ะ)
//     ผู้ใช้จึงเห็นยอดจริงตลอด ไม่มีวันเห็นยอด "หาย" — การปิดงวดเหลือหน้าที่แค่ "ล็อก"
//   flag provisional = true บอก frontend ว่าเป็นยอดชั่วคราว (ยังไม่ commit)
exports.getCashBookPeriod = async (req, res, next) => {
  const { companyID, factoryID, month } = req.params;
  try {
    const [committed, monthRecord] = await Promise.all([
      AccCashBookPeriod.find({ companyID, factoryID, month }).lean(),
      AccCashBookMonth.findOne({ companyID, factoryID, month }).lean(),
    ]);
    const monthStatus = monthRecord?.status ?? 'open';

    let periods = committed;
    let provisional = false;

    // ยังไม่ยกยอด (ไม่มี committed) → คำนวณ opening สด = Σ entry ที่ date < วันที่ 1 ของเดือนนี้
    if (committed.length === 0) {
      const monthStart = ymdToUTC(month + '-01');
      const agg = await AccCashBook.aggregate([
        { $match: { companyID, factoryID, status: 'a', date: { $lt: monthStart } } },
        { $group: {
          _id: '$cashManID',
          balance: { $sum: { $cond: [
            { $in: ['$type', ['top_up', 'transfer_in']] },
            '$amount',
            { $multiply: ['$amount', -1] }
          ] } }
        }}
      ]);
      periods = agg.map(a => ({ cashManID: a._id, openingBalance: a.balance }));
      provisional = periods.length > 0;   // มียอดยกมาจริงแต่ยังไม่ commit
    }

    // ## สถานะงวด Daily เดือนนี้ ('none'|'open'|'closed') → frontend ใช้ตัดสินปุ่มปิดงวด Cash Book
    const dailyStatus = await dailyPeriodStatus(companyID, factoryID, month);

    // ## ยอดปิด ณ สิ้นเดือนนี้ (= ยอดที่จะยกไปเป็น opening เดือนถัดไปตอนปิดงวด)
    //   = Σ entry ที่ date < วันที่ 1 ของเดือนถัดไป → ไม่รวมรายการเดือนอื่น (ใช้โชว์ preview ใน dialog ปิดงวด)
    const nextMonthStart = ymdToUTC(nextYM(month) + '-01');
    const closingAgg = await AccCashBook.aggregate([
      { $match: { companyID, factoryID, status: 'a', date: { $lt: nextMonthStart } } },
      { $group: {
        _id: '$cashManID',
        balance: { $sum: { $cond: [
          { $in: ['$type', ['top_up', 'transfer_in']] },
          '$amount',
          { $multiply: ['$amount', -1] }
        ] } }
      }}
    ]);
    const closingBalances = closingAgg.map(a => ({ cashManID: a._id, balance: a.balance }));

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), periods, monthStatus, provisional, dailyStatus, closingBalances });
  } catch (err) { return next(err); }
};

// ## POST /api/a/admacc/cashbook/carryforward
// ## ยกยอดเข้าเดือน targetMonth
// ## คำนวณ balance ปัจจุบัน (all-time) ของแต่ละ cash man → upsert เป็น openingBalance ของ targetMonth
exports.carryForward = async (req, res, next) => {
  const { companyID, factoryID, targetMonth } = req.body;
  if (!companyID || !factoryID || !targetMonth)
    return res.status(400).json({ success: false, message: 'companyID, factoryID, targetMonth required' });

  try {
    // Guard: source month (เดือนก่อน targetMonth) ต้องผ่านไปแล้ว
    const [ty, tm] = targetMonth.split('-').map(Number);
    const sourceMonth = tm === 1
      ? `${ty - 1}-12`
      : `${ty}-${String(tm - 1).padStart(2, '0')}`;
    const nowYM = moment().format('YYYY-MM');   // ## เดือนปัจจุบันเขต Bangkok (กัน edge case สิ้นเดือน)
    if (sourceMonth >= nowYM)
      return res.status(400).json({ success: false, message: `ยังไม่สามารถยกยอดได้ เดือน ${sourceMonth} ยังไม่สิ้นสุด` });

    // ดึง cash men ทั้งหมดของ factory นี้
    const cashMen = await AccCashMan.find({ companyID, factoryID, status: 'a' }).lean();
    if (cashMen.length === 0)
      return res.status(400).json({ success: false, message: 'ไม่พบ cash man ใน factory นี้' });

    // aggregate balance เฉพาะ entry ก่อนวันแรกของ targetMonth
    // (ไม่รวม entry ในเดือนที่กำลังยกยอดเข้า)
    const targetDate = ymdToUTC(targetMonth + '-01'); // วันที่ 1 ของ targetMonth (UTC-midnight) — เส้นแบ่งงวด
    const balances = await AccCashBook.aggregate([
      { $match: { companyID, factoryID, status: 'a', date: { $lt: targetDate } } },
      { $group: {
        _id: '$cashManID',
        balance: { $sum: {
          $cond: [
            { $in: ['$type', ['top_up', 'transfer_in']] },
            '$amount',
            { $multiply: ['$amount', -1] }
          ]
        }}
      }}
    ]);

    const balMap = {};
    balances.forEach(b => { balMap[b._id] = b.balance; });

    // upsert AccCashBookPeriod สำหรับ targetMonth
    const userID = req.userData?.tokenSet?.userID || '';
    const ops = cashMen.map(cm => {
      const count = cashMen.indexOf(cm) + 1;
      const periodID = `period_${factoryID}_${targetMonth}_${cm.cashManID}`;
      return {
        updateOne: {
          filter: { cashManID: cm.cashManID, month: targetMonth },
          update: {
            $set: {
              periodID,
              companyID, factoryID,
              month:          targetMonth,
              cashManID:      cm.cashManID,
              openingBalance: balMap[cm.cashManID] ?? 0,
              createdAt:      new Date(),
              createBy:       { userID },
            }
          },
          upsert: true,
        }
      };
    });

    await AccCashBookPeriod.bulkWrite(ops);

    // ส่ง preview กลับ
    const preview = cashMen.map(cm => ({
      cashManID:  cm.cashManID,
      name:       cm.name,
      shortCode:  cm.shortCode,
      balance:    balMap[cm.cashManID] ?? 0,
    }));

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), targetMonth, preview });

  } catch (err) { return next(err); }
};

// ## PUT /api/a/admacc/cashbook/close-month
// ## ปิดงวด cash book ประจำเดือน + carry forward อัตโนมัติ
// ## เงื่อนไข: เดือนต้องผ่านไปแล้ว + ยังไม่ปิด
exports.closeCashBookMonth = async (req, res, next) => {
  const { companyID, factoryID, month } = req.body;
  if (!companyID || !factoryID || !month)
    return res.status(400).json({ success: false, message: 'companyID, factoryID, month required' });

  try {
    // Guard: month ต้องผ่านไปแล้ว
    const nowYM = moment().format('YYYY-MM');   // ## เดือนปัจจุบันเขต Bangkok (กัน edge case สิ้นเดือน)
    if (month >= nowYM)
      return res.status(400).json({ success: false, message: 'ยังไม่สามารถปิดงวดได้ เดือนนี้ยังไม่สิ้นสุด' });

    // Guard: ปิดไปแล้วหรือเปล่า
    const existing = await AccCashBookMonth.findOne({ companyID, factoryID, month }).lean();
    if (existing?.status === 'closed')
      return res.status(400).json({ success: false, message: 'งวดนี้ปิดแล้ว' });

    // Guard: บล็อกเฉพาะเมื่อ Daily "มีงวดและยังเปิดอยู่" — ถ้าไม่มีงวด Daily เลย (ไม่มีกิจกรรม) ปิด Cash Book ได้
    if ((await dailyPeriodStatus(companyID, factoryID, month)) === 'open')
      return res.status(400).json({ success: false, message: 'ต้องปิดงวดบัญชีรายวัน (Daily Accounting) ของเดือนนี้ก่อน จึงจะปิดงวด Cash Book ได้' });

    const userID = req.userData?.tokenSet?.userID || '';

    // 1. ปิดงวด
    const monthID = `cbm_${factoryID}_${month}`;
    await AccCashBookMonth.findOneAndUpdate(
      { companyID, factoryID, month },
      { $set: { monthID, companyID, factoryID, month, status: 'closed', closedAt: new Date(), closedBy: { userID } } },
      { upsert: true, new: true }
    );

    // 2. Carry forward → สร้าง opening balance สำหรับเดือนถัดไป
    const targetMonth = nextYM(month);
    const cashMen = await AccCashMan.find({ companyID, factoryID, status: 'a' }).lean();

    if (cashMen.length > 0) {
      const targetDate = ymdToUTC(targetMonth + '-01');   // วันที่ 1 เดือนถัดไป (UTC-midnight) — เส้นแบ่งงวด ห้ามคาบเกี่ยว
      const balances = await AccCashBook.aggregate([
        { $match: { companyID, factoryID, status: 'a', date: { $lt: targetDate } } },
        { $group: {
          _id: '$cashManID',
          balance: { $sum: {
            $cond: [
              { $in: ['$type', ['top_up', 'transfer_in']] },
              '$amount',
              { $multiply: ['$amount', -1] }
            ]
          }}
        }}
      ]);

      const balMap = {};
      balances.forEach(b => { balMap[b._id] = b.balance; });

      const ops = cashMen.map(cm => {
        const periodID = `period_${factoryID}_${targetMonth}_${cm.cashManID}`;
        return {
          updateOne: {
            filter: { cashManID: cm.cashManID, month: targetMonth },
            update: {
              $set: {
                periodID, companyID, factoryID,
                month:          targetMonth,
                cashManID:      cm.cashManID,
                openingBalance: balMap[cm.cashManID] ?? 0,
                createdAt:      new Date(),
                createBy:       { userID },
              }
            },
            upsert: true,
          }
        };
      });

      await AccCashBookPeriod.bulkWrite(ops);
    }

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
  } catch (err) { return next(err); }
};

// ## Cash Book
// #############################################################


// #############################################################
// ## Worker Pay Periods (งวดจ่ายเงิน — ระดับโรงงาน)

// ## GET /api/a/admacc/wp-periods/:companyID/:factoryID
exports.getWpPeriods = async (req, res, next) => {
    const { companyID, factoryID } = req.params;
    try {
        const periods = await WorkerPayPeriod.find({ companyID, factoryID })
            .sort({ month: -1, createdAt: -1 }).lean();
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), periods });
    } catch (err) { next(err); }
};

// ## POST /api/a/admacc/wp-periods
exports.createWpPeriod = async (req, res, next) => {
    const { companyID, factoryID, name, startDate, endDate } = req.body;
    if (!companyID || !factoryID || !name || !startDate || !endDate)
        return res.status(400).json({ success: false, message: 'companyID, factoryID, name, startDate, endDate required' });
    try {
        // บล็อกถ้ายังมีงวด status:'a' (draft) อยู่ — ต้องส่งตรวจก่อน
        const openDraft = await WorkerPayPeriod.findOne({ companyID, factoryID, status: 'a' });
        if (openDraft)
            return res.status(400).json({
                success: false,
                message: `ยังมีงวด "${openDraft.name}" ที่ยังไม่ได้ส่งตรวจ กรุณาส่งตรวจก่อนสร้างงวดใหม่`
            });

        // ## startDate/endDate = "YYYY-MM-DD" → month จาก string ตรงๆ, เก็บวันเป็น UTC-midnight (กัน tz เพี้ยน)
        const month  = String(startDate).slice(0, 7);
        const periodID = `wpp_${factoryID}_${Date.now()}`;
        const period = new WorkerPayPeriod({
            periodID, companyID, factoryID,
            name: name.trim(),
            startDate: ymdToUTC(startDate),
            endDate:   ymdToUTC(endDate),
            month,
            status: 'a',
            createdAt: new Date(),
            createBy:  { userID: req.userData?.tokenSet?.userID || '' },
        });
        await period.save();
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.status(201).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), period });
    } catch (err) { next(err); }
};

// ## PUT /api/a/admacc/wp-periods/:periodID  (แก้ไขงวด — เฉพาะ status:'a')
exports.updateWpPeriod = async (req, res, next) => {
    const { periodID } = req.params;
    const { name, startDate, endDate } = req.body;
    if (!periodID || !name || !startDate || !endDate)
        return res.status(400).json({ success: false, message: 'periodID, name, startDate, endDate required' });
    try {
        // ## เช็คสิทธิ์โรงงานของงวดนี้ก่อนแก้ (route แบบ B)
        const rec = await factoryAuth.assertRecord(req, res, WorkerPayPeriod, { periodID });
        if (!rec) return;
        // ## month จาก string ตรงๆ, เก็บวันเป็น UTC-midnight (กัน tz เพี้ยน)
        const month = String(startDate).slice(0, 7);
        await WorkerPayPeriod.findOneAndUpdate(
            { periodID, status: 'a' },
            { $set: { name: name.trim(), startDate: ymdToUTC(startDate), endDate: ymdToUTC(endDate), month } }
        );
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};

// ## PUT /api/a/admacc/wp-periods/review  (ส่งตรวจ: a → r)
// ## หลังจากนี้ worker ตรวจค่าแรงตัวเองได้, accounting สร้างงวดใหม่ได้
exports.sendForReview = async (req, res, next) => {
    const { periodID } = req.body;
    if (!periodID) return res.status(400).json({ success: false, message: 'periodID required' });
    try {
        const rec = await factoryAuth.assertRecord(req, res, WorkerPayPeriod, { periodID });
        if (!rec) return;   // ## เช็คสิทธิ์โรงงานของงวดนี้ก่อนส่งตรวจ
        await WorkerPayPeriod.findOneAndUpdate(
            { periodID, status: 'a' },
            { $set: { status: 'r' } }
        );
        // ## audit log — ส่งตรวจงวดค่าแรง (a → r)
        await writeWorkerLog({
            targetType: 'period',
            companyID: rec.companyID, factoryID: rec.factoryID, billID: periodID, billNo: '', action: 'update',
            summary: `ส่งตรวจงวดค่าแรง · ${rec.name || periodID}`,
            meta: { periodID, name: rec.name, statusFrom: 'a', statusTo: 'r' },
        }, req);
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};

// ## PUT /api/a/admacc/wp-periods/close  (ปิดงวด: r → c)
// ## ใช้ได้เฉพาะงวดที่ส่งตรวจแล้ว (status:'r')
exports.closeWpPeriod = async (req, res, next) => {
    const { periodID } = req.body;
    if (!periodID) return res.status(400).json({ success: false, message: 'periodID required' });
    try {
        const rec = await factoryAuth.assertRecord(req, res, WorkerPayPeriod, { periodID });
        if (!rec) return;   // ## เช็คสิทธิ์โรงงานของงวดนี้ก่อนปิดงวด
        await WorkerPayPeriod.findOneAndUpdate(
            { periodID, status: 'r' },
            { $set: { status: 'c' } }
        );
        // ## audit log — ปิดงวดค่าแรง (r → c) ล็อกค่าแรงทั้งงวด
        await writeWorkerLog({
            targetType: 'period',
            companyID: rec.companyID, factoryID: rec.factoryID, billID: periodID, billNo: '', action: 'update',
            summary: `ปิดงวดค่าแรง · ${rec.name || periodID}`,
            meta: { periodID, name: rec.name, statusFrom: 'r', statusTo: 'c' },
        }, req);
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};

// ## DELETE /api/a/admacc/wp-periods/:periodID
exports.deleteWpPeriod = async (req, res, next) => {
    const { periodID } = req.params;
    try {
        const rec = await factoryAuth.assertRecord(req, res, WorkerPayPeriod, { periodID });
        if (!rec) return;   // ## เช็คสิทธิ์โรงงานของงวดนี้ก่อนลบ (ลบ items ด้วย)
        const _itemCount = await WorkerPayItem.countDocuments({ periodID });
        await WorkerPayItem.deleteMany({ periodID });
        await WorkerPayPeriod.deleteOne({ periodID });
        // ## audit log — ลบงวดค่าแรงทั้งงวด (+ items ในงวด)
        await writeWorkerLog({
            targetType: 'period',
            companyID: rec.companyID, factoryID: rec.factoryID, billID: periodID, billNo: '', action: 'delete',
            summary: `ลบงวดค่าแรงทั้งงวด · ${rec.name || periodID} · ${_itemCount} รายการ`,
            meta: { periodID, name: rec.name, itemDeleted: _itemCount },
        }, req);
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/wp-periods/lump-sum/:companyID/:factoryID
// Returns: target period (status='r' first, else latest 'c') + totalNet
exports.getWpLumpSum = async (req, res, next) => {
    const { companyID, factoryID } = req.params;
    try {
        // หางวด reviewing ก่อน ถ้าไม่มีเอา closed ล่าสุด
        let period = await WorkerPayPeriod.findOne({ companyID, factoryID, status: 'r' }).lean();
        if (!period) {
            period = await WorkerPayPeriod.findOne({ companyID, factoryID, status: 'c' })
                .sort({ endDate: -1 }).lean();
        }
        if (!period)
            return res.status(404).json({ success: false, message: 'ไม่พบงวดค่าแรง' });

        // Aggregate items: net = sum(income) - sum(deduction)
        const agg = await WorkerPayItem.aggregate([
            { $match: { periodID: period.periodID } },
            { $group: {
                _id:       null,
                income:    { $sum: { $cond: [{ $eq: ['$type', 'income']    }, '$amount', 0] } },
                deduction: { $sum: { $cond: [{ $eq: ['$type', 'deduction'] }, '$amount', 0] } },
            }},
        ]);
        const income    = agg[0]?.income    ?? 0;
        const deduction = agg[0]?.deduction ?? 0;
        const totalNet  = income - deduction;

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), period, totalNet });
    } catch (err) { next(err); }
};

// ## Worker Pay Periods
// #############################################################


// #############################################################
// ## Worker Pay Summary (สรุปค่าแรงทุก worker ต่องวด)

// ## GET /api/a/admacc/wp-summary/:companyID/:factoryID/:periodID
exports.getWpSummaryByPeriod = async (req, res, next) => {
    const { companyID, factoryID, periodID } = req.params;
    try {
        const period = await WorkerPayPeriod.findOne({ periodID, companyID, factoryID }).lean();
        if (!period) return res.status(404).json({ success: false, message: 'ไม่พบงวด' });

        // aggregate pay items → เฉพาะ worker ที่มีรายการ
        const agg = await WorkerPayItem.aggregate([
            { $match: { periodID } },
            { $group: {
                _id:       '$workerID',
                income:    { $sum: { $cond: [{ $eq: ['$type', 'income']    }, '$amount', 0] } },
                deduction: { $sum: { $cond: [{ $eq: ['$type', 'deduction'] }, '$amount', 0] } },
            }},
        ]);
        if (agg.length === 0) {
            const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
            return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), period, summary: [] });
        }

        // lookup ชื่อเฉพาะ workerID ที่มีรายการ
        const workerIDs = agg.map(a => a._id);
        const workers   = await User.find({ userID: { $in: workerIDs } })
            .select('userID uInfo.userName uInfo.pic uInfo.department uInfo.wageType').lean();
        const workerMap = {};
        workers.forEach(w => { workerMap[w.userID] = w; });

        const summary = agg.map(a => ({
            workerID:   a._id,
            workerName: workerMap[a._id]?.uInfo?.userName ?? a._id,
            pic:        workerMap[a._id]?.uInfo?.pic      ?? '',
            department: workerMap[a._id]?.uInfo?.department ?? '',   // ใช้กรอง/พิมพ์แยกแผนก
            wageType:   workerMap[a._id]?.uInfo?.wageType   ?? '',   // ประเภทค่าจ้าง
            income:     a.income,
            deduction:  a.deduction,
            net:        a.income - a.deduction,
        })).sort((a, b) => b.net - a.net);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), period, summary });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/wp-report/period/:companyID/:factoryID/:periodID
// requirement: รายงานสรุปค่าแรง "ต่องวด" — หัวรวม (จำนวนคน/รายรับ/รายหัก/สุทธิ/เฉลี่ย)
//   + แยกตามบัญชี (chartAccCode): ยอดรวม, จำนวนรายการ, จำนวนคนที่มีบัญชีนี้
exports.getWpPeriodReport = async (req, res, next) => {
    const { companyID, factoryID, periodID } = req.params;
    try {
        const period = await WorkerPayPeriod.findOne({ periodID, companyID, factoryID }).lean();
        if (!period) return res.status(404).json({ success: false, message: 'ไม่พบงวด' });

        // ── แยกตามบัญชี — group by chartAccCode (เก็บ type/name/จำนวนคนไม่ซ้ำ) ──
        const byAccountAgg = await WorkerPayItem.aggregate([
            { $match: { periodID } },
            { $group: {
                _id:     { code: '$chartAccCode', name: '$chartAccName', type: '$type' },
                amount:  { $sum: '$amount' },
                count:   { $sum: 1 },
                workers: { $addToSet: '$workerID' },
            }},
            { $sort: { '_id.code': 1 } },
        ]);
        const byAccount = byAccountAgg.map(a => ({
            type:         a._id.type,
            chartAccCode: a._id.code,
            chartAccName: a._id.name,
            amount:       a.amount,
            count:        a.count,
            workerCount:  a.workers.length,
        }));

        // ── หัวรวม — group per worker ก่อน แล้วรวมยอด (ได้ headcount จริง) ──
        const workerAgg = await WorkerPayItem.aggregate([
            { $match: { periodID } },
            { $group: {
                _id:       '$workerID',
                income:    { $sum: { $cond: [{ $eq: ['$type', 'income']    }, '$amount', 0] } },
                deduction: { $sum: { $cond: [{ $eq: ['$type', 'deduction'] }, '$amount', 0] } },
            }},
        ]);
        const headcount   = workerAgg.length;
        const totalIncome = workerAgg.reduce((s, w) => s + w.income, 0);
        const totalDeduct = workerAgg.reduce((s, w) => s + w.deduction, 0);
        const totalNet    = totalIncome - totalDeduct;
        const avgNet      = headcount ? totalNet / headcount : 0;

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({
            success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
            period,
            summary:   { headcount, totalIncome, totalDeduct, totalNet, avgNet },
            byAccount,
        });
    } catch (err) { next(err); }
};

// ## Worker Pay Summary
// #############################################################


// #############################################################
// ## Worker Pay Items (รายการต่อ worker ต่องวด)

// ## GET /api/a/admacc/wp-items/:companyID/:factoryID/:periodID/:workerID
exports.getWpItems = async (req, res, next) => {
    const { companyID, factoryID, periodID, workerID } = req.params;
    try {
        const items = await WorkerPayItem.find({ companyID, factoryID, periodID, workerID })
            .sort({ itemDate: -1 }).lean();
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), items });
    } catch (err) { next(err); }
};

// ## POST /api/a/admacc/wp-items
exports.createWpItem = async (req, res, next) => {
    const { companyID, factoryID, periodID, workerID, type, chartAccID, chartAccCode, chartAccName, amount, note, itemDate } = req.body;
    if (!companyID || !factoryID || !periodID || !workerID || !type || !chartAccID)
        return res.status(400).json({ success: false, message: 'required fields missing' });
    try {
        const itemID = `wpi_${workerID}_${Date.now()}`;
        const item = new WorkerPayItem({
            itemID, companyID, factoryID, periodID, workerID,
            type, chartAccID, chartAccCode, chartAccName,
            amount:   amount ?? 0,
            note:     note ?? '',
            itemDate: itemDate ? ymdToUTC(itemDate) : ymdToUTC(new Date().toISOString()),
            images:   req.body.images ?? [],
            createdAt: new Date(),
            createBy:  { userID: req.userData?.tokenSet?.userID || '' },
        });
        await item.save();

        // ## audit log — เพิ่มรายการค่าแรง (รายรับ/รายหัก manual)
        const _wn = await wkName(workerID);
        await writeWorkerLog({
            companyID, factoryID, billID: periodID, billNo: '', action: 'create',
            summary: `เพิ่ม${type === 'income' ? 'รายรับ' : 'รายหัก'} ${fmtB(amount)} · ${chartAccName || chartAccCode}${_wn ? ' · ' + _wn : ''}`,
            meta: { itemID, workerID, workerName: _wn, periodID, type, chartAccCode, chartAccName, amount: Number(amount || 0) },
        }, req);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.status(201).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), item });
    } catch (err) { next(err); }
};

// ## PUT /api/a/admacc/wp-items
exports.updateWpItem = async (req, res, next) => {
    const { itemID, amount, note, itemDate, images } = req.body;
    if (!itemID) return res.status(400).json({ success: false, message: 'itemID required' });
    try {
        // ## เช็คสิทธิ์โรงงานของรายการค่าแรงนี้ก่อนแก้ (route แบบ B)
        const rec = await factoryAuth.assertRecord(req, res, WorkerPayItem, { itemID });
        if (!rec) return;
        const update = { amount: amount ?? 0, note: note ?? '' };
        if (itemDate !== undefined) update.itemDate = ymdToUTC(itemDate);
        if (images !== undefined) update.images = images;
        await WorkerPayItem.findOneAndUpdate({ itemID }, { $set: update });

        // ## audit log — แก้ไขรายการค่าแรง (เก็บยอดเก่า→ใหม่)
        const _wn = await wkName(rec.workerID);
        const _changes = [];
        if (Number(rec.amount || 0) !== Number(amount || 0))
            _changes.push({ field: 'amount', from: fmtB(rec.amount), to: fmtB(amount) });
        if ((rec.note || '') !== (note ?? rec.note ?? ''))
            _changes.push({ field: 'note', from: rec.note || '', to: note ?? '' });
        await writeWorkerLog({
            companyID: rec.companyID, factoryID: rec.factoryID, billID: rec.periodID, billNo: '', action: 'update',
            summary: `แก้ไข${rec.type === 'income' ? 'รายรับ' : 'รายหัก'} ${fmtB(rec.amount)} → ${fmtB(amount)} · ${rec.chartAccName || rec.chartAccCode}${_wn ? ' · ' + _wn : ''}`,
            changes: _changes,
            meta: { itemID, workerID: rec.workerID, workerName: _wn, periodID: rec.periodID, type: rec.type, amountOld: rec.amount, amountNew: Number(amount || 0) },
        }, req);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};

// ## DELETE /api/a/admacc/wp-items/:itemID
exports.deleteWpItem = async (req, res, next) => {
    const { itemID } = req.params;
    try {
        // ## เช็คสิทธิ์โรงงานของรายการค่าแรงนี้ก่อนลบ (route แบบ B)
        const rec = await factoryAuth.assertRecord(req, res, WorkerPayItem, { itemID });
        if (!rec) return;
        await WorkerPayItem.deleteOne({ itemID });

        // ## audit log — ลบรายการค่าแรง
        const _wn = await wkName(rec.workerID);
        await writeWorkerLog({
            companyID: rec.companyID, factoryID: rec.factoryID, billID: rec.periodID, billNo: '', action: 'delete',
            summary: `ลบ${rec.type === 'income' ? 'รายรับ' : 'รายหัก'} ${fmtB(rec.amount)} · ${rec.chartAccName || rec.chartAccCode}${_wn ? ' · ' + _wn : ''}`,
            meta: { itemID, workerID: rec.workerID, workerName: _wn, periodID: rec.periodID, type: rec.type, amount: rec.amount, chartAccCode: rec.chartAccCode },
        }, req);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};

// ## Worker Pay Items
// #############################################################


// #############################################################
// ## Worker Pay Production (ข้อมูลการผลิตรายวัน → คำนวณค่าแรงเหมา)

// ## GET /api/a/admacc/wp-production-preview/:companyID/:factoryID/:periodID/:workerID/:date?countryID=THA1
// ## ดึงข้อมูลการสแกนของ worker ในวันนั้น + lookup cost จาก facSubNodeCost
// ## ยังไม่ save — ให้ user ตรวจ/แก้ก่อนกดบันทึก
exports.getWpProductionPreview = async (req, res, next) => {
    const { companyID, factoryID, periodID, workerID, date } = req.params;
    const countryID = req.query.countryID || '';
    if (!companyID || !factoryID || !workerID || !date)
        return res.status(400).json({ success: false, message: 'required params missing' });
    try {
        const dateStart = moment(date).startOf('day').toDate();
        const dateEnd   = moment(date).endOf('day').toDate();

        // ถ้ามี saved record อยู่แล้ว ให้โหลดกลับมาเพื่อแก้ไขได้
        const saved = await WorkerPayProduction.findOne({
            periodID, workerID,
            date: { $gte: dateStart, $lte: dateEnd }
        }).lean();
        if (saved && saved.items && saved.items.length) {
            const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
            return res.json({
                success: true, token,
                items: saved.items.map(i => ({
                    orderID:   i.orderID,
                    nodeID:    i.nodeID,
                    subNodeID: i.subNodeID,
                    targetPlaceID: i.targetPlaceID || '',
                    color:     i.color || '',
                    countQty:  Number(i.countQty) || 0,
                    cost:      parseFloat(i.cost ?? 0),
                    subtotal:  parseFloat(i.subtotal ?? 0),
                }))
            });
        }

        // หา qrCode ของ worker
        const user = await User.findOne({ userID: workerID }, { qrCode: 1 }).lean();
        const qrCode = user?.qrCode;
        if (!qrCode)
            return res.status(404).json({ success: false, message: 'ไม่พบ qrCode ของ worker นี้' });

        // Aggregate scan data (Pattern D จาก optimization context)
        const scanRows = await OrderProduction.aggregate([
            { $match: {
                companyID,
                "subNodeFlow": { $elemMatch: {
                    factoryID,
                    qrCode,
                    datetime: { $gte: dateStart, $lte: dateEnd }
                }}
            }},
            // ## targetPlace + barcode ไว้แยก cost ต่อ targetPlaceID + สี (color = substr barcode 23,10 = colorID)
            { $project: { _id: 0, companyID: 1, orderID: 1, subNodeFlow: 1, targetPlace: 1, productBarcodeNoReal: 1 }},
            { $unwind: "$subNodeFlow" },
            { $match: {
                "subNodeFlow.factoryID": factoryID,
                "subNodeFlow.qrCode":    qrCode,
                "subNodeFlow.datetime":  { $gte: dateStart, $lte: dateEnd }
            }},
            { $group: {
                _id: {
                    companyID: "$companyID",
                    orderID:   "$orderID",
                    nodeID:    "$subNodeFlow.nodeID",
                    subNodeID: "$subNodeFlow.subNodeID",
                    targetPlaceID: "$targetPlace.targetPlaceID",
                    color: { $trim: { input: { $substrCP: ["$productBarcodeNoReal", 23, 10] }, chars: "-" } },
                },
                countQty: { $sum: 1 }
            }}
        ]);

        if (!scanRows.length) {
            const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
            return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), items: [] });
        }

        // Lookup cost จาก OrderSubNodeFlowSetCost
        const orderIDs = [...new Set(scanRows.map(r => r._id.orderID))];
        const costDocs = await OrderSubNodeFlowSetCost.find(
            { companyID, factoryID, orderID: { $in: orderIDs } },
            { facSubNodeCost: 1, orderID: 1, _id: 0 }
        ).lean();

        const costMap = {};
        costDocs.forEach(doc => { costMap[doc.orderID] = doc.facSubNodeCost || []; });

        // Merge scan + cost — match (nodeID, subNodeID, targetPlaceID) · สี: override สีตรงก่อน ไม่มี→ default (color='')
        const items = scanRows.map(r => {
            const costs = costMap[r._id.orderID] || [];
            const tpid  = r._id.targetPlaceID || '';
            const color = r._id.color || '';
            const candidates = costs.filter(c =>
                c.nodeID === r._id.nodeID &&
                c.subNodeID === r._id.subNodeID &&
                (c.targetPlaceID || '') === tpid
            );
            const entry = (color ? candidates.find(c => (c.color || '') === color) : null)   // override สีนั้น
                       ?? candidates.find(c => (c.color || '') === '')                        // ราคา default ทุกสี
                       ?? null;
            const cost = parseFloat(entry?.cost ?? 0);
            return {
                orderID:   r._id.orderID,
                nodeID:    r._id.nodeID,
                subNodeID: r._id.subNodeID,
                targetPlaceID: tpid,
                color,
                countQty:  r.countQty,
                cost,
                subtotal:  r.countQty * cost,
            };
        });

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), items });
    } catch (err) { next(err); }
};


// ## POST /api/a/admacc/wp-production
// ## บันทึกข้อมูลการผลิตรายวัน + auto upsert WorkerPayItem 510005
exports.saveWpProduction = async (req, res, next) => {
    const { companyID, factoryID, periodID, workerID, date, countryID, items, autoIncomeCode } = req.body;
    const WP_AUTO_INCOME_CODE = autoIncomeCode || '590101'; // fallback กรณี Angular เก่าไม่ส่งมา
    if (!companyID || !factoryID || !periodID || !workerID || !date || !Array.isArray(items))
        return res.status(400).json({ success: false, message: 'required fields missing' });
    try {
        // ## date = "YYYY-MM-DD" (วันปฏิทิน) → เก็บ UTC-midnight ให้ตรง convention (ยังอยู่ในช่วง Bangkok-day ที่ query preview ใช้)
        const dateKey = ymdToUTC(date);

        // คำนวณ subtotal และ total
        const recalcItems = items.map(i => ({
            orderID:   i.orderID,
            nodeID:    i.nodeID,
            subNodeID: i.subNodeID,
            targetPlaceID: i.targetPlaceID || '',
            color:     i.color || '',
            countQty:  Number(i.countQty) || 0,
            cost:      Number(i.cost)     || 0,
            subtotal:  (Number(i.countQty) || 0) * (Number(i.cost) || 0),
        }));
        const totalAmount = recalcItems.reduce((s, i) => s + i.subtotal, 0);

        // Upsert production record (1 วัน = 1 record)
        const wpProdID = `wpp_${workerID}_${dateKey.getTime()}`;
        await WorkerPayProduction.findOneAndUpdate(
            { periodID, workerID, date: dateKey },
            { $set: { wpProdID, companyID, factoryID, countryID, items: recalcItems, totalAmount, savedAt: new Date() }},
            { upsert: true }
        );

        // รวม totalAmount ทุกวันในงวดนี้
        const allProd = await WorkerPayProduction.find(
            { periodID, workerID },
            { totalAmount: 1 }
        ).lean();
        const grandTotal = allProd.reduce((s, p) => s + (p.totalAmount || 0), 0);

        // Lookup AccChart สำหรับ 510005
        const acc = await AccChart.findOne({ companyID, factoryID, code: WP_AUTO_INCOME_CODE }).lean();

        // Upsert WorkerPayItem 510005 (ค่าแรงเหมา-auto) — แยกจาก 510006 ที่ user ลง manual
        const autoFilter = { periodID, workerID, chartAccCode: WP_AUTO_INCOME_CODE };
        const existItem  = await WorkerPayItem.findOne(autoFilter);
        if (existItem) {
            await WorkerPayItem.findOneAndUpdate(
                autoFilter,
                { $set: { amount: grandTotal, note: 'คำนวณจากข้อมูลการผลิต (auto)' } }
            );
        } else {
            const newItem = new WorkerPayItem({
                itemID:       `wpi_${workerID}_prod_${Date.now()}`,
                companyID,    factoryID,    periodID,    workerID,
                type:         'income',
                chartAccID:   acc?._id?.toString() ?? '',
                chartAccCode: acc?.code             ?? WP_AUTO_INCOME_CODE,
                chartAccName: acc?.nameI18n?.lText  ?? 'ค่าแรงเหมา-auto',
                amount:       grandTotal,
                note:         'คำนวณจากข้อมูลการผลิต (auto)',
                itemDate:     new Date(),
                images:       [],
                createdAt:    new Date(),
                createBy:     { userID: req.userData?.tokenSet?.userID || '' },
            });
            await newItem.save();
        }

        // ## audit log — บันทึกผลผลิต auto (ดึงจากสแกน คำนวณค่าแรงเหมา)
        const _wn = await wkName(workerID);
        await writeWorkerLog({
            targetType: 'production',
            companyID, factoryID, billID: periodID, billNo: '', action: 'update',
            summary: `ผลผลิต(auto) วัน ${date} · ยอดวัน ${fmtB(totalAmount)} · รวมงวด ${fmtB(grandTotal)}${_wn ? ' · ' + _wn : ''}`,
            meta: { workerID, workerName: _wn, periodID, date, dayTotal: totalAmount, grandTotal, itemCount: recalcItems.length },
        }, req);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), grandTotal });
    } catch (err) { next(err); }
};


// ## POST /api/a/admacc/wp-daily-from-scan — คำนวณค่าแรงรายวันจาก finger scan → upsert รายรับ (รายวัน + OT)
// requirement: worker รายวันเท่านั้น · ดึง วัน/OT จาก FingerScanSummary ของงวด → เงิน = อัตรา×วัน (+OT) ลงบัญชีตาม config
//   OT = ceil0.5(อัตรา ÷ WAGE_OT_DIVISOR) × OT ชม. × WAGE_OT_RATE · re-run แทนที่ (upsert by periodID+workerID+code, 0=ลบ)
// body { companyID, factoryID, periodID, workerID }
exports.saveWpDailyFromScan = async (req, res, next) => {
    const { companyID, factoryID, periodID, workerID } = req.body;
    if (!companyID || !factoryID || !periodID || !workerID)
        return res.status(400).json({ success: false, message: 'required fields missing' });
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const worker = await User.findOne({ userID: workerID }, { uInfo: 1, baseSalary: 1 }).lean();
        if (!worker) return res.status(400).json({ success: false, message: 'ไม่พบ worker' });
        // หมายเหตุ: ยังไม่บังคับ wageType (master ยังไม่ตั้ง) — ใช้กับ worker ทุกคนที่มีข้อมูลสแกน + อัตรา
        const rate = Number(worker.baseSalary) || 0;
        if (rate <= 0) return res.status(400).json({ success: false, message: 'worker ยังไม่ได้ตั้งอัตรา (baseSalary) — ไปตั้งที่หน้าลงทะเบียนพนักงาน > ค่าจ้าง' });

        // สรุปสแกนของงวดนี้ — หยิบของ worker คนนี้ก่อน (workerID ตรง) ค่อย fallback ด้วย scanID
        //   กันกรณีมี summary ซ้ำ scanID เดียวกัน (เช่น seed workerID + scan-XXXX ที่ยังไม่ผูก)
        const scanID = worker.uInfo?.scanID || '';
        let fs = await FingerScanSummary.findOne({ companyID, factoryID, periodID, workerID }).lean();
        if (!fs && scanID) fs = await FingerScanSummary.findOne({ companyID, factoryID, periodID, scanID }).lean();
        if (!fs) return res.status(400).json({ success: false, message: 'ยังไม่มีสรุปสแกนของ worker คนนี้ในงวดนี้ — ให้ HR บันทึกในหน้า Finger Scan ก่อน' });

        const days    = Number(fs.daysWorked) || 0;
        const otHours = Number(fs.otHours) || 0;

        // config รหัสบัญชี + OT
        const gc = await Gsconfig.find({ companyID, factoryID, key: { $in: ['WP_DAILY_INCOME_CODE', 'WP_DAILY_OT_CODE', 'WAGE_OT_DIVISOR', 'WAGE_OT_RATE'] } }, { key: 1, value: 1, _id: 0 }).lean();
        const cfg = {}; for (const c of gc) cfg[c.key] = c.value;
        const dailyCode = (cfg.WP_DAILY_INCOME_CODE || '59010004').trim();
        const otCode    = (cfg.WP_DAILY_OT_CODE     || '59010003').trim();
        const divisor   = Number(cfg.WAGE_OT_DIVISOR) || 11;
        const otRate    = Number(cfg.WAGE_OT_RATE)    || 1;

        const basePay = Math.round(rate * days * 100) / 100;
        const hourly  = rate / divisor;                        // เรตต่อชั่วโมง (ดิบ ไว้แสดง)
        const otPay   = Math.round(hourly * otHours * otRate);  // ปัดเป็นจำนวนเต็ม (ตรงกับไฟล์ payroll บัญชี — verify 3 คน tab ปั่นด้าย)

        const userID = req.userData?.tokenSet?.userID || '';
        // upsert 1 บรรทัดรายรับต่อ 1 รหัสบัญชี (0 = ลบทิ้ง เพื่อให้ re-run สะอาด)
        const upsertIncome = async (code, amount, note) => {
            const filter = { periodID, workerID, chartAccCode: code };
            if (amount > 0) {
                const acc = await AccChart.findOne({ companyID, factoryID, code }).lean();
                const exist = await WorkerPayItem.findOne(filter);
                if (exist) {
                    await WorkerPayItem.findOneAndUpdate(filter, { $set: {
                        amount, note,
                        chartAccID:   acc?._id?.toString() ?? exist.chartAccID,
                        chartAccName: acc?.nameI18n?.lText ?? exist.chartAccName,
                    } });
                } else {
                    await new WorkerPayItem({
                        itemID: `wpi_${workerID}_dscan_${code}_${Date.now()}`,
                        companyID, factoryID, periodID, workerID, type: 'income',
                        chartAccID:   acc?._id?.toString() ?? '',
                        chartAccCode: acc?.code ?? code,
                        chartAccName: acc?.nameI18n?.lText ?? code,
                        amount, note, itemDate: new Date(), images: [],
                        createdAt: new Date(), createBy: { userID },
                    }).save();
                }
            } else {
                await WorkerPayItem.deleteOne(filter);
            }
        };
        await upsertIncome(dailyCode, basePay, `ค่าแรงรายวัน ${days} วัน × ${rate} (auto จากสแกน)`);
        await upsertIncome(otCode,   otPay,   `OT ${otHours} ชม. × ${hourly.toFixed(2)}/ชม. × ${otRate} (ปัดเป็นจำนวนเต็ม, auto จากสแกน)`);

        const _wn = await wkName(workerID);
        await writeWorkerLog({
            companyID, factoryID, billID: periodID, billNo: '', action: 'update',
            summary: `ค่าแรงรายวัน(auto) ${days} วัน=${fmtB(basePay)}${otHours ? ` + OT ${otHours}ชม=${fmtB(otPay)}` : ''}${_wn ? ' · ' + _wn : ''}`,
            meta: { workerID, workerName: _wn, periodID, days, otHours, rate, basePay, otPay, dailyCode, otCode, divisor, otRate },
        }, req);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), days, otHours, rate, basePay, otPay, hourly });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/app-version/:companyID/:factoryID — เวอร์ชันแอปปัจจุบัน (PUBLIC · สำหรับบังคับ reload)
// requirement: client poll มาถามทุก ~2 นาที · ถ้าค่าเปลี่ยนจากตอนเปิดแอป = มี deploy ใหม่ → client reload
// ไม่ผ่าน checkAuthA (ไม่ต่ออายุ session / ไม่แตะ Monitor) · อ่านจาก gsconfig APP_VERSION ของ factory นั้น
exports.getAppVersion = async (req, res) => {
    try {
        const { companyID, factoryID } = req.params;
        const doc = await Gsconfig.findOne({ configID: `${factoryID}-system-APP_VERSION` }, { value: 1, _id: 0 }).lean();
        return res.json({ success: true, version: doc?.value || '' });
    } catch (err) {
        return res.json({ success: true, version: '' });   // error → ไม่บังคับ reload
    }
};

// ## GET /api/a/admacc/admin/active-sessions — Monitor: user ที่ใช้งานอยู่ (near-live)
// requirement: แสดง user ที่มี activity ในช่วงล่าสุด + device + IP + เวลา · online = active < 90 วิ
exports.getActiveSessions = async (req, res, next) => {
    try {
        const WINDOW_MIN = 24 * 60;   // แสดง session ที่เข้าใช้ใน 24 ชม.ล่าสุด (รู้ว่าใครเข้ามาบ้าง)
        const ONLINE_SEC = 180;       // active < 3 นาที = ออนไลน์ (เขียว) · เกินนั้น = ไม่ใช้งาน (แต่ยังโชว์)
        const since = new Date(Date.now() - WINDOW_MIN * 60 * 1000);
        const acts = await UserActivity.find({ lastSeen: { $gte: since } }).sort({ lastSeen: -1 }).lean();

        const ids = [...new Set(acts.map(a => a.userID).filter(Boolean))];
        // login user = Useracc (m-acc-user) → ชื่อ + รูปโปรไฟล์ + activeSessionKey (ตั๋วจริงตอนนี้)
        const users = await Useracc.find({ userID: { $in: ids } }, { userID: 1, 'uInfo.userName': 1, 'uInfo.pic': 1, 'uInfo.activeSessionKey': 1 }).lean();
        const infoMap = new Map(users.map(u => [u.userID, { name: u.uInfo?.userName || '', pic: u.uInfo?.pic || '', activeKey: u.uInfo?.activeSessionKey || '' }]));

        const now = Date.now();
        const sessions = acts.map(a => {
            const info = infoMap.get(a.userID) || {};
            // ## isCurrent = session นี้เป็นตั๋วจริงของ user (single-session) · อันอื่นคือ session เก่าที่ถูกแทนที่
            const isCurrent = !!info.activeKey && a.sessionKey === info.activeKey;
            const active = (now - new Date(a.lastSeen).getTime()) < ONLINE_SEC * 1000;
            return {
                userID: a.userID, userName: info.name || a.userID, pic: info.pic || '',
                ip: a.ip, appName: a.appName, appVer: a.appVer,
                browser: a.browser, browserVer: a.browserVer, deviceType: a.deviceType, os: a.os, osVer: a.osVer,
                loginAt: a.loginAt, lastSeen: a.lastSeen,
                secondsAgo: Math.round((now - new Date(a.lastSeen).getTime()) / 1000),
                isCurrent,                          // ตั๋วจริง
                replaced: active && !isCurrent,     // ยัง active แต่ถูกแทนที่แล้ว (login ที่อื่นทับ)
                online: active && isCurrent,        // ออนไลน์จริง = active + เป็นตั๋วปัจจุบัน
            };
        });
        const onlineCount = sessions.filter(s => s.online).length;

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), sessions, onlineCount, serverTime: new Date() });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/admin/user-action-log/:userID — Monitor drill-down: การกระทำของ user (7 วันล่าสุด)
// requirement: แสดง add/update/delete + export/action สำคัญ (จาก AccLog) ของ user คนนี้ · ล่าสุดก่อน
exports.getUserActionLog = async (req, res, next) => {
    const { userID } = req.params;
    try {
        const since = new Date(Date.now() - 7 * 86400000);   // 7 วันล่าสุด
        const logs = await AccLog.find(
            { 'by.userID': userID, at: { $gte: since } },
            { action: 1, module: 1, summary: 1, targetType: 1, billNo: 1, at: 1, _id: 0 }
        ).sort({ at: -1 }).limit(400).lean();
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), logs });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/worker-scanids/:companyID/:factoryID
// requirement: คืน scanID ทั้งหมดที่ผูกกับ worker (uInfo.scanID) — ใช้กรองเครื่องสแกนที่แชร์กับ office (เอาเฉพาะ worker)
exports.getWorkerScanIDs = async (req, res, next) => {
    const { companyID, factoryID } = req.params;
    try {
        const ws = await User.find(
            { type: 's', 'uFactory.factoryID': factoryID, 'uInfo.scanID': { $nin: ['', null] } },
            { 'uInfo.scanID': 1, _id: 0 }
        ).lean();
        const scanIDs = ws.map(w => w.uInfo?.scanID).filter(Boolean);
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), scanIDs });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/wp-payroll-excel/:companyID/:factoryID/:periodID
// requirement: รายงานค่าแรง Excel แยก sheet ตามแผนก (เหมือนไฟล์ payroll ตัวอย่าง)
//   คอลัมน์: NO·รหัส·ชื่อ·ตำแหน่ง·อัตรา·วัน·OT·ก่อนหัก·อื่นๆ·หัก·ยอดรับ·เซ็นชื่อ·[แยกแบงค์ 1000..1]·TOTAL·ผลต่าง
//   คำนวณ auto จาก finger scan (วัน/OT) × อัตรา · หัก = รวมรายหักใน WorkerPayItem · แยกแบงค์อัตโนมัติ
exports.getPayrollExcel = async (req, res, next) => {
    let ExcelJS;
    try { ExcelJS = require('exceljs'); }
    catch { return res.status(500).json({ success: false, message: 'ยังไม่ได้ติดตั้ง exceljs — รัน "npm install exceljs" ในโฟลเดอร์ nodejs-GarmentFactory แล้ว restart PM2' }); }
    const { companyID, factoryID, periodID } = req.params;
    if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID)))
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
    try {
        const period = await WorkerPayPeriod.findOne({ periodID }).lean();
        const periodName = period?.name || periodID;

        const gc = await Gsconfig.find({ companyID, factoryID, key: { $in: ['WAGE_OT_DIVISOR', 'WAGE_OT_RATE'] } }, { key: 1, value: 1, _id: 0 }).lean();
        const cfg = {}; for (const c of gc) cfg[c.key] = c.value;
        const divisor = Number(cfg.WAGE_OT_DIVISOR) || 11, otRate = Number(cfg.WAGE_OT_RATE) || 1;

        const workers = await User.find({ type: 's', status: 'a', 'uFactory.factoryID': factoryID }, { userID: 1, qrCode: 1, uInfo: 1, baseSalary: 1 }).lean();
        const fsList  = await FingerScanSummary.find({ companyID, factoryID, periodID }, { workerID: 1, scanID: 1, daysWorked: 1, otHours: 1 }).lean();
        const fsByW = new Map(), fsByScan = new Map();
        for (const f of fsList) { fsByW.set(f.workerID, f); if (f.scanID) fsByScan.set(f.scanID, f); }
        // รวมรายรับ + รายหัก จาก WorkerPayItem (ครอบทั้ง เหมา / รายวัน / OT ที่ประมวลผลแล้ว)
        const items = await WorkerPayItem.find({ companyID, factoryID, periodID }, { workerID: 1, amount: 1, type: 1 }).lean();
        const incomeByW = new Map(), deductByW = new Map();
        for (const it of items) {
            const m = it.type === 'deduction' ? deductByW : incomeByW;
            m.set(it.workerID, (m.get(it.workerID) || 0) + (it.amount || 0));
        }

        // จัดกลุ่มตามแผนก
        const byDept = new Map();
        for (const w of workers) {
            const dept = w.uInfo?.department || 'ไม่ระบุแผนก';
            const fs   = fsByW.get(w.userID) || (w.uInfo?.scanID ? fsByScan.get(w.uInfo.scanID) : null);
            const rate = Number(w.baseSalary) || 0;
            const days = fs ? (Number(fs.daysWorked) || 0) : 0;
            const ot   = fs ? (Number(fs.otHours) || 0) : 0;
            // ก่อนหัก = รวมรายรับใน WorkerPayItem (เหมามีอยู่แล้ว) · ถ้ายังไม่มี item แต่มีสแกน (รายวันยังไม่กดดึง) = preview อัตรา×วัน
            let gross = incomeByW.get(w.userID) || 0;
            if (gross <= 0 && fs && rate > 0) gross = Math.round(rate * days) + Math.round((rate / divisor) * ot * otRate);
            const deduct = deductByW.get(w.userID) || 0;
            const net = gross - deduct;
            if (gross <= 0 && deduct <= 0) continue;   // ข้ามคนที่ไม่มีค่าแรงในงวดนี้ (กันแถว 0 รก)
            if (!byDept.has(dept)) byDept.set(dept, []);
            byDept.get(dept).push({ code: w.qrCode || w.userID, name: w.uInfo?.userName || '', position: w.uInfo?.position || '', rate, days, ot, gross, other: 0, deduct, net });
        }

        const DENOMS = [1000, 500, 100, 50, 20, 10, 5, 1];
        const denom = (net) => { let r = Math.round(net); return DENOMS.map(d => { const n = Math.floor(r / d); r -= n * d; return n; }); };

        const wb = new ExcelJS.Workbook();
        const border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        const money = '#,##0';
        // เรียงแผนกตามชื่อ
        for (const dept of [...byDept.keys()].sort()) {
            const rows = byDept.get(dept).sort((a, b) => a.name.localeCompare(b.name, 'th'));
            const ws = wb.addWorksheet(dept.replace(/[\\/*?:\[\]]/g, ' ').slice(0, 31));
            // header คอลัมน์: A..M แล้วตามด้วยแบงค์ N..U + TOTAL(V) + ผลต่าง(W)
            const cols = ['NO', 'รหัส', 'ชื่อ - สกุล', 'ตำแหน่ง', 'รายได้', 'รายหัก', 'ยอดรับ', 'เซ็นชื่อ', ...DENOMS.map(String), 'TOTAL', 'ผลต่าง'];
            // Title
            ws.mergeCells(1, 1, 1, cols.length);
            const t = ws.getCell(1, 1); t.value = `แผนก ${dept}`; t.font = { bold: true, size: 14 }; t.alignment = { horizontal: 'center' };
            ws.mergeCells(2, 1, 2, cols.length);
            const t2 = ws.getCell(2, 1); t2.value = `ค่าแรงงวด ${periodName}`; t2.alignment = { horizontal: 'center' };
            // header row (row 4)
            const hr = 4;
            cols.forEach((c, i) => { const cell = ws.getCell(hr, i + 1); cell.value = c; cell.font = { bold: true }; cell.alignment = { horizontal: 'center', wrapText: true }; cell.border = border; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEDFE' } }; });
            // data
            let r = hr + 1;
            const tot = { rate: 0, days: 0, ot: 0, gross: 0, other: 0, deduct: 0, net: 0, den: DENOMS.map(() => 0) };
            rows.forEach((w, idx) => {
                const dn = denom(w.net);
                const denTotal = dn.reduce((s, n, i) => s + n * DENOMS[i], 0);
                const vals = [idx + 1, w.code, w.name, w.position, w.gross, w.deduct || '', w.net, '', ...dn.map(n => n || ''), denTotal, w.net - denTotal];
                vals.forEach((v, i) => { const cell = ws.getCell(r, i + 1); cell.value = v; cell.border = border; if (i >= 4) cell.numFmt = money; cell.alignment = { horizontal: i <= 3 ? 'left' : 'right' }; });
                tot.rate += 0; tot.days += w.days; tot.ot += w.ot; tot.gross += w.gross; tot.other += w.other || 0; tot.deduct += w.deduct || 0; tot.net += w.net;
                dn.forEach((n, i) => tot.den[i] += n);
                r++;
            });
            // TOTAL row
            const totCells = ['', '', 'TOTAL', '', tot.gross, tot.deduct || '', tot.net, '', ...tot.den.map(n => n || ''), tot.net, 0];
            totCells.forEach((v, i) => { const cell = ws.getCell(r, i + 1); cell.value = v; cell.font = { bold: true }; cell.border = border; if (i >= 4) cell.numFmt = money; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF6BF' } }; cell.alignment = { horizontal: i <= 3 ? 'center' : 'right' }; });
            // column widths
            const widths = [5, 9, 20, 14, 11, 10, 11, 9, ...DENOMS.map(() => 5), 11, 9];
            widths.forEach((wd, i) => { ws.getColumn(i + 1).width = wd; });
        }
        if (!byDept.size) { const ws = wb.addWorksheet('ไม่มีข้อมูล'); ws.getCell(1, 1).value = 'ไม่พบ worker ในงวดนี้'; }

        const buf = await wb.xlsx.writeBuffer();
        // Monitor: log การ export รายงาน (ใครเอาข้อมูลออก)
        try { await writeLog({ module: 'report', companyID, factoryID, action: 'export', summary: `Export รายงานค่าแรง Excel · งวด ${periodName} · ${byDept.size} แผนก`, userID: req.userData?.tokenSet?.userID || '' }); } catch {}
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="payroll_${factoryID}_${periodID}.xlsx"`);
        return res.send(Buffer.from(buf));
    } catch (err) { return next(err); }
};

// ## GET /api/a/admacc/wp-production-list/:companyID/:factoryID/:periodID/:workerID
// ## ดึงประวัติการบันทึกการผลิต (เพื่อดู drill-down รายวัน)
exports.getWpProductionList = async (req, res, next) => {
    const { companyID, factoryID, periodID, workerID } = req.params;
    try {
        const list = await WorkerPayProduction.find(
            { companyID, factoryID, periodID, workerID }
        ).sort({ date: -1 }).lean();
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), list });
    } catch (err) { next(err); }
};

// ## DELETE /api/a/admacc/wp-production/:companyID/:factoryID/:periodID/:workerID/:wpProdID
// ## ลบ production record 1 วัน + recalculate 510005
exports.deleteWpProduction = async (req, res, next) => {
    const { companyID, factoryID, periodID, workerID, wpProdID } = req.params;
    const WP_AUTO_INCOME_CODE = req.query.autoIncomeCode || '590101'; // ส่งมาเป็น query param
    try {
        // ลบด้วย wpProdID โดยตรง — ไม่ใช้ date range เพื่อหลีกเลี่ยง timezone issues
        await WorkerPayProduction.deleteOne({ wpProdID });

        // recalculate grandTotal จากที่เหลือ
        const allProd = await WorkerPayProduction.find(
            { periodID, workerID },
            { totalAmount: 1 }
        ).lean();
        const grandTotal = allProd.reduce((s, p) => s + (p.totalAmount || 0), 0);

        // อัปเดต / ลบ 510005 auto item
        const autoFilter = { periodID, workerID, chartAccCode: WP_AUTO_INCOME_CODE };
        if (grandTotal > 0) {
            await WorkerPayItem.findOneAndUpdate(
                autoFilter,
                { $set: { amount: grandTotal, note: 'คำนวณจากข้อมูลการผลิต (auto)' } }
            );
        } else {
            // ไม่มีวันไหนเลย → ลบ item 510005 ทิ้ง
            await WorkerPayItem.deleteOne(autoFilter);
        }

        // ## audit log — ลบผลผลิต auto 1 วัน (recalc ค่าแรงเหมาใหม่)
        const _wn = await wkName(workerID);
        await writeWorkerLog({
            targetType: 'production',
            companyID, factoryID, billID: periodID, billNo: '', action: 'delete',
            summary: `ลบผลผลิต(auto) 1 วัน · รวมงวดเหลือ ${fmtB(grandTotal)}${_wn ? ' · ' + _wn : ''}`,
            meta: { wpProdID, workerID, workerName: _wn, periodID, grandTotal },
        }, req);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), grandTotal });
    } catch (err) { next(err); }
};

// ## Worker Pay Production
// #############################################################


// #############################################################
// ## Bank Account Register (ทะเบียนบัญชีธนาคาร)

// ## GET /api/a/admacc/bankaccounts/:companyID/:factoryID
exports.getBankAccounts = async (req, res, next) => {
    const { companyID, factoryID } = req.params;
    try {
        const accounts = await AccBankAccount.find({ companyID, factoryID, status: 'a' })
            .sort({ createdAt: 1 })
            .lean();
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), accounts });
    } catch (err) { next(err); }
};

// ## POST /api/a/admacc/bankaccounts/create
exports.createBankAccount = async (req, res, next) => {
    const { companyID, factoryID, bankName, bankShortName, accountNo, accountName, note } = req.body;
    try {
        const count = await AccBankAccount.countDocuments({ companyID, factoryID });
        const bankAccountID = `ba_${factoryID}_${String(count + 1).padStart(4, '0')}`;
        await AccBankAccount.create({
            bankAccountID, companyID, factoryID,
            bankName:      bankName.trim(),
            bankShortName: bankShortName.trim(),
            accountNo:     accountNo.trim(),
            accountName:   accountName.trim(),
            note:          (note || '').trim(),
            createBy:      { userID: req.userData?.tokenSet?.userID || '' },
        });
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};

// ## PUT /api/a/admacc/bankaccounts/update
exports.updateBankAccount = async (req, res, next) => {
    const { bankAccountID, bankName, bankShortName, accountNo, accountName, note } = req.body;
    if (!bankAccountID) return res.status(400).json({ success: false, message: 'bankAccountID required' });
    try {
        // ## เช็คสิทธิ์โรงงานของบัญชีธนาคารนี้ก่อนแก้ (route แบบ B)
        const rec = await factoryAuth.assertRecord(req, res, AccBankAccount, { bankAccountID });
        if (!rec) return;
        await AccBankAccount.findOneAndUpdate(
            { bankAccountID },
            { $set: {
                bankName:      bankName.trim(),
                bankShortName: bankShortName.trim(),
                accountNo:     accountNo.trim(),
                accountName:   accountName.trim(),
                note:          (note || '').trim(),
            }}
        );
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};

// ## PUT /api/a/admacc/bankaccounts/toggle
exports.toggleBankAccount = async (req, res, next) => {
    const { bankAccountID } = req.body;
    if (!bankAccountID) return res.status(400).json({ success: false, message: 'bankAccountID required' });
    try {
        const acc = await AccBankAccount.findOne({ bankAccountID }).lean();
        if (!acc) return res.status(404).json({ success: false, message: 'ไม่พบบัญชีธนาคาร' });
        // ## เช็คสิทธิ์โรงงานก่อน toggle (route แบบ B)
        if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, acc.factoryID)))
          return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
        await AccBankAccount.findOneAndUpdate({ bankAccountID }, { $set: { active: !acc.active } });
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};

// ## DELETE /api/a/admacc/bankaccounts/:bankAccountID
exports.deleteBankAccount = async (req, res, next) => {
    const { bankAccountID } = req.params;
    try {
        // ## เช็คสิทธิ์โรงงานของบัญชีธนาคารนี้ก่อนลบ (route แบบ B)
        const rec = await factoryAuth.assertRecord(req, res, AccBankAccount, { bankAccountID });
        if (!rec) return;
        await AccBankAccount.findOneAndUpdate({ bankAccountID }, { $set: { status: 'i', active: false } });
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};

// ## Bank Account Register
// #############################################################


// #############################################################
// ## ค่าแรงเหมา ลงเอง (Manual Piece) — กรณี worker สแกนงานไม่ติด
// ##   เก็บแยกใน WpManualPiece + สร้าง WorkerPayItem (รหัสจาก WP_MANUAL_PIECE_CODE) คู่กัน

// ## GET /api/a/admacc/manual-piece/orders/:companyID/:factoryID/:season
// requirement: dropdown "รุ่น" — list Order ตาม season (ไม่อ้าง qrCode รายตัว)
exports.getManualOrders = async (req, res, next) => {
    const { companyID, factoryID, season } = req.params;
    try {
        const Order = mongoose.model('Order');   // Order register แล้วตอน startup (เลี่ยง OverwriteModelError)
        const orders = await Order.find(
            { companyID, factoryID, seasonYear: season },
            { orderID: 1, seasonYear: 1, 'customerOR.customerName': 1, _id: 0 }
        ).lean();
        const list = orders.map(o => ({
            orderID:      o.orderID,
            seasonYear:   o.seasonYear,
            customerName: o.customerOR?.customerName ?? '',
        }));
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), orders: list });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/manual-piece/subnodes/:companyID/:factoryID/:orderID
// requirement: dropdown ขั้นตอน — node/subnode + cost(default เรต) จาก setcost ของ order นั้น
exports.getManualSubnodeCost = async (req, res, next) => {
    const { companyID, factoryID, orderID } = req.params;
    try {
        const doc = await OrderSubNodeFlowSetCost.findOne(
            { companyID, factoryID, orderID },
            { facSubNodeCost: 1, _id: 0 }
        ).lean();
        const rows = (doc?.facSubNodeCost || []).map(c => ({
            nodeID:        c.nodeID,
            subNodeID:     c.subNodeID,
            targetPlaceID: c.targetPlaceID ?? '',
            color:         c.color ?? '',      // ''=ราคา default ทุกสี · colorID=override สี
            countryID:     c.countryID ?? '',  // legacy
            cost:          parseFloat(c.cost ?? 0),
        }));
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), subnodes: rows });
    } catch (err) { next(err); }
};

// ## GET /api/a/admacc/manual-piece/:companyID/:factoryID/:periodID/:workerID
// requirement: list รายการ manual ของ worker ในงวด (โชว์ในเซกชัน manual)
exports.listManualPieces = async (req, res, next) => {
    const { companyID, factoryID, periodID, workerID } = req.params;
    try {
        const list = await WpManualPiece.find({ companyID, factoryID, periodID, workerID, status: 'a' })
            .sort({ itemDate: -1, createdAt: -1 }).lean();
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), list });
    } catch (err) { next(err); }
};

// ## POST /api/a/admacc/manual-piece
// requirement: สร้าง manual piece + WorkerPayItem(590102) คู่กัน
//   body: companyID, factoryID, periodID, workerID, seasonYear, orderID, orderName,
//         nodeID, subNodeID, entryMode('qtyrate'|'amount'), qty, rate, amount, note, itemDate, manualCode
exports.createManualPiece = async (req, res, next) => {
    const {
        companyID, factoryID, periodID, workerID,
        seasonYear, orderID, orderName, nodeID, subNodeID,
        entryMode, qty, rate, amount, note, itemDate, manualCode,
    } = req.body;

    if (!companyID || !factoryID || !periodID || !workerID || !seasonYear || !orderID || !nodeID || !subNodeID)
        return res.status(400).json({ success: false, message: 'required fields missing (season/order/node/subnode)' });
    if (!manualCode)
        return res.status(400).json({ success: false, message: 'ยังไม่ได้ตั้งรหัสบัญชีค่าแรงเหมา-ลงเอง (WP_MANUAL_PIECE_CODE) ใน Global Config' });

    // คำนวณยอดตามโหมด
    const mode = entryMode === 'amount' ? 'amount' : 'qtyrate';
    let finalQty = null, finalRate = null, finalAmount = 0;
    if (mode === 'qtyrate') {
        finalQty   = Number(qty)  || 0;
        finalRate  = Number(rate) || 0;
        finalAmount = finalQty * finalRate;
    } else {
        finalAmount = Number(amount) || 0;
    }
    if (finalAmount <= 0)
        return res.status(400).json({ success: false, message: 'ยอดต้องมากกว่า 0' });

    try {
        // หาบัญชีค่าแรงเหมา-ลงเอง (จาก config) เพื่อสร้าง pay item
        const acc = await AccChart.findOne({ companyID, factoryID, code: manualCode, status: 'a' }).lean();
        if (!acc)
            return res.status(400).json({ success: false, message: `ไม่พบบัญชีรหัส "${manualCode}" ในผังบัญชี (เพิ่มใน ผังบัญชี ก่อน)` });

        const stamp   = Date.now();
        const dateVal = itemDate ? ymdToUTC(itemDate) : ymdToUTC(new Date().toISOString());
        const userID  = req.userData?.tokenSet?.userID || '';

        // 1) WorkerPayItem (590102) — โผล่ในรายรับ + นับใน net
        const payItemID = `wpi_${workerID}_${stamp}`;
        await new WorkerPayItem({
            itemID: payItemID, companyID, factoryID, periodID, workerID,
            type: 'income',
            chartAccID:   String(acc._id),
            chartAccCode: acc.code,
            chartAccName: acc.nameI18n?.lText ?? '',
            amount:   finalAmount,
            note:     note ?? '',
            itemDate: dateVal,
            images:   [],
            createdAt: new Date(),
            createBy:  { userID },
        }).save();

        // 2) WpManualPiece — เก็บ season/order/subnode ไว้ทำรายงานต้นทุน
        const manualID = `mp_${workerID}_${stamp}`;
        const doc = await new WpManualPiece({
            manualID, companyID, factoryID, periodID, workerID,
            seasonYear, orderID, orderName: orderName ?? '',
            nodeID, subNodeID,
            entryMode: mode, qty: finalQty, rate: finalRate, amount: finalAmount,
            payItemID, note: note ?? '', itemDate: dateVal, status: 'a',
            createdAt: new Date(), createBy: { userID },
        }).save();

        // ## audit log — เพิ่มค่าแรงเหมา ลงเอง (manual)
        const _wn = await wkName(workerID);
        await writeWorkerLog({
            targetType: 'manual',
            companyID, factoryID, billID: periodID, billNo: '', action: 'create',
            summary: `เพิ่มค่าแรงเหมา(manual) ${fmtB(finalAmount)}${orderName ? ' · ' + orderName : ''}${_wn ? ' · ' + _wn : ''}`,
            meta: { manualID, payItemID, workerID, workerName: _wn, periodID, seasonYear, orderID, orderName: orderName ?? '', entryMode: mode, qty: finalQty, rate: finalRate, amount: finalAmount },
        }, req);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.status(201).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), manual: doc });
    } catch (err) { next(err); }
};

// ## DELETE /api/a/admacc/manual-piece/:manualID
// requirement: ลบ manual piece + WorkerPayItem ที่ผูกกัน (hard delete — แก้ไขบ่อย)
exports.deleteManualPiece = async (req, res, next) => {
    const { manualID } = req.params;
    try {
        const doc = await WpManualPiece.findOne({ manualID }).lean();
        if (!doc) return res.status(404).json({ success: false, message: 'ไม่พบรายการ' });
        // ## เช็คสิทธิ์โรงงานของรายการนี้ก่อนลบ (route แบบ B)
        if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, doc.factoryID)))
          return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
        if (doc.payItemID) await WorkerPayItem.deleteOne({ itemID: doc.payItemID });
        await WpManualPiece.deleteOne({ manualID });

        // ## audit log — ลบค่าแรงเหมา ลงเอง (manual)
        const _wn = await wkName(doc.workerID);
        await writeWorkerLog({
            targetType: 'manual',
            companyID: doc.companyID, factoryID: doc.factoryID, billID: doc.periodID, billNo: '', action: 'delete',
            summary: `ลบค่าแรงเหมา(manual) ${fmtB(doc.amount)}${doc.orderName ? ' · ' + doc.orderName : ''}${_wn ? ' · ' + _wn : ''}`,
            meta: { manualID, payItemID: doc.payItemID, workerID: doc.workerID, workerName: _wn, periodID: doc.periodID, orderName: doc.orderName, amount: doc.amount },
        }, req);

        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn) });
    } catch (err) { next(err); }
};

// ## ค่าแรงเหมา ลงเอง (Manual Piece)
// #############################################################
