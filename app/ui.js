/* ============================================================================
   Kecheng Yao — UI layer.  Boot → fighter select → content + HUD + settings.
   Bridges window.SITE_DATA and window.Game.
   ========================================================================== */
(function () {
  "use strict";
  const D = window.SITE_DATA;
  let lang = localStorage.getItem("ky_lang") || "en";
  const L = (o) => (o == null ? "" : typeof o === "string" ? o : o[lang] || o.en || "");
  const T = (k) => { const u = D.ui[lang] || D.ui.en; return (u[k] != null ? u[k] : (D.ui.en[k] || "")); };
  const $ = (s, r = document) => r.querySelector(s);
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  // ---- icons ---------------------------------------------------------------
  const ICON = {
    linkedin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5 2.5 2.5 0 0 0 4.98 3.5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21H22v-5.4c0-1.3 0-2.97-1.8-2.97-1.8 0-2.08 1.4-2.08 2.87V21H14V9z"/></svg>',
    pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    github: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.36 1.11 2.94.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/></svg>',
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    gear: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>',
    close: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    arrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  };
  function shipSVG(kind, color) {
    const c = color;
    if (kind === "vulcan") return `<svg width="70" height="80" viewBox="0 0 70 80" fill="none" stroke="${c}" stroke-width="2"><path d="M35 8 L52 56 L40 50 L35 62 L30 50 L18 56 Z" fill="#1a0f3e"/><path d="M18 40 L8 52 M52 40 L62 52" /><circle cx="35" cy="34" r="3.4" fill="${c}"/></svg>`;
    if (kind === "laser") return `<svg width="70" height="80" viewBox="0 0 70 80" fill="none" stroke="${c}" stroke-width="2"><path d="M35 6 L46 58 L35 52 L24 58 Z" fill="#1a0f3e"/><path d="M24 30 L14 60 M46 30 L56 60"/><rect x="33.4" y="14" width="3.2" height="20" fill="${c}"/></svg>`;
    return `<svg width="70" height="80" viewBox="0 0 70 80" fill="none" stroke="${c}" stroke-width="2"><path d="M35 8 L50 46 Q35 60 20 46 Z" fill="#1a0f3e"/><circle cx="35" cy="34" r="9" stroke="${c}"/><circle cx="35" cy="34" r="3" fill="${c}"/><path d="M20 44 L10 56 M50 44 L60 56"/></svg>`;
  }
  const FCOLOR = { aws: "--w-aws", azure: "--w-azure", gcp: "--w-gcp" };
  const WLABEL = { vulcan: "VULCAN · AWS", laser: "LANCE · AZURE", plasma: "PLASMA · GCP" };
  const WCOLOR = { vulcan: "--w-aws", laser: "--w-azure", plasma: "--w-gcp" };

  // ---- boot sequence -------------------------------------------------------
  function buildOverlay() {
    const ov = $("#overlay");
    ov.innerHTML = "";
    const boot = el("div", "boot");
    boot.innerHTML = `
      <div class="boot-glyph"></div>
      <div class="boot-title glow">${T('booting')}</div>
      <div class="boot-sub">${T('bootSub')}</div>
      <div class="boot-bar"><i></i></div>`;
    ov.appendChild(boot);
    const bar = boot.querySelector(".boot-bar > i");
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 22 + 8; if (p >= 100) { p = 100; clearInterval(t); setTimeout(showSelect, 360); }
      bar.style.width = p + "%";
    }, 160);
  }

  function showSelect() {
    const ov = $("#overlay");
    ov.innerHTML = "";
    const wrap = el("div", "select");
    wrap.innerHTML = `
      <div class="select-kicker">${D.hero.code} // ${L(D.hero.sub)}</div>
      <div class="select-name glow">${D.hero.name}</div>
      <div class="select-title">${L(D.hero.title)}</div>
      <div class="select-h">${T('selectFighter')}</div>
      <div class="select-sub">${T('selectSub')}</div>`;
    const grid = el("div", "fighters");
    D.fighters.forEach((f) => {
      const cvar = FCOLOR[f.id];
      const card = el("div", "fighter");
      card.style.setProperty("--fc", `var(${cvar})`);
      card.innerHTML = `
        <span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>
        <div class="fighter-ship">${shipSVG(f.weaponKey, `var(${cvar})`)}</div>
        <div class="fighter-vendor">${f.vendor}</div>
        <div class="fighter-name">${f.name}</div>
        <div class="fighter-wlabel">${T('mainWeapon')}</div>
        <div class="fighter-desc">${L(f.desc)}</div>
        <div class="fighter-go">${T('engage')} ${ICON.arrow}</div>`;
      card.addEventListener("click", () => choose(f.id));
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    const co = el("div", "cursor-only", `◇ ${T('cursorOnly')} — ${T('cursorOnlyDesc')}`);
    co.addEventListener("click", () => choose("none"));
    wrap.appendChild(co);
    ov.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add("in"));
  }

  function choose(id) {
    $("#overlay").classList.add("gone");
    document.body.classList.remove("no-scroll");
    if (id !== "none") {
      document.body.classList.add("playing");
      $("#hud").classList.remove("hidden");
      $("#dock").classList.remove("hidden");
    } else {
      document.body.classList.remove("playing");
      $("#hud").classList.add("hidden");
      $("#dock").classList.add("hidden");
    }
    Game.start(id);
  }

  // ---- top bar -------------------------------------------------------------
  function buildTopbar() {
    const tb = $("#topbar");
    tb.innerHTML = "";
    tb.appendChild(el("div", "tb-mark", `<b>KY</b> // KECHENG YAO`));
    const right = el("div", "tb-right");
    const extlinks = el("div", "tb-links");
    [["Aquila", "https://whykeysay.github.io/aquila/main"], ["Auriga", "https://whykeysay.github.io/auriga/main"]].forEach(([name, url]) => {
      const a = el("a", "tb-link", name);
      a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
      extlinks.appendChild(a);
    });
    right.appendChild(extlinks);
    const langset = el("div", "langset");
    [["en", "EN"], ["fr", "FR"], ["zh", "中"]].forEach(([code, lbl]) => {
      const b = el("button", code === lang ? "on" : "", lbl);
      b.addEventListener("click", () => setLang(code));
      langset.appendChild(b);
    });
    right.appendChild(langset);
    const gear = el("button", "iconbtn", ICON.gear);
    gear.title = T('settings');
    gear.addEventListener("click", () => $("#settings").classList.toggle("open"));
    right.appendChild(gear);
    tb.appendChild(right);
  }

  function setLang(code) {
    lang = code; localStorage.setItem("ky_lang", code);
    document.documentElement.lang = code === "zh" ? "zh" : code;
    buildTopbar(); renderContent(); buildHUD(); buildSettings();
    // refresh dock labels
    updateWeapon(lastWeapon); updateBomb(lastBomb);
  }

  // ---- HUD (systems) -------------------------------------------------------
  function buildHUD() {
    const hud = $("#hud");
    hud.innerHTML = "";
    hud.appendChild(el("div", "hud-title", T('systems')));
    D.systems.forEach((sys) => {
      const chip = el("div", "hud-chip" + (onlineState.has(sys.id) ? " on" : ""));
      chip.style.setProperty("--cc", `var(${sys.colorVar})`);
      chip.dataset.sys = sys.id;
      const pips = sys.kind === "weapon" ? `<div class="hud-lv">${[0,1,2,3,4].map(()=>'<i></i>').join("")}</div>` : "";
      chip.innerHTML = `
        <div class="hud-glyph">${sys.glyph}</div>
        <div class="hud-meta"><span class="hud-name">${sys.full}</span>
        <span class="hud-state">${onlineState.has(sys.id) ? T('online') : T('locked')}</span></div>${pips}`;
      chip.addEventListener("click", () => {
        const tgt = document.getElementById(sys.target);
        if (tgt) window.scrollTo({ top: tgt.getBoundingClientRect().top + window.scrollY - 40, behavior: "smooth" });
      });
      hud.appendChild(chip);
    });
    refreshWeaponPips();
  }

  const onlineState = new Set();
  function lightSystem(id) {
    onlineState.add(id);
    const chip = $(`#hud .hud-chip[data-sys="${id}"]`);
    if (chip) { chip.classList.add("on"); const st = chip.querySelector(".hud-state"); if (st) st.textContent = T('online'); }
    const sys = D.systems.find((s) => s.id === id);
    if (sys) toast(sys.glyph, sys.full, T('onlineToast'), `var(${sys.colorVar})`);
  }

  function refreshWeaponPips() {
    // light pips on the active weapon's system chip by level
    const map = { vulcan: "aws", laser: "azure", plasma: "gcp" };
    const activeSys = map[lastWeapon.type];
    D.systems.forEach((sys) => {
      if (sys.kind !== "weapon") return;
      const chip = $(`#hud .hud-chip[data-sys="${sys.id}"]`);
      if (!chip) return;
      const pips = chip.querySelectorAll(".hud-lv i");
      pips.forEach((p, i) => p.classList.toggle("f", sys.id === activeSys && i < lastWeapon.level));
    });
  }

  // ---- dock ----------------------------------------------------------------
  let lastWeapon = { type: "vulcan", level: 1 };
  let lastBomb = 1;
  function buildDock() {
    const d = $("#dock");
    d.innerHTML = `
      <div class="dock-cell" id="dk-wpn"></div>
      <div class="dock-cell" id="dk-msl"></div>
      <div class="dock-cell dock-bomb" id="dk-bmb"></div>`;
    d.querySelector("#dk-bmb").addEventListener("click", () => Game.triggerBomb());
    updateWeapon(lastWeapon); updateMissile(null); updateBomb(lastBomb);
  }
  function updateWeapon(w) {
    lastWeapon = w; const c = `var(${WCOLOR[w.type]})`;
    const cell = $("#dk-wpn"); if (!cell) return;
    cell.style.setProperty("--dc", c);
    cell.innerHTML = `<span class="dock-k">WPN</span><span class="dock-v">${WLABEL[w.type]}</span>
      <span class="dock-lv">${[0,1,2,3,4].map((i)=>`<i class="${i<w.level?'f':''}"></i>`).join("")}</span>`;
    refreshWeaponPips();
  }
  function updateMissile(m) {
    const cell = $("#dk-msl"); if (!cell) return;
    const map = { art: ["M", "--w-art"], uiux: ["H", "--w-uiux"] };
    if (!m) { cell.style.setProperty("--dc", "var(--tx-4)"); cell.innerHTML = `<span class="dock-k">MSL</span><span class="dock-v">—</span>`; }
    else { cell.style.setProperty("--dc", `var(${map[m][1]})`); cell.innerHTML = `<span class="dock-k">MSL</span><span class="dock-v">${map[m][0]}</span>`; }
  }
  function updateBomb(n) {
    lastBomb = n; const cell = $("#dk-bmb"); if (!cell) return;
    cell.classList.toggle("empty", n <= 0);
    cell.innerHTML = `<span class="dock-k">◇ BOMB</span><span class="dock-v">${n}</span>`;
  }

  // ---- toasts --------------------------------------------------------------
  function toast(glyph, name, state, color) {
    const wrap = $("#toasts");
    const t = el("div", "toast");
    t.style.setProperty("--tc", color);
    t.innerHTML = `<b>${glyph}</b> ${name} · <b>${state}</b>`;
    wrap.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 340); }, 2400);
  }

  // ---- settings ------------------------------------------------------------
  const SCHEMES = {
    violet: { accent: "--violet", accent2: "--magenta", glow: "#8A5CFF" },
    magenta:{ accent: "--magenta", accent2: "--violet", glow: "#FF3DA6" },
    cyan:   { accent: "--cyan", accent2: "--violet", glow: "#3DF0FF" },
    blue:   { accent: "--nebula", accent2: "--aurora", glow: "#5B7CFA" },
  };
  const settings = Object.assign({ neon: 1, density: 1, starSpeed: 1, scheme: "violet", game: true },
    JSON.parse(localStorage.getItem("ky_set") || "{}"));
  function saveSet() { localStorage.setItem("ky_set", JSON.stringify(settings)); }
  function applySettings() {
    const r = document.documentElement.style;
    r.setProperty("--neon", settings.neon);
    const sc = SCHEMES[settings.scheme] || SCHEMES.violet;
    r.setProperty("--accent", `var(${sc.accent})`);
    r.setProperty("--accent-2", `var(${sc.accent2})`);
    r.setProperty("--accent-glow", sc.glow);
    Game.settings.neon = settings.neon;
    Game.settings.density = settings.density;
    Game.settings.starSpeed = settings.starSpeed;
    if (Game.setEnabled) Game.setEnabled(settings.game);
  }
  function buildSettings() {
    const s = $("#settings");
    s.innerHTML = `<div class="set-head"><h4>${T('settings')}</h4><button class="iconbtn" id="set-x" style="border:0;width:auto">${ICON.close}</button></div>`;
    const mkRange = (key, label, min, max, step) => {
      const row = el("div", "set-row");
      row.innerHTML = `<label>${label}</label><input type="range" min="${min}" max="${max}" step="${step}" value="${settings[key]}">`;
      row.querySelector("input").addEventListener("input", (e) => { settings[key] = parseFloat(e.target.value); applySettings(); saveSet(); });
      return row;
    };
    s.appendChild(mkRange("neon", T('neon'), 0.3, 1.4, 0.05));
    s.appendChild(mkRange("density", T('density'), 0.2, 2, 0.1));
    s.appendChild(mkRange("starSpeed", T('starspeed'), 0.2, 2.2, 0.1));
    // colour cast
    const crow = el("div", "set-row");
    crow.innerHTML = `<label>${T('scheme')}</label>`;
    const seg = el("div", "seg");
    [["violet", "VIOLET"], ["magenta", "MAGENTA"], ["cyan", "CYAN"], ["blue", "BLUE"]].forEach(([k, lbl]) => {
      const b = el("button", k === settings.scheme ? "on" : "", lbl);
      b.addEventListener("click", () => { settings.scheme = k; applySettings(); saveSet(); seg.querySelectorAll("button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); });
      seg.appendChild(b);
    });
    crow.appendChild(seg); s.appendChild(crow);
    // game toggle
    const trow = el("div", "set-row toggle-row");
    trow.innerHTML = `<label style="margin:0">${T('gametoggle')}</label>`;
    const sw = el("div", "switch" + (settings.game ? " on" : ""), "<i></i>");
    sw.addEventListener("click", () => { settings.game = !settings.game; sw.classList.toggle("on", settings.game); applySettings(); saveSet(); });
    trow.appendChild(sw); s.appendChild(trow);
    // controls reference
    const ctl = el("div", "set-controls");
    ctl.innerHTML = `
      <div class="ctl"><span>${T('ctrlMove')}</span><b>${T('ctrlMoveVal')}</b></div>
      <div class="ctl"><span>${T('ctrlFire')}</span><b>${T('ctrlFireVal')}</b></div>
      <div class="ctl"><span>${T('ctrlBomb')}</span><b>${T('ctrlBombVal')}</b></div>`;
    s.appendChild(ctl);
    // re-select fighter
    const re = el("button", "totop", T('restart'));
    re.style.width = "100%"; re.style.marginTop = "6px";
    re.addEventListener("click", () => { $("#settings").classList.remove("open"); document.body.classList.add("no-scroll"); $("#overlay").classList.remove("gone"); onlineState.clear(); updateMissile(null); buildHUD(); showSelect(); });
    s.appendChild(re);
    s.querySelector("#set-x").addEventListener("click", () => s.classList.remove("open"));
  }

  // ---- content -------------------------------------------------------------
  function secHead(id, num) {
    const m = D.sectionMeta[id];
    return `<div class="sec-head"><div class="sec-code">${m.code}</div><div class="sec-label">${L(m.label)}</div><div class="sec-num">${num}</div></div>`;
  }
  function renderContent() {
    const c = $("#content");
    c.innerHTML = "";

    // HERO
    const hero = el("section", "", "");
    hero.id = "hero";
    hero.innerHTML = `
      <div class="hero-code">${D.hero.code} · 00</div>
      <h1 class="hero-name">${D.hero.name.replace(" ", "<br>")}</h1>
      <div class="hero-title">${L(D.hero.title)}</div>
      <div class="hero-sub">${L(D.hero.sub)}</div>
      <p class="hero-tagline">${L(D.hero.tagline)}</p>
      <div class="scrollcue"><span class="ln"></span>${T('scroll')}</div>`;
    c.appendChild(hero);

    // ABOUT
    const about = el("section", "section"); about.id = "about";
    about.innerHTML = secHead("about", "01") + `
      <div class="about-grid">
        <div class="panel">
          <p class="lede">${L(D.about.lede)}</p>
          <p class="about-body">${L(D.about.body)}</p>
          <div class="kw">${D.about.keywords.map((k) => `<span>${k}</span>`).join("")}</div>
        </div>
        <div class="edu">${D.about.education.map((e) => `<div class="edu-item"><div class="edu-deg">${e.degree}</div><div class="edu-school">${e.school}</div><div class="edu-meta">${L(e.meta)}</div></div>`).join("")}</div>
      </div>`;
    c.appendChild(about);

    // EXPERIENCE
    const xp = el("section", "section"); xp.id = "experience";
    const X = D.experience;
    xp.innerHTML = secHead("experience", "02") + `
      <div class="xp-top">
        <span class="xp-role">${X.role}</span>
        <span class="xp-org">${X.org}</span>
        <span class="xp-place">${L(X.place)}</span>
        <span class="xp-period">${L(X.period)}</span>
      </div>
      <p class="xp-intro">${L(X.intro)}</p>
      <div class="xp-areas">${X.areas.map((a) => `<div class="xp-area"><h4>${L(a.t)}</h4><p>${L(a.d)}</p></div>`).join("")}</div>`;
    c.appendChild(xp);

    // PROJECTS
    const pj = el("section", "section"); pj.id = "projects";
    const sysColor = { aws: "--w-aws", azure: "--w-azure", gcp: "--w-gcp", mlai: "--w-mlai", art: "--w-art", uiux: "--w-uiux", none: "--accent" };
    const sysTag = { aws: "AWS", azure: "AZURE", gcp: "GCP", mlai: "ML/AI", art: "ART", uiux: "UI/UX", none: "LAB" };
    pj.innerHTML = secHead("projects", "03") + `
      <div class="proj-grid">${D.projects.map((p) => `
        <article class="proj" style="--pc:var(${sysColor[p.sys]})">
          <div class="proj-top"><span class="proj-sys">${sysTag[p.sys]}</span><span class="proj-period">${L(p.period)}</span></div>
          <h3>${p.name}</h3>
          <p>${L(p.blurb)}</p>
          <div class="proj-tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>
        </article>`).join("")}</div>`;
    c.appendChild(pj);

    // SKILLS
    const sk = el("section", "section"); sk.id = "skills";
    sk.innerHTML = secHead("skills", "04") + `
      <div class="skill-grid">${D.skills.map((g) => `<div class="skill-col"><h4>${L(g.g)}</h4><ul>${g.items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`).join("")}</div>`;
    c.appendChild(sk);

    // HOBBIES
    const hb = el("section", "section"); hb.id = "hobbies";
    const hc = { art: "--w-art", uiux: "--w-uiux" };
    hb.innerHTML = secHead("hobbies", "05") + `
      <div class="hob-grid">${D.hobbies.map((h) => `
        <article class="hob" style="--hc:var(${hc[h.sys]})">
          <div class="hob-badge">${h.missile}</div>
          <div class="hob-role">${L(h.role)}</div>
          <h3>${L(h.name)}</h3>
          <p>${L(h.desc)}</p>
          <div class="hob-tools">${h.tools.map((t) => `<span>${t}</span>`).join("")}</div>
        </article>`).join("")}</div>`;
    c.appendChild(hb);

    // CONTACT
    const ct = el("section", "section"); ct.id = "contact";
    ct.innerHTML = secHead("contact", "06") + `
      <p class="contact-line">${L(D.contact.line)}</p>
      <div class="contact-links">${D.contact.links.map((lk) => {
        const tag = lk.href ? "a" : "div"; const href = lk.href ? ` href="${lk.href}" target="_blank" rel="noopener noreferrer"` : "";
        return `<${tag} class="clink"${href}>${ICON[lk.icon] || ""}<span><span class="cl-label">${L(lk.label)}</span><br><span class="cl-value">${lk.value}</span></span></${tag}>`;
      }).join("")}</div>`;
    c.appendChild(ct);

    // FOOTER
    const ft = el("footer", "footer");
    ft.innerHTML = `<span class="f-mono">KECHENG YAO · MONTRÉAL · ${new Date().getFullYear()}</span>
      <button class="totop">${T('backToTop')} ${ICON.arrow}</button>`;
    ft.querySelector(".totop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    c.appendChild(ft);
  }

  // ---- wire Game callbacks -------------------------------------------------
  function wireGame() {
    Game.onSystemOnline = (id) => lightSystem(id);
    Game.onWeapon = (w) => updateWeapon(w);
    Game.onBomb = (n) => updateBomb(n);
    Game.onHit = () => {};
    // missile state: poll via onWeapon won't carry it; hook through systems
    const origLight = Game.onSystemOnline;
    Game.onSystemOnline = (id) => { origLight(id); if (id === "art") updateMissile("art"); if (id === "uiux") updateMissile("uiux"); };
  }

  // ---- boot ----------------------------------------------------------------
  function init() {
    document.documentElement.lang = lang === "zh" ? "zh" : lang;
    applySettings();
    buildTopbar(); renderContent(); buildHUD(); buildDock(); buildSettings();
    wireGame();
    Game.init($("#game-canvas"));
    document.body.classList.add("no-scroll");
    buildOverlay();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
