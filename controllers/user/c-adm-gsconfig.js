/**
 * c-adm-gsconfig.js — Node.js Controller Reference
 * วางที่: controllers/user/c-adm-gsconfig.js
 *
 * Collection: gsconfig
 * Role: admin only (เช็คใน middleware)
 */

const Gsconfig = require('../../models/m-gsconfig');
const factoryAuth = require('../../middleware/check-authFactory');   // เช็คสิทธิ์โรงงาน route แบบ B

// ── Default configs ที่ระบบต้องการ ───────────────────────────────────────────
// seed ครั้งแรก หรือเมื่อ factory ใหม่ยังไม่มี config
const DEFAULT_CONFIGS = [
    // Accounting
    { module: 'accounting', key: 'WP_AUTO_INCOME_CODE',    value: '',       label: 'รหัสบัญชีค่าแรงเหมา-Auto',       dataType: 'string', levelHint: 'Level 3', description: 'รหัสบัญชีที่ใช้บันทึกค่าแรงเหมาอัตโนมัติ เช่น 590101' },
    { module: 'accounting', key: 'WP_MANUAL_PIECE_CODE',   value: '',       label: 'รหัสบัญชีค่าแรงเหมา-ลงเอง',      dataType: 'string', levelHint: 'Level 3', description: 'รหัสบัญชีค่าแรงเหมาที่ลงเอง (กรณีสแกนไม่ติด) เช่น 590102 — แต่ละโรงงานตั้งเองได้' },
    { module: 'accounting', key: 'WP_ALL_LABOR_CODE',         value: '59030001', label: 'รหัสบัญชีค่าแรง-เหมาทั้งหมด',    dataType: 'string', levelHint: 'Level 3', description: 'รหัสบัญชีค่าแรงเหมารวมทั้งหมด เช่น 59030001' },
    { module: 'accounting', key: 'WP_ALL_LABOR_DAILY_CODE',   value: '59030002', label: 'รหัสบัญชีค่าแรง-รายวันทั้งหมด',  dataType: 'string', levelHint: 'Level 3', description: 'รหัสบัญชีค่าแรงรายวันรวมทั้งหมด เช่น 59030002' },
    { module: 'accounting', key: 'WP_ALL_LABOR_MONTHLY_CODE', value: '59030003', label: 'รหัสบัญชีค่าแรง-รายเดือนทั้งหมด', dataType: 'string', levelHint: 'Level 3', description: 'รหัสบัญชีค่าแรงรายเดือนรวมทั้งหมด เช่น 59030003' },
    { module: 'accounting', key: 'WP_DAILY_INCOME_CODE',   value: '59010004', label: 'รหัสบัญชีค่าแรงรายวัน',          dataType: 'string', levelHint: 'Level 3', description: 'บัญชีค่าแรงรายวัน (auto จากสแกน วัน×อัตรา) เช่น 59010004' },
    { module: 'accounting', key: 'WP_DAILY_OT_CODE',       value: '59010003', label: 'รหัสบัญชีค่าแรงรายวัน-OT',       dataType: 'string', levelHint: 'Level 3', description: 'บัญชี OT รายวัน (auto จากสแกน) เช่น 59010003 รายวัน-รายชั่วโมง' },
    { module: 'accounting', key: 'WAGE_OT_DIVISOR',        value: '11',       label: 'ตัวหารหาเรตชั่วโมง (OT)',        dataType: 'number', levelHint: '',        description: 'อัตรารายวัน ÷ ค่านี้ = เรตต่อชั่วโมง (ปัดขึ้นทีละ 0.5) เช่น 11' },
    { module: 'accounting', key: 'WAGE_OT_RATE',           value: '1',        label: 'ตัวคูณ OT',                     dataType: 'number', levelHint: '',        description: 'ตัวคูณเงิน OT: 1 = เท่าชั่วโมงปกติ, 1.5 = OT 1.5 เท่า' },
    { module: 'accounting', key: 'WP_INCOME_PARENT_CODE',  value: '5901',   label: 'หมวดบัญชีรายรับค่าแรง',   dataType: 'string', levelHint: 'Level 2', description: 'รหัส Level 2 ของหมวดรายรับ เช่น 5901' },
    { module: 'accounting', key: 'WP_DEDUCT_PARENT_CODE',  value: '5902',   label: 'หมวดบัญชีรายหักค่าแรง',   dataType: 'string', levelHint: 'Level 2', description: 'รหัส Level 2 ของหมวดรายหัก เช่น 5902' },
    { module: 'accounting', key: 'ACC_DEFAULT_CURRENCY', value: 'THB',  label: 'สกุลเงินหลัก',                 dataType: 'string', levelHint: '',        description: 'THB, USD, JPY ฯลฯ' },
    { module: 'accounting', key: 'SEASON_LIST', value: '2024SS,2024AW,2025SS,2025AW,2026SS,2026AW,2027SS', label: 'Season (ที่เกิดขึ้นแล้ว)', dataType: 'string', levelHint: '', description: 'รายชื่อ season ที่มีแล้ว คั่นด้วย comma เช่น 2026SS,2026AW (เพิ่มได้เอง)' },
    { module: 'accounting', key: 'SEASON_ACTIVE', value: '2026AW,2027SS', label: 'Season ที่กำลังผลิต (active)', dataType: 'string', levelHint: '', description: 'เฉพาะ season ที่กำลังผลิตอยู่ ใช้ตอนลงค่าแรงเหมาเอง (ไม่ต้องโชว์ย้อนหลังหมด) คั่นด้วย comma เช่น 2026AW,2027SS' },
    // Outsource Cost — stage ที่นับได้ + ตำแหน่ง substr บน productBarcodeNoReal (verify กับ .env จริงก่อนใช้ production)
    { module: 'accounting', key: 'OUTS_STAGE_NODES', value: '1.COMPUTER-KNITTING,2.PANAL-INSPECTION,3.LINKING,4.MENDING,5.WASHING,6.PRESSING,7.QC', label: 'Stage ที่คิดต้นทุน outsource', dataType: 'string', levelHint: '', description: 'toNode ที่นับเป็น stage จริง (เว้น starterNode/completeNode/outsource) คั่นด้วย comma' },
    { module: 'accounting', key: 'BARCODE_TARGET_POS',   value: '12', label: 'barcode: ตำแหน่ง targetPlace', dataType: 'number', levelHint: '', description: 'substr pos ของ targetPlaceID บน productBarcodeNoReal (ตัวอย่าง=12)' },
    { module: 'accounting', key: 'BARCODE_TARGET_DIGIT', value: '4',  label: 'barcode: ความยาว targetPlace', dataType: 'number', levelHint: '', description: 'substr digit ของ targetPlaceID (ตัวอย่าง=4 เช่น JAPN/SGHI/ASIA)' },
    { module: 'accounting', key: 'BARCODE_COLOR_POS',    value: '23', label: 'barcode: ตำแหน่ง color', dataType: 'number', levelHint: '', description: 'substr pos ของ color บน barcode (.env จริง=23)' },
    { module: 'accounting', key: 'BARCODE_COLOR_DIGIT',  value: '10', label: 'barcode: ความยาว color', dataType: 'number', levelHint: '', description: 'substr digit ของ color (.env จริง=10 · ตัด - ท้ายออก)' },
    { module: 'accounting', key: 'BARCODE_SIZE_POS',     value: '33', label: 'barcode: ตำแหน่ง size', dataType: 'number', levelHint: '', description: 'substr pos ของ size บน barcode (.env จริง=33) — ตัด - ท้ายออก' },
    { module: 'accounting', key: 'BARCODE_SIZE_DIGIT',   value: '3',  label: 'barcode: ความยาว size', dataType: 'number', levelHint: '', description: 'substr digit ของ size (.env จริง=3 เช่น XS-/L--)' },
    // Outsource — บัญชีที่ผูกตอนจ่ายจริง (auto ลงรายวัน)
    { module: 'accounting', key: 'OUTS_PAY_CHART_CODE',  value: '5201001', label: 'บัญชีจ่าย Outsource (รายวัน auto)', dataType: 'string', levelHint: '', description: 'chartAccCode ที่ใช้ลงรายวันเมื่อจ่ายค่า outsource จริง (เช่น 5201001 ค่า Outsource) — แก้ได้' },
    // HR
    { module: 'hr', key: 'HR_DEPARTMENTS',   value: 'ทอคอม,ปั่นด้าย,พ้ง,ตรวจทอ,เกี่ยวสอย,ซัก,ปะผ้า,ตรวจผ้า-แพ็คQC,ติดตรา,วัดผ้า,แพ็คกิ้ง,แม่บ้าน,กรรมกร,พม่ารายเดือน', label: 'แผนก worker (กลุ่มใหญ่ = tab payroll)', dataType: 'string', levelHint: '', description: 'รายชื่อแผนก (กลุ่มใหญ่) คั่นด้วย comma — ตรงกับ tab ในไฟล์ payroll (เพิ่ม/ลบได้เอง)' },
    { module: 'hr', key: 'HR_POSITIONS',     value: 'ทอผ้า,ดึงจี่เบ้,ผู้ช่วยทอ,เสมียนทอ,หัวหน้าทอ,สแกนงาน,ปั่นด้าย,ผู้ช่วยปั่นด้าย,เสมียนปั่นด้าย,ช่างพัง,ผู้ช่วยโพ้ง,ซ่อมผ้าโพ้ง,เสมียนโพ้ง,เกี่ยวสอย,ตรวจผ้าแผ่น,ตรวจผ้าทอ,ติดตรา,วัดผ้า,แพ็คกิ้ง,แม่บ้าน,กรรมกร,ปะผ้า,ช่างทำตัวอย่าง', label: 'ตำแหน่ง worker (หน้าที่ในแผนก)', dataType: 'string', levelHint: '', description: 'รายชื่อตำแหน่ง/หน้าที่ คั่นด้วย comma เช่น ทอผ้า,ดึงจี่เบ้,หัวหน้าทอ (เพิ่ม/ลบได้เอง)' },
    { module: 'hr', key: 'HR_NATIONALITIES', value: 'ไทย,พม่า,กัมพูชา,ลาว,เวียดนาม,อื่นๆ',      label: 'สัญชาติ worker', dataType: 'string', levelHint: '', description: 'รายชื่อสัญชาติ คั่นด้วย comma' },
    { module: 'hr', key: 'HR_SOCIAL_SEC_RATE',     value: '5',   label: 'อัตราประกันสังคม (%)',        dataType: 'number', levelHint: '', description: 'default 5% ตามกฎหมาย' },
    { module: 'hr', key: 'HR_WORK_DAYS_PER_MONTH', value: '26',  label: 'วันทำงานต่อเดือน (default)', dataType: 'number', levelHint: '', description: 'ใช้คำนวณเงินเดือนรายวัน' },
    { module: 'hr', key: 'HR_OT_RATE_MULTIPLIER',  value: '1.5', label: 'ตัวคูณค่า OT',               dataType: 'number', levelHint: '', description: 'ปกติ 1.5x หรือ 2x' },
    // Finger Scan (Worker Finger Scan) — ปรับได้ต่องวด/เดือน
    { module: 'hr', key: 'FS_OT_START_TIME',  value: '21:00', label: 'เวลาเริ่มนับ OT', dataType: 'string', levelHint: '', description: 'สแกนออกหลังเวลานี้ = OT (= เวลาเลิกกะปกติ เช่น 21:00 · ปรับได้ต่องวด/เดือน) — รูปแบบ HH:mm' },
    { module: 'hr', key: 'FS_LATE_GRACE_MIN', value: '15',    label: 'ผ่อนผันเข้าสาย (นาที)', dataType: 'number', levelHint: '', description: 'เข้าสายไม่เกินกี่นาทีถือว่าทันช่วงนั้น (เกินกว่านี้ทำสีเข้มให้ HR ดู) เช่น 15' },
    { module: 'hr', key: 'FS_SHIFT_BLOCKS',   value: '08:00-12:00,13:00-17:00,18:00-21:00', label: 'ช่วงเวลาทำงานปกติ', dataType: 'string', levelHint: '', description: 'ช่วงเวลาปกติ (เข้า-ออก) คั่นด้วย comma เช่น 08:00-12:00,13:00-17:00,18:00-21:00 — ใช้เช็คสาย/ออกก่อน' },
    // Reports
    { module: 'reports', key: 'WP_EXCLUDE_ACC_CODES', value: '', label: 'รหัสบัญชีที่ยกเว้นในรายงาน รายวัน', dataType: 'string', levelHint: 'Level 2', description: 'บัญชีค่าแรง worker ที่ยกเว้นในบัญชีรายวัน (ทั้ง Level 2 → Level 3 ที่อยู่ใต้) — คั่นด้วย comma เช่น 5901,5902' },
    { module: 'reports', key: 'WP_SLIP_EXCLUDE_ACC_CODES', value: '59010001,59010002', label: 'บัญชียกเว้นในสลิปค่าแรงเหมา', dataType: 'string', levelHint: 'Level 3', description: 'รหัสบัญชีค่าแรงเหมา (auto/manual) ที่แสดงรายละเอียดในสลิป (①) แล้ว → ตัดออกจาก "รายได้อื่น" (②) กันนับซ้ำ · คั่นด้วย comma เช่น 59010001,59010002 · ไม่ตัดรายวัน/รายเดือน' },
    { module: 'reports', key: 'WP_SLIP_REPORT_VER', value: 'ver1', options: 'ver1,ver2,ver3', label: 'เวอร์ชันรายงานสลิปค่าแรงเหมา', dataType: 'select', levelHint: '', description: 'เลือกหน้าตา (เวอร์ชัน) ของสลิปค่าแรงเหมา — แต่ละโรงงานเลือกเองได้ · ตอนนี้ใช้งานได้ ver1 · ver2/ver3 กำลังพัฒนา' },
    { module: 'reports', key: 'RPT_FOOTER_NOTE',      value: '', label: 'หมายเหตุท้ายรายงาน',         dataType: 'string', levelHint: '',        description: 'ข้อความที่แสดงด้านล่างรายงาน' },
    { module: 'reports', key: 'RPT_COMPANY_HEADER',   value: '', label: 'ชื่อบริษัทบนหัวรายงาน',     dataType: 'string', levelHint: '',        description: 'ถ้าว่างจะใช้ชื่อบริษัทในระบบ' },
    // System (Admin > Monitor ฯลฯ)
    { module: 'system', key: 'MONITOR_ONLINE_MINUTES', value: '3', label: 'Monitor: ถือว่าออนไลน์กี่นาที', dataType: 'number', levelHint: '', description: 'หน้า Admin > Monitor: ถ้าไม่มี activity เกินกี่นาที ให้เปลี่ยนจาก "ออนไลน์" เป็น "ไม่ใช้งาน" (default 3 นาที) — เพิ่มค่าถ้าอยากให้ค้างสถานะออนไลน์นานขึ้น' },
    { module: 'system', key: 'SESSION_TAKEOVER_MINUTES', value: '5', label: 'ป้องกัน login ซ้อน: เงียบกี่นาทีให้เข้าแทนได้เลย', dataType: 'number', levelHint: '', description: 'ถ้ามีคน login user นี้อยู่ที่เครื่องอื่น จะเข้าไม่ได้ (ต้องกด "เข้าใช้แทน") · แต่ถ้าเครื่องเก่าเงียบเกินค่านี้ ถือว่าหลุดแล้ว เข้าใหม่ได้เลยไม่ต้องกด (default 5 นาที · กันล็อกตัวเอง)' },
    { module: 'system', key: 'APP_VERSION', value: '1', label: 'เวอร์ชันแอป (เปลี่ยนเพื่อบังคับ reload)', dataType: 'string', levelHint: '', description: 'ทุกครั้งที่ deploy Angular ใหม่ ให้เปลี่ยนค่านี้ (ใส่เลข/วันที่อะไรก็ได้ ขอแค่ไม่ซ้ำเดิม เช่น 2 หรือ 2026-07-12) → เครื่องที่เปิดแอปค้างอยู่จะเด้งเตือน + reload เอาเวอร์ชันใหม่ ภายใน ~2 นาที' },
];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/a/gsconfig/all/:companyID/:factoryID
// ดึง config ทั้งหมดของ factory — เรียกตอน login / factory select
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllConfigs = async (req, res) => {
    try {
        const { companyID, factoryID } = req.params;

        // seed ทุกครั้ง — $setOnInsert ไม่ทับค่าที่ user บันทึกไว้
        // key ใหม่จะถูกเพิ่มอัตโนมัติ ไม่ต้อง drop collection
        const configs = await seedDefaults(companyID, factoryID, '');

        return res.json({ success: true, configs });
    } catch (err) {
        console.error('[getAllConfigs]', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/a/gsconfig/update
// แก้ไข value ของ config 1 รายการ
// ─────────────────────────────────────────────────────────────────────────────
exports.updateConfig = async (req, res) => {
    try {
        const { configID, value, comment, updatedBy } = req.body;
        if (!configID) return res.status(400).json({ success: false, message: 'configID required' });

        // ## เช็คสิทธิ์โรงงานของ config นี้ก่อนแก้ (route แบบ B — config ผูกกับ factory)
        const rec = await factoryAuth.assertRecord(req, res, Gsconfig, { configID });
        if (!rec) return;

        const updated = await Gsconfig.findOneAndUpdate(
            { configID },
            { value, comment: comment ?? '', updatedAt: new Date(), updatedBy: updatedBy || '' },
            { new: true }
        ).lean();

        if (!updated) return res.status(404).json({ success: false, message: 'config not found' });

        return res.json({ success: true, config: updated });
    } catch (err) {
        console.error('[updateConfig]', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/a/gsconfig/reorder
// จัดลำดับแถว config เอง (ต่อ module/tab) — บันทึก seq ตามลำดับที่ admin จัด
// body: { factoryID, module, orderedKeys: [key1, key2, ...] }  (เรียงตามที่ต้องการ)
// ─────────────────────────────────────────────────────────────────────────────
exports.reorderConfigs = async (req, res) => {
    try {
        const { factoryID, module, orderedKeys } = req.body;
        if (!factoryID || !module || !Array.isArray(orderedKeys)) {
            return res.status(400).json({ success: false, message: 'factoryID, module, orderedKeys required' });
        }
        // ## เช็คสิทธิ์โรงงานก่อนแก้
        if (!(await factoryAuth.verify(req.userData?.tokenSet?.userID, factoryID))) {
            return res.status(403).json({ success: false, message: 'no factory permission' });
        }
        // ## เขียน seq = ลำดับที่จัด (ต่อ module) · แถวไม่อยู่ในลิสต์ไม่แตะ
        const ops = orderedKeys.map((key, i) => ({
            updateOne: {
                filter: { configID: `${factoryID}-${module}-${key}` },
                update: { $set: { seq: i } },
            },
        }));
        if (ops.length) await Gsconfig.bulkWrite(ops);
        return res.json({ success: true });
    } catch (err) {
        console.error('[reorderConfigs]', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/a/gsconfig/seed
// seed default configs สำหรับ factory ที่ยังไม่มี (เรียกใช้เองก็ได้)
// ─────────────────────────────────────────────────────────────────────────────
exports.seedConfigs = async (req, res) => {
    try {
        const { companyID, factoryID, updatedBy } = req.body;
        if (!companyID || !factoryID) return res.status(400).json({ success: false, message: 'companyID, factoryID required' });

        const configs = await seedDefaults(companyID, factoryID, updatedBy || '');
        return res.json({ success: true, configs });
    } catch (err) {
        console.error('[seedConfigs]', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── helper ────────────────────────────────────────────────────────────────────
async function seedDefaults(companyID, factoryID, updatedBy) {
    const docs = DEFAULT_CONFIGS.map(c => ({
        configID:    `${factoryID}-${c.module}-${c.key}`,
        companyID,
        factoryID,
        module:      c.module,
        key:         c.key,
        value:       c.value,
        label:       c.label,
        description: c.description,
        levelHint:   c.levelHint || '',
        dataType:    c.dataType,
        options:     c.options || '',   // สำหรับ dataType='select'
        updatedAt:   new Date(),
        updatedBy,
    }));

    // upsert ทีละ record
    // - $setOnInsert: value → ไม่ทับค่าที่ user บันทึกไว้แล้ว
    // - $set: label/description/levelHint → update metadata เสมอ (เผื่อแก้ DEFAULT_CONFIGS)
    for (const doc of docs) {
        await Gsconfig.updateOne(
            { configID: doc.configID },
            {
                $setOnInsert: { configID: doc.configID, companyID, factoryID, module: doc.module, key: doc.key, value: doc.value, comment: '' },
                $set: { label: doc.label, description: doc.description, levelHint: doc.levelHint, dataType: doc.dataType, options: doc.options },
            },
            { upsert: true }
        );
    }

    // ## auto-heal ลบแถวซ้ำ (orphan): doc ที่ key รู้จัก แต่ configID ไม่ตรง canonical `${factoryID}-${module}-${key}`
    // ## (เกิดจาก seed script เก่าสร้าง configID คนละ format → แถวซ้ำ เช่น HR_POSITIONS 2 แถว) · ตัว canonical เก็บไว้
    const validIDs  = DEFAULT_CONFIGS.map(c => `${factoryID}-${c.module}-${c.key}`);
    const knownKeys = DEFAULT_CONFIGS.map(c => c.key);
    await Gsconfig.deleteMany({ companyID, factoryID, key: { $in: knownKeys }, configID: { $nin: validIDs } });

    // ## เรียงลำดับแถว: ใช้ seq ที่ admin จัดเอง (ถ้ามี) ก่อน · ไม่มี → ใช้ลำดับใน DEFAULT_CONFIGS (code)
    // ## → แถวเพิ่มใหม่ไม่ตกไปท้ายสุด + ลำดับที่ admin จัดเองถูกจำไว้
    const orderMap = new Map(DEFAULT_CONFIGS.map((c, i) => [c.key, i]));
    const rank = (c) => (c.seq != null ? c.seq : (orderMap.get(c.key) ?? 9999));
    const found = await Gsconfig.find({ companyID, factoryID }).lean();
    found.sort((a, b) => rank(a) - rank(b));
    return found;
}
