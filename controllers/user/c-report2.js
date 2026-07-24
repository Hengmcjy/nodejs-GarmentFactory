// Requirement: Report ใหม่ (clean stack) ใต้ /api/a/report — ชี้ collection/cache เดิม
//   ไม่แตะ c-report.js เก่า · reuse เฉพาะ ShareFunc ที่เป็น "read cache/aggregate" (stable) → เลขตรงกับรายงานเดิม 100%
// รายงาน no.1 = Production Overview: ต่อ order แสดง ยอดสั่ง / เสร็จ / กำลังผลิต / คงเหลือ + โรงที่ผลิต + รูป
// ★ ยึด cache เดียวกับที่ end user เห็น (scheduler สร้างทุก 30 นาที) ห้าม aggregate สดเอง
const ShareFunc = require("../c-api-app-share-function");
const OrderProduction = require("../../models/m-orderProduction");
const Order = require("../../models/m-order");
const Size = require("../../models/m-size");
const NodeFlow = require("../../models/m-nodeFlow");
const Factory = require("../../models/m-factory");

// Requirement: หา completeQty จาก cache "completed" ด้วย key companyID+orderID+productID+style (ตรรกะเดียวกับรายงานเดิม)
function findCompleteQty(completeArr, companyID, orderID, productID, style) {
  const f = completeArr.filter(i =>
    i.companyID == companyID && i.orderID == orderID && i.productID == productID && i.style == style
  );
  return f.length > 0 ? f[0].countQty : 0;
}

// Requirement: อ่าน cache แบบปลอดภัย — ถ้ายังไม่มี cache (scheduler ยังไม่สร้างสำหรับ season นี้) คืน [] ไม่ให้ทั้ง endpoint ล่ม
async function safeCache(fn) {
  try {
    const d = await fn();
    return Array.isArray(d) ? d : [];
  } catch (e) {
    return [];
  }
}

// ## GET /api/a/report/overview/:companyID/:seasonYear
// รายงาน no.1 (Production Overview) — self-contained: คืน order/รูป/ยอด ครบในครั้งเดียว
exports.repOverview = async (req, res, next) => {
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  const orderStatusArr = ['open'];   // เฉพาะงวดที่เปิดอยู่ (ตรงกับรายงานเดิม)

  try {
    // ## orders ของ season (ไว้หา orderIDArr + รูป)
    const orders = await ShareFunc.getOrdersBySeasonYearArr(companyID, orderStatusArr, [seasonYear]);
    const orderIDArr = Array.from(new Set((orders || []).map(o => o.orderID)));

    // ## รูป product (เก็บแค่ชื่อไฟล์ GCS — frontend ต่อ URL เอง)
    const productImageProfiles = await safeCache(() =>
      ShareFunc.getProductImageProfiles(companyID, orderIDArr));

    // ## ยอดสั่งต่อ style (live Order aggregate — optimized + hint)
    const currentOrderStyle = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr, orderIDArr);

    // ## โรงที่ผลิตต่อ order (cache scheduler)
    const currentFactoryOrder = await safeCache(() =>
      ShareFunc.get_auto_getCurrentCFactoryOrder(companyID, seasonYear, 'auto_getCurrentCFactoryOrder'));

    // ## ยอด "กำลังผลิต" (noComplete) + "เสร็จ" (completed) — cache scheduler
    const qtyNoC = await safeCache(() =>
      ShareFunc.get_auto_getCompanyCurrentProductQtyAll(companyID, seasonYear, 'auto_getCompanyCurrentProductQtyAll_No_C', 'noComplete'));
    const qtyC = await safeCache(() =>
      ShareFunc.get_auto_getCompanyCurrentProductQtyAll(companyID, seasonYear, 'auto_getCompanyCurrentProductQtyAll_C', 'completed'));

    const companyCurrentProductQtyAll = qtyNoC.map(fw => ({
      companyID: fw.companyID,
      orderID: fw.orderID,
      productID: fw.productID,
      style: fw.style,
      countQty: fw.countQty,       // ## = กำลังผลิต (in production)
      completeQty: findCompleteQty(qtyC, fw.companyID, fw.orderID, fw.productID, fw.style),
    }));

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      success: true,
      token,
      expiresIn: Number(process.env.TOKENExpiresIn),
      seasonYear,
      currentOrderStyle,            // [{companyID,orderID,productID,style,customerOR,sumQty}]
      currentFactoryOrder,          // [{orderID,factoryID,...}]
      companyCurrentProductQtyAll,  // [{companyID,orderID,productID,style,countQty,completeQty}]
      productImageProfiles,         // [{productID,imageProfile}]
    });
  } catch (err) {
    console.error('[repOverview]', err);
    return res.status(501).json({ success: false, message: 'error report overview' });
  }
};

// Requirement: normalize รหัส zone (targetPlace) — ตัด '-' + trim + upper (ให้ฝั่งสั่ง/ผลิตจับคู่กันได้ ตรงกับรายงานเดิม)
function normZone(s) { return String(s || '').replace(/-/g, '').trim().toUpperCase(); }

// ## GET /api/a/report/overview/zone/:companyID/:orderID
// รายงาน no.1 — drill ราย Zone (targetPlace) ของ order เดียว: ยอดสั่ง/เสร็จ/กำลังผลิต/คงเหลือ ต่อ zone
// ★ reuse ShareFunc read เดิม (per-order → aggregate สดได้ เร็ว) เลขตรงกับรายงานเดิม
exports.repOverviewZone = async (req, res, next) => {
  const companyID = req.params.companyID;
  const orderID = req.params.orderID;
  const orderStatusArr = ['open'];
  const productStatusArr = ['normal', 'problem', 'repaired'];
  const productStatusCompleteArr = ['complete'];

  try {
    // ## ยอดสั่งต่อ zone (จาก Order)
    const orderZone = await ShareFunc.getCurrentCompanyOrderZoneStyle(companyID, orderStatusArr, [orderID]);
    // ## กำลังผลิต + เสร็จ ต่อ zone (จาก OrderProduction, per-order)
    const prodZone = await ShareFunc.getComCurrentProductQtyZoneAll(companyID, [], productStatusArr, [orderID]);
    const compZone = await ShareFunc.getComCurrentProductQtyZoneAll(companyID, [], productStatusCompleteArr, [orderID]);

    // ## รวมต่อ zone (key = normalized targetPlaceID)
    const zmap = {};   // { zoneKey: { targetPlaceID, orderQty, inProductionQty, completeQty } }
    const ensure = (rawID) => {
      const k = normZone(rawID);
      if (!zmap[k]) zmap[k] = { targetPlaceID: k, orderQty: 0, inProductionQty: 0, completeQty: 0 };
      return zmap[k];
    };
    (orderZone || []).forEach(o => { ensure(o.targetPlaceID).orderQty += (+o.sumQty || 0); });
    (prodZone  || []).forEach(p => { ensure(p.targetPlace).inProductionQty += (+p.countQty || 0); });
    (compZone  || []).forEach(c => { ensure(c.targetPlace).completeQty += (+c.countQty || 0); });

    const zones = Object.values(zmap).map(z => ({
      ...z,
      remainQty: Math.max(0, z.orderQty - z.completeQty - z.inProductionQty),
    })).sort((a, b) => (a.targetPlaceID > b.targetPlaceID ? 1 : -1));

    const total = zones.reduce((acc, z) => ({
      orderQty: acc.orderQty + z.orderQty,
      completeQty: acc.completeQty + z.completeQty,
      inProductionQty: acc.inProductionQty + z.inProductionQty,
      remainQty: acc.remainQty + z.remainQty,
    }), { orderQty: 0, completeQty: 0, inProductionQty: 0, remainQty: 0 });

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), orderID, zones, total });
  } catch (err) {
    console.error('[repOverviewZone]', err);
    return res.status(501).json({ success: false, message: 'error report overview zone' });
  }
};

// ## GET /api/a/report/overview/node/:companyID/:orderID
// รายงาน no.1 — drill ราย Node ของ order เดียว: นับชิ้นที่ "อยู่แต่ละ node ตอนนี้" (last node)
// ★ ตรรกะเดียวกับ getCNCurrentProductionNodeQty เดิม (last node + status + $sum:1) แต่ไม่ล็อก whitelist → คืนทุก node ที่มีจริง
// ★ GOTCHA: OrderProduction 1 doc = 1 ตัว → count ด้วย $sum:1 (ห้าม sum productCount) · ใช้ hint index เดิม (มีอยู่แล้ว) กัน COLLSCAN
exports.repOverviewNode = async (req, res, next) => {
  const companyID = req.params.companyID;
  const orderID = req.params.orderID;
  const nodeStatus = ['normal', 'problem', 'repaired', 'outsource'];

  try {
    const rows = await OrderProduction.aggregate([
      { $match: {
          "companyID": companyID,
          "orderID": orderID,
          "productionNode": { $elemMatch: { "status": { $in: nodeStatus } } },
      }},
      { $project: { _id: 0, lastNode: { $arrayElemAt: ["$productionNode", -1] } } },
      { $match: { "lastNode.status": { $in: nodeStatus } } },
      { $group: { _id: "$lastNode.toNode", countQty: { $sum: 1 } } },
    ]).hint({ companyID: 1, orderID: 1, "productionNode.toNode": 1, "productionNode.status": 1 });

    const nodes = (rows || [])
      .map(r => ({ toNode: r._id, countQty: r.countQty }))
      .filter(n => n.toNode != null)
      .sort((a, b) => (a.toNode > b.toNode ? 1 : -1));

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), orderID, nodes });
  } catch (err) {
    console.error('[repOverviewNode]', err);
    return res.status(501).json({ success: false, message: 'error report overview node' });
  }
};

// ══════════════════════════════════════════════════════════════════════
// ## รายงาน no.2 — Order (คำสั่งผลิต): ตาราง matrix สี × ไซซ์ × โซน ต่อ order
//   ★ ออกแบบใหม่แบบ on-demand: โหลด "ลิสต์ order" ก่อน → กด order ค่อยโหลด matrix ทีละตัว
//     (ต่างจากแอปเก่าที่โหลดทุก order พร้อมกัน)
// ══════════════════════════════════════════════════════════════════════

// ## GET /api/a/report/order/list/:companyID/:seasonYear
// ลิสต์ order ของ season: style + ยอดรวม + ลูกค้า (เบา — reuse getCurrentCompanyOrderStyle)
exports.repOrderList = async (req, res, next) => {
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  const orderStatusArr = ['open'];
  try {
    const seasonOrders = await ShareFunc.getOrdersBySeasonYearArr(companyID, orderStatusArr, [seasonYear]);
    const orderIDArr = Array.from(new Set((seasonOrders || []).map(o => o.orderID)));

    const styleRows = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr, orderIDArr);
    const orders = (styleRows || []).map(r => ({
      orderID: r.orderID,
      style: r.style,
      sumQty: r.sumQty,
      customerName: (r.customerOR && r.customerOR.customerName) || '',
    })).sort((a, b) => (a.orderID > b.orderID ? 1 : a.orderID < b.orderID ? -1 : 0));

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), seasonYear, orders });
  } catch (err) {
    console.error('[repOrderList]', err);
    return res.status(501).json({ success: false, message: 'error report order list' });
  }
};

