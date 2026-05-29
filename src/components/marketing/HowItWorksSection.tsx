import React from 'react';
import { useApp } from '../../context/AppContext';

const STEPS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const;

export function HowItWorksSection() {
  const { t } = useApp();

  return (
    <ol className="home-steps">
      {STEPS.map((step, index) => (
        <li key={step} className="home-step">
          <span className="home-step__num" aria-hidden="true">
            {index + 1}
          </span>
          <div className="min-w-0">
            <h2 className="home-step__title">{t(`pages.how.${step}.title`)}</h2>
            <p className="home-step__desc">{t(`pages.how.${step}.desc`)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
