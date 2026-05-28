// ============================================================================
// I18N MODULE — Language management with RTL support
// ============================================================================

import { Language, translations } from './translations';

export type { Language };
export { translations };

/**
 * Get the initial language from localStorage or browser settings.
 */
export function getInitialLanguage(): Language {
  // Check localStorage first
  const stored = localStorage.getItem('jakaroo_language');
  if (stored === 'en' || stored === 'ar') return stored;

  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ar')) return 'ar';

  return 'en';
}

/**
 * Save language preference.
 */
export function saveLanguage(lang: Language): void {
  localStorage.setItem('jakaroo_language', lang);
}

/**
 * Apply RTL/LTR direction to document.
 */
export function applyDirection(lang: Language): void {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
}

/**
 * Translate a key with optional interpolation.
 */
export function t(key: string, lang: Language, params?: Record<string, string>): string {
  let text = translations[lang][key] || translations['en'][key] || key;

  if (params) {
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(`{${param}}`, value);
    }
  }

  return text;
}
