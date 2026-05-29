import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { logOut } from '../../lib/firebase/auth';
import { formatTableCode } from '../../lib/player/displayName';
import { JakarooIcon } from '../brand/JakarooIcon';
import { JakarooWordmark } from '../brand/JakarooWordmark';
import { ConnectionBar } from '../ui/ConnectionBar';

type NavKey = 'play' | 'how' | 'features' | 'rules' | 'faq' | 'login' | 'signup';

type NavItem = {
  key: NavKey;
  path: string;
  guestOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { key: 'play', path: '/create' },
  { key: 'how', path: '/how-it-works' },
  { key: 'features', path: '/features' },
  { key: 'rules', path: '/rules' },
  { key: 'faq', path: '/faq' },
  { key: 'login', path: '/auth?mode=login', guestOnly: true },
  { key: 'signup', path: '/auth?mode=signup', guestOnly: true },
];

const CREATE_CTA_HIDDEN = new Set(['/create', '/join', '/auth', '/profile', '/admin']);

function navItemActive(pathname: string, search: string, itemPath: string): boolean {
  const [itemPathname, itemSearch = ''] = itemPath.split('?');
  if (pathname !== itemPathname) return false;
  if (!itemSearch) return true;
  const params = new URLSearchParams(itemSearch);
  const current = new URLSearchParams(search);
  for (const [key, value] of params.entries()) {
    if (current.get(key) !== value) return false;
  }
  return true;
}

function roomCodeFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/(?:lobby|game)\/([^/]+)/);
  const code = match?.[1]?.trim();
  return code || null;
}

export function SiteHeader() {
  const { t, language, setLanguage, theme, setTheme, user, isAuthenticated, isGuestUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const onRoomRoute = /^\/(lobby|game)\//.test(location.pathname);
  const roomCode = roomCodeFromPath(location.pathname);
  const showCreateCta = !CREATE_CTA_HIDDEN.has(location.pathname) && !onRoomRoute;
  const displayName = user?.displayName || (isGuestUser ? 'Guest' : '');

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.guestOnly || !isAuthenticated);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleLogout = async () => {
    closeMenu();
    await logOut();
    navigate('/');
  };

  const navLinkClass = (path: string) =>
    navItemActive(location.pathname, location.search, path)
      ? 'site-header__nav-link site-header__nav-link--active'
      : 'site-header__nav-link';

  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.search, closeMenu]);

  useEffect(() => {
    if (!menuOpen || onRoomRoute) return;

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
  }, [menuOpen, closeMenu, onRoomRoute]);

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

  if (onRoomRoute) {
    return (
      <header className="site-header site-header--room">
        <div className="site-header__inner site-header__inner--room">
          <Link to="/" className="site-header__brand" aria-label={t('app.name')}>
            <JakarooIcon size="md" className="site-header__icon" decorative />
            <JakarooWordmark variant="header" decorative className="site-header__wordmark" />
          </Link>

          {roomCode && (
            <p className="site-header__room-code font-brand tabular-nums truncate" title={roomCode}>
              {formatTableCode(roomCode)}
            </p>
          )}

          <div className="site-header__end site-header__end--room">
            <ConnectionBar />
            {renderLanguageTheme(true)}
            <Link to="/" className="site-header__room-back">
              {t('nav.backHome')}
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__brand" aria-label={t('app.name')}>
          <JakarooIcon size="md" className="site-header__icon" decorative />
          <JakarooWordmark variant="header" decorative className="site-header__wordmark" />
        </Link>

        <nav className="site-header__nav" aria-label={t('nav.main')}>
          <ul className="site-header__nav-list">
            {visibleNavItems.map(({ key, path }) => (
              <li key={key}>
                <Link to={path} className={navLinkClass(path)} onClick={closeMenu}>
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__end">
          {showCreateCta && (
            <Link to="/create" className="site-header__cta">
              {t('nav.createTable')}
            </Link>
          )}

          <div className="site-header__actions site-header__actions--desktop">
            {renderLanguageTheme()}
            {isAuthenticated && (
              <>
                {displayName && (
                  <span className="site-header__user" title={displayName}>
                    {displayName}
                  </span>
                )}
                <Link to="/profile" className="site-header__action-link" onClick={closeMenu}>
                  {t('nav.profile')}
                </Link>
                <button type="button" onClick={handleLogout} className="site-header__action-btn">
                  {t('nav.logout')}
                </button>
              </>
            )}
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
              {showCreateCta && (
                <li>
                  <Link
                    to="/create"
                    className="site-header__mobile-link site-header__mobile-link--cta"
                    onClick={closeMenu}
                  >
                    {t('nav.createTable')}
                  </Link>
                </li>
              )}
              {visibleNavItems.map(({ key, path }) => (
                <li key={key}>
                  <Link to={path} className="site-header__mobile-link" onClick={closeMenu}>
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ))}
              {isAuthenticated && (
                <li className="site-header__mobile-auth">
                  <Link to="/profile" className="site-header__mobile-link" onClick={closeMenu}>
                    {t('nav.profile')}
                  </Link>
                  <button type="button" onClick={handleLogout} className="site-header__action-btn">
                    {t('nav.logout')}
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
