const ITEMS = {
  // Weapons - Swords
  short_sword: { name: 'Short Sword', type: 'weapon', slot: 'weapon', attack: 6, buyPrice: 200, description: 'A basic short sword.', sprite: 'sword1', reqStr: 10, reqClass: ['dark_knight'] },
  kris: { name: 'Kris', type: 'weapon', slot: 'weapon', attack: 12, buyPrice: 800, description: 'A curved dagger.', sprite: 'sword2', reqStr: 20, reqClass: ['dark_knight'] },
  rapier: { name: 'Rapier', type: 'weapon', slot: 'weapon', attack: 20, buyPrice: 2000, description: 'A thin, sharp blade.', sprite: 'sword3', reqStr: 30, reqClass: ['dark_knight'] },
  blade: { name: 'Blade', type: 'weapon', slot: 'weapon', attack: 32, buyPrice: 5000, description: 'A heavy slashing blade.', sprite: 'sword4', reqStr: 50, reqClass: ['dark_knight'] },
  
  // Weapons - Staves
  skull_staff: { name: 'Skull Staff', type: 'weapon', slot: 'weapon', attack: 4, magic: 8, buyPrice: 200, description: 'A staff topped with a skull.', sprite: 'staff1', reqEne: 10, reqClass: ['dark_wizard'] },
  angelic_staff: { name: 'Angelic Staff', type: 'weapon', slot: 'weapon', attack: 6, magic: 16, buyPrice: 1000, description: 'A staff blessed with light.', sprite: 'staff2', reqEne: 25, reqClass: ['dark_wizard'] },
  serpent_staff: { name: 'Serpent Staff', type: 'weapon', slot: 'weapon', attack: 8, magic: 28, buyPrice: 3000, description: 'A staff with serpent motif.', sprite: 'staff3', reqEne: 40, reqClass: ['dark_wizard'] },
  
  // Weapons - Bows
  short_bow: { name: 'Short Bow', type: 'weapon', slot: 'weapon', attack: 8, buyPrice: 200, description: 'A simple short bow.', sprite: 'bow1', reqAgi: 15, reqClass: ['fairy_elf'] },
  bow: { name: 'Bow', type: 'weapon', slot: 'weapon', attack: 14, buyPrice: 900, description: 'A standard bow.', sprite: 'bow2', reqAgi: 25, reqClass: ['fairy_elf'] },
  elven_bow: { name: 'Elven Bow', type: 'weapon', slot: 'weapon', attack: 24, buyPrice: 2500, description: 'A bow crafted by elves.', sprite: 'bow3', reqAgi: 40, reqClass: ['fairy_elf'] },
  
  // Armor
  leather_armor: { name: 'Leather Armor', type: 'armor', slot: 'armor', defense: 5, buyPrice: 300, description: 'Basic leather protection.', sprite: 'armor1', reqClass: ['dark_knight'] },
  scale_armor: { name: 'Scale Armor', type: 'armor', slot: 'armor', defense: 12, buyPrice: 1500, description: 'Armor made of metal scales.', sprite: 'armor2', reqStr: 30, reqClass: ['dark_knight'] },
  brass_armor: { name: 'Brass Armor', type: 'armor', slot: 'armor', defense: 22, buyPrice: 4000, description: 'Heavy brass plate armor.', sprite: 'armor3', reqStr: 50, reqClass: ['dark_knight'] },
  pad_armor: { name: 'Pad Armor', type: 'armor', slot: 'armor', defense: 3, buyPrice: 300, description: 'Light padded robes.', sprite: 'robe1', reqClass: ['dark_wizard'] },
  bone_armor: { name: 'Bone Armor', type: 'armor', slot: 'armor', defense: 8, buyPrice: 1200, description: 'Armor adorned with bones.', sprite: 'robe2', reqEne: 20, reqClass: ['dark_wizard'] },
  vine_armor: { name: 'Vine Armor', type: 'armor', slot: 'armor', defense: 4, buyPrice: 300, description: 'Armor woven from vines.', sprite: 'elfarm1', reqClass: ['fairy_elf'] },
  silk_armor: { name: 'Silk Armor', type: 'armor', slot: 'armor', defense: 10, buyPrice: 1300, description: 'Lightweight silk armor.', sprite: 'elfarm2', reqAgi: 25, reqClass: ['fairy_elf'] },
  
  // Shields
  small_shield: { name: 'Small Shield', type: 'shield', slot: 'shield', defense: 3, buyPrice: 400, description: 'A small wooden shield.', sprite: 'shield1', reqClass: ['dark_knight'] },
  buckler: { name: 'Buckler', type: 'shield', slot: 'shield', defense: 7, buyPrice: 1200, description: 'A round metal buckler.', sprite: 'shield2', reqStr: 25, reqClass: ['dark_knight'] },
  
  // Helmets
  leather_helm: { name: 'Leather Helm', type: 'helmet', slot: 'helmet', defense: 2, buyPrice: 200, description: 'A basic leather helmet.', sprite: 'helm1', reqClass: ['dark_knight'] },
  scale_helm: { name: 'Scale Helm', type: 'helmet', slot: 'helmet', defense: 5, buyPrice: 800, description: 'A helmet of metal scales.', sprite: 'helm2', reqStr: 25, reqClass: ['dark_knight'] },
  
  // Boots
  leather_boots: { name: 'Leather Boots', type: 'boots', slot: 'boots', defense: 2, buyPrice: 200, description: 'Basic leather boots.', sprite: 'boots1' },
  scale_boots: { name: 'Scale Boots', type: 'boots', slot: 'boots', defense: 4, buyPrice: 700, description: 'Boots made of scale.', sprite: 'boots2', reqStr: 20 },
  
  // Consumables
  small_hp_potion: { name: 'Small HP Potion', type: 'consumable', healHp: 50, buyPrice: 50, description: 'Restores 50 HP.', sprite: 'pot_hp1' },
  medium_hp_potion: { name: 'Medium HP Potion', type: 'consumable', healHp: 150, buyPrice: 200, description: 'Restores 150 HP.', sprite: 'pot_hp2' },
  large_hp_potion: { name: 'Large HP Potion', type: 'consumable', healHp: 400, buyPrice: 600, description: 'Restores 400 HP.', sprite: 'pot_hp3' },
  small_mp_potion: { name: 'Small MP Potion', type: 'consumable', healMp: 30, buyPrice: 60, description: 'Restores 30 MP.', sprite: 'pot_mp1' },
  medium_mp_potion: { name: 'Medium MP Potion', type: 'consumable', healMp: 100, buyPrice: 250, description: 'Restores 100 MP.', sprite: 'pot_mp2' },
  
  // Misc drops
  jewel_of_bless: { name: 'Jewel of Bless', type: 'misc', buyPrice: 5000, description: 'A rare enchanting jewel.', sprite: 'jewel1' },
  jewel_of_soul: { name: 'Jewel of Soul', type: 'misc', buyPrice: 5000, description: 'A jewel containing soul energy.', sprite: 'jewel2' }
};

function getDrops(dropTable, charLevel) {
  const drops = [];
  dropTable.forEach(drop => {
    if (Math.random() < drop.chance) {
      drops.push({ id: drop.itemId });
    }
  });
  return drops;
}

module.exports = { ITEMS, getDrops };
