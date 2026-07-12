const mongoose = require("mongoose");

// ## ค่าแรงเหมา "ลงเอง (manual)" — กรณี worker สแกนงานไม่ติด บัญชีต้องลงเอง
// ## requirement: เก็บ season / order(รุ่น) / node / subnode + qty/rate/amount แบบ "ลอยๆ"
// ##   (ไม่อ้าง qrCode รายตัว เพราะไม่รู้ว่าเสื้อที่หลุดคือตัวไหน)
// ## เก็บแยกจาก production(auto) → รายงานต้นทุนดึงมารวมกับ auto ทีหลัง
// ## ทุก record จะมี WorkerPayItem (รหัสจาก config WP_MANUAL_PIECE_CODE) คู่กัน 1 ตัว (payItemID)

const wpManualPieceSchema = new mongoose.Schema({

    manualID:   { type: String, required: true, unique: true },
    companyID:  { type: String, required: true },
    factoryID:  { type: String, required: true },
    periodID:   { type: String, required: true },   // งวดจ่าย
    workerID:   { type: String, required: true },

    seasonYear: { type: String, required: true },   // season ที่เลือก
    orderID:    { type: String, required: true },   // รุ่นเสื้อ (อ้าง Order — ไม่อ้าง qrCode รายตัว)
    orderName:  { type: String, default: '' },      // cache ชื่อรุ่น/ลูกค้า ไว้โชว์
    nodeID:     { type: String, required: true },   // ขั้นตอนหลัก
    subNodeID:  { type: String, required: true },   // ขั้นตอนย่อย (k1/k2/n1...)

    // ## โหมดกรอก: 'qtyrate' = จำนวน×เรต | 'amount' = กรอกยอดตรง
    entryMode:  { type: String, enum: ['qtyrate', 'amount'], default: 'qtyrate' },
    qty:        { type: Number, default: null },    // จำนวนชิ้น (null ถ้าโหมด amount)
    rate:       { type: Number, default: null },    // บาท/ชิ้น (null ถ้าโหมด amount)
    amount:     { type: Number, default: 0 },       // ยอดรวม (qty*rate หรือกรอกตรง)

    payItemID:  { type: String, default: '' },      // ref → WorkerPayItem (590102) ที่สร้างคู่กัน
    note:       { type: String, default: '' },
    itemDate:   { type: Date, default: Date.now },  // วันปฏิทินของรายการ (UTC-midnight)
    status:     { type: String, default: 'a' },     // 'a' | 'i'

    createdAt:  { type: Date, default: Date.now },
    createBy:   { userID: { type: String } },

});

// index สำหรับดึงในหน้า detail (per period+worker)
wpManualPieceSchema.index({ companyID: 1, factoryID: 1, periodID: 1, workerID: 1 });
// index สำหรับรายงานต้นทุน (per season/order/subnode)
wpManualPieceSchema.index({ companyID: 1, factoryID: 1, seasonYear: 1, orderID: 1, subNodeID: 1 });

module.exports = mongoose.model("WpManualPiece", wpManualPieceSchema);