// ## GET /api/a/report/order/matrix/:companyID/:orderID
// matrix ของ order เดียว: คอลัมน์ = zone/country (orderTargetPlace) · แถว = สี(rowspan) × ไซซ์ · เซล = ยอดสั่ง
//   ★ ตัวเลขจาก getCurrentCompanyOrderByOrderID (เท่ากับรายงานเดิม) · โครง/ชื่อสี จาก Order doc · ชื่อไซซ์ จาก Size master
exports.repOrderMatrix = async (req, res, next) => {
  const companyID = req.params.companyID;
  const orderID = req.params.orderID;
  const orderStatusArr = ['open'];

  const trimStr  = (s) => String(s == null ? '' : s).trim();
  const normSize = (s) => String(s == null ? '' : s).replace(/-/g, '').trim();   // แอปเก่าตัด '-' ออกจากไซซ์

  try {
    const order = await Order.findOne({ companyID, orderID }).lean();

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    if (!order) {
      return res.status(200).json({
        success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
        orderID, style: '', customerName: '', zones: [], rows: [], columnTotals: [], grandTotal: 0,
      });
    }

    // ── คอลัมน์ = zone/country (dedupe orderTargetPlace ด้วย targetPlaceID+countryID เรียงตาม seq) ──
    const zones = [];
    const zoneKeyIndex = new Map();
    (order.orderTargetPlace || [])
      .slice()
      .sort((a, b) => (a.seq || 0) - (b.seq || 0))
      .forEach(tp => {
        const tpID = trimStr(tp.targetPlace && tp.targetPlace.targetPlaceID);
        const cID  = trimStr(tp.targetPlace && tp.targetPlace.countryID);
        const key = tpID + '|' + cID;
        if (!zoneKeyIndex.has(key)) {
          zoneKeyIndex.set(key, zones.length);
          zones.push({
            targetPlaceID: tpID,
            countryID: cID,
            label: cID || tpID,
          });
        }
      });

    // ── ชื่อสี จาก Order.orderColor (colorCode → {name, seq}) ──
    // ## map สีด้วย "หลาย key" (colorID / colorCode / colorName) เพราะ productColor ในตารางเป็น colorID (ไม่ใช่ code)
    const colorInfoMap = new Map();
    (order.orderColor || []).forEach(c => {
      const info = {
        colorID:    trimStr(c.color && c.color.colorID),
        colorName:  trimStr(c.color && c.color.colorName),
        colorCode:  trimStr(c.color && c.color.colorCode),
        colorValue: trimStr(c.color && c.color.colorValue),   // ## hex สำหรับก้อนกลมสี
        seq: c.seq || 0,
      };
      [info.colorID, info.colorCode, info.colorName].forEach(k => { if (k) colorInfoMap.set(k, info); });
    });

    // ── ชื่อไซซ์ จาก Size master (sizeID → {name, seq}) ──
    const sizeDocs = await Size.find({}, { size: 1, seq: 1 }).lean();
    const sizeMap = new Map();
    (sizeDocs || []).forEach(s => {
      const id = normSize(s.size && s.size.sizeID);
      if (id) sizeMap.set(id, { name: trimStr(s.size && s.size.sizeName) || id, seq: s.seq || 0 });
    });

    // ── เซล = ยอดสั่งต่อ สี×ไซซ์×zone (จาก getCurrentCompanyOrderByOrderID — เท่ากับรายงานเดิม) ──
    const cells = await ShareFunc.getCurrentCompanyOrderByOrderID(companyID, orderStatusArr, orderID);

    // group by color|size → row
    const rowMap = new Map();
    (cells || []).forEach(c => {
      const colorCode = trimStr(c.productColor);
      const sizeCode  = normSize(c.productSize);
      const zKey = trimStr(c.targetPlaceID) + '|' + trimStr(c.countryID);
      const zi = zoneKeyIndex.get(zKey);
      const qty = +c.sumQty || 0;
      const rk = colorCode + '||' + sizeCode;
      if (!rowMap.has(rk)) {
        rowMap.set(rk, { colorCode, sizeCode, cells: new Array(zones.length).fill(0), rowTotal: 0 });
      }
      const row = rowMap.get(rk);
      if (zi != null) row.cells[zi] += qty;
      row.rowTotal += qty;
    });

    // ── resolver สี (จาก productColor ซึ่งเป็น colorID/code — แยก multi-color ด้วย ',') ──
    const colorPartsOf = (code) => String(code).split(',').map(x => {
      const t = x.trim();
      const info = colorInfoMap.get(t);
      return info
        ? { id: info.colorID || t, name: info.colorName || '', code: info.colorCode || '', value: info.colorValue || '' }
        : { id: t, name: '', code: '', value: '' };
    });
    const colorSeq = (code) => { const info = colorInfoMap.get(String(code).split(',')[0].trim()); return info ? info.seq : 9999; };
    const colorName = (code) => colorPartsOf(code).map(p => p.name || p.id).join(', ');
    // ── เรียง: สี (seq→code) แล้ว ไซซ์ (seq→code) ──
    const sizeSeq  = (code) => (sizeMap.get(code)  ? sizeMap.get(code).seq  : 9999);
    const sizeName = (code) => (sizeMap.get(code) && sizeMap.get(code).name) || code;

    let rows = Array.from(rowMap.values()).sort((a, b) =>
      (colorSeq(a.colorCode) - colorSeq(b.colorCode)) ||
      (a.colorCode > b.colorCode ? 1 : a.colorCode < b.colorCode ? -1 : 0) ||
      (sizeSeq(a.sizeCode) - sizeSeq(b.sizeCode)) ||
      (a.sizeCode > b.sizeCode ? 1 : a.sizeCode < b.sizeCode ? -1 : 0)
    ).map(r => {
      const parts = colorPartsOf(r.colorCode);
      return {
        colorCode: r.colorCode,           // raw key (productColor) — ใช้ group/รวมสี
        colorParts: parts,                // [{id,name,code,value}] · โชว์ครบ + ก้อนกลมสี
        colorName: colorName(r.colorCode),
        colorSwatches: parts.map(p => p.value).filter(Boolean),
        sizeCode: r.sizeCode,
        sizeName: sizeName(r.sizeCode),
        cells: r.cells,
        rowTotal: r.rowTotal,
      };
    });

    // firstOfColor + rowspan (ให้ frontend merge เซลสี)
    const colorCount = new Map();
    rows.forEach(r => colorCount.set(r.colorCode, (colorCount.get(r.colorCode) || 0) + 1));
    const seenColor = new Set();
    rows = rows.map(r => {
      const first = !seenColor.has(r.colorCode);
      if (first) seenColor.add(r.colorCode);
      return { ...r, firstOfColor: first, colorRowspan: first ? colorCount.get(r.colorCode) : 0 };
    });

    // ── rewrite (log การ revise ยอด) — cell ไหนถูกแก้ + ประวัติ ──
    const cellRevisedKeys = new Set();
    const rewrites = ((order.productOR && order.productOR.productORRewriteInfo) || []).map(rw => {
      const colorCode = trimStr(rw.productColor);
      const sizeCode  = normSize(rw.productSize);
      const tpID = trimStr(rw.targetPlace && rw.targetPlace.targetPlaceID);
      const cID  = trimStr(rw.targetPlace && rw.targetPlace.countryID);
      const cellKey = colorCode + '||' + sizeCode + '||' + tpID + '|' + cID;
      cellRevisedKeys.add(cellKey);
      return {
        cellKey,
        colorName: colorName(colorCode),
        colorCode,
        sizeName: sizeName(sizeCode),
        sizeCode,
        zoneLabel: cID || tpID,
        qtyOld: +rw.productQtyOld || 0,
        qtyNew: +rw.productQty || 0,
        lossQty: +rw.productLossQty || 0,
        datetime: rw.datetime || null,
        userName: (rw.createBy && rw.createBy.userName) || '',
      };
    }).sort((a, b) => (a.datetime > b.datetime ? 1 : a.datetime < b.datetime ? -1 : 0));   // เก่า → ใหม่

    // ต่อ row: revised[] ต่อ zone (ให้ frontend ไฮไลต์ + โชว์ R)
    rows = rows.map(r => ({
      ...r,
      revised: zones.map(z => cellRevisedKeys.has(r.colorCode + '||' + r.sizeCode + '||' + z.targetPlaceID + '|' + z.countryID)),
    }));
    const hasRewrite = rewrites.length > 0;

    // column totals + grand total
    const columnTotals = new Array(zones.length).fill(0);
    let grandTotal = 0;
    rows.forEach(r => {
      r.cells.forEach((q, i) => { columnTotals[i] += q; });
      grandTotal += r.rowTotal;
    });

    // style จาก productBarcode ตัวแรก (substr ตาม env)
    const firstBarcode = (order.productOR && order.productOR.productORInfo && order.productOR.productORInfo[0] && order.productOR.productORInfo[0].productBarcode) || '';
    const style = firstBarcode ? firstBarcode.substr(+process.env.stylePos, +process.env.styleDigit) : (order.productOR && order.productOR.productID) || '';

    res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      orderID,
      style: trimStr(style),
      customerName: (order.customerOR && order.customerOR.customerName) || '',
      zones, rows, columnTotals, grandTotal,
      hasRewrite, rewrites,
    });
  } catch (err) {
    console.error('[repOrderMatrix]', err);
    return res.status(501).json({ success: false, message: 'error report order matrix' });
  }
};

// ══════════════════════════════════════════════════════════════════════
// ## รายงาน no.3 — Scan overview: จำนวนที่สแกนในช่วงวันที่ ต่อ order × node (แยกโรงงาน + zone)
//   ★ date range · reuse ShareFunc scan aggregation เดิม (เลขตรง) · คืน raw + node columns + factory list
//     (factory filter + zone toggle ทำฝั่ง client จาก raw ไม่ต้อง refetch)
// ══════════════════════════════════════════════════════════════════════

// ## GET /api/a/report/scan/:companyID/:seasonYear/:date1/:date2   (date = YYYY-MM-DD)
// ── buildScanOverview ── core no.3 (reusable: office repScan + station scan-overview) — คืน payload ล้วน (ไม่มี token/res)
//   ★ seasonArr = array ของ season (office ส่ง 1 ตัว · station ส่งทุก season active)
//   ★ factoryFilterArr = ล็อกเฉพาะบางโรง (station เห็นโรงตัวเอง) · null/[] = ทุกโรง (พฤติกรรม office เดิม)
//   logic เดียว ไม่ก๊อป → เลขตรง no.3 office เป๊ะ
exports.buildScanOverview = async (companyID, seasonArr, date1, date2, factoryFilterArr) => {
  companyID = String(companyID || '').trim();
  date1 = String(date1).slice(0, 10);
  date2 = String(date2).slice(0, 10);
  const statusArr = ['normal', 'complete'];   // สถานะสแกนที่นับ (ตรงกับรายงานเดิม)

  // ## ขอบเขตวัน (Bangkok) — scan datetime เป็น timestamp จริง ใช้ 00:00:00+07 ถึง 23:59:59+07
  const dateStart = new Date(date1 + 'T00:00:00.000+07:00');
  const dateEnd   = new Date(date2 + 'T23:59:59.999+07:00');

  // ## orders ของ season (รองรับหลาย season)
  const seasons = Array.isArray(seasonArr) ? seasonArr.filter(Boolean) : [seasonArr].filter(Boolean);
  const seasonOrders = await ShareFunc.getOrdersBySeasonYearArr(companyID, ['open'], seasons);
  const orderIDs = Array.from(new Set((seasonOrders || []).map(o => o.orderID)));

  // ## โรงงาน (ไม่รวม outsource) — ไว้ filter + ชื่อ
  const facAll = await ShareFunc.getFactoryArrByCompanyID(companyID);
  let factories = (facAll || [])
    .filter(f => !(f.fInfo && f.fInfo.isOutsource))
    .map(f => ({ factoryID: f.factoryID, name: (f.fInfo && f.fInfo.factoryName) || f.factoryID }))
    .sort((a, b) => (a.factoryID > b.factoryID ? 1 : a.factoryID < b.factoryID ? -1 : 0));
  // ★ ล็อกเฉพาะโรงที่กำหนด (station) — ว่าง/ไม่ส่ง = ทุกโรง
  if (Array.isArray(factoryFilterArr) && factoryFilterArr.length) {
    const keep = new Set(factoryFilterArr.map(String));
    factories = factories.filter(f => keep.has(String(f.factoryID)));
  }
  const factoryIDArr = factories.map(f => f.factoryID);

  // ## นับสแกน (reuse ShareFunc — เลขตรงรายงานเดิม)
  const scanStyle = await ShareFunc.getCFStaffScannedByDate12Style(companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr);
  const scanZone  = await ShareFunc.getCFStaffScannedByDate12StyleZone(companyID, factoryIDArr, orderIDs, dateStart, dateEnd, statusArr);

  // ## node columns จาก NodeFlow (main) เรียงตาม seqNo
  // ★ ใช้ "เฉพาะ node ใน flow" ให้ตรงรายงานเดิม (แอปเก่าวนเฉพาะ flowSeq) — ไม่โชว์ pseudo node เช่น starterNode
  const flow = await NodeFlow.findOne({ companyID, flowType: 'main' }).lean();
  let nodes = [];
  if (flow && Array.isArray(flow.flowSeq) && flow.flowSeq.length > 0) {
    nodes = flow.flowSeq.slice()
      .sort((a, b) => String(a.seqNo).localeCompare(String(b.seqNo), undefined, { numeric: true }))
      .map(s => s.nodeID).filter(Boolean);
  }
  // fallback: ถ้าไม่มี NodeFlow เลย จึงใช้ node จาก data (กันตารางว่างเปล่า)
  if (nodes.length === 0) {
    const seen = new Set();
    (scanStyle || []).forEach(s => { if (s.fromNode && !seen.has(s.fromNode)) { seen.add(s.fromNode); nodes.push(s.fromNode); } });
    nodes.sort();
  }

  return {
    date1, date2, nodes, factories,
    scanStyle: (scanStyle || []).map(s => ({ orderID: s.orderID, fromNode: s.fromNode, factoryID: s.factoryID, countQty: s.countQty })),
    scanZone: (scanZone || []).map(z => ({
      orderID: z.orderID, fromNode: z.fromNode, factoryID: z.factoryID,
      targetPlace: String(z.targetPlace || '').replace(/-/g, '').trim(),
      countQty: z.countQty,
    })),
  };
};

exports.repScan = async (req, res, next) => {
  try {
    const payload = await exports.buildScanOverview(
      req.params.companyID, [req.params.seasonYear], req.params.date1, req.params.date2, null);
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), ...payload });
  } catch (err) {
    console.error('[repScan]', err);
    return res.status(501).json({ success: false, message: 'error report scan' });
  }
};

