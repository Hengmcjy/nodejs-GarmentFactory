const mongoose = require('mongoose');

// ── Garment System Config ─────────────────────────────────────────────────────
// เก็บ config ระดับ factory แบ่งตาม module
// ตัวอย่าง: { factoryID:'F001', module:'accounting', key:'WP_AUTO_INCOME_CODE', value:'590101' }

const gsconfigSchema = new mongoose.Schema({
    configID:    { type: String, required: true },  // `${factoryID}-${module}-${key}`
    companyID:   { type: String, required: true },
    factoryID:   { type: String, required: true },
    module:      { type: String, required: true },  // 'accounting' | 'hr' | 'reports' | 'general'
    key:         { type: String, required: true },
    value:       { type: String, default: '' },
    label:       { type: String, default: '' },     // ชื่อแสดงใน UI
    description: { type: String, default: '' },      // คำอธิบายสั้น
    levelHint:   { type: String, default: '' },      // เช่น 'Level 3', 'Level 4' — บอก user ว่าต้องใช้ระดับไหน
    dataType:    { type: String, default: 'string' }, // 'string' | 'number' | 'boolean' | 'select'
    options:     { type: String, default: '' },       // dataType='select' → ตัวเลือกคั่นด้วย comma เช่น 'ver1,ver2,ver3'
    comment:     { type: String, default: '' },       // หมายเหตุจาก admin เผื่อลืม
    seq:         { type: Number },                     // ## ลำดับแถวที่ admin จัดเอง (ต่อ module) · ว่าง = ใช้ลำดับ default
    updatedAt:   { type: Date,   default: Date.now },
    updatedBy:   { type: String, default: '' },
});

gsconfigSchema.index({ companyID: 1, factoryID: 1, module: 1 });
gsconfigSchema.index({ configID: 1 }, { unique: true });

module.exports = mongoose.model('Gsconfig', gsconfigSchema);
