---
title: CLI spritesheet Command
description: Generate an SVG sprite sheet and optional IDs file from local SVG assets.
---

## Command

```bash
figmage spritesheet [options]
```

## Required options

- `--sprite-input <path>` Directory containing source SVG files.
- `--sprite-output <path>` Directory where the generated sprite SVG is written.
- `--sprite-filename <name>` Output file name without extension.

## Optional options

- `--sprite-case <case>` `camel | kebab | snake | lower | pascal` (default: `kebab`)
- `--sprite-convert-colors` Convert hard-coded SVG colors during processing.
- `--sprite-ids-enabled` Generate a file containing icon IDs.
- `--sprite-ids-output <path>` Directory for ID file output.
- `--sprite-ids-filename <name>` ID file name without extension.
- `--sprite-ids-filetype <type>` `ts | js | json` (default: `ts`)

## Example

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
