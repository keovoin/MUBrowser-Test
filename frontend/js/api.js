// API communication layer
const API = {
  baseUrl: '/api',
  token: null,

  setToken(token) {
    this.token = token;
    localStorage.setItem('mu_token', token);
  },

  getToken() {
    if (!this.token) this.token = localStorage.getItem('mu_token');
    return this.token;
  },

  clearToken() {
    this.token = null;
    localStorage.removeItem('mu_token');
    localStorage.removeItem('mu_username');
  },

  async request(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (this.getToken()) {
      opts.headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(this.baseUrl + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  // Auth
  async register(username, password, email) {
    const data = await this.request('POST', '/auth/register', { username, password, email });
    this.setToken(data.token);
    localStorage.setItem('mu_username', data.username);
    return data;
  },

  async login(username, password) {
    const data = await this.request('POST', '/auth/login', { username, password });
    this.setToken(data.token);
    localStorage.setItem('mu_username', data.username);
    return data;
  },

  // Characters
  async getCharacters() {
    return this.request('GET', '/character/list');
  },

  async createCharacter(name, characterClass) {
    return this.request('POST', '/character/create', { name, characterClass });
  },

  async deleteCharacter(id) {
    return this.request('DELETE', `/character/${id}`);
  },

  async loadCharacter(id) {
    return this.request('GET', `/character/${id}`);
  },

  async allocateStat(charId, stat, points) {
    return this.request('POST', `/character/${charId}/stats`, { stat, points });
  },

  async savePosition(charId, x, y, mapId) {
    return this.request('POST', `/character/${charId}/position`, { x, y, mapId });
  },

  // Game
  async getMap(mapId) {
    return this.request('GET', `/game/map/${mapId}`);
  },

  async getMonsters(mapId) {
    return this.request('GET', `/game/monsters/${mapId}`);
  },

  async attack(characterId, monsterId) {
    return this.request('POST', '/game/combat/attack', { characterId, monsterId });
  },

  async killMonster(characterId, monsterId) {
    return this.request('POST', '/game/combat/kill', { characterId, monsterId });
  },

  async rest(characterId) {
    return this.request('POST', '/game/rest', { characterId });
  },

  async buyItem(characterId, itemId) {
    return this.request('POST', '/game/shop/buy', { characterId, itemId });
  },

  async sellItem(characterId, inventoryId) {
    return this.request('POST', '/game/shop/sell', { characterId, inventoryId });
  },

  async equipItem(characterId, inventoryId) {
    return this.request('POST', '/game/equip', { characterId, inventoryId });
  },

  async unequipItem(characterId, inventoryId) {
    return this.request('POST', '/game/unequip', { characterId, inventoryId });
  },

  async useItem(characterId, inventoryId) {
    return this.request('POST', '/game/use-item', { characterId, inventoryId });
  },

  async getShop(npcId) {
    return this.request('GET', `/game/shop/${npcId}`);
  }
};
