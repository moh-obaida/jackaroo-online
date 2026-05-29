import { Card, GameAction, GameState } from '../../types/game';

/** Stable i18n key — translate at display time via t(STALE_MOVE_ERROR). */
export const STALE_MOVE_ERROR = 'game.moveRejectedStale';

export type MovePreconditionInput = {
  authoritativeState: GameState;
  clientState: GameState;
  action: GameAction;
  hand: Card[];
};

export type MovePreconditionResult =
  | { ok: true }
  | { ok: false; error: string; stale: boolean };

/**
 * Pure compare-and-set guards before applying a move.
 * Uses authoritative RTDB snapshot vs the client's last-known state.
 */
export function validateMovePreconditions(
  input: MovePreconditionInput
): MovePreconditionResult {
  const { authoritativeState, clientState, action, hand } = input;

  if (authoritativeState.winner) {
    return { ok: false, error: 'Game is already finished', stale: false };
  }

  if (authoritativeState.currentTurnPlayerId !== action.playerId) {
    return { ok: false, error: 'Not your turn', stale: true };
  }

  if (authoritativeState.turnNumber !== clientState.turnNumber) {
    return { ok: false, error: STALE_MOVE_ERROR, stale: true };
  }

  if (authoritativeState.currentTurnPlayerId !== clientState.currentTurnPlayerId) {
    return { ok: false, error: STALE_MOVE_ERROR, stale: true };
  }

  if (
    action.type !== 'burn_all_cards' &&
    action.type !== 'skip_no_cards' &&
    action.cardId
  ) {
    if (!hand.some((c) => c.id === action.cardId)) {
      return { ok: false, error: 'Card not in hand', stale: true };
    }
  }

  return { ok: true };
}

/**
 * RTDB transaction commit guard — re-checks turn ownership inside the transaction.
 * Private hands live on a separate node and cannot be updated atomically with gameState.
 */
export function canCommitMoveTransaction(
  currentState: GameState | null,
  expectedTurnNumber: number,
  expectedCurrentPlayerId: string,
  newState: GameState
): boolean {
  if (!currentState) return false;
  if (currentState.winner) return false;
  if (currentState.turnNumber !== expectedTurnNumber) return false;
  if (currentState.currentTurnPlayerId !== expectedCurrentPlayerId) return false;
  if (newState.turnNumber !== expectedTurnNumber + 1) return false;
  return true;
}

/** In-flight submit guard used by GamePlayContext.submitAction. */
export function rejectIfSubmitInFlight(
  lock: { current: boolean }
): { ok: false; error: string } | null {
  if (lock.current) {
    return { ok: false, error: STALE_MOVE_ERROR };
  }
  return null;
}

export function acquireSubmitLock(lock: { current: boolean }): boolean {
  if (lock.current) return false;
  lock.current = true;
  return true;
}

export function releaseSubmitLock(lock: { current: boolean }): void {
  lock.current = false;
}
