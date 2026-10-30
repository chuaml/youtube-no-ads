/**
 * YouTube URL Parser & Extractor
 * Extracts 11-character video IDs and optional timestamps from various YouTube URL formats.
 */

export const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Normalizes and extracts YouTube video ID and optional timestamp from a string.
 * Supports:
 * - Standard watch URLs: https://www.youtube.com/watch?v=...
 * - Mobile / Music subdomains: m.youtube.com, music.youtube.com
 * - Share links: https://youtu.be/...
 * - YouTube Shorts: https://www.youtube.com/shorts/...
 * - YouTube Live: https://www.youtube.com/live/...
 * - YouTube Embeds: https://www.youtube.com/embed/...
 * - Raw 11-char video IDs: e.g., dQw4w9WgXcQ
 *
 * @param {string} input - Raw URL or ID string
 * @returns {{ id: string, timestamp: string | null } | null}
 */
export function extractVideoId(input) {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Check if the input is directly an 11-char video ID
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return { id: trimmed, timestamp: null };
  }

  // Ensure input can be parsed by new URL()
  let urlString = trimmed;
  if (!urlString.includes('://')) {
    urlString = 'https://' + urlString;
  }

  let url;
  try {
    url = new URL(urlString);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const isYouTubeHost = host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host.endsWith('.youtube.com');
  const isShortHost = host === 'youtu.be';

  if (!isYouTubeHost && !isShortHost) {
    return null;
  }

  let id = null;
  const rawTimestamp = url.searchParams.get('t') || url.searchParams.get('start');
  let timestamp = rawTimestamp ? rawTimestamp.trim() : null;

  if (isShortHost) {
    // Format: https://youtu.be/{VIDEO_ID}
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      id = pathParts[0];
    }
  } else if (isYouTubeHost) {
    if (url.pathname === '/watch') {
      // Format: https://www.youtube.com/watch?v={VIDEO_ID}
      id = url.searchParams.get('v');
    } else if (url.pathname.startsWith('/shorts/')) {
      // Format: https://www.youtube.com/shorts/{VIDEO_ID}
      const parts = url.pathname.slice('/shorts/'.length).split('/').filter(Boolean);
      if (parts.length > 0) id = parts[0];
    } else if (url.pathname.startsWith('/live/')) {
      // Format: https://www.youtube.com/live/{VIDEO_ID}
      const parts = url.pathname.slice('/live/'.length).split('/').filter(Boolean);
      if (parts.length > 0) id = parts[0];
    } else if (url.pathname.startsWith('/embed/')) {
      // Format: https://www.youtube.com/embed/{VIDEO_ID}
      const parts = url.pathname.slice('/embed/'.length).split('/').filter(Boolean);
      if (parts.length > 0) id = parts[0];
    }
  }

  if (id && YOUTUBE_ID_REGEX.test(id)) {
    return { id, timestamp };
  }

  return null;
}

/**
 * Builds the ad-free mirror URL for a given video ID and optional timestamp.
 *
 * @param {string} id - 11-char video ID
 * @param {string | null} [timestamp] - Optional timestamp parameter
 * @returns {string}
 */
export function buildMirrorUrl(id, timestamp = null) {
  if (!id) return '';
  const base = `https://yout-ube.com/watch?v=${id}`;
  if (timestamp) {
    return `${base}&t=${encodeURIComponent(timestamp)}`;
  }
  return base;
}

/**
 * Parses multiline user input text into a list of parsed video descriptors.
 *
 * @param {string} rawText - Multiline text from textarea
 * @returns {Array<{ id: string, timestamp: string | null, mirrorUrl: string, originalUrl: string }>}
 */
export function parseInputLines(rawText) {
  if (typeof rawText !== 'string') return [];
  const lines = rawText.split('\n');
  const results = [];
  const seenIds = new Set();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const extracted = extractVideoId(trimmed);
    if (extracted && !seenIds.has(extracted.id)) {
      seenIds.add(extracted.id);
      results.push({
        id: extracted.id,
        timestamp: extracted.timestamp,
        mirrorUrl: buildMirrorUrl(extracted.id, extracted.timestamp),
        originalUrl: trimmed,
      });
    }
  }

  return results;
}

/**
 * Extracts a valid YouTube URL from Web Share Target parameters (url, text, title).
 * Handles raw links, text containing links, and URLSearchParams objects.
 *
 * @param {{ url?: string | null, text?: string | null, title?: string | null } | URLSearchParams} params
 * @returns {string | null}
 */
export function extractShareTargetLink(params) {
  if (!params) return null;

  let urlParam = '';
  let textParam = '';
  let titleParam = '';

  if (typeof params.get === 'function') {
    urlParam = params.get('url') || '';
    textParam = params.get('text') || '';
    titleParam = params.get('title') || '';
  } else {
    urlParam = params.url || '';
    textParam = params.text || '';
    titleParam = params.title || '';
  }

  // 1. Check direct url parameter
  if (urlParam && extractVideoId(urlParam)) {
    return urlParam.trim();
  }

  // Helper to find YouTube URLs or IDs inside text strings
  const searchInText = (str) => {
    if (!str || typeof str !== 'string') return null;
    const urlMatches = str.match(/https?:\/\/[^\s]+/gi);
    if (urlMatches) {
      for (const u of urlMatches) {
        if (extractVideoId(u)) {
          return u;
        }
      }
    }
    const tokens = str.split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      if (extractVideoId(token)) {
        return token.includes('://') ? token : `https://www.youtube.com/watch?v=${token}`;
      }
    }
    return null;
  };

  // 2. Search in text parameter
  const inText = searchInText(textParam);
  if (inText) return inText;

  // 3. Search in title parameter
  const inTitle = searchInText(titleParam);
  if (inTitle) return inTitle;

  return null;
}
