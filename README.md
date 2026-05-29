# MU Online - Browser Edition

A fully playable MU Online browser game. No downloads, no installs, no server required. Just open and play.

---

## 🎮 Play Now

> 📱 **Mobile-friendly:** the game is fully responsive and touch-enabled — open any of
> the hosted URLs below on your phone and **tap** to move and attack.

### Option A: GitHub Pages (Recommended)

1. Make this repository **public** (Settings → Danger Zone → Change visibility → Public)
2. Go to **Settings → Pages**
3. Under "Branch", select `gh-pages` and folder `/ (root)`
4. Click **Save**
5. Wait 1-2 minutes
6. Play at: `https://keovoin.github.io/MUBrowser-Test/`

### Option B: Netlify (Works with Private Repos)

1. Go to https://app.netlify.com/drop
2. Download the `docs/index.html` file from this repo
3. Drag and drop it onto Netlify
4. Done - you get a free URL instantly

### Option C: Run Locally (if you have Node.js)

```bash
git clone https://github.com/keovoin/MUBrowser-Test.git
cd MUBrowser-Test
node backend/server.js
# Open http://localhost:3000
```

### Option D: Just Open the HTML File

Download `docs/index.html` and double-click it. It opens in any browser and works offline.

---

## 📋 Features

### Character System
- **3 Classes**: Dark Knight (melee), Dark Wizard (magic), Fairy Elf (archer)
- **Stat Allocation**: STR, AGI, VIT, ENE - 5 points per level
- **Level System**: Kill monsters → Gain EXP → Level up → Get stronger
- **Multiple Characters**: Up to 3 characters per account

### Combat
- **Click to attack**: Click any monster to engage
- **Auto-attack**: Once in range, your character attacks automatically
- **Damage calculation**: Based on STR/AGI + weapon attack - monster defense
- **Armor reduction**: Equipped armor reduces incoming damage
- **Floating damage numbers**: Yellow (your damage), Red (monster damage)
- **Death & respawn**: Die → respawn in town with 50% HP

### World
- **3 Maps**:
  - **Lorencia** (Lv 1-15) - Starting town, grasslands
  - **Devias** (Lv 15-30) - Frozen lands, stronger monsters
  - **Noria** (Lv 10-25) - Forest, goblins and forest monsters
- **Portal travel**: Walk into glowing blue portals to change maps
- **Safe zones**: Green highlighted areas where you're safe
- **NPC shops**: Blue circles with `!` marks

### Monsters (9 types)

| Monster | Map | Level | HP | EXP | Zen |
|---------|-----|-------|-----|-----|-----|
| Spider | Lorencia | 1 | 30 | 10 | 50 |
| Budge Dragon | Lorencia | 3 | 60 | 25 | 100 |
| Bull Fighter | Lorencia | 5 | 100 | 45 | 180 |
| Hound | Lorencia | 8 | 160 | 80 | 280 |
| Dark Knight | Lorencia | 12 | 280 | 150 | 450 |
| Goblin | Noria | 10 | 200 | 110 | 350 |
| Forest Monster | Noria | 18 | 500 | 320 | 750 |
| Ice Monster | Devias | 16 | 400 | 250 | 600 |
| Yeti | Devias | 20 | 600 | 400 | 900 |

### Items & Equipment

**Weapons:**
- Swords: Short Sword → Kris → Rapier → Blade
- Staves: Skull Staff → Angelic Staff → Serpent Staff
- Bows: Short Bow → Bow → Elven Bow

**Armor:** Leather/Pad/Vine → Scale/Bone/Silk → Brass

**Other:** Shields, Helmets, Boots, HP/MP Potions, Jewels

### Shops (3 NPC types)
- **Weapon Shop**: All weapons for all classes
- **Armor Shop**: All armor, shields, helmets, boots
- **Potion Shop**: HP and MP potions (Small/Medium/Large)

### Inventory System
- **Equip/Unequip** items to boost stats
- **Use potions** to restore HP/MP
- **Sell items** for half their buy price
- **Loot drops** from killed monsters

### Save System
- Auto-saves to browser **localStorage**
- Character position, stats, inventory all saved
- Persists between browser sessions
- Each account has separate save data

### Accounts & Playing on Multiple Devices
> ⚠️ The hosted single-file game (`docs/index.html`) stores accounts in your browser's
> **localStorage**, which is **per-device / per-browser**. An account created on your PC
> does **not** automatically exist on your phone.

To play the **same** character on another device:
1. On the device where your character lives, go to **Select Character → 📤 Export account** and copy the code.
2. On the other device, on the login screen tap **📥 Import account from another device**, paste the code, and Import.
3. Log in with your username/password — your characters and items are now there.

