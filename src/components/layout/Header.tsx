import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { logOut } from '../../lib/firebase/auth';
import { Language } from '../../lib/i18n';
import { Theme } from '../../lib/theme';

export function Header() {
  const { t, language, setLanguage, theme, setTheme, user, isAuthenticated, isGuestUser } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  return (
    <header className="bg-board-medium border-b border-wood-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-gold-400 font-bold text-xl">{t('app.name')}</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="px-3 py-1.5 text-sm bg-wood-700 hover:bg-wood-600 rounded-md border border-wood-500 transition-colors"
            title={t('settings.language')}
          >
            {language === 'en' ? 'عربي' : 'EN'}
          </button>

          {/* Theme Toggle */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="px-3 py-1.5 text-sm bg-wood-700 border border-wood-500 rounded-md text-white appearance-none cursor-pointer"
            title={t('settings.theme')}
          >
            <option value="dark">{t('settings.theme.dark')}</option>
            <option value="light">{t('settings.theme.light')}</option>
            <option value="balanced">{t('settings.theme.balanced')}</option>
          </select>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="text-sm text-gold-300 hover:text-gold-200 transition-colors"
              >
                {user?.displayName || t('nav.profile')}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : isGuestUser ? (
            <Link
              to="/auth"
              className="text-sm text-gold-300 hover:text-gold-200 transition-colors"
            >
              {t('nav.login')}
            </Link>
          ) : (
            <Link
              to="/auth"
              className="text-sm text-gold-300 hover:text-gold-200 transition-colors"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
