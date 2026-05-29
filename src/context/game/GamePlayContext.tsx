import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GameState, GameAction, LegalAction, Card } from '../../types/game';
import {
  subscribeToGameState,
  subscribeToPrivateHand,
  saveGameState,
  savePrivateHandWithRetry,
  HAND_SYNC_FAILED_ERROR,
  updateRoomStatus,
  getPrivateHand,
} from '../../lib/firebase/rooms';
import { isFirebaseConfigured } from '../../lib/firebase/config';
import { generateLegalActions } from '../../lib/game/legalMoves';
import { generateBotAction } from '../../lib/game/bots';
import { STALE_MOVE_ERROR } from '../../lib/game/compareAndSet';
import { legalActionToGameAction, persistGameAction } from '../../lib/game/persistAction';
import { initializeDealBlock, dealRound } from '../../lib/game/dealing';
import { getCardsPerPlayerForRound } from '../../lib/game/cards';
import { createInitialMarbles } from '../../lib/game/board';
import { useRoomSession } from '../room/RoomSessionContext';
import { useApp } from '../AppContext';
import { getAuthUserOrCurrent } from '../../lib/firebase/auth';

const BOT_TURN_DELAY_MS = 900;
const HAND_LOAD_TIMEOUT_MS = 8000;

export type GamePlayContextValue = {
  gameState: GameState | null;
  myHand: Card[];
  legalActions: LegalAction[];
  legalMovesReady: boolean;
  isMyTurn: boolean;
  handLoaded: boolean;
  handError: string | null;
  isSubmittingAction: boolean;
  submitAction: (
    action: GameAction
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  startGame: () => Promise<void>;
};

const GamePlayContext = createContext<GamePlayContextValue | null>(null);

export function GamePlayProvider({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const {
    room,
    roomCode,
    isLeaving,
    sessionEpoch,
    acceptSessionUpdate,
    setSessionError,
    setSessionLoading,
  } = useRoomSession();

  const playerId = (user ?? getAuthUserOrCurrent())?.uid?.trim() || null;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [handLoaded, setHandLoaded] = useState(false);
  const [handError, setHandError] = useState<string | null>(null);

  const gameStateRef = useRef(gameState);
  const myHandRef = useRef(myHand);
  gameStateRef.current = gameState;
  myHandRef.current = myHand;

  const scheduledBotTurnRef = useRef<string | null>(null);
  const botTurnInFlightRef = useRef(false);
  const handTimeoutRef = useRef<number | null>(null);
  const handScopeRef = useRef<string | null>(null);
  const dealEpochRef = useRef<string | null>(null);
  const submittingRef = useRef(false);

  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const clearHandTimer = useCallback(() => {
    if (handTimeoutRef.current != null) {
      window.clearTimeout(handTimeoutRef.current);
      handTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isLeaving) {
      setGameState(null);
      setMyHand([]);
      setHandLoaded(false);
      setHandError(null);
      clearHandTimer();
      return;
    }

    if (!roomCode || !room || room.status !== 'playing' || !isFirebaseConfigured) {
      setGameState(null);
      setMyHand([]);
      setHandLoaded(false);
      setHandError(null);
      return;
    }

    const epoch = sessionEpoch;
    const unsub = subscribeToGameState(roomCode, (state) => {
      if (!acceptSessionUpdate(epoch, roomCode)) return;
      setGameState(state);
    });

    return () => unsub();
  }, [roomCode, room?.status, isLeaving, sessionEpoch, acceptSessionUpdate, room, clearHandTimer]);

  useEffect(() => {
    if (isLeaving) return;
    if (!roomCode) return;
    if (room === null) {
      setGameState(null);
      setMyHand([]);
      setHandLoaded(false);
      setHandError(null);
    }
  }, [roomCode, room, isLeaving]);

  useEffect(() => {
    if (isLeaving) return;
    if (!roomCode || !playerId || !room || room.status !== 'playing' || !isFirebaseConfigured) {
      setMyHand([]);
      setHandLoaded(false);
      setHandError(null);
      return;
    }

    const epoch = sessionEpoch;
    const scope = `${roomCode}:${playerId}`;
    if (handScopeRef.current !== scope) {
      handScopeRef.current = scope;
      setHandLoaded(false);
    }
    setHandError(null);

    const unsub = subscribeToPrivateHand(roomCode, playerId, (cards) => {
      if (!acceptSessionUpdate(epoch, roomCode)) return;
      setMyHand(cards || []);
      setHandLoaded(true);
      setHandError(null);
      clearHandTimer();
    });

    return () => {
      unsub();
      clearHandTimer();
    };
  }, [
    roomCode,
    playerId,
    room?.status,
    isLeaving,
    sessionEpoch,
    acceptSessionUpdate,
    room,
    clearHandTimer,
  ]);

  useEffect(() => {
    if (isLeaving || !gameState || !playerId || !roomCode) {
      clearHandTimer();
      return;
    }

    const expected = gameState.handCounts[playerId] ?? 0;
    if (expected === 0 || myHand.length > 0) {
      setHandLoaded(true);
      setHandError(null);
      clearHandTimer();
      return;
    }

    const epoch = sessionEpoch;
    clearHandTimer();
    handTimeoutRef.current = window.setTimeout(() => {
      if (!acceptSessionUpdate(epoch, roomCode)) return;
      const state = gameStateRef.current;
      if (!state || (state.handCounts[playerId] ?? 0) === 0) {
        setHandLoaded(true);
        return;
      }
      if (myHandRef.current.length === 0) {
        setHandError('game.handLoadFailed');
      }
      setHandLoaded(true);
    }, HAND_LOAD_TIMEOUT_MS);

    return clearHandTimer;
  }, [
    gameState,
    playerId,
    roomCode,
    isLeaving,
    sessionEpoch,
    myHand.length,
    acceptSessionUpdate,
    clearHandTimer,
  ]);

  useEffect(() => {
    if (isLeaving || !gameState || !playerId) {
      dealEpochRef.current = null;
      return;
    }

    const dealKey = `${gameState.dealState.dealBlock}:${gameState.dealState.dealRoundInBlock}`;
    if (dealEpochRef.current === dealKey) return;

    dealEpochRef.current = dealKey;
    const expected = gameState.handCounts[playerId] ?? 0;
    if (expected > 0) {
      setHandLoaded(false);
    }
  }, [
    gameState?.dealState.dealBlock,
    gameState?.dealState.dealRoundInBlock,
    gameState?.handCounts,
    playerId,
    isLeaving,
    gameState,
  ]);

  const isMyTurn = gameState?.currentTurnPlayerId === playerId;

  const legalMovesReady = useMemo(() => {
    if (!gameState || !playerId || !isMyTurn || !handLoaded) return false;
    const expected = gameState.handCounts[playerId] ?? 0;
    if (expected === 0) return true;
    return myHand.length > 0;
  }, [gameState, playerId, isMyTurn, handLoaded, myHand.length]);

  const legalActions = useMemo(() => {
    if (!gameState || !playerId || !isMyTurn || !legalMovesReady) {
      return [];
    }
    try {
      return generateLegalActions(gameState, myHand);
    } catch (err) {
      console.error('generateLegalActions failed:', err);
      return [];
    }
  }, [gameState, playerId, isMyTurn, legalMovesReady, myHand]);

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

    const epoch = sessionEpoch;
    const timer = window.setTimeout(async () => {
      if (!acceptSessionUpdate(epoch, roomCode)) return;
      const state = gameStateRef.current;
      if (!state || state.winner) return;
      if (state.currentTurnPlayerId !== turnPlayer.id) return;
      if (botTurnInFlightRef.current) return;

      botTurnInFlightRef.current = true;
      try {
        const botHand = await getPrivateHand(roomCode, turnPlayer.id);
        if (!acceptSessionUpdate(epoch, roomCode)) return;

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
          setSessionError('Bot has no legal move');
          return;
        }

        const result = await persistGameAction(
          roomCode,
          state,
          legalActionToGameAction(choice, turnPlayer.id),
          botHand
        );
        if (!acceptSessionUpdate(epoch, roomCode)) return;
        if (!result.ok) {
          scheduledBotTurnRef.current = null;
          setSessionError(result.error);
        }
      } catch (err: unknown) {
        if (!acceptSessionUpdate(epoch, roomCode)) return;
        scheduledBotTurnRef.current = null;
        setSessionError(err instanceof Error ? err.message : 'Bot turn failed');
      } finally {
        botTurnInFlightRef.current = false;
      }
    }, BOT_TURN_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      if (scheduledBotTurnRef.current === turnKey) {
        scheduledBotTurnRef.current = null;
      }
    };
  }, [
    roomCode,
    room,
    playerId,
    gameState?.currentTurnPlayerId,
    gameState?.turnNumber,
    gameState?.winner,
    isLeaving,
    sessionEpoch,
    acceptSessionUpdate,
    setSessionError,
    gameState,
  ]);

  const startGame = useCallback(async () => {
    if (!roomCode || !room || !playerId) return;
    if (room.roomMakerUid !== playerId) return;

    const epoch = sessionEpoch;
    setSessionError(null);
    setSessionLoading(true);

    try {
      const players = Object.values(room.players).sort((a, b) => a.seat - b.seat);
      const activeColors = players.map((p) => p.color);
      const marbles = createInitialMarbles(activeColors);
      const dealBlock = initializeDealBlock(room.mode, 0);
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
        handCounts: Object.fromEntries(
          Object.entries(hands).map(([pid, cards]) => [pid, cards.length])
        ),
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
            description: 'Cards dealt for round 1.',
          },
        ],
        winner: null,
        turnNumber: 0,
      };

      if (!acceptSessionUpdate(epoch, roomCode)) return;

      await saveGameState(roomCode, initialState);
      for (const [pid, cards] of Object.entries(hands)) {
        const handWrite = await savePrivateHandWithRetry(roomCode, pid, cards);
        if (!handWrite.ok) {
          console.error(
            `[Jakaroo] Game started but private hand sync failed room=${roomCode} player=${pid}`
          );
          setSessionError(HAND_SYNC_FAILED_ERROR);
          return;
        }
      }
      await updateRoomStatus(roomCode, 'playing');
    } catch (err: unknown) {
      if (!acceptSessionUpdate(epoch, roomCode)) return;
      setSessionError(
        err instanceof Error && err.message && !err.message.startsWith('lobby.')
          ? err.message
          : 'lobby.startFailed'
      );
    } finally {
      if (acceptSessionUpdate(epoch, roomCode)) {
        setSessionLoading(false);
      }
    }
  }, [
    roomCode,
    room,
    playerId,
    sessionEpoch,
    acceptSessionUpdate,
    setSessionError,
    setSessionLoading,
  ]);

  const submitAction = useCallback(
    async (action: GameAction): Promise<{ ok: true } | { ok: false; error: string }> => {
      if (!gameState || !roomCode || submittingRef.current) {
        return { ok: false, error: STALE_MOVE_ERROR };
      }

      const snapshot = gameStateRef.current;
      if (
        !snapshot ||
        snapshot.currentTurnPlayerId !== action.playerId ||
        snapshot.currentTurnPlayerId !== playerId
      ) {
        return { ok: false, error: 'Not your turn' };
      }

      const epoch = sessionEpoch;
      submittingRef.current = true;
      setIsSubmittingAction(true);
      try {
        const result = await persistGameAction(
          roomCode,
          snapshot,
          action,
          myHandRef.current
        );
        if (!acceptSessionUpdate(epoch, roomCode)) {
          return { ok: false, error: STALE_MOVE_ERROR };
        }
        if (!result.ok) {
          setSessionError(result.error);
          return result;
        }
        setSessionError(null);
        return { ok: true };
      } catch (err: unknown) {
        if (!acceptSessionUpdate(epoch, roomCode)) {
          return { ok: false, error: STALE_MOVE_ERROR };
        }
        const message = err instanceof Error ? err.message : STALE_MOVE_ERROR;
        setSessionError(message);
        return { ok: false, error: message };
      } finally {
        submittingRef.current = false;
        setIsSubmittingAction(false);
      }
    },
    [gameState, roomCode, playerId, sessionEpoch, acceptSessionUpdate, setSessionError]
  );

  const value: GamePlayContextValue = {
    gameState,
    myHand,
    legalActions,
    legalMovesReady,
    isMyTurn,
    handLoaded,
    handError,
    isSubmittingAction,
    submitAction,
    startGame,
  };

  return <GamePlayContext.Provider value={value}>{children}</GamePlayContext.Provider>;
}

export function useGamePlay(): GamePlayContextValue {
  const ctx = useContext(GamePlayContext);
  if (!ctx) throw new Error('useGamePlay must be used within GamePlayProvider');
  return ctx;
}
