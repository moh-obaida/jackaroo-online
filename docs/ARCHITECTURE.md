# Jakaroo Online — Architecture Notes

## Private hands & deck safety (Phase 2 audit)

### Data paths

| Path | Contents | RTDB read rule | Client access |
|------|----------|----------------|---------------|
| `rooms/{code}/gameState` | Public board state, **deck order**, discard pile, hand **counts** | `.read: true` | `subscribeToGameState` → all seated clients |
| `privateHands/{code}/{playerId}/cards` | That player's cards only | `auth.uid === $playerId` | `subscribeToPrivateHand` → own hand only |
| `rooms/{code}/players` | Seat, name, ready, color | `.read: true` | Lobby + game UI |

### Client behavior

- **My hand:** `GamePlayContext` subscribes via `subscribeToPrivateHand(roomCode, playerId, …)` only when `room.status === 'playing'`. Opponents never receive card payloads.
- **Opponent hands:** UI shows card backs / `handCounts[playerId]` only (`OpponentSeats`, `DeckDiscardPiles`).
- **Show Deck:** `CardGuideModal` + `deckGuide.notice` — static rank rules from `cardGuide.ts` / `cardFaceContent.ts`. Does **not** read `gameState.deck`, shuffled order, or `privateHands`.
- **Normalize:** `normalizeGameState` / `normalizeCards` coerce RTDB object-keys to arrays; no hand data is merged into public state.

### Known exposure (documented, not changed in rescue)

- **`gameState.deck`** is world-readable per current rules. A motivated client could read remaining deck order from RTDB. Mitigation for a future slice: store deck count only publicly, or restrict `deck` writes/reads to turn player + host bot driver.
- **Discard pile top** is public (intentional — visible on table).

### Firebase rules (`firebase.database.rules.json`)

- `privateHands/$roomCode/$playerId`: read own uid only; write own uid, room maker (deal/start), or current turn player (bot/deal updates).
- `gameState` field-level writes limited to room maker or `currentTurnPlayerId` during play.
- Deploy rules to production before QA: `firebase deploy --only database --project jackaroo-online-f6b7f`

### Start game flow

1. Room maker calls `startGame` → `saveGameState`, `savePrivateHandWithRetry` per player (3 attempts, 150ms delay), `updateRoomStatus('playing')`.
2. All clients: room subscription flips status → `GamePlayContext` attaches gameState + privateHand listeners.
3. `resolveRoomRouteState` gates game page: `waiting_game_state` → `loading_hand` → `ready_play`.

### Move commit + private hand recovery

1. `persistGameAction` validates against fresh RTDB state, applies move locally, then `saveGameStateIfMatch` (RTDB transaction).
2. On transaction success, each affected private hand is written via `savePrivateHandWithRetry` (3 attempts, 150ms delay between failures).
3. If a hand write fails after the public commit, the move **is saved on the board** but the client shows `game.handSyncFailed` — user should reload. Dev console logs `[Jakaroo] savePrivateHand failed` and `Public gameState committed but private hand sync failed`.
4. Stale move rejection returns stable key `game.moveRejectedStale` (translate at display time); internal constant `STALE_MOVE_ERROR`.

### Two-player same browser

Firebase Auth is shared across tabs in one browser profile. Player 2 must use **incognito/private** or another browser. `JoinRoomPage` no longer calls `logOut()` (that would sign out the host tab).
