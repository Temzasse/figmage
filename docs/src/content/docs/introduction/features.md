---
title: Features
description: A short tour of what Figmage can generate, with links to the detailed docs.
sidebar:
  order: 3
---

Here's the big picture of what Figmage does, with links to the pages that cover each area in depth.

## Token sync from Figma

Run [`figmage sync`](/developers/cli/#sync) to read your published Figma library and write design
token files to disk. You declare what you want once in `figmage.config.js`; Figmage fetches the
latest values and generates `ts`, `js`, `json`, or `svg` output.

See: [Quickstart](/developers/quickstart/) · [Configuration](/developers/configuration/)

## Core style tokens

Extract the building blocks straight from your Figma **styles**:

- **Colors** from color styles.
- **Typography** from text styles.
- **Shadows** from drop-shadow effect styles.

See: [Token Types → Style-based](/developers/token-types/#style-based-tokens) ·
[Styles & Variables](/designers/styles-and-variables/)

## Source-based tokens

Generate tokens from Figma **components**, not just styles:

- **Property tokens** — measure component width, height, or corner radius to produce spacing,
  sizing, and radii scales.
- **Image tokens** — export components as individual vectors, a single SVG sprite, or raster
  (`png`/`jpg`) assets.

See: [Token Types → Source-based](/developers/token-types/#source-based-tokens) ·
[Components](/designers/components/)

## Flexible formatting

Control how tokens are generated with global defaults and per-token overrides — color formats
(`hex`, `rgb`, `hsl`, …), unit formats (`px`, `rem`), name casing, file types, and output
directories.

See: [Configuration → Transform](/developers/configuration/#transform)

## Selective syncing

Refresh only part of your design system with `--only` and `--skip`, so CI jobs can re-export a
single token group on demand.

See: [CLI → Filtering](/developers/cli/#filtering-with---only-and---skip)

## SVG sprite sheets

Bundle icons into a single SVG sprite for performance — either from Figma components (the
`imageSprite` token type) or from a folder of local SVG files via
[`figmage spritesheet`](/developers/cli/#spritesheet).

See: [CLI → spritesheet](/developers/cli/#spritesheet)

## Type safety

Generate TypeScript output (including a typed list of sprite icon IDs) so token names and values are
autocompleted and checked at build time.

See: [Configuration](/developers/configuration/)
