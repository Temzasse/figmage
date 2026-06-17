---
title: Troubleshooting
description: Fix common Figmage setup, authentication, source, and sync issues.
sidebar:
  order: 10
---

Most Figmage failures fall into one of four buckets: credentials, publishing, source selection, or
output expectations. Start with the error message, then check the matching section below.

## Missing `accessToken` or `fileId`

Figmage stops before making API requests if either required value is missing.

Check that:

- Your `.env` file contains `FIGMA_ACCESS_TOKEN` and `FIGMA_FILE_ID`.
- Your config loads the env file with `import "dotenv/config";`.
- `dotenv` is installed if your config imports it.
- CI exposes the same variables to the job that runs `figmage sync`.

See [Install and Auth](/developers/install-and-auth/) for the full setup.

## Authentication or permission errors

If Figma rejects the request, check that:

- The access token was copied correctly and has read access to file content.
- The account that created the token can view the Figma file.
- The token has not been revoked.
- The file ID is copied from the file URL, not a page, frame, or node ID.

Treat the token like a password. Never paste it into a committed config file or public issue.

## Sync succeeds but output is empty

An empty sync usually means Figmage can connect to the file, but nothing matched the config.

Check that:

- The Figma library has been published after the latest changes.
- Style-based tokens have matching published styles: color, text, or drop-shadow styles.
- Source-based tokens point to a frame, frame ID, or component set that contains components.
- The `filter` predicate is not excluding every value.
- `--only` names match the `name` fields in `tokens`.

Run with verbose logging while debugging:

```bash
figmage sync --verbose
```

## Unknown names in `--only` or `--skip`

`--only` and `--skip` use token set names from `figmage.config.js`, not Figma style names.

```js
tokens: [
  { name: "colors", type: "color" },
  { name: "icons", type: "imageSprite", source: { frame: "Icons" } },
];
```

In this config, `figmage sync --only=colors` is valid. `figmage sync --only=Primary` is not, even if
`Primary` is a color style in Figma.

## Frame, component set, or property not found

For source-based tokens, check that:

- The frame name in config matches the Figma frame name exactly.
- A `frameId` uses the selected frame's `node-id` value from the Figma URL.
- The source contains components, not only groups, shapes, or text layers.
- Component set names match the published component set.
- `property` is a valid dot path such as `absoluteBoundingBox.width`,
  `absoluteBoundingBox.height`, or `cornerRadius`.

If a frame is renamed often, prefer `frameId` because it is more stable than the frame name.

## Icons lose their colors

Figmage optimizes SVGs and converts hard-coded colors to `currentColor` by default so single-color
icons can be styled in code. For multicolor icons, keep them in a separate frame and disable color
conversion for that token set:

```js
{
  name: "iconsMulticolor",
  type: "imageVector",
  source: { frame: "Icons Multicolor" },
  transform: { optimize: [["convertColors", false]] },
}
```

## Still stuck?

Use the [CLI reference](/developers/cli/) to confirm flags, then compare your config to the examples
in [Recipes](/developers/recipes/).
