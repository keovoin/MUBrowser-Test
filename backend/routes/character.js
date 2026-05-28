const crypto = require('crypto');
const { DB } = require('../database');
const { CLASS_DATA } = require('../data/classes');
const { ITEMS } = require('../data/items');

function uuid() { return crypto.randomUUID(); }

async function handleCharacter(req, res, pathname, sendJson) {
  const user = req.user;

  // GET /api/character/list
  if (pathname === '/api/character/list' && req.method === 'GET') {
    const characters = DB.characters.findByAccount(user.id);
    return sendJson(res, 200, { characters });
  }

  // POST /api/character/create
  if (pathname === '/api/character/create' && req.method === 'POST') {
    const { name, characterClass } = req.body;

    if (!name || !characterClass) {
      return sendJson(res, 400, { error: 'Name and class are required' });
    }
    if (name.length < 2 || name.length > 12) {
      return sendJson(res, 400, { error: 'Name must be 2-12 characters' });
    }

    const classData = CLASS_DATA[characterClass];
    if (!classData) {
      return sendJson(res, 400, { error: 'Invalid class' });
    }

    if (DB.characters.findByName(name)) {
      return sendJson(res, 409, { error: 'Character name already taken' });
    }

    if (DB.characters.count(user.id) >= 3) {
      return sendJson(res, 400, { error: 'Maximum 3 characters per account' });
    }

    const id = uuid();
    const character = {
      id, account_id: user.id, name, class: characterClass,
      level: 1, experience: 0,
      hp: classData.baseHp, max_hp: classData.baseHp,
      mp: classData.baseMp, max_mp: classData.baseMp,
      strength: classData.baseStr, agility: classData.baseAgi,
      vitality: classData.baseVit, energy: classData.baseEne,
      stat_points: 0, zen: 10000,
      map_id: 'lorencia', pos_x: 130, pos_y: 130,
      created_at: new Date().toISOString()
    };
    DB.characters.insert(character);

    // Give starting items
    (classData.startingItems || []).forEach((itemId, idx) => {
      DB.inventory.insert({ id: uuid(), character_id: id, item_id: itemId, slot: idx, equipped: 1, quantity: 1, enhancement: 0 });
    });

    return sendJson(res, 201, { character });
  }

  // DELETE /api/character/:id
  const deleteMatch = pathname.match(/^\/api\/character\/([^/]+)$/);
  if (deleteMatch && req.method === 'DELETE') {
    const charId = deleteMatch[1];
    const character = DB.characters.findByIdAndAccount(charId, user.id);
    if (!character) return sendJson(res, 404, { error: 'Character not found' });

    DB.inventory.deleteByCharacter(charId);
    DB.characters.delete(charId);
    return sendJson(res, 200, { success: true });
  }

  // GET /api/character/:id
  const getMatch = pathname.match(/^\/api\/character\/([^/]+)$/);
  if (getMatch && req.method === 'GET') {
    const charId = getMatch[1];
    const character = DB.characters.findByIdAndAccount(charId, user.id);
    if (!character) return sendJson(res, 404, { error: 'Character not found' });

    const inventory = DB.inventory.findByCharacter(charId).map(inv => ({
      ...inv, item: ITEMS[inv.item_id] || { name: 'Unknown', type: 'misc' }
    }));
    return sendJson(res, 200, { character, inventory });
  }

  // POST /api/character/:id/stats
  const statsMatch = pathname.match(/^\/api\/character\/([^/]+)\/stats$/);
  if (statsMatch && req.method === 'POST') {
    const charId = statsMatch[1];
    const { stat, points } = req.body;
    const validStats = ['strength', 'agility', 'vitality', 'energy'];

    if (!validStats.includes(stat) || !points || points < 1) {
      return sendJson(res, 400, { error: 'Invalid stat allocation' });
    }

    const character = DB.characters.findByIdAndAccount(charId, user.id);
    if (!character) return sendJson(res, 404, { error: 'Character not found' });
    if (character.stat_points < points) return sendJson(res, 400, { error: 'Not enough stat points' });

    const classData = CLASS_DATA[character.class];
    const newStatValue = character[stat] + points;
    let updates = { [stat]: newStatValue, stat_points: character.stat_points - points };

    if (stat === 'vitality') {
      updates.max_hp = classData.baseHp + (newStatValue - classData.baseVit) * classData.hpPerVit;
    }
    if (stat === 'energy') {
      updates.max_mp = classData.baseMp + (newStatValue - classData.baseEne) * classData.mpPerEne;
    }

    const updated = DB.characters.update(charId, updates);
    return sendJson(res, 200, { character: updated });
  }

  // POST /api/character/:id/position
  const posMatch = pathname.match(/^\/api\/character\/([^/]+)\/position$/);
  if (posMatch && req.method === 'POST') {
    const charId = posMatch[1];
    const { x, y, mapId } = req.body;
    DB.characters.update(charId, { pos_x: x, pos_y: y, map_id: mapId || 'lorencia' });
    return sendJson(res, 200, { success: true });
  }

  return sendJson(res, 404, { error: 'Not found' });
}

module.exports = { handleCharacter };
