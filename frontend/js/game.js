// Game state and logic
const Game = {
  state: null,
  character: null,
  inventory: [],
  mapData: null,
  monsters: [],
  monsterInstances: {},
  lastUpdate: 0,
  running: false,
  clickTarget: null,
  targetMonster: null,
  attackCooldown: 0,
  restCooldown: 0,
  movementSpeed: 2.5,

  async init(charData) {
    this.character = charData.character;
    this.inventory = charData.inventory || [];
    this.running = true;
    this.clickTarget = null;
    this.targetMonster = null;
    this.attackCooldown = 0;

    await this.loadMap(this.character.map_id || 'lorencia');
    Renderer.init();
    UI.updateAll();
    this.loop();
    UI.log('Welcome to ' + this.mapData.name + '!', 'system');
  },

  async loadMap(mapId) {
    const mapRes = await API.getMap(mapId);
    this.mapData = mapRes.map;
    const monsterRes = await API.getMonsters(mapId);
    this.monsters = monsterRes.monsters;
    this.monsterInstances = {};
    this.monsters.forEach(m => {
      this.monsterInstances[m.instanceId] = {
        ...m,
        x: m.spawnX,
        y: m.spawnY,
        currentHp: m.hp,
        alive: true,
        respawnTimer: 0
      };
    });
  },

  loop() {
    if (!this.running) return;
    const now = Date.now();
    const dt = Math.min(50, now - (this.lastUpdate || now));
    this.lastUpdate = now;

    this.update(dt);
    Renderer.render();
    requestAnimationFrame(() => this.loop());
  },

  update(dt) {
    // Move character towards click target
    if (this.clickTarget) {
      const dx = this.clickTarget.x - this.character.pos_x;
      const dy = this.clickTarget.y - this.character.pos_y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 3) {
        this.clickTarget = null;
      } else {
        const speed = this.movementSpeed;
        this.character.pos_x += (dx / dist) * speed;
        this.character.pos_y += (dy / dist) * speed;
      }
    }

    // Attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    // Auto-attack target monster if close enough
    if (this.targetMonster && this.attackCooldown <= 0) {
      const m = this.monsterInstances[this.targetMonster];
      if (m && m.alive) {
        const dx = m.x - this.character.pos_x;
        const dy = m.y - this.character.pos_y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 30) {
          this.clickTarget = null;
          this.performAttack(m);
        }
      } else {
        this.targetMonster = null;
      }
    }

    // Monster respawn timers
    Object.values(this.monsterInstances).forEach(m => {
      if (!m.alive) {
        m.respawnTimer -= dt;
        if (m.respawnTimer <= 0) {
          m.alive = true;
          m.currentHp = m.hp;
          m.x = m.spawnX;
          m.y = m.spawnY;
        }
      }
    });

    // Check portal proximity
    if (this.mapData && this.mapData.portals) {
      this.mapData.portals.forEach(p => {
        const dx = p.x - this.character.pos_x;
        const dy = p.y - this.character.pos_y;
        if (Math.sqrt(dx * dx + dy * dy) < 10) {
          this.enterPortal(p);
        }
      });
    }

    // Rest cooldown
    if (this.restCooldown > 0) this.restCooldown -= dt;
  },

  async performAttack(monster) {
    this.attackCooldown = 1000;
    try {
      const result = await API.attack(this.character.id, monster.id);

      // Apply damage to monster
      monster.currentHp -= result.playerDamage;
      UI.log(`You hit ${monster.name} for ${result.playerDamage} damage!`, 'combat');

      if (result.monsterDamage > 0) {
        UI.log(`${monster.name} hits you for ${result.monsterDamage}!`, 'combat');
      }

      this.character.hp = result.playerHp;
      UI.updateBars();

      // Show damage numbers
      Renderer.addDmgNumber(monster.x, monster.y - 10, result.playerDamage, '#ffff00');
      if (result.monsterDamage > 0) {
        Renderer.addDmgNumber(this.character.pos_x, this.character.pos_y - 10, result.monsterDamage, '#ff4444');
      }

      // Check if monster died
      if (monster.currentHp <= 0) {
        monster.alive = false;
        monster.respawnTimer = 15000;
        this.targetMonster = null;

        const killResult = await API.killMonster(this.character.id, monster.id);
        UI.log(`Killed ${monster.name}! +${killResult.expGained} EXP, +${killResult.zenGained} Zen`, 'system');

        if (killResult.drops && killResult.drops.length > 0) {
          killResult.drops.forEach(d => UI.log(`Loot: ${d.name}`, 'loot'));
        }

        if (killResult.leveledUp) {
          UI.log(`LEVEL UP! You are now level ${killResult.character.level}!`, 'system');
        }

        this.character = killResult.character;
        // Reload inventory
        const charData = await API.loadCharacter(this.character.id);
        this.inventory = charData.inventory;
        UI.updateAll();
      }

      if (result.playerDied) {
        UI.log('You have been defeated! Respawning in town...', 'combat');
        this.targetMonster = null;
        this.clickTarget = null;
        this.character.pos_x = 130;
        this.character.pos_y = 130;
        this.character.hp = result.playerHp;
        UI.updateBars();
      }

    } catch (err) {
      UI.log('Attack failed: ' + err.message, 'info');
    }
  },

  async enterPortal(portal) {
    UI.log(`Entering portal to ${portal.targetMap}...`, 'system');
    this.character.pos_x = portal.targetX;
    this.character.pos_y = portal.targetY;
    this.character.map_id = portal.targetMap;
    this.targetMonster = null;
    this.clickTarget = null;
    await this.loadMap(portal.targetMap);
    UI.log('Welcome to ' + this.mapData.name + '!', 'system');
    UI.updateAll();
    await API.savePosition(this.character.id, portal.targetX, portal.targetY, portal.targetMap);
  },

  handleClick(worldX, worldY) {
    // Check if clicking on a monster
    const clickedMonster = this.getMonsterAt(worldX, worldY);
    if (clickedMonster) {
      this.targetMonster = clickedMonster.instanceId;
      this.clickTarget = { x: clickedMonster.x, y: clickedMonster.y };
      UI.log(`Targeting ${clickedMonster.name}`, 'info');
      return;
    }

    // Check if clicking on NPC
    if (this.mapData && this.mapData.npcs) {
      const clickedNpc = this.mapData.npcs.find(n => {
        const dx = n.x - worldX;
        const dy = n.y - worldY;
        return Math.sqrt(dx * dx + dy * dy) < 12;
      });
      if (clickedNpc) {
        const dx = clickedNpc.x - this.character.pos_x;
        const dy = clickedNpc.y - this.character.pos_y;
        if (Math.sqrt(dx * dx + dy * dy) < 40) {
          this.interactNPC(clickedNpc);
          return;
        } else {
          this.clickTarget = { x: clickedNpc.x, y: clickedNpc.y };
          this._pendingNpc = clickedNpc;
          return;
        }
      }
    }

    // Move to clicked position
    this.targetMonster = null;
    this.clickTarget = { x: worldX, y: worldY };
  },

  getMonsterAt(x, y) {
    for (const m of Object.values(this.monsterInstances)) {
      if (!m.alive) continue;
      const dx = m.x - x;
      const dy = m.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < 12) return m;
    }
    return null;
  },

  async interactNPC(npc) {
    if (npc.id === 'storage') {
      UI.log('Storage is not yet available.', 'info');
      return;
    }
    UI.log(`Talking to ${npc.name}...`, 'info');
    try {
      const shopData = await API.getShop(npc.id);
      UI.openShop(npc.name, shopData.items);
    } catch (err) {
      UI.log('NPC has nothing to offer.', 'info');
    }
  },

  stop() {
    this.running = false;
  }
};
