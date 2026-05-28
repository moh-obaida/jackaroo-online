import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useRoomSession } from '../context/room/RoomSessionContext';
import { useGamePlay } from '../context/game/GamePlayContext';
import {
  resolveRoomRouteState,
  RoomRoutePage,
  RoomRouteState,
} from '../lib/room/routeState';

export function useRoomRouteState(page: RoomRoutePage, roomCode: string | null): RoomRouteState {
  const { authLoading, firebaseReady, user } = useApp();
  const { room, roomLoaded, isLeaving } = useRoomSession();
  const { gameState, handLoaded, handError } = useGamePlay();

  const playerId = user?.uid?.trim() || null;

  return useMemo(
    () =>
      resolveRoomRouteState({
        page,
        roomCode,
        authLoading,
        firebaseReady,
        hasUser: Boolean(user),
        isLeaving,
        roomLoaded,
        room,
        gameState,
        handLoaded,
        handError,
        playerId,
      }),
    [
      page,
      roomCode,
      authLoading,
      firebaseReady,
      user,
      isLeaving,
      roomLoaded,
      room,
      gameState,
      handLoaded,
      handError,
      playerId,
    ]
  );
}
