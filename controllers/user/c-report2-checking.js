// ═══════════════════════════════════════════════════════════════════════════
// Requirement (user): รายงาน "Checking" ฝั่ง office — เข้าจากการ์ดในเมนู Order
//   "รายงานอยากรู้ว่าเหลือกี่ตัวที่ยังไม่ checking"
//
//   ★ ที่มาของข้อมูล: ตอน outsource receive ระบบเขียน checkPending[] (คิว node ที่ต้องตรวจ ตามลำดับ)
//     + checkFactoryID (โรงที่ต้องตรวจ) ลงบน OrderProduction · สแกน Scan Checking ที่เครื่อง station
//     จะ $pop คิวออกทีละ node → เหลือ checkPending[0] = "node ที่รอตรวจอยู่ตอนนี้"
//   ★ ฟีเจอร์นี้เปิดจาก config ระดับโรงงาน (`${factoryID}-station-STATION_CHECK_ENABLE` = on)
//     — โรงที่ไม่เปิดจะไม่มี checkPending เกิดขึ้นเลย → รายงานว่างเป็นปกติ
//   ★ 3 ชั้น: orders (เลือก order) → index (สรุป node + ตาราง สี×ไซซ์×มัด) → detail (รายชิ้น)
//   ★ แยกไฟล์ใหม่ ไม่แตะ c-report2.js / c-report2-nodebundle.js เดิม · mount ที่ r-report2.js
// ═══════════════════════════════════════════════════════════════════════════
const OrderProduction = require("../../models/m-orderProduction");
const Order = require("../../models/m-order");
const Factory = require("../../models/m-factory");
const Gsconfig = require("../../models/m-gsconfig");
const ShareFunc = require("../c-api-app-share-function");

// ## ชิ้นที่ยังอยู่ในไลน์ (ตรงกับ gate ฝั่ง station — complete แล้วไม่ต้องตรวจย้อน)
const PSTATUS = ['normal', 'problem', 'repaired'];

// ## normalize key ให้ตรงกับที่ mongo คำนวณ (uppercase + ตัด '-' ท้าย) — เหมือน c-report2-nodebundle
const keyU = (s) => String(s == null ? '' : s).replace(/-+$/, '').toUpperCase().trim();

