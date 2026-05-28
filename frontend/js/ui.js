// UI management
const UI = {
  updateAll() {
    this.updateTopbar();
    this.updateBars();
  },

  updateTopbar() {
    const c = Game.character;
    if (!c) return;
    document.getElementById('ui-charname').textContent = c.name;
    document.getElementById('ui-level').textContent = `Lv.${c.level}`;
    document.getElementById('ui-map').textContent = Game.mapData ? Game.mapData.name : '';
    document.getElementById('ui-zen').textContent = `💰 ${c.zen.toLocaleString()} Zen`;
  },

  updateBars() {
    const c = Game.character;
    if (!c) return;
    const expNeeded = Math.floor(100 * Math.pow(1.5, c.level - 1));

    document.getElementById('hp-bar').style.width = (c.hp / c.max_hp * 100) + '%';
    document.getElementById('hp-text').textContent = `${c.hp}/${c.max_hp}`;
    document.getElementById('mp-bar').style.width = (c.mp / c.max_mp * 100) + '%';
    document.getElementById('mp-text').textContent = `${c.mp}/${c.max_mp}`;
    document.getElementById('exp-bar').style.width = (c.experience / expNeeded * 100) + '%';
    document.getElementById('exp-text').textContent = `${c.experience}/${expNeeded}`;
  },

  log(msg, type) {
    const container = document.getElementById('log-messages');
    const el = document.createElement('div');
    el.className = `log-msg log-${type || 'info'}`;
    el.textContent = msg;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    // Keep only last 50 messages
    while (container.children.length > 50) {
      container.removeChild(container.firstChild);
    }
  },

  // Inventory panel
  renderInventory() {
    const equipped = Game.inventory.filter(i => i.equipped);
    const unequipped = Game.inventory.filter(i => !i.equipped);

    let html = '<div style="margin-bottom:8px;color:#aaa;font-size:12px;">Equipped:</div>';
    if (equipped.length === 0) {
      html += '<div style="color:#666;font-size:12px;">Nothing equipped</div>';
    }
    equipped.forEach(inv => {
      html += `<div class="inv-item equipped">
        <div class="inv-item-name">${inv.item.name} <small>${inv.item.slot || ''}</small></div>
        <div class="inv-item-actions">
          <button onclick="unequipItem('${inv.id}')">Unequip</button>
        </div>
      </div>`;
    });

    document.getElementById('equipped-items').innerHTML = html;

    let invHtml = '<div style="margin-bottom:8px;color:#aaa;font-size:12px;">Bag:</div>';
    if (unequipped.length === 0) {
      invHtml += '<div style="color:#666;font-size:12px;">Empty</div>';
    }
    unequipped.forEach(inv => {
      const actions = [];
      if (inv.item.slot) actions.push(`<button onclick="equipItem('${inv.id}')">Equip</button>`);
      if (inv.item.type === 'consumable') actions.push(`<button onclick="useItem('${inv.id}')">Use</button>`);
      invHtml += `<div class="inv-item">
        <div class="inv-item-name">${inv.item.name} ${inv.quantity > 1 ? 'x' + inv.quantity : ''}
          <small>${inv.item.description || ''}</small>
        </div>
        <div class="inv-item-actions">${actions.join('')}</div>
      </div>`;
    });

    document.getElementById('inventory-items').innerHTML = invHtml;
  },

  // Stats panel
  renderStats() {
    const c = Game.character;
    const expNeeded = Math.floor(100 * Math.pow(1.5, c.level - 1));
    const canAdd = c.stat_points > 0;
    const addBtn = (stat) => canAdd ? `<button class="stat-add" onclick="addStat('${stat}')">+</button>` : '';

    document.getElementById('stats-content').innerHTML = `
      <div class="stat-points-info">Available Points: ${c.stat_points}</div>
      <div class="stat-row"><span class="stat-label">Level</span><span class="stat-value">${c.level}</span></div>
      <div class="stat-row"><span class="stat-label">EXP</span><span class="stat-value">${c.experience}/${expNeeded}</span></div>
      <div class="stat-row"><span class="stat-label">Class</span><span class="stat-value">${c.class.replace(/_/g, ' ')}</span></div>
      <hr style="border-color:#222;margin:8px 0;">
      <div class="stat-row"><span class="stat-label">Strength</span><span class="stat-value">${c.strength} ${addBtn('strength')}</span></div>
      <div class="stat-row"><span class="stat-label">Agility</span><span class="stat-value">${c.agility} ${addBtn('agility')}</span></div>
      <div class="stat-row"><span class="stat-label">Vitality</span><span class="stat-value">${c.vitality} ${addBtn('vitality')}</span></div>
      <div class="stat-row"><span class="stat-label">Energy</span><span class="stat-value">${c.energy} ${addBtn('energy')}</span></div>
      <hr style="border-color:#222;margin:8px 0;">
      <div class="stat-row"><span class="stat-label">HP</span><span class="stat-value">${c.hp}/${c.max_hp}</span></div>
      <div class="stat-row"><span class="stat-label">MP</span><span class="stat-value">${c.mp}/${c.max_mp}</span></div>
      <div class="stat-row"><span class="stat-label">Zen</span><span class="stat-value">${c.zen.toLocaleString()}</span></div>
    `;
  },

  // Shop panel
  openShop(npcName, items) {
    let html = '';
    items.forEach(item => {
      html += `<div class="shop-item">
        <div class="shop-item-info">${item.name}
          <small>${item.description || ''}</small>
          <small class="shop-item-price">💰 ${item.buyPrice} Zen</small>
        </div>
        <button onclick="buyItem('${item.id}')">Buy</button>
      </div>`;
    });
    document.getElementById('shop-items').innerHTML = html;
    document.getElementById('panel-shop').classList.remove('hidden');
    document.getElementById('panel-inventory').classList.add('hidden');
    document.getElementById('panel-stats').classList.add('hidden');
  }
};
