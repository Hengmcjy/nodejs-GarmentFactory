// Requirement: รายงาน no.11 — Node Bundle (ความคืบหน้า % ระดับชิ้น/มัด)  [clean stack ใต้ /api/a/report]
//   ต้นแบบ s-rep-fac-node-bundle (แอปเดิม angularGarment) · เลือก node + order (+ โรงงาน) → ดูว่าแต่ละชิ้น
//   (เลขวิ่ง 5 หลัก) ตอนนี้อยู่ node ไหน · ชิ้นที่ toNode == node ที่เลือก = อยู่ node นี้ (frontend ระบายดำ)
//   ชิ้นที่ toNode != node = เลยไปอยู่ node อื่นแล้ว (frontend ระบายเทา + label เหลืองบอก node ปัจจุบัน)
// ★ node ปัจจุบันของชิ้น = productionNode ตัวสุดท้าย (.toNode) ด้วย $arrayElemAt -1 — ตรงกับ repOverviewNode / repWip
//   ใน c-report2.js (ใช้ -1 เหมือนกัน) และตรงกับ ShareFunc.getRepCFNCurrentMainDataBundleNoscan* เดิม (optimized ใช้ lastNode)
// ★ แยกไฟล์ controller ใหม่ (ไม่แตะ c-report2.js/c-report.js เดิม) ชี้ collection เดิม · mount ใน r-report2.js
const OrderProduction = require("../../models/m-orderProduction");
const Order = require("../../models/m-order");
const Size = require("../../models/m-size");
const Factory = require("../../models/m-factory");     // ## resolve ชื่อโรง (product flow)
const NodeFlow = require("../../models/m-nodeFlow");    // ## flow nodes สำหรับ dots (product flow)
const Useracc = require("../../models/m-acc-user");   // ## perm check + ชื่อคนทำ (set QC to complete)
const ReprintRequest = require("../../models/m-reprint-request");   // ## ใบขอ reprint QR (office→worker)
const ShareFunc = require("../c-api-app-share-function");
const { writeLog } = require("./c-log-util");           // ## audit log (swallow error เสมอ)

// productStatus ที่นับ (ตรงกับ statusArr เดิมของ getRepNodeNoScan* = ['normal','complete'])
const STATUS_ARR = ['normal', 'complete'];

