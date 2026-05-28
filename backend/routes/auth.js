const crypto = require('crypto');
const { DB } = require('../database');
const { generateToken, hashPassword, verifyPassword } = require('../middleware/auth');

function uuid() { return crypto.randomUUID(); }

async function handleAuth(req, res, pathname, sendJson) {
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return sendJson(res, 400, { error: 'Username and password are required' });
    }
    if (username.length < 3 || username.length > 16) {
      return sendJson(res, 400, { error: 'Username must be 3-16 characters' });
    }
    if (password.length < 4) {
      return sendJson(res, 400, { error: 'Password must be at least 4 characters' });
    }

    if (DB.accounts.findByUsername(username)) {
      return sendJson(res, 409, { error: 'Username already exists' });
    }

    const id = uuid();
    const hashed = hashPassword(password);
    DB.accounts.insert({ id, username, password: hashed, email: email || null, created_at: new Date().toISOString() });

    const token = generateToken({ id, username });
    return sendJson(res, 201, { token, username });
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendJson(res, 400, { error: 'Username and password are required' });
    }

    const account = DB.accounts.findByUsername(username);
    if (!account) {
      return sendJson(res, 401, { error: 'Invalid credentials' });
    }

    if (!verifyPassword(password, account.password)) {
      return sendJson(res, 401, { error: 'Invalid credentials' });
    }

    const token = generateToken({ id: account.id, username: account.username });
    return sendJson(res, 200, { token, username: account.username });
  }

  return sendJson(res, 404, { error: 'Not found' });
}

module.exports = { handleAuth };
