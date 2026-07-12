// ═══════════════════════════════════════════════════════════════════════════
// Controller: User Preference + Live Translate
// - translateText : แปลข้อความสด ผ่าน MyMemory (ฟรี ไม่ต้อง API key)
// - get/setTransPref : ภาษาที่ user เลือกไว้สำหรับ live translate (เก็บใน useracc.liveTransLang)
// หมายเหตุ: useracc = ตาราง login (userid+pass) อยู่นอก language-ai → เข้าถึงตรงผ่าน raw collection
//   (ไม่ต้องแก้โมเดล login) · key = userID จาก token
// ═══════════════════════════════════════════════════════════════════════════
const mongoose  = require("mongoose");
const https     = require("https");
const ShareFunc = require("../c-api-app-share-function");

const ALLOWED = ['en', 'th', 'cn', 'jp', 'mm'];
// map รหัสภาษาในแอพ → รหัสของ MyMemory
const MM_CODE = { en: 'en', th: 'th', cn: 'zh-CN', jp: 'ja', mm: 'my' };

function uid(req) { return req.userData?.userID || req.userData?.tokenSet?.userID || ''; }

// ## เรียก MyMemory (GET) — แปล th → target
function myMemory(text, target) {
    return new Promise((resolve, reject) => {
        const q   = encodeURIComponent(String(text).slice(0, 480));   // MyMemory จำกัดความยาว
        const url = `https://api.mymemory.translated.net/get?q=${q}&langpair=th|${target}`;
        https.get(url, { headers: { 'User-Agent': 'GarmentAcc/1.0' } }, (r) => {
            let data = '';
            r.on('data', c => data += c);
            r.on('end', () => {
                try { resolve(JSON.parse(data)?.responseData?.translatedText || ''); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

// ## POST /api/a/admacc/translate  { text, to }  → แปลสด
exports.translateText = async (req, res, next) => {
    const { text, to } = req.body;
    if (!text || !String(text).trim())
        return res.status(400).json({ success: false, message: 'ต้องมีข้อความ' });
    const lang = ALLOWED.includes(to) ? to : 'cn';
    if (lang === 'th')   // ต้นทางไทยอยู่แล้ว ไม่ต้องแปล
        return res.json({ success: true, translated: String(text), to: 'th' });
    try {
        const translated = await myMemory(text, MM_CODE[lang]);
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), translated, to: lang });
    } catch (err) {
        console.error('[translateText]', err.message);
        return res.status(502).json({ success: false, message: 'แปลไม่สำเร็จ ลองใหม่อีกครั้ง' });
    }
};

// ## GET /api/a/admacc/trans-pref  → ภาษาของ user นี้ (แปล + ไมค์)
// ## default: liveTransLang = cn (จีน) · micLang = th (ไทย)
exports.getTransPref = async (req, res, next) => {
    try {
        const doc = await mongoose.connection.collection('useracc')
            .findOne({ userID: uid(req) }, { projection: { liveTransLang: 1, micLang: 1 } });
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({
            success: true, token, expiresIn: Number(process.env.TOKENExpiresIn),
            liveTransLang: doc?.liveTransLang || 'cn',
            micLang:       doc?.micLang       || 'th',
        });
    } catch (err) { next(err); }
};

// ## PUT /api/a/admacc/trans-pref  { liveTransLang?, micLang? }  → บันทึกเฉพาะที่ส่งมา
exports.setTransPref = async (req, res, next) => {
    const { liveTransLang, micLang } = req.body;
    const setData = {};
    if (liveTransLang !== undefined) {
        if (!ALLOWED.includes(liveTransLang)) return res.status(400).json({ success: false, message: 'ภาษาแปลไม่ถูกต้อง' });
        setData.liveTransLang = liveTransLang;
    }
    if (micLang !== undefined) {
        if (!ALLOWED.includes(micLang)) return res.status(400).json({ success: false, message: 'ภาษาไมค์ไม่ถูกต้อง' });
        setData.micLang = micLang;
    }
    if (Object.keys(setData).length === 0)
        return res.status(400).json({ success: false, message: 'ไม่มีข้อมูลให้บันทึก' });
    try {
        await mongoose.connection.collection('useracc').updateOne({ userID: uid(req) }, { $set: setData });
        const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
        return res.json({ success: true, token, expiresIn: Number(process.env.TOKENExpiresIn), ...setData });
    } catch (err) { next(err); }
};