// Requirement: uppercase + ตัด '-' ท้าย ให้ index/detail ได้ key ตรงกันเป๊ะ (จาก productBarcodeNoReal)
//   ใช้ทั้ง 2 endpoint → group/match ด้วยค่าที่คำนวณแบบเดียวกัน (zone/color/size จาก substr ตาม .env)
function barcodeKeyProj() {
  return {
    _zone:  { $rtrim: { input: { $toUpper: { $substr: ["$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit] } }, chars: "-" } },
    _color: { $rtrim: { input: { $toUpper: { $substr: ["$productBarcodeNoReal", +process.env.colorPos,    +process.env.colorDigit   ] } }, chars: "-" } },
    _size:  { $rtrim: { input: { $toUpper: { $substr: ["$productBarcodeNoReal", +process.env.sizePos,      +process.env.sizeDigit    ] } }, chars: "-" } },
  };
}

// helper: normalize key ฝั่ง JS (uppercase + ตัด '-' ท้าย) ให้ match กับที่ mongo คำนวณ
const keyU = (s) => String(s == null ? '' : s).replace(/-+$/, '').toUpperCase().trim();

// Requirement: index — คืน combo zone/color/size ที่ "มีชิ้นอยู่ node ที่เลือกตอนนี้" (+ ชื่อสำหรับแสดงผล)
//   frontend เอาไปสร้างแถบเลือก Zone / Color / Size (segmented)
//   factoryID = '*' → ทุกโรง · อื่น → เฉพาะโรงนั้น (เทียบ lastNode.factoryID = โรงที่ทำ node ปัจจุบัน)
// GET /api/a/report/node-bundle/index/:companyID/:orderID/:nodeID/:factoryID
exports.repNodeBundleIndex = async (req, res, next) => {
  const companyID = String(req.params.companyID).trim();
  const orderID   = String(req.params.orderID).trim();
  const nodeID    = String(req.params.nodeID).trim();
  const factoryID = String(req.params.factoryID).trim();   // '*' = ทุกโรง
  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    // ── $elemMatch (index-friendly) กรอง productionNode ที่ toNode = node ที่เลือก (+ factory ถ้าเจาะจง) ──
    const elem = { toNode: nodeID };
    if (factoryID !== '*') elem.factoryID = factoryID;
    const lastMatch = { "lastNode.toNode": nodeID };
    if (factoryID !== '*') lastMatch["lastNode.factoryID"] = factoryID;

    const rows = await OrderProduction.aggregate([
      { $match: { companyID, orderID, productStatus: { $in: STATUS_ARR }, productionNode: { $elemMatch: elem } } },
      { $project: { _id: 0, productBarcodeNoReal: 1, lastNode: { $arrayElemAt: ["$productionNode", -1] } } },
      { $match: lastMatch },
      { $project: { _id: 0, ...barcodeKeyProj() } },
      { $group: { _id: { zone: "$_zone", color: "$_color", size: "$_size" } } },
    ]).allowDiskUse(true);

    // ── resolve ชื่อ/ลำดับ zone-color-size จาก Order + Size master (แนวเดียวกับ repSubNodeScan) ──
    const order = await Order.findOne({ companyID, orderID }).lean();

    const zoneSeq = new Map();
    ((order && order.orderTargetPlace) || []).forEach((tp, i) => {
      const id = keyU(tp.targetPlace && tp.targetPlace.targetPlaceID);
      if (id && !zoneSeq.has(id)) zoneSeq.set(id, tp.seq != null ? tp.seq : i);
    });

    const colorInfo = new Map();
    ((order && order.orderColor) || []).forEach((c, i) => {
      const info = {
        colorID:    String((c.color && c.color.colorID)    || '').trim(),
        colorName:  String((c.color && c.color.colorName)  || '').trim(),
        colorCode:  String((c.color && c.color.colorCode)  || '').trim(),
        colorValue: String((c.color && c.color.colorValue) || '').trim(),
        seq: c.seq != null ? c.seq : i,
      };
      [info.colorID, info.colorCode, info.colorName].forEach(k => { const kk = keyU(k); if (kk) colorInfo.set(kk, info); });
    });

    const sizeDocs = await Size.find({}, { size: 1, seq: 1 }).lean();
    const sizeMap = new Map();
    (sizeDocs || []).forEach(s => {
      const id = keyU(s.size && s.size.sizeID);
      if (id) sizeMap.set(id, { name: String((s.size && s.size.sizeName) || '').trim() || id, seq: s.seq != null ? s.seq : 9999 });
    });

    const combos = rows.map(r => {
      const zone = r._id.zone, color = r._id.color, size = r._id.size;
      const ci = colorInfo.get(keyU(color));
      const sm = sizeMap.get(keyU(size));
      return {
        zone, color, size,                                   // ← key ดิบ (ส่งกลับมาใน detail)
        zoneSeq:  zoneSeq.has(keyU(zone)) ? zoneSeq.get(keyU(zone)) : 9999,
        colorId:    ci ? ci.colorID    : color,
        colorCode:  ci ? ci.colorCode  : '',
        colorName:  ci ? ci.colorName  : '',
        colorValue: ci ? ci.colorValue : '',
        colorSeq:   ci ? ci.seq        : 9999,
        sizeName:   sm ? sm.name       : size,
        sizeSeq:    sm ? sm.seq        : 9999,
      };
    });

    const firstBarcode = (order && order.productOR && order.productOR.productORInfo
      && order.productOR.productORInfo[0] && order.productOR.productORInfo[0].productBarcode) || '';
    const style = firstBarcode ? String(firstBarcode.substr(+process.env.stylePos, +process.env.styleDigit)).trim() : orderID;

    res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), orderID, nodeID, style, combos });
  } catch (err) {
    console.error('[repNodeBundleIndex]', err);
    return res.status(501).json({ success: false, message: 'error node-bundle index' });
  }
};

// Requirement: detail — คืน "ทุกชิ้น" ของมัดที่มีชิ้นอยู่ node ที่เลือก ใน combo zone/color/size
//   1) หา bundleNo ที่มีชิ้น toNode = node (ใน combo นี้)  2) ดึงทุกชิ้นในมัดพวกนั้น (ไม่ filter node → โชว์ครบ)
//   คืน pieces: [{ bundleNo, no (เลขวิ่ง 5 หลัก), toNode (node ปัจจุบัน) }] → frontend group by bundle + ระบายสี
// GET /api/a/report/node-bundle/detail/:companyID/:orderID/:nodeID/:factoryID/:zone/:color/:size
exports.repNodeBundleDetail = async (req, res, next) => {
  const companyID = String(req.params.companyID).trim();
  const orderID   = String(req.params.orderID).trim();
  const nodeID    = String(req.params.nodeID).trim();
  const factoryID = String(req.params.factoryID).trim();
  const zone  = decodeURIComponent(String(req.params.zone  || '').trim());
  const color = decodeURIComponent(String(req.params.color || '').trim());
  const size  = decodeURIComponent(String(req.params.size  || '').trim());
  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    const elem = { toNode: nodeID };
    if (factoryID !== '*') elem.factoryID = factoryID;
    const lastMatch = { "lastNode.toNode": nodeID, "_zone": zone, "_color": color, "_size": size };
    if (factoryID !== '*') lastMatch["lastNode.factoryID"] = factoryID;

    // ── STEP A: หา bundleNo ที่มีชิ้นอยู่ node นี้ ใน combo นี้ ──
    const bunRows = await OrderProduction.aggregate([
      { $match: { companyID, orderID, productStatus: { $in: STATUS_ARR }, productionNode: { $elemMatch: elem } } },
      { $project: { _id: 0, bundleNo: 1, productBarcodeNoReal: 1, lastNode: { $arrayElemAt: ["$productionNode", -1] } } },
      { $project: { _id: 0, bundleNo: 1, lastNode: 1, ...barcodeKeyProj() } },
      { $match: lastMatch },
      { $group: { _id: "$bundleNo" } },
    ]).allowDiskUse(true);
    const bundleNos = bunRows.map(r => r._id).filter(b => b != null);

    if (!bundleNos.length) {
      return res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), pieces: [] });
    }

    // ── STEP B: ทุกชิ้นในมัดพวกนั้น (โชว์ครบทุกชิ้นพร้อม node ปัจจุบัน — ไม่ filter node/factory) ──
    const pieceRows = await OrderProduction.aggregate([
      { $match: { companyID, orderID, bundleNo: { $in: bundleNos }, productStatus: { $in: STATUS_ARR } } },
      { $project: {
          _id: 0, bundleNo: 1,
          barcode: "$productBarcodeNoReal",
          no: { $toUpper: { $substr: ["$productBarcodeNoReal", +process.env.runningNoPos, +process.env.runningNoDigit] } },
          lastNode: { $arrayElemAt: ["$productionNode", -1] },
      }},
      { $group: { _id: { bundleNo: "$bundleNo", no: "$no", toNode: "$lastNode.toNode", barcode: "$barcode" } } },
      { $sort: { "_id.bundleNo": 1, "_id.no": 1 } },
    ]).allowDiskUse(true);

    // ## barcode = productBarcodeNoReal (ส่งกลับเพื่อใช้ set QC to complete ให้ตรงชิ้น)
    const pieces = pieceRows.map(r => ({ bundleNo: r._id.bundleNo, no: r._id.no, toNode: r._id.toNode || '', barcode: r._id.barcode || '' }));
    res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), pieces });
  } catch (err) {
    console.error('[repNodeBundleDetail]', err);
    return res.status(501).json({ success: false, message: 'error node-bundle detail' });
  }
};

// ## perm key สำหรับ set QC to complete (per-factory) — ต้องเพิ่มใน PERM_GROUPS (adm-office-register.ts) ด้วย
const QC_COMPLETE_PERM = 'report__node-bundle__btn__qc-complete';
const QC_NODE = '7.QC';   // ## node สุดท้าย (QC) — เฉพาะชิ้นที่อยู่ node นี้เท่านั้นถึง set complete ได้

