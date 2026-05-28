import React from 'react';
import { useApp } from '../../../context/AppContext';
import { PlayStepId, playStepI18nKey } from '../../../lib/play/playStep';

const STEPS: PlayStepId[] = ['select_card', 'choose_action'];

type PlayStepBarProps = {
  step: PlayStepId;
};

/** Ludo/Uno-style “what do I do now?” strip above the action buttons. */
export function PlayStepBar({ step }: PlayStepBarProps) {
  const { t } = useApp();

  if (step === 'wait') {
    return (
      <div className="play-step-bar play-step-bar--wait">
        <span className="play-step-bar__pulse" aria-hidden />
        <p>{t('game.waitTurn')}</p>
      </div>
    );
  }

  if (step === 'skip_turn' || step === 'discard_all') {
    return (
      <div className="play-step-bar play-step-bar--alert">
        <p>{t(playStepI18nKey(step))}</p>
      </div>
    );
  }

  const activeIndex = step === 'select_card' ? 0 : 1;

  return (
    <div className="play-step-bar" role="status" aria-live="polite">
      <div className="play-step-bar__track">
        {STEPS.map((id, i) => (
          <div
            key={id}
            className={`play-step-bar__dot ${i <= activeIndex ? 'play-step-bar__dot--on' : ''} ${
              i === activeIndex ? 'play-step-bar__dot--current' : ''
            }`}
          >
            <span>{i + 1}</span>
          </div>
        ))}
      </div>
      <p className="play-step-bar__label">{t(playStepI18nKey(step))}</p>
    </div>
  );
}
