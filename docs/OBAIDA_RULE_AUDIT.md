# Obaida Classic — Rule Risk Audit

> **Source of truth:** [OBAIDA_CLASSIC_RULES.md](./OBAIDA_CLASSIC_RULES.md)  
> **Implementation gaps:** [OBAIDA_RULE_GAP_AUDIT.md](./OBAIDA_RULE_GAP_AUDIT.md)

Audit date: 2026-05-30  
Scope: `legalMoves.ts`, `applyAction.ts`, `board.ts`, `validators.ts`, dealing/turn helpers  
Ruleset: **Obaida Classic** (`obaida_classic_v1`) — do not change without explicit confirmation.

Automated coverage: `src/lib/game/obaidaRuleAudit.test.ts`, `legalMoves.obaida.test.ts`, `applyAction.obaida.test.ts`, `noLegalMove.test.ts`.

---

## Summary

| Area | Risk level | Tests | Notes |
|------|------------|-------|-------|
| Home fill order | **High** (fixed) | Yes | Was allowing skip into home[2] with empty [0],[1] |
| Backward 4 → later home entry | Medium | Partial | Backward 4 from gate lands home[2]; forward entry uses strict next-slot |
| Start/gate blocker | Medium | Yes | Locked gate blocks path; Jack/5 excluded |
| King path eating | Medium | Yes | Path eat + landing; not locked gate |
| Five movement | Low | Yes | No base/home/gate; no home entry |
| Seven split | Medium | Partial | Sum=7 + no color mix; 3-marble splits rare |
| Jack swap | Low | Yes | Any two active track marbles |
| Queen/10 burn | Low | Partial | Next player must have cards |
| No legal / hand sync | Medium | Yes | Empty hand + expected count → no actions |
| Bring-out / capture | Low | Yes | Own gate blocks; eat opponent on bring-out |
| 2p/3p dealing | **Gap→OK** | Yes | `dealing.test.ts` added |
| Team helper | **Gap→OK** | Yes | Finished player teammate moves in `legalMoves.ts` |
| Board coordinates vs rules | Low | N/A | Visual only — no engine coupling |

---

## 1. Backward 4 from start/gate → home approach

**Rule intent:** 4 backward from own start/gate; later forward may enter home on exact count.

**Implementation:**
- `calculateBackward4FromStartGate` — 1 step to home-entry track concept, steps 2–4 → **home index 2** if slots 0–2 empty.
- `calculateForwardTarget` / `calculateHomeEntry` — home entry only on **first vacant** home index (after fix).

**Risks (open):**
- Backward 4 always targets **home[2]**, not “staging” on track only — confirm with table rules.
- Forward from **home entry track** with exact steps — tested for home[0]; overshoot rejected.
- Cannot enter opponent/teammate home — enforced by color on `BoardPosition`.

**Tests:** `obaidaRuleAudit.test.ts` — backward 4 legal; no skip into home; advance home[2]→[3].

---

## 2. Home path fill order

**Rule intent:** Sequential fill; no stacking; no overshoot; finished marbles locked.

**Bug found (fixed):** `calculateForwardTarget` and `calculateHomeMoveForward` allowed jumping to home[2] while [0] and [1] were empty.

**Fix:** `getFirstVacantHomeIndex()` — entry/advance only into that index.

**Risks (open):**
- `calculateBackward4FromStartGate` still places into home[2] in one play (may be correct for Obaida).
- `applySplitSeven` home leg now uses `calculateHomeMoveForward` (aligned with legal gen).
- Finished marble movement — filtered by `!m.isFinished` in legal gen; verify UI never selects finished.

**Tests:** skip empty home slots; fill-order advance; blocked skip in home.

---

## 3. Start/gate blocker

**Rule intent:** Own marble on own start/gate is locked; blocks passing; no eat/swap/pass (King/Jack/5).

**Implementation:** `isLockedOnOwnStartGate`, `isPathBlocked`, `isBackwardPathBlocked`.

**Risks (open):**
- King legal move still generated if path blocked? — gated by `!isPathBlocked` before King action.
- Bring-out on opponent occupying **your** start — eats if not locked on **their** own gate (opponent on your gate is not “own” lock).

