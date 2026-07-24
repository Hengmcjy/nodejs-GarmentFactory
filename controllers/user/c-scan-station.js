// Requirement: Admin > Master Data > Scan Station — จัดการ station สแกน QR ของแต่ละ node ต่อโรงงาน
//   (migrate จาก app เดิม node-list.component — user สั่ง 2026-07-23 · เอาครบ: info tab + station tabs · ไม่มีสร้าง node ใหม่)
//   ★ แยกไฟล์ controller ใหม่ (AI-owned) · mount route ใน r-master.js (/api/a/master/scan-station/*)
//   ★ ใช้ collection เดิม nodestations (model m-nodeStation legacy — require อย่างเดียว ไม่แก้ไฟล์)
//   ★ แก้เฉพาะ field ที่ app เดิมแก้อยู่แล้ว: status / nodeInfo(nodeType,mustBundleScan,haveSubWorkflow,location,nodeDescription)
//     / nStation.stationNo / userNode[] (station credentials) — ไม่แตะ field อื่น (additive-safe)
const ShareFunc = require("../c-api-app-share-function");
const NodeStation = require("../../models/m-nodeStation");
const User = require("../../models/m-user");   // station login users เดิมอยู่ collection users (ใช้เช็ค userID ซ้ำ)

const tokenRefresh = async (req) => {
  const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
  return { token, expiresIn: Number(process.env.TOKENExpiresIn) };
};

