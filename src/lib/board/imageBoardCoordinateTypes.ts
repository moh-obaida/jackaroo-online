import type { PlayerColor } from '../../types/game';

/** Normalized board coordinates — 0–100 percentage of the square board stage. */
export type BoardImagePoint = {
  x: number;
  y: number;
};

export type ExactImagePoints = {
  track: Record<PlayerColor, BoardImagePoint[]>;
  gates: Record<PlayerColor, BoardImagePoint | null>;
  home: Record<PlayerColor, BoardImagePoint[]>;
  base: Record<PlayerColor, BoardImagePoint[]>;
};