// ══════════════════════════════════════════════════════════════════════
// ## รายงาน no.12 — %WIP by period [zone]: งานระหว่างผลิต ต่อ order × zone
//   ★ on-demand: เลือก order → เลือก zone → โหลด WIP ของตัวนั้น (ไม่โหลดหมด)
//   ★ ยึด cache `auto_getProductionZonePeriodC` (scheduler ~60 นาที ใน nodejs-GarmentFactorySchedule) — ไม่ aggregate สด
// ══════════════════════════════════════════════════════════════════════

// ## GET /api/a/report/wip/:companyID/:seasonYear/:orderID/:zone   (zone='-' = zone แรกของ order)
exports.repWip = async (req, res, next) => {
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  const orderID = req.params.orderID;
  const zoneParam = String(req.params.zone || '-').trim();
  const productStatusArr = ['normal', 'problem', 'complete'];
  const productionNodeStatusArr = ['normal', 'complete'];

  const trimStr   = (s) => String(s == null ? '' : s).trim();
  const normSize  = (s) => String(s == null ? '' : s).replace(/-/g, '').trim();
  const normColor = (s) => String(s == null ? '' : s).replace(/-/g, '').trim();   // ★ colorID ใน barcode/WIP เติม '-' ท้าย (เช่น 5B--------) ต้องตัดออกให้ตรงกับ orderColor.colorID
  const normZ     = (s) => String(s == null ? '' : s).replace(/-/g, '').trim().toUpperCase();

  try {
    const order = await Order.findOne({ companyID, orderID }).lean();
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    if (!order) {
      return res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
        orderID, style: '', zones: [], zone: '', nodes: [], colorGroups: [] });
    }

    // ── zones ของ order (targetPlaceID ไม่ซ้ำ เรียง seq) ──
    const zones = [];
    const zseen = new Set();
    (order.orderTargetPlace || []).slice().sort((a, b) => (a.seq || 0) - (b.seq || 0)).forEach(tp => {
      const id = trimStr(tp.targetPlace && tp.targetPlace.targetPlaceID);
      if (id && !zseen.has(id)) { zseen.add(id); zones.push(id); }
    });
    // zone ที่เลือก (default = ตัวแรก)
    let zone = zones.find(z => normZ(z) === normZ(zoneParam)) || zones[0] || '';

    // ── node columns (NodeFlow main, ตัด starterNode) ──
    const flow = await NodeFlow.findOne({ companyID, flowType: 'main' }).lean();
    let nodes = [];
    if (flow && Array.isArray(flow.flowSeq) && flow.flowSeq.length > 0) {
      nodes = flow.flowSeq.slice()
        .sort((a, b) => String(a.seqNo).localeCompare(String(b.seqNo), undefined, { numeric: true }))
        .map(s => s.nodeID).filter(Boolean);
    }

    // ── สี (id/name/code/value) จาก Order.orderColor ──
    const colorInfoMap = new Map();
    (order.orderColor || []).forEach(c => {
      const info = {
        colorID: trimStr(c.color && c.color.colorID),
        colorName: trimStr(c.color && c.color.colorName),
        colorCode: trimStr(c.color && c.color.colorCode),
        colorValue: trimStr(c.color && c.color.colorValue),
        seq: c.seq || 0,
      };
      [info.colorID, info.colorCode, info.colorName].forEach(k => { if (k) colorInfoMap.set(k, info); });
    });
    const colorPartsOf = (code) => String(code).split(',').map(x => {
      const t = x.trim(); const info = colorInfoMap.get(t);
      return info ? { id: info.colorID || t, name: info.colorName || '', code: info.colorCode || '', value: info.colorValue || '' }
                  : { id: t, name: '', code: '', value: '' };
    });
    const colorSeqOf = (code) => { const i = colorInfoMap.get(String(code).split(',')[0].trim()); return i ? i.seq : 9999; };

    // ── size master ──
    const sizeDocs = await Size.find({}, { size: 1, seq: 1 }).lean();
    const sizeMap = new Map();
    (sizeDocs || []).forEach(s => { const id = normSize(s.size && s.size.sizeID); if (id) sizeMap.set(id, { name: trimStr(s.size && s.size.sizeName) || id, seq: s.seq || 0 }); });
    const sizeName = (code) => (sizeMap.get(code) && sizeMap.get(code).name) || code;
    const sizeSeqOf = (code) => (sizeMap.get(code) ? sizeMap.get(code).seq : 9999);

    // ── ยอดสั่งต่อ (สี×ไซซ์) ใน zone นี้ (จาก Order.productORInfo) ──
    const orderQtyMap = new Map();   // colorCode||sizeKey -> qty
    (order.productOR && order.productOR.productORInfo || []).forEach(pi => {
      if (normZ(pi.targetPlace && pi.targetPlace.targetPlaceID) !== normZ(zone)) return;
      const k = normColor(pi.productColor) + '||' + normSize(pi.productSize);
      orderQtyMap.set(k, (orderQtyMap.get(k) || 0) + (+pi.productQty || 0));
    });

    // ── WIP cache (จำนวนที่ถึงแต่ละ node) filter order+zone ──
    let cacheData = [];
    try {
      const raw = await ShareFunc.get_auto_getProductionZonePeriodC(companyID, seasonYear, 'auto_getProductionZonePeriodC');
      cacheData = (raw && raw[0] && Array.isArray(raw[0].data)) ? raw[0].data : (Array.isArray(raw) ? raw : []);
    } catch (e) { cacheData = []; }
    const wipMap = new Map();   // colorKey||sizeKey||node -> sumProductQty
    cacheData.forEach(d => {
      if (trimStr(d.orderID) !== orderID) return;
      if (normZ(d.targetPlaceID) !== normZ(zone)) return;
      const colorKey = normColor(d.productColor) || normColor(d.color);
      const sizeKey = normSize(d.productSize) || normSize(d.size);
      const k = colorKey + '||' + sizeKey + '||' + trimStr(d.fromNode);
      wipMap.set(k, (wipMap.get(k) || 0) + (+d.sumProductQty || 0));
    });

    // ── forLoss ต่อ (สี×ไซซ์) ใน zone ──
    let forLossMap = new Map();
    try {
      const fl = await ShareFunc.getProductionZoneForLossQTYC(companyID, productStatusArr, productionNodeStatusArr, [true], [true], [orderID]);
      (fl || []).forEach(f => {
        if (normZ(f.targetPlaceID) !== normZ(zone)) return;
        const k = (normColor(f.productColor) || normColor(f.color)) + '||' + (normSize(f.productSize) || normSize(f.size));
        forLossMap.set(k, (forLossMap.get(k) || 0) + (+f.sumProductQty || 0));
      });
    } catch (e) { /* ไม่มี forLoss ก็ข้าม */ }

    // ── สร้างแถว: รวม (สี×ไซซ์) ที่มีในยอดสั่ง zone นี้ ──
    const rowKeys = new Set([...orderQtyMap.keys()]);
    // เผื่อมี WIP แต่ไม่มียอดสั่ง (forLoss ล้วน) — เพิ่มเข้าไปด้วย
    cacheData.forEach(d => {
      if (trimStr(d.orderID) !== orderID || normZ(d.targetPlaceID) !== normZ(zone)) return;
      rowKeys.add((normColor(d.productColor) || normColor(d.color)) + '||' + (normSize(d.productSize) || normSize(d.size)));
    });

    // group by color
    const byColor = new Map();   // colorCode -> [{sizeCode, orderQty, forLoss, cells:[{count,percent,remain}]}]
    [...rowKeys].forEach(k => {
      const [colorCode, sizeKey] = k.split('||');
      const orderQty = orderQtyMap.get(k) || 0;
      const cells = nodes.map(node => {
        const wk = colorCode + '||' + sizeKey + '||' + node;
        const has = wipMap.has(wk);                 // ★ ไม่มี entry = ยังไม่ถึง node นี้ → ช่องว่าง (เหมือนแอปเก่า)
        const raw = wipMap.get(wk) || 0;
        const count = orderQty > 0 ? Math.min(raw, orderQty) : 0;         // orderQTY=0 (สีถูกยกเลิก) → count 0
        const forLoss = orderQty > 0 ? Math.max(0, raw - orderQty) : raw; // ★ ส่วนเกิน orderQTY = forLoss (เลขม่วง) · สีถูกยกเลิก → ที่ผลิตไปทั้งหมดเป็น forLoss
        const percent = orderQty > 0 ? Math.floor(count / orderQty * 100) : 0;
        const remain = orderQty > 0 ? Math.max(0, orderQty - count) : 0;
        return { has, count, forLoss, percent, remain };
      });
      if (!byColor.has(colorCode)) byColor.set(colorCode, []);
      byColor.get(colorCode).push({
        sizeCode: sizeKey, sizeName: sizeName(sizeKey), sizeSeq: sizeSeqOf(sizeKey),
        orderQty, forLoss: forLossMap.get(k) || 0, cells,
      });
    });

    // ── colorGroups เรียงสี + ไซซ์ + total ต่อสี ──
    const colorGroups = [...byColor.entries()]
      .sort((a, b) => (colorSeqOf(a[0]) - colorSeqOf(b[0])) || (a[0] > b[0] ? 1 : -1))
      .map(([colorCode, sizeRows]) => {
        sizeRows.sort((a, b) => (a.sizeSeq - b.sizeSeq) || (a.sizeCode > b.sizeCode ? 1 : -1));
        const total = { orderQty: 0, cells: nodes.map(() => 0) };
        sizeRows.forEach(r => { total.orderQty += r.orderQty; r.cells.forEach((c, i) => { total.cells[i] += c.count + c.forLoss; }); });   // รง.: แถวรวม = Σ(count+forLoss)
        total.cells = total.cells.map(v => Math.min(v, total.orderQty));   // ★ แต่ต้องไม่เกิน total.orderQTY เสมอ (สีถูกยกเลิก orderQTY=0 → แถวรวม=0 ตามแอปเก่า)
        return { colorCode, colorParts: colorPartsOf(colorCode), sizeRows, total };
      });

    const firstBarcode = (order.productOR && order.productOR.productORInfo && order.productOR.productORInfo[0] && order.productOR.productORInfo[0].productBarcode) || '';
    const style = firstBarcode ? firstBarcode.substr(+process.env.stylePos, +process.env.styleDigit) : ((order.productOR && order.productOR.productID) || '');

    res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      orderID, style: trimStr(style),
      customerName: (order.customerOR && order.customerOR.customerName) || '',
      zones, zone, nodes, colorGroups,
    });
  } catch (err) {
    console.error('[repWip]', err);
    return res.status(501).json({ success: false, message: 'error report wip' });
  }
};

