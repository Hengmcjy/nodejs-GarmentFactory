// ═══════════════════════════════════════════════════════════════════════════
// c-worker-scan.js — Controller: Accounting > ดึงข้อมูล Worker เหมา (worker zone)
// จุดประสงค์: รายงานยอดสแกนงานของ worker แต่ละคน ต่อ order(style) ต่อ subNode ในช่วงวันที่เลือก
//   เพื่อพิมพ์ PDF ให้ worker เซ็นรับทราบว่าทำงานได้เท่าไหร่
// ★ ทุก query optimize แล้ว (อ้าง mongodb-aggregate-optimization-context.md) — ผลลัพธ์เท่าเดิม 100%
//   หลัก: ตัด $and, pipeline ที่มีแค่ match+project → ใช้ find().lean(), $match ก่อน $unwind
// หมายเหตุ: ปรับ path require model ให้ตรงกับของจริงในโปรเจค (ชื่อไฟล์อาจต่างจากนี้)
// ═══════════════════════════════════════════════════════════════════════════
const moment   = require('moment-timezone');
const mongoose = require('mongoose');
const ShareFunc = require("../c-api-app-share-function");

const OrderProduction = require("../../models/m-orderProduction");
const User            = require("../../models/m-user");

// ## Order / SubNodeFlowC ถูก register (compile) ที่ไฟล์ model อื่นอยู่แล้ว
// ## ถ้า require ไฟล์ซ้ำจะเจอ OverwriteModelError → ดึง model ที่ register แล้วด้วย mongoose.model()
// ## (lazy — เรียกตอน request จะ register ครบแล้วเสมอ ไม่ต้องกังวล load order)
const getOrder        = () => mongoose.model('Order');
const getSubNodeflowC = () => mongoose.model('SubNodeFlowC');   // ชื่อ model = SubNodeFlowC (F ใหญ่)

moment.tz.setDefault('Asia/Bangkok');

// ── getSubNodeStaffScan ──────────────────────────────
// Requirement: ยอดสแกน worker ต่อ order/node/subNode/qrCode ในช่วงวัน (นับ 1 scan = 1 ชิ้น)
//   OPTIMIZE จากเดิม: ตัด $and, ตัด $elemMatch ซ้ำ(บั๊ก datetime key ซ้ำ), ตัด $project 2 รอบ
//   + การคำนวณ style/target/color/size ที่คำนวณแล้ว drop ทิ้ง (ไม่ได้ใช้) → 6 stages เหลือ 4
//   ผลลัพธ์เท่าเดิม (group key + countQty เหมือนเดิมทุกประการ)
async function getSubNodeStaffScan(companyID, factoryIDArr, orderIDArr, nodeIDs, dateStart, dateEnd) {
  const rows = await OrderProduction.aggregate([
    { $match: {
      companyID,
      orderID: { $in: orderIDArr },
      subNodeFlow: { $elemMatch: {
        factoryID: { $in: factoryIDArr },
        nodeID:    { $in: nodeIDs },
        datetime:  { $gte: dateStart, $lte: dateEnd },
      }},
    }},
    { $unwind: "$subNodeFlow" },
    { $match: {
      "subNodeFlow.factoryID": { $in: factoryIDArr },
      "subNodeFlow.nodeID":    { $in: nodeIDs },
      "subNodeFlow.datetime":  { $gte: dateStart, $lte: dateEnd },
    }},
    { $group: {
      _id: {
        companyID: "$companyID",
        factoryID: "$subNodeFlow.factoryID",
        orderID:   "$orderID",
        nodeID:    "$subNodeFlow.nodeID",
        subNodeID: "$subNodeFlow.subNodeID",
        qrCode:    "$subNodeFlow.qrCode",
        empState:  "$subNodeFlow.empState",
      },
      countQty: { $sum: 1 },
    }},
  ]).hint({ companyID: 1, orderID: 1, "subNodeFlow.factoryID": 1, "subNodeFlow.nodeID": 1, "subNodeFlow.datetime": -1 });

  return rows.map(fw => ({
    companyID: fw._id.companyID, factoryID: fw._id.factoryID, orderID: fw._id.orderID,
    nodeID: fw._id.nodeID, subNodeID: fw._id.subNodeID, qrCode: fw._id.qrCode,
    empState: fw._id.empState, countQty: fw.countQty,
  }));
}

