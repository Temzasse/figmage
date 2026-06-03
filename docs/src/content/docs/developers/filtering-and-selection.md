---
title: Filtering and Selection
description: Sync only selected token groups with the --only option.
---

Use `--only` to limit sync to specific token names from your config.

## Syntax

```bash
figmage sync --only=colors,typography
```

## Behavior

1. The argument is split by comma.
2. Whitespace is trimmed.
3. Duplicate names are removed.
4. Empty input is treated as invalid.

## Good practices

1. Keep token names stable in config to make partial sync predictable.
2. Use focused names like `icons` and `spacing` instead of generic names.
3. Use `--only` in CI jobs where you intentionally sync a subset.
