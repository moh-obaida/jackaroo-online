import {
  Card,
  GameMode,
  GameState,
  Marble,
  PlayerColor,
  PlayerState,
} from '../../types/game';
import { createInitialMarbles } from './board';
import { OBAIDA_CLASSIC } from './rulesets';

export function makeCard(rank: Card['rank'], suit: Card['suit'] = 'hearts'): Card {
  return { id: `${rank}_${suit}`, rank, suit };
}

export function makePlayer(
  id: string,
  color: PlayerColor,
  seat: number,
  overrides: Partial<PlayerState> = {}
): PlayerState {
  return {
    id,
    uid: id,
    name: `Player ${seat + 1}`,
    color,
    seat,
    team: seat % 2 === 0 ? 'A' : 'B',
    isBot: false,
    botDifficulty: null,
    connected: true,
    ready: true,
    guest: false,
    ...overrides,
  };
}

export function makeBaseState(
  mode: GameMode,
  players: PlayerState[],
  currentTurnPlayerId: string,
  overrides: Partial<GameState> = {}
): GameState {
  const colors = players.map((p) => p.color);
  return {
    mode,
    rulesetType: 'obaida_classic',
    rulesetId: 'obaida_classic_v1',
    customRulesConfig: OBAIDA_CLASSIC.config,
    players,
    marbles: createInitialMarbles(colors),
    currentTurnPlayerId,
    currentSeat: players.find((p) => p.id === currentTurnPlayerId)?.seat ?? 0,
    dealState: {
      dealBlock: 0,
      dealRoundInBlock: 0,
      startingSeat: 0,
      cardsPerPlayer: 4,
      dealPattern: mode === '2p_solo' ? [4, 4, 5] : [4, 5, 4],
    },
    handCounts: Object.fromEntries(players.map((p) => [p.id, 0])),
    deck: [],
    discardPile: [],
    eventLog: [],
    winner: null,
    turnNumber: 0,
    ...overrides,
  };
}

export function placeMarble(
  marbles: Marble[],
  marbleId: string,
  position: Marble['position'],
  isFinished = false
): Marble[] {
  return marbles.map((m) =>
    m.id === marbleId ? { ...m, position, isFinished } : m
  );
}

export function handCountsFor(hand: Card[], playerId: string): Record<string, number> {
  return { [playerId]: hand.length };
}