// ── GET /api/a/admacc/worker-scan/nodes/:companyID ──────────────────────────────
// Requirement: list node สำหรับ dropdown = distinct nodeID เรียงน้อย→มาก
//   OPTIMIZE: ใช้ .distinct() ตรงๆ (เบากว่า aggregate group)
exports.getWorkerScanNodes = async (req, res, next) => {
  const { companyID } = req.params;
  try {
    const nodeIDs = await getSubNodeflowC().distinct('nodeID', { companyID });
    nodeIDs.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), nodeIDs });
  } catch (err) { return next(err); }
};

// ── GET /api/a/admacc/worker-scan/report/:companyID/:factoryID/:nodeID?dateStart=&dateEnd= ──
// Requirement: รายงานยอดสแกน worker ของ node ที่เลือก ในช่วงวัน → enriched rows + คอลัมน์ subNode
//   ช่วงวัน = กรอง subNodeFlow.datetime (timestamp จริง) เป็นขอบวัน Bangkok
exports.getWorkerScanReport = async (req, res, next) => {
  const { companyID, factoryID, nodeID } = req.params;
  const dateStart = moment(req.query.dateStart).startOf('day').toDate();  // Bangkok 00:00
  const dateEnd   = moment(req.query.dateEnd).endOf('day').toDate();      // Bangkok 23:59:59
  try {
    // 1) orderIDArr = order ที่ยัง open  (OPTIMIZE: ตัด $and, aggregate→find เพราะแค่ match+project)
    const statusArr = ['open'];
    const orders = await getOrder().find(
      { companyID, orderStatus: { $in: statusArr } },
      { orderID: 1 }
    ).lean();
    const orderIDArr = orders.map(o => o.orderID);
    if (orderIDArr.length === 0) {
      const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
      return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), nodeID, subNodes: [], rows: [] });
    }

    // 2) ยอดสแกน (optimized)
    const scan = await getSubNodeStaffScan(companyID, [factoryID], orderIDArr, [nodeID], dateStart, dateEnd);

    // 3) qrCode ที่พบในผล (distinct)
    const qrCodes = Array.from(new Set(scan.map(i => i.qrCode)));

    // 4) ข้อมูล worker (ชื่อ/รูป)  (OPTIMIZE: ตัด $and — เก็บ aggregate เพราะ rename uInfo.* )
    const workers = qrCodes.length ? await User.aggregate([
      { $match: { qrCode: { $in: qrCodes }, type: 's' } },
      { $project: { _id: 0, userID: 1, qrCode: 1, userName: "$uInfo.userName", pic: "$uInfo.pic" } },
    ]) : [];
    const workerMap = {};
    workers.forEach(w => { workerMap[w.qrCode] = w; });

    // 5) ชื่อ subNode ของ node นี้  (OPTIMIZE: ตัด $and single-cond, aggregate→find)
    const subCfg = await getSubNodeflowC().find(
      { companyID, nodeID },
      { _id: 0, subNodeID: 1, subNodeName: 1 }
    ).lean();
    const subNameMap = {};
    subCfg.forEach(s => { subNameMap[s.subNodeID] = s.subNodeName; });

    // 6) enrich: join worker + subNodeName
    const rows = scan.map(r => {
      const w = workerMap[r.qrCode] || {};
      return {
        orderID:     r.orderID,
        subNodeID:   r.subNodeID,
        subNodeName: subNameMap[r.subNodeID] || r.subNodeID,
        qrCode:      r.qrCode,
        userID:      w.userID   || '',
        userName:    w.userName || '(ไม่พบชื่อ)',
        pic:         w.pic      || '',
        empState:    r.empState,
        countQty:    r.countQty,
      };
    });

    // 7) คอลัมน์ subNode = distinct subNodeID ที่มีในผล เรียงน้อย→มาก
    const subNodes = Array.from(new Set(rows.map(r => r.subNodeID)))
      .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }))
      .map(id => ({ subNodeID: id, subNodeName: subNameMap[id] || id }));

    const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), nodeID, subNodes, rows });
  } catch (err) { return next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════
// อ้างอิง: query อื่นที่ให้มา — optimize แล้ว (ผลเท่าเดิม) เผื่อนำไปแทนที่เดิมในที่อื่น
//
// NodeFlow (flowSeq) — OPTIMIZE: ตัด $and, aggregate→find
//   const nodeFlows = await NodeFlow.find(
//     { companyID, factoryID },
//     { _id: 0, nodeFlowID: 1, companyID: 1, factoryID: 1, flowType: 1, registDate: 1, flowCondition: 1, flowSeq: 1 }
//   ).lean();
// ═══════════════════════════════════════════════════════════════════════════
