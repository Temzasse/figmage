---
title: Naming & Grouping
description: Your Figma names become code — treat them as the shared API between design and development.
sidebar:
  order: 4
---

This might be the most important page in the whole section. When Figmage generates code, it uses
**your Figma names** as the token names developers type every single day. A color named `Primary`
becomes a `primary` token; a text style `Body Large` becomes `bodyLarge`. You're not just labeling
layers — you're authoring the **shared vocabulary** between design and engineering.

Treat your names as a **contract**. Thoughtful, stable names produce a clean, predictable codebase
that's a joy to build on. Random or shifting names produce confusion, bugs, and rework.

## Naming rules

| Good | Avoid | Why |
| ---- | ----- | --- |
| `Surface` | `Light Gray 3` | Purpose survives visual changes. |
| `Body`, `Caption`, `Title` | `Inter 16`, `Bold 24` | Roles are easier to use in products. |
| `Spacing/Small` | `Rectangle 12` | The name tells developers what the value means. |
| `arrow-left` | `Icon 23` | Code-facing names should be readable and searchable. |

Use these rules as your baseline:

- **Describe purpose, not appearance.** The color might change to off-white next quarter, but it's
  still the surface.
- **Keep names stable.** Renaming in Figma renames or removes the token in code, which can break a
  developer's work. Rename deliberately, not casually.
- **One pattern per family.** Pick a convention for colors, another for text styles, and stick to it.
- **Avoid tool defaults.** `New Color`, `Style 2`, and `Untitled` are red flags that a value isn't
  ready to ship.

## Casing is up to the developers

Here's some good news: you don't need to worry about **casing**. Whether you write `Body Large`,
`body-large`, or `Body/Large`, developers can freely transform it on their side — Figmage lets them
output `kebab-case`, `camelCase`, or whatever their codebase prefers. So the exact letter-casing you
use in Figma doesn't really matter.

What *does* matter is **consistency**. Pick a style of writing names — title case, sentence case,
whatever feels natural — and apply it the same way across all your styles, variables, and components.
Consistent names are easier to scan, easier to group, and make the eventual transform predictable for
everyone.

## Grouping with folders

Figmage groups tokens by the **top-level folder** in a name, using the `/` separator. This is a
simple, powerful way to shape how tokens are organized in code — and it works for *every* token type:

| Figma name(s)                   | Resulting groups          |
| ------------------------------- | ------------------------- |
| `Light/Surface`, `Dark/Surface` | `light`, `dark` colors    |
| `Web/Body`, `Native/Body`       | `web`, `native` type      |
| `Spacing/Small`, `Spacing/Medium` | a grouped `spacing` scale |

So the folder structure you give your names *is* the structure developers get in code. A little care
here pays off across the entire system.

## From Figma name to code name

Developers can choose casing in Figmage, but the structure still comes from your Figma names:

| Figma name | With camel casing | What developers import |
| ---------- | ----------------- | ---------------------- |
| `Light/Surface` | group `light`, token `surface` | `colors.light.surface` |
| `Web/Body Large` | group `web`, token `bodyLarge` | `typography.web.bodyLarge` |
| `Spacing/Small` | group `spacing`, token `small` | a grouped spacing token, depending on the developer's source config |

The exact import path depends on the developer's config, but stable Figma names are what keep the
generated code stable.

## A healthy review cadence

Names are a contract, so manage changes to them like one:

- **Review names before each release** of the library.
- **Freeze naming** while developers are mid-implementation — surprise renames mid-sprint are
  painful.
- **Announce planned renames** ahead of time so developers can prepare for the change.

With your names solid, you're ready to make everything official in
[Publish & Share](/designers/publish-and-share/).

Before publishing a rename-heavy update, run the
[handoff checklist](/designers/handoff-and-limitations/#pre-handoff-checklist) and call out the
planned breaking changes.
