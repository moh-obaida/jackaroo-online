// ============================================================================
// APPLY ACTION MODULE — Apply validated actions to game state
// Returns new state (immutable). All mutations saved to Firebase.
// ============================================================================

import {
  GameState,
  GameAction,
  GameEvent,
  Marble,
  BoardPosition,
  HOME_LENGTH,
  CardRank,
} from '../../types/game';
import {
  getMarbleAtPosition,
  getMarblesInPath,
  isLockedOnOwnStartGate,
  isOnMainTrack,
  positionEquals,
  calculateForwardTarget as calculateForwardTargetFn,
} from './board';
import { isKing } from './cards';

/**
 * Apply a validated game action to the state.
 * Returns the new game state.
 * All randomness (e.g., burned card index) is pre-computed and included in the action.
 */
export function applyAction(state: GameState, action: GameAction, privateHands: Record<string, any[]>): { state: GameState; privateHands: Record<string, any[]> } {
  let newState = { ...state };
  let updatedHands = { ...privateHands };

  switch (action.type) {
    case 'bring_out':
      newState = applyBringOut(newState, action);
      break;
    case 'move':
      newState = applyMove(newState, action);
      break;
    case 'move_backward':
      newState = applyMoveBackward(newState, action);
      break;
    case 'split_seven':
      newState = applySplitSeven(newState, action);
      break;
    case 'swap':
      newState = applySwap(newState, action);
      break;
    case 'burn_next_player':
      ({ state: newState, privateHands: updatedHands } = applyBurn(newState, action, updatedHands));
      break;
    case 'burn_all_cards':
      ({ state: newState, privateHands: updatedHands } = applyBurnAll(newState, action, updatedHands));
      break;
    case 'skip_no_cards':
      // Just advance turn
      break;
  }

  // Remove played card from hand (except burn_all and skip)
  if (action.cardId && action.type !== 'burn_all_cards' && action.type !== 'skip_no_cards') {
    ({ state: newState, privateHands: updatedHands } = removeCardFromHand(newState, updatedHands, action.playerId, action.cardId));
  }

  // Add event to log
  newState = addEvent(newState, action);

  // Advance turn
  newState = advanceTurn(newState);

  // Check win condition
  newState = checkWinCondition(newState);

  return { state: newState, privateHands: updatedHands };
}

// ============================================================================
// ACTION IMPLEMENTATIONS
// ============================================================================

function applyBringOut(state: GameState, action: GameAction): GameState {
  if (!action.marbleId || !action.targetPosition) return state;

  const marbles = [...state.marbles];
  const marbleIndex = marbles.findIndex((m) => m.id === action.marbleId);
  if (marbleIndex === -1) return state;

  // Check if there's a marble on the start/gate to eat
  const existingMarble = getMarbleAtPosition(action.targetPosition, marbles, action.marbleId);
  if (existingMarble && !isLockedOnOwnStartGate(existingMarble)) {
    // Eat it — send back to base
    const eatIndex = marbles.findIndex((m) => m.id === existingMarble.id);
    if (eatIndex !== -1) {
      marbles[eatIndex] = {
        ...marbles[eatIndex],
        position: { color: existingMarble.color, type: 'base', index: getNextBaseIndex(marbles, existingMarble.color) },
      };
    }
  }

  // Place marble on start/gate
  marbles[marbleIndex] = {
    ...marbles[marbleIndex],
    position: action.targetPosition,
  };

  return { ...state, marbles };
}

function applyMove(state: GameState, action: GameAction): GameState {
  if (!action.marbleId || !action.targetPosition) return state;

  const marbles = [...state.marbles];
  const marbleIndex = marbles.findIndex((m) => m.id === action.marbleId);
  if (marbleIndex === -1) return state;

  const marble = marbles[marbleIndex];
  const card = action.cardId ? findCardInHands(state, action.cardId, updatedHands) : null;

  // King path eating
  if (card && isKing(card.rank) && isOnMainTrack(marble)) {
    const steps = 13;
    const eatenMarbles = getMarblesInPath(marble.position, steps, marbles, marble.id);
    for (const eaten of eatenMarbles) {
      const eatIdx = marbles.findIndex((m) => m.id === eaten.id);
      if (eatIdx !== -1) {
        marbles[eatIdx] = {
          ...marbles[eatIdx],
          position: { color: eaten.color, type: 'base', index: getNextBaseIndex(marbles, eaten.color) },
        };
      }
    }
  }

  // Check if landing on a marble (eating)
  if (action.targetPosition.type !== 'home') {
    const targetMarble = getMarbleAtPosition(action.targetPosition, marbles, action.marbleId);
    if (targetMarble && !isLockedOnOwnStartGate(targetMarble)) {
      const eatIdx = marbles.findIndex((m) => m.id === targetMarble.id);
      if (eatIdx !== -1) {
        marbles[eatIdx] = {
          ...marbles[eatIdx],
          position: { color: targetMarble.color, type: 'base', index: getNextBaseIndex(marbles, targetMarble.color) },
        };
      }
    }
  }

  // Move marble to target
  const isFinished = action.targetPosition.type === 'home' &&
    action.targetPosition.index === HOME_LENGTH - 1;

  marbles[marbleIndex] = {
    ...marbles[marbleIndex],
    position: action.targetPosition,
    isFinished,
  };

  return { ...state, marbles };
}

