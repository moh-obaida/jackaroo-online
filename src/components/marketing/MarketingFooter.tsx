import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { JakarooIcon } from '../brand/JakarooIcon';

export function MarketingFooter() {
  const { t } = useApp();

  return (
    <footer className="home-footer">
      <div className="home-footer__inner marketing-page__footer-inner">
        <div className="home-footer__brand-row">
          <JakarooIcon size="sm" decorative className="home-footer__icon" />
          <div>
            <p className="home-footer__brand">{t('app.name')}</p>
            <p className="home-footer__tagline">{t('home.footer.tagline')}</p>
          </div>
        </div>

        <nav className="home-footer__nav" aria-label={t('nav.main')}>
          <Link to="/create">{t('home.footer.play')}</Link>
          <Link to="/how-it-works">{t('nav.how')}</Link>
          <Link to="/features">{t('home.footer.features')}</Link>
          <Link to="/rules">{t('home.footer.rules')}</Link>
          <Link to="/faq">{t('nav.faq')}</Link>
          <Link to="/auth?mode=login">{t('nav.login')}</Link>
          <Link to="/auth?mode=signup">{t('nav.signup')}</Link>
        </nav>

        <div className="home-footer__meta">
          <p className="home-footer__lang">{t('home.footer.langNote')}</p>
          <p className="home-footer__copy">{t('home.footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
