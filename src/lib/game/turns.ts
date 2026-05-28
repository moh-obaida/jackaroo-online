// ============================================================================
// TURNS MODULE — Turn flow management
// ============================================================================

import { GameState, PlayerState } from '../../types/game';

/**
 * Get the next player in turn order.
 * Skips disconnected players (unless they're bots).
 */
export function getNextTurnPlayer(state: GameState): PlayerState | null {
  const activePlayers = state.players.filter((p) => p.connected || p.isBot);
  if (activePlayers.length === 0) return null;

  const currentIndex = activePlayers.findIndex(
    (p) => p.id === state.currentTurnPlayerId
  );
  if (currentIndex === -1) return activePlayers[0];

  const nextIndex = (currentIndex + 1) % activePlayers.length;
  return activePlayers[nextIndex];
}

/**
 * Next turn holder when the current player leaves mid-game.
 * Walks seat order clockwise from the leaver's seat among players still active.
 */
export function getNextTurnPlayerAfterLeave(
  state: GameState,
  leavingPlayerId: string
): PlayerState | null {
  const leaver = state.players.find((p) => p.id === leavingPlayerId);
  if (!leaver) return null;

  const willRemainActive = (p: PlayerState) =>
    p.id !== leavingPlayerId && (p.connected || p.isBot);

  const sortedBySeat = [...state.players].sort((a, b) => a.seat - b.seat);
  const leaverIdx = sortedBySeat.findIndex((p) => p.id === leavingPlayerId);
  if (leaverIdx === -1) return null;

  const n = sortedBySeat.length;
  for (let i = 1; i < n; i++) {
    const candidate = sortedBySeat[(leaverIdx + i) % n];
    if (willRemainActive(candidate)) return candidate;
  }

  return null;
}

/**
 * Get the player whose turn it is based on seat number.
 */
export function getPlayerBySeat(state: GameState, seat: number): PlayerState | undefined {
  return state.players.find((p) => p.seat === seat);
}

/**
 * Get the starting player for a new deal round.
 */
export function getStartingPlayer(state: GameState): PlayerState | undefined {
  return state.players.find((p) => p.seat === state.dealState.startingSeat);
}

/**
 * Check if the current player has cards.
 */
export function currentPlayerHasCards(state: GameState): boolean {
  return (state.handCounts[state.currentTurnPlayerId] || 0) > 0;
}

/**
 * Get the turn order starting from a given seat.
 */
export function getTurnOrder(state: GameState): PlayerState[] {
  const sorted = [...state.players].sort((a, b) => a.seat - b.seat);
  const startIdx = sorted.findIndex((p) => p.seat === state.dealState.startingSeat);
  if (startIdx === -1) return sorted;

  return [...sorted.slice(startIdx), ...sorted.slice(0, startIdx)];
}

/**
 * Check if all players in the current round have empty hands.
 */
export function allPlayersHandsEmpty(state: GameState): boolean {
  return state.players.every((p) => (state.handCounts[p.id] || 0) === 0);
}