**Want fully automatic cross-device login instead?** That needs a shared server. This repo
already includes a zero-dependency Node backend (`backend/`, JWT auth + JSON-file DB).
Deploy it to a host with a **persistent disk** (e.g. Render, Railway, Fly.io — *not*
Vercel/Netlify, whose filesystems are ephemeral), then have the static game talk to it.
(The automatic-sync client is not wired into `docs/index.html` yet — see the open items.)

---

## 🎯 How to Play

1. **Register** an account (stored locally in your browser)
2. **Create a character** - pick a class and name
3. **Click on the map** to move your character
4. **Click on monsters** (colored circles) to attack them
5. **Kill monsters** to earn EXP and Zen (gold)
6. **Level up** and allocate stat points (📊 button)
7. **Visit NPC shops** (blue circles with !) to buy gear
8. **Equip items** from inventory (🎒 button)
9. **Use potions** when HP is low
10. **Travel** through portals to explore other maps
11. **Rest** (💤 button) to recover 15% HP/MP
12. **Save & Quit** (🚪 button) to return to character select

---

## 🖥️ Controls

| Action | How |
|--------|-----|
| Move | Click on empty ground |
| Attack | Click on a monster |
| Open Inventory | Click 🎒 button |
| Open Stats | Click 📊 button |
| Rest (heal) | Click 💤 button |
| Save & Quit | Click 🚪 button |
| Talk to NPC | Click on blue NPC (when close) |

---

## 🏗️ Project Structure

```
MUBrowser-Test/
├── docs/
│   └── index.html          ← Full game (single file, GitHub Pages ready)
├── backend/                 ← Node.js server version (optional)
│   ├── server.js
│   ├── database.js
│   ├── middleware/auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── character.js
│   │   └── game.js
│   └── data/
│       ├── classes.js
│       ├── items.js
│       ├── maps.js
│       ├── monsters.js
│       └── npcs.js
├── frontend/                ← Frontend for Node.js version
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js
│       ├── app.js
│       ├── game.js
│       ├── renderer.js
│       └── ui.js
├── package.json
└── README.md
```

### Two Versions:

1. **`docs/index.html`** - Standalone client-side game (no server needed)
   - Everything in one HTML file
   - Uses localStorage for persistence
   - Deploy anywhere (GitHub Pages, Netlify, open locally)

2. **`backend/` + `frontend/`** - Full Node.js server version
   - Server-side game logic
   - JSON file database
   - Zero npm dependencies (uses only Node.js built-ins)
   - Run with `node backend/server.js`

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Game Engine | Vanilla JavaScript + HTML5 Canvas |
| Rendering | 2D Canvas (60fps game loop) |
| Storage | Browser localStorage / JSON file (server version) |
| Auth | Custom JWT (server) / localStorage (client) |
| Server | Pure Node.js http module (zero dependencies) |
| Hosting | GitHub Pages / Any static host |

---

## 📊 Class Stats

### Dark Knight
- **Role**: Melee tank/damage
- **High**: STR (28), VIT (25)
- **Damage**: 1.2x STR + 0.3x AGI
- **HP/Level**: +8

### Dark Wizard
- **Role**: Magic damage
- **High**: ENE (30)
- **Damage**: 1.5x ENE + 0.3x STR
- **MP/Level**: +6

### Fairy Elf
- **Role**: Agile ranged
- **High**: AGI (28)
- **Damage**: 1.0x AGI + 0.5x STR
- **Speed**: Fastest attack speed

---

## 🚀 Deployment Guide

### GitHub Pages (Free)

1. Repository must be **public**
2. Settings → Pages → Branch: `gh-pages` → Save
3. Live at `https://YOUR-USERNAME.github.io/MUBrowser-Test/`

### Netlify (Free, works with private repos)

1. Go to https://app.netlify.com
2. New site → Import from Git → Select repo
3. Build command: (leave empty)
4. Publish directory: `docs`
5. Deploy

### Vercel (Free, works with private repos)

This repo includes a `vercel.json`, so it deploys with **zero configuration** — the
game is served at the site root even though the file lives in `docs/`.

1. Go to https://vercel.com
2. **Add New → Project → Import** this GitHub repo
3. Framework Preset: **Other** (leave Build/Output settings empty)
4. Click **Deploy** — you get a `https://<project>.vercel.app` URL
5. The root URL (`/`) and `/play` both load the game (see `vercel.json`)

> Alternative without `vercel.json`: set the project's **Root Directory** to `docs`.

### Cloudflare Pages (Free)

1. Go to https://dash.cloudflare.com → Pages
2. Connect GitHub → Select repo
3. Build output: `docs`
4. Deploy

---

## 📝 License

Free to use, modify, and share.
