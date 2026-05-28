const crypto = require('crypto');
const { DB } = require('../database');
const { MONSTERS } = require('../data/monsters');
const { ITEMS, getDrops } = require('../data/items');
const { CLASS_DATA } = require('../data/classes');
const { MAPS } = require('../data/maps');
const { SHOP_ITEMS } = require('../data/npcs');

function uuid() { return crypto.randomUUID(); }

function getExpForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

async function handleGame(req, res, pathname, sendJson) {
  const user = req.user;

  // GET /api/game/map/:mapId
  const mapMatch = pathname.match(/^\/api\/game\/map\/([^/]+)$/);
  if (mapMatch && req.method === 'GET') {
    const mapData = MAPS[mapMatch[1]];
    if (!mapData) return sendJson(res, 404, { error: 'Map not found' });
    return sendJson(res, 200, { map: mapData });
  }

  // GET /api/game/monsters/:mapId
  const monMatch = pathname.match(/^\/api\/game\/monsters\/([^/]+)$/);
  if (monMatch && req.method === 'GET') {
    const mapData = MAPS[monMatch[1]];
    if (!mapData) return sendJson(res, 404, { error: 'Map not found' });
    const monsters = (mapData.monsters || []).map(m => ({
      ...MONSTERS[m.id], spawnX: m.x, spawnY: m.y, instanceId: m.instanceId || uuid()
    }));
    return sendJson(res, 200, { monsters });
  }

  // POST /api/game/combat/attack
  if (pathname === '/api/game/combat/attack' && req.method === 'POST') {
    const { characterId, monsterId } = req.body;
    const character = DB.characters.findByIdAndAccount(characterId, user.id);
    if (!character) return sendJson(res, 404, { error: 'Character not found' });

    const monster = MONSTERS[monsterId];
    if (!monster) return sendJson(res, 404, { error: 'Monster not found' });

    const classData = CLASS_DATA[character.class];
    const baseDmg = character.strength * (classData.dmgPerStr || 1) + character.agility * (classData.dmgPerAgi || 0.3);

    // Add weapon damage
    const equipped = DB.inventory.findByCharacter(characterId).filter(i => i.equipped);
    let weaponDmg = 0;
    equipped.forEach(eq => {
      const item = ITEMS[eq.item_id];
      if (item && item.attack) weaponDmg += item.attack;
    });

    const variance = 0.8 + Math.random() * 0.4;
    const playerDmg = Math.max(1, Math.floor((baseDmg + weaponDmg) * variance));

    // Monster damage (reduced by defense from armor)
    let armorDef = 0;
    equipped.forEach(eq => {
      const item = ITEMS[eq.item_id];
      if (item && item.defense) armorDef += item.defense;
    });
    const monsterDmg = Math.max(1, Math.floor(monster.attack * (0.8 + Math.random() * 0.4) - armorDef * 0.5 - character.agility * 0.2));

    const newHp = Math.max(0, character.hp - monsterDmg);
    DB.characters.update(characterId, { hp: newHp });

    const result = { playerDamage: playerDmg, monsterDamage: monsterDmg, playerHp: newHp, playerMaxHp: character.max_hp, playerDied: newHp <= 0 };

    if (newHp <= 0) {
      const respawnHp = Math.floor(character.max_hp * 0.5);
      DB.characters.update(characterId, { hp: respawnHp, pos_x: 130, pos_y: 130 });
      result.playerHp = respawnHp;
      result.respawned = true;
    }

    return sendJson(res, 200, result);
  }

  // POST /api/game/combat/kill
  if (pathname === '/api/game/combat/kill' && req.method === 'POST') {
    const { characterId, monsterId } = req.body;
    const character = DB.characters.findByIdAndAccount(characterId, user.id);
    if (!character) return sendJson(res, 404, { error: 'Character not found' });

    const monster = MONSTERS[monsterId];
    if (!monster) return sendJson(res, 404, { error: 'Monster not found' });

    const classData = CLASS_DATA[character.class];
    const expGained = monster.exp;
    const zenGained = monster.zen + Math.floor(Math.random() * monster.zen * 0.5);
    const drops = getDrops(monster.drops || [], character.level);

    drops.forEach(drop => {
      DB.inventory.insert({ id: uuid(), character_id: characterId, item_id: drop.id, slot: -1, equipped: 0, quantity: 1, enhancement: 0 });
    });

    let newExp = character.experience + expGained;
    let newLevel = character.level;
    let newStatPoints = character.stat_points;
    let leveledUp = false;

    const expNeeded = getExpForLevel(newLevel);
    if (newExp >= expNeeded) {
      newExp -= expNeeded;
      newLevel++;
      newStatPoints += 5;
      leveledUp = true;
    }

    let newMaxHp = character.max_hp;
    let newMaxMp = character.max_mp;
    if (leveledUp) {
      newMaxHp += classData.hpPerLevel;
      newMaxMp += classData.mpPerLevel;
    }

    const updates = { experience: newExp, level: newLevel, stat_points: newStatPoints, zen: character.zen + zenGained, max_hp: newMaxHp, max_mp: newMaxMp };
    if (leveledUp) { updates.hp = newMaxHp; updates.mp = newMaxMp; }

    DB.characters.update(characterId, updates);
    const updatedChar = DB.characters.findById(characterId);

    return sendJson(res, 200, {
      expGained, zenGained, drops: drops.map(d => ({ ...ITEMS[d.id], inventoryId: d.id })),
      leveledUp, character: updatedChar
    });
  }

  // POST /api/game/rest
  if (pathname === '/api/game/rest' && req.method === 'POST') {
    const { characterId } = req.body;
    const character = DB.characters.findByIdAndAccount(characterId, user.id);
    if (!character) return sendJson(res, 404, { error: 'Character not found' });

    const newHp = Math.min(character.max_hp, character.hp + Math.floor(character.max_hp * 0.1));
    const newMp = Math.min(character.max_mp, character.mp + Math.floor(character.max_mp * 0.1));
    DB.characters.update(characterId, { hp: newHp, mp: newMp });
    return sendJson(res, 200, { hp: newHp, mp: newMp, maxHp: character.max_hp, maxMp: character.max_mp });
  }

  // POST /api/game/shop/buy
  if (pathname === '/api/game/shop/buy' && req.method === 'POST') {
    const { characterId, itemId } = req.body;
    const character = DB.characters.findByIdAndAccount(characterId, user.id);
    if (!character) return sendJson(res, 404, { error: 'Character not found' });

    const item = ITEMS[itemId];
    if (!item || !item.buyPrice) return sendJson(res, 404, { error: 'Item not for sale' });
    if (character.zen < item.buyPrice) return sendJson(res, 400, { error: 'Not enough Zen' });

    DB.characters.update(characterId, { zen: character.zen - item.buyPrice });
    DB.inventory.insert({ id: uuid(), character_id: characterId, item_id: itemId, slot: -1, equipped: 0, quantity: 1, enhancement: 0 });

    const updatedChar = DB.characters.findById(characterId);
    return sendJson(res, 200, { character: updatedChar, item: { ...item, id: itemId } });
  }

  // POST /api/game/shop/sell
  if (pathname === '/api/game/shop/sell' && req.method === 'POST') {
    const { characterId, inventoryId } = req.body;
    const character = DB.characters.findByIdAndAccount(characterId, user.id);
    if (!character) return sendJson(res, 404, { error: 'Character not found' });

    const invItem = DB.inventory.findByIdAndChar(inventoryId, characterId);
    if (!invItem) return sendJson(res, 404, { error: 'Item not in inventory' });

    const item = ITEMS[invItem.item_id];
    const sellPrice = item ? Math.floor((item.buyPrice || 100) / 2) : 50;
    DB.inventory.delete(inventoryId);
    DB.characters.update(characterId, { zen: character.zen + sellPrice });

    const updatedChar = DB.characters.findById(characterId);
    return sendJson(res, 200, { character: updatedChar, zenGained: sellPrice });
  }

  // POST /api/game/equip
  if (pathname === '/api/game/equip' && req.method === 'POST') {
    const { characterId, inventoryId } = req.body;
    const character = DB.characters.findByIdAndAccount(characterId, user.id);
    if (!character) return sendJson(res, 404, { error: 'Character not found' });

    const invItem = DB.inventory.findByIdAndChar(inventoryId, characterId);
    if (!invItem) return sendJson(res, 404, { error: 'Item not found' });

    const item = ITEMS[invItem.item_id];
    if (!item || !item.slot) return sendJson(res, 400, { error: 'Item cannot be equipped' });

    // Unequip items in same slot
    const allInv = DB.inventory.findByCharacter(characterId);
    allInv.forEach(eq => {
      if (eq.equipped) {
        const eqItem = ITEMS[eq.item_id];
        if (eqItem && eqItem.slot === item.slot) {
          DB.inventory.update(eq.id, { equipped: 0 });
        }
      }
    });

    DB.inventory.update(inventoryId, { equipped: 1 });
    const inventory = DB.inventory.findByCharacter(characterId);
    return sendJson(res, 200, { inventory });
  }

  // POST /api/game/unequip
  if (pathname === '/api/game/unequip' && req.method === 'POST') {
    const { characterId, inventoryId } = req.body;
    DB.inventory.update(inventoryId, { equipped: 0 });
    const inventory = DB.inventory.findByCharacter(characterId);
    return sendJson(res, 200, { inventory });
  }

  // POST /api/game/use-item
  if (pathname === '/api/game/use-item' && req.method === 'POST') {
    const { characterId, inventoryId } = req.body;
    const character = DB.characters.findByIdAndAccount(characterId, user.id);
    if (!character) return sendJson(res, 404, { error: 'Character not found' });

    const invItem = DB.inventory.findByIdAndChar(inventoryId, characterId);
    if (!invItem) return sendJson(res, 404, { error: 'Item not found' });

    const item = ITEMS[invItem.item_id];
    if (!item || item.type !== 'consumable') return sendJson(res, 400, { error: 'Item cannot be used' });

    let newHp = character.hp;
    let newMp = character.mp;
    if (item.healHp) newHp = Math.min(character.max_hp, character.hp + item.healHp);
    if (item.healMp) newMp = Math.min(character.max_mp, character.mp + item.healMp);

    DB.characters.update(characterId, { hp: newHp, mp: newMp });

    if (invItem.quantity <= 1) {
      DB.inventory.delete(inventoryId);
    } else {
      DB.inventory.update(inventoryId, { quantity: invItem.quantity - 1 });
    }

    const updatedChar = DB.characters.findById(characterId);
    return sendJson(res, 200, { character: updatedChar });
  }

  // GET /api/game/shop/:npcId
  const shopMatch = pathname.match(/^\/api\/game\/shop\/([^/]+)$/);
  if (shopMatch && req.method === 'GET') {
    const shop = SHOP_ITEMS[shopMatch[1]];
    if (!shop) return sendJson(res, 404, { error: 'Shop not found' });
    const items = shop.map(itemId => ({ id: itemId, ...ITEMS[itemId] }));
    return sendJson(res, 200, { items });
  }

  return sendJson(res, 404, { error: 'Not found' });
}

module.exports = { handleGame };
