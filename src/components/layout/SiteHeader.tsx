import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { logOut } from '../../lib/firebase/auth';
import { JakarooIcon } from '../brand/JakarooIcon';
import { JakarooWordmark } from '../brand/JakarooWordmark';
import { ConnectionBar } from '../ui/ConnectionBar';

export function SiteHeader() {
  const { t, language, setLanguage, theme, setTheme, user, isAuthenticated, isGuestUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const onRoomRoute = /^\/(lobby|game)\//.test(location.pathname);

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  const displayName = user?.displayName || (isGuestUser ? 'Guest' : '');

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__brand" aria-label={t('app.name')}>
          <JakarooIcon size="md" className="site-header__icon" />
          <JakarooWordmark variant="header" decorative className="site-header__wordmark hidden sm:block" />
          <span className="site-header__name sm:hidden">{t('app.name')}</span>
        </Link>
        <div className="site-header__end">
          {onRoomRoute && <ConnectionBar />}

          <div className="site-header__toolbar" role="group" aria-label={t('settings.theme')}>
            <button
              type="button"
              className="site-header__tool-btn"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            >
              {language === 'en' ? 'عربي' : 'EN'}
            </button>

            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as typeof theme)}
              className="site-header__theme-select"
              aria-label={t('settings.theme')}
            >
              <option value="dark">{t('settings.theme.dark')}</option>
              <option value="light">{t('settings.theme.light')}</option>
              <option value="balanced">{t('settings.theme.balanced')}</option>
            </select>

            {isAuthenticated ? (
              <>
                {displayName && (
                  <span className="site-header__user hidden md:inline" title={displayName}>
                    {displayName}
                  </span>
                )}
                <Link to="/profile" className="site-header__tool-btn site-header__tool-btn--link">
                  {t('nav.profile')}
                </Link>
                <button type="button" onClick={handleLogout} className="site-header__tool-btn">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link to="/auth" className="site-header__tool-btn site-header__tool-btn--primary">
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
