// ============================================================================
// VALIDATORS MODULE — Validate submitted actions before applying
// Every action is revalidated server-side (or by authoritative client).
// ============================================================================

import {
  GameState,
  GameAction,
  LegalAction,
  Card,
} from '../../types/game';
import { generateLegalActions } from './legalMoves';

/**
 * Validate a submitted action against the current game state.
 * Returns true if the action is legal, false otherwise.
 */
export function validateAction(
  state: GameState,
  action: GameAction,
  currentPlayerHand: Card[]
): { valid: boolean; error?: string } {
  // Check it's the correct player's turn
  if (action.playerId !== state.currentTurnPlayerId) {
    return { valid: false, error: 'Not your turn' };
  }

  // Check game is not finished
  if (state.winner) {
    return { valid: false, error: 'Game is already finished' };
  }

  if (action.type !== 'burn_all_cards' && action.type !== 'skip_no_cards' && action.cardId) {
    if (!currentPlayerHand.some((c) => c.id === action.cardId)) {
      return { valid: false, error: 'Card not in hand' };
    }
  }

  // Generate legal actions and check if submitted action matches one
  const legalActions = generateLegalActions(state, currentPlayerHand);

  // Special cases
  if (action.type === 'skip_no_cards') {
    const hasSkip = legalActions.some((a) => a.type === 'skip_no_cards');
    return hasSkip ? { valid: true } : { valid: false, error: 'You have cards to play' };
  }

  if (action.type === 'burn_all_cards') {
    const hasBurnAll = legalActions.some((a) => a.type === 'burn_all_cards');
    return hasBurnAll ? { valid: true } : { valid: false, error: 'You have legal moves available' };
  }

  // Check if the action matches any legal action
  const matchingLegal = findMatchingLegalAction(action, legalActions);
  if (!matchingLegal) {
    return { valid: false, error: 'Invalid move' };
  }

  return { valid: true };
}

/**
 * Find a matching legal action for the submitted action.
 */
function findMatchingLegalAction(
  action: GameAction,
  legalActions: LegalAction[]
): LegalAction | undefined {
  return legalActions.find((legal) => {
    if (legal.type !== action.type) return false;
    if (legal.cardId !== action.cardId) return false;

    switch (action.type) {
      case 'bring_out':
        return legal.marbleId === action.marbleId;
      case 'move':
      case 'move_backward':
        return (
          legal.marbleId === action.marbleId &&
          legal.targetPosition &&
          action.targetPosition &&
          legal.targetPosition.color === action.targetPosition.color &&
          legal.targetPosition.type === action.targetPosition.type &&
          legal.targetPosition.index === action.targetPosition.index
        );
      case 'swap':
        return (
          (legal.swapMarbleId1 === action.swapMarbleId1 &&
            legal.swapMarbleId2 === action.swapMarbleId2) ||
          (legal.swapMarbleId1 === action.swapMarbleId2 &&
            legal.swapMarbleId2 === action.swapMarbleId1)
        );
      case 'split_seven':
        // Validate split moves match
        if (!legal.splitMoves || !action.splitMoves) return false;
        if (legal.splitMoves.length !== action.splitMoves.length) return false;
        return legal.splitMoves.every((lm, i) => {
          const am = action.splitMoves![i];
          return lm.marbleId === am.marbleId && lm.steps === am.steps;
        });
      case 'burn_next_player':
        return legal.burnTargetPlayerId === action.burnTargetPlayerId;
      default:
        return true;
    }
  });
}

/**
 * Validate that a card belongs to the player's hand.
 */
export function validateCardOwnership(
  privateHands: Record<string, {id: string}[]>,
  playerId: string,
  cardId: string
): boolean {
  const hand = privateHands[playerId];
  if (!hand) return false;
  return hand.some((c) => c.id === cardId);
}
