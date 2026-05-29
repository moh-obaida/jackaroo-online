import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageFrame } from '../ui/PageFrame';
import { MarketingFooter } from './MarketingFooter';

type MarketingPageLayoutProps = {
  titleKey: string;
  subtitleKey?: string;
  introKey?: string;
  children: React.ReactNode;
  showPlayCta?: boolean;
};

export function MarketingPageLayout({
  titleKey,
  subtitleKey,
  introKey,
  children,
  showPlayCta = true,
}: MarketingPageLayoutProps) {
  const { t } = useApp();

  return (
    <PageFrame variant="marketing" className="marketing-page-wrap p-0">
      <div className="marketing-page">
      <header className="marketing-page__header">
        <h1 className="marketing-page__title">{t(titleKey)}</h1>
        {subtitleKey ? <p className="marketing-page__subtitle">{t(subtitleKey)}</p> : null}
        {introKey ? <p className="marketing-page__intro">{t(introKey)}</p> : null}
      </header>

      <div className="marketing-page__body">{children}</div>

      {showPlayCta ? (
        <section className="marketing-page__cta">
          <Link to="/create" className="btn-game-primary px-6 py-3">
            {t('home.createTable')}
          </Link>
          <Link to="/join" className="btn-game-secondary px-6 py-3">
            {t('home.joinTable')}
          </Link>
        </section>
      ) : null}

      <MarketingFooter />
      </div>
    </PageFrame>
  );
}
