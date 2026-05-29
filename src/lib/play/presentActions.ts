import { ActionType, Card, LegalAction } from '../../types/game';

/** UI-only grouping — does not change rules or legality. */
export type PlayPresentation =
  | { kind: 'skip'; action: LegalAction }
  | { kind: 'burn_all'; action: LegalAction }
  | { kind: 'pick_card'; playableCardIds: string[]; suggestedCardId: string | null }
  | {
      kind: 'play_card';
      cardId: string;
      primary: LegalAction | null;
      others: LegalAction[];
      hiddenCount: number;
    };

const SPECIAL_TYPES: ActionType[] = ['burn_all_cards', 'skip_no_cards'];

export function actionLabelKey(type: ActionType): string {
  switch (type) {
    case 'bring_out':
      return 'game.bringOut';
    case 'move':
      return 'game.move';
    case 'move_backward':
      return 'game.moveBackward';
    case 'swap':
      return 'game.swap';
    case 'burn_next_player':
      return 'game.burn';
    case 'split_seven':
      return 'game.split';
    case 'burn_all_cards':
      return 'game.burnAll';
    case 'skip_no_cards':
      return 'game.noCards';
    default:
      return 'game.move';
  }
}

/** Cards the player can use this turn (for hand glow). */
export function getPlayableCardIds(legalActions: LegalAction[]): string[] {
  return cardIdsWithMoves(legalActions);
}

function cardIdsWithMoves(actions: LegalAction[]): string[] {
  const ids = new Set<string>();
  for (const a of actions) {
    if (a.cardId && !SPECIAL_TYPES.includes(a.type)) ids.add(a.cardId);
  }
  return [...ids];
}

function sortByHandOrder(cardIds: string[], hand: Card[]): string[] {
  const order = new Map(hand.map((c, i) => [c.id, i]));
  return [...cardIds].sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99));
}

function actionsForCard(actions: LegalAction[], cardId: string): LegalAction[] {
  return actions.filter(
    (a) =>
      a.cardId === cardId &&
      a.type !== 'burn_all_cards' &&
      a.type !== 'skip_no_cards'
  );
}

export function presentLegalActions(
  legalActions: LegalAction[],
  selectedCardId: string | null,
  hand: Card[]
): PlayPresentation {
  const skip = legalActions.find((a) => a.type === 'skip_no_cards');
  if (skip) return { kind: 'skip', action: skip };

  const burnAll = legalActions.find((a) => a.type === 'burn_all_cards');
  if (burnAll) return { kind: 'burn_all', action: burnAll };

  const playable = sortByHandOrder(cardIdsWithMoves(legalActions), hand);
  const suggestedCardId = playable[0] ?? null;

  if (!selectedCardId) {
    return { kind: 'pick_card', playableCardIds: playable, suggestedCardId };
  }

  const burnForCard =
    legalActions.find((a) => a.type === 'burn_next_player' && a.cardId === selectedCardId) ?? null;
  let cardMoves = actionsForCard(legalActions, selectedCardId);
  if (burnForCard) {
    cardMoves = cardMoves.filter((a) => a.type !== 'burn_next_player');
  }
  const ordered = burnForCard ? [burnForCard, ...cardMoves] : cardMoves;
  const primary = ordered[0] ?? null;
  const others = ordered.slice(1);
  const collapsedVisibleCount = 1;
  const hiddenCount = Math.max(0, others.length - collapsedVisibleCount);

  return {
    kind: 'play_card',
    cardId: selectedCardId,
    primary,
    others,
    hiddenCount,
  };
}
