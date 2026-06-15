---
title: Install and Auth
description: Install Figmage and connect it to the Figma REST API with an access token and file ID.
sidebar:
  order: 3
---

Figmage talks to the Figma REST API on your behalf, so it needs two pieces of information:

1. A **personal access token** that authorizes API requests.
2. The **file ID** of the published Figma library you want to sync from.

## Install Figmage

Install it as a dev dependency in your project:

```bash
npm install --save-dev figmage
```

Or run it on demand without installing:

```bash
npx figmage sync
```

You can also install it globally if you prefer a system-wide command:

```bash
npm install -g figmage
```

## Create a Figma API access token

A personal access token lets Figmage read your file through the REST API.

1. Sign in to Figma and open **Settings** (click your avatar in the top-left, then **Settings**).
2. Go to the **Security** tab.
3. Under **Personal access tokens**, click **Generate new token**.
4. Give the token a descriptive name (for example `figmage`).
5. Set the **File content** scope to at least **Read-only**. This is the scope Figmage needs to
   read styles, components, and images.
6. Click **Generate token** and **copy the token immediately** — Figma only shows it once.

> Treat the token like a password. Anyone with it can read your Figma files. Never commit it to
> source control.

For reference, see Figma's docs on
[access tokens](https://www.figma.com/developers/api#access-tokens).

## Find your Figma file ID

The file ID is part of the file URL. Open the file in Figma and look at the address bar:

```
https://www.figma.com/design/<fileId>/<file-name>?node-id=...
```

The `<fileId>` segment (a long alphanumeric string right after `/design/` or `/file/`) is the value
Figmage needs.

> The file must be **published as a library** so its styles and components are available through the
> REST API. See the designer guide on
> [publishing a library](/designers/publish-and-share/) for details.

## Store credentials with dotenv

Keep secrets out of your config file by loading them from the environment. Create a `.env` file in
your project root:

```dotenv
FIGMA_ACCESS_TOKEN="figd_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
FIGMA_FILE_ID="xxxxxxxxxxxxxxxxxxxxxx"
```

Add `.env` to your `.gitignore` so it is never committed.

## Wire credentials into the config

Figmage reads its configuration from `figmage.config.js`. Load the env file at the top and pass the
values to `defineConfig`:

```js
// figmage.config.js
import "dotenv/config";
import { defineConfig } from "figmage";

export default defineConfig({
  accessToken: process.env.FIGMA_ACCESS_TOKEN,
  fileId: process.env.FIGMA_FILE_ID,
  tokens: [{ name: "colors", type: "color" }],
});
```

`accessToken` and `fileId` are both required. If either is missing, `figmage sync` exits with an
error before making any requests.

## In CI

Don't commit `.env`. Instead, store `FIGMA_ACCESS_TOKEN` and `FIGMA_FILE_ID` as secrets in your CI
provider and expose them as environment variables for the job that runs `figmage sync`.

## Custom config path

The default config path is `figmage.config.js` in the current working directory. Point to another
location with `--config`:

```bash
figmage sync --config ./configs/figmage.config.js
```
