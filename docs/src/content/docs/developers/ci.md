---
title: CI
description: Run Figmage safely in continuous integration with Figma credentials and predictable output.
sidebar:
  order: 8
---

Running Figmage in CI is useful when generated tokens should stay fresh as part of your build,
release, or design-system update workflow.

## Store credentials as secrets

Do not commit `.env` to your repository. Store these values in your CI provider's secret manager:

```dotenv
FIGMA_ACCESS_TOKEN="figd_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
FIGMA_FILE_ID="xxxxxxxxxxxxxxxxxxxxxx"
```

Expose them to the job that runs `figmage sync`. Your config can stay the same as local development:

```js
import "dotenv/config";
import { defineConfig } from "figmage";

export default defineConfig({
  accessToken: process.env.FIGMA_ACCESS_TOKEN,
  fileId: process.env.FIGMA_FILE_ID,
  tokens: [{ name: "colors", type: "color" }],
});
```

In CI, the variables usually come from the provider instead of a physical `.env` file.

## Example job shape

The exact YAML depends on your CI provider, but the flow is always the same:

```bash
npm ci
npm run figmage:sync
npm test
```

Add a package script so the command is easy to reuse:

```json
{
  "scripts": {
    "figmage:sync": "figmage sync"
  }
}
```

## Commit generated output?

Choose one policy and keep it consistent:

| Policy | Use when | Trade-off |
| ------ | -------- | --------- |
| Commit generated tokens | Apps need reviewable diffs and deterministic builds | Pull requests include generated file changes |
| Generate during CI/build | Tokens are build artifacts and should not be edited | Builds depend on Figma API access |

For most product apps, committing generated tokens is easier to review and safer for deploys. For
tooling pipelines, generated artifacts can be acceptable if the CI environment always has access to
Figma.

## Sync only part of the system

Use `--only` for focused jobs, such as refreshing only icons after the icon frame changes:

```bash
figmage sync --only=icons
```

Use `--skip` when one large token set is intentionally excluded:

```bash
figmage sync --skip=assets
```

Keep token set names stable so these jobs do not break when designers rename individual styles or
components.

## Failure handling

CI failures usually mean the token is missing, the file ID is wrong, the library was not published,
or a source frame/component set was renamed. See [Troubleshooting](/developers/troubleshooting/) for
the checklist.
