import React from 'react';

type JackarooBoardPreviewProps = {
  className?: string;
  /** Low-opacity background watermark behind hero copy */
  variant?: 'hero' | 'watermark';
};

const COLORS = [
  { fill: '#3a3a3a', stroke: '#9ca3af', nest: { x: 42, y: 42 } },
  { fill: '#2d8a4e', stroke: '#6ee7a0', nest: { x: 158, y: 42 } },
  { fill: '#2563eb', stroke: '#93c5fd', nest: { x: 158, y: 158 } },
  { fill: '#f0ebe0', stroke: '#d4c8a8', nest: { x: 42, y: 158 } },
] as const;

function octagonPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

function trackHoles(cx: number, cy: number, r: number, count: number) {
  const holes: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const hx = cx + r * Math.cos(angle);
    const hy = cy + r * Math.sin(angle);
    holes.push(
      <g key={i}>
        <ellipse cx={hx + 0.6} cy={hy + 1} rx={2.4} ry={2} fill="#000" opacity={0.25} />
        <circle cx={hx} cy={hy} r={2.2} fill="#2a1c10" stroke="#5c4838" strokeWidth="0.5" />
        <circle cx={hx - 0.5} cy={hy - 0.5} r={0.7} fill="#fff" opacity={0.1} />
      </g>
    );
  }
  return holes;
}

/** Simplified octagonal Jackaroo board for marketing hero */
export function JackarooBoardPreview({
  className = '',
  variant = 'hero',
}: JackarooBoardPreviewProps) {
  const isWatermark = variant === 'watermark';

  return (
    <div
      className={`jackaroo-board-preview jackaroo-board-preview--${variant} ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 200 200" className="jackaroo-board-preview__svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="jbp-wood-outer" x1="30" y1="20" x2="170" y2="180">
            <stop offset="0%" stopColor="#b8894a" />
            <stop offset="40%" stopColor="#7a5228" />
            <stop offset="100%" stopColor="#3d2810" />
          </linearGradient>
          <linearGradient id="jbp-wood-inner" x1="50" y1="50" x2="150" y2="150">
            <stop offset="0%" stopColor="#8b5e2e" />
            <stop offset="100%" stopColor="#4a3018" />
          </linearGradient>
          <radialGradient id="jbp-felt" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#2d8f56" />
            <stop offset="70%" stopColor="#1a5c38" />
            <stop offset="100%" stopColor="#0f3320" />
          </radialGradient>
          <pattern id="jbp-felt-grain" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 8 L8 0" stroke="#000" strokeWidth="0.4" opacity="0.06" />
          </pattern>
        </defs>

        <polygon
          points={octagonPoints(100, 100, 94)}
          fill="url(#jbp-wood-outer)"
          stroke="#e8c88a"
          strokeWidth="1.2"
        />
        <polygon
          points={octagonPoints(100, 100, 82)}
          fill="url(#jbp-wood-inner)"
          stroke="#5c3a18"
          strokeWidth="0.8"
        />
        <polygon
          points={octagonPoints(100, 100, 72)}
          fill="url(#jbp-felt)"
          stroke="#143d28"
          strokeWidth="0.6"
        />
        <polygon points={octagonPoints(100, 100, 72)} fill="url(#jbp-felt-grain)" />

        {trackHoles(100, 100, 64, 24)}

        {COLORS.map((c, i) => (
          <g key={i}>
            <rect
              x={c.nest.x - 14}
              y={c.nest.y - 14}
              width={28}
              height={28}
              rx={6}
              fill={c.fill}
              fillOpacity={0.35}
              stroke={c.stroke}
              strokeWidth={1}
              strokeOpacity={0.7}
            />
            <circle cx={c.nest.x} cy={c.nest.y} r={5} fill={c.fill} stroke={c.stroke} strokeWidth={0.8} />
            <circle cx={c.nest.x - 1.5} cy={c.nest.y - 1.5} r={1.2} fill="#fff" opacity={0.35} />
          </g>
        ))}

        <g opacity={0.85}>
          <path
            d="M100 100 L100 36 M100 100 L164 100 M100 100 L100 164 M100 100 L36 100"
            stroke="#0a2418"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.35"
          />
        </g>

        <circle cx={100} cy={100} r={10} fill="#1a1008" stroke="#c9a227" strokeWidth="1" opacity={0.9} />
        <text
          x={100}
          y={103}
          textAnchor="middle"
          fill="#e6b800"
          fontSize="8"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          opacity={isWatermark ? 0.4 : 0.85}
        >
          J
        </text>

        {!isWatermark && (
          <>
            <g transform="translate(168 28) rotate(12)">
              <rect width="14" height="20" rx="2" fill="#4a1515" stroke="#8b2020" strokeWidth="0.6" />
              <path d="M2 4 L12 4 M2 8 L10 8" stroke="#c9a227" strokeWidth="0.5" opacity="0.5" />
            </g>
            <g transform="translate(18 168) rotate(-8)">
              <rect width="14" height="20" rx="2" fill="#4a1515" stroke="#8b2020" strokeWidth="0.6" />
            </g>
          </>
        )}
      </svg>
    </div>
  );
}
