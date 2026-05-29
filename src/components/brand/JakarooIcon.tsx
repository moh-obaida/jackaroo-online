import React from 'react';
import { JAKAROO_ICON_ALT, JAKAROO_ICON_SRC } from '../../lib/brand/assets';

const SIZE_CLASS = {
  sm: 'h-6 w-6',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
  fallback: 'h-16 w-16',
} as const;

type JakarooIconProps = {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  alt?: string;
  /** When true, image is decorative (parent provides accessible name). */
  decorative?: boolean;
};

/** Square brand icon — header, HUD, loading/fallback states */
export function JakarooIcon({
  size = 'md',
  className = '',
  alt = JAKAROO_ICON_ALT,
  decorative = false,
}: JakarooIconProps) {
  return (
    <img
      src={JAKAROO_ICON_SRC}
      alt={decorative ? '' : alt}
      width={size === 'fallback' ? 64 : size === 'lg' ? 48 : size === 'md' ? 36 : 24}
      height={size === 'fallback' ? 64 : size === 'lg' ? 48 : size === 'md' ? 36 : 24}
      className={`jakaroo-icon object-contain shrink-0 ${SIZE_CLASS[size]} ${className}`}
      decoding="async"
    />
  );
}
