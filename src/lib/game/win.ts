// ============================================================================
// WIN MODULE — Win condition checking
// ============================================================================

import { GameState, WinResult, PlayerColor } from '../../types/game';

/**
 * Check if a team has won (all 8 marbles finished).
 */
export function checkTeamWin(state: GameState): WinResult | null {
  if (state.mode !== '4p_teams') return null;

  for (const team of ['A', 'B'] as const) {
    const teamPlayers = state.players.filter((p) => p.team === team);
    const teamColors = teamPlayers.map((p) => p.color);
    const teamMarbles = state.marbles.filter((m) => teamColors.includes(m.color));

    if (teamMarbles.length === 8 && teamMarbles.every((m) => m.isFinished)) {
      return {
        winnerTeam: team,
        winnerPlayerIds: teamPlayers.map((p) => p.id),
      };
    }
  }

  return null;
}

/**
 * Check if a solo player has won (all 4 marbles finished).
 */
export function checkSoloWin(state: GameState): WinResult | null {
  if (state.mode === '4p_teams') return null;

  for (const player of state.players) {
    const playerMarbles = state.marbles.filter((m) => m.color === player.color);
    if (playerMarbles.length === 4 && playerMarbles.every((m) => m.isFinished)) {
      return {
        winnerPlayerId: player.id,
        winnerPlayerIds: [player.id],
      };
    }
  }

  return null;
}

/**
 * Check win condition for any mode.
 */
export function checkWin(state: GameState): WinResult | null {
  if (state.mode === '4p_teams') {
    return checkTeamWin(state);
  }
  return checkSoloWin(state);
}

/**
 * Check if a specific player has finished all their marbles.
 * In team mode, this means they start helping their teammate.
 */
export function isPlayerFinished(state: GameState, playerId: string): boolean {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return false;

  const playerMarbles = state.marbles.filter((m) => m.color === player.color);
  return playerMarbles.every((m) => m.isFinished);
}

/**
 * Check if a color has all marbles finished.
 */
export function isColorFinished(state: GameState, color: PlayerColor): boolean {
  const colorMarbles = state.marbles.filter((m) => m.color === color);
  return colorMarbles.every((m) => m.isFinished);
}
