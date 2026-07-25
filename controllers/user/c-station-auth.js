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
const mongoose = require("mongoose");   // ## ★ Scan sub node — SubNodeFlowC (master ชื่อ subnode) register แล้วที่ model อื่น → ใช้ lazy
const getSubNodeFlowC = () => mongoose.model('SubNodeFlowC');   // ชื่อ subnode master (companyID/nodeID/subNodeID/subNodeName/seq)
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

// ═══════════════════════════════════════════════════════════════════════════
// ★ Scan Checking — config ระดับ "โรงงาน" (Gsconfig module 'station')
//   Requirement (user 2026-07-25): 3 โรงในเครือ ขั้นตอนรับคืนจาก outsource ไม่เหมือนกัน
//     บางโรงต้องสแกน "ตรวจ" เสื้อที่รับคืนก่อน ถึงจะสแกนผ่าน node ถัดไปได้ — บางโรงไม่ต้อง
//   ★ ทุกอย่างที่เพิ่มใน scan station ต้องเปิดจาก config ระดับ factory (user สั่งชัด)
//     · STATION_CHECK_ENABLE = on/off  · STATION_CHECK_NODES = nodeID คั่น comma
//   ★ off = พฤติกรรมเดิมเป๊ะ: ปุ่มไม่โผล่ · ไม่สร้างคิวตรวจ · gate ไม่ทำงาน (ปลดล็อกของค้างได้ทันทีถ้าปิด)
const CHKCFG_TTL_MS = 15 * 1000;          // ## cache สั้นๆ — สแกนรัวๆ ไม่ต้องยิง config ทุกดวง · แก้ config แล้วมีผลใน 15 วิ
const _chkCfgCache = new Map();           // factoryID → { at, cfg }
async function checkCfg(factoryID) {
  const fid = String(factoryID || '').trim();
  if (!fid) return { enabled: false, nodes: [] };
  const hit = _chkCfgCache.get(fid);
  if (hit && (Date.now() - hit.at) < CHKCFG_TTL_MS) return hit.cfg;
  const [enDoc, ndDoc] = await Promise.all([
    Gsconfig.findOne({ configID: `${fid}-station-STATION_CHECK_ENABLE` }, { value: 1, _id: 0 }).lean(),
    Gsconfig.findOne({ configID: `${fid}-station-STATION_CHECK_NODES`  }, { value: 1, _id: 0 }).lean(),
  ]);
  const on    = String((enDoc && enDoc.value) || '').trim().toLowerCase() === 'on';
  const nodes = String((ndDoc && ndDoc.value) || '').split(',').map(s => s.trim()).filter(Boolean);
  const cfg = { enabled: on && nodes.length > 0, nodes };   // ## เปิดแต่ไม่ระบุ node = เท่ากับปิด (กันล็อกทั้งโรงโดยไม่ตั้งใจ)
  _chkCfgCache.set(fid, { at: Date.now(), cfg });
  return cfg;
}

