import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const LINKS = [
  { to: '/how-it-works', titleKey: 'home.explore.how.title', descKey: 'home.explore.how.desc' },
  { to: '/features', titleKey: 'home.explore.features.title', descKey: 'home.explore.features.desc' },
  { to: '/rules', titleKey: 'home.explore.rules.title', descKey: 'home.explore.rules.desc' },
  { to: '/faq', titleKey: 'home.explore.faq.title', descKey: 'home.explore.faq.desc' },
] as const;

export function HomeExploreLinks() {
  const { t } = useApp();

  return (
    <section className="home-explore">
      <p className="home-explore__eyebrow">{t('home.explore.eyebrow')}</p>
      <h2 className="home-explore__title">{t('home.explore.title')}</h2>
      <div className="home-explore__grid">
        {LINKS.map(({ to, titleKey, descKey }) => (
          <Link key={to} to={to} className="home-explore__card">
            <h3 className="home-explore__card-title">{t(titleKey)}</h3>
            <p className="home-explore__card-desc">{t(descKey)}</p>
            <span className="home-explore__card-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
