// ═══════════════════════════════════════════════════════════════════════════
// c-order2.js — NEW clean controller: Order module (แอปใหม่ angularGarmentAcc2)
//   mount: /api/a/order  ·  ชี้ collection Order เดิม (m-order) — ไม่แตะ c-order.js เก่า
//
// requirement (จาก user 2026-07-16 + logic เก่า c-order.js):
//   - order 1 ใบ = 1 style (product) · create ต้องเลือก customer + product + orderID ก่อน
//   - ตั้งค่าสี (orderColor) + ตั้งค่า country (orderTargetPlace) จัดลำดับเองได้ — ต้องเสร็จก่อนลงรายการ
//   - ลงรายการสั่ง (productORInfo): target→year→สี→ไซซ์→qty → Add สะสม → กดบันทึกเป็นช่วงๆ ได้
//     server merge dedup ด้วย productBarcode (ซ้ำ = ทับด้วยค่าใหม่) — ตาม logic เก่า
//   - customerOR ล็อกหลัง create (แก้ไม่ได้ — ตาม logic เก่า)
//   - audit log ทุก action ผ่าน writeLog (module 'order')
// ═══════════════════════════════════════════════════════════════════════════
const ShareFunc = require("../c-api-app-share-function");
const Order     = require("../../models/m-order");
const Product   = require("../../models/m-product");
const Useracc   = require("../../models/m-acc-user");
const OrderProduction = require("../../models/m-orderProduction");
const { writeLog } = require("./c-log-util");

// ## คนทำ (userID จาก token + ชื่อจริงจาก Useracc) — ใช้ใน revise/delete log
async function actorFull(req) {
  const userID = req.userData?.tokenSet?.userID || '';
  const uacc = userID ? await Useracc.findOne({ userID }, { 'uInfo.userName': 1 }).lean() : null;
  return { userID, userName: uacc?.uInfo?.userName || '' };
}

// ── helpers ──────────────────────────────────────────────────────────────────
const tokenRefresh = async (req) => {
  const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
  return { token, expiresIn: Number(process.env.TOKENExpiresIn) };
};
const actor = (req) => ({
  userID:   req.userData?.tokenSet?.userID || '',
  userName: req.userData?.userName || '',
});

// ── ymdToUTC — วันปฏิทิน (orderDate/deliveryDate) เก็บเป็น UTC-midnight ตามกฎวันที่ ──
function ymdToUTC(ymd) { return new Date(String(ymd).slice(0, 10) + 'T00:00:00.000Z'); }

