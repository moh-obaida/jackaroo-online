import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageFrame } from '../ui/PageFrame';
import { MarketingFooter } from './MarketingFooter';

type MarketingPageLayoutProps = {
  titleKey: string;
  subtitleKey?: string;
  introKey?: string;
  eyebrowKey?: string;
  children: React.ReactNode;
  showPlayCta?: boolean;
  ctaTitleKey?: string;
  ctaLeadKey?: string;
};

export function MarketingPageLayout({
  titleKey,
  subtitleKey,
  introKey,
  eyebrowKey,
  children,
  showPlayCta = true,
  ctaTitleKey,
  ctaLeadKey,
}: MarketingPageLayoutProps) {
  const { t } = useApp();

  return (
    <PageFrame variant="marketing" className="marketing-page-wrap p-0">
      <div className="marketing-page">
        <header className="marketing-page__header">
          {eyebrowKey ? <p className="marketing-page__eyebrow">{t(eyebrowKey)}</p> : null}
          <h1 className="marketing-page__title">{t(titleKey)}</h1>
          {subtitleKey ? <p className="marketing-page__subtitle">{t(subtitleKey)}</p> : null}
          {introKey ? <p className="marketing-page__intro">{t(introKey)}</p> : null}
          <div className="marketing-page__divider" aria-hidden="true" />
        </header>

        <div className="marketing-page__body">{children}</div>

        {showPlayCta ? (
          <section className="marketing-page__cta">
            {ctaTitleKey ? (
              <div className="marketing-page__cta-copy">
                <h2 className="marketing-page__cta-title">{t(ctaTitleKey)}</h2>
                {ctaLeadKey ? <p className="marketing-page__cta-lead">{t(ctaLeadKey)}</p> : null}
              </div>
            ) : null}
            <div className="marketing-page__cta-actions">
              <Link to="/create" className="btn-game-primary px-6 py-3">
                {t('home.createTable')}
              </Link>
              <Link to="/join" className="btn-game-secondary px-6 py-3">
                {t('home.joinTable')}
              </Link>
            </div>
          </section>
        ) : null}

        <MarketingFooter />
      </div>
    </PageFrame>
  );
}
