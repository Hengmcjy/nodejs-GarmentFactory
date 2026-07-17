const ShareFunc   = require("../c-api-app-share-function");
const Company     = require("../../models/m-company");
const Factory     = require("../../models/m-factory");
const Customer    = require("../../models/m-customer");
const Color       = require("../../models/m-color");
const Size        = require("../../models/m-size");
const TargetPlace = require("../../models/m-targetPlace");
const DCountry    = require("../../models/m-dCountry");
const Useracc     = require("../../models/m-acc-user");
const Product     = require("../../models/m-product");
const Order       = require("../../models/m-order");
const SubNodeFlowC = require("../../models/m-subNodeFlowC");

// ============================================================================
// c-master.js  —  NEW clean controller for Master Data
//   (company / factory / customer / color / size / targetplace / country)
//   Reads/writes SAME existing collections. Does NOT touch old code/models.
//
//   ID generation:
//   - factory/customer ID = compute from MAX existing + 1 (NOT ControlApp
//     runID — that counter is stale/abandoned: factoryRunID=12 but factories
//     go to f000037; customerRunID=8 but customers to ctm0012). Compute from
//     real max so it's always correct.
//   - factoryID: user-entered on create, format f+6 digits (prefill = next).
//   - customerID: auto (system id, not user-meaningful).
//   - colorID/sizeID/targetPlaceID embedded in productBarcode → user-entered
//     on create, LOCKED on edit (only names/values change).
//   - Company: never edit seasonYear/deptC. Factory: isOutsource set on create.
// ============================================================================

const tokenRefresh = async (req) => {
  const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
  return { token, expiresIn: Number(process.env.TOKENExpiresIn) };
};
const actor = (req) => ({
  userID:   req.userData?.tokenSet?.userID || '',
  userName: req.userData?.userName || '',
});

// next factory ID = 'f' + zeroPad(6) of (max existing + 1)
async function nextFactoryID() {
  const rows = await Factory.find({ factoryID: /^f\d+$/ }, { factoryID: 1, _id: 0 }).lean();
  let max = 0;
  for (const r of rows) { const n = parseInt(String(r.factoryID).slice(1), 10); if (n > max) max = n; }
  return 'f' + String(max + 1).padStart(6, '0');
}
// next customer ID = 'ctm' + zeroPad(4) of (max existing + 1)
async function nextCustomerID(companyID) {
  const rows = await Customer.find({ companyID, customerID: /^ctm\d+$/ }, { customerID: 1, _id: 0 }).lean();
  let max = 0;
  for (const r of rows) { const n = parseInt(String(r.customerID).slice(3), 10); if (n > max) max = n; }
  return 'ctm' + String(max + 1).padStart(4, '0');
}

// ==================== COMPANY ===============================================
exports.getCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ companyID: req.params.companyID }).lean();
    if (!company) return res.status(404).json({ success: false, message: 'company not found' });
    return res.json({ success: true, company });
  } catch (err) { return next(err); }
};

