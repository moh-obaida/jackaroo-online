// Normalize Firebase RTDB payloads (arrays often deserialize as keyed objects).

import { Card, GameState, GameEvent, Marble, PlayerState, CustomRulesConfig } from '../../types/game';

export function normalizePlayers(players: unknown): PlayerState[] {
  if (!players) return [];
  if (Array.isArray(players)) return players;
  if (typeof players === 'object') {
    return Object.values(players as Record<string, PlayerState>).sort(
      (a, b) => (a.seat ?? 0) - (b.seat ?? 0)
    );
  }
  return [];
}

function normalizeList<T>(value: unknown): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return Object.values(value as Record<string, T>);
  return [];
}

function normalizeNumberArray(value: unknown): number[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as number[];
  if (typeof value === 'object') {
    return Object.values(value as Record<string, number>).sort((a, b) => a - b);
  }
  return [];
}

/** Firebase may store dealPattern as object-keyed arrays. */
function normalizeDealPattern(value: unknown): number[] | number[][] {
  if (!value) return [4, 4, 5];
  if (Array.isArray(value)) {
    if (value.length > 0 && Array.isArray(value[0])) {
      return (value as unknown[]).map((row) => normalizeNumberArray(row));
    }
    return normalizeNumberArray(value);
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([a], [b]) => Number(a) - Number(b)
    );
    const rows = entries.map(([, v]) => v);
    if (rows.length > 0 && typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
      return rows.map((row) => normalizeNumberArray(row));
    }
    return normalizeNumberArray(rows);
  }
  return [4, 4, 5];
}

/** Coerce raw Firebase gameState into a safe in-memory GameState. */
export function normalizeGameState(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null;

  const data = raw as Record<string, unknown>;
  const rawDeal = (data.dealState as GameState['dealState']) || {
    dealBlock: 0,
    dealRoundInBlock: 0,
    startingSeat: 0,
    cardsPerPlayer: 4,
    dealPattern: [4, 4, 5],
  };
  const dealState = {
    ...rawDeal,
    dealPattern: normalizeDealPattern(rawDeal.dealPattern),
  };

  return {
    ...(data as unknown as GameState),
    players: normalizePlayers(data.players),
    marbles: normalizeList<Marble>(data.marbles),
    eventLog: normalizeList<GameEvent>(data.eventLog),
    discardPile: normalizeList(data.discardPile),
    deck: normalizeList(data.deck),
    handCounts: (data.handCounts as Record<string, number>) || {},
    customRulesConfig: ((data.customRulesConfig as CustomRulesConfig | null) ?? null),
    dealState,
  };
}

export function normalizeCards(cards: unknown): Card[] {
  return normalizeList<Card>(cards);
}

export function getMaxPlayersForMode(mode: string | undefined): number {
  switch (mode) {
    case '4p_teams':
      return 4;
    case '3p_solo':
      return 3;
    case '2p_solo':
    default:
      return 2;
  }
}
