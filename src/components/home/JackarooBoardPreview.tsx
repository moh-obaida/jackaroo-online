import React from 'react';

type JackarooBoardPreviewProps = {
  className?: string;
  variant?: 'hero' | 'watermark';
};

const SEAT_COLORS = ['black', 'green', 'blue', 'white'] as const;
const COLOR_FILL: Record<(typeof SEAT_COLORS)[number], string> = {
  black: '#2f3135',
  green: '#2f9b5f',
  blue: '#2d63d8',
  white: '#eee7d8',
};

function MiniBoardSvg() {
  const track = [
    [82, 34], [112, 24], [146, 22], [180, 34], [206, 60], [218, 92],
    [218, 128], [206, 160], [180, 186], [146, 198], [112, 196], [82, 186],
    [56, 160], [44, 128], [44, 92], [56, 60],
  ];
  const home = {
    black: [[131, 52], [131, 70], [131, 88], [131, 106]],
    green: [[188, 110], [170, 110], [152, 110], [134, 110]],
    blue: [[131, 168], [131, 150], [131, 132], [131, 114]],
    white: [[74, 110], [92, 110], [110, 110], [128, 110]],
  } as const;
  const nests = {
    black: [[74, 56], [88, 50], [74, 70], [90, 66]],
    green: [[188, 56], [174, 50], [188, 70], [172, 66]],
    blue: [[188, 164], [174, 158], [188, 178], [172, 174]],
    white: [[74, 164], [88, 158], [74, 178], [90, 174]],
  } as const;

  return (
    <svg viewBox="0 0 262 220" className="w-full h-full" role="img" aria-label="Digital Jackaroo board preview">
      <defs>
        <linearGradient id="previewWood" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#8a5c33" />
          <stop offset="0.48" stopColor="#4f3218" />
          <stop offset="1" stopColor="#160d07" />
        </linearGradient>
        <radialGradient id="previewFelt" cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#185b38" />
          <stop offset="1" stopColor="#062015" />
        </radialGradient>
        <filter id="previewShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>
      <polygon
        points="60,12 202,12 250,62 250,158 202,208 60,208 12,158 12,62"
        fill="url(#previewWood)"
        stroke="#c99b38"
        strokeWidth="3"
        filter="url(#previewShadow)"
      />
      <polygon
        points="78,36 184,36 226,76 226,144 184,184 78,184 36,144 36,76"
        fill="url(#previewFelt)"
        stroke="#d4af37"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      <polygon points="112,78 150,78 166,96 166,124 150,142 112,142 96,124 96,96" fill="#f4efe3" opacity="0.9" stroke="#9f8454" />
      <text x="131" y="114" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7d641d" letterSpacing="1.8">JAKAROO</text>
      {track.map(([x, y], index) => (
        <circle key={`track-${index}`} cx={x} cy={y} r="5.5" fill="#d9c79e" stroke="#5c4325" strokeWidth="1" />
      ))}
      {Object.entries(home).map(([color, pts]) =>
        pts.map(([x, y], index) => (
          <circle key={`${color}-home-${index}`} cx={x} cy={y} r="5" fill="#1b130c" stroke={COLOR_FILL[color as keyof typeof COLOR_FILL]} strokeWidth="1.5" />
        ))
      )}
      {Object.entries(nests).map(([color, pts]) =>
        pts.map(([x, y], index) => (
          <circle key={`${color}-nest-${index}`} cx={x} cy={y} r="7" fill={COLOR_FILL[color as keyof typeof COLOR_FILL]} stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
        ))
      )}
    </svg>
  );
}

/** Mobile-safe marketing preview — digital SVG, not the raw physical reference photo. */
export function JackarooBoardPreview({ className = '', variant = 'hero' }: JackarooBoardPreviewProps) {
  return (
    <div className={`jackaroo-board-preview jackaroo-board-preview--${variant} ${className}`} aria-hidden>
      {variant === 'hero' && (
        <>
          <span className="jackaroo-board-preview__card jackaroo-board-preview__card--tl" />
          <span className="jackaroo-board-preview__card jackaroo-board-preview__card--br" />
        </>
      )}
      <MiniBoardSvg />
    </div>
  );
}
