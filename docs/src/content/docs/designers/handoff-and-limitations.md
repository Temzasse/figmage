---
title: Handoff & Limitations
description: A final pre-sync checklist, plus the boundaries of what Figmage can extract.
sidebar:
  order: 6
---

You're almost there. This page has two jobs: a **checklist** to run before developers sync, and an
honest look at Figmage's **limitations** so there are no surprises.

## Pre-handoff checklist

Run through this before each handoff or sync to make sure Figmage gets clean, complete data.

**Access & publishing**

- [ ] Developers know how they'll get an [access token](/designers/publish-and-share/#the-access-token).
- [ ] The **file ID** has been shared.
- [ ] The file is **[published](/designers/publish-and-share/)** with your latest changes.

**Styles**

- [ ] Color styles are final and consistently named.
- [ ] Text styles are final and grouped by context (e.g. `Web`, `Native`).
- [ ] Shadows are defined as **drop-shadow** effect styles.

**Components**

- [ ] Spacing / sizing / radii scales exist as **components** with one value each.
- [ ] Icon and image components are complete and consistently named.
- [ ] Single-color and multicolor icons are in separate frames.

**Communication**

- [ ] Any pending renames or structural changes are flagged to developers in advance.

When every box is checked, developers can run `figmage sync` with confidence. 🎉

## Limitations

Figmage is intentionally focused and predictable. That's a strength — but it does mean there are
boundaries worth knowing as you prepare your file.

### What Figmage extracts

- **Color, text, and drop-shadow styles** become tokens automatically.
- **Spacing, sizing, and radii** must be modeled as **components** Figmage can measure.
- **Icons and images** must be **components** in a source frame to be exported.

### Things to keep in mind

- **If it isn't a supported style or a component, it won't sync.** A value tucked into a one-off layer
  is invisible — make it a style or a component first.
- **Only drop shadows are extracted** from effects. Inner shadows and blurs are skipped.
- **Unstable names create unstable code.** Renaming in Figma renames or removes tokens in code.
- **Nothing reaches developers until you publish.** Always re-publish after changes.

### A handy mental model

Whenever you want a value to appear in code, ask yourself:

> *"Is this a **published style**, or a **published component** Figmage can measure or export?"*

If yes, Figmage can pick it up. If no, it needs to become one first. Keep that question in mind and
your handoffs will go smoothly every time.
