// ============================================================================
// GAME CONTEXT — Game state management with Firebase sync
// ============================================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  GameState,
  GameAction,
  LegalAction,
  RoomData,
  Card,
  PlayerState,
} from '../types/game';
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
import { applyAction } from '../lib/game/applyAction';
import { validateAction } from '../lib/game/validators';
import { initializeDealBlock, dealRound, isDealBlockExhausted, getNextStartingSeat } from '../lib/game/dealing';
import { getCardsPerPlayerForRound } from '../lib/game/cards';
import { createInitialMarbles } from '../lib/game/board';
import { pickRandomCardIndex } from '../lib/game/cards';
import { useApp } from './AppContext';

interface GameContextType {
  room: RoomData | null;
  gameState: GameState | null;
  myHand: Card[];
  legalActions: LegalAction[];
  isMyTurn: boolean;
  myPlayer: PlayerState | null;
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
  submitAction: (action: GameAction) => Promise<void>;
  startGame: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playerId = user?.uid || null;

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
        eventLog: [],
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

  // Submit action
  const submitAction = useCallback(
    async (action: GameAction) => {
      if (!gameState || !roomCode) return;

      // Validate
      const validation = validateAction(gameState, action, myHand);
      if (!validation.valid) {
        setError(validation.error || 'Invalid action');
        return;
      }

      // For burn, the authoritative updater picks the random card exactly once.
      // Non-burn actions only need the acting player's private hand.
      let normalizedAction = { ...action };
      let burnTargetHand: Card[] = [];
      if (action.type === 'burn_next_player' && action.burnTargetPlayerId) {
        burnTargetHand = await getPrivateHand(roomCode, action.burnTargetPlayerId);
        if (burnTargetHand.length === 0) {
          setError('Target player has no cards to burn');
          return;
        }
        const burnIndex = pickRandomCardIndex(burnTargetHand.length);
        normalizedAction = {
          ...action,
          burnCardIndex: burnIndex,
          burnCardId: burnTargetHand[burnIndex]?.id,
        };
      }

      const applied = applyAction(gameState, normalizedAction, myHand, burnTargetHand);
      let newState = applied.state;
      const newPrivateHands: Record<string, Card[]> = { [action.playerId]: applied.currentPlayerHand };
      if (normalizedAction.type === 'burn_next_player' && normalizedAction.burnTargetPlayerId) {
        newPrivateHands[normalizedAction.burnTargetPlayerId] = applied.burnTargetHand;
      }

      if (Object.values(newState.handCounts).every((count) => count === 0)) {
        const nextRound = gameState.dealState.dealRoundInBlock + 1;
        let activeDeck = [...newState.deck];
        let dealPattern = gameState.dealState.dealPattern;
        let roundIndex = nextRound;
        let startingSeat = gameState.dealState.startingSeat;
        let dealBlockNum = gameState.dealState.dealBlock;
        if (isDealBlockExhausted(gameState.mode, nextRound)) {
          dealBlockNum += 1;
          startingSeat = getNextStartingSeat(gameState.dealState.startingSeat, gameState.players.length);
          const nextBlock = initializeDealBlock(gameState.mode, startingSeat);
          activeDeck = nextBlock.deck;
          dealPattern = nextBlock.dealPattern;
          roundIndex = 0;
        }
        const dealt = dealRound(activeDeck, gameState.players, gameState.mode, dealPattern, roundIndex);
        Object.assign(newPrivateHands, dealt.hands);
        newState = {
          ...newState,
          deck: dealt.remainingDeck,
          dealState: {
            ...newState.dealState,
            dealBlock: dealBlockNum,
            dealRoundInBlock: roundIndex,
            startingSeat,
            dealPattern,
          },
        };
        newState.handCounts = Object.fromEntries(Object.entries(newPrivateHands).map(([pid, cards]) => [pid, cards.length]));
      }

      // Save to Firebase (authoritative update)
      await saveGameState(roomCode, newState);

      // Update private hands
      for (const [pid, cards] of Object.entries(newPrivateHands)) {
        await savePrivateHand(roomCode, pid, cards);
      }

      // Check if game is won
      if (newState.winner) {
        await updateRoomStatus(roomCode, 'finished');
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
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
