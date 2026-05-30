// ============================================================================
// LEGAL MOVES MODULE — Generate all legal actions for a player
// Implements Obaida Classic priority rules:
// 1. Own marbles first
// 2. Teammate marbles if no own legal move
// 3. Opponent marbles only for cards that allow it (5)
// 4. Burn all if nothing is legal
// ============================================================================

import {
  GameState,
  LegalAction,
  Marble,
  PlayerState,
  Card,
  BoardPosition,
  PlayerColor,
  SplitSevenMove,
  CustomRulesConfig,
  COLORS_ORDER,
  TEAM_ASSIGNMENTS,
} from '../../types/game';
import {
  canBringOut,
  canBurn,
  getCardMoveValue,
  isFive,
  isFour,
  isJack,
  isKing,
  isSeven,
} from './cards';
import {
  calculateBackward4,
  calculateForwardTarget,
  calculateHomeMoveForward,
  getMarbleAtPosition,
  getStartGatePosition,
  isInBase,
  isInHome,
  isLockedOnOwnStartGate,
  isOnMainTrack,
  isPathBlocked,
  getMarblesInPath,
  positionEquals,
} from './board';
import { getRulesetConfig } from './rulesets';
import { isPlayerFinished } from './win';

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

/**
 * Generate all legal actions for the current player.
 * Respects Obaida Classic priority rules.
 */
export function generateLegalActions(state: GameState, currentPlayerHand: Card[]): LegalAction[] {
  const player = state.players.find((p) => p.id === state.currentTurnPlayerId);
  if (!player) return [];
  const rulesConfig = getRulesetConfig(state.rulesetType, state.customRulesConfig ?? null);

  const hand = currentPlayerHand || [];
  const expectedCount = state.handCounts[player.id] ?? 0;
  if (hand.length === 0) {
    if (expectedCount > 0) {
      // Hand not synced yet — caller should show loading, not skip/burn-all
      return [];
    }
    return [{ type: 'skip_no_cards', cardId: '', description: 'No cards — skip turn' }];
  }

  const allActions: LegalAction[] = [];

  for (const card of hand) {
    const actions = generateActionsForCard(state, player, card, rulesConfig);
    allActions.push(...actions);
  }

  // Apply priority rules
  const prioritized = applyPriorityRules(allActions, state, player);

  if (prioritized.length === 0) {
    // No legal moves at all — burn all cards
    return [{ type: 'burn_all_cards', cardId: '', description: 'No legal moves — discard all cards' }];
  }

  return prioritized;
}

// ============================================================================
// PER-CARD ACTION GENERATION
// ============================================================================

function generateActionsForCard(
  state: GameState,
  player: PlayerState,
  card: Card,
  rulesConfig: CustomRulesConfig
): LegalAction[] {
  const actions: LegalAction[] = [];

  // Bring out (Ace, King)
  if (canBringOut(card.rank)) {
    const bringOutActions = generateBringOutActions(state, player, card);
    actions.push(...bringOutActions);
  }

  // Normal movement
  if (!isJack(card.rank)) {
    const moveActions = generateMoveActions(state, player, card, rulesConfig);
    actions.push(...moveActions);
  }

  // Jack swap
  if (isJack(card.rank)) {
    const swapActions = generateSwapActions(state, player, card);
    actions.push(...swapActions);
  }

  // Seven split
  if (isSeven(card.rank)) {
    const splitActions = generateSplitSevenActions(state, player, card);
    actions.push(...splitActions);
  }

  // Burn (Queen, 10)
  if (isBurnEnabledByRules(card.rank, rulesConfig)) {
    const burnActions = generateBurnActions(state, player, card);
    actions.push(...burnActions);
  }

  return actions;
}

// ============================================================================
// BRING OUT
// ============================================================================