// Requirement: set QC to complete — ดันชิ้นที่ค้างอยู่ 7.QC ให้ complete (เหมือนสแกนจริง)
//   ★ เขียนข้อมูล production: push productionNode {fromNode:'7.QC', toNode:'completeNode', status:'complete'} + productStatus:'complete'
//   ★ ปลอดภัย 3 ชั้น: (1) เช็คสิทธิ์ server-side (adm__all หรือ perm key) (2) รับเฉพาะชิ้นที่อยู่ 7.QC จริงตอนนี้ (3) audit log
//   body: { companyID, orderID, authFactoryID, barcodes:[productBarcodeNoReal...], userID, userName }
// PUT /api/a/report/node-bundle/qc-complete
exports.setQcComplete = async (req, res, next) => {
  const b = req.body || {};
  const companyID     = String(b.companyID || '').trim();
  const orderID       = String(b.orderID || '').trim();
  const authFactoryID = String(b.authFactoryID || '').trim();   // โรงที่ user เลือกอยู่ (ใช้เช็คสิทธิ์ per-factory)
  const userID        = String(b.userID || '').trim();
  const userName      = String(b.userName || '').trim();
  const barcodes      = Array.isArray(b.barcodes) ? b.barcodes.map(x => String(x).trim()).filter(Boolean) : [];
  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    if (!companyID || !orderID || !barcodes.length) {
      return res.status(400).json({ success: false, token, expiresIn: Number(process.env.TOKENExpiresIn), message: 'ข้อมูลไม่ครบ' });
    }

    // ── (1) เช็คสิทธิ์ server-side: adm__all (โรงใดก็ได้) หรือ perm key (โรงที่เลือก/โรงใดก็ได้) ──
    const actor = await Useracc.findOne({ userID }, { uiPerms: 1 }).lean();
    const uiPerms = (actor && actor.uiPerms) || {};
    const permArrs = Object.values(uiPerms);
    const isAdmin = permArrs.some(arr => (arr || []).includes('adm__all'));
    const hasKey  = (Array.isArray(uiPerms[authFactoryID]) && uiPerms[authFactoryID].includes(QC_COMPLETE_PERM))
                 || permArrs.some(arr => (arr || []).includes(QC_COMPLETE_PERM));
    if (!isAdmin && !hasKey) {
      return res.status(403).json({ success: false, token, expiresIn: Number(process.env.TOKENExpiresIn), message: 'ไม่มีสิทธิ์ set QC to complete' });
    }

    // ── (2) รับเฉพาะชิ้นที่ "อยู่ 7.QC จริงตอนนี้" (lastNode.toNode === '7.QC') — กัน complete ชิ้นที่อยู่ node อื่น ──
    const docs = await OrderProduction.aggregate([
      { $match: { companyID, orderID, productBarcodeNoReal: { $in: barcodes }, productStatus: { $in: STATUS_ARR } } },
      { $project: { _id: 0, productBarcodeNoReal: 1, lastNode: { $arrayElemAt: ["$productionNode", -1] } } },
      { $match: { "lastNode.toNode": QC_NODE } },
    ]).allowDiskUse(true);

    const eligible = docs.map(d => d.productBarcodeNoReal);
    const skipped  = barcodes.filter(bc => !eligible.includes(bc));
    if (!eligible.length) {
      return res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), updated: 0, eligible: [], skipped });
    }

    // group ตาม factory ของชิ้น (ใส่ factoryID ให้ตรงชิ้นใน node ที่ push)
    const byFac = new Map();
    docs.forEach(d => {
      const fac = (d.lastNode && d.lastNode.factoryID) || '';
      if (!byFac.has(fac)) byFac.set(fac, []);
      byFac.get(fac).push(d.productBarcodeNoReal);
    });

    // ── (3) เขียน: push completeNode + productStatus complete (เหมือน scan จริง case fromNode=node สุดท้าย) ──
    const now = new Date();
    let updated = 0;
    for (const [fac, bcs] of byFac.entries()) {
      const node = {
        factoryID: fac, fromNode: QC_NODE, toNode: 'completeNode',
        datetime: now, status: 'complete', info: 'setQCtoComplete', isTracking: true,
        createBy: { userID, userName },
      };
      const r = await OrderProduction.updateMany(
        { companyID, orderID, productBarcodeNoReal: { $in: bcs } },
        { $push: { productionNode: node }, $set: { productStatus: 'complete' } }
      );
      updated += (r.modifiedCount != null ? r.modifiedCount : (r.nModified || 0));
    }

    // audit — swallow error (ห้ามทำให้ธุรกรรมล้ม)
    try {
      await writeLog({
        module: 'production', companyID, factoryID: authFactoryID, action: 'qc-complete',
        targetType: 'production', entryID: orderID,
        summary: `set QC → complete · order ${orderID} · ${updated} ตัว`,
        meta: { orderID, count: updated, barcodes: eligible, skipped },
        userID, userName,
      });
    } catch (e) { /* ignore */ }

    res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), updated, eligible, skipped });
  } catch (err) {
    console.error('[setQcComplete]', err);
    return res.status(501).json({ success: false, message: 'error set qc complete' });
  }
};

// ## short name ของ main node (โชว์ใน dots) — fallback = ตัวหลังจุด
const NODE_SHORT = { '1.COMPUTER-KNITTING': 'KNIT', '2.PANAL-INSPECTION': 'PANEL', '3.LINKING': 'LINK', '4.MENDING': 'MEND', '5.WASHING': 'WASH', '6.PRESSING': 'PRESS', '7.QC': 'QC' };

