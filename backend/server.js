const http = require('http');
const fs = require('fs');
const path = require('path');
const { initDatabase } = require('./database');
const { handleAuth } = require('./routes/auth');
const { handleCharacter } = require('./routes/character');
const { handleGame } = require('./routes/game');
const { authenticateToken } = require('./middleware/auth');

const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Initialize database
initDatabase();

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Serve index.html for SPA routes
      fs.readFile(path.join(FRONTEND_DIR, 'index.html'), (e, html) => {
        if (e) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // API routes
  if (pathname.startsWith('/api/')) {
    const body = req.method !== 'GET' ? await parseBody(req) : {};
    req.body = body;
    req.query = Object.fromEntries(url.searchParams);

    // Auth routes (no token needed)
    if (pathname.startsWith('/api/auth/')) {
      return handleAuth(req, res, pathname, sendJson);
    }

    // Protected routes - verify token
    const user = authenticateToken(req);
    if (!user) {
      return sendJson(res, 401, { error: 'Unauthorized' });
    }
    req.user = user;

    if (pathname.startsWith('/api/character')) {
      return handleCharacter(req, res, pathname, sendJson);
    }
    if (pathname.startsWith('/api/game')) {
      return handleGame(req, res, pathname, sendJson);
    }

    return sendJson(res, 404, { error: 'Not found' });
  }

  // Static files
  let filePath = path.join(FRONTEND_DIR, pathname === '/' ? 'index.html' : pathname);
  serveStatic(res, filePath);
});

server.listen(PORT, () => {
  console.log(`\n  MU Online Browser Game`);
  console.log(`  ========================`);
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`  Open in your browser to play!\n`);
});
