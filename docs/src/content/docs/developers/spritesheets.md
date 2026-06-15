---
title: Spritesheets
description: Why SVG icon spritesheets are a great way to render icons, and how to generate them with Figmage.
sidebar:
  order: 6
---

Icons are everywhere in web apps, and there are a few common ways to get an SVG icon onto the page.
Each approach trades performance for developer experience differently. This page explains those
trade-offs, then shows how to build an icon **spritesheet** with Figmage — both as part of a regular
`sync` and with the dedicated `spritesheet` command.

## Ways to render icons on the web

### Image + SVG

The simplest approach is to reference an external SVG with an `<img>` tag (or `background-image`):

```html
<img src="/icons/heart.svg" width="16" height="16" alt="" />
```

The asset can be cached by the browser and CDN, which is great for repeat visits. But there are two
downsides: the first paint shows a flicker while the browser makes a second request to fetch the
image, and you **cannot style the SVG with CSS** — no recoloring via `currentColor`, no hover states.

### Inline SVG

The most common approach in React apps is to inline the SVG markup directly:

```jsx
function Heart(props) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...props}>
      <path d="M12 21s-7-4.5-9.5-8A5 5 0 0 1 12 6a5 5 0 0 1 9.5 7c-2.5 3.5-9.5 8-9.5 8z" />
    </svg>
  );
}
```

There's no second request and no flicker, and the SVG is fully styleable with CSS. The catch is
**bundle size**: every icon's path data ships inside your JavaScript bundle. The browser has to
download, parse, and evaluate all of it before anything renders, and large icon libraries (think
`react-icons` used carelessly) can balloon a bundle by megabytes. Inlining also adds a lot of DOM
nodes, which slows down rendering.

### Inline SVG using a spritesheet

A spritesheet gives you the best of both worlds. You define every icon once as a `<symbol>` inside a
single external SVG file, and reference it from your components with a `<use>` element:

```jsx
function Icon({ id, ...props }) {
  return (
    <svg width={16} height={16} {...props}>
      <use href={`/icon-sprite.svg#${id}`} />
    </svg>
  );
}
```

The path data lives in **one cacheable external file** (no bundle bloat), there's no per-icon
request waterfall, and because the icon is still inline SVG at render time you keep full CSS styling
(including `currentColor`). You can even `<link rel="preload">` the sprite to fetch it early:

```html
<link rel="preload" href="/icon-sprite.svg" as="image" type="image/svg+xml" />
```

This is the technique Figmage helps you generate.

## What a spritesheet looks like

A spritesheet is a single SVG that wraps each icon in a `<symbol>` with a unique `id` inside a
`<defs>` block:

```html
<!-- icon-sprite.svg -->
<svg xmlns="http://www.w3.org/2000/svg">
  <defs>
    <symbol viewBox="0 0 24 24" id="heart">
      <path d="..." />
    </symbol>
    <symbol viewBox="0 0 24 24" id="star">
      <path d="..." />
    </symbol>
  </defs>
</svg>
```

The `id` on each symbol is what your `<use href="...#id">` references. Keep the file reasonably small
(a good rule of thumb is under ~125kb) so it stays cheap to download and cache.

## Building a spritesheet with Figmage

Figmage can produce a spritesheet in two ways depending on where your icons live:

- Icons are SVG **components in Figma** → use the [`imageSprite` token type](/developers/token-types/#imagesprite) with `figmage sync`.
- Icons already exist as **SVG files in your repo** → use the [`figmage spritesheet`](/developers/cli/#spritesheet) command.

Both produce the same kind of output: one sprite SVG, and optionally a typed file of icon IDs so you
can reference symbols with type safety.

### From Figma with `sync`

If your icons are components in a Figma frame, add an `imageSprite` token to your `figmage.config.js`
and they'll be bundled into a sprite on every `figmage sync`:

```js
{
  name: "icons",
  type: "imageSprite",
  source: { frame: "Icons" },
  output: {
    fileName: "icon-sprite",
    directory: "./tokens/static",
    ids: {
      enabled: true,
      directory: "./tokens",
      fileName: "icon-sprite-ids",
      fileType: "ts",
    },
  },
}
```

Then run:

```bash
figmage sync

# or refresh just the icons
figmage sync --only=icons
```

This writes `./tokens/static/icon-sprite.svg` and, because `ids.enabled` is set, a typed
`./tokens/icon-sprite-ids.ts` listing every symbol ID in the sprite. By default Figmage optimizes the
SVGs with SVGO and converts hard-coded colors to `currentColor`, so the icons can be recolored from
CSS.

Use the typed IDs to keep your `<use>` references honest:

```ts
import { iconSpriteIds } from "./tokens/icon-sprite-ids";

type IconId = (typeof iconSpriteIds)[number];

function Icon({ id, ...props }: { id: IconId } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} {...props}>
      <use href={`/icon-sprite.svg#${id}`} />
    </svg>
  );
}
```

### From local SVG files with `spritesheet`

If your icons already live in the repo as individual `.svg` files (not in Figma), the dedicated
`spritesheet` command bundles a folder of SVGs into a single sprite — no Figma access or sync
required:

```bash
figmage spritesheet \
  --sprite-input ./icons \
  --sprite-output ./public \
  --sprite-filename icon-sprite \
  --sprite-ids-enabled \
  --sprite-ids-output ./src/tokens \
  --sprite-ids-filename icon-sprite-ids \
  --sprite-ids-filetype ts
```

Given an `./icons` directory of `.svg` files, this writes `./public/icon-sprite.svg` plus a typed
`./src/tokens/icon-sprite-ids.ts` listing every icon ID in the sprite.

Useful options:

- `--sprite-case <case>` — casing for the generated symbol IDs: `camel | kebab | snake | lower | pascal` (default: `kebab`).
- `--sprite-convert-colors` — convert hard-coded SVG colors to `currentColor` (default: `true`) so icons can be recolored via CSS.
- `--sprite-ids-enabled` — also emit a file of icon IDs for type-safe lookups.
- `--sprite-ids-filetype <type>` — `ts | js | json` (default: `ts`).

See the [CLI reference](/developers/cli/#spritesheet) for the full list of options.

## Which one should I use?

- Your icons are maintained by designers in Figma and you already run `figmage sync` → reach for the
  [`imageSprite` token type](/developers/token-types/#imagesprite). It keeps the sprite in sync with
  the source of truth automatically.
- Your icons are checked into the repo as SVG files, or come from a third-party icon set → use the
  [`spritesheet` command](/developers/cli/#spritesheet) to bundle them without touching Figma.

Either way you end up with a single, cacheable sprite SVG and a typed list of IDs — the
performance-friendly way to ship icons on the web.
