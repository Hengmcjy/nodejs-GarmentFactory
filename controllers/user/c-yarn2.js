const ShareFunc = require("../c-api-app-share-function");
const { v4: uuidv4 } = require("uuid");
const moment   = require("moment-timezone");
const Yarn     = require("../../models/m-yarn");
const YarnData = require("../../models/m-yarnData");
const Customer = require("../../models/m-customer");
const Color    = require("../../models/m-color");
const Order    = require("../../models/m-order");
const Product  = require("../../models/m-product");
const YarnLotUsage = require("../../models/m-yarnLotUsage");
const YarnStockCardPCS = require("../../models/m-yarnStockCardPCS");
const Useracc  = require("../../models/m-acc-user");
const Factory  = require("../../models/m-factory");
const bcrypt   = require("bcryptjs");
const { writeLog } = require("./c-log-util");

// ============================================================================
// c-yarn2.js — NEW clean controller: Yarn module (แอปใหม่)  · mount /api/a/yarn
//   Phase 1: yarn master (สร้างชื่อ/เปลี่ยนชื่อ) + yarn plan (yarnID+orders+colors)
//   ชี้ collection เดิม (yarns, yarndatas, customers, colors, orders, products)
//   ไม่แตะ c-yarn.js เก่า (/api/yarn ยังทำงานปกติ)
//
//   กติกาที่ตกลงกับ user (2026-08-28):
//   - yarnID = ชื่อเต็มแบบเดิม (yarnID=yarnName=yarnFullName ตอนสร้าง)
//   - เปลี่ยนชื่อ = แก้ yarnName+yarnFullName เท่านั้น · yarnID ห้ามแตะ
//     (YarnData/YarnLotUsage/lockjob อ้างอิง yarnID อยู่)
//   - season ใช้ seasonYear เดียวกับ Order (เช่น 2027SS) เขียนลง field
//     yarnSeasonID เดิม → เข้ากับข้อมูลเก่า 172 docs
//   - list plan filter factoryID ที่ server (ของเก่า filter ฝั่งหน้าเว็บ)
// ============================================================================

// Requirement: ต่ออายุ token ทุก response (pattern เดียวกับ c-master)
const tokenRefresh = async (req) => {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return { token, expiresIn: Number(process.env.TOKENExpiresIn) };
};

// Requirement: ระบุคนทำ (actor) จาก token — ใช้ลง audit log
const actor = (req) => ({
    userID:   req.userData?.tokenSet?.userID || '',
    userName: req.userData?.userName || '',
});

// ==================== CUSTOMERS (dropdown เลือกลูกค้า) ======================

