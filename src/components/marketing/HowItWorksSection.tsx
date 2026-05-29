import React from 'react';
import { useApp } from '../../context/AppContext';

const STEPS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const;

function StepIcon({ step }: { step: (typeof STEPS)[number] }) {
  const common = { viewBox: '0 0 32 32', fill: 'none', className: 'how-step__icon-svg', 'aria-hidden': true as const };

  switch (step) {
    case 'step1':
      return (
        <svg {...common}>
          <rect x="5" y="10" width="22" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M9 14h14M9 18h8" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        </svg>
      );
    case 'step2':
      return (
        <svg {...common}>
          <path d="M8 16h10M18 16l-3-3M18 16l-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <rect x="19" y="9" width="8" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 'step3':
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.1" />
          <path d="M11 16l3.5 3.5L21 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'step4':
      return (
        <svg {...common}>
          <rect x="7" y="8" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.1" />
          <path d="M11 13h10M11 17h6" stroke="currentColor" strokeWidth="1" opacity="0.75" />
        </svg>
      );
    case 'step5':
      return (
        <svg {...common}>
          <path d="M16 6l2.5 5.5 6 .5-4.5 4 1.5 6L16 19l-5.5 3 1.5-6-4.5-4 6-.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function HowItWorksSection() {
  const { t } = useApp();

  return (
    <ol className="how-steps">
      {STEPS.map((step, index) => (
        <li key={step} className="how-step">
          <div className="how-step__marker" aria-hidden="true">
            <span className="how-step__num">{index + 1}</span>
            <span className="how-step__icon">
              <StepIcon step={step} />
            </span>
          </div>
          <div className="how-step__content">
            <h2 className="how-step__title">{t(`pages.how.${step}.title`)}</h2>
            <p className="how-step__desc">{t(`pages.how.${step}.desc`)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
