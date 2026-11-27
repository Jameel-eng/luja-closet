/* LuJa Closet — Lupita & Jamil's shared wardrobe.
   Everything is stored on-device in IndexedDB (photos included). */

import * as remote from './sync.js';
const APP_VERSION = '8';

/* ───────────────────────── constants ───────────────────────── */
const PEOPLE = {
  lupita: { name: 'Lupita', pron: 'her' },
  jamil: { name: 'Jamil', pron: 'his' },
};
const CATS = {
  top:    { label: 'Top',       plural: 'Tops' },
  bottom: { label: 'Bottom',    plural: 'Bottoms' },
  dress:  { label: 'Dress',     plural: 'Dresses' },
  outer:  { label: 'Outerwear', plural: 'Outerwear' },
  shoes:  { label: 'Shoes',     plural: 'Shoes' },
  acc:    { label: 'Accessory', plural: 'Accessories' },
};
const CATS_FOR = {
  lupita: ['top', 'bottom', 'dress', 'outer', 'shoes', 'acc'],
  jamil:  ['top', 'bottom', 'outer', 'shoes', 'acc'],
};
const OCC = {
  home:    { label: 'Home',           short: 'Home',   icon: 'home',  desc: 'Cozy, easy, lounge' },
  outside: { label: 'Normal outside', short: 'Out',    icon: 'sun',   desc: 'Errands, cafés, walks' },
  formal:  { label: 'Formal hangout', short: 'Formal', icon: 'spark', desc: 'Dinners, events, dates' },
};
const SWATCHES = [
  ['Black', '#1c1c1e'], ['Charcoal', '#3b3b3f'], ['Grey', '#8e8e93'], ['White', '#f6f5f1'],
  ['Cream', '#efe6d2'], ['Beige', '#d8c3a5'], ['Khaki', '#bfae86'], ['Camel', '#b98b5a'],
  ['Brown', '#6b4a2f'], ['Navy', '#1f2a44'], ['Denim', '#4a6a8f'], ['Light blue', '#a9c6e3'],
  ['Blue', '#2f5fb3'], ['Teal', '#2a7f7f'], ['Green', '#3f7d4e'], ['Olive', '#6b6b3a'],
  ['Mint', '#a8d5ba'], ['Yellow', '#e9c46a'], ['Orange', '#e07a3f'], ['Red', '#b3261e'],
  ['Burgundy', '#6d1f2b'], ['Pink', '#e8a3b5'], ['Blush', '#f1cfc8'], ['Lavender', '#c3b1e1'],
  ['Purple', '#6a4c93'],
];
const WHY = {
  neutral: 'Timeless neutral pairing',
  earthy: 'Warm, earthy harmony',
  anchor: 'A neutral anchors the color',
  tonal: 'Tonal — same color family',
  analogous: 'Analogous — neighbouring hues',
  complementary: 'Complementary contrast',
  triadic: 'Bold triadic mix',
  pastel: 'Soft pastel pairing',
  clash: 'These two colors clash',
};

/* ───────────────────────── icons ───────────────────────── */
const ICONS = {
  hanger: '<path d="M12 7.5a2 2 0 1 1 2-2"/><path d="M12 7.5v1.2L3.4 15a1.5 1.5 0 0 0 .9 2.7h15.4a1.5 1.5 0 0 0 .9-2.7L12 8.7"/>',
  hearts: '<path d="M8.5 19.5S3 16 3 11.6A3.1 3.1 0 0 1 8.5 9.7 3.1 3.1 0 0 1 14 11.6"/><path d="M15.5 20.5s5.5-3.5 5.5-7.9a3.1 3.1 0 0 0-5.5-1.9 3.1 3.1 0 0 0-5.5 1.9c0 4.4 5.5 7.9 5.5 7.9z"/>',
  camera: '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  unlock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.7-1.5"/>',
  shuffle: '<path d="M16 4h4v4"/><path d="M4 20 20 4"/><path d="M20 16v4h-4"/><path d="M15 15l5 5"/><path d="M4 4l5 5"/>',
  bookmark: '<path d="M6 4h12v16l-6-4-6 4z"/>',
  trash: '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4h6v3"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  home: '<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
  wand: '<path d="M15 4V2M15 10V8M12 6h-2M20 6h-2M18 9l1.5 1.5M18 3l1.5-1.5M12 3 10.5 1.5"/><path d="M3 21 14 10"/>',
  download: '<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>',
  upload: '<path d="M12 20V9"/><path d="M7 14l5-5 5 5"/><path d="M5 4h14"/>',
  check: '<path d="M5 12.5 10 17 19 7"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.8 3.3-5.6 3.8-9.8 2.8 1.8 4.2 4.4 4.2 6.4 1-.6 1.7-1.8 1.9-3 1.6 1.6 3.1 3.8 3.1 6.4 0 3.6-2.6 6.2-6.5 6.2z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5"/><path d="M5 12h11"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8 20h8M10 17h4"/>',
  crown: '<path d="M4 8l4 4 4-7 4 7 4-4-2 11H6z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ───────────────────────── tiny helpers ───────────────────────── */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const fmtDate = iso => new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const store = {
  get(k, d) { try { const v = localStorage.getItem('luja:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('luja:' + k, JSON.stringify(v)); } catch {} },
};

/* run a cloud write; on failure tell the user and return false */
async function cloud(fn) {
  if (!remote.enabled) return true;
  try { const r = await fn(); return r === undefined ? true : r; }
  catch (e) {
    console.error(e);
    toast(navigator.onLine ? `Couldn't save to the cloud — try again` : `You're offline — connect to save`);
    return false;
  }
}

/* ───────────────────────── IndexedDB ───────────────────────── */
let db;
function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('luja-closet', 4);
    r.onupgradeneeded = () => {
      const d = r.result;
      for (const s of ['items', 'looks', 'daily', 'accounts', 'meta', 'stars', 'challenges']) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: 'id' });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
const P = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const os = (s, m = 'readonly') => db.transaction(s, m).objectStore(s);
const dbAll = s => P(os(s).getAll());
const dbPut = (s, v) => P(os(s, 'readwrite').put(v));
const dbDel = (s, id) => P(os(s, 'readwrite').delete(id));

/* ───────────────────────── accounts ─────────────────────────
   Two accounts. Passwords are stored only as SHA-256 hashes. */
const DEFAULT_ACCOUNTS = [
  { id: 'jojo', username: 'JoJo', owner: 'jamil', admin: true, hash: '407f1bff3a166712d7511720cdf6e3537e55a59ce84e7c357a1317f3551f9311' },
  { id: 'lulu', username: 'LuLu', owner: 'lupita', admin: false, hash: '8c4608f71285c76f9e7c52b201a91e528314913dbcf63327e0aadd530a1d20a1' },
];
async function hashPw(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('luja:' + pw));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
const accountFor = owner => S.accounts.find(a => a.owner === owner);
const canEdit = owner => !!S.me && S.me.owner === owner;
const otherOwner = o => (o === 'jamil' ? 'lupita' : 'jamil');
/* who posted a diary entry (older entries fall back to who is in the photo) */
const dailyBy = d => d.by || (d.who === 'jamil' ? 'jojo' : d.who === 'lupita' ? 'lulu' : null);
const posterOf = d => S.accounts.find(a => a.id === dailyBy(d));
const canEditDaily = d => { const b = dailyBy(d); return !b || b === S.me?.id; };

/* object-URL cache for blobs */
const urls = new Map();
function url(rec) {
  if (!rec || !rec.img) return '';
  const hit = urls.get(rec.id);
  if (hit && hit.blob === rec.img) return hit.url;
  if (hit) URL.revokeObjectURL(hit.url);
  const u = URL.createObjectURL(rec.img);
  urls.set(rec.id, { blob: rec.img, url: u });
  return u;
}

/* ───────────────────────── color science ───────────────────────── */
function hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}
function colorName(hex) {
  const [r, g, b] = hexToRgb(hex);
  let best = SWATCHES[0][0], bd = Infinity;
  for (const [n, h] of SWATCHES) {
    const [R, G, B] = hexToRgb(h);
    const rm = (r + R) / 2;
    const d = (2 + rm / 256) * (r - R) ** 2 + 4 * (g - G) ** 2 + (2 + (255 - rm) / 256) * (b - B) ** 2;
    if (d < bd) { bd = d; best = n; }
  }
  return best;
}
const cinfoCache = new Map();
function ci(hex) {
  hex = (hex || '#888888').toLowerCase();
  if (cinfoCache.has(hex)) return cinfoCache.get(hex);
  const { h, s, l } = rgbToHsl(...hexToRgb(hex));
  let kind = 'color';
  if (s < 0.15 || l < 0.12 || l > 0.94) kind = 'neutral';
  else if (h >= 18 && h <= 52 && s < 0.55 && l > 0.15 && l < 0.9) kind = 'earth';       // beige, camel, khaki, brown, cream
  else if (h >= 195 && h <= 240 && (l < 0.3 || s < 0.45)) kind = 'earth';                // navy, denim act as soft neutrals
  const o = { hex, h, s, l, kind, name: colorName(hex) };
  cinfoCache.set(hex, o);
  return o;
}
const isStatement = c => c.kind === 'color' && c.s > 0.42 && c.l > 0.18 && c.l < 0.85;
const hueDist = (a, b) => { const d = Math.abs(a.h - b.h); return Math.min(d, 360 - d); };

/* How well two colors work together → { s: 0..1, why } */
function pair(a, b) {
  if (a.kind === 'neutral' && b.kind === 'neutral') return { s: Math.abs(a.l - b.l) < 0.07 && a.l > 0.2 && a.l < 0.8 ? 0.8 : 0.93, why: 'neutral' };
  if (a.kind !== 'color' && b.kind !== 'color') {
    // two soft neutrals: navy+beige great, but brown+black slightly weaker
    const dark = a.l < 0.2 && b.l < 0.32 || b.l < 0.2 && a.l < 0.32;
    return { s: dark ? 0.74 : 0.88, why: a.kind === 'earth' && b.kind === 'earth' ? 'earthy' : 'neutral' };
  }
  if (a.kind !== 'color' || b.kind !== 'color') return { s: a.kind === 'neutral' || b.kind === 'neutral' ? 0.9 : 0.84, why: 'anchor' };
  const d = hueDist(a, b);
  const loud = c => c.s > 0.6 && c.l > 0.3 && c.l < 0.72;
  const bothLoud = loud(a) && loud(b);
  let r;
  if (d <= 18) r = { s: Math.abs(a.l - b.l) > 0.15 ? 0.86 : 0.74, why: 'tonal' };
  else if (d <= 45) r = { s: 0.78, why: 'analogous' };
  else if (d >= 150) r = { s: bothLoud ? 0.62 : 0.77, why: 'complementary' };
  else if (d >= 105 && d <= 135) r = { s: bothLoud ? 0.45 : 0.6, why: 'triadic' };
  else r = { s: bothLoud ? 0.18 : 0.36, why: 'clash' };
  if (a.l > 0.72 && b.l > 0.72 && r.s < 0.7) r = { s: 0.7, why: 'pastel' };
  return r;
}

/* Score a whole outfit → { score, notes, palette } */
function scoreOutfit(ps) {
  let tot = 0, w = 0, core = null, coreNames = null;
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
    const a = ps[i], b = ps[j];
    const r = pair(ci(a.color), ci(b.color));
    const k = [a.cat, b.cat].sort().join('-');
    let wt = 1;
    if (k === 'bottom-top') { wt = 2.4; core = r; coreNames = [a, b]; }
    else if (a.cat === 'acc' || b.cat === 'acc') wt = 0.5;
    else if (a.cat === 'shoes' || b.cat === 'shoes') wt = 0.8;
    else if (k.includes('outer')) wt = 1.4;
    if (!core && (a.cat === 'dress' || b.cat === 'dress') && a.cat !== 'acc' && b.cat !== 'acc') { core = r; coreNames = [a, b]; }
    tot += r.s * wt; w += wt;
  }
  let score = w ? tot / w : 0.82;
  const notes = [];
  if (core) notes.push({ good: core.why !== 'clash', t: `${ci(coreNames[0].color).name} + ${ci(coreNames[1].color).name}: ${WHY[core.why].toLowerCase()}` });

  const stm = ps.filter(p => p.cat !== 'acc' && isStatement(ci(p.color))).length;
  if (stm > 2) { score -= 0.1 * (stm - 2); notes.push({ good: false, t: `${stm} bold colors — a little loud` }); }
  else if (stm === 1) { score += 0.03; notes.push({ good: true, t: 'One statement color, perfectly balanced' }); }
  else if (stm === 0 && ps.every(p => ci(p.color).kind !== 'color')) { score += 0.02; notes.push({ good: true, t: 'Clean, all-neutral palette' }); }

  const pat = ps.filter(p => p.pattern === 'pattern').length;
  if (pat > 1) { score -= 0.16 * (pat - 1); notes.push({ good: false, t: 'Two patterns compete — risky' }); }
  else if (pat === 1) notes.push({ good: true, t: 'One pattern, everything else plain' });

  const top = ps.find(p => p.cat === 'top'), bot = ps.find(p => p.cat === 'bottom');
  if (top && bot && Math.abs(ci(top.color).l - ci(bot.color).l) > 0.25) { score += 0.04; notes.push({ good: true, t: 'Nice light/dark contrast top to bottom' }); }
  const sh = ps.find(p => p.cat === 'shoes');
  if (sh && ci(sh.color).kind !== 'color') { score += 0.02; notes.push({ good: true, t: 'Neutral shoes ground the look' }); }

  return { score: clamp(score, 0, 0.99), notes, palette: [...new Set(ps.map(p => p.color))] };
}

