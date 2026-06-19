# YouTube No Ads PWA 🚀

A lightweight, ad-free Progressive Web App (PWA) client for YouTube. It allows you to paste YouTube links and watch videos seamlessly without ads by embedding them through a clean proxy/mirror client (`yout-ube.com`).

---

## 🌐 Live Demo
Visit the live application hosted on Cloudflare Pages:
👉 **[youtube-no-ads.chuaml.workers.dev](https://youtube-no-ads.chuaml.workers.dev/)**

---

## ✨ Features
* **Ad-Free Watching**: Automatically redirects and embeds YouTube videos into an ad-free player.
* **Progressive Web App (PWA)**: Fully installable on desktop and mobile devices with caching and offline support.
* **Local Storage Integration**: Remembers your video URL history automatically.
* **Auto-Scroll & Focus**: Instantly focus inputs and scroll straight to your videos as you load them.
* **Responsive Design**: Adapts beautifully to mobile, tablet, and desktop viewports, with native system dark/light theme support.

---

## 🛠 Tech Stack
* **Build Tool**: [Vite](https://vite.dev/) (Multi-page app routing style `mpa`)
* **Environment Config**: Cloudflare Pages Deployment configuration via [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
* **Offline Service Worker**: [Workbox CDN](https://developer.chrome.com/docs/workbox/)
* **Linting & Code Quality**: [ESLint](https://eslint.org/)
* **Testing**: [Vitest](https://vitest.dev/)

---

## 📁 Codebase Structure
The project is organized as follows:
```text
├── .agents/                 # AI assistant workspace instructions
│   └── AGENTS.md            # Guidelines for Antigravity Gemini
├── .devcontainer/           # Docker Development Container setup
│   └── devcontainer.json    # Dev container settings
├── .idx/                    # Project IDX Nix configuration
│   └── dev.nix              # Environment dependencies and IDE setup
├── .vscode/                 # VS Code-specific configurations
│   ├── launch.json          # Debug configurations
│   └── tasks.json           # VS Code tasks
├── public/                  # Static assets
│   ├── icons/               # PWA icons and screenshot assets
│   ├── sw.js                # Offline Service Worker (Workbox strategies)
│   └── manifest.json        # PWA application manifest
├── src/                     # Source JavaScript directory
│   └── main.js              # Entry JavaScript file (reserved for modular imports)
├── index.html               # Main page, layout, styles, and core video loading logic
├── vite.config.js           # Vite server and build config
├── wrangler.jsonc           # Cloudflare Pages deployment variables
└── package.json             # NPM dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v24 or later recommended).

### 1. Install Dependencies
```bash
npm install
```

### 2. Running Local Development Server
Launch the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### 3. Build & Production Preview
Build the static distribution files into the `dist/` directory and spin up a preview server:
```bash
npm run build-n-preview
```

### 4. Running Linting and Tests
Run ESLint code syntax checks:
```bash
npm run lint
```
Execute Vitest test suites:
```bash
npm run test
```

---

## 🛡️ License
Distributed under the **ISC License**. See `LICENSE` for more information.