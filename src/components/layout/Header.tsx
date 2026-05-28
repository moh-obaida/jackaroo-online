import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { logOut } from '../../lib/firebase/auth';
import { Language } from '../../lib/i18n';
import { Theme } from '../../lib/theme';

export function Header() {
  const { t, language, setLanguage, theme, setTheme, user, isAuthenticated, isGuestUser } =
    useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  const displayName = user?.displayName || (isGuestUser ? 'Guest' : '');

  return (
    <header className="bg-surface-panel/90 border-b border-wood-700/50 px-4 py-3 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <span
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-wood-700 flex items-center justify-center text-board-dark font-bold text-sm shrink-0"
            aria-hidden
          >
            J
          </span>
          <span className="text-gold-300 font-bold text-lg truncate">{t('app.name')}</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="px-2.5 py-1.5 text-xs sm:text-sm bg-wood-800/80 hover:bg-wood-700 rounded-md border border-wood-600/60 transition-colors"
            title={t('settings.language')}
          >
            {language === 'en' ? 'عربي' : 'EN'}
          </button>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="px-2 py-1.5 text-xs sm:text-sm bg-wood-800/80 border border-wood-600/60 rounded-md text-cream-100 cursor-pointer max-w-[7rem]"
            title={t('settings.theme')}
          >
            <option value="dark">{t('settings.theme.dark')}</option>
            <option value="light">{t('settings.theme.light')}</option>
            <option value="balanced">{t('settings.theme.balanced')}</option>
          </select>

          {user && (
            <span className="hidden md:inline text-xs text-cream-200/50 max-w-[120px] truncate">
              {displayName}
            </span>
          )}

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="btn-ghost text-xs sm:text-sm py-1">
                {t('nav.profile')}
              </Link>
              <button type="button" onClick={handleLogout} className="btn-ghost text-xs sm:text-sm py-1">
                {t('nav.logout')}
              </button>
            </>
          ) : isGuestUser ? (
            <Link to="/auth" className="btn-ghost text-xs sm:text-sm py-1">
              {t('nav.login')}
            </Link>
          ) : (
            <Link to="/auth" className="btn-ghost text-xs sm:text-sm py-1">
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
