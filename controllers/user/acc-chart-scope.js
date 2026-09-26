// ═══════════════════════════════════════════════════════════════════════════
// acc-chart-scope.js — Sync ผังบัญชีระหว่างโรงงาน (copy + sync · 2026-09-26)
//
// requirement (MCJY):
//   - ตั้งที่ Global Config (Accounting) ช่อง ACC_CHART_FACTORY → dropdown เลือกโรงงานที่จะ sync ด้วย (NONE = ไม่ sync)
//   - เลือกแล้ว → copy ผังบัญชีของโรงนั้นมาที่โรงนี้ (รหัสต้องเหมือนกัน)
//   - หลังจากนั้น เพิ่ม/แก้/ลบ/นำเข้าชื่อหลายภาษา ที่โรงไหนก็ได้ → ทำซ้ำให้ทุกโรงในกลุ่ม sync (จับคู่ด้วย code)
//   - เลิก sync (เลือก NONE) → ข้อมูลที่เคย sync มาอยู่ครบ ไม่ลบออก
//   - แต่ละโรงยังมีผังของตัวเอง (_id ของตัวเอง) → รายการบัญชีเดิมที่อ้าง chartAccID ไม่กระทบ
//
// กลุ่ม sync = โรงที่เชื่อมกันผ่าน config (ใครชี้ใครก็ได้ · นับต่อกันเป็นกลุ่มเดียว)
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

const Gsconfig = require('../../models/m-gsconfig');
const Factory  = require('../../models/m-factory');
const AccChart = require('../../models/m-acc-chart');

const KEY  = 'ACC_CHART_FACTORY';
const NONE = 'NONE';
const TTL_MS = 30 * 1000;
let _cache = { at: 0, companyID: '', edges: null };

const isNone = v => { const s = String(v || '').trim(); return !s || s.toUpperCase() === NONE; };

// ค่าที่เลือก (ตัวย่อ หรือ factoryID) → factoryID จริง · ไม่พบ = ''
async function resolveFactoryRef(companyID, ref) {
    if (isNone(ref)) return '';
    const v = String(ref).trim();
    const esc = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const or = [{ factoryID: v }, { 'fInfo.abbreviation': new RegExp('^\\s*' + esc + '\\s*$', 'i') }];
    let f = await Factory.findOne({ companyID, $or: or }, { factoryID: 1, _id: 0 }).lean();
    if (!f) f = await Factory.findOne({ $or: or }, { factoryID: 1, _id: 0 }).lean();
    return f?.factoryID || '';
}

// ตัวเลือก dropdown: NONE + โรงอื่นในบริษัท (ไม่รวม outsource/ตัวเอง) — แสดงเป็นตัวย่อ
async function factoryOptions(companyID, selfFactoryID) {
    const rows = await Factory.find({ companyID }, { factoryID: 1, 'fInfo.abbreviation': 1, 'fInfo.isOutsource': 1, _id: 0 }).lean();
    const opts = rows
        .filter(f => f.factoryID !== selfFactoryID && !f.fInfo?.isOutsource)
        .map(f => String(f.fInfo?.abbreviation || f.factoryID).trim())
        .filter(Boolean);
    return [NONE, ...new Set(opts)].join(',');
}

// เส้นเชื่อม sync ทั้งบริษัท (cache สั้นๆ)
async function edgesOf(companyID) {
    if (_cache.edges && _cache.companyID === companyID && Date.now() - _cache.at < TTL_MS) return _cache.edges;
    const rows = await Gsconfig.find({ companyID, key: KEY }, { factoryID: 1, value: 1, _id: 0 }).lean();
    const edges = [];
    for (const r of rows) {
        const t = await resolveFactoryRef(companyID, r.value);
        if (t && t !== r.factoryID) edges.push([r.factoryID, t]);
    }
    _cache = { at: Date.now(), companyID, edges };
    return edges;
}

// โรงอื่นในกลุ่ม sync เดียวกับโรงนี้ (ไม่รวมตัวเอง)
async function syncPeersOf(companyID, factoryID) {
    const edges = await edgesOf(companyID);
    const seen = new Set([factoryID]), queue = [factoryID];
    while (queue.length) {
        const f = queue.shift();
        for (const [a, b] of edges) {
            const n = a === f ? b : b === f ? a : null;
            if (n && !seen.has(n)) { seen.add(n); queue.push(n); }
        }
    }
    seen.delete(factoryID);
    return [...seen];
}

function clearChartScopeCache() { _cache = { at: 0, companyID: '', edges: null }; }

// ── copy ผังทั้งชุด from → to (upsert ตาม code · รหัสที่ปลายทางมีแต่ต้นทางไม่มี = inactive 'i' ไม่ลบ) ──
async function copyChart(companyID, fromF, toF, userID) {
    const src = await AccChart.find({ companyID, factoryID: fromF, status: 'a' }).lean();
    const codes = new Set(src.map(a => a.code));
    let upserted = 0;
    for (const a of src) {
        await AccChart.updateOne(
            { companyID, factoryID: toF, code: a.code },
            { $set: { nameI18n: a.nameI18n || {}, nameLang: a.nameLang || {}, level: a.level, category: a.category,
                      parentCode: a.parentCode ?? null, externalMappings: a.externalMappings || [], status: 'a' },
              $setOnInsert: { companyID, factoryID: toF, code: a.code, createdAt: new Date(), createBy: { userID: userID || '' } } },
            { upsert: true }
        );
        upserted++;
    }
    const extra = await AccChart.updateMany({ companyID, factoryID: toF, status: 'a', code: { $nin: [...codes] } }, { $set: { status: 'i' } });
    return { upserted, deactivated: extra.modifiedCount || 0 };
}

// ── ทำซ้ำการแก้ไขไปยังโรงอื่นในกลุ่ม (จับคู่ด้วย code) ──
async function syncCreate(companyID, factoryID, acc, userID) {
    for (const peer of await syncPeersOf(companyID, factoryID)) {
        await AccChart.updateOne(
            { companyID, factoryID: peer, code: acc.code },
            { $set: { nameI18n: acc.nameI18n || {}, level: acc.level, category: acc.category, parentCode: acc.parentCode ?? null, status: 'a' },
              $setOnInsert: { companyID, factoryID: peer, code: acc.code, nameLang: {}, externalMappings: [], createdAt: new Date(), createBy: { userID: userID || '' } } },
            { upsert: true }
        );
    }
}
async function syncUpdate(companyID, factoryID, oldCode, setData) {
    if (!Object.keys(setData).length) return;
    for (const peer of await syncPeersOf(companyID, factoryID)) {
        await AccChart.updateOne({ companyID, factoryID: peer, code: oldCode }, { $set: setData });   // แก้เหมือนโรงต้นทางทุกอย่าง
    }
}
async function syncDelete(companyID, factoryID, account) {
    for (const peer of await syncPeersOf(companyID, factoryID)) {
        await AccChart.updateOne({ companyID, factoryID: peer, code: account.code }, { $set: { status: 'i' } });
        if (account.level === 2)
            await AccChart.updateMany({ companyID, factoryID: peer, parentCode: account.code }, { $set: { status: 'i' } });
    }
}
async function syncLang(companyID, factoryID, code, setData) {
    for (const peer of await syncPeersOf(companyID, factoryID))
        await AccChart.updateOne({ companyID, factoryID: peer, code }, { $set: setData });
}

module.exports = {
    KEY, NONE, isNone, resolveFactoryRef, factoryOptions, syncPeersOf, clearChartScopeCache,
    copyChart, syncCreate, syncUpdate, syncDelete, syncLang,
};
