const mongoose = require("mongoose");

// ## บันทึกการผลิตรายวันของ worker แต่ละคน ในงวดนั้น
// ## 1 record = 1 วัน × 1 worker × 1 งวด
// ## เมื่อ save → auto upsert WorkerPayItem (510005 ค่าแรงเหมา) รวมทุกวัน

const workerPayProductionSchema = new mongoose.Schema({

    wpProdID:    { type: String, required: true, unique: true },
    companyID:   { type: String, required: true },
    factoryID:   { type: String, required: true },
    periodID:    { type: String, required: true },
    workerID:    { type: String, required: true },

    date:        { type: Date, required: true },   // วันที่ (start-of-day)
    countryID:   { type: String, default: '' },    // legacy — เลิกใช้ (cost แยกด้วย targetPlaceID+color แล้ว)

    // ## รายการย่อย: แต่ละ order × subNode × targetPlaceID × สี ที่ทำในวันนั้น
    items: [{
        orderID:       { type: String },
        nodeID:        { type: String },
        subNodeID:     { type: String },
        targetPlaceID: { type: String, default: '' },   // ASIA/UK/JAPN/SGHI — จาก bundle · ใช้ lookup cost
        color:         { type: String, default: '' },   // colorID จาก barcode — override สี (ถ้ามี)
        countQty:      { type: Number, default: 0 },
        cost:          { type: Number, default: 0 },    // บาท/ชิ้น
        subtotal:      { type: Number, default: 0 },    // countQty × cost
    }],

    totalAmount: { type: Number, default: 0 },     // รวมวันนี้
    savedAt:     { type: Date, default: Date.now },

});

workerPayProductionSchema.index({ companyID: 1, factoryID: 1, periodID: 1, workerID: 1 });
// unique: worker 1 คน ต่อ 1 งวด ต่อ 1 วัน — save ซ้ำ = update
workerPayProductionSchema.index({ periodID: 1, workerID: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("WorkerPayProduction", workerPayProductionSchema);
