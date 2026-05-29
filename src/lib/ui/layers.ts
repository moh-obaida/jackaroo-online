/**
 * Z-index stack — always use these classes, never raw z-index in components.
 * Negative = under table; 10000+ = overlays only (KC-style depth discipline).
 *
 * @see docs/Z_INDEX_STACK.md
 * @see src/styles/design-tokens.css
 */
export const JKR_LAYERS = {
  deepBg: 'jkr-layer-deep-bg',
  pageGlow: 'jkr-layer-page-glow',
  underFelt: 'jkr-layer-under-felt',
  felt: 'jkr-layer-felt',
  board: 'jkr-layer-board',
  seat: 'jkr-layer-seat',
  hand: 'jkr-layer-hand',
  handTop: 'jkr-layer-hand-top',
  hud: 'jkr-layer-hud',
  siteChrome: 'jkr-layer-site-chrome',
  /** 10000+ */
  scrim: 'jkr-layer-scrim',
  modal: 'jkr-layer-modal',
  toast: 'jkr-layer-toast',
  blocking: 'jkr-layer-blocking',
  critical: 'jkr-layer-critical',
} as const;

export type JkrLayerClass = (typeof JKR_LAYERS)[keyof typeof JKR_LAYERS];
