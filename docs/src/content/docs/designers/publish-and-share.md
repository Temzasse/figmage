---
title: Publish & Share
description: Publish your library and share the access details developers need to connect Figmage.
sidebar:
  order: 5
---

You've built styles, components, and clean names. Now make them **real** to the outside world.
Figmage reads your file through Figma's API, and that API only sees what you've **published as a
library**. This page covers the two parts of going live: publishing, and sharing the details
developers need to connect.

## Publishing your library

Think of publishing as pressing "save" on the version of your design system that everyone else — and
Figmage — gets to see. Change a color but don't re-publish? Figmage will still read the old one.
Publishing is the step that makes your work official.

### What gets published

When you publish a file as a library, you make all of this available to Figmage:

- **Color, text, and effect styles** → color, typography, and shadow tokens.
- **Variables** (on supported plans) → reusable values.
- **Components and component sets** → measured scales (spacing, radii) and exported icons/images.

> **You'll need a paid plan.** Libraries are only available on Figma's paid plans. On the free
> Starter plan you can still create styles, components, and variables — you just can't publish them
> as a library for Figmage to read. The file also has to live in a **project**, not your drafts, and
> the library inherits its name from the source file, so give the file a clear name like
> "Habitz design system".

### How to publish

1. Open the file that contains your design system.
2. Open the **Assets** tab (the book icon) in the left sidebar.
3. Click the **Libraries** icon (the tooltip may read **Review unpublished changes**).
4. Find your current file under **This file** and click **Publish**.
5. Add a short description, review the list of added/modified/removed assets, and uncheck anything you
   don't want to share.
6. Click **Publish**.

> **Tip:** To keep a work-in-progress style or component out of the library for good, right-click it
> in the publish dialog and choose **Hide when publishing**. If the **Publish** button is greyed out,
> it usually means there are no publishable changes since last time, or the file has no styles,
> components, or variables yet.

For the full walkthrough and plan-specific options, see Figma's official guide:
[Publish a library](https://help.figma.com/hc/en-us/articles/360025508373-Publish-a-library).

### Re-publish after every change

Publishing isn't one-and-done. Each time you add, rename, or update something that should reach
developers:

1. Make your change.
2. Re-open the publish dialog.
3. Review the diff and **Publish** again.
4. Let your developers know they can run a fresh sync.

A simple rhythm to settle into: **design → name cleanly → publish → developers sync → product
updates.**

## Sharing access with developers

To connect Figmage to your file, a developer needs two things. As the designer you can provide them —
or at least point the way.

### The access token

An **access token** is like a key that lets Figmage read Figma files. It can come from any account
with access to the file — often a developer makes their own, but a shared team account works too.

If you're generating it:

1. Open **Settings** from your Figma avatar menu.
2. Go to the **Security** tab.
3. Under **Personal access tokens**, click **Generate new token**, name it, and give it
   **read-only file access**.
4. Copy the token — Figma shows it only once.

> The token is a secret, like a password. Share it only through a secure channel your team trusts —
> a password manager or your CI secret store — never in chat, comments, or design files. A personal
> access token can reach **all** of your Figma files and can't be scoped to a single one, so treat it
> carefully and **revoke** it from the same Security tab if it's ever no longer needed.

For step-by-step help generating, managing, or revoking tokens, see Figma's guide:
[Manage personal access tokens](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens).

### The file ID

The **file ID** identifies which file Figmage should read. Find it in the file's URL:

```
https://www.figma.com/design/<fileId>/Your-Design-System
```

The long string right after `/design/` (or `/file/`) is the file ID. Copy that part and share it.

### What to hand off

Give your developers:

1. **How they'll get the token** (or that they should generate their own).
2. **The file ID** of the library.
3. **Which token groups** you expect them to sync — colors, typography, icons, spacing, and so on.

One last pass before you hand off? Run the [Handoff & Limitations](/designers/handoff-and-limitations/)
checklist.
