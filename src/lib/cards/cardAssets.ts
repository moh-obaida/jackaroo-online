import type { CardRank } from '../../types/game';

/**
 * Card image assets — not present in repo yet.
 *
 * Gameplay uses the premium CSS fallback in CardFace (see src/styles/cards.css).
 * When PNG/SVG art is added, place files under public/assets/cards/ and map ranks here.
 */

export const CARD_IMAGE_ASSETS_AVAILABLE = false;

/** Future: `/assets/cards/{rank}.png` once art is checked in. */
export const CARD_RANK_IMAGE_SRC: Partial<Record<CardRank, string>> = {};

export function getCardRankImageSrc(_rank: CardRank): string | null {
  if (!CARD_IMAGE_ASSETS_AVAILABLE) return null;
  return null;
}

if (import.meta.env.DEV && !CARD_IMAGE_ASSETS_AVAILABLE) {
  console.info('[cards] No polished card image assets in public/assets/cards/ — using CSS card faces.');
}
