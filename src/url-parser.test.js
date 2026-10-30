import { describe, it, expect } from 'vitest';
import { extractVideoId, buildMirrorUrl, parseInputLines, extractShareTargetLink, YOUTUBE_ID_REGEX } from './url-parser.js';

describe('extractVideoId', () => {
  const sampleId = 'dQw4w9WgXcQ';

  it('validates 11-character video IDs via regex', () => {
    expect(YOUTUBE_ID_REGEX.test(sampleId)).toBe(true);
    expect(YOUTUBE_ID_REGEX.test('short')).toBe(false);
    expect(YOUTUBE_ID_REGEX.test('toolongvideoId1234')).toBe(false);
    expect(YOUTUBE_ID_REGEX.test('invalid!@#$%')).toBe(false);
  });

  it('extracts raw 11-character ID directly', () => {
    expect(extractVideoId('dQw4w9WgXcQ')).toEqual({ id: 'dQw4w9WgXcQ', timestamp: null });
    expect(extractVideoId('  dQw4w9WgXcQ  ')).toEqual({ id: 'dQw4w9WgXcQ', timestamp: null });
  });

  it('extracts from standard desktop watch URLs', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: null,
    });
    expect(extractVideoId('https://youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: null,
    });
  });

  it('extracts when query parameters precede v', () => {
    expect(extractVideoId('https://www.youtube.com/watch?feature=shared&v=dQw4w9WgXcQ&list=PL123')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: null,
    });
  });

  it('extracts timestamps correctly', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120s')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: '120s',
    });
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ?t=1m30s')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: '1m30s',
    });
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&start=45')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: '45',
    });
  });

  it('extracts from short share URLs (youtu.be)', () => {
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: null,
    });
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ?si=trackingParam123')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: null,
    });
  });

  it('extracts from mobile URLs (m.youtube.com)', () => {
    expect(extractVideoId('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: null,
    });
  });

  it('extracts from YouTube Music URLs (music.youtube.com)', () => {
    expect(extractVideoId('https://music.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: null,
    });
  });

  it('extracts from YouTube Shorts', () => {
    expect(extractVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: null,
    });
    expect(extractVideoId('https://youtube.com/shorts/dQw4w9WgXcQ?feature=share')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: null,
    });
  });

  it('extracts from YouTube Live streams', () => {
    expect(extractVideoId('https://www.youtube.com/live/dQw4w9WgXcQ')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: null,
    });
  });

  it('extracts from YouTube Embed URLs', () => {
    expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: null,
    });
  });

  it('handles scheme-less URLs and http', () => {
    expect(extractVideoId('youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: null,
    });
    expect(extractVideoId('http://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      id: 'dQw4w9WgXcQ',
      timestamp: null,
    });
  });

  it('returns null for invalid or malicious inputs', () => {
    expect(extractVideoId('')).toBeNull();
    expect(extractVideoId('   ')).toBeNull();
    expect(extractVideoId(null)).toBeNull();
    expect(extractVideoId('https://vimeo.com/123456')).toBeNull();
    expect(extractVideoId('https://google.com')).toBeNull();
    expect(extractVideoId('<script>alert("xss")</script>')).toBeNull();
    expect(extractVideoId('https://www.youtube.com/watch?v=invalid_id_with_special_chars!@#')).toBeNull();
  });
});

describe('buildMirrorUrl', () => {
  it('constructs correct mirror URLs', () => {
    expect(buildMirrorUrl('dQw4w9WgXcQ')).toBe('https://yout-ube.com/watch?v=dQw4w9WgXcQ');
    expect(buildMirrorUrl('dQw4w9WgXcQ', '90s')).toBe('https://yout-ube.com/watch?v=dQw4w9WgXcQ&t=90s');
    expect(buildMirrorUrl('')).toBe('');
  });
});

describe('parseInputLines', () => {
  it('parses multiple links, ignores empty/invalid lines, and deduplicates', () => {
    const raw = `
      https://www.youtube.com/watch?v=dQw4w9WgXcQ
      https://youtu.be/dQw4w9WgXcQ
      invalid text line
      https://youtube.com/shorts/3jz_J3E33yA
      
      9bZkp7q19f0
    `;

    const parsed = parseInputLines(raw);
    expect(parsed).toHaveLength(3);
    expect(parsed[0].id).toBe('dQw4w9WgXcQ');
    expect(parsed[0].mirrorUrl).toBe('https://yout-ube.com/watch?v=dQw4w9WgXcQ');
    expect(parsed[1].id).toBe('3jz_J3E33yA');
    expect(parsed[2].id).toBe('9bZkp7q19f0');
  });
});

describe('extractShareTargetLink', () => {
  it('extracts direct URL when present in url parameter', () => {
    expect(extractShareTargetLink({ url: 'https://youtu.be/dQw4w9WgXcQ' })).toBe('https://youtu.be/dQw4w9WgXcQ');
    expect(extractShareTargetLink(new URLSearchParams('url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ'))).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('extracts YouTube URL embedded inside text parameter', () => {
    expect(extractShareTargetLink({ text: 'Check out this awesome track: https://youtu.be/dQw4w9WgXcQ' })).toBe('https://youtu.be/dQw4w9WgXcQ');
    expect(extractShareTargetLink({ text: 'https://www.youtube.com/shorts/3jz_J3E33yA cool short' })).toBe('https://www.youtube.com/shorts/3jz_J3E33yA');
  });

  it('extracts video from title if text and url are empty', () => {
    expect(extractShareTargetLink({ title: 'Watch https://youtu.be/dQw4w9WgXcQ now' })).toBe('https://youtu.be/dQw4w9WgXcQ');
  });

  it('extracts raw 11-char ID from text if no full URL is given', () => {
    expect(extractShareTargetLink({ text: 'dQw4w9WgXcQ' })).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('returns null when no YouTube link exists in params', () => {
    expect(extractShareTargetLink(null)).toBeNull();
    expect(extractShareTargetLink({})).toBeNull();
    expect(extractShareTargetLink({ url: 'https://example.com/page' })).toBeNull();
    expect(extractShareTargetLink({ text: 'Just some random text without youtube' })).toBeNull();
  });
});
