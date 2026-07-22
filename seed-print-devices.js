// ═══════════════════════════════════════════════════════════════════════════
// seed-print-devices.js — แทรกเครื่องพิมพ์ QR เริ่มต้น 2 เครื่อง (SBARCO T43R+ , TSC MA3410P)
//   วิธีรัน (บน server ที่มี config.env):  cd ~/nodejs-GarmentFactory && node seed-print-devices.js
//   ★ idempotent — รันซ้ำได้ ถ้ามี name เดิมอยู่แล้วจะข้าม (ไม่สร้างซ้ำ)
//   ★ ไฟล์ one-off — รันเสร็จลบทิ้งได้
// ═══════════════════════════════════════════════════════════════════════════
require('dotenv').config({ path: './config.env' });
require('dotenv').config({ path: './config2.env' });
const mongoose = require('mongoose');
const PrintDevice = require('./models/m-print-device');

const COMPANY = 'c000001';   // ← companyID (แก้ได้ถ้าไม่ใช่)

// เครื่องพิมพ์เริ่มต้น (ปรับ pcName / usbName / ขนาดป้าย ได้ทีหลังในหน้า Admin)
const DEVICES = [
  {
    name: 'TSC MA3410P', brand: 'TSC', model: 'MA3410P',
    language: 'TSPL2', dpi: 300,
    pcName: 'PC-QR-TSC', agentUrl: 'http://localhost:9100',
    connType: 'usb', usbName: 'TSC MA3410P', host: '', port: 9100,
    labelWidthMm: 0, labelHeightMm: 0, gapMm: 0,   // ← ใส่ขนาดจริงทีหลัง
    cutter: 'each', templateKey: 'care-12',
    line: '', isDefault: true, status: 'a',
    note: 'มี auto cutter · ตั้งเป็น default',
  },
  {
    name: 'SBARCO T43R+', brand: 'SBARCO', model: 'T43R+',
    language: 'SBPL', dpi: 300,
    pcName: 'PC-QR-SBARCO', agentUrl: 'http://localhost:9100',
    connType: 'usb', usbName: 'Sbarco T43R+ Care Label Printer', host: '', port: 9100,
    labelWidthMm: 0, labelHeightMm: 0, gapMm: 0,   // ← ใส่ขนาดจริงทีหลัง
    cutter: 'each', templateKey: 'care-12',
    line: '', isDefault: false, status: 'a',
    note: 'เครื่องเดิม',
  },
];

async function nextDeviceID(companyID) {
  const rows = await PrintDevice.find({ companyID, deviceID: /^pd_\d+$/ }, { deviceID: 1, _id: 0 }).lean();
  let max = 0;
  for (const r of rows) { const n = parseInt(String(r.deviceID).slice(3), 10); if (n > max) max = n; }
  return max;
}

async function run() {
  const uri = `mongodb+srv://${process.env.MGUSER}:${process.env.MGPWD}${process.env.MGSVR1}/${process.env.MGDB}?retryWrites=true&w=majority&appName=Cluster0`;
  mongoose.set('strictQuery', false);
  await mongoose.connect(uri);   // write → primary เสมอ
  console.log('connected to DB:', process.env.MGDB);

  let seq = await nextDeviceID(COMPANY);
  for (const d of DEVICES) {
    const exists = await PrintDevice.findOne({ companyID: COMPANY, name: d.name }).lean();
    if (exists) { console.log(`skip (มีอยู่แล้ว): ${d.name} [${exists.deviceID}]`); continue; }
    seq += 1;
    const deviceID = 'pd_' + String(seq).padStart(6, '0');
    // ถ้า device นี้ isDefault → ปลด default ตัวอื่นก่อน
    if (d.isDefault) await PrintDevice.updateMany({ companyID: COMPANY }, { $set: { isDefault: false } });
    await PrintDevice.create({
      companyID: COMPANY, deviceID, ...d,
      createBy: { userID: 'seed', userName: 'seed-script' }, createdAt: new Date(),
    });
    console.log(`created: ${d.name} [${deviceID}]${d.isDefault ? ' (default)' : ''}`);
  }

  await mongoose.disconnect();
  console.log('done.');
}

run().catch(err => { console.error('seed error:', err); process.exit(1); });
