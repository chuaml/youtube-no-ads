# Project-Scoped Rules for YouTube No-Ads (youtube-no-ads)

Welcome to the **YouTube No-Ads** project. This document serves as a guideline and reference for Antigravity Gemini when working on this codebase.

## 1. Project Overview & Architecture
This project is a lightweight, ad-free Progressive Web App (PWA) mirror client for YouTube. It allows users to input YouTube URLs (standard or share links) and loads them within an iframe using a custom mirror domain (`https://yout-ube.com/`) to bypass ads.

### Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (ES6+).
- **Build Tool / Bundler**: Vite (configured in multi-page application mode `mpa` to behave similarly to GitHub Pages / Cloudflare Pages).
- **Service Worker / PWA**: Workbox-powered service worker (`public/sw.js`) for caching assets and offline functionality.
- **Linting & Testing**: ESLint (`eslint.config.mjs`) and Vitest (`vitest`).
- **Deployment & Hosting**: Cloudflare Pages managed via Wrangler (`wrangler.jsonc`).
- **Development Environments**:
  - **Project IDX**: Nix environment (`.idx/dev.nix`) specifying Node 24 and essential extensions.
  - **Docker Dev Container**: Dev container configuration (`.devcontainer/devcontainer.json` and `compose.dev.yml`) using `javascript-node:24`.

---

## 2. Directory Structure
Here is an overview of the key directories and files:
- `index.html` - The main entry point, containing the HTML layout, styles, and inline script logic.
- `package.json` - Specifies build, preview, test, and lint scripts alongside development dependencies.
- `vite.config.js` - Configuration for Vite (uses base path `./`, MPA mode, and drops console/debugger statements on production build).
- `wrangler.jsonc` - Cloudflare Wrangler configuration mapping the build output to `./dist`.
- `public/` - Static assets directory:
  - `sw.js` - Service worker using Workbox CDN for caching images, scripts, and document resources.
  - `manifest.json` - PWA manifest.
  - `icons/` - Application launcher icons and screenshots.
- `src/` - Source scripts directory:
  - `main.js` - Empty script file linked in `index.html` (reserved for modularizing the app).
- `.agents/AGENTS.md` - Workspace instructions and rules for Antigravity Gemini (this file).

---

## 3. Script Reference & Commands
Always use the following npm scripts to manage the project:
* **Start local development server**: `npm run dev`
* **Build application for production**: `npm run build`
* **Preview production build locally**: `npm run preview`
* **Build and preview in one step**: `npm run build-n-preview`
* **Run ESLint checker**: `npm run lint`
* **Run Unit/Integration tests**: `npm run test`

---

## 4. Coding Standards & Guidelines
When adding features or refactoring, follow these design and development constraints:

### 1. Structure and Separation of Concerns
- The current implementation embeds JavaScript and CSS directly in [index.html](file:///app/index.html). If you are introducing substantial new features, consider refactoring the JavaScript into [src/main.js](file:///app/src/main.js) and styling into a separate CSS file to keep the project clean.
- Ensure any links pointing to files use absolute paths or relative file URLs with the proper markdown link scheme (e.g. `[index.html](file:///app/index.html)`).

### 2. Mirror and URL Compatibility
- The app handles two YouTube URL formats:
  - Standard/Normal watch URL: `https://www.youtube.com/watch?v={ID}`
  - Share button short URL: `https://youtu.be/{ID}`
- Both are rewritten to the mirror URL: `https://yout-ube.com/watch?v={ID}`.
- If modifying URL extraction logic, preserve compatibility with these formats and verify parsing robustness with tests.

### 3. PWA & Service Worker
- Cached resources use standard Workbox strategies (`CacheFirst` for images, `NetworkFirst` for scripts, `StaleWhileRevalidate` for HTML pages).
- If offline behavior or caching needs changes, ensure [public/sw.js](file:///app/public/sw.js) and [manifest.json](file:///app/manifest.json) are updated accordingly.

### 4. Preservation of Comments
- Preserve all existing code comments and JSDoc annotations unless explicitly requested to change them.
