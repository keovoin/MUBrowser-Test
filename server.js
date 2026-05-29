/*
 * MU Online Browser Edition - Fly.io server
 * Zero external dependencies (Node.js built-ins only) so the Docker build is tiny and reliable.
 *
 * Responsibilities:
 *   1. Serve the static game (docs/index.html + assets).
 *   2. Real online APIs for true cross-device multiplayer:
 *        - POST /api/register, /api/login        (accounts, pbkdf2-hashed passwords, HMAC token)
 *        - GET  /api/characters?token=            (your characters from the cloud)
 *        - POST /api/sync                          (persist a character server-side)
 *        - GET  /api/ranking                       (global leaderboard across all players)
 *        - POST /api/presence                      (live heartbeat: where each player is)
 *        - GET  /api/presence?map=<id>&token=      (other players active on a map in last 10s)
 *        - GET  /api/health                        (client uses this to detect "online mode")
 *
 * Persistence: JSON files under DATA_DIR (default ./data; on Fly.io a mounted volume at /data).
 * Presence is kept in memory (ephemeral by design).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 8080;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const STATIC_DIR = path.join(__dirname, 'docs');
const SECRET = process.env.AUTH_SECRET || 'mu-fly-secret-change-me';
const PRESENCE_TTL = 10000; // ms a heartbeat is considered "online"

// ---------- storage ----------
function ensureDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function loadJson(name, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8')); }
  catch { return fallback; }
}
function saveJson(name, data) { ensureDir(); fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(data)); }

let accounts = loadJson('accounts.json', []);   // [{username, pass, role, banned}]
let characters = loadJson('characters.json', []); // [{id, owner, name, cls, level, exp, mapId, ...}]
const presence = new Map(); // key=username -> {name, cls, level, mapId, x, y, ts}

function persistAccounts() { saveJson('accounts.json', accounts); }
function persistCharacters() { saveJson('characters.json', characters); }

// Ensure there is at least one admin (first account, or one named "admin")
(function bootstrapAdmin() {
  let changed = false;
  accounts.forEach(a => { if (a.role === undefined) { a.role = 'player'; changed = true; } if (a.banned === undefined) { a.banned = false; changed = true; } });
  if (accounts.length && !accounts.some(a => a.role === 'admin')) {
    const named = accounts.find(a => (a.username || '').toLowerCase() === 'admin');
    (named || accounts[0]).role = 'admin';
    changed = true;
  }
  if (changed) persistAccounts();
})();

// ---------- auth helpers ----------
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pw, salt, 10000, 64, 'sha512').toString('hex');
  return salt + ':' + hash;
}
function verifyPassword(pw, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const v = crypto.pbkdf2Sync(pw, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(v));
}
function b64url(s) { return Buffer.from(s).toString('base64url'); }
function makeToken(username) {
  const body = b64url(JSON.stringify({ u: username, exp: Date.now() + 7 * 864e5 }));
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return body + '.' + sig;
}
function readToken(token) {
  try {
    const [body, sig] = String(token).split('.');
    const expect = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
    if (sig !== expect) return null;
    const data = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (data.exp < Date.now()) return null;
    return data.u;
  } catch { return null; }
}

// ---------- http helpers ----------
function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' });
  res.end(body);
}
function readBody(req) {
  return new Promise(resolve => {
    let data = ''; let size = 0;
    req.on('data', c => { size += c.length; if (size > 1e6) { req.destroy(); resolve({}); } else data += c; });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const filePath = path.join(STATIC_DIR, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ''));
  if (!filePath.startsWith(STATIC_DIR)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(filePath, (err, content) => {
    if (err) { // SPA fallback to index.html
      fs.readFile(path.join(STATIC_DIR, 'index.html'), (e2, idx) => {
        if (e2) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(idx);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  });
}

// ---------- api ----------
async function handleApi(req, res, urlPath, query) {
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' }); return res.end(); }

  if (urlPath === '/api/health') return sendJson(res, 200, { ok: true, online: true, players: countOnline() });

  if (urlPath === '/api/register' && req.method === 'POST') {
    const { username, password } = await readBody(req);
    if (!username || username.length < 3 || username.length > 16) return sendJson(res, 400, { error: 'Username must be 3-16 chars' });
    if (!password || password.length < 4) return sendJson(res, 400, { error: 'Password must be 4+ chars' });
    if (accounts.find(a => a.username === username)) return sendJson(res, 409, { error: 'Username already exists' });
    const role = (username.toLowerCase() === 'admin' || accounts.length === 0) ? 'admin' : 'player';
    accounts.push({ username, pass: hashPassword(password), role, banned: false });
    persistAccounts();
    return sendJson(res, 200, { token: makeToken(username), username, role });
  }

  if (urlPath === '/api/login' && req.method === 'POST') {
    const { username, password } = await readBody(req);
    const acc = accounts.find(a => a.username === username);
    if (!acc || !verifyPassword(password, acc.pass)) return sendJson(res, 401, { error: 'Invalid credentials' });
    if (acc.banned) return sendJson(res, 403, { error: 'This account is banned.' });
    return sendJson(res, 200, { token: makeToken(username), username, role: acc.role });
  }

  if (urlPath === '/api/characters' && req.method === 'GET') {
    const user = readToken(query.token);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
    return sendJson(res, 200, { characters: characters.filter(c => c.owner === user) });
  }

  if (urlPath === '/api/sync' && req.method === 'POST') {
    const { token, character } = await readBody(req);
    const user = readToken(token);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
    if (!character || !character.id) return sendJson(res, 400, { error: 'character required' });
    character.owner = user; // never trust client-supplied owner
    const idx = characters.findIndex(c => c.id === character.id);
    if (idx >= 0) { if (characters[idx].owner !== user) return sendJson(res, 403, { error: 'Not your character' }); characters[idx] = character; }
    else characters.push(character);
    persistCharacters();
    return sendJson(res, 200, { ok: true });
  }

  if (urlPath === '/api/ranking' && req.method === 'GET') {
    const top = characters.slice().sort((a, b) => (b.level - a.level) || ((b.exp || 0) - (a.exp || 0))).slice(0, 50)
      .map(c => ({ name: c.name, owner: c.owner, cls: c.cls, level: c.level, mapId: c.mapId }));
    return sendJson(res, 200, { ranking: top });
  }

  if (urlPath === '/api/presence' && req.method === 'POST') {
    const { token, name, cls, level, mapId, x, y } = await readBody(req);
    const user = readToken(token);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
    presence.set(user, { user, name, cls, level, mapId, x, y, ts: Date.now() });
    return sendJson(res, 200, { ok: true });
  }

  if (urlPath === '/api/presence' && req.method === 'GET') {
    const map = query.map;
    const me = readToken(query.token);
    const now = Date.now();
    const players = [];
    for (const [user, p] of presence) {
      if (now - p.ts > PRESENCE_TTL) { presence.delete(user); continue; }
      if (user === me) continue;
      if (map && p.mapId !== map) continue;
      players.push({ name: p.name, cls: p.cls, level: p.level, x: p.x, y: p.y });
    }
    return sendJson(res, 200, { players });
  }

  return sendJson(res, 404, { error: 'Not found' });
}

function countOnline() {
  const now = Date.now(); let n = 0;
  for (const [u, p] of presence) { if (now - p.ts <= PRESENCE_TTL) n++; }
  return n;
}

// ---------- server ----------
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const urlPath = u.pathname;
  const query = Object.fromEntries(u.searchParams);
  if (urlPath.startsWith('/api/')) { handleApi(req, res, urlPath, query).catch(() => sendJson(res, 500, { error: 'server error' })); return; }
  serveStatic(req, res);
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log('MU Online server listening on :' + PORT);
    console.log('Static dir:', STATIC_DIR, '| Data dir:', DATA_DIR);
  });
  setInterval(() => { const now = Date.now(); for (const [u, p] of presence) if (now - p.ts > PRESENCE_TTL) presence.delete(u); }, 15000);
}

module.exports = { server, _internal: { makeToken, readToken, hashPassword, verifyPassword } };