// Requirement: Product Flow — ป้อน bundleNo / productBarcodeNo / productBarcodeNoReal → ดูเส้นทางเสื้อ
//   คืน: ทุกชิ้นในมัด (พร้อม productionNode history ต่อชิ้น) + node ปัจจุบัน + ชื่อโรงต่อ entry + flow nodes (สำหรับ dots)
//   ★ อ่านตรงจาก OrderProduction (findOne/find) — เบามาก ไม่ต้อง aggregate · resolve ชื่อโรงจาก Factory master
// GET /api/a/report/product-flow/:companyID/:code
exports.productFlow = async (req, res, next) => {
  const companyID = String(req.params.companyID || '').trim();
  // ★ FIX 2026-07-23: ห้ามตัดช่องว่างภายใน — productBarcodeNoReal/No ใน DB มี space padding ของ style จริง
  //   (เช่น "AA0VUA6A    JAPN-----26CG--------S---00004" · user verify ใน Compass แล้ว) ตัดทิ้งแล้ว query ไม่เจอตลอด
  //   trim แค่หัว-ท้าย · bundleNo (เลขล้วน) ไม่มีช่องว่างอยู่แล้ว ไม่กระทบ
  const code = String(req.params.code || '').trim();
  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    if (!companyID || !code) {
      return res.status(400).json({ success: false, token, expiresIn: Number(process.env.TOKENExpiresIn), message: 'กรุณาป้อนรหัส' });
    }

    // ── หา primary doc ──
    //   บาร์โค้ด (มี index → เร็ว): ทำเฉพาะเมื่อ "ไม่ใช่ตัวเลขล้วน" (bundleNo ล้วน ≠ บาร์โค้ด)
    //   bundleNo ล้วน: ยังไม่มี index เฉพาะ → ใช้ findOne (หยุดที่ตัวแรก) + maxTimeMS กัน hang collscan
    const isNumeric = /^\d+$/.test(code);
    let mode = '';
    let primary = null;
    try {
      if (!isNumeric) {
        // ★ FIX 2026-07-23: query บาร์โค้ดตรงๆ ไม่มี index (8M docs → multiplanner timeout)
        //   → ดึง orderID จากบาร์โค้ด (pos 0-12 = style/orderID ตาม barcode spec) แนบเข้า query
        //   ให้วิ่งบน index ของ orderID (แคบเหลือ docs ของ order เดียว) — เร็วทันที ไม่ต้องสร้าง index ใหม่
        const styleID = code.slice(0, 12).trim();
        // ★ FIX 2026-07-23: .hint() บังคับใช้ index ตรงตัว — collection มี index prefix companyID ~30 ตัว
        //   multiplanner เอาทุกตัวมาลองเลือกแผนจนเกิน maxTimeMS เอง (error: "while multiplanner was selecting best plan")
        //   index ยืนยันมีจริงจาก getIndexes(): companyID_1_orderID_1_productBarcodeNoReal_1 · companyID_1_bundleNo_1
        primary = await OrderProduction.findOne({ companyID, orderID: styleID, productBarcodeNoReal: code })
          .hint({ companyID: 1, orderID: 1, productBarcodeNoReal: 1 }).maxTimeMS(15000).lean();
        mode = 'barcodeReal';
        if (!primary) {
          // fallback เทียบ productBarcodeNo (ไม่มี index ตรง) — hint index orderID แล้วกรองใน docs ของ order เดียว
          const p = await OrderProduction.findOne({ companyID, orderID: styleID, productBarcodeNo: code })
            .hint({ companyID: 1, orderID: 1, bundleNo: 1, bundleID: 1 }).maxTimeMS(15000).lean();
          if (p) { primary = p; mode = 'barcodeNo'; }
        }
      } else {
        mode = 'bundle';
        primary = await OrderProduction.findOne({ companyID, bundleNo: +code })
          .hint({ companyID: 1, bundleNo: 1 }).maxTimeMS(20000).lean();   // ★ index มีจริง (companyID_1_bundleNo_1) — hint ให้เร็วเสถียร
      }
    } catch (qe) {
      // timeout/หา primary นานเกิน (bundleNo ไม่มี index) → แจ้ง client ให้สแกน barcode เต็มแทน
      console.error('[productFlow] find primary', qe && qe.message);
      return res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), found: false, code, slow: isNumeric });
    }

    if (!primary) {
      return res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), found: false, code });
    }

    const orderID = primary.orderID;
    const bundleNo = primary.bundleNo;
    // มัด = ทุกชิ้น orderID+bundleNo เดียวกัน (มี index {companyID,orderID,bundleNo} → เร็ว)
    const bundleDocs = await OrderProduction.find({ companyID, orderID, bundleNo }).maxTimeMS(15000).lean();

    // ── ชื่อโรงต่อ factoryID (จาก productionNode ทุก entry) ──
    const facIDs = new Set();
    bundleDocs.forEach(d => (d.productionNode || []).forEach(n => { if (n.factoryID) facIDs.add(n.factoryID); }));
    const facDocs = await Factory.find({ factoryID: { $in: [...facIDs] } }, { factoryID: 1, 'fInfo.abbreviation': 1, 'fInfo.factoryName': 1 }).lean();
    const facMap = new Map();
    (facDocs || []).forEach(f => facMap.set(f.factoryID, String((f.fInfo && (f.fInfo.abbreviation || f.fInfo.factoryName)) || f.factoryID).trim()));
    const facName = (fid) => facMap.get(fid) || fid || '';

    // ── flow nodes (main) สำหรับ dots ──
    let nodes = [];
    try {
      const flow = await NodeFlow.findOne({ companyID, flowType: 'main' }).lean();
      if (flow && Array.isArray(flow.flowSeq)) {
        nodes = flow.flowSeq.slice().sort((a, b) => String(a.seqNo).localeCompare(String(b.seqNo), undefined, { numeric: true }))
          .map(s => ({ nodeID: s.nodeID, short: NODE_SHORT[s.nodeID] || (String(s.nodeID).split('.').pop() || s.nodeID) })).filter(n => n.nodeID);
      }
    } catch (e) { /* ignore */ }
    if (!nodes.length) nodes = Object.keys(NODE_SHORT).map(k => ({ nodeID: k, short: NODE_SHORT[k] }));

    const runNo = (d) => String(d.productBarcodeNoReal || '').substr(+process.env.runningNoPos, +process.env.runningNoDigit);
    const currentOf = (d) => { const pn = d.productionNode || []; return pn.length ? (pn[pn.length - 1].toNode || '') : ''; };
    const reachedOf = (d) => [...new Set((d.productionNode || []).map(n => n.toNode).filter(Boolean))];
    const histOf = (d) => (d.productionNode || []).map((n, i) => ({
      idx: i + 1,
      fromNode: n.fromNode || '', toNode: n.toNode || '',
      datetime: n.datetime || null,
      factoryID: n.factoryID || '', factoryName: facName(n.factoryID),
      userID: (n.createBy && n.createBy.userID) || '', userName: (n.createBy && n.createBy.userName) || '',
      status: n.status || '', isOutsource: !!n.isOutsource,
    }));

    const pieces = bundleDocs.map(d => ({
      no: runNo(d),
      barcode: d.productBarcodeNoReal || '',
      currentNode: currentOf(d),
      status: d.productStatus || '',
      reached: reachedOf(d),
      history: histOf(d),
    })).sort((a, b) => (a.no > b.no ? 1 : a.no < b.no ? -1 : 0));

    // ชิ้นที่ป้อนเข้ามา (highlight เริ่มต้น)
    const sel = bundleDocs.find(d => d.productBarcodeNoReal === code)
             || (mode === 'barcodeNo' ? bundleDocs.find(d => d.productBarcodeNo === code) : null)
             || primary;
    const selectedBarcode = (sel && sel.productBarcodeNoReal) || (pieces[0] && pieces[0].barcode) || '';

    const firstBc = primary.productBarcodeNoReal || '';
    const style = firstBc ? String(firstBc.substr(+process.env.stylePos, +process.env.styleDigit)).trim() : orderID;

    res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      found: true, code, mode, orderID, bundleNo, style,
      nodes, bundleCount: pieces.length, selectedBarcode, pieces,
    });
  } catch (err) {
    console.error('[productFlow]', err);
    return res.status(501).json({ success: false, message: 'error product flow' });
  }
};

