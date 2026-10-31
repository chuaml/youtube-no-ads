# Cloudflare Pages Publishing & Deployment Guide

This guide documents the complete deployment and publishing workflow for **YouTube No-Ads** on **Cloudflare Pages**.

---

## 1. Project Specifications

| Attribute | Value |
| :--- | :--- |
| **Project Name** | `youtube-no-ads` |
| **Live Production URL** | [https://youtube-no-ads.pages.dev/](https://youtube-no-ads.pages.dev/) |
| **Build System** | [Vite](file:///app/vite.config.js) (`npm run build`) |
| **Output Directory** | `./dist` |
| **Configuration File** | [wrangler.jsonc](file:///app/wrangler.jsonc) |
| **Compatibility Date** | `2026-06-19` |
| **GitHub Repository** | [`chuaml/youtube-no-ads`](https://github.com/chuaml/youtube-no-ads.git) |

---

## 2. Pre-Publish Validation Checklist

Before publishing changes, always run the local quality checks:

```bash
# 1. Run unit tests
npm run test -- --run

# 2. Check syntax and style with ESLint
npm run lint

# 3. Compile production build
npm run build
```

Verify that all tests pass and `./dist/` contains the generated `index.html`, `manifest.json`, and bundled assets.

---

## 3. Publishing Methods

### Method A: Continuous Deployment via GitHub (Recommended)

When Cloudflare Pages is connected to your GitHub repository:

1. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```
2. Push to GitHub:
   ```bash
   git push origin main
   ```
3. Cloudflare Pages automatically triggers a build:
   - **Framework Preset**: `Vite` / `None`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
   - **Root Directory**: `/`

The updated version is deployed to [https://youtube-no-ads.pages.dev/](https://youtube-no-ads.pages.dev/) within seconds.

---

### Method B: Direct CLI Deployment via Wrangler

You can deploy directly from your local terminal or dev container using [Wrangler](https://developers.cloudflare.com/workers/wrangler/):

#### 1. Login via web browser
when deploying from within a container, ensure `callback-host` and `callback-port` are set for browser from host-machine connect to dev-container
```bash
npx wrangler login --callback-host 0.0.0.0 --callback-port 8976
```

#### 2. Run Single Deploy Command
Using the configured npm script in [package.json](file:///app/package.json):

```bash
npm run deploy
```

This runs `vite build` followed by `wrangler pages deploy dist/`.

#### Alternatively: Direct Wrangler CLI command
you must login first, ensure `callback-host` and port are set for browser from host-machine connect to dev-container
```bash
npx wrangler login --callback-host 0.0.0.0 --callback-port 8976
```

```bash
npx wrangler pages deploy dist/ --project-name youtube-no-ads
```

To specify production branch explicitly:
```bash
npx wrangler pages deploy dist/ --project-name youtube-no-ads --branch main
```

---

## 4. Local Testing & Emulation

Before deploying to live edge infrastructure, test how the site behaves in Cloudflare's runtime:

```bash
# Emulate Cloudflare Pages edge environment locally
npx wrangler pages dev

# Or test Vite's static preview server
npm run preview
```

Open [http://localhost:8788](http://localhost:8788) (Wrangler) or [http://localhost:4173](http://localhost:4173) (Vite preview).

---

## 5. Troubleshooting & Rollbacks

- **Instant Rollback**: In the Cloudflare Dashboard under **Workers & Pages** > **youtube-no-ads** > **Deployments**, locate any previous successful deployment and select **Rollback to this deployment**.
- **PWA Caching & Stale Assets**: If updates do not reflect immediately on mobile/client devices, the Service Worker cache (`html-cache`) will refresh on the next visit (configured with `StaleWhileRevalidate` in [public/sw.js](file:///app/public/sw.js)). Appending `?nocache=1` bypasses the cache.
- **Missing Token Error**: If Wrangler reports `You are not authenticated`, ensure `CLOUDFLARE_API_TOKEN` is set in the current terminal session, or run `npx wrangler login` in an interactive browser environment.
