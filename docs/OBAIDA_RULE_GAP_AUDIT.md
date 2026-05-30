# Obaida Classic — Rules vs Implementation Gap Audit

Audit date: 2026-05-30  
Source of truth: [OBAIDA_CLASSIC_RULES.md](./OBAIDA_CLASSIC_RULES.md)

---

## Summary

| Status | Count | Areas |
|--------|------:|-------|
| OK | 12 | Board 92, card effects, gate/home core, burn, suits, private hands, card UI |
| Partial | 6 | 2p seats (fixed), finished helper (fixed), dealing tests (added), no-legal UX (improved), disconnect vote, bots UI |
| Missing / P2 | 4 | Split-7 4-marble combos, backward-4 staging confirm, first-turn vs startingSeat, split-7 board highlights |

---

## Gap table

| § | Rule | Status | Files | Priority |
|---|------|--------|-------|----------|
| 1 | Game modes 2/3/4p | **Partial→OK** | `seats.ts`, `rooms.ts`, `CreateRoomPage.tsx` | P0 fixed: 2p opposite seats 0+2 |
| 2 | Board 92 spots | **OK** | `board.ts`, `types/game.ts` | — |
| 3 | Marble states / home color | **OK** | `board.ts`, `applyAction.ts` | — |
| 4 | No jokers, suits cosmetic | **OK** | `rulesets.ts`, `cards.ts` | — |
| 5 | Card rules A–K | **OK** | `legalMoves.ts`, `applyAction.ts` | — |
| 5b | 7 split 4-marble combos | **Partial** | `legalMoves.ts` `generateSplitCombinations` | P2 |
| 6 | Start/gate lock | **OK** | `board.ts`, tests | — |
| 7 | Home exact + fill order | **Partial** | `board.ts` — backward-4→home[2] staging | P2 confirm |
| 8 | Capture / King path | **OK** | `applyAction.ts`, `obaidaRuleAudit.test.ts` | — |
| 9 | Turn priority | **Partial→OK** | `legalMoves.ts` — finished helper | P0 fixed |
| 10 | Q/10 burn | **OK** | `legalMoves.ts`, `persistAction.ts` | — |
| 11 | No legal / hand sync | **Partial→OK** | `GamePlayContext.tsx`, `PlayActionSheet.tsx`, `explainNoLegalMove.ts` | P1 improved |
| 12 | Dealing cycles | **Partial→OK** | `dealing.ts`, `dealing.test.ts` | P1 tests added |
| 13 | Room / disconnect vote | **Partial** | `RoomSessionContext.tsx` — vote UI missing | P1 |
| 13b | Bots before start | **Partial** | `CreateRoomPage.tsx` `botsEnabled=false` | P1 |
| 14 | Custom rules labeling | **OK** | `LobbyRulesSummary.tsx`, `rulesets.ts` | — |
| 15 | UI / board / cards | **OK** | Recent card PNG + calibration JSON | — |
| 16 | Production flags | **OK** | `vite-env.d.ts`, Vercel env | Verify calibration off |
| 17 | Admin export | **OK** | `AdminPage.tsx` | — |
| 18 | Test coverage | **Partial→OK** | `dealing.test.ts`, `legalMoves.obaida.test.ts` | Ongoing |
| 19 | Future cosmetics | **N/A** | Not implemented | By design |

---

## Fixes in this pass

| Change | File(s) |
|--------|---------|
| 2p join uses opposite seats 0 & 2 (black/blue) | `seats.ts`, `rooms.ts` |
| Finished team player moves teammate marbles | `legalMoves.ts` |
| Dealing tests 2p/3p/4p | `dealing.test.ts` |
| No-legal: loading hint, noExactHome reason, full reason text | `PlayActionSheet.tsx`, `explainNoLegalMove.ts`, `index.css` |
| 3p inactive color test | `legalMoves.obaida.test.ts` |

---

## Recommended next slice

1. **Disconnect majority vote UI** — wire `translations.ts` strings to pause/resume flow.
2. **Enable bot toggle in create room** when `botSettings` supported.
3. **Split-7 board highlights** — `boardHighlights.ts` for split actions.
4. **Tie first deal turn to `startingSeat`** in `GamePlayContext.startGame`.
5. **Manual QA** backward-4 staging vs always landing home[2].

---

## Run tests

```bash
npm run test:run
npm run typecheck
npm run build
```