// ═══════════════════════ QR PRINT — พิมพ์ QR Code (Order > หน้า worker) ═══════════════════════
// Requirement (user 2026-07-18): เลิกวิธีเดิม (Angular export .txt → เปิด BarDrawer merge .bdw → พิมพ์)
//   แทนด้วยหน้าในแอป: worker เลือก factory→season→order → ดู log ล็อกงาน (bundleNo+ล็อตด้าย) → เลือกพิมพ์
//   1 ดวง = 1 bundle · พิมพ์เป็นกลุ่ม bundle หรือ QR เดี่ยว (เลขวิ่ง) ก็ได้ · label mapping ดู reference_barcode_positions

// helper: split yarnLotID "G:260120-24, A:51124002-2C" → { yarnG, yarnA } (ป้ายต้องการ G:/A: แยก)
function splitYarn(s) {
  const parts = String(s || '').split(',').map(x => x.trim()).filter(Boolean);
  let g = '', a = '';
  for (const p of parts) {
    const up = p.toUpperCase();
    if (!g && (up.startsWith('G:') || up.startsWith('G '))) g = p;
    else if (!a && (up.startsWith('A:') || up.startsWith('A '))) a = p;
  }
  if (!g && !a && parts.length) { g = parts[0] || ''; a = parts[1] || ''; }   // ไม่มี prefix ชัด → เดาจากตำแหน่ง
  return { yarnG: g, yarnA: a };
}

// helper: โหลด map สี(code/id/name→info) + ไซซ์(id→name/seq) + zoneSeq + style จาก Order/Size (ใช้ resolve ชื่อ)
async function loadOrderColorSize(companyID, orderID) {
  const order = await Order.findOne({ companyID, orderID }).lean();
  const colorInfo = new Map();
  ((order && order.orderColor) || []).forEach((c, i) => {
    const info = {
      colorID:    String((c.color && c.color.colorID)    || '').trim(),
      colorName:  String((c.color && c.color.colorName)  || '').trim(),
      colorCode:  String((c.color && c.color.colorCode)  || '').trim(),
      colorValue: String((c.color && c.color.colorValue) || '').trim(),
      seq: c.seq != null ? c.seq : i,
    };
    [info.colorID, info.colorCode, info.colorName].forEach(k => { const kk = keyU(k); if (kk) colorInfo.set(kk, info); });
  });
  const sizeDocs = await Size.find({}, { size: 1, seq: 1 }).lean();
  const sizeMap = new Map();
  (sizeDocs || []).forEach(s => {
    const id = keyU(s.size && s.size.sizeID);
    if (id) sizeMap.set(id, { name: String((s.size && s.size.sizeName) || '').trim() || id, seq: s.seq != null ? s.seq : 9999 });
  });
  const zoneSeq = new Map();
  ((order && order.orderTargetPlace) || []).forEach((tp, i) => {
    const id = keyU(tp.targetPlace && tp.targetPlace.targetPlaceID);
    if (id && !zoneSeq.has(id)) zoneSeq.set(id, tp.seq != null ? tp.seq : i);
  });
  const firstBarcode = (order && order.productOR && order.productOR.productORInfo
    && order.productOR.productORInfo[0] && order.productOR.productORInfo[0].productBarcode) || '';
  const style = firstBarcode ? keyU(firstBarcode.substr(+process.env.stylePos, +process.env.styleDigit)) : orderID;
  return { order, colorInfo, sizeMap, zoneSeq, style };
}

// Requirement: bundles — "log ล็อกงาน" ให้ worker เลือกพิมพ์ · ต่อ bundleNo → yarnLot + ช่วงเลขวิ่ง + สี/ไซซ์/โซน + จำนวน
//   ★ 1 bundle = 1 ล็อต · worker ดู yarnLot เลือก bundle ล็อตด้ายเดียวกัน (สั่งพิมพ์ทีเดียวต้องล็อตเดียวกันหมด — user ย้ำ)
//   factoryID='*' → ทุกโรง · อื่น → เฉพาะ bundle ที่ล็อกโดยโรงนั้น (productionNode[0].factoryID = โรงที่ล็อกงาน)
// GET /api/a/report/qr-print/bundles/:companyID/:orderID/:factoryID
exports.qrPrintBundles = async (req, res, next) => {
  const companyID = String(req.params.companyID).trim();
  const orderID   = String(req.params.orderID).trim();
  const factoryID = String(req.params.factoryID).trim();   // '*' = ทุกโรง
  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    const rows = await OrderProduction.aggregate([
      { $match: { companyID, orderID, productStatus: { $in: STATUS_ARR } } },
      { $project: {
          _id: 0, bundleNo: 1,
          firstFac:  { $arrayElemAt: ["$productionNode.factoryID", 0] },       // โรงที่ล็อกงาน (entry แรก)
          yarnLotID: { $ifNull: [{ $arrayElemAt: ["$yarnLot.yarnLotID", 0] }, ''] },
          _run:      { $substr: ["$productBarcodeNoReal", +process.env.runningNoPos, +process.env.runningNoDigit] },
          _combo:    { $substr: ["$productBarcodeNoReal", +process.env.productBarcodePos, +process.env.productBarcodeDigit] },  // 37 หลักแรก = คีย์ combo (ตรงกับ CellItem.productBarcode ในหน้าล็อกงาน)
          ...barcodeKeyProj(),
      }},
      ...(factoryID !== '*' ? [{ $match: { firstFac: factoryID } }] : []),
      { $group: {
          _id: "$bundleNo",
          count:     { $sum: 1 },
          noFrom:    { $min: "$_run" },
          noTo:      { $max: "$_run" },
          zone:      { $first: "$_zone" },
          color:     { $first: "$_color" },
          size:      { $first: "$_size" },
          comboBarcode: { $first: "$_combo" },       // คีย์ combo (สี×ไซซ์×โซน) จับคู่กับ cell ในหน้าล็อกงาน
          factoryID: { $first: "$firstFac" },
          yarnLots:  { $addToSet: "$yarnLotID" },   // ปกติ 1 ค่า/มัด · addToSet เผื่อ detect ปนล็อต
      }},
      { $sort: { _id: 1 } },
    ]).allowDiskUse(true);

    const { colorInfo, sizeMap, zoneSeq, style } = await loadOrderColorSize(companyID, orderID);

    const facSet = new Set();
    const bundles = rows.filter(r => r._id != null).map(r => {
      const ci = colorInfo.get(keyU(r.color));
      const sm = sizeMap.get(keyU(r.size));
      const yl = (r.yarnLots || []).filter(Boolean);
      const { yarnG, yarnA } = splitYarn(yl[0] || '');
      if (r.factoryID) facSet.add(r.factoryID);
      return {
        bundleNo: r._id, count: r.count,
        noFrom: r.noFrom, noTo: r.noTo,
        zone: r.zone, zoneSeq: zoneSeq.has(keyU(r.zone)) ? zoneSeq.get(keyU(r.zone)) : 9999,
        color: r.color, colorId: ci ? ci.colorID : r.color, colorName: ci ? ci.colorName : r.color,
        colorValue: ci ? ci.colorValue : '', colorSeq: ci ? ci.seq : 9999,
        size: r.size, sizeName: sm ? sm.name : r.size, sizeSeq: sm ? sm.seq : 9999,
        comboBarcode: r.comboBarcode || '',
        factoryID: r.factoryID || '',
        yarnLot: yl[0] || '', yarnG, yarnA, multiYarn: yl.length > 1,
      };
    });

    res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      orderID, style, factories: [...facSet], bundleCount: bundles.length, bundles,
    });
  } catch (err) {
    console.error('[qrPrintBundles]', err);
    return res.status(501).json({ success: false, message: 'error qr-print bundles' });
  }
};