exports.updateCompanyProfile = async (req, res, next) => {
  const { companyID, companyName, abbreviation, pic, tel, email, cDescription } = req.body;
  if (!companyID || !companyName || !companyName.trim())
    return res.status(400).json({ success: false, message: 'companyID + companyName required' });
  try {
    const set = {
      'cInfo.companyName':  companyName.trim(),
      'cInfo.abbreviation': abbreviation || '',
      'cInfo.pic':          pic  || '',
      'cInfo.tel':          tel  || '',
      'cInfo.email':        email|| '',
      'cDescription':       cDescription || '',
    };
    const company = await Company.findOneAndUpdate({ companyID }, { $set: set }, { new: true }).lean();
    if (!company) return res.status(404).json({ success: false, message: 'company not found' });
    return res.json({ success: true, company, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ==================== FACTORY ==============================================
exports.getFactories = async (req, res, next) => {
  try {
    const factories = await Factory.find({ companyID: req.params.companyID }).lean();
    return res.json({ success: true, factories, nextFactoryID: await nextFactoryID() });
  } catch (err) { return next(err); }
};

exports.updateFactoryProfile = async (req, res, next) => {
  const { factoryID, factoryName, factoryName2, abbreviation, pic, tel, email, fDescription } = req.body;
  if (!factoryID || !factoryName || !factoryName.trim())
    return res.status(400).json({ success: false, message: 'factoryID + factoryName required' });
  try {
    const set = {
      'fInfo.factoryName':  factoryName.trim(),
      'fInfo.factoryName2': factoryName2 || '',
      'fInfo.abbreviation': abbreviation || '',
      'fInfo.pic':          pic  || '',
      'fInfo.tel':          tel  || '',
      'fInfo.email':        email|| '',
      'fDescription':       fDescription || '',
    };
    const factory = await Factory.findOneAndUpdate({ factoryID }, { $set: set }, { new: true }).lean();
    if (!factory) return res.status(404).json({ success: false, message: 'factory not found' });
    return res.json({ success: true, factory, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// create factory — factoryID user-entered (format f+6). push uFactory to creator.
exports.createFactory = async (req, res, next) => {
  const { companyID, factoryID, factoryName, factoryName2, abbreviation, pic, tel, email, fDescription, isOutsource } = req.body;
  if (!companyID || !factoryName || !factoryName.trim())
    return res.status(400).json({ success: false, message: 'companyID + factoryName required' });
  const fid = String(factoryID || '').trim();
  if (!/^f\d{6}$/.test(fid))
    return res.status(400).json({ success: false, message: 'รหัสโรงงานต้องเป็น f ตามด้วยตัวเลข 6 หลัก (เช่น f000038)' });
  try {
    const dup = await Factory.findOne({ factoryID: fid }).lean();
    if (dup) return res.status(400).json({ success: false, message: `รหัสโรงงาน ${fid} มีอยู่แล้ว` });

    const factory = await Factory.create({
      factoryID: fid, companyID, show: true, fDescription: fDescription || '',
      fInfo: {
        factoryName: factoryName.trim(), factoryName2: factoryName2 || '', abbreviation: abbreviation || '',
        pic: pic || '', tel: tel || '', email: email || '', registDate: new Date(),
        isOutsource: isOutsource === true, createBy: actor(req),
      },
    });
    await Useracc.updateOne({ userID: actor(req).userID }, { $push: { uFactory: {
      factoryID: fid, companyID, state: 'joined',
      userFacClass: { userClassID: 'own', userClassName: 'owner', userType: 'user', seq: 800 },
    } } });

    return res.status(201).json({ success: true, factory, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ==================== CUSTOMER =============================================
exports.getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find({ companyID: req.params.companyID }).lean();
    return res.json({ success: true, customers, nextCustomerID: await nextCustomerID(req.params.companyID) });
  } catch (err) { return next(err); }
};

// create (customerID พิมพ์แก้ได้ prefill next / auto ถ้าเว้นว่าง) or update (isEdit=true)
exports.saveCustomer = async (req, res, next) => {
  const { isEdit, customerID, companyID, customerName, setName, customerDetail, email, tel, web, pic, imageProfile } = req.body;
  if (!companyID || !customerName || !customerName.trim())
    return res.status(400).json({ success: false, message: 'companyID + customerName required' });
  try {
    if (isEdit) {
      if (!customerID) return res.status(400).json({ success: false, message: 'customerID required' });
      const set = {
        customerName: customerName.trim(), setName: setName || '',
        imageProfile: imageProfile || '',
        'cusInfo.customerDetail': customerDetail || '-',
        'cusInfo.email': email || '', 'cusInfo.tel': tel || '', 'cusInfo.web': web || '', 'cusInfo.pic': pic || '',
      };
      const customer = await Customer.findOneAndUpdate({ customerID, companyID }, { $set: set }, { new: true }).lean();
      if (!customer) return res.status(404).json({ success: false, message: 'customer not found' });
      return res.json({ success: true, customer, ...(await tokenRefresh(req)) });
    }
    // create — รหัสที่กรอก (ctm+4หลัก) หรือ auto จาก max ถ้าเว้นว่าง
    let newID = String(customerID || '').trim();
    if (newID) {
      if (!/^ctm\d{4}$/.test(newID))
        return res.status(400).json({ success: false, message: 'รหัสลูกค้าต้องเป็น ctm ตามด้วยตัวเลข 4 หลัก (เช่น ctm0013)' });
      if (await Customer.findOne({ customerID: newID, companyID }).lean())
        return res.status(400).json({ success: false, message: `รหัสลูกค้า ${newID} มีอยู่แล้ว` });
    } else {
      newID = await nextCustomerID(companyID);
      while (await Customer.findOne({ customerID: newID, companyID }).lean()) {
        newID = 'ctm' + String(parseInt(newID.slice(3), 10) + 1).padStart(4, '0');
      }
    }
    const customer = await Customer.create({
      customerID: newID, companyID, customerName: customerName.trim(),
      setName: setName || customerName.trim(),
      registDate: new Date(), imageProfile: imageProfile || '',
      cusInfo: { customerDetail: customerDetail || '-', email: email || '', tel: tel || '', web: web || '', pic: pic || '', createBy: actor(req) },
    });
    return res.status(201).json({ success: true, customer, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ==================== PRODUCT ==============================================
// requirement: Master Data > Product — CRUD สินค้า (style) ชี้ collection Product เดิม
//   - productID = รหัส style (user กรอกตอนสร้าง) เก็บแบบ pad ท้ายด้วย space จนครบ 12 ตัว
//     (ตาม data จริง เช่น "AA0VBA6A    ", "DDA44A6A-A  ") — แก้ไขแล้วล็อก ID
//   - รูป 1 รูป (imageProfile) — เก็บ url จาก image server (อัปโหลดจากหน้า Angular)
const PRODUCT_ID_LEN = 12;
const padProductID = (id) => String(id || '').trimEnd().padEnd(PRODUCT_ID_LEN, ' ');

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ companyID: req.params.companyID }).sort({ seasonYear: -1, productID: 1 }).lean();
    return res.json({ success: true, products });
  } catch (err) { return next(err); }
};

// create (isEdit=false) or update (isEdit=true — ล็อก productID)
exports.saveProduct = async (req, res, next) => {
  const { isEdit, productID, companyID, productName, productDetail, productCustomerCode, productGroupCode, seasonYear, imageProfile } = req.body;
  const idTrim = String(productID || '').trim();
  if (!companyID || !idTrim)
    return res.status(400).json({ success: false, message: 'companyID + productID required' });
  // ## productID ต้องยาวไม่เกิน 12 ตัวอักษร (ตำแหน่ง style ใน barcode = 12 หลัก) — ไม่ครบระบบเติม space ท้ายให้เอง
  if (idTrim.length > PRODUCT_ID_LEN)
    return res.status(400).json({ success: false, message: `รหัสสินค้ายาวเกิน ${PRODUCT_ID_LEN} ตัวอักษร (กรอกมา ${idTrim.length} ตัว)` });
  const pid = padProductID(idTrim);
  try {
    if (isEdit) {
      // ## update เฉพาะ field ที่หน้า master ดูแล — ไม่แตะ pdPic/productFeature (ของเดิมคงไว้)
      const set = {
        productName:         (productName || idTrim).trim(),
        productDetail:       productDetail || '',
        productCustomerCode: productCustomerCode || '',
        productGroupCode:    productGroupCode || '',
        seasonYear:          seasonYear || '',
        imageProfile:        imageProfile || '',
      };
      const product = await Product.findOneAndUpdate({ productID: pid, companyID }, { $set: set }, { new: true }).lean();
      if (!product) return res.status(404).json({ success: false, message: 'product not found' });
      return res.json({ success: true, product, ...(await tokenRefresh(req)) });
    }
    // create — กันรหัสซ้ำ
    if (await Product.findOne({ productID: pid, companyID }).lean())
      return res.status(400).json({ success: false, message: `รหัสสินค้า ${idTrim} มีอยู่แล้ว` });
    const product = await Product.create({
      productID: pid, companyID,
      productName:         (productName || idTrim).trim(),
      productDetail:       productDetail || '',
      productCustomerCode: productCustomerCode || '',
      productGroupCode:    productGroupCode || '',
      seasonYear:          seasonYear || '',
      imageProfile:        imageProfile || '',
      pdPic: [], productFeature: [],
    });
    return res.status(201).json({ success: true, product, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// delete — ใช้ POST (productID มี space ท้าย ใส่ใน url param ไม่ได้)
// guard: มี Order ใช้ product นี้อยู่ → ห้ามลบ (กันข้อมูล production พัง)
exports.deleteProduct = async (req, res, next) => {
  const { companyID, productID } = req.body;
  const pid = padProductID(productID);
  if (!companyID || !pid.trim())
    return res.status(400).json({ success: false, message: 'companyID + productID required' });
  try {
    const usedBy = await Order.findOne({ companyID, 'productOR.productID': pid }, { orderID: 1 }).lean();
    if (usedBy)
      return res.status(400).json({ success: false, message: `ลบไม่ได้ — มี Order ใช้สินค้านี้อยู่ (เช่น ${usedBy.orderID})` });
    const r = await Product.deleteOne({ productID: pid, companyID });
    if (!r.deletedCount) return res.status(404).json({ success: false, message: 'product not found' });
    return res.json({ success: true, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ==================== COLOR (per setName = per customer) ====================
exports.getColors = async (req, res, next) => {
  try {
    const colors = await Color.find({ companyID: req.params.companyID, setName: req.params.setName }).sort({ seq: 1 }).lean();
    return res.json({ success: true, colors });
  } catch (err) { return next(err); }
};

exports.saveColor = async (req, res, next) => {
  const { _id, companyID, setName, colorID, colorName, colorValue, colorCode, seq } = req.body;
  if (!companyID || !setName)
    return res.status(400).json({ success: false, message: 'companyID + setName required' });
  try {
    if (_id) {
      const set = {
        'color.colorID': colorID || '', 'color.colorName': colorName || '', 'color.colorValue': colorValue || '', 'color.colorCode': colorCode || '',
        seq: Number(seq) || 0,
      };
      const color = await Color.findByIdAndUpdate(_id, { $set: set }, { new: true }).lean();
      if (!color) return res.status(404).json({ success: false, message: 'color not found' });
      return res.json({ success: true, color, ...(await tokenRefresh(req)) });
    }
    if (!colorID || !colorID.trim())
      return res.status(400).json({ success: false, message: 'colorID required (สร้างใหม่ต้องระบุรหัสสี)' });
    const color = await Color.create({
      companyID, setName, seq: Number(seq) || 0,
      color: { colorID: colorID.trim(), colorName: colorName || '', colorValue: colorValue || '', colorCode: colorCode || '' },
    });
    return res.status(201).json({ success: true, color, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

exports.deleteColor = async (req, res, next) => {
  try { await Color.findByIdAndDelete(req.params.id); return res.json({ success: true, ...(await tokenRefresh(req)) }); }
  catch (err) { return next(err); }
};

// ==================== SIZE (global) ========================================
exports.getSizes = async (req, res, next) => {
  try { const sizes = await Size.find({}).sort({ seq: 1 }).lean(); return res.json({ success: true, sizes }); }
  catch (err) { return next(err); }
};

exports.saveSize = async (req, res, next) => {
  const { _id, sizeID, sizeName, seq } = req.body;
  try {
    if (_id) {
      const size = await Size.findByIdAndUpdate(_id, { $set: { 'size.sizeName': sizeName || '', seq: Number(seq) || 0 } }, { new: true }).lean();
      if (!size) return res.status(404).json({ success: false, message: 'size not found' });
      return res.json({ success: true, size, ...(await tokenRefresh(req)) });
    }
    if (!sizeID || !sizeID.trim())
      return res.status(400).json({ success: false, message: 'sizeID required (สร้างใหม่ต้องระบุรหัสไซซ์)' });
    const size = await Size.create({ seq: Number(seq) || 0, size: { sizeID: sizeID.trim(), sizeName: sizeName || '' } });
    return res.status(201).json({ success: true, size, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

exports.deleteSize = async (req, res, next) => {
  try { await Size.findByIdAndDelete(req.params.id); return res.json({ success: true, ...(await tokenRefresh(req)) }); }
  catch (err) { return next(err); }
};

// ==================== TARGET PLACE + COUNTRY ===============================
exports.getTargetPlaces = async (req, res, next) => {
  try { const targetPlaces = await TargetPlace.find({}).sort({ seq: 1 }).lean(); return res.json({ success: true, targetPlaces }); }
  catch (err) { return next(err); }
};

exports.saveTargetPlace = async (req, res, next) => {
  const { _id, targetPlaceID, targetPlaceName, countryID, countryName, seq } = req.body;
  try {
    if (_id) {
      const set = {
        'targetPlace.targetPlaceName': targetPlaceName || '',
        'targetPlace.countryID': countryID || '', 'targetPlace.countryName': countryName || '',
        seq: Number(seq) || 0,
      };
      const tp = await TargetPlace.findByIdAndUpdate(_id, { $set: set }, { new: true }).lean();
      if (!tp) return res.status(404).json({ success: false, message: 'targetPlace not found' });
      return res.json({ success: true, targetPlace: tp, ...(await tokenRefresh(req)) });
    }
    if (!targetPlaceID || !targetPlaceID.trim())
      return res.status(400).json({ success: false, message: 'targetPlaceID required' });
    const tp = await TargetPlace.create({
      seq: Number(seq) || 0,
      targetPlace: { targetPlaceID: targetPlaceID.trim(), targetPlaceName: targetPlaceName || '', countryID: countryID || '', countryName: countryName || '' },
    });
    return res.status(201).json({ success: true, targetPlace: tp, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

exports.deleteTargetPlace = async (req, res, next) => {
  try { await TargetPlace.findByIdAndDelete(req.params.id); return res.json({ success: true, ...(await tokenRefresh(req)) }); }
  catch (err) { return next(err); }
};

exports.getCountries = async (req, res, next) => {
  try { const countries = await DCountry.find({ companyID: req.params.companyID }).sort({ seq: 1 }).lean(); return res.json({ success: true, countries }); }
  catch (err) { return next(err); }
};

exports.saveCountry = async (req, res, next) => {
  const { _id, companyID, dCountryID, dCountryName, show, seq } = req.body;
  if (!companyID) return res.status(400).json({ success: false, message: 'companyID required' });
  try {
    if (_id) {
      const c = await DCountry.findByIdAndUpdate(_id, { $set: { dCountryName: dCountryName || '', show: show !== false, seq: Number(seq) || 0 } }, { new: true }).lean();
      if (!c) return res.status(404).json({ success: false, message: 'country not found' });
      return res.json({ success: true, country: c, ...(await tokenRefresh(req)) });
    }
    if (!dCountryID || !dCountryID.trim())
      return res.status(400).json({ success: false, message: 'dCountryID required' });
    const c = await DCountry.create({ companyID, dCountryID: dCountryID.trim(), dCountryName: dCountryName || '', show: show !== false, seq: Number(seq) || 0 });
    return res.status(201).json({ success: true, country: c, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// GET /api/a/master/sysinfo   [AI ใหม่ 2026-07-17]
// requirement: โชว์ system information แบบแอปเดิม (ดับเบิลคลิกชื่อ user ใน sidebar)
//   ที่ user อยากรู้จริงๆ คือ MGDB — เช็คว่า API ตัวนี้ต่อ database ตัวไหนอยู่
//   (ค่าอ่านจาก .env ของเซิร์ฟเวอร์ที่รันอยู่ — MGDB / APPVER / APPNAME / APPEMAIL)
// ══════════════════════════════════════════════════════════════════════════
exports.getSysInfo = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      sysInfo: [
        { id: 'MGDB',    data: process.env.MGDB     || '' },   // ← ตัวสำคัญ: ต่อ DB ไหน
        { id: 'APPVER',  data: process.env.APPVER   || '' },
        { id: 'APPNAME', data: process.env.APPNAME  || '' },
        { id: 'APPMAIL', data: process.env.APPEMAIL || '' },   // env จริงชื่อ APPEMAIL (ตามแอปเดิม)
        { id: 'NODE',    data: process.version },              // แถม: เวอร์ชัน Node ของเซิร์ฟเวอร์
      ],
      ...(await tokenRefresh(req)),
    });
  } catch (err) { return next(err); }
};

// ══════════════════════════════════════════════════════════════════════════
// SUBNODE (SubNodeFlowC · ขั้นตอนย่อยต่อ node) — Master Data — [AI ใหม่ 2026-07-17]
//   collection: subnodeflowc · fields: { companyID, nodeID, subNodeID, subNodeName, seq }
//   GET  /api/a/master/subnode/:companyID  → list (เรียง seq)
//   POST /api/a/master/subnode/save        → create/update
//   DELETE /api/a/master/subnode/:id
// ══════════════════════════════════════════════════════════════════════════
exports.getSubnodes = async (req, res, next) => {
  try {
    const { companyID } = req.params;
    const subnodes = await SubNodeFlowC.find({ companyID }).sort({ seq: 1 }).lean();
    return res.json({ success: true, subnodes, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

exports.saveSubnode = async (req, res, next) => {
  try {
    const { _id } = req.body;
    const companyID   = String(req.body.companyID || '').trim();
    const nodeID      = String(req.body.nodeID || '').trim();
    const subNodeID   = String(req.body.subNodeID || '').trim();
    const subNodeName = String(req.body.subNodeName || '').trim();
    const seq         = Math.floor(+req.body.seq || 0);

    if (_id) {
      const sub = await SubNodeFlowC.findByIdAndUpdate(_id,
        { $set: { nodeID, subNodeID, subNodeName, seq } }, { new: true }).lean();
      if (!sub) return res.status(404).json({ success: false, message: 'subnode not found' });
      return res.json({ success: true, subnode: sub, ...(await tokenRefresh(req)) });
    }
    if (!companyID || !nodeID || !subNodeID)
      return res.status(400).json({ success: false, message: 'companyID + nodeID + subNodeID required' });
    // กันซ้ำ nodeID+subNodeID ต่อ company
    const dup = await SubNodeFlowC.findOne({ companyID, nodeID, subNodeID }).lean();
    if (dup) return res.status(409).json({ success: false, message: `มี ${nodeID} / ${subNodeID} อยู่แล้ว` });
    const sub = await SubNodeFlowC.create({ companyID, nodeID, subNodeID, subNodeName, seq });
    return res.status(201).json({ success: true, subnode: sub, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

exports.deleteSubnode = async (req, res, next) => {
  try { await SubNodeFlowC.findByIdAndDelete(req.params.id); return res.json({ success: true, ...(await tokenRefresh(req)) }); }
  catch (err) { return next(err); }
};
