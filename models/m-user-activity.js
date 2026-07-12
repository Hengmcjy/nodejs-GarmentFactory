// ═══════════════════════════════════════════════════════════════════════════
// User Activity — เก็บ session ที่ใช้งานอยู่ (สำหรับ Admin > System > Monitor)
// upsert ทุก request ที่ผ่าน auth (throttle) · lastSeen = เวลาใช้งานล่าสุด
// online = lastSeen ใกล้ปัจจุบัน (เช็คที่ endpoint) · 1 อุปกรณ์ = 1 session (sessionKey=uuid5)
// ═══════════════════════════════════════════════════════════════════════════
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    sessionKey: { type: String, unique: true },   // = uuid5 (แยกต่ออุปกรณ์)
    userID:     { type: String, index: true },
    ip:         { type: String, default: '' },
    appName:    { type: String, default: '' },
    appVer:     { type: String, default: '' },
    browser:    { type: String, default: '' },
    browserVer: { type: String, default: '' },
    deviceType: { type: String, default: '' },
    os:         { type: String, default: '' },
    osVer:      { type: String, default: '' },
    loginAt:    { type: Date },
    lastSeen:   { type: Date, index: true },
});

module.exports = mongoose.model('UserActivity', activitySchema);
