# Jakaroo Rescue — QA & PR Notes

**Last run:** 2026-05-29 (Phase A trust pass — blank routes, legal UX, board interaction)  
**Branch:** `rescue/architecture-game-table` (uncommitted local changes)  
**Preview URL:** https://deploy-preview-5--jackaroo-online.netlify.app  
**Build:** `npm run build` — **PASS** (2026-05-29)

## Phase A status: **NOT GREEN**

Gameplay trust and route stability improved in code; **manual sign-off still required** (incognito 2p, 10× game refresh, full leave/back matrix).

## QA environment notes

| Item | Result |
|------|--------|
| Build (`npm run build`) | **PASS** |
| Firebase rules deploy from agent | **NO** — user must deploy |
| Netlify SPA redirects | **YES** — `netlify.toml` has `/* → /index.html` (200) |
| Local dev QA | **Partial** — build-only this pass |
| Dual-tab automation | **Limitation** — shared Firebase Auth; use incognito for 2-human start |

**User must deploy rules:**

```bash
cp .firebaserc.example .firebaserc
firebase login
firebase deploy --only database --project jackaroo-online-f6b7f
```

## Implemented this pass (code)

### A — Blank / branded route states
- `GamePage` / `LobbyPage` gate on `ready_play` / `lobby_ready` with `RoomRouteViewport` + `RoomRouteFallback` (no bare game shell).
- `RoomSessionContext`: `subscribedRoomCodeRef` — avoid `roomLoaded` flash on resubscribe.
- `GamePlayContext`: `handScopeRef` — avoid hand-loading flash on resubscribe; `getAuthUserOrCurrent()` for `playerId`.
- CSS: `.room-route-viewport`, `.status-panel-screen` `min-h-[100dvh]`.

### B — Legal move audit (dev)
- `src/lib/game/legalMoveAudit.ts` — console audit when `import.meta.env.DEV` and `VITE_LEGAL_AUDIT !== '0'`.
- Wired from `FullScreenGameTable` on turn + selected card.

### C — No-legal-move explanations
- `explainNoLegalMove.ts` + i18n (en + ar).
- `PlayActionSheet` shows reason above discard-all.

### D — Board interaction (partial)
- `useBoardPlaySelection`: card → marble → target hole → submit.
- Distinct marble glow (selectable / selected) vs target hole highlights.
- **Needs verification:** dangerous-move confirm, Jack/swap two-click flow, all card types.

### E — Board visual (partial)
- Center pit inlay (less dead center); drilled holes / wood retained.
- **Needs verification:** vs physical wooden reference.

### F–K — HUD / hand / lobby (partial)
- Hand dock: “Your hand”, waiting overlay, fixed rail CSS.
- Game HUD: `Table {code}`, leave **confirm modal**, turn copy `{name} is choosing a card`.
- Voice demoted in-game (`Voice soon` chip; real WebRTC out of scope).
- Lobby: seats farther from mini board; non-maker “waiting for host” hint.
- Display name validation (2–20 chars) on create/join; `formatPlayerName` utility.

### Tier 1 mega-list (partial)
| Item | Status |
|------|--------|
| 1–2 Display name validation + ellipsis | **Done** (create/join) |
| 3–5 Table code label, Show Deck casing | **Partial** — HUD uses `Table {code}`; lobby plaque still numeric code |
| 7–8 Leave game confirm | **Done** (in-game) |
| 9 Start disabled reasons + waiting for maker | **Done** |
| 33–35 Join progress stages | **Done** (join page) |
| 66–68 Error boundaries on routes | **Existing** on Game/Lobby pages |
| 78 Netlify SPA | **Documented** above |

## NOT done / needs verification

| Area | Notes |
|------|--------|
| 10× refresh `/game/:code` | **Not run** — must show loading/fallback/game, never blank black |
| 2-human ready → start → both in game | **Not run** — incognito required |
| Legal engine correctness | Audit helps debug; **not proven** vs Obaida Classic matrix |
| Board click flow all cards | **Partial** |
| Burn copy with next player name in action panel | **Not done** this pass |
| Copy invite message, kick confirm | **Not done** |
| Tab titles (96) | **Not done** |
| Toast system (62–64) | **Not done** |
| Deal/event banner dedup | **Not done** |
| Firebase rules in production | **User deploy** |

## Dev: legal move audit

```bash
# default on in dev; disable with:
VITE_LEGAL_AUDIT=0 npm run dev
```

Open browser console on your turn — collapsed `[Jakaroo legal audit]` group with marbles, per-card actions, discard-all reason key.

## Slice 1 manual QA matrix (unchanged gaps)

| Test | Pass | Notes |
|------|------|-------|
| `npm run build` | **Yes** | 2026-05-29 |
| Refresh game 10× no blank screen | **Not run** | **Blocker for Phase A** |
| 2p UI join + start + both in game | **Not run** | Incognito |
| `05-game-playerB.png` | **Missing** |
| Leave/back/refresh matrix | **Not run** |
| Firebase rules production | **No** |

## Out of scope (documented)

- Real WebRTC voice, text chat, rematch, matchmaking, tournaments, stats
- Full deal animation (banner-only acceptable for now)

## Screenshots

Prior screenshots in `docs/qa-screenshots/` — **not re-captured** this pass. Re-run after manual QA.
