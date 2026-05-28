const fs = require('fs');
const path = require('path');

// Simple JSON-file based database (no external dependencies)
const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

let db = { accounts: [], characters: [], inventory: [], game_log: [] };

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
}

function loadDb() {
  ensureDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
      console.error('DB load error, starting fresh:', e.message);
    }
  }
}

function saveDb() {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function initDatabase() {
  loadDb();
  console.log('Database initialized (JSON file-based)');
}

// Query helpers
const DB = {
  accounts: {
    findByUsername(username) { return db.accounts.find(a => a.username === username); },
    findById(id) { return db.accounts.find(a => a.id === id); },
    insert(account) { db.accounts.push(account); saveDb(); }
  },
  characters: {
    findByAccount(accountId) { return db.characters.filter(c => c.account_id === accountId); },
    findById(id) { return db.characters.find(c => c.id === id); },
    findByName(name) { return db.characters.find(c => c.name === name); },
    findByIdAndAccount(id, accountId) { return db.characters.find(c => c.id === id && c.account_id === accountId); },
    insert(char) { db.characters.push(char); saveDb(); },
    update(id, data) {
      const idx = db.characters.findIndex(c => c.id === id);
      if (idx >= 0) { Object.assign(db.characters[idx], data); saveDb(); }
      return db.characters[idx];
    },
    delete(id) {
      db.characters = db.characters.filter(c => c.id !== id);
      saveDb();
    },
    count(accountId) { return db.characters.filter(c => c.account_id === accountId).length; }
  },
  inventory: {
    findByCharacter(charId) { return db.inventory.filter(i => i.character_id === charId); },
    findById(id) { return db.inventory.find(i => i.id === id); },
    findByIdAndChar(id, charId) { return db.inventory.find(i => i.id === id && i.character_id === charId); },
    insert(item) { db.inventory.push(item); saveDb(); },
    update(id, data) {
      const idx = db.inventory.findIndex(i => i.id === id);
      if (idx >= 0) { Object.assign(db.inventory[idx], data); saveDb(); }
      return db.inventory[idx];
    },
    delete(id) {
      db.inventory = db.inventory.filter(i => i.id !== id);
      saveDb();
    },
    deleteByCharacter(charId) {
      db.inventory = db.inventory.filter(i => i.character_id !== charId);
      saveDb();
    }
  }
};

module.exports = { initDatabase, DB };
