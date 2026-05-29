# Jakaroo Rescue — QA & PR Notes

**Last run:** 2026-05-29 (Phase A re-QA after join/auth fixes)  
**Branch:** `rescue/architecture-game-table` (local uncommitted join/auth fixes)  
**Preview URL:** https://deploy-preview-5--jackaroo-online.netlify.app  
**Build:** `npm run build` — **PASS** (2026-05-29)

## QA environment notes

| Item | Result |
|------|--------|
| Build (`npm run build`) | **PASS** |
| Firebase rules deploy from agent | **NO** — not authenticated; user must deploy |
| Local dev QA (`127.0.0.1:5173` + `.env`) | **Primary** — functional pass for join/lobby/game/fallbacks |
| Dual-tab browser automation | **Limitation** — Firebase Auth is shared per browser profile; second tab overwrites guest UID, so room-maker **Start Game** + 2-human in-game matrix need **incognito / second browser** for full sign-off |

**User must deploy rules locally:**

```bash
cp .firebaserc.example .firebaserc
firebase login
firebase deploy --only database --project jackaroo-online-f6b7f
```

## Code fixes this pass

- **`getLobbySeatInfo` + `JoinRoomPage`:** When a guest joins with a different display name than the seated anonymous user (same browser profile), rotate to a **fresh guest** (`logOut` → `signInAsGuest`) so the second human gets a new seat.
- **`useRoomRouteState`:** `effectiveAuthLoading = authLoading && !authUser` using `getAuthUserOrCurrent()` so lobby/game routes do not stick on **Loading session…** after guest sign-in.
- **`RoomSessionContext`:** `playerId` uses `getAuthUserOrCurrent()` for the same reason.
- **`CreateRoomPage` / `JoinRoomPage`:** `getAuthUserOrCurrent()` after `signInAsGuest()` (existing).

## Slice 1 Phase A manual QA matrix

| Test | Pass | Notes |
|------|------|-------|
| `npm run build` | **Yes** | 2026-05-29 |
| Home loads | **Yes** | Not re-screenshotted this pass |
| Create room form | **Yes** | Local create → lobby |
| Join second player (UI) | **Yes** | Tab B `/join` → room `309769` **2/2** (PlayerA + PlayerB); no REST seating |
| 2p lobby 2/2 | **Yes** | `03-lobby-2p.png` (PlayerB view) |
| Ready + start game (2 humans, UI) | **Not run** | Shared auth in automation: maker tab loses PlayerA session after tab B guest rotation; **manual incognito required** |
| Both on game screen (2 humans) | **Not run** | Same blocker |
| Game screen (maker + bot) | **Yes** | Rooms `846139`, `182578` — start/leave/mobile |
| Private hands (own only) | **Partial** | PlayerA desktop game verified earlier pass; PlayerB in-game not captured |
| Opponent card backs/count | **Partial** | Bot opponent shows backs + count in game UI |
| Show Deck (guide only) | **Yes** | Modal states guide does not reveal shuffled order |
| Leave lobby → home | **Yes** | Tab B left lobby `309769` → `/` |
| Leave game → home | **Yes** | Mobile game `182578` → `/` |
| Spam leave 5× | **Not run** | |
| Browser back after leave | **Not run** | |
| Refresh after leave | **Not run** | |
| Refresh while seated | **Not run** | |
| Current player leave during game | **Not run** | Blocked on 2-human in-game session in automation |
| Non-room-maker leave during game | **Not run** | Same |
| `/lobby/999999` invalid | **Not run** | Prior pass (`07-invalid-room.png`) |
| `/game/999999` invalid | **Not run** | Prior pass |
| Expired room fallback | **Not run** | Prior pass (`08-expired-room.png`) |
| Not-member after leave | **Yes** | After leave, `/lobby/309769` → not-member panel; `06-leave-fallback.png` updated |
| `left_room` panel | **Not run** | |
| Arabic RTL smoke | **Not run** | Prior `09-arabic.png` |
| Mobile in-game | **Yes** | `10-mobile-game.png` — actual game at 390×844; board + hand dock + actions visible |
| Firebase rules in production | **No** | Agent cannot deploy |

## Screenshots (`docs/qa-screenshots/`)

| File | Status |
|------|--------|
| `01-home.png` | Prior pass |
| `02-create.png` | Prior pass |
| `03-lobby-2p.png` | **Updated** — UI join 2/2 (`309769`, PlayerB view) |
| `04-game-playerA.png` | **Updated** — bot game `846139` (desktop) |
| `05-game-playerB.png` | **Missing** — needs second browser profile / incognito |
| `06-leave-fallback.png` | **Updated** — not-member after leave |
| `07-invalid-room.png` | Prior pass |
| `08-expired-room.png` | Prior pass |
| `09-arabic.png` | Prior pass |
| `10-mobile-game.png` | **Updated** — in-game mobile `182578` |

## PR review comments (Phase A scope)

| Area | Status |
|------|--------|
| Route machine / `room_expired` / session marks | **Done** (prior commits) |
| `joinRoom` direct `set` + retry (no parent transaction) | **Done** |
| Firebase rules field guards (`1c0094e`) | **In repo** — deploy pending |
| Lobby hooks / leave / forms / bots / docs fences | **Done** (`cb01c49` triage) |
| Guest join hang / second seat same profile | **Fixed this pass** (fresh guest + `effectiveAuthLoading`) |
| Board a11y, voice UI, full Tailwind, stylelint | **Deferred** (Slice 2+) |

Codex connector reviews hit usage limits on PR #5 during this period; CodeRabbit walkthrough only.

## Slice 1 acceptance gate

**Phase A: partial — not green.**

| Gate | Status |
|------|--------|
| Second player join via UI | **Met** (local) |
| 2-human ready → start → both in game | **Not met in automation** — manual incognito QA required |
| `05-game-playerB.png` | **Missing** |
| Leave/back/refresh full matrix | **Incomplete** |
| In-game leave (maker / non-maker) | **Not run** |
| Firebase rules deployed | **User action** |

**Do not start Slice 2** until: rules deploy, incognito 2p game sign-off, PlayerB screenshot, and remaining leave/back/refresh cases are run.
