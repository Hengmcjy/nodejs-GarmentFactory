// Requirement: Station Scan Login — หน้า login แยกของเครื่องสแกน (/scanstation ในแอปใหม่)
//   flow (ตาม app เดิม angularGarmentX แต่เปลี่ยน socket.io → polling):
//   1) station login ด้วย user/pass ของ station (nodestations.userNode — plaintext ตาม app เดิม ห้าม hash)
//   2) ถ้า uuid เครื่องตรงกับที่ผูกไว้แล้ว → เข้าได้ทันที (ไม่ต้องขออนุมัติใหม่)
//   3) ถ้ายังไม่ผูก → สร้างคำขอใน nodestationloginrequests (หมดอายุ 5 นาที = 300 วิ)
//      → หน้า station poll ทุก 4 วิ · admin กดอนุมัติจาก badge บน topbar → bind uuid เข้า userNode
//   ★ ชี้ collection เดิม: nodestations + nodestationloginrequests (require model legacy อย่างเดียว ไม่แก้ model)
//   ★ endpoint ฝั่ง station = public (เครื่อง station ไม่มี token office) · ฝั่ง admin = checkAuthA+checkUUID (ดู r-station.js)
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ShareFunc = require("../c-api-app-share-function");
const NodeStation = require("../../models/m-nodeStation");
const NodeStationLoginRequest = require("../../models/m-nodeStationLoginRequest");
const Company = require("../../models/m-company");
const Factory = require("../../models/m-factory");
const Gsconfig = require("../../models/m-gsconfig");   // ## APP_VERSION (configID `${factoryID}-system-APP_VERSION`) — โชว์บน station
const Order = require("../../models/m-order");   // ## orders ตาม season active (station ไม่เลือก season)
const NodeFlow = require("../../models/m-nodeFlow");   // ## flowSeq main → รายชื่อ node (dropdown report node-bundle)
const OrderProduction = require("../../models/m-orderProduction");   // ## ★ Scan product — อ่าน/เขียน productionNode ระดับชิ้น
const User = require("../../models/m-user");   // ## staff/worker เดิมอยู่ collection users (state='staff' · pass bcrypt)
const workerScanCtrl = require("./c-worker-scan");   // ## reuse buildWorkerScanReport (cross-module helper — ไม่ก๊อป logic · ผลตรงหน้า office เป๊ะ)
const nodeBundleCtrl = require("./c-report2-nodebundle");   // ## reuse buildProductFlow (หน้าต่างลอย Product Flow)
const report2Ctrl = require("./c-report2");   // ## reuse buildScanOverview (no.3) — station report #2 · ล็อกโรงจาก token

// ## อายุคำขอ login = 5 นาที (300 วิ) เท่ากับ app เดิม (minutePlus=5)
const REQUEST_TTL_MS = 5 * 60 * 1000;

// ## ★ station token: อายุ 30 วันแบบ sliding — ต่ออายุ (ออก token ใหม่) ทุกครั้งที่ query
// ##   ไม่เคลื่อนไหวเลย 30 วัน = token หมดอายุ → หน้า station เด้งกลับ login (เครื่องยังผูกอยู่ กรอก user/pass ใหม่เข้าได้เลย)
const STATION_TOKEN_MS = 30 * 24 * 60 * 60 * 1000;

// ## ออก station token (jwt secret เดียวกับ /api/a = JWT_KEY_ACC)
function genStationTokenPack(ns, stationID, uuid) {
  const stationToken = jwt.sign(
    { typ: 'station', uuid: uuid, companyID: ns.companyID, factoryID: ns.factoryID, nodeID: ns.nodeID, stationID: stationID },
    process.env.JWT_KEY_ACC,
    { expiresIn: '30d' }
  );
  return { stationToken, stationTokenExpMs: Date.now() + STATION_TOKEN_MS };
}

// ## token refresh สำหรับ endpoint ฝั่ง admin (pattern เดียวกับ c-scan-station.js)
const tokenRefresh = async (req) => {
  const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
  return { token, expiresIn: Number(process.env.TOKENExpiresIn) };
};

// ## ตัด credential ออกจาก nodeStation ก่อนส่งให้เครื่อง station (กัน user/pass ของ station อื่นหลุด)
function sanitizeNodeStation(ns, stationID) {
  if (!ns) return null;
  const me = (ns.userNode || []).find(u => u.stationID === stationID) || {};
  return {
    companyID: ns.companyID,
    factoryID: ns.factoryID,
    nodeID: ns.nodeID,
    nodeName: ns.nodeName || '',
    status: ns.status,
    nodeInfo: ns.nodeInfo || {},
    stationID: stationID,
    canScanNode: !!me.canScanNode,
    canScanSubNode: !!me.canScanSubNode,
  };
}

// ## ประกอบ context ที่หน้า station ใช้แสดง (company/factory names + node/station + สิทธิ์สแกน)
async function buildStationContext(ns, stationID) {
  const company = await Company.findOne({ companyID: ns.companyID }, { _id: 0, companyID: 1, 'cInfo.companyName': 1, 'cInfo.abbreviation': 1 }).lean();
  const factory = await Factory.findOne({ companyID: ns.companyID, factoryID: ns.factoryID }, { _id: 0, factoryID: 1, 'fInfo.factoryName': 1, 'fInfo.abbreviation': 1 }).lean();
  // ## APP_VERSION + SEASON_ACTIVE ของโรงนี้ — configID `${factoryID}-system-<KEY>`
  const verDoc = await Gsconfig.findOne({ configID: `${ns.factoryID}-system-APP_VERSION` }, { value: 1, _id: 0 }).lean();
  const seaDoc = await Gsconfig.findOne({ configID: `${ns.factoryID}-system-SEASON_ACTIVE` }, { value: 1, _id: 0 }).lean();
  const seasonsActive = String((seaDoc && seaDoc.value) || '').split(',').map(s => s.trim()).filter(Boolean);
  return {
    company: { companyID: ns.companyID, companyName: company?.cInfo?.companyName || '', abbreviation: company?.cInfo?.abbreviation || '' },
    factory: { factoryID: ns.factoryID, factoryName: factory?.fInfo?.factoryName || '', abbreviation: factory?.fInfo?.abbreviation || '' },
    nodeStation: sanitizeNodeStation(ns, stationID),
    stationID: stationID,
    appVersion: verDoc?.value || '',
    seasonsActive,   // ## รายชื่อ season ที่ active (config SEASON_ACTIVE) — station ดึงข้อมูลตามนี้
  };
}

