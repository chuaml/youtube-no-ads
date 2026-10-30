/**
 * LocalStorage management for YouTube No-Ads
 */

const STORAGE_KEY = 'txtVideoUrls';
const THEME_KEY = 'youtube_no_ads_theme';

/**
 * Loads saved URL text from localStorage.
 * @returns {string}
 */
export function loadSavedUrls() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Saves URL text to localStorage. Cleans up entry if text is empty.
 * @param {string} text
 */
export function saveUrls(text) {
  try {
    const trimmed = typeof text === 'string' ? text.trim() : '';
    if (!trimmed) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, trimmed);
    }
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

/**
 * Loads saved theme preference.
 * @returns {'auto' | 'dark' | 'light'}
 */
export function loadSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'auto';
  } catch {
    return 'auto';
  }
}

/**
 * Saves theme preference.
 * @param {'auto' | 'dark' | 'light'} theme
 */
export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore errors
  }
}
