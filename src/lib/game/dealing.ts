// ============================================================================
// DEALING MODULE — Handle card dealing for all modes
// All randomness generated ONCE and saved to Firebase.
// ============================================================================

import {
  Card,
  GameMode,
  GameState,
  PlayerState,
  DealState,
} from '../../types/game';
import {
  createDeck,
  shuffleDeck,
  dealFromDeck,
  generate4PlayerDealPattern,
  generate3PlayerDealPatterns,
  generate2PlayerDealPattern,
} from './cards';

// ============================================================================
// DEAL BLOCK INITIALIZATION
// Called once per deal block, generates shuffled deck and deal pattern.
// Result is saved to Firebase.
// ============================================================================

export interface DealBlockConfig {
  deck: Card[];
  dealPattern: number[] | number[][];
  startingSeat: number;
}

/**
 * Initialize a new deal block.
 * Creates shuffled deck and determines deal pattern.
 * This is called ONCE by the room maker's client and saved to Firebase.
 */
export function initializeDealBlock(
  mode: GameMode,
  startingSeat: number
): DealBlockConfig {
  const deck = shuffleDeck(createDeck());

  let dealPattern: number[] | number[][];
  switch (mode) {
    case '4p_teams':
      dealPattern = generate4PlayerDealPattern();
      break;
    case '3p_solo':
      dealPattern = generate3PlayerDealPatterns();
      break;
    case '2p_solo':
      dealPattern = generate2PlayerDealPattern();
      break;
  }

  return { deck, dealPattern, startingSeat };
}

/**
 * Deal cards for a specific round within the deal block.
 * Returns updated hands and remaining deck.
 * This is called ONCE and saved to Firebase.
 */
export function dealRound(
  deck: Card[],
  players: PlayerState[],
  mode: GameMode,
  dealPattern: number[] | number[][],
  roundIndex: number
): { hands: Record<string, Card[]>; remainingDeck: Card[] } {
  const hands: Record<string, Card[]> = {};
  let remaining = [...deck];

  switch (mode) {
    case '4p_teams': {
      const cardsPerPlayer = (dealPattern as number[])[roundIndex];
      for (const player of players) {
        const { dealt, remaining: rest } = dealFromDeck(remaining, cardsPerPlayer);
        hands[player.id] = dealt;
        remaining = rest;
      }
      break;
    }
    case '3p_solo': {
      const roundPattern = (dealPattern as number[][])[roundIndex];
      for (let i = 0; i < players.length; i++) {
        const cardsForPlayer = roundPattern[i];
        const { dealt, remaining: rest } = dealFromDeck(remaining, cardsForPlayer);
        hands[players[i].id] = dealt;
        remaining = rest;
      }
      break;
    }
    case '2p_solo': {
      const cardsPerPlayer = (dealPattern as number[])[roundIndex];
      for (const player of players) {
        const { dealt, remaining: rest } = dealFromDeck(remaining, cardsPerPlayer);
        hands[player.id] = dealt;
        remaining = rest;
      }
      break;
    }
  }

  return { hands, remainingDeck: remaining };
}

/**
 * Check if the current deal block is exhausted and a new one is needed.
 */
export function isDealBlockExhausted(
  mode: GameMode,
  dealRoundInBlock: number
): boolean {
  switch (mode) {
    case '4p_teams':
      return dealRoundInBlock >= 3; // 3 rounds per block
    case '3p_solo':
      return dealRoundInBlock >= 4; // 4 rounds per block
    case '2p_solo':
      return dealRoundInBlock >= 3; // 3 rounds per cycle
  }
}

/**
 * Get the next starting seat after a deal block ends.
 */
export function getNextStartingSeat(
  currentStartingSeat: number,
  playerCount: number
): number {
  return (currentStartingSeat + 1) % playerCount;
}

/**
 * Check if all players have empty hands (time to deal next round).
 */
export function allHandsEmpty(hands: Record<string, Card[]>): boolean {
  return Object.values(hands).every((hand) => hand.length === 0);
}

/**
 * Create the initial deal state for a new game.
 */
export function createInitialDealState(startingSeat: number): DealState {
  const dealPattern = generate4PlayerDealPattern();
  return {
    dealBlock: 0,
    dealRoundInBlock: 0,
    startingSeat,
    cardsPerPlayer: 4,
    dealPattern,
  };
}
