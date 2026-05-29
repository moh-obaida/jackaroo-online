// Obaida Classic card reference — UI copy keys only (no deck order).

import { CardRank } from '../../types/game';
import { getCardCenterValue as getFaceCenterValue } from './cardFaceContent';

export const CARD_GUIDE_ORDER: CardRank[] = [
  'A',
  'K',
  'Q',
  'J',
  '10',
  '9',
  '8',
  '7',
  '6',
  '5',
  '4',
  '3',
  '2',
];

/** Large center value shown on the card face (Jackaroo style). */
export function getCardCenterValue(rank: CardRank): string {
  return getFaceCenterValue(rank, 'guide');
}

/** i18n key for short action hint under the card in hand. */
export function getCardHintKey(rank: CardRank): string {
  return `game.card.hint.${rank}`;
}

/** i18n keys for full guide bullet lines (one key per line). */
export function getCardGuideActionKeys(rank: CardRank): string[] {
  const prefix = `deckGuide.${rank}`;
  switch (rank) {
    case 'A':
      return [`${prefix}.0`, `${prefix}.1`, `${prefix}.2`];
    case 'K':
      return [`${prefix}.0`, `${prefix}.1`, `${prefix}.2`, `${prefix}.3`, `${prefix}.4`];
    case 'Q':
      return [`${prefix}.0`, `${prefix}.1`];
    case 'J':
      return [`${prefix}.0`, `${prefix}.1`];
    case '10':
      return [`${prefix}.0`, `${prefix}.1`];
    case '7':
      return [`${prefix}.0`, `${prefix}.1`, `${prefix}.2`, `${prefix}.3`];
    case '5':
      return [`${prefix}.0`, `${prefix}.1`, `${prefix}.2`, `${prefix}.3`];
    case '4':
      return [`${prefix}.0`, `${prefix}.1`];
    default:
      return [`${prefix}.0`];
  }
}

export function getCardGuideTitleKey(rank: CardRank): string {
  return `deckGuide.${rank}.title`;
}

/** Primary action line for card face (Jackaroo-style, matches physical deck layout). */
export function getCardFaceActionKey(rank: CardRank): string {
  const keys = getCardGuideActionKeys(rank);
  return keys[0] ?? `deckGuide.${rank}.0`;
}

/** Corner label: standard rank letter (K, Q, J) plus numeric center when different. */
export function getCardCornerLabel(rank: CardRank): string {
  return rank;
}
