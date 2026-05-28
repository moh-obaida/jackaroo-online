// ============================================================================
// BOTS MODULE — Bot AI for automated play
// Bot decisions are generated ONCE and saved to Firebase.
// ============================================================================

import { GameState, LegalAction, BotDifficulty } from '../../types/game';
import { generateLegalActions } from './legalMoves';

/**
 * Generate a bot's action choice.
 * Called ONCE by the authoritative client and saved to Firebase.
 * Returns the index of the chosen legal action.
 */
export function generateBotAction(
  state: GameState,
  difficulty: BotDifficulty
): LegalAction | null {
  const legalActions = generateLegalActions(state, []);
  if (legalActions.length === 0) return null;

  switch (difficulty) {
    case 'very_easy':
      return botVeryEasy(legalActions);
    case 'easy':
      return botEasy(legalActions, state);
    case 'normal':
      return botNormal(legalActions, state);
    case 'hard':
      return botHard(legalActions, state);
    case 'very_hard':
      return botVeryHard(legalActions, state);
    default:
      return botVeryEasy(legalActions);
  }
}

/**
 * Very Easy bot: picks a random legal action.
 */
function botVeryEasy(actions: LegalAction[]): LegalAction {
  const index = Math.floor(Math.random() * actions.length);
  return actions[index];
}

/**
 * Easy bot: prefers bring_out and move over burn.
 * TODO: Improve with basic heuristics in future versions.
 */
function botEasy(actions: LegalAction[], _state: GameState): LegalAction {
  // Prefer bring_out
  const bringOut = actions.filter((a) => a.type === 'bring_out');
  if (bringOut.length > 0) {
    return bringOut[Math.floor(Math.random() * bringOut.length)];
  }

  // Prefer moves over burns
  const moves = actions.filter((a) => a.type === 'move' || a.type === 'move_backward' || a.type === 'split_seven');
  if (moves.length > 0) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Fallback to any action
  return actions[Math.floor(Math.random() * actions.length)];
}

/**
 * Normal bot: placeholder for future improvement.
 * Currently same as Easy.
 */
function botNormal(actions: LegalAction[], state: GameState): LegalAction {
  // TODO: Add position evaluation and basic strategy
  return botEasy(actions, state);
}

/**
 * Hard bot: placeholder for future improvement.
 */
function botHard(actions: LegalAction[], state: GameState): LegalAction {
  // TODO: Add lookahead and opponent awareness
  return botEasy(actions, state);
}

/**
 * Very Hard bot: placeholder for future improvement.
 */
function botVeryHard(actions: LegalAction[], state: GameState): LegalAction {
  // TODO: Add advanced strategy with minimax or MCTS
  return botEasy(actions, state);
}
