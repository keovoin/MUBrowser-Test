const MONSTERS = {
  // Lorencia monsters (Level 1-15)
  spider: {
    id: 'spider', name: 'Spider', level: 1, hp: 30,
    attack: 4, defense: 1, exp: 10, zen: 50,
    sprite: 'spider', aggressive: false,
    drops: [
      { itemId: 'small_hp_potion', chance: 0.3 }
    ]
  },
  budge_dragon: {
    id: 'budge_dragon', name: 'Budge Dragon', level: 3, hp: 60,
    attack: 8, defense: 2, exp: 25, zen: 100,
    sprite: 'budge_dragon', aggressive: false,
    drops: [
      { itemId: 'small_hp_potion', chance: 0.25 },
      { itemId: 'leather_boots', chance: 0.05 }
    ]
  },
  bull_fighter: {
    id: 'bull_fighter', name: 'Bull Fighter', level: 5, hp: 100,
    attack: 12, defense: 4, exp: 45, zen: 180,
    sprite: 'bull_fighter', aggressive: false,
    drops: [
      { itemId: 'small_hp_potion', chance: 0.2 },
      { itemId: 'leather_helm', chance: 0.04 },
      { itemId: 'small_shield', chance: 0.03 }
    ]
  },
  hound: {
    id: 'hound', name: 'Hound', level: 8, hp: 160,
    attack: 18, defense: 6, exp: 80, zen: 280,
    sprite: 'hound', aggressive: true,
    drops: [
      { itemId: 'medium_hp_potion', chance: 0.15 },
      { itemId: 'kris', chance: 0.03 },
      { itemId: 'scale_boots', chance: 0.04 }
    ]
  },
  dark_knight_mob: {
    id: 'dark_knight_mob', name: 'Dark Knight', level: 12,
    hp: 280, attack: 28, defense: 10, exp: 150, zen: 450,
    sprite: 'dark_knight_mob', aggressive: true,
    drops: [
      { itemId: 'medium_hp_potion', chance: 0.2 },
      { itemId: 'scale_armor', chance: 0.03 },
      { itemId: 'scale_helm', chance: 0.03 },
      { itemId: 'rapier', chance: 0.02 }
    ]
  },
  // Devias monsters (Level 15-30)
  ice_monster: {
    id: 'ice_monster', name: 'Ice Monster', level: 16,
    hp: 400, attack: 35, defense: 14, exp: 250, zen: 600,
    sprite: 'ice_monster', aggressive: true,
    drops: [
      { itemId: 'medium_hp_potion', chance: 0.25 },
      { itemId: 'angelic_staff', chance: 0.03 },
      { itemId: 'bow', chance: 0.03 }
    ]
  },
  yeti: {
    id: 'yeti', name: 'Yeti', level: 20, hp: 600,
    attack: 45, defense: 18, exp: 400, zen: 900,
    sprite: 'yeti', aggressive: true,
    drops: [
      { itemId: 'large_hp_potion', chance: 0.15 },
      { itemId: 'brass_armor', chance: 0.02 },
      { itemId: 'buckler', chance: 0.03 },
      { itemId: 'jewel_of_bless', chance: 0.005 }
    ]
  },
  // Noria monsters (Level 10-25)
  goblin: {
    id: 'goblin', name: 'Goblin', level: 10, hp: 200,
    attack: 22, defense: 8, exp: 110, zen: 350,
    sprite: 'goblin', aggressive: false,
    drops: [
      { itemId: 'small_hp_potion', chance: 0.2 },
      { itemId: 'elven_bow', chance: 0.02 },
      { itemId: 'silk_armor', chance: 0.03 }
    ]
  },
  forest_monster: {
    id: 'forest_monster', name: 'Forest Monster', level: 18,
    hp: 500, attack: 40, defense: 16, exp: 320, zen: 750,
    sprite: 'forest_monster', aggressive: true,
    drops: [
      { itemId: 'medium_hp_potion', chance: 0.2 },
      { itemId: 'serpent_staff', chance: 0.02 },
      { itemId: 'blade', chance: 0.02 },
      { itemId: 'jewel_of_soul', chance: 0.005 }
    ]
  }
};

module.exports = { MONSTERS };
