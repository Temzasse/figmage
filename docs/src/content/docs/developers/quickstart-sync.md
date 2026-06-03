---
title: Quickstart Sync
description: Run your first token sync from Figma to local files.
---

## Minimal config

```js
// figmage.config.js
import "dotenv/config";
import { defineConfig } from "figmage";

export default defineConfig({
  accessToken: process.env.FIGMA_ACCESS_TOKEN,
  fileId: process.env.FIGMA_FILE_ID,
  output: {
    directory: "./tokens",
    fileType: "ts",
  },
  tokens: [
    { name: "colors", type: "color" },
    { name: "typography", type: "text" },
    { name: "shadows", type: "dropShadow" },
  ],
});
```

## Run sync

```bash
figmage sync
```

Expected result:

1. Figmage reads styles from your Figma file.
2. Token files are written under `./tokens`.
3. Output file names are based on token names unless overridden.

## Sync only specific tokens

```bash
figmage sync --only=colors,typography
```
