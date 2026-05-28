import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { logOut } from '../../lib/firebase/auth';
import { ConnectionBar } from '../ui/ConnectionBar';
import { Button } from '../ui/Button';

export function SiteHeader() {
  const { t, language, setLanguage, theme, setTheme, user, isAuthenticated, isGuestUser } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  const displayName = user?.displayName || (isGuestUser ? 'Guest' : '');

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__brand-row">
          <Link to="/" className="site-header__brand">
            <span className="site-header__logo" aria-hidden>
              J
            </span>
            <span className="site-header__name">{t('app.name')}</span>
          </Link>
          <ConnectionBar />
        </div>

        <div className="site-header__controls">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          >
            {language === 'en' ? 'عربي' : 'EN'}
          </Button>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as typeof theme)}
            className="select-field site-header__theme-select"
            aria-label={t('settings.theme')}
          >
            <option value="dark">{t('settings.theme.dark')}</option>
            <option value="light">{t('settings.theme.light')}</option>
            <option value="balanced">{t('settings.theme.balanced')}</option>
          </select>

          {user && (
            <span className="site-header__user hidden lg:inline truncate max-w-[7rem]">
              {displayName}
            </span>
          )}

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="btn-ghost text-xs">
                {t('nav.profile')}
              </Link>
              <button type="button" onClick={handleLogout} className="btn-ghost text-xs">
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn-ghost text-xs">
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
