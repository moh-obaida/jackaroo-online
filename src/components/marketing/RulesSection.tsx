import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CARD_GUIDE_ORDER, getCardGuideActionKeys, getCardGuideTitleKey } from '../../lib/game/cardGuide';
import { CardGuideModal } from '../cards/CardGuideModal';

export function RulesSection() {
  const { t } = useApp();
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <>
      <div className="marketing-callout">
        <h2 className="marketing-callout__heading">{t('pages.rules.basics.title')}</h2>
        <ul className="marketing-callout__list">
          <li>{t('pages.rules.basics.0')}</li>
          <li>{t('pages.rules.basics.1')}</li>
          <li>{t('pages.rules.basics.2')}</li>
          <li>{t('pages.rules.basics.3')}</li>
        </ul>
      </div>

      <h2 className="marketing-page__section-title">{t('pages.rules.cardsTitle')}</h2>
      <p className="marketing-page__section-lead">{t('pages.rules.cardsLead')}</p>

      <ul className="home-rules-grid">
        {CARD_GUIDE_ORDER.map((rank) => {
          const actionKeys = getCardGuideActionKeys(rank);
          return (
            <li key={rank}>
              <article className="home-rule-card">
                <span className="home-rule-card__rank" aria-hidden="true">
                  {rank}
                </span>
                <div className="min-w-0">
                  <h3 className="home-rule-card__title">{t(getCardGuideTitleKey(rank))}</h3>
                  <ul className="home-rule-card__bullets">
                    {actionKeys.map((key) => (
                      <li key={key}>{t(key)}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <div className="home-section__actions">
        <button type="button" className="btn-game-secondary px-6 py-3" onClick={() => setGuideOpen(true)}>
          {t('home.rules.viewFull')}
        </button>
      </div>

      <CardGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