function applyMoveBackward(state: GameState, action: GameAction): GameState {
  if (!action.marbleId || !action.targetPosition) return state;

  const marbles = [...state.marbles];
  const marbleIndex = marbles.findIndex((m) => m.id === action.marbleId);
  if (marbleIndex === -1) return state;

  // Check if landing on a marble on the main track (eating)
  if (action.targetPosition.type !== 'home') {
    const targetMarble = getMarbleAtPosition(action.targetPosition, marbles, action.marbleId);
    if (targetMarble && !isLockedOnOwnStartGate(targetMarble)) {
      const eatIdx = marbles.findIndex((m) => m.id === targetMarble.id);
      if (eatIdx !== -1) {
        marbles[eatIdx] = {
          ...marbles[eatIdx],
          position: { color: targetMarble.color, type: 'base', index: getNextBaseIndex(marbles, targetMarble.color) },
        };
      }
    }
  }

  // Move marble
  const isFinished = action.targetPosition.type === 'home' &&
    action.targetPosition.index === HOME_LENGTH - 1;

  marbles[marbleIndex] = {
    ...marbles[marbleIndex],
    position: action.targetPosition,
    isFinished,
  };

  return { ...state, marbles };
}

function applySplitSeven(state: GameState, action: GameAction): GameState {
  if (!action.splitMoves || action.splitMoves.length === 0) return state;

  let marbles = [...state.marbles];

  for (const splitMove of action.splitMoves) {
    const marbleIndex = marbles.findIndex((m) => m.id === splitMove.marbleId);
    if (marbleIndex === -1) continue;

    const marble = marbles[marbleIndex];
    let targetPos: BoardPosition | null = null;

    if (marble.position.type === 'home') {
      // Move within home
      const targetIndex = marble.position.index + splitMove.steps;
      if (targetIndex < HOME_LENGTH) {
        targetPos = { color: marble.color, type: 'home', index: targetIndex };
      }
    } else {
      // Move on main track (may enter home)
      targetPos = calculateForwardTargetFn(marble, splitMove.steps, marbles);
    }

    if (targetPos) {
      // Eat if landing on main track marble
      if (targetPos.type !== 'home') {
        const targetMarble = getMarbleAtPosition(targetPos, marbles, marble.id);
        if (targetMarble && !isLockedOnOwnStartGate(targetMarble)) {
          const eatIdx = marbles.findIndex((m) => m.id === targetMarble.id);
          if (eatIdx !== -1) {
            marbles[eatIdx] = {
              ...marbles[eatIdx],
              position: { color: targetMarble.color, type: 'base', index: getNextBaseIndex(marbles, targetMarble.color) },
            };
          }
        }
      }

      const isFinished = targetPos.type === 'home' && targetPos.index === HOME_LENGTH - 1;
      marbles[marbleIndex] = {
        ...marbles[marbleIndex],
        position: targetPos,
        isFinished,
      };
    }
  }

  return { ...state, marbles };
}

function applySwap(state: GameState, action: GameAction): GameState {
  if (!action.swapMarbleId1 || !action.swapMarbleId2) return state;

  const marbles = [...state.marbles];
  const idx1 = marbles.findIndex((m) => m.id === action.swapMarbleId1);
  const idx2 = marbles.findIndex((m) => m.id === action.swapMarbleId2);
  if (idx1 === -1 || idx2 === -1) return state;

  const pos1 = marbles[idx1].position;
  const pos2 = marbles[idx2].position;

  marbles[idx1] = { ...marbles[idx1], position: pos2 };
  marbles[idx2] = { ...marbles[idx2], position: pos1 };

  return { ...state, marbles };
}

function applyBurn(state: GameState, action: GameAction, privateHands: Record<string, any[]>): { state: GameState; privateHands: Record<string, any[]> } {
  if (!action.burnTargetPlayerId) return { state, privateHands };

  const hands = { ...privateHands };
  const targetHand = [...(hands[action.burnTargetPlayerId] || [])];

  if (targetHand.length === 0) return { state, privateHands };

  const burnIndex = action.burnCardIndex ?? -1;
  if (burnIndex < 0 || burnIndex >= targetHand.length) return { state, privateHands };
  const burnedCard = targetHand[burnIndex];

  // Remove from hand
  targetHand.splice(burnIndex, 1);
  hands[action.burnTargetPlayerId] = targetHand;

  // Add to discard pile
  const discardPile = [...state.discardPile, burnedCard];

  const handCounts = { ...state.handCounts, [action.playerId]: 0 };
  return { state: { ...state, handCounts, discardPile }, privateHands: hands };
}