// ## GET /api/a/report/wip/bundles/:companyID/:orderID/:zone/:color/:size/:node/:type
// drill: คลิกตัวเลขใน cell → คืน bundleNo ที่เกี่ยวข้อง
//   type: count(น้ำเงิน/ดำ = ปกติถึง node) · forloss(ม่วง = forLoss ถึง node) · remain(แดง = ปกติยังไม่ถึง node)
exports.repWipBundles = async (req, res, next) => {
  const companyID = req.params.companyID;
  const orderID = req.params.orderID;
  const zone = String(req.params.zone || '').trim();
  const color = String(req.params.color || '').trim();
  const size = String(req.params.size || '').trim();
  const node = String(req.params.node || '').trim();
  const type = String(req.params.type || 'count').trim();
  const nodeStatus = ['normal', 'complete'];

  try {
    // ── "ถึง node N" = สแกนที่ N หรือ node หลังจากนั้น (cumulative ตาม flow) — กันเคสสแกนข้าม node ──
    const flow = await NodeFlow.findOne({ companyID, flowType: 'main' }).lean();
    let nodesFlow = [];
    if (flow && Array.isArray(flow.flowSeq) && flow.flowSeq.length > 0) {
      nodesFlow = flow.flowSeq.slice()
        .sort((a, b) => String(a.seqNo).localeCompare(String(b.seqNo), undefined, { numeric: true }))
        .map(s => s.nodeID).filter(Boolean);
    }
    const idx = nodesFlow.indexOf(node);
    const reachedNodes = idx >= 0 ? nodesFlow.slice(idx) : [node];   // N ..จนสุดสาย

    // ── match เบื้องต้น (ใช้ index companyID+orderID) ──
    const match = { companyID, orderID };
    match.forLoss = (type === 'forloss') ? true : { $ne: true };   // ม่วง = forLoss · ดำ/แดง = ปกติ
    const nodeCond = { $elemMatch: { fromNode: { $in: reachedNodes }, status: { $in: nodeStatus } } };
    match.productionNode = (type === 'remain') ? { $not: nodeCond } : nodeCond;   // remain = ยังไม่ถึง node

    const rows = await OrderProduction.aggregate([
      { $match: match },
      { $addFields: {
        _tp: { $rtrim: { input: { $substrCP: ["$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit] }, chars: "-" } },
        _cl: { $rtrim: { input: { $substrCP: ["$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit] }, chars: "-" } },
        _sz: { $rtrim: { input: { $substrCP: ["$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit] }, chars: "-" } },
      }},
      { $match: { _tp: zone, _cl: color, _sz: size } },
      { $group: { _id: "$bundleNo", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).hint({ companyID: 1, orderID: 1, "productionNode.toNode": 1, "productionNode.status": 1 });

    const bundles = (rows || []).filter(r => r._id != null).map(r => ({ bundleNo: r._id, count: r.count }));
    const totalPieces = bundles.reduce((s, b) => s + b.count, 0);

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      type, node, color, size, zone,
      bundles, totalPieces, totalBundles: bundles.length,
    });
  } catch (err) {
    console.error('[repWipBundles]', err);
    return res.status(501).json({ success: false, message: 'error wip bundles' });
  }
};

// ══════════════════════════════════════════════════════════════════════
// ## รายงาน no.21 — Work in Process by Period (production-rep09)
//   โชว์ทุก style ของ season · 2 โหมด (style-zone / zone-style) ทำฝั่ง client จาก dataset เดียว
//   cell = count ที่ถึงแต่ละ node (น้ำเงินเมื่อ count>=orderQTY, ดำเมื่อยังไม่ครบ, ว่างเมื่อไม่มี) · ไม่มี %/คงเหลือ/forLoss
//   ★ ยึด cache auto_getProductionZonePeriodC เดียวกับ no.12 → เลขตรงแอปเก่า
// ## GET /api/a/report/prod-period/:companyID/:seasonYear
exports.repProdPeriod = async (req, res, next) => {
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  const orderStatusArr = ['open'];

  const trimStr   = (s) => String(s == null ? '' : s).trim();
  const normSize  = (s) => String(s == null ? '' : s).replace(/-/g, '').trim();
  const normColor = (s) => String(s == null ? '' : s).replace(/-/g, '').trim();
  const normZ     = (s) => String(s == null ? '' : s).replace(/-/g, '').trim().toUpperCase();

  const NODE_SHORT = {
    '1.COMPUTER-KNITTING': 'KNITTING', '2.PANAL-INSPECTION': 'PANAL', '3.LINKING': 'LINKING',
    '4.MENDING': 'MENDING', '5.WASHING': 'WASHING', '6.PRESSING': 'PRESSING', '7.QC': 'QC',
  };
  const shortOf = (nid) => NODE_SHORT[nid] || (String(nid).split('.').pop() || String(nid));

  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    const seasonOrders = await ShareFunc.getOrdersBySeasonYearArr(companyID, orderStatusArr, [seasonYear]);
    const orderIDArr = Array.from(new Set((seasonOrders || []).map(o => o.orderID)));
    if (!orderIDArr.length) {
      return res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), seasonYear, allZones: [], nodes: [], nodesShort: [], styles: [] });
    }

    // node columns (main flow, ตัด starterNode)
    const flow = await NodeFlow.findOne({ companyID, flowType: 'main' }).lean();
    let nodes = [];
    if (flow && Array.isArray(flow.flowSeq) && flow.flowSeq.length) {
      nodes = flow.flowSeq.slice().sort((a, b) => String(a.seqNo).localeCompare(String(b.seqNo), undefined, { numeric: true })).map(s => s.nodeID).filter(Boolean);
    }
    const nodesShort = nodes.map(shortOf);

    // size master
    const sizeDocs = await Size.find({}, { size: 1, seq: 1 }).lean();
    const sizeMap = new Map();
    (sizeDocs || []).forEach(s => { const id = normSize(s.size && s.size.sizeID); if (id) sizeMap.set(id, { name: trimStr(s.size && s.size.sizeName) || id, seq: s.seq || 0 }); });
    const sizeName = (c) => (sizeMap.get(c) && sizeMap.get(c).name) || c;
    const sizeSeqOf = (c) => (sizeMap.get(c) ? sizeMap.get(c).seq : 9999);

    // factory abbreviation (factoryID → 'TL')
    const facDocs = await Factory.find({ companyID }, { factoryID: 1, "fInfo.abbreviation": 1 }).lean();
    const facMap = new Map();
    (facDocs || []).forEach(f => facMap.set(trimStr(f.factoryID), trimStr(f.fInfo && f.fInfo.abbreviation) || trimStr(f.factoryID)));

    const orderDocs = await Order.find({ companyID, orderID: { $in: orderIDArr } }).lean();

    // WIP cache ครั้งเดียว → index by orderID
    let cacheData = [];
    try {
      const raw = await ShareFunc.get_auto_getProductionZonePeriodC(companyID, seasonYear, 'auto_getProductionZonePeriodC');
      cacheData = (raw && raw[0] && Array.isArray(raw[0].data)) ? raw[0].data : (Array.isArray(raw) ? raw : []);
    } catch (e) { cacheData = []; }
    const cacheByOrder = new Map();
    cacheData.forEach(d => { const oid = trimStr(d.orderID); if (!cacheByOrder.has(oid)) cacheByOrder.set(oid, []); cacheByOrder.get(oid).push(d); });

    const allZoneSet = new Set();
    const styles = [];

    for (const order of orderDocs) {
      const orderID = trimStr(order.orderID);

      const zones = [];
      const zseen = new Set();
      (order.orderTargetPlace || []).slice().sort((a, b) => (a.seq || 0) - (b.seq || 0)).forEach(tp => {
        const id = trimStr(tp.targetPlace && tp.targetPlace.targetPlaceID);
        if (id && !zseen.has(id)) { zseen.add(id); zones.push(id); }
      });
      zones.forEach(z => allZoneSet.add(z));

      const colorInfoMap = new Map();
      (order.orderColor || []).forEach(c => {
        const info = { colorID: trimStr(c.color && c.color.colorID), colorName: trimStr(c.color && c.color.colorName), colorCode: trimStr(c.color && c.color.colorCode), colorValue: trimStr(c.color && c.color.colorValue), seq: c.seq || 0 };
        [info.colorID, info.colorCode, info.colorName].forEach(k => { if (k) colorInfoMap.set(k, info); });
      });
      const colorPartsOf = (code) => String(code).split(',').map(x => { const t = x.trim(); const info = colorInfoMap.get(t); return info ? { id: info.colorID || t, name: info.colorName || '', code: info.colorCode || '', value: info.colorValue || '' } : { id: t, name: '', code: '', value: '' }; });
      const colorSeqOf = (code) => { const i = colorInfoMap.get(String(code).split(',')[0].trim()); return i ? i.seq : 9999; };

      const firstBarcode = (order.productOR && order.productOR.productORInfo && order.productOR.productORInfo[0] && order.productOR.productORInfo[0].productBarcode) || '';
      const style = firstBarcode ? trimStr(firstBarcode.substr(+process.env.stylePos, +process.env.styleDigit)) : trimStr((order.productOR && order.productOR.productID) || orderID);
      const factoryShort = facMap.get(trimStr(order.factoryID)) || '';

      const orderQtyMap = new Map();
      (order.productOR && order.productOR.productORInfo || []).forEach(pi => {
        const k = normZ(pi.targetPlace && pi.targetPlace.targetPlaceID) + '||' + normColor(pi.productColor) + '||' + normSize(pi.productSize);
        orderQtyMap.set(k, (orderQtyMap.get(k) || 0) + (+pi.productQty || 0));
      });
      const wipMap = new Map();
      (cacheByOrder.get(orderID) || []).forEach(d => {
        const k = normZ(d.targetPlaceID) + '||' + (normColor(d.productColor) || normColor(d.color)) + '||' + (normSize(d.productSize) || normSize(d.size)) + '||' + trimStr(d.fromNode);
        wipMap.set(k, (wipMap.get(k) || 0) + (+d.sumProductQty || 0));
      });

      const byZone = {};
      zones.forEach(zone => {
        const zk = normZ(zone);
        const pfx = zk + '||';
        const rowKeys = new Set();
        [...orderQtyMap.keys()].forEach(k => { if (k.startsWith(pfx)) rowKeys.add(k.substr(pfx.length)); });
        [...wipMap.keys()].forEach(k => { if (k.startsWith(pfx)) { const rest = k.substr(pfx.length); rowKeys.add(rest.split('||').slice(0, 2).join('||')); } });

        const byColor = new Map();
        [...rowKeys].forEach(rk => {
          const [colorCode, sizeKey] = rk.split('||');
          const orderQty = orderQtyMap.get(pfx + rk) || 0;
          const cells = nodes.map(node => {
            const wk = pfx + rk + '||' + node;
            const raw = wipMap.get(wk) || 0;
            const has = wipMap.has(wk);
            const count = orderQty > 0 ? Math.min(raw, orderQty) : 0;
            const forLoss = orderQty > 0 ? Math.max(0, raw - orderQty) : raw;   // ★ ผลผลิตเกิน orderQTY (ใช้ในแถวรวม ไม่โชว์ราย cell)
            const done = orderQty > 0 && count >= orderQty;
            return { has, count, done, forLoss };
          });
          if (!byColor.has(colorCode)) byColor.set(colorCode, []);
          byColor.get(colorCode).push({ sizeCode: sizeKey, sizeName: sizeName(sizeKey), sizeSeq: sizeSeqOf(sizeKey), orderQty, cells });
        });

        const colorGroups = [...byColor.entries()]
          .sort((a, b) => (colorSeqOf(a[0]) - colorSeqOf(b[0])) || (a[0] > b[0] ? 1 : -1))
          .map(([colorCode, sizeRows]) => {
            sizeRows.sort((a, b) => (a.sizeSeq - b.sizeSeq) || (a.sizeCode > b.sizeCode ? 1 : -1));
            const total = { orderQty: 0, cells: nodes.map(() => 0) };
            sizeRows.forEach(r => { total.orderQty += r.orderQty; r.cells.forEach((c, i) => { total.cells[i] += c.count + c.forLoss; }); });
            total.cells = total.cells.map(v => Math.min(v, total.orderQty));   // ★ รง.: แถวรวม = min(Σ(count+forLoss), orderQTY) เหมือน no.12
            return { colorCode, colorParts: colorPartsOf(colorCode), sizeRows, total };
          });

        const grand = { orderQty: 0, cells: nodes.map(() => 0) };
        colorGroups.forEach(g => { grand.orderQty += g.total.orderQty; g.total.cells.forEach((v, i) => { grand.cells[i] += v; }); });

        byZone[zone] = { colorGroups, grand };
      });

      styles.push({ orderID, style, factoryShort, zones, byZone });
    }

    styles.sort((a, b) => (a.orderID > b.orderID ? 1 : a.orderID < b.orderID ? -1 : 0));

    res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      seasonYear, allZones: [...allZoneSet], nodes, nodesShort, styles,
    });
  } catch (err) {
    console.error('[repProdPeriod]', err);
    return res.status(501).json({ success: false, message: 'error report production period' });
  }
};

// ══════════════════════════════════════════════════════════════════════
// ## รายงาน no.22 — Factory Scan Production by Period (ดึงสด)
//   เหมือน no.21 (2 โหมด + PDF) แต่ data = "จำนวนที่สแกนในช่วงวันที่" ต่อ factory (ไม่ใช่ cache สะสม)
//   ★ ใช้ getCFStaffScannedByDate12StyleZoneColorSize (aggregate สดจาก OrderProduction ตาม productionNode.datetime/factoryID)
//   factoryID = '*' = ทุกโรงในเครือ (isOutsource:false) · หรือระบุ factoryID เดียว
// ## GET /api/a/report/prod-scan/:companyID/:seasonYear/:date1/:date2/:factoryID
// ── buildProdScanPeriod ── core no.22 (reusable: office repProdScanPeriod + station prod-scan) — คืน payload ล้วน (ไม่มี token/res)
//   ★ seasonArr = array (office ส่ง 1 · station ส่งทุก season active) · factoryParam = '*'/ว่าง = ทุกโรง · อื่น = โรงนั้น (station ล็อก)
exports.buildProdScanPeriod = async (companyID, seasonArr, date1, date2, factoryParam) => {
  companyID = String(companyID || '').trim();
  date1 = String(date1).slice(0, 10);
  date2 = String(date2).slice(0, 10);
  factoryParam = String(factoryParam || '*').trim();
  const orderStatusArr = ['open'];
  const scanStatusArr = ['normal', 'complete'];
  const seasons = Array.isArray(seasonArr) ? seasonArr.filter(Boolean) : [seasonArr].filter(Boolean);

  const trimStr   = (s) => String(s == null ? '' : s).trim();
  const normSize  = (s) => String(s == null ? '' : s).replace(/-/g, '').trim();
  const normColor = (s) => String(s == null ? '' : s).replace(/-/g, '').trim();
  const normZ     = (s) => String(s == null ? '' : s).replace(/-/g, '').trim().toUpperCase();

  const NODE_SHORT = {
    '1.COMPUTER-KNITTING': 'KNITTING', '2.PANAL-INSPECTION': 'PANAL', '3.LINKING': 'LINKING',
    '4.MENDING': 'MENDING', '5.WASHING': 'WASHING', '6.PRESSING': 'PRESSING', '7.QC': 'QC',
  };
  const shortOf = (nid) => NODE_SHORT[nid] || (String(nid).split('.').pop() || String(nid));

  {
    const dateStart = new Date(date1 + 'T00:00:00.000+07:00');
    const dateEnd   = new Date(date2 + 'T23:59:59.999+07:00');

    // โรงงานในเครือ (ไม่รวม outsource)
    const facAll = await ShareFunc.getFactoryArrByCompanyID(companyID);
    const factories = (facAll || [])
      .filter(f => !(f.fInfo && f.fInfo.isOutsource))
      .map(f => ({ factoryID: f.factoryID, name: (f.fInfo && (f.fInfo.abbreviation || f.fInfo.factoryName)) || f.factoryID }))
      .sort((a, b) => (a.factoryID > b.factoryID ? 1 : a.factoryID < b.factoryID ? -1 : 0));
    const inHouseIDs = factories.map(f => f.factoryID);
    const factoryIDArr = (factoryParam === '*' || !factoryParam) ? inHouseIDs : [factoryParam];

    // orders ของ season (รองรับหลาย season)
    const seasonOrders = await ShareFunc.getOrdersBySeasonYearArr(companyID, orderStatusArr, seasons);
    const orderIDArr = Array.from(new Set((seasonOrders || []).map(o => o.orderID)));
    if (!orderIDArr.length) {
      return { date1, date2, factorySel: factoryParam, factories, allZones: [], nodes: [], nodesShort: [], styles: [] };
    }

    // node columns
    const flow = await NodeFlow.findOne({ companyID, flowType: 'main' }).lean();
    let nodes = [];
    if (flow && Array.isArray(flow.flowSeq) && flow.flowSeq.length) {
      nodes = flow.flowSeq.slice().sort((a, b) => String(a.seqNo).localeCompare(String(b.seqNo), undefined, { numeric: true })).map(s => s.nodeID).filter(Boolean);
    }
    const nodesShort = nodes.map(shortOf);

    // size master
    const sizeDocs = await Size.find({}, { size: 1, seq: 1 }).lean();
    const sizeMap = new Map();
    (sizeDocs || []).forEach(s => { const id = normSize(s.size && s.size.sizeID); if (id) sizeMap.set(id, { name: trimStr(s.size && s.size.sizeName) || id, seq: s.seq || 0 }); });
    const sizeName = (c) => (sizeMap.get(c) && sizeMap.get(c).name) || c;
    const sizeSeqOf = (c) => (sizeMap.get(c) ? sizeMap.get(c).seq : 9999);

    // factory abbreviation map
    const facMap = new Map();
    (facAll || []).forEach(f => facMap.set(trimStr(f.factoryID), trimStr(f.fInfo && f.fInfo.abbreviation) || trimStr(f.factoryID)));

    const orderDocs = await Order.find({ companyID, orderID: { $in: orderIDArr } }).lean();

    // ── สแกนสด ต่อ (order,zone,color,size,node) ในช่วงวัน + factory ──
    const scanRows = await ShareFunc.getCFStaffScannedByDate12StyleZoneColorSize(companyID, factoryIDArr, orderIDArr, dateStart, dateEnd, scanStatusArr);
    const scanByOrder = new Map();
    (scanRows || []).forEach(d => { const oid = trimStr(d.orderID); if (!scanByOrder.has(oid)) scanByOrder.set(oid, []); scanByOrder.get(oid).push(d); });

    const allZoneSet = new Set();
    const styles = [];

    for (const order of orderDocs) {
      const orderID = trimStr(order.orderID);

      const zones = [];
      const zseen = new Set();
      (order.orderTargetPlace || []).slice().sort((a, b) => (a.seq || 0) - (b.seq || 0)).forEach(tp => {
        const id = trimStr(tp.targetPlace && tp.targetPlace.targetPlaceID);
        if (id && !zseen.has(id)) { zseen.add(id); zones.push(id); }
      });
      zones.forEach(z => allZoneSet.add(z));

      const colorInfoMap = new Map();
      (order.orderColor || []).forEach(c => {
        const info = { colorID: trimStr(c.color && c.color.colorID), colorName: trimStr(c.color && c.color.colorName), colorCode: trimStr(c.color && c.color.colorCode), colorValue: trimStr(c.color && c.color.colorValue), seq: c.seq || 0 };
        [info.colorID, info.colorCode, info.colorName].forEach(k => { if (k) colorInfoMap.set(k, info); });
      });
      const colorPartsOf = (code) => String(code).split(',').map(x => { const t = x.trim(); const info = colorInfoMap.get(t); return info ? { id: info.colorID || t, name: info.colorName || '', code: info.colorCode || '', value: info.colorValue || '' } : { id: t, name: '', code: '', value: '' }; });
      const colorSeqOf = (code) => { const i = colorInfoMap.get(String(code).split(',')[0].trim()); return i ? i.seq : 9999; };

      const firstBarcode = (order.productOR && order.productOR.productORInfo && order.productOR.productORInfo[0] && order.productOR.productORInfo[0].productBarcode) || '';
      const style = firstBarcode ? trimStr(firstBarcode.substr(+process.env.stylePos, +process.env.styleDigit)) : trimStr((order.productOR && order.productOR.productID) || orderID);
      const factoryShort = facMap.get(trimStr(order.factoryID)) || '';

      const orderQtyMap = new Map();
      (order.productOR && order.productOR.productORInfo || []).forEach(pi => {
        const k = normZ(pi.targetPlace && pi.targetPlace.targetPlaceID) + '||' + normColor(pi.productColor) + '||' + normSize(pi.productSize);
        orderQtyMap.set(k, (orderQtyMap.get(k) || 0) + (+pi.productQty || 0));
      });
      // นับสแกนต่อ zone||color||size||node (รวมทุก factory ที่เลือก)
      const wipMap = new Map();
      (scanByOrder.get(orderID) || []).forEach(d => {
        const k = normZ(d.targetPlace) + '||' + normColor(d.color) + '||' + normSize(d.size) + '||' + trimStr(d.fromNode);
        wipMap.set(k, (wipMap.get(k) || 0) + (+d.countQty || 0));
      });

      const byZone = {};
      zones.forEach(zone => {
        const zk = normZ(zone);
        const pfx = zk + '||';
        const rowKeys = new Set();
        [...orderQtyMap.keys()].forEach(k => { if (k.startsWith(pfx)) rowKeys.add(k.substr(pfx.length)); });
        [...wipMap.keys()].forEach(k => { if (k.startsWith(pfx)) { const rest = k.substr(pfx.length); rowKeys.add(rest.split('||').slice(0, 2).join('||')); } });

        const byColor = new Map();
        [...rowKeys].forEach(rk => {
          const [colorCode, sizeKey] = rk.split('||');
          const orderQty = orderQtyMap.get(pfx + rk) || 0;
          const cells = nodes.map(node => {
            const wk = pfx + rk + '||' + node;
            const raw = wipMap.get(wk) || 0;
            const has = wipMap.has(wk);
            const count = orderQty > 0 ? Math.min(raw, orderQty) : 0;
            const forLoss = orderQty > 0 ? Math.max(0, raw - orderQty) : raw;
            const done = orderQty > 0 && count >= orderQty;
            return { has, count, done, forLoss };
          });
          if (!byColor.has(colorCode)) byColor.set(colorCode, []);
          byColor.get(colorCode).push({ sizeCode: sizeKey, sizeName: sizeName(sizeKey), sizeSeq: sizeSeqOf(sizeKey), orderQty, cells });
        });

        const colorGroups = [...byColor.entries()]
          .sort((a, b) => (colorSeqOf(a[0]) - colorSeqOf(b[0])) || (a[0] > b[0] ? 1 : -1))
          .map(([colorCode, sizeRows]) => {
            sizeRows.sort((a, b) => (a.sizeSeq - b.sizeSeq) || (a.sizeCode > b.sizeCode ? 1 : -1));
            const total = { orderQty: 0, cells: nodes.map(() => 0) };
            sizeRows.forEach(r => { total.orderQty += r.orderQty; r.cells.forEach((c, i) => { total.cells[i] += c.count + c.forLoss; }); });
            total.cells = total.cells.map(v => Math.min(v, total.orderQty));
            return { colorCode, colorParts: colorPartsOf(colorCode), sizeRows, total };
          });

        const grand = { orderQty: 0, cells: nodes.map(() => 0) };
        colorGroups.forEach(g => { grand.orderQty += g.total.orderQty; g.total.cells.forEach((v, i) => { grand.cells[i] += v; }); });

        // ★ ข้าม zone ที่ไม่มีการสแกนเลยในช่วงนี้ (ทุก node = 0) เพื่อไม่ให้ตารางว่างรก
        const anyScan = colorGroups.some(g => g.total.cells.some(v => v > 0));
        if (anyScan) byZone[zone] = { colorGroups, grand };
      });

      if (Object.keys(byZone).length) styles.push({ orderID, style, factoryShort, zones: zones.filter(z => byZone[z]), byZone });
    }

    styles.sort((a, b) => (a.orderID > b.orderID ? 1 : a.orderID < b.orderID ? -1 : 0));

    return { date1, date2, factorySel: factoryParam, factories, allZones: [...allZoneSet], nodes, nodesShort, styles };
  }
};

exports.repProdScanPeriod = async (req, res, next) => {
  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    const payload = await exports.buildProdScanPeriod(
      req.params.companyID, [req.params.seasonYear], req.params.date1, req.params.date2, req.params.factoryID);
    res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), seasonYear: req.params.seasonYear, ...payload });
  } catch (err) {
    console.error('[repProdScanPeriod]', err);
    return res.status(501).json({ success: false, message: 'error report prod scan period' });
  }
};

// ══════════════════════════════════════════════════════════════════════
// ## รายงาน no.23 — Factory Scan sub-node Production (ดึงสด, สะสมทั้งหมด)
//   เลือก order + main node → ดูราย sub-node ต่อ factory + คอลัมน์ outS (outsource เป็นคนทำ)
//   คลิกเลข → popup แยกว่า factory ไหนทำเท่าไหร่
// ══════════════════════════════════════════════════════════════════════

// ## GET /api/a/report/subnode/init/:companyID/:seasonYear  → order list + main node list (สำหรับ dropdown)
exports.repSubNodeInit = async (req, res, next) => {
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  const NODE_SHORT = { '1.COMPUTER-KNITTING': 'KNITTING', '2.PANAL-INSPECTION': 'PANAL', '3.LINKING': 'LINKING', '4.MENDING': 'MENDING', '5.WASHING': 'WASHING', '6.PRESSING': 'PRESSING', '7.QC': 'QC' };
  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    const seasonOrders = await ShareFunc.getOrdersBySeasonYearArr(companyID, ['open'], [seasonYear]);
    const orderIDArr = Array.from(new Set((seasonOrders || []).map(o => o.orderID)));
    const styleRows = await ShareFunc.getCurrentCompanyOrderStyle(companyID, ['open'], orderIDArr);
    const orders = (styleRows || []).map(r => ({ orderID: r.orderID, style: r.style, customerName: (r.customerOR && r.customerOR.customerName) || '' }))
      .sort((a, b) => (a.orderID > b.orderID ? 1 : a.orderID < b.orderID ? -1 : 0));
    const flow = await NodeFlow.findOne({ companyID, flowType: 'main' }).lean();
    let nodes = [];
    if (flow && Array.isArray(flow.flowSeq) && flow.flowSeq.length) {
      nodes = flow.flowSeq.slice().sort((a, b) => String(a.seqNo).localeCompare(String(b.seqNo), undefined, { numeric: true }))
        .map(s => ({ nodeID: s.nodeID, short: NODE_SHORT[s.nodeID] || (String(s.nodeID).split('.').pop() || s.nodeID) })).filter(n => n.nodeID);
    }
    res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), orders, nodes });
  } catch (err) {
    console.error('[repSubNodeInit]', err);
    return res.status(501).json({ success: false, message: 'error subnode init' });
  }
};

