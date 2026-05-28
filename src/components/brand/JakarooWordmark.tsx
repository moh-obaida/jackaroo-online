import React from 'react';
import { JAKAROO_WORDMARK_ALT, JAKAROO_WORDMARK_SRC } from '../../lib/brand/assets';

type JakarooWordmarkProps = {
  className?: string;
  alt?: string;
};

/** Wide “Jakaroo Online” wordmark — home hero on desktop */
export function JakarooWordmark({
  className = '',
  alt = JAKAROO_WORDMARK_ALT,
}: JakarooWordmarkProps) {
  return (
    <img
      src={JAKAROO_WORDMARK_SRC}
      alt={alt}
      width={480}
      height={120}
      className={`jakaroo-wordmark max-w-xl w-full object-contain ${className}`}
      decoding="async"
    />
  );
}
