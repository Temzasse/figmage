---
title: Config Overview
description: Core shape of figmage.config.js and required fields.
---

## Top-level config

```ts
type Config = {
  accessToken: string;
  fileId: string;
  output?: {
    directory?: string;
    fileType?: "ts" | "js" | "json";
  };
  transform?: {
    defaultCasing?: "camel" | "kebab" | "snake" | "lower" | "pascal";
    defaultColorFormat?: "hex" | "rgb" | "rgba" | "hsl" | "hwb" | "lab" | "lch";
    defaultTextFormat?: "none" | "px" | "rem";
    defaultPropertyFormat?: "none" | "px" | "rem";
    defaultImageFormat?: "png" | "jpg" | "svg";
    baseFontSize?: number;
  };
  tokens: TokenConfig[];
};
```

## Required fields

1. `accessToken`
2. `fileId`
3. `tokens`

## Minimal example

```js
import "dotenv/config";
import { defineConfig } from "figmage";

export default defineConfig({
  accessToken: process.env.FIGMA_ACCESS_TOKEN,
  fileId: process.env.FIGMA_FILE_ID,
  tokens: [{ name: "colors", type: "color" }],
});
```
