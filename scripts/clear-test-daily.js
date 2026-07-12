// ═══════════════════════════════════════════════════════════════════════════
// ลบ worker ทดสอบ (seed) ทั้งหมด — worker + สรุปสแกน + บรรทัดค่าแรงที่สร้างจาก seed
// รัน:  node scripts/clear-test-daily.js
// ลบเฉพาะ userID ที่ขึ้นต้น "SEEDW-" เท่านั้น (ของจริงไม่กระทบ)
// ═══════════════════════════════════════════════════════════════════════════
const path = require('path');
// โหลด env แบบเดียวกับ app.js (config.env + config2.env)
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });
require('dotenv').config({ path: path.join(__dirname, '..', 'config2.env') });
const mongoose = require('mongoose');

const User              = require('../models/m-user');
const FingerScanSummary = require('../models/m-fingerscan-summary');
const WorkerPayItem     = require('../models/m-worker-pay-item');

const SEED_PREFIX = 'SEEDW-';

(async () => {
    const uri = `mongodb+srv://${process.env.MGUSER}:${process.env.MGPWD}${process.env.MGSVR1}/${process.env.MGDB}?retryWrites=true&w=majority&appName=Cluster0`;
    await mongoose.connect(uri, { readPreference: 'secondaryPreferred' });
    console.log('DB connected:', process.env.MGDB);

    const rx = new RegExp('^' + SEED_PREFIX);
    const u = await User.deleteMany({ userID: rx });
    const f = await FingerScanSummary.deleteMany({ workerID: rx });
    const i = await WorkerPayItem.deleteMany({ workerID: rx });

    console.log(`✅ ลบ seed เสร็จ: worker ${u.deletedCount} คน · สรุปสแกน ${f.deletedCount} · บรรทัดค่าแรง ${i.deletedCount}`);
    await mongoose.disconnect();
    process.exit(0);
})().catch(e => { console.error('CLEAR ERROR:', e); process.exit(1); });