// ## แกะ zone/color/size จาก productBarcodeNoReal ตามตำแหน่งใน .env (เหมือนรายงาน 11/26)
function barcodeKeyProj() {
  return {
    _zone:  { $rtrim: { input: { $toUpper: { $substr: ["$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit] } }, chars: "-" } },
    _color: { $rtrim: { input: { $toUpper: { $substr: ["$productBarcodeNoReal", +process.env.colorPos,    +process.env.colorDigit   ] } }, chars: "-" } },
    _size:  { $rtrim: { input: { $toUpper: { $substr: ["$productBarcodeNoReal", +process.env.sizePos,      +process.env.sizeDigit    ] } }, chars: "-" } },
  };
}

const SIZE_SEQ = ['XXS','XS','S','M','L','XL','XXL','2XL','3XL','4XL','5XL','E1','E2','E3','F1','F2'];
function sizeSeqNo(s) { const i = SIZE_SEQ.indexOf(keyU(s)); return i < 0 ? 999 : i; }

// ── โรงงานในเครือที่ "เปิดใช้ Scan Checking" + ลำดับ node ที่ตรวจ ─────────────
//   อ่านจาก Gsconfig ตรงๆ (ไม่ cache — office เปิดรายงานไม่บ่อย และต้องเห็นค่าล่าสุดหลังแก้ config)
async function enabledFactories(companyID) {
  const facs = await Factory.find({ companyID }, { _id: 0, factoryID: 1, 'fInfo.factoryName': 1, 'fInfo.abbreviation': 1 }).lean();
  const out = [];
  for (const f of (facs || [])) {
    const fid = String(f.factoryID || '').trim();
    if (!fid) continue;
    const [enDoc, ndDoc] = await Promise.all([
      Gsconfig.findOne({ configID: `${fid}-station-STATION_CHECK_ENABLE` }, { value: 1, _id: 0 }).lean(),
      Gsconfig.findOne({ configID: `${fid}-station-STATION_CHECK_NODES`  }, { value: 1, _id: 0 }).lean(),
    ]);
    const on    = String((enDoc && enDoc.value) || '').trim().toLowerCase() === 'on';
    const nodes = String((ndDoc && ndDoc.value) || '').split(',').map(s => s.trim()).filter(Boolean);
    out.push({
      factoryID: fid,
      factoryName: (f.fInfo && f.fInfo.factoryName) || fid,
      abbreviation: (f.fInfo && f.fInfo.abbreviation) || '',
      enabled: on && nodes.length > 0,   // เปิดแต่ไม่ระบุ node = เท่ากับปิด (ตรงกับ checkCfg ฝั่ง station)
      nodes,
    });
  }
  return out;
}

// map factoryID → ชื่อ (ใช้แสดงผลในตาราง)
async function factoryNameMap(companyID) {
  const facs = await Factory.find({ companyID }, { _id: 0, factoryID: 1, 'fInfo.factoryName': 1, 'fInfo.abbreviation': 1 }).lean();
  const m = new Map();
  for (const f of (facs || [])) {
    m.set(String(f.factoryID || '').trim(), (f.fInfo && (f.fInfo.abbreviation || f.fInfo.factoryName)) || String(f.factoryID || ''));
  }
  return m;
}

// ═══════════════════ ชั้นที่ 1 — order ที่ยังมีของค้างรอตรวจ ═══════════════════
// GET /api/a/report/checking/orders/:companyID/:seasonYear
//   → { enabledFactories, orders:[{orderID, style, customerName, qty, bundles, byFactory:[{factoryID,qty}]}], grandQty }
exports.repCheckingOrders = async (req, res, next) => {
  const companyID = String(req.params.companyID || '').trim();
  const seasonYear = String(req.params.seasonYear || '').trim();
  const orderStatusArr = ['open'];
  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    // ── order ของ season ที่เลือก (เหมือน repOrderList) ──
    const seasonOrders = await ShareFunc.getOrdersBySeasonYearArr(companyID, orderStatusArr, [seasonYear]);
    const orderIDArr = Array.from(new Set((seasonOrders || []).map(o => o.orderID)));
    const facs = await enabledFactories(companyID);

    if (!orderIDArr.length) {
      return res.status(200).json({
        success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
        seasonYear, enabledFactories: facs, orders: [], grandQty: 0,
      });
    }

    // ── นับชิ้นที่ยังมี checkPending ค้าง ต่อ order × โรงที่ต้องตรวจ ──
    const rows = await OrderProduction.aggregate([
      { $match: {
          companyID, orderID: { $in: orderIDArr },
          productStatus: { $in: PSTATUS },
          'checkPending.0': { $exists: true },
      } },
      { $group: {
          _id: { orderID: "$orderID", fid: { $ifNull: ["$checkFactoryID", ''] } },
          qty: { $sum: 1 },
          bundles: { $addToSet: "$bundleNo" },
      } },
    ]).allowDiskUse(true);

    // ── ชื่อ style / ลูกค้า ของ order ที่มีของค้าง ──
    const hitIDs = Array.from(new Set(rows.map(r => r._id.orderID)));
    const styleRows = hitIDs.length ? await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr, hitIDs) : [];
    const styleMap = new Map();
    for (const r of (styleRows || [])) {
      styleMap.set(r.orderID, { style: r.style || '', customerName: (r.customerOR && r.customerOR.customerName) || '' });
    }
    const fMap = await factoryNameMap(companyID);

    const oMap = new Map();
    for (const r of rows) {
      const oid = r._id.orderID;
      if (!oMap.has(oid)) {
        const s = styleMap.get(oid) || {};
        oMap.set(oid, { orderID: oid, style: s.style || '', customerName: s.customerName || '', qty: 0, bundles: 0, byFactory: [] });
      }
      const o = oMap.get(oid);
      o.qty += r.qty;
      o.bundles += (r.bundles || []).filter(b => b != null).length;
      o.byFactory.push({ factoryID: r._id.fid, factoryName: fMap.get(r._id.fid) || r._id.fid || '—', qty: r.qty });
    }
    const orders = [...oMap.values()]
      .map(o => { o.byFactory.sort((a, b) => b.qty - a.qty); return o; })
      .sort((a, b) => b.qty - a.qty || String(a.orderID).localeCompare(String(b.orderID)));

    return res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      seasonYear, enabledFactories: facs, orders,
      grandQty: orders.reduce((s, o) => s + o.qty, 0),
    });
  } catch (err) {
    console.error('[repCheckingOrders]', err);
    return res.status(501).json({ success: false, message: 'error checking orders' });
  }
};

// ═══════════ ชั้นที่ 2 — สรุปของ order เดียว (node + สี×ไซซ์×มัด) ═══════════
// GET /api/a/report/checking/index/:companyID/:orderID/:factoryID   (factoryID='*' = ทุกโรง)
//   → { orderID, factoryID, nodes:[{nodeID,qty,bundles}], rows:[...], totalQty }
//   rows group ตาม: node ที่รอตรวจ (checkPending[0]) × โรงที่ต้องตรวจ × สี × ไซซ์ × มัด
exports.repCheckingIndex = async (req, res, next) => {
  const companyID = String(req.params.companyID || '').trim();
  const orderID   = String(req.params.orderID || '').trim();
  const factoryID = String(req.params.factoryID || '*').trim();
  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    if (!companyID || !orderID) {
      return res.status(400).json({ success: false, token, expiresIn: Number(process.env.TOKENExpiresIn), message: 'companyID + orderID required' });
    }

    // ── master: ชื่อสีของ order (แสดงแทนรหัสสี) ──
    const order = await Order.findOne({ companyID, orderID }, { _id: 0, orderColor: 1 }).lean();
    const colorMap = new Map();
    for (const c of (order && order.orderColor || [])) {
      const col = c.color || c;
      colorMap.set(keyU(col.colorID), { colorName: col.colorName || '', colorCode: col.colorCode || '', colorValue: col.colorValue || '' });
    }

    const match = {
      companyID, orderID,
      productStatus: { $in: PSTATUS },
      'checkPending.0': { $exists: true },
    };
    if (factoryID !== '*') match.checkFactoryID = factoryID;

    const rows = await OrderProduction.aggregate([
      { $match: match },
      { $project: {
          _id: 0, bundleNo: 1, productCount: 1,
          nextCheck:  { $arrayElemAt: ['$checkPending', 0] },
          pending:    { $ifNull: ['$checkPending', []] },
          chkFactory: { $ifNull: ['$checkFactoryID', ''] },
          outFactoryID: { $ifNull: [{ $arrayElemAt: ['$productionNode.factoryID', -1] }, ''] },
          curNode:      { $ifNull: [{ $arrayElemAt: ['$productionNode.toNode',    -1] }, ''] },
          ...barcodeKeyProj(),
      } },
      { $group: {
          _id: { node: "$nextCheck", fid: "$chkFactory", color: "$_color", size: "$_size", bundleNo: "$bundleNo" },
          qty: { $sum: 1 },
          bundleCount: { $max: "$productCount" },
          pending: { $first: "$pending" },
          outFactoryID: { $first: "$outFactoryID" },
          curNode: { $first: "$curNode" },
      } },
      { $sort: { '_id.node': 1, '_id.fid': 1, '_id.color': 1, '_id.bundleNo': 1 } },
      { $limit: 5000 },
    ]).hint({ companyID: 1, orderID: 1, productBarcodeNoReal: 1 }).allowDiskUse(true);

    const fMap = await factoryNameMap(companyID);

    const detail = rows.map(r => {
      const colorID = keyU(r._id.color);
      const cm = colorMap.get(colorID) || {};
      return {
        nodeID: r._id.node,
        factoryID: r._id.fid,
        factoryName: fMap.get(r._id.fid) || r._id.fid || '—',
        colorID, colorName: cm.colorName || '', colorCode: cm.colorCode || '', colorValue: cm.colorValue || '',
        size: keyU(r._id.size),
        bundleNo: r._id.bundleNo,
        qty: r.qty,
        bundleCount: r.bundleCount || null,
        pending: r.pending || [],       // คิว node ที่ยังต้องตรวจทั้งหมด (ตัวแรก = nodeID)
        outFactoryID: r.outFactoryID || '',
        curNode: r.curNode || '',
      };
    }).sort((a, b) =>
      String(a.nodeID).localeCompare(String(b.nodeID), undefined, { numeric: true })
      || String(a.factoryID).localeCompare(String(b.factoryID))
      || String(a.colorName || a.colorID).localeCompare(String(b.colorName || b.colorID))
      || (sizeSeqNo(a.size) - sizeSeqNo(b.size))
      || (Number(a.bundleNo || 0) - Number(b.bundleNo || 0))
    );

    // ── สรุปต่อ node ที่รอตรวจ (การ์ดด้านบน) ──
    const nMap = new Map();
    for (const d of detail) {
      if (!nMap.has(d.nodeID)) nMap.set(d.nodeID, { nodeID: d.nodeID, qty: 0, bundles: 0 });
      const n = nMap.get(d.nodeID);
      n.qty += d.qty; n.bundles += 1;
    }
    const nodes = [...nMap.values()].sort((a, b) => String(a.nodeID).localeCompare(String(b.nodeID), undefined, { numeric: true }));

    return res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      orderID, factoryID, nodes, rows: detail,
      totalQty: detail.reduce((s, d) => s + d.qty, 0),
      truncated: rows.length >= 5000,
    });
  } catch (err) {
    console.error('[repCheckingIndex]', err);
    return res.status(501).json({ success: false, message: 'error checking index' });
  }
};