// Requirement: รายชื่อลูกค้าทั้ง company สำหรับ dropdown บนหน้า yarn plan
//   (ทำงานทีละ customer — เลือกจาก dropdown ไม่ลิสต์เป็นแท็บ)
exports.getYarnCustomers = async (req, res, next) => {
    try {
        const customers = await Customer.find(
            { companyID: req.params.companyID },
            { customerID: 1, customerName: 1, setName: 1, imageProfile: 1, _id: 0 }
        ).sort({ customerName: 1 }).lean();
        return res.json({ success: true, customers, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// ==================== PLANS + ข้อมูลประกอบ (โหลดครั้งเดียวต่อ customer) =====

// Requirement: ข้อมูลหลักของหน้า yarn plan ต่อ (company, factory, customer, season)
//   - yarns  = ชื่อด้ายของลูกค้าใน season นี้ (Yarn master)
//   - plans  = yarn plan ทั้งหมด (YarnData status open, filter factoryID ที่ server)
//              โปรเจกต์เฉพาะ field หลัก — ไม่ส่ง yarnDataInfo/yarnStatCal (หนัก)
//   - orders = orderID ของลูกค้าใน season (สำหรับเลือก styles ใน dialog) + รูปสินค้า
//   - colors = ชุดสีของลูกค้า (Color master ตาม setName)
exports.getYarnPlans = async (req, res, next) => {
    const companyID  = req.params.companyID;
    const factoryID  = req.params.factoryID;
    const customerID = req.params.customerID;
    const seasonYear = req.params.seasonYear;
    try {
        const customer = await Customer.findOne(
            { companyID, customerID }, { setName: 1, customerName: 1, _id: 0 }
        ).lean();
        if (!customer) return res.status(404).json({ success: false, message: 'customer not found' });

        const yarns = await Yarn.find(
            { companyID, customerID, yarnSeasonID: seasonYear },
            { yarnID: 1, yarnName: 1, yarnFullName: 1, seq: 1, detail: 1, _id: 0 }
        ).sort({ seq: 1, yarnName: 1 }).lean();

        const plans = await YarnData.find(
            { companyID, factoryID, customerID, yarnSeasonID: seasonYear, status: 'open' },
            { uuid: 1, yarnID: 1, orderID: 1, colorS: 1, datetime: 1, editDate: 1, _id: 0 }
        ).sort({ yarnID: 1 }).lean();

        const orders = await Order.find(
            { companyID, seasonYear, 'customerOR.customerID': customerID },
            { orderID: 1, productID: 1, _id: 0 }
        ).sort({ orderID: 1 }).lean();

        // ## รูปสินค้า: lookup imageProfile จาก Product master (pattern เดียวกับ c-order2)
        const pids = [...new Set(orders.map(o => o.productID).filter(Boolean))];
        const prods = await Product.find(
            { companyID, productID: { $in: pids } },
            { productID: 1, imageProfile: 1, _id: 0 }
        ).lean();
        const imgMap = {};
        for (const p of prods) imgMap[p.productID] = p.imageProfile || '';
        for (const o of orders) o.imageProfile = imgMap[o.productID] || '';

        const colors = await Color.find(
            { companyID, setName: customer.setName },
            { seq: 1, setName: 1, color: 1, _id: 0 }
        ).sort({ seq: 1 }).lean();

        return res.json({
            success: true,
            setName: customer.setName || '',
            yarns, plans, orders, colors,
            ...(await tokenRefresh(req)),
        });
    } catch (err) { return next(err); }
};

// ==================== YARN MASTER ===========================================

// Requirement: สร้างชื่อ yarn ใหม่ ภายใต้ (company, customer, season)
//   yarnID = ชื่อเต็ม (trim) ตาม convention เดิม · กันชื่อซ้ำใน scope เดียวกัน
//   seq = max+1 ของ scope · yarnName/yarnFullName = ค่าเดียวกับ yarnID ตอนสร้าง
exports.createYarn = async (req, res, next) => {
    const { companyID, customerID, yarnSeasonID } = req.body;
    const yarnName = String(req.body.yarnName || '').trim();
    if (!companyID || !customerID || !yarnSeasonID || !yarnName)
        return res.status(400).json({ success: false, message: 'companyID + customerID + yarnSeasonID + yarnName required' });
    try {
        const dup = await Yarn.findOne({ companyID, customerID, yarnSeasonID, yarnID: yarnName }).lean();
        if (dup) return res.status(400).json({ success: false, message: `This yarn name already exists in ${yarnSeasonID}` });

        // ## seq ถัดไป = max ที่มีจริง + 1 (ไม่พึ่ง counter — บทเรียน ControlApp)
        const rows = await Yarn.find({ companyID, customerID, yarnSeasonID }, { seq: 1, _id: 0 }).lean();
        let maxSeq = 0;
        for (const r of rows) { const n = Number(r.seq) || 0; if (n > maxSeq) maxSeq = n; }

        const doc = {
            companyID, customerID, yarnSeasonID,
            yarnID: yarnName, yarnName: yarnName, yarnFullName: yarnName,
            yarnUUID: uuidv4(), yarnSupplierID: '', detail: '',
            seq: maxSeq + 1000,   // ## เว้นช่วงแบบข้อมูลเดิม (seq เดิมเป็นหลักพัน) ให้แทรกภายหลังได้
        };
        await Yarn.insertMany([doc]);

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, action: 'create',
            summary: `สร้างชื่อ yarn: ${yarnName} (${customerID}/${yarnSeasonID})`,
            meta: { customerID, yarnSeasonID }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, yarn: doc, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: เปลี่ยนชื่อ yarn — แก้เฉพาะ yarnName + yarnFullName ของ doc
//   (company, customer, season, yarnID) เดียว · yarnID คงเดิมเสมอ ข้อมูลอ้างอิงไม่หลุด
exports.renameYarn = async (req, res, next) => {
    const { companyID, customerID, yarnSeasonID, yarnID } = req.body;
    const yarnName2 = String(req.body.yarnName2 || '').trim();
    if (!companyID || !customerID || !yarnSeasonID || !yarnID || !yarnName2)
        return res.status(400).json({ success: false, message: 'companyID + customerID + yarnSeasonID + yarnID + yarnName2 required' });
    try {
        const result = await Yarn.updateOne(
            { companyID, customerID, yarnSeasonID, yarnID },
            { $set: { yarnName: yarnName2, yarnFullName: yarnName2 } }
        );
        if (result.matchedCount === 0)
            return res.status(404).json({ success: false, message: 'yarn not found' });

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, action: 'update',
            summary: `เปลี่ยนชื่อ yarn (${customerID}/${yarnSeasonID})`,
            changes: [{ field: 'yarnName', from: yarnID, to: yarnName2 }],
            meta: { customerID, yarnSeasonID, yarnID }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// ==================== YARN PLAN =============================================

// Requirement: ตรวจรูปแบบ colorS ก่อนบันทึก plan — ต้องเป็น array ของ
//   {seq, setName, color:{colorID,colorName,colorValue,colorCode}} (shape เดิมของ YarnData)
function cleanColorS(colorS) {
    if (!Array.isArray(colorS)) return null;
    const out = [];
    for (const c of colorS) {
        if (!c || !c.color || !c.color.colorID) return null;
        out.push({
            seq: Number(c.seq) || 0,
            setName: String(c.setName || ''),
            color: {
                colorID:    String(c.color.colorID || ''),
                colorName:  String(c.color.colorName || ''),
                colorValue: String(c.color.colorValue || ''),
                colorCode:  String(c.color.colorCode || ''),
            },
        });
    }
    return out;
}

// Requirement: สร้าง yarn plan ใหม่ (YarnData 1 doc) — yarnID + orderID[] + colorS[]
//   กันสร้างซ้ำ: yarnID เดียวกันมี plan open อยู่แล้วใน (company,factory,customer,season) = 400
exports.createYarnPlan = async (req, res, next) => {
    const { companyID, factoryID, customerID, yarnSeasonID, yarnID } = req.body;
    const orderID = req.body.orderID;
    const colorS  = cleanColorS(req.body.colorS);
    if (!companyID || !factoryID || !customerID || !yarnSeasonID || !yarnID)
        return res.status(400).json({ success: false, message: 'companyID + factoryID + customerID + yarnSeasonID + yarnID required' });
    if (!Array.isArray(orderID) || orderID.length === 0)
        return res.status(400).json({ success: false, message: 'Select at least 1 style' });
    if (!colorS || colorS.length === 0)
        return res.status(400).json({ success: false, message: 'Select at least 1 color' });
    try {
        const yarn = await Yarn.findOne({ companyID, customerID, yarnSeasonID, yarnID }).lean();
        if (!yarn) return res.status(404).json({ success: false, message: 'Yarn not found in master' });

        const dup = await YarnData.findOne(
            { companyID, factoryID, customerID, yarnSeasonID, yarnID, status: 'open' },
            { uuid: 1, _id: 0 }
        ).lean();
        if (dup) return res.status(400).json({ success: false, message: 'This yarn already has a plan - use Edit to change it' });

        const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
        const doc = {
            companyID, factoryID, customerID,
            uuid: uuidv4(), yarnSeasonID, status: 'open',
            datetime: current, editDate: current,
            yarnID,
            orderID: orderID.map(o => String(o)),
            colorS,
            yarnDataInfo: [], yarnStatCal: [],
        };
        await YarnData.insertMany([doc]);

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, factoryID, action: 'create',
            summary: `สร้าง yarn plan: ${yarnID} · ${orderID.length} styles · ${colorS.length} สี`,
            meta: { customerID, yarnSeasonID, uuid: doc.uuid }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, plan: doc, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// ==================== YARN PLAN DETAIL (เฟส 2: หน้า Plan & receive) ==========

// Requirement: แปลง Decimal128 → number (Mongo เก็บ weight เป็น Decimal128
//   .lean() แล้วยังเป็น object — ต้อง parseFloat ก่อนส่ง frontend ไม่งั้นคำนวณไม่ได้)
function num(v) {
    if (v == null) return 0;
    const n = parseFloat(String(v));
    return isNaN(n) ? 0 : n;
}

// Requirement: แปลง weight ทุกชั้นของ plan doc (yarnDataInfo → packageInfo → yarnBoxInfo)
function convertPlanWeights(plan) {
    for (const di of plan.yarnDataInfo || []) {
        di.yarnWeight     = num(di.yarnWeight);
        di.yarnPlanWeight = num(di.yarnPlanWeight);
        for (const pk of di.packageInfo || []) {
            pk.coneWeight = num(pk.coneWeight);
            pk.boxWeight  = num(pk.boxWeight);
            for (const b of pk.yarnBoxInfo || []) {
                b.yarnPlanWeight     = num(b.yarnPlanWeight);
                b.yarnWeight         = num(b.yarnWeight);
                b.yarnWeightNet      = num(b.yarnWeightNet);
                b.useWeight          = num(b.useWeight);
                b.yarnTransferWeight = num(b.yarnTransferWeight);
            }
        }
    }
}

// Requirement: ข้อมูลเต็มของ plan 1 ตัว (ตาราง Plan & receive) — yarnDataInfo ครบ
//   frontend คำนวณ cell/total/สถานะเองตาม logic หน้าเดิม (s-yarn-plan-list-manage)
exports.getYarnPlanDetail = async (req, res, next) => {
    try {
        const plan = await YarnData.findOne(
            { companyID: req.params.companyID, uuid: req.params.uuid }
        ).lean();
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        convertPlanWeights(plan);
        return res.json({ success: true, plan, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: บันทึกแผนรับ (ETD) ต่อ (สี, วัน) — upsert แบบหน้าเดิม:
//   มีรายการ type 'plan' ของสี+วันเดียวกันอยู่แล้ว → แก้น้ำหนักตัวเดิม · ไม่มี → push ใหม่
//   datetime เก็บ 08:00+07:00 คงที่ (convention เดิม — แต่วินาที fix 00 กัน gotcha match)
//   ส่ง yarnDataUUID มาด้วย = แก้รายการนั้นตรงๆ (จากการคลิก cell เดิม)
exports.saveYarnPlanEtd = async (req, res, next) => {
    const { companyID, uuid, yarnColorID } = req.body;
    const ymd = String(req.body.ymd || '').slice(0, 10);
    const yarnWeight = Math.max(0, Number(req.body.yarnWeight) || 0);
    const yarnDataUUID = String(req.body.yarnDataUUID || '');
    if (!companyID || !uuid || !yarnColorID)
        return res.status(400).json({ success: false, message: 'companyID + uuid + yarnColorID required' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd))
        return res.status(400).json({ success: false, message: 'Invalid date (YYYY-MM-DD)' });
    try {
        const plan = await YarnData.findOne({ companyID, uuid, status: 'open' }).lean();
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found (or already closed)' });

        const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
        const datetime = new Date(ymd + 'T08:00:00.000+07:00');

        // ## หา element เดิม: ระบุ yarnDataUUID ตรงๆ หรือเทียบ สี+วัน (Bangkok day) กับ type 'plan'
        let target = null;
        if (yarnDataUUID) {
            target = (plan.yarnDataInfo || []).find(i => i.yarnDataUUID === yarnDataUUID && i.type === 'plan');
            if (!target) return res.status(404).json({ success: false, message: 'Plan entry to edit not found' });
        } else {
            target = (plan.yarnDataInfo || []).find(i =>
                i.type === 'plan' && i.yarnColorID === yarnColorID &&
                moment(i.datetime).tz('Asia/Bangkok').format('YYYY-MM-DD') === ymd);
        }

        if (target) {
            await YarnData.updateOne(
                { companyID, uuid },
                { $set: { 'yarnDataInfo.$[e].yarnWeight': yarnWeight, 'yarnDataInfo.$[e].editDate': current } },
                { arrayFilters: [{ 'e.yarnDataUUID': target.yarnDataUUID }] }
            );
        } else {
            const el = {
                datetime, editDate: current,
                yarnDataUUID: uuidv4(),
                yarnColorID, type: 'plan',
                toFactoryID: plan.factoryID,
                yarnWeight,
            };
            await YarnData.updateOne({ companyID, uuid }, { $push: { yarnDataInfo: el } });
        }

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, factoryID: plan.factoryID, action: target ? 'update' : 'create',
            summary: `แผนรับด้าย ${plan.yarnID} · ${yarnColorID} · ${ymd} = ${yarnWeight} kg`,
            meta: { uuid, ymd, yarnColorID }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: ลบรายการแผนรับ (เฉพาะ type 'plan' — รายการ receive มีลัง ห้ามลบจากตรงนี้)
exports.deleteYarnPlanEtd = async (req, res, next) => {
    const { companyID, uuid, yarnDataUUID } = req.body;
    if (!companyID || !uuid || !yarnDataUUID)
        return res.status(400).json({ success: false, message: 'companyID + uuid + yarnDataUUID required' });
    try {
        const plan = await YarnData.findOne({ companyID, uuid, status: 'open' }).lean();
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found (or already closed)' });
        const el = (plan.yarnDataInfo || []).find(i => i.yarnDataUUID === yarnDataUUID);
        if (!el) return res.status(404).json({ success: false, message: 'Entry not found' });
        if (el.type !== 'plan')
            return res.status(400).json({ success: false, message: 'Only plan (ETD) entries can be deleted - actual receipts are managed at the lot' });

        await YarnData.updateOne({ companyID, uuid }, { $pull: { yarnDataInfo: { yarnDataUUID } } });

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, factoryID: plan.factoryID, action: 'delete',
            summary: `ลบแผนรับด้าย ${plan.yarnID} · ${el.yarnColorID}`,
            meta: { uuid, yarnDataUUID }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: แก้ yarn plan เดิม — เปลี่ยนได้เฉพาะ orderID[] + colorS[] (yarnID ล็อก)
//   match ด้วย uuid (+companyID) แบบเดิม · อัปเดต editDate
exports.updateYarnPlan = async (req, res, next) => {
    const { companyID, uuid } = req.body;
    const orderID = req.body.orderID;
    const colorS  = cleanColorS(req.body.colorS);
    if (!companyID || !uuid)
        return res.status(400).json({ success: false, message: 'companyID + uuid required' });
    if (!Array.isArray(orderID) || orderID.length === 0)
        return res.status(400).json({ success: false, message: 'Select at least 1 style' });
    if (!colorS || colorS.length === 0)
        return res.status(400).json({ success: false, message: 'Select at least 1 color' });
    try {
        const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
        const result = await YarnData.updateOne(
            { companyID, uuid, status: 'open' },
            { $set: { orderID: orderID.map(o => String(o)), colorS, editDate: current } }
        );
        if (result.matchedCount === 0)
            return res.status(404).json({ success: false, message: 'Plan not found (or already closed)' });

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, action: 'update',
            summary: `แก้ yarn plan: ${orderID.length} styles · ${colorS.length} สี`,
            meta: { uuid }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// ==================== PACKING LIST (เฟส 3: วันที่ด้ายเข้า + lot/ลัง + confirm) ==

// Requirement: ปัดทศนิยม 2 ตำแหน่ง (กัน float noise เวลาบวกน้ำหนัก)
const r2 = (v) => Math.round((Number(v) || 0) * 100) / 100;

// Requirement: หา plan (status open) + element yarnDataInfo ตาม yarnDataUUID
//   ใช้ร่วมทุก endpoint ของ packing list — คืน {plan, el} หรือ null
async function findPlanInfo(companyID, uuid, yarnDataUUID) {
    const plan = await YarnData.findOne({ companyID, uuid, status: 'open' }).lean();
    if (!plan) return null;
    const el = (plan.yarnDataInfo || []).find(i => i.yarnDataUUID === yarnDataUUID);
    return { plan, el };
}

// Requirement: เพิ่มวันที่ด้ายเข้า (receive) ของสีนั้น — กันวันซ้ำ (สี+วัน Bangkok เดียวกัน)
//   push element ใหม่ packageInfo ว่าง · datetime เก็บ 08:00+07 ตาม convention เดิม
exports.addPackingDate = async (req, res, next) => {
    const { companyID, uuid, yarnColorID } = req.body;
    const ymd = String(req.body.ymd || '').slice(0, 10);
    if (!companyID || !uuid || !yarnColorID)
        return res.status(400).json({ success: false, message: 'companyID + uuid + yarnColorID required' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd))
        return res.status(400).json({ success: false, message: 'Invalid date (YYYY-MM-DD)' });
    try {
        const plan = await YarnData.findOne({ companyID, uuid, status: 'open' }).lean();
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found (or already closed)' });

        const dup = (plan.yarnDataInfo || []).find(i =>
            i.type === 'receive' && i.yarnColorID === yarnColorID &&
            moment(i.datetime).tz('Asia/Bangkok').format('YYYY-MM-DD') === ymd);
        if (dup) return res.status(400).json({ success: false, message: `Date ${ymd} already exists for this color` });

        const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
        const el = {
            datetime: new Date(ymd + 'T08:00:00.000+07:00'),
            editDate: current,
            yarnDataUUID: uuidv4(),
            yarnColorID, type: 'receive',
            toFactoryID: plan.factoryID,
            packageInfo: [],
        };
        await YarnData.updateOne({ companyID, uuid }, { $push: { yarnDataInfo: el } });

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, factoryID: plan.factoryID, action: 'create',
            summary: `เพิ่มวันด้ายเข้า ${plan.yarnID} · ${yarnColorID} · ${ymd}`,
            meta: { uuid, ymd }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: เปลี่ยนวันที่ของแถวรับ (คลิกช่องวันที่) — เปลี่ยนได้เสมอแบบหน้าเดิม
exports.changePackingDate = async (req, res, next) => {
    const { companyID, uuid, yarnDataUUID } = req.body;
    const ymd = String(req.body.ymd || '').slice(0, 10);
    if (!companyID || !uuid || !yarnDataUUID)
        return res.status(400).json({ success: false, message: 'companyID + uuid + yarnDataUUID required' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd))
        return res.status(400).json({ success: false, message: 'Invalid date (YYYY-MM-DD)' });
    try {
        const found = await findPlanInfo(companyID, uuid, yarnDataUUID);
        if (!found || !found.el) return res.status(404).json({ success: false, message: 'Receive date entry not found' });
        // ## กันวันชนกับแถวอื่นของสีเดียวกัน
        const dup = (found.plan.yarnDataInfo || []).find(i =>
            i.type === 'receive' && i.yarnColorID === found.el.yarnColorID && i.yarnDataUUID !== yarnDataUUID &&
            moment(i.datetime).tz('Asia/Bangkok').format('YYYY-MM-DD') === ymd);
        if (dup) return res.status(400).json({ success: false, message: `Date ${ymd} already exists for this color` });

        await YarnData.updateOne(
            { companyID, uuid },
            { $set: { 'yarnDataInfo.$[e].datetime': new Date(ymd + 'T08:00:00.000+07:00') } },
            { arrayFilters: [{ 'e.yarnDataUUID': yarnDataUUID }] }
        );

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, factoryID: found.plan.factoryID, action: 'update',
            summary: `เปลี่ยนวันด้ายเข้า ${found.plan.yarnID} · ${found.el.yarnColorID} → ${ymd}`,
            meta: { uuid, yarnDataUUID }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: ลบวันรับ — ได้เฉพาะวันที่ยังไม่มี lot (packageInfo ว่าง) แบบหน้าเดิม
exports.cancelPackingDate = async (req, res, next) => {
    const { companyID, uuid, yarnDataUUID } = req.body;
    if (!companyID || !uuid || !yarnDataUUID)
        return res.status(400).json({ success: false, message: 'companyID + uuid + yarnDataUUID required' });
    try {
        const found = await findPlanInfo(companyID, uuid, yarnDataUUID);
        if (!found || !found.el) return res.status(404).json({ success: false, message: 'Receive date entry not found' });
        if ((found.el.packageInfo || []).length > 0)
            return res.status(400).json({ success: false, message: 'This date already has lots - delete all lots first' });

        await YarnData.updateOne({ companyID, uuid }, { $pull: { yarnDataInfo: { yarnDataUUID } } });

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, factoryID: found.plan.factoryID, action: 'delete',
            summary: `ลบวันด้ายเข้า ${found.plan.yarnID} · ${found.el.yarnColorID}`,
            meta: { uuid, yarnDataUUID }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: ตรวจ + คำนวณลังจาก payload (ไม่เชื่อเลขจาก client ทั้งหมด):
//   NET = ชั่งจริง − (coneQty×coneWeight + boxWeight) · ชั่งจริง<=0 = ยังไม่ชั่ง (NET 0, verify ไม่ได้)
//   useWeight = NET (convention เดิม) · boxID uppercase · กันเลขลังซ้ำใน lot
function cleanBoxes(rawBoxes, coneWeight, boxWeight) {
    if (!Array.isArray(rawBoxes) || rawBoxes.length === 0) return { error: 'At least 1 box is required' };
    const out = [];
    const seen = new Set();
    for (const b of rawBoxes) {
        const boxID = String(b.boxID || '').trim().toUpperCase();
        if (!boxID) return { error: 'Box ID cannot be empty' };
        if (seen.has(boxID)) return { error: `Duplicate box ID: ${boxID}` };
        seen.add(boxID);
        const yarnWeight = r2(b.yarnWeight);
        const cc = r2((Number(b.coneQty) || 0) * coneWeight + boxWeight);
        const net = yarnWeight > 0 ? r2(yarnWeight - cc) : 0;
        out.push({
            boxID,
            boxUUID: String(b.boxUUID || '') || uuidv4(),   // ลังเดิมคง boxUUID · ลังใหม่ gen
            coneQty: Number(b.coneQty) || 0,
            factoryID: String(b.factoryID || ''),           // ตำแหน่งลัง — ว่างจนกว่า confirm ('*')
            yarnPlanWeight: r2(b.yarnPlanWeight),           // นน.ตาม invoice
            yarnWeight,                                     // ชั่งจริง (gross)
            yarnWeightNet: net,
            useWeight: net,
            yarnTransferWeight: 0,
            weightVerified: yarnWeight > 0 ? !!b.weightVerified : false,
            used: !!b.used,
        });
    }
    return { boxes: out };
}

// Requirement: เพิ่ม lot ใหม่ในวันรับ (state 'wait') — invoiceID + yarnLotID + นน.แกน/กล่อง + ลังทั้งหมด
exports.addYarnLot = async (req, res, next) => {
    const { companyID, uuid, yarnDataUUID } = req.body;
    const invoiceID  = String(req.body.invoiceID || '').trim();
    const yarnLotID  = String(req.body.yarnLotID || '').trim().toUpperCase();
    const coneWeight = r2(req.body.coneWeight);
    const boxWeight  = r2(req.body.boxWeight);
    if (!companyID || !uuid || !yarnDataUUID || !invoiceID || !yarnLotID)
        return res.status(400).json({ success: false, message: 'invoiceID and yarnLotID are required' });
    if (!/^[A-Z0-9:.\/-]+$/.test(yarnLotID))
        return res.status(400).json({ success: false, message: 'Lot ID may only contain A-Z 0-9 and - : . /' });
    try {
        const found = await findPlanInfo(companyID, uuid, yarnDataUUID);
        if (!found || !found.el) return res.status(404).json({ success: false, message: 'Receive date entry not found' });

        const cb = cleanBoxes(req.body.yarnBoxInfo, coneWeight, boxWeight);
        if (cb.error) return res.status(400).json({ success: false, message: cb.error });
        for (const b of cb.boxes) { b.boxUUID = uuidv4(); b.used = false; b.factoryID = ''; }

        const pkg = {
            invoiceID, yarnLotID, yarnLotUUID: uuidv4(),
            coneWeight, boxWeight, state: 'wait',
            yarnBoxInfo: cb.boxes,
        };
        await YarnData.updateOne(
            { companyID, uuid },
            { $push: { 'yarnDataInfo.$[e].packageInfo': pkg } },
            { arrayFilters: [{ 'e.yarnDataUUID': yarnDataUUID }] }
        );

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, factoryID: found.plan.factoryID, action: 'create',
            summary: `เพิ่ม lot ${yarnLotID} (${invoiceID}) · ${cb.boxes.length} ลัง · ${found.plan.yarnID}`,
            meta: { uuid, yarnDataUUID, yarnLotUUID: pkg.yarnLotUUID }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, yarnLotUUID: pkg.yarnLotUUID, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: แก้ lot (ก่อน confirm เท่านั้น) — replace ลังทั้งชุด + ข้อมูลหัว lot (แบบหน้าเดิม)
exports.editYarnLot = async (req, res, next) => {
    const { companyID, uuid, yarnDataUUID, yarnLotUUID } = req.body;
    const invoiceID  = String(req.body.invoiceID || '').trim();
    const yarnLotID  = String(req.body.yarnLotID || '').trim().toUpperCase();
    const coneWeight = r2(req.body.coneWeight);
    const boxWeight  = r2(req.body.boxWeight);
    if (!companyID || !uuid || !yarnDataUUID || !yarnLotUUID || !invoiceID || !yarnLotID)
        return res.status(400).json({ success: false, message: 'Missing required data (invoiceID + yarnLotID)' });
    if (!/^[A-Z0-9:.\/-]+$/.test(yarnLotID))
        return res.status(400).json({ success: false, message: 'Lot ID may only contain A-Z 0-9 and - : . /' });
    try {
        const found = await findPlanInfo(companyID, uuid, yarnDataUUID);
        if (!found || !found.el) return res.status(404).json({ success: false, message: 'Receive date entry not found' });
        const pkg = (found.el.packageInfo || []).find(pk => pk.yarnLotUUID === yarnLotUUID);
        if (!pkg) return res.status(404).json({ success: false, message: 'Lot not found' });
        if (pkg.state === 'verified')
            return res.status(400).json({ success: false, message: 'This lot is confirmed by the department head - cannot edit' });

        const cb = cleanBoxes(req.body.yarnBoxInfo, coneWeight, boxWeight);
        if (cb.error) return res.status(400).json({ success: false, message: cb.error });

        await YarnData.updateOne(
            { companyID, uuid },
            { $set: {
                'yarnDataInfo.$[e].packageInfo.$[p].yarnBoxInfo': cb.boxes,
                'yarnDataInfo.$[e].packageInfo.$[p].invoiceID': invoiceID,
                'yarnDataInfo.$[e].packageInfo.$[p].yarnLotID': yarnLotID,
                'yarnDataInfo.$[e].packageInfo.$[p].coneWeight': coneWeight,
                'yarnDataInfo.$[e].packageInfo.$[p].boxWeight': boxWeight,
            } },
            { arrayFilters: [{ 'e.yarnDataUUID': yarnDataUUID }, { 'p.yarnLotUUID': yarnLotUUID }] }
        );

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, factoryID: found.plan.factoryID, action: 'update',
            summary: `แก้ lot ${yarnLotID} (${invoiceID}) · ${cb.boxes.length} ลัง · ${found.plan.yarnID}`,
            meta: { uuid, yarnDataUUID, yarnLotUUID }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: ลบ lot (ก่อน confirm เท่านั้น) — UI ใช้กติกาคลิกถังขยะ 5 ครั้งแบบเดิม
exports.deleteYarnLot = async (req, res, next) => {
    const { companyID, uuid, yarnDataUUID, yarnLotUUID } = req.body;
    if (!companyID || !uuid || !yarnDataUUID || !yarnLotUUID)
        return res.status(400).json({ success: false, message: 'Missing required data' });
    try {
        const found = await findPlanInfo(companyID, uuid, yarnDataUUID);
        if (!found || !found.el) return res.status(404).json({ success: false, message: 'Receive date entry not found' });
        const pkg = (found.el.packageInfo || []).find(pk => pk.yarnLotUUID === yarnLotUUID);
        if (!pkg) return res.status(404).json({ success: false, message: 'Lot not found' });
        if (pkg.state === 'verified')
            return res.status(400).json({ success: false, message: 'This lot is confirmed by the department head - cannot delete' });

        await YarnData.updateOne(
            { companyID, uuid },
            { $pull: { 'yarnDataInfo.$[e].packageInfo': { yarnLotUUID } } },
            { arrayFilters: [{ 'e.yarnDataUUID': yarnDataUUID }] }
        );

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, factoryID: found.plan.factoryID, action: 'delete',
            summary: `ลบ lot ${pkg.yarnLotID} (${pkg.invoiceID}) · ${found.plan.yarnID}`,
            meta: { uuid, yarnDataUUID, yarnLotUUID }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: ติ๊กยืนยันของหัวหน้าแผนกเส้นด้าย (confirm lot) — gate สำคัญ:
//   1. เช็คสิทธิ์ server-side: adm__all หรือ yarn__plan-detail__btn__confirm (ของโรงงาน plan)
//   2. ทุกลังต้องชั่งครบ + weightVerified ครบ (จุดเขียว) ถึง confirm ได้
//   3. เขียนแบบระบบเดิม: state='verified' + ลังทุกใบ factoryID='*' (เข้าคลังกลาง)
//      + upsert YarnLotUsage push usage 'ct' (ยอดคำนวณจากข้อมูลจริงใน DB ไม่รับจาก client)
//   4. กัน confirm ซ้ำด้วยการเช็ค usage 'ct' ของ lot นี้ก่อน (แบบ checkExistYarnLotUsage เดิม)
exports.confirmYarnLot = async (req, res, next) => {
    const { companyID, uuid, yarnDataUUID, yarnLotUUID } = req.body;
    if (!companyID || !uuid || !yarnDataUUID || !yarnLotUUID)
        return res.status(400).json({ success: false, message: 'Missing required data' });
    try {
        const found = await findPlanInfo(companyID, uuid, yarnDataUUID);
        if (!found || !found.el) return res.status(404).json({ success: false, message: 'Receive date entry not found' });
        const { plan, el } = found;
        const pkg = (el.packageInfo || []).find(pk => pk.yarnLotUUID === yarnLotUUID);
        if (!pkg) return res.status(404).json({ success: false, message: 'Lot not found' });
        if (pkg.state === 'verified')
            return res.status(400).json({ success: false, message: 'This lot is already confirmed' });

        // ## 1. สิทธิ์ confirm — เช็คที่ server (หัวหน้าแผนกเส้นด้ายเท่านั้น)
        const a = actor(req);
        const acc = await Useracc.findOne({ userID: a.userID }, { uiPerms: 1, _id: 0 }).lean();
        const perms = (acc && acc.uiPerms && acc.uiPerms[plan.factoryID]) || [];
        if (!perms.includes('adm__all') && !perms.includes('yarn__plan-detail__btn__confirm'))
            return res.status(403).json({ success: false, message: 'No permission to confirm a lot (yarn department head only)' });

        // ## 2. ทุกลังต้องชั่ง + verify ครบ
        const boxes = pkg.yarnBoxInfo || [];
        if (boxes.length === 0) return res.status(400).json({ success: false, message: 'This lot has no boxes yet' });
        const notReady = boxes.filter(b => num(b.yarnWeight) <= 0 || !b.weightVerified);
        if (notReady.length > 0)
            return res.status(400).json({ success: false, message: `${notReady.length} box(es) not weighed/verified - all boxes must be done before confirming` });

        // ## 4. กัน confirm ซ้ำ (ledger มี usage 'ct' ของ lot นี้แล้ว = เคยยืนยันไปแล้ว)
        const dupUsage = await YarnLotUsage.findOne({
            companyID, uuid, yarnDataUUID, yarnColorID: el.yarnColorID,
            yarnUsage: { $elemMatch: { yarnLotUUID, usageMode: 'ct' } },
        }, { _id: 1 }).lean();
        if (dupUsage) return res.status(400).json({ success: false, message: 'This lot is already posted to the stock card (confirmed before)' });

        // ## 3. ยอดรวมจากข้อมูลจริง
        let gross = 0, net = 0, inv = 0;
        for (const b of boxes) { gross += num(b.yarnWeight); net += num(b.yarnWeightNet); inv += num(b.yarnPlanWeight); }
        const current2 = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD 08:00:00+07:00'));

        await YarnData.updateOne(
            { companyID, uuid },
            { $set: {
                'yarnDataInfo.$[e].packageInfo.$[p].state': 'verified',
                'yarnDataInfo.$[e].packageInfo.$[p].yarnBoxInfo.$[].factoryID': '*',
            } },
            { arrayFilters: [{ 'e.yarnDataUUID': yarnDataUUID }, { 'p.yarnLotUUID': yarnLotUUID }] }
        );

        const yarnUsage1 = {
            datetime: el.datetime,          // วันด้ายเข้า
            datetimeIssue: current2,        // วันยืนยัน
            yuUUID: uuidv4(),
            yarnLotID: pkg.yarnLotID,
            yarnLotUUID,
            invoiceID: pkg.invoiceID,
            usageMode: 'ct',
            yarnWeight: gross.toFixed(2),
            yarnWeightNet: net.toFixed(2),
            useWeight: net.toFixed(2),      // convention เดิม: useWeight = NET ตอนรับ
            yarnBoxInfo: [],
            usageInfo: { yarnInvoiceWeight: inv.toFixed(2), setFactoryID: ['*'], toFactoryID: '*' },
        };
        await YarnLotUsage.updateOne(
            { companyID, factoryID: plan.factoryID, customerID: plan.customerID,
              yarnSeasonID: plan.yarnSeasonID, yarnID: plan.yarnID,
              yarnDataUUID, uuid, yarnColorID: el.yarnColorID },
            { status: 'open', $push: { yarnUsage: yarnUsage1 } },
            { upsert: true }
        );

        await writeLog({ module: 'yarn', companyID, factoryID: plan.factoryID, action: 'lock',
            summary: `ยืนยัน lot ${pkg.yarnLotID} (${pkg.invoiceID}) · NET ${net.toFixed(2)} kg เข้าคลังกลาง · ${plan.yarnID}`,
            meta: { uuid, yarnDataUUID, yarnLotUUID }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// ==================== STOCK CARD (บัญชีคุมด้าย ต่อสี) =======================

// Requirement: ใบ stock card ต่อ (yarn, สี) — บัญชีเดินสะพัดของคลังกลาง:
//   รับเข้า (usageMode 'ct' = ยืนยัน lot) +NET · จ่ายออก (t=โอนไปโรง, p=เบิกผลิต) −useWeight
//   คืน rows เรียงตามวัน + Pcs./Zone ที่คีย์ไว้ (YarnStockCardPCS จับคู่ด้วย yuUUID)
//   ★ frontend คำนวณ balance สะสมเอง (ตรงกับหน้าเดิม)
exports.getStockCard = async (req, res, next) => {
    const { companyID, factoryID, customerID, yarnSeasonID, yarnID, yarnColorID } = req.body;
    if (!companyID || !customerID || !yarnSeasonID || !yarnID || !yarnColorID)
        return res.status(400).json({ success: false, message: 'Missing required data' });
    try {
        const docs = await YarnLotUsage.find(
            { companyID, customerID, yarnSeasonID, yarnID, yarnColorID,
              ...(factoryID ? { factoryID } : {}) },
            { yarnUsage: 1, yarnDataUUID: 1, _id: 0 }
        ).lean();

        const rows = [];
        for (const d of docs) {
            for (const u of (d.yarnUsage || [])) {
                rows.push({
                    yuUUID: u.yuUUID,
                    yarnDataUUID: d.yarnDataUUID,
                    datetime: u.datetime,          // วันด้ายเข้า (ระบบเดิมไม่ได้เอามาโชว์ในใบ card)
                    datetimeIssue: u.datetimeIssue,// วันบันทึกรายการ = คอลัมน์ Date ของใบ card
                    // ★ คอลัมน์ Date ของใบ card เดิม = datetimeIssue format แบบ UTC
                    //   (ของเดิมใช้ $dateToString ไม่ใส่ timezone) — ต้องทำเหมือนกันเป๊ะ
                    //   ไม่งั้นแถวที่บันทึกช่วงดึกจะเลื่อนไป 1 วัน เทียบกับรายงานเก่าแล้วไม่ตรง
                    ymdIssue: u.datetimeIssue ? moment.utc(u.datetimeIssue).format('YYYY-MM-DD') : '',
                    ddmmyyyy: u.datetimeIssue ? moment.utc(u.datetimeIssue).format('DD-MM-YYYY') : '',
                    usageMode: u.usageMode,        // ct=รับเข้า · t=โอนออก · p=เบิกผลิต
                    invoiceID: u.invoiceID,
                    yarnLotID: u.yarnLotID,
                    yarnLotUUID: u.yarnLotUUID,
                    yarnWeight: num(u.yarnWeight),
                    yarnWeightNet: num(u.yarnWeightNet),
                    useWeight: num(u.useWeight),
                    invoiceWeight: num(u.usageInfo && u.usageInfo.yarnInvoiceWeight),
                    toFactoryID: (u.usageInfo && u.usageInfo.toFactoryID) || '',
                    fromFactoryID: (u.usageInfo && u.usageInfo.fromFactoryID) || '',
                    orderID: (u.usageInfo && u.usageInfo.orderID) || '',
                    boxCount: (u.yarnBoxInfo || []).length,
                    // ## รายละเอียดลัง — ใช้ตอนดับเบิลคลิก Lot ID > "ดูข้อมูลลัง"
                    boxes: (u.yarnBoxInfo || []).map(b => ({
                        boxID: b.boxID, boxUUID: b.boxUUID, coneQty: Number(b.coneQty) || 0,
                        factoryID: b.factoryID || '',
                        yarnWeight: num(b.yarnWeight), yarnWeightNet: num(b.yarnWeightNet),
                        useWeight: num(b.useWeight), yarnTransferWeight: num(b.yarnTransferWeight),
                    })),
                });
            }
        }
        // ★ ลำดับแถว — ทำตามใบ card เดิมทุกชั้น (balance สะสมขึ้นกับลำดับนี้)
        //   วันบันทึก → ชนิดรายการ (ct=10 · t=20 · p=30) → invoice → โรงปลายทาง → order → lot
        //   (ของเดิมเทียบ String(Date) ไม่ได้ ต้องเทียบเป็นสตริง YYYY-MM-DD ตามที่ project มา)
        const SEQ = { ct: 10, t: 20, p: 30 };
        const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
        rows.sort((a, b) =>
               cmp(a.ymdIssue, b.ymdIssue)
            || cmp(SEQ[a.usageMode] || 99, SEQ[b.usageMode] || 99)
            || cmp(a.invoiceID || '', b.invoiceID || '')
            || cmp(a.toFactoryID || '', b.toFactoryID || '')
            || cmp(a.orderID || '', b.orderID || '')
            || cmp(a.yarnLotID || '', b.yarnLotID || ''));

        // ## Pcs. / Zone ที่คีย์ไว้ (แถวโอน) — จับคู่ด้วย yuUUID (คีย์เดียวที่ระบุรายการได้แน่นอน)
        const card = await YarnStockCardPCS.findOne(
            { companyID, yarnSeasonID, yarnID, yarnColorID }, { dataPCS: 1, dataZONE: 1, _id: 0 }
        ).lean();
        const pcsMap = {}; const zoneMap = {};
        for (const p of ((card && card.dataPCS) || [])) if (p.yuUUID) pcsMap[p.yuUUID] = Number(p.pcs) || 0;
        for (const z of ((card && card.dataZONE) || [])) if (z.yuUUID) zoneMap[z.yuUUID] = z.targetPlaceID || '';
        for (const r of rows) { r.pcs = pcsMap[r.yuUUID] || 0; r.targetPlaceID = zoneMap[r.yuUUID] || ''; }

        // ## ชื่อย่อโรงงาน (คอลัมน์ Send to) — ใช้ fInfo.abbreviation ถ้ามี ไม่มีก็ชื่อโรง/factoryID
        const facIDs = [...new Set(rows.map(r => r.toFactoryID).filter(f => f && f !== '*'))];
        const facs = facIDs.length > 0
            ? await Factory.find({ factoryID: { $in: facIDs } }, { factoryID: 1, fInfo: 1, _id: 0 }).lean() : [];
        const facMap = {};
        // ★ ใช้ factoryName2 (ชื่อสั้นแบบ TL / TL2) ให้ตรงกับใบ card เดิม — ไม่ใช่ abbreviation
        for (const f of facs) facMap[f.factoryID] =
            (f.fInfo && (f.fInfo.factoryName2 || f.fInfo.abbreviation || f.fInfo.factoryName)) || f.factoryID;

        return res.json({ success: true, rows, factoryNames: facMap, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: เปลี่ยน "Send to" (โรงงานปลายทางของแถวโอน) — ดับเบิลคลิกช่องในใบ stock card
//   ★ ต้อง re-auth ด้วยรหัสผ่านก่อนเสมอ (แบบเดียวกับยกเลิกล็อกงาน — userID ว่าง = คนที่ login อยู่)
//   แก้เฉพาะ usageInfo (ป้ายปลายทาง) ตามระบบเดิม editYarnUsageNewFacSendTo — ไม่ย้ายตำแหน่งลังใน YarnData
exports.changeSendTo = async (req, res, next) => {
    const b = req.body || {};
    const { companyID, customerID, yarnSeasonID, yarnID, yarnColorID, yuUUID } = b;
    const toFactoryID = String(b.toFactoryID || '').trim();
    const reauthPass = String(b.reauthPass || '');
    const reauthUserID = String(b.reauthUserID || req.userData?.tokenSet?.userID || '').trim();
    if (!companyID || !customerID || !yarnSeasonID || !yarnID || !yarnColorID || !yuUUID || !toFactoryID)
        return res.status(400).json({ success: false, message: 'Missing required data (select a destination factory)' });
    if (!reauthPass)
        return res.status(400).json({ success: false, message: 'Please enter your password to confirm' });
    try {
        // ── re-auth: verify รหัสผ่าน (pattern เดียวกับ userALogin / lockjobCancel) ──
        const acc = await Useracc.findOne({ userID: reauthUserID }).lean();
        if (!acc) return res.status(401).json({ success: false, message: 'User not found' });
        const ok = await bcrypt.compare(reauthPass + 'pwd' + reauthPass, (acc.uInfo && acc.uInfo.userPass) || '');
        if (!ok) return res.status(401).json({ success: false, message: 'Incorrect password' });
        const inCompany = (acc.uCompany || []).some(c => c.companyID === companyID)
                       || (acc.uFactory || []).some(f => f.companyID === companyID);
        if (!inCompany) return res.status(403).json({ success: false, message: 'This account has no permission in this company' });

        // ── โรงงานปลายทางต้องมีจริง + อยู่บริษัทเดียวกัน ──
        const fac = await Factory.findOne({ factoryID: toFactoryID, companyID }, { factoryID: 1, _id: 0 }).lean();
        if (!fac) return res.status(400).json({ success: false, message: 'Destination factory not found' });

        const result = await YarnLotUsage.updateOne(
            { companyID, customerID, yarnSeasonID, yarnID, yarnColorID,
              yarnUsage: { $elemMatch: { yuUUID, usageMode: 't' } } },
            { $set: { 'yarnUsage.$[e].usageInfo.toFactoryID': toFactoryID } },
            { arrayFilters: [{ 'e.yuUUID': yuUUID }] }
        );
        if (result.matchedCount === 0)
            return res.status(404).json({ success: false, message: 'Transfer entry not found' });

        await writeLog({ module: 'yarn', companyID, action: 'update',
            summary: `เปลี่ยนโรงปลายทาง (stock card) ${yarnID} · ${yarnColorID} → ${toFactoryID}`,
            meta: { yuUUID, yarnSeasonID }, userID: reauthUserID, userName: acc.uInfo && acc.uInfo.userName });

        return res.json({ success: true, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// ── หา usage entry ตัวเดียวจาก yuUUID + ประกอบ "identity 10 ช่อง" แบบระบบเดิม ──
// Requirement: ของเดิมเก็บ dataPCS/dataZONE โดยใช้คีย์ 10 ช่อง (ddmmyyyy…yuUUID)
//   ระบบใหม่จับคู่ด้วย yuUUID อย่างเดียว (แน่นอนกว่า) แต่ยัง "เขียนครบทุกช่อง"
//   เพื่อให้แอปเก่าอ่านข้อมูลที่แอปใหม่บันทึกได้เหมือนเดิม
const findUsageByUUID = async (filter, yuUUID) => {
    const docs = await YarnLotUsage.find(filter, { yarnUsage: 1, yarnDataUUID: 1, _id: 0 }).lean();
    for (const d of docs)
        for (const u of (d.yarnUsage || []))
            if (u.yuUUID === yuUUID) return { u, yarnDataUUID: d.yarnDataUUID };
    return null;
};
const stockIdentity = (u, yarnDataUUID) => ({
    ddmmyyyy: moment(u.datetime).tz('Asia/Bangkok').format('DD-MM-YYYY'),
    usageMode: u.usageMode,
    orderID: (u.usageInfo && u.usageInfo.orderID) || '',
    toFactoryID: (u.usageInfo && u.usageInfo.toFactoryID) || '',
    invoiceID: u.invoiceID || '',
    yarnBoxInfoLen: (u.yarnBoxInfo || []).length,
    yarnLotID2: u.yarnLotID || '',
    yarnDataUUID: yarnDataUUID || '',
    yarnLotUUID: u.yarnLotUUID || '',
    yuUUID: u.yuUUID,
});

// Requirement: ดับเบิลคลิกช่อง "Pcs." → ใส่จำนวนตัว (ชิ้นงาน) ของรายการจ่ายออก
//   ใส่ 0 = ลบค่าทิ้ง · เก็บที่ YarnStockCardPCS.dataPCS (collection เดิม)
exports.setStockCardPcs = async (req, res, next) => {
    const b = req.body || {};
    const { companyID, customerID, yarnSeasonID, yarnID, yarnColorID, yuUUID } = b;
    const pcs = Math.max(0, Math.round(Number(b.pcs) || 0));
    if (!companyID || !customerID || !yarnSeasonID || !yarnID || !yarnColorID || !yuUUID)
        return res.status(400).json({ success: false, message: 'Missing required data' });
    try {
        const hit = await findUsageByUUID({ companyID, customerID, yarnSeasonID, yarnID, yarnColorID }, yuUUID);
        if (!hit) return res.status(404).json({ success: false, message: 'Entry not found in the yarn stock card' });
        if (hit.u.usageMode === 'ct')
            return res.status(400).json({ success: false, message: 'Pcs. cannot be set on a received-in row' });

        const a = actor(req);
        const key = { companyID, yarnSeasonID, yarnID, yarnColorID };
        const card = await YarnStockCardPCS.findOne(key, { dataPCS: 1, _id: 0 }).lean();
        const exists = ((card && card.dataPCS) || []).some(p => p.yuUUID === yuUUID);

        if (pcs === 0) {
            if (exists) await YarnStockCardPCS.updateOne(key, { $pull: { dataPCS: { yuUUID } } });
        } else if (exists) {
            await YarnStockCardPCS.updateOne(key,
                { $set: { 'dataPCS.$[e].pcs': pcs, 'dataPCS.$[e].datetime': new Date(),
                          'dataPCS.$[e].createBy': { userID: a.userID, userName: a.userName } } },
                { arrayFilters: [{ 'e.yuUUID': yuUUID }] });
        } else {
            await YarnStockCardPCS.updateOne(key,
                { $set: { type: 'pcs' },
                  $push: { dataPCS: { ...stockIdentity(hit.u, hit.yarnDataUUID), pcs,
                                      datetime: new Date(), createBy: { userID: a.userID, userName: a.userName } } } },
                { upsert: true });
        }

        await writeLog({ module: 'yarn', companyID, action: 'update',
            summary: `ใส่ Pcs. บัญชีคุมด้าย ${yarnID} · ${yarnColorID} = ${pcs}`,
            meta: { yuUUID, yarnSeasonID }, userID: a.userID, userName: a.userName });
        return res.json({ success: true, pcs, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: ดับเบิลคลิกช่อง "Style" → เลือก ZONE ปลายทาง (UK / ASIA / SGHI / JAPN)
//   เลือก 'x' = ล้างค่า · เก็บที่ YarnStockCardPCS.dataZONE (collection เดิม)
exports.setStockCardZone = async (req, res, next) => {
    const b = req.body || {};
    const { companyID, customerID, yarnSeasonID, yarnID, yarnColorID, yuUUID } = b;
    const targetPlaceID = String(b.targetPlaceID || '').trim().toUpperCase();
    if (!companyID || !customerID || !yarnSeasonID || !yarnID || !yarnColorID || !yuUUID)
        return res.status(400).json({ success: false, message: 'Missing required data' });
    try {
        const hit = await findUsageByUUID({ companyID, customerID, yarnSeasonID, yarnID, yarnColorID }, yuUUID);
        if (!hit) return res.status(404).json({ success: false, message: 'Entry not found in the yarn stock card' });
        if (hit.u.usageMode === 'ct')
            return res.status(400).json({ success: false, message: 'ZONE cannot be set on a received-in row' });

        const a = actor(req);
        const key = { companyID, yarnSeasonID, yarnID, yarnColorID };
        const card = await YarnStockCardPCS.findOne(key, { dataZONE: 1, _id: 0 }).lean();
        const exists = ((card && card.dataZONE) || []).some(z => z.yuUUID === yuUUID);
        const clear = (targetPlaceID === '' || targetPlaceID === 'X');

        if (clear) {
            if (exists) await YarnStockCardPCS.updateOne(key, { $pull: { dataZONE: { yuUUID } } });
        } else if (exists) {
            await YarnStockCardPCS.updateOne(key,
                { $set: { 'dataZONE.$[e].targetPlaceID': targetPlaceID, 'dataZONE.$[e].datetime': new Date(),
                          'dataZONE.$[e].createBy': { userID: a.userID, userName: a.userName } } },
                { arrayFilters: [{ 'e.yuUUID': yuUUID }] });
        } else {
            await YarnStockCardPCS.updateOne(key,
                { $push: { dataZONE: { ...stockIdentity(hit.u, hit.yarnDataUUID), targetPlaceID,
                                       datetime: new Date(), createBy: { userID: a.userID, userName: a.userName } } } },
                { upsert: true });
        }

        await writeLog({ module: 'yarn', companyID, action: 'update',
            summary: `เลือก ZONE บัญชีคุมด้าย ${yarnID} · ${yarnColorID} = ${clear ? '(ล้างค่า)' : targetPlaceID}`,
            meta: { yuUUID, yarnSeasonID }, userID: a.userID, userName: a.userName });
        return res.json({ success: true, targetPlaceID: clear ? '' : targetPlaceID, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// ============ LOT MANAGEMENT (จัดการลัง: คงเหลือ · ดูลัง · แบ่งลัง) ============
// กติกาที่ยึดจากระบบเดิม (ถามจาก user 2026-08-28):
//   - ด้ายที่ลูกค้าส่งมา รับเข้า "คลังกลาง" ก่อน — ตอน confirm lot ลังทุกใบถูกตั้ง factoryID='*'
//     ('*' = อยู่คลังกลาง ยังไม่จ่ายเข้าโรงไหน) แล้วค่อย transfer ออกไปโรงงานต่างๆ (เฟสถัดไป)
//   - "คงเหลือ" ของ lot = ผลรวม useWeight ของลังที่ used=false (ลังหนึ่งใบ = ใช้แล้ว/ยังไม่ใช้)
//     useWeight เป็นฟิลด์เดียวที่เป็นตัวเลขคงเหลือจริง — yarnWeight/yarnWeightNet ห้ามแก้
const DIVIDE_SIGN = '::';
const CHAR_E = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Requirement: ลังทั้งหมดของ plan (ทุกสี) ที่ยืนยันแล้ว — สำหรับหน้า YARN Lot management
//   คืนต่อสี: lot แต่ละใบ + ลังในนั้น (คงเหลือ/ใช้แล้ว/อยู่ที่ไหน)
exports.getLotBoxes = async (req, res, next) => {
    const { companyID, uuid } = req.body;
    if (!companyID || !uuid) return res.status(400).json({ success: false, message: 'Missing required data' });
    try {
        const plan = await YarnData.findOne({ companyID, uuid }).lean();
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        convertPlanWeights(plan);

        const colors = (plan.colorS || []).map(cs => ({
            key: `${cs.setName};${cs.color.colorCode};${cs.color.colorID}`,
            colorCode: cs.color.colorCode, colorName: cs.color.colorName,
            colorValue: cs.color.colorValue, lots: [],
        }));
        const byKey = {};
        for (const c of colors) byKey[c.key] = c;

        for (const el of (plan.yarnDataInfo || [])) {
            if (el.type !== 'receive') continue;
            const c = byKey[el.yarnColorID];
            if (!c) continue;
            for (const pk of (el.packageInfo || [])) {
                // ## ยังไม่ผ่านการติ๊กยืนยันของหัวหน้า = ยังไม่ถือว่าเข้าคลัง จัดการลังไม่ได้
                if (pk.state !== 'verified') continue;
                // ★ หน้านี้แสดง "ของในคลังกลาง" เท่านั้น — ลังที่ยังไม่จ่ายออกไปโรงไหน
                //   (factoryID '*' = อยู่คลังกลาง · ถ้าถูก transfer แล้วจะกลายเป็น factoryID ของโรงปลายทาง)
                const boxes = (pk.yarnBoxInfo || [])
                    .filter(b => b.weightVerified && b.factoryID === '*')
                    .map(b => ({
                        boxID: b.boxID, boxUUID: b.boxUUID,
                        coneQty: Number(b.coneQty) || 0,
                        factoryID: b.factoryID || '',
                        yarnWeight: b.yarnWeight, yarnWeightNet: b.yarnWeightNet,
                        useWeight: b.useWeight, yarnTransferWeight: b.yarnTransferWeight,
                        used: !!b.used,
                        isDivided: String(b.boxID || '').includes(DIVIDE_SIGN),
                    }))
                    .sort((a, b) => String(a.boxID).localeCompare(String(b.boxID), undefined, { numeric: true }));
                if (boxes.length === 0) continue;   // จ่ายออกหมดแล้ว = ไม่ต้องโชว์ lot นี้
                c.lots.push({
                    yarnDataUUID: el.yarnDataUUID,
                    ddmmyyyy: el.datetime ? moment.utc(el.datetime).format('DD-MM-YYYY') : '',
                    invoiceID: pk.invoiceID, yarnLotID: pk.yarnLotID, yarnLotUUID: pk.yarnLotUUID,
                    boxes,
                });
            }
        }

        // ## ชื่อโรงงานสำหรับป้าย "อยู่ที่" ของแต่ละลัง ('*' = คลังกลาง)
        const facIDs = [...new Set(colors.flatMap(c => c.lots.flatMap(l => l.boxes.map(b => b.factoryID)))
                                          .filter(f => f && f !== '*'))];
        const facs = facIDs.length > 0
            ? await Factory.find({ factoryID: { $in: facIDs } }, { factoryID: 1, fInfo: 1, _id: 0 }).lean() : [];
        const facMap = {};
        for (const f of facs) facMap[f.factoryID] =
            (f.fInfo && (f.fInfo.factoryName2 || f.fInfo.abbreviation || f.fInfo.factoryName)) || f.factoryID;

        return res.json({ success: true, colors, factoryNames: facMap, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: แบ่งลัง — ตัดน้ำหนักส่วนหนึ่งของลังเดิมออกเป็นลังใหม่ ชื่อ <ลังเดิม>::a ::b ::c ...
//   ทำตามระบบเดิม (putEditYarnLotIDDevide) แต่ย้ายการตรวจมาไว้ที่ server:
//     - ลังเดิมต้องยังไม่ถูกใช้ (used=false)
//     - 0 < น้ำหนักที่แบ่ง < น้ำหนักลังเดิม  (ห้ามแบ่งหมดลัง / ห้ามติดลบ)
//     - ตั้งชื่อ suffix ตัวถัดไปที่ server หาเอง (กันชนกันเวลาสองคนแบ่งพร้อมกัน)
//   ลังเดิมเก็บชื่อเดิมไว้ ไม่เปลี่ยนเป็น ::a · แบ่งจาก 2120::a ก็ยังได้ฐาน 2120
exports.divideLotBox = async (req, res, next) => {
    const b = req.body || {};
    const { companyID, uuid, yarnDataUUID, yarnLotUUID, boxUUID } = b;
    const weightDivide = r2(b.weightDivide);
    if (!companyID || !uuid || !yarnDataUUID || !yarnLotUUID || !boxUUID)
        return res.status(400).json({ success: false, message: 'Missing required data' });
    if (!(weightDivide > 0))
        return res.status(400).json({ success: false, message: 'Divide weight must be greater than 0' });
    try {
        const found = await findPlanInfo(companyID, uuid, yarnDataUUID);
        if (!found || !found.el) return res.status(404).json({ success: false, message: 'Receive date entry not found' });
        const { plan, el } = found;
        const pkg = (el.packageInfo || []).find(pk => pk.yarnLotUUID === yarnLotUUID);
        if (!pkg) return res.status(404).json({ success: false, message: 'Lot not found' });
        if (pkg.state !== 'verified')
            return res.status(400).json({ success: false, message: 'This lot is not confirmed yet - cannot divide a box' });

        const box = (pkg.yarnBoxInfo || []).find(x => x.boxUUID === boxUUID);
        if (!box) return res.status(404).json({ success: false, message: 'Box not found' });
        if (box.used) return res.status(400).json({ success: false, message: 'This box is already used - cannot divide' });
        // ★ จัดการได้เฉพาะของในคลังกลางเท่านั้น — ลังที่จ่ายออกไปโรงงานแล้วห้ามแตะจากหน้านี้
        if (box.factoryID !== '*')
            return res.status(400).json({ success: false, message: 'This box has left the center store - it cannot be managed from this page' });

        const cur = r2(num(box.useWeight));
        if (weightDivide >= cur)
            return res.status(400).json({ success: false, message: `Can divide at most ${cur} kg (the original box must keep some weight)` });
        const remain = r2(cur - weightDivide);

        // ## ชื่อลังใหม่ — ฐานคือส่วนหน้า '::' แล้วหาตัวอักษรถัดไปที่ยังไม่ถูกใช้ใน lot นี้
        const base = String(box.boxID || '').split(DIVIDE_SIGN)[0];
        const used = new Set((pkg.yarnBoxInfo || [])
            .map(x => String(x.boxID || ''))
            .filter(id => id.startsWith(base + DIVIDE_SIGN))
            .map(id => id.slice(base.length + DIVIDE_SIGN.length)));
        const next = CHAR_E.find(ch => !used.has(ch));
        if (!next) return res.status(400).json({ success: false, message: `Box ${base} has used up all suffixes a-z` });
        const boxIDNew = base + DIVIDE_SIGN + next;

        const boxNew = {
            boxID: boxIDNew, boxUUID: uuidv4(),
            coneQty: 0, factoryID: '*',        // ลังที่แบ่งออกมายังอยู่คลังกลางเหมือนลังแม่
            yarnPlanWeight: 0, yarnWeight: 0, yarnWeightNet: 0,
            useWeight: weightDivide, yarnTransferWeight: 0,
            weightVerified: true, used: false,
        };

        // ลดน้ำหนักลังเดิม แล้วเพิ่มลังใหม่ (ยอดรวมของ lot ไม่เปลี่ยน)
        await YarnData.updateOne(
            { companyID, uuid },
            { $set: { 'yarnDataInfo.$[e].packageInfo.$[p].yarnBoxInfo.$[x].useWeight': remain } },
            { arrayFilters: [{ 'e.yarnDataUUID': yarnDataUUID }, { 'p.yarnLotUUID': yarnLotUUID }, { 'x.boxUUID': boxUUID }] }
        );
        await YarnData.updateOne(
            { companyID, uuid },
            { $push: { 'yarnDataInfo.$[e].packageInfo.$[p].yarnBoxInfo': boxNew } },
            { arrayFilters: [{ 'e.yarnDataUUID': yarnDataUUID }, { 'p.yarnLotUUID': yarnLotUUID }] }
        );

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, factoryID: plan.factoryID, action: 'update',
            summary: `แบ่งลัง ${box.boxID} → ${boxIDNew} · ${weightDivide} kg (เหลือในลังเดิม ${remain} kg) · lot ${pkg.yarnLotID}`,
            meta: { uuid, yarnDataUUID, yarnLotUUID, boxUUID }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, boxIDNew, remain, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: จ่ายเส้นด้ายออกจากคลังกลาง → โรงงานในเครือ (รวมโรงตัวเอง)
//   กติกาที่ user กำหนด (2026-08-28):
//     - เลือกโรงงานปลายทางจากโรงในเครือ (isOutsource=false) รวมโรงงานตัวเองด้วย
//     - ★ ต้องเลือก orderID (style) 1 ตัวก่อน · ทำทีละ orderID
//     - ย้ายทั้งลัง ถ้าต้องการจ่ายบางส่วนให้ "แบ่งลัง" ก่อน
//   เขียนแบบระบบเดิม (putYarnLotTransferCF): ลัง factoryID '*' → toFactoryID
//   + yarnTransferWeight = นน.ที่ย้าย · push usage 't' เข้า YarnLotUsage (ลงใบ stock card)
exports.transferLotBoxes = async (req, res, next) => {
    const b = req.body || {};
    const { companyID, uuid, yarnDataUUID, yarnLotUUID } = b;
    const toFactoryID = String(b.toFactoryID || '').trim();
    const orderID     = String(b.orderID || '').trim();
    const boxUUIDs    = Array.isArray(b.boxUUIDs) ? [...new Set(b.boxUUIDs.filter(Boolean))] : [];
    if (!companyID || !uuid || !yarnDataUUID || !yarnLotUUID)
        return res.status(400).json({ success: false, message: 'Missing required data' });
    if (!toFactoryID)
        return res.status(400).json({ success: false, message: 'Select a destination factory' });
    if (!orderID)
        return res.status(400).json({ success: false, message: 'Select 1 style (orderID) first' });
    if (boxUUIDs.length === 0)
        return res.status(400).json({ success: false, message: 'Select at least 1 box to issue out' });
    try {
        const found = await findPlanInfo(companyID, uuid, yarnDataUUID);
        if (!found || !found.el) return res.status(404).json({ success: false, message: 'Receive date entry not found' });
        const { plan, el } = found;
        const pkg = (el.packageInfo || []).find(pk => pk.yarnLotUUID === yarnLotUUID);
        if (!pkg) return res.status(404).json({ success: false, message: 'Lot not found' });
        if (pkg.state !== 'verified')
            return res.status(400).json({ success: false, message: 'This lot is not confirmed yet - cannot issue out' });

        // ## style ต้องเป็นของ plan นี้จริง (กันยิง API ตรงด้วย orderID มั่ว)
        if (!(plan.orderID || []).includes(orderID))
            return res.status(400).json({ success: false, message: 'This style is not part of the plan' });

        // ## โรงปลายทางต้องมีจริง อยู่บริษัทเดียวกัน และไม่ใช่โรงนอก
        const fac = await Factory.findOne({ factoryID: toFactoryID, companyID }, { factoryID: 1, fInfo: 1, _id: 0 }).lean();
        if (!fac) return res.status(400).json({ success: false, message: 'Destination factory not found' });
        if (fac.fInfo && fac.fInfo.isOutsource === true)
            return res.status(400).json({ success: false, message: 'Cannot issue yarn to an outsource factory' });

        // ## ทุกลังที่เลือกต้องอยู่คลังกลาง และยังไม่ถูกใช้
        const all = pkg.yarnBoxInfo || [];
        const picked = [];
        for (const id of boxUUIDs) {
            const box = all.find(x => x.boxUUID === id);
            if (!box) return res.status(404).json({ success: false, message: 'Box not found' });
            if (box.used) return res.status(400).json({ success: false, message: `Box ${box.boxID} is already used` });
            if (box.factoryID !== '*')
                return res.status(400).json({ success: false, message: `Box ${box.boxID} has already left the center store` });
            picked.push(box);
        }
        const totalKg = r2(picked.reduce((s, x) => s + num(x.useWeight), 0));
        if (!(totalKg > 0))
            return res.status(400).json({ success: false, message: 'Total weight of the selected boxes is 0' });

        const a = actor(req);
        const now      = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
        const current2 = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD 08:00:00+07:00'));

        // 1) ย้ายลังใน YarnData: factoryID '*' → ปลายทาง + จำน้ำหนักที่ย้ายไว้ (audit)
        for (const box of picked) {
            await YarnData.updateOne(
                { companyID, uuid },
                { $set: {
                    'yarnDataInfo.$[e].packageInfo.$[p].yarnBoxInfo.$[x].factoryID': toFactoryID,
                    'yarnDataInfo.$[e].packageInfo.$[p].yarnBoxInfo.$[x].yarnTransferWeight': r2(num(box.useWeight)),
                } },
                { arrayFilters: [{ 'e.yarnDataUUID': yarnDataUUID }, { 'p.yarnLotUUID': yarnLotUUID }, { 'x.boxUUID': box.boxUUID }] }
            );
        }

        // 2) ลงบัญชีคุมด้าย: usage 't' (ใบ stock card จะเห็นเป็นแถวจ่ายออก)
        const yarnUsage1 = {
            datetime: now,
            datetimeIssue: current2,
            yuUUID: uuidv4(),
            yarnLotID: pkg.yarnLotID,
            yarnLotUUID,
            invoiceID: pkg.invoiceID,
            usageMode: 't',
            yarnWeight: totalKg.toFixed(2),
            yarnWeightNet: '0',
            useWeight: totalKg.toFixed(2),
            yarnBoxInfo: picked.map(x => ({
                boxID: x.boxID, boxUUID: x.boxUUID,
                coneQty: Number(x.coneQty) || 0,
                factoryID: toFactoryID,                       // ปลายทาง (ตาม convention เดิม)
                yarnWeight: num(x.yarnWeight).toFixed(2),
                yarnWeightNet: num(x.yarnWeightNet).toFixed(2),
                useWeight: num(x.useWeight).toFixed(2),
                yarnTransferWeight: num(x.useWeight).toFixed(2),
            })),
            usageInfo: {
                fromFactoryID: '*',                           // คลังกลาง
                toFactoryID,
                setFactoryID: ['*', toFactoryID],
                orderID,
            },
        };
        await YarnLotUsage.updateOne(
            { companyID, factoryID: plan.factoryID, customerID: plan.customerID,
              yarnSeasonID: plan.yarnSeasonID, yarnID: plan.yarnID,
              yarnDataUUID, uuid, yarnColorID: el.yarnColorID },
            { status: 'open', $push: { yarnUsage: yarnUsage1 } },
            { upsert: true }
        );

        await writeLog({ module: 'yarn', companyID, factoryID: plan.factoryID, action: 'update',
            summary: `จ่ายด้ายออกจากคลังกลาง → ${toFactoryID} · ${orderID} · ${picked.length} ลัง ${totalKg} kg · lot ${pkg.yarnLotID} · ${plan.yarnID}`,
            meta: { uuid, yarnDataUUID, yarnLotUUID, boxUUIDs, toFactoryID, orderID },
            userID: a.userID, userName: a.userName });

        return res.json({ success: true, boxes: picked.length, totalKg, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// ==================== INVOICE (รายงาน + เปลี่ยนเลข) =========================

// Requirement: หา plan ทุกตัวที่มี lot ของ invoiceID นี้ (สำหรับรายงาน yarn-rep02 —
//   invoice เดียวอาจคลุมหลาย yarn/สี/วัน) — คืนเฉพาะ dataInfo receive + lot ที่ตรง invoice
//   พร้อมชื่อ yarn เต็ม + colorS ของแต่ละ plan · แปลง Decimal128 ให้แล้ว
exports.findInvoicePlans = async (req, res, next) => {
    const { companyID, factoryID, customerID, yarnSeasonID } = req.body;
    const invoiceID = String(req.body.invoiceID || '').trim();
    if (!companyID || !factoryID || !customerID || !yarnSeasonID || !invoiceID)
        return res.status(400).json({ success: false, message: 'Missing required data (invoiceID)' });
    try {
        const docs = await YarnData.find(
            { companyID, factoryID, customerID, yarnSeasonID, status: 'open',
              'yarnDataInfo.packageInfo.invoiceID': invoiceID },
            { uuid: 1, yarnID: 1, colorS: 1, yarnDataInfo: 1, _id: 0 }
        ).lean();

        const plans = [];
        for (const doc of docs) {
            convertPlanWeights(doc);
            const infos = [];
            for (const di of (doc.yarnDataInfo || [])) {
                if (di.type !== 'receive') continue;
                const pkgs = (di.packageInfo || []).filter(pk => pk.invoiceID === invoiceID);
                if (pkgs.length > 0) infos.push({ ...di, packageInfo: pkgs });
            }
            if (infos.length > 0)
                plans.push({ uuid: doc.uuid, yarnID: doc.yarnID, colorS: doc.colorS, yarnDataInfo: infos });
        }

        // ## ชื่อ yarn เต็มสำหรับหัวรายงาน
        const yarnIDs = [...new Set(plans.map(p => p.yarnID))];
        const yarns = await Yarn.find(
            { companyID, customerID, yarnSeasonID, yarnID: { $in: yarnIDs } },
            { yarnID: 1, yarnName: 1, yarnFullName: 1, _id: 0 }
        ).lean();
        const nameMap = {};
        for (const y of yarns) nameMap[y.yarnID] = y.yarnFullName || y.yarnName || y.yarnID;
        for (const p of plans) p.yarnFullName = nameMap[p.yarnID] || p.yarnID;

        return res.json({ success: true, plans, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};

// Requirement: เปลี่ยน invoice ID ทั้ง season (แบบระบบเดิม putYarnChangeInvoiceID —
//   invoice เดียวโยงหลาย yarn/สี/lot จึงกวาดทั้ง season): อัปเดต 3 collections
//   YarnData (packageInfo.invoiceID) + YarnLotUsage (yarnUsage.invoiceID) + YarnStockCardPCS (dataPCS/dataZONE)
exports.changeInvoiceID = async (req, res, next) => {
    const { companyID, yarnSeasonID } = req.body;
    const invoiceID1 = String(req.body.invoiceID1 || '').trim();
    const invoiceID2 = String(req.body.invoiceID2 || '').trim();
    if (!companyID || !yarnSeasonID || !invoiceID1 || !invoiceID2)
        return res.status(400).json({ success: false, message: 'Missing required data (old/new invoiceID)' });
    if (invoiceID1 === invoiceID2)
        return res.status(400).json({ success: false, message: 'The new invoice is the same as the current one' });
    try {
        const r1 = await YarnData.updateMany(
            { companyID, yarnSeasonID },
            { $set: { 'yarnDataInfo.$[e].packageInfo.$[p].invoiceID': invoiceID2 } },
            { arrayFilters: [{ 'e.type': { $in: ['plan', 'receive'] } }, { 'p.invoiceID': invoiceID1 }] }
        );
        await YarnLotUsage.updateMany(
            { companyID, yarnSeasonID },
            { $set: { 'yarnUsage.$[e].invoiceID': invoiceID2 } },
            { arrayFilters: [{ 'e.invoiceID': invoiceID1 }] }
        );
        await YarnStockCardPCS.updateMany(
            { companyID, yarnSeasonID },
            { $set: { 'dataPCS.$[e].invoiceID': invoiceID2, 'dataZONE.$[e].invoiceID': invoiceID2 } },
            { arrayFilters: [{ 'e.invoiceID': invoiceID1 }] }
        );

        const a = actor(req);
        await writeLog({ module: 'yarn', companyID, action: 'update',
            summary: `เปลี่ยน invoice ID ทั้ง season ${yarnSeasonID}`,
            changes: [{ field: 'invoiceID', from: invoiceID1, to: invoiceID2 }],
            meta: { yarnSeasonID, plansMatched: r1.modifiedCount }, userID: a.userID, userName: a.userName });

        return res.json({ success: true, ...(await tokenRefresh(req)) });
    } catch (err) { return next(err); }
};
