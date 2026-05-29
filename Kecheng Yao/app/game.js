/* ============================================================================
   Kecheng Yao — shmup engine.  window.Game
   Top-down Raiden-style layer that lives behind the page. The cursor is the
   ship. No score; enemy contact only flashes the ship red. Power-ups arm
   weapons / missiles / bomb and bring HUD "systems" online.
   ========================================================================== */
(function () {
  "use strict";

  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const _cssCache = {};
  const cssVar = (n) => _cssCache[n] || (_cssCache[n] = getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#fff");

  const ENEMY_LABELS = ["INCIDENT", "LATENCY", "BUG", "ALERT", "DOWNTIME", "TIMEOUT", "DRIFT", "OOM"];
  const WEAPON_FOR = { aws: "vulcan", azure: "laser", gcp: "plasma" };
  const COLORKEY = { vulcan: "--w-aws", laser: "--w-azure", plasma: "--w-gcp" };

  const Game = {
    settings: { neon: 1, density: 1, starSpeed: 1, enabled: true },
    onSystemOnline: null,   // (sysId) => {}
    onWeapon: null,         // ({type, level}) => {}
    onBomb: null,           // (count) => {}
    onHit: null,            // () => {}
    mode: "none",           // 'none' (drift) | 'vulcan' | 'laser' | 'plasma'
    running: false,
  };

  // ---- state ---------------------------------------------------------------
  let canvas, ctx, W = 0, H = 0, dpr = 1;
  let stars = [], bullets = [], enemies = [], parts = [], powerups = [], missiles = [], orbs = [];
  let last = 0, acc = 0, spawnT = 0, puT = 0, fireT = 0, missT = 0;
  let firstPuSeq = ["aws", "azure", "gcp", "art", "uiux", "mlai"]; // guarantee discovery
  let firstPuIdx = 0;
  const onlineSet = new Set();

  const ship = {
    x: 0, y: 0, tx: 0, ty: 0, has: false,
    weapon: "vulcan", level: 1, missile: null, bombs: 1,
    inv: 0, hitFlash: 0,
  };
  let cycleCol = 0; // 0 aws,1 azure,2 gcp for cycling capsule colour clock

  // ---- init / resize -------------------------------------------------------
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeStars() {
    stars = [];
    const n = Math.round((W * H) / 7000);
    for (let i = 0; i < n; i++) {
      const layer = Math.random() < 0.55 ? 0 : Math.random() < 0.7 ? 1 : 2;
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        z: layer, r: layer === 2 ? rand(1.1, 1.9) : layer === 1 ? rand(0.7, 1.2) : rand(0.4, 0.8),
        sp: layer === 2 ? rand(120, 190) : layer === 1 ? rand(55, 95) : rand(20, 42),
        tw: Math.random() * TAU,
      });
    }
  }

  Game.init = function (cv) {
    canvas = cv; ctx = canvas.getContext("2d");
    resize(); makeStars();
    window.addEventListener("resize", () => { resize(); makeStars(); });

    // pointer → ship target (does not block scroll on touch)
    const setTarget = (x, y) => { ship.tx = x; ship.ty = y; };
    window.addEventListener("mousemove", (e) => setTarget(e.clientX, e.clientY), { passive: true });
    window.addEventListener("touchmove", (e) => {
      const t = e.touches[0]; if (t) setTarget(t.clientX, t.clientY);
    }, { passive: true });
    window.addEventListener("touchstart", (e) => {
      const t = e.touches[0]; if (t) setTarget(t.clientX, t.clientY);
    }, { passive: true });
    // spacebar bomb
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" && Game.running && ship.has) { e.preventDefault(); Game.triggerBomb(); }
    });

    last = performance.now();
    requestAnimationFrame(loop);
  };

  // ---- start / mode --------------------------------------------------------
  Game.start = function (fighterId) {
    bullets = []; enemies = []; parts = []; powerups = []; missiles = []; orbs = [];
    onlineSet.clear(); firstPuIdx = 0;
    spawnT = 0; puT = 0; fireT = 0; missT = 0;
    if (fighterId === "none" || !fighterId) {
      Game.mode = "none"; ship.has = false; Game.running = true;
      return;
    }
    Game.mode = fighterId;
    ship.has = true;
    ship.weapon = WEAPON_FOR[fighterId] || "vulcan";
    ship.level = 1; ship.missile = null; ship.bombs = 1;
    ship.x = ship.tx = W / 2; ship.y = ship.ty = H * 0.7;
    ship.inv = 1.2; ship.hitFlash = 0;
    Game.running = true;
    // the chosen cloud weapon's system comes online immediately
    bringOnline(fighterId);
    emitWeapon(); if (Game.onBomb) Game.onBomb(ship.bombs);
  };

  function emitWeapon() { if (Game.onWeapon) Game.onWeapon({ type: ship.weapon, level: ship.level }); }

  function bringOnline(sysId) {
    if (onlineSet.has(sysId)) return;
    onlineSet.add(sysId);
    if (Game.onSystemOnline) Game.onSystemOnline(sysId);
  }

  Game.triggerBomb = function () {
    if (!ship.has || ship.bombs <= 0) return;
    ship.bombs--;
    if (Game.onBomb) Game.onBomb(ship.bombs);
    // clear enemies → big particle bloom
    for (const en of enemies) burst(en.x, en.y, cssVar("--w-mlai"), 14);
    enemies = [];
    ship.inv = 2.0;
    const bf = document.getElementById("bomb-flash");
    if (bf) { bf.classList.remove("flash"); void bf.offsetWidth; bf.classList.add("flash"); }
  };

  // ---- spawning ------------------------------------------------------------
  function spawnEnemy() {
    const x = rand(40, W - 40);
    enemies.push({
      x, y: -30, baseX: x, t: rand(0, TAU),
      vy: rand(48, 84) * (0.8 + Game.settings.density * 0.2),
      amp: rand(0, 70), freq: rand(0.4, 1.1),
      hp: 3, r: 15, label: ENEMY_LABELS[(Math.random() * ENEMY_LABELS.length) | 0],
      hue: Math.random() < 0.5 ? cssVar("--magenta") : cssVar("--cyan"),
    });
  }

  function spawnPowerup() {
    let kind;
    if (firstPuIdx < firstPuSeq.length) { kind = firstPuSeq[firstPuIdx++]; }
    else { kind = ["weapon", "weapon", "art", "uiux", "mlai"][(Math.random() * 5) | 0]; }
    // map firstPuSeq cloud ids to a 'weapon' capsule pre-set to that colour
    let type = "weapon", forced = null;
    if (kind === "aws" || kind === "azure" || kind === "gcp") { type = "weapon"; forced = kind; }
    else if (kind === "art") type = "art";
    else if (kind === "uiux") type = "uiux";
    else if (kind === "mlai") type = "mlai";
    powerups.push({
      x: rand(60, W - 60), y: -24, vy: rand(46, 64), type, forced,
      t: rand(0, TAU), r: 14,
    });
  }

  // ---- particles -----------------------------------------------------------
  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, s = rand(40, 230);
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.3, 0.7), max: 0.7, color, r: rand(1, 2.6) });
    }
  }

  // ---- firing --------------------------------------------------------------
  function fire() {
    const col = cssVar(COLORKEY[ship.weapon]);
    const lv = ship.level;
    if (ship.weapon === "vulcan") {
      const spread = (lv - 1) * 0.12;
      const shots = Math.min(1 + Math.floor(lv / 1.5), 5);
      for (let i = 0; i < shots; i++) {
        const off = shots === 1 ? 0 : (i / (shots - 1) - 0.5) * 2 * spread;
        bullets.push({ x: ship.x, y: ship.y - 14, vx: Math.sin(off) * 360, vy: -560, r: 3.2, dmg: 1, kind: "vulcan", color: col, pierce: 0 });
      }
    } else if (ship.weapon === "laser") {
      const w = 3 + lv * 2.2;
      bullets.push({ x: ship.x, y: ship.y - 16, vx: 0, vy: -900, r: w, dmg: 1.4, kind: "laser", color: col, pierce: lv >= 3 ? 99 : 0, len: 26 + lv * 6 });
      if (lv >= 4) { bullets.push({ x: ship.x - 13, y: ship.y - 6, vx: 0, vy: -900, r: w * 0.5, dmg: 0.8, kind: "laser", color: col, pierce: 1, len: 18 });
                     bullets.push({ x: ship.x + 13, y: ship.y - 6, vx: 0, vy: -900, r: w * 0.5, dmg: 0.8, kind: "laser", color: col, pierce: 1, len: 18 }); }
    } else if (ship.weapon === "plasma") {
      const count = Math.min(1 + Math.floor(lv / 2), 3);
      for (let i = 0; i < count; i++) {
        orbs.push({ x: ship.x + rand(-10, 10), y: ship.y - 12, vx: rand(-40, 40), vy: -300, r: 5 + lv, dmg: 0.5 + lv * 0.18, color: col, target: null, life: 2.4 });
      }
    }
  }

  function fireMissile() {
    if (!ship.missile) return;
    if (ship.missile === "art") { // M — slow, heavy, area blast
      const col = cssVar("--w-art");
      missiles.push({ x: ship.x, y: ship.y, vx: rand(-30, 30), vy: -150, r: 5, kind: "art", color: col, dmg: 6, life: 4 });
    } else { // H — homing
      const col = cssVar("--w-uiux");
      for (const dir of [-1, 1]) {
        missiles.push({ x: ship.x + dir * 12, y: ship.y, vx: dir * 120, vy: -120, r: 3.5, kind: "uiux", color: col, dmg: 1.2, life: 3, target: null });
      }
    }
  }

  function nearestEnemy(x, y) {
    let best = null, bd = Infinity;
    for (const e of enemies) { const d = (e.x - x) ** 2 + (e.y - y) ** 2; if (d < bd) { bd = d; best = e; } }
    return best;
  }

  // ---- power-up collection -------------------------------------------------
  function collect(p) {
    if (p.type === "weapon") {
      // colour at pickup time determines weapon; level persists & grows
      const colId = p.forced || ["aws", "azure", "gcp"][cycleCol % 3];
      ship.weapon = WEAPON_FOR[colId];
      ship.level = clamp(ship.level + 1, 1, 5);
      bringOnline(colId);
      emitWeapon();
      burst(p.x, p.y, cssVar(COLORKEY[ship.weapon]), 12);
    } else if (p.type === "art" || p.type === "uiux") {
      ship.missile = p.type;
      bringOnline(p.type);
      burst(p.x, p.y, cssVar(p.type === "art" ? "--w-art" : "--w-uiux"), 12);
    } else if (p.type === "mlai") {
      ship.bombs = clamp(ship.bombs + 1, 0, 5);
      bringOnline("mlai");
      if (Game.onBomb) Game.onBomb(ship.bombs);
      burst(p.x, p.y, cssVar("--w-mlai"), 12);
    }
  }

  // ---- main loop -----------------------------------------------------------
  function loop(now) {
    let dt = (now - last) / 1000; last = now;
    if (dt > 0.05) dt = 0.05;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function update(dt) {
    if (!Game.running) return;
    cycleCol = (performance.now() / 600) | 0; // capsule colour clock (~0.6s each)
    const ss = Game.settings.starSpeed;

    // stars
    for (const s of stars) {
      s.y += s.sp * ss * dt;
      s.tw += dt * 3;
      if (s.y > H + 4) { s.y = -4; s.x = Math.random() * W; }
    }

    if (!Game.settings.enabled) return; // game layer disabled: pause all logic, keep star state intact

    if (Game.mode === "none") { parts = []; return; } // drift: stars only

    // ship follow
    if (ship.has) {
      ship.x += (ship.tx - ship.x) * Math.min(1, dt * 12);
      ship.y += (ship.ty - ship.y) * Math.min(1, dt * 12);
      ship.x = clamp(ship.x, 8, W - 8); ship.y = clamp(ship.y, 8, H - 8);
      if (ship.inv > 0) ship.inv -= dt;
      if (ship.hitFlash > 0) ship.hitFlash -= dt;
    }

    // auto-fire
    fireT -= dt;
    const fireRate = ship.weapon === "vulcan" ? 0.085 : ship.weapon === "laser" ? 0.11 : 0.16;
    if (fireT <= 0 && ship.has) { fire(); fireT = fireRate; }
    missT -= dt;
    if (missT <= 0 && ship.has && ship.missile) { fireMissile(); missT = ship.missile === "art" ? 1.1 : 0.7; }

    // spawn enemies
    spawnT -= dt;
    const interval = clamp(0.95 - Game.settings.density * 0.4, 0.28, 1.4);
    if (spawnT <= 0) { spawnEnemy(); if (Math.random() < Game.settings.density * 0.4) spawnEnemy(); spawnT = interval; }

    // spawn powerups
    puT -= dt;
    const puInterval = firstPuIdx < firstPuSeq.length ? 2.4 : 6.5;
    if (puT <= 0) { spawnPowerup(); puT = puInterval; }

    // bullets
    for (const b of bullets) { b.x += b.vx * dt; b.y += b.vy * dt; }
    bullets = bullets.filter((b) => b.y > -40 && b.x > -40 && b.x < W + 40);

    // plasma orbs (homing)
    for (const o of orbs) {
      o.life -= dt;
      if (!o.target || o.target.dead) o.target = nearestEnemy(o.x, o.y);
      if (o.target) {
        const dx = o.target.x - o.x, dy = o.target.y - o.y, d = Math.hypot(dx, dy) || 1;
        o.vx += (dx / d) * 900 * dt; o.vy += (dy / d) * 900 * dt;
        const sp = Math.hypot(o.vx, o.vy), mx = 460;
        if (sp > mx) { o.vx = o.vx / sp * mx; o.vy = o.vy / sp * mx; }
      }
      o.x += o.vx * dt; o.y += o.vy * dt;
    }
    orbs = orbs.filter((o) => o.life > 0 && o.y > -40 && o.y < H + 40);

    // missiles
    for (const m of missiles) {
      m.life -= dt;
      if (m.kind === "uiux") {
        if (!m.target || m.target.dead) m.target = nearestEnemy(m.x, m.y);
        if (m.target) { const dx = m.target.x - m.x, dy = m.target.y - m.y, d = Math.hypot(dx, dy) || 1; m.vx += (dx / d) * 700 * dt; m.vy += (dy / d) * 700 * dt; }
        m.vy -= 60 * dt;
        const sp = Math.hypot(m.vx, m.vy), mx = 360; if (sp > mx) { m.vx = m.vx / sp * mx; m.vy = m.vy / sp * mx; }
      } else { m.vy -= 120 * dt; } // art: accelerate upward slowly
      m.x += m.vx * dt; m.y += m.vy * dt;
    }
    missiles = missiles.filter((m) => m.life > 0 && m.y > -60);

    // enemies movement
    for (const e of enemies) {
      e.t += dt;
      e.y += e.vy * dt;
      e.x = e.baseX + Math.sin(e.t * e.freq) * e.amp;
      // collide with ship
      if (ship.has && ship.inv <= 0) {
        if ((e.x - ship.x) ** 2 + (e.y - ship.y) ** 2 < (e.r + 10) ** 2) {
          ship.inv = 1.0; ship.hitFlash = 0.4; e.dead = true;
          burst(e.x, e.y, "#ff3d4d", 12);
          flashHit();
        }
      }
    }
    enemies = enemies.filter((e) => !e.dead && e.y < H + 40);

    // collisions: bullets/orbs/missiles vs enemies
    collide(bullets, true);
    collide(orbs, false);
    collideMissiles();

    // particles
    for (const p of parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92; }
    parts = parts.filter((p) => p.life > 0);

    // powerups
    for (const p of powerups) {
      p.y += p.vy * dt; p.t += dt;
      if (ship.has && (p.x - ship.x) ** 2 + (p.y - ship.y) ** 2 < (p.r + 14) ** 2) { collect(p); p.dead = true; }
    }
    powerups = powerups.filter((p) => !p.dead && p.y < H + 30);
  }

  function collide(list, removable) {
    for (const b of list) {
      for (const e of enemies) {
        if (e.dead) continue;
        const rr = (e.r + (b.r || 3));
        if ((b.x - e.x) ** 2 + (b.y - e.y) ** 2 < rr * rr) {
          e.hp -= b.dmg || 1;
          burst(b.x, b.y, b.color, 3);
          if (e.hp <= 0) { e.dead = true; burst(e.x, e.y, e.hue, 12); }
          if (removable && !(b.pierce > 0)) { b.dead = true; break; }
          if (b.pierce > 0) b.pierce--;
        }
      }
    }
    if (removable) {
      if (list === bullets) bullets = bullets.filter((b) => !b.dead);
      else if (list === orbs) orbs = orbs.filter((b) => !b.dead);
    }
    enemies = enemies.filter((e) => !e.dead);
  }

  function collideMissiles() {
    for (const m of missiles) {
      for (const e of enemies) {
        if (e.dead) continue;
        const rr = e.r + m.r + (m.kind === "art" ? 6 : 2);
        if ((m.x - e.x) ** 2 + (m.y - e.y) ** 2 < rr * rr) {
          if (m.kind === "art") { // area blast
            for (const e2 of enemies) { if ((e2.x - m.x) ** 2 + (e2.y - m.y) ** 2 < 70 * 70) { e2.hp -= m.dmg; if (e2.hp <= 0) { e2.dead = true; burst(e2.x, e2.y, e2.hue, 10); } } }
            burst(m.x, m.y, m.color, 22); m.life = 0;
          } else { e.hp -= m.dmg; burst(m.x, m.y, m.color, 5); if (e.hp <= 0) { e.dead = true; burst(e.x, e.y, e.hue, 10); } m.life = 0; }
          break;
        }
      }
    }
    enemies = enemies.filter((e) => !e.dead);
    missiles = missiles.filter((m) => m.life > 0);
  }

  function flashHit() {
    if (Game.onHit) Game.onHit();
    const f = document.getElementById("hit-flash");
    if (f) { f.classList.add("flash"); setTimeout(() => f.classList.remove("flash"), 110); }
  }

  // ---- render --------------------------------------------------------------
  function render() {
    ctx.clearRect(0, 0, W, H);
    const neon = Game.settings.neon;

    // stars
    for (const s of stars) {
      const a = 0.4 + Math.sin(s.tw) * 0.25 + s.z * 0.12;
      ctx.globalAlpha = clamp(a, 0.1, 1);
      ctx.fillStyle = s.z === 2 ? cssVar("--starlight") : "#cfc8ff";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (Game.mode === "none") return;

    ctx.lineCap = "round";

    // power-ups
    for (const p of powerups) drawPowerup(p, neon);

    // bullets
    for (const b of bullets) {
      ctx.shadowBlur = 12 * neon; ctx.shadowColor = b.color;
      ctx.strokeStyle = b.color; ctx.fillStyle = b.color;
      if (b.kind === "laser") {
        ctx.lineWidth = b.r; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, b.y + (b.len || 22)); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill();
      }
    }
    ctx.shadowBlur = 0;

    // orbs (plasma)
    for (const o of orbs) {
      ctx.shadowBlur = 18 * neon; ctx.shadowColor = o.color; ctx.fillStyle = o.color; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.shadowBlur = 0;

    // missiles
    for (const m of missiles) {
      ctx.shadowBlur = 12 * neon; ctx.shadowColor = m.color; ctx.fillStyle = m.color;
      ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(Math.atan2(m.vy, m.vx) + Math.PI / 2);
      ctx.beginPath(); ctx.moveTo(0, -m.r * 2); ctx.lineTo(m.r, m.r * 1.4); ctx.lineTo(-m.r, m.r * 1.4); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.shadowBlur = 0;

    // enemies
    for (const e of enemies) drawEnemy(e, neon);

    // particles
    for (const p of parts) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ship
    if (ship.has) drawShip(neon);
  }

  function drawPowerup(p, neon) {
    let col, glyph;
    if (p.type === "weapon") {
      const id = p.forced || ["aws", "azure", "gcp"][cycleCol % 3];
      col = cssVar(COLORKEY[WEAPON_FOR[id]]); glyph = id === "aws" ? "A" : id === "azure" ? "Z" : "G";
    } else if (p.type === "art") { col = cssVar("--w-art"); glyph = "M"; }
    else if (p.type === "uiux") { col = cssVar("--w-uiux"); glyph = "H"; }
    else { col = cssVar("--w-mlai"); glyph = "◇"; }
    const s = p.r + Math.sin(p.t * 4) * 1.5;
    ctx.save(); ctx.translate(p.x, p.y);
    ctx.shadowBlur = 16 * neon; ctx.shadowColor = col;
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) { const a = p.t * 0.8 + i / 4 * TAU; const px = Math.cos(a) * s, py = Math.sin(a) * s; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath(); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = col; ctx.font = "600 13px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(glyph, 0, 1);
    ctx.restore();
  }

  function drawEnemy(e, neon) {
    ctx.save(); ctx.translate(e.x, e.y);
    ctx.shadowBlur = 10 * neon; ctx.shadowColor = e.hue;
    ctx.strokeStyle = e.hue; ctx.lineWidth = 1.6; ctx.fillStyle = "#13082a";
    // diamond drone pointing down
    ctx.beginPath(); ctx.moveTo(0, e.r); ctx.lineTo(e.r, 0); ctx.lineTo(0, -e.r); ctx.lineTo(-e.r, 0); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = e.hue; ctx.font = "8px 'IBM Plex Mono', monospace"; ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.globalAlpha = 0.85; ctx.fillText(e.label, 0, e.r + 3); ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawShip(neon) {
    const col = cssVar(COLORKEY[ship.weapon]);
    const hit = ship.hitFlash > 0;
    const flick = ship.inv > 0 ? (Math.sin(performance.now() / 50) > 0 ? 0.4 : 1) : 1;
    ctx.save(); ctx.translate(ship.x, ship.y); ctx.globalAlpha = flick;
    // engine trail
    ctx.shadowBlur = 16 * neon; ctx.shadowColor = hit ? "#ff3d4d" : col;
    const tg = ctx.createLinearGradient(0, 8, 0, 34);
    tg.addColorStop(0, hit ? "#ff6d7d" : col); tg.addColorStop(1, "transparent");
    ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(-4, 8); ctx.lineTo(4, 8); ctx.lineTo(0, 30 + Math.random() * 6); ctx.closePath(); ctx.fill();
    // body
    ctx.fillStyle = hit ? "#ff3d4d" : "#1a0f3e"; ctx.strokeStyle = hit ? "#ff8d99" : col; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(11, 10); ctx.lineTo(4, 6); ctx.lineTo(0, 12); ctx.lineTo(-4, 6); ctx.lineTo(-11, 10); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // cockpit glow
    ctx.shadowBlur = 8 * neon; ctx.fillStyle = hit ? "#fff" : col; ctx.beginPath(); ctx.arc(0, -4, 2.4, 0, TAU); ctx.fill();
    ctx.restore(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }

  // ---- settings hooks ------------------------------------------------------
  Game.setEnabled = function (on) {
    Game.settings.enabled = on;
    if (!canvas) return;
    canvas.style.opacity = on ? "1" : "0";
  };

  window.Game = Game;
})();
