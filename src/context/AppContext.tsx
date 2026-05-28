// ============================================================================
// APP CONTEXT — Global state for auth, language, theme
// ============================================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, isGuest } from '../lib/firebase/auth';
import { Language, getInitialLanguage, saveLanguage, applyDirection, t } from '../lib/i18n';
import { Theme, getInitialTheme, saveTheme, applyTheme } from '../lib/theme';

interface AppContextType {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isGuestUser: boolean;
  authLoading: boolean;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());
  const [theme, setThemeState] = useState<Theme>(getInitialTheme());

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Apply language direction on mount and change
  useEffect(() => {
    applyDirection(language);
  }, [language]);

  // Apply theme on mount and change
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
    applyDirection(lang);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
    applyTheme(newTheme);
  }, []);

  const translate = useCallback(
    (key: string, params?: Record<string, string>) => t(key, language, params),
    [language]
  );

  const value: AppContextType = {
    user,
    isAuthenticated: !!user && !user.isAnonymous,
    isGuestUser: isGuest(user),
    authLoading,
    language,
    setLanguage,
    t: translate,
    theme,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
