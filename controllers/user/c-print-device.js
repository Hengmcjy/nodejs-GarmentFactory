// Requirement: Master Data > QR Print Device — CRUD เครื่องพิมพ์ QR/care label (ระดับ company)
//   ★ แยกไฟล์ controller ใหม่ (ไม่แตะ c-master.js เดิม) · mount route ใน r-master.js (/api/a/master/print-device/*)
//   collection: printdevices (model m-print-device) · deviceID = pd_###### per company
//   รูปแบบใช้งานหลัก: 1 คอมต่อ USB ตรงเข้าเครื่องพิมพ์ → agent รันที่คอมนั้น (connType=usb, agentUrl=localhost)
const ShareFunc = require("../c-api-app-share-function");
const PrintDevice = require("../../models/m-print-device");

const tokenRefresh = async (req) => {
  const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
  return { token, expiresIn: Number(process.env.TOKENExpiresIn) };
};

// deviceID = 'pd_' + zeroPad(6) ของ max+1 (per company)
async function nextDeviceID(companyID) {
  const rows = await PrintDevice.find({ companyID, deviceID: /^pd_\d+$/ }, { deviceID: 1, _id: 0 }).lean();
  let max = 0;
  for (const r of rows) { const n = parseInt(String(r.deviceID).slice(3), 10); if (n > max) max = n; }
  return 'pd_' + String(max + 1).padStart(6, '0');
}

// GET /api/a/master/print-device/:companyID → list (default ก่อน แล้วเรียงชื่อ)
exports.getPrintDevices = async (req, res, next) => {
  try {
    const companyID = String(req.params.companyID || '').trim();
    const devices = await PrintDevice.find({ companyID }).sort({ isDefault: -1, name: 1 }).lean();
    return res.json({ success: true, devices, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// POST /api/a/master/print-device/save → create/update
exports.savePrintDevice = async (req, res, next) => {
  try {
    const b = req.body || {};
    const _id = b._id;
    const companyID = String(b.companyID || '').trim();
    const fields = {
      name:          String(b.name || '').trim(),
      brand:         String(b.brand || '').trim(),
      model:         String(b.model || '').trim(),
      language:      String(b.language || '').trim(),
      dpi:           Math.floor(+b.dpi || 0),
      pcName:        String(b.pcName || '').trim(),
      agentUrl:      String(b.agentUrl || '').trim(),
      connType:      String(b.connType || 'usb').trim(),
      usbName:       String(b.usbName || '').trim(),
      host:          String(b.host || '').trim(),
      port:          Math.floor(+b.port || 0),
      labelWidthMm:  +b.labelWidthMm || 0,
      labelHeightMm: +b.labelHeightMm || 0,
      gapMm:         +b.gapMm || 0,
      cutter:        String(b.cutter || 'none').trim(),
      speed:         (b.speed === '' || b.speed == null) ? undefined : (+b.speed || 0),      // ips (SBARCO 1-6 · TSC 2-6)
      density:       (b.density === '' || b.density == null) ? undefined : (+b.density || 0), // 0-15
      // ★ ตั้งค่าพิมพ์เพิ่ม (undefined = ไม่ทับของเดิม)
      cutMode:       (b.cutMode === '' || b.cutMode == null) ? undefined : String(b.cutMode).trim(),
      headMm:        (b.headMm === '' || b.headMm == null) ? undefined : (+b.headMm || 0),
      tailMm:        (b.tailMm === '' || b.tailMm == null) ? undefined : (+b.tailMm || 0),
      shiftX:        (b.shiftX === '' || b.shiftX == null) ? undefined : (+b.shiftX || 0),
      rightEdge:     (b.rightEdge === '' || b.rightEdge == null) ? undefined : (+b.rightEdge || 0),
      leftX:         (b.leftX === '' || b.leftX == null) ? undefined : (+b.leftX || 0),
      templateKey:   String(b.templateKey || '').trim(),
      line:          String(b.line || '').trim(),
      isDefault:     !!b.isDefault,
      status:        String(b.status || 'a').trim(),
      note:          String(b.note || '').trim(),
    };

    if (_id) {
      // ★ ตั้ง default ตัวนี้ → ปลด default ตัวอื่นใน company (ให้ default มีตัวเดียว)
      if (fields.isDefault) {
        const cur = await PrintDevice.findById(_id).lean();
        if (cur) await PrintDevice.updateMany({ companyID: cur.companyID, _id: { $ne: _id } }, { $set: { isDefault: false } });
      }
      const dev = await PrintDevice.findByIdAndUpdate(_id, { $set: fields }, { new: true }).lean();
      if (!dev) return res.status(404).json({ success: false, message: 'device not found' });
      return res.json({ success: true, device: dev, ...(await tokenRefresh(req)) });
    }

    if (!companyID || !fields.name) return res.status(400).json({ success: false, message: 'companyID + name required' });
    if (fields.isDefault) await PrintDevice.updateMany({ companyID }, { $set: { isDefault: false } });
    const deviceID = await nextDeviceID(companyID);
    const dev = await PrintDevice.create({
      companyID, deviceID, ...fields,
      createBy: { userID: req.userData?.tokenSet?.userID || '', userName: req.userData?.userName || '' },
      createdAt: new Date(),
    });
    return res.status(201).json({ success: true, device: dev, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};

// DELETE /api/a/master/print-device/:id
exports.deletePrintDevice = async (req, res, next) => {
  try {
    await PrintDevice.findByIdAndDelete(req.params.id);
    return res.json({ success: true, ...(await tokenRefresh(req)) });
  } catch (err) { return next(err); }
};
