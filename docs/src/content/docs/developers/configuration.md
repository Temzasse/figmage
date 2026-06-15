---
title: Configuration
description: Everything about figmage.config.js — required fields, global defaults, and per-token overrides.
sidebar:
  order: 4
---

Everything Figmage does is driven by a single file: `figmage.config.js`. It answers three questions —
**where** to read from (your Figma file), **what** to generate (the tokens), and **how** to shape the
output (formats, casing, file types). This page is the complete reference.

## The config file

Figmage looks for `figmage.config.js` in the current working directory by default. The file should
default-export your config. The `defineConfig` helper is optional but highly recommended — it gives
you full autocompletion and type-checking as you write.

```js
// figmage.config.js
import "dotenv/config";
import { defineConfig } from "figmage";

export default defineConfig({
  accessToken: process.env.FIGMA_ACCESS_TOKEN,
  fileId: process.env.FIGMA_FILE_ID,
  tokens: [{ name: "colors", type: "color" }],
});
```

Prefer a different location? Point Figmage at it with `--config`:

```bash
figmage sync --config ./configs/figmage.config.js
```

## Anatomy of the config

```ts
type Config = {
  // Required ---------------------------------------------------------------
  accessToken: string; // Figma personal access token
  fileId: string;      // ID of the published Figma file
  tokens: TokenConfig[]; // What to generate

  // Optional ---------------------------------------------------------------
  output?: {
    directory?: string;            // default: "./tokens"
    fileType?: "ts" | "js" | "json"; // default: "ts"
  };
  transform?: {
    defaultCasing?: "camel" | "kebab" | "snake" | "lower" | "pascal";
    defaultColorFormat?: "hex" | "rgb" | "rgba" | "hsl" | "hwb" | "lab" | "lch";
    defaultTextFormat?: "none" | "px" | "rem";
    defaultPropertyFormat?: "none" | "px" | "rem";
    defaultImageRasterFormat?: "png" | "jpg";
    baseFontSize?: number;         // used for rem conversion
  };
};
```

There are only **three required fields** — `accessToken`, `fileId`, and `tokens`. Everything else has
sensible defaults, so a minimal config is genuinely minimal.

### accessToken and fileId

These connect Figmage to Figma. Keep the token out of source control by loading it from the
environment — see [Install and Auth](/developers/install-and-auth/) for how to create a token and
find your file ID.

```js
accessToken: process.env.FIGMA_ACCESS_TOKEN,
fileId: process.env.FIGMA_FILE_ID,
```

If either value is missing when you run `figmage sync`, the command stops with a clear error before
making any API calls.

### tokens

The heart of the config: an array describing each set of tokens to generate. Every entry has a
`name` (used for the output file and for `--only`/`--skip`) and a `type`. Style-based types work on
their own; component-based types need a `source`. The full catalog lives in
[Token Types](/developers/token-types/).

```js
tokens: [
  { name: "colors", type: "color" },
  { name: "typography", type: "text" },
  { name: "spacing", type: "property", source: { componentSet: "Spacing", property: "absoluteBoundingBox.width" } },
];
```

## How settings cascade

Most formatting options can be set in two places: globally (under `transform` / `output`) and
per-token (on the token itself). Figmage resolves the final value from **most specific to least
specific**:

```text
per-token setting  ▶  global default  ▶  built-in default
```

In other words: a value on the token always wins; if it's absent, the global default applies; if
that's absent too, Figmage falls back to its built-in default. This lets you set the house style
once and override only the exceptions.

## Global defaults

### output

Controls where files go and their default type.

```js
output: {
  directory: "./tokens", // where token files are written
  fileType: "ts",        // ts | js | json
}
```

| Field       | Values              | Default      |
| ----------- | ------------------- | ------------ |
| `directory` | any path            | `./tokens`   |
| `fileType`  | `ts` `js` `json`    | `ts`         |

### transform

Sets the default formatting applied to every token (unless a token overrides it).

```js
transform: {
  defaultCasing: "camel",
  defaultColorFormat: "hsl",
  defaultTextFormat: "rem",
  defaultPropertyFormat: "px",
  defaultImageRasterFormat: "png",
  baseFontSize: 16,
}
```

| Field                      | Values                                          | Default |
| -------------------------- | ----------------------------------------------- | ------- |
| `defaultCasing`            | `camel` `kebab` `snake` `lower` `pascal`        | `camel` |
| `defaultColorFormat`       | `hex` `rgb` `rgba` `hsl` `hwb` `lab` `lch`      | `hsl`   |
| `defaultTextFormat`        | `none` `px` `rem`                               | `rem`   |
| `defaultPropertyFormat`    | `none` `px` `rem`                               | `px`    |
| `defaultImageRasterFormat` | `png` `jpg`                                     | `png`   |
| `baseFontSize`             | number                                          | `16`    |

> **About `baseFontSize`:** when a text or property value is emitted as `rem`, Figmage divides the
> pixel value by this number. With the default of `16`, a `24px` value becomes `1.5rem`.

## Per-token overrides

Every token accepts its own `transform`, and code-based tokens accept their own `output`. The
available `transform` fields depend on the token type:

```js
tokens: [
  // Color: casing + color format
  { name: "colors", type: "color", transform: { casing: "kebab", format: "rgba" } },

  // Text: casing + unit format
  { name: "typography", type: "text", transform: { format: "rem" } },

  // Property: casing + unit format
  {
    name: "spacing",
    type: "property",
    source: { componentSet: "Spacing", property: "absoluteBoundingBox.width" },
    transform: { format: "px" },
  },
];
```

### Output overrides

Code-based tokens (`color`, `text`, `dropShadow`, `property`) take a `CodeOutput`, which adds a
per-token `fileName` on top of `directory` and `fileType`:

```js
{
  name: "spacing",
  type: "property",
  source: { componentSet: "Spacing", property: "absoluteBoundingBox.width" },
  output: {
    directory: "./tokens",
    fileType: "json",
    fileName: "spacing-scale", // defaults to the token name
  },
}
```

Image tokens have their own output shapes — vector files, sprite sheets (with an optional typed IDs
file), and raster assets. Those are documented alongside the types in
[Token Types](/developers/token-types/#image-tokens).

## A fuller example

Here's a realistic config that mixes global defaults with targeted overrides:

```js
// figmage.config.js
import "dotenv/config";
import { defineConfig } from "figmage";

export default defineConfig({
  accessToken: process.env.FIGMA_ACCESS_TOKEN,
  fileId: process.env.FIGMA_FILE_ID,

  // House style for every token...
  output: { directory: "./src/tokens", fileType: "ts" },
  transform: {
    defaultCasing: "camel",
    defaultColorFormat: "hsl",
    defaultTextFormat: "rem",
    baseFontSize: 16,
  },

  tokens: [
    // ...inherit all defaults
    { name: "colors", type: "color" },
    { name: "typography", type: "text" },
    { name: "shadows", type: "dropShadow" },

    // ...override just what's different
    {
      name: "spacing",
      type: "property",
      source: { componentSet: "Spacing", property: "absoluteBoundingBox.width" },
      transform: { format: "px" },
      output: { fileType: "json" },
    },
    {
      name: "icons",
      type: "imageSprite",
      source: { frame: "Icons" },
      output: { fileName: "icon-sprite", ids: { enabled: true } },
    },
  ],
});
```

## Where to go next

- Learn the available [token types](/developers/token-types/).
- Generate scales and assets with [source-based tokens](/developers/token-types/#source-based-tokens).
- Run it all with the [CLI](/developers/cli/).
