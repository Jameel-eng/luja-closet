/* LuJa Closet — shared cloud sync (Supabase).
   The phone keeps a full local copy (IndexedDB) so the app opens instantly and
   works offline for browsing; every change is written to Supabase first, and
   both phones receive changes live. */
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const enabled = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
const LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
const REM_KEY = 'luja:remember';
const ACC_KEY = 'luja:account';
const BUCKET = 'photos';
const TABLES = ['profiles', 'items', 'looks', 'daily', 'ratings', 'stars', 'challenges'];
export const ownerAccount = owner => (owner === 'jamil' ? 'jojo' : 'lulu');

/* "Remember this phone": the login token lives in localStorage (kept) or
   sessionStorage (gone when the app is closed). */
const authStorage = {
  getItem: k => { try { return localStorage.getItem(k) ?? sessionStorage.getItem(k); } catch { return null; } },
  setItem: (k, v) => {
    try {
      const rem = localStorage.getItem(REM_KEY) !== '0';
      (rem ? localStorage : sessionStorage).setItem(k, v);
      (rem ? sessionStorage : localStorage).removeItem(k);
    } catch {}
  },
  removeItem: k => { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch {} },
};

let sb = null;
async function client() {
  if (!enabled) throw new Error('sync disabled');
  if (sb) return sb;
  const { createClient } = await import(LIB);
  sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { storage: authStorage, storageKey: 'luja-auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return sb;
}
const ok = ({ data, error }) => { if (error) throw error; return data; };
export const isRemembered = () => { try { return localStorage.getItem(REM_KEY) !== '0'; } catch { return true; } };

/* ── auth ── */
export async function signIn(username, password, remember) {
  const c = await client();
  try { localStorage.setItem(REM_KEY, remember ? '1' : '0'); } catch {}
  const account = ok(await c.rpc('account_for_username', { uname: username }));
  if (!account) { const e = new Error('bad login'); e.code = 'bad_login'; throw e; }
  const { error } = await c.auth.signInWithPassword({ email: `${account}@luja.app`, password });
  if (error) { const e = new Error(error.message); e.code = /invalid/i.test(error.message) ? 'bad_login' : 'network'; throw e; }
  try { localStorage.setItem(ACC_KEY, account); } catch {}
  return account;
}
export async function restore() {
  const c = await client();
  const { data } = await c.auth.getSession();
  if (!data?.session) return null;
  let account = null;
  try { account = localStorage.getItem(ACC_KEY); } catch {}
  if (!account) {
    const p = ok(await c.from('profiles').select('account').eq('user_id', data.session.user.id).maybeSingle());
    account = p?.account || null;
    try { localStorage.setItem(ACC_KEY, account); } catch {}
  }
  return account;
}
export async function signOut() {
  const c = await client();
  try { localStorage.removeItem(ACC_KEY); } catch {}
  await c.auth.signOut({ scope: 'local' }).catch(() => {});
}

/* ── read everything ── */
export async function fetchAll() {
  const c = await client();
  const [profiles, items, looks, daily, ratings, stars, challenges] = await Promise.all(
    TABLES.map(t => c.from(t).select('*').limit(5000).then(ok)));
  return { profiles, items, looks, daily, ratings, stars, challenges };
}
export async function download(path) {
  const c = await client();
  return ok(await c.storage.from(BUCKET).download(path));
}

/* ── writes ── */
async function upload(path, blob) {
  const c = await client();
  ok(await c.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: true, cacheControl: '31536000' }));
  return path;
}
async function removeFiles(paths) {
  const c = await client();
  paths = paths.filter(Boolean);
  for (let i = 0; i < paths.length; i += 100) await c.storage.from(BUCKET).remove(paths.slice(i, i + 100)).catch(() => {});
}

