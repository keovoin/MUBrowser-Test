const MAPS = {
  lorencia: {
    id: 'lorencia',
    name: 'Lorencia',
    width: 256,
    height: 256,
    tileSize: 32,
    bgColor: '#2d5a27',
    description: 'A peaceful town surrounded by grasslands.',
    levelRange: [1, 15],
    npcs: [
      { id: 'shop_weapon', x: 100, y: 80, name: 'Hanzo (Weapons)' },
      { id: 'shop_armor', x: 140, y: 80, name: 'Pasi (Armor)' },
      { id: 'shop_potion', x: 170, y: 90, name: 'Alex (Potions)' },
      { id: 'storage', x: 90, y: 120, name: 'Vault Keeper' }
    ],
    monsters: [
      { id: 'spider', x: 60, y: 180, instanceId: 'm1' },
      { id: 'spider', x: 80, y: 200, instanceId: 'm2' },
      { id: 'spider', x: 45, y: 160, instanceId: 'm3' },
      { id: 'budge_dragon', x: 180, y: 180, instanceId: 'm4' },
      { id: 'budge_dragon', x: 200, y: 200, instanceId: 'm5' },
      { id: 'budge_dragon', x: 160, y: 210, instanceId: 'm6' },
      { id: 'bull_fighter', x: 50, y: 60, instanceId: 'm7' },
      { id: 'bull_fighter', x: 70, y: 40, instanceId: 'm8' },
      { id: 'hound', x: 220, y: 50, instanceId: 'm9' },
      { id: 'hound', x: 240, y: 70, instanceId: 'm10' },
      { id: 'dark_knight_mob', x: 230, y: 220, instanceId: 'm11' },
      { id: 'dark_knight_mob', x: 210, y: 240, instanceId: 'm12' }
    ],
    portals: [
      { x: 250, y: 128, targetMap: 'devias', targetX: 10, targetY: 128, label: 'To Devias →' },
      { x: 128, y: 250, targetMap: 'noria', targetX: 128, targetY: 10, label: 'To Noria ↓' }
    ],
    safezone: { x1: 80, y1: 70, x2: 180, y2: 140 }
  },
  devias: {
    id: 'devias',
    name: 'Devias',
    width: 256,
    height: 256,
    tileSize: 32,
    bgColor: '#4a6fa5',
    description: 'A frozen land with powerful monsters.',
    levelRange: [15, 30],
    npcs: [
      { id: 'shop_weapon', x: 100, y: 100, name: 'Elf Lala (Weapons)' },
      { id: 'shop_potion', x: 130, y: 100, name: 'Ice Queen (Potions)' }
    ],
    monsters: [
      { id: 'ice_monster', x: 60, y: 60, instanceId: 'dm1' },
      { id: 'ice_monster', x: 80, y: 40, instanceId: 'dm2' },
      { id: 'ice_monster', x: 200, y: 180, instanceId: 'dm3' },
      { id: 'yeti', x: 180, y: 220, instanceId: 'dm4' },
      { id: 'yeti', x: 220, y: 200, instanceId: 'dm5' },
      { id: 'yeti', x: 50, y: 200, instanceId: 'dm6' }
    ],
    portals: [
      { x: 5, y: 128, targetMap: 'lorencia', targetX: 240, targetY: 128, label: '← To Lorencia' }
    ],
    safezone: { x1: 80, y1: 80, x2: 160, y2: 130 }
  },
  noria: {
    id: 'noria',
    name: 'Noria',
    width: 256,
    height: 256,
    tileSize: 32,
    bgColor: '#3a7a3a',
    description: 'A lush forest home to elves and goblins.',
    levelRange: [10, 25],
    npcs: [
      { id: 'shop_weapon', x: 110, y: 100, name: 'Elf (Weapons)' },
      { id: 'shop_potion', x: 140, y: 100, name: 'Healer (Potions)' }
    ],
    monsters: [
      { id: 'goblin', x: 60, y: 60, instanceId: 'nm1' },
      { id: 'goblin', x: 200, y: 80, instanceId: 'nm2' },
      { id: 'goblin', x: 180, y: 60, instanceId: 'nm3' },
      { id: 'forest_monster', x: 50, y: 200, instanceId: 'nm4' },
      { id: 'forest_monster', x: 220, y: 200, instanceId: 'nm5' },
      { id: 'forest_monster', x: 200, y: 230, instanceId: 'nm6' }
    ],
    portals: [
      { x: 128, y: 5, targetMap: 'lorencia', targetX: 128, targetY: 240, label: '↑ To Lorencia' }
    ],
    safezone: { x1: 90, y1: 80, x2: 170, y2: 130 }
  }
};

module.exports = { MAPS };
