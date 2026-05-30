// ============================================================================
// PERSIST ACTION — Validate, apply, and save a move (human or bot)
// ============================================================================

import { Card, GameAction, GameState, LegalAction } from '../../types/game';
import {
  getGameState,
  getPrivateHand,
  saveGameStateIfMatch,
  savePrivateHandWithRetry,
  HAND_SYNC_FAILED_ERROR,
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
import { STALE_MOVE_ERROR, validateMovePreconditions } from './compareAndSet';

export function legalActionToGameAction(legal: LegalAction, playerId: string): GameAction {
  const omitCard =
    legal.type === 'burn_all_cards' ||
    legal.type === 'skip_no_cards' ||
    !legal.cardId;

  return {
    type: legal.type,
    playerId,
    cardId: omitCard ? undefined : legal.cardId,
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
  clientState: GameState,
  action: GameAction,
  actorHand: Card[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const freshState = await getGameState(roomCode);
  if (!freshState) {
    return { ok: false, error: 'Game not found' };
  }

  const freshHand = await getPrivateHand(roomCode, action.playerId);
  const handForValidation = freshHand.length > 0 ? freshHand : actorHand;

  const preconditions = validateMovePreconditions({
    authoritativeState: freshState,
    clientState,
    action,
    hand: handForValidation,
  });
  if (!preconditions.ok) {
    return { ok: false, error: preconditions.error };
  }

  const validation = validateAction(freshState, action, handForValidation);
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

  const expectedTurnNumber = freshState.turnNumber;
  const expectedCurrentPlayerId = freshState.currentTurnPlayerId;

  const applied = applyAction(freshState, normalizedAction, handForValidation, burnTargetHand);
  let newState = applied.state;
  const newPrivateHands: Record<string, Card[]> = {
    [action.playerId]: applied.currentPlayerHand,
  };
  if (normalizedAction.type === 'burn_next_player' && normalizedAction.burnTargetPlayerId) {
    newPrivateHands[normalizedAction.burnTargetPlayerId] = applied.burnTargetHand;
  }

  if (allPlayersHandsEmpty(newState)) {
    const nextRound = freshState.dealState.dealRoundInBlock + 1;
    let activeDeck = [...newState.deck];
    let dealPattern = freshState.dealState.dealPattern;
    let roundIndex = nextRound;
    let startingSeat = freshState.dealState.startingSeat;
    let dealBlockNum = freshState.dealState.dealBlock;
    if (isDealBlockExhausted(freshState.mode, nextRound)) {
      dealBlockNum += 1;
      startingSeat = getNextStartingSeat(
        freshState.dealState.startingSeat,
        freshState.players.length
      );
      const nextBlock = initializeDealBlock(freshState.mode, startingSeat);
      activeDeck = nextBlock.deck;
      dealPattern = nextBlock.dealPattern;
      roundIndex = 0;
    }
    const dealt = dealRound(
      activeDeck,
      freshState.players,
      freshState.mode,
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

  const commit = await saveGameStateIfMatch(
    roomCode,
    expectedTurnNumber,
    expectedCurrentPlayerId,
    newState
  );
  if (!commit.ok) {
    return { ok: false, error: STALE_MOVE_ERROR };
  }

  // Order: public gameState committed first, then private hands (non-atomic across nodes).
  for (const [pid, cards] of Object.entries(newPrivateHands)) {
    const handWrite = await savePrivateHandWithRetry(roomCode, pid, cards);
    if (!handWrite.ok) {
      console.error(
        `[Jakaroo] Public gameState committed but private hand sync failed room=${roomCode} player=${pid}`
      );
      return { ok: false, error: HAND_SYNC_FAILED_ERROR };
    }
  }

  if (newState.winner) {
    await updateRoomStatus(roomCode, 'finished');
  }

  return { ok: true };
}
