# Architecture references (Manus + Knowledge Connect + this repo)

## Source files you provided

| Reference | Path | Role |
|-----------|------|------|
| **Manus spec** | [`../jakaroo_online_manus_prompt.txt`](../jakaroo_online_manus_prompt.txt) | Product, rules §8, board §6, UI §16, Firebase §14 |
| **Physical deck/board** | Photos (red جاكارو back, white face K=13, wooden octagonal board) | Visual target for `PlayingCard`, `GameBoard` |
| **Knowledge Connect** | knowledge-connect-original-main (external/local reference — not in this repo) | **Session/sync patterns only** — not game rules or visuals |
| **This repo** | `docs/CARDS_AND_RULES_REFERENCE.md` | Engine vs UI boundary |

## Manus → Jakaroo mapping

| Manus requirement | Implementation |
|-------------------|----------------|
| Rule engine centralized | `src/lib/game/*` — never rules in React |
| Obaida Classic locked | `rulesets.ts`, `legalMoves.ts`, `obaida_classic_v1` |
| Private hands | Firebase `privateHands`; UI never lists live deck order |
| Show Deck = static guide | `CardGuideModal` + `cardGuide.ts` only |
| Game room: board center, hand below | `FullScreenGameTable`, `HandDock`, `PlayActionSheet` |
| Legal highlights on card select | `boardHighlights.ts` + `GameBoard` gold rings |
| Lobby rules before ready | `LobbyRulesSummary` (Manus §13) |
| Room Maker (not “host”) | Lobby copy + `roomMakerUid` |
| Arabic RTL | `AppContext` + `translations.ts` |
| Numeric room code + password | `createRoom` / `joinRoom` |

## Knowledge Connect patterns we **adopted**

| KC pattern | KC location | Jakaroo |
|------------|-------------|---------|
| Single room subscription | `subscribeToRoom` in `roomOps.ts` | `RoomSessionContext` — one sub per app |
| Stale / leave guards | `roomStateMerge.ts`, host reconcile | `sessionEpoch`, `acceptSessionUpdate`, `hasLeft` |
| Live connection indicator | Host/participant UX | `ConnectionBar` in `SiteHeader` |
| Overlay depth discipline | High z-index for modals/toasts | [Z_INDEX_STACK.md](./Z_INDEX_STACK.md) — **10000+** |
| Firebase via lib, not pages | `roomOps.ts`, `firebase.ts` | `lib/firebase/rooms.ts`, `safeLeaveRoom` |

## Knowledge Connect we **do not** port

- Hex board, quiz flow, team leader panels, Excel import
- KC CSS theme (`kc-card`, classroom Arabic chrome)
- Copying KC card/board visuals into Jackaroo

## Session / leave (rescue architecture)

```text
safeLeaveRoom → isLeaving + epoch++ → markLeft → clear session → navigate /
              → removePlayerFromRoom (background)
```

Route UI: `resolveRoomRouteState` + `RoomRouteFallback` / `StatusPanel` — no duplicate `subscribeToRoom` on pages.

## Uno / Ludo UX patterns (game feel)

| Pattern | Reference | Jakaroo |
|---------|-----------|---------|
| Fanned hand at bottom | Uno | Overlapping `PlayerHand`, strong selected glow |
| Step prompt (“pick card → choose action”) | Uno / Ludo turns | `PlayStepBar` + `playStep.ts` |
| Big primary action button | Uno | Large gold `play-action-btn` |
| Opponents show card backs only | Uno | `TableSeat` + `CardBack` stack |
| Board in center, seats on rim | Ludo | `TablePlayArea` felt + corner seats |
| One-line activity, expand for more | Casual mobile | `TableActivity` (not sidebar log) |
| Full-screen table, not web panels | Both | `game-hand-rail`, no `card-container` on table |

## Play UX (simple surface, rich engine)

| Player sees | Code owns complexity |
|-------------|-------------------|
| Tap card → gold board spots → one primary action | `presentActions.ts`, `legalMoves.ts` |
| Auto-suggested card on your turn | `usePlayTurn.ts` |
| “Show Deck” opens rank guide, not live pile | `CardGuideModal` |

See [RESCUE_QA.md](./RESCUE_QA.md) before claiming production-ready leave or full QA pass.
