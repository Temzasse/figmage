---
title: Developers
description: Use the Figmage CLI to turn Figma styles and components into design tokens as code.
sidebar:
  order: 1
---

This section is for engineers who configure and run Figmage. If you're new here, start with
[Getting Started](/introduction/getting-started/), or read [Why Figmage](/introduction/why-figmage/)
for the bigger picture.

## What this track covers

Use this track when you need to install the CLI, connect to Figma, write `figmage.config.js`, sync
tokens, shape generated output, or automate Figmage in CI.

This track does **not** cover how to design the source library in Figma. For naming, publishing,
styles, components, and designer handoff, use the [designer docs](/designers/).

| Designers prepare | Developers configure |
| ----------------- | -------------------- |
| Published styles and components | Access token and file ID |
| Stable names and source frames | `figmage.config.js` token sets |
| Handoff notes for changes | Generated files consumed by the app |

## Reading path

1. [Quickstart](/developers/quickstart/) — install, configure, and run your first sync.
2. [Install and Auth](/developers/install-and-auth/) — the full setup, access tokens, and file IDs.
3. [Configuration](/developers/configuration/) — every `figmage.config.js` option.
4. [Token Types](/developers/token-types/) — everything Figmage can generate.
5. [Spritesheets](/developers/spritesheets/) — why and how to generate SVG sprite sheets for your icons
6. [CLI](/developers/cli/) — the complete command reference.
7. [CI](/developers/ci/) — run Figmage safely in automated jobs.
8. [Recipes](/developers/recipes/) — copyable patterns for common token setups.
9. [Troubleshooting](/developers/troubleshooting/) — common setup and sync failures.
10. [Migrating from v1](/developers/migrating-from-v1/) — upgrade from the old tokenize/codegen flow.
