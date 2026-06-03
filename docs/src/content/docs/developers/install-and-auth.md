---
title: Install and Auth
description: Install Figmage and configure Figma API credentials.
---

## Install Figmage

```bash
npm install figmage
```

Or run directly with npx:

```bash
npx figmage sync
```

## Set credentials

Figmage requires two values in your runtime environment:

1. `FIGMA_ACCESS_TOKEN`
2. `FIGMA_FILE_ID`

Create a `.env` file in your project:

```dotenv
FIGMA_ACCESS_TOKEN="xxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx"
FIGMA_FILE_ID="xxxxxxxxxxxxxxxxxxxxxx"
```

Then load it in your config file:

```js
import "dotenv/config";
```

## Config file location

The default config path is `figmage.config.js` in your current working directory.

Use another path with:

```bash
figmage sync --config ./path/to/figmage.config.js
```
