# Jakaroo Rescue — QA & PR Notes

**Last run:** 2026-05-28 (Slice 1 — Phase A stability)  
**Branch:** local `rescue/architecture-game-table` (or current working branch)  
**Build:** `npm run build` — **PASS**

## Architecture (Phases 1–7)

- Single `subscribeToRoom` in `RoomSessionContext`
- `GamePlayContext` owns game/hand subs, hand timeout, bots
- Route state machine: `resolveRoomRouteState` + `RoomRouteFallback`
- `safeLeaveRoom`: leaving → epoch bump → `markLeft` → clear session → navigate home → Firebase background
- `sessionEpoch` guards room, gameState, privateHand, bot timer, hand timeout callbacks
- No `localRoom` on Lobby/Game pages
- `BackHomeButton`: `navigate` (home only) vs `clearSession` (no Firebase leave)

## Slice 1 changes (this pass)

- **`room_expired` route state** — [`src/lib/room/routeState.ts`](../src/lib/room/routeState.ts) + [`roomExpiry.ts`](../src/lib/room/roomExpiry.ts): `status === 'expired'` or lobby past `expiresAt`
- **Fallback UI** — [`RoomRouteFallback`](../src/components/game/RoomRouteFallback.tsx) + i18n `game.roomExpired` / `game.roomExpiredMessage`
- **Join rejects expired lobby** — [`joinRoom`](../src/lib/firebase/rooms.ts)
- **Firebase rules** — room-maker may set `connected: false` on any player during `playing` (kick / leave-for-other paths); self-leave unchanged
- **Pre-merge stability fixes** (same PR): password fields, FormField `htmlFor`, duplicate burn filter, bot timer ref reset, HandDock single `hand` prop, ConnectionBar live guard, kick guard, leaveWarning on catch, Profile `<Navigate>`, clipboard try/catch, AR `أوبيدا` → `أوبيدا`, a11y on TableActivity/WinOverlay

## Firebase rules — deploy required

Repo [`firebase.database.rules.json`](../firebase.database.rules.json) includes:

- Lobby: player self-delete on `players/$playerId`
- **Playing:** `connected: false` on room + `gameState.players` (self or room maker)
- **Playing:** turn advance via `gameState` write (room maker or current turn player)
- `updatedAt` on leave is **not** bundled with disconnect writes (best-effort separate update in code)

### Deploy status

| Check | Result |
|-------|--------|
| Rules file updated in repo | **Yes** (Slice 1) |
| `.firebaserc` in git | **Removed** — Netlify secret scan blocked deploy when it was committed; copy `.firebaserc.example` locally |
| **Deploy command** | `firebase deploy --only database --project <your-firebase-project-id>` (see Netlify `VITE_FIREBASE_PROJECT_ID`) |
| Deploy confirmed from agent | **No** — requires `firebase login` on your machine |

**Do not claim “leave fixed in production” until deploy is confirmed.**

## Phase A / Phase 7 manual QA checklist

| Test | Pass | Notes |
|------|------|-------|
| `npm run build` | **Yes** | 2026-05-28 |
| Leave lobby → home | **Not run (manual)** | Code path: `safeLeaveRoom` → `leaveRoom` removes player in lobby |
| Leave game → home | **Not run (manual)** | Code path: `connected: false` + turn advance if current; needs **rules deploy** + live Firebase |
| Spam leave | **Not run (manual)** | `leaveInFlightRef` guards double leave |
| Browser back after leave | **Not run (manual)** | `markLeft` + `hasLeft` → `left_room` / home |
| Refresh after leave | **Not run (manual)** | Same |
| Refresh while seated restores lobby/game | **Not run (manual)** | `bindRoomFromRoute`; create/join use `allowRejoin: true` |
| Invalid `/lobby/bad` fallback | **Partial** | Invalid code → `invalid_code`; unknown code → `room_not_found`; `*` → `NotFoundPage` — **not browser-tested** |
| Expired room fallback | **Code yes / manual no** | Set `expiresAt` in past or `status: 'expired'` → `room_expired` UI |
| 2p create → lobby → start → play | **Not run (manual)** | Requires Firebase env |
| No blank route | **Code yes / manual no** | All `RoomRouteState` kinds map to `StatusPanel` or page; default branch in fallback |
| `room_expired` explicit UI | **Yes (code)** | Dedicated title/message, not merged into room_not_found |
| `not_member` / `left_room` | **Code yes** | Shared panel + `clearSession` |
| `loading_hand` / `hand_error` | **Code yes** | StatusPanel + reload on hand_error |
| RTL smoke (AR) | **Not run** | |
| Private hand not leaked | **Code review pass** | Only `subscribeToPrivateHand` for own uid; public state uses `handCounts` |
| Show Deck = guide only, no order | **Code review pass** | `CardGuideModal` / `cardGuide.ts` static ranks only |

### Route terminal states (no blank page)

| State | UI |
|-------|-----|
| `loading_session` | StatusPanel |
| `firebase_missing` | StatusPanel + home |
| `sign_in_required` | StatusPanel |
| `invalid_code` | StatusPanel |
| `leaving` | StatusPanel |
| `loading_room` | StatusPanel |
| `room_not_found` | StatusPanel |
| **`room_expired`** | **StatusPanel (new)** |
| `left_room` / `not_member` | StatusPanel |
| `redirect_to_game` | StatusPanel |
| `game_not_started` | StatusPanel |
| `waiting_game_state` | StatusPanel + reload |
| `loading_hand` | StatusPanel |
| `hand_error` | StatusPanel + reload |

## Z-index stack (10000+)

| Check | Pass | Notes |
|-------|------|-------|
| Win overlay above modal (10002 > 10000) | **Not verified** | See [Z_INDEX_STACK.md](./Z_INDEX_STACK.md) |
| Card guide modal at 10000 | **Not verified** | |
| No raw `z-50` on game table | **Not verified** | |

## Reference docs

- [ARCHITECTURE_REFERENCES.md](./ARCHITECTURE_REFERENCES.md)
- [CARDS_AND_RULES_REFERENCE.md](./CARDS_AND_RULES_REFERENCE.md)

## Known limitations / follow-up (Slice 2+)

- Board SVG art pass — **not in Slice 1**
- Text chat, rematch, reactions, WebRTC — **not started**
- Automated E2E tests — **not added**
- `expiresAt` only checked client-side for lobby; no Cloud Function to set `status: 'expired'` on server
- Manual QA matrix rows marked **Not run** must be signed in PR after deploy + browser pass before calling Slice 1 complete

## Slice 1 acceptance gate

**Merge-ready for Slice 1 code** when: build green + rules deploy confirmed + manual rows above marked pass.

**Do not start Slice 2** until this gate is met.