// ## GET /api/a/report/subnode/:companyID/:orderID/:nodeID  → sub-node scan ของ order+node (สะสม)
exports.repSubNodeScan = async (req, res, next) => {
  const companyID = req.params.companyID;
  const orderID = String(req.params.orderID).trim();
  const nodeID = String(req.params.nodeID).trim();

  const trimStr   = (s) => String(s == null ? '' : s).trim();
  const normSize  = (s) => String(s == null ? '' : s).replace(/-/g, '').trim();
  const normColor = (s) => String(s == null ? '' : s).replace(/-/g, '').trim();
  const normZ     = (s) => String(s == null ? '' : s).replace(/-/g, '').trim().toUpperCase();

  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    // ช่วงวันกว้าง (สะสมทั้งหมด)
    const dateStart = new Date('2000-01-01T00:00:00.000+07:00');
    const dateEnd   = new Date('2100-01-01T00:00:00.000+07:00');

    // subnode defs ของ node นี้ (เรียง seq) — label/EX เติมทีหลังจาก config ราย order
    const subDefsAll = await ShareFunc.getSubNodeflowC(companyID);
    let subNodes = (subDefsAll || []).filter(s => trimStr(s.nodeID) === nodeID)
      .sort((a, b) => (a.seq || 0) - (b.seq || 0))
      .map(s => {
        const sid = trimStr(s.subNodeID), snm = trimStr(s.subNodeName);
        return { id: sid, rawName: snm, name: (sid ? sid + '.' : '') + snm, isEX: false };
      });

    // ── scan sub-node ตรงจาก OrderProduction (ทุก factory รวม outsource ภายนอกต่างบริษัท) — ไม่ filter factory/date (สะสม) ──
    const scanAgg = await OrderProduction.aggregate([
      { $match: { companyID, orderID, subNodeFlow: { $elemMatch: { nodeID } } } },
      { $unwind: '$subNodeFlow' },
      { $match: { 'subNodeFlow.nodeID': nodeID } },
      { $project: {
          _id: 0,
          targetPlace: { $toUpper: { $substr: ['$productBarcodeNoReal', +process.env.targetIDPos, +process.env.targetIDDigit] } },
          color: { $toUpper: { $substr: ['$productBarcodeNoReal', +process.env.colorPos, +process.env.colorDigit] } },
          size: { $toUpper: { $substr: ['$productBarcodeNoReal', +process.env.sizePos, +process.env.sizeDigit] } },
          factoryID: '$subNodeFlow.factoryID',
          subNodeID: '$subNodeFlow.subNodeID',
      }},
      { $group: { _id: { factoryID: '$factoryID', subNodeID: '$subNodeID', targetPlace: '$targetPlace', color: '$color', size: '$size' }, countQty: { $sum: 1 } } },
    ]).allowDiskUse(true);
    const scanRows = scanAgg.map(r => ({ factoryID: r._id.factoryID, subNodeID: r._id.subNodeID, targetPlace: r._id.targetPlace, color: r._id.color, size: r._id.size, countQty: r.countQty }));

    // ── outS: outsource ระดับ node (productionNode.fromNode = node นี้) นับชิ้นต่อ factory ──
    const outsAgg = await OrderProduction.aggregate([
      { $match: { companyID, orderID, productionNode: { $elemMatch: { fromNode: nodeID } } } },
      { $unwind: '$productionNode' },
      { $match: { 'productionNode.fromNode': nodeID } },
      { $project: {
          _id: 0,
          targetPlace: { $toUpper: { $substr: ['$productBarcodeNoReal', +process.env.targetIDPos, +process.env.targetIDDigit] } },
          color: { $toUpper: { $substr: ['$productBarcodeNoReal', +process.env.colorPos, +process.env.colorDigit] } },
          size: { $toUpper: { $substr: ['$productBarcodeNoReal', +process.env.sizePos, +process.env.sizeDigit] } },
          factoryID: '$productionNode.factoryID',
      }},
      { $group: { _id: { factoryID: '$factoryID', targetPlace: '$targetPlace', color: '$color', size: '$size' }, countQty: { $sum: 1 } } },
    ]).allowDiskUse(true);
    const outRows = outsAgg.map(r => ({ factoryID: r._id.factoryID, targetPlace: r._id.targetPlace, color: r._id.color, size: r._id.size, countQty: r.countQty }));

    // ── factory map: ทุกโรงที่พบ (subNodeFlow + productionNode, รวม outsource ต่างบริษัท) ──
    const facIDsInScan = [...new Set([...scanRows, ...outRows].map(r => trimStr(r.factoryID)).filter(Boolean))];
    const facDocs = await Factory.find({ factoryID: { $in: facIDsInScan } }, { factoryID: 1, companyID: 1, 'fInfo.abbreviation': 1, 'fInfo.factoryName': 1, 'fInfo.isOutsource': 1 }).lean();
    const facMap = new Map();
    (facDocs || []).forEach(f => facMap.set(trimStr(f.factoryID), { name: trimStr(f.fInfo && (f.fInfo.abbreviation || f.fInfo.factoryName)) || trimStr(f.factoryID), isOutsource: !!(f.fInfo && f.fInfo.isOutsource), companyID: trimStr(f.companyID) }));
    // in-house = โรงของบริษัทนี้และไม่ใช่ outsource · outsource = ที่เหลือทั้งหมด (รวมต่างบริษัท)
    const isInHouse = (fid) => { const f = facMap.get(fid); return !!(f && f.companyID === companyID && !f.isOutsource); };

    // order doc → zones, colors, orderQty, style, size master
    const order = await Order.findOne({ companyID, orderID }).lean();
    const sizeDocs = await Size.find({}, { size: 1, seq: 1 }).lean();
    const sizeMap = new Map();
    (sizeDocs || []).forEach(s => { const id = normSize(s.size && s.size.sizeID); if (id) sizeMap.set(id, { name: trimStr(s.size && s.size.sizeName) || id, seq: s.seq || 0 }); });
    const sizeName = (c) => (sizeMap.get(c) && sizeMap.get(c).name) || c;
    const sizeSeqOf = (c) => (sizeMap.get(c) ? sizeMap.get(c).seq : 9999);

    if (!order) {
      return res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), orderID, nodeID, style: '', subNodes, inHouse: [], zones: [], byZone: {} });
    }

    // ★ [EX] มาจาก config ราย order (หน้าตั้งค่าขั้นตอนย่อย): order.productOR.subNodeFlowCost[].subNodeType ('extra'/'extra2' = EX)
    const subTypeMap = new Map();
    ((order.productOR && order.productOR.subNodeFlowCost) || []).forEach(sc => { subTypeMap.set(trimStr(sc.nodeID) + '||' + trimStr(sc.subNodeID), String(sc.subNodeType || '').toLowerCase().trim()); });
    subNodes = subNodes.map(sn => { const t = subTypeMap.get(nodeID + '||' + sn.id) || ''; const isEX = (t === 'extra' || t === 'extra2'); return { id: sn.id, rawName: sn.rawName, name: (isEX ? '[EX] ' : '') + (sn.id ? sn.id + '.' : '') + sn.rawName, isEX }; });

    const zones = [];
    const zseen = new Set();
    (order.orderTargetPlace || []).slice().sort((a, b) => (a.seq || 0) - (b.seq || 0)).forEach(tp => {
      const id = trimStr(tp.targetPlace && tp.targetPlace.targetPlaceID);
      if (id && !zseen.has(id)) { zseen.add(id); zones.push(id); }
    });

    const colorInfoMap = new Map();
    (order.orderColor || []).forEach(c => {
      const info = { colorID: trimStr(c.color && c.color.colorID), colorName: trimStr(c.color && c.color.colorName), colorCode: trimStr(c.color && c.color.colorCode), colorValue: trimStr(c.color && c.color.colorValue), seq: c.seq || 0 };
      [info.colorID, info.colorCode, info.colorName].forEach(k => { if (k) colorInfoMap.set(k, info); });
    });
    const colorPartsOf = (code) => String(code).split(',').map(x => { const t = x.trim(); const info = colorInfoMap.get(t); return info ? { id: info.colorID || t, name: info.colorName || '', code: info.colorCode || '', value: info.colorValue || '' } : { id: t, name: '', code: '', value: '' }; });
    const colorSeqOf = (code) => { const i = colorInfoMap.get(String(code).split(',')[0].trim()); return i ? i.seq : 9999; };

    const firstBarcode = (order.productOR && order.productOR.productORInfo && order.productOR.productORInfo[0] && order.productOR.productORInfo[0].productBarcode) || '';
    const style = firstBarcode ? trimStr(firstBarcode.substr(+process.env.stylePos, +process.env.styleDigit)) : trimStr((order.productOR && order.productOR.productID) || orderID);

    const orderQtyMap = new Map();
    (order.productOR && order.productOR.productORInfo || []).forEach(pi => {
      const k = normZ(pi.targetPlace && pi.targetPlace.targetPlaceID) + '||' + normColor(pi.productColor) + '||' + normSize(pi.productSize);
      orderQtyMap.set(k, (orderQtyMap.get(k) || 0) + (+pi.productQty || 0));
    });

    // index scan: zone||color||size → { subNodeID → { factoryID → qty } }
    const scanIdx = new Map();
    const inHouseSet = new Set();
    (scanRows || []).forEach(d => {
      const zk = normZ(d.targetPlace), ck = normColor(d.color), sk = normSize(d.size);
      const rk = zk + '||' + ck + '||' + sk;
      const sub = trimStr(d.subNodeID);
      const fac = trimStr(d.factoryID);
      const qty = +d.countQty || 0;
      if (!scanIdx.has(rk)) scanIdx.set(rk, new Map());
      const subMap = scanIdx.get(rk);
      if (!subMap.has(sub)) subMap.set(sub, new Map());
      const facQ = subMap.get(sub);
      facQ.set(fac, (facQ.get(fac) || 0) + qty);
      if (isInHouse(fac)) inHouseSet.add(fac);
    });

    // outIdx: zone||color||size → (factoryID → qty) จาก productionNode (node-level, ใช้ทำ outS)
    const outIdx = new Map();
    (outRows || []).forEach(d => {
      const rk = normZ(d.targetPlace) + '||' + normColor(d.color) + '||' + normSize(d.size);
      const fac = trimStr(d.factoryID);
      if (!outIdx.has(rk)) outIdx.set(rk, new Map());
      const m = outIdx.get(rk);
      m.set(fac, (m.get(fac) || 0) + (+d.countQty || 0));
    });

    const facName = (fid) => (facMap.get(fid) && facMap.get(fid).name) || fid;
    const isOuts = (fid) => !isInHouse(fid);

    const byZone = {};
    zones.forEach(zone => {
      const zk = normZ(zone);
      const pfx = zk + '||';
      // rowKeys (color||size) จาก orderQty + scan
      const rowKeys = new Set();
      [...orderQtyMap.keys()].forEach(k => { if (k.startsWith(pfx)) rowKeys.add(k.substr(pfx.length)); });
      [...scanIdx.keys()].forEach(k => { if (k.startsWith(pfx)) rowKeys.add(k.substr(pfx.length)); });
      [...outIdx.keys()].forEach(k => { if (k.startsWith(pfx)) rowKeys.add(k.substr(pfx.length)); });

      const byColor = new Map();
      [...rowKeys].forEach(rk => {
        const [colorCode, sizeKey] = rk.split('||');
        const orderQty = orderQtyMap.get(pfx + rk) || 0;
        const subMap = scanIdx.get(pfx + rk) || new Map();
        // subCells: ต่อ subNode → in-house factories
        const subCells = subNodes.map(sn => {
          const facQ = subMap.get(sn.id) || new Map();
          const byFac = [];
          let qty = 0;
          facQ.forEach((q, fid) => { if (!isOuts(fid)) { byFac.push({ factoryID: fid, name: facName(fid), qty: q }); qty += q; } });
          byFac.sort((a, b) => b.qty - a.qty);
          return { qty, byFac };
        });
        // outS: outsource รวมทุก subnode → ต่อ factory
        const outFacQ = outIdx.get(pfx + rk) || new Map();
        const outByFac = []; let outQty = 0;
        outFacQ.forEach((q, fid) => { if (isOuts(fid)) { outByFac.push({ factoryID: fid, name: facName(fid), qty: q }); outQty += q; } });
        outByFac.sort((a, b) => b.qty - a.qty);

        if (!byColor.has(colorCode)) byColor.set(colorCode, []);
        byColor.get(colorCode).push({ sizeCode: sizeKey, sizeName: sizeName(sizeKey), sizeSeq: sizeSeqOf(sizeKey), orderQty, subCells, outS: { qty: outQty, byFac: outByFac } });
      });

      const colorGroups = [...byColor.entries()]
        .sort((a, b) => (colorSeqOf(a[0]) - colorSeqOf(b[0])) || (a[0] > b[0] ? 1 : -1))
        .map(([colorCode, sizeRows]) => {
          sizeRows.sort((a, b) => (a.sizeSeq - b.sizeSeq) || (a.sizeCode > b.sizeCode ? 1 : -1));
          return { colorCode, colorParts: colorPartsOf(colorCode), sizeRows };
        });

      // ข้าม zone ที่ไม่มี scan เลย
      const anyScan = colorGroups.some(g => g.sizeRows.some(r => r.outS.qty > 0 || r.subCells.some(c => c.qty > 0)));
      if (anyScan) byZone[zone] = { colorGroups };
    });

    const inHouse = [...inHouseSet].map(fid => ({ factoryID: fid, name: facName(fid) })).sort((a, b) => (a.factoryID > b.factoryID ? 1 : -1));

    // ★ เก็บเฉพาะ sub-node ที่มีข้อมูล in-house จริง (แอปเก่าไม่โชว์คอลัมน์ว่าง) + reindex subCells
    const used = new Array(subNodes.length).fill(false);
    Object.values(byZone).forEach(zb => zb.colorGroups.forEach(g => g.sizeRows.forEach(r => r.subCells.forEach((c, i) => { if (c.qty > 0) used[i] = true; }))));
    const keepIdx = subNodes.map((_, i) => i).filter(i => used[i] || subNodes[i].isEX);
    const subNodesF = keepIdx.map(i => subNodes[i]);
    Object.values(byZone).forEach(zb => zb.colorGroups.forEach(g => g.sizeRows.forEach(r => { r.subCells = keepIdx.map(i => r.subCells[i]); })));

    res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      orderID, nodeID, style, subNodes: subNodesF, inHouse,
      zones: zones.filter(z => byZone[z]), byZone,
    });
  } catch (err) {
    console.error('[repSubNodeScan]', err);
    return res.status(501).json({ success: false, message: 'error subnode scan' });
  }
};


