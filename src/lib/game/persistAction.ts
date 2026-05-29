// ============================================================================
// PERSIST ACTION — Validate, apply, and save a move (human or bot)
// ============================================================================

import { Card, GameAction, GameState, LegalAction } from '../../types/game';
import {
  getPrivateHand,
  saveGameState,
  savePrivateHand,
  updateRoomStatus,
} from '../firebase/rooms';
import { validateAction } from './validators';
import { applyAction } from './applyAction';
import { pickRandomCardIndex } from './cards';
import {
  initializeDealBlock,
  dealRound,
  isDealBlockExhausted,
  getNextStartingSeat,
} from './dealing';
import { allPlayersHandsEmpty } from './turns';

export function legalActionToGameAction(legal: LegalAction, playerId: string): GameAction {
  return {
    type: legal.type,
    playerId,
    cardId: legal.cardId || undefined,
    marbleId: legal.marbleId,
    targetPosition: legal.targetPosition,
    swapMarbleId1: legal.swapMarbleId1,
    swapMarbleId2: legal.swapMarbleId2,
    splitMoves: legal.splitMoves,
    burnTargetPlayerId: legal.burnTargetPlayerId,
  };
}

export async function persistGameAction(
  roomCode: string,
  gameState: GameState,
  action: GameAction,
  actorHand: Card[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const validation = validateAction(gameState, action, actorHand);
  if (!validation.valid) {
    return { ok: false, error: validation.error || 'Invalid action' };
  }

  let normalizedAction = { ...action };
  let burnTargetHand: Card[] = [];
  if (action.type === 'burn_next_player' && action.burnTargetPlayerId) {
    burnTargetHand = await getPrivateHand(roomCode, action.burnTargetPlayerId);
    if (burnTargetHand.length === 0) {
      return { ok: false, error: 'Target player has no cards to burn' };
    }
    const burnIndex = pickRandomCardIndex(burnTargetHand.length);
    normalizedAction = {
      ...action,
      burnCardIndex: burnIndex,
      burnCardId: burnTargetHand[burnIndex]?.id,
    };
  }

  const applied = applyAction(gameState, normalizedAction, actorHand, burnTargetHand);
  let newState = applied.state;
  const newPrivateHands: Record<string, Card[]> = {
    [action.playerId]: applied.currentPlayerHand,
  };
  if (normalizedAction.type === 'burn_next_player' && normalizedAction.burnTargetPlayerId) {
    newPrivateHands[normalizedAction.burnTargetPlayerId] = applied.burnTargetHand;
  }

  if (allPlayersHandsEmpty(newState)) {
    const nextRound = gameState.dealState.dealRoundInBlock + 1;
    let activeDeck = [...newState.deck];
    let dealPattern = gameState.dealState.dealPattern;
    let roundIndex = nextRound;
    let startingSeat = gameState.dealState.startingSeat;
    let dealBlockNum = gameState.dealState.dealBlock;
    if (isDealBlockExhausted(gameState.mode, nextRound)) {
      dealBlockNum += 1;
      startingSeat = getNextStartingSeat(
        gameState.dealState.startingSeat,
        gameState.players.length
      );
      const nextBlock = initializeDealBlock(gameState.mode, startingSeat);
      activeDeck = nextBlock.deck;
      dealPattern = nextBlock.dealPattern;
      roundIndex = 0;
    }
    const dealt = dealRound(
      activeDeck,
      gameState.players,
      gameState.mode,
      dealPattern,
      roundIndex
    );
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
    newState.handCounts = Object.fromEntries(
      Object.entries(newPrivateHands).map(([pid, cards]) => [pid, cards.length])
    );
  }

  await saveGameState(roomCode, newState);

  for (const [pid, cards] of Object.entries(newPrivateHands)) {
    await savePrivateHand(roomCode, pid, cards);
  }

  if (newState.winner) {
    await updateRoomStatus(roomCode, 'finished');
  }

  return { ok: true };
}
