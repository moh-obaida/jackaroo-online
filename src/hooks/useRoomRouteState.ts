import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useRoomSession } from '../context/room/RoomSessionContext';
import { useGamePlay } from '../context/game/GamePlayContext';
import { getAuthUserOrCurrent } from '../lib/firebase/auth';
import {
  resolveRoomRouteState,
  RoomRoutePage,
  RoomRouteState,
} from '../lib/room/routeState';

export function useRoomRouteState(page: RoomRoutePage, roomCode: string | null): RoomRouteState {
  const { authLoading, firebaseReady, user } = useApp();
  const { room, roomLoaded, isLeaving } = useRoomSession();
  const { gameState, handLoaded, handError } = useGamePlay();

  const authUser = user ?? getAuthUserOrCurrent();
  const playerId = authUser?.uid?.trim() || null;
  // Guest sign-in can complete before onAuthStateChanged updates React; don't block lobby on authLoading alone.
  const effectiveAuthLoading = authLoading && !authUser;

  return useMemo(
    () =>
      resolveRoomRouteState({
        page,
        roomCode,
        authLoading: effectiveAuthLoading,
        firebaseReady,
        hasUser: Boolean(authUser),
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
      effectiveAuthLoading,
      firebaseReady,
      authUser,
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
