// ═══════════════════════════════════════════════════════════════════════════
// ⚠️ TEST DATA — seed worker ทดสอบ (รายวัน) 203 คน + สรุปสแกน เพื่อดู flow ค่าแรงรายวัน
//
// รัน (ในโฟลเดอร์ nodejs-GarmentFactory ที่มี .env + node_modules):
//     node scripts/seed-test-daily.js            (auto หา งวด/โรงงาน)
//     node scripts/seed-test-daily.js <factoryID>   (ถ้ามีหลายโรงงาน)
//
// ลบทีหลัง:  node scripts/clear-test-daily.js
//
// worker ที่ seed จะมี userID ขึ้นต้น "SEEDW-" (ใช้ลบทิ้งทีหลังได้สะอาด)
// ข้อมูล วัน มาจากไฟล์สแกนจริง · อัตรา/OT ผูกไว้ใน seed-fs-workers.json (deterministic)
// ═══════════════════════════════════════════════════════════════════════════
const path = require('path');
// โหลด env แบบเดียวกับ app.js (config.env + config2.env — ไม่ใช่ .env)
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });
require('dotenv').config({ path: path.join(__dirname, '..', 'config2.env') });
const mongoose = require('mongoose');
const fs   = require('fs');

const User              = require('../models/m-user');
const FingerScanSummary = require('../models/m-fingerscan-summary');
const WorkerPayPeriod   = require('../models/m-worker-pay-period');
const Gsconfig          = require('../models/m-gsconfig');

const SEED_PREFIX = 'SEEDW-';
const workers = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-fs-workers.json'), 'utf8'));

// แผนก + ตำแหน่ง (ตรงกับ HR_DEPARTMENTS / HR_POSITIONS) — สุ่มแบบ deterministic ต่อ scanID
const DEPTS = ['ทอคอม','ปั่นด้าย','พ้ง','ตรวจทอ','เกี่ยวสอย','ซัก','แพ็คกิ้ง','แม่บ้าน','กรรมกร'];
const POSS  = ['ทอผ้า','ดึงจี่เบ้','ผู้ช่วยทอ','เสมียนทอ','หัวหน้าทอ','ช่างพัง','เกี่ยวสอย','แพ็คกิ้ง','แม่บ้าน','กรรมกร'];
function hash(s) { let v = 0; for (const c of String(s)) v = (v * 31 + c.charCodeAt(0)) & 0xffffffff; return v; }

// งวด finger scan (ไฟล์เดือน 6): 2026-06-06 ~ 2026-07-03
const FS_START = new Date('2026-06-06T00:00:00.000Z');
const FS_END   = new Date('2026-07-03T00:00:00.000Z');

(async () => {
    const uri = `mongodb+srv://${process.env.MGUSER}:${process.env.MGPWD}${process.env.MGSVR1}/${process.env.MGDB}?retryWrites=true&w=majority&appName=Cluster0`;
    await mongoose.connect(uri, { readPreference: 'secondaryPreferred' });
    console.log('DB connected:', process.env.MGDB);

    // หา งวดค่าแรง ที่ครอบช่วง finger scan (6มิย-3กค 2026)
    const argFac = process.argv[2];
    const q = { startDate: { $lte: FS_START }, endDate: { $gte: FS_END } };
    if (argFac) q.factoryID = argFac;
    const periods = await WorkerPayPeriod.find(q).lean();
    if (!periods.length) {
        console.error('❌ ไม่พบงวดค่าแรงที่ครอบ 6 มิ.ย – 3 ก.ค 2026 — เปิด/สร้างงวดในแอปก่อน (Accounting > แก้ไขค่าแรง > งวดค่าแรง)');
        process.exit(1);
    }
    if (periods.length > 1 && !argFac) {
        console.error('⚠️ เจอหลายงวด/โรงงาน:\n' + periods.map(p => `   factory=${p.factoryID}  period=${p.periodID}`).join('\n'));
        console.error('ระบุโรงงาน: node scripts/seed-test-daily.js <factoryID>');
        process.exit(1);
    }
    const { companyID, factoryID, periodID, name } = periods[0];
    console.log(`ใช้งวด → company=${companyID}  factory=${factoryID}  period=${periodID}  ${name || ''}`);

    // ตั้ง config แผนก/ตำแหน่ง ให้สะอาด (ยังไม่มีข้อมูลจริง — user ให้แตะได้)
    const upCfg = async (key, value, label) => Gsconfig.findOneAndUpdate(
        { companyID, factoryID, key }, { $set: { companyID, factoryID, key, value, label, module: 'hr' } }, { upsert: true });
    await upCfg('HR_DEPARTMENTS', DEPTS.join(','), 'แผนก worker (กลุ่มใหญ่)');
    await upCfg('HR_POSITIONS',   POSS.join(','),  'ตำแหน่ง worker (หน้าที่ในแผนก)');
    console.log('ตั้ง config HR_DEPARTMENTS + HR_POSITIONS แล้ว');

    let nw = 0, nfs = 0;
    for (const w of workers) {
        const userID = SEED_PREFIX + w.scanID;
        const hv = hash(w.scanID);
        const dept = DEPTS[hv % DEPTS.length];
        const pos  = POSS[(hv >> 3) % POSS.length];
        await User.findOneAndUpdate({ userID }, { $set: {
            userID, qrCode: userID, type: 's', status: 'a', state: '',
            'uInfo.userName': w.name, 'uInfo.userPass': '-', 'uInfo.registDate': new Date(),
            'uInfo.wageType': 'daily', 'uInfo.scanID': w.scanID,
            'uInfo.department': dept, 'uInfo.position': pos,
            uFactory: [{ factoryID, companyID, state: 'joined' }],
            payType: ['daily'], baseSalary: w.rate,
            createdAt: new Date(), createBy: { userID: 'seed' },
        } }, { upsert: true });
        nw++;

        const fsSummaryID = `${factoryID}-${periodID}-${userID}`;
        await FingerScanSummary.findOneAndUpdate({ companyID, factoryID, periodID, workerID: userID }, { $set: {
            fsSummaryID, companyID, factoryID, periodID, workerID: userID, scanID: w.scanID,
            workerName: w.name, daysWorked: w.days, otHours: w.ot, deductAmount: 0,
            status: 'confirmed', updatedAt: new Date(),
        } }, { upsert: true });
        nfs++;
    }

    console.log(`✅ seed เสร็จ: worker ${nw} คน + สรุปสแกน ${nfs} รายการ`);
    console.log(`   ทุกคน userID ขึ้นต้น "${SEED_PREFIX}" · ประเภท รายวัน · มีแผนก+ตำแหน่งสุ่มให้แล้ว`);
    console.log(`   ไปทดสอบ: Accounting > แก้ไขค่าแรง > เลือกงวด > เลือก worker > ปุ่ม "ดึงค่าแรงรายวัน (auto)"`);
    console.log(`   ลบทิ้ง:  node scripts/clear-test-daily.js`);
    await mongoose.disconnect();
    process.exit(0);
})().catch(e => { console.error('SEED ERROR:', e); process.exit(1); });
