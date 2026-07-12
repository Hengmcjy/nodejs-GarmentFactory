const Useracc = require('../models/m-acc-user');   // model Useracc (ชื่อไฟล์จริง = m-acc-user)

// ═══════════════════════════════════════════════════════════════════════════
// check-authFactory — ตรวจสิทธิ์ "โรงงาน" ก่อนเขียน/แก้/ลบ ข้อมูลที่ผูกกับโรงงาน
//
// requirement (โมเดลหุ้นส่วนแยกโรงงาน):
//   user เขียนข้อมูลได้เฉพาะโรงงานที่ตัวเอง "joined" (uFactory[].state === 'joined')
//   frontend ซ่อน tab ได้แค่ตาเห็น — กัน request ที่ยิงตรงไม่ได้ → ต้องเช็คที่ server
//
// การทำงาน:
//   - หา factoryID จาก req.params.factoryID ก่อน ไม่มีค่อยดู req.body.factoryID
//   - ★ ถ้า request ไม่มี factoryID เลย (route แบบ B ที่รับแค่ ID) → ปล่อยผ่าน (next)
//       เพื่อไม่ให้ route พัง — route แบบนั้นให้เช็คใน controller ด้วย verify() แทน
//   - ถ้ามี factoryID → lookup uFactory ของ user เทียบว่า joined ไหม ไม่ผ่าน = 403
//
// วางต่อจาก checkAuthA (ต้องมี req.userData.tokenSet.userID ก่อน)
// ═══════════════════════════════════════════════════════════════════════════

// helper: เช็คว่า user มีสิทธิ์ในโรงงานนี้ไหม (ใช้ซ้ำใน controller สำหรับ route แบบ B)
async function verifyFactoryAuth(userID, factoryID) {
    if (!userID || !factoryID) return false;
    const user = await Useracc.findOne({ userID }, { uFactory: 1, _id: 0 }).lean();
    return (user?.uFactory || []).some(f => f.factoryID === factoryID && f.state === 'joined');
}

const middleware = async (req, res, next) => {
    try {
        // เฟส 1: บังคับเฉพาะ write (POST/PUT/DELETE) — read (GET) ปล่อยผ่าน
        //   (read มี frontend guard + backend filter factoryID อยู่แล้ว; เปิด read ทีหลังได้ถ้าต้องการ)
        if (req.method === 'GET') return next();

        const userID    = req.userData?.tokenSet?.userID;
        const factoryID = req.params?.factoryID || req.body?.factoryID;

        // route แบบ B (ไม่ส่ง factoryID มา) → ปล่อยผ่าน (controller เช็คเองด้วย verify())
        if (!factoryID) return next();

        if (!userID) return res.status(401).json({ success: false, message: 'unauthorized' });

        const ok = await verifyFactoryAuth(userID, factoryID);
        if (!ok) {
            console.log(`[checkAuthFactory] DENY user=${userID} factory=${factoryID} ${req.method} ${req.originalUrl}`);
            return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
        }
        next();
    } catch (err) {
        console.error('[checkAuthFactory]', err.message);
        return res.status(500).json({ success: false, message: 'factory auth error' });
    }
};

// helper สำหรับ route แบบ B (update/delete by ID ที่ไม่มี factoryID ใน request):
//   โหลด record ด้วย query → เช็คสิทธิ์โรงงานของ record → ถ้าไม่ผ่าน ส่ง response เอง แล้วคืน null
//   วิธีใช้ใน controller:  const rec = await factoryAuth.assertRecord(req, res, Model, { itemID }); if (!rec) return;
async function assertRecord(req, res, Model, query) {
    const rec = await Model.findOne(query).lean();
    if (!rec) { res.status(404).json({ success: false, message: 'ไม่พบข้อมูล' }); return null; }
    const userID = req.userData?.tokenSet?.userID;
    if (!(await verifyFactoryAuth(userID, rec.factoryID))) {
        console.log(`[checkAuthFactory] DENY(record) user=${userID} factory=${rec.factoryID} ${req.method} ${req.originalUrl}`);
        res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ในโรงงานนี้' });
        return null;
    }
    return rec;
}

module.exports = middleware;
module.exports.verify = verifyFactoryAuth;       // เช็คตรงๆ (userID, factoryID) → boolean
module.exports.assertRecord = assertRecord;      // โหลด record + เช็ค + ส่ง 403/404 ให้เลย