**Tests:** path blocked; Jack/5 exclude gate marble.

---

## 4. King 13 path eating

**Rule intent:** Eat all active main-track marbles in path (own/team/opponent); not locked gate; not home.

**Implementation:** `getMarblesInPath` + `applyMove` when `kingPathEatingEnabled`.

**Risks (open):**
- Landing marble eat separate from path — both handled.
- King entering home — must be exact via `calculateForwardTarget`.
- Bring-out with King — does not run path-eat (only `applyMove` with track marble).

**Tests:** path eats victim; not locked gate; apply sends victim to base.

---

## 5. Five card

**Rule intent:** Move any eligible marble 5; not base/home/finished/locked gate; not split; not into home.

**Implementation:** `generateFiveMoveActions` + priority (own → teammate → opponent).

**Risks (open):**
- Priority may hide opponent 5 when own burn-only cards exist — by design.
- Marble that used backward 4 on track — still eligible if on track.

**Tests:** no base/home/gate; no home target on 5.

---

## 6. Seven split

**Rule intent:** Full 7 or split summing to 7; no own+teammate mix; own priority; path blockers + home order via `canMarbleMoveSteps`.

**Risks (open):**
- Only 2-marble and fallback 3-marble combinations — may miss valid 4-marble splits (1+1+1+4 etc.) if rules allow.
- Teammate split only when **no** own splits — tested indirectly.
- Opponent never in split — enforced by marble filter.

**Tests:** sum=7; single-color splits in team game.

---

## 7. Jack swap

**Rule intent:** Swap any two eligible active track marbles.

**Implementation:** All pairs in `generateSwapActions`; swaps count as “own” in priority (always available).

**Risks (open):**
- No requirement that one marble belongs to current player — matches Obaida Classic per audit brief.

**Tests:** black/blue swap pair offered.

---

## 8. Queen / 10 burn

**Rule intent:** Move OR burn next player; burn only if next has cards; random discard; skip turn.

**Risks (open):**
- Random index must be chosen client-side and passed in action — verify persist layer.
- Burn does not reveal hand before discard — UI/Firebase concern, not `legalMoves`.
- Burn + move same turn — separate action types; OK.

**Tests:** no burn when next hand count 0.

---

## 9. Ace / King bring-out

**Tests:** existing + bring-out eats opponent on your start.

**Risks (open):** Ace 11 home exact — covered by same home entry as forward moves.

---

## 10. No legal move / discard all

**Implementation:** `hand.length === 0` && `expectedCount > 0` → `[]` (loading). Else `burn_all_cards`.

**Tests:** hand sync; noLegalMove.explain tests.

**Risks (open):** Race if `handCounts` wrong vs RTDB — integration concern.

---

## 11–14. Team mode, 2p/3p, dealing, captures

**Gaps — add next slice:**
- `dealing.ts` deal block sizes (52 / 26 / 3p pattern).
- 3p unused color home not enterable.
- Finished player still dealt cards + teammate moves.
- 2p opposite colors only.

**Captures:** Landing eat on own/team/opponent track — tested for own; teammate/opponent same code path in `applyMove`.

---

## 15. Board coordinates vs rules

**Confirmed:** `getImagePointForBoardPosition` is visual only; engine uses `BoardPosition` keys.

**Risk:** Wrong calibration misleads QA; does not change legality.

---

## Code fixes in this audit

| File | Change |
|------|--------|
| `board.ts` | `getFirstVacantHomeIndex`; home entry/advance fill-order guard |
| `applyAction.ts` | Split-seven home steps use `calculateHomeMoveForward` |

---

## Recommended next single slice

1. Add **`dealing.test.ts`** — 4p/2p/3p card counts and starting-seat rotation.  
2. Add **3p home guard** test — inactive color cannot enter home.  
3. Clarify **backward-4-from-gate** product rule vs always landing on home[2] (manual QA + optional track-only staging).

---

## Running tests

```bash
npm run test:run
npm run typecheck
npm run build
```
