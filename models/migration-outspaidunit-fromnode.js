// ═══════════════════════════════════════════════════════════════════════════
// Migration (รันครั้งเดียว): แก้ OutsourcePaidUnit.nodeID จาก toNode(เก่า) → fromNode(ถูก)
//
// เหตุผล: computeStageUnits เดิมใช้ productionNode.toNode ทำให้ชื่อ stage เลื่อน +1
//   (เช่นเก็บ 4.MENDING ทั้งที่ทำจริงคือ 3.LINKING). แก้โค้ดเป็น fromNode แล้ว →
//   ledger กันจ่ายซ้ำ (OutsourcePaidUnit) ที่จ่ายไป "ก่อนแก้" ยังเก็บ nodeID แบบเก่า
//   migration นี้แปลงให้ตรง (ไม่งั้นบิลเก่าที่จ่ายแล้วอาจกลับมา billable เพราะ nodeID ไม่ match)
//
// วิธีทำงาน: ต่อ 1 bundle → หา OrderProduction 1 doc → สร้าง map {toNode → fromNode}
//   ของ node outsource (isOutsource + status normal + factoryID ตรง) แล้วแปลง nodeID ของ unit
//   - แปลงเฉพาะ node ที่ทั้ง toNode และ fromNode เป็น stage จริง (กันเคสขอบ starterNode)
//
// วิธีรัน (บน server ที่มี .env ของ backend — ต้องมี MGUSER/MGPWD/MGSVR1/MGDB):
//   วางไฟล์นี้ไว้ที่โฟลเดอร์เดียวกับ models/ (เช่น controllers/user/ หรือ root ที่ require ./models ได้)
//   *** ปรับ path ./models ให้ถูกตามที่วางไฟล์ ***
//   1) ทดลอง (ไม่เขียนจริง — ดูก่อน):  node migration-outspaidunit-fromnode.js
//   2) เขียนจริง:                      node migration-outspaidunit-fromnode.js --apply
//   เสร็จแล้วลบไฟล์นี้ทิ้งได้
// ═══════════════════════════════════════════════════════════════════════════
require('dotenv').config();
const mongoose = require('mongoose');
const OutsourcePaidUnit = require('./models/m-outsource-paid-unit');
const OrderProduction   = require('./models/m-orderProduction');

const APPLY = process.argv.includes('--apply');
const STAGE = ['1.COMPUTER-KNITTING', '2.PANAL-INSPECTION', '3.LINKING', '4.MENDING', '5.WASHING', '6.PRESSING', '7.QC'];

async function main() {
    await mongoose.connect(
        `mongodb+srv://${process.env.MGUSER}:${process.env.MGPWD}${process.env.MGSVR1}/${process.env.MGDB}` +
        `?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log(`[migration] connected · mode = ${APPLY ? 'APPLY (เขียนจริง)' : 'DRY-RUN (ทดลอง ไม่เขียน)'}`);

    const units = await OutsourcePaidUnit.find({}).lean();
    console.log(`[migration] OutsourcePaidUnit ทั้งหมด: ${units.length}`);

    // group ต่อ bundle → query OrderProduction ครั้งเดียวต่อ bundle
    const groups = new Map();
    for (const u of units) {
        const k = `${u.companyID}|${u.orderID}|${u.bundleNo}|${u.outsourceFactoryID}`;
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(u);
    }
    console.log(`[migration] bundle-group: ${groups.size}`);

    let updated = 0, same = 0, noMap = 0, noDoc = 0, conflict = 0;
    const preview = [];

    for (const [k, us] of groups) {
        const [companyID, orderID, bundleNo, outsFacID] = k.split('|');
        const doc = await OrderProduction.findOne(
            { companyID, orderID, bundleNo: Number(bundleNo) },
            { productionNode: 1 }
        ).lean();
        if (!doc) { noDoc += us.length; continue; }

        // map: toNode(เก่า) → fromNode(ใหม่) เฉพาะ node outsource ของโรงนี้ ที่เป็น stage จริงทั้งคู่
        const map = {};
        for (const n of (doc.productionNode || [])) {
            if (n.isOutsource && n.status === 'normal' && n.factoryID === outsFacID
                && STAGE.includes(n.toNode) && STAGE.includes(n.fromNode)) {
                map[n.toNode] = n.fromNode;
            }
        }
        for (const u of us) {
            const nn = map[u.nodeID];
            if (!nn)             { noMap++; continue; }   // ไม่มี map (เคสขอบ) — ข้าม ไม่แตะ
            if (nn === u.nodeID) { same++;  continue; }   // ตรงอยู่แล้ว
            if (preview.length < 20) preview.push(`  ${orderID}/bundle ${bundleNo}: ${u.nodeID} → ${nn}`);
            if (APPLY) {
                try { await OutsourcePaidUnit.updateOne({ _id: u._id }, { $set: { nodeID: nn } }); updated++; }
                catch (e) { conflict++; console.error(`  conflict _id=${u._id}: ${e.message}`); }
            } else { updated++; }
        }
    }

    console.log('\n[migration] ตัวอย่างที่จะเปลี่ยน (สูงสุด 20):');
    preview.forEach(p => console.log(p));
    console.log(`\n[migration] สรุป: ${APPLY ? 'เปลี่ยนแล้ว' : 'จะเปลี่ยน'}=${updated} · ตรงอยู่แล้ว=${same} · ไม่มี map=${noMap} · ไม่พบ OrderProduction=${noDoc} · ชนกัน=${conflict}`);
    if (!APPLY) console.log('[migration] ★ นี่คือ DRY-RUN — ยังไม่เขียนจริง · ตรวจตัวอย่างแล้วรันซ้ำด้วย  --apply');

    await mongoose.disconnect();
    console.log('[migration] done.');
}
main().catch(e => { console.error(e); process.exit(1); });
