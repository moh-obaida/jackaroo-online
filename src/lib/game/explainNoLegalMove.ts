import { Card, GameState, PlayerState } from '../../types/game';
import { canBringOut, canBurn, getCardMoveValue } from './cards';
import { getMarbleAtPosition, isInBase, isInHome, isLockedOnOwnStartGate, getStartGatePosition, isOnMainTrack, calculateForwardTarget } from './board';
import { generateLegalActions } from './legalMoves';

export type NoLegalMoveReasonKey =
  | 'game.noLegalReason.allInBaseNoAceKing'
  | 'game.noLegalReason.startGateBlocked'
  | 'game.noLegalReason.noMarbleMoves'
  | 'game.noLegalReason.noExactHome'
  | 'game.noLegalReason.burnUnavailable'
  | 'game.noLegalReason.teammateOnly'
  | 'game.noLegalReason.generic';

/** Player-facing explanation when only burn_all_cards is legal. */
export function explainNoLegalMove(state: GameState, hand: Card[]): NoLegalMoveReasonKey {
  const player = state.players.find((p) => p.id === state.currentTurnPlayerId);
  if (!player || hand.length === 0) {
    return 'game.noLegalReason.generic';
  }

  const myMarbles = state.marbles.filter((m) => m.color === player.color);
  const allInBase = myMarbles.length > 0 && myMarbles.every((m) => isInBase(m));
  const hasBringCard = hand.some((c) => canBringOut(c.rank));
  const ownStartBlocked = myMarbles.some((m) => isLockedOnOwnStartGate(m));

  const hasBurnCard = hand.some(
    (c) => (c.rank === 'Q' || c.rank === '10') && canBurn(c.rank)
  );
  if (hasBurnCard) {
    const activePlayers = state.players.filter((p) => p.connected || p.isBot);
    const currentIndex = activePlayers.findIndex((p) => p.id === player.id);
    const nextPlayer =
      currentIndex >= 0
        ? activePlayers[(currentIndex + 1) % activePlayers.length]
        : undefined;
    const nextCount = state.handCounts[nextPlayer?.id ?? ''] ?? 0;
    if (nextCount === 0) {
      return 'game.noLegalReason.burnUnavailable';
    }
  }

  if (allInBase && !hasBringCard) {
    return 'game.noLegalReason.allInBaseNoAceKing';
  }

  if (ownStartBlocked && hasBringCard && !startGateFreeForBringOut(state, player.color)) {
    return 'game.noLegalReason.startGateBlocked';
  }

  if (state.mode === '4p_teams' && hasTeammateMovesOnly(state, player, hand)) {
    return 'game.noLegalReason.teammateOnly';
  }

  if (hasNoExactHomeMove(state, player, hand)) {
    return 'game.noLegalReason.noExactHome';
  }

  if (!allInBase) {
    return 'game.noLegalReason.noMarbleMoves';
  }

  return 'game.noLegalReason.generic';
}

function startGateFreeForBringOut(state: GameState, color: PlayerState['color']): boolean {
  const gate = getStartGatePosition(color);
  const occupant = getMarbleAtPosition(gate, state.marbles);
  if (!occupant) return true;
  return !isLockedOnOwnStartGate(occupant);
}

function hasTeammateMovesOnly(state: GameState, player: PlayerState, hand: Card[]): boolean {
  const all = generateLegalActions(state, hand);
  if (all.length !== 1 || all[0].type !== 'burn_all_cards') return false;

  const probeHand = [...hand];
  const withoutBurn = probeHand.filter((c) => c.rank !== 'Q' && c.rank !== '10');
  if (withoutBurn.length === hand.length) return false;

  const actionsNoBurn = generateLegalActions(state, withoutBurn);
  const teammateOnly = actionsNoBurn.some((a) => {
    if (!a.marbleId) return false;
    const marble = state.marbles.find((m) => m.id === a.marbleId);
    return marble != null && marble.color !== player.color;
  });
  const ownAny = actionsNoBurn.some((a) => {
    if (a.type === 'burn_next_player') return false;
    if (!a.marbleId) return a.type === 'bring_out';
    const marble = state.marbles.find((m) => m.id === a.marbleId);
    return marble?.color === player.color;
  });
  return teammateOnly && !ownAny;
}

/** Track marbles exist but no card value can legally enter/advance home. */
function hasNoExactHomeMove(state: GameState, player: PlayerState, hand: Card[]): boolean {
  const trackMarbles = state.marbles.filter(
    (m) => m.color === player.color && isOnMainTrack(m) && !m.isFinished
  );
  if (trackMarbles.length === 0) return false;

  const forwardValues = new Set<number>();
  for (const card of hand) {
    if (canBringOut(card.rank) || card.rank === 'J' || card.rank === '4') continue;
    for (const v of getCardMoveValue(card.rank)) {
      if (v > 0) forwardValues.add(v);
    }
  }
  if (forwardValues.size === 0) return false;

  const anyForward = trackMarbles.some((marble) =>
    [...forwardValues].some((steps) => calculateForwardTarget(marble, steps, state.marbles) !== null)
  );
  if (anyForward) return false;

  const homeMarbles = state.marbles.filter(
    (m) => m.color === player.color && isInHome(m) && !m.isFinished
  );
  if (homeMarbles.length === 0) return false;

  return homeMarbles.every((marble) =>
    [...forwardValues].every(
      (steps) => calculateForwardTarget(marble, steps, state.marbles) === null
    )
  );
}