// ══════════════════════════════════════════════════════════════════════
// ## รายงาน no.31 — Outsource Overall (ภาพรวมงานส่งโรงงานนอก)
//   ★ อ่านจาก cache auto_getCompanyOrderOutsource (dtcompanyorderoutsource) → เลขตรงแอปเก่า 100%
//   cache: data1=โรงนอกที่มี · data2=ส่งออกทั้งหมด(order×โรง) · data3=ค้างอยู่(order×โรง)
//          data4=ส่งออก(order×โรง×zone×color×size) · data5=ค้าง(order×โรง×zone×color×size)
//   แท็บ "Outsource all": order × โรงนอก → ส่งออก(เหลือง)/คืน=ส่งออก-ค้าง(เทา)/ค้าง(แดง)
//   แท็บรายโรง → order → ตารางสี×ไซซ์×โซน: ส่งไป(เทาใหญ่=data4)/ค้าง(แดงเล็ก=data5) + Total order=ยอดสั่งทั้ง order
// ══════════════════════════════════════════════════════════════════════

// ## GET /api/a/report/outsource-overall/:companyID/:seasonYear
// Requirement: overview — คืน factories(แท็บโรงนอก) + orders(แถว order พร้อม sent/received/remain ต่อโรง) · on-demand (ตัว detail แยก endpoint)
exports.repOutsourceOverall = async (req, res, next) => {
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  const orderStatusArr = ['open'];
  const trimStr = (s) => String(s == null ? '' : s).trim();

  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    // ## orders ของ season (+ style + ยอดสั่งรวม)
    const seasonOrders = await ShareFunc.getOrdersBySeasonYearArr(companyID, orderStatusArr, [seasonYear]);
    const orderIDArr = Array.from(new Set((seasonOrders || []).map(o => trimStr(o.orderID)).filter(Boolean)));
    const styleRows = await ShareFunc.getCurrentCompanyOrderStyle(companyID, orderStatusArr, orderIDArr);
    // styleRows: [{orderID, style, sumQty}] — รวมต่อ order (1 order อาจได้หลาย group)
    const orderMap = new Map(); // orderID -> {orderID, style, qtyAll}
    (styleRows || []).forEach(r => {
      const oid = trimStr(r.orderID);
      if (!oid) return;
      const cur = orderMap.get(oid) || { orderID: oid, style: '', qtyAll: 0 };
      cur.qtyAll += (+r.sumQty || 0);
      if (!cur.style) cur.style = trimStr(r.style);
      orderMap.set(oid, cur);
    });

    // ## โรงงานนอก (isOutsource) — ชื่อย่อ + ลำดับตาม factory list
    const facAll = await ShareFunc.getFactoryArrByCompanyID(companyID);
    const facNameMap = new Map();
    (facAll || []).forEach(f => facNameMap.set(trimStr(f.factoryID), trimStr(f.fInfo && (f.fInfo.abbreviation || f.fInfo.factoryName)) || trimStr(f.factoryID)));
    const outsFacOrder = (facAll || [])
      .filter(f => f.fInfo && f.fInfo.isOutsource)
      .sort((a, b) => (trimStr(a.factoryID) > trimStr(b.factoryID) ? 1 : -1))
      .map(f => trimStr(f.factoryID));

    // ## cache auto_getCompanyOrderOutsource (dt)
    const cache = await ShareFunc.get_auto_getCompanyOrderOutsource(companyID, seasonYear, 'auto_getCompanyOrderOutsource');
    const sentArr   = (cache && cache.data2) || []; // ส่งออกทั้งหมด
    const remainArr = (cache && cache.data3) || []; // ค้างอยู่

    // ## index: order||fac -> qty
    const sentMap = new Map(), remainMap = new Map();
    const facWithData = new Set();
    (sentArr || []).forEach(d => {
      const fid = trimStr(d.outsourcefactoryID);
      const k = trimStr(d.orderID) + '||' + fid;
      sentMap.set(k, (sentMap.get(k) || 0) + (+d.sumFactoryOutsQty || 0));
      if (fid) facWithData.add(fid);
    });
    (remainArr || []).forEach(d => {
      const k = trimStr(d.orderID) + '||' + trimStr(d.outsourcefactoryID);
      remainMap.set(k, (remainMap.get(k) || 0) + (+d.sumFactoryOutsQty || 0));
    });

    // ## แท็บโรงนอก = โรงนอกที่มีข้อมูลส่งจริง (เรียงตาม factory list; ที่ไม่อยู่ list ต่อท้าย)
    const factories = [];
    const seenFac = new Set();
    outsFacOrder.forEach(fid => { if (facWithData.has(fid)) { factories.push({ factoryID: fid, name: facNameMap.get(fid) || fid }); seenFac.add(fid); } });
    [...facWithData].filter(fid => !seenFac.has(fid)).sort().forEach(fid => factories.push({ factoryID: fid, name: facNameMap.get(fid) || fid }));

    // ## แถว order (ทุก order ใน season — แม้ไม่มี outsource ก็โชว์แถวว่าง ตามแอปเก่า)
    const orders = [...orderMap.values()]
      .sort((a, b) => (a.orderID > b.orderID ? 1 : a.orderID < b.orderID ? -1 : 0))
      .map(o => {
        const cells = {}; // factoryID -> {sent, received, remain}
        factories.forEach(f => {
          const k = o.orderID + '||' + f.factoryID;
          const sent = sentMap.get(k) || 0;
          if (sent > 0) {
            const remain = remainMap.get(k) || 0;
            cells[f.factoryID] = { sent, received: Math.max(0, sent - remain), remain };
          }
        });
        return { orderID: o.orderID, style: o.style || o.orderID, qtyAll: o.qtyAll, cells };
      });

    res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      seasonYear, factories, orders, hasCache: !!cache,
    });
  } catch (err) {
    console.error('[repOutsourceOverall]', err);
    return res.status(501).json({ success: false, message: 'error report outsource overall' });
  }
};

