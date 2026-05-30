import { COLORS_ORDER, GameMode, PlayerColor } from '../../types/game';

/** Board seat indices used per mode (2-player uses opposite seats 0 and 2). */
export function getSeatSlotsForMode(mode: GameMode): number[] {
  switch (mode) {
    case '2p_solo':
      return [0, 2];
    case '3p_solo':
      return [0, 1, 2];
    case '4p_teams':
      return [0, 1, 2, 3];
  }
}

/** Next available seat for a joining player, or null when full. */
export function getNextJoinSeat(mode: GameMode, usedSeats: number[]): number | null {
  for (const seat of getSeatSlotsForMode(mode)) {
    if (!usedSeats.includes(seat)) return seat;
  }
  return null;
}

export function colorForSeat(seat: number): PlayerColor {
  return COLORS_ORDER[seat] ?? COLORS_ORDER[0];
}

/** Colors with no assigned player (e.g. white in 3-player). */
export function getInactiveColors(activeColors: PlayerColor[]): PlayerColor[] {
  return COLORS_ORDER.filter((c) => !activeColors.includes(c));
}

export function isColorActive(activeColors: PlayerColor[], color: PlayerColor): boolean {
  return activeColors.includes(color);
}
