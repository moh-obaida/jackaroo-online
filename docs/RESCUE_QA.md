# Jakaroo Rescue — QA & PR Notes

**Last run:** 2026-05-29 (MEGA TASK — start flow + trust messages)  
**Branch:** `rescue/architecture-game-table` (commit `b1759f0` on remote)  
**Preview URL:** https://deploy-preview-5--jackaroo-online.netlify.app  
**Build:** `npm run typecheck` + `npm run build` — **PASS** (2026-05-29, local)

### MEGA TASK delta (2026-05-29)

- **JoinRoomPage:** Removed `logOut()` before second guest (was signing out host tab). Shows `join.error.alreadySeated` when same Firebase uid is already seated.
- **LobbyPage:** Surfaces `lobby.startFailed`, `lobby.startWaitingAll`, session errors.
- **GamePlayContext / RoomRouteFallback:** Hand load failure → `game.handLoadFailed` (i18n).
- **Post-transaction cleanup:** `game.moveRejectedStale` + `game.handSyncFailed` i18n; `savePrivateHandWithRetry` after RTDB commit; in-game alerts use `translateSessionMessage`.
- **ConnectionBar:** Syncing → `connection.reconnecting` copy.
- **docs/ARCHITECTURE.md:** Private hands / deck audit (Phase 2) + hand write recovery.
- **Board asset:** `public/assets/board/jakaroo-board-game-empty.png` **missing** from repo — image board falls back to text until asset added.

## Phase A.5 status: **PARTIAL — NOT GREEN**

Code build passes and several trust UX fixes are on Preview 5. **Manual incognito 2-human start → in-game** is still required for sign-off. Automation in Cursor browser **cannot isolate two Firebase Auth sessions** (dual tab shares guest UID → host loses **Start Game** after second join).

---

## QA environment

| Item | Result |
|------|--------|
| Build (`npm run build`) | **PASS** |
| Browser QA target | **Preview 5** (Netlify deploy preview) |
| Firebase rules deploy (agent) | **NO** — user must deploy |
| Netlify SPA (`netlify.toml` → `/index.html`) | **YES** |
| Legal audit on preview | **N/A** — production bundle; use `npm run dev` locally (`VITE_LEGAL_AUDIT`) |
| Dual-tab 2-human | **FAIL** in automation — use **incognito** for real 2p |
| Netlify drawer | Blocks bottom clicks — use CDP `Runtime.evaluate` for buttons |

**Deploy rules (user):**

```bash
cp .firebaserc.example .firebaserc
firebase login
firebase deploy --only database --project jackaroo-online-f6b7f
```

---

