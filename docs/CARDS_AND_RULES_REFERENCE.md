# Cards & rules reference (Obaida Classic)

This doc ties together:

- [`jakaroo_online_manus_prompt.txt`](../jakaroo_online_manus_prompt.txt) (source of truth for rules)
- [`ARCHITECTURE_REFERENCES.md`](./ARCHITECTURE_REFERENCES.md) (Manus + **Knowledge Connect** patterns + z-index stack)
- Physical Jackaroo deck photos (red back **جاكارو / JACKAROO**, white face with **large rank number** + Arabic action text)
- Code in this repo (engine vs UI)

**Knowledge Connect** (external project `knowledge-connect-original-main`, not vendored in this repo): use for room sync / session / overlay discipline only — not KC quiz UI.

## Golden rules for developers

| Layer | Location | Must NOT |
|-------|----------|----------|
| **Game rules** | `src/lib/game/legalMoves.ts`, `applyAction.ts`, `validators.ts`, `rulesets.ts` | Put rule logic in React components |
| **Card display only** | `src/lib/game/cardGuide.ts`, `PlayingCard.tsx`, `CardGuideModal.tsx` | Change what a card *does* in UI |
| **Deck order** | `src/lib/game/dealing.ts` (shuffle once per block) | Show shuffled order in Show Deck / guide |
| **Private hands** | Firebase `privateHands/{room}/{playerId}` | Expose other players’ cards |

**Show Deck** = static rank reference (`CardGuideModal`). It never lists the live shuffled deck.

## Physical deck → digital card

Reference photos show:

1. **Card back** — solid red, **جاكارو** + **JACKAROO**, board emblem. No rank on back.
2. **Card face** — white, **large center value** (King = **13**, corner **K**), **Arabic instruction lines** for what the card does. Suits are decorative only (Obaida Classic: hearts = diamonds for rules).

Digital mapping:

| Physical | Digital (`cardGuide.ts`) | On-screen |
|----------|---------------------------|-----------|
| Big center number | `getCardCenterValue(rank)` — K→13, Q→12, etc. | Center of `PlayingCard` |
| Corner rank | `card.rank` | Top/bottom corners |
| Arabic action text | `deckGuide.{rank}.*` i18n keys | Face subtitle + full guide modal |
| Red back | `CardBack` component | Opponents’ hands, deck pile |

## Obaida Classic card effects (locked)

From Manus §8 — implemented in `legalMoves.ts`, summarized for UI copy:

| Rank | Legal actions (OR where noted) |
|------|--------------------------------|
| **A** | Bring out **or** move 1 **or** move 11 |
| **K** | Bring out **or** move 13 (path eats on track; blocked by locked start/gate) |
| **Q** | Move 12 **or** burn next player (not both) |
| **J** | Swap two eligible active marbles (not base/home/finished/locked gate) |
| **10** | Move 10 **or** burn next player |
| **9** | Move 9 |
| **8** | Move 8 |
| **7** | Move 7 **or** split 7 (full value, no waste; no own+teammate in same split) |
| **6** | Move 6 |
| **5** | Move **one** marble 5 (own → teammate → opponent priority) |
| **4** | Move backward 4 (from start/gate can aim toward home) |
| **3** | Move 3 |
| **2** | Move 2 |

**No jokers** in Obaida Classic. **52 cards**, suits cosmetic.

## How to add or change card UI text

1. Edit **English/Arabic strings** in `src/lib/i18n/translations.ts`:
   - `game.card.hint.{rank}` — one line under card in hand
   - `deckGuide.{rank}.title`, `deckGuide.{rank}.0`, … — full guide in Show Deck
2. If rank display changes (e.g. King shows 13), update `getCardCenterValue()` in `cardGuide.ts` only.
3. Do **not** duplicate rules in components — if hint disagrees with engine, fix engine or hint, not both differently.

## How to change what a card *does*

1. Change `legalMoves.ts` / `applyAction.ts` / `validators.ts`.
2. Update `deckGuide.*` and `game.card.hint.*` strings to match.
3. Run QA checklist in Manus §18 (Ace, King path, Queen burn, Jack swap, 5 priority, split 7, etc.).

## Priority when playing (team mode)

From Manus §9 — engine enforces; UI should not offer opponent-marble 5 moves when own moves exist:

1. Legal moves on **own** marbles first  
2. If none, **teammate** marbles (or burn where card allows)  
3. **Opponent** only for cards that allow it (mainly 5)  
4. If nothing legal → **burn all cards**

## Depth stack (10000+)

Overlays (modals, win screen, toasts) use **z-index 10000+**. Table/hand use 0–5000. Ambient page depth uses **negative** layers (`-10000`, `-1000`). See [Z_INDEX_STACK.md](./Z_INDEX_STACK.md) and [ARCHITECTURE_REFERENCES.md](./ARCHITECTURE_REFERENCES.md) (Knowledge Connect session patterns, not KC visuals).

## Files checklist

```text
src/lib/game/legalMoves.ts    ← what you CAN do
src/lib/game/applyAction.ts   ← what happens when you do it
src/lib/game/cardGuide.ts     ← labels & center values only
src/components/cards/PlayingCard.tsx
src/components/cards/CardGuideModal.tsx
src/components/cards/PlayerHand.tsx
```
