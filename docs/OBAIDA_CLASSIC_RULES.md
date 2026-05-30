# Jakaroo Online — Obaida Classic Rules (Source of Truth)

These rules are the **source of truth for the MVP** unless Obaida explicitly changes them later.

See also:

- [OBAIDA_RULE_GAP_AUDIT.md](./OBAIDA_RULE_GAP_AUDIT.md) — implementation status vs this document
- [OBAIDA_RULE_AUDIT.md](./OBAIDA_RULE_AUDIT.md) — risky edge cases and test coverage
- [CARDS_AND_RULES_REFERENCE.md](./CARDS_AND_RULES_REFERENCE.md) — developer mapping to code

---

## 1. Game modes

**MVP modes:** 2-player solo, 3-player solo, 4-player teams. No 5+ players. No spectators.

| Mode | Notes |
|------|--------|
| **2p** | Opposite seats/colors; 4 marbles each; unused colors hidden |
| **3p** | Three colors active; one unused; unused home path unused; 5-4-4 dealing |
| **4p teams** | Teammates opposite; turn order by seat; opponents adjacent in turn order |

## 2. Board model

**92 playable spots:** 18 track × 4 + 4 start/gate + 16 home (4 × 4).

Base/nest is **off-track** (visual only, not in the 92). Do not expose global indexes to players.

## 3. Marbles

States: base, start/gate, track, home, finished. Finished marbles are locked forever. Marbles enter **only their own color** home path.

## 4. Suits / jokers

Suits do not matter. **No jokers** in Obaida Classic.

## 5. Card rules

| Rank | Effect |
|------|--------|
| **A** | Bring out **or** move 1 **or** move 11 |
| **K** | Bring out **or** move 13 (path eats; blocked by locked gate; no home eat) |
| **Q** | Move 12 **or** burn next player (not both) |
| **J** | Swap any two eligible active track marbles |
| **10** | Move 10 **or** burn next player |
| **9–2, 6, 8** | Forward move only (7 splits — see below) |
| **7** | Full 7 **or** split 7 (sum = 7; no own+teammate mix in team mode) |
| **5** | Move one eligible marble 5 (own → teammate → opponent priority) |
| **4** | Backward 4; from own gate can approach home entry |

Full detail: sections 5–8 in the product spec (locked in engine: `legalMoves.ts`, `applyAction.ts`, `board.ts`).

## 6. Start / gate

Own marble on own start/gate is **locked**: no eat, bypass, swap, 5-move, or King path eat. Bring-out blocked if own gate occupied.

## 7. Home path

Exact entry only; sequential fill; no stacking; protected from capture.

## 8. Capture

Landing on active main-track marble eats it (own/team/opponent). King 13 eats path. Split 7 can eat on each landing.

## 9. Turn priority

1. Own marbles → 2. Teammate (if no own move) → 3. Opponent (5 only) → 4. Burn all if nothing legal.

Finished team player continues dealing and **helps teammate**.

## 10. Queen / 10 burn

Move **or** burn (not both). Next player only; requires next player has cards; random discard; burner must not see hidden hand.

## 11. No legal move

Show only after hand sync complete. While loading: “Loading legal moves…”. Specific reasons in UI. MVP: discard all cards.

## 12. Dealing

| Mode | Pattern | Cards per cycle |
|------|---------|-----------------|
| 4p | 4-4-5 block (random which round is 5) | 52 |
| 3p | 5-4-4 rotation | 52 (4 deals) |
| 2p | 4-4-5 | 26 |

Starting seat rotates after each block. Hands are private.

## 13. Room / multiplayer

Room code + password; guest play OK; account for saved templates/history; host can kick/bots/reset; 10 min inactivity expiry; disconnect pauses game; majority vote to continue (future UI).

## 14. Custom rules

Obaida Classic fixed. Custom labeled clearly; Joker only in custom.

## 15. UI / design

Premium board-game feel; dark default; EN/AR RTL; gameplay board fully visible; calibrated coordinates (dev-only); polished cards.

## 16. Production

React + Vite + TS + Firebase RTDB + Vercel. Calibration disabled in production. Custom domain: `jakaroo-online.best2host.com`.

## 17. Admin code export

Hidden `/admin` gated by `VITE_ENABLE_CODE_EXPORT=true`. Not for production unless intentional.

## 18. Testing priorities

2-player live QA; rule tests (backward 4 + home, gate, King, 5, 7, J, burn, no-legal, team helper, dealing); visual QA (board, cards, mobile, RTL).

## 19. Future (do not implement yet)

Cosmetics, coins, shop, achievements — after core gameplay is solid.

---

*Canonical engine: `obaida_classic_v1` in `src/lib/game/rulesets.ts`. Last aligned: 2026-05-30.*