// Requirement: data — ข้อมูลป้ายทุกชิ้นสำหรับ preview + generate .txt / command (agent) · 1 record = 1 ชิ้น = 1 ป้าย
//   input (รวมกันได้): bundleNos[] (พิมพ์ทั้งมัด) · runNos[] (QR เดี่ยว เลขวิ่ง 5 หลัก — พิมพ์ใหม่กรณี QR หาย)
//                      · barcodes[] (QR เดี่ยว แบบสแกน productBarcodeNoReal เต็ม — index-friendly)
//   ★ warnMultiYarn = true ถ้าชุดที่เลือกมี yarnLot หลายค่า (worker ควรพิมพ์ล็อตเดียว/ครั้ง — เตือน ไม่บล็อก)
//   label fields ดู reference_barcode_positions: QR=productBarcodeNoReal · runNo/zone/style/color/size จาก substr · G/A จาก yarnLot
// POST /api/a/report/qr-print/data  body:{ companyID, orderID, bundleNos[], runNos[], barcodes[], factoryID }
exports.qrPrintData = async (req, res, next) => {
  const b = req.body || {};
  const companyID = String(b.companyID || '').trim();
  const orderID   = String(b.orderID || '').trim();
  const factoryID = String(b.factoryID || '*').trim();
  const bundleNos = Array.isArray(b.bundleNos) ? b.bundleNos.map(x => +x).filter(x => !isNaN(x)) : [];
  const runNos    = Array.isArray(b.runNos)    ? b.runNos.map(x => String(x).trim()).filter(Boolean) : [];
  // ★ ห้ามลบช่องว่างข้างใน — productBarcodeNoReal มี space เป็น padding (เช่น style "AA0VBA6A␣␣␣␣") · trim ปลายพอ
  const barcodes  = Array.isArray(b.barcodes)  ? b.barcodes.map(x => String(x).trim()).filter(Boolean) : [];
  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    if (!companyID || !orderID || (!bundleNos.length && !runNos.length && !barcodes.length)) {
      return res.status(400).json({ success: false, token, expiresIn: Number(process.env.TOKENExpiresIn), message: 'เลือก bundle หรือ QR อย่างน้อย 1 รายการ' });
    }

    // ── build $or สำหรับดึงชิ้น ──
    const or = [];
    if (bundleNos.length) or.push({ bundleNo: { $in: bundleNos } });
    if (barcodes.length)  or.push({ productBarcodeNoReal: { $in: barcodes } });
    // runNos: เลขวิ่งอยู่ท้าย productBarcodeNoReal (pos 37 len 5 = ท้ายสุดของ barcode) → regex ปิดท้าย (bounded ใน 1 order)
    if (runNos.length) {
      const rx = runNos.map(r => new RegExp(r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
      or.push({ productBarcodeNoReal: { $in: rx } });
    }

    const docs = await OrderProduction.find(
      { companyID, orderID, productStatus: { $in: STATUS_ARR }, $or: or },
      { _id: 0, productBarcodeNoReal: 1, bundleNo: 1, yarnLot: 1, productionNode: 1 }
    ).maxTimeMS(20000).lean();

    const { colorInfo, sizeMap } = await loadOrderColorSize(companyID, orderID);

    // env positions (substr บน productBarcodeNoReal)
    const P = {
      style: [+process.env.stylePos, +process.env.styleDigit],
      zone:  [+process.env.targetIDPos, +process.env.targetIDDigit],
      year:  [+process.env.yearPos, +process.env.yearDigit],
      color: [+process.env.colorPos, +process.env.colorDigit],
      size:  [+process.env.sizePos, +process.env.sizeDigit],
      sex:   [+process.env.sexPos, +process.env.sexDigit],
      run:   [+process.env.runningNoPos, +process.env.runningNoDigit],
    };

    const yarnSet = new Set();
    let records = docs.map(d => {
      const bc = String(d.productBarcodeNoReal || '');
      const firstFac = (d.productionNode && d.productionNode[0] && d.productionNode[0].factoryID) || '';
      const colorCode = keyU(bc.substr(P.color[0], P.color[1]));
      const sizeID    = keyU(bc.substr(P.size[0], P.size[1]));
      const ci = colorInfo.get(colorCode);
      const sm = sizeMap.get(sizeID);
      const yl = (d.yarnLot && d.yarnLot[0] && d.yarnLot[0].yarnLotID) || '';
      const { yarnG, yarnA } = splitYarn(yl);
      if (yl) yarnSet.add(yl);
      return {
        firstFac,
        barcode: bc, qr: bc,                                   // QR content = productBarcodeNoReal เต็ม
        runNo:  bc.substr(P.run[0], P.run[1]),                 // เลขวิ่ง 5 หลัก (seq = int)
        style:  keyU(bc.substr(P.style[0], P.style[1])),
        zone:   keyU(bc.substr(P.zone[0], P.zone[1])),
        order:  orderID,
        year:   bc.substr(P.year[0], P.year[1]),
        color:  colorCode, colorCode: ci ? ci.colorCode : '', colorName: ci ? ci.colorName : colorCode, colorValue: ci ? ci.colorValue : '',
        size:   sizeID, sizeName: sm ? sm.name : sizeID,
        sex:    keyU(bc.substr(P.sex[0], P.sex[1])),
        bundleNo: d.bundleNo,
        yarnLot: yl, yarnG, yarnA,
      };
    });

    // ── factory filter (โรงที่ล็อกงาน) ทำใน JS (ชุดเล็ก) ──
    if (factoryID !== '*') records = records.filter(r => r.firstFac === factoryID);

    // sort by bundleNo → runNo
    records.sort((a, c) => (a.bundleNo - c.bundleNo) || (a.runNo > c.runNo ? 1 : a.runNo < c.runNo ? -1 : 0));
    records.forEach(r => { delete r.firstFac; });

    // runNos ที่หาไม่เจอ (แจ้ง worker ว่าเลขไหนพิมพ์ไม่ได้)
    const foundRuns = new Set(records.map(r => r.runNo));
    const notFoundRunNos = runNos.filter(r => ![...foundRuns].some(fr => fr === r || fr.replace(/^0+/, '') === r.replace(/^0+/, '')));

    // ★ warnMultiYarn = เตือนเฉพาะฝั่ง "พิมพ์เป็นช่วง bundle (bulk)" ที่ล็อตด้ายปนกัน
    //   QR เดี่ยว (barcodes/runNos = reprint ที่หาย) ไม่ทำให้เตือน — คนละล็อต/มัดได้อิสระ
    const bundleSet = new Set(bundleNos);
    const bulkYarns = new Set();
    records.forEach(r => { if (bundleSet.has(r.bundleNo) && r.yarnLot) bulkYarns.add(r.yarnLot); });

    res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      count: records.length, records,
      yarnLots: [...yarnSet], warnMultiYarn: bulkYarns.size > 1,
      notFoundRunNos,
    });
  } catch (err) {
    console.error('[qrPrintData]', err);
    return res.status(501).json({ success: false, message: 'error qr-print data' });
  }
};