## Phase A.5 browser QA matrix (Preview 5)

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | Create 2p table (UI) | **PASS** | Room `107732` / `413896` created; CDP click for Create Table |
| 1 | Join 2nd player (2nd tab) | **PASS** | Lobby **2/2**, PlayerA + PlayerB visible |
| 1 | Both ready → Start Game | **FAIL** | Shared auth: both tabs show **Ready Up**; **no Start Game** on host tab after join |
| 1 | Both reach game screen | **NOT TESTED** | Blocked by start |
| 1 | Private hands only | **NOT TESTED** | Prior screenshot `04-game-playerA.png` (older session); not re-verified this run |
| 1 | Opponent backs/count only | **NOT TESTED** | Needs in-game |
| 1 | Show Deck — no deck order | **PASS** | Modal states guide does not reveal shuffled order or hidden hands |
| 2 | 10× refresh `/game/:code` | **PASS** (partial log) | See [Refresh test](#refresh-test-10) — **0** blank-black-only |
| 3 | Board card → marble → target | **NOT TESTED** | Needs active turn in game |
| 4 | No-legal-move reason text | **NOT TESTED** | Needs in-game discard-all state |
| 5 | Legal audit console | **N/A** on preview | Dev build only |
| 6 | Leave lobby | **PASS** | Leave Room → navigates home |
| 6 | Leave game + confirm | **NOT TESTED** | No active game this run |
| 6 | Back/refresh after leave | **NOT TESTED** | |
| 6 | Leave during game (maker / non-maker) | **NOT TESTED** | |
| 7 | Mobile in-game viewport | **PARTIAL** | `/game/413896` at 390×844: branded **Game not started** fallback (AR after locale toggle); not live hand/board |
| 8 | Invalid room fallback | **PASS** | `/lobby/999999` — Room not found + Back Home |
| 8 | Expired room fallback | **NOT RE-RUN** | See `08-expired-room.png` (2026-05-28) |
| 9 | Arabic UI | **PASS** | RTL home + game fallback; `09-arabic.png` |
| 10 | `npm run build` | **PASS** | |

---

## Refresh test (10×)

**URL:** `/game/413896` (lobby room, not started)  
**Method:** Browser navigate/reload on Preview 5 (2026-05-29)

| Refresh # | Observed UI (within ~2s) | Blank black only? |
|-----------|--------------------------|-------------------|
| 1 | Loading room… / Connecting to room | No |
| 2 | Game not started / room still in lobby | No |
| 3–10 | Same pattern on repeat navigate | No |

**Summary:** **10/10** showed branded status (`Loading room…`, `Game not started`, or localized equivalent). **0/10** empty black shell only. Body background `rgb(20, 16, 12)` with visible `h2` + message.

> Full in-game refresh (while `status=playing`) still **needs verification** after incognito 2p start.

---

## Legal audit

| Environment | Result |
|-------------|--------|
| Preview 5 (production build) | **N/A** — `[Jakaroo legal audit]` not in bundle |
| Local `npm run dev` | **NOT RUN** this pass — enable per `docs/RESCUE_QA.md` dev section |

---

## Board interaction / no-legal-move

| Test | Result |
|------|--------|
| Selected card visible | **NOT TESTED** |
| Marble vs target highlights | **NOT TESTED** |
| Invalid click feedback | **NOT TESTED** |
| Discard-all with reason | **NOT TESTED** |

Blocked until **incognito 2p → start → in-game**.

---

## Screenshots (`docs/qa-screenshots/`)

| File | Status | Notes |
|------|--------|-------|
| `01-home.png` | **Captured** | Preview 5, 2026-05-29 |
| `02-create.png` | **Captured** | Lobby screenshot overwritten during Show Deck — use `02-create-room-desktop.png` for create if needed |
| `03-lobby-2p.png` | **Captured** | Show Deck modal (2p lobby `107732` host view) |
| `04-game-playerA.png` | **Stale** | 2026-05-29 copy; not from this run |
| `05-game-playerB.png` | **Missing** | Needs incognito Player B in game |
| `06-left-fallback.png` / `06-leave-fallback.png` | **Captured** | Leave → home (2026-05-29) |
| `07-invalid-room.png` | **Captured** | Preview 5, 2026-05-29 |
| `08-expired-room.png` | **Stale** | 2026-05-28; not re-run |
| `09-arabic.png` | **Captured** | RTL home, 2026-05-29 |
| `10-mobile-game.png` | **Captured** | Narrow viewport game route fallback |
| `11-board-selection-flow.png` | **Missing** | Needs in-game |
| `12-no-legal-reason.png` | **Missing** | Needs discard-all state |

---

## Known blockers / remaining bugs

1. **2-human start in automation** — Second browser tab shares Firebase Auth with first; host loses **Start Game**. **Mitigation:** Player B in **incognito/private** window (required for Phase A green).
2. **In-game QA** — Private hands, board flow, no-legal reason, leave-during-game unverified on Preview 5 this run.
3. **Firebase rules** — Production rules deploy not verified from agent; permission-denied may still cause hangs in the wild.
4. **Netlify drawer** — Overlays bottom of viewport; blocks native clicks (workaround: CDP).
5. **Legal audit** — Only on dev build; preview QA is N/A.

---

## Code delivered (trust pass — on Preview 5 after deploy)

See commit `b1759f0`: route fallbacks, legal audit (dev), no-legal explanations, board selection hook, display-name validation, leave confirm, hand/HUD polish.

**Design reference doc (no UI redesign in that commit):** [DESIGN_REFERENCES.md](./DESIGN_REFERENCES.md)

---

## Dev: legal move audit

```bash
npm run dev
# Console on your turn: [Jakaroo legal audit]
# Disable: VITE_LEGAL_AUDIT=0 npm run dev
```

---

## Out of scope (unchanged)

Real WebRTC voice, text chat, rematch, matchmaking, tournaments, stats, aggressive Home/Create redesign per [DESIGN_REFERENCES.md](./DESIGN_REFERENCES.md).

**Board visual (2026-05-29):** Image-mapped premium board (`ImageMappedBoardVisual`) is the default gameplay renderer. Coordinate tuning uses dev-only calibration mode — see [BOARD_CALIBRATION.md](./BOARD_CALIBRATION.md). Do **not** calibrate from screenshots; use the live app board.

### Board calibration checklist

Enable `VITE_ENABLE_BOARD_CALIBRATION=true` or `VITE_BOARD_CALIBRATION=1`, then verify on the **gameplay** board (not lobby preview alone):

| Viewport | Checks |
|----------|--------|
| Desktop 1280+ | Mapped dots align with holes; marbles centered; legal target rings centered |
| Laptop | Same as desktop after refresh |
| iPad / tablet width | No overlay drift; object-fit contain; hit zones tappable |
| Mobile landscape (if used) | Board not cropped; marbles/rings still aligned |
| After refresh | Positions unchanged |
| Move marble | Marble animates to correct hole center |
| Select marble | Selection ring centered on marble |
| Target ring | Gold ring centered on destination hole |
| Legal click zone | Tap/click registers on hole, not offset |

Disable calibration env flags before production deploy.

### Board map QA (full exact map)

With calibration enabled on the **gameplay** board, spot-check:

| Area | Verify |
|------|--------|
| Base (16) | All nest marbles centered in holes |
| Gates (4) | Start/gate rings centered; lock ring not oversized |
| Home (16) | Home path direction correct; marbles in grooves |
| Track (72) | Target rings on holes, not between holes |
| Hit zones | Tap/click matches visible hole |
| Resize | Desktop 1280+, tablet 768–1024 — no overlay drift |
| Refresh | Positions unchanged after reload |
| One real move | Marble lands on destination hole center |

Regenerate assisted data: `node scripts/extract-image-exact-points.mjs`. Tune individual points via `IMAGE_COORDINATE_OVERRIDES` if needed.

### Obaida Classic rule engine audit

See [OBAIDA_RULE_AUDIT.md](./OBAIDA_RULE_AUDIT.md) for risky edge cases (home entry, gate blocker, King path, split 7, burn, hand sync). Automated tests: `src/lib/game/obaidaRuleAudit.test.ts`.

**Base/nest visual QA:** With calibration on, confirm `B nest 1–4` dots form a balanced TL square (not a diagonal line). Green TR nest should have even spacing on all sides. Marbles should sit inside holes with visible gold rim.

---

## Sign-off checklist (human)

Use **Chrome normal + Chrome Incognito** (separate Firebase Auth sessions). Deploy Firebase rules first.

### Chrome + Incognito 2-player manual QA

| Step | Window | Action | Pass criteria |
|------|--------|--------|---------------|
| 1 | Chrome (host) | Create 2p table, set password, note code | Lobby opens, host is maker |
| 2 | Incognito (guest) | Join with code + password | Lobby shows **2/2**, distinct display names |
| 3 | Both | Ready Up | Both show ready; host sees **Start Game** |
| 4 | Host | Start Game | Both navigate to `/game/:code` |
| 5 | Both | Wait for deal | Each sees own cards only; opponent shows backs/count |
| 6 | Active player | Play a card (sheet or board tap) | Board marbles update on both; turn advances |
| 7 | Active player | Board flow: card → marble → gold target | Highlights clear after submit; next turn UI resets |
| 8 | Either | Double-click confirm quickly | Only one move commits; no duplicate turn |
| 9 | Either | Refresh during active game (×3) | Branded loading → game resumes; no blank screen |
| 10 | Both | Verify board sync | Marble positions match after each move + refresh |
| 11 | Active player | Force stale reject (both submit near-same time, or refresh mid-turn then submit) | Warning shows localized `game.moveRejectedStale`; selection clears |
| 12 | Either | Leave game (confirm) | Returns home; seat cleared |
| 13 | Incognito | Toggle Arabic | Stale/hand-sync errors render in Arabic |

### Legacy checklist

- [ ] Incognito: join → 2/2 → both ready → **Start Game** → both in `/game/:code`
- [ ] 10× refresh **in active game** — no blank screen
- [ ] Board flow + no-legal reason screenshots (`11`, `12`, `05`)
- [ ] Firebase rules deployed and join/start works on preview domain
