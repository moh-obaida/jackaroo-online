# Design References — Jakaroo Online

**Purpose:** Capture what external board-game UIs teach us about layout and flow, without copying their branding or game mechanics.

**Status:** Reference document only. A full design-reference UI pass is **deferred until Phase A trust is green** (blank routes, 2p join/start, legal moves, board interaction). See [RESCUE_QA.md](./RESCUE_QA.md).

---

## Physical board reference

The canonical wooden Jackaroo board photo is checked in at:

`docs/reference/physical-jackaroo-board.png`

The live game board uses this file **directly** as the board surface (`PhysicalPhotoBoardVisual` → `public/board/physical-jackaroo-board.jpg`). Interactive marbles and move highlights are overlaid on calibrated coordinates in `src/lib/board/physicalBoardRef.ts`.

Replace `public/board/physical-jackaroo-board.jpg` with a higher-resolution photo (same framing) when available. Set `VITE_BOARD_PROCEDURAL=1` only to fall back to the old SVG board.

---

## Source material (references only)

Screenshots and flows from games such as **Monopoly-style** and **Richup-style** online board portals are **UX and structure references only**.

| Use as reference | Do **not** treat as assets |
|------------------|----------------------------|
| Layout patterns, information hierarchy, screen flow | Logos, mascots, typography, color palettes |
| How a “table” feels centered in play | Purple/neon casino skins, dice, properties, money UI |
| Lobby seat ring around a mini board | Ads, paywalls, cartoon avatars, childish Flash chrome |
| Rules guide with prev/next and diagrams | Pixel-perfect clone of another product |

---

## Copy aggressively (structure & UX)

These patterns should inform Jakaroo when we do the post–Phase A polish pass:

1. **Portal home** — One clear hero, primary CTA (create/join), secondary paths, feature grid below the fold (not a long form first).
2. **Board-centered game** — Board is the hero; hand and actions attach to the board, not a disconnected form panel.
3. **Visual seats** — Players arranged around the table; color/team identity at a glance; “You” vs opponent clear.
4. **Rules guide** — Card-by-card (or rank-by-rank) with **prev/next**, short copy, and **mini board diagrams** where helpful; never expose live deck order.
5. **Game-style buttons** — Primary/secondary/danger with consistent depth; disabled states with visible reason.
6. **Invite plaque** — Room/table code prominent, copy affordance, optional invite message; password visible only to host when appropriate.
7. **Action hierarchy** — Turn → select card → board targets → confirm; action panel echoes selection; burn/discard explain target and effect.

---

## Do not copy

- Monopoly / Richup **logos**, names, or trade dress  
- **Purple** or other competitor **theme colors** as Jakaroo identity  
- Dice, properties, money, chance cards, or non-Jackaroo mechanics  
- **Ads**, interstitials, or engagement bait  
- **Cartoon avatars** or childish Flash-style UI  
- Any attempt at a **pixel-perfect clone** of another product  

---

## Jakaroo identity (target feel)

| Dimension | Direction |
|-----------|-----------|
| Mood | Premium private **wooden table** — adult, calm, intentional |
| Palette | Dark wood, **gold** accents, **cream** text, felt green play surface |
| Pieces | Drilled holes, colored marbles, readable cards (not generic diagram) |
| Social | **Private table** + code/password — friends, not public matchmaking lobby |
| Locales | **English + Arabic** (RTL) as first-class, not bolt-on |
| Avoid | Childish, casino-neon, cluttered dashboard sidebars, fake features |

Gameplay truth comes from **Obaida Classic** rules and engine — visuals follow the model, not the other way around.

---

## Acceptance criteria by screen

### Home
- [ ] Hero balanced above the fold; create/join obvious; guest path clear  
- [ ] Feature cards not clipped on common laptop/mobile heights  
- [ ] EN/AR toggle does not break layout  

### Create table
- [ ] Mode selection updates **helper text** and **seat preview** (not a floating decorative board)  
- [ ] Grouped fields: identity, access, mode, rules — not one endless form  
- [ ] Custom rules honestly disabled or labeled if not ready  

### Lobby / waiting table
- [ ] **2/2** (or n/n) and ready state obvious; start disabled **reason** visible  
- [ ] Seats **outside** mini board — no overlap with seat cards  
- [ ] Host: code plaque, password reveal/copy; non-host: waiting-for-host copy  
- [ ] “Show Deck” opens **static guide** only  

### Game
- [ ] No blank black route; branded loading or fallback  
- [ ] Board centered; hand dock fixed; turn/action hierarchy clear  
- [ ] Private hand only; opponents show **backs/count** only  
- [ ] Card → marble → target flow visually distinct  
- [ ] No-legal-move shows **reason** before discard-all  
- [ ] Leave game confirms during active play  

### Rules / Show Deck
- [ ] Opens at top; mobile scroll; no deck order leak  
- [ ] Future: prev/next + diagrams per rank (post–Phase A)  

### Mobile (in-game)
- [ ] `/game/:code` at narrow width: board visible, hand scrollable, action rail usable, safe-area respected  

### Arabic
- [ ] RTL alignment on lobby seats, actions, modals, fallbacks  

---

## Priority vs Phase A

```text
Now (Phase A / A.5):     Trust — routes, join, legal moves, board clicks, honest QA
Later (design pass):     Apply this doc — layout, seats, rules guide UX, button system
Never:                   Competitor branding, wrong mechanics, fake voice/chat/tournaments
```

Cross-links: [RESCUE_QA.md](./RESCUE_QA.md) · [ARCHITECTURE_REFERENCES.md](./ARCHITECTURE_REFERENCES.md) · [CARDS_AND_RULES_REFERENCE.md](./CARDS_AND_RULES_REFERENCE.md)

---

## Board visual pass (2026-05-29)

A layered SVG rebuild of `boardVisual.tsx` + track/home path helpers in `boardGeometry.ts` targets a **physical wooden Jackaroo board** (octagonal body, carved track following hole polyline, corner nests, inward home lanes, center card well). **No reference photo was in the repo** (`assets/`, `docs/`, or Cursor project assets) — radii and proportions are tuned to typical physical layouts. **User photo comparison still required** before calling the board production-accurate.
