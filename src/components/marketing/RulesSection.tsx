import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CARD_GUIDE_ORDER, getCardGuideActionKeys, getCardGuideTitleKey } from '../../lib/game/cardGuide';
import { CardRank } from '../../types/game';
import { CardGuideModal } from '../cards/CardGuideModal';

type CardCategory = 'movement' | 'special' | 'split';

function getCardCategory(rank: CardRank): CardCategory {
  if (rank === '7' || rank === '5') return 'split';
  if (rank === 'A' || rank === 'K' || rank === 'J' || rank === '4') return 'special';
  return 'movement';
}

const CATEGORY_KEYS: Record<CardCategory, string> = {
  movement: 'pages.rules.category.movement',
  special: 'pages.rules.category.special',
  split: 'pages.rules.category.split',
};

export function RulesSection() {
  const { t } = useApp();
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <>
      <div className="rules-basics-panel">
        <h2 className="rules-basics-panel__title">{t('pages.rules.basics.title')}</h2>
        <ul className="rules-basics-panel__list">
          <li>{t('pages.rules.basics.0')}</li>
          <li>{t('pages.rules.basics.1')}</li>
          <li>{t('pages.rules.basics.2')}</li>
          <li>{t('pages.rules.basics.3')}</li>
        </ul>
      </div>

      <section className="rules-cards-section">
        <header className="rules-cards-section__header">
          <h2 className="marketing-page__section-title">{t('pages.rules.cardsTitle')}</h2>
          <p className="marketing-page__section-lead">{t('pages.rules.cardsLead')}</p>
        </header>

        <ul className="home-rules-grid">
          {CARD_GUIDE_ORDER.map((rank) => {
            const actionKeys = getCardGuideActionKeys(rank);
            const category = getCardCategory(rank);
            return (
              <li key={rank}>
                <article className="home-rule-card">
                  <div className="home-rule-card__head">
                    <span className="home-rule-card__rank" aria-hidden="true">
                      {rank}
                    </span>
                    <span className={`home-rule-card__tag home-rule-card__tag--${category}`}>
                      {t(CATEGORY_KEYS[category])}
                    </span>
                  </div>
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
      </section>

      <section className="rules-warnings">
        <h2 className="rules-warnings__title">{t('pages.rules.warnings.title')}</h2>
        <ul className="rules-warnings__list">
          <li>{t('pages.rules.warnings.0')}</li>
          <li>{t('pages.rules.warnings.1')}</li>
          <li>{t('pages.rules.warnings.2')}</li>
        </ul>
      </section>

      <div className="rules-page-actions">
        <button type="button" className="btn-game-secondary px-6 py-3" onClick={() => setGuideOpen(true)}>
          {t('pages.rules.ctaDeck')}
        </button>
        <Link to="/create" className="btn-game-primary px-6 py-3">
          {t('home.createTable')}
        </Link>
        <Link to="/join" className="btn-game-secondary px-6 py-3">
          {t('home.joinTable')}
        </Link>
      </div>

      <CardGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