function generateBringOutActions(
  state: GameState,
  player: PlayerState,
  card: Card
): LegalAction[] {
  const actions: LegalAction[] = [];
  const moveColor = getActingMoveColor(state, player);
  const playerMarbles = state.marbles.filter((m) => m.color === moveColor);
  const baseMarbles = playerMarbles.filter((m) => isInBase(m));

  if (baseMarbles.length === 0) return actions;

  const startGate = getStartGatePosition(moveColor);
  const marbleOnStartGate = getMarbleAtPosition(startGate, state.marbles);

  // Can't bring out if own marble is already on start/gate (locked)
  if (marbleOnStartGate && marbleOnStartGate.color === moveColor) {
    return actions;
  }

  // Can bring out — will eat any non-locked marble on start/gate
  const firstBaseMarble = baseMarbles[0];
  actions.push({
    type: 'bring_out',
    cardId: card.id,
    marbleId: firstBaseMarble.id,
    targetPosition: startGate,
    description: `Bring marble out to start`,
  });

  return actions;
}

// ============================================================================
// NORMAL MOVEMENT
// ============================================================================

function generateMoveActions(
  state: GameState,
  player: PlayerState,
  card: Card,
  rulesConfig: CustomRulesConfig
): LegalAction[] {
  const actions: LegalAction[] = [];
  const values = getCardMoveValue(card.rank);

  // Special handling for 4 (backward)
  if (isFour(card.rank)) {
    return generateBackward4Actions(state, player, card);
  }

  // Special handling for 5 (move anyone eligible)
  if (isFive(card.rank) && rulesConfig.fiveCanMoveAnyone) {
    return generateFiveMoveActions(state, player, card);
  }

  // Special handling for 7 (full 7 as single move is handled here, split is separate)
  // King has path eating

  for (const value of values) {
    if (value <= 0) continue; // Skip negative (4 is handled separately)

    // Get eligible marbles
    const eligibleMarbles = getEligibleMarblesForMove(state, player, card.rank);

    for (const marble of eligibleMarbles) {
      // Try forward movement
      const target = calculateForwardTarget(marble, value, state.marbles);
      if (target) {
        // For King: check path eating
        if (isKing(card.rank) && value === 13) {
          // King path eating - check if path is blocked by locked start/gate
          if (!isPathBlocked(marble.position, value, state.marbles, marble.id)) {
            const eaten = getMarblesInPath(marble.position, value, state.marbles, marble.id);
            const desc = eaten.length > 0
              ? `Move King 13, eating ${eaten.length} marble(s) in path`
              : `Move King 13`;
            actions.push({
              type: 'move',
              cardId: card.id,
              marbleId: marble.id,
              targetPosition: target,
              description: desc,
            });
          }
        } else {
          actions.push({
            type: 'move',
            cardId: card.id,
            marbleId: marble.id,
            targetPosition: target,
            description: `Move ${card.rank} (${value} steps)`,
          });
        }
      }

      // Try home movement for marbles already in home (e.g., 7 split, or advancing in home)
      if (isInHome(marble) && !marble.isFinished) {
        const homeTarget = calculateHomeMoveForward(marble, value, state.marbles);
        if (homeTarget) {
          actions.push({
            type: 'move',
            cardId: card.id,
            marbleId: marble.id,
            targetPosition: homeTarget,
            description: `Advance in home (${value} steps)`,
          });
        }
      }
    }
  }

  return actions;
}

// ============================================================================
// BACKWARD 4
// ============================================================================

function generateBackward4Actions(
  state: GameState,
  player: PlayerState,
  card: Card
): LegalAction[] {
  const actions: LegalAction[] = [];
  const moveColor = getActingMoveColor(state, player);
  const playerMarbles = state.marbles.filter(
    (m) => m.color === moveColor && isOnMainTrack(m) && !m.isFinished
  );

  for (const marble of playerMarbles) {
    const target = calculateBackward4(marble, state.marbles);
    if (target) {
      actions.push({
        type: 'move_backward',
        cardId: card.id,
        marbleId: marble.id,
        targetPosition: target,
        description: isLockedOnOwnStartGate(marble)
          ? 'Move backward 4 from start toward home'
          : 'Move backward 4',
      });
    }
  }

  return actions;
}