// ═══════════ ชั้นที่ 3 — รายชิ้น (ดับเบิลคลิกที่ qty ในตาราง) ═══════════
// GET /api/a/report/checking/detail/:companyID/:orderID/:factoryID/:node/:color/:size/:bundleNo
//   (factoryID='*' = ทุกโรง · bundleNo='*' = ทุกมัด · color/size='*' = ไม่กรอง)
exports.repCheckingDetail = async (req, res, next) => {
  const p = req.params;
  const companyID = String(p.companyID || '').trim();
  const orderID   = String(p.orderID || '').trim();
  const factoryID = String(p.factoryID || '*').trim();
  const node      = String(p.node || '').trim();
  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    if (!companyID || !orderID || !node) {
      return res.status(400).json({ success: false, token, expiresIn: Number(process.env.TOKENExpiresIn), message: 'companyID + orderID + node required' });
    }

    const lim  = Math.min(1000, Math.max(1, Math.floor(+req.query.limit || 200)));
    const pg   = Math.max(1, Math.floor(+req.query.page || 1));
    const skip = (pg - 1) * lim;

    const match = { companyID, orderID, productStatus: { $in: PSTATUS }, 'checkPending.0': { $exists: true } };
    if (factoryID !== '*') match.checkFactoryID = factoryID;

    const post = { nextCheck: node };
    if (String(p.color)    !== '*') post._color   = keyU(p.color);
    if (String(p.size)     !== '*') post._size    = keyU(p.size);
    if (String(p.bundleNo) !== '*') post.bundleNo = Number(p.bundleNo);

    const out = await OrderProduction.aggregate([
      { $match: match },
      { $project: {
          _id: 0, bundleNo: 1, productBarcodeNo: 1, productBarcodeNoReal: 1, productStatus: 1,
          nextCheck: { $arrayElemAt: ['$checkPending', 0] },
          pending:   { $ifNull: ['$checkPending', []] },
          checked:   { $ifNull: ['$checkNode', []] },
          outFactoryID: { $ifNull: [{ $arrayElemAt: ['$productionNode.factoryID', -1] }, ''] },
          curNode:      { $ifNull: [{ $arrayElemAt: ['$productionNode.toNode',    -1] }, ''] },
          ...barcodeKeyProj(),
      } },
      { $match: post },
      { $sort: { bundleNo: 1, productBarcodeNoReal: 1 } },
      { $facet: {
          total:  [ { $count: 'n' } ],
          pieces: [ { $skip: skip }, { $limit: lim }, { $project: {
              _id: 0, bundleNo: 1, curNode: 1, outFactoryID: 1, productStatus: 1, pending: 1,
              barcode: "$productBarcodeNoReal",
              barcodeNo: "$productBarcodeNo",
              checkedCount: { $size: "$checked" },
          } } ],
      } },
    ]).hint({ companyID: 1, orderID: 1, productBarcodeNoReal: 1 }).allowDiskUse(true);

    const total  = (out[0] && out[0].total[0] && out[0].total[0].n) || 0;
    const pieces = (out[0] && out[0].pieces) || [];

    return res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      orderID, factoryID, node,
      color: String(p.color) === '*' ? '*' : keyU(p.color),
      size:  String(p.size)  === '*' ? '*' : keyU(p.size),
      bundleNo: String(p.bundleNo) === '*' ? '*' : Number(p.bundleNo),
      page: pg, limit: lim, count: total, pieces,
      hasMore: skip + pieces.length < total,
    });
  } catch (err) {
    console.error('[repCheckingDetail]', err);
    return res.status(501).json({ success: false, message: 'error checking detail' });
  }
};