/* ───────────────────────── outfit engine ───────────────────────── */
function generate(owner, occ, locks = {}) {
  const mine = S.items.filter(i => i.owner === owner);
  const pool = mine.filter(i => i.occ.includes(occ));
  const get = id => mine.find(i => i.id === id);
  const by = c => (locks[c] && get(locks[c])) ? [get(locks[c])] : pool.filter(i => i.cat === c);

  let tops = by('top'), bottoms = by('bottom'), dresses = by('dress');
  if (locks.dress && get(locks.dress)) { tops = []; bottoms = []; }
  else if ((locks.top && get(locks.top)) || (locks.bottom && get(locks.bottom))) dresses = [];

  let bases = [];
  for (const t of tops) for (const b of bottoms) bases.push([t, b]);
  for (const d of dresses) bases.push([d]);
  if (!bases.length) {
    const who = PEOPLE[owner].name;
    const need = owner === 'lupita' ? 'at least one top + one bottom (or a dress)' : 'at least one top and one bottom';
    return { list: [], error: `${who} needs ${need} tagged “${OCC[occ].label}”.` };
  }
  if (bases.length > 700) bases = bases.sort(() => Math.random() - 0.5).slice(0, 700);

  const shoes = by('shoes'), outers = by('outer'), accs = by('acc');
  const best = (base, cands) => {
    let pick = null, ps = -1;
    for (const c of cands) { const s = scoreOutfit([...base, c]).score; if (s > ps) { ps = s; pick = c; } }
    return [pick, ps];
  };
  const list = bases.map(base => {
    let cur = base, cs = scoreOutfit(base).score;
    if (shoes.length) { const [p, s] = best(cur, shoes); cur = [...cur, p]; cs = s; }
    if (outers.length && (locks.outer || occ !== 'home')) {
      const [p, s] = best(cur, outers);
      if (locks.outer || s >= cs - 0.035) { cur = [...cur, p]; cs = s; }
    }
    if (accs.length) {
      const [p, s] = best(cur, accs);
      if (locks.acc || s >= cs - 0.03) { cur = [...cur, p]; cs = s; }
    }
    const r = scoreOutfit(cur);
    return { pieces: cur, ...r, rank: r.score + (Math.random() - 0.5) * 0.06 };
  });
  list.sort((a, b) => b.rank - a.rank);
  // diversify: avoid repeating the same top/dress back-to-back
  const out = [], rest = [...list];
  while (rest.length && out.length < 60) {
    const recent = out.slice(-3).map(o => o.pieces[0].id);
    let i = rest.findIndex(o => !recent.includes(o.pieces[0].id));
    if (i < 0 || (rest[i].score < rest[0].score - 0.12)) i = 0;
    out.push(rest.splice(i, 1)[0]);
  }
  return { list: out };
}

function sameFamily(a, b) {
  if (a.kind === 'color' && b.kind === 'color') return hueDist(a, b) < 22;
  if (a.kind !== 'color' && b.kind !== 'color') return a.name === b.name && !['Black', 'White'].includes(a.name);
  return false;
}
function coupleScore(L, J) {
  const core = o => o.pieces.filter(p => !['acc', 'shoes'].includes(p.cat));
  const lc = core(L), jc = core(J);
  let tot = 0, n = 0, shared = null, comp = false;
  for (const a of lc) for (const b of jc) {
    const A = ci(a.color), B = ci(b.color);
    tot += pair(A, B).s; n++;
    if (!shared && sameFamily(A, B)) shared = A;
    if (isStatement(A) && isStatement(B) && hueDist(A, B) >= 150) comp = true;
  }
  let cross = n ? tot / n : 0.8, style, note;
  const allNeutral = [...lc, ...jc].every(p => ci(p.color).kind !== 'color');
  if (shared) { cross += 0.08; style = 'Matching tones'; note = `You both wear ${shared.name.toLowerCase()} — a subtle couple signature`; }
  else if (comp) { cross += 0.04; style = 'Complementary duo'; note = 'Opposite colors that make each other pop'; }
  else if (allNeutral) { cross += 0.03; style = 'Neutral harmony'; note = 'Quiet, polished neutrals side by side'; }
  else { style = 'Coordinated'; note = 'Different outfits, same color story'; }
  cross = clamp(cross, 0, 0.99);
  return { score: clamp(0.3 * L.score + 0.3 * J.score + 0.4 * cross, 0, 0.99), style, note, sharedHex: shared?.hex };
}
function generateCouple(occ) {
  const L = generate('lupita', occ), J = generate('jamil', occ);
  if (L.error || J.error) return { list: [], error: [L.error, J.error].filter(Boolean).join(' ') };
  const ls = L.list.slice(0, 24), js = J.list.slice(0, 24), combos = [];
  for (const l of ls) for (const j of js) {
    const c = coupleScore(l, j);
    combos.push({ l, j, ...c, rank: c.score + (Math.random() - 0.5) * 0.05 });
  }
  combos.sort((a, b) => b.rank - a.rank);
  const out = [], rest = combos;
  while (rest.length && out.length < 40) {
    const recent = out.slice(-2).flatMap(o => [o.l.pieces[0].id, o.j.pieces[0].id]);
    let i = rest.findIndex(o => !recent.includes(o.l.pieces[0].id) && !recent.includes(o.j.pieces[0].id));
    if (i < 0 || rest[i].score < rest[0].score - 0.1) i = 0;
    out.push(rest.splice(i, 1)[0]);
  }
  return { list: out };
}

/* ───────────────────────── images ───────────────────────── */
async function loadBitmap(file) {
  try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch {
    const u = URL.createObjectURL(file);
    const img = new Image(); img.src = u;
    await img.decode(); URL.revokeObjectURL(u);
    return img;
  }
}
async function processImage(file, max = 1100) {
  const bmp = await loadBitmap(file);
  const w0 = bmp.width, h0 = bmp.height, k = Math.min(1, max / Math.max(w0, h0));
  const c = document.createElement('canvas');
  c.width = Math.round(w0 * k); c.height = Math.round(h0 * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.84));
  return { blob, color: dominantColor(c) };
}
function dominantColor(src) {
  const W = 48, H = 60, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(src, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, buckets = new Map();
  for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) {
    const p = (y * W + i) * 4, r = d[p], g = d[p + 1], b = d[p + 2];
    const dx = (i / W - 0.5) / 0.26, dy = (y / H - 0.5) / 0.3;
    const wt = Math.exp(-(dx * dx + dy * dy) / 2);
    const key = (r >> 4) << 8 | (g >> 4) << 4 | (b >> 4);
    const e = buckets.get(key) || { w: 0, r: 0, g: 0, b: 0 };
    e.w += wt; e.r += r * wt; e.g += g * wt; e.b += b * wt;
    buckets.set(key, e);
  }
  // merge each bucket with its neighbours so gradients/shadows of one fabric add up
  const arr = [...buckets.entries()];
  let best = null, bw = -1;
  for (const [k, e] of arr) {
    const R = k >> 8, G = (k >> 4) & 15, B = k & 15;
    let w = 0, r = 0, g = 0, b = 0;
    for (const [k2, e2] of arr) {
      if (Math.abs((k2 >> 8) - R) <= 1 && Math.abs(((k2 >> 4) & 15) - G) <= 1 && Math.abs((k2 & 15) - B) <= 1) { w += e2.w; r += e2.r; g += e2.g; b += e2.b; }
    }
    if (w > bw) { bw = w; best = [r / w, g / w, b / w]; }
  }
  return best ? rgbToHex(...best) : '#888888';
}
const blobToDataURL = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
const dataURLToBlob = async d => (await fetch(d)).blob();

/* ───────────────────────── state ───────────────────────── */
const S = {
  view: store.get('view', 'lupita'),
  sub: store.get('sub', { lupita: 'closet', jamil: 'closet' }),
  filter: { lupita: { occ: 'all', cat: 'all' }, jamil: { occ: 'all', cat: 'all' } },
  style: {
    lupita: { occ: 'outside', locks: {}, list: [], idx: 0, error: '', stripCat: 'top' },
    jamil:  { occ: 'outside', locks: {}, list: [], idx: 0, error: '', stripCat: 'top' },
  },
  couple: { occ: 'outside', list: [], idx: 0, error: '' },
  items: [], looks: [], daily: [], accounts: [], stars: [], challenges: [], me: null,
};

/* ───────────────────────── rendering ───────────────────────── */
const app = $('#app');
function render(keepScroll = true) {
  const y = window.scrollY;
  if (!S.me) { document.body.dataset.view = 'login'; app.innerHTML = viewLogin(); setupLogin(); return; }
  document.body.dataset.view = S.view;
  document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('on', b.dataset.view === S.view));
  app.innerHTML = S.view === 'match' ? viewMatch() : S.view === 'daily' ? viewDaily() : S.view === 'stars' ? viewStars() : viewPerson(S.view);
  if (keepScroll) window.scrollTo(0, y);
}

function viewLogin() {
  return `<section class="login">
      <div class="login-card">
        <div class="login-mark">Lu<em>&amp;</em>Ja</div>
        <p class="login-sub">Our closet · sign in to continue</p>
        ${remote.enabled ? `<p class="cloud-chip">${icon('hearts')}Shared closet — both phones see everything</p>` : ''}
        <form id="login-form" autocomplete="on" novalidate>
          <label class="field"><span>Username</span><input id="lg-user" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>
          <label class="field"><span>Password</span>
            <span class="pw-wrap"><input id="lg-pass" name="password" type="password" autocomplete="current-password" required><button type="button" class="pw-eye" id="lg-eye" aria-label="Show password">${icon('eye')}</button></span>
          </label>
          <label class="remember"><input type="checkbox" id="lg-remember" checked><span class="tick">${icon('check')}</span><span><b>Remember this phone</b><small>Stay signed in — no password next time</small></span></label>
          <p class="login-err" id="lg-err" role="alert"></p>
          <button class="btn primary big" type="submit">${icon('arrow')}Enter our closet</button>
        </form>
      </div>
    </section>`;
}
function setupLogin() {
  const f = $('#login-form');
  $('#lg-eye').onclick = () => { const p = $('#lg-pass'); p.type = p.type === 'password' ? 'text' : 'password'; };
  f.onsubmit = async e => {
    e.preventDefault();
    const u = $('#lg-user').value.trim().toLowerCase(), pw = $('#lg-pass').value;
    const remember = $('#lg-remember').checked;
    const fail = msg => {
      $('#lg-err').textContent = msg;
      $('.login-card').classList.remove('shake'); void $('.login-card').offsetWidth; $('.login-card').classList.add('shake');
    };
    let acc;
    if (remote.enabled) {
      const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        const id = await remote.signIn(u, pw, remember);
        acc = S.accounts.find(a => a.id === id) || { ...DEFAULT_ACCOUNTS.find(a => a.id === id) };
      } catch (err) {
        btn.disabled = false;
        return fail(err.code === 'bad_login' ? 'Wrong username or password' : 'No connection — check your internet');
      }
      sessionInfo = { remember };
    } else {
      acc = S.accounts.find(a => a.username.toLowerCase() === u);
      if (!acc || acc.hash !== await hashPw(pw)) return fail('Wrong username or password');
      await saveSession(acc, remember);
    }
    S.me = acc;
    if (remote.enabled) startSync();
    S.view = acc.owner; persistNav();
    render(false);
    toast(`${icon('heart')} Welcome, ${esc(acc.username)}`);
  };
  setTimeout(() => $('#lg-user')?.focus(), 50);
}
/* ── session: "Remember this phone" keeps you signed in for a year.
   Saved in IndexedDB (durable, also survives iOS home-screen restarts) and
   localStorage as a fallback. A password change signs remembered phones out. */