// ============================================================================
// FIVE — Move anyone eligible
// ============================================================================

function generateFiveMoveActions(
  state: GameState,
  player: PlayerState,
  card: Card
): LegalAction[] {
  const actions: LegalAction[] = [];

  // 5 can move any one eligible marble 5 spaces
  // Cannot move: base, home, finished, locked start/gate
  // Priority: own > teammate > opponent

  const allEligible = state.marbles.filter(
    (m) =>
      isOnMainTrack(m) &&
      !m.isFinished &&
      !isLockedOnOwnStartGate(m) &&
      !isInHome(m)
  );

  for (const marble of allEligible) {
    const target = calculateForwardTarget(marble, 5, state.marbles);
    if (target && target.type !== 'home') {
      // 5 cannot move marbles into home
      const ownership = getMarbleOwnership(marble, player, state);
      actions.push({
        type: 'move',
        cardId: card.id,
        marbleId: marble.id,
        targetPosition: target,
        description: `Move 5 (${ownership} marble)`,
      });
    }
  }

  return actions;
}

// ============================================================================
// JACK SWAP
// ============================================================================

function generateSwapActions(
  state: GameState,
  player: PlayerState,
  card: Card
): LegalAction[] {
  const actions: LegalAction[] = [];

  // Jack swaps any two eligible active marbles on main track
  // Cannot swap: base, home, finished, locked start/gate
  const eligible = state.marbles.filter(
    (m) =>
      isOnMainTrack(m) &&
      !m.isFinished &&
      !isLockedOnOwnStartGate(m)
  );

  // Generate all pairs
  for (let i = 0; i < eligible.length; i++) {
    for (let j = i + 1; j < eligible.length; j++) {
      actions.push({
        type: 'swap',
        cardId: card.id,
        swapMarbleId1: eligible[i].id,
        swapMarbleId2: eligible[j].id,
        description: `Swap ${eligible[i].color} and ${eligible[j].color} marbles`,
      });
    }
  }

  return actions;
}

// ============================================================================
// SEVEN SPLIT
// ============================================================================

function generateSplitSevenActions(
  state: GameState,
  player: PlayerState,
  card: Card
): LegalAction[] {
  const actions: LegalAction[] = [];

  // 7 can be used as full 7 by one marble (handled in normal move)
  // Or split between multiple marbles (must use all 7, no waste)
  // Split cannot mix own and teammate marbles

  const moveColor = getActingMoveColor(state, player);
  const ownMarbles = state.marbles.filter(
    (m) => m.color === moveColor && (isOnMainTrack(m) || isInHome(m)) && !m.isFinished
  );

  // Generate valid splits for acting color marbles
  const ownSplits = generateSplitCombinations(ownMarbles, 7, state);
  for (const split of ownSplits) {
    actions.push({
      type: 'split_seven',
      cardId: card.id,
      splitMoves: split,
      description: `Split 7: ${split.map((s) => `${s.steps}`).join('+')}`,
    });
  }

  // If no splits on acting color and player still has own marbles, try teammate
  if (ownSplits.length === 0 && state.mode === '4p_teams' && moveColor === player.color) {
    const teammate = getTeammate(player, state);
    if (teammate) {
      const teamMarbles = state.marbles.filter(
        (m) => m.color === teammate.color && (isOnMainTrack(m) || isInHome(m)) && !m.isFinished
      );
      const teamSplits = generateSplitCombinations(teamMarbles, 7, state);
      for (const split of teamSplits) {
        actions.push({
          type: 'split_seven',
          cardId: card.id,
          splitMoves: split,
          description: `Split 7 (teammate): ${split.map((s) => `${s.steps}`).join('+')}`,
        });
      }
    }
  }

  return actions;
}

/**
 * Generate valid split combinations that sum to totalSteps.
 * Each marble can be used at most once.
 * Returns arrays of SplitSevenMove.
 */