// ## ประกอบ context ที่หน้า station ใช้แสดง (company/factory names + node/station + สิทธิ์สแกน)
async function buildStationContext(ns, stationID) {
  const company = await Company.findOne({ companyID: ns.companyID }, { _id: 0, companyID: 1, 'cInfo.companyName': 1, 'cInfo.abbreviation': 1 }).lean();
  const factory = await Factory.findOne({ companyID: ns.companyID, factoryID: ns.factoryID }, { _id: 0, factoryID: 1, 'fInfo.factoryName': 1, 'fInfo.abbreviation': 1 }).lean();
  // ## APP_VERSION + SEASON_ACTIVE ของโรงนี้ — configID `${factoryID}-system-<KEY>`
  const verDoc = await Gsconfig.findOne({ configID: `${ns.factoryID}-system-APP_VERSION` }, { value: 1, _id: 0 }).lean();
  const seaDoc = await Gsconfig.findOne({ configID: `${ns.factoryID}-system-SEASON_ACTIVE` }, { value: 1, _id: 0 }).lean();
  const seasonsActive = String((seaDoc && seaDoc.value) || '').split(',').map(s => s.trim()).filter(Boolean);
  // ## ★ ฟีเจอร์เสริมที่เปิดจาก config ระดับโรงงาน — หน้า station เอาไปตัดสินใจว่าจะโชว์ปุ่มไหม
  const chk = await checkCfg(ns.factoryID);
  return {
    company: { companyID: ns.companyID, companyName: company?.cInfo?.companyName || '', abbreviation: company?.cInfo?.abbreviation || '' },
    factory: { factoryID: ns.factoryID, factoryName: factory?.fInfo?.factoryName || '', abbreviation: factory?.fInfo?.abbreviation || '' },
    nodeStation: sanitizeNodeStation(ns, stationID),
    stationID: stationID,
    appVersion: verDoc?.value || '',
    seasonsActive,   // ## รายชื่อ season ที่ active (config SEASON_ACTIVE) — station ดึงข้อมูลตามนี้
    // ## ★ stationFeature: สวิตช์ฟีเจอร์เสริม (config ระดับโรงงาน) · โรงที่ไม่เปิด = ทุกค่าเป็น false → หน้าเดิมเป๊ะ
    stationFeature: {
      check:      !!chk.enabled,                                   // โรงนี้เปิดใช้ Scan Checking ไหม
      checkNodes: chk.nodes,                                       // node ทั้งหมดที่ต้องตรวจ (ไว้โชว์ในรายงาน)
      checkHere:  !!chk.enabled && chk.nodes.includes(ns.nodeID),   // ★ node ที่ login อยู่ = node ที่ต้องตรวจ → โชว์ปุ่ม "Scan Checking"
    },
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

    // (4) ★ gate Scan Checking: ชิ้นที่รับคืนจาก outsource ต้องถูก "ตรวจ" ครบทุก node ก่อน ถึงจะสแกนผ่านได้
    //     · โรงที่ config ปิด = ข้ามด่านนี้ทั้งหมด (พฤติกรรมเดิมเป๊ะ · ปิด config = ปลดล็อกของค้างทันที)
    const chkCfg  = await checkCfg(factoryID);
    const chkPend = (chkCfg.enabled && Array.isArray(piece.checkPending)) ? piece.checkPending.filter(Boolean) : [];
    if (chkPend.length) {
      return res.status(200).json({
        success: true, ok: false, reason: 'needcheck', mode, code,
        checkPending: chkPend, nextCheck: chkPend[0], loginNode: nodeID, info, ...tok(),
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
        { $project: { _id: 0, productBarcodeNoReal: 1, lastNode: { $arrayElemAt: ['$productionNode', -1] },
            chkLen: { $size: { $ifNull: ['$checkPending', []] } } } },
        { $match: { 'lastNode.toNode': nodeID } },
      ]).allowDiskUse(true);
      // ## ★ Scan Checking: ถ้าโรงเปิด config → กันชิ้นที่ยังมีคิวตรวจค้างไว้ (ดันทั้งมัดต้องไม่พาชิ้นที่ยังไม่ตรวจไปด้วย)
      const heldCheck = chkCfg.enabled ? rows.filter(r => (r.chkLen || 0) > 0).length : 0;
      const barcodes = (chkCfg.enabled ? rows.filter(r => !(r.chkLen || 0)) : rows)
        .map(r => r.productBarcodeNoReal).filter(Boolean);
      if (!barcodes.length) {
        return res.status(200).json({
          success: true, ok: false, reason: heldCheck ? 'needcheck' : 'wrongnode', mode, code,
          heldCheck, currentNode, loginNode: nodeID, info, ...tok(),
        });
      }
      const node = mkNode(factoryID, nodeID, toNode, staffUserID, staffUserName);
      const upd = setComplete ? { $push: { productionNode: node }, $set: { productStatus: 'complete' } } : { $push: { productionNode: node } };
      const r = await OrderProduction.updateMany({ companyID, orderID: piece.orderID, productBarcodeNoReal: { $in: barcodes } }, upd);
      const moved = (r.modifiedCount != null ? r.modifiedCount : (r.nModified || 0));
      return res.status(200).json({
        success: true, ok: true, mode, moved, code, heldCheck,
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
      { $project: { _id: 0, productBarcodeNoReal: 1, lastNode: { $arrayElemAt: ['$productionNode', -1] },
          chkLen: { $size: { $ifNull: ['$checkPending', []] } } } },
      { $match: { 'lastNode.toNode': nodeID } },
    ]).allowDiskUse(true);
    // ## ★ Scan Checking: commit ทั้งมัดต้องไม่พาชิ้นที่ยังมีคิวตรวจค้างผ่านไปด้วย (โรงที่ปิด config = ไม่กรอง)
    const chkCfgC   = await checkCfg(factoryID);
    const heldCheck = chkCfgC.enabled ? rows.filter(r => (r.chkLen || 0) > 0).length : 0;
    const eligible  = (chkCfgC.enabled ? rows.filter(r => !(r.chkLen || 0)) : rows)
      .map(r => r.productBarcodeNoReal).filter(Boolean);
    const skipped   = barcodes.filter(bc => !eligible.includes(bc));
    if (!eligible.length) {
      return res.status(200).json({
        success: true, ok: false, reason: heldCheck ? 'needcheck' : 'wrongnode',
        moved: 0, eligible: [], skipped, heldCheck, toNode, ...tok(),
      });
    }

    const node = mkNode(factoryID, nodeID, toNode, staffUserID, staffUserName);
    const upd = setComplete ? { $push: { productionNode: node }, $set: { productStatus: 'complete' } } : { $push: { productionNode: node } };
    const r = await OrderProduction.updateMany({ companyID, orderID, productBarcodeNoReal: { $in: eligible } }, upd);
    const moved = (r.modifiedCount != null ? r.modifiedCount : (r.nModified || 0));

    return res.status(200).json({
      success: true, ok: true, moved, eligible, skipped, heldCheck,
      orderID, bundleNo, fromNode: nodeID, toNode, complete: setComplete, ...tok(),
    });
  } catch (err) {
    console.error('stationScanCommitBundle error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ★ Scan SUB NODE (บันทึกผลงาน worker-เหมา) — เวอร์ชัน station ของ s-node-scan-sub-process
//   flow: สแกน QR worker(เหมา) → สแกน QR job card (201/301/401/queueCard/บาร์โค้ด) → เลือก subnode
//         → check (กันซ้ำ: ชิ้นที่มี subNodeFlow node+subnode นี้แล้ว = err) → save (push subNodeFlow ทุกชิ้น)
//   ★ ไม่ขยับ node (ต่างจาก scan-product) — แค่บันทึกว่าใครทำ subnode ไหนของมัดไหน (เอาไปคิดค่าแรงเหมา)
//   ล็อก company/factory/node จาก token · PPI/DP: default PPI (เลือก DP ได้)
// ═══════════════════════════════════════════════════════════════════════════

const numCost = (c) => (c != null ? Number(c.toString ? c.toString() : c) : 0);
const runNoOf = (bc) => rt(sub(bc, process.env.runningNoPos, process.env.runningNoDigit));

// GET /api/a/station/subnode/worker/:qr  — หา worker(เหมา) จาก qrCode
exports.stationSubnodeWorker = async (req, res, next) => {
  try {
    let auth; try { auth = await requireStationToken(req); } catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const qr = String(req.params.qr || '').trim();
    if (!qr) return res.status(400).json({ success: false, message: 'no qr', ...tok() });

    const w = await User.findOne({ qrCode: qr, type: 's' }, { _id: 0, userID: 1, qrCode: 1, 'uInfo.userName': 1, 'uInfo.pic': 1 }).lean();
    if (!w) return res.status(200).json({ success: true, ok: false, reason: 'notfound', qr, ...tok() });

    return res.status(200).json({
      success: true, ok: true,
      worker: { userID: w.userID, userName: (w.uInfo && w.uInfo.userName) || w.userID, pic: (w.uInfo && w.uInfo.pic) || '', qrCode: w.qrCode },
      ...tok(),
    });
  } catch (err) {
    console.error('stationSubnodeWorker error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// helper: subnode list (cfg cost ของ order + ชื่อจาก master) เฉพาะ node นี้
async function subnodesOfOrder(companyID, nodeID, orderID) {
  const order = await Order.findOne({ companyID, orderID }, { 'productOR.subNodeFlowCost': 1, seasonYear: 1 }).lean();
  const cfg = ((order && order.productOR && order.productOR.subNodeFlowCost) || []).filter(s => s.nodeID === nodeID);
  const master = await getSubNodeFlowC().find({ companyID, nodeID }, { _id: 0, subNodeID: 1, subNodeName: 1, seq: 1 }).lean();
  const nameMap = new Map(master.map(m => [m.subNodeID, m.subNodeName]));
  const subnodes = cfg.map(c => ({
    subNodeID: c.subNodeID,
    subNodeName: nameMap.get(c.subNodeID) || c.subNodeID,
    subNodeType: c.subNodeType || '',
    seq: +c.seq || 0,
    cost: numCost(c.cost),
  })).sort((a, b) => (a.subNodeType > b.subNodeType ? 1 : a.subNodeType < b.subNodeType ? -1 : 0) || (a.seq - b.seq));
  return { subnodes, seasonYear: (order && order.seasonYear) || '' };
}

// POST /api/a/station/subnode/resolve  — job card scan → pieces + subnode cfg + bundle info
//   body: { orderID, bundleNo, bundleNoRange, productBarcodeNo, subNodeID }
exports.stationSubnodeResolve = async (req, res, next) => {
  try {
    let auth; try { auth = await requireStationToken(req); } catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, nodeID } = auth.decoded;
    const b = req.body || {};
    let orderID = String(b.orderID || '').trim();
    const productBarcodeNo = String(b.productBarcodeNo || '').trim();
    const bundleNoRange = String(b.bundleNoRange || 'x').trim();
    const preSubNodeID = String(b.subNodeID || '').trim();
    let bundleFilter = null;

    // ── หาชิ้นตามชนิด scan ──
    if (productBarcodeNo) {
      const styleID = productBarcodeNo.slice(0, 12).trim();
      let piece = await OrderProduction.findOne({ companyID, orderID: styleID, productBarcodeNoReal: productBarcodeNo })
        .hint({ companyID: 1, orderID: 1, productBarcodeNoReal: 1 }).maxTimeMS(15000).lean();
      if (!piece) return res.status(200).json({ success: true, ok: false, reason: 'notfound', ...tok() });
      orderID = piece.orderID; bundleFilter = piece.bundleNo;
    } else if (bundleNoRange && bundleNoRange !== 'x') {
      const m = bundleNoRange.split('-').map(x => parseInt(String(x).trim(), 10));
      if (m.length === 2 && Number.isFinite(m[0]) && Number.isFinite(m[1])) bundleFilter = { $gte: Math.min(m[0], m[1]), $lte: Math.max(m[0], m[1]) };
      else return res.status(200).json({ success: true, ok: false, reason: 'badrange', ...tok() });
    } else {
      const bn = parseInt(String(b.bundleNo), 10);
      if (!Number.isFinite(bn)) return res.status(200).json({ success: true, ok: false, reason: 'nobundle', ...tok() });
      bundleFilter = bn;
    }
    if (!orderID) return res.status(200).json({ success: true, ok: false, reason: 'noorder', ...tok() });

    const pieces = await OrderProduction.find(
      { companyID, orderID, bundleNo: bundleFilter },
      { _id: 0, bundleNo: 1, productBarcodeNoReal: 1, productBarcodeNo: 1, productCount: 1, colorCode: 1, colorName: 1, colorValue: 1, sizeCode: 1, sizeName: 1, countryID: 1, targetPlaceID: 1, subNodeFlow: 1 }
    ).maxTimeMS(15000).lean();
    if (!pieces.length) return res.status(200).json({ success: true, ok: false, reason: 'nopieces', orderID, ...tok() });

    // ชิ้นที่มี subNodeFlow ของ node นี้แล้ว (ต่อ subNodeID) — ส่งให้ client โชว์สถานะ
    const outPieces = pieces.map(p => ({
      bundleNo: p.bundleNo,
      barcode: p.productBarcodeNoReal || p.productBarcodeNo || '',
      runningNo: runNoOf(p.productBarcodeNoReal || p.productBarcodeNo || ''),
      productCount: p.productCount != null ? p.productCount : null,
      doneSubs: (Array.isArray(p.subNodeFlow) ? p.subNodeFlow : []).filter(s => s.nodeID === nodeID).map(s => s.subNodeID),
    })).sort((a, b2) => (a.bundleNo - b2.bundleNo) || (a.runningNo > b2.runningNo ? 1 : -1));

    // มัด + จำนวน (distinct)
    const bmap = new Map();
    pieces.forEach(p => { if (!bmap.has(p.bundleNo)) bmap.set(p.bundleNo, p.productCount != null ? p.productCount : 0); });
    const bundles = [...bmap.entries()].map(([bundleNo, productCount]) => ({ bundleNo, productCount })).sort((a, b2) => a.bundleNo - b2.bundleNo);

    // ข้อมูลโชว์จากชิ้นแรก (decode barcode + doc fields)
    const f = pieces[0];
    const bc = f.productBarcodeNoReal || f.productBarcodeNo || '';
    const info = {
      orderID,
      style: rt(sub(bc, process.env.stylePos, process.env.styleDigit)) || orderID,
      zone: f.countryID || f.targetPlaceID || rt(sub(bc, process.env.targetIDPos, process.env.targetIDDigit)),
      colorCode: f.colorCode || rt(sub(bc, process.env.colorPos, process.env.colorDigit)),
      colorName: f.colorName || '',
      colorValue: f.colorValue || '',
      sizeCode: f.sizeCode || rt(sub(bc, process.env.sizePos, process.env.sizeDigit)),
    };

    const { subnodes, seasonYear } = await subnodesOfOrder(companyID, nodeID, orderID);
    const preselect = subnodes.find(s => s.subNodeID === preSubNodeID) || null;

    return res.status(200).json({
      success: true, ok: true,
      orderID, seasonYear, bundles, pieces: outPieces, subnodes, info,
      preselect: preselect ? preselect.subNodeID : '',
      isExtra: !!(preselect && (preselect.subNodeType === 'extra' || preselect.subNodeType === 'extra2')) || bundleNoRange !== 'x',
      ...tok(),
    });
  } catch (err) {
    console.error('stationSubnodeResolve error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/subnode/save  — เขียน subNodeFlow ทุกชิ้น (กันซ้ำ server-side)
//   body: { orderID, barcodes:[], subNodeIDs:[], workerQr, empState, staffUserID, staffUserName }
exports.stationSubnodeSave = async (req, res, next) => {
  try {
    let auth; try { auth = await requireStationToken(req); } catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, factoryID, nodeID } = auth.decoded;
    const b = req.body || {};
    const orderID = String(b.orderID || '').trim();
    const barcodes = Array.isArray(b.barcodes) ? b.barcodes.map(x => String(x).trim()).filter(Boolean) : [];
    const subNodeIDs = Array.isArray(b.subNodeIDs) ? b.subNodeIDs.map(x => String(x).trim()).filter(Boolean) : [];
    const workerQr = String(b.workerQr || '').trim();
    const empState = (String(b.empState || 'PPI').toUpperCase() === 'DP') ? 'DP' : 'PPI';
    const createBy = { userID: String(b.staffUserID || '').trim(), userName: String(b.staffUserName || '').trim() };
    if (!orderID || !barcodes.length || !subNodeIDs.length || !workerQr) {
      return res.status(400).json({ success: false, message: 'orderID + barcodes + subNodeIDs + workerQr required', ...tok() });
    }

    // subnode cfg (ชื่อ+seq) จาก order · ยึด server (ไม่เชื่อ client)
    const { subnodes } = await subnodesOfOrder(companyID, nodeID, orderID);
    const subMap = new Map(subnodes.map(s => [s.subNodeID, s]));
    const useSubs = subNodeIDs.filter(id => subMap.has(id));
    if (!useSubs.length) return res.status(200).json({ success: true, ok: false, reason: 'badsubnode', ...tok() });

    // ── กันซ้ำ: ชิ้นไหนมี subNodeFlow {node,subnode} นี้แล้ว = conflict (all-or-nothing เหมือน app เดิม) ──
    const pieces = await OrderProduction.find(
      { companyID, orderID, productBarcodeNoReal: { $in: barcodes } },
      { _id: 0, productBarcodeNoReal: 1, subNodeFlow: 1 }
    ).lean();
    const conflicts = [];
    for (const p of pieces) {
      const done = new Set((Array.isArray(p.subNodeFlow) ? p.subNodeFlow : []).filter(s => s.nodeID === nodeID).map(s => s.subNodeID));
      for (const id of useSubs) if (done.has(id)) conflicts.push({ barcode: p.productBarcodeNoReal, subNodeID: id });
    }
    if (conflicts.length) return res.status(200).json({ success: true, ok: false, reason: 'conflict', conflicts, ...tok() });

    // ── สร้าง subNodeFlow entries (cost=0 ตาม app เดิม — ค่าแรงจริงคิดจาก Order.subNodeFlowCost ตอนทำรายงาน) ──
    const now = new Date();
    const entries = useSubs.map(id => {
      const s = subMap.get(id);
      return {
        seq: s.seq || 0, factoryID, nodeID, subNodeID: id, subNodeName: s.subNodeName || id,
        qrCode: workerQr, empState, datetime: now, monthlyID: '',
        cost: mongoose.Types.Decimal128.fromString('0'), createBy,
      };
    });

    const r = await OrderProduction.updateMany(
      { companyID, orderID, productBarcodeNoReal: { $in: barcodes } },
      { $push: { subNodeFlow: { $each: entries } } }
    );
    const saved = (r.modifiedCount != null ? r.modifiedCount : (r.nModified || 0));

    return res.status(200).json({ success: true, ok: true, saved, subCount: useSubs.length, empState, ...tok() });
  } catch (err) {
    console.error('stationSubnodeSave error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/subnode/scanned?orderID=&bundleNo=  — edit workload: ใครสแกน subnode ไหนของมัดนี้
exports.stationSubnodeScanned = async (req, res, next) => {
  try {
    let auth; try { auth = await requireStationToken(req); } catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, nodeID } = auth.decoded;
    const orderID = String(req.query.orderID || '').trim();
    const bundleNo = parseInt(String(req.query.bundleNo), 10);
    if (!orderID || !Number.isFinite(bundleNo)) return res.status(400).json({ success: false, message: 'orderID + bundleNo required', ...tok() });

    const pieces = await OrderProduction.find(
      { companyID, orderID, bundleNo }, { _id: 0, productBarcodeNoReal: 1, subNodeFlow: 1 }
    ).lean();

    // group ตาม subNodeID+qrCode (เฉพาะ node นี้)
    const grp = new Map();
    for (const p of pieces) {
      for (const s of (Array.isArray(p.subNodeFlow) ? p.subNodeFlow : [])) {
        if (s.nodeID !== nodeID) continue;
        const key = `${s.subNodeID}|${s.qrCode}`;
        if (!grp.has(key)) grp.set(key, { subNodeID: s.subNodeID, subNodeName: s.subNodeName || s.subNodeID, qrCode: s.qrCode, empState: s.empState || 'PPI', count: 0, barcodes: [] });
        const g = grp.get(key); g.count++; g.barcodes.push(p.productBarcodeNoReal);
      }
    }
    const rows = [...grp.values()];
    // เติมชื่อ worker
    const qrs = [...new Set(rows.map(r => r.qrCode))];
    if (qrs.length) {
      const ws = await User.find({ qrCode: { $in: qrs }, type: 's' }, { _id: 0, qrCode: 1, userID: 1, 'uInfo.userName': 1 }).lean();
      const wm = new Map(ws.map(w => [w.qrCode, (w.uInfo && w.uInfo.userName) || w.userID]));
      rows.forEach(r => { r.userName = wm.get(r.qrCode) || r.qrCode; });
    }
    return res.status(200).json({ success: true, ok: true, orderID, bundleNo, rows, ...tok() });
  } catch (err) {
    console.error('stationSubnodeScanned error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/subnode/remove  — ลบผลงาน subnode (edit workload)
//   body: { orderID, bundleNo, subNodeID, qrCode }
exports.stationSubnodeRemove = async (req, res, next) => {
  try {
    let auth; try { auth = await requireStationToken(req); } catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, nodeID } = auth.decoded;
    const b = req.body || {};
    const orderID = String(b.orderID || '').trim();
    const bundleNo = parseInt(String(b.bundleNo), 10);
    const subNodeID = String(b.subNodeID || '').trim();
    const qrCode = String(b.qrCode || '').trim();
    if (!orderID || !Number.isFinite(bundleNo) || !subNodeID || !qrCode) {
      return res.status(400).json({ success: false, message: 'orderID + bundleNo + subNodeID + qrCode required', ...tok() });
    }
    const r = await OrderProduction.updateMany(
      { companyID, orderID, bundleNo },
      { $pull: { subNodeFlow: { nodeID, subNodeID, qrCode } } }
    );
    const removed = (r.modifiedCount != null ? r.modifiedCount : (r.nModified || 0));
    return res.status(200).json({ success: true, ok: true, removed, ...tok() });
  } catch (err) {
    console.error('stationSubnodeRemove error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/subnode/matrix  — ดูผลงาน subnode ทั้งมัด (ชิ้น × subnode → ใครทำ)
//   body: { orderID, bundleNo, bundleNoRange, productBarcodeNo }  (เหมือน resolve)
//   คืน: info + subnodes(คอลัมน์) + rows(ชิ้น) cells:{subNodeID: qrCode} + workers:{qrCode:{userID,userName,pic}}
exports.stationSubnodeMatrix = async (req, res, next) => {
  try {
    let auth; try { auth = await requireStationToken(req); } catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, nodeID } = auth.decoded;
    const b = req.body || {};
    let orderID = String(b.orderID || '').trim();
    const productBarcodeNo = String(b.productBarcodeNo || '').trim();
    const bundleNoRange = String(b.bundleNoRange || 'x').trim();
    let bundleFilter = null;

    if (productBarcodeNo) {
      const styleID = productBarcodeNo.slice(0, 12).trim();
      const piece = await OrderProduction.findOne({ companyID, orderID: styleID, productBarcodeNoReal: productBarcodeNo })
        .hint({ companyID: 1, orderID: 1, productBarcodeNoReal: 1 }).maxTimeMS(15000).lean();
      if (!piece) return res.status(200).json({ success: true, ok: false, reason: 'notfound', ...tok() });
      orderID = piece.orderID; bundleFilter = piece.bundleNo;
    } else if (bundleNoRange && bundleNoRange !== 'x') {
      const m = bundleNoRange.split('-').map(x => parseInt(String(x).trim(), 10));
      if (m.length === 2 && Number.isFinite(m[0]) && Number.isFinite(m[1])) bundleFilter = { $gte: Math.min(m[0], m[1]), $lte: Math.max(m[0], m[1]) };
      else return res.status(200).json({ success: true, ok: false, reason: 'badrange', ...tok() });
    } else {
      const bn = parseInt(String(b.bundleNo), 10);
      if (!Number.isFinite(bn)) return res.status(200).json({ success: true, ok: false, reason: 'nobundle', ...tok() });
      bundleFilter = bn;
    }
    if (!orderID) return res.status(200).json({ success: true, ok: false, reason: 'noorder', ...tok() });

    const pieces = await OrderProduction.find(
      { companyID, orderID, bundleNo: bundleFilter },
      { _id: 0, bundleNo: 1, productBarcodeNoReal: 1, productBarcodeNo: 1, productCount: 1, colorCode: 1, colorName: 1, colorValue: 1, sizeCode: 1, countryID: 1, targetPlaceID: 1, subNodeFlow: 1 }
    ).maxTimeMS(15000).lean();
    if (!pieces.length) return res.status(200).json({ success: true, ok: false, reason: 'nopieces', orderID, ...tok() });

    const qrSet = new Set();
    const rows = pieces.map(p => {
      const bc = p.productBarcodeNoReal || p.productBarcodeNo || '';
      const cells = {};
      for (const s of (Array.isArray(p.subNodeFlow) ? p.subNodeFlow : [])) {
        if (s.nodeID === nodeID && s.subNodeID) { cells[s.subNodeID] = s.qrCode || ''; if (s.qrCode) qrSet.add(s.qrCode); }
      }
      return { bundleNo: p.bundleNo, no: runNoOf(bc), barcode: bc, cells };
    }).sort((a, b2) => (a.bundleNo - b2.bundleNo) || (a.no > b2.no ? 1 : -1));

    const { subnodes } = await subnodesOfOrder(companyID, nodeID, orderID);

    const workers = {};
    if (qrSet.size) {
      const ws = await User.find({ qrCode: { $in: [...qrSet] }, type: 's' }, { _id: 0, qrCode: 1, userID: 1, 'uInfo.userName': 1, 'uInfo.pic': 1 }).lean();
      ws.forEach(w => { workers[w.qrCode] = { userID: w.userID, userName: (w.uInfo && w.uInfo.userName) || w.userID, pic: (w.uInfo && w.uInfo.pic) || '' }; });
    }

    const f = pieces[0];
    const bc0 = f.productBarcodeNoReal || f.productBarcodeNo || '';
    const info = {
      orderID,
      style: rt(sub(bc0, process.env.stylePos, process.env.styleDigit)) || orderID,
      zone: f.countryID || f.targetPlaceID || rt(sub(bc0, process.env.targetIDPos, process.env.targetIDDigit)),
      colorCode: f.colorCode || rt(sub(bc0, process.env.colorPos, process.env.colorDigit)),
      colorName: f.colorName || '', colorValue: f.colorValue || '',
      sizeCode: f.sizeCode || rt(sub(bc0, process.env.sizePos, process.env.sizeDigit)),
      productCount: f.productCount != null ? f.productCount : null,
      bundleNo: [...new Set(pieces.map(p => p.bundleNo))].join(', '),
    };

    return res.status(200).json({ success: true, ok: true, orderID, info, subnodes, rows, workers, ...tok() });
  } catch (err) {
    console.error('stationSubnodeMatrix error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ★ SEND TO OUTSOURCE (ส่งงานออกไปโรงรับจ้างช่วง) — เวอร์ชัน station ของ s-outsource-sendout
//   flow: 1) เลือกโรง outsource  2) เลือก node ที่งานกำลังอยู่ (ซ้าย/ขวาต้องตรงกัน · เลือกได้ 1)
//         3) สแกน QR — เงื่อนไข productionNode[ตัวสุดท้าย].toNode === node ที่เลือก
//            (ระบบจำได้ว่า "ออกไป outsource ตอนอยู่ node ไหน" จาก entry ก่อนหน้า marker)
//   ★ ส่งออก = ไม่ขยับ node — push marker { fromNode:'outsource', toNode:'outsource',
//       status:'outsource', isOutsource:true, factoryID = โรง outsource } ต่อท้าย productionNode
//       + ครั้งแรกของโรงนั้น push top-level outsourceData {factoryID, fromFactoryID, datetime}
//   ★ โหมดสแกนอ่านจาก config ของ "node ที่เลือก" (ไม่ใช่ node ที่ login):
//       knitting (mustBundleScan=false / scan1ForAll=true) → สแกน 1 ดวง = ทั้งมัด
//       linking  (mustBundleScan=true & scan1ForAll=false) → ต้องสแกนครบทุกดวงถึงจะส่งออกได้
//   ★ cancel sentout: ดึง marker ล่าสุดออก ($pop) — ทำได้เฉพาะชิ้นที่ marker ล่าสุดเป็น outsource จริง
// ═══════════════════════════════════════════════════════════════════════════

// helper: config โหมดสแกนของ node ที่เลือก (อ่านจาก NodeStation ของ node นั้นในโรงเดียวกัน)
async function outsNodeMode(companyID, factoryID, nodeID) {
  const ns = await NodeStation.findOne({ companyID, factoryID, nodeID }, { nodeInfo: 1, _id: 0 }).lean();
  const ni = (ns && ns.nodeInfo) || {};
  const mustBundleScan = !!ni.mustBundleScan;
  const scan1ForAll    = !!ni.scan1ForAll;
  const mode = !mustBundleScan ? 'single' : (scan1ForAll ? 'bundle-auto' : 'bundle-manual');
  return { mustBundleScan, scan1ForAll, mode, hasCfg: !!ns };
}

// helper: marker node ของการส่งออก outsource (โครงเดียวกับ app เดิม setBundleNextNodeID)
function mkOutsNode(outFactoryID, fromFactoryID, sTypeOtus, staffUserID, staffUserName) {
  return {
    factoryID: outFactoryID,            // ## ฝีมือ/ที่อยู่ของงาน = โรง outsource
    fromNode: 'outsource', toNode: 'outsource',
    datetime: new Date(), status: 'outsource', info: '',
    sTypeOtus: sTypeOtus,               // ## b = ส่งทั้งมัด · 1 = ทีละชิ้น
    problemID: '', problemName: '', isTracking: false, isOutsource: true,
    outsourceData: [{ factoryID: outFactoryID, fromFactoryID: fromFactoryID }],
    createBy: { userID: staffUserID, userName: staffUserName },
  };
}

// helper: เขียนส่งออกจริง — คัดเฉพาะชิ้นที่ "ยังอยู่ node ที่เลือก" แล้ว push marker
//   · ชิ้นที่ยังไม่เคยไปโรงนี้ → push top-level outsourceData ด้วย (ครั้งแรกเท่านั้น)
async function doOutsourceSendOut(opts) {
  const { companyID, orderID, barcodes, node, outFactoryID, fromFactoryID, sTypeOtus, staffUserID, staffUserName } = opts;
  let rows = await OrderProduction.aggregate([
    { $match: { companyID, orderID, productBarcodeNoReal: { $in: barcodes }, productStatus: { $in: ['normal', 'repaired'] } } },
    {
      $project: {
        _id: 0, productBarcodeNoReal: 1,
        lastNode: { $arrayElemAt: ['$productionNode', -1] },
        // ## เคยส่งไปโรงนี้แล้วหรือยัง (top-level outsourceData) → กัน push ซ้ำ
        hasOuts: {
          $gt: [{
            $size: {
              $filter: {
                input: { $ifNull: ['$outsourceData', []] },
                cond: { $eq: ['$$this.factoryID', outFactoryID] },
              },
            },
          }, 0],
        },
        // ## ★ Scan Checking: คิวตรวจที่ยังค้างอยู่ — ยังไม่ตรวจ = ห้ามส่งออกไปนอกซ้ำ
        chkLen: { $size: { $ifNull: ['$checkPending', []] } },
      },
    },
    { $match: { 'lastNode.toNode': node } },   // ## ★ เงื่อนไขหลัก: ต้องยังอยู่ node ที่เลือกเท่านั้น
  ]).allowDiskUse(true);

  // ## ★ โรงที่เปิด config Scan Checking → กันชิ้นที่ยังไม่ตรวจไม่ให้ส่งออกไปนอกอีกรอบ (โรงที่ปิด = ไม่กรอง)
  const chkCfgS   = await checkCfg(fromFactoryID);
  const heldCheck = chkCfgS.enabled ? rows.filter(r => (r.chkLen || 0) > 0).length : 0;
  if (chkCfgS.enabled && heldCheck) rows = rows.filter(r => !(r.chkLen || 0));

  const eligible = rows.map(r => r.productBarcodeNoReal).filter(Boolean);
  const skipped  = barcodes.filter(bc => !eligible.includes(bc));
  if (!eligible.length) return { moved: 0, eligible: [], skipped, heldCheck };

  const firstTime = rows.filter(r => !r.hasOuts).map(r => r.productBarcodeNoReal);
  const again     = rows.filter(r => r.hasOuts).map(r => r.productBarcodeNoReal);

  let moved = 0;
  if (firstTime.length) {
    const nodeObj = mkOutsNode(outFactoryID, fromFactoryID, sTypeOtus, staffUserID, staffUserName);
    const r1 = await OrderProduction.updateMany(
      { companyID, orderID, productBarcodeNoReal: { $in: firstTime } },
      { $push: { productionNode: nodeObj, outsourceData: { factoryID: outFactoryID, fromFactoryID, datetime: new Date() } } },
    );
    moved += (r1.modifiedCount != null ? r1.modifiedCount : (r1.nModified || 0));
  }
  if (again.length) {
    const nodeObj = mkOutsNode(outFactoryID, fromFactoryID, sTypeOtus, staffUserID, staffUserName);
    const r2 = await OrderProduction.updateMany(
      { companyID, orderID, productBarcodeNoReal: { $in: again } },
      { $push: { productionNode: nodeObj } },
    );
    moved += (r2.modifiedCount != null ? r2.modifiedCount : (r2.nModified || 0));
  }
  return { moved, eligible, skipped, heldCheck };
}

// GET /api/a/station/outsource/factories  — รายชื่อโรง sub-contractor (fInfo.isOutsource = true)
exports.stationOutsourceFactories = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, factoryID } = auth.decoded;

    const docs = await Factory.find(
      { companyID, 'fInfo.isOutsource': true, factoryID: { $ne: factoryID } },
      { _id: 0, factoryID: 1, fDescription: 1, 'fInfo.factoryName': 1, 'fInfo.factoryName2': 1, 'fInfo.abbreviation': 1, 'fInfo.tel': 1, 'fInfo.pic': 1, show: 1 },
    ).lean();

    const factories = docs
      .filter(f => f.show !== false)
      .map(f => ({
        factoryID: f.factoryID,
        factoryName: (f.fInfo && f.fInfo.factoryName) || f.factoryID,
        factoryName2: (f.fInfo && f.fInfo.factoryName2) || '',
        abbreviation: (f.fInfo && f.fInfo.abbreviation) || '',
        tel: (f.fInfo && f.fInfo.tel) || '',
        pic: (f.fInfo && f.fInfo.pic) || '',
      }))
      .sort((a, b) => a.factoryID.localeCompare(b.factoryID));

    return res.json({ success: true, factories, ...tok() });
  } catch (err) {
    console.error('stationOutsourceFactories error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/outsource/nodes  — node ใน flow main + โหมดสแกนของแต่ละ node (ไว้โชว์ในกล่องเลือก node)
exports.stationOutsourceNodes = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, factoryID } = auth.decoded;

    const flow = await NodeFlow.findOne({ companyID, flowType: 'main' }).lean();
    const seq = (flow && Array.isArray(flow.flowSeq) ? flow.flowSeq.slice() : [])
      .sort((a, b) => String(a.seqNo).localeCompare(String(b.seqNo), undefined, { numeric: true }))
      .filter(s => s && s.nodeID);

    // ## nodeInfo ของทุก node ในโรงนี้ (ทีเดียว) → map โหมดสแกน
    const nss = await NodeStation.find({ companyID, factoryID }, { _id: 0, nodeID: 1, nodeInfo: 1 }).lean();
    const cfg = {};
    nss.forEach(n => { cfg[n.nodeID] = n.nodeInfo || {}; });

    const nodes = seq.map(s => {
      const ni = cfg[s.nodeID] || {};
      const mustBundleScan = !!ni.mustBundleScan;
      const scan1ForAll    = !!ni.scan1ForAll;
      return {
        seqNo: s.seqNo, nodeID: s.nodeID,
        mustBundleScan, scan1ForAll,
        mode: !mustBundleScan ? 'single' : (scan1ForAll ? 'bundle-auto' : 'bundle-manual'),
      };
    });

    return res.json({ success: true, nodes, ...tok() });
  } catch (err) {
    console.error('stationOutsourceNodes error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/outsource/scan   body: { code, node, outFactoryID, staffUserID, staffUserName }
//   สแกน 1 ดวง → ตรวจว่าอยู่ node ที่เลือกจริง แล้วส่งออกตามโหมดของ node นั้น
exports.stationOutsourceScan = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, factoryID } = auth.decoded;

    const b = req.body || {};
    const code = String(b.code || '').trim();
    const node = String(b.node || '').trim();                 // ## node ที่เลือกไว้ (ข้อ 2)
    const outFactoryID = String(b.outFactoryID || '').trim(); // ## โรง outsource ปลายทาง (ข้อ 1)
    const staffUserID   = String(b.staffUserID || '').trim();
    const staffUserName = String(b.staffUserName || '').trim();
    if (!code) return res.status(400).json({ success: false, message: 'no code', ...tok() });
    if (!node || !outFactoryID) return res.status(400).json({ success: false, message: 'node + outFactoryID required', ...tok() });

    const cfgMode = await outsNodeMode(companyID, factoryID, node);
    const mode = cfgMode.mode;

    let piece = null;
    try { piece = await findPieceByCode(companyID, code); }
    catch (qe) {
      console.error('[stationOutsourceScan] find piece', qe && qe.message);
      return res.status(200).json({ success: true, ok: false, reason: 'slow', mode, code, ...tok() });
    }

    const info = pieceInfo(piece, code);
    if (!piece) return res.status(200).json({ success: true, ok: false, reason: 'notfound', mode, code, info, ...tok() });

    const pStatus = String(piece.productStatus || '');
    if (pStatus !== 'normal' && pStatus !== 'repaired') {
      return res.status(200).json({ success: true, ok: false, reason: 'problem', mode, code, productStatus: pStatus, info, ...tok() });
    }

    const pn = Array.isArray(piece.productionNode) ? piece.productionNode : [];
    const last = pn.length ? pn[pn.length - 1] : null;
    const currentNode = (last && last.toNode) || '';

    // ## ส่งออกไปแล้ว (marker outsource ค้างอยู่) → ต้อง receive กลับก่อน
    if (currentNode === 'outsource') {
      return res.status(200).json({
        success: true, ok: false, reason: 'alreadyout', mode, code,
        currentNode, outFactory: (last && last.factoryID) || '', info, ...tok(),
      });
    }
    // ## ★ เงื่อนไขหลัก: ต้องอยู่ node ที่เลือกไว้เท่านั้น (ระบบจะจำว่าออกไปตอนอยู่ node ไหน)
    if (currentNode !== node) {
      return res.status(200).json({
        success: true, ok: false, reason: 'wrongnode', mode, code,
        currentNode, wantNode: node, currentFactory: (last && last.factoryID) || '', info, ...tok(),
      });
    }

    // ── (C) linking: ต้องสแกนครบทุกดวงในมัด → ยังไม่เขียน แค่ผ่าน gate ให้ client สะสม ──
    if (mode === 'bundle-manual') {
      return res.status(200).json({
        success: true, ok: true, mode, staged: true, code,
        orderID: piece.orderID, bundleNo: piece.bundleNo, bundleCount: piece.productCount,
        node, outFactoryID, info, ...tok(),
      });
    }

    // ── (B) knitting: สแกน 1 ดวง = ส่งออกทั้งมัดที่ยังอยู่ node นี้ ──
    if (mode === 'bundle-auto') {
      const all = await OrderProduction.find(
        { companyID, orderID: piece.orderID, bundleNo: piece.bundleNo },
        { _id: 0, productBarcodeNoReal: 1 },
      ).maxTimeMS(15000).lean();
      const barcodes = all.map(x => x.productBarcodeNoReal).filter(Boolean);
      const r = await doOutsourceSendOut({
        companyID, orderID: piece.orderID, barcodes, node, outFactoryID,
        fromFactoryID: factoryID, sTypeOtus: 'b', staffUserID, staffUserName,
      });
      if (!r.moved) {
        return res.status(200).json({ success: true, ok: false, reason: 'wrongnode', mode, code, currentNode, wantNode: node, info, ...tok() });
      }
      return res.status(200).json({
        success: true, ok: true, mode, moved: r.moved, code,
        orderID: piece.orderID, bundleNo: piece.bundleNo, bundleCount: piece.productCount,
        node, outFactoryID, info, ...tok(),
      });
    }

    // ── (A) single: ส่งออกชิ้นเดียว ──
    const r = await doOutsourceSendOut({
      companyID, orderID: piece.orderID, barcodes: [piece.productBarcodeNoReal], node, outFactoryID,
      fromFactoryID: factoryID, sTypeOtus: '1', staffUserID, staffUserName,
    });
    if (!r.moved) return res.status(200).json({ success: true, ok: false, reason: 'writefail', mode, code, info, ...tok() });
    return res.status(200).json({
      success: true, ok: true, mode, moved: r.moved, code,
      orderID: piece.orderID, bundleNo: piece.bundleNo, node, outFactoryID, info, ...tok(),
    });
  } catch (err) {
    console.error('stationOutsourceScan error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/outsource/commit-bundle
//   body: { orderID, bundleNo, barcodes[], node, outFactoryID, staffUserID, staffUserName }
//   โหมด linking — client สะสมครบมัดแล้วค่อยส่งออกทั้งมัด (ไม่ครบ = ไม่ให้ส่ง)
exports.stationOutsourceCommitBundle = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, factoryID } = auth.decoded;

    const b = req.body || {};
    const orderID = String(b.orderID || '').trim();
    const bundleNo = b.bundleNo;
    const node = String(b.node || '').trim();
    const outFactoryID = String(b.outFactoryID || '').trim();
    const staffUserID   = String(b.staffUserID || '').trim();
    const staffUserName = String(b.staffUserName || '').trim();
    const barcodes = Array.isArray(b.barcodes) ? b.barcodes.map(x => String(x).trim()).filter(Boolean) : [];
    if (!orderID || !barcodes.length) return res.status(400).json({ success: false, message: 'orderID + barcodes required', ...tok() });
    if (!node || !outFactoryID) return res.status(400).json({ success: false, message: 'node + outFactoryID required', ...tok() });

    // ## ★ กันส่งออกไม่ครบมัด — เทียบจำนวนที่สแกนกับ productCount ของมัด
    const one = await OrderProduction.findOne(
      { companyID, orderID, productBarcodeNoReal: barcodes[0] },
      { _id: 0, productCount: 1, bundleNo: 1 },
    ).hint({ companyID: 1, orderID: 1, productBarcodeNoReal: 1 }).maxTimeMS(15000).lean();
    const need = one && one.productCount != null ? Number(one.productCount) : 0;
    if (need && barcodes.length < need) {
      return res.status(200).json({ success: true, ok: false, reason: 'incomplete', have: barcodes.length, need, orderID, bundleNo, ...tok() });
    }

    const r = await doOutsourceSendOut({
      companyID, orderID, barcodes, node, outFactoryID,
      fromFactoryID: factoryID, sTypeOtus: 'b', staffUserID, staffUserName,
    });
    if (!r.moved) {
      return res.status(200).json({ success: true, ok: false, reason: 'wrongnode', moved: 0, eligible: [], skipped: r.skipped, orderID, bundleNo, node, ...tok() });
    }
    return res.status(200).json({
      success: true, ok: true, moved: r.moved, eligible: r.eligible, skipped: r.skipped,
      orderID, bundleNo, node, outFactoryID, ...tok(),
    });
  } catch (err) {
    console.error('stationOutsourceCommitBundle error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// ★ CANCEL SEND-OUT (ยกเลิกการส่งออก outsource)
//   flow: 1) เลือกโรง outsource เดิมที่เคยส่งไป
//         2) เลือก node 1 node — ต้องเป็น node เดียวกับตอนที่กดส่งออก (งานจะกลับไปอยู่ node นั้น)
//         3) สแกน QR — โหมดตาม nodeInfo ของ node ที่เลือก
//            · knitting / panal (scan1ForAll) → สแกน 1 ดวง = ยกเลิกทั้งมัด
//            · linking / mending (mustBundleScan) → ต้องสแกนครบทุกดวงในมัด ไม่ครบ = ไม่ยกเลิกให้
//   การเขียน: $pop marker outsource ตัวท้ายออก + ถ้าเป็น marker ของโรงนั้นตัวสุดท้าย ให้ $pull
//             top-level outsourceData ของโรงนั้นออกด้วย → งานกลับไปยืนที่ node เดิมเหมือนไม่เคยส่ง
// ═══════════════════════════════════════════════════════════════════════════

// ## ตัด marker outsource ตัวท้ายของชิ้นที่เข้าเงื่อนไขออก (ยกเลิกการส่งออก)
//    เงื่อนไข: element ท้าย = marker outsource ของโรงที่เลือก · element ก่อนหน้าจบที่ node ที่เลือก
async function doOutsourceCancelOut(opts) {
  const { companyID, orderID, barcodes, node, outFactoryID } = opts;

  const rows = await OrderProduction.aggregate([
    { $match: { companyID, orderID, productBarcodeNoReal: { $in: barcodes } } },
    { $project: {
        _id: 0, productBarcodeNoReal: 1,
        pnLen: { $size: { $ifNull: ['$productionNode', []] } },
        lastNode: { $arrayElemAt: ['$productionNode', -1] },
        prevNode: { $arrayElemAt: ['$productionNode', -2] },
        // ## จำนวน marker outsource ของโรงนี้ที่มีอยู่ (ถ้าเหลือตัวเดียว = ต้องล้าง top-level outsourceData ด้วย)
        outsCnt: { $size: { $filter: {
          input: { $ifNull: ['$productionNode', []] },
          cond: { $and: [
            { $eq: ['$$this.toNode', 'outsource'] },
            { $eq: ['$$this.isOutsource', true] },
            { $eq: ['$$this.factoryID', outFactoryID] },
          ] },
        } } },
      } },
    { $match: {
        'lastNode.toNode': 'outsource',
        'lastNode.status': 'outsource',
        'lastNode.isOutsource': true,
        'lastNode.factoryID': outFactoryID,   // ## ต้องเป็นโรงที่เลือกไว้
        'prevNode.toNode': node,              // ## ★ ต้องส่งออกตอนอยู่ node ที่เลือก
        pnLen: { $gt: 1 },
      } },
  ]).allowDiskUse(true);

  const eligible = rows.map(r => r.productBarcodeNoReal).filter(Boolean);
  const skipped  = barcodes.filter(bc => !eligible.includes(bc));
  if (!eligible.length) return { cancelled: 0, eligible: [], skipped };

  const lastOnly = rows.filter(r => Number(r.outsCnt || 0) <= 1).map(r => r.productBarcodeNoReal);
  const keepOuts = rows.filter(r => Number(r.outsCnt || 0) >  1).map(r => r.productBarcodeNoReal);

  let cancelled = 0;
  if (lastOnly.length) {
    const r1 = await OrderProduction.updateMany(
      { companyID, orderID, productBarcodeNoReal: { $in: lastOnly } },
      { $pop: { productionNode: 1 }, $pull: { outsourceData: { factoryID: outFactoryID } } },
    );
    cancelled += (r1.modifiedCount != null ? r1.modifiedCount : (r1.nModified || 0));
  }
  if (keepOuts.length) {
    const r2 = await OrderProduction.updateMany(
      { companyID, orderID, productBarcodeNoReal: { $in: keepOuts } },
      { $pop: { productionNode: 1 } },
    );
    cancelled += (r2.modifiedCount != null ? r2.modifiedCount : (r2.nModified || 0));
  }
  return { cancelled, eligible, skipped, backNode: node };
}

// POST /api/a/station/outsource/cancel   body: { code, node, outFactoryID }
//   ยกเลิกการส่งออก — สแกน QR ที่ส่งออกไปแล้ว → ดึงกลับมาอยู่ node เดิม
exports.stationOutsourceCancel = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, factoryID } = auth.decoded;

    const b = req.body || {};
    const code = String(b.code || '').trim();
    const node = String(b.node || '').trim();                 // ## node ที่เคยเลือกตอนส่งออก
    const outFactoryID = String(b.outFactoryID || '').trim(); // ## โรง outsource เดิม
    if (!code) return res.status(400).json({ success: false, message: 'no code', ...tok() });
    if (!node || !outFactoryID) {
      return res.status(200).json({ success: true, ok: false, reason: 'nopick', code, ...tok() });
    }

    const cfgMode = await outsNodeMode(companyID, factoryID, node);
    const mode = cfgMode.mode;

    let piece = null;
    try { piece = await findPieceByCode(companyID, code); }
    catch (qe) {
      console.error('[stationOutsourceCancel] find piece', qe && qe.message);
      return res.status(200).json({ success: true, ok: false, reason: 'slow', mode, code, ...tok() });
    }

    const info = pieceInfo(piece, code);
    if (!piece) return res.status(200).json({ success: true, ok: false, reason: 'notfound', mode, code, info, ...tok() });

    const pn = Array.isArray(piece.productionNode) ? piece.productionNode : [];
    const last = pn.length ? pn[pn.length - 1] : null;
    const prev = pn.length > 1 ? pn[pn.length - 2] : null;

    // ## ต้องเป็น marker outsource จริง และต้องมี node ก่อนหน้าเหลืออยู่ (ไม่ pop จนว่าง)
    if (!last || last.toNode !== 'outsource' || last.status !== 'outsource' || !last.isOutsource || pn.length <= 1) {
      return res.status(200).json({
        success: true, ok: false, reason: 'notout', mode, code,
        currentNode: (last && last.toNode) || '', info, ...tok(),
      });
    }
    // ## ต้องเป็นโรง outsource เดียวกับที่เลือกไว้
    if (String(last.factoryID || '') !== outFactoryID) {
      return res.status(200).json({
        success: true, ok: false, reason: 'wrongfactory', mode, code,
        outFactory: String(last.factoryID || ''), wantFactory: outFactoryID, info, ...tok(),
      });
    }
    // ## ★ ต้องส่งออกตอนอยู่ node ที่เลือกไว้เท่านั้น
    if (String((prev && prev.toNode) || '') !== node) {
      return res.status(200).json({
        success: true, ok: false, reason: 'wrongnode', mode, code,
        sentAtNode: String((prev && prev.toNode) || ''), wantNode: node, info, ...tok(),
      });
    }

    // ── (C) linking / mending: ต้องสแกนครบทุกดวงในมัด → ยังไม่เขียน แค่ผ่าน gate ให้ client สะสม ──
    if (mode === 'bundle-manual') {
      return res.status(200).json({
        success: true, ok: true, mode, staged: true, code,
        orderID: piece.orderID, bundleNo: piece.bundleNo, bundleCount: piece.productCount,
        node, outFactoryID, info, ...tok(),
      });
    }

    // ── (B) knitting / panal: สแกน 1 ดวง = ยกเลิกทั้งมัด ──
    if (mode === 'bundle-auto') {
      const all = await OrderProduction.find(
        { companyID, orderID: piece.orderID, bundleNo: piece.bundleNo },
        { _id: 0, productBarcodeNoReal: 1 },
      ).maxTimeMS(15000).lean();
      const barcodes = all.map(x => x.productBarcodeNoReal).filter(Boolean);
      const r = await doOutsourceCancelOut({ companyID, orderID: piece.orderID, barcodes, node, outFactoryID });
      if (!r.cancelled) {
        return res.status(200).json({ success: true, ok: false, reason: 'notout', mode, code, info, ...tok() });
      }
      return res.status(200).json({
        success: true, ok: true, mode, cancelled: r.cancelled, bundleWide: true, code,
        orderID: piece.orderID, bundleNo: piece.bundleNo, bundleCount: piece.productCount,
        node, backNode: node, outFactoryID, skipped: r.skipped, info, ...tok(),
      });
    }

    // ── (A) single: ยกเลิกชิ้นเดียว ──
    const r = await doOutsourceCancelOut({
      companyID, orderID: piece.orderID, barcodes: [piece.productBarcodeNoReal], node, outFactoryID,
    });
    if (!r.cancelled) return res.status(200).json({ success: true, ok: false, reason: 'notout', mode, code, info, ...tok() });
    return res.status(200).json({
      success: true, ok: true, mode, cancelled: r.cancelled, bundleWide: false, code,
      orderID: piece.orderID, bundleNo: piece.bundleNo,
      node, backNode: node, outFactoryID, info, ...tok(),
    });
  } catch (err) {
    console.error('stationOutsourceCancel error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/outsource/cancel/commit-bundle
//   body: { orderID, bundleNo, barcodes[], node, outFactoryID }
//   linking / mending — ครบมัดแล้วยกเลิกการส่งออกทั้งมัด (ไม่ครบ = ไม่ยกเลิก)
exports.stationOutsourceCancelCommitBundle = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID } = auth.decoded;

    const b = req.body || {};
    const orderID = String(b.orderID || '').trim();
    const bundleNo = b.bundleNo;
    const node = String(b.node || '').trim();
    const outFactoryID = String(b.outFactoryID || '').trim();
    const barcodes = Array.isArray(b.barcodes) ? b.barcodes.map(x => String(x).trim()).filter(Boolean) : [];
    if (!orderID || !barcodes.length) {
      return res.status(400).json({ success: false, message: 'orderID + barcodes required', ...tok() });
    }
    if (!node || !outFactoryID) {
      return res.status(200).json({ success: true, ok: false, reason: 'nopick', orderID, bundleNo, ...tok() });
    }

    // ## ★ ต้องครบมัดเท่านั้น — ไม่ครบ = ไม่ยกเลิกให้
    let one = null;
    try {
      one = await OrderProduction.findOne(
        { companyID, orderID, productBarcodeNoReal: barcodes[0] },
        { _id: 0, productCount: 1, bundleNo: 1 },
      ).hint({ companyID: 1, orderID: 1, productBarcodeNoReal: 1 }).maxTimeMS(15000).lean();
    } catch (qe) {
      return res.status(200).json({ success: true, ok: false, reason: 'slow', orderID, bundleNo, ...tok() });
    }
    const need = one && one.productCount != null ? Number(one.productCount) : 0;
    if (need && barcodes.length < need) {
      return res.status(200).json({
        success: true, ok: false, reason: 'incomplete',
        have: barcodes.length, need, orderID, bundleNo, ...tok(),
      });
    }

    let r;
    try { r = await doOutsourceCancelOut({ companyID, orderID, barcodes, node, outFactoryID }); }
    catch (qe) {
      console.error('[stationOutsourceCancelCommitBundle]', qe && qe.message);
      return res.status(200).json({ success: true, ok: false, reason: 'slow', orderID, bundleNo, ...tok() });
    }
    if (!r.cancelled) {
      return res.status(200).json({
        success: true, ok: false, reason: 'notout', cancelled: 0,
        eligible: [], skipped: r.skipped, orderID, bundleNo, node, outFactoryID, ...tok(),
      });
    }
    return res.status(200).json({
      success: true, ok: true, cancelled: r.cancelled, bundleWide: true,
      eligible: r.eligible, skipped: r.skipped,
      orderID, bundleNo, node, backNode: node, outFactoryID, ...tok(),
    });
  } catch (err) {
    console.error('stationOutsourceCancelCommitBundle error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ★ RECEIVE FROM OUTSOURCE (รับงานกลับจากโรงรับจ้างช่วง) — เวอร์ชัน station ของ s-outsource-receive
//   flow: 1) เลือก node ที่ outsource "ทำเสร็จแล้ว" — เลือกได้หลาย node แต่ต้องติดกัน
//            และซ้าย/ขวาต้องเลือกเหมือนกัน (double-confirm เหมือน app เดิม)
//         2) สแกน QR ที่ส่งกลับมา
//   ★ รับเข้า = ไม่ pop marker outsource ทิ้ง — แต่ push ต่อท้าย node ละ 1 element
//       เลือก [1.KNITTING, 2.PANAL] → push 2 element
//         { fromNode:'1.KNITTING', toNode:'2.PANAL' } + { fromNode:'2.PANAL', toNode:'3.LINKING' }
//       = เสมือนสแกนปกติครบทั้ง 2 ขั้นตอน · ตัวเสื้อไปรออยู่ที่ 3.LINKING ทันที
//       ทุก element: status:'normal' · isOutsource:true · factoryID = โรง outsource ที่ทำ
//   ★ gate การเขียน (ตรงกับ app เดิม putOutsourceOrderProductionNextNodeID):
//       - productionNode ตัวสุดท้ายต้องเป็น marker outsource (toNode === 'outsource')
//       - ตัวก่อน marker (len-2).toNode ต้องเท่ากับ node "ตัวแรก" ที่เลือก
//         → ป้องกันรับเข้าผิดขั้นตอน (ออกไปตอนอยู่ knitting ก็ต้องเริ่มนับจาก knitting)
//   ★ โหมดสแกนอ่านจาก config ของ "node ตัวสุดท้ายที่เลือก":
//       knitting/panal (scan1ForAll)          → สแกน 1 ดวง = รับครบทั้งมัด
//       linking/mending (bundle-manual)       → ต้องสแกนครบทุกดวงในมัด ไม่ครบ = ไม่รับคืน
//   ★ cancel receive: ตัด element ที่ push เข้าไปหลัง marker ออก (truncate กลับไปที่ marker)
// ═══════════════════════════════════════════════════════════════════════════

// helper: flowSeq หลัก (เรียงตาม seqNo แบบตัวเลข)
async function mainFlowSeq(companyID) {
  const flow = await NodeFlow.findOne({ companyID, flowType: 'main' }).lean();
  return (flow && Array.isArray(flow.flowSeq) ? flow.flowSeq.slice() : [])
    .sort((a, b) => String(a.seqNo).localeCompare(String(b.seqNo), undefined, { numeric: true }))
    .filter(s => s && s.nodeID);
}

// helper: ตรวจชุด node ที่เลือก — ต้องมีจริงใน flow · ต้องติดกัน · ตัวสุดท้ายต้องมี node ถัดไป
//   คืน { ok, reason, idx:[...], nodes:[...] }
function validateRecvNodes(nodes, seq) {
  const list = (Array.isArray(nodes) ? nodes : []).map(x => String(x || '').trim()).filter(Boolean);
  if (!list.length) return { ok: false, reason: 'nonode' };
  const idx = list.map(n => seq.findIndex(s => s.nodeID === n));
  if (idx.some(i => i < 0)) return { ok: false, reason: 'badnode' };
  const sorted = idx.slice().sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) return { ok: false, reason: 'notcontiguous' };
  }
  // ## ตัวสุดท้ายต้องมี node ถัดไปให้ส่งต่อ (ถ้าเป็น node สุดท้ายของ flow = จบงาน ไม่รองรับทางนี้)
  if (sorted[sorted.length - 1] + 1 >= seq.length) return { ok: false, reason: 'lastnode' };
  return { ok: true, idx: sorted, nodes: sorted.map(i => seq[i].nodeID) };
}

// helper: สร้าง productionNode ที่จะ push ตอนรับเข้า (node ละ 1 element)
function mkRecvNodes(idxArr, seq, outFactoryID, fromFactoryID, sTypeOtus, staffUserID, staffUserName) {
  const now = new Date();
  return idxArr.map(i => ({
    factoryID: outFactoryID,                  // ## ฝีมือ = โรง outsource ที่ทำงานนี้
    fromNode: seq[i].nodeID,
    toNode: seq[i + 1].nodeID,
    datetime: now, status: 'normal', info: '',
    sTypeOtus: sTypeOtus,                     // ## b = ทั้งมัด · 1 = ทีละชิ้น
    problemID: '', problemName: '', isTracking: false, isOutsource: true,
    outsourceData: [{ factoryID: outFactoryID, fromFactoryID: fromFactoryID, datetime: now }],
    createBy: { userID: staffUserID, userName: staffUserName },
  }));
}

// helper: เขียนรับเข้าจริง — คัดเฉพาะชิ้นที่ marker ล่าสุดเป็น outsource ของโรงนั้น
//   และ node ก่อน marker ตรงกับ node ตัวแรกที่เลือก
async function doOutsourceReceive(opts) {
  const { companyID, orderID, barcodes, idxArr, seq, outFactoryID, fromFactoryID,
          sTypeOtus, staffUserID, staffUserName } = opts;
  const firstNode = seq[idxArr[0]].nodeID;

  const rows = await OrderProduction.aggregate([
    { $match: { companyID, orderID, productBarcodeNoReal: { $in: barcodes }, productStatus: { $in: ['normal', 'repaired'] } } },
    {
      $project: {
        _id: 0, productBarcodeNoReal: 1,
        pnLen: { $size: { $ifNull: ['$productionNode', []] } },
        lastNode: { $arrayElemAt: ['$productionNode', -1] },
        prevNode: { $arrayElemAt: ['$productionNode', -2] },
      },
    },
    {
      $match: {
        'lastNode.toNode': 'outsource',
        'lastNode.isOutsource': true,
        'lastNode.factoryID': outFactoryID,     // ## ต้องเป็นโรงเดียวกับที่สแกนดวงแรก
        'prevNode.toNode': firstNode,           // ## ★ ออกไปตอนอยู่ node ไหน = ต้องเริ่มนับจาก node นั้น
      },
    },
  ]).allowDiskUse(true);

  const eligible = rows.map(r => r.productBarcodeNoReal).filter(Boolean);
  const skipped  = barcodes.filter(bc => !eligible.includes(bc));
  if (!eligible.length) return { moved: 0, eligible: [], skipped };

  const nodeObjs = mkRecvNodes(idxArr, seq, outFactoryID, fromFactoryID, sTypeOtus, staffUserID, staffUserName);

  // ## ★ Scan Checking — จุดเดียวที่ "สร้างคิวตรวจ" (ทุกทางรับเข้า: single / bundle-auto / commit-bundle ผ่านที่นี่หมด)
  //    คิว = node ที่ outsource ทำมาจริง (ตามที่เลือกตอนรับเข้า) ∩ node ที่โรงนี้ตั้งว่าต้องตรวจ · เรียงตามลำดับ flow
  //    เช่น outsource ทำ knitting+panal → คิว = [2.PANAL-INSPECTION] (knitting ไม่อยู่ในลิสต์ = ไม่ต้องตรวจ)
  //    ★ $set (ไม่ใช่ $push) → รับเข้าใหม่ = เริ่มคิวใหม่ ไม่ค้างของเดิม · โรงที่ปิด config = ไม่เขียน field นี้เลย
  const chkCfgR = await checkCfg(fromFactoryID);
  const needCheck = chkCfgR.enabled
    ? idxArr.map(i => seq[i].nodeID).filter(n => chkCfgR.nodes.includes(n))   // idxArr เรียง asc อยู่แล้ว → คิวเรียงตาม flow
    : [];
  const upd = { $push: { productionNode: { $each: nodeObjs } } };
  if (chkCfgR.enabled) upd.$set = { checkPending: needCheck, checkFactoryID: needCheck.length ? fromFactoryID : '' };

  const r = await OrderProduction.updateMany(
    { companyID, orderID, productBarcodeNoReal: { $in: eligible } },
    upd,
  );
  const moved = (r.modifiedCount != null ? r.modifiedCount : (r.nModified || 0));
  return { moved, eligible, skipped, toNode: nodeObjs[nodeObjs.length - 1].toNode, needCheck };
}

// POST /api/a/station/outsource/receive/scan
//   body: { code, nodes:[nodeID...], staffUserID, staffUserName }
exports.stationOutsourceReceiveScan = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, factoryID } = auth.decoded;

    const b = req.body || {};
    const code = String(b.code || '').trim();
    const staffUserID   = String(b.staffUserID || '').trim();
    const staffUserName = String(b.staffUserName || '').trim();
    if (!code) return res.status(400).json({ success: false, message: 'no code', ...tok() });

    const seq = await mainFlowSeq(companyID);
    const v = validateRecvNodes(b.nodes, seq);
    if (!v.ok) return res.status(200).json({ success: true, ok: false, reason: v.reason, code, ...tok() });

    // ## โหมดสแกนอ่านจาก node ตัวสุดท้ายที่เลือก
    const lastSel = v.nodes[v.nodes.length - 1];
    const cfgMode = await outsNodeMode(companyID, factoryID, lastSel);
    const mode = cfgMode.mode;

    let piece = null;
    try { piece = await findPieceByCode(companyID, code); }
    catch (qe) {
      console.error('[stationOutsourceReceiveScan] find piece', qe && qe.message);
      return res.status(200).json({ success: true, ok: false, reason: 'slow', mode, code, ...tok() });
    }

    const info = pieceInfo(piece, code);
    if (!piece) return res.status(200).json({ success: true, ok: false, reason: 'notfound', mode, code, info, ...tok() });

    const pStatus = String(piece.productStatus || '');
    if (pStatus !== 'normal' && pStatus !== 'repaired') {
      return res.status(200).json({ success: true, ok: false, reason: 'problem', mode, code, productStatus: pStatus, info, ...tok() });
    }

    const pn = Array.isArray(piece.productionNode) ? piece.productionNode : [];
    const last = pn.length ? pn[pn.length - 1] : null;
    const prev = pn.length > 1 ? pn[pn.length - 2] : null;

    // ## ยังไม่ได้ส่งออก / รับกลับไปแล้ว → ไม่มี marker outsource ค้าง
    if (!last || last.toNode !== 'outsource' || !last.isOutsource) {
      return res.status(200).json({
        success: true, ok: false, reason: 'notout', mode, code,
        currentNode: (last && last.toNode) || '', info, ...tok(),
      });
    }
    const outFactoryID = last.factoryID || '';
    const wasNode = (prev && prev.toNode) || '';
    // ## ★ node ที่ออกไป ต้องตรงกับ node ตัวแรกที่เลือก
    if (wasNode !== v.nodes[0]) {
      return res.status(200).json({
        success: true, ok: false, reason: 'wrongnode', mode, code,
        currentNode: wasNode, wantNode: v.nodes[0], outFactoryID, info, ...tok(),
      });
    }

    const nextNode = seq[v.idx[v.idx.length - 1] + 1].nodeID;

    // ── (C) linking/mending: ต้องสแกนครบทุกดวง → ยังไม่เขียน แค่ผ่าน gate ให้ client สะสม ──
    if (mode === 'bundle-manual') {
      return res.status(200).json({
        success: true, ok: true, mode, staged: true, code,
        orderID: piece.orderID, bundleNo: piece.bundleNo, bundleCount: piece.productCount,
        nodes: v.nodes, nextNode, outFactoryID, info, ...tok(),
      });
    }

    // ── (B) knitting/panal: สแกน 1 ดวง = รับครบทั้งมัด ──
    if (mode === 'bundle-auto') {
      const all = await OrderProduction.find(
        { companyID, orderID: piece.orderID, bundleNo: piece.bundleNo },
        { _id: 0, productBarcodeNoReal: 1 },
      ).maxTimeMS(15000).lean();
      const barcodes = all.map(x => x.productBarcodeNoReal).filter(Boolean);
      const r = await doOutsourceReceive({
        companyID, orderID: piece.orderID, barcodes, idxArr: v.idx, seq,
        outFactoryID, fromFactoryID: factoryID, sTypeOtus: 'b', staffUserID, staffUserName,
      });
      if (!r.moved) {
        return res.status(200).json({ success: true, ok: false, reason: 'wrongnode', mode, code, currentNode: wasNode, wantNode: v.nodes[0], info, ...tok() });
      }
      return res.status(200).json({
        success: true, ok: true, mode, moved: r.moved, code,
        orderID: piece.orderID, bundleNo: piece.bundleNo, bundleCount: piece.productCount,
        nodes: v.nodes, nextNode: r.toNode, outFactoryID, needCheck: r.needCheck || [], info, ...tok(),
      });
    }

    // ── (A) single: รับเข้าชิ้นเดียว ──
    const r = await doOutsourceReceive({
      companyID, orderID: piece.orderID, barcodes: [piece.productBarcodeNoReal], idxArr: v.idx, seq,
      outFactoryID, fromFactoryID: factoryID, sTypeOtus: '1', staffUserID, staffUserName,
    });
    if (!r.moved) return res.status(200).json({ success: true, ok: false, reason: 'writefail', mode, code, info, ...tok() });
    return res.status(200).json({
      success: true, ok: true, mode, moved: r.moved, code,
      orderID: piece.orderID, bundleNo: piece.bundleNo,
      nodes: v.nodes, nextNode: r.toNode, outFactoryID, needCheck: r.needCheck || [], info, ...tok(),
    });
  } catch (err) {
    console.error('stationOutsourceReceiveScan error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/outsource/receive/commit-bundle
//   body: { orderID, bundleNo, barcodes[], nodes[], outFactoryID, staffUserID, staffUserName }
//   โหมด linking/mending — สะสมครบมัดแล้วค่อยรับเข้าทั้งมัด (ไม่ครบ = ไม่รับคืน)
exports.stationOutsourceReceiveCommitBundle = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, factoryID } = auth.decoded;

    const b = req.body || {};
    const orderID = String(b.orderID || '').trim();
    const bundleNo = b.bundleNo;
    const outFactoryID = String(b.outFactoryID || '').trim();
    const staffUserID   = String(b.staffUserID || '').trim();
    const staffUserName = String(b.staffUserName || '').trim();
    const barcodes = Array.isArray(b.barcodes) ? b.barcodes.map(x => String(x).trim()).filter(Boolean) : [];
    if (!orderID || !barcodes.length) return res.status(400).json({ success: false, message: 'orderID + barcodes required', ...tok() });
    if (!outFactoryID) return res.status(400).json({ success: false, message: 'outFactoryID required', ...tok() });

    const seq = await mainFlowSeq(companyID);
    const v = validateRecvNodes(b.nodes, seq);
    if (!v.ok) return res.status(200).json({ success: true, ok: false, reason: v.reason, orderID, bundleNo, ...tok() });

    // ## ★ กันรับเข้าไม่ครบมัด — เทียบจำนวนที่สแกนกับ productCount ของมัด
    const one = await OrderProduction.findOne(
      { companyID, orderID, productBarcodeNoReal: barcodes[0] },
      { _id: 0, productCount: 1, bundleNo: 1 },
    ).hint({ companyID: 1, orderID: 1, productBarcodeNoReal: 1 }).maxTimeMS(15000).lean();
    const need = one && one.productCount != null ? Number(one.productCount) : 0;
    if (need && barcodes.length < need) {
      return res.status(200).json({ success: true, ok: false, reason: 'incomplete', have: barcodes.length, need, orderID, bundleNo, ...tok() });
    }

    const r = await doOutsourceReceive({
      companyID, orderID, barcodes, idxArr: v.idx, seq,
      outFactoryID, fromFactoryID: factoryID, sTypeOtus: 'b', staffUserID, staffUserName,
    });
    if (!r.moved) {
      return res.status(200).json({ success: true, ok: false, reason: 'wrongnode', moved: 0, eligible: [], skipped: r.skipped, orderID, bundleNo, nodes: v.nodes, ...tok() });
    }
    return res.status(200).json({
      success: true, ok: true, moved: r.moved, eligible: r.eligible, skipped: r.skipped,
      orderID, bundleNo, nodes: v.nodes, nextNode: r.toNode, outFactoryID, needCheck: r.needCheck || [], ...tok(),
    });
  } catch (err) {
    console.error('stationOutsourceReceiveCommitBundle error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/outsource/receive/cancel   body: { code }
//   ยกเลิกการรับเข้า — ตัด element ที่ push หลัง marker outsource ออกทั้งหมด (กลับไปเป็นสถานะ "ยังอยู่ที่ outsource")
//   · รับแบบทั้งมัด (sTypeOtus='b') → ยกเลิกทั้งมัด · ทีละชิ้น → เฉพาะชิ้นนั้น
exports.stationOutsourceReceiveCancel = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID } = auth.decoded;

    const code = String((req.body && req.body.code) || '').trim();
    if (!code) return res.status(400).json({ success: false, message: 'no code', ...tok() });

    let piece = null;
    try { piece = await findPieceByCode(companyID, code); }
    catch (qe) { return res.status(200).json({ success: true, ok: false, reason: 'slow', code, ...tok() }); }

    const info = pieceInfo(piece, code);
    if (!piece) return res.status(200).json({ success: true, ok: false, reason: 'notfound', code, info, ...tok() });

    // ## หา index ของ marker outsource ตัวท้ายสุด — ต้องมี element ต่อท้ายมันอยู่ (= เคยรับเข้าแล้ว)
    const idxOfMarker = (pnArr) => {
      let k = -1;
      for (let i = 0; i < pnArr.length; i++) {
        const n = pnArr[i];
        if (n && n.toNode === 'outsource' && n.status === 'outsource' && n.isOutsource) k = i;
      }
      return k;
    };
    const pn = Array.isArray(piece.productionNode) ? piece.productionNode : [];
    const last = pn.length ? pn[pn.length - 1] : null;
    const mk = idxOfMarker(pn);
    if (!last || last.toNode === 'outsource' || !last.isOutsource || mk < 0 || mk >= pn.length - 1) {
      return res.status(200).json({
        success: true, ok: false, reason: 'notreceived', code,
        currentNode: (last && last.toNode) || '', info, ...tok(),
      });
    }

    const outFactoryID = last.factoryID || '';
    const bundleWide = String(last.sTypeOtus || '') === 'b';

    let targets = [piece];
    if (bundleWide) {
      const all = await OrderProduction.find(
        { companyID, orderID: piece.orderID, bundleNo: piece.bundleNo },
        { _id: 0, productBarcodeNoReal: 1, productionNode: 1 },
      ).maxTimeMS(15000).lean();
      targets = all.filter(p => {
        const arr = p.productionNode || [];
        const l = arr.slice(-1)[0];
        const k = idxOfMarker(arr);
        return l && l.toNode !== 'outsource' && l.isOutsource && (l.factoryID || '') === outFactoryID && k >= 0 && k < arr.length - 1;
      });
    }
    if (!targets.length) return res.status(200).json({ success: true, ok: false, reason: 'notreceived', code, info, ...tok() });

    // ## ตัดกลับไปที่ marker (คงตัว marker ไว้ = ชิ้นกลับไปอยู่สถานะ "ส่งออก outsource")
    let cancelled = 0;
    for (const p of targets) {
      const arr = p.productionNode || (p === piece ? pn : []);
      const k = idxOfMarker(arr);
      if (k < 0) continue;
      const r = await OrderProduction.updateOne(
        { companyID, orderID: piece.orderID, productBarcodeNoReal: p.productBarcodeNoReal },
        // ## ★ ยกเลิกรับเข้า = ล้างคิวตรวจทิ้งด้วย (ชิ้นกลับไปอยู่ที่ outsource แล้ว ไม่มีอะไรให้ตรวจ)
        //    รับเข้าใหม่อีกครั้ง doOutsourceReceive จะ $set คิวใหม่ให้เอง
        { $set: { productionNode: arr.slice(0, k + 1), checkPending: [], checkFactoryID: '' } },
      );
      cancelled += (r.modifiedCount != null ? r.modifiedCount : (r.nModified || 0));
    }

    return res.status(200).json({
      success: true, ok: true, cancelled, code, bundleWide,
      orderID: piece.orderID, bundleNo: piece.bundleNo, outFactoryID, info, ...tok(),
    });
  } catch (err) {
    console.error('stationOutsourceReceiveCancel error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ★ SCAN CHECKING — ตรวจงานที่รับคืนจาก outsource (user 2026-07-25)
//   Requirement: 3 โรงในเครือ ขั้นตอนรับคืนไม่เหมือนกัน · บางโรงต้องสแกน "ตรวจ" ก่อน เสื้อถึงจะไป node ถัดไปได้
//     1) outsource ทำ knitting+panal  → ต้องตรวจ panal            (ไม่ตรวจ = สแกนที่ linking ไม่ผ่าน)
//     2) outsource ทำ linking+mending → ต้องตรวจ linking แล้ว mending (ไม่ตรวจ = สแกนที่ mending/washing ไม่ผ่าน)
//     3) outsource ทำครบ 4 node       → ต้องตรวจ panal → linking → mending ตามลำดับ
//   ★ ทุกอย่างเปิด/ปิดจาก config ระดับโรงงาน (STATION_CHECK_ENABLE / STATION_CHECK_NODES)
//   ★ คิวตรวจถูกสร้างตอนรับเข้า (doOutsourceReceive) · ตรวจแล้ว = shift ออกทีละ node ตามลำดับ
//   ★ ไม่นับเป็นค่าแรงเหมา (ไม่แตะ subNodeFlow) — เป็นขั้นตอนตรวจรับปกติของโรงงาน
//   ★ node ที่ตรวจ = node ของ station ที่ login อยู่ (เช่น เครื่อง LINKING ตรวจคิว 3.LINKING)
//   ★ โหมดสแกนใช้ config ของ node นั้นเอง (single / bundle-auto / bundle-manual) เหมือนสแกนปกติ
// ═══════════════════════════════════════════════════════════════════════════

// helper: โหมดสแกนของ station ที่ login อยู่
function selfScanMode(ns) {
  const ni = (ns && ns.nodeInfo) || {};
  const mustBundleScan = !!ni.mustBundleScan;
  const scan1ForAll    = !!ni.scan1ForAll;
  return !mustBundleScan ? 'single' : (scan1ForAll ? 'bundle-auto' : 'bundle-manual');
}

// helper: สร้าง record ประวัติการตรวจ 1 รายการ
function mkCheckNode(factoryID, nodeID, outFactoryID, sTypeOtus, staffUserID, staffUserName) {
  return {
    factoryID, nodeID, outFactoryID,
    datetime: new Date(), sTypeOtus: sTypeOtus, info: '',
    createBy: { userID: staffUserID, userName: staffUserName },
  };
}

// helper: outFactoryID ของชิ้น = โรง outsource ที่ทำงาน node นี้มา (อ่านจาก productionNode ตัวท้ายที่ isOutsource)
function outFactoryOf(piece) {
  const pn = Array.isArray(piece && piece.productionNode) ? piece.productionNode : [];
  for (let i = pn.length - 1; i >= 0; i--) {
    if (pn[i] && pn[i].isOutsource && pn[i].factoryID) return pn[i].factoryID;
  }
  return '';
}

// GET /api/a/station/check/worklist   (header: x-station-token)
//   คิวที่รอตรวจของ station นี้ = ชิ้นที่ checkFactoryID = โรงนี้ และ checkPending[0] = node ที่ login
//   จัดกลุ่มเป็น order + มัด ให้พนักงานเห็นว่าเหลือมัดไหนบ้าง (ไม่ใช่รายชิ้น)
exports.stationCheckWorklist = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, factoryID, nodeID } = auth.decoded;

    const cfg = await checkCfg(factoryID);
    if (!cfg.enabled) return res.json({ success: true, enabled: false, rows: [], total: 0, ...tok() });

    const rows = await OrderProduction.aggregate([
      { $match: { companyID, checkFactoryID: factoryID, 'checkPending.0': nodeID, productStatus: { $in: ['normal', 'repaired'] } } },
      { $project: { _id: 0, orderID: 1, bundleNo: 1, productCount: 1, productBarcodeNoReal: 1,
          pendLen: { $size: { $ifNull: ['$checkPending', []] } },
          outFactoryID: { $ifNull: [{ $arrayElemAt: ['$productionNode.factoryID', -1] }, ''] },
          curNode:      { $ifNull: [{ $arrayElemAt: ['$productionNode.toNode', -1] }, ''] } } },
      { $group: {
          _id: { orderID: '$orderID', bundleNo: '$bundleNo', outFactoryID: '$outFactoryID', curNode: '$curNode' },
          qty: { $sum: 1 },
          bundleCount: { $max: '$productCount' },
          pendLen: { $max: '$pendLen' },
          sample: { $first: '$productBarcodeNoReal' },
      } },
      { $sort: { '_id.orderID': 1, '_id.bundleNo': 1 } },
      { $limit: 500 },
    ]).allowDiskUse(true);

    const list = rows.map(r => ({
      orderID: r._id.orderID, bundleNo: r._id.bundleNo,
      outFactoryID: r._id.outFactoryID, curNode: r._id.curNode,
      qty: r.qty, bundleCount: r.bundleCount, pendLen: r.pendLen, sample: r.sample,
    }));
    const total = list.reduce((s, x) => s + x.qty, 0);
    return res.json({ success: true, enabled: true, nodeID, rows: list, total, truncated: rows.length >= 500, ...tok() });
  } catch (err) {
    console.error('stationCheckWorklist error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/check/scan   (header: x-station-token)
//   body: { code, staffUserID, staffUserName }
//   reason: off | notfound | problem | wrongfactory | nocheck | notturn | slow | writefail
exports.stationCheckScan = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, factoryID, nodeID } = auth.decoded;
    const mode = selfScanMode(auth.ns);

    const code = String((req.body && req.body.code) || '').trim();
    const staffUserID   = String((req.body && req.body.staffUserID) || '').trim();
    const staffUserName = String((req.body && req.body.staffUserName) || '').trim();
    if (!code) return res.status(400).json({ success: false, message: 'no code', ...tok() });

    const cfg = await checkCfg(factoryID);
    if (!cfg.enabled) return res.status(200).json({ success: true, ok: false, reason: 'off', mode, code, ...tok() });

    let piece = null;
    try { piece = await findPieceByCode(companyID, code); }
    catch (qe) {
      console.error('[stationCheckScan] find piece', qe && qe.message);
      return res.status(200).json({ success: true, ok: false, reason: 'slow', mode, code, ...tok() });
    }
    const info = pieceInfo(piece, code);
    if (!piece) return res.status(200).json({ success: true, ok: false, reason: 'notfound', mode, code, info, ...tok() });

    const pStatus = String(piece.productStatus || '');
    if (pStatus !== 'normal' && pStatus !== 'repaired') {
      return res.status(200).json({ success: true, ok: false, reason: 'problem', mode, code, productStatus: pStatus, info, ...tok() });
    }

    // ## คิวตรวจของชิ้นนี้เป็นของโรงเราไหม (3 โรงใช้ companyID เดียวกัน — กันตรวจข้ามโรง)
    const owner = String(piece.checkFactoryID || '');
    if (owner && owner !== factoryID) {
      return res.status(200).json({ success: true, ok: false, reason: 'wrongfactory', mode, code, checkFactoryID: owner, info, ...tok() });
    }

    const pend = Array.isArray(piece.checkPending) ? piece.checkPending.filter(Boolean) : [];
    if (!pend.length) {
      // ## ไม่มีคิวตรวจ = ตรวจครบแล้ว หรือชิ้นนี้ไม่ต้องตรวจ (ไม่ได้มาจาก outsource)
      const done = (piece.checkNode || []).some(c => c && c.nodeID === nodeID);
      return res.status(200).json({ success: true, ok: false, reason: 'nocheck', mode, code, alreadyChecked: done, info, ...tok() });
    }
    if (pend[0] !== nodeID) {
      // ## ยังไม่ถึงคิว node นี้ — ต้องตรวจเรียงตามลำดับ flow (เช่น linking ก่อน mending)
      return res.status(200).json({
        success: true, ok: false, reason: 'notturn', mode, code,
        checkPending: pend, nextCheck: pend[0], loginNode: nodeID, info, ...tok(),
      });
    }

    const outFactoryID = outFactoryOf(piece);

    // ── (C) bundle-manual → ยังไม่เขียน แค่ผ่าน gate ให้ client สะสมจนครบมัด ──
    //    ★ pendCount = จำนวนชิ้นในมัดที่ "รอตรวจ node นี้" จริงๆ (อาจน้อยกว่า productCount ถ้าตรวจค้างไว้ครึ่งมัด)
    //      client ใช้ค่านี้เป็นเป้า → สะสมครบแล้ว commit ได้เลย ไม่ค้างเพราะเป้าผิด
    if (mode === 'bundle-manual') {
      let pendCount = 0;
      try {
        pendCount = await OrderProduction.countDocuments({
          companyID, orderID: piece.orderID, bundleNo: piece.bundleNo,
          checkFactoryID: factoryID, 'checkPending.0': nodeID, productStatus: { $in: ['normal', 'repaired'] },
        }).maxTimeMS(15000);
      } catch (ce) { pendCount = 0; }
      return res.status(200).json({
        success: true, ok: true, mode, staged: true, code,
        orderID: piece.orderID, bundleNo: piece.bundleNo, bundleCount: piece.productCount,
        pendCount, checkNode: nodeID, restPending: pend.slice(1), outFactoryID, info, ...tok(),
      });
    }

    // ── (B) bundle-auto → สแกน 1 ดวง = ตรวจผ่านทั้งมัด (เฉพาะชิ้นที่คิวหน้าสุดเป็น node นี้) ──
    if (mode === 'bundle-auto') {
      const rec = mkCheckNode(factoryID, nodeID, outFactoryID, 'b', staffUserID, staffUserName);
      const r = await OrderProduction.updateMany(
        { companyID, orderID: piece.orderID, bundleNo: piece.bundleNo,
          checkFactoryID: factoryID, 'checkPending.0': nodeID, productStatus: { $in: ['normal', 'repaired'] } },
        { $pop: { checkPending: -1 }, $push: { checkNode: rec } },
      );
      const checked = (r.modifiedCount != null ? r.modifiedCount : (r.nModified || 0));
      if (!checked) return res.status(200).json({ success: true, ok: false, reason: 'writefail', mode, code, info, ...tok() });
      return res.status(200).json({
        success: true, ok: true, mode, checked, code,
        orderID: piece.orderID, bundleNo: piece.bundleNo, bundleCount: piece.productCount,
        checkNode: nodeID, restPending: pend.slice(1), outFactoryID, info, ...tok(),
      });
    }

    // ── (A) single → ตรวจชิ้นเดียว ──
    const rec = mkCheckNode(factoryID, nodeID, outFactoryID, '1', staffUserID, staffUserName);
    let r;
    try {
      r = await OrderProduction.updateOne(
        { companyID, orderID: piece.orderID, productBarcodeNoReal: piece.productBarcodeNoReal, 'checkPending.0': nodeID },
        { $pop: { checkPending: -1 }, $push: { checkNode: rec } },
      );
    } catch (we) {
      console.error('[stationCheckScan] write', we && we.message);
      return res.status(200).json({ success: true, ok: false, reason: 'writefail', mode, code, info, ...tok() });
    }
    const checked = (r.modifiedCount != null ? r.modifiedCount : (r.nModified || 0));
    if (!checked) return res.status(200).json({ success: true, ok: false, reason: 'writefail', mode, code, info, ...tok() });
    return res.status(200).json({
      success: true, ok: true, mode, checked: 1, code,
      orderID: piece.orderID, bundleNo: piece.bundleNo,
      checkNode: nodeID, restPending: pend.slice(1), outFactoryID, info, ...tok(),
    });
  } catch (err) {
    console.error('stationCheckScan error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// POST /api/a/station/check/commit-bundle   (header: x-station-token)
//   โหมด bundle-manual — client สะสมครบมัดแล้วส่ง barcodes ทั้งมัดมา commit
//   body: { orderID, bundleNo, barcodes[], staffUserID, staffUserName }
//   ★ ต้องสแกนครบทุกชิ้นที่ "รอตรวจ node นี้" ในมัด (ไม่ครบ = ไม่ผ่าน — เจตนาคือตรวจทุกตัวจริง)
exports.stationCheckCommitBundle = async (req, res, next) => {
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

    const cfg = await checkCfg(factoryID);
    if (!cfg.enabled) return res.status(200).json({ success: true, ok: false, reason: 'off', orderID, bundleNo, ...tok() });

    // ## จำนวนที่ "รอตรวจ node นี้" จริงในมัด — สแกนต้องครบเท่านี้
    const pendRows = await OrderProduction.find(
      { companyID, orderID, bundleNo, checkFactoryID: factoryID, 'checkPending.0': nodeID, productStatus: { $in: ['normal', 'repaired'] } },
      { _id: 0, productBarcodeNoReal: 1, productionNode: 1 },
    ).maxTimeMS(15000).lean();
    const need = pendRows.length;
    if (!need) return res.status(200).json({ success: true, ok: false, reason: 'nocheck', orderID, bundleNo, ...tok() });

    const pendSet  = new Set(pendRows.map(x => x.productBarcodeNoReal).filter(Boolean));
    const eligible = barcodes.filter(bc => pendSet.has(bc));
    const skipped  = barcodes.filter(bc => !pendSet.has(bc));
    if (eligible.length < need) {
      return res.status(200).json({ success: true, ok: false, reason: 'incomplete', have: eligible.length, need, orderID, bundleNo, skipped, ...tok() });
    }

    const outFactoryID = outFactoryOf(pendRows[0]);
    const rec = mkCheckNode(factoryID, nodeID, outFactoryID, 'b', staffUserID, staffUserName);
    const r = await OrderProduction.updateMany(
      { companyID, orderID, productBarcodeNoReal: { $in: eligible }, 'checkPending.0': nodeID },
      { $pop: { checkPending: -1 }, $push: { checkNode: rec } },
    );
    const checked = (r.modifiedCount != null ? r.modifiedCount : (r.nModified || 0));
    if (!checked) return res.status(200).json({ success: true, ok: false, reason: 'writefail', orderID, bundleNo, ...tok() });

    return res.status(200).json({
      success: true, ok: true, checked, eligible, skipped,
      orderID, bundleNo, checkNode: nodeID, outFactoryID, ...tok(),
    });
  } catch (err) {
    console.error('stationCheckCommitBundle error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};

// GET /api/a/station/check/report   (header: x-station-token)
//   รายงานบนเครื่องสแกน — "เหลือกี่ตัวที่ยังไม่ checking" ทั้งโรง (ไม่จำกัดแค่ node ที่ login)
//   คืน 2 ชั้น: summary ต่อ node ที่รอตรวจ + detail ต่อ node/order/มัด (หน้าเว็บเอาไป drill)
exports.stationCheckReport = async (req, res, next) => {
  try {
    let auth;
    try { auth = await requireStationToken(req); }
    catch (e) { return res.status(e.code || 401).json(e.body || { success: false }); }
    const tok = () => genStationTokenPack(auth.ns, auth.stationID, auth.decoded.uuid);
    const { companyID, factoryID } = auth.decoded;

    const cfg = await checkCfg(factoryID);
    if (!cfg.enabled) return res.json({ success: true, enabled: false, summary: [], detail: [], total: 0, ...tok() });

    const rows = await OrderProduction.aggregate([
      { $match: { companyID, checkFactoryID: factoryID, 'checkPending.0': { $exists: true }, productStatus: { $in: ['normal', 'repaired'] } } },
      { $project: { _id: 0, orderID: 1, bundleNo: 1, productCount: 1,
          nextCheck: { $arrayElemAt: ['$checkPending', 0] },
          pendLen: { $size: { $ifNull: ['$checkPending', []] } },
          outFactoryID: { $ifNull: [{ $arrayElemAt: ['$productionNode.factoryID', -1] }, ''] },
          curNode:      { $ifNull: [{ $arrayElemAt: ['$productionNode.toNode', -1] }, ''] } } },
      { $group: {
          _id: { nextCheck: '$nextCheck', orderID: '$orderID', bundleNo: '$bundleNo',
                 outFactoryID: '$outFactoryID', curNode: '$curNode' },
          qty: { $sum: 1 }, bundleCount: { $max: '$productCount' }, pendLen: { $max: '$pendLen' },
      } },
      { $sort: { '_id.nextCheck': 1, '_id.orderID': 1, '_id.bundleNo': 1 } },
      { $limit: 2000 },
    ]).allowDiskUse(true);

    const detail = rows.map(r => ({
      nextCheck: r._id.nextCheck, orderID: r._id.orderID, bundleNo: r._id.bundleNo,
      outFactoryID: r._id.outFactoryID, curNode: r._id.curNode,
      qty: r.qty, bundleCount: r.bundleCount, pendLen: r.pendLen,
    }));
    const byNode = new Map();
    for (const d of detail) {
      const k = d.nextCheck || '-';
      const e = byNode.get(k) || { nodeID: k, qty: 0, bundles: 0, orders: new Set() };
      e.qty += d.qty; e.bundles += 1; e.orders.add(d.orderID);
      byNode.set(k, e);
    }
    const summary = [...byNode.values()]
      .map(e => ({ nodeID: e.nodeID, qty: e.qty, bundles: e.bundles, orders: e.orders.size }))
      .sort((a, b) => String(a.nodeID).localeCompare(String(b.nodeID)));
    const total = summary.reduce((s, x) => s + x.qty, 0);

    return res.json({ success: true, enabled: true, checkNodes: cfg.nodes, summary, detail, total, truncated: rows.length >= 2000, ...tok() });
  } catch (err) {
    console.error('stationCheckReport error:', String(err && err.message || err));
    return res.status(500).json({ success: false, message: String(err && err.message || err) });
  }
};
