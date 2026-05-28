// Obaida Classic card reference — UI copy keys only (no deck order).

import { CardRank } from '../../types/game';

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
  switch (rank) {
    case 'A':
      return 'A';
    case 'K':
      return '13';
    case 'Q':
      return '12';
    case 'J':
      return 'J';
    case '10':
      return '10';
    default:
      return rank;
  }
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
