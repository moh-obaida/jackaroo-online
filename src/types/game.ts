// ============================================================================
// CORE GAME TYPES — Jakaroo Online (Obaida Classic)
// ============================================================================

export type PlayerColor = 'black' | 'green' | 'blue' | 'white';

export type TeamId = 'A' | 'B';

export type GameMode = '2p_solo' | '3p_solo' | '4p_teams';

export type RoomStatus = 'lobby' | 'playing' | 'paused' | 'finished' | 'expired';

export type RulesetType = 'obaida_classic' | 'custom';

export type BotDifficulty = 'very_easy' | 'easy' | 'normal' | 'hard' | 'very_hard';

export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  id: string;
  rank: CardRank;
  suit: CardSuit;
}

// ============================================================================
// BOARD MODEL — 92 playable spots (18×4 track + 4 start/gate + 4×4 home)
// ============================================================================

export type SpotType = 'track' | 'start_gate' | 'home' | 'base';

/**
 * Board position identifier.
 * Format examples:
 * - Track: { color: 'black', type: 'track', index: 0-17 }
 * - Start/Gate: { color: 'black', type: 'start_gate', index: 0 }
 * - Home: { color: 'black', type: 'home', index: 0-3 }
 * - Base: { color: 'black', type: 'base', index: 0-3 }
 */
export interface BoardPosition {
  color: PlayerColor;
  type: SpotType;
  index: number;
}

export interface Marble {
  id: string;
  color: PlayerColor;
  position: BoardPosition;
  isFinished: boolean;
}

// ============================================================================
// ACTIONS
// ============================================================================

export type ActionType =
  | 'bring_out'
  | 'move'
  | 'move_backward'
  | 'split_seven'
  | 'swap'
  | 'burn_next_player'
  | 'burn_all_cards'
  | 'skip_no_cards';

export interface SplitSevenMove {
  marbleId: string;
  steps: number;
}

export interface GameAction {
  type: ActionType;
  playerId: string;
  cardId?: string;
  marbleId?: string;
  targetPosition?: BoardPosition;
  /** For swap: the two marble IDs */
  swapMarbleId1?: string;
  swapMarbleId2?: string;
  /** For split seven */
  splitMoves?: SplitSevenMove[];
  /** For burn */
  burnTargetPlayerId?: string;
  burnCardIndex?: number;
  burnCardId?: string;
}

export interface LegalAction {
  type: ActionType;
  cardId: string;
  description: string;
  marbleId?: string;
  targetPosition?: BoardPosition;
  swapMarbleId1?: string;
  swapMarbleId2?: string;
  splitMoves?: SplitSevenMove[];
  burnTargetPlayerId?: string;
}

// ============================================================================
// GAME STATE
// ============================================================================

export interface PlayerState {
  id: string;
  uid: string;
  name: string;
  color: PlayerColor;
  seat: number;
  team: TeamId | null;
  isBot: boolean;
  botDifficulty: BotDifficulty | null;
  connected: boolean;
  ready: boolean;
  guest: boolean;
}

export interface DealState {
  dealBlock: number;
  dealRoundInBlock: number;
  startingSeat: number;
  cardsPerPlayer: number;
  dealPattern: number[] | number[][];
}

export interface GameState {
  mode: GameMode;
  rulesetType: RulesetType;
  rulesetId: string;
  customRulesConfig?: CustomRulesConfig | null;
  players: PlayerState[];
  marbles: Marble[];
  currentTurnPlayerId: string;
  currentSeat: number;
  dealState: DealState;
  handCounts: Record<string, number>; // playerId -> number of cards (public only)
  deck: Card[];
  discardPile: Card[];
  eventLog: GameEvent[];
  winner: WinResult | null;
  turnNumber: number;
}

export interface GameEvent {
  id: string;
  timestamp: number;
  type: 'move' | 'eat' | 'swap' | 'burn' | 'bring_out' | 'skip' | 'burn_all' | 'deal' | 'win' | 'disconnect' | 'reconnect' | 'vote';
  playerId?: string;
  description: string;
  cardPlayed?: Card;
}

export interface WinResult {
  winnerTeam?: TeamId;
  winnerPlayerId?: string;
  winnerPlayerIds: string[];
}

// ============================================================================
// ROOM
// ============================================================================

export interface BotSettings {
  enabled: boolean;
  count: number;
  difficulty: BotDifficulty;
}

export interface RoomData {
  code: string;
  passwordHash: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  roomMakerUid: string;
  status: RoomStatus;
  lockedAfterStart: boolean;
  mode: GameMode;
  rulesetType: RulesetType;
  rulesetId: string;
  customRulesSummary: CustomRulesConfig | null;
  language: 'en' | 'ar';
  theme: 'dark' | 'light' | 'balanced';
  botSettings: BotSettings;
  players: Record<string, PlayerState>;
}

// ============================================================================
// CUSTOM RULES
// ============================================================================

export interface CustomRulesConfig {
  name: string;
  jokerEnabled: boolean;
  jokerCopiesCard: boolean;
  queenBurnEnabled: boolean;
  tenBurnEnabled: boolean;
  kingPathEatingEnabled: boolean;
  fiveCanMoveAnyone: boolean;
  longerTwoPlayerVariant: boolean;
  botDifficulty: BotDifficulty;
  timerEnabled: boolean;
  timerSeconds: number;
}

export const DEFAULT_CUSTOM_RULES: CustomRulesConfig = {
  name: 'Custom Template',
  jokerEnabled: false,
  jokerCopiesCard: false,
  queenBurnEnabled: true,
  tenBurnEnabled: true,
  kingPathEatingEnabled: true,
  fiveCanMoveAnyone: true,
  longerTwoPlayerVariant: false,
  botDifficulty: 'very_easy',
  timerEnabled: false,
  timerSeconds: 60,
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const COLORS_ORDER: PlayerColor[] = ['black', 'green', 'blue', 'white'];

export const TEAM_ASSIGNMENTS: Record<number, TeamId> = {
  0: 'A', // Seat 1
  1: 'B', // Seat 2
  2: 'A', // Seat 3
  3: 'B', // Seat 4
};

export const TRACK_LENGTH = 18; // spots per player section
export const HOME_LENGTH = 4;
export const BASE_COUNT = 4;
export const SECTION_OUTER_SPOTS = TRACK_LENGTH + 1; // 18 track + 1 start/gate
export const TOTAL_TRACK_SPOTS = TRACK_LENGTH * 4; // 72 normal track spots
export const TOTAL_OUTER_SPOTS = SECTION_OUTER_SPOTS * 4; // 76 including start/gates