const SESSION_DAYS = 365;
let sessionInfo = null;
async function saveSession(acc, remember) {
  const rec = { id: 'session', acc: acc.id, hash: acc.hash, remember, until: Date.now() + SESSION_DAYS * 864e5 };
  sessionInfo = rec;
  try { sessionStorage.setItem('luja:me', acc.id); } catch {}
  if (remember) { await dbPut('meta', rec).catch(() => {}); store.set('session', rec); }
  else { await dbDel('meta', 'session').catch(() => {}); store.set('session', null); }
}
async function restoreSession() {
  let rec = null;
  try { rec = await P(os('meta').get('session')); } catch {}
  rec = rec || store.get('session', null);
  if (rec && rec.remember && rec.until > Date.now()) {
    const acc = S.accounts.find(a => a.id === rec.acc);
    if (acc && acc.hash === rec.hash) { sessionInfo = rec; return saveSession(acc, true).then(() => acc); } // slide the year forward
  }
  // someone signed in with the previous version: remember them
  const legacy = S.accounts.find(a => a.id === store.get('me', null));
  if (legacy) { store.set('me', null); await saveSession(legacy, true); return legacy; }
  // not remembered: only keep the login while this tab/app session is open
  let id = null; try { id = sessionStorage.getItem('luja:me'); } catch {}
  const acc = S.accounts.find(a => a.id === id);
  if (acc) sessionInfo = { remember: false };
  return acc || null;
}
async function forgetSession() {
  sessionInfo = null;
  try { sessionStorage.removeItem('luja:me'); } catch {}
  store.set('session', null); store.set('me', null);
  await dbDel('meta', 'session').catch(() => {});
}
function signOut() {
  S.me = null; forgetSession();
  if (remote.enabled) { remote.signOut(); stopLive?.(); stopLive = null; }
  closeSheet(true); render(false);
}

function hero(kicker, title, sub, extra = '') {
  return `<section class="hero"><p class="kicker">${kicker}</p><h1>${title}</h1><p class="hero-sub">${sub}</p>${extra}</section>`;
}
const chip = (act, val, label, on, extra = '') => `<button class="chip ${on ? 'on' : ''}" data-act="${act}" data-val="${val}" ${extra}>${label}</button>`;

function viewPerson(p) {
  const items = S.items.filter(i => i.owner === p);
  const looks = S.looks.filter(l => l.type === 'solo' && l.owner === p);
  const sub = S.sub[p] || 'closet';
  const stats = `<div class="stats">
      <div><b>${items.length}</b><span>pieces</span></div>
      ${Object.keys(OCC).map(o => `<div><b>${items.filter(i => i.occ.includes(o)).length}</b><span>${OCC[o].short.toLowerCase()}</span></div>`).join('')}
      <div><b>${looks.length}</b><span>saved</span></div></div>`;
  const tabs = `<div class="seg" role="tablist">
      ${[['closet', 'Closet'], ['style', 'Style me'], ['saved', 'Saved looks']].map(([k, l]) => `<button role="tab" aria-selected="${sub === k}" class="${sub === k ? 'on' : ''}" data-act="sub" data-val="${k}">${l}</button>`).join('')}
    </div>`;
  const body = sub === 'style' ? viewStyle(p) : sub === 'saved' ? viewSaved(p, looks) : viewCloset(p, items);
  return hero(`${p === 'lupita' ? 'Her' : 'His'} wardrobe`, `${PEOPLE[p].name}<em>.</em>`, sub === 'style' ? 'Pick the occasion, lock a piece if you like, and let the closet do the rest.' : 'Every piece, photographed once, styled forever.', stats) + tabs + body;
}

function viewCloset(p, items) {
  const f = S.filter[p];
  const filtered = items.filter(i => (f.occ === 'all' || i.occ.includes(f.occ)) && (f.cat === 'all' || i.cat === f.cat));
  const filters = `<div class="filters">
      <div class="chips">${chip('f-occ', 'all', 'All occasions', f.occ === 'all')}${Object.entries(OCC).map(([k, o]) => chip('f-occ', k, icon(o.icon) + o.label, f.occ === k)).join('')}</div>
      <div class="chips">${chip('f-cat', 'all', 'Everything', f.cat === 'all')}${CATS_FOR[p].map(c => chip('f-cat', c, CATS[c].plural, f.cat === c)).join('')}</div>
    </div>`;
  let grid;
  const mine = canEdit(p);
  if (!items.length) {
    grid = mine ? `<div class="empty">
        <div class="empty-art">${icon('hanger')}</div>
        <h3>${PEOPLE[p].name}'s closet is empty</h3>
        <p>Snap a photo of each piece once — tops, bottoms${p === 'lupita' ? ', dresses' : ''}, shoes. The color is detected automatically. You can add many photos at once from your library.</p>
        <div class="row-btns"><button class="btn primary" data-act="add" data-src="camera">${icon('camera')}Take a photo</button><button class="btn" data-act="add" data-src="library">${icon('image')}From library</button></div>
      </div>` : `<div class="empty">
        <div class="empty-art">${icon('hanger')}</div>
        <h3>${PEOPLE[p].name}'s closet is empty</h3>
        <p>Only ${esc(accountFor(p)?.username || PEOPLE[p].name)} can add clothes here. Once they do, you can browse and style them.</p>
      </div>`;
  } else if (!filtered.length) {
    grid = `<div class="empty small"><p>Nothing here with these filters yet.</p></div>`;
  } else {
    const cats = f.cat === 'all' ? CATS_FOR[p] : [f.cat];
    grid = cats.map(c => {
      const list = filtered.filter(i => i.cat === c);
      if (!list.length) return '';
      return `<section class="cat-group"><h2>${CATS[c].plural}<span>${list.length}</span></h2><div class="grid">${list.map(itemCard).join('')}</div></section>`;
    }).join('');
  }
  const note = !mine && items.length ? `<p class="view-only">${icon('eye')}Viewing ${PEOPLE[p].name}'s closet — only ${esc(accountFor(p)?.username || PEOPLE[p].name)} can add, edit or delete here.</p>` : '';
  return note + filters + grid + (items.length && mine ? `<button class="fab" data-act="add-menu" aria-label="Add a piece">${icon('plus')}<span>Add piece</span></button>` : '');
}
function itemCard(it) {
  return `<button class="item" data-act="open-item" data-id="${it.id}">
      <span class="item-img"><img loading="lazy" src="${url(it)}" alt=""></span>
      <span class="item-meta"><i class="dot" style="--c:${it.color}"></i><span class="item-name">${esc(it.name)}</span></span>
      <span class="occ-tags">${it.occ.map(o => `<b class="o-${o}">${OCC[o].short}</b>`).join('')}${it.pattern === 'pattern' ? '<b class="o-pat">Pattern</b>' : ''}</span>
    </button>`;
}

function occCards(act, cur) {
  return `<div class="occ-cards">${Object.entries(OCC).map(([k, o]) => `
      <button class="occ-card ${cur === k ? 'on' : ''}" data-act="${act}" data-val="${k}">
        <span class="occ-ic">${icon(o.icon)}</span><b>${o.label}</b><small>${o.desc}</small>
      </button>`).join('')}</div>`;
}

function viewStyle(p) {
  const st = S.style[p];
  const mine = S.items.filter(i => i.owner === p);
  if (!mine.length) return `<div class="empty"><div class="empty-art">${icon('wand')}</div><h3>Add some clothes first</h3><p>Once ${PEOPLE[p].name}'s closet has a few tops and bottoms, outfits appear here.</p><button class="btn primary" data-act="sub" data-val="closet">Go to closet</button></div>`;
  const stripItems = mine.filter(i => i.cat === st.stripCat && i.occ.includes(st.occ));
  const lockedIds = Object.values(st.locks);
  const strip = `<div class="panel">
      <div class="panel-head"><h3>Start from a piece <small>optional</small></h3>${lockedIds.length ? `<button class="link" data-act="clear-locks">Clear ${lockedIds.length} locked</button>` : ''}</div>
      <div class="chips">${CATS_FOR[p].map(c => chip('strip-cat', c, CATS[c].plural + (st.locks[c] ? ' •' : ''), st.stripCat === c)).join('')}</div>
      <div class="strip">${stripItems.length ? stripItems.map(i => `
        <button class="strip-item ${lockedIds.includes(i.id) ? 'on' : ''}" data-act="lock-piece" data-id="${i.id}" aria-pressed="${lockedIds.includes(i.id)}">
          <img loading="lazy" src="${url(i)}" alt="${esc(i.name)}"><span>${lockedIds.includes(i.id) ? icon('lock') : ''}</span>
        </button>`).join('') : `<p class="muted">No ${CATS[st.stripCat].plural.toLowerCase()} tagged ${OCC[st.occ].label.toLowerCase()}.</p>`}</div>
    </div>`;
  const cur = st.list[st.idx];
  let stage;
  if (st.error) stage = `<div class="empty small warn"><p>${esc(st.error)}</p></div>`;
  else if (!cur) stage = `<button class="btn primary big" data-act="generate">${icon('wand')}Style ${PEOPLE[p].name} for ${OCC[st.occ].label.toLowerCase()}</button>`;
  else stage = outfitCard(cur, { locks: st.locks, lockable: true, idx: st.idx, total: st.list.length });
  return occCards('style-occ', st.occ) + strip + `<div class="stage">${stage}</div>`;
}

function ring(score) {
  const pct = Math.round(score * 100);
  const label = pct >= 88 ? 'Perfect' : pct >= 78 ? 'Great' : pct >= 65 ? 'Good' : 'Bold';
  return `<div class="ring" style="--p:${pct}"><div><b>${pct}</b><small>${label}</small></div></div>`;
}
function palette(hexes) { return `<div class="palette">${hexes.map(h => `<i style="--c:${h}" title="${ci(h).name}"></i>`).join('')}</div>`; }

function collage(pieces, { locks = {}, lockable = false, size = '' } = {}) {
  const order = ['outer', 'top', 'dress', 'bottom', 'shoes', 'acc'];
  const sorted = [...pieces].sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat));
  const main = sorted.filter(p => ['top', 'bottom', 'dress'].includes(p.cat));
  const side = sorted.filter(p => !['top', 'bottom', 'dress'].includes(p.cat));
  const tile = p => {
    const locked = locks[p.cat] === p.id;
    return `<figure class="tile ${locked ? 'locked' : ''} t-${p.cat}">
        <img src="${url(p)}" alt="${esc(p.name)}">
        <figcaption><i class="dot" style="--c:${p.color}"></i>${esc(p.name)}</figcaption>
        ${lockable ? `<button class="tile-lock" data-act="toggle-lock" data-cat="${p.cat}" data-id="${p.id}" aria-label="${locked ? 'Unlock' : 'Lock'} ${esc(p.name)}">${icon(locked ? 'lock' : 'unlock')}</button>` : ''}
      </figure>`;
  };
  return `<div class="collage ${size} ${side.length ? '' : 'solo'} ${main.length === 1 ? 'one-main' : ''}">
      <div class="c-main">${main.map(tile).join('')}</div>
      ${side.length ? `<div class="c-side">${side.map(tile).join('')}</div>` : ''}
    </div>`;
}

function outfitCard(o, { locks, lockable, idx, total }) {
  return `<article class="outfit">
      ${collage(o.pieces, { locks, lockable })}
      <div class="outfit-info">
        <div class="score-row">${ring(o.score)}<div><p class="kicker">Look ${idx + 1} of ${total}</p>${palette(o.palette)}</div></div>
        <ul class="notes">${o.notes.map(n => `<li class="${n.good ? 'good' : 'bad'}">${icon(n.good ? 'check' : 'close')}${esc(n.t)}</li>`).join('')}</ul>
        ${lockable ? '<p class="hint">Tap the lock on a piece to keep it while shuffling.</p>' : ''}
        <div class="row-btns">
          <button class="btn" data-act="prev" ${idx === 0 ? 'disabled' : ''} aria-label="Previous look">${icon('undo')}</button>
          <button class="btn primary grow" data-act="shuffle">${icon('shuffle')}Next look</button>
          <button class="btn" data-act="save-outfit">${icon('bookmark')}Save</button>
        </div>
      </div>
    </article>`;
}

function lookPieces(ids) { return (ids || []).map(id => S.items.find(i => i.id === id)).filter(Boolean); }
function miniCollage(pieces) {
  const show = pieces.filter(p => p.cat !== 'acc').slice(0, 4);
  return `<span class="mini m${show.length}">${show.map(p => `<img loading="lazy" src="${url(p)}" alt="">`).join('')}</span>`;
}
function viewSaved(p, looks) {
  if (!looks.length) return `<div class="empty"><div class="empty-art">${icon('bookmark')}</div><h3>No saved looks yet</h3><p>Hit “Save” on an outfit you love in Style me and it lands here.</p><button class="btn primary" data-act="sub" data-val="style">Style me</button></div>`;
  return Object.keys(OCC).map(o => {
    const list = looks.filter(l => l.occ === o).sort((a, b) => b.created - a.created);
    if (!list.length) return '';
    return `<section class="cat-group"><h2>${OCC[o].label}<span>${list.length}</span></h2><div class="grid looks">${list.map(l => `
        <button class="look" data-act="open-look" data-id="${l.id}">${miniCollage(lookPieces(l.ids))}<span class="look-meta"><b>${Math.round(l.score * 100)}%</b>${palette(lookPieces(l.ids).map(x => x.color))}</span></button>`).join('')}</div></section>`;
  }).join('');
}