// ═══════════════════════ REPRINT REQUEST (ใบขอ reprint QR — office → worker) ═══════════════════════
// Requirement (user 2026-07-19): คนดู Report 11 (office) กับคนพิม QR (worker) คนละคน/เครื่อง อาจห่างกันหลายชม./วัน
//   → office เลือกชิ้นที่ QR หาย บันทึกเป็น "ใบขอ reprint" (DB) · worker เปิดหน้า Print QR เห็นใบที่ค้าง หยิบไปพิมพ์ → ปิดใบ

// requestID = rr_###### (max+1 per company)
async function nextReqID(companyID) {
  const rows = await ReprintRequest.find({ companyID, requestID: /^rr_\d+$/ }, { requestID: 1, _id: 0 }).lean();
  let max = 0;
  for (const r of rows) { const n = parseInt(String(r.requestID).slice(3), 10); if (n > max) max = n; }
  return 'rr_' + String(max + 1).padStart(6, '0');
}

// POST /api/a/report/reprint-request — office สร้างใบขอ (จาก Report 11)
exports.createReprintRequest = async (req, res) => {
  try {
    const b = req.body || {};
    const companyID = String(b.companyID || '').trim();
    const items = Array.isArray(b.items)
      ? b.items.map(x => ({ barcode: String(x.barcode || '').trim(), runNo: String(x.runNo || '').trim(), label: String(x.label || '').trim(), group: String(x.group || '').trim() })).filter(x => x.barcode)
      : [];
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    if (!companyID || !items.length) {
      return res.status(400).json({ success: false, token, expiresIn: Number(process.env.TOKENExpiresIn), message: 'companyID + items required' });
    }
    const requestID = await nextReqID(companyID);
    const unlockCode = String(Math.floor(100000 + Math.random() * 900000));   // ★ สุ่มรหัสเปิด 6 หลัก (server gen)
    const factoryID = String(b.factoryID || '*').trim();
    const seasonYear = String(b.seasonYear || '').trim();
    const orderID = String(b.orderID || '').trim();
    const doc = await ReprintRequest.create({
      companyID, requestID, factoryID, orderID,
      style: String(b.style || '').trim(), seasonYear,
      items, count: items.length, unlockCode, note: String(b.note || '').trim(), status: 'pending',
      createBy: { userID: String(b.userID || '').trim(), userName: String(b.userName || '').trim() }, createdAt: new Date(),
    });
    // audit — swallow error (กันธุรกรรมล้ม)
    try {
      await writeLog({
        module: 'production', companyID, factoryID, action: 'reprint-request-create',
        targetType: 'reprint', entryID: requestID,
        summary: `ขอ reprint ${requestID} · order ${orderID} · ${items.length} ตัว · มีรหัสเปิด`,
        meta: { requestID, orderID, seasonYear, count: items.length, runNos: items.map(x => x.runNo) },
        userID: String(b.userID || '').trim(), userName: String(b.userName || '').trim(),
      });
    } catch (e) { /* ignore */ }
    // ★ create: ส่ง unlockCode กลับ (ออฟฟิส = คนสร้าง รู้รหัสอยู่แล้ว → เอาไปพิมพ์บนใบให้ ผจก เซ็น) · แต่ list (worker) ไม่ส่งรหัส
    return res.status(201).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), request: doc });
  } catch (err) { console.error('[createReprintRequest]', err); return res.status(500).json({ success: false, message: String((err && err.message) || err) }); }
};

