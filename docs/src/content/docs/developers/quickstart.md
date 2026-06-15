---
title: Quickstart
description: Install Figmage, point it at your Figma file, and generate your first design tokens.
sidebar:
  order: 2
---

This is the fastest path from an empty project to real design tokens in your codebase. In about five
minutes you'll install Figmage, connect it to Figma, and run your first sync. Each step links to a
deeper page if you want the full story.

## 1. Install Figmage

Add it as a dev dependency:

```bash
npm install --save-dev figmage
```

Prefer not to install? Every command also works through `npx figmage …`.

> See [Install and Auth](/developers/install-and-auth/) for global installs and other package
> managers.

## 2. Add your credentials

Figmage reads your file through the Figma REST API, so it needs an **access token** and a **file
ID**. Keep them out of source control with a `.env` file:

```dotenv
FIGMA_ACCESS_TOKEN="figd_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
FIGMA_FILE_ID="xxxxxxxxxxxxxxxxxxxxxx"
```

> Need a token or unsure where to find the file ID? [Install and Auth](/developers/install-and-auth/)
> walks through creating a read-only token and locating your file ID.

## 3. Create a config

Add a `figmage.config.js` to your project root. This minimal config pulls three common style-based
token sets — colors, typography, and shadows:

```js
// figmage.config.js
import "dotenv/config";
import { defineConfig } from "figmage";

export default defineConfig({
  accessToken: process.env.FIGMA_ACCESS_TOKEN,
  fileId: process.env.FIGMA_FILE_ID,
  output: {
    directory: "./tokens",
    fileType: "ts",
  },
  tokens: [
    { name: "colors", type: "color" },
    { name: "typography", type: "text" },
    { name: "shadows", type: "dropShadow" },
  ],
});
```

The `defineConfig` helper gives you full autocompletion and type-checking.

> Every field — global defaults, per-token overrides, output options — is covered in
> [Configuration](/developers/configuration/).

## 4. Run sync

```bash
figmage sync
```

Here's what happens under the hood:

1. Figmage fetches the published styles from your Figma file.
2. It writes a token file per set under `./tokens` (`colors.ts`, `typography.ts`, `shadows.ts`).
3. File names come from each token's `name`, unless you override `output.fileName`.

> The `sync` command — plus filtering and the `spritesheet` command — is documented in the
> [CLI reference](/developers/cli/).

## 5. Use the tokens

Import the generated files anywhere in your app:

```ts
import { colors } from "./tokens/colors";

const primary = colors.primary;
```

Because the output is TypeScript, your editor autocompletes token names and flags typos at build
time.

## Sync only what changed

Once your config grows, you rarely need to regenerate everything. Narrow a run with `--only` or
`--skip`:

```bash
# Only these token sets
figmage sync --only=colors,typography

# Everything except these
figmage sync --skip=shadows
```

> More on selective syncing in the [CLI reference](/developers/cli/#filtering-with-only-and-skip).

## Where to go next

You now have a working sync. From here you can go deeper:

- **Measure scales and export icons** — spacing, radii, and image assets come from components. See
  [Token Types](/developers/token-types/#source-based-tokens).
- **Shape the output** — color formats, units, casing, and file types. See
  [Configuration](/developers/configuration/).
- **Automate it** — wire `figmage sync` into CI. See [Install and Auth](/developers/install-and-auth/#in-ci).