function viewMatch() {
  const st = S.couple;
  const lc = S.items.filter(i => i.owner === 'lupita').length, jc = S.items.filter(i => i.owner === 'jamil').length;
  const saved = S.looks.filter(l => l.type === 'couple').sort((a, b) => b.created - a.created);
  let stage;
  if (!lc || !jc) stage = `<div class="empty"><div class="empty-art">${icon('hearts')}</div><h3>Both closets need clothes</h3><p>Lupita has ${lc} piece${lc === 1 ? '' : 's'}, Jamil has ${jc}. Add a few tops and bottoms to each closet and couple looks unlock.</p></div>`;
  else if (st.error) stage = `<div class="empty small warn"><p>${esc(st.error)}</p></div>`;
  else if (!st.list.length) stage = `<button class="btn primary big" data-act="couple-gen">${icon('hearts')}Create our ${OCC[st.occ].label.toLowerCase()} look</button>`;
  else {
    const c = st.list[st.idx];
    stage = `<article class="couple">
        <div class="duo">
          <div class="duo-col"><p class="who w-lupita">Lupita</p>${collage(c.l.pieces, { size: 'sm' })}</div>
          <div class="duo-badge">${ring(c.score)}<b>${c.style}</b>${c.sharedHex ? `<i class="dot big" style="--c:${c.sharedHex}"></i>` : ''}</div>
          <div class="duo-col"><p class="who w-jamil">Jamil</p>${collage(c.j.pieces, { size: 'sm' })}</div>
        </div>
        <div class="outfit-info">
          <p class="couple-note">${icon('heart')}${esc(c.note)}</p>
          <div class="duo-notes">
            <div><p class="kicker">Lupita · ${Math.round(c.l.score * 100)}%</p>${palette(c.l.palette)}</div>
            <div><p class="kicker">Jamil · ${Math.round(c.j.score * 100)}%</p>${palette(c.j.palette)}</div>
          </div>
          <div class="row-btns">
            <button class="btn" data-act="couple-prev" ${st.idx === 0 ? 'disabled' : ''} aria-label="Previous look">${icon('undo')}</button>
            <button class="btn primary grow" data-act="couple-next">${icon('shuffle')}Next couple look</button>
            <button class="btn" data-act="couple-save">${icon('bookmark')}Save</button>
          </div>
        </div>
      </article>`;
  }
  const savedHtml = saved.length ? `<section class="cat-group"><h2>Saved couple looks<span>${saved.length}</span></h2><div class="grid looks wide">${saved.map(l => `
      <button class="look couple-look" data-act="open-look" data-id="${l.id}">
        <span class="pair">${miniCollage(lookPieces(l.ids))}${miniCollage(lookPieces(l.jids))}</span>
        <span class="look-meta"><b>${Math.round(l.score * 100)}%</b><small>${esc(l.style)} · ${OCC[l.occ].short}</small></span>
      </button>`).join('')}</div></section>` : '';
  return hero('Together', `Matching<em>.</em>`, 'Two closets, one color story. Outfits for both of you that look great side by side.') + occCards('couple-occ', st.occ) + `<div class="stage">${stage}</div>` + savedHtml;
}