// ══════════════════════════════════════════════════════════════════════════
// GET /api/a/order/seasons/:companyID
// requirement: รายการ season ทั้งหมดที่มี order (ใช้เติม dropdown) เรียงใหม่→เก่า
// ══════════════════════════════════════════════════════════════════════════
exports.getSeasons = async (req, res, next) => {
  try {
    const seasons = await Order.distinct('seasonYear', { companyID: req.params.companyID });
    seasons.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));   // desc
    return res.json({ success: true, seasons, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// GET /api/a/order/list/:companyID/:seasonYear
// requirement: รายการ order ของ season (ทุกสถานะ) — โปรเจคเบาๆ ไม่ส่ง array ใหญ่
//   + จำนวนรายการสั่ง/ยอดรวม/จำนวนสี/จำนวน country (ไว้โชว์ความคืบหน้าการตั้งค่า)
//   + รูปสินค้า (imageProfile จาก Product master)
// ══════════════════════════════════════════════════════════════════════════
exports.getOrderList = async (req, res, next) => {
  const { companyID, seasonYear } = req.params;
  try {
    const orders = await Order.aggregate([
      { $match: { companyID, seasonYear } },
      { $project: {
          _id: 0, orderID: 1, seasonYear: 1, orderStatus: 1, factoryID: 1,
          orderDate: 1, deliveryDate: 1, orderDetail: 1, customerOR: 1,
          productID:   '$productOR.productID',
          productName: '$productOR.productName',
          lineCount:  { $size: { $ifNull: ['$productOR.productORInfo', []] } },
          totalQty:   { $sum: '$productOR.productORInfo.productQty' },
          colorCount: { $size: { $ifNull: ['$orderColor', []] } },
          zoneCount:  { $size: { $ifNull: ['$orderTargetPlace', []] } },
      } },
      { $sort: { orderID: 1 } },
    ]);

    // ## รูปสินค้า: lookup imageProfile จาก Product master (เฉพาะ productID ที่อยู่ในหน้า)
    const pids = [...new Set(orders.map(o => o.productID).filter(Boolean))];
    const prods = await Product.find({ companyID, productID: { $in: pids } }, { productID: 1, imageProfile: 1, _id: 0 }).lean();
    const imgMap = {};
    for (const p of prods) imgMap[p.productID] = p.imageProfile || '';
    for (const o of orders) o.imageProfile = imgMap[o.productID] || '';

    return res.json({ success: true, orders, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// GET /api/a/order/one/:companyID/:orderID
// requirement: order เต็มใบ (ใช้ในหน้า edit ทุก tab)
// ══════════════════════════════════════════════════════════════════════════
exports.getOrderOne = async (req, res, next) => {
  const { companyID, orderID } = req.params;
  try {
    const order = await Order.findOne({ companyID, orderID }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'order not found' });
    return res.json({ success: true, order, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// POST /api/a/order/create
// requirement: สร้างหัว order ใหม่ — orderID ห้ามซ้ำ (ไม่ upsert ทับแบบเก่า กันเผลอทับข้อมูล)
//   เริ่มต้น: orderStatus 'open' · orderColor/orderTargetPlace/productORInfo ว่าง (ไปตั้งใน tab)
//   customerOR + productOR.productID ล็อกหลังสร้าง
// body: { companyID, factoryID, orderID, seasonYear, orderDate(YYYY-MM-DD), orderDetail,
//         customerOR:{customerID,customerName}, productID, productName, productCustomerCode }
// ══════════════════════════════════════════════════════════════════════════
exports.createOrder = async (req, res, next) => {
  const { companyID, factoryID, orderID, seasonYear, orderDate, orderDetail,
          customerOR, productID, productName, productCustomerCode } = req.body;
  const oid = String(orderID || '').trim();
  if (!companyID || !oid || !customerOR?.customerID || !productID)
    return res.status(400).json({ success: false, message: 'companyID + orderID + customer + product required' });
  try {
    if (await Order.findOne({ companyID, orderID: oid }).lean())
      return res.status(400).json({ success: false, message: `Order ${oid} มีอยู่แล้ว` });

    const d = orderDate ? ymdToUTC(orderDate) : ymdToUTC(new Date().toISOString());
    const order = await Order.create({
      orderID: oid, companyID, factoryID: factoryID || '',
      seasonYear: seasonYear || '', ver: 2, bundleNo: 1,
      orderStatus: 'open',
      orderDetail: orderDetail || oid,
      orderDate: d, deliveryDate: d,
      customerOR: { customerID: customerOR.customerID, customerName: customerOR.customerName || '' },
      orderTargetPlace: [], orderColor: [],
      productOR: {
        productID, productName: productName || oid,
        productORDetail: '', productCustomerCode: productCustomerCode || '',
        productORInfo: [], productORRewriteInfo: [], subNodeFlowCost: [],
      },
      createBy: actor(req),
      orderSetting: { qtyMaxView: [] },
    });

    await writeLog({ module: 'order', companyID, factoryID: factoryID || '', action: 'create',
      summary: `สร้าง Order ${oid} · ${customerOR.customerName || customerOR.customerID} · season ${seasonYear || '-'}`,
      meta: { orderID: oid, productID }, ...actor(req) });

    return res.status(201).json({ success: true, order, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// PUT /api/a/order/header
// requirement: แก้หัว order — เฉพาะ orderDetail / orderDate / deliveryDate / productORDetail / orderStatus
//   (customerOR + productID ล็อก — ตาม logic เก่า)
// ══════════════════════════════════════════════════════════════════════════
exports.updateHeader = async (req, res, next) => {
  const { companyID, orderID, orderDetail, orderDate, deliveryDate, productORDetail, orderStatus } = req.body;
  if (!companyID || !orderID)
    return res.status(400).json({ success: false, message: 'companyID + orderID required' });
  try {
    const set = {};
    if (orderDetail   !== undefined) set.orderDetail = orderDetail;
    if (orderDate)                   set.orderDate = ymdToUTC(orderDate);
    if (deliveryDate)                set.deliveryDate = ymdToUTC(deliveryDate);
    if (productORDetail !== undefined) set['productOR.productORDetail'] = productORDetail;
    if (orderStatus)                 set.orderStatus = orderStatus;   // open | close (เผื่อปิด order)

    const order = await Order.findOneAndUpdate({ companyID, orderID }, { $set: set }, { new: true }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'order not found' });

    await writeLog({ module: 'order', companyID, factoryID: order.factoryID || '', action: 'update',
      summary: `แก้หัว Order ${orderID}`, meta: { orderID, set: Object.keys(set) }, ...actor(req) });

    return res.json({ success: true, order, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// PUT /api/a/order/color
// requirement: ตั้งค่าสีของ order (เลือกจาก color set ลูกค้า + จัดลำดับเอง)
//   replace ทั้ง array + re-seq 1..n ตามลำดับที่ส่งมา (ตาม logic เก่า putOrderColorUpdate)
// body: { companyID, orderID, orderColor: [{setName, color:{colorID,colorName,colorValue,colorCode}}] }
// ══════════════════════════════════════════════════════════════════════════
exports.updateColor = async (req, res, next) => {
  const { companyID, orderID, orderColor } = req.body;
  if (!companyID || !orderID || !Array.isArray(orderColor))
    return res.status(400).json({ success: false, message: 'companyID + orderID + orderColor[] required' });
  try {
    const cleaned = orderColor
      .filter(c => c?.color?.colorID)
      .map((c, i) => ({ seq: i + 1, setName: c.setName || '', color: {
        colorID: c.color.colorID, colorName: c.color.colorName || '',
        colorValue: c.color.colorValue || '', colorCode: c.color.colorCode || '',
      } }));

    const order = await Order.findOneAndUpdate({ companyID, orderID },
      { $set: { orderColor: cleaned } }, { new: true }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'order not found' });

    await writeLog({ module: 'order', companyID, factoryID: order.factoryID || '', action: 'update',
      summary: `ตั้งค่าสี Order ${orderID} · ${cleaned.length} สี`,
      meta: { orderID, colors: cleaned.map(c => c.color.colorID) }, ...actor(req) });

    return res.json({ success: true, order, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// PUT /api/a/order/zone
// requirement: ตั้งค่า country/targetPlace ของ order (+ deliveryDate ต่อประเทศ + จัดลำดับเอง)
//   replace ทั้ง array + re-seq · กันซ้ำด้วย countryID (ตาม logic เก่า putOrderZoneUpdate)
// body: { companyID, orderID, orderTargetPlace: [{deliveryDate(YYYY-MM-DD), targetPlace:{...}}] }
// ══════════════════════════════════════════════════════════════════════════
exports.updateZone = async (req, res, next) => {
  const { companyID, orderID, orderTargetPlace } = req.body;
  if (!companyID || !orderID || !Array.isArray(orderTargetPlace))
    return res.status(400).json({ success: false, message: 'companyID + orderID + orderTargetPlace[] required' });
  try {
    const seen = new Set();
    const cleaned = [];
    for (const z of orderTargetPlace) {
      const tp = z?.targetPlace;
      if (!tp?.countryID || seen.has(tp.countryID)) continue;   // กัน country ซ้ำ
      seen.add(tp.countryID);
      cleaned.push({
        seq: cleaned.length + 1,
        deliveryDate: z.deliveryDate ? ymdToUTC(z.deliveryDate) : new Date(),
        targetPlace: {
          targetPlaceID: tp.targetPlaceID || '', targetPlaceName: tp.targetPlaceName || '',
          countryID: tp.countryID, countryName: tp.countryName || tp.countryID,
        },
      });
    }

    const order = await Order.findOneAndUpdate({ companyID, orderID },
      { $set: { orderTargetPlace: cleaned } }, { new: true }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'order not found' });

    await writeLog({ module: 'order', companyID, factoryID: order.factoryID || '', action: 'update',
      summary: `ตั้งค่า country Order ${orderID} · ${cleaned.length} ประเทศ`,
      meta: { orderID, countries: cleaned.map(z => z.targetPlace.countryID) }, ...actor(req) });

    return res.json({ success: true, order, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// PUT /api/a/order/lines
// requirement: บันทึกรายการสั่ง (productORInfo) — user กด Add สะสมฝั่งหน้าเว็บ แล้วกดบันทึกเป็นช่วงๆ
//   client ส่งเฉพาะรายการใหม่/ที่แก้ → server merge เข้า array เดิม dedup ด้วย productBarcode
//   (barcode ซ้ำ = ทับด้วยค่าใหม่ — ตาม logic เก่า) · guard: ต้องตั้งสี + country ก่อน
// body: { companyID, orderID, lines: [{factoryID, productBarcode, targetPlace{}, productColor,
//         productSize, productQty, productLossQty, productYear, productSex}] }
// ══════════════════════════════════════════════════════════════════════════
exports.saveLines = async (req, res, next) => {
  const { companyID, orderID, lines } = req.body;
  if (!companyID || !orderID || !Array.isArray(lines) || lines.length === 0)
    return res.status(400).json({ success: false, message: 'companyID + orderID + lines[] required' });
  try {
    const cur = await Order.findOne({ companyID, orderID }).lean();
    if (!cur) return res.status(404).json({ success: false, message: 'order not found' });

    // ## guard ตาม workflow: ต้องตั้งค่าสี + country ให้เสร็จก่อนลงรายการ
    if (!(cur.orderColor || []).length || !(cur.orderTargetPlace || []).length)
      return res.status(400).json({ success: false, message: 'ต้องตั้งค่าสี และ country ของ order ให้เสร็จก่อนลงรายการ' });

    // ## merge: ของเดิมทั้งหมด + รายการใหม่ (barcode ซ้ำ = ทับ)
    const merged = [...(cur.productOR?.productORInfo || [])];
    let added = 0, replaced = 0;
    for (const l of lines) {
      if (!l?.productBarcode || !String(l.productBarcode).trim()) continue;
      const row = {
        factoryID: l.factoryID || cur.factoryID || '',
        productBarcode: l.productBarcode,
        targetPlace: {
          targetPlaceID: l.targetPlace?.targetPlaceID || '', targetPlaceName: l.targetPlace?.targetPlaceName || '',
          countryID: l.targetPlace?.countryID || '', countryName: l.targetPlace?.countryName || '',
        },
        productColor: l.productColor || '', productSize: l.productSize || '',
        productQty: Math.max(0, Number(l.productQty) || 0),
        productLossQty: Math.max(0, Number(l.productLossQty) || 0),
        productYear: l.productYear || '', productSex: l.productSex || '-',
      };
      const idx = merged.findIndex(x => x.productBarcode === row.productBarcode);
      if (idx < 0) { merged.push(row); added++; }
      else { merged[idx] = { ...merged[idx], ...row }; replaced++; }
    }

    const order = await Order.findOneAndUpdate({ companyID, orderID },
      { $set: { 'productOR.productORInfo': merged } }, { new: true }).lean();

    await writeLog({ module: 'order', companyID, factoryID: cur.factoryID || '', action: 'update',
      summary: `บันทึกรายการสั่ง Order ${orderID} · เพิ่ม ${added} ทับ ${replaced} · รวม ${merged.length} รายการ`,
      meta: { orderID, added, replaced, total: merged.length }, ...actor(req) });

    return res.json({ success: true, order, added, replaced, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// PUT /api/a/order/revise-qty
// requirement: Revise Order QTY — ลูกค้าขอเปลี่ยนจำนวน แก้ทีหลังได้ + ตรวจสอบย้อนหลังได้ว่าใครแก้
//   - แก้ productQty ของ line (จับด้วย productBarcode) — รับหลายรายการต่อครั้ง (batch)
//   - ทุกการแก้ push ประวัติลง productOR.productORRewriteInfo (ค่าเก่า/ใหม่ + เวลา + คนแก้)
//   - audit log module 'order' action 'revise'
// body: { companyID, orderID, changes: [{ productBarcode, newQty }] }
// ══════════════════════════════════════════════════════════════════════════
exports.reviseQty = async (req, res, next) => {
  const { companyID, orderID, changes } = req.body;
  if (!companyID || !orderID || !Array.isArray(changes) || changes.length === 0)
    return res.status(400).json({ success: false, message: 'companyID + orderID + changes[] required' });
  try {
    const cur = await Order.findOne({ companyID, orderID }).lean();
    if (!cur) return res.status(404).json({ success: false, message: 'order not found' });

    // ## คนแก้ — userID จาก token + ชื่อจริงจาก Useracc (ไว้โชว์ในประวัติ)
    const by = await actorFull(req);

    const info    = [...(cur.productOR?.productORInfo || [])];
    const rewrite = [...(cur.productOR?.productORRewriteInfo || [])];
    const applied = [];

    for (const ch of changes) {
      const idx = info.findIndex(x => x.productBarcode === ch.productBarcode);
      if (idx < 0) continue;
      const oldQty = +info[idx].productQty || 0;
      const newQty = Math.max(0, Number(ch.newQty) || 0);
      if (newQty === oldQty) continue;   // ไม่เปลี่ยน = ข้าม

      info[idx] = { ...info[idx], productQty: newQty };
      // ## ประวัติการ revise (เก็บค่าเก่า/ใหม่ + คนแก้ + เวลา — schema เดิมรองรับอยู่แล้ว)
      rewrite.push({
        datetime: new Date(),
        factoryID: info[idx].factoryID || '',
        productBarcode: info[idx].productBarcode,
        targetPlace: info[idx].targetPlace,
        productColor: info[idx].productColor, productSize: info[idx].productSize,
        productQtyOld: oldQty, productQty: newQty,
        productLossQty: +info[idx].productLossQty || 0,
        productYear: info[idx].productYear || '', productSex: info[idx].productSex || '-',
        createBy: by,
      });
      applied.push({ barcode: ch.productBarcode, oldQty, newQty });
    }

    if (!applied.length)
      return res.status(400).json({ success: false, message: 'ไม่มีรายการที่เปลี่ยนแปลง (จำนวนเท่าเดิม/หา barcode ไม่เจอ)' });

    const order = await Order.findOneAndUpdate({ companyID, orderID },
      { $set: { 'productOR.productORInfo': info, 'productOR.productORRewriteInfo': rewrite } },
      { new: true }).lean();

    await writeLog({ module: 'order', companyID, factoryID: cur.factoryID || '', action: 'revise',
      summary: `Revise QTY Order ${orderID} · ${applied.length} รายการ (${applied.map(a => `${a.oldQty}→${a.newQty}`).join(', ')})`,
      meta: { orderID, applied }, userID: by.userID, userName: by.userName });

    return res.json({ success: true, order, applied, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// POST /api/a/order/line/delete   (POST เพราะ barcode มี space ใส่ url ไม่ได้)
// requirement: ลบรายการสั่ง 1 แถว — ลบจริงออกจาก productORInfo (hard delete)
//   - guard: มีการผลิตแล้ว (OrderProduction ใช้ barcode นี้) → ห้ามลบ (กันยอด/ค่าแรงพัง)
//   - audit log module 'order' action 'delete' เก็บรายละเอียดแถวที่ลบครบ (กู้ด้วยมือได้จาก log)
// body: { companyID, orderID, productBarcode }
// ══════════════════════════════════════════════════════════════════════════
exports.deleteLine = async (req, res, next) => {
  const { companyID, orderID, productBarcode } = req.body;
  if (!companyID || !orderID || !productBarcode)
    return res.status(400).json({ success: false, message: 'companyID + orderID + productBarcode required' });
  try {
    const cur = await Order.findOne({ companyID, orderID }).lean();
    if (!cur) return res.status(404).json({ success: false, message: 'order not found' });

    const info = cur.productOR?.productORInfo || [];
    const idx = info.findIndex(x => x.productBarcode === productBarcode);
    if (idx < 0) return res.status(404).json({ success: false, message: 'ไม่พบรายการ (barcode ไม่ตรง)' });

    // ## guard: มี bundle ผลิตแล้วที่ขึ้นต้นด้วย barcode นี้ (productBarcodeNoReal = barcode + runNo)
    const esc = String(productBarcode).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const used = await OrderProduction.findOne(
      { companyID, orderID, productBarcodeNoReal: { $regex: `^${esc}` } },
      { bundleNo: 1 }
    ).lean();
    if (used)
      return res.status(400).json({ success: false, message: `ลบไม่ได้ — มีการผลิตใช้รายการนี้แล้ว (เช่น bundle ${used.bundleNo})` });

    const removed = info[idx];
    const nextInfo = info.filter((_, i) => i !== idx);
    const order = await Order.findOneAndUpdate({ companyID, orderID },
      { $set: { 'productOR.productORInfo': nextInfo } }, { new: true }).lean();

    const by = await actorFull(req);
    await writeLog({ module: 'order', companyID, factoryID: cur.factoryID || '', action: 'delete',
      summary: `ลบรายการสั่ง Order ${orderID} · ${removed.targetPlace?.countryID || ''} · สี ${removed.productColor} · ไซซ์ ${removed.productSize} · ${removed.productQty} ตัว`,
      meta: { orderID, removed },   // เก็บทั้งแถวไว้ใน log — ตรวจย้อน/คีย์กลับได้
      userID: by.userID, userName: by.userName });

    return res.json({ success: true, order, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ LOCKJOB — เฟส 3 "ล็อกงาน" (สร้างคิวผลิต / gen bundle)  [AI ใหม่ 2026-07-17] ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
// requirement (จาก user 2026-07-17):
//   - ล็อกทีละ สี×zone×ไซซ์ (zone barcode 37 หลัก country='-----') เข้า node แรกเสมอ
//   - qty ≤ createOrderQtyMaxPerRound (1200) · แตกโหลละ bundleItems (default 12)
//     เศษท้ายเป็น bundle สุดท้าย เช่น 125 → 11 โหล (10 เต็ม + เศษ 5)
//   - yarn lot บังคับ ≥ 1 (หลายล๊อตได้)
//   - ★ ตัด outsource ออก — ล็อกเข้าโรงตัวเองเท่านั้น (productionNode: starterNode→toNode, normal)
//   - ★ bundleNo ห้ามซ้ำเด็ดขาด → กัน 3 ชั้น: counter atomic + BundleReserve unique index
//     + recheck ใน transaction (แบบเก่า)
//   - ★ Log การล็อกทุกครั้ง (OrderProductionQueueList 1 doc/ครั้ง) — Job Card ในอนาคต
//     ต้องตัดใบงานตามช่วงเลขของแต่ละล็อก ห้ามค่อมข้ามล็อก (คนละล๊อตด้ายสีเพี้ยนได้)
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require("mongoose");
const { randomUUID } = require("crypto");
const NodeFlow      = require("../../models/m-nodeFlow");
const OrderProductionQueueList = require("../../models/m-orderProductionQueueList");
const BundleCounter = require("../../models/m-bundleCounter");
const BundleReserve = require("../../models/m-bundleReserve");
// ── yarn module เดิม (READ-ONLY — ดึงล๊อตด้ายมาให้เลือกตอนล็อกงาน ไม่แตะ/ไม่เขียน) ──
const YarnData  = require("../../models/m-yarnData");
const Yarn      = require("../../models/m-yarn");
const YarnColor = require("../../models/m-yarnColor");
// ── ยกเลิกล็อก (cancel queue) ต้อง re-auth ด้วยรหัสผ่าน — verify แบบเดียวกับ userALogin ──
const bcrypt    = require("bcryptjs");
// ── ตั้งค่า subnode ต่อรุ่น (set-cost-style-subnode เดิม) — master ขั้นตอนย่อย + ประเภท ──
const SubNodeFlowC    = require("../../models/m-subNodeFlowC");
const SubNodeFlowType = require("../../models/m-subNodeFlowType");

// ## ค่าตำแหน่ง substr บน barcode (จาก .env production — ห้ามเดา ดู reference_barcode_positions)
const RUN_POS   = () => +process.env.runningNoPos   || 37;
const RUN_DIGIT = () => +process.env.runningNoDigit || 5;
const QTY_MAX_PER_ROUND = () => +process.env.createOrderQtyMaxPerRound || 1200;

// ## pad string ด้วยตัวอักษรที่กำหนด ตัดให้ยาวพอดี (ใช้ประกอบ barcode)
const padTo = (s, n, c) => String(s ?? '').padEnd(n, c).slice(0, n);
// ## เลขวิ่ง 5 หลัก เช่น 42 → '00042'
const runStr = (n) => String(n).padStart(RUN_DIGIT(), '0');
// ## escape ตัวอักษรพิเศษก่อนใช้ใน $regex (barcode มี space/ขีด)
const escRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ## ประกอบ zone barcode 37 หลักจาก line ใน order (country = '-----' เพราะล็อกระดับ zone)
//    style(12) + targetPlaceID(4,'-') + '-----' + year(2) + color(10,'-') + size(3,'-') + sex(1)
function zoneBarcodeOfLine(orderID, l) {
  return padTo(orderID, 12, ' ')
    + padTo(l.targetPlace?.targetPlaceID || '', 4, '-')
    + '-----'
    + padTo(l.productYear || '', 2, '-')
    + padTo(l.productColor || '', 10, '-')
    + padTo(l.productSize || '', 3, '-')
    + padTo(l.productSex || '-', 1, '-');
}

// ## เลขตัวเสื้อล่าสุดของ zone barcode นี้ — regex ^prefix + sort desc (วิ่งบน index productBarcodeNoReal)
async function lastRunNoOf(companyID, orderID, productBarcode, session) {
  let q = OrderProduction.findOne(
    { companyID, orderID, productBarcodeNoReal: { $regex: `^${escRe(productBarcode)}` } },
    { productBarcodeNoReal: 1 }
  ).sort({ productBarcodeNoReal: -1 });
  // ใน transaction ต้องอ่านจาก primary เสมอ (connection ตั้ง secondaryPreferred ไว้)
  if (session) q = q.session(session).read('primary');
  const doc = await q.lean();
  return doc ? +doc.productBarcodeNoReal.substr(RUN_POS(), RUN_DIGIT()) || 0 : 0;
}

// ## max bundleNo จริงที่มีอยู่ใน DB (ใช้ seed counter ครั้งแรก + fast-forward กรณีแอปเก่าออกเลขแซง)
//    ดูทั้ง OrderProduction.bundleNo และ QueueList.bundleNoTo เอาค่ามากสุด (แบบ logic เก่า)
async function maxBundleNoExisting(companyID, ver) {
  const [a] = await OrderProduction.aggregate([
    { $match: { companyID, ver } },
    { $group: { _id: null, max: { $max: '$bundleNo' } } },
  ]).hint({ companyID: 1, ver: 1, bundleNo: 1 });
  const [b] = await OrderProductionQueueList.aggregate([
    { $match: { companyID, ver } },
    { $group: { _id: null, max: { $max: '$bundleNoTo' } } },
  ]);
  return Math.max(+(a?.max) || 0, +(b?.max) || 0);
}

// ## ชั้นที่ 1 กัน bundleNo ซ้ำ: จองช่วงเลขแบบ atomic ด้วย counter ($inc — DB การันตีไม่ทับกัน)
//    ยังไม่มี counter → seed จาก max จริงก่อน (unique index กัน seed ซ้อน) แล้วจองใหม่
//    เลขที่จองแล้ว transaction ล้ม = ปล่อยเว้น (ยอมรับ — ห้ามซ้ำสำคัญกว่าห้ามเว้น)
async function reserveBundleNos(companyID, ver, count) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const upd = await BundleCounter.findOneAndUpdate(
      { companyID, ver }, { $inc: { seq: count } }, { new: true }
    ).lean();
    if (upd) return { bundleFrom: upd.seq - count + 1, bundleTo: upd.seq };
    const seed = await maxBundleNoExisting(companyID, ver);
    try { await BundleCounter.create({ companyID, ver, seq: seed }); }
    catch (e) { if (e?.code !== 11000) throw e; }   // 11000 = คนอื่น seed พร้อมกัน — ใช้ของเขา
  }
  throw new Error('reserveBundleNos: จองเลข bundle ไม่สำเร็จ');
}

// ## แอปเก่ายังรันอยู่และออกเลขเองแบบ max+1 → counter อาจตามหลัง ดันให้ทันเลขจริง
async function fastForwardCounter(companyID, ver) {
  const max = await maxBundleNoExisting(companyID, ver);
  await BundleCounter.updateOne({ companyID, ver, seq: { $lt: max } }, { $set: { seq: max } });
}

// ══════════════════════════════════════════════════════════════════════════
// GET /api/a/order/lockjob/summary/:companyID/:orderID?factoryID=
// requirement: ตารางหน้าล็อกงาน — แถว สี×ไซซ์ · คอลัมน์ zone (targetPlace) ·
//   ต่อช่อง: สั่ง(รวมทุก country ใน zone) / ล็อกแล้ว / เหลือ / จำนวนครั้งที่ล็อก
//   + node แรกของ main flow (ส่งเข้า node นี้เสมอ) + config (qty max/โหล default)
// ══════════════════════════════════════════════════════════════════════════
exports.lockjobSummary = async (req, res, next) => {
  const { companyID, orderID } = req.params;
  const factoryID = req.query.factoryID || '';
  try {
    const order = await Order.findOne({ companyID, orderID }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'order not found' });
    const ver = +order.ver || 2;

    // ── zone ตามลำดับที่ตั้งใน order (ไม่ซ้ำ) ──
    const zones = [];
    const seenZ = new Set();
    for (const z of (order.orderTargetPlace || [])) {
      const id = z.targetPlace?.targetPlaceID;
      if (!id || seenZ.has(id)) continue;
      seenZ.add(id);
      zones.push({ targetPlaceID: id, targetPlaceName: z.targetPlace?.targetPlaceName || id });
    }

    // ── รวมยอดสั่งต่อ zone barcode: สี×zone×ไซซ์ (รวมทุก country ใน zone) ──
    const items = new Map();   // barcode → item
    for (const l of (order.productOR?.productORInfo || [])) {
      if (!(+l.productQty > 0)) continue;
      const bc = zoneBarcodeOfLine(orderID, l);
      const it = items.get(bc) ?? {
        productBarcode: bc,
        targetPlaceID: l.targetPlace?.targetPlaceID || '',
        year: l.productYear || '', colorID: l.productColor || '',
        sizeID: l.productSize || '', sex: l.productSex || '-',
        ordered: 0, lossQty: 0,
        locked: 0, lastRunNo: 0, forLossCnt: 0, lockCount: 0,
      };
      it.ordered += (+l.productQty || 0);
      it.lossQty += (+l.productLossQty || 0);
      items.set(bc, it);
    }

    // ── ยอดที่ล็อกแล้วต่อ zone barcode — aggregate ครั้งเดียวทั้ง order:
    //    group ด้วย prefix 37 หลัก → จำนวนตัว + เลขวิ่งล่าสุด + จำนวน forLoss
    //    ($substr หลัง $match ตาม pattern optimization — match วิ่งบน index companyID+orderID)
    const lockedRows = await OrderProduction.aggregate([
      { $match: { companyID, orderID } },
      { $project: {
          _id: 0,
          bc:    { $substr: ['$productBarcodeNoReal', 0, RUN_POS()] },
          // $convert onError 0 — กัน doc เก่าที่ท้าย barcode ไม่ใช่ตัวเลข ทำ aggregate ล้มทั้งก้อน
          runNo: { $convert: { input: { $substr: ['$productBarcodeNoReal', RUN_POS(), RUN_DIGIT()] }, to: 'int', onError: 0, onNull: 0 } },
          fl:    { $cond: [{ $eq: ['$forLoss', true] }, 1, 0] },
      } },
      { $group: { _id: '$bc', locked: { $sum: 1 }, lastRunNo: { $max: '$runNo' }, forLossCnt: { $sum: '$fl' } } },
    ]);
    for (const r of lockedRows) {
      const it = items.get(r._id);
      if (it) { it.locked = r.locked; it.lastRunNo = r.lastRunNo; it.forLossCnt = r.forLossCnt; }
    }

    // ── จำนวนครั้งที่ล็อกต่อ barcode (จาก log QueueList) — ไว้โชว์ badge ประวัติ ──
    const lockCounts = await OrderProductionQueueList.aggregate([
      { $match: { companyID, orderID } },
      { $group: { _id: '$productBarcode', cnt: { $sum: 1 } } },
    ]);
    for (const r of lockCounts) {
      const it = items.get(r._id);
      if (it) it.lockCount = r.cnt;
    }

    // ── เหลือ = สั่ง - เลขวิ่งล่าสุด (เลขวิ่งถัดไปต่อจากตัวล่าสุดเสมอ ห้ามถอยหลัง) ──
    const list = [...items.values()].map(it => ({ ...it, remain: Math.max(0, it.ordered - it.lastRunNo) }));

    // ── node แรกของ main flow — requirement: ล็อกงานส่งเข้า node แรกเสมอ (เช่น 1.COMPUTER-KNITTING) ──
    let firstNode = '';
    const flow = await NodeFlow.findOne(
      { companyID, ...(factoryID ? { factoryID } : {}), flowType: 'main' },
      { flowSeq: 1 }
    ).lean();
    if (flow?.flowSeq?.length) {
      const seq = [...flow.flowSeq].sort((a, b) => (+a.seqNo || 0) - (+b.seqNo || 0));
      firstNode = seq[0]?.nodeID || '';
    }

    return res.json({
      success: true,
      ver, seasonYear: order.seasonYear || '', productID: order.productOR?.productID || '',
      orderFactoryID: order.factoryID || '',
      zones, items: list, firstNode,
      config: { qtyMaxPerRound: QTY_MAX_PER_ROUND(), bundleItemsDefault: 12 },
      orderColor: order.orderColor || [],
      ...(await tokenRefresh(req)),
    });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// GET /api/a/order/lockjob/next-numbers/:companyID/:orderID?barcode=&qty=&bundleItems=
// requirement: "ขอเลขล่วงหน้า" ก่อนบันทึก — โชว์ช่วงเลขตัวเสื้อ + ช่วง bundle ให้ user ตรวจ
//   ★ เป็นแค่ preview: เลขจริงยืนยันตอนบันทึก (กันคนอื่นล็อกแทรกระหว่างตรวจ)
// ══════════════════════════════════════════════════════════════════════════
exports.lockjobNextNumbers = async (req, res, next) => {
  const { companyID, orderID } = req.params;
  const barcode = String(req.query.barcode || '');
  const qty = Math.max(0, +req.query.qty || 0);
  const bundleItems = Math.max(1, +req.query.bundleItems || 12);
  if (barcode.length !== RUN_POS())
    return res.status(400).json({ success: false, message: `barcode ต้องยาว ${RUN_POS()} หลัก` });
  try {
    const order = await Order.findOne({ companyID, orderID }, { ver: 1 }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'order not found' });
    const ver = +order.ver || 2;

    // เลขตัวเสื้อล่าสุดของ barcode นี้ → เริ่มถัดไป
    const lastRunNo = await lastRunNoOf(companyID, orderID, barcode);

    // bundle ล่าสุดระดับ company: อ่านจาก counter ถ้ามี (ไม่ inc) — ไม่มีก็ดู max จริง
    const counter = await BundleCounter.findOne({ companyID, ver }).lean();
    const lastBundleNo = counter ? Math.max(+counter.seq || 0, 0) : await maxBundleNoExisting(companyID, ver);

    const bundles = qty > 0 ? Math.ceil(qty / bundleItems) : 0;
    return res.json({
      success: true, ver,
      lastRunNo, startNo: lastRunNo + 1, toNo: qty > 0 ? lastRunNo + qty : lastRunNo,
      lastBundleNo, bundleFrom: bundles ? lastBundleNo + 1 : 0, bundleTo: bundles ? lastBundleNo + bundles : 0,
      bundles,
      ...(await tokenRefresh(req)),
    });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// POST /api/a/order/lockjob/create
// requirement: บันทึกการล็อกงาน 1 ครั้ง (สี×zone×ไซซ์ → node แรก โรงตัวเองเท่านั้น)
//   - server คำนวณเอง (ไม่เชื่อ client): ยอดสั่ง zone, เลขวิ่งเริ่ม, forLossQty
//   - transaction: insert OrderProduction (1 doc = 1 ตัว) + QueueList (log 1 doc/ครั้ง)
//     + BundleReserve (ชั้น 2) + recheck ซ้ำ (ชั้น 3) — ชนที่ไหน abort ทั้งก้อน + 422
//   - forLoss: เลขวิ่งเกินยอดสั่ง → ติด forLoss:true รายตัว + บวก productLossQty ใน order
// body: { companyID, factoryID, orderID, productBarcode(37), qty, bundleItems, yarnLots:[{yarnLotID}], toNode }
// ══════════════════════════════════════════════════════════════════════════
exports.lockjobCreate = async (req, res, next) => {
  const { companyID, factoryID, orderID, productBarcode, toNode } = req.body;
  const qty = Math.floor(+req.body.qty || 0);
  const bundleItems = Math.floor(+req.body.bundleItems || 12);
  const yarnLots = (Array.isArray(req.body.yarnLots) ? req.body.yarnLots : [])
    .map(y => ({ yarnLotID: String(y?.yarnLotID || '').trim() }))
    .filter(y => y.yarnLotID);

  // ── validate ตาม requirement ──
  if (!companyID || !factoryID || !orderID || !productBarcode || !toNode)
    return res.status(400).json({ success: false, message: 'companyID + factoryID + orderID + productBarcode + toNode required' });
  if (String(productBarcode).length !== RUN_POS())
    return res.status(400).json({ success: false, message: `barcode ต้องยาว ${RUN_POS()} หลัก` });
  const qtyMax = QTY_MAX_PER_ROUND();
  if (qty < 1 || qty > qtyMax)
    return res.status(400).json({ success: false, message: `จำนวนต้องอยู่ระหว่าง 1 – ${qtyMax} ตัวต่อการล็อก 1 ครั้ง` });
  if (bundleItems < 1 || bundleItems > qtyMax)
    return res.status(400).json({ success: false, message: 'จำนวนตัวต่อโหลไม่ถูกต้อง' });
  if (!yarnLots.length)   // ★ yarn lot บังคับ — คนละล๊อตสีเพี้ยน ต้องตามย้อนได้เสมอ
    return res.status(400).json({ success: false, message: 'ต้องระบุล๊อตด้าย (yarn lot) อย่างน้อย 1 ล๊อต' });

  let session;
  try {
    const order = await Order.findOne({ companyID, orderID }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'order not found' });
    const ver = +order.ver || 2;
    const productID = padTo(order.productOR?.productID || '', 12, ' ');

    // ── หา line ที่ประกอบเป็น zone barcode นี้ → ยอดสั่ง zone (server คำนวณเอง) ──
    const matchLines = (order.productOR?.productORInfo || [])
      .filter(l => zoneBarcodeOfLine(orderID, l) === productBarcode && (+l.productQty > 0));
    if (!matchLines.length)
      return res.status(400).json({ success: false, message: 'ไม่พบรายการสั่งของ barcode นี้ใน order (ตรวจ สี/ไซซ์/zone)' });
    const orderQty = matchLines.reduce((s, l) => s + (+l.productQty || 0), 0);

    // targetPlace ระดับ zone: countryID '-' (ล็อกทั้ง zone ไม่แยก country) — ตาม data แอปเดิม
    const tpID = matchLines[0].targetPlace?.targetPlaceID || '';
    const zoneEntry = (order.orderTargetPlace || []).find(z => z.targetPlace?.targetPlaceID === tpID);
    const targetPlace = {
      targetPlaceID: tpID,
      targetPlaceName: zoneEntry?.targetPlace?.targetPlaceName || tpID,
      countryID: '-', countryName: '-',
    };

    const bundles = Math.ceil(qty / bundleItems);          // ## แตกโหล: 125/12 → 11 (10 เต็ม + เศษ 5)
    const by = await actorFull(req);
    const current = new Date();

    // ── ชั้นที่ 1: จองช่วง bundleNo แบบ atomic (นอก transaction — เลขที่ล้มปล่อยเว้น ไม่ reuse) ──
    let bundleFrom = 0, bundleTo = 0;
    let result = null;

    // ลองได้ 2 รอบ: รอบแรกชนเลขที่แอปเก่าออกแซง counter → fast-forward counter แล้วลองใหม่
    for (let attempt = 0; attempt < 2 && !result; attempt++) {
      ({ bundleFrom, bundleTo } = await reserveBundleNos(companyID, ver, bundles));
      const bundleNos = [];
      for (let b = bundleFrom; b <= bundleTo; b++) bundleNos.push(b);

      session = await mongoose.startSession();
      try {
        // ★ connection ตั้ง readPreference: secondaryPreferred ไว้ (app.js) —
        //   transaction บังคับอ่านจาก primary ไม่งั้น MongoDB reject ทั้ง transaction
        await session.withTransaction(async () => {
          // ── เลขวิ่งตัวเสื้อ: คำนวณ "ใน" transaction — เริ่มต่อจากตัวล่าสุดจริงเสมอ ──
          const lastRunNo = await lastRunNoOf(companyID, orderID, productBarcode, session);
          const startNo = lastRunNo + 1;
          const toNo = lastRunNo + qty;

          // ── ★ กติกา forLoss (user 2026-07-17): ห้ามล็อกคร่อมยอดสั่ง ──
          //   ต้องล็อกยอดสั่งให้ "ครบพอดี" ก่อน แล้วค่อยเปิดล็อกใหม่เป็นเผื่อเสีย (forLoss) ล้วนๆ
          //   เช่น สั่ง 18 อยากได้ 20 → ล็อก 18 ก่อน แล้วล็อกแยกอีก 2 เป็น forLoss
          //   (1 การล็อกใน log จะเป็น ปกติล้วน หรือ forLoss ล้วน — Job Card ตัดใบงานง่าย ไม่ปนกัน)
          if (lastRunNo < orderQty && toNo > orderQty) {
            const e = new Error(`ล็อกเกินยอดสั่งไม่ได้ — ยอดสั่งเหลืออีก ${orderQty - lastRunNo} ตัว `
              + `ให้ล็อกส่วนนี้ให้ครบก่อน แล้วค่อยล็อกเผื่อเสีย (forLoss) แยกอีกครั้ง`);
            e.badRequest = true; throw e;
          }

          // forLoss ของ "ล็อกครั้งนี้" — ตามกติกาใหม่จะเป็น 0 (ล็อกปกติ) หรือ = qty (ล็อกเผื่อเสียล้วน)
          const forLossQty = Math.max(0, toNo - Math.max(orderQty, lastRunNo));

          // ── ชั้นที่ 3: recheck ซ้ำแบบเก่า (bundleNo + barcodeNo) ก่อน insert ──
          const dupBundle = await OrderProduction.findOne(
            { companyID, ver, bundleNo: { $in: bundleNos } }, { bundleNo: 1 }
          ).session(session).read('primary').lean();
          if (dupBundle) { const e = new Error(`bundleNo ${dupBundle.bundleNo} ถูกใช้แล้ว`); e.dupBundle = true; throw e; }

          const barcodes = [];
          for (let i = startNo; i <= toNo; i++) barcodes.push(productBarcode + runStr(i));
          const dupBarcode = await OrderProduction.findOne(
            { companyID, orderID, productBarcodeNoReal: { $in: barcodes } }, { productBarcodeNoReal: 1 }
          ).session(session).read('primary').lean();
          if (dupBarcode) { const e = new Error('เลขตัวเสื้อชนกับที่มีอยู่ — มีคนล็อกแทรก กรุณาลองใหม่'); e.dupBarcode = true; throw e; }

          // ── ชั้นที่ 2: จองเลขลงทะเบียน BundleReserve — unique index กันซ้ำระดับ DB ──
          await BundleReserve.insertMany(bundleNos.map(b => ({
            companyID, ver, bundleNo: b, orderID, productBarcode, datetime: current, createBy: by,
          })), { session });

          // ── สร้าง OrderProduction: 1 doc = 1 ตัวเสื้อ ──
          const bundleUUIDs = bundleNos.map(() => randomUUID());
          const docs = [];
          for (let i = 0; i < qty; i++) {
            const runNo = startNo + i;
            const bIdx = Math.floor(i / bundleItems);                       // ## โหลที่เท่าไหร่ (0-based)
            const isLastBundle = bIdx === bundles - 1;
            const itemsInBundle = isLastBundle ? qty - bIdx * bundleItems : bundleItems;   // ## เศษท้ายนับจริง
            docs.push({
              companyID, factoryID, orderID, ver, open: true,
              bundleNo: bundleNos[bIdx], bundleID: bundleUUIDs[bIdx],
              productID,
              productBarcodeNo: productBarcode + runStr(runNo),
              productBarcodeNoReal: productBarcode + runStr(runNo),
              productBarcodeNoReserve: [],
              targetPlace,
              productCount: itemsInBundle,
              productionDate: current,
              productStatus: 'normal',
              forLoss: runNo > orderQty,        // ## ตัวที่เกินยอดสั่ง = forLoss รายตัว
              isOutsourceTracking: false,
              yarnLot: yarnLots,
              outsourceData: [],                // ★ ไม่มี outsource ในหน้าล็อกงานใหม่ (user สั่งตัดออก)
              productionNode: [{
                factoryID, fromNode: 'starterNode', toNode, datetime: current,
                status: 'normal', isOutsource: false, problemID: '', createBy: by,
              }],
            });
          }
          await OrderProduction.insertMany(docs, { session });

          // ── log การล็อก 1 ครั้ง = 1 doc (Job Card อนาคตตัดใบงานตามช่วงเลขนี้ ห้ามค่อมล็อก) ──
          await OrderProductionQueueList.insertMany([{
            companyID, orderID, productID, seasonYear: order.seasonYear || '', ver, factoryID,
            productBarcode, isOutsource: false, queueDate: current,
            forLoss: forLossQty > 0, forLossQty,
            productCount: bundleItems, toNode,
            numberFrom: startNo, numberTo: toNo,
            bundleNoFrom: bundleFrom, bundleNoTo: bundleTo,
            yarnLot: yarnLots, outsourceData: [], createBy: by,
          }], { session });

          // ── forLoss เกินยอดสั่ง → บวก productLossQty สะสมใน line แรกที่ตรง (ตาม logic เก่า) ──
          if (forLossQty > 0) {
            const line = matchLines[0];
            await Order.updateOne(
              { companyID, orderID },
              { $inc: { 'productOR.productORInfo.$[elem].productLossQty': forLossQty } },
              { arrayFilters: [{ 'elem.productBarcode': line.productBarcode }], session }
            );
          }

          result = { startNo, toNo, bundleFrom, bundleTo, bundles, forLossQty };
        }, { readPreference: 'primary', readConcern: { level: 'local' }, writeConcern: { w: 'majority' } });
      } catch (txErr) {
        // bundleNo ชน (แอปเก่าออกเลขแซง counter) → ดัน counter ให้ทันแล้วลองใหม่ 1 รอบ
        const isDup = txErr?.dupBundle || txErr?.code === 11000;
        if (isDup && attempt === 0) { await fastForwardCounter(companyID, ver); }
        else if (isDup) {
          return res.status(422).json({ success: false,
            message: 'เลข bundle ชนกัน (มีการล็อกพร้อมกัน) — กรุณากดขอเลขและบันทึกใหม่อีกครั้ง' });
        } else if (txErr?.dupBarcode) {
          return res.status(422).json({ success: false, message: txErr.message });
        } else if (txErr?.badRequest) {   // ล็อกคร่อมยอดสั่ง — แจ้งข้อความให้ user แก้จำนวน
          return res.status(400).json({ success: false, message: txErr.message });
        } else { throw txErr; }
      } finally {
        session.endSession();
      }
    }

    if (!result)
      return res.status(422).json({ success: false, message: 'บันทึกไม่สำเร็จ — เลขชนกัน กรุณาลองใหม่' });

    // ── audit log (นอก transaction — log พลาดไม่ควรทำให้งานที่ล็อกสำเร็จแล้วล้ม) ──
    await writeLog({ module: 'order', companyID, factoryID, action: 'lockjob',
      summary: `ล็อกงาน ${orderID} · ${productBarcode.trim()} · ${qty} ตัว (เลข ${result.startNo}–${result.toNo}) · `
        + `bundle ${result.bundleFrom}–${result.bundleTo} · ล๊อตด้าย ${yarnLots.map(y => y.yarnLotID).join(', ')}`
        + (result.forLossQty > 0 ? ` · เผื่อเสีย ${result.forLossQty}` : ''),
      meta: { orderID, productBarcode, qty, bundleItems, yarnLots, toNode, ...result },
      userID: by.userID, userName: by.userName });

    return res.status(201).json({ success: true, ...result, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// GET /api/a/order/lockjob/history/:companyID/:orderID?barcode=
// requirement (user ย้ำ): ดูประวัติการล็อกได้เสมอ — เวลา / ช่วงเลขตัวเสื้อ from–to /
//   qty / forLossQty / ล๊อตด้าย / คนล็อก · กรองเฉพาะ zone barcode ได้ (คลิกจาก cell)
//   เหตุผล: Job Card ต้องตัดใบงานตามช่วงเลขของแต่ละล็อก ห้ามค่อมข้ามล็อก (คนละล๊อตด้าย)
// ══════════════════════════════════════════════════════════════════════════
exports.lockjobHistory = async (req, res, next) => {
  const { companyID, orderID } = req.params;
  const barcode = String(req.query.barcode || '');
  try {
    const filter = { companyID, orderID };
    if (barcode) filter.productBarcode = barcode;
    const rows = await OrderProductionQueueList.find(filter, {
      _id: 1, ver: 1, productBarcode: 1, queueDate: 1, numberFrom: 1, numberTo: 1,
      bundleNoFrom: 1, bundleNoTo: 1, productCount: 1, toNode: 1,
      forLoss: 1, forLossQty: 1, yarnLot: 1, createBy: 1, factoryID: 1,
    }).sort({ queueDate: -1 }).lean();
    // qty ของแต่ละล็อก = ช่วงเลข (numberTo - numberFrom + 1)
    for (const r of rows) r.qty = (+r.numberTo || 0) - (+r.numberFrom || 0) + 1;
    return res.json({ success: true, rows, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// GET /api/a/order/lockjob/yarnlots/:companyID/:orderID
// requirement (user 2026-07-17): ตอนล็อกงานให้ "เลือก" ล๊อตด้ายจากระบบ (yarn module เดิม)
//   แทนพิมพ์เอง — ดึงจาก YarnData (แผนด้ายเก็บ orderID เป็น array) →
//   yarnDataInfo[].packageInfo[].yarnLotID (เช่น ZY2513-446, ZY2513-446B)
//   ★ READ-ONLY: อ่าน collection ด้ายเดิมอย่างเดียว ไม่แก้/ไม่เขียน (feedback ห้ามแตะของเก่า)
//   คืน "ล๊อตทั้ง order" + colorKeys ต่อล๊อต (สีเสื้อ id/ชื่อ/code + yarnColor id/ชื่อ) →
//   frontend เอาไปกรองตามสีที่ล็อกเองได้ และสลับดูทั้ง order ได้ (รองรับ "สี combo"
//   ที่กรองสีเดี่ยวไม่เจอ) · ล๊อตที่ยังไม่ลงระบบก็ยังพิมพ์เองได้ (frontend)
// ══════════════════════════════════════════════════════════════════════════
exports.lockjobYarnLots = async (req, res, next) => {
  const { companyID, orderID } = req.params;
  try {
    // แผนด้ายที่คลุม order นี้ (YarnData.orderID = array → เงื่อนไข equality = array-contains)
    const plans = await YarnData.find(
      { companyID, orderID },
      { yarnID: 1, colorS: 1, yarnStatCal: 1,
        'yarnDataInfo.yarnColorID': 1,
        'yarnDataInfo.packageInfo.yarnLotID': 1,
        'yarnDataInfo.packageInfo.invoiceID': 1,
        'yarnDataInfo.packageInfo.state': 1,
        'yarnDataInfo.packageInfo.yarnBoxInfo.used': 1,
        'yarnDataInfo.yarnInfo.productBarcode': 1,   // ## garment color อยู่ในนี้ (substr) → match สีแม่น
      }
    ).lean();

    // label: ชื่อ yarn (ชนิดด้าย) + ชื่อ yarnColor (สีด้าย) — อ่านง่ายขึ้นตอนเลือก
    const yarnIDs = [...new Set(plans.map(p => p.yarnID).filter(Boolean))];
    const yarns = yarnIDs.length
      ? await Yarn.find({ companyID, yarnID: { $in: yarnIDs } }, { yarnID: 1, yarnName: 1, yarnFullName: 1 }).lean()
      : [];
    const yarnNameOf = new Map(yarns.map(y => [y.yarnID, y.yarnFullName || y.yarnName || y.yarnID]));
    const yarnColors = await YarnColor.find({ companyID }, { yarnColorID: 1, yarnColorName: 1 }).lean();
    const yarnColorNameOf = new Map(yarnColors.map(c => [c.yarnColorID, c.yarnColorName || c.yarnColorID]));

    const lc = (s) => String(s ?? '').trim().toLowerCase();
    // แยกชื่อสีด้ายเป็น token เทียบสีเสื้อแบบ "ตรงคำ" (กัน GRAY ไปโดน MEDIUMGRAY)
    //   เช่น "muji;#005;GRAY" → [muji, 005, gray]
    const tokenize = (s) => String(s ?? '').toLowerCase().split(/[;,#/\s\-]+/).map(x => x.trim()).filter(Boolean);
    // ตำแหน่งสีเสื้อบน barcode (ref: color = substr 23,10) — ใช้ env ถ้ามี
    const COLOR_POS   = +process.env.colorPos   || 23;
    const COLOR_DIGIT = +process.env.colorDigit || 10;
    const lots = [];
    const seen = new Set();   // dedup ด้วย yarnLotID|yarnColorID (ล๊อตเดียวกันคนละสี = คนละตัวเลือก)

    for (const p of plans) {
      const yarnName = yarnNameOf.get(p.yarnID) || p.yarnID || '';

      // ★ สีทั้งแผน (colorS) ใช้กรองได้ "เฉพาะแผนสีเดียว" เท่านั้น (ทุกล๊อต = สีนั้นแน่นอน)
      //   แผนหลายสี: ห้ามเอา colorS มากรอง! ไม่งั้นสีเดียว (GRAY) จะจับล๊อตทุกสีในแผน (บั๊ก broadening)
      const planColors = (p.colorS || []).map(cs => cs.color || {});
      const singleColorKeys = new Set();
      if (planColors.length === 1) {
        const c = planColors[0];
        [c.colorID, c.colorName, c.colorCode].forEach(v => { if (v) singleColorKeys.add(lc(v)); });
      }

      // map yarnColorID → สีเสื้อ (ผ่าน yarnStatCal): color(สีเสื้อ) → mainZoneYarn.color.colorID(สีด้าย)
      const garmentOfYarnColor = new Map();   // yarnColorID → Set(garment color keys)
      for (const sc of (p.yarnStatCal || [])) {
        const g = sc.color || {};
        const gKeys = [g.colorID, g.colorName, g.colorCode].filter(Boolean).map(lc);
        for (const mz of (sc.mainZoneYarn || [])) {
          const ycid = mz.color?.colorID;
          if (!ycid) continue;
          if (!garmentOfYarnColor.has(ycid)) garmentOfYarnColor.set(ycid, new Set());
          gKeys.forEach(k => garmentOfYarnColor.get(ycid).add(k));
        }
      }

      for (const di of (p.yarnDataInfo || [])) {
        const ycid = di.yarnColorID || '';
        const ycName = yarnColorNameOf.get(ycid) || ycid;
        // ★ colorKeys "ต่อล๊อต" แบบแม่น (ไม่เอาสีทั้งแผนมั่ว) — 4 สัญญาณ:
        //   (1) แผนสีเดียว → สีนั้น  (2) yarnStatCal map สีเสื้อ→สีด้ายของล๊อตนี้
        //   (3) token ของชื่อสีด้าย + id สีด้าย  (4) สีเสื้อจาก barcode ใน yarnInfo.productBarcode
        const keys = new Set(singleColorKeys);
        if (ycid) keys.add(lc(ycid));
        tokenize(ycName).forEach(t => keys.add(t));
        (garmentOfYarnColor.get(ycid) || []).forEach(k => keys.add(k));
        const pbc = String(di.yarnInfo?.productBarcode || '');
        if (pbc.length >= COLOR_POS + COLOR_DIGIT) {
          const gc = lc(pbc.substr(COLOR_POS, COLOR_DIGIT).replace(/[-\s]+$/, ''));
          if (gc) keys.add(gc);
        }

        for (const pk of (di.packageInfo || [])) {
          const lotID = String(pk.yarnLotID || '').trim();
          if (!lotID) continue;
          const dk = `${lotID}|${ycid}`;
          if (seen.has(dk)) continue;
          seen.add(dk);
          // ยังมีกล่องที่ไม่ถูกใช้อยู่ไหม (ไว้เรียงล๊อตที่ยังมีของขึ้นก่อน)
          const hasUnused = (pk.yarnBoxInfo || []).some(b => !(b.used === true || b.used === 'y'));
          lots.push({
            yarnLotID: lotID, yarnColorID: ycid, yarnColorName: ycName,
            yarnID: p.yarnID || '', yarnName,
            invoiceID: pk.invoiceID || '', state: pk.state || '',
            hasUnused, colorKeys: [...keys],
          });
        }
      }
    }

    // เรียง: ล๊อตที่ยังมีของก่อน แล้วตามชื่อล๊อต
    lots.sort((a, b) =>
      (a.hasUnused === b.hasUnused ? 0 : a.hasUnused ? -1 : 1)
      || a.yarnLotID.localeCompare(b.yarnLotID));

    return res.json({ success: true, lots, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// POST /api/a/order/lockjob/cancel
// requirement (user 2026-07-17): ในหน้าประวัติการล็อก ให้ "ลบ/ยกเลิก" การล็อกได้
//   ★ เงื่อนไข: ทุกโหลของการล็อกครั้งนั้นต้อง "ยังไม่ถูกสแกน" — เช็คจาก
//     OrderProduction.productionNode.length === 1 (มีแต่ node แรก starterNode→toNode)
//     ถ้ามีตัวไหน productionNode ยาว > 1 = ถูกสแกนแล้ว → ห้ามลบทั้งล็อก
//   ★ ต้อง re-auth ด้วยรหัสผ่าน (แบบ app เดิม cancel queue) — userID ว่าง = คนที่ login อยู่
//     (verify แบบเดียวกับ userALogin: bcrypt.compare(pass+'pwd'+pass, uInfo.userPass))
//     บัญชีที่ยืนยันต้องมีสิทธิ์ใน company นี้ (uCompany/uFactory)
//   ลบใน transaction: OrderProduction (โหลของล็อกนี้) + QueueList (log) · คืน productLossQty
//     ถ้าเคยติด forLoss · เก็บ BundleReserve ไว้ (เลข bundle ถูก "เผา" กันซ้ำถาวร) · audit log
// body: { companyID, orderID, ver, productBarcode, numberFrom, numberTo,
//         bundleNoFrom, bundleNoTo, reauthUserID?, reauthPass }
// ══════════════════════════════════════════════════════════════════════════
exports.lockjobCancel = async (req, res, next) => {
  const b = req.body || {};
  const companyID = b.companyID, orderID = b.orderID;
  const productBarcode = String(b.productBarcode || '');
  const numberFrom = Math.floor(+b.numberFrom || 0);
  const numberTo   = Math.floor(+b.numberTo || 0);
  const reauthPass = String(b.reauthPass || '');
  // userID ว่าง = ใช้คนที่ login อยู่ (ป้อนแต่รหัสผ่านก็พอ) · กรอก userID = ให้คนอื่น (หัวหน้า) override
  const reauthUserID = String(b.reauthUserID || req.userData?.tokenSet?.userID || '').trim();

  if (!companyID || !orderID || !productBarcode || !(numberFrom > 0) || !(numberTo >= numberFrom))
    return res.status(400).json({ success: false, message: 'ข้อมูลล็อกไม่ครบ (barcode/ช่วงเลข)' });
  if (!reauthPass)
    return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสผ่านเพื่อยืนยันการลบ' });

  let session;
  try {
    // ── re-auth: verify รหัสผ่าน (pattern เดียวกับ userALogin) ──
    const acc = await Useracc.findOne({ userID: reauthUserID }).lean();
    if (!acc) return res.status(401).json({ success: false, message: 'ไม่พบผู้ใช้นี้' });
    const ok = await bcrypt.compare(reauthPass + 'pwd' + reauthPass, acc.uInfo?.userPass || '');
    if (!ok) return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
    // บัญชีที่ยืนยันต้องมีสิทธิ์ใน company นี้ (กันคนนอก company มายกเลิก)
    const inCompany = (acc.uCompany || []).some(c => c.companyID === companyID)
                   || (acc.uFactory || []).some(f => f.companyID === companyID);
    if (inCompany !== true)
      return res.status(403).json({ success: false, message: 'ผู้ใช้นี้ไม่มีสิทธิ์ใน company นี้' });

    const order = await Order.findOne({ companyID, orderID }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'order not found' });
    const ver = +b.ver || +order.ver || 2;

    // ── อ่าน log การล็อก (QueueList) จริง — ยืนยันว่ามีอยู่ + เอา forLossQty จาก server (ไม่เชื่อ client) ──
    const queueDoc = await OrderProductionQueueList.findOne(
      { companyID, orderID, productBarcode, numberFrom, numberTo },
      { _id: 1, forLossQty: 1 }
    ).lean();
    if (!queueDoc)
      return res.status(404).json({ success: false, message: 'ไม่พบล็อกนี้ (อาจถูกยกเลิกไปแล้ว)' });
    const forLossQty = Math.max(0, Math.floor(+queueDoc.forLossQty || 0));   // ★ จาก DB จริง

    // ── ระบุ "โหลของล็อกนี้" ด้วยช่วงเลขตัวเสื้อ (barcode + runNo numberFrom..numberTo) ──
    //   ช่วงเลขไม่ค่อมข้ามล็อก (กติกา create) → ช่วงนี้ = ตัวของล็อกนี้เท่านั้น
    const barcodes = [];
    for (let i = numberFrom; i <= numberTo; i++) barcodes.push(productBarcode + runStr(i));
    const lockFilter = { companyID, orderID, productBarcodeNoReal: { $in: barcodes } };

    // ── ★ เงื่อนไข: ห้ามลบถ้ามีโหลไหนถูกสแกนแล้ว (productionNode ยาว > 1) ──
    const scanned = await OrderProduction.findOne(
      { ...lockFilter, 'productionNode.1': { $exists: true } },
      { productBarcodeNoReal: 1, bundleNo: 1 }
    ).lean();
    if (scanned)
      return res.status(409).json({ success: false,
        message: 'ยกเลิกไม่ได้ — มีบางโหลถูกสแกนเข้าสู่การผลิตแล้ว (ต้องยังไม่สแกนทุกโหล)' });

    // นับจำนวนตัวจริงที่จะลบ (ไว้ log + กันเคสว่างเปล่า)
    const willDelete = await OrderProduction.countDocuments(lockFilter);
    if (!willDelete)
      return res.status(404).json({ success: false, message: 'ไม่พบตัวเสื้อของล็อกนี้ (อาจถูกยกเลิกไปแล้ว)' });

    // ── forLoss ที่ต้องคืน: หา line ของ barcode นี้ (เหมือนตอน create) · forLossQty อ่านจาก queueDoc แล้ว ──
    const matchLines = (order.productOR?.productORInfo || [])
      .filter(l => zoneBarcodeOfLine(orderID, l) === productBarcode && (+l.productQty > 0));
    const lineBarcode = matchLines[0]?.productBarcode || '';

    const by = await actorFull(req);
    let deletedCount = 0;

    session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // ลบตัวเสื้อของล็อกนี้
        const del = await OrderProduction.deleteMany(lockFilter, { session });
        deletedCount = del?.deletedCount || 0;

        // ลบ log การล็อก (QueueList) — ลบตรง _id ที่อ่านมา (ชัวร์ว่าลบ doc เดียวถูกตัว)
        await OrderProductionQueueList.deleteOne({ _id: queueDoc._id }, { session });

        // คืน productLossQty ที่เคยบวกไว้ตอน forLoss (ถ้ามี)
        if (forLossQty > 0 && lineBarcode) {
          await Order.updateOne(
            { companyID, orderID },
            { $inc: { 'productOR.productORInfo.$[elem].productLossQty': -forLossQty } },
            { arrayFilters: [{ 'elem.productBarcode': lineBarcode }], session });
        }
        // ★ ไม่ลบ BundleReserve — เก็บเลข bundle ไว้ "เผา" กันเลขซ้ำถาวร (counter ไม่ถอยหลัง)
      }, { readPreference: 'primary', readConcern: { level: 'local' }, writeConcern: { w: 'majority' } });
    } finally { session.endSession(); }

    // ── audit log (นอก transaction) — ใครยกเลิก/ยืนยันด้วยบัญชีไหน ──
    await writeLog({ module: 'order', companyID, factoryID: req.body.factoryID || by.factoryID || '',
      action: 'lockjob-cancel',
      summary: `ยกเลิกล็อกงาน ${orderID} · ${productBarcode.trim()} · เลข ${numberFrom}–${numberTo} `
        + `(${deletedCount} ตัว) · bundle ${b.bundleNoFrom || '-'}–${b.bundleNoTo || '-'}`
        + (forLossQty > 0 ? ` · คืนเผื่อเสีย ${forLossQty}` : '')
        + ` · ยืนยันโดย ${acc.userID} (${acc.uInfo?.userName || ''})`,
      meta: { orderID, productBarcode, numberFrom, numberTo, deletedCount, forLossQty,
              confirmBy: acc.userID },
      userID: by.userID, userName: by.userName });

    return res.json({ success: true, deletedCount, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ SUBNODE SETUP — ตั้งค่าขั้นตอนย่อย (subnode) ต่อรุ่นเสื้อ  [AI ใหม่ 2026-07-17] ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
// requirement (จาก user 2026-07-17 + app เดิม set-cost-style-subnode.component.ts):
//   - หลัง create order + ลงจำนวนเสร็จ → กำหนดว่ารุ่นนี้ใช้ขั้นตอนย่อยอะไรบ้าง + ประเภทใด
//   - เสื้อแต่ละรุ่น subnode ไม่เหมือนกัน ไม่ตายตัว
//   - ประเภท: '' = ปกติ (ชิ้นครบทุกชิ้น, ใบงานแนบเสื้อ) · 'extra' = ex (สแกน/พิมพ์แยก:
//     ปก/กระเป๋า/ปลายสาย ซัก-รีด-qc) · (ex2 ค่อยทำ)
//   - เก็บใน Order.productOR.subNodeFlowCost[] (field เดิม — ใช้ร่วมกับ logic สแกนเดิม
//     ต้องเขียนรูปเดิมเป๊ะ: {seq, nodeID, subNodeID, subNodeType, cost, subNodeFlowTypeID})
//   - subNodeFlowTypeID (12/60/120) เลิกใช้แล้ว — default ตัวแรก (12) พอ · cost round-trip
//     ไม่แตะ (โหลดมาเท่าไหร่ save กลับเท่านั้น)  ★ READ master (SubNodeFlowC/Type/NodeFlow)
// ─────────────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════
// GET /api/a/order/subnode/setup/:companyID/:factoryID/:orderID
// requirement: หน้าตั้งค่า subnode — คืน node หลัก (flowSeq) + master subnode ต่อ node
//   + ประเภท default + ค่าที่ตั้งไว้แล้วของ order นี้ (subNodeFlowCost)
// ══════════════════════════════════════════════════════════════════════════
exports.subnodeSetup = async (req, res, next) => {
  const { companyID, factoryID, orderID } = req.params;
  try {
    const order = await Order.findOne({ companyID, orderID }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'order not found' });

    // node หลัก (main flow) — ลำดับ node 7 ตัว
    const flow = await NodeFlow.findOne(
      { companyID, ...(factoryID ? { factoryID } : {}), flowType: 'main' }, { flowSeq: 1 }
    ).lean();
    const nodes = (flow?.flowSeq || [])
      .slice().sort((a, b) => (+a.seqNo || 0) - (+b.seqNo || 0))
      .map(f => ({ nodeID: f.nodeID, seqNo: +f.seqNo || 0, canScanSubNode: !!f.canScanSubNode }));

    // master ขั้นตอนย่อยต่อ node (SubNodeFlowC) — group ตาม nodeID เรียงตาม seq
    const masterRows = await SubNodeFlowC.find(
      { companyID }, { _id: 0, nodeID: 1, subNodeID: 1, subNodeName: 1, seq: 1 }
    ).lean();
    const subnodeMaster = {};
    for (const m of masterRows) {
      (subnodeMaster[m.nodeID] = subnodeMaster[m.nodeID] || []).push(m);
    }
    for (const k of Object.keys(subnodeMaster)) {
      subnodeMaster[k].sort((a, b) => (+a.seq || 0) - (+b.seq || 0));
    }

    // ประเภท subNodeFlowType (12/60/120) — default = ตัวแรกตาม seq (เลิกใช้ 60/120 แล้ว)
    const types = await SubNodeFlowType.find(
      { companyID }, { _id: 0, subNodeFlowTypeID: 1, subNodeFlowTypeName: 1, seq: 1 }
    ).sort({ seq: 1 }).lean();
    const typeDefault = types[0]?.subNodeFlowTypeID || '';

    // ค่าที่ตั้งไว้แล้ว — แปลง cost Decimal128 → number ให้ frontend
    const current = (order.productOR?.subNodeFlowCost || []).map(s => ({
      seq: +s.seq || 0, nodeID: s.nodeID, subNodeID: s.subNodeID,
      subNodeType: s.subNodeType || '',
      subNodeFlowTypeID: s.subNodeFlowTypeID || typeDefault,
      cost: s.cost != null ? Number(s.cost.toString()) : 0,
    }));

    return res.json({
      success: true,
      productID: order.productOR?.productID || '', productName: order.productOR?.productName || '',
      seasonYear: order.seasonYear || '',
      nodes, subnodeMaster, types, typeDefault, current,
      ...(await tokenRefresh(req)),
    });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// PUT /api/a/order/subnode/save
// requirement: บันทึกรายการ subnode ของรุ่นนี้ (เขียนทับ Order.productOR.subNodeFlowCost)
//   - server จัด seq จาก master + ป้องกันซ้ำ (nodeID+subNodeID) · subNodeType = '' | 'extra'
//   - cost/subNodeFlowTypeID เก็บตามที่ frontend ส่ง (round-trip ไม่แตะ) · default type ถ้าว่าง
// body: { companyID, factoryID, orderID, items:[{nodeID, subNodeID, subNodeType, cost, subNodeFlowTypeID}] }
// ══════════════════════════════════════════════════════════════════════════
exports.subnodeSave = async (req, res, next) => {
  const { companyID, factoryID, orderID } = req.body;
  const itemsIn = Array.isArray(req.body.items) ? req.body.items : [];
  if (!companyID || !orderID)
    return res.status(400).json({ success: false, message: 'companyID + orderID required' });
  try {
    const order = await Order.findOne({ companyID, orderID }, { 'productOR.productID': 1 }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'order not found' });

    // seq จาก master (คีย์ nodeID|subNodeID) — ให้ตรงกับ logic เก่า (เรียงตาม master)
    const masterRows = await SubNodeFlowC.find({ companyID }, { _id: 0, nodeID: 1, subNodeID: 1, seq: 1 }).lean();
    const seqOf = new Map(masterRows.map(m => [`${m.nodeID}|${m.subNodeID}`, +m.seq || 0]));
    const types = await SubNodeFlowType.find({ companyID }, { subNodeFlowTypeID: 1, seq: 1 }).sort({ seq: 1 }).lean();
    const typeDefault = types[0]?.subNodeFlowTypeID || '';

    // ── สร้างรายการ (dedup nodeID+subNodeID · ข้าม subNodeID ว่าง/'x') ──
    const seen = new Set();
    const items = [];
    for (const it of itemsIn) {
      const nodeID = String(it?.nodeID || '');
      const subNodeID = String(it?.subNodeID || '');
      if (!nodeID || !subNodeID || subNodeID === 'x') continue;
      const key = `${nodeID}|${subNodeID}`;
      if (seen.has(key)) continue;   // กันซ้ำ node+subnode เดียวกัน
      seen.add(key);
      // '' = ปกติ · 'extra' = ex (สแกน/พิมพ์แยก) · 'extra2' = ex2 (ราคาต่างรายประเทศในโซน — แยกยอดพิมพ์)
      const tIn = it?.subNodeType;
      const subNodeType = (tIn === 'extra' || tIn === 'extra2') ? tIn : '';
      const costNum = Math.max(0, +it?.cost || 0);
      items.push({
        seq: seqOf.get(key) || 0,
        nodeID, subNodeID, subNodeType,
        cost: mongoose.Types.Decimal128.fromString(costNum.toFixed(2)),
        subNodeFlowTypeID: String(it?.subNodeFlowTypeID || '') || typeDefault,
      });
    }
    // เรียงตาม nodeID → ปกติก่อน extra → seq (เหมือน sortSubNodeFlowSelect เดิม)
    items.sort((a, b) =>
      (a.nodeID > b.nodeID ? 1 : a.nodeID < b.nodeID ? -1 : 0)
      || (a.subNodeType > b.subNodeType ? 1 : a.subNodeType < b.subNodeType ? -1 : 0)
      || (a.seq - b.seq));

    await Order.updateOne({ companyID, orderID }, { $set: { 'productOR.subNodeFlowCost': items } });

    const by = await actorFull(req);
    await writeLog({ module: 'order', companyID, factoryID: factoryID || '', action: 'subnode-setup',
      summary: `ตั้งค่า subnode ${orderID} · ${items.length} รายการ `
        + `(ปกติ ${items.filter(i => i.subNodeType === '').length} · Extra ${items.filter(i => i.subNodeType === 'extra').length}`
        + ` · Extra2 ${items.filter(i => i.subNodeType === 'extra2').length})`,
      meta: { orderID, count: items.length }, userID: by.userID, userName: by.userName });

    // คืนรูปที่ frontend ใช้ต่อ (cost เป็น number)
    const current = items.map(s => ({
      seq: s.seq, nodeID: s.nodeID, subNodeID: s.subNodeID, subNodeType: s.subNodeType,
      subNodeFlowTypeID: s.subNodeFlowTypeID, cost: Number(s.cost.toString()),
    }));
    return res.json({ success: true, current, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ JOB CARD — เฟส 4 พิมพ์ใบงาน  [AI ใหม่ 2026-07-17]                            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
// requirement (จาก user 2026-07-17 + app เดิม s-order-print-jobcard):
//   - กรอกช่วงเลขโหล (from–to) → เช็คเงื่อนไข → ดึงข้อมูลโหลในช่วงมาพิมพ์ใบงาน
//   - ★ เงื่อนไข: (1) orderID/zone/สี เดียวกัน (ต่างไซซ์ได้ ทุกไซซ์) · (2) ★ล๊อตด้ายเหมือนกัน
//     100% (ชื่อล๊อตเหมือน + จำนวนชื่อเท่ากัน) · (3) เลขโหลต้องเป็นของ order นี้
//   - รายงาน: type1(ใบปกติ 2-up), type2, bundle running no, EX (k/n/p) — stage นี้ทำ data + เงื่อนไข
// ─────────────────────────────────────────────────────────────────────────────
// ตำแหน่งบน barcode 37 หลัก (ref: style0/12 target12/4 year21/2 color23/10 size33/3)
const JC_TARGET_POS = 12, JC_TARGET_DIG = 4;
const JC_COLOR_POS  = 23, JC_COLOR_DIG  = 10;
const JC_SIZE_POS   = 33, JC_SIZE_DIG   = 3;
const trimDash = (s) => String(s ?? '').replace(/[-\s]+$/g, '').replace(/^[-\s]+/g, '');

// ══════════════════════════════════════════════════════════════════════════
// collectJobcard — ดึง+เช็คเงื่อนไขข้อมูลใบงาน (ใช้ร่วมกัน: jobcardData + jobcardPdf)
//   คืน { status, body } — body = payload เดียวกับที่ jobcardData เคยตอบ (ยังไม่รวม token)
// ══════════════════════════════════════════════════════════════════════════
async function collectJobcard(companyID, orderID, from, to) {
  if (!(from > 0) || !(to >= from))
    return { status: 400, body: { success: false, message: 'ช่วงเลขโหลไม่ถูกต้อง (from ≤ to และ > 0)' } };

  const order = await Order.findOne({ companyID, orderID }).lean();
  if (!order) return { status: 404, body: { success: false, message: 'order not found' } };
    const ver = +order.ver || 2;

    // ── รวม OrderProduction เป็นต่อโหล (1 doc = 1 ตัว) ในช่วง bundleNo ──
    const cvInt = (pos, dig) => ({ $convert: { input: { $substr: ['$productBarcodeNoReal', pos, dig] }, to: 'int', onError: 0, onNull: 0 } });
    const rows = await OrderProduction.aggregate([
      { $match: { companyID, orderID, ver, bundleNo: { $gte: from, $lte: to } } },
      { $group: {
          _id: '$bundleNo',
          qty:    { $sum: 1 },
          bc:     { $first: { $substr: ['$productBarcodeNoReal', 0, RUN_POS()] } },
          runMin: { $min: cvInt(RUN_POS(), RUN_DIGIT()) },
          runMax: { $max: cvInt(RUN_POS(), RUN_DIGIT()) },
          yarnLot:{ $first: '$yarnLot' },
          forLoss:{ $max: { $cond: [{ $eq: ['$forLoss', true] }, 1, 0] } },
      } },
      { $sort: { _id: 1 } },
    ]);

    if (!rows.length)
      return { status: 404, body: { success: false, message: 'ไม่พบโหลของ order นี้ในช่วงที่กรอก' } };

    // ── แตกข้อมูลต่อโหล (zone/สี/ไซซ์ จาก barcode) ──
    const bundles = rows.map(r => {
      const bc = r.bc || '';
      return {
        bundleNo: r._id,
        targetPlaceID: trimDash(bc.substr(JC_TARGET_POS, JC_TARGET_DIG)),
        color: trimDash(bc.substr(JC_COLOR_POS, JC_COLOR_DIG)),
        size:  trimDash(bc.substr(JC_SIZE_POS, JC_SIZE_DIG)),
        qty: r.qty, numberFrom: r.runMin, numberTo: r.runMax,
        productBarcode: bc,
        yarnLot: (r.yarnLot || []).map(y => ({ yarnLotID: y.yarnLotID })),
        forLoss: r.forLoss === 1,
      };
    });

    // ── ★ เช็คเงื่อนไข ──
    const errors = [];
    const zones  = [...new Set(bundles.map(b => b.targetPlaceID))];
    const colors = [...new Set(bundles.map(b => b.color))];
    if (zones.length > 1)  errors.push(`โหลในช่วงนี้อยู่คนละ zone (${zones.join(', ')}) — ต้อง zone เดียวกัน`);
    if (colors.length > 1) errors.push(`โหลในช่วงนี้คนละสี (${colors.join(', ')}) — ต้องสีเดียวกัน`);
    // ★ ล๊อตด้ายเหมือนกัน 100% (ชื่อเหมือน + จำนวนเท่ากัน) — เทียบ signature (sort+join)
    const lotSig = (b) => (b.yarnLot || []).map(y => y.yarnLotID).slice().sort().join('|');
    const sigs = [...new Set(bundles.map(lotSig))];
    if (sigs.length > 1) errors.push('ล๊อตด้ายไม่เหมือนกันทุกโหล — ต้องล๊อตด้ายเดียวกัน 100% (ชื่อ+จำนวนตรงกัน)');
    // เลขโหลที่กรอกแต่ไม่พบใน order นี้ (ของ order อื่น/ยังไม่ล็อก)
    const foundSet = new Set(bundles.map(b => b.bundleNo));
    const missing = [];
    for (let n = from; n <= to; n++) if (!foundSet.has(n)) missing.push(n);
    if (missing.length)
      errors.push(`เลขโหลไม่ใช่ของ order นี้ (หรือยังไม่ถูกล็อก) ${missing.length} เลข: `
        + missing.slice(0, 10).join(', ') + (missing.length > 10 ? ' ...' : ''));

    // ── header info (สี/zone ชื่อ + ล๊อตด้ายรวม) ──
    const first = bundles[0];
    const colorEntry = (order.orderColor || []).find(c => c.color?.colorID === first.color);
    const zoneEntry  = (order.orderTargetPlace || []).find(z => z.targetPlace?.targetPlaceID === first.targetPlaceID);
    const yarnLots = (first.yarnLot || []).map(y => y.yarnLotID);

    // ── subnode config ของรุ่นนี้ (แยก normal / extra) + ชื่อจาก master ──
    const cfg = order.productOR?.subNodeFlowCost || [];
    const masterRows = await SubNodeFlowC.find({ companyID }, { _id: 0, nodeID: 1, subNodeID: 1, subNodeName: 1 }).lean();
    const nameOf = new Map(masterRows.map(m => [`${m.nodeID}|${m.subNodeID}`, m.subNodeName]));
    const mapCfg = (s) => ({
      seq: +s.seq || 0, nodeID: s.nodeID, subNodeID: s.subNodeID,
      subNodeType: s.subNodeType || '', subNodeFlowTypeID: s.subNodeFlowTypeID || '',
      subNodeName: nameOf.get(`${s.nodeID}|${s.subNodeID}`) || s.subNodeID,
      cost: s.cost != null ? Number(s.cost.toString()) : 0,
    });
    const subNormal = cfg.filter(s => !s.subNodeType || s.subNodeType === '').map(mapCfg);
    const subExtra  = cfg.filter(s => s.subNodeType === 'extra' || s.subNodeType === 'extra2').map(mapCfg);

    const totalQty = bundles.reduce((s, b) => s + b.qty, 0);

    return { status: 200, body: {
      success: true, ver,
      header: {
        orderID, productID: order.productOR?.productID || '', productName: order.productOR?.productName || '',
        seasonYear: order.seasonYear || '',
        targetPlaceID: first.targetPlaceID, zoneName: zoneEntry?.targetPlace?.targetPlaceName || first.targetPlaceID,
        color: first.color, colorName: colorEntry?.color?.colorName || first.color,
        colorValue: colorEntry?.color?.colorValue || '', colorCode: colorEntry?.color?.colorCode || '',
        yarnLots,
      },
      bundles, totals: { countBundles: bundles.length, sumQty: totalQty },
      subNormal, subExtra,
      valid: errors.length === 0, errors,
    } };
}

// ══════════════════════════════════════════════════════════════════════════
// GET /api/a/order/jobcard/data/:companyID/:orderID?from=&to=
// requirement: "get data" — รวมโหลในช่วง + เช็คเงื่อนไข + คืนข้อมูลต่อโหล + subnode config
// ══════════════════════════════════════════════════════════════════════════
exports.jobcardData = async (req, res, next) => {
  try {
    const { companyID, orderID } = req.params;
    const from = Math.floor(+req.query.from || 0);
    const to   = Math.floor(+req.query.to || 0);
    const r = await collectJobcard(companyID, orderID, from, to);
    if (r.status !== 200) return res.status(r.status).json(r.body);
    return res.json({ ...r.body, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// เฟส 4 (พิมพ์): render ใบงานเป็น PDF ด้วย Chromium (Puppeteer) — HTML/CSS ให้ไทยเป๊ะ
//   GET /api/a/order/jobcard/pdf/:companyID/:orderID?from=&to=&type=type1
//   → ส่ง application/pdf กลับ (frontend เปิดใน tab ใหม่ ไม่ต้อง Ctrl+P)
// ══════════════════════════════════════════════════════════════════════════
const { SARABUN_FONT_CSS } = require('./jc-font');
const JC_BLANK_TOP = 4;
// โหลด qrcode/puppeteer แบบ lazy — ถ้ายังไม่ npm install จะไม่ทำให้ทั้ง API ล่ม (แค่พิมพ์ไม่ได้)
let _QRCodeLib = null;
function jcQrLib() { return _QRCodeLib || (_QRCodeLib = require('qrcode')); }

// puppeteer แบบ lazy + reuse browser เดียว (เปิดครั้งแรกช้า ครั้งต่อไปเร็ว)
let _jcBrowser = null;
async function jcBrowser() {
  if (_jcBrowser && _jcBrowser.connected) return _jcBrowser;
  const puppeteer = require('puppeteer');
  _jcBrowser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  return _jcBrowser;
}
async function jcRenderPdf(html) {
  const browser = await jcBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const out = await page.pdf({ format: 'A4', landscape: true, printBackground: true,
      margin: { top: '6mm', bottom: '6mm', left: '6mm', right: '6mm' } });
    // ★ puppeteer v23+ คืน Uint8Array — ต้องห่อเป็น Buffer ก่อนส่ง ไม่งั้น Express serialize เป็น JSON (PDF เสีย)
    return Buffer.isBuffer(out) ? out : Buffer.from(out);
  } finally { await page.close(); }
}

const jcEsc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jcQr = (text) => jcQrLib().toDataURL(text, { margin: 2, errorCorrectionLevel: 'L', width: 320 });

// หัวการ์ด (ใช้ร่วม subnode card + running card) · forLoss → ต่อท้าย "[for loss]"
async function jcHead(b, h, colorCode, colorName, forLoss) {
  const headQ = await jcQr(JSON.stringify({
    qrID: 'orderProductionQueueCard', orderID: h.orderID, bundleNo: b.bundleNo,
    productBarcode: b.productBarcode, productCount: b.qty, numberFrom: b.numberFrom, numberTo: b.numberTo,
  }));
  const yarnLines = (h.yarnLots || []).flatMap(y => String(y).split(','))
    .map(s => s.trim()).filter(Boolean).map(t => `<div class="yl">${jcEsc(t)}</div>`).join('');
  const oid = jcEsc(h.orderID) + (forLoss ? ' [for loss]' : '');
  return `<div class="chead">
      <div class="qrhead"><img src="${headQ}"></div>
      <div class="yarn"><b>Yarn lot :</b>${yarnLines}</div>
      <div class="oinfo"><div class="oid">${oid}</div>`
      + `<div class="l">ZONE : ${jcEsc(b.targetPlaceID)}</div>`
      + `<div class="l">COLOR : ${jcEsc(colorCode)} ${jcEsc(colorName)}</div></div>
      <div class="sz"><div class="size">${jcEsc(b.size)}</div>`
      + `<div class="l">QTY : ${jcEsc(b.qty)}</div><div class="l">Bundle No : ${jcEsc(b.bundleNo)}</div></div>
    </div>`;
}

// ใบเลขรันรายชิ้น (ซ้ายของ type2) — QR บาร์โค้ดดิบ + เลขรันตัวใหญ่ + "for loss"
async function jcRunCard(b, h, colorCode, colorName) {
  const forLoss = !!b.forLoss;
  const head = await jcHead(b, h, colorCode, colorName, forLoss);
  const pad5 = (n) => String(n).padStart(5, '0');
  const cell = async (n) => {
    if (n == null) return `<div class="pcell empty"></div>`;
    const pq = await jcQr(String(b.productBarcode) + pad5(n));   // ★ บาร์โค้ดดิบ (สแกนได้)
    return `<div class="pcell"><div class="pqr"><img src="${pq}"></div>`
      + `<div class="pno">${jcEsc(n)}${forLoss ? '<div class="floss">for loss</div>' : ''}</div></div>`;
  };
  const rows = [];
  for (let n = b.numberFrom; n <= b.numberTo; n += 2) {
    const c1 = await cell(n);
    const c2 = await cell(n + 1 <= b.numberTo ? n + 1 : null);
    rows.push(`<div class="prow">${c1}${c2}</div>`);
  }
  return `<div class="card">${head}<div class="cbody rungrid">${rows.join('')}</div></div>`;
}

// การ์ด = 1 โหล (2 คอลัมน์: ต้นขั้ว[ขีดฆ่า] | คูปอง[ฉีกเก็บ]) · opts:{ blankTop, innerTear, minRows, dataBottom, forLoss }
async function jcCard(b, h, subs, colorCode, colorName, opts) {
  opts = opts || {};
  const blankTop = opts.blankTop != null ? opts.blankTop : JC_BLANK_TOP;
  const innerTear = !!opts.innerTear;
  const infoLine = `${h.orderID} ${b.targetPlaceID} ${b.size} ${b.bundleNo}`;
  const colorLine = `${colorCode} ${colorName}`;
  const head = await jcHead(b, h, colorCode, colorName, !!opts.forLoss);
  const subQ = {};
  for (const s of subs) subQ[s.subNodeID] = await jcQr(JSON.stringify({ a: h.orderID, b: s.subNodeID, c: b.bundleNo }));

  const blankRow = () => `<div class="row blank"><div class="body"><div class="qr"></div>`
    + `<div class="nm"><div class="inf">${jcEsc(infoLine)}</div><div class="inf">${jcEsc(colorLine)}</div></div></div>`
    + `<div class="qty">${jcEsc(b.qty)}</div></div>`;
  const subRow = (s) => `<div class="row"><div class="body"><div class="qr"><img src="${subQ[s.subNodeID]}"></div>`
    + `<div class="nm"><div class="inf">${jcEsc(infoLine)}</div><div class="sub">${jcEsc(s.subNodeID)}: ${jcEsc(s.subNodeName)}</div><div class="col">${jcEsc(colorLine)}</div></div></div>`
    + `<div class="qty">${jcEsc(b.qty)}</div></div>`;

  const dataBottom = !!opts.dataBottom;
  const minRows = opts.minRows || 0;
  const topBlanks = Array.from({ length: blankTop }, blankRow);
  const subRows = subs.map(subRow);
  const fill = Math.max(0, minRows - blankTop - subRows.length);
  // ★ แถวว่าง = แถวข้อมูล (order/สี/qty) ไว้ให้ worker เขียน — ไม่ปล่อยว่างเปล่า
  const empties = Array.from({ length: fill }, blankRow);
  // ★ dataBottom: แถวว่างอยู่บน · แถวข้อมูล(subnode) อยู่ล่างสุด (ชิดรอยฉีก)
  const rows = dataBottom ? [...topBlanks, ...empties, ...subRows]
                          : [...topBlanks, ...subRows, ...empties];
  const rowsHtml = rows.join('');
  const midCol = innerTear ? '<div class="tearv"></div>' : '';

  return `<div class="card">${head}
    <div class="cbody"><div class="col stub">${rowsHtml}</div>${midCol}<div class="col coupon">${rowsHtml}</div></div>
  </div>`;
}

function jcSortSubs(payload) {
  return [...(payload.subNormal || [])].sort((a, b) =>
    (a.nodeID > b.nodeID ? -1 : a.nodeID < b.nodeID ? 1 : 0) || (b.seq - a.seq));
}

// type1 = 2 การ์ด/หน้า แนวนอน · รอยปะกลางหน้าแยก 2 การ์ด
async function jcBuildType1Html(payload) {
  const h = payload.header, bundles = payload.bundles || [];
  const colorCode = h.colorCode || h.color || '';
  const colorName = String(h.colorName || '').slice(0, 30);
  const subs = jcSortSubs(payload);
  const pages = [];
  for (let i = 0; i < bundles.length; i += 2) {
    const c1 = await jcCard(bundles[i], h, subs, colorCode, colorName, {});
    const c2 = bundles[i + 1] ? await jcCard(bundles[i + 1], h, subs, colorCode, colorName, {})
      : '<div class="card empty"></div>';
    const mid = bundles[i + 1] ? '<div class="tear"></div>' : '<div class="gap"></div>';
    pages.push(`<div class="page">${c1}${mid}${c2}</div>`);
  }
  return jcHtmlDoc(`@page { size: A4 landscape; margin: 6mm; }
.page { height:197mm; display:flex; page-break-after:always; }`, pages);
}

// type2 = 1 โหล/หน้า แนวนอน: ซ้าย=ใบเลขรันรายชิ้น · ขวา=ใบ subnode · รอยปะกลาง
async function jcBuildType2Html(payload) {
  const h = payload.header, bundles = payload.bundles || [];
  const colorCode = h.colorCode || h.color || '';
  const colorName = String(h.colorName || '').slice(0, 30);
  const subs = jcSortSubs(payload);
  const pages = [];
  for (const b of bundles) {
    const left = await jcRunCard(b, h, colorCode, colorName);
    const right = await jcCard(b, h, subs, colorCode, colorName,
      { blankTop: 0, minRows: 14, dataBottom: true, forLoss: !!b.forLoss });
    pages.push(`<div class="page">${left}<div class="tear"></div>${right}</div>`);
  }
  return jcHtmlDoc(`@page { size: A4 landscape; margin: 6mm; }
.page { height:197mm; display:flex; page-break-after:always; }`, pages);
}

// type3 = 1 การ์ด/หน้า แนวตั้ง (พื้นที่เยอะ ~28 แถว) · รอยปะฉีกคูปองอยู่กลางการ์ด
async function jcBuildType3Html(payload) {
  const h = payload.header, bundles = payload.bundles || [];
  const colorCode = h.colorCode || h.color || '';
  const colorName = String(h.colorName || '').slice(0, 30);
  const subs = jcSortSubs(payload);
  const pages = [];
  for (const b of bundles) {
    const card = await jcCard(b, h, subs, colorCode, colorName, { blankTop: 0, innerTear: true, minRows: 20, dataBottom: true });
    pages.push(`<div class="page">${card}</div>`);
  }
  return jcHtmlDoc(`@page { size: A4 portrait; margin: 6mm; }
.page { height:285mm; display:flex; flex-direction:column; page-break-after:always; }`, pages);
}

// bundle-runningno (normal3) = "DATA Form" ตารางเลขรันโหล แผนกถัก (ไม่มี QR) · หัวตารางซ้ำทุกหน้า
function jcBuildRunBundleHtml(payload) {
  const h = payload.header;
  const bundles = [...(payload.bundles || [])].sort((a, b) => a.bundleNo - b.bundleNo);
  const colorCode = h.colorCode || h.color || '';
  const colorName = String(h.colorName || '');
  const batch = (h.yarnLots || []).join(', ');
  const orderPcs = (payload.totals && payload.totals.sumQty) || bundles.reduce((s, b) => s + (b.qty || 0), 0);

  const rowsHtml = bundles.map(b => `<tr>
    <td class="c">${jcEsc(b.bundleNo)}</td><td class="c sm">${b.forLoss ? 'forLoss' : ''}</td>
    <td class="c">${jcEsc(b.size)}</td><td class="c sm">${jcEsc(b.qty)}</td>
    <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
  </tr>`).join('');

  // สรุปตามไซซ์ (แก้บั๊กใบเก่า): Qty=รวมชิ้น "โหลปกติ" เท่านั้น (ทั้งไซซ์เป็น forLoss → 0) · forLoss=รวมชิ้นโหลเผื่อเสีย
  const bySize = new Map();
  for (const b of bundles) {
    let e = bySize.get(b.size);
    if (!e) { e = { size: b.size, qty: 0, floss: 0 }; bySize.set(b.size, e); }
    if (b.forLoss) e.floss += (b.qty || 0);
    else e.qty += (b.qty || 0);
  }
  const sumRows = [...bySize.values()].map(e =>
    `<tr><td class="c">${jcEsc(e.size)}</td><td class="c">${jcEsc(e.qty)}</td><td class="c">${jcEsc(e.floss)}</td></tr>`).join('');

  return `<!doctype html><html><head><meta charset="utf-8"><style>
${SARABUN_FONT_CSS}
* { box-sizing:border-box; }
@page { size: A4 landscape; margin: 8mm; }
html,body { margin:0; padding:0; font-family:"Sarabun","Leelawadee UI","Tahoma",sans-serif; color:#000;
  -webkit-print-color-adjust:exact; print-color-adjust:exact; font-size:8pt; }
.rbinfo { display:flex; justify-content:space-between; margin-bottom:2.5mm; font-size:8.5pt; }
.rbinfo div { margin:0.3mm 0; }
table.rb { width:100%; border-collapse:collapse; }
table.rb th, table.rb td { border:0.5pt solid #333; padding:0.8mm 1.2mm; }
table.rb th { background:#dcdcdc; font-weight:600; text-align:center; font-size:7.5pt; }
table.rb td { height:6.5mm; }
table.rb td.c { text-align:center; }
table.rb td.sm { font-size:6.5pt; color:#555; }
table.sum { border-collapse:collapse; margin-top:5mm; width:46%; }
table.sum th, table.sum td { border:0.5pt solid #333; padding:1mm 1.5mm; }
table.sum th { background:#dcdcdc; font-weight:600; text-align:center; }
table.sum td.c { text-align:center; }
</style></head><body>
  <div class="rbinfo">
    <div><div><b>DATA Form</b></div><div>Style : ${jcEsc(h.orderID)}</div></div>
    <div><div>COLOR : ${jcEsc(colorCode)}</div><div>${jcEsc(colorName)}</div><div>Batch No : ${jcEsc(batch)}</div></div>
    <div style="text-align:right"><div>Zone : ${jcEsc(h.zoneName || h.targetPlaceID)}</div><div>Order : ${jcEsc(orderPcs)} Pcs</div></div>
  </div>
  <table class="rb"><thead>
    <tr><th rowspan="2">Bundle (Running)</th><th rowspan="2">Bundle NO</th><th rowspan="2">Size</th><th rowspan="2">Qty</th>
      <th colspan="2">Staff</th><th colspan="2">Knitting Start</th><th rowspan="2">Yarn Received (Kgs)</th>
      <th colspan="2">Knitting Finish</th><th rowspan="2">Consumption (Kgs)</th><th rowspan="2">Balance Yarn (Kgs)</th></tr>
    <tr><th>NO-1</th><th>NO-2</th><th>Date</th><th>Time</th><th>Date</th><th>Time</th></tr>
  </thead><tbody>${rowsHtml}</tbody></table>
  <table class="sum"><thead><tr><th>Size</th><th>Qty</th><th>forLoss</th></tr></thead><tbody>${sumRows}</tbody></table>
</body></html>`;
}

// จับโหลเป็นกลุ่ม (แยกตามไซซ์ต่อเนื่อง เรียง bundleNo) chunk ละ groupSize — ตรรกะเดียวกับ order.service.bundleSetGroup
function jcGroupBundles(bundles, groupSize) {
  const sorted = [...bundles].sort((a, b) => a.bundleNo - b.bundleNo);
  const bySize = []; let cur = null;
  for (const b of sorted) { if (!cur || cur.size !== b.size) { cur = { size: b.size, items: [] }; bySize.push(cur); } cur.items.push(b); }
  const groups = [];
  for (const g of bySize) {
    for (let i = 0; i < g.items.length; i += groupSize) {
      const chunk = g.items.slice(i, i + groupSize);
      const min = chunk[0].bundleNo, max = chunk[chunk.length - 1].bundleNo;
      groups.push({
        size: g.size, targetPlaceID: chunk[0].targetPlaceID, productBarcode: chunk[0].productBarcode,
        bundleNoRange: groupSize === 1 ? String(min) : `${min} - ${max}`,
        firstBundle: min, bundleCount: chunk.length,
        productCountTotal: chunk.reduce((s, b) => s + (b.qty || 0), 0),
      });
    }
  }
  return groups;
}

// ใบ EX subnode extra — K(3ก๊อป/กลุ่ม5) · N(2ก๊อป/กลุ่ม5) · P,Q(2ก๊อป/โหลเดียว)
async function jcBuildExHtml(payload, subNodeID) {
  const h = payload.header;
  const sub = (payload.subExtra || []).find(s => s.subNodeID === subNodeID) || { subNodeID, subNodeName: '', nodeID: '' };
  const k = String(subNodeID || '').charAt(0).toUpperCase();
  const variant = k === 'K' ? 'K' : k === 'N' ? 'N' : 'PQ';
  const copies = variant === 'K' ? 3 : 2;
  const groupSize = variant === 'PQ' ? 1 : 5;
  const colorCode = h.colorCode || h.color || '';
  const colorName = String(h.colorName || '').slice(0, 30);
  const yarnLots = (h.yarnLots || []).join(', ');
  const groups = jcGroupBundles(payload.bundles || [], groupSize);

  const qrFor = (g) => variant === 'PQ'
    ? jcQr(JSON.stringify({ id: 301, a: h.orderID, b: subNodeID, c: g.firstBundle }))
    : jcQr(JSON.stringify({ x: `401:${h.orderID}:${subNodeID}:${g.bundleNoRange}` }));

  const isPQ = variant === 'PQ';
  const exUnder = variant === 'K';   // "EX" ใต้ QR เฉพาะ K
  const infoHtml = (g) => {
    if (variant === 'K') return `<div>${jcEsc(h.orderID)} <span class="mut">${jcEsc(g.targetPlaceID)} ${jcEsc(g.size)}</span></div>
       <div><b>${jcEsc(g.bundleNoRange)}</b> [${jcEsc(g.bundleCount)}]/${jcEsc(g.productCountTotal)}</div>
       <div><b>EX ${jcEsc(subNodeID)}</b>-${jcEsc(sub.subNodeName)}</div>
       <div class="mut">${jcEsc(yarnLots)}</div><div class="mut">${jcEsc(colorCode)} ${jcEsc(colorName)}</div>`;
    if (variant === 'N') return `<div>${jcEsc(h.orderID)} <span class="mut">${jcEsc(g.targetPlaceID)} ${jcEsc(g.size)} ${jcEsc(g.bundleNoRange)}</span> [${jcEsc(g.bundleCount)}]/${jcEsc(g.productCountTotal)}</div>
       <div><b>EX ${jcEsc(subNodeID)}</b>-${jcEsc(sub.subNodeName)}</div>
       <div class="mut">${jcEsc(yarnLots)}</div><div class="mut">${jcEsc(colorCode)} ${jcEsc(colorName)}</div>`;
    // PQ — 1 โหล/แถว (สี+EX บรรทัดเดียว)
    return `<div>${jcEsc(h.orderID)} <span class="mut">${jcEsc(g.targetPlaceID)} ${jcEsc(g.size)} ${jcEsc(g.bundleNoRange)} ${jcEsc(g.productCountTotal)}</span></div>
       <div><b>EX ${jcEsc(subNodeID)}</b>-${jcEsc(sub.subNodeName)} &nbsp; <span class="mut">${jcEsc(colorCode)} ${jcEsc(colorName)}</span></div>
       <div class="mut">${jcEsc(yarnLots)}</div>`;
  };

  const cell = async (g, strike) => {
    const img = await qrFor(g);
    return `<td class="cpy"><div class="excell${isPQ ? ' pq' : ''}${strike ? ' strike' : ''}">
      <div class="exqr"><img src="${img}">${exUnder ? '<div class="exlbl">EX</div>' : ''}</div>
      <div class="exinfo">${infoHtml(g)}</div></div></td>`;
  };

  const sumTop = (g) => variant === 'K' ? `[${jcEsc(g.bundleCount)}]` : variant === 'N' ? `EX [${jcEsc(g.bundleCount)}]` : 'EX';
  const rows = [];
  for (const g of groups) {
    const cs = []; for (let c = 0; c < copies; c++) cs.push(await cell(g, c < copies - 1));
    rows.push(`<tr>${cs.join('')}<td class="sum">${sumTop(g)}<div class="big">${jcEsc(g.productCountTotal)}</div></td></tr>`);
  }

  const header = isPQ
    ? `<div class="exhead pqhead"><div class="pql">${jcEsc(h.orderID)} &nbsp;&nbsp;&nbsp; ${jcEsc(sub.nodeID)} &nbsp;&nbsp;&nbsp; ${jcEsc(subNodeID)}-${jcEsc(sub.subNodeName)}</div><div class="pqr">${jcEsc(yarnLots)}</div></div>`
    : `<div class="exhead"><div class="exnode">${jcEsc(sub.nodeID)}</div><div class="exsub">${jcEsc(subNodeID)}-${jcEsc(sub.subNodeName)}</div><div class="exorder"><div class="oid">${jcEsc(h.orderID)}</div><div class="yl">${jcEsc(yarnLots)}</div></div></div>`;

  return `<!doctype html><html><head><meta charset="utf-8"><style>
${SARABUN_FONT_CSS}
*{box-sizing:border-box;}
@page{ size:A4 portrait; margin:8mm; }
html,body{margin:0;padding:0;font-family:"Sarabun","Leelawadee UI","Tahoma",sans-serif;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.exhead{ display:flex; align-items:flex-start; margin-bottom:2mm; }
.exhead .exnode{ flex:1 1 0; font-size:9pt; font-weight:700; }
.exhead .exsub{ flex:1 1 0; text-align:center; font-size:14pt; font-weight:700; }
.exhead .exorder{ flex:1 1 0; text-align:right; }
.exhead .exorder .oid{ font-size:14pt; font-weight:700; }
.exhead .exorder .yl{ font-size:8pt; }
.exhead.pqhead{ align-items:baseline; }
.exhead.pqhead .pql{ flex:1 1 0; font-size:11pt; font-weight:700; }
.exhead.pqhead .pqr{ flex:0 0 auto; font-size:8pt; font-weight:700; }
table.extab{ width:100%; border-collapse:collapse; }
table.extab td{ border:0.6pt solid #333; padding:0; }
td.cpy{ width:31%; }
td.sum{ width:7%; text-align:center; font-size:10pt; font-weight:700; vertical-align:middle; }
td.sum .big{ font-size:12pt; }
.excell{ position:relative; display:flex; align-items:center; gap:1.5mm; padding:1.2mm; min-height:16mm; overflow:hidden; }
.excell.pq{ min-height:12.5mm; gap:1.2mm; padding:0.8mm 1.2mm; }
.excell.strike::after{ content:""; position:absolute; inset:0; pointer-events:none;
  background:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 100 100"><line x1="0" y1="100" x2="100" y2="0" stroke="%23999" stroke-width="0.7"/></svg>') 0 0/100% 100% no-repeat; }
.exqr{ flex:0 0 auto; text-align:center; }
.exqr img{ width:14mm; height:14mm; display:block; }
.excell.pq .exqr img{ width:11.5mm; height:11.5mm; }
.exqr .exlbl{ font-size:8pt; font-weight:700; }
.exinfo{ flex:1 1 0; min-width:0; font-size:7pt; line-height:1.35; }
.excell.pq .exinfo{ line-height:1.25; }
.exinfo .mut{ color:#555; font-size:6.5pt; }
.exinfo>div{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
</style></head><body>
  ${header}
  <table class="extab"><tbody>${rows.join('')}</tbody></table>
</body></html>`;
}

// เอกสาร HTML ร่วม (type1/type3) — ต่าง @page + .page เท่านั้น
function jcHtmlDoc(pageCss, pages) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${SARABUN_FONT_CSS}
* { box-sizing: border-box; }
html, body { margin:0; padding:0; font-family:"Sarabun","Leelawadee UI","Tahoma",sans-serif; color:#000;
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }
${pageCss}
.page:last-child { page-break-after:auto; }
.gap { flex:0 0 3mm; }
/* รอยปะ — เส้นประให้ worker ฉีก (type1: กลางหน้า 2 การ์ด · type3: กลางการ์ด แยกคูปอง) */
.tear { flex:0 0 5mm; align-self:stretch; position:relative; }
.tear::before { content:""; position:absolute; top:0; bottom:0; left:50%; border-left:0.8pt dashed #444; }
.tear::after { content:"✂"; position:absolute; top:1mm; left:50%; transform:translateX(-50%); font-size:8pt; background:#fff; padding:0.3mm 0; }
.tearv { flex:0 0 5mm; align-self:stretch; position:relative; }
.tearv::before { content:""; position:absolute; top:0; bottom:0; left:50%; border-left:0.9pt dashed #444; }
.tearv::after { content:"✂"; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(90deg); font-size:9pt; background:#fff; padding:0.3mm 0; }
.card { flex:1 1 0; min-width:0; border:0.6pt solid #777; display:flex; flex-direction:column; }
.card.empty { border:0; }
.chead { display:flex; gap:2mm; padding:1.5mm 2mm; border-bottom:0.6pt solid #777; align-items:flex-start; }
.qrhead img { width:16mm; height:16mm; display:block; }
.yarn { flex:1 1 0; min-width:0; font-size:7pt; line-height:1.25; }
.yarn .yl { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.oinfo { flex:1.3 1 0; min-width:0; }
.oinfo .oid { font-size:13pt; font-weight:700; line-height:1.1; }
.oinfo .l { font-size:7pt; line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.sz { width:24mm; text-align:right; }
.sz .size { font-size:17pt; font-weight:700; line-height:1; }
.sz .l { font-size:6.5pt; line-height:1.3; white-space:nowrap; }
.cbody { flex:1 1 auto; display:flex; min-height:0; }
.col { min-width:0; display:flex; flex-direction:column; }
.col.stub { flex:1 1 0; border-right:0.6pt solid #777; }
.col.coupon { flex:0 0 62mm; }   /* ★ คูปอง (ฉีกเก็บ) แคบกว่าต้นขั้ว แปะสมุดง่าย · กว้างพอแสดงข้อมูลครบ */
.cbody:has(.tearv) .col.stub { border-right:0; }
.row { flex:1 1 0; min-height:0; display:flex; align-items:stretch; border-top:0.5pt solid #bbb; }
.col > .row:first-child { border-top:0; }
.body { flex:1 1 0; min-width:0; display:flex; align-items:stretch; position:relative; overflow:hidden; }
/* เส้นขีดฆ่าเฉียงล่างซ้าย→บนขวา เฉพาะฝั่งต้นขั้ว · ทับ QR ได้ · ไม่เลยเข้าช่อง qty */
.stub .body::after { content:""; position:absolute; inset:0; pointer-events:none;
  background:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 100 100"><line x1="0" y1="100" x2="100" y2="0" stroke="%23888" stroke-width="1"/></svg>') 0 0/100% 100% no-repeat; }
.qr { flex:0 0 auto; width:15mm; display:flex; align-items:center; justify-content:center; padding:0.6mm; }
.qr img { max-width:100%; max-height:100%; width:auto; height:auto; aspect-ratio:1/1; display:block; }
.nm { flex:1 1 0; min-width:0; padding:0.8mm 1mm; display:flex; flex-direction:column; justify-content:center; gap:0.3mm; }
.nm .sub { font-size:8pt; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2; }
.nm .inf { font-size:6.5pt; color:#555; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2; }
.nm .col { font-size:6.5pt; color:#333; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2; }
.qty { flex:0 0 auto; width:10mm; display:flex; justify-content:flex-start; align-items:flex-start; padding:0.7mm 0 0 1.2mm;
  font-size:6.5pt; font-weight:400; color:#333; border-left:0.5pt solid #ddd; }
/* ── ใบเลขรันรายชิ้น (type2 ซ้าย) ── */
.rungrid { display:flex; flex-direction:column; }
.prow { flex:1 1 0; min-height:0; display:flex; border-top:0.5pt solid #bbb; }
.rungrid > .prow:first-child { border-top:0; }
.pcell { flex:1 1 0; min-width:0; display:flex; align-items:center; gap:2mm; padding:1mm 2mm; }
.pcell + .pcell { border-left:0.5pt solid #bbb; }
.pcell .pqr { flex:0 0 auto; display:flex; align-items:center; }
.pcell .pqr img { height:16mm; width:16mm; display:block; }
.pcell .pno { flex:1 1 0; font-size:16pt; font-weight:700; line-height:1.05; }
.pcell .pno .floss { font-size:7pt; font-weight:400; color:#333; }
.pcell.empty { border-left:0; }
</style></head><body>${pages.join('')}</body></html>`;
}

exports.jobcardPdf = async (req, res, next) => {
  try {
    const { companyID, orderID } = req.params;
    const from = Math.floor(+req.query.from || 0);
    const to   = Math.floor(+req.query.to || 0);
    const type = String(req.query.type || 'type1');
    const sub  = String(req.query.sub || '');
    const r = await collectJobcard(companyID, orderID, from, to);
    if (r.status !== 200) return res.status(r.status).json(r.body);
    if (!r.body.valid)
      return res.status(400).json({ success: false, message: 'เงื่อนไขไม่ผ่าน — พิมพ์ไม่ได้', errors: r.body.errors });

    let html;
    if (type === 'type1') html = await jcBuildType1Html(r.body);
    else if (type === 'type2') html = await jcBuildType2Html(r.body);
    else if (type === 'type3') html = await jcBuildType3Html(r.body);
    else if (type === 'bundle-runningno') html = jcBuildRunBundleHtml(r.body);
    else if (type === 'extra') {
      if (!sub) return res.status(400).json({ success: false, message: 'ไม่ได้ระบุ subnode (sub)' });
      html = await jcBuildExHtml(r.body, sub);
    }
    else return res.status(400).json({ success: false, message: `ยังไม่รองรับใบชนิด "${type}"` });

    const pdf = await jcRenderPdf(html);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="jobcard-${type}-${orderID}-${from}-${to}.pdf"`);
    return res.send(pdf);
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// set max QTY view — ตั้งค่า override จำนวนที่จะแสดง ต่อ (สี;ไซซ์;โซน) เก็บใน orderSetting.qtyMaxView
//   GET  /api/a/order/maxqty/:companyID/:orderID   → ตาราง (สี×ไซซ์ × โซน) + qty จริง + ค่าที่ตั้งไว้
//   PUT  /api/a/order/maxqty/save                  → บันทึก qtyMaxView (เก็บเฉพาะ maxQty>0)
//   (มาจาก app เดิม smd-order-maxqty-view — ค่านี้ให้รายงานปลายทางอ่านไปแสดงแทน qty จริง)
// ══════════════════════════════════════════════════════════════════════════
exports.maxqtyData = async (req, res, next) => {
  try {
    const { companyID, orderID } = req.params;
    const order = await Order.findOne({ companyID, orderID }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'order not found' });

    const info = order.productOR?.productORInfo || [];
    const trimDashLocal = (s) => String(s ?? '').replace(/[-\s]+$/g, '').replace(/^[-\s]+/g, '');

    // โซน: unique targetPlaceID (orderTargetPlace มีหลาย entry/โซน แยกประเทศ → ต้อง dedupe)
    //   เรียงตาม orderTargetPlace ก่อน แล้วเติมที่มีใน info แต่ยังไม่มี
    const zoneOrder = (order.orderTargetPlace || []).map(z => z.targetPlace?.targetPlaceID).filter(Boolean);
    const zonesInInfo = [...new Set(info.map(i => i.targetPlace?.targetPlaceID).filter(Boolean))];
    const zones = [];
    const addZone = (z) => { if (z && zonesInInfo.includes(z) && !zones.includes(z)) zones.push(z); };
    zoneOrder.forEach(addZone);
    zonesInInfo.forEach(addZone);

    // ชื่อ+โค้ดสี + ลำดับ (productColor = colorID → map ด้วย colorID · เผื่อ code ด้วย)
    const colorMeta = new Map();
    (order.orderColor || []).forEach(c => {
      const meta = { name: c.color?.colorName || '', code: c.color?.colorCode || '', seq: +c.seq || 0 };
      if (c.color?.colorID)   colorMeta.set(c.color.colorID, meta);
      if (c.color?.colorCode && !colorMeta.has(c.color.colorCode)) colorMeta.set(c.color.colorCode, meta);
    });

    // ลำดับไซซ์ตามการปรากฏใน info
    const sizeOrder = [];
    for (const i of info) { const s = i.productSize; if (s != null && !sizeOrder.includes(s)) sizeOrder.push(s); }
    const sizeIdx = new Map(sizeOrder.map((s, idx) => [s, idx]));

    // รวม qty ต่อ (สี|ไซซ์) แยกตามโซน
    const map = new Map();
    for (const i of info) {
      const color = i.productColor, size = i.productSize, zone = i.targetPlace?.targetPlaceID;
      if (color == null || size == null || !zone) continue;
      const key = color + '|' + size;
      let e = map.get(key);
      if (!e) {
        const firstCode = String(color).split(',')[0];
        e = { productColor: color, productSize: size, qty: {}, colorSeq: colorMeta.get(firstCode)?.seq ?? 999 };
        map.set(key, e);
      }
      e.qty[zone] = (e.qty[zone] || 0) + (+i.productQty || 0);
    }

    const rows = [...map.values()]
      .sort((a, b) => (a.colorSeq - b.colorSeq) || ((sizeIdx.get(a.productSize) ?? 0) - (sizeIdx.get(b.productSize) ?? 0)))
      .map(e => ({
        productColor: e.productColor,
        colorNames: String(e.productColor).split(',').map(c => colorMeta.get(c)?.name || c),
        colorCodes: String(e.productColor).split(',').map(c => colorMeta.get(c)?.code || c),
        size: trimDashLocal(e.productSize),
        sizeRaw: e.productSize,
        qty: e.qty,   // { zone: number }
      }));

    return res.json({
      success: true,
      style: order.productOR?.productID || '',
      zones, rows,
      qtyMaxView: order.orderSetting?.qtyMaxView || [],
      ...(await tokenRefresh(req)),
    });
  } catch (err) { return next(err); }
};

exports.maxqtySave = async (req, res, next) => {
  try {
    const { companyID, orderID } = req.body;
    const list = Array.isArray(req.body.qtyMaxView) ? req.body.qtyMaxView : [];
    // เก็บเฉพาะ maxQty>0 · zcs = "สี;ไซซ์;โซน"
    const clean = list
      .map(x => ({ zcs: String(x?.zcs || ''), maxQty: Math.floor(+x?.maxQty || 0) }))
      .filter(x => x.zcs && x.maxQty > 0);

    const order = await Order.findOneAndUpdate(
      { companyID, orderID },
      { $set: { 'orderSetting.qtyMaxView': clean } },
      { new: true },
    ).lean();
    if (!order) return res.status(404).json({ success: false, message: 'order not found' });

    await writeLog({ module: 'order', companyID, factoryID: order.factoryID || '', action: 'maxqty-view',
      summary: `ตั้งค่า max qty view ${clean.length} รายการ`, meta: { orderID }, ...actor(req) });

    return res.json({ success: true, qtyMaxView: clean, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};