function applyBurnAll(state: GameState, action: GameAction, privateHands: Record<string, any[]>): { state: GameState; privateHands: Record<string, any[]> } {
  const hands = { ...privateHands };
  const playerHand = hands[action.playerId] || [];

  // Move all cards to discard
  const discardPile = [...state.discardPile, ...playerHand];
  hands[action.playerId] = [];

  const handCounts = { ...state.handCounts, [action.playerId]: 0 };
  return { state: { ...state, handCounts, discardPile }, privateHands: hands };
}

// ============================================================================
// HELPERS
// ============================================================================

function removeCardFromHand(state: GameState, privateHands: Record<string, any[]>, playerId: string, cardId: string): { state: GameState; privateHands: Record<string, any[]> } {
  const hands = { ...privateHands };
  const hand = [...(hands[playerId] || [])];
  const cardIndex = hand.findIndex((c) => c.id === cardId);
  if (cardIndex !== -1) {
    const removedCard = hand.splice(cardIndex, 1)[0];
    hands[playerId] = hand;
    const handCounts = { ...state.handCounts, [playerId]: hand.length };
    return { state: { ...state, handCounts, discardPile: [...state.discardPile, removedCard] }, privateHands: hands };
  }
  return { state, privateHands: hands };
}

function getNextBaseIndex(marbles: Marble[], color: string): number {
  const baseMarbles = marbles.filter(
    (m) => m.color === color && m.position.type === 'base'
  );
  const usedIndices = baseMarbles.map((m) => m.position.index);
  for (let i = 0; i < 4; i++) {
    if (!usedIndices.includes(i)) return i;
  }
  return 0;
}

function findCardInHands(state: GameState, cardId: string, privateHands: Record<string, any[]>): { rank: CardRank } | null {
  for (const hand of Object.values(privateHands)) {
    const card = hand.find((c) => c.id === cardId);
    if (card) return card;
  }
  // Also check discard pile
  const discardCard = state.discardPile.find((c) => c.id === cardId);
  if (discardCard) return discardCard;
  return null;
}

function advanceTurn(state: GameState): GameState {
  const activePlayers = state.players.filter((p) => p.connected || p.isBot);
  const currentIndex = activePlayers.findIndex((p) => p.id === state.currentTurnPlayerId);
  if (currentIndex === -1) return state;

  let nextIndex = (currentIndex + 1) % activePlayers.length;
  const nextPlayer = activePlayers[nextIndex];

  return {
    ...state,
    currentTurnPlayerId: nextPlayer.id,
    currentSeat: nextPlayer.seat,
    turnNumber: state.turnNumber + 1,
  };
}

function checkWinCondition(state: GameState): GameState {
  if (state.mode === '4p_teams') {
    // Check if all 8 marbles of a team are finished
    for (const team of ['A', 'B'] as const) {
      const teamPlayers = state.players.filter((p) => p.team === team);
      const teamColors = teamPlayers.map((p) => p.color);
      const teamMarbles = state.marbles.filter((m) => teamColors.includes(m.color));
      if (teamMarbles.every((m) => m.isFinished)) {
        return {
          ...state,
          winner: {
            winnerTeam: team,
            winnerPlayerIds: teamPlayers.map((p) => p.id),
          },
        };
      }
    }
  } else {
    // Solo modes: check if any player's 4 marbles are all finished
    for (const player of state.players) {
      const playerMarbles = state.marbles.filter((m) => m.color === player.color);
      if (playerMarbles.every((m) => m.isFinished)) {
        return {
          ...state,
          winner: {
            winnerPlayerId: player.id,
            winnerPlayerIds: [player.id],
          },
        };
      }
    }
  }

  return state;
}

function addEvent(state: GameState, action: GameAction): GameState {
  const event: GameEvent = {
    id: `event_${state.turnNumber}_${Date.now()}`,
    timestamp: Date.now(),
    type: mapActionToEventType(action.type),
    playerId: action.playerId,
    description: getEventDescription(action, state),
  };

  return {
    ...state,
    eventLog: [...state.eventLog, event],
  };
}

function mapActionToEventType(actionType: string): GameEvent['type'] {
  switch (actionType) {
    case 'bring_out': return 'bring_out';
    case 'move': return 'move';
    case 'move_backward': return 'move';
    case 'split_seven': return 'move';
    case 'swap': return 'swap';
    case 'burn_next_player': return 'burn';
    case 'burn_all_cards': return 'burn_all';
    case 'skip_no_cards': return 'skip';
    default: return 'move';
  }
}

function getEventDescription(action: GameAction, state: GameState): string {
  const player = state.players.find((p) => p.id === action.playerId);
  const name = player?.name || 'Unknown';

  switch (action.type) {
    case 'bring_out': return `${name} brought a marble out`;
    case 'move': return `${name} moved a marble`;
    case 'move_backward': return `${name} moved backward 4`;
    case 'split_seven': return `${name} split 7`;
    case 'swap': return `${name} swapped two marbles`;
    case 'burn_next_player': return `${name} burned the next player's card`;
    case 'burn_all_cards': return `${name} discarded all cards (no legal moves)`;
    case 'skip_no_cards': return `${name} skipped (no cards)`;
    default: return `${name} performed an action`;
  }
}