function streak() {
  const days = new Set(S.daily.map(d => d.date));
  let n = 0; const d = new Date();
  const iso = x => { const y = new Date(x); y.setMinutes(y.getMinutes() - y.getTimezoneOffset()); return y.toISOString().slice(0, 10); };
  if (!days.has(iso(d))) d.setDate(d.getDate() - 1);
  while (days.has(iso(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function viewDaily() {
  const t = todayISO();
  const today = S.daily.filter(d => d.date === t);
  const sorted = [...S.daily].sort((a, b) => b.date.localeCompare(a.date) || b.created - a.created);
  const months = new Map();
  for (const d of sorted) {
    const k = d.date.slice(0, 7);
    if (!months.has(k)) months.set(k, []);
    months.get(k).push(d);
  }
  const st = streak();
  const capture = `<section class="capture">
      <div class="capture-txt">
        <p class="kicker">${fmtDate(t)}</p>
        <h3>${today.length ? 'Today is captured ✦' : 'What are you wearing today?'}</h3>
        <p class="muted">${today.length ? 'Add another — one for each of you, or a couple shot.' : 'Post your look — then rate each other’s outfits.'}</p>
        <div class="row-btns"><button class="btn primary" data-act="daily-add" data-src="camera">${icon('camera')}Capture</button><button class="btn" data-act="daily-add" data-src="library">${icon('image')}Upload</button></div>
      </div>
      <div class="capture-stats">
        <div><b>${st}</b><span>${icon('flame')}day streak</span></div>
        <div><b>${S.daily.length}</b><span>photos</span></div>
      </div>
    </section>`;
  const timeline = sorted.length ? [...months.entries()].map(([k, list]) => `
      <section class="cat-group"><h2>${new Date(k + '-15T12:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}<span>${list.length}</span></h2>
      <div class="grid diary">${list.map(d => `
        <button class="diary-item" data-act="open-daily" data-id="${d.id}">
          <img loading="lazy" src="${url(d)}" alt="">
          <span class="diary-meta"><b>${new Date(d.date + 'T12:00:00').getDate()}</b><small>${new Date(d.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' })}</small></span>
          ${(() => { const a = posterOf(d); return a ? `<span class="who-tag w-${a.owner}">${esc(a.username)}</span>` : ''; })()}
          ${(() => { const r = ratingFor(d); return r ? `<span class="rate-tag">${icon('star')}${r.n}</span>` : (!canEditDaily(d) ? '<span class="rate-tag todo">Rate</span>' : ''); })()}
        </button>`).join('')}</div></section>`).join('')
    : `<div class="empty small"><p>Your diary starts with the first photo.</p></div>`;
  return hero('Outfit diary', `Daily<em>.</em>`, 'A little archive of what you both wore — and when.') + capture + timeline;
}

/* ───────────────────────── sheets & toast ───────────────────────── */
function openSheet(html, { onClose, cls = '' } = {}) {
  closeSheet(true);
  const root = $('#sheet-root');
  root.innerHTML = `<div class="sheet-backdrop" data-act="close-sheet"></div><div class="sheet ${cls}" role="dialog" aria-modal="true"><button class="sheet-x icon-btn" data-act="close-sheet" aria-label="Close">${icon('close')}</button><div class="sheet-body">${html}</div></div>`;
  root._onClose = onClose;
  document.body.classList.add('sheet-open');
  requestAnimationFrame(() => root.classList.add('open'));
  return $('.sheet-body', root);
}
function closeSheet(instant = false) {
  const root = $('#sheet-root');
  if (!root.innerHTML) return;
  const cb = root._onClose; root._onClose = null;
  root.classList.remove('open');
  document.body.classList.remove('sheet-open');
  const done = () => { if (!root.classList.contains('open')) root.innerHTML = ''; };
  instant ? done() : setTimeout(done, 280);
  cb && cb();
}
let toastT;
function toast(msg) {
  const t = $('#toast');
  t.innerHTML = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
}
function confirmSheet(title, text, okLabel = 'Delete') {
  return new Promise(res => {
    let answered = false;
    openSheet(`<div class="confirm"><h3>${title}</h3><p class="muted">${text}</p><div class="row-btns"><button class="btn grow" data-act="close-sheet">Cancel</button><button class="btn danger grow" id="cf-ok">${okLabel}</button></div></div>`,
      { onClose: () => { if (!answered) res(false); } });
    $('#cf-ok').onclick = () => { answered = true; closeSheet(); res(true); };
  });
}

/* ───────────────────────── item editor ───────────────────────── */
let queue = [];  // pending photo files when adding several
let lastDraft = { cat: 'top', occ: ['outside'], pattern: 'solid' };

async function startAdd(files) {
  queue = [...files];
  if (!queue.length) return;
  await nextInQueue();
}
async function nextInQueue() {
  const f = queue.shift();
  if (!f) return;
  toast('Reading photo…');
  try {
    const { blob, color } = await processImage(f);
    const p = S.view === 'jamil' ? 'jamil' : 'lupita';
    let cat = lastDraft.cat;
    if (!CATS_FOR[p].includes(cat)) cat = 'top';
    editItem({ id: null, owner: p, img: blob, color, detected: color, cat, occ: [...lastDraft.occ], pattern: lastDraft.pattern, name: '' });
  } catch (e) {
    console.error(e); toast('Could not read that photo');
    nextInQueue();
  }
}

function editItem(it) {
  const d = { ...it, occ: [...it.occ] };
  const isNew = !it.id;
  const remaining = queue.length;
  const tmpUrl = URL.createObjectURL(d.img);
  const html = `
    <div class="editor">
      <div class="ed-photo"><img id="ed-img" src="${tmpUrl}" alt=""><button class="btn sm glass" id="ed-replace">${icon('camera')}Change</button></div>
      <div class="ed-form">
        <p class="kicker">${isNew ? `New piece for ${PEOPLE[d.owner].name}${remaining ? ` · ${remaining} more after this` : ''}` : PEOPLE[d.owner].name + "'s piece"}</p>
        <label class="field"><span>Name</span><input id="ed-name" maxlength="40" placeholder="e.g. White linen shirt" value="${esc(d.name)}"></label>
        <div class="field"><span>Type</span><div class="chips wrap" id="ed-cat">${CATS_FOR[d.owner].map(c => chip('ed-cat', c, CATS[c].label, d.cat === c)).join('')}</div></div>
        <div class="field"><span>Wear it for <small>(pick all that fit)</small></span><div class="chips wrap" id="ed-occ">${Object.entries(OCC).map(([k, o]) => chip('ed-occ', k, icon(o.icon) + o.label, d.occ.includes(k))).join('')}</div></div>
        <div class="field"><span>Main color <small id="ed-cname">${ci(d.color).name}</small></span>
          <div class="swatches" id="ed-sw">
            ${d.detected ? `<button class="sw detected" data-act="ed-color" data-val="${d.detected}" style="--c:${d.detected}" title="Detected from photo"><small>auto</small></button>` : ''}
            ${SWATCHES.map(([n, h]) => `<button class="sw" data-act="ed-color" data-val="${h}" style="--c:${h}" title="${n}" aria-label="${n}"></button>`).join('')}
            <label class="sw custom" title="Custom color"><input type="color" id="ed-custom" value="${d.color}"><span>+</span></label>
          </div>
        </div>
        <div class="field"><span>Look</span><div class="seg small" id="ed-pat">${[['solid', 'Solid'], ['pattern', 'Pattern / print']].map(([k, l]) => `<button class="${d.pattern === k ? 'on' : ''}" data-act="ed-pat" data-val="${k}">${l}</button>`).join('')}</div></div>
        <div class="row-btns sticky">
          ${isNew ? (remaining ? '<button class="btn" data-act="ed-skip">Skip</button>' : '') : `<button class="btn danger" data-act="ed-delete" aria-label="Delete">${icon('trash')}</button><button class="btn" data-act="ed-style">${icon('wand')}Style it</button>`}
          <button class="btn primary grow" data-act="ed-save">${icon('check')}${isNew && remaining ? 'Save & next' : 'Save'}</button>
        </div>
      </div>
    </div>`;
  const body = openSheet(html, { cls: 'wide', onClose: () => URL.revokeObjectURL(tmpUrl) });
  const markColor = () => {
    body.querySelectorAll('.sw[data-val]').forEach(b => b.classList.toggle('on', b.dataset.val.toLowerCase() === d.color.toLowerCase()));
    $('#ed-cname', body).textContent = ci(d.color).name;
    $('#ed-custom', body).value = d.color;
  };
  markColor();
  $('#ed-custom', body).addEventListener('input', e => { d.color = e.target.value; markColor(); });
  $('#ed-replace', body).onclick = () => {
    const inp = $('#pick-replace');
    inp.onchange = async () => {
      const f = inp.files[0]; inp.value = '';
      if (!f) return;
      const r = await processImage(f);
      d.img = r.blob; d.detected = r.color; d.color = r.color;
      $('#ed-img', body).src = URL.createObjectURL(r.blob);
      const det = $('.sw.detected', body);
      if (det) { det.dataset.val = r.color; det.style.setProperty('--c', r.color); }
      markColor();
    };
    inp.click();
  };
  sheetHandlers = {
    'ed-cat': el => { d.cat = el.dataset.val; body.querySelectorAll('#ed-cat .chip').forEach(b => b.classList.toggle('on', b === el)); },
    'ed-occ': el => {
      const k = el.dataset.val;
      d.occ = d.occ.includes(k) ? d.occ.filter(x => x !== k) : [...d.occ, k];
      el.classList.toggle('on', d.occ.includes(k));
    },
    'ed-color': el => { d.color = el.dataset.val; markColor(); },
    'ed-pat': el => { d.pattern = el.dataset.val; body.querySelectorAll('#ed-pat button').forEach(b => b.classList.toggle('on', b === el)); },
    'ed-skip': () => { closeSheet(); setTimeout(nextInQueue, 300); },
    'ed-save': async () => {
      if (!canEdit(d.owner)) { toast('You can only edit your own closet'); return; }
      if (!d.occ.length) { toast('Pick at least one occasion'); return; }
      const name = $('#ed-name', body).value.trim() || `${ci(d.color).name} ${CATS[d.cat].label.toLowerCase()}`;
      let rec = { id: d.id || uid(), owner: d.owner, cat: d.cat, name, color: d.color, pattern: d.pattern, occ: Object.keys(OCC).filter(k => d.occ.includes(k)), img: d.img, img_path: d.img_path, created: d.created || Date.now() };
      if (remote.enabled) {
        const btn = body.querySelector('[data-act=ed-save]'); btn.disabled = true;
        const saved = await cloud(() => remote.putItem(rec, d.img !== it.img));
        btn.disabled = false;
        if (!saved) return;
        rec = saved;
      }
      await dbPut('items', rec);
      const i = S.items.findIndex(x => x.id === rec.id);
      i >= 0 ? (S.items[i] = rec) : S.items.push(rec);
      lastDraft = { cat: rec.cat, occ: rec.occ, pattern: 'solid' };
      invalidate(rec.owner);
      closeSheet(); render();
      toast(`${icon('check')} Saved to ${PEOPLE[rec.owner].name}'s closet`);
      if (queue.length) setTimeout(nextInQueue, 320);
    },
    'ed-delete': async () => {
      if (!canEdit(d.owner)) return;
      if (!(await confirmSheet('Delete this piece?', `“${esc(d.name)}” will be removed from the closet and from any saved looks.`))) return;
      if (!(await cloud(() => remote.delItem(d)))) return;
      await dbDel('items', d.id);
      S.items = S.items.filter(x => x.id !== d.id);
      for (const st of Object.values(S.style)) for (const c in st.locks) if (st.locks[c] === d.id) delete st.locks[c];
      invalidate(d.owner); render(); toast('Piece deleted');
    },
    'ed-style': () => styleFrom(d),
  };
}
let sheetHandlers = {};

/* read-only view of the other person's piece */
function viewItem(it) {
  openSheet(`
    <div class="editor">
      <div class="ed-photo"><img src="${url(it)}" alt=""></div>
      <div class="ed-form">
        <p class="kicker">${PEOPLE[it.owner].name}'s piece · view only</p>
        <h3 class="item-title">${esc(it.name)}</h3>
        <div class="field"><span>Type</span><div class="chips wrap"><span class="chip on">${CATS[it.cat].label}</span></div></div>
        <div class="field"><span>Wear it for</span><div class="chips wrap">${it.occ.map(o => `<span class="chip">${icon(OCC[o].icon)}${OCC[o].label}</span>`).join('')}</div></div>
        <div class="field"><span>Color</span><div class="chips wrap"><span class="chip"><i class="dot" style="--c:${it.color}"></i>${ci(it.color).name}${it.pattern === 'pattern' ? ' · pattern' : ''}</span></div></div>
        <p class="muted tiny">Only ${esc(accountFor(it.owner)?.username || PEOPLE[it.owner].name)} can edit or delete this piece.</p>
        <div class="row-btns sticky"><button class="btn primary grow" data-act="ed-style">${icon('wand')}Style this piece</button></div>
      </div>
    </div>`, { cls: 'wide' });
  sheetHandlers = { 'ed-style': () => styleFrom(it) };
}
function styleFrom(d) {
  const st = S.style[d.owner];
  closeSheet();
  st.locks = { [d.cat]: d.id };
  if (!d.occ.includes(st.occ)) st.occ = d.occ[0];
  st.stripCat = d.cat;
  S.view = d.owner; S.sub[d.owner] = 'style';
  runGenerate(d.owner); render(false); window.scrollTo({ top: 0, behavior: 'smooth' });
}

function invalidate(owner) {
  if (owner) { const st = S.style[owner]; st.list = []; st.idx = 0; st.error = ''; }
  S.couple.list = []; S.couple.idx = 0; S.couple.error = '';
}

/* ───────────────────────── actions ───────────────────────── */
function runGenerate(p) {
  const st = S.style[p];
  const r = generate(p, st.occ, st.locks);
  st.list = r.list; st.idx = 0; st.error = r.error || '';
}

const persistNav = () => { store.set('view', S.view); store.set('sub', S.sub); };

const actions = {
  nav: el => { S.view = el.dataset.view; persistNav(); render(false); window.scrollTo({ top: 0 }); },
  sub: el => { S.sub[S.view] = el.dataset.val; persistNav(); render(); },
  'f-occ': el => { S.filter[S.view].occ = el.dataset.val; render(); },
  'f-cat': el => { S.filter[S.view].cat = el.dataset.val; render(); },
  'add-menu': () => {
    openSheet(`<div class="confirm"><h3>Add to ${PEOPLE[S.view].name}'s closet</h3><p class="muted">Photograph each piece on a plain background — bed or floor works great. Pick several from your library to add them in a row.</p>
      <div class="row-btns col"><button class="btn primary" data-act="add" data-src="camera">${icon('camera')}Take a photo</button><button class="btn" data-act="add" data-src="library">${icon('image')}Choose from library</button></div></div>`);
  },
  add: el => {
    closeSheet(true);
    if (!canEdit(S.view)) { toast('You can only add to your own closet'); return; }
    const inp = el.dataset.src === 'camera' ? $('#pick-camera') : $('#pick-library');
    inp.onchange = () => { const files = [...inp.files]; inp.value = ''; startAdd(files); };
    inp.click();
  },
  'open-item': el => {
    const it = S.items.find(i => i.id === el.dataset.id);
    if (!it) return;
    canEdit(it.owner) ? editItem(it) : viewItem(it);
  },

  'style-occ': el => { const st = S.style[S.view]; st.occ = el.dataset.val; runGenerate(S.view); if (!st.list.length && !st.error) st.list = []; render(); },
  'strip-cat': el => { S.style[S.view].stripCat = el.dataset.val; render(); },
  'lock-piece': el => {
    const st = S.style[S.view], it = S.items.find(i => i.id === el.dataset.id);
    if (!it) return;
    if (st.locks[it.cat] === it.id) delete st.locks[it.cat];
    else {
      st.locks[it.cat] = it.id;
      if (it.cat === 'dress') { delete st.locks.top; delete st.locks.bottom; }
      if (it.cat === 'top' || it.cat === 'bottom') delete st.locks.dress;
    }
    runGenerate(S.view); render();
  },
  'toggle-lock': el => {
    const st = S.style[S.view], c = el.dataset.cat;
    const cur = st.list[st.idx];
    if (st.locks[c] === el.dataset.id) { delete st.locks[c]; toast('Unlocked'); }
    else { st.locks[c] = el.dataset.id; toast(`${icon('lock')} Locked — shuffling keeps it`); }
    // regenerate but keep the current look on screen first
    const r = generate(S.view, st.occ, st.locks);
    st.list = cur ? [cur, ...r.list.filter(o => o.pieces.map(p => p.id).join() !== cur.pieces.map(p => p.id).join())] : r.list;
    st.idx = 0; st.error = r.error || '';
    render();
  },
  'clear-locks': () => { S.style[S.view].locks = {}; runGenerate(S.view); render(); },
  generate: () => { runGenerate(S.view); render(); },
  shuffle: () => {
    const st = S.style[S.view];
    if (st.idx < st.list.length - 1) st.idx++;
    else { runGenerate(S.view); toast('Fresh round of looks'); }
    render();
  },
  prev: () => { const st = S.style[S.view]; if (st.idx > 0) st.idx--; render(); },
  'save-outfit': async () => {
    const st = S.style[S.view], o = st.list[st.idx];
    if (!o) return;
    const ids = o.pieces.map(p => p.id);
    if (S.looks.some(l => l.type === 'solo' && l.ids.join() === ids.join())) { toast('Already saved'); return; }
    let rec = { id: uid(), type: 'solo', owner: S.view, occ: st.occ, ids, score: o.score, created: Date.now() };
    if (remote.enabled) { rec = await cloud(() => remote.putLook(rec)); if (!rec) return; }
    await dbPut('looks', rec); S.looks.push(rec);
    render(); toast(`${icon('bookmark')} Look saved`);
  },
  'open-look': el => {
    const l = S.looks.find(x => x.id === el.dataset.id);
    if (!l) return;
    const body = l.type === 'couple'
      ? `<div class="duo in-sheet"><div class="duo-col"><p class="who w-lupita">Lupita</p>${collage(lookPieces(l.ids), { size: 'sm' })}</div><div class="duo-badge">${ring(l.score)}<b>${esc(l.style)}</b></div><div class="duo-col"><p class="who w-jamil">Jamil</p>${collage(lookPieces(l.jids), { size: 'sm' })}</div></div>`
      : `${collage(lookPieces(l.ids))}<div class="score-row">${ring(l.score)}${palette(lookPieces(l.ids).map(p => p.color))}</div>`;
    openSheet(`<div class="look-view"><p class="kicker">${OCC[l.occ].label} · saved ${new Date(l.created).toLocaleDateString()}</p>${body}
      <div class="row-btns"><button class="btn danger" data-act="del-look" data-id="${l.id}">${icon('trash')}Remove</button><button class="btn primary grow" data-act="close-sheet">Done</button></div></div>`, { cls: 'wide' });
  },
  'del-look': async el => {
    if (!(await cloud(() => remote.delLook(el.dataset.id)))) return;
    await dbDel('looks', el.dataset.id);
    S.looks = S.looks.filter(l => l.id !== el.dataset.id);
    closeSheet(); render(); toast('Look removed');
  },

  'couple-occ': el => { S.couple.occ = el.dataset.val; runCouple(); render(); },
  'couple-gen': () => { runCouple(); render(); },
  'couple-next': () => { const c = S.couple; if (c.idx < c.list.length - 1) c.idx++; else { runCouple(); toast('Fresh round of looks'); } render(); },
  'couple-prev': () => { if (S.couple.idx > 0) S.couple.idx--; render(); },
  'couple-save': async () => {
    const c = S.couple.list[S.couple.idx];
    if (!c) return;
    const ids = c.l.pieces.map(p => p.id), jids = c.j.pieces.map(p => p.id);
    if (S.looks.some(l => l.type === 'couple' && l.ids.join() === ids.join() && l.jids.join() === jids.join())) { toast('Already saved'); return; }
    let rec = { id: uid(), type: 'couple', occ: S.couple.occ, ids, jids, score: c.score, style: c.style, created: Date.now() };
    if (remote.enabled) { rec = await cloud(() => remote.putLook(rec)); if (!rec) return; }
    await dbPut('looks', rec); S.looks.push(rec);
    render(); toast(`${icon('hearts')} Couple look saved`);
  },

  'daily-add': el => {
    const inp = el.dataset.src === 'camera' ? $('#pick-daily-cam') : $('#pick-daily');
    inp.onchange = async () => {
      const f = inp.files[0]; inp.value = '';
      if (!f) return;
      toast('Reading photo…');
      const { blob } = await processImage(f, 1400);
      dailyEditor({ id: null, by: S.me.id, img: blob, date: todayISO(), who: S.me.owner, occ: 'outside', note: '', ratings: {} });
    };
    inp.click();
  },
  'open-daily': el => { const d = S.daily.find(x => x.id === el.dataset.id); if (d) dailyEditor(d); },

  settings: () => settingsSheet(),
  'close-sheet': () => closeSheet(),
};

function runCouple() {
  const r = generateCouple(S.couple.occ);
  S.couple.list = r.list; S.couple.idx = 0; S.couple.error = r.error || '';
}

/* ───────────────────────── diary: post, view, rate ───────────────────────── */
const RATE_WORDS = ['', 'Hmm…', 'Okay', 'Nice', 'Love it', 'Obsessed'];
function stars(n, { act = '', size = '' } = {}) {
  return `<span class="stars ${size} ${act ? 'live' : ''}">${[1, 2, 3, 4, 5].map(i =>
    act ? `<button data-act="${act}" data-val="${i}" class="${i <= n ? 'on' : ''}" aria-label="${i} star${i > 1 ? 's' : ''}">${icon('star')}</button>`
        : `<i class="${i <= n ? 'on' : ''}">${icon('star')}</i>`).join('')}</span>`;
}
/* the rating the *other* account gave this entry */
function ratingFor(d) {
  const by = dailyBy(d), r = d.ratings || {};
  const from = Object.keys(r).find(k => k !== by);
  return from ? { from, n: r[from], name: S.accounts.find(a => a.id === from)?.username || '' } : null;
}

function dailyEditor(rec) {
  const d = { ...rec };
  const isNew = !rec.id;
  if (!isNew && !canEditDaily(rec)) return dailyView(rec);
  const u = URL.createObjectURL(d.img);
  const got = isNew ? null : ratingFor(rec);
  const body = openSheet(`
    <div class="editor">
      <div class="ed-photo tall"><img src="${u}" alt=""></div>
      <div class="ed-form">
        <p class="kicker">${isNew ? 'New diary entry' : fmtDate(d.date)}</p>
        ${got ? `<div class="rated-box"><p class="kicker">${esc(got.name)} rated it</p>${stars(got.n, { size: 'lg' })}<b>${RATE_WORDS[got.n]}</b></div>` : ''}
        <label class="field"><span>Date</span><input type="date" id="dy-date" value="${d.date}" max="${todayISO()}"></label>
        <div class="field"><span>Occasion</span><div class="chips wrap" id="dy-occ">${Object.entries(OCC).map(([k, o]) => chip('dy-occ', k, icon(o.icon) + o.label, d.occ === k)).join('')}</div></div>
        <label class="field"><span>Note</span><input id="dy-note" maxlength="120" placeholder="Brunch at our spot ☕" value="${esc(d.note)}"></label>
        <div class="row-btns sticky">
          ${isNew ? '' : `<button class="btn danger" data-act="dy-del" aria-label="Delete">${icon('trash')}</button>`}
          <button class="btn primary grow" data-act="dy-save">${icon('check')}${isNew ? 'Post to diary' : 'Save'}</button>
        </div>
      </div>
    </div>`, { cls: 'wide', onClose: () => URL.revokeObjectURL(u) });
  sheetHandlers = {
    'dy-occ': el => { d.occ = el.dataset.val; body.querySelectorAll('#dy-occ .chip').forEach(b => b.classList.toggle('on', b === el)); },
    'dy-save': async () => {
      let r = { id: d.id || uid(), by: d.by || S.me.id, img: d.img, img_path: d.img_path, date: $('#dy-date', body).value || todayISO(), who: d.who, occ: d.occ, note: $('#dy-note', body).value.trim(), ratings: d.ratings || {}, created: d.created || Date.now() };
      if (remote.enabled) {
        const btn = body.querySelector('[data-act=dy-save]'); btn.disabled = true;
        const saved = await cloud(() => remote.putDaily(r, d.img !== rec.img));
        btn.disabled = false;
        if (!saved) return;
        r = saved;
      }
      await dbPut('daily', r);
      const i = S.daily.findIndex(x => x.id === r.id);
      i >= 0 ? (S.daily[i] = r) : S.daily.push(r);
      closeSheet(); render(); toast(`${icon('camera')} ${isNew ? 'Posted to your diary' : 'Saved'}`);
    },
    'dy-del': async () => {
      if (!(await confirmSheet('Delete this photo?', 'It will be removed from your outfit diary.'))) return;
      if (!(await cloud(() => remote.delDaily(d)))) return;
      await dbDel('daily', d.id);
      S.daily = S.daily.filter(x => x.id !== d.id);
      render(); toast('Photo deleted');
    },
  };
}

/* the other person's post: view it and rate it */
function dailyView(d) {
  const by = S.accounts.find(a => a.id === dailyBy(d));
  const mine = (d.ratings || {})[S.me.id] || 0;
  const body = openSheet(`
    <div class="editor">
      <div class="ed-photo tall"><img src="${url(d)}" alt=""></div>
      <div class="ed-form">
        <p class="kicker">${fmtDate(d.date)} · posted by ${esc(by?.username || '')}</p>
        <h3 class="item-title">${d.note ? esc(d.note) : `${esc(posterOf(d)?.username || '')}'s outfit`}</h3>
        <div class="chips wrap">${OCC[d.occ] ? `<span class="chip">${icon(OCC[d.occ].icon)}${OCC[d.occ].label}</span>` : ''}</div>
        <div class="rate-box">
          <p class="kicker">Rate ${esc(by?.username || 'this')}'s outfit</p>
          <div id="rate-stars">${stars(mine, { act: 'dy-rate', size: 'xl' })}</div>
          <b id="rate-word">${mine ? RATE_WORDS[mine] : 'Tap a star'}</b>
        </div>
        <div class="row-btns sticky"><button class="btn primary grow" data-act="close-sheet">Done</button></div>
      </div>
    </div>`, { cls: 'wide' });
  sheetHandlers = {
    'dy-rate': async el => {
      const n = +el.dataset.val;
      const rec = S.daily.find(x => x.id === d.id);
      if (!rec) return;
      if (!(await cloud(() => remote.rate(rec.id, S.me.id, n)))) return;
      rec.ratings = { ...(rec.ratings || {}), [S.me.id]: n };
      await dbPut('daily', rec);
      $('#rate-stars', body).innerHTML = stars(n, { act: 'dy-rate', size: 'xl' });
      $('#rate-word', body).textContent = RATE_WORDS[n];
      $('#rate-stars', body).classList.remove('pop'); void body.offsetWidth; $('#rate-stars', body).classList.add('pop');
      render(); toast(`${icon('star')} You rated it ${n}/5`);
    },
  };
}

/* ───────────────────────── settings ───────────────────────── */
async function settingsSheet() {
  let est = '';
  try { const e = await navigator.storage.estimate(); est = `${(e.usage / 1048576).toFixed(1)} MB used on this device`; } catch {}
  const body = openSheet(`<div class="confirm settings">
      <div class="me-row"><span class="avatar a-${S.me.owner}">${esc(S.me.username.slice(0, 2))}</span><div><b>${esc(S.me.username)}</b><small>${S.me.admin ? 'Admin · ' : ''}${PEOPLE[S.me.owner].name}'s account</small><small class="remembered">${sessionInfo?.remember ? `${icon('check')}Remembered on this phone` : 'Not remembered — you’ll sign in next time'}</small></div>
        <button class="btn sm" data-act="sign-out">${icon('logout')}Sign out</button></div>
      ${S.me.admin ? `<button class="admin-entry" data-act="admin">${icon('shield')}<span><b>Admin panel</b><small>Accounts, both closets, diary</small></span>${icon('arrow')}</button>` : ''}
      <h4>Your data <small class="ver">v${APP_VERSION}${remote.enabled ? ' · shared' : ' · this phone only'}</small></h4>
      <p class="muted">${remote.enabled
        ? `${icon('check')} Shared closet — clothes, looks, diary posts and ratings sync live between both phones${syncState.last ? ` · last synced ${syncState.last.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}${syncState.error ? ` · ${esc(syncState.error)}` : ''}. A copy is kept on this phone so it opens instantly.`
        : `Every photo, look and diary post is saved on this device. ${est ? esc(est) + '.' : ''}`}</p>
      <div class="set-stats"><div><b>${S.items.filter(i => i.owner === 'lupita').length}</b><span>Lupita</span></div><div><b>${S.items.filter(i => i.owner === 'jamil').length}</b><span>Jamil</span></div><div><b>${S.looks.length}</b><span>looks</span></div><div><b>${S.daily.length}</b><span>diary</span></div></div>
      <h4>${remote.enabled ? 'Backup' : 'Backup &amp; move to another phone'}</h4>
      <p class="muted">${remote.enabled ? 'An extra safety copy. Restoring a backup uploads anything missing to the shared closet.' : 'Download a backup, then open it on the other phone with “Restore”. Restoring merges — nothing is lost, and ratings are combined.'}</p>
      <div class="row-btns col"><button class="btn primary" id="st-export">${icon('download')}Download backup</button><button class="btn" id="st-import">${icon('upload')}Restore from backup</button></div>
      <p class="muted tiny">Tip: on iPhone, tap Share → “Add to Home Screen” to use LuJa like a real app.</p>
    </div>`);
  $('#st-export', body).onclick = exportBackup;
  $('#st-import', body).onclick = () => {
    const inp = $('#pick-backup');
    inp.onchange = async () => { const f = inp.files[0]; inp.value = ''; if (f) importBackup(f); };
    inp.click();
  };
}

/* ───────────────────────── admin panel (JoJo only) ───────────────────────── */
let adminTab = 'accounts', adminOwner = 'lupita';
function adminPanel() {
  if (!S.me?.admin) { toast('Admins only'); return; }
  const tabs = [['accounts', 'Accounts'], ['clothes', 'Clothes'], ['diary', 'Diary'], ['data', 'Data']];
  let inner = '';
  if (adminTab === 'accounts') {
    inner = S.accounts.map(a => `
      <form class="acc-card" data-acc="${a.id}">
        <div class="acc-head"><span class="avatar a-${a.owner}">${esc(a.username.slice(0, 2))}</span>
          <div><b>${esc(a.username)}</b><small>${PEOPLE[a.owner].name}'s closet${a.admin ? ' · admin' : ''}${a.id === S.me.id ? ' · you' : ''}</small></div></div>
        <label class="field"><span>Username</span><input name="username" value="${esc(a.username)}" maxlength="24" autocapitalize="none" spellcheck="false" required></label>
        <label class="field"><span>New password <small>leave empty to keep</small></span><input name="password" type="password" autocomplete="new-password" placeholder="••••••••"></label>
        <div class="stat-line"><span>${S.items.filter(i => i.owner === a.owner).length} pieces</span><span>${S.daily.filter(d => dailyBy(d) === a.id).length} diary posts</span></div>
        <button class="btn primary" type="submit">${icon('check')}Save ${esc(a.username)}</button>
      </form>`).join('');
  } else if (adminTab === 'clothes') {
    const list = S.items.filter(i => i.owner === adminOwner).sort((a, b) => CATS_FOR.lupita.indexOf(a.cat) - CATS_FOR.lupita.indexOf(b.cat));
    inner = `<div class="seg small">${['lupita', 'jamil'].map(o => `<button class="${adminOwner === o ? 'on' : ''}" data-act="admin-owner" data-val="${o}">${PEOPLE[o].name} · ${S.items.filter(i => i.owner === o).length}</button>`).join('')}</div>
      ${list.length ? `<div class="admin-grid">${list.map(i => `
        <div class="admin-tile"><img loading="lazy" src="${url(i)}" alt=""><span>${esc(i.name)}<small>${CATS[i.cat].label}</small></span>
          <button data-act="admin-del-item" data-id="${i.id}" aria-label="Delete ${esc(i.name)}">${icon('trash')}</button></div>`).join('')}</div>`
        : `<p class="muted center">${PEOPLE[adminOwner].name}'s closet is empty.</p>`}`;
  } else if (adminTab === 'diary') {
    const list = [...S.daily].sort((a, b) => b.date.localeCompare(a.date));
    inner = list.length ? `<div class="admin-grid">${list.map(d => {
      const r = ratingFor(d);
      return `<div class="admin-tile"><img loading="lazy" src="${url(d)}" alt=""><span>${fmtDate(d.date)}<small>by ${esc(S.accounts.find(a => a.id === dailyBy(d))?.username || '—')}${r ? ` · ★${r.n}` : ''}</small></span>
        <button data-act="admin-del-daily" data-id="${d.id}" aria-label="Delete post">${icon('trash')}</button></div>`;
    }).join('')}</div>` : '<p class="muted center">No diary posts yet.</p>';
  } else {
    inner = `<div class="danger-zone">
        ${remote.enabled ? '' : `<div><b>Reset accounts</b><p class="muted">Set both usernames and passwords back to the original ones.</p><button class="btn" data-act="admin-reset-acc">${icon('key')}Reset accounts</button></div>`}
        <div><b>Clear all ratings</b><p class="muted">Removes every star from the diary.</p><button class="btn" data-act="admin-clear-ratings">${icon('star')}Clear ratings</button></div>
        <div><b>Erase everything</b><p class="muted">Deletes all clothes, looks and diary photos on this device. Download a backup first.</p><button class="btn danger" data-act="admin-wipe">${icon('trash')}Erase all data</button></div>
      </div>`;
  }
  const body = openSheet(`<div class="admin">
      <p class="kicker">${icon('shield')} Admin · ${esc(S.me.username)}</p>
      <h3>Admin panel</h3>
      <div class="admin-tabs">${tabs.map(([k, l]) => `<button class="${adminTab === k ? 'on' : ''}" data-act="admin-tab" data-val="${k}">${l}</button>`).join('')}</div>
      <div class="admin-body">${inner}</div>
    </div>`, { cls: 'wide' });
  body.querySelectorAll('form.acc-card').forEach(f => f.onsubmit = async e => {
    e.preventDefault();
    const a = S.accounts.find(x => x.id === f.dataset.acc);
    const name = f.username.value.trim(), pw = f.password.value;
    if (!/^[\w.\- ]{2,24}$/.test(name)) { toast('Username: 2–24 letters or numbers'); return; }
    if (S.accounts.some(x => x.id !== a.id && x.username.toLowerCase() === name.toLowerCase())) { toast('That username is taken'); return; }
    const minPw = remote.enabled ? 6 : 4;
    if (pw && pw.length < minPw) { toast(`Password needs at least ${minPw} characters`); return; }
    if (remote.enabled) {
      if (name !== a.username && !(await cloud(() => remote.setUsername(a.id, name)))) return;
      if (pw && !(await cloud(() => remote.setPassword(a.id, pw)))) return;
    }
    const upd = { ...a, username: name, hash: pw && !remote.enabled ? await hashPw(pw) : a.hash };
    await dbPut('accounts', upd);
    S.accounts = S.accounts.map(x => x.id === a.id ? upd : x);
    if (S.me.id === a.id) { S.me = upd; if (!remote.enabled) await saveSession(upd, !!sessionInfo?.remember); }
    adminPanel(); render();
    toast(`${icon('check')} ${esc(name)} updated${pw ? ' · new password set' : ''}`);
  });
}
const adminActions = {
  admin: () => { adminTab = 'accounts'; adminPanel(); },
  'admin-tab': el => { adminTab = el.dataset.val; adminPanel(); },
  'admin-owner': el => { adminOwner = el.dataset.val; adminPanel(); },
  'admin-del-item': async el => {
    const it = S.items.find(i => i.id === el.dataset.id);
    if (!it || !(await confirmSheet('Delete this piece?', `“${esc(it.name)}” will be removed from ${PEOPLE[it.owner].name}'s closet.`))) { adminPanel(); return; }
    if (!(await cloud(() => remote.delItem(it)))) { adminPanel(); return; }
    await dbDel('items', it.id);
    S.items = S.items.filter(x => x.id !== it.id);
    for (const st of Object.values(S.style)) for (const c in st.locks) if (st.locks[c] === it.id) delete st.locks[c];
    invalidate(it.owner); render(); adminPanel(); toast('Piece deleted');
  },
  'admin-del-daily': async el => {
    if (!(await confirmSheet('Delete this diary post?', 'The photo and its rating will be removed.'))) { adminPanel(); return; }
    const post = S.daily.find(x => x.id === el.dataset.id);
    if (post && !(await cloud(() => remote.delDaily(post)))) { adminPanel(); return; }
    await dbDel('daily', el.dataset.id);
    S.daily = S.daily.filter(x => x.id !== el.dataset.id);
    render(); adminPanel(); toast('Post deleted');
  },
  'admin-reset-acc': async () => {
    if (!(await confirmSheet('Reset both accounts?', 'Usernames and passwords go back to the original JoJo and LuLu logins.', 'Reset'))) { adminPanel(); return; }
    for (const a of DEFAULT_ACCOUNTS) await dbPut('accounts', { ...a });
    S.accounts = DEFAULT_ACCOUNTS.map(a => ({ ...a }));
    S.me = S.accounts.find(a => a.id === S.me.id);
    await saveSession(S.me, !!sessionInfo?.remember);
    render(); adminPanel(); toast('Accounts reset');
  },
  'admin-clear-ratings': async () => {
    if (!(await confirmSheet('Clear all ratings?', 'Every star on every diary post will be removed.', 'Clear'))) { adminPanel(); return; }
    if (!(await cloud(() => remote.clearRatings()))) { adminPanel(); return; }
    for (const d of S.daily) { d.ratings = {}; await dbPut('daily', d); }
    render(); adminPanel(); toast('Ratings cleared');
  },
  'admin-wipe': async () => {
    if (!(await confirmSheet('Erase everything?', remote.enabled ? 'All clothes, saved looks, diary photos, ratings and stars will be permanently deleted from BOTH phones and the cloud. This cannot be undone.' : 'All clothes, saved looks and diary photos on this device will be permanently deleted. This cannot be undone.', 'Erase all'))) { adminPanel(); return; }
    if (!(await cloud(() => remote.wipe()))) { adminPanel(); return; }
    for (const s of ['items', 'looks', 'daily', 'stars', 'challenges']) await P(os(s, 'readwrite').clear());
    S.items = []; S.looks = []; S.daily = []; S.stars = []; S.challenges = [];
    invalidate('lupita'); invalidate('jamil');
    closeSheet(); render(); toast('Everything erased');
  },
  'sign-out': () => signOut(),
};
Object.assign(actions, adminActions);

/* ───────────────────────── stars: weekly game ─────────────────────────
   You give each other stars all week. The week starts over every Sunday at
   6:00 AM; whoever got fewer stars does the challenge the winner wrote. */
const RESET_HOUR = 6;
const STAR_REASONS = ['Looked amazing', 'Made me laugh', 'Sweet surprise', 'Took care of me', 'Best outfit', 'Just because'];
const isoLocal = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function weekStart(t = Date.now()) {
  const d = new Date(t - RESET_HOUR * 3600e3);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(RESET_HOUR, 0, 0, 0);
  return d;
}
const weekKey = (t = Date.now()) => isoLocal(weekStart(t));
const prevWeekKey = () => weekKey(weekStart().getTime() - 3600e3);
const weekLabel = k => {
  const a = new Date(k + 'T12:00:00'), b = new Date(a); b.setDate(b.getDate() + 6);
  const f = d => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${f(a)} – ${f(b)}`;
};
const players = () => ['lulu', 'jojo'].map(id => S.accounts.find(a => a.id === id) || DEFAULT_ACCOUNTS.find(a => a.id === id));
const challengeOf = (week, by) => S.challenges.find(c => c.id === `${week}:${by}`);
function weekScore(week) {
  const n = { lulu: 0, jojo: 0 };
  for (const x of S.stars) if (x.week === week && x.receiver in n) n[x.receiver]++;
  const [lu, jo] = [n.lulu, n.jojo];
  return { n, total: lu + jo, tie: lu === jo, winner: lu > jo ? 'lulu' : jo > lu ? 'jojo' : null, loser: lu < jo ? 'lulu' : jo < lu ? 'jojo' : null };
}
function timeLeft() {
  const next = weekStart(); next.setDate(next.getDate() + 7);
  const ms = next - Date.now(), d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
  return d ? `${d}d ${h}h left` : h ? `${h}h ${m}m left` : `${m}m left`;
}
const nameOf = id => esc(S.accounts.find(a => a.id === id)?.username || id);
const ownerOf = id => (id === 'jojo' ? 'jamil' : 'lupita');

function verdictCard(week, { compact = false } = {}) {
  const r = weekScore(week);
  if (!r.total) return '';
  const score = `${r.n.lulu} – ${r.n.jojo}`;
  const chBlock = (by, forWho) => {
    const ch = challengeOf(week, by);
    if (!ch?.text) return `<div class="ch-line"><p class="muted">${nameOf(by)} didn't set a challenge — ${nameOf(by)} picks one now.</p></div>`;
    return `<div class="ch-line ${ch.done ? 'done' : ''}">
        <p class="kicker">${nameOf(by)}'s challenge for ${nameOf(forWho)}</p>
        <p class="ch-text">“${esc(ch.text)}”</p>
        <button class="btn sm ${ch.done ? '' : 'primary'}" data-act="ch-done" data-id="${ch.id}">${icon('check')}${ch.done ? 'Done ✦' : 'Mark as done'}</button>
      </div>`;
  };
  const body = r.tie
    ? `<h3>It's a tie, ${score}</h3><p class="muted">Nobody escapes: you both do each other's challenge.</p>${chBlock('jojo', 'lulu')}${chBlock('lulu', 'jojo')}`
    : `<h3><span class="w-${ownerOf(r.loser)}">${nameOf(r.loser)}</span> lost, ${score}</h3><p class="muted">${nameOf(r.winner)} won the week ${icon('crown')}</p>${chBlock(r.winner, r.loser)}`;
  return `<section class="verdict ${compact ? 'compact' : ''}"><p class="kicker">${icon('trophy')}Last week · ${weekLabel(week)}</p>${body}</section>`;
}

function viewStars() {
  const wk = weekKey(), r = weekScore(wk), me = S.me.id;
  const other = players().find(p => p.id !== me);
  const board = `<section class="scoreboard">${players().map(p => {
      const lead = !r.tie && r.winner === p.id;
      return `<div class="sb-col sb-${p.owner} ${lead ? 'lead' : ''}">
        <span class="avatar a-${p.owner}">${esc(p.username.slice(0, 2))}${lead ? `<i class="crown">${icon('crown')}</i>` : ''}</span>
        <b class="sb-n">${r.n[p.id]}</b>
        <span class="sb-name">${esc(p.username)}${p.id === me ? ' · you' : ''}</span>
      </div>`; }).join('<span class="sb-vs">vs</span>')}
      <p class="sb-foot">${r.total ? (r.tie ? 'Tied right now' : `${nameOf(r.winner)} is ahead`) : 'No stars yet this week'} · resets Sunday ${RESET_HOUR}:00 AM · ${timeLeft()}</p>
    </section>`;
  const give = `<button class="btn big give-star" data-act="star-give">${icon('star')}Give ${esc(other.username)} a star</button>`;

  const mine = challengeOf(wk, me), theirs = challengeOf(wk, other.id);
  const challenges = `<section class="cat-group"><h2>The loser's challenge</h2>
      <div class="ch-card">
        <label class="field"><span>Your challenge if ${esc(other.username)} loses</span>
          <span class="ch-row"><input id="ch-input" maxlength="140" placeholder="Breakfast in bed on Sunday ☕" value="${esc(mine?.text || '')}"><button class="btn primary" data-act="ch-save">${icon('check')}Save</button></span></label>
        <div class="ch-theirs"><p class="kicker">${esc(other.username)}'s challenge if you lose</p><p>${theirs?.text ? `“${esc(theirs.text)}”` : '<span class="muted">Not set yet</span>'}</p></div>
      </div></section>`;

  const list = S.stars.filter(x => x.week === wk).sort((a, b) => b.created - a.created);
  const feed = `<section class="cat-group"><h2>This week<span>${list.length}</span></h2>${list.length ? `<div class="star-feed">${list.map(x => `
      <div class="star-row">
        <span class="star-ic">${icon('star')}</span>
        <div><b>${nameOf(x.giver)} <span class="muted">→</span> <span class="w-${ownerOf(x.receiver)}">${nameOf(x.receiver)}</span></b>
        <small>${x.note ? `“${esc(x.note)}” · ` : ''}${new Date(x.created).toLocaleDateString(undefined, { weekday: 'short' })} ${new Date(x.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></div>
        ${x.giver === me || S.me.admin ? `<button class="icon-btn sm" data-act="star-undo" data-id="${x.id}" aria-label="Take back">${icon('undo')}</button>` : ''}
      </div>`).join('')}</div>` : `<div class="empty small"><p>Stars you give each other show up here.</p></div>`}</section>`;

  const weeks = [...new Set(S.stars.map(x => x.week))].filter(w => w < prevWeekKey()).sort().reverse().slice(0, 12);
  const history = weeks.length ? `<section class="cat-group"><h2>Past weeks</h2><div class="star-feed">${weeks.map(w => {
      const s = weekScore(w), ch = s.winner ? challengeOf(w, s.winner) : null;
      return `<div class="star-row hist"><span class="star-ic">${icon('trophy')}</span><div><b>${weekLabel(w)} · ${s.n.lulu} – ${s.n.jojo}</b>
        <small>${s.tie ? 'Tie' : `${nameOf(s.loser)} lost`}${ch?.text ? ` · “${esc(ch.text)}”${ch.done ? ' ✓' : ''}` : ''}</small></div></div>`; }).join('')}</div></section>` : '';

  return hero('Every week', `Stars<em>.</em>`, `Give each other stars all week. Sunday at ${RESET_HOUR} AM it starts over, and whoever has fewer stars does the winner's challenge.`)
    + verdictCard(prevWeekKey()) + board + give + challenges + feed + history;
}

function starSheet() {
  const other = players().find(p => p.id !== S.me.id);
  let note = '';
  const body = openSheet(`<div class="confirm star-sheet">
      <span class="big-star">${icon('star')}</span>
      <h3>A star for ${esc(other.username)}</h3>
      <p class="muted">What's it for? (optional)</p>
      <div class="chips wrap center" id="st-reasons">${STAR_REASONS.map(t => chip('st-reason', esc(t), esc(t), false)).join('')}</div>
      <label class="field"><input id="st-note" maxlength="80" placeholder="Or write your own…"></label>
      <div class="row-btns"><button class="btn grow" data-act="close-sheet">Cancel</button><button class="btn primary grow" data-act="st-send">${icon('star')}Give star</button></div>
    </div>`);
  sheetHandlers = {
    'st-reason': el => {
      const on = !el.classList.contains('on');
      body.querySelectorAll('#st-reasons .chip').forEach(b => b.classList.remove('on'));
      el.classList.toggle('on', on);
      $('#st-note', body).value = on ? el.dataset.val : '';
    },
    'st-send': async el => {
      note = $('#st-note', body).value.trim();
      const rec = { id: uid(), week: weekKey(), giver: S.me.id, receiver: other.id, note, created: Date.now() };
      el.disabled = true;
      if (!(await cloud(() => remote.giveStar(rec)))) { el.disabled = false; return; }
      await dbPut('stars', rec); S.stars.push(rec);
      closeSheet(); render(); toast(`${icon('star')} Star sent to ${esc(other.username)}`);
    },
  };
}

Object.assign(actions, {
  'star-give': () => starSheet(),
  'star-undo': async el => {
    const x = S.stars.find(s => s.id === el.dataset.id);
    if (!x || !(await confirmSheet('Take this star back?', `${nameOf(x.receiver)} will have one star less this week.`, 'Take back'))) return;
    if (!(await cloud(() => remote.takeStar(x.id)))) return;
    await dbDel('stars', x.id);
    S.stars = S.stars.filter(s => s.id !== x.id);
    render(); toast('Star taken back');
  },
  'ch-save': async () => {
    const text = $('#ch-input').value.trim(), wk = weekKey();
    const old = challengeOf(wk, S.me.id);
    const rec = { id: `${wk}:${S.me.id}`, week: wk, by: S.me.id, text, done: old?.done || false, updated: Date.now() };
    if (!(await cloud(() => remote.putChallenge(rec)))) return;
    await dbPut('challenges', rec);
    S.challenges = [...S.challenges.filter(c => c.id !== rec.id), rec];
    render(); toast(`${icon('check')} Challenge saved`);
  },
  'ch-done': async el => {
    const ch = S.challenges.find(c => c.id === el.dataset.id);
    if (!ch) return;
    const rec = { ...ch, done: !ch.done, updated: Date.now() };
    if (!(await cloud(() => remote.putChallenge(rec)))) return;
    await dbPut('challenges', rec);
    S.challenges = S.challenges.map(c => (c.id === rec.id ? rec : c));
    render(); toast(rec.done ? `${icon('check')} Challenge done!` : 'Marked as not done');
  },
});
// keep the countdown fresh and flip to the new week on Sunday morning
setInterval(() => {
  const typing = document.activeElement?.matches?.('input, textarea');
  if (S.me && S.view === 'stars' && !typing && !$('#sheet-root').innerHTML) render();
}, 60000);

/* ───────────────────────── backup ───────────────────────── */
async function exportBackup() {
  toast('Packing your closet…');
  const ser = async r => r.img ? { ...r, img: await blobToDataURL(r.img) } : r;
  const data = {
    app: 'luja-closet', version: 2, exported: new Date().toISOString(),
    accounts: S.accounts,
    items: await Promise.all(S.items.map(ser)),
    looks: S.looks,
    daily: await Promise.all(S.daily.map(ser)),
  };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const name = `luja-backup-${todayISO()}.json`;
  const file = new File([blob], name, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'LuJa backup' }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(`${icon('check')} Backup downloaded`);
}
async function importBackup(file) {
  try {
    const data = JSON.parse(await file.text());
    if (data.app !== 'luja-closet') throw new Error('not a LuJa backup');
    toast('Restoring…');
    let n = 0;
    const fresh = r => { if (remote.enabled && !S.items.concat(S.looks, S.daily).some(x => x.id === r.id && x.synced)) { delete r.synced; delete r.img_path; } return r; };
    for (const r of data.items || []) { r.img = await dataURLToBlob(r.img); await dbPut('items', fresh(r)); n++; }
    for (const r of data.looks || []) await dbPut('looks', fresh(r));
    for (const r of data.daily || []) {
      r.img = await dataURLToBlob(r.img); fresh(r);
      const cur = S.daily.find(x => x.id === r.id);
      r.ratings = { ...(cur?.ratings || {}), ...(r.ratings || {}) };
      await dbPut('daily', r);
    }
    // account changes made by the admin travel with the backup; only JoJo stays admin
    for (const a of data.accounts || []) {
      const base = DEFAULT_ACCOUNTS.find(x => x.id === a.id);
      if (base && typeof a.username === 'string' && /^[0-9a-f]{64}$/.test(a.hash)) await dbPut('accounts', { ...base, username: a.username, hash: a.hash });
    }
    await loadAll(); invalidate('lupita'); invalidate('jamil');
    S.me = S.accounts.find(a => a.id === S.me?.id) || null;
    if (S.me && !remote.enabled) await saveSession(S.me, !!sessionInfo?.remember);
    closeSheet(); render();
    if (remote.enabled) pull();
    toast(`${icon('check')} Restored ${n} pieces`);
  } catch (e) {
    console.error(e); toast('That file is not a LuJa backup');
  }
}

/* ───────────────────────── cloud sync ───────────────────────── */
let stopLive = null, pulling = null, pullAgain = false;
let starsPulled = false;  // after the first pull, new stars for you pop up a message
const syncState = { last: null, error: '' };
function startSync() {
  pull();
  if (!stopLive) remote.subscribe(() => pull()).then(stop => { stopLive = stop; }).catch(console.error);
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.me && remote.enabled) pull(); });
window.addEventListener('online', () => { if (S.me && remote.enabled) pull(); });

async function pull() {
  if (pulling) { pullAgain = true; return pulling; }
  pulling = (async () => {
    try { await doPull(); starsPulled = true; syncState.last = new Date(); syncState.error = ''; }
    catch (e) { console.error(e); syncState.error = navigator.onLine ? 'Sync problem' : 'Offline'; }
  })();
  await pulling; pulling = null;
  if (pullAgain) { pullAgain = false; return pull(); }
}

async function withImages(rows, local, store) {
  const out = [], need = [];
  for (const r of rows) {
    const l = local.find(x => x.id === r.id);
    const rec = { ...r, synced: true };
    if (l && l.img && l.img_path === r.img_path) rec.img = l.img;
    else if (r.img_path) need.push(rec);
    if (l?.ratings) rec.ratings = l.ratings;
    out.push(rec);
  }
  let done = 0;
  const worker = async () => {
    while (need.length) {
      const rec = need.shift();
      try { rec.img = await remote.download(rec.img_path); } catch (e) { console.error(e); }
      done++;
      if (done % 4 === 0) toast(`Syncing photos… ${done}`);
    }
  };
  await Promise.all([1, 2, 3, 4].map(worker));
  return out;
}

async function doPull() {
  const me = S.me;
  if (!me) return;
  // 1) upload anything that only exists on this phone (first sync / restored backups)
  const mayUpload = { items: r => me.admin || r.owner === me.owner, daily: r => me.admin || dailyBy(r) === me.id, looks: () => true };
  let uploaded = 0;
  for (const r of S.items.filter(r => !r.synced && r.img && mayUpload.items(r))) {
    try { const s = await remote.putItem(r, true); await dbPut('items', s); Object.assign(r, s); uploaded++; } catch (e) { console.error(e); }
  }
  for (const r of S.daily.filter(r => !r.synced && r.img && mayUpload.daily(r))) {
    try {
      const s = await remote.putDaily({ ...r, by: dailyBy(r) || me.id }, true); await dbPut('daily', s); Object.assign(r, s); uploaded++;
      const mine = r.ratings?.[me.id]; if (mine) await remote.rate(r.id, me.id, mine).catch(() => {});
    } catch (e) { console.error(e); }
  }
  for (const r of S.looks.filter(r => !r.synced)) {
    try { const s = await remote.putLook(r); await dbPut('looks', s); Object.assign(r, s); uploaded++; } catch (e) { console.error(e); }
  }
  if (uploaded) toast(`${icon('check')} Uploaded ${uploaded} things to your shared closet`);

  // 2) download the shared state
  const data = await remote.fetchAll();
  if (!S.me) return;
  const accounts = data.profiles.map(p => ({ id: p.account, username: p.username, owner: p.owner, admin: p.is_admin }));
  const items = await withImages(data.items, S.items);
  const daily = await withImages(data.daily, S.daily);
  for (const d of daily) {
    d.ratings = {};
    for (const r of data.ratings) if (r.daily_id === d.id) d.ratings[r.rater] = r.stars;
    d.who = S.accounts.find(a => a.id === d.by)?.owner || d.who;
  }
  const looks = data.looks.map(l => ({ ...l, owner: l.owner || undefined, jids: l.jids || undefined, synced: true }));
  const starsChanged = JSON.stringify(S.stars.map(x => x.id).sort()) !== JSON.stringify(data.stars.map(x => x.id).sort())
    || JSON.stringify(S.challenges.map(x => [x.id, x.text, x.done]).sort()) !== JSON.stringify(data.challenges.map(x => [x.id, x.text, x.done]).sort());
  const seen = new Set(S.stars.map(x => x.id));
  const fresh = data.stars.filter(x => !seen.has(x.id) && x.receiver === me.id);
  // keep rows this phone isn't allowed to upload (they stay local-only)
  const keep = (local, remoteRows) => local.filter(l => !l.synced && !remoteRows.some(r => r.id === l.id));

  const before = JSON.stringify([S.items.map(i => [i.id, i.img_path, i.name, i.color, i.occ, i.cat, i.pattern]), S.daily.map(d => [d.id, d.img_path, d.note, d.occ, d.date, d.ratings]), S.looks.map(l => l.id), S.accounts.map(a => [a.id, a.username])]);
  const nItems = [...items, ...keep(S.items, items)], nDaily = [...daily, ...keep(S.daily, daily)], nLooks = [...looks, ...keep(S.looks, looks)];

  // write the cache
  for (const [name, rows] of [['items', nItems], ['daily', nDaily], ['looks', nLooks]]) {
    await P(os(name, 'readwrite').clear());
    for (const r of rows) await dbPut(name, r);
  }
  if (accounts.length) { await P(os('accounts', 'readwrite').clear()); for (const a of accounts) await dbPut('accounts', a); }
  if (starsChanged) {
    for (const [name, rows] of [['stars', data.stars], ['challenges', data.challenges]]) {
      await P(os(name, 'readwrite').clear());
      for (const r of rows) await dbPut(name, r);
    }
    S.stars = data.stars; S.challenges = data.challenges;
    if (fresh.length && (seen.size || starsPulled)) {
      const from = S.accounts.find(a => a.id === fresh[0].giver)?.username || 'Someone';
      toast(`${icon('star')} ${esc(from)} gave you ${fresh.length > 1 ? fresh.length + ' stars' : 'a star'}${fresh.length === 1 && fresh[0].note ? ` — “${esc(fresh[0].note)}”` : ''}`);
    }
  }

  S.items = nItems; S.daily = nDaily; S.looks = nLooks;
  if (accounts.length) { S.accounts = accounts.sort((a, b) => (b.admin ? 1 : 0) - (a.admin ? 1 : 0)); S.me = S.accounts.find(a => a.id === me.id) || S.me; }
  const after = JSON.stringify([S.items.map(i => [i.id, i.img_path, i.name, i.color, i.occ, i.cat, i.pattern]), S.daily.map(d => [d.id, d.img_path, d.note, d.occ, d.date, d.ratings]), S.looks.map(l => l.id), S.accounts.map(a => [a.id, a.username])]);
  if (before !== after || starsChanged) {
    invalidate('lupita'); invalidate('jamil');
    for (const st of Object.values(S.style)) for (const c in st.locks) if (!S.items.some(i => i.id === st.locks[c])) delete st.locks[c];
    render();
  }
}

/* ───────────────────────── wiring ───────────────────────── */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const a = el.dataset.act;
  if (!S.me && a !== 'close-sheet') return;
  if (a.startsWith('ed-') || a.startsWith('dy-') || a.startsWith('st-')) { sheetHandlers[a]?.(el, e); return; }
  if (actions[a]) { e.preventDefault(); actions[a](el, e); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

async function loadAll() {
  [S.items, S.looks, S.daily, S.accounts, S.stars, S.challenges] = await Promise.all(['items', 'looks', 'daily', 'accounts', 'stars', 'challenges'].map(dbAll));
  if (!S.accounts.length) {
    for (const a of DEFAULT_ACCOUNTS) await dbPut('accounts', { ...a });
    S.accounts = DEFAULT_ACCOUNTS.map(a => ({ ...a }));
  }
  S.accounts.sort((a, b) => (b.admin ? 1 : 0) - (a.admin ? 1 : 0));
}

async function init() {
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  $('.topbar [data-act="settings"]').innerHTML = icon('gear');
  if (!['lupita', 'jamil', 'match', 'daily', 'stars'].includes(S.view)) S.view = 'lupita';
  try {
    db = await openDB();
    await loadAll();
    navigator.storage?.persist?.().catch(() => {});
  } catch (e) {
    console.error(e);
    app.innerHTML = `<div class="empty"><h3>Storage is blocked</h3><p>This browser is not allowing the app to save data (private mode?). Open LuJa in a normal window.</p></div>`;
    return;
  }
  if (remote.enabled) {
    let id = null;
    try { id = await remote.restore(); } catch (e) { console.error(e); }
    S.me = id ? (S.accounts.find(a => a.id === id) || { ...DEFAULT_ACCOUNTS.find(a => a.id === id) }) : null;
    if (S.me) { sessionInfo = { remember: remote.isRemembered() }; startSync(); }
  } else S.me = await restoreSession();
  render(false);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
    // look for a newer version every time the app comes back to the screen
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') navigator.serviceWorker.getRegistration().then(r => r?.update()).catch(() => {});
    });
  }
}
init();

// exposed for quick testing in the console
window.__luja = { S, generate, generateCouple, scoreOutfit, pair, ci };
