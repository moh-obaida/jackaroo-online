import React from 'react';
import { useApp } from '../../context/AppContext';
import { HomeFeatureIcon, HomeFeatureKey } from '../home/HomeFeatureIcon';

const FEATURES: HomeFeatureKey[] = ['tables', 'classic', 'turns', 'custom', 'lang', 'players'];

export function FeaturesSection() {
  const { t } = useApp();

  return (
    <>
      <div className="marketing-callout">
        <p className="marketing-callout__text">{t('pages.features.callout')}</p>
      </div>
      <div className="feature-grid-donor home-features-grid !mt-0 !max-w-none">
        {FEATURES.map((key) => (
          <article key={key} className="feature-card-donor">
            <div className="feature-card-icon">
              <HomeFeatureIcon feature={key} />
            </div>
            <div className="min-w-0">
              <h2 className="feature-card-title">{t(`home.feature.${key}`)}</h2>
              <p className="feature-card-desc">{t(`home.feature.${key}.desc`)}</p>
              <p className="marketing-feature-detail">{t(`pages.features.detail.${key}`)}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
