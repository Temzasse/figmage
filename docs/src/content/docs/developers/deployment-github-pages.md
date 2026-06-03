---
title: Deploy to GitHub Pages
description: Deploy the docs site from the docs directory using GitHub Actions.
---

This project uses Astro Starlight in the `docs` directory and deploys to a GitHub Pages project site.

## 1. Astro config

In `docs/astro.config.mjs`, configure project-site values:

- `site`: `https://<owner>.github.io`
- `base`: `/<repo-name>`

This repository already reads owner and repo values from CI environment variables with fallbacks.

## 2. GitHub Pages settings

In repository settings:

1. Open **Settings > Pages**.
2. Set **Source** to **GitHub Actions**.

## 3. Workflow

Use a workflow under `.github/workflows` that:

1. Installs dependencies inside `docs`.
2. Builds with `npm run build`.
3. Uploads the generated `docs/dist` artifact.
4. Deploys with `actions/deploy-pages`.

## 4. Local check

```bash
cd docs
npm run build
npm run preview
```
