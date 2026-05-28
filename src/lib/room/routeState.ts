import { GameState, RoomData } from '../../types/game';
import { hasLeft } from './sessionMarks';

export type RoomRoutePage = 'lobby' | 'game';

export type RoomRouteState =
  | { kind: 'loading_session' }
  | { kind: 'firebase_missing' }
  | { kind: 'sign_in_required' }
  | { kind: 'invalid_code' }
  | { kind: 'leaving' }
  | { kind: 'loading_room' }
  | { kind: 'room_not_found' }
  | { kind: 'left_room' }
  | { kind: 'not_member' }
  | { kind: 'redirect_to_game' }
  | { kind: 'lobby_ready' }
  | { kind: 'game_not_started' }
  | { kind: 'waiting_game_state' }
  | { kind: 'loading_hand' }
  | { kind: 'hand_error'; message: string }
  | { kind: 'ready_play' };

export type ResolveRoomRouteInput = {
  page: RoomRoutePage;
  roomCode: string | null;
  authLoading: boolean;
  firebaseReady: boolean;
  hasUser: boolean;
  isLeaving: boolean;
  roomLoaded: boolean;
  room: RoomData | null;
  gameState: GameState | null;
  handLoaded: boolean;
  handError: string | null;
  playerId: string | null;
};

export function resolveRoomRouteState(input: ResolveRoomRouteInput): RoomRouteState {
  const {
    page,
    roomCode,
    authLoading,
    firebaseReady,
    hasUser,
    isLeaving,
    roomLoaded,
    room,
    gameState,
    handLoaded,
    handError,
    playerId,
  } = input;

  if (authLoading) return { kind: 'loading_session' };
  if (!firebaseReady) return { kind: 'firebase_missing' };
  if (!hasUser || !playerId) return { kind: 'sign_in_required' };
  if (!roomCode) return { kind: 'invalid_code' };
  if (isLeaving) return { kind: 'leaving' };
  if (roomCode && hasLeft(roomCode)) return { kind: 'left_room' };
  if (!roomLoaded) return { kind: 'loading_room' };
  if (!room) return { kind: 'room_not_found' };

  const isMember = Boolean(playerId && room.players?.[playerId]);
  if (!isMember) return { kind: 'not_member' };

  if (page === 'lobby') {
    if (room.status === 'playing') return { kind: 'redirect_to_game' };
    return { kind: 'lobby_ready' };
  }

  // game page
  if (room.status === 'lobby') return { kind: 'game_not_started' };
  if (!gameState) return { kind: 'waiting_game_state' };
  if (handError) return { kind: 'hand_error', message: handError };

  const expectedCards = gameState.handCounts[playerId] ?? 0;
  if (!handLoaded && expectedCards > 0) return { kind: 'loading_hand' };

  return { kind: 'ready_play' };
}

/** Terminal states that should render RoomRouteFallback instead of page content. */
export function isTerminalRouteState(state: RoomRouteState): boolean {
  return state.kind !== 'lobby_ready' && state.kind !== 'ready_play';
}