// GET /api/a/report/reprint-request/:companyID?status=pending&factoryID= — worker ดูใบที่ค้าง
exports.listReprintRequests = async (req, res) => {
  try {
    const companyID = String(req.params.companyID || '').trim();
    const status = String(req.query.status || 'pending').trim();       // pending | done | cancelled | all
    const factoryID = String(req.query.factoryID || '').trim();
    const seasonYear = String(req.query.seasonYear || '').trim();
    const q = { companyID };
    if (status && status !== 'all') q.status = status;
    if (seasonYear) q.seasonYear = seasonYear;
    if (factoryID && factoryID !== '*') q.$or = [{ factoryID }, { factoryID: '*' }, { factoryID: '' }];   // ใบของโรงตัวเอง + ใบไม่ระบุโรง
    const rows = await ReprintRequest.find(q).sort({ createdAt: -1 }).limit(500).lean();
    // ★ ไม่ส่ง items + unlockCode กลับ (worker/manager เห็นแค่ metadata + ว่ามีรหัสไหม) → กันพิมพ์เองไม่ผ่านอนุมัติ
    const safe = rows.map(r => ({
      _id: r._id, requestID: r.requestID, companyID: r.companyID, factoryID: r.factoryID,
      orderID: r.orderID, style: r.style, seasonYear: r.seasonYear, count: r.count,
      note: r.note, status: r.status, createBy: r.createBy, createdAt: r.createdAt,
      closeBy: r.closeBy, closedAt: r.closedAt,
      hasCode: !!(r.unlockCode && String(r.unlockCode).length),
    }));
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), requests: safe });
  } catch (err) { console.error('[listReprintRequests]', err); return res.status(500).json({ success: false, message: String((err && err.message) || err) }); }
};

// GET /api/a/report/reprint-request/detail/:companyID/:requestID — ดึงใบเต็ม (มีรหัส + items) สำหรับ "พิมพ์ใบซ้ำ"
//   ★ คืน unlockCode → ใช้ในหน้า Report 11 (office/ผจก · หลัง report perm) เท่านั้น · worker ใช้หน้า Print QR (ไม่แตะ endpoint นี้)
exports.getReprintRequestFull = async (req, res) => {
  try {
    const companyID = String(req.params.companyID || '').trim();
    const requestID = String(req.params.requestID || '').trim();
    const doc = await ReprintRequest.findOne({ companyID, requestID }).lean();
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    if (!doc) return res.status(404).json({ success: false, token, expiresIn: Number(process.env.TOKENExpiresIn), message: 'ไม่พบใบขอ' });
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), request: doc });
  } catch (err) { console.error('[getReprintRequestFull]', err); return res.status(500).json({ success: false, message: String((err && err.message) || err) }); }
};

// POST /api/a/report/reprint-request/unlock — worker กรอกรหัส (จากใบที่ ผจก เซ็น) → คืน items ให้พิมพ์
//   ★ items ถูกซ่อนใน list · ต้องกรอกรหัสถูกก่อนถึงได้ items (กัน worker พิมพ์เองไม่ผ่านอนุมัติ)
exports.unlockReprintRequest = async (req, res) => {
  try {
    const b = req.body || {};
    const filter = b._id ? { _id: b._id } : { companyID: String(b.companyID || '').trim(), requestID: String(b.requestID || '').trim() };
    const doc = await ReprintRequest.findOne(filter).lean();
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    if (!doc) return res.status(404).json({ success: false, token, expiresIn: Number(process.env.TOKENExpiresIn), message: 'ไม่พบใบขอ' });
    const code = String(doc.unlockCode || '').trim();
    const entered = String(b.code || '').trim();
    if (code && code !== entered) {
      return res.status(403).json({ success: false, token, expiresIn: Number(process.env.TOKENExpiresIn), message: 'รหัสไม่ถูกต้อง' });
    }
    // ★ รหัสถูก = ถือว่าพิมพ์แล้ว → mark done ทันที (worker ไม่ต้องกดปิดใบเอง) · เก็บคนพิม+เวลา
    const who = { userID: String(b.userID || '').trim(), userName: String(b.userName || '').trim() };
    if (doc.status !== 'done') {
      await ReprintRequest.updateOne({ _id: doc._id }, { $set: { status: 'done', closeBy: who, closedAt: new Date() } });
    }
    try {
      await writeLog({
        module: 'production', companyID: doc.companyID, factoryID: doc.factoryID, action: 'reprint-request-done',
        targetType: 'reprint', entryID: doc.requestID,
        summary: `พิมพ์ reprint ${doc.requestID} (ปลดล็อกด้วยรหัส) · order ${doc.orderID} · ${doc.count} ตัว`,
        meta: { requestID: doc.requestID, orderID: doc.orderID, seasonYear: doc.seasonYear, count: doc.count },
        userID: who.userID, userName: who.userName,
      });
    } catch (e) { /* ignore */ }
    return res.json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      requestID: doc.requestID, _id: doc._id, orderID: doc.orderID, style: doc.style,
      seasonYear: doc.seasonYear, factoryID: doc.factoryID, items: doc.items || [],
    });
  } catch (err) { console.error('[unlockReprintRequest]', err); return res.status(500).json({ success: false, message: String((err && err.message) || err) }); }
};

// PUT /api/a/report/reprint-request/close — worker ปิดใบหลังพิมพ์ (done) หรือ office ยกเลิก (cancelled)
exports.closeReprintRequest = async (req, res) => {
  try {
    const b = req.body || {};
    const status = ['done', 'cancelled'].includes(b.status) ? b.status : 'done';
    const filter = b._id ? { _id: b._id } : { companyID: String(b.companyID || '').trim(), requestID: String(b.requestID || '').trim() };
    const doc = await ReprintRequest.findOneAndUpdate(
      filter,
      { $set: { status, closeBy: { userID: String(b.userID || '').trim(), userName: String(b.userName || '').trim() }, closedAt: new Date() } },
      { new: true }
    ).lean();
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    if (!doc) return res.status(404).json({ success: false, token, expiresIn: Number(process.env.TOKENExpiresIn), message: 'request not found' });
    // audit: ใครพิมพ์/ปิดใบ (accountability)
    try {
      await writeLog({
        module: 'production', companyID: doc.companyID, factoryID: doc.factoryID, action: `reprint-request-${status}`,
        targetType: 'reprint', entryID: doc.requestID,
        summary: `${status === 'done' ? 'พิมพ์ reprint เสร็จ' : 'ยกเลิกใบ reprint'} ${doc.requestID} · order ${doc.orderID} · ${doc.count} ตัว`,
        meta: { requestID: doc.requestID, orderID: doc.orderID, seasonYear: doc.seasonYear, count: doc.count, status },
        userID: String(b.userID || '').trim(), userName: String(b.userName || '').trim(),
      });
    } catch (e) { /* ignore */ }
    const safe = { ...doc }; delete safe.unlockCode;   // ไม่ส่งรหัสกลับ
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), request: safe });
  } catch (err) { console.error('[closeReprintRequest]', err); return res.status(500).json({ success: false, message: String((err && err.message) || err) }); }
};
