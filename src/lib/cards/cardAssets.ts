import type { CardRank } from '../../types/game';
import type { Language } from '../i18n/translations';

/** Polished Arabic Jakaroo card art in public/assets/cards/. */
export const CARD_IMAGE_ASSETS_AVAILABLE = true;

/** PNG faces are Arabic-only; English keeps the CSS/text card layout. */
export function shouldUseCardRankImages(language: Language): boolean {
  return language === 'ar' && CARD_IMAGE_ASSETS_AVAILABLE;
}

const CARD_RANKS: CardRank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const CARD_RANK_IMAGE_SRC: Record<CardRank, string> = Object.fromEntries(
  CARD_RANKS.map((rank) => [rank, `/assets/cards/${rank}.png`])
) as Record<CardRank, string>;

/**
 * Ranks whose PNG is stored 180° from the desired hand orientation.
 * Hand view crops the top half; flip whole image when the upright half is at the bottom.
 */
export const CARD_RANK_HAND_FLIP: Partial<Record<CardRank, boolean>> = {};

export function getCardRankImageSrc(rank: CardRank): string | null {
  if (!CARD_IMAGE_ASSETS_AVAILABLE) return null;
  return CARD_RANK_IMAGE_SRC[rank] ?? null;
}

export function cardRankNeedsHandFlip(rank: CardRank): boolean {
  return CARD_RANK_HAND_FLIP[rank] === true;
}
