# Jakaroo Rescue — QA & PR Notes

## Architecture (Phases 1–7)

- Single `subscribeToRoom` in `RoomSessionContext`
- `GamePlayContext` owns game/hand subs, hand timeout, bots
- Route state machine: `resolveRoomRouteState` + `RoomRouteFallback`
- `safeLeaveRoom`: leaving → epoch bump → `markLeft` → clear session → navigate home → Firebase background
- `sessionEpoch` guards room, gameState, privateHand, bot timer, hand timeout callbacks
- No `localRoom` on Lobby/Game pages
- `BackHomeButton`: `navigate` (home only) vs `clearSession` (no Firebase leave)

## Firebase rules — deploy required

Repo [`firebase.database.rules.json`](../firebase.database.rules.json) allows player self-delete via `(data.exists() && !newData.exists())` on `players/$playerId`.

**Leave is not fully fixed in production until these rules are deployed to the Firebase project.**

Do not claim “leave fixed” in PR without deploy confirmation.

## Phase 7 manual QA checklist

| Test | Pass |
|------|------|
| `npm run build` | |
| Leave lobby → home | |
| Leave game → home | |
| Browser back after leave | |
| Refresh after leave | |
| Invalid `/lobby/bad` fallback | |
| 2p create → lobby → start → play | |
| No blank route | |
| RTL smoke (AR) | |
| Private hand not leaked | |
| Show Deck = guide only, no order | |

## Known limitations / follow-up PR

- Board SVG still topology-based; further art pass possible
- Custom rules UI unchanged
- Automated E2E tests not added
