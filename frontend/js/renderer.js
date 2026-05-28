// Canvas rendering engine
const Renderer = {
  canvas: null,
  ctx: null,
  camera: { x: 0, y: 0 },
  dmgNumbers: [],
  tileColors: {},
  portalAnim: 0,

  init() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const worldX = screenX + this.camera.x;
      const worldY = screenY + this.camera.y;
      Game.handleClick(worldX, worldY);
    });

    // Generate tile colors for variety
    this.generateTiles();
  },

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  generateTiles() {
    // Pre-generate some variation for map tiles
    this.tileVariation = [];
    for (let i = 0; i < 256 * 256; i++) {
      this.tileVariation.push(Math.random() * 0.15 - 0.075);
    }
  },

  render() {
    if (!Game.character || !Game.mapData) return;

    const { ctx, canvas } = this;
    const char = Game.character;
    const map = Game.mapData;

    // Update camera to follow player
    this.camera.x = char.pos_x * 4 - canvas.width / 2;
    this.camera.y = char.pos_y * 4 - canvas.height / 2;

    // Clear
    ctx.fillStyle = map.bgColor || '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground tiles
    this.drawGround(map);

    // Draw safe zone
    if (map.safezone) {
      const sz = map.safezone;
      ctx.fillStyle = 'rgba(100, 200, 100, 0.08)';
      ctx.fillRect(
        sz.x1 * 4 - this.camera.x, sz.y1 * 4 - this.camera.y,
        (sz.x2 - sz.x1) * 4, (sz.y2 - sz.y1) * 4
      );
      ctx.strokeStyle = 'rgba(100, 200, 100, 0.3)';
      ctx.strokeRect(
        sz.x1 * 4 - this.camera.x, sz.y1 * 4 - this.camera.y,
        (sz.x2 - sz.x1) * 4, (sz.y2 - sz.y1) * 4
      );
    }

    // Draw portals
    this.portalAnim += 0.05;
    if (map.portals) {
      map.portals.forEach(p => {
        const sx = p.x * 4 - this.camera.x;
        const sy = p.y * 4 - this.camera.y;
        const glow = Math.sin(this.portalAnim) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(sx, sy, 20, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 150, 255, ${glow * 0.4})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(150, 200, 255, ${glow})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.label, sx, sy + 30);
      });
    }

    // Draw NPCs
    if (map.npcs) {
      map.npcs.forEach(npc => {
        const sx = npc.x * 4 - this.camera.x;
        const sy = npc.y * 4 - this.camera.y;
        // NPC body
        ctx.beginPath();
        ctx.arc(sx, sy, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#44aaff';
        ctx.fill();
        ctx.strokeStyle = '#88ccff';
        ctx.lineWidth = 2;
        ctx.stroke();
        // NPC name
        ctx.fillStyle = '#88ccff';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(npc.name, sx, sy - 20);
        // Exclamation mark
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('!', sx, sy + 5);
      });
    }

    // Draw monsters
    Object.values(Game.monsterInstances).forEach(m => {
      if (!m.alive) return;
      const sx = m.x * 4 - this.camera.x;
      const sy = m.y * 4 - this.camera.y;

      // Skip if off screen
      if (sx < -40 || sx > canvas.width + 40 || sy < -40 || sy > canvas.height + 40) return;

      // Monster body
      const isTarget = Game.targetMonster === m.instanceId;
      ctx.beginPath();
      ctx.arc(sx, sy, 12, 0, Math.PI * 2);
      ctx.fillStyle = this.getMonsterColor(m.level);
      ctx.fill();
      if (isTarget) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Monster name & HP
      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.name, sx, sy - 18);

      // HP bar
      const hpPct = m.currentHp / m.hp;
      ctx.fillStyle = '#333';
      ctx.fillRect(sx - 15, sy - 14, 30, 4);
      ctx.fillStyle = hpPct > 0.5 ? '#00cc00' : hpPct > 0.25 ? '#cccc00' : '#cc0000';
      ctx.fillRect(sx - 15, sy - 14, 30 * hpPct, 4);
    });

    // Draw player
    const px = char.pos_x * 4 - this.camera.x;
    const py = char.pos_y * 4 - this.camera.y;

    ctx.beginPath();
    ctx.arc(px, py, 14, 0, Math.PI * 2);
    ctx.fillStyle = this.getClassColor(char.class);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Player name
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(char.name, px, py - 20);

    // Level indicator
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(char.level, px, py + 4);

    // Click target indicator
    if (Game.clickTarget) {
      const tx = Game.clickTarget.x * 4 - this.camera.x;
      const ty = Game.clickTarget.y * 4 - this.camera.y;
      ctx.beginPath();
      ctx.arc(tx, ty, 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Damage numbers
    this.renderDmgNumbers();
  },

  drawGround(map) {
    const { ctx, canvas, camera } = this;
    const tileSize = 32;

    const startCol = Math.floor(camera.x / tileSize);
    const startRow = Math.floor(camera.y / tileSize);
    const endCol = startCol + Math.ceil(canvas.width / tileSize) + 1;
    const endRow = startRow + Math.ceil(canvas.height / tileSize) + 1;

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        if (col < 0 || row < 0 || col >= map.width / 2 || row >= map.height / 2) continue;

        const x = col * tileSize - camera.x;
        const y = row * tileSize - camera.y;
        const idx = (row * 128 + col) % this.tileVariation.length;
        const v = this.tileVariation[idx];

        // Base color with variation
        ctx.fillStyle = this.adjustColor(map.bgColor, v);
        ctx.fillRect(x, y, tileSize, tileSize);

        // Grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }
  },

  getMonsterColor(level) {
    if (level <= 3) return '#88cc44';
    if (level <= 8) return '#cc8844';
    if (level <= 15) return '#cc4444';
    if (level <= 22) return '#8844cc';
    return '#cc44cc';
  },

  getClassColor(cls) {
    switch (cls) {
      case 'dark_knight': return '#cc2222';
      case 'dark_wizard': return '#2222cc';
      case 'fairy_elf': return '#22cc22';
      default: return '#888888';
    }
  },

  adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    r = Math.max(0, Math.min(255, Math.floor(r * (1 + amount))));
    g = Math.max(0, Math.min(255, Math.floor(g * (1 + amount))));
    b = Math.max(0, Math.min(255, Math.floor(b * (1 + amount))));
    return `rgb(${r},${g},${b})`;
  },

  addDmgNumber(x, y, value, color) {
    this.dmgNumbers.push({ x, y, value, color, life: 60, dy: 0 });
  },

  renderDmgNumbers() {
    const { ctx } = this;
    this.dmgNumbers = this.dmgNumbers.filter(d => {
      d.life--;
      d.dy -= 0.5;
      const sx = d.x * 4 - this.camera.x;
      const sy = d.y * 4 - this.camera.y + d.dy;
      ctx.fillStyle = d.color;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = d.life / 60;
      ctx.fillText(d.value, sx, sy);
      ctx.globalAlpha = 1;
      return d.life > 0;
    });
  }
};
