# MU Online - Browser Edition

A fully playable MU Online browser game. No downloads, no installs, no server required. Just open and play.

---

## 🎮 Play Now

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

### Accounts, Roles & Admin Panel
The client-side account system now supports **roles** and **moderation**:

- Every account is `{ username, password, role, banned }` where `role` is one of `admin`, `gm`, or `player`.
- **Automatic migration**: old saves created before this update (which only had `username`/`password`) are upgraded on first load — they get `role: "player"` and `banned: false`, and the game guarantees at least one admin exists (it promotes an account literally named `admin`, or else the very first account).
- **Registration**: the first account ever created — or any account registered with the username `admin` — becomes an **admin**. Everyone else starts as a **player**.
- **Banning**: a banned account cannot log in (it sees *"This account is banned."*), and a banned saved session is not auto-resumed.
- **Admin Panel** (button on the character-select screen, visible only to admins/GMs): lists every account with its role, ban status and characters. From here you can:
  - Change a role (player / gm / admin) via a dropdown.
  - Ban / unban an account.
  - Delete an account together with all of its characters and inventories.
  - Grant to any character: **Set Level** (1–400, recalculates max HP/MP from the class formula), **Grant Zen**, and **Grant Item** (by item ID).
  - Permission rules: **admins** manage everyone; **GMs** manage *players only* and can never assign or remove the admin role or delete admins.

### Global Ranking / Leaderboard
- A **Ranking** button on the character-select screen (visible to everyone) opens a dark-fantasy leaderboard.
- It collects **all** characters across **all** local accounts, sorts by **level** (then **EXP**), and shows up to the **top 50**: rank, character name, owner, class (in the class colour), level and current map.
- The top three are marked with 🥇 🥈 🥉 and a highlighted row; your own characters are subtly accented.

### Other Players & Your Companion (client-side, no server)
> **How the "multiplayer" feel works (honest explanation):** This game has **no server and no real networking**. The sense of a populated world is created entirely on your own machine:
>
> - **Ghost players** — any *other* characters you have saved in **this browser** that happen to be standing on the **same map** appear in the world as semi-transparent figures, drawn exactly like real players, with their name and a small `[offline]` tag. They are purely cosmetic: they **cannot be attacked, do not collide, and there is no PVP**.
> - **Your companion** — the allied helper that follows you and fights monsters is now presented as **another player**: it is drawn with the **same character art as you**, shows a **random player-style name floating above its head** (instead of "BOT"), and now **animates** — it visibly **walks** (leg/step + body bob) when moving and plays a **sword-swing animation** when attacking, so it never looks frozen on screen. Under the hood it is still a client-side allied bot (invulnerable, no PVP); the player-style presentation simply makes the world feel busier and more alive.
> - **"Players Here" panel** — a small presence list in the corner of the game UI shows everyone currently on your map: **you** (marked `(you)`), your companion, and any ghost players.

### Item Images
- Inventory and shop item cards now show **real MU Online item icons**.
- Icons are loaded on demand from a public community asset repository using MU's standard item *group/index* numbering (`imgs/items/{group}/{index}.gif`).
- **Offline-safe**: if there is no internet (for example when you opened the HTML by double-clicking it), the images simply fail to load and are hidden automatically — the game keeps working with its existing text/colour item cards. Nothing is bundled into the file, so it stays a single self-contained HTML page.
- **Image credit:** item icons are sourced from the community project [r00tmebaby/DT-Web-2.0-MuOnline-CMS-All-Seasons](https://github.com/r00tmebaby/DT-Web-2.0-MuOnline-CMS-All-Seasons) (`imgs/items`). MU Online and its art assets are property of **Webzen**; assets are used here for non-commercial, illustrative purposes.

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

1. Go to https://vercel.com
2. Import project → Select GitHub repo
3. Root directory: `docs`
4. Deploy

### Cloudflare Pages (Free)

1. Go to https://dash.cloudflare.com → Pages
2. Connect GitHub → Select repo
3. Build output: `docs`
4. Deploy

---

## 📝 License

Free to use, modify, and share.
