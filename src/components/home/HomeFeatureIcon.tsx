import React from 'react';

export type HomeFeatureKey = 'tables' | 'classic' | 'players' | 'lang' | 'turns' | 'custom';

type HomeFeatureIconProps = {
  feature: HomeFeatureKey;
  className?: string;
};

export function HomeFeatureIcon({ feature, className = '' }: HomeFeatureIconProps) {
  const common = { className: `home-feature-icon__svg ${className}`, viewBox: '0 0 32 32', fill: 'none' };

  switch (feature) {
    case 'tables':
      return (
        <svg {...common} aria-hidden>
          <rect x="4" y="8" width="24" height="16" rx="3" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 12h16M8 16h10" stroke="currentColor" strokeWidth="1" opacity="0.7" />
          <circle cx="24" cy="20" r="2" fill="currentColor" opacity="0.5" />
        </svg>
      );
    case 'classic':
      return (
        <svg {...common} aria-hidden>
          <polygon
            points="16,4 26,9 28,16 26,23 16,28 6,23 4,16 6,9"
            stroke="currentColor"
            strokeWidth="1.1"
          />
          <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1" />
          <path d="M14 14 L14 20 M14 14 C14 14 17 14 18.5 16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'players':
      return (
        <svg {...common} aria-hidden>
          <circle cx="10" cy="12" r="3" fill="currentColor" opacity="0.9" />
          <circle cx="22" cy="12" r="3" fill="currentColor" opacity="0.7" />
          <circle cx="16" cy="20" r="3" fill="currentColor" opacity="0.5" />
          <circle cx="8" cy="22" r="2.5" fill="currentColor" opacity="0.35" />
        </svg>
      );
    case 'lang':
      return (
        <svg {...common} aria-hidden>
          <rect x="6" y="6" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.1" />
          <text x="11" y="19" fontSize="9" fill="currentColor" fontWeight="600">
            ع
          </text>
          <text x="18" y="19" fontSize="8" fill="currentColor" opacity="0.7">
            A
          </text>
        </svg>
      );
    case 'turns':
      return (
        <svg {...common} aria-hidden>
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.1" />
          <path d="M16 10 L16 16 L20 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="24" cy="8" r="2" fill="#34d399" />
        </svg>
      );
    case 'custom':
      return (
        <svg {...common} aria-hidden>
          <rect x="5" y="7" width="12" height="18" rx="1.5" stroke="currentColor" strokeWidth="1" />
          <rect x="15" y="7" width="12" height="18" rx="1.5" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <path d="M8 12h6M8 16h4" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      );
    default:
      return null;
  }
}
