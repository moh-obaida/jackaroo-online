import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export function MarketingFooter() {
  const { t } = useApp();

  return (
    <footer className="home-footer">
      <div className="home-footer__inner marketing-page__footer-inner">
        <p className="home-footer__brand">{t('app.name')}</p>
        <nav className="home-footer__nav" aria-label={t('nav.main')}>
          <Link to="/create">{t('home.footer.play')}</Link>
          <Link to="/how-it-works">{t('nav.how')}</Link>
          <Link to="/features">{t('home.footer.features')}</Link>
          <Link to="/rules">{t('home.footer.rules')}</Link>
          <Link to="/faq">{t('nav.faq')}</Link>
          <Link to="/auth?mode=login">{t('nav.login')}</Link>
          <Link to="/auth?mode=signup">{t('nav.signup')}</Link>
        </nav>
        <p className="home-footer__lang">{t('home.footer.langNote')}</p>
        <p className="home-footer__copy">{t('home.footer.copyright')}</p>
      </div>
    </footer>
  );
}
