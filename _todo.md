# YouTube No-Ads Todo & Implementation Tracker

See full verified architecture, design decisions, and technical specifications in [PLAN.md](file:///app/PLAN.md).

## Phase 1: Robust URL Parser & Unit Tests (P0)
- [x] Implement `src/url-parser.js` supporting shorts, live, mobile, embed, timestamp, and raw IDs
- [x] Add 11-char regex validation (`/^[a-zA-Z0-9_-]{11}$/`) to eliminate DOM XSS risk
- [x] Create `src/url-parser.test.js` covering 15+ real-world URL permutations
- [x] Verify `npm run test` exits 0 with 100% passing tests

## Phase 2: Feed DOM Reconciliation & State Preservation (P1)
- [x] Implement keyed DOM reconciler in `src/feed-reconciler.js` (preserves playing iframes)
- [x] Retain intended auto-scroll to the top player feed on video updates
- [x] Retain intended autofocus and text selection on textarea
- [x] Retain standard eager loading for iframes (no lazy loading)
- [x] Fix `localStorage` clearing bug when textarea is emptied

## Phase 3: UX Actions & Video Card Controls (P1)
- [x] Add quick action toolbar: "Paste from Clipboard", "Clear All", "Load Sample"
- [x] Add per-card controls: Remove card (✕), Copy mirror link (with tooltip), Open in new tab
- [x] Add friendly empty state card with format guidance
- [x] Add live status badge (e.g., "3 videos loaded")

## Phase 4: Code Modularization & Housekeeping (P2)
- [x] Migrate inline script from `index.html` to `src/main.js` and ES modules
- [x] Verify Vite drops console logs in production builds
- [x] Add manual theme mode toggle (Auto / Dark / Light)
- [x] Align `package.json` name to `youtube-no-ads`
- [x] Verify `npm run lint`, `npm run test`, and `npm run build` pass cleanly

## Phase 5: Web Share Target & PWA Installation (P1)
- [x] Create `public/manifest.json` with `share_target` API specification
- [x] Register Service Worker (`public/sw.js`) in `src/main.js`
- [x] Implement `extractShareTargetLink()` in `src/url-parser.js` (url, text, title)
- [x] Handle incoming share parameters, populate textarea, and update feed
- [x] Clean up URL search params via `history.replaceState`
- [x] Add unit tests in `src/url-parser.test.js` (all 20 tests passing)
