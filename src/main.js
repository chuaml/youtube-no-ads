/**
 * Main application coordinator for YouTube No-Ads
 */

import { parseInputLines, extractShareTargetLink } from './url-parser.js';
import { FeedReconciler } from './feed-reconciler.js';
import { loadSavedUrls, saveUrls, loadSavedTheme, saveTheme } from './storage.js';

const SAMPLE_VIDEOS = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  'https://www.youtube.com/watch?v=9bZkp7q19f0',
].join('\n');

/**
 * Registers the PWA Service Worker for caching and offline capabilities.
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // Silently ignore in environments where Service Worker is restricted
      });
    });
  }
}

/**
 * Initializes the YouTube No-Ads app.
 */
function initApp() {
  const txtVideoUrls = document.getElementById('txtVideoUrls');
  const videoContainer = document.getElementById('video-container');
  const btnPaste = document.getElementById('btnPaste');
  const btnClear = document.getElementById('btnClear');
  const btnSample = document.getElementById('btnSample');
  const feedStatus = document.getElementById('feedStatus');
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const themeIcon = document.getElementById('themeIcon');

  if (!txtVideoUrls || !videoContainer) return;

  // Initialize Theme
  let currentTheme = loadSavedTheme();
  applyTheme(currentTheme);

  function applyTheme(theme) {
    currentTheme = theme;
    saveTheme(theme);
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeIcon) themeIcon.textContent = '🌙';
    } else if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (themeIcon) themeIcon.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeIcon) themeIcon.textContent = '🌓';
    }
  }

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      const themes = ['auto', 'dark', 'light'];
      const nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
      applyTheme(themes[nextIndex]);
    });
  }

  // Update Status Badge
  function updateStatus(parsedCount, lineCount) {
    if (!feedStatus) return;
    if (parsedCount === 0) {
      feedStatus.textContent = '';
      return;
    }
    const skipped = lineCount - parsedCount;
    if (skipped > 0) {
      feedStatus.textContent = `${parsedCount} video${parsedCount > 1 ? 's' : ''} (${skipped} skipped)`;
    } else {
      feedStatus.textContent = `${parsedCount} video${parsedCount > 1 ? 's' : ''}`;
    }
  }

  // Feed Reconciler instance
  const reconciler = new FeedReconciler(videoContainer, {
    onRemove: (idToRemove) => {
      // Remove line with this ID from textarea
      const lines = txtVideoUrls.value.split('\n');
      const filtered = lines.filter((line) => {
        return !line.includes(idToRemove);
      });
      txtVideoUrls.value = filtered.join('\n');
      saveUrls(txtVideoUrls.value);
      updateFeed(false);
    },
    onLoadSample: () => {
      txtVideoUrls.value = SAMPLE_VIDEOS;
      saveUrls(txtVideoUrls.value);
      updateFeed(true);
    },
  });

  // Updates feed and status from current textarea content
  function updateFeed(shouldAutoScroll = true) {
    const rawText = txtVideoUrls.value;
    const nonEmptyLines = rawText.split('\n').filter((l) => l.trim().length > 0);
    const parsedVideos = parseInputLines(rawText);

    saveUrls(rawText);
    reconciler.render(parsedVideos, shouldAutoScroll);
    updateStatus(parsedVideos.length, nonEmptyLines.length);
  }

  // User-intended behavior: autofocus with instant quick-select
  txtVideoUrls.addEventListener('focus', (e) => {
    e.target.select();
  });

  // User-intended behavior: auto-scroll to player feed on input
  txtVideoUrls.addEventListener('input', () => {
    updateFeed(true);
  });

  // Toolbar Actions: Paste
  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          const current = txtVideoUrls.value.trim();
          txtVideoUrls.value = current ? `${current}\n${text.trim()}` : text.trim();
          updateFeed(true);
        }
      } catch {
        txtVideoUrls.focus();
      }
    });
  }

  // Toolbar Actions: Clear
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      txtVideoUrls.value = '';
      saveUrls('');
      updateFeed(false);
      txtVideoUrls.focus();
    });
  }

  // Toolbar Actions: Sample
  if (btnSample) {
    btnSample.addEventListener('click', () => {
      txtVideoUrls.value = SAMPLE_VIDEOS;
      saveUrls(txtVideoUrls.value);
      updateFeed(true);
    });
  }

  // Check for incoming Web Share Target links (GET params: url, text, title)
  function handleWebShareTarget() {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const sharedLink = extractShareTargetLink(searchParams);
      if (sharedLink) {
        const current = txtVideoUrls.value.trim();
        if (!current.includes(sharedLink)) {
          txtVideoUrls.value = current ? `${current}\n${sharedLink}` : sharedLink;
        }
        // Clean URL params to prevent duplicate additions on page refresh
        window.history.replaceState({}, '', window.location.pathname);
        return true;
      }
    } catch {
      // Ignore URL parsing errors
    }
    return false;
  }

  // Initial Load: check Web Share Target first, then localStorage
  const saved = loadSavedUrls();
  if (saved) {
    txtVideoUrls.value = saved;
  }

  const hasShared = handleWebShareTarget();

  if (txtVideoUrls.value.trim()) {
    updateFeed(true);
  } else {
    // Show empty state
    reconciler.render([], false);
  }

  // Register PWA Service Worker
  registerServiceWorker();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
