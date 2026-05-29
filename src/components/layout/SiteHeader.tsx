import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { logOut } from '../../lib/firebase/auth';
import { JakarooIcon } from '../brand/JakarooIcon';
import { ConnectionBar } from '../ui/ConnectionBar';

type NavKey = 'play' | 'how' | 'features' | 'rules' | 'faq';

const NAV_ITEMS: { key: NavKey; hash: string }[] = [
  { key: 'play', hash: 'play' },
  { key: 'how', hash: 'how-it-works' },
  { key: 'features', hash: 'features' },
  { key: 'rules', hash: 'rules' },
  { key: 'faq', hash: 'faq' },
];

export function SiteHeader() {
  const { t, language, setLanguage, theme, setTheme, user, isAuthenticated, isGuestUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = location.pathname === '/';
  const onRoomRoute = /^\/(lobby|game)\//.test(location.pathname);
  const displayName = user?.displayName || (isGuestUser ? 'Guest' : '');

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleLogout = async () => {
    closeMenu();
    await logOut();
    navigate('/');
  };

  const scrollToSection = useCallback(
    (hash: string) => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [],
  );

  const handleNavClick = (key: NavKey, hash: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (key === 'play' && !isHome) {
      closeMenu();
      return;
    }

    if (isHome) {
      event.preventDefault();
      scrollToSection(hash);
      closeMenu();
      return;
    }

    closeMenu();
  };

  const getNavHref = (key: NavKey, hash: string) => {
    if (key === 'play' && !isHome) return '/create';
    return `/#${hash}`;
  };

  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
        menuButtonRef.current?.focus();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        menuPanelRef.current?.contains(target) ||
        menuButtonRef.current?.contains(target)
      ) {
        return;
      }
      closeMenu();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen, closeMenu]);

  const renderLanguageTheme = (compact = false) => (
    <div
      className={`site-header__prefs${compact ? ' site-header__prefs--compact' : ''}`}
      role="group"
      aria-label={t('settings.theme')}
    >
      <button
        type="button"
        className="site-header__pref-btn"
        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
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
    </div>
  );

  const renderAuthActions = (variant: 'desktop' | 'mobile') => {
    if (isAuthenticated) {
      return (
        <>
          {displayName && variant === 'desktop' && (
            <span className="site-header__user" title={displayName}>
              {displayName}
            </span>
          )}
          <Link
            to="/profile"
            className="site-header__action-link"
            onClick={closeMenu}
          >
            {t('nav.profile')}
          </Link>
          <button type="button" onClick={handleLogout} className="site-header__action-btn">
            {t('nav.logout')}
          </button>
        </>
      );
    }

    return (
      <Link
        to="/auth"
        className="site-header__login-btn"
        onClick={closeMenu}
      >
        {t('nav.login')}
      </Link>
    );
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__brand" aria-label={t('app.name')}>
          <JakarooIcon size="md" className="site-header__icon" decorative />
        </Link>

        <nav className="site-header__nav" aria-label={t('nav.main')}>
          <ul className="site-header__nav-list">
            {NAV_ITEMS.map(({ key, hash }) => (
              <li key={key}>
                <Link
                  to={getNavHref(key, hash)}
                  className="site-header__nav-link"
                  onClick={handleNavClick(key, hash)}
                >
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__end">
          {onRoomRoute && <ConnectionBar />}

          {isHome && (
            <Link to="/create" className="site-header__cta">
              {t('nav.createTable')}
            </Link>
          )}

          <div className="site-header__actions site-header__actions--desktop">
            {renderLanguageTheme()}
            {renderAuthActions('desktop')}
          </div>

          <div className="site-header__mobile-tools">
            {renderLanguageTheme(true)}
            <button
              ref={menuButtonRef}
              type="button"
              className="site-header__menu-btn"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="site-header__menu-icon" aria-hidden="true">
                {menuOpen ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                  </svg>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          ref={menuPanelRef}
          id={menuId}
          className="site-header__mobile-panel"
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.main')}
        >
          <nav aria-label={t('nav.main')}>
            <ul className="site-header__mobile-nav">
              {NAV_ITEMS.map(({ key, hash }) => (
                <li key={key}>
                  <Link
                    to={getNavHref(key, hash)}
                    className="site-header__mobile-link"
                    onClick={handleNavClick(key, hash)}
                  >
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ))}
              <li className="site-header__mobile-auth">{renderAuthActions('mobile')}</li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