function generateSplitCombinations(
  marbles: Marble[],
  totalSteps: number,
  state: GameState
): SplitSevenMove[][] {
  const results: SplitSevenMove[][] = [];
  if (marbles.length < 2) return results;

  // Limit to reasonable combinations to avoid explosion
  // Try 2-marble splits (most common)
  for (let i = 0; i < marbles.length; i++) {
    for (let j = i + 1; j < marbles.length; j++) {
      for (let steps1 = 1; steps1 < totalSteps; steps1++) {
        const steps2 = totalSteps - steps1;
        if (steps2 < 1) continue;

        // Check if marble i can move steps1 and marble j can move steps2
        const valid1 = canMarbleMoveSteps(marbles[i], steps1, state);
        const valid2 = canMarbleMoveSteps(marbles[j], steps2, state);

        if (valid1 && valid2) {
          results.push([
            { marbleId: marbles[i].id, steps: steps1 },
            { marbleId: marbles[j].id, steps: steps2 },
          ]);
        }
      }
    }
  }

  // Try 3-marble splits if needed
  if (results.length === 0 && marbles.length >= 3) {
    for (let i = 0; i < marbles.length; i++) {
      for (let j = i + 1; j < marbles.length; j++) {
        for (let k = j + 1; k < marbles.length; k++) {
          for (let s1 = 1; s1 <= totalSteps - 2; s1++) {
            for (let s2 = 1; s2 <= totalSteps - s1 - 1; s2++) {
              const s3 = totalSteps - s1 - s2;
              if (s3 < 1) continue;

              const v1 = canMarbleMoveSteps(marbles[i], s1, state);
              const v2 = canMarbleMoveSteps(marbles[j], s2, state);
              const v3 = canMarbleMoveSteps(marbles[k], s3, state);

              if (v1 && v2 && v3) {
                results.push([
                  { marbleId: marbles[i].id, steps: s1 },
                  { marbleId: marbles[j].id, steps: s2 },
                  { marbleId: marbles[k].id, steps: s3 },
                ]);
              }
            }
          }
        }
      }
    }
  }

  return results;
}

function canMarbleMoveSteps(marble: Marble, steps: number, state: GameState): boolean {
  if (isInHome(marble)) {
    return calculateHomeMoveForward(marble, steps, state.marbles) !== null;
  }
  if (isOnMainTrack(marble)) {
    return calculateForwardTarget(marble, steps, state.marbles) !== null;
  }
  return false;
}

// ============================================================================
// BURN (Queen/10)
// ============================================================================

function generateBurnActions(
  state: GameState,
  player: PlayerState,
  card: Card
): LegalAction[] {
  const actions: LegalAction[] = [];

  // Find next player in turn order
  const nextPlayer = getNextPlayer(player, state);
  if (!nextPlayer) return actions;

  // Check if next player has cards
  const nextPlayerCount = state.handCounts[nextPlayer.id] || 0;
  if (nextPlayerCount === 0) return actions;

  actions.push({
    type: 'burn_next_player',
    cardId: card.id,
    burnTargetPlayerId: nextPlayer.id,
    description: `Burn next player's random card (${card.rank})`,
  });

  return actions;
}

// ============================================================================
// PRIORITY RULES
// ============================================================================

