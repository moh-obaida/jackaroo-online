// ============================================================================
// CARDS MODULE — Deck creation, shuffling, dealing
// All randomness is generated ONCE and saved to Firebase.
// No client-side independent randomization.
// ============================================================================

import { Card, CardRank, CardSuit, GameMode } from '../../types/game';

const RANKS: CardRank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

/**
 * Create a standard 52-card deck (no jokers for Obaida Classic).
 * Each card has a unique id based on rank + suit.
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}_${suit}`,
        rank,
        suit,
      });
    }
  }
  return deck;
}

/**
 * Fisher-Yates shuffle. Returns a new shuffled array.
 * This must be called ONCE by the authoritative writer and saved to Firebase.
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deal cards from the top of the deck.
 * Returns { dealt, remaining } so the caller can save both to Firebase.
 */
export function dealFromDeck(
  deck: Card[],
  count: number
): { dealt: Card[]; remaining: Card[] } {
  const dealt = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { dealt, remaining };
}

// ============================================================================
// DEAL PATTERN GENERATION
// All patterns are generated once and saved to Firebase room state.
// ============================================================================

/**
 * 4-player deal block: 3 rounds, one random round gives 5 cards.
 * Returns array of 3 numbers: cards per player for each round.
 * Example: [4, 5, 4] means round 1 = 4 each, round 2 = 5 each, round 3 = 4 each.
 * Total: 4×4 + 5×4 + 4×4 = 16 + 20 + 16 = 52
 */
export function generate4PlayerDealPattern(): number[] {
  const fiveCardRound = Math.floor(Math.random() * 3); // 0, 1, or 2
  return [0, 1, 2].map((i) => (i === fiveCardRound ? 5 : 4));
}

/**
 * 3-player deal: 4 deals per full deck cycle.
 * Each deal uses 13 cards total among 3 players.
 * Patterns: 5-4-4, 4-5-4, 4-4-5 (who gets 5 rotates).
 * Returns array of 4 patterns, each pattern is an array of 3 numbers.
 */
export function generate3PlayerDealPatterns(): number[][] {
  // Deterministic rotation per deal block to keep distribution fair:
  // round 1: 5-4-4, round 2: 4-5-4, round 3: 4-4-5, round 4: 5-4-4
  return [
    [5, 4, 4],
    [4, 5, 4],
    [4, 4, 5],
    [5, 4, 4],
  ];
}

/**
 * 2-player deal: 4-card, 4-card, 5-card rounds.
 * Uses 26 cards per cycle (8 + 8 + 10).
 * Returns [4, 4, 5] always for Obaida Classic 2-player.
 */
export function generate2PlayerDealPattern(): number[] {
  return [4, 4, 5];
}

/**
 * Get the deal pattern for the current mode.
 * This is called ONCE when starting a new deal block and saved to Firebase.
 */
export function generateDealPattern(mode: GameMode): number[] | number[][] {
  switch (mode) {
    case '4p_teams':
      return generate4PlayerDealPattern();
    case '3p_solo':
      return generate3PlayerDealPatterns();
    case '2p_solo':
      return generate2PlayerDealPattern();
  }
}

/**
 * Get the number of cards to deal to each player for the current round.
 */
export function getCardsPerPlayerForRound(
  mode: GameMode,
  dealPattern: number[] | number[][],
  roundIndex: number,
  playerSeatIndex?: number
): number {
  switch (mode) {
    case '4p_teams':
      return (dealPattern as number[])[roundIndex] || 4;
    case '3p_solo':
      // Each round has a pattern like [5, 4, 4]
      return (dealPattern as number[][])[roundIndex]?.[playerSeatIndex ?? 0] ?? 4;
    case '2p_solo':
      return (dealPattern as number[])[roundIndex] || 4;
  }
}

/**
 * Pick a random card from a hand (for Queen/10 burn).
 * Returns the index of the card to burn.
 * This must be called ONCE and saved to Firebase.
 */
export function pickRandomCardIndex(handSize: number): number {
  return Math.floor(Math.random() * handSize);
}

/**
 * Get the numeric value of a card for movement purposes.
 */
export function getCardMoveValue(rank: CardRank): number[] {
  switch (rank) {
    case 'A': return [1, 11]; // Can move 1 or 11 (or bring out)
    case '2': return [2];
    case '3': return [3];
    case '4': return [-4]; // Backward 4
    case '5': return [5];
    case '6': return [6];
    case '7': return [7]; // Can be split
    case '8': return [8];
    case '9': return [9];
    case '10': return [10]; // Or burn
    case 'J': return [0]; // Swap only
    case 'Q': return [12]; // Or burn
    case 'K': return [13]; // Or bring out
  }
}

/**
 * Check if a card can bring a marble out from base.
 */
export function canBringOut(rank: CardRank): boolean {
  return rank === 'A' || rank === 'K';
}

/**
 * Check if a card allows burning the next player.
 */
export function canBurn(rank: CardRank): boolean {
  return rank === 'Q' || rank === '10';
}

/**
 * Check if a card is a Jack (swap).
 */
export function isJack(rank: CardRank): boolean {
  return rank === 'J';
}

/**
 * Check if a card is a 7 (splittable).
 */
export function isSeven(rank: CardRank): boolean {
  return rank === '7';
}

/**
 * Check if a card is a 4 (backward).
 */
export function isFour(rank: CardRank): boolean {
  return rank === '4';
}

/**
 * Check if a card is a 5 (move anyone eligible).
 */
export function isFive(rank: CardRank): boolean {
  return rank === '5';
}

/**
 * Check if a card is a King (path eating).
 */
export function isKing(rank: CardRank): boolean {
  return rank === 'K';
}