// ## GET /api/a/report/outsource-overall/detail/:companyID/:seasonYear/:factoryID/:orderID
// Requirement: drill — ตารางสี×ไซซ์×โซน ของ (โรงนอก+order) นั้น · data4=ส่งไป(เทา) data5=ค้าง(แดง) · orderTotal=ยอดสั่งทั้ง order
//   resolve ชื่อสี/ไซซ์/โซน จาก Order doc + Size master แบบเดียวกับ repProdScanPeriod (no.22) → ชื่อตรงกัน
exports.repOutsourceOverallDetail = async (req, res, next) => {
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  const factoryID = String(req.params.factoryID || '').trim();
  const orderID = String(req.params.orderID || '').trim();

  const trimStr   = (s) => String(s == null ? '' : s).trim();
  const normSize  = (s) => String(s == null ? '' : s).replace(/-/g, '').trim();
  const normColor = (s) => String(s == null ? '' : s).replace(/-/g, '').trim();
  const normZ     = (s) => String(s == null ? '' : s).replace(/-/g, '').trim().toUpperCase();

  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    // ## cache → filter เฉพาะ order+โรงนอกนี้
    const cache = await ShareFunc.get_auto_getCompanyOrderOutsource(companyID, seasonYear, 'auto_getCompanyOrderOutsource');
    const sentD   = ((cache && cache.data4) || []).filter(d => trimStr(d.orderID) === orderID && trimStr(d.outsourcefactoryID) === factoryID);
    const remainD = ((cache && cache.data5) || []).filter(d => trimStr(d.orderID) === orderID && trimStr(d.outsourcefactoryID) === factoryID);

    // ## Order doc — zones / color info / ยอดสั่งรวม
    const order = await Order.findOne({ companyID, orderID }).lean();

    // zones (targetPlaceID เรียงตาม seq)
    const zones = [];
    const zseen = new Set();
    ((order && order.orderTargetPlace) || []).slice().sort((a, b) => (a.seq || 0) - (b.seq || 0)).forEach(tp => {
      const id = trimStr(tp.targetPlace && tp.targetPlace.targetPlaceID);
      if (id && !zseen.has(id)) { zseen.add(id); zones.push(id); }
    });

    // color info (key ด้วย colorID/colorCode/colorName เหมือน repProdScanPeriod)
    const colorInfoMap = new Map();
    ((order && order.orderColor) || []).forEach(c => {
      const info = { colorID: trimStr(c.color && c.color.colorID), colorName: trimStr(c.color && c.color.colorName), colorCode: trimStr(c.color && c.color.colorCode), colorValue: trimStr(c.color && c.color.colorValue), seq: c.seq || 0 };
      [info.colorID, info.colorCode, info.colorName].forEach(k => { if (k) colorInfoMap.set(k, info); });
    });
    const colorPartsOf = (code) => String(code).split(',').map(x => { const t = x.trim(); const info = colorInfoMap.get(t); return info ? { id: info.colorID || t, name: info.colorName || '', code: info.colorCode || '', value: info.colorValue || '' } : { id: t, name: '', code: '', value: '' }; });
    const colorSeqOf = (code) => { const i = colorInfoMap.get(String(code).split(',')[0].trim()); return i ? i.seq : 9999; };

    // size master
    const sizeDocs = await Size.find({}, { size: 1, seq: 1 }).lean();
    const sizeMap = new Map();
    (sizeDocs || []).forEach(s => { const id = normSize(s.size && s.size.sizeID); if (id) sizeMap.set(id, { name: trimStr(s.size && s.size.sizeName) || id, seq: s.seq || 0 }); });
    const sizeName  = (c) => (sizeMap.get(c) && sizeMap.get(c).name) || c;
    const sizeSeqOf = (c) => (sizeMap.get(c) ? sizeMap.get(c).seq : 9999);

    // ยอดสั่งทั้ง order (Total order)
    const orderTotal = (((order && order.productOR && order.productOR.productORInfo) || [])
      .reduce((a, pi) => a + (+pi.productQty || 0), 0));

    // ## pivot: color||size||zone -> sent / remain
    const sentMap = new Map(), remainMap = new Map();
    sentD.forEach(d => { const k = normColor(d.color) + '||' + normSize(d.size) + '||' + normZ(d.targetPlace); sentMap.set(k, (sentMap.get(k) || 0) + (+d.countQty || 0)); });
    remainD.forEach(d => { const k = normColor(d.color) + '||' + normSize(d.size) + '||' + normZ(d.targetPlace); remainMap.set(k, (remainMap.get(k) || 0) + (+d.countQty || 0)); });

    // color -> set(size) ที่มีข้อมูล
    const byColor = new Map();
    [...sentMap.keys(), ...remainMap.keys()].forEach(k => {
      const [colorCode, sizeCode] = k.split('||');
      if (!byColor.has(colorCode)) byColor.set(colorCode, new Set());
      byColor.get(colorCode).add(sizeCode);
    });

    const colorGroups = [...byColor.entries()]
      .sort((a, b) => (colorSeqOf(a[0]) - colorSeqOf(b[0])) || (a[0] > b[0] ? 1 : -1))
      .map(([colorCode, sizeSet]) => {
        const sizeRows = [...sizeSet].map(sizeCode => {
          const cells = {}; // zone -> {sent, remain}
          zones.forEach(z => {
            const k = colorCode + '||' + sizeCode + '||' + normZ(z);
            const sent = sentMap.get(k) || 0;
            const remain = remainMap.get(k) || 0;
            if (sent > 0 || remain > 0) cells[z] = { sent, remain };
          });
          return { sizeCode, sizeName: sizeName(sizeCode), sizeSeq: sizeSeqOf(sizeCode), cells };
        }).sort((a, b) => (a.sizeSeq - b.sizeSeq) || (a.sizeCode > b.sizeCode ? 1 : -1));
        return { colorCode, colorParts: colorPartsOf(colorCode), sizeRows };
      });

    res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      factoryID, orderID, orderTotal, zones, colorGroups,
    });
  } catch (err) {
    console.error('[repOutsourceOverallDetail]', err);
    return res.status(501).json({ success: false, message: 'error report outsource overall detail' });
  }
};


// ══════════════════════════════════════════════════════════════════════
// ## รายงาน no.35 — Send Out & Receive (ส่งออก-รับกลับ โรงงานนอก)
//   ★ อ่าน cache dtcurrentcompanyorderoutsourcefac (sName auto_getCurrentCompanyOrderOutsourceFac) → เลขตรงแอปเก่า 100%
//   ★ อ่านแบบ merge ทุก doc ที่ match (กันกรณีมีหลาย doc แล้ว get_auto คืน doc แรกที่ data ว่าง)
//   แท็บโรงนอก (fInfo.factoryName2) → ตาราง วันที่(ใหม่→เก่า) | ส่งออกไปโรงนั้น | รับคืนจากโรงนั้น
//   PDF 2 หน้า: หน้า1 สรุป · หน้า2 รายมัด (node cell: '*'=ครบในโรง · ชื่อย่อโรงนอก=ครบโดย outsource · เลข=ยังไม่ครบ · ''=ยังไม่ถึง)
// ══════════════════════════════════════════════════════════════════════

const OUTS_STATE_SNAME = 'auto_getCurrentCompanyOrderOutsourceFac';

