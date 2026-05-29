# Kecheng Yao — Personal Page · Brief & Origin Log

**Created:** May 29, 2026
**Source material:** `uploads/kecheng_yao_telotia_internal_cv_background.md`
**Design system:** Principia (cosmic palette) — `/projects/96dc9838-f759-4efa-a985-4f840fab8b24/`

---

## Original request (verbatim intent)

Build a personal page for Kecheng Yao with a **cyberpunk / neon / blue-purple (霓虹灯, 蓝紫色调)** theme.

The background is literally a **Raiden-style (雷电) top-down shoot-'em-up game**. The user's mouse cursor becomes a cool lightning fighter jet. Before entering, the user picks one of **three fighters** (each with a default main weapon), **or** picks "default cursor" — which gives only the cool background with no game layer.

### Power-up system (maps real skills/hobbies onto game items)

**I. Main weapon (cannon / laser) = cloud providers.** Picked up via a colour-cycling power-up:
- **AWS (red)** — Vulcan cannon / shotgun: fast fire, widens into a fan sweep as it levels up.
- **AZURE (blue)** — Laser: straight, concentrated; beam thickens + gains penetration when upgraded.
- **GOOGLE CLOUD (purple)** — Plasma beam: auto-locks onto enemies, sustained high damage.
- Eating more power-ups = stronger. Switching between types keeps the same power level.

**II. Sub-weapon (missiles).** Switched via "M" or "H" pickup:
- **ART DESIGN (hobby 1) — "M" missile (yellow):** slow, very high damage, heavy area blast.
- **UI/UX (hobby 2) — "H" missile (green):** homing / auto-lock, lower damage, great for clearing.

**III. Bomb = ML / AI learning.** Ultimate: full-screen clear + brief invincibility. "Photon shockwave."

---

## Answers given (May 29, 2026)

| Question | Answer |
|---|---|
| Game depth | No score. If hit by an enemy, ship just flickers red lightly. |
| Power-up ↔ content link | **Both** — weapon visuals change AND a small HUD unlocks/highlights the matching section. |
| Sections | Hero, About/bio, Experience (Ericsson + timeline), Major projects, Skills matrix, Hobbies, Contact/LinkedIn (+ Education, my call). |
| Language | English + **Français** + **中文** toggle. |
| Tone | 50 / 100 (balanced — playful but a real founder page). |
| Enemies | My call → themed DevOps gremlins: INCIDENT, LATENCY, BUG, ALERT, DOWNTIME. |
| Fighters | 3 = AWS Vulcan / Azure Laser / GCP Plasma + plain-cursor option. |
| Photo | None provided → styled placeholder. |
| Extra links | "in the .md" → only LinkedIn present: https://www.linkedin.com/in/kecheng-yao/ |
| Tweaks | My call → neon intensity, colour scheme, difficulty/density, star speed, game on/off. Delivered as an **in-page settings panel** (so it survives sharing/export). |
| Mobile | Yes — touch drag moves the ship. |

---

## Key facts pulled from CV

- **Name:** Kecheng Yao · **Location:** Montréal, Québec, Canada
- **Title:** Co-founder & Infrastructure / AI Systems Lead · DevOps Engineer @ Ericsson (Aug 2022–Present)
- **Education:** Concordia — B.Eng Computer Engineering (2022); M.A.Sc Quality Systems Engineering (in progress, Power Corporation Grad GCS Scholarship)
- **LinkedIn:** https://www.linkedin.com/in/kecheng-yao/

### System ↔ section mapping (for HUD + power-ups)
- AWS (red, Vulcan) → AWS migration / cloud projects
- Azure (blue, Laser) → Azure platform project
- GCP (purple, Plasma) → Skills / cloud breadth
- M missile (yellow) → Hobby: Art Design
- H missile (green) → Hobby: UI/UX
- Bomb (ML.AI) → AI projects (KIRO, Anomaly Detection)

---

## File map
- `Kecheng Yao.html` — shell + canvas + content + HUD + start screen + settings
- `app/styles.css` — cyberpunk-neon styling on Principia cosmic tokens
- `app/data.js` — trilingual content + project/skill data (`window.SITE_DATA`)
- `app/game.js` — the shmup engine (`window.Game`)
- `app/ui.js` — start screen, content render, HUD, toasts, language, settings
