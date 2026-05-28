import React, { createContext, useContext, useMemo } from 'react';
import { RoomSessionProvider, useRoomSession } from './room/RoomSessionContext';
import { GamePlayProvider, useGamePlay } from './game/GamePlayContext';
import {
  GameState,
  GameAction,
  LegalAction,
  RoomData,
  Card,
  PlayerState,
} from '../types/game';

export type GameContextType = {
  room: RoomData | null;
  gameState: GameState | null;
  myHand: Card[];
  legalActions: LegalAction[];
  isMyTurn: boolean;
  myPlayer: PlayerState | null;
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
  bindRoomFromRoute: (code: string) => void;
  submitAction: (action: GameAction) => Promise<void>;
  startGame: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isLeaving: boolean;
  leaveWarning: string | null;
  clearGameSession: () => void;
  safeLeaveRoom: (code: string) => Promise<void>;
  handLoaded: boolean;
  handError: string | null;
};

const GameContext = createContext<GameContextType | null>(null);

function GameContextBridge({ children }: { children: React.ReactNode }) {
  const session = useRoomSession();
  const play = useGamePlay();

  const value = useMemo<GameContextType>(
    () => ({
      room: session.room,
      gameState: play.gameState,
      myHand: play.myHand,
      legalActions: play.legalActions,
      isMyTurn: play.isMyTurn,
      myPlayer: session.myPlayer,
      roomCode: session.roomCode,
      setRoomCode: session.setRoomCode,
      bindRoomFromRoute: session.bindRoomFromRoute,
      submitAction: play.submitAction,
      startGame: play.startGame,
      loading: session.loading,
      error: session.error,
      isLeaving: session.isLeaving,
      leaveWarning: session.leaveWarning,
      clearGameSession: session.clearGameSession,
      safeLeaveRoom: session.safeLeaveRoom,
      handLoaded: play.handLoaded,
      handError: play.handError,
    }),
    [session, play]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  return (
    <RoomSessionProvider>
      <GamePlayProvider>
        <GameContextBridge>{children}</GameContextBridge>
      </GamePlayProvider>
    </RoomSessionProvider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
