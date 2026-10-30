# YouTube No-Ads Todo & Implementation Tracker

See full verified architecture, design decisions, and technical specifications in [PLAN.md](file:///app/PLAN.md).

## Phase 1: Robust URL Parser & Unit Tests (P0)
- [ ] Implement `src/url-parser.js` supporting shorts, live, mobile, embed, timestamp, and raw IDs
- [ ] Add 11-char regex validation (`/^[a-zA-Z0-9_-]{11}$/`) to eliminate DOM XSS risk
- [ ] Create `src/url-parser.test.js` covering 15+ real-world URL permutations
- [ ] Verify `npm run test` exits 0 with 100% passing tests

## Phase 2: Feed DOM Reconciliation & State Preservation (P1)
- [ ] Implement keyed DOM reconciler in `src/feed-reconciler.js` (preserves playing iframes)
- [ ] Retain intended auto-scroll to the top player feed on video updates
- [ ] Retain intended autofocus and text selection on textarea
- [ ] Retain standard eager loading for iframes (no lazy loading)
- [ ] Fix `localStorage` clearing bug when textarea is emptied

## Phase 3: UX Actions & Video Card Controls (P1)
- [ ] Add quick action toolbar: "Paste from Clipboard", "Clear All", "Load Sample"
- [ ] Add per-card controls: Remove card (✕), Copy mirror link (with tooltip), Open in new tab
- [ ] Add friendly empty state card with format guidance
- [ ] Add live status badge (e.g., "3 videos loaded")

## Phase 4: Code Modularization & Housekeeping (P2)
- [ ] Migrate inline script from `index.html` to `src/main.js` and ES modules
- [ ] Verify Vite drops console logs in production builds
- [ ] Add manual theme mode toggle (Auto / Dark / Light)
- [ ] Align `package.json` name to `youtube-no-ads`
- [ ] Verify `npm run lint`, `npm run test`, and `npm run build` pass cleanly