// POST /api/a/station/login  (public)
//   body: { userID, userPass, uuid }  · uuid = เครื่อง station (client gen ครั้งแรกแล้วเก็บ localStorage)
//   → uuid ผูกแล้ว = allowed ทันที · ยังไม่ผูก = สร้างคำขอ + waiting (นับถอยหลัง 300 วิ ฝั่งหน้าเว็บ)
exports.stationLogin = async (req, res, next) => {
  try {
    const b = req.body || {};
    const userID = String(b.userID || '').trim();
    const userPass = String(b.userPass || '');
    const uuid = String(b.uuid || '').trim();
    if (!userID || !userPass || !uuid) {
      return res.status(400).json({ success: false, message: 'userID + userPass + uuid required' });
    }

    // ## หา station จาก user/pass (เทียบ plaintext ตาม app เดิม) — เฉพาะ node ที่ active
    // ## ★ user/pass เดียวกันอาจตรงหลาย station (ซ้ำข้ามโรง/ข้าม node ได้ — ระบบเช็คซ้ำเฉพาะในโรงเดียวกัน)
    // ##   → หาทุกตัวที่ตรง แล้วเลือกตามลำดับ: (1) ตัวที่ผูก uuid เครื่องนี้อยู่แล้ว (2) ตัวที่ว่าง (3) ผูกหมด = 409 บอกที่
    const candidates = await NodeStation.find({
      status: 'a',
      userNode: { $elemMatch: { userNodeID: userID, userNodePass: userPass } },
    }).lean();
    const matches = [];
    for (const doc of candidates) {
      for (const u of (doc.userNode || [])) {
        if (u.userNodeID === userID && u.userNodePass === userPass) matches.push({ doc, entry: u });
      }
    }
    if (!matches.length) {
      return res.status(401).json({ success: false, message: 'station userID or password incorrect' });
    }

    // ## 1) เครื่องเดิมที่ผูก uuid ไว้แล้ว (ที่ station ไหนก็ได้) → เข้าได้เลย ไม่ต้องขออนุมัติ + ออก token 30 วัน
    let m = matches.find(x => x.entry.uuid && x.entry.uuid === uuid);
    if (m) {
      const context = await buildStationContext(m.doc, m.entry.stationID);
      return res.json({ success: true, allowed: true, waiting: false, ...context, ...genStationTokenPack(m.doc, m.entry.stationID, uuid) });
    }

    // ## 2) หา station ที่ยังว่าง (uuid ว่าง) — ★ กัน login ซ้ำ: ผูกหมดทุกตัว = เครื่องทีหลังเข้าไม่ได้เลย
    // ##    ข้อความบอกชัดว่าผูกอยู่ที่ โรง/node/station ไหน ให้ admin ไปกด "ปลดผูกเครื่อง" ถูกจุด
    m = matches.find(x => !x.entry.uuid);
    if (!m) {
      const where = matches.map(x => `${x.doc.factoryID} ${x.doc.nodeID} [${x.entry.stationID}]`).join(', ');
      return res.status(409).json({
        success: false,
        inUse: true,
        message: `station in use on another machine — bound at: ${where}. Ask admin to unbind (Admin > Scan Station)`,
      });
    }
    const ns = m.doc;
    const stationID = m.entry.stationID;

    // ## ★ กัน login ซ้ำระหว่างรอ: มีเครื่องอื่นขอ login station นี้ค้างอยู่ (ยังไม่หมดอายุ) → เครื่องทีหลังเข้าไม่ได้
    const now = new Date();
    const pending = await NodeStationLoginRequest.findOne({
      companyID: ns.companyID, factoryID: ns.factoryID, nodeID: ns.nodeID, stationID: stationID,
    }).lean();
    if (pending && pending.uuidUserNodeLoginWaiting !== uuid
        && new Date(pending.datetime).getTime() + REQUEST_TTL_MS > Date.now()) {
      return res.status(409).json({
        success: false,
        inUse: true,
        message: `another machine is already waiting for approval on ${ns.factoryID} ${ns.nodeID} [${stationID}] — approve/reject it first (badge on topbar)`,
      });
    }

    // ## ยังไม่ผูก → upsert คำขอ login (1 คำขอต่อ station — เหมือน addNodeStationLoginRequest เดิม)
    await NodeStationLoginRequest.updateOne(
      { companyID: ns.companyID, factoryID: ns.factoryID, nodeID: ns.nodeID, stationID: stationID },
      { $set: {
          uuidUserNodeLoginWaiting: uuid,
          userID: [],
          userClass: ['owner'],
          formName: [],
          datetime: now,
          createdAt: now,
      } },
      { upsert: true }
    );

    const context = await buildStationContext(ns, stationID);
    return res.json({
      success: true,
      allowed: false,
      waiting: true,
      expiresAt: new Date(now.getTime() + REQUEST_TTL_MS).toISOString(),
      ...context,
    });
  } catch (err) {
    console.error('stationLogin error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/poll/:uuid  (public)
//   หน้า station เรียกทุก 4 วิระหว่างรอ + เรียกครั้งแรกตอนเปิดหน้า (auto login เครื่องที่ผูกแล้ว)
//   → allowed: uuid ถูกผูกเข้า userNode แล้ว (admin กดอนุมัติ) · waiting: คำขอยังไม่หมดอายุ · ไม่งั้น = expired/rejected
exports.stationPoll = async (req, res, next) => {
  try {
    const uuid = String(req.params.uuid || '').trim();
    if (!uuid) return res.status(400).json({ success: false, message: 'uuid required' });

    // ## 1) เครื่องนี้ถูกผูกแล้ว (admin เพิ่งกดอนุมัติ) → allowed + ส่ง context + ออก token 30 วัน
    const ns = await NodeStation.findOne({ status: 'a', 'userNode.uuid': uuid }).lean();
    if (ns) {
      const entry = (ns.userNode || []).find(u => u.uuid === uuid);
      const stationID = entry ? entry.stationID : '';
      const context = await buildStationContext(ns, stationID);
      return res.json({ success: true, allowed: true, waiting: false, ...context, ...genStationTokenPack(ns, stationID, uuid) });
    }

    // ## 2) คำขอยังค้างอยู่และไม่หมดอายุ → waiting + วินาทีที่เหลือ
    const reqDoc = await NodeStationLoginRequest.findOne({ uuidUserNodeLoginWaiting: uuid }).lean();
    if (reqDoc && reqDoc.datetime) {
      const msLeft = new Date(reqDoc.datetime).getTime() + REQUEST_TTL_MS - Date.now();
      if (msLeft > 0) {
        return res.json({ success: true, allowed: false, waiting: true, secondsLeft: Math.floor(msLeft / 1000) });
      }
      // ## หมดอายุแล้ว → ลบคำขอทิ้ง
      await NodeStationLoginRequest.deleteOne({ _id: reqDoc._id });
    }

    // ## 3) ไม่มีทั้งการผูกและคำขอ → ถูกปฏิเสธ/หมดอายุ
    return res.json({ success: true, allowed: false, waiting: false });
  } catch (err) {
    console.error('stationPoll error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/cancel  (public)  body: { uuid }
//   station กดยกเลิกระหว่างรอ / countdown หมดเวลา → ลบคำขอตัวเอง
exports.stationCancel = async (req, res, next) => {
  try {
    const uuid = String((req.body || {}).uuid || '').trim();
    if (!uuid) return res.status(400).json({ success: false, message: 'uuid required' });
    await NodeStationLoginRequest.deleteMany({ uuidUserNodeLoginWaiting: uuid });
    return res.json({ success: true });
  } catch (err) {
    console.error('stationCancel error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/logout  (public)  body: { uuid }
//   ปลดผูกเครื่องตัวเอง (uuid ต้องตรงเท่านั้น) — ครั้งถัดไปต้องขออนุมัติใหม่ (เหมือน putLogoutNodeStation เดิม)
exports.stationLogout = async (req, res, next) => {
  try {
    const uuid = String((req.body || {}).uuid || '').trim();
    if (!uuid) return res.status(400).json({ success: false, message: 'uuid required' });
    await NodeStation.updateOne(
      { 'userNode.uuid': uuid },
      { $set: { 'userNode.$[st].uuid': '' } },
      { arrayFilters: [{ 'st.uuid': uuid }] }
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('stationLogout error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/session  (header: x-station-token)
//   เปิดแอป/F5 = auto-login ด้วย token (แทนการ poll ด้วย uuid เปล่าๆ) — verify + ★ ต่ออายุ token ใหม่ทุกครั้ง (sliding 30 วัน)
//   token หมดอายุ (ไม่เคลื่อนไหว 30 วัน) → 401 expired · เครื่องถูกปลดผูกไปแล้ว → 401 unbound
exports.stationSession = async (req, res, next) => {
  try {
    const token = String(req.headers['x-station-token'] || '');
    if (!token) return res.status(401).json({ success: false, expired: false, message: 'no station token' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_KEY_ACC);
    } catch (e) {
      // ## หมดอายุ/token เพี้ยน → เด้งออก ให้ login ใหม่ (เครื่องยังผูกอยู่ = เข้าได้เลยไม่ต้องขออนุมัติ)
      return res.status(401).json({ success: false, expired: true, message: 'station session expired' });
    }
    if (!decoded || decoded.typ !== 'station' || !decoded.uuid) {
      return res.status(401).json({ success: false, expired: true, message: 'invalid station token' });
    }

    // ## เครื่องต้องยังผูกอยู่กับ station (admin ปลดผูก = session ตาย)
    const ns = await NodeStation.findOne({ status: 'a', 'userNode.uuid': decoded.uuid }).lean();
    if (!ns) return res.status(401).json({ success: false, unbound: true, message: 'station unbound — login again' });

    const entry = (ns.userNode || []).find(u => u.uuid === decoded.uuid);
    const stationID = entry ? entry.stationID : '';
    const context = await buildStationContext(ns, stationID);
    return res.json({ success: true, allowed: true, ...context, ...genStationTokenPack(ns, stationID, decoded.uuid) });
  } catch (err) {
    console.error('stationSession error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// ## helper: verify station token → คืน { ns, stationID, decoded } · โยน object error (มี .code/.body) ถ้าไม่ผ่าน
async function requireStationToken(req) {
  const token = String(req.headers['x-station-token'] || '');
  if (!token) throw { code: 401, body: { success: false, expired: false, message: 'no station token' } };
  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_KEY_ACC); }
  catch (e) { throw { code: 401, body: { success: false, expired: true, message: 'station session expired' } }; }
  if (!decoded || decoded.typ !== 'station' || !decoded.uuid) {
    throw { code: 401, body: { success: false, expired: true, message: 'invalid station token' } };
  }
  const ns = await NodeStation.findOne({ status: 'a', 'userNode.uuid': decoded.uuid }).lean();
  if (!ns) throw { code: 401, body: { success: false, unbound: true, message: 'station unbound — login again' } };
  const entry = (ns.userNode || []).find(u => u.uuid === decoded.uuid);
  return { ns, stationID: entry ? entry.stationID : '', decoded };
}

// GET /api/a/station/workload?dateStart=&dateEnd=  (header: x-station-token)
//   รายงาน "ค่าแรงเหมา (สแกน)" ของ station นี้ — worker ดูยอดตัวเองได้
//   ★ node ล็อกจาก token (decoded.nodeID) — เลือก node ไม่ได้ · ★ ดูอย่างเดียว ไม่มี PDF (ฝั่ง frontend)
//   ★ ต่ออายุ station token (ทุก query = sliding 30 วัน)
exports.stationWorkload = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }

    const dateStart = String(req.query.dateStart || '').slice(0, 10);
    const dateEnd   = String(req.query.dateEnd || '').slice(0, 10);
    if (!dateStart || !dateEnd) return res.status(400).json({ success: false, message: 'dateStart + dateEnd required' });

    // ★ node/company/factory จาก token — station เลือกเองไม่ได้ (บังคับ server-side)
    const { subNodes, rows } = await workerScanCtrl.buildWorkerScanReport(
      auth.decoded.companyID, auth.decoded.factoryID, auth.decoded.nodeID, dateStart, dateEnd);

    return res.json({
      success: true,
      nodeID: auth.decoded.nodeID,
      subNodes, rows,
      ...genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid),
    });
  } catch (err) {
    console.error('stationWorkload error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/product-flow/:companyID/:code  (header: x-station-token)
//   Product Flow (หน้าต่างลอย) ในหน้า station — ★ companyID ใช้จาก token เสมอ (param แค่ให้ URL เข้ากับ component เดิม)
//   ★ verify + ต่ออายุ station token · reuse buildProductFlow (ผลตรงหน้า office เป๊ะ)
exports.stationProductFlow = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }

    // ★ companyID จาก token (ไม่เชื่อ param — กันดูข้าม company)
    const companyID = auth.decoded.companyID;
    const code = String(req.params.code || '').trim();

    let payload;
    try { payload = await nodeBundleCtrl.buildProductFlow(companyID, code); }
    catch (err) {
      console.error('stationProductFlow build error:', String(err && err.message || err));
      return res.status(501).json({ success: false, message: 'error product flow' });
    }
    const status = payload._status || 200;
    delete payload._status;
    return res.status(status).json({
      success: status === 200,
      ...payload,
      ...genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid),
    });
  } catch (err) {
    console.error('stationProductFlow error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/factory-scan-group/:orderID  (header: x-station-token)
//   รายงาน no.26 ในหน้า station — ★ factory ล็อกจาก token (เลือกไม่ได้) · reuse buildFactoryScanGroup (ผลตรง office เป๊ะ)
exports.stationFactoryScanGroup = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }

    const orderID = String(req.params.orderID || '').trim();
    let payload;
    try { payload = await nodeBundleCtrl.buildFactoryScanGroup(auth.decoded.companyID, auth.decoded.factoryID, orderID); }
    catch (err) {
      console.error('stationFactoryScanGroup build error:', String(err && err.message || err));
      return res.status(501).json({ success: false, message: 'error factory scan group' });
    }
    const status = payload._status || 200;
    delete payload._status;
    return res.status(status).json({
      success: status === 200,
      ...payload,
      ...genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid),
    });
  } catch (err) {
    console.error('stationFactoryScanGroup error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/orders  (header: x-station-token)
//   รายการ order ของ "ทุก season ที่ active" (config SEASON_ACTIVE) — station ไม่มีเลือก season (เสื้อรุ่นไหน season ไหนมาต้องทำหมด)
exports.stationOrders = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }

    const seaDoc = await Gsconfig.findOne({ configID: `${auth.decoded.factoryID}-system-SEASON_ACTIVE` }, { value: 1, _id: 0 }).lean();
    const seasons = String((seaDoc && seaDoc.value) || '').split(',').map(s => s.trim()).filter(Boolean);

    let orders = [];
    if (seasons.length) {
      const rows = await Order.find(
        { companyID: auth.decoded.companyID, seasonYear: { $in: seasons }, orderStatus: 'open' },
        { _id: 0, orderID: 1, seasonYear: 1, 'customerOR.customerName': 1 }
      ).lean();
      orders = rows
        .map(o => ({ orderID: o.orderID, seasonYear: o.seasonYear || '', customerName: (o.customerOR && o.customerOR.customerName) || '' }))
        .sort((a, b) => String(a.orderID).localeCompare(String(b.orderID)));
    }

    // ## รายชื่อ node (flowSeq main) — สำหรับ dropdown report node-bundle (station #3)
    let nodes = [];
    const flow = await NodeFlow.findOne({ companyID: auth.decoded.companyID, flowType: 'main' }).lean();
    if (flow && Array.isArray(flow.flowSeq) && flow.flowSeq.length) {
      nodes = flow.flowSeq.slice()
        .sort((a, b) => String(a.seqNo).localeCompare(String(b.seqNo), undefined, { numeric: true }))
        .map(s => s.nodeID).filter(Boolean)
        .map(nodeID => ({ nodeID }));
    }

    return res.json({ success: true, seasonsActive: seasons, orders, nodes, ...genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid) });
  } catch (err) {
    console.error('stationOrders error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/scan-overview?dateStart=&dateEnd=  (header: x-station-token)
//   รายงาน station #2 — เหมือน no.3 (ภาพรวมการสแกน) เลือกช่วงวัน · ★ ล็อกโรงจาก token · ทุก season active
exports.stationScanOverview = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }

    const date1 = String(req.query.dateStart || '').slice(0, 10);
    const date2 = String(req.query.dateEnd || '').slice(0, 10);
    if (!date1 || !date2) return res.status(400).json({ success: false, message: 'missing date range' });

    // ## season ที่ active (station ไม่เลือก season — เสื้อรุ่นไหน season ไหนมาต้องทำหมด)
    const seaDoc = await Gsconfig.findOne({ configID: `${auth.decoded.factoryID}-system-SEASON_ACTIVE` }, { value: 1, _id: 0 }).lean();
    const seasons = String((seaDoc && seaDoc.value) || '').split(',').map(s => s.trim()).filter(Boolean);

    let payload;
    try {
      payload = await report2Ctrl.buildScanOverview(
        auth.decoded.companyID, seasons, date1, date2, [auth.decoded.factoryID]);   // ★ ล็อกโรงเดียว
    } catch (err) {
      console.error('stationScanOverview build error:', String(err && err.message || err));
      return res.status(501).json({ success: false, message: 'error scan overview' });
    }
    return res.status(200).json({
      success: true, seasonsActive: seasons, ...payload,
      ...genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid),
    });
  } catch (err) {
    console.error('stationScanOverview error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/outsource-state  (header: x-station-token)
//   รายงาน outsource "ส่งออก-รับกลับ ตามวัน" (คล้าย no.35) · ★ อ่าน cache ทุก season active · เลขตรง no.35
exports.stationOutsourceState = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }

    const seaDoc = await Gsconfig.findOne({ configID: `${auth.decoded.factoryID}-system-SEASON_ACTIVE` }, { value: 1, _id: 0 }).lean();
    const seasons = String((seaDoc && seaDoc.value) || '').split(',').map(s => s.trim()).filter(Boolean);

    let payload;
    try { payload = await report2Ctrl.buildOutsourceStateAllSeasons(auth.decoded.companyID, seasons); }
    catch (err) {
      console.error('stationOutsourceState build error:', String(err && err.message || err));
      return res.status(501).json({ success: false, message: 'error outsource state' });
    }
    return res.status(200).json({
      success: true, seasonsActive: seasons, ...payload,
      ...genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid),
    });
  } catch (err) {
    console.error('stationOutsourceState error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/prod-scan?dateStart=&dateEnd=  (header: x-station-token)
//   รายงาน station #4 — เหมือน no.22 (Factory Scan · WIP by period) เลือกช่วงวัน · ★ ล็อกโรงจาก token · ทุก season active
exports.stationProdScanPeriod = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }

    const date1 = String(req.query.dateStart || '').slice(0, 10);
    const date2 = String(req.query.dateEnd || '').slice(0, 10);
    if (!date1 || !date2) return res.status(400).json({ success: false, message: 'missing date range' });

    const seaDoc = await Gsconfig.findOne({ configID: `${auth.decoded.factoryID}-system-SEASON_ACTIVE` }, { value: 1, _id: 0 }).lean();
    const seasons = String((seaDoc && seaDoc.value) || '').split(',').map(s => s.trim()).filter(Boolean);

    let payload;
    try {
      payload = await report2Ctrl.buildProdScanPeriod(
        auth.decoded.companyID, seasons, date1, date2, auth.decoded.factoryID);   // ★ ล็อกโรงจาก token
    } catch (err) {
      console.error('stationProdScanPeriod build error:', String(err && err.message || err));
      return res.status(501).json({ success: false, message: 'error prod scan period' });
    }
    return res.status(200).json({
      success: true, seasonsActive: seasons, ...payload,
      ...genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid),
    });
  } catch (err) {
    console.error('stationProdScanPeriod error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/node-bundle/index/:orderID/:nodeID  (header: x-station-token)
//   รายงาน station #3 — เหมือน no.11 (Node Bundle) index: combos zone/color/size ที่มีชิ้นอยู่ node นี้ · ★ ล็อกโรงจาก token
exports.stationNodeBundleIndex = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    let payload;
    try {
      payload = await nodeBundleCtrl.buildNodeBundleIndex(
        auth.decoded.companyID, String(req.params.orderID || '').trim(), String(req.params.nodeID || '').trim(),
        auth.decoded.factoryID);   // ★ ล็อกโรงจาก token
    } catch (err) {
      console.error('stationNodeBundleIndex build error:', String(err && err.message || err));
      return res.status(501).json({ success: false, message: 'error node-bundle index' });
    }
    return res.status(200).json({ success: true, ...payload, ...genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid) });
  } catch (err) {
    console.error('stationNodeBundleIndex error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/node-bundle/detail/:orderID/:nodeID/:zone/:color/:size  (header: x-station-token)
//   รายงาน station #3 detail — ทุกชิ้นในมัดที่มีชิ้นอยู่ node นี้ (combo) พร้อม node ปัจจุบันของแต่ละชิ้น · ★ ล็อกโรงจาก token
exports.stationNodeBundleDetail = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const p = req.params;
    let payload;
    try {
      payload = await nodeBundleCtrl.buildNodeBundleDetail(
        auth.decoded.companyID, String(p.orderID || '').trim(), String(p.nodeID || '').trim(),
        auth.decoded.factoryID, p.zone, p.color, p.size);   // ★ ล็อกโรงจาก token
    } catch (err) {
      console.error('stationNodeBundleDetail build error:', String(err && err.message || err));
      return res.status(501).json({ success: false, message: 'error node-bundle detail' });
    }
    return res.status(200).json({ success: true, ...payload, ...genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid) });
  } catch (err) {
    console.error('stationNodeBundleDetail error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/factory-scan-flat/:orderID  (header: x-station-token)
//   รายงาน station #1 — ชิ้นค้างในโรงนี้ทั้งหมด (ไม่แบ่ง node) แยก สี×ไซซ์×โซน · factory จาก token
exports.stationFactoryScanFlat = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    let payload;
    try { payload = await nodeBundleCtrl.buildFactoryScanFlat(auth.decoded.companyID, auth.decoded.factoryID, String(req.params.orderID || '').trim()); }
    catch (err) {
      console.error('stationFactoryScanFlat build error:', String(err && err.message || err));
      return res.status(501).json({ success: false, message: 'error factory scan flat' });
    }
    const status = payload._status || 200;
    delete payload._status;
    return res.status(status).json({ success: status === 200, ...payload, ...genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid) });
  } catch (err) {
    console.error('stationFactoryScanFlat error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/factory-scan-group/detail/:orderID/:node/:zone/:color/:size  (header: x-station-token)
//   ดับเบิลคลิก qty ในหน้า station → รายชิ้น bundleNo/barcode · factory จาก token
exports.stationFactoryScanGroupDetail = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const p = req.params;
    let payload;
    try { payload = await nodeBundleCtrl.buildFactoryScanGroupDetail(auth.decoded.companyID, auth.decoded.factoryID, p.orderID, p.node, p.zone, p.color, p.size, req.query.page, req.query.limit); }
    catch (err) {
      console.error('stationFactoryScanGroupDetail build error:', String(err && err.message || err));
      return res.status(501).json({ success: false, message: 'error factory scan group detail' });
    }
    const status = payload._status || 200;
    delete payload._status;
    return res.status(status).json({ success: status === 200, ...payload, ...genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid) });
  } catch (err) {
    console.error('stationFactoryScanGroupDetail error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/staff-login  (public — แต่ต้องเป็นเครื่อง station ที่ผูก uuid แล้วเท่านั้น)
//   body: { uuid, userID, userPass }  · uuid = เครื่อง station (ต้องผูกกับ station อยู่)
//   staff = collection users (state='staff', status='a', pass bcrypt) — เหมือน staffNodeLogin เดิม
//   เงื่อนไข: staff ต้อง joined โรงงานเดียวกับ station นี้ (uFactory.state='joined')
exports.staffLogin = async (req, res, next) => {
  try {
    const b = req.body || {};
    const uuid = String(b.uuid || '').trim();
    const userID = String(b.userID || '').trim();
    const userPass = String(b.userPass || '');
    if (!uuid || !userID || !userPass) {
      return res.status(400).json({ success: false, message: 'uuid + userID + userPass required' });
    }

    // ## เครื่องต้องเป็น station ที่ผูกแล้ว (กันยิง endpoint ตรงจากเครื่องอื่น)
    const ns = await NodeStation.findOne({ status: 'a', 'userNode.uuid': uuid }).lean();
    if (!ns) {
      return res.status(401).json({ success: false, message: 'station not bound — login station first' });
    }

    // ## หา staff (state='staff' เท่านั้น — office user ใช้หน้า login ปกติ)
    const user = await User.findOne({ userID: userID, state: 'staff', status: 'a' }).lean();
    if (!user) {
      return res.status(401).json({ success: false, message: 'staff userID or password incorrect' });
    }

    // ## staff ต้อง joined โรงงานเดียวกับ station นี้
    const joined = (user.uFactory || []).some(f => f.factoryID === ns.factoryID && f.state === 'joined');
    if (!joined) {
      return res.status(403).json({ success: false, message: `staff not joined this factory (${ns.factoryID})` });
    }

    // ## เทียบรหัส bcrypt (เหมือน staffNodeLogin เดิม)
    const doMatch = await bcrypt.compare(userPass, (user.uInfo && user.uInfo.userPass) || '');
    if (!doMatch) {
      return res.status(401).json({ success: false, message: 'staff userID or password incorrect' });
    }

    await User.updateOne({ userID: userID }, { $set: { 'uInfo.lastLogin': new Date() } });
    // ## ★ ทุก query จากเครื่อง station = กิจกรรม → ต่ออายุ station token (sliding 30 วัน)
    const entry = (ns.userNode || []).find(u => u.uuid === uuid);
    return res.json({
      success: true,
      staff: {
        userID: user.userID,
        userName: (user.uInfo && user.uInfo.userName) || user.userID,
        pic: (user.uInfo && user.uInfo.pic) || '',
      },
      ...genStationTokenPack(ns, entry ? entry.stationID : '', uuid),
    });
  } catch (err) {
    console.error('staffLogin error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// ## helper ฝั่ง admin: รายการคำขอที่ยังไม่หมดอายุของ company + เติมชื่อโรงงาน + วินาทีที่เหลือ
async function listPendingRequests(companyID) {
  // ## เก็บกวาดคำขอหมดอายุทิ้งก่อน (TTL 5 นาที)
  await NodeStationLoginRequest.deleteMany({ datetime: { $lt: new Date(Date.now() - REQUEST_TTL_MS) } });
  const rows = await NodeStationLoginRequest.find({ companyID }).sort({ datetime: 1 }).lean();
  const factories = await Factory.find({ companyID }, { _id: 0, factoryID: 1, 'fInfo.factoryName': 1, 'fInfo.abbreviation': 1 }).lean();
  const facMap = new Map(factories.map(f => [f.factoryID, f]));
  return rows.map(r => {
    const f = facMap.get(r.factoryID);
    return {
      companyID: r.companyID,
      factoryID: r.factoryID,
      factoryName: f?.fInfo?.factoryName || r.factoryID,
      factoryAbbr: f?.fInfo?.abbreviation || '',
      nodeID: r.nodeID,
      stationID: r.stationID,
      uuidUserNodeLoginWaiting: r.uuidUserNodeLoginWaiting,
      datetime: r.datetime,
      secondsLeft: Math.max(0, Math.floor((new Date(r.datetime).getTime() + REQUEST_TTL_MS - Date.now()) / 1000)),
    };
  });
}

// GET /api/a/station/requests/:companyID  (admin)
//   badge บน topbar poll เอาจำนวน + รายการคำขอ login ที่ค้างอยู่
exports.getLoginRequests = async (req, res, next) => {
  try {
    const companyID = String(req.params.companyID || '').trim();
    if (!companyID) return res.status(400).json({ success: false, message: 'companyID required' });
    const requests = await listPendingRequests(companyID);
    return res.json({ success: true, requests, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// PUT /api/a/station/requests/allow  (admin)
//   body: { companyID, factoryID, nodeID, stationID, uuidUserNodeLoginWaiting }
//   → bind uuid เข้า userNode ของ station นั้น (arrayFilters ต่อ station เดียว) + ลบคำขอ (เหมือน putAllowNodeStationLoginRequest เดิม)
exports.allowLoginRequest = async (req, res, next) => {
  try {
    const b = req.body || {};
    const companyID = String(b.companyID || '').trim();
    const factoryID = String(b.factoryID || '').trim();
    const nodeID = String(b.nodeID || '').trim();
    const stationID = String(b.stationID || '').trim();
    const uuid = String(b.uuidUserNodeLoginWaiting || '').trim();
    if (!companyID || !factoryID || !nodeID || !stationID || !uuid) {
      return res.status(400).json({ success: false, message: 'companyID + factoryID + nodeID + stationID + uuid required' });
    }

    // ## คำขอต้องยังอยู่และไม่หมดอายุ (กันกดอนุมัติคำขอค้างเก่า)
    const reqDoc = await NodeStationLoginRequest.findOne({ companyID, factoryID, nodeID, stationID, uuidUserNodeLoginWaiting: uuid }).lean();
    if (!reqDoc) return res.status(404).json({ success: false, message: 'login request not found (expired?)' });
    if (new Date(reqDoc.datetime).getTime() + REQUEST_TTL_MS < Date.now()) {
      await NodeStationLoginRequest.deleteOne({ _id: reqDoc._id });
      return res.status(410).json({ success: false, message: 'login request expired' });
    }

    // ## bind uuid เครื่องเข้า station (แทน editUserUUIDNodeStation เดิม — แต่แก้เฉพาะ station เดียวด้วย arrayFilters)
    const r = await NodeStation.updateOne(
      { companyID, factoryID, nodeID },
      { $set: { 'userNode.$[st].uuid': uuid, editDate: new Date() } },
      { arrayFilters: [{ 'st.stationID': stationID }] }
    );
    if (!r.matchedCount) return res.status(404).json({ success: false, message: 'node station not found' });

    await NodeStationLoginRequest.deleteOne({ _id: reqDoc._id });
    const requests = await listPendingRequests(companyID);
    return res.json({ success: true, requests, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// PUT /api/a/station/requests/reject  (admin)
//   body: { companyID, factoryID, nodeID, stationID, uuidUserNodeLoginWaiting } → ลบคำขอทิ้ง (station จะเห็นเป็น rejected ตอน poll)
exports.rejectLoginRequest = async (req, res, next) => {
  try {
    const b = req.body || {};
    const companyID = String(b.companyID || '').trim();
    await NodeStationLoginRequest.deleteMany({
      companyID,
      factoryID: String(b.factoryID || '').trim(),
      nodeID: String(b.nodeID || '').trim(),
      stationID: String(b.stationID || '').trim(),
      uuidUserNodeLoginWaiting: String(b.uuidUserNodeLoginWaiting || '').trim(),
    });
    const requests = await listPendingRequests(companyID);
    return res.json({ success: true, requests, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════
// ★ Scan product (หน้าจอสแกนใหม่ — แทน s-work-station เดิม)
//   worker สแกน QR (= productBarcodeNoReal) → server หาชิ้น → ตรวจ "ชิ้นนี้อยู่ node ที่ login จริงมั้ย"
//     เงื่อนไขผ่าน (ตามที่ผู้ใช้กำหนด): productionNode[ตัวสุดท้าย].toNode === node ที่ login (decoded.nodeID)
//   3 โหมด (จาก nodeInfo ของ station — อ่าน server-side จาก auth.ns.nodeInfo):
//     (A) mustBundleScan=false            → สแกนทีละชิ้น ผ่านทันที (1-by-1)
//     (B) mustBundleScan=true  scan1ForAll=true  → สแกน 1 QR = ดันทั้งมัดที่อยู่ node นี้ auto (ไม่ต้องสแกนทุกดวง)
//     (C) mustBundleScan=true  scan1ForAll=false → สแกนทุกดวง · client สะสมจนครบมัด (bundleCount) แล้วค่อย commit ทั้งมัด
//   ผ่าน → push productionNode ใหม่ (fromNode = node นี้ → toNode = node ถัดไปใน flowSeq main)
//     · node สุดท้าย (QC) → toNode 'completeNode' + productStatus 'complete' (ตรงกับ setQcComplete)
//   ★ company/factory/node ล็อกจาก token · รับเฉพาะชิ้นที่อยู่ node นี้จริง · createBy = staff ที่เข้ากะ
// ═══════════════════════════════════════════════════════════════════════════

// helper: หา node ถัดไปใน flowSeq main (เรียงตาม seqNo) · node สุดท้าย → 'completeNode' · หา node ไม่เจอ → null
async function findNextMainNode(companyID, nodeID) {
  const flow = await NodeFlow.findOne({ companyID, flowType: 'main' }).lean();
  if (!flow || !Array.isArray(flow.flowSeq) || !flow.flowSeq.length) return null;
  const seq = flow.flowSeq.slice()
    .sort((a, b) => String(a.seqNo).localeCompare(String(b.seqNo), undefined, { numeric: true }))
    .map(s => s.nodeID).filter(Boolean);
  const idx = seq.indexOf(nodeID);
  if (idx === -1) return null;                       // node นี้ไม่อยู่ใน flow → ไม่รู้ปลายทาง
  if (idx + 1 < seq.length) return seq[idx + 1];     // node ถัดไป
  return 'completeNode';                             // node สุดท้าย → complete
}

// helper: decode ค่าจาก productBarcodeNoReal ตามตำแหน่งใน .env (เหมือน barcodeKeyProj/productFlow) · rtrim '-'
const sub = (s, pos, dig) => String(s || '').substr(+pos, +dig);
const rt  = (v) => String(v == null ? '' : v).replace(/-+$/, '').trim();

// helper: ประกอบ object ข้อมูลชิ้น (ไว้แสดงบนการ์ด) จาก doc OrderProduction
function pieceInfo(piece, code) {
  if (!piece) return { orderID: '', style: '', bundleNo: null, runningNo: '', colorCode: '', colorName: '', colorValue: '', sizeCode: '', sizeName: '', countryID: '', productCount: null, barcode: code };
  const bc = piece.productBarcodeNoReal;
  return {
    orderID:    piece.orderID || '',
    style:      rt(sub(bc, process.env.stylePos, process.env.styleDigit)) || piece.orderID || '',
    bundleNo:   piece.bundleNo != null ? piece.bundleNo : null,
    runningNo:  rt(sub(bc, process.env.runningNoPos, process.env.runningNoDigit)),
    colorCode:  piece.colorCode || rt(sub(bc, process.env.colorPos, process.env.colorDigit)),
    colorName:  piece.colorName || '',
    colorValue: piece.colorValue || '',
    sizeCode:   piece.sizeCode || rt(sub(bc, process.env.sizePos, process.env.sizeDigit)),
    sizeName:   piece.sizeName || '',
    countryID:  piece.countryID || piece.targetPlaceID || rt(sub(bc, process.env.targetIDPos, process.env.targetIDDigit)),
    productCount: piece.productCount != null ? piece.productCount : null,
    barcode:    bc || code,
  };
}

// helper: หาชิ้นจากบาร์โค้ด (index companyID+orderID+productBarcodeNoReal · orderID = 12 ตัวแรก) + fallback productBarcodeNo
async function findPieceByCode(companyID, code) {
  const styleID = code.slice(0, 12).trim();
  let piece = await OrderProduction.findOne({ companyID, orderID: styleID, productBarcodeNoReal: code })
    .hint({ companyID: 1, orderID: 1, productBarcodeNoReal: 1 }).maxTimeMS(15000).lean();
  if (!piece) {
    // fallback: เทียบ productBarcodeNo (บาง QR เก่า) — ใช้ index เดิม (prefix companyID+orderID ครอบ query ได้ · productBarcodeNo กรองเป็น residual)
    //   ★ ห้าม hint index ที่ไม่มีจริง (companyID_1_orderID_1_bundleNo_1 ไม่มี → planner error) — ใช้ตัวที่ยืนยันมี
    piece = await OrderProduction.findOne({ companyID, orderID: styleID, productBarcodeNo: code })
      .hint({ companyID: 1, orderID: 1, productBarcodeNoReal: 1 }).maxTimeMS(15000).lean();
  }
  return piece;
}

// helper: สร้าง productionNode object (โครงเดียวกับ scan จริง/setQcComplete)
function mkNode(factoryID, fromNode, toNode, staffUserID, staffUserName) {
  return {
    factoryID, fromNode, toNode, datetime: new Date(),
    status: 'normal', info: '', sTypeOtus: '', problemID: '', problemName: '',
    isTracking: false, isOutsource: false, outsourceData: [],
    createBy: { userID: staffUserID, userName: staffUserName },
  };
}

// POST /api/a/station/scan-product  (header: x-station-token)
//   body: { code, staffUserID, staffUserName }
exports.stationScanProduct = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }

    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, factoryID, nodeID } = auth.decoded;
    const ni = (auth.ns && auth.ns.nodeInfo) || {};
    const mustBundleScan = !!ni.mustBundleScan;
    const scan1ForAll    = !!ni.scan1ForAll;
    const mode = !mustBundleScan ? 'single' : (scan1ForAll ? 'bundle-auto' : 'bundle-manual');

    const code = String((req.body && req.body.code) || '').trim();   // ★ ตัดหัว-ท้ายพอ (มี space padding ภายใน)
    const staffUserID   = String((req.body && req.body.staffUserID) || '').trim();
    const staffUserName = String((req.body && req.body.staffUserName) || '').trim();
    if (!code) return res.status(400).json({ success: false, message: 'no code', ...tok() });

    let piece = null;
    try { piece = await findPieceByCode(companyID, code); }
    catch (qe) {
      console.error('[stationScanProduct] find piece', qe && qe.message);
      return res.status(200).json({ success: true, ok: false, reason: 'slow', mode, code, ...tok() });
    }

    const info = pieceInfo(piece, code);

    // (1) หาไม่เจอ
    if (!piece) return res.status(200).json({ success: true, ok: false, reason: 'notfound', mode, code, info, ...tok() });

    // (2) ชิ้นมีปัญหา (รับเฉพาะ normal/repaired เหมือน app เดิม)
    const pStatus = String(piece.productStatus || '');
    if (pStatus !== 'normal' && pStatus !== 'repaired') {
      return res.status(200).json({ success: true, ok: false, reason: 'problem', mode, code, productStatus: pStatus, info, ...tok() });
    }

    // (3) gate: node ปัจจุบันของชิ้น (productionNode ตัวสุดท้าย .toNode) ต้องเท่ากับ node ที่ login
    const pn = Array.isArray(piece.productionNode) ? piece.productionNode : [];
    const last = pn.length ? pn[pn.length - 1] : null;
    const currentNode = (last && last.toNode) || '';
    if (currentNode !== nodeID) {
      return res.status(200).json({
        success: true, ok: false, reason: 'wrongnode', mode, code,
        currentNode, currentFactory: (last && last.factoryID) || '', loginNode: nodeID, info, ...tok(),
      });
    }

    // ── หา node ถัดไป ──
    const toNode = await findNextMainNode(companyID, nodeID);
    if (!toNode) return res.status(200).json({ success: true, ok: false, reason: 'noflow', mode, code, loginNode: nodeID, info, ...tok() });
    const setComplete = toNode === 'completeNode';

    // ── (C) mustBundleScan=true & scan1ForAll=false → ยังไม่ย้าย · แค่ผ่าน gate ให้ client สะสมจนครบมัด ──
    if (mode === 'bundle-manual') {
      return res.status(200).json({
        success: true, ok: true, mode, staged: true, code,
        orderID: piece.orderID, bundleNo: piece.bundleNo, bundleCount: piece.productCount,
        toNode, complete: setComplete, info, ...tok(),
      });
    }

    // ── (B) mustBundleScan=true & scan1ForAll=true → ดันทั้งมัดที่อยู่ node นี้ ทันที ──
    if (mode === 'bundle-auto') {
      // หาบาร์โค้ดทุกชิ้นในมัด (orderID+bundleNo) ที่ "อยู่ node นี้ตอนนี้" (lastNode.toNode===nodeID) + normal/repaired
      const rows = await OrderProduction.aggregate([
        { $match: { companyID, orderID: piece.orderID, bundleNo: piece.bundleNo, productStatus: { $in: ['normal', 'repaired'] } } },
        { $project: { _id: 0, productBarcodeNoReal: 1, lastNode: { $arrayElemAt: ['$productionNode', -1] } } },
        { $match: { 'lastNode.toNode': nodeID } },
      ]).allowDiskUse(true);
      const barcodes = rows.map(r => r.productBarcodeNoReal).filter(Boolean);
      if (!barcodes.length) {
        return res.status(200).json({ success: true, ok: false, reason: 'wrongnode', mode, code, currentNode, loginNode: nodeID, info, ...tok() });
      }
      const node = mkNode(factoryID, nodeID, toNode, staffUserID, staffUserName);
      const upd = setComplete ? { $push: { productionNode: node }, $set: { productStatus: 'complete' } } : { $push: { productionNode: node } };
      const r = await OrderProduction.updateMany({ companyID, orderID: piece.orderID, productBarcodeNoReal: { $in: barcodes } }, upd);
      const moved = (r.modifiedCount != null ? r.modifiedCount : (r.nModified || 0));
      return res.status(200).json({
        success: true, ok: true, mode, moved, code,
        orderID: piece.orderID, bundleNo: piece.bundleNo, bundleCount: piece.productCount,
        fromNode: nodeID, toNode, complete: setComplete, info, ...tok(),
      });
    }

    // ── (A) mustBundleScan=false → ย้ายชิ้นนี้ชิ้นเดียว ทันที ──
    const node = mkNode(factoryID, nodeID, toNode, staffUserID, staffUserName);
    const upd = setComplete ? { $push: { productionNode: node }, $set: { productStatus: 'complete' } } : { $push: { productionNode: node } };
    try {
      await OrderProduction.updateOne({ companyID, orderID: piece.orderID, productBarcodeNoReal: piece.productBarcodeNoReal }, upd);
    } catch (we) {
      console.error('[stationScanProduct] write', we && we.message);
      return res.status(200).json({ success: true, ok: false, reason: 'writefail', mode, code, info, ...tok() });
    }
    return res.status(200).json({
      success: true, ok: true, mode, moved: 1, code,
      fromNode: nodeID, toNode, complete: setComplete, info, ...tok(),
    });
  } catch (err) {
    console.error('stationScanProduct error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/scan-product/commit-bundle  (header: x-station-token)
//   โหมด (C) mustBundleScan=true & scan1ForAll=false — client สะสมครบมัดแล้วส่ง barcodes ทั้งมัดมา commit
//   body: { orderID, bundleNo, barcodes:[productBarcodeNoReal...], staffUserID, staffUserName }
//   ★ ย้ายเฉพาะชิ้นที่ "อยู่ node นี้จริงตอนนี้" (กันย้ายชิ้นที่เลยไป node อื่นแล้ว)
exports.stationScanCommitBundle = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }

    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, factoryID, nodeID } = auth.decoded;

    const b = req.body || {};
    const orderID = String(b.orderID || '').trim();
    const bundleNo = b.bundleNo;
    const staffUserID   = String(b.staffUserID || '').trim();
    const staffUserName = String(b.staffUserName || '').trim();
    const barcodes = Array.isArray(b.barcodes) ? b.barcodes.map(x => String(x).trim()).filter(Boolean) : [];
    if (!orderID || !barcodes.length) {
      return res.status(400).json({ success: false, message: 'orderID + barcodes required', ...tok() });
    }

    const toNode = await findNextMainNode(companyID, nodeID);
    if (!toNode) return res.status(200).json({ success: true, ok: false, reason: 'noflow', loginNode: nodeID, ...tok() });
    const setComplete = toNode === 'completeNode';

    // รับเฉพาะชิ้นที่อยู่ node นี้จริง (lastNode.toNode===nodeID) + normal/repaired
    const rows = await OrderProduction.aggregate([
      { $match: { companyID, orderID, productBarcodeNoReal: { $in: barcodes }, productStatus: { $in: ['normal', 'repaired'] } } },
      { $project: { _id: 0, productBarcodeNoReal: 1, lastNode: { $arrayElemAt: ['$productionNode', -1] } } },
      { $match: { 'lastNode.toNode': nodeID } },
    ]).allowDiskUse(true);
    const eligible = rows.map(r => r.productBarcodeNoReal).filter(Boolean);
    const skipped  = barcodes.filter(bc => !eligible.includes(bc));
    if (!eligible.length) {
      return res.status(200).json({ success: true, ok: false, reason: 'wrongnode', moved: 0, eligible: [], skipped, toNode, ...tok() });
    }

    const node = mkNode(factoryID, nodeID, toNode, staffUserID, staffUserName);
    const upd = setComplete ? { $push: { productionNode: node }, $set: { productStatus: 'complete' } } : { $push: { productionNode: node } };
    const r = await OrderProduction.updateMany({ companyID, orderID, productBarcodeNoReal: { $in: eligible } }, upd);
    const moved = (r.modifiedCount != null ? r.modifiedCount : (r.nModified || 0));

    return res.status(200).json({
      success: true, ok: true, moved, eligible, skipped,
      orderID, bundleNo, fromNode: nodeID, toNode, complete: setComplete, ...tok(),
    });
  } catch (err) {
    console.error('stationScanCommitBundle error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};
