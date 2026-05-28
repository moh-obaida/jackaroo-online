<<<<<<< HEAD
import React, { createContext, useContext, useMemo } from 'react';
import { RoomSessionProvider, useRoomSession } from './room/RoomSessionContext';
import { GamePlayProvider, useGamePlay } from './game/GamePlayContext';
=======
// ============================================================================
// GAME CONTEXT — Game state management with Firebase sync
// ============================================================================

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
>>>>>>> origin/main
import {
  GameState,
  GameAction,
  LegalAction,
  RoomData,
  Card,
  PlayerState,
} from '../types/game';
<<<<<<< HEAD

export type GameContextType = {
=======
import {
  subscribeToRoom,
  subscribeToGameState,
  subscribeToPrivateHand,
  saveGameState,
  savePrivateHand,
  updateRoomStatus,
  getPrivateHand,
} from '../lib/firebase/rooms';
import { isFirebaseConfigured } from '../lib/firebase/config';
import { generateLegalActions } from '../lib/game/legalMoves';
import { generateBotAction } from '../lib/game/bots';
import { legalActionToGameAction, persistGameAction } from '../lib/game/persistAction';
import { initializeDealBlock, dealRound } from '../lib/game/dealing';
import { getCardsPerPlayerForRound } from '../lib/game/cards';
import { createInitialMarbles } from '../lib/game/board';

import { removePlayerFromRoom, leaveWarningMessage } from '../lib/leave/safeLeave';
import { useApp } from './AppContext';

const BOT_TURN_DELAY_MS = 900;

interface GameContextType {
>>>>>>> origin/main
  room: RoomData | null;
  gameState: GameState | null;
  myHand: Card[];
  legalActions: LegalAction[];
  isMyTurn: boolean;
  myPlayer: PlayerState | null;
  roomCode: string | null;
  roomLoaded: boolean;
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
<<<<<<< HEAD
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
      roomLoaded: session.roomLoaded,
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

=======
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveWarning, setLeaveWarning] = useState<string | null>(null);

  const playerId = user?.uid || null;
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const scheduledBotTurnRef = useRef<string | null>(null);
  const botTurnInFlightRef = useRef(false);

  const clearGameSession = useCallback(() => {
    setRoomCode(null);
    setRoom(null);
    setGameState(null);
    setMyHand([]);
    setError(null);
    scheduledBotTurnRef.current = null;
    botTurnInFlightRef.current = false;
  }, []);

  useEffect(() => {
    if (location.pathname === '/') {
      setIsLeaving(false);
    }
  }, [location.pathname]);

  const safeLeaveRoom = useCallback(
    async (code: string) => {
      const trimmed = code?.trim();
      setIsLeaving(true);
      clearGameSession();

      if (trimmed && playerId) {
        try {
          await removePlayerFromRoom({ roomCode: trimmed, playerUid: playerId });
        } catch (err) {
          console.warn('safeLeaveRoom: Firebase remove failed', err);
          setLeaveWarning(leaveWarningMessage(err));
        }
      }

      navigate('/', { replace: true });
    },
    [playerId, clearGameSession, navigate]
  );

  // Subscribe to room
  useEffect(() => {
    if (!roomCode || !isFirebaseConfigured) {
      setRoom(null);
      setGameState(null);
      setMyHand([]);
      return;
    }

    const unsub = subscribeToRoom(roomCode, (roomData) => {
      setRoom(roomData);
    });

    return () => { unsub(); };
  }, [roomCode]);

  // Subscribe to game state
  useEffect(() => {
    if (!roomCode || !room || room.status !== 'playing' || !isFirebaseConfigured) return;

    const unsub = subscribeToGameState(roomCode, (state) => {
      setGameState(state);
    });

    return () => { unsub(); };
  }, [roomCode, room?.status]);

  // If room disappears (left/deleted), clear game-related in-memory state.
  useEffect(() => {
    if (!roomCode) return;
    if (room === null) {
      setGameState(null);
      setMyHand([]);
    }
  }, [roomCode, room]);

  // Subscribe to private hand
  useEffect(() => {
    if (!roomCode || !playerId || !room || room.status !== 'playing' || !isFirebaseConfigured) return;

    const unsub = subscribeToPrivateHand(roomCode, playerId, (cards) => {
      setMyHand(cards || []);
    });

    return () => { unsub(); };
  }, [roomCode, playerId, room?.status]);

  // Compute legal actions
  const legalActions = React.useMemo(() => {
    if (!gameState || !playerId || gameState.currentTurnPlayerId !== playerId) {
      return [];
    }
    try {
      return generateLegalActions(gameState, myHand);
    } catch (err) {
      console.error('generateLegalActions failed:', err);
      return [];
    }
  }, [gameState, playerId, myHand]);

  const isMyTurn = gameState?.currentTurnPlayerId === playerId;

  const myPlayer = React.useMemo(() => {
    if (!room || !playerId) return null;
    return room.players[playerId] || null;
  }, [room, playerId]);

  // Room maker runs bot turns (authoritative client).
  useEffect(() => {
    if (isLeaving) return;
    if (!roomCode || !room || !playerId || !gameState) return;
    if (room.status !== 'playing' || gameState.winner) return;
    if (room.roomMakerUid !== playerId) return;

    const turnPlayer = gameState.players.find((p) => p.id === gameState.currentTurnPlayerId);
    if (!turnPlayer?.isBot) {
      scheduledBotTurnRef.current = null;
      return;
    }

    const turnKey = `${gameState.turnNumber}:${gameState.currentTurnPlayerId}`;
    if (scheduledBotTurnRef.current === turnKey || botTurnInFlightRef.current) return;
    scheduledBotTurnRef.current = turnKey;

    const timer = setTimeout(async () => {
      const state = gameStateRef.current;
      if (!state || state.winner) return;
      if (state.currentTurnPlayerId !== turnPlayer.id) return;
      if (botTurnInFlightRef.current) return;

      botTurnInFlightRef.current = true;
      try {
        const botHand = await getPrivateHand(roomCode, turnPlayer.id);
        const difficulty =
          turnPlayer.botDifficulty || room.botSettings?.difficulty || 'very_easy';

        let choice = generateBotAction(state, botHand, difficulty);
        if (!choice) {
          const fallback = generateLegalActions(state, botHand);
          choice =
            fallback.find((a) => a.type === 'skip_no_cards') ||
            fallback.find((a) => a.type === 'burn_all_cards') ||
            fallback[0] ||
            null;
        }
        if (!choice) {
          scheduledBotTurnRef.current = null;
          setError('Bot has no legal move');
          return;
        }

        const result = await persistGameAction(
          roomCode,
          state,
          legalActionToGameAction(choice, turnPlayer.id),
          botHand
        );
        if (!result.ok) {
          scheduledBotTurnRef.current = null;
          setError(result.error);
        }
      } catch (err: unknown) {
        scheduledBotTurnRef.current = null;
        setError(err instanceof Error ? err.message : 'Bot turn failed');
      } finally {
        botTurnInFlightRef.current = false;
      }
    }, BOT_TURN_DELAY_MS);

    return () => clearTimeout(timer);
  }, [
    roomCode,
    room,
    playerId,
    gameState?.currentTurnPlayerId,
    gameState?.turnNumber,
    gameState?.winner,
    isLeaving,
  ]);

  // Start game
  const startGame = useCallback(async () => {
    if (!roomCode || !room || !playerId) return;
    if (room.roomMakerUid !== playerId) return;

    setLoading(true);
    try {
      const players = Object.values(room.players).sort((a, b) => a.seat - b.seat);
      const activeColors = players.map((p) => p.color);
      const marbles = createInitialMarbles(activeColors);

      // Initialize deal block (shuffled deck + pattern) — generated ONCE
      const dealBlock = initializeDealBlock(room.mode, 0);

      // Deal first round
      const { hands, remainingDeck } = dealRound(
        dealBlock.deck,
        players,
        room.mode,
        dealBlock.dealPattern,
        0
      );

      const initialState: GameState = {
        mode: room.mode,
        rulesetType: room.rulesetType,
        rulesetId: room.rulesetId || 'obaida_classic_v1',
        customRulesConfig: room.customRulesSummary || null,
        players,
        marbles,
        currentTurnPlayerId: players[0].id,
        currentSeat: 0,
        dealState: {
          dealBlock: 0,
          dealRoundInBlock: 0,
          startingSeat: 0,
          cardsPerPlayer: getCardsPerPlayerForRound(room.mode, dealBlock.dealPattern, 0),
          dealPattern: dealBlock.dealPattern,
        },
        handCounts: Object.fromEntries(Object.entries(hands).map(([pid,cards]) => [pid, cards.length])),
        deck: remainingDeck,
        discardPile: [],
        eventLog: [
          {
            id: `event_start_${Date.now()}`,
            timestamp: Date.now(),
            type: 'deal',
            playerId,
            description: `Game started in ${room.mode}.`,
          },
          {
            id: `event_deal_${Date.now() + 1}`,
            timestamp: Date.now() + 1,
            type: 'deal',
            playerId,
            description: `Cards dealt for round 1.`,
          },
        ],
        winner: null,
        turnNumber: 0,
      };

      // Save to Firebase
      await saveGameState(roomCode, initialState);

      // Save private hands separately
      for (const [pid, cards] of Object.entries(hands)) {
        await savePrivateHand(roomCode, pid, cards);
      }

      // Update room status
      await updateRoomStatus(roomCode, 'playing');
    } catch (err: any) {
      setError(err.message || 'Failed to start game');
    } finally {
      setLoading(false);
    }
  }, [roomCode, room, playerId]);

  // Submit action (human player on their turn)
  const submitAction = useCallback(
    async (action: GameAction) => {
      if (!gameState || !roomCode) return;

      const result = await persistGameAction(roomCode, gameState, action, myHand);
      if (!result.ok) {
        setError(result.error);
      }
    },
    [gameState, roomCode, myHand]
  );

  const value: GameContextType = {
    room,
    gameState,
    myHand,
    legalActions,
    isMyTurn,
    myPlayer,
    roomCode,
    setRoomCode,
    submitAction,
    startGame,
    loading,
    error,
    isLeaving,
    leaveWarning,
    clearGameSession,
    safeLeaveRoom,
  };

>>>>>>> origin/main
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
