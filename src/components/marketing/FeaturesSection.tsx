import React from 'react';
import { useApp } from '../../context/AppContext';
import { HomeFeatureIcon, HomeFeatureKey } from '../home/HomeFeatureIcon';

type FeatureGroup = {
  titleKey: string;
  descKey: string;
  features: HomeFeatureKey[];
};

const GROUPS: FeatureGroup[] = [
  {
    titleKey: 'pages.features.group.private.title',
    descKey: 'pages.features.group.private.desc',
    features: ['tables', 'custom'],
  },
  {
    titleKey: 'pages.features.group.automation.title',
    descKey: 'pages.features.group.automation.desc',
    features: ['classic', 'turns'],
  },
  {
    titleKey: 'pages.features.group.premium.title',
    descKey: 'pages.features.group.premium.desc',
    features: ['lang', 'players'],
  },
];

export function FeaturesSection() {
  const { t } = useApp();

  return (
    <div className="feature-groups">
      <div className="marketing-callout marketing-callout--accent">
        <p className="marketing-callout__text">{t('pages.features.callout')}</p>
      </div>

      {GROUPS.map(({ titleKey, descKey, features }) => (
        <section key={titleKey} className="feature-group">
          <header className="feature-group__header">
            <h2 className="feature-group__title">{t(titleKey)}</h2>
            <p className="feature-group__desc">{t(descKey)}</p>
          </header>
          <div className="feature-group__grid">
            {features.map((key) => (
              <article key={key} className="feature-card-donor feature-card-donor--rich">
                <div className="feature-card-icon">
                  <HomeFeatureIcon feature={key} />
                </div>
                <div className="min-w-0">
                  <h3 className="feature-card-title">{t(`home.feature.${key}`)}</h3>
                  <p className="feature-card-desc">{t(`home.feature.${key}.desc`)}</p>
                  <p className="marketing-feature-detail">{t(`pages.features.detail.${key}`)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