function applyPriorityRules(
  actions: LegalAction[],
  state: GameState,
  player: PlayerState
): LegalAction[] {
  if (actions.length === 0) return [];

  const actingColor = getActingMoveColor(state, player);

  // Separate actions by category
  const ownMoveActions = actions.filter((a) => {
    if (a.type === 'burn_next_player') return false;
    if (a.type === 'swap') return true; // Swaps are always available
    if (a.type === 'split_seven') {
      // Check if split uses acting color marbles
      if (!a.splitMoves) return false;
      return a.splitMoves.every((sm) => {
        const marble = state.marbles.find((m) => m.id === sm.marbleId);
        return marble?.color === actingColor;
      });
    }
    if (a.marbleId) {
      const marble = state.marbles.find((m) => m.id === a.marbleId);
      return marble?.color === actingColor;
    }
    return true;
  });

  const burnActions = actions.filter((a) => a.type === 'burn_next_player');

  const teammateMoveActions = actions.filter((a) => {
    if (a.type === 'burn_next_player' || a.type === 'swap') return false;
    if (a.type === 'split_seven') {
      if (!a.splitMoves) return false;
      return a.splitMoves.some((sm) => {
        const marble = state.marbles.find((m) => m.id === sm.marbleId);
        return marble?.color !== player.color;
      });
    }
    if (a.marbleId) {
      const marble = state.marbles.find((m) => m.id === a.marbleId);
      if (!marble) return false;
      return marble.color !== player.color && isTeammate(marble.color, player, state);
    }
    return false;
  });

  const opponentMoveActions = actions.filter((a) => {
    if (a.type !== 'move' || !a.marbleId) return false;
    const marble = state.marbles.find((m) => m.id === a.marbleId);
    if (!marble) return false;
    return marble.color !== player.color && !isTeammate(marble.color, player, state);
  });

  // Priority logic:
  // 1. If own moves exist (excluding burn), player must use own moves
  if (ownMoveActions.length > 0) {
    return ownMoveActions;
  }

  // 2. If no own moves, teammate moves and burn are both allowed
  if (teammateMoveActions.length > 0) {
    return [...teammateMoveActions, ...burnActions];
  }

  // 3. If no own/teammate moves, opponent 5-moves and burn are both allowed
  if (opponentMoveActions.length > 0) {
    return [...opponentMoveActions, ...burnActions];
  }

  // 4. Only burn actions available
  if (burnActions.length > 0) {
    return burnActions;
  }

  return [];
}

// ============================================================================
// HELPERS
// ============================================================================

function getEligibleMarblesForMove(
  state: GameState,
  player: PlayerState,
  cardRank: string
): Marble[] {
  const moveColor = getActingMoveColor(state, player);
  const playerMarbles = state.marbles.filter(
    (m) => m.color === moveColor && !m.isFinished
  );

  // Filter based on card type
  return playerMarbles.filter((m) => {
    if (isInBase(m)) return false;
    if (isLockedOnOwnStartGate(m) && cardRank !== '4') return false;
    return true;
  });
}

function getNextPlayer(player: PlayerState, state: GameState): PlayerState | undefined {
  const activePlayers = state.players.filter((p) => p.connected || p.isBot);
  const currentIndex = activePlayers.findIndex((p) => p.id === player.id);
  if (currentIndex === -1) return undefined;
  return activePlayers[(currentIndex + 1) % activePlayers.length];
}

function getTeammate(player: PlayerState, state: GameState): PlayerState | undefined {
  if (state.mode !== '4p_teams') return undefined;
  return state.players.find(
    (p) => p.id !== player.id && p.team === player.team
  );
}

function isTeammate(color: PlayerColor, player: PlayerState, state: GameState): boolean {
  if (state.mode !== '4p_teams') return false;
  const otherPlayer = state.players.find((p) => p.color === color);
  return otherPlayer?.team === player.team && otherPlayer?.id !== player.id;
}

function getMarbleOwnership(
  marble: Marble,
  player: PlayerState,
  state: GameState
): string {
  const actingColor = getActingMoveColor(state, player);
  if (marble.color === actingColor) return 'own';
  if (isTeammate(marble.color, player, state)) return 'teammate';
  return 'opponent';
}

/** Color whose marbles the current player moves (teammate when finished in team mode). */
function getActingMoveColor(state: GameState, player: PlayerState): PlayerColor {
  if (state.mode === '4p_teams' && isPlayerFinished(state, player.id)) {
    const teammate = getTeammate(player, state);
    if (teammate) return teammate.color;
  }
  return player.color;
}

function isBurnEnabledByRules(rank: Card['rank'], rulesConfig: CustomRulesConfig): boolean {
  if (rank === 'Q') return rulesConfig.queenBurnEnabled;
  if (rank === '10') return rulesConfig.tenBurnEnabled;
  return canBurn(rank);
}
