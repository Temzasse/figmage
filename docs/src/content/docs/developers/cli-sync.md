---
title: CLI sync Command
description: Reference for figmage sync and related global options.
---

## Command

```bash
figmage sync [options]
```

## Global options

- `-h, --help` Show help.
- `-v, --version` Show current version.
- `-V, --verbose` Enable verbose logging.

## sync options

- `-c, --config <path>` Path to config file. Default: `figmage.config.js`
- `--only <names>` Comma-separated token names, for example `colors,typography`

## Examples

```bash
figmage sync
figmage sync -c ./configs/figmage.config.js
figmage sync --only=colors,icons
```

## Validation behavior

- The command fails if `accessToken` or `fileId` is missing.
- The command fails if `--only` is provided but contains no valid names.
