---
title: CLI
description: Reference for the Figmage command line interface — sync and spritesheet.
sidebar:
  order: 7
---

Figmage ships a single command line tool, `figmage`, with two commands:

- [`sync`](#sync) — read your Figma library and generate design token files.
- [`spritesheet`](#spritesheet) — bundle local SVG files into a single sprite sheet.

```bash
figmage <command> [options]
```

## Global options

These flags work with any command:

- `-h, --help` Show help.
- `-v, --version` Show the installed Figmage version.
- `-V, --verbose` Enable verbose logging (useful for debugging API or config issues).

## sync

Reads your published Figma library and writes design token files to disk based on your config.

```bash
figmage sync [options]
```

### Options

- `-c, --config <path>` Path to the config file. Default: `figmage.config.js`.
- `--only <names>` Comma-separated token names to sync, e.g. `colors,typography`. Everything else is
  skipped.
- `--skip <names>` Comma-separated token names to exclude, e.g. `icons,assets`. Everything else is
  synced.

`--only` and `--skip` are mutually exclusive — pass at most one of them.

### Examples

```bash
# Sync every token defined in the config
figmage sync

# Use a custom config path
figmage sync -c ./configs/figmage.config.js

# Sync just a subset
figmage sync --only=colors,icons

# Sync everything except a subset
figmage sync --skip=assets

# Verbose output for debugging
figmage sync --verbose
```

### Filtering with --only and --skip

By default `figmage sync` processes every token in your config. When you only need to refresh part
of your design system, use `--only` or `--skip` to narrow the run. Both accept a comma-separated
list of token **names** (the `name` field of each entry in your `tokens` array).

How the values are parsed:

1. Split by comma, trimmed of whitespace, and de-duplicated.
2. Empty input (e.g. `--only=`) is treated as invalid and fails the command.
3. `--only` and `--skip` cannot be used together.

Good practices:

1. Keep token names stable in config so partial syncs stay predictable.
2. Use focused, descriptive names like `icons` and `spacing` rather than generic ones.
3. Reach for `--only` in CI jobs that intentionally refresh a single token group (for example, a
   pipeline that re-exports icons whenever the icon frame changes).

### Validation behavior

- Fails if `accessToken` or `fileId` is missing from the resolved config.
- Fails if `--only` or `--skip` is provided but contains no valid names.
- Fails if both `--only` and `--skip` are provided at the same time.

## spritesheet

Bundles a folder of existing SVG files into a single SVG sprite sheet. Use it when your icons
already live in your repo as SVG files rather than in Figma. (To build a sprite directly from Figma
components, use the [`imageSprite` token type](/developers/token-types/#imagesprite) instead.)

```bash
figmage spritesheet [options]
```

### Required options

- `--sprite-input <path>` Directory containing source SVG files.
- `--sprite-output <path>` Directory where the generated sprite SVG is written.
- `--sprite-filename <name>` Output file name without extension.

### Optional options

- `--sprite-case <case>` Symbol ID casing: `camel | kebab | snake | lower | pascal` (default: `kebab`).
- `--sprite-convert-colors` Convert hard-coded SVG colors to `currentColor` (default: `true`).
- `--sprite-ids-enabled` Also generate a file containing the icon IDs (useful for type safety).
- `--sprite-ids-output <path>` Directory for the IDs file.
- `--sprite-ids-filename <name>` IDs file name without extension.
- `--sprite-ids-filetype <type>` IDs file type: `ts | js | json` (default: `ts`).

### Example

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

Given an `./icons` directory of `.svg` files, this writes `./public/icon-sprite.svg` and a typed
`./src/tokens/icon-sprite-ids.ts` listing every icon ID in the sprite.
