/**
 * Keyed DOM Feed Reconciler
 * Preserves active iframes and playback state when videos are added, reordered, or removed.
 */

/**
 * Creates an SVG icon node.
 * @param {string} svgHtml
 * @returns {Element}
 */
function createSvg(svgHtml) {
  const t = document.createElement('template');
  t.innerHTML = svgHtml.trim();
  return t.content.firstElementChild;
}

const ICONS = {
  link: '<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/><path d="M6.586 10.172A3 3 0 0 0 10.4 10.5l.586-.586a1 1 0 0 0 .199-.154 2 2 0 0 1-3.337-.861l.792-.793a2 2 0 1 1 2.83 2.83l-1.06 1.06a2 2 0 0 1-2.83 0 1.978 1.978 0 0 0-.172-.172z"/></svg>',
  copy: '<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>',
  check: '<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>',
  open: '<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>',
  close: '<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>',
};

/**
 * Creates an empty state element.
 * @param {() => void} onSampleClick
 * @returns {HTMLElement}
 */
export function createEmptyState(onSampleClick) {
  const empty = document.createElement('div');
  empty.className = 'empty-state-card';
  empty.innerHTML = `
    <div class="empty-state-icon">📺</div>
    <h3 class="empty-state-title">No videos loaded yet</h3>
    <p class="empty-state-desc">Paste YouTube URLs into the box above (one per line) to load your ad-free player feed.</p>
    <div class="empty-state-examples">
      <span>Supported: Normal watch URLs, youtu.be links, Shorts, Live streams, and timestamps.</span>
    </div>
  `;

  const sampleBtn = document.createElement('button');
  sampleBtn.className = 'btn-action btn-sample';
  sampleBtn.textContent = 'Load Sample Videos';
  sampleBtn.addEventListener('click', onSampleClick);
  empty.appendChild(sampleBtn);

  return empty;
}

/**
 * Creates an individual video card DOM element with controls.
 * @param {{ id: string, timestamp: string | null, mirrorUrl: string }} video
 * @param {(id: string) => void} onRemove
 * @returns {HTMLElement}
 */
export function createVideoCard(video, onRemove) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.dataset.videoId = video.id;

  // Header toolbar
  const header = document.createElement('div');
  header.className = 'video-card-header';

  // Left side: Link to mirror
  const link = document.createElement('a');
  link.className = 'video-link';
  link.setAttribute('href', video.mirrorUrl);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
  link.appendChild(createSvg(ICONS.link));
  
  const linkLabel = document.createTextNode(` yout-ube.com/watch?v=${video.id}${video.timestamp ? ` (t=${video.timestamp})` : ''}`);
  link.appendChild(linkLabel);
  header.appendChild(link);

  // Right side: Action controls
  const actions = document.createElement('div');
  actions.className = 'video-card-actions';

  // Copy Link Button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'card-btn';
  copyBtn.title = 'Copy mirror link';
  copyBtn.setAttribute('aria-label', 'Copy mirror link');
  copyBtn.appendChild(createSvg(ICONS.copy));
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(video.mirrorUrl);
      copyBtn.innerHTML = '';
      copyBtn.appendChild(createSvg(ICONS.check));
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.innerHTML = '';
        copyBtn.appendChild(createSvg(ICONS.copy));
        copyBtn.classList.remove('copied');
      }, 1500);
    } catch {
      // Fallback if clipboard API is blocked
    }
  });
  actions.appendChild(copyBtn);

  // Open in New Tab Button
  const openBtn = document.createElement('a');
  openBtn.className = 'card-btn';
  openBtn.title = 'Open in new tab';
  openBtn.setAttribute('aria-label', 'Open in new tab');
  openBtn.setAttribute('href', video.mirrorUrl);
  openBtn.setAttribute('target', '_blank');
  openBtn.setAttribute('rel', 'noopener noreferrer');
  openBtn.appendChild(createSvg(ICONS.open));
  actions.appendChild(openBtn);

  // Remove Button
  const removeBtn = document.createElement('button');
  removeBtn.className = 'card-btn card-btn-remove';
  removeBtn.title = 'Remove video';
  removeBtn.setAttribute('aria-label', 'Remove video');
  removeBtn.appendChild(createSvg(ICONS.close));
  removeBtn.addEventListener('click', () => {
    onRemove(video.id);
  });
  actions.appendChild(removeBtn);

  header.appendChild(actions);
  card.appendChild(header);

  // Iframe wrapper
  const iframeWrapper = document.createElement('div');
  iframeWrapper.className = 'iframe-wrapper';

  // Eager loading iframe as per user instruction (no lazy loading)
  const iframe = document.createElement('iframe');
  iframe.setAttribute('referrerpolicy', 'no-referrer');
  iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('src', video.mirrorUrl);

  iframeWrapper.appendChild(iframe);
  card.appendChild(iframeWrapper);

  return card;
}

/**
 * Keyed Reconciler Class
 */
export class FeedReconciler {
  /**
   * @param {HTMLElement} containerElement
   * @param {object} callbacks
   * @param {(id: string) => void} callbacks.onRemove
   * @param {() => void} callbacks.onLoadSample
   */
  constructor(containerElement, callbacks) {
    this.container = containerElement;
    this.callbacks = callbacks;
    /** @type {Map<string, HTMLElement>} */
    this.cardsMap = new Map();
    this.emptyElement = null;
  }

  /**
   * Reconciles the container DOM with the new list of parsed videos.
   * Preserves unchanged iframes to ensure uninterrupted playback.
   *
   * @param {Array<{ id: string, timestamp: string | null, mirrorUrl: string }>} videos
   * @param {boolean} [shouldAutoScroll=true]
   */
  render(videos, shouldAutoScroll = true) {
    if (!videos || videos.length === 0) {
      // Clear cards map
      this.cardsMap.forEach((card) => card.remove());
      this.cardsMap.clear();

      if (!this.emptyElement) {
        this.emptyElement = createEmptyState(this.callbacks.onLoadSample);
      }
      if (!this.container.contains(this.emptyElement)) {
        this.container.innerHTML = '';
        this.container.appendChild(this.emptyElement);
      }
      return;
    }

    // Remove empty state if present
    if (this.emptyElement && this.emptyElement.parentNode === this.container) {
      this.emptyElement.remove();
    }

    const currentIds = new Set(videos.map((v) => v.id));

    // 1. Remove cards that are no longer in the list
    for (const [id, cardElement] of this.cardsMap.entries()) {
      if (!currentIds.has(id)) {
        cardElement.remove();
        this.cardsMap.delete(id);
      }
    }

    // 2. Add new cards or reposition existing cards in specified order
    videos.forEach((video) => {
      let card = this.cardsMap.get(video.id);
      if (!card) {
        card = createVideoCard(video, this.callbacks.onRemove);
        this.cardsMap.set(video.id, card);
      }
      // Re-appending existing element moves it to match the ordered sequence without reloading
      this.container.appendChild(card);
    });

    // 3. Intended behavior: scroll to first player feed
    if (shouldAutoScroll) {
      const firstIframe = this.container.querySelector('iframe');
      if (firstIframe) {
        firstIframe.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }
}