const NODE_COL_LABEL = {
  '1.COMPUTER-KNITTING': '1.COM..', '2.PANAL-INSPECTION': '2.PANAL', '3.LINKING': '3.LINKING',
  '4.MENDING': '4.MENDING', '5.WASHING': '5.WASHING', '6.PRESSING': '6.PRESSING', '7.QC': '7.QC',
};
const _MON = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
function dateNameSortVal(dn) {
  const m = String(dn || '').split('-');
  if (m.length !== 3) return 0;
  return (parseInt(m[2], 10) || 0) * 10000 + (_MON[m[1]] || 0) * 100 + (parseInt(m[0], 10) || 0);
}

// อ่าน cache ทุก doc ที่ match แล้ว merge facs by factoryID (รวม dateList by dateName)
async function readOutsStateCacheMerged(companyID, seasonYear) {
  const DtOutsState = require('../../models/m-dt-currentcompanyorderoutsourcefac');
  const docs = await DtOutsState.find({ companyID, seasonYear, sName: OUTS_STATE_SNAME }, { data: 1, _id: 0 }).lean();
  if (!docs || !docs.length) return { facs: null, docsFound: 0 };
  const facMap = new Map();
  for (const d of docs) {
    for (const f of (d.data || [])) {
      const fid = String(f.factoryID == null ? '' : f.factoryID).trim();
      if (!fid) continue;
      if (!facMap.has(fid)) facMap.set(fid, { factoryID: fid, factoryName: f.factoryName, factoryName2: f.factoryName2, dateList: [], _dm: new Map() });
      const tgt = facMap.get(fid);
      for (const dl of (f.dateList || [])) {
        const key = String(dl.dateName || '');
        if (tgt._dm.has(key)) {
          const ex = tgt._dm.get(key);
          ex.out = (ex.out || []).concat(dl.out || []);
          ex.receive = (ex.receive || []).concat(dl.receive || []);
        } else {
          const nd = { dateName: dl.dateName, out: [...(dl.out || [])], receive: [...(dl.receive || [])] };
          tgt._dm.set(key, nd); tgt.dateList.push(nd);
        }
      }
    }
  }
  const facs = [...facMap.values()].map(({ _dm, ...f }) => f);
  return { facs, docsFound: docs.length };
}

// ## GET /api/a/report/outsource-state/:companyID/:seasonYear  (overview: แท็บโรงนอก)
exports.repOutsourceStateOverview = async (req, res, next) => {
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  const trimStr = (s) => String(s == null ? '' : s).trim();
  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    const { facs, docsFound } = await readOutsStateCacheMerged(companyID, seasonYear);

    const facAll = await ShareFunc.getFactoryArrByCompanyID(companyID);
    const nameMap = new Map();   // แท็บ = ชื่อเต็ม (fInfo.factoryName)
    (facAll || []).forEach(f => nameMap.set(trimStr(f.factoryID),
      trimStr(f.fInfo && f.fInfo.factoryName) || trimStr(f.factoryID)));

    const list = facs || [];
    const factories = list
      .filter(f => Array.isArray(f.dateList) && f.dateList.some(dl => (dl.out && dl.out.length) || (dl.receive && dl.receive.length)))
      .map(f => ({
        factoryID: trimStr(f.factoryID),
        name: nameMap.get(trimStr(f.factoryID)) || trimStr(f.factoryName) || trimStr(f.factoryName2) || trimStr(f.factoryID),
      }));

    res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      seasonYear, factories, hasCache: docsFound > 0,
      _dbg: { docsFound, totalFacs: list.length, keptFacs: factories.length, companyID, seasonYear, facAllCount: (facAll || []).length },
    });
  } catch (err) {
    console.error('[repOutsourceStateOverview]', err);
    return res.status(501).json({ success: false, message: 'error report outsource state overview', _dbg: { err: String(err && err.message || err) } });
  }
};

// ## GET /api/a/report/outsource-state/detail/:companyID/:seasonYear/:factoryID
exports.repOutsourceStateDetail = async (req, res, next) => {
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  const factoryID = String(req.params.factoryID || '').trim();
  const trimStr = (s) => String(s == null ? '' : s).trim();
  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    const { facs } = await readOutsStateCacheMerged(companyID, seasonYear);
    const fac = (facs || []).find(f => trimStr(f.factoryID) === factoryID);

    const mapEntry = (e) => ({
      orderID: trimStr(e.orderID), zone: trimStr(e.targetPlaceID),
      colorCode: trimStr(e.colorCode), colorName: trimStr(e.colorName) || trimStr(e.colorCode),
      colorValue: trimStr(e.colorValue) || '', qty: +e.qty || 0,
      fac2: trimStr(e.factoryID2), bundleCount: Array.isArray(e.bundleNos) ? e.bundleNos.length : 0,
    });

    const dates = ((fac && fac.dateList) || [])
      .map(dl => ({ dateName: trimStr(dl.dateName), _sv: dateNameSortVal(dl.dateName), out: (dl.out || []).map(mapEntry), receive: (dl.receive || []).map(mapEntry) }))
      .filter(d => d.out.length || d.receive.length)
      .sort((a, b) => b._sv - a._sv)
      .map(({ _sv, ...d }) => d);

    const facAll = await ShareFunc.getFactoryArrByCompanyID(companyID);
    const fdoc = (facAll || []).find(f => trimStr(f.factoryID) === factoryID);
    const factoryName = trimStr(fdoc && fdoc.fInfo && fdoc.fInfo.factoryName)
      || trimStr(fac && fac.factoryName) || trimStr(fac && fac.factoryName2) || factoryID;

    res.status(200).json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), factoryID, factoryName, dates });
  } catch (err) {
    console.error('[repOutsourceStateDetail]', err);
    return res.status(501).json({ success: false, message: 'error report outsource state detail' });
  }
};

// ## GET /api/a/report/outsource-state/bundles/:companyID/:seasonYear/:factoryID?date=&side=&orderID=&zone=&color=
//   node cell: reached=นับ distinct piece ที่ toNode==node · '*'=ครบในโรง · ชื่อย่อโรงนอก(factoryName2)=ครบโดย outsource · เลข=ยังไม่ครบ · ''=ยังไม่ถึง
exports.repOutsourceStateBundles = async (req, res, next) => {
  const companyID = req.params.companyID;
  const seasonYear = req.params.seasonYear;
  const factoryID = String(req.params.factoryID || '').trim();
  const date = String(req.query.date || '').trim();
  const side = String(req.query.side || 'out').trim() === 'receive' ? 'receive' : 'out';
  const orderID = String(req.query.orderID || '').trim();
  const zone = String(req.query.zone || '').trim();
  const color = String(req.query.color || '').trim();
  const trimStr = (s) => String(s == null ? '' : s).trim();

  try {
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    const { facs } = await readOutsStateCacheMerged(companyID, seasonYear);
    const fac = (facs || []).find(f => trimStr(f.factoryID) === factoryID);

    const bundleSet = new Set();
    const fac2Set = new Set();   // โรงในเครือที่ส่ง/รับ (factoryID2 = TL/TL2/SD)
    let colorName = color;
    for (const dl of ((fac && fac.dateList) || [])) {
      if (trimStr(dl.dateName) !== date) continue;
      for (const e of (dl[side] || [])) {
        if (trimStr(e.orderID) === orderID && trimStr(e.targetPlaceID) === zone && trimStr(e.colorCode) === color) {
          (e.bundleNos || []).forEach(b => bundleSet.add(b));
          colorName = trimStr(e.colorName) || color;
          if (trimStr(e.factoryID2)) fac2Set.add(trimStr(e.factoryID2));
        }
      }
    }
    const bundles = Array.from(bundleSet);

    // ชื่อย่อโรง (fInfo.factoryName2) ทุกโรง — ใช้แปลง outsource factoryID → ชื่อย่อในช่อง node
    const facAll = await ShareFunc.getFactoryArrByCompanyID(companyID);
    const shortMap = new Map();
    const outsSet = new Set();   // โรงนอก (fInfo.isOutsource) — ใช้เช็คว่า node ทำโดยโรงนอกไหม (จาก factoryID ไม่พึ่ง flag)
    (facAll || []).forEach(f => {
      const fid = trimStr(f.factoryID);
      shortMap.set(fid, trimStr(f.fInfo && (f.fInfo.factoryName2 || f.fInfo.factoryName)) || fid);
      if (f.fInfo && f.fInfo.isOutsource) outsSet.add(fid);
    });

    const flow = await NodeFlow.findOne({ companyID, flowType: 'main' }).lean();
    let mainNodes = [];
    if (flow && Array.isArray(flow.flowSeq) && flow.flowSeq.length) {
      mainNodes = flow.flowSeq.slice()
        .sort((a, b) => String(a.seqNo).localeCompare(String(b.seqNo), undefined, { numeric: true }))
        .map(s => trimStr(s.nodeID)).filter(n => n && n !== 'starterNode');
    }
    const nodeCols = mainNodes.map(n => ({ id: n, label: NODE_COL_LABEL[n] || n }));

    let rowsOut = [];
    if (bundles.length) {
      const sizeRows = await OrderProduction.aggregate([
        { $match: { companyID, orderID, bundleNo: { $in: bundles } } },
        { $group: {
          _id: '$bundleNo',
          size: { $first: { $rtrim: { input: { $toUpper: { $substr: ['$productBarcodeNoReal', +process.env.sizePos, +process.env.sizeDigit] } }, chars: '-' } } },
          qty: { $sum: 1 },
        } },
      ]).allowDiskUse(true);
      const sizeMap = new Map();
      sizeRows.forEach(r => sizeMap.set(r._id, { size: r.size || '', qty: r.qty || 0 }));

      // ★ ทำเสร็จ node X + ใครทำ = scan ที่ fromNode==X (ชิ้น "ออกจาก" X = ทำ X เสร็จ) · factoryID ของ scan นั้น = ผู้ทำ X
      //   (toNode==X = แค่ "เข้า" X บันทึกโดยโรงก่อนหน้า ห้ามใช้!) · โรงนอก = factoryID อยู่ใน outsSet
      const doneRows = await OrderProduction.aggregate([
        { $match: { companyID, orderID, bundleNo: { $in: bundles } } },
        { $unwind: '$productionNode' },
        { $match: { 'productionNode.fromNode': { $in: mainNodes } } },
        { $group: {
          _id: { bundleNo: '$bundleNo', node: '$productionNode.fromNode' },
          pcs: { $addToSet: '$_id' },
          facs: { $addToSet: '$productionNode.factoryID' },
        } },
        { $project: { _id: 1, done: { $size: '$pcs' }, facs: 1 } },
      ]).allowDiskUse(true);
      const doneMap = new Map();
      doneRows.forEach(r => {
        const outsFac = (r.facs || []).map(x => trimStr(x)).filter(f => outsSet.has(f))[0] || '';
        doneMap.set(r._id.bundleNo + '|' + r._id.node, { done: r.done || 0, outsFac });
      });

      rowsOut = bundles.map(b => {
        const sm = sizeMap.get(b) || { size: '', qty: 0 };
        const cells = {};
        mainNodes.forEach(n => {
          const info = doneMap.get(b + '|' + n) || { done: 0, outsFac: '' };
          if (info.done <= 0) { cells[n] = ''; return; }
          if (info.outsFac) {
            // โรงนอกทำเสร็จ → object {o:ชื่อย่อ, n:จำนวน} ให้ FE render "HON" + "[12]"(เล็ก จืด)
            cells[n] = { o: (shortMap.get(info.outsFac) || info.outsFac), n: info.done };
          } else if (info.done >= sm.qty && sm.qty > 0) {
            cells[n] = '*';       // ในโรงครบทั้งมัด
          } else {
            cells[n] = info.done; // ในโรงยังไม่ครบ → จำนวนที่ทำเสร็จ
          }
        });
        return { bundleNo: b, size: sm.size, qty: sm.qty, cells };
      }).sort((a, b) => (sizeOrderVal(a.size) - sizeOrderVal(b.size)) || (Number(a.bundleNo) - Number(b.bundleNo)));
    }

    const totalQty = rowsOut.reduce((s, x) => s + (x.qty || 0), 0);
    const facNum = (String(factoryID).match(/\d+/) || ['0'])[0];
    const repNo = String(parseInt(facNum, 10) || 0).padStart(2, '0');

    res.status(200).json({
      success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
      header: { orderID, zone, colorCode: color, colorName, side, sendDate: date, sendDateYmd: String(dateNameSortVal(date)), factoryID, outsFacName2: shortMap.get(factoryID) || factoryID, inHouseFacs: [...fac2Set], repNo, seasonYear, totalBundles: rowsOut.length, totalQty },
      nodes: nodeCols, bundles: rowsOut,
    });
  } catch (err) {
    console.error('[repOutsourceStateBundles]', err);
    return res.status(501).json({ success: false, message: 'error report outsource state bundles' });
  }
};

function sizeOrderVal(s) {
  return ({ XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6, '2XL': 6, XXXL: 7, '3XL': 7 })[String(s || '').toUpperCase()] || 99;
}
