// Main application controller
let selectedClass = 'dark_knight';

// Screen management
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Auth tab switching
function showAuthTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (tab === 'login') {
    document.querySelectorAll('.tab')[0].classList.add('active');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
  } else {
    document.querySelectorAll('.tab')[1].classList.add('active');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
  }
  document.getElementById('auth-error').textContent = '';
}

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  try {
    await API.login(username, password);
    loadCharacterSelect();
  } catch (err) {
    document.getElementById('auth-error').textContent = err.message;
  }
});

// Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const email = document.getElementById('reg-email').value;
  try {
    await API.register(username, password, email);
    loadCharacterSelect();
  } catch (err) {
    document.getElementById('auth-error').textContent = err.message;
  }
});

// Character select
async function loadCharacterSelect() {
  showScreen('screen-charselect');
  try {
    const data = await API.getCharacters();
    const container = document.getElementById('character-list');
    if (data.characters.length === 0) {
      container.innerHTML = '<p style="color:#888">No characters yet. Create one!</p>';
    } else {
      container.innerHTML = data.characters.map(c => `
        <div class="char-card" onclick="enterGame('${c.id}')">
          <div class="char-name">${c.name}</div>
          <div class="char-info">${c.class.replace(/_/g, ' ')}</div>
          <div class="char-info">Level ${c.level}</div>
          <div class="char-delete" onclick="event.stopPropagation(); deleteChar('${c.id}')">✕ Delete</div>
        </div>
      `).join('');
    }
  } catch (err) {
    document.getElementById('character-list').innerHTML = '<p style="color:#ff4444">' + err.message + '</p>';
  }
}

// Create character modal
function showCreateCharacter() {
  document.getElementById('create-char-modal').classList.remove('hidden');
  document.getElementById('create-error').textContent = '';
}
function hideCreateCharacter() {
  document.getElementById('create-char-modal').classList.add('hidden');
}

// Class selection
document.querySelectorAll('.class-option').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.class-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    selectedClass = el.dataset.class;
  });
});

async function createCharacter() {
  const name = document.getElementById('char-name').value.trim();
  if (!name) {
    document.getElementById('create-error').textContent = 'Enter a name';
    return;
  }
  try {
    await API.createCharacter(name, selectedClass);
    hideCreateCharacter();
    loadCharacterSelect();
  } catch (err) {
    document.getElementById('create-error').textContent = err.message;
  }
}

async function deleteChar(id) {
  if (!confirm('Delete this character? This cannot be undone!')) return;
  try {
    await API.deleteCharacter(id);
    loadCharacterSelect();
  } catch (err) {
    alert(err.message);
  }
}

// Enter game
async function enterGame(charId) {
  try {
    const data = await API.loadCharacter(charId);
    showScreen('screen-game');
    await Game.init(data);
  } catch (err) {
    alert('Failed to load character: ' + err.message);
  }
}

// Game actions
function toggleInventory() {
  const panel = document.getElementById('panel-inventory');
  panel.classList.toggle('hidden');
  document.getElementById('panel-stats').classList.add('hidden');
  document.getElementById('panel-shop').classList.add('hidden');
  if (!panel.classList.contains('hidden')) {
    UI.renderInventory();
  }
}

function toggleStats() {
  const panel = document.getElementById('panel-stats');
  panel.classList.toggle('hidden');
  document.getElementById('panel-inventory').classList.add('hidden');
  document.getElementById('panel-shop').classList.add('hidden');
  if (!panel.classList.contains('hidden')) {
    UI.renderStats();
  }
}

function closeShop() {
  document.getElementById('panel-shop').classList.add('hidden');
}

async function restCharacter() {
  if (Game.restCooldown > 0) return;
  try {
    const result = await API.rest(Game.character.id);
    Game.character.hp = result.hp;
    Game.character.mp = result.mp;
    Game.restCooldown = 3000;
    UI.updateBars();
    UI.log('Resting... HP/MP recovered.', 'system');
  } catch (err) {
    UI.log(err.message, 'info');
  }
}

async function addStat(stat) {
  try {
    const result = await API.allocateStat(Game.character.id, stat, 1);
    Game.character = result.character;
    UI.renderStats();
    UI.updateAll();
    UI.log(`+1 ${stat}!`, 'system');
  } catch (err) {
    UI.log(err.message, 'info');
  }
}

async function equipItem(invId) {
  try {
    const result = await API.equipItem(Game.character.id, invId);
    // Reload inventory
    const data = await API.loadCharacter(Game.character.id);
    Game.inventory = data.inventory;
    UI.renderInventory();
    UI.log('Item equipped!', 'system');
  } catch (err) {
    UI.log(err.message, 'info');
  }
}

async function unequipItem(invId) {
  try {
    await API.unequipItem(Game.character.id, invId);
    const data = await API.loadCharacter(Game.character.id);
    Game.inventory = data.inventory;
    UI.renderInventory();
    UI.log('Item unequipped.', 'system');
  } catch (err) {
    UI.log(err.message, 'info');
  }
}

async function useItem(invId) {
  try {
    const result = await API.useItem(Game.character.id, invId);
    Game.character = result.character;
    const data = await API.loadCharacter(Game.character.id);
    Game.inventory = data.inventory;
    UI.renderInventory();
    UI.updateBars();
    UI.log('Used item!', 'system');
  } catch (err) {
    UI.log(err.message, 'info');
  }
}

async function buyItem(itemId) {
  try {
    const result = await API.buyItem(Game.character.id, itemId);
    Game.character = result.character;
    const data = await API.loadCharacter(Game.character.id);
    Game.inventory = data.inventory;
    UI.updateAll();
    UI.log(`Bought ${result.item.name}!`, 'loot');
  } catch (err) {
    UI.log(err.message, 'info');
  }
}

async function saveAndQuit() {
  if (Game.character) {
    try {
      await API.savePosition(
        Game.character.id,
        Game.character.pos_x,
        Game.character.pos_y,
        Game.character.map_id
      );
    } catch (e) {}
  }
  Game.stop();
  loadCharacterSelect();
}

function logout() {
  API.clearToken();
  showScreen('screen-auth');
}

// Auto-login check
(function() {
  if (API.getToken()) {
    loadCharacterSelect();
  }
})();
