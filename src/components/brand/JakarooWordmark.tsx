import React from 'react';
import { JAKAROO_WORDMARK_ALT, JAKAROO_WORDMARK_SRC } from '../../lib/brand/assets';

type JakarooWordmarkProps = {
  /** hero = home hero; header = site chrome; compact = tight spaces */
  variant?: 'hero' | 'header' | 'compact';
  className?: string;
  /** Set when a visible h1 provides the accessible name */
  decorative?: boolean;
};

const VARIANT_CLASS = {
  hero: 'jakaroo-wordmark--hero',
  header: 'jakaroo-wordmark--header',
  compact: 'jakaroo-wordmark--compact',
} as const;

/** Horizontal JAKAROO ONLINE wordmark — home hero and header */
export function JakarooWordmark({
  variant = 'hero',
  className = '',
  decorative = false,
}: JakarooWordmarkProps) {
  return (
    <img
      src={JAKAROO_WORDMARK_SRC}
      alt={decorative ? '' : JAKAROO_WORDMARK_ALT}
      width={variant === 'hero' ? 320 : variant === 'header' ? 140 : 180}
      height={variant === 'hero' ? 72 : variant === 'header' ? 32 : 40}
      className={`jakaroo-wordmark object-contain ${VARIANT_CLASS[variant]} ${className}`}
      decoding="async"
    />
  );
}