export async function putItem(rec, imgChanged) {
  const c = await client();
  let img_path = rec.img_path || null;
  const old = img_path;
  if (imgChanged || !img_path) img_path = await upload(`${ownerAccount(rec.owner)}/i-${rec.id}-${Date.now()}.jpg`, rec.img);
  ok(await c.from('items').upsert({ id: rec.id, owner: rec.owner, cat: rec.cat, name: rec.name, color: rec.color, pattern: rec.pattern, occ: rec.occ, img_path, created: rec.created }));
  if (old && old !== img_path) removeFiles([old]);
  return { ...rec, img_path, synced: true };
}
export async function delItem(rec) {
  const c = await client();
  ok(await c.from('items').delete().eq('id', rec.id));
  removeFiles([rec.img_path]);
}

export async function putLook(rec) {
  const c = await client();
  ok(await c.from('looks').upsert({ id: rec.id, type: rec.type, owner: rec.owner || null, occ: rec.occ, ids: rec.ids, jids: rec.jids || null, score: rec.score, style: rec.style || null, created: rec.created }));
  return { ...rec, synced: true };
}
export async function delLook(id) {
  const c = await client();
  ok(await c.from('looks').delete().eq('id', id));
}

export async function putDaily(rec, imgChanged) {
  const c = await client();
  let img_path = rec.img_path || null;
  const old = img_path;
  if (imgChanged || !img_path) img_path = await upload(`${rec.by}/d-${rec.id}-${Date.now()}.jpg`, rec.img);
  ok(await c.from('daily').upsert({ id: rec.id, by: rec.by, date: rec.date, occ: rec.occ, note: rec.note, img_path, created: rec.created }));
  if (old && old !== img_path) removeFiles([old]);
  return { ...rec, img_path, synced: true };
}
export async function delDaily(rec) {
  const c = await client();
  ok(await c.from('daily').delete().eq('id', rec.id));
  removeFiles([rec.img_path]);
}
export async function rate(daily_id, rater, stars) {
  const c = await client();
  ok(await c.from('ratings').upsert({ daily_id, rater, stars }));
}
export async function clearRatings() {
  const c = await client();
  ok(await c.from('ratings').delete().gte('stars', 1));
}

/* ── weekly stars & the loser's challenge ── */
export async function giveStar(rec) {
  const c = await client();
  ok(await c.from('stars').insert({ id: rec.id, week: rec.week, giver: rec.giver, receiver: rec.receiver, note: rec.note || null, created: rec.created }));
}
export async function takeStar(id) {
  const c = await client();
  ok(await c.from('stars').delete().eq('id', id));
}
export async function putChallenge(rec) {
  const c = await client();
  ok(await c.from('challenges').upsert({ id: rec.id, week: rec.week, by: rec.by, text: rec.text, done: !!rec.done, updated: rec.updated }));
}

export async function setUsername(account, username) {
  const c = await client();
  ok(await c.from('profiles').update({ username }).eq('account', account));
}
export async function setPassword(account, password) {
  const c = await client();
  ok(await c.rpc('set_account_password', { target: account, new_password: password }));
}

export async function wipe() {
  const c = await client();
  const items = ok(await c.from('items').select('img_path'));
  const daily = ok(await c.from('daily').select('img_path'));
  ok(await c.from('ratings').delete().gte('stars', 1));
  ok(await c.from('stars').delete().neq('id', ''));
  ok(await c.from('challenges').delete().neq('id', ''));
  ok(await c.from('daily').delete().neq('id', ''));
  ok(await c.from('looks').delete().neq('id', ''));
  ok(await c.from('items').delete().neq('id', ''));
  await removeFiles([...items, ...daily].map(r => r.img_path));
}

/* ── live updates from the other phone ── */
export async function subscribe(onChange) {
  const c = await client();
  let t;
  const fire = () => { clearTimeout(t); t = setTimeout(onChange, 600); };
  const ch = c.channel('luja-live');
  for (const table of TABLES) ch.on('postgres_changes', { event: '*', schema: 'public', table }, fire);
  ch.subscribe();
  return () => c.removeChannel(ch);
}