// GET /api/a/master/scan-station/:companyID/:factoryID → รายการ node ทั้งหมดของโรงงาน (ทุก status)
exports.getScanStations = async (req, res, next) => {
  try {
    const companyID = String(req.params.companyID || '').trim();
    const factoryID = String(req.params.factoryID || '').trim();
    const nodeStations = await NodeStation.find({ companyID, factoryID }).sort({ nodeID: 1 }).lean();
    return res.json({ success: true, nodeStations, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// PUT /api/a/master/scan-station/info → แก้ข้อมูล node (tab info)
//   body: { companyID, factoryID, nodeID, status, nodeType, mustBundleScan, haveSubWorkflow, location, nodeDescription, stationNo }
//   ★ $set รายฟิลด์ (nested path) — ไม่ทับ nodeInfo ทั้งก้อน กัน field อื่น (pic/registDate/createBy) หาย
exports.saveScanStationInfo = async (req, res, next) => {
  try {
    const b = req.body || {};
    const companyID = String(b.companyID || '').trim();
    const factoryID = String(b.factoryID || '').trim();
    const nodeID = String(b.nodeID || '').trim();
    if (!companyID || !factoryID || !nodeID) {
      return res.status(400).json({ success: false, message: 'companyID + factoryID + nodeID required' });
    }
    const set = { editDate: new Date() };
    if (b.status != null)          set['status'] = String(b.status).trim();
    if (b.nodeType != null)        set['nodeInfo.nodeType'] = String(b.nodeType).trim();
    if (b.mustBundleScan != null)  set['nodeInfo.mustBundleScan'] = !!b.mustBundleScan;
    if (b.haveSubWorkflow != null) set['nodeInfo.haveSubWorkflow'] = !!b.haveSubWorkflow;
    if (b.location != null)        set['nodeInfo.location'] = String(b.location);
    if (b.nodeDescription != null) set['nodeInfo.nodeDescription'] = String(b.nodeDescription);
    if (b.stationNo != null)       set['nStation.stationNo'] = Math.max(0, Math.floor(+b.stationNo || 0));

    const r = await NodeStation.updateOne({ companyID, factoryID, nodeID }, { $set: set });
    if (!r.matchedCount) return res.status(404).json({ success: false, message: 'node not found' });
    const nodeStation = await NodeStation.findOne({ companyID, factoryID, nodeID }).lean();
    return res.json({ success: true, nodeStation, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// PUT /api/a/master/scan-station/station → เซฟ station 1 ช่อง (tab station[n])
//   body: { companyID, factoryID, nodeID, station: { stationID, userNodeID, userNodePass, canScanNode, canScanSubNode }, clearUuid }
//   ★ update เฉพาะ entry ที่ stationID ตรง (arrayFilters) · ไม่มี = push ใหม่ — ไม่ทับ userNode ทั้ง array แบบ app เดิม (กัน station อื่นหาย)
//   ★ clearUuid: ปลดผูกเครื่อง (uuid='') ให้เครื่องใหม่ login ผูกใหม่ได้
exports.saveScanStationUser = async (req, res, next) => {
  try {
    const b = req.body || {};
    const companyID = String(b.companyID || '').trim();
    const factoryID = String(b.factoryID || '').trim();
    const nodeID = String(b.nodeID || '').trim();
    const st = b.station || {};
    const stationID = String(st.stationID || '').trim();
    if (!companyID || !factoryID || !nodeID || !stationID) {
      return res.status(400).json({ success: false, message: 'companyID + factoryID + nodeID + station.stationID required' });
    }

    const doc = await NodeStation.findOne({ companyID, factoryID, nodeID }, { userNode: 1 }).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'node not found' });
    const exists = (doc.userNode || []).some(u => u.stationID === stationID);

    const fields = {
      'userNode.$[st].userNodeID':     String(st.userNodeID || '').trim(),
      'userNode.$[st].userNodePass':   String(st.userNodePass || ''),
      'userNode.$[st].canScanNode':    !!st.canScanNode,
      'userNode.$[st].canScanSubNode': !!st.canScanSubNode,
    };
    if (b.clearUuid) fields['userNode.$[st].uuid'] = '';

    if (exists) {
      await NodeStation.updateOne(
        { companyID, factoryID, nodeID },
        { $set: { ...fields, editDate: new Date() } },
        { arrayFilters: [{ 'st.stationID': stationID }] }
      );
    } else {
      await NodeStation.updateOne(
        { companyID, factoryID, nodeID },
        {
          $push: { userNode: {
            stationID,
            userNodeID: String(st.userNodeID || '').trim(),
            userNodePass: String(st.userNodePass || ''),
            uuid: '',
            canScanNode: !!st.canScanNode,
            canScanSubNode: !!st.canScanSubNode,
          } },
          $set: { editDate: new Date() },
        }
      );
    }
    const nodeStation = await NodeStation.findOne({ companyID, factoryID, nodeID }).lean();
    return res.json({ success: true, nodeStation, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// GET /api/a/master/scan-station/check-userid/:companyID/:factoryID/:checkUserID → เช็ค userID ซ้ำ
//   ตรรกะเดียวกับ app เดิม (getCheckExistNodeCompanyFactoryUserID): ซ้ำกับ station อื่นใน company+factory หรือซ้ำกับ user ระบบ (collection users)
exports.checkScanStationUserID = async (req, res, next) => {
  try {
    const companyID = String(req.params.companyID || '').trim();
    const factoryID = String(req.params.factoryID || '').trim();
    const checkUserID = String(req.params.checkUserID || '').trim();
    if (!checkUserID) return res.status(400).json({ success: false, message: 'checkUserID required' });

    const nodeHit = await NodeStation.findOne(
      { companyID, factoryID, 'userNode.userNodeID': checkUserID }, { nodeID: 1 }).lean();
    const userHit = await User.findOne({ userID: checkUserID }, { userID: 1 }).lean();
    return res.json({ success: true, isExist: !!(nodeHit || userHit), ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// POST /api/a/master/scan-station/clone-factory → คัดลอกโครง node ทั้งหมดจากโรงต้นแบบ → โรงใหม่
//   Requirement (user 2026-07-23): โรงในเครือเพิ่มใหม่ ยังไม่มี node — เดิมต้องก๊อป doc ใน Compass แก้ factoryID เอง (อันตราย)
//   body: { companyID, fromFactoryID, toFactoryID }
//   ★ ก๊อปเฉพาะโครง: nodeID/nodeName/status/nodeType/mustBundleScan/haveSubWorkflow/scan1ForAll/stationNo/nodeProblem
//   ★ ไม่ก๊อป userNode (credentials ตั้งใหม่ต่อโรง — กัน userID station ชนกันข้ามโรง) · loginList ว่าง · registDate=ตอนนี้
//   ★ node ที่มีอยู่แล้วในโรงปลายทาง = ข้าม (insert เฉพาะที่ยังไม่มี — เรียกซ้ำได้ปลอดภัย)
exports.cloneScanStationFactory = async (req, res, next) => {
  try {
    const b = req.body || {};
    const companyID = String(b.companyID || '').trim();
    const fromFactoryID = String(b.fromFactoryID || '').trim();
    const toFactoryID = String(b.toFactoryID || '').trim();
    if (!companyID || !fromFactoryID || !toFactoryID) {
      return res.status(400).json({ success: false, message: 'companyID + fromFactoryID + toFactoryID required' });
    }
    if (fromFactoryID === toFactoryID) {
      return res.status(400).json({ success: false, message: 'โรงต้นแบบกับโรงปลายทางต้องคนละโรง' });
    }

    const src = await NodeStation.find({ companyID, factoryID: fromFactoryID }).lean();
    if (!src.length) return res.status(404).json({ success: false, message: 'โรงต้นแบบไม่มี node' });

    const existing = await NodeStation.find({ companyID, factoryID: toFactoryID }, { nodeID: 1 }).lean();
    const have = new Set(existing.map(x => x.nodeID));
    const now = new Date();
    const docs = src.filter(s => !have.has(s.nodeID)).map(s => ({
      companyID, factoryID: toFactoryID,
      nodeID: s.nodeID, nodeName: s.nodeName || '',
      status: s.status || 'a', editDate: now,
      nodeInfo: {
        nodeType: s.nodeInfo?.nodeType || 'main',
        mustBundleScan: !!s.nodeInfo?.mustBundleScan,
        haveSubWorkflow: !!s.nodeInfo?.haveSubWorkflow,
        scan1ForAll: !!s.nodeInfo?.scan1ForAll,
        location: '', nodeDescription: '', pic: [],
        registDate: now,
        createBy: { userID: req.userData?.tokenSet?.userID || '', userName: req.userData?.userName || '' },
      },
      userNode: [],
      nStation: { stationNo: s.nStation?.stationNo ?? 0, loginList: [] },
      nodeProblem: (s.nodeProblem || []).map(p => ({ problemID: p.problemID, problemName: p.problemName, problemDetail: p.problemDetail })),
    }));
    if (docs.length) await NodeStation.insertMany(docs);
    return res.json({ success: true, created: docs.length, skipped: src.length - docs.length, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};
