---
title: Styles & Variables
description: Create the color, text, and effect styles that become your core design tokens.
sidebar:
  order: 2
---

Every design system starts with a handful of reusable decisions: *this* is our brand color, *this*
is our body text, *this* is our card shadow. In Figma you capture those decisions as **styles** (and,
on supported plans, **variables**). Figmage reads them directly and turns each one into a named token
that developers import.

Here's the golden rule, and honestly it's most of the job:

> **If a value should be reused, make it a style or variable — never a one-off.** A color typed
> straight onto a single shape is invisible to Figmage. The same color saved as a style becomes a
> token the whole product can use.

The three style types below map straight to Figmage's core token types.

## 🎨 Colors

Create a **color style** for every meaningful color — brand colors, backgrounds, text colors, borders,
states.

1. Select a shape and set its fill to the color you want.
2. In the **Fill** section of the right panel, click the **style** icon (the four dots).
3. Click **+ Create style** and give it a clear, purpose-based name like `Primary` or `Surface`.

Each color style becomes a `color` token. Want light and dark variants grouped separately in code?
Prefix the names with a folder, like `Light/Surface` and `Dark/Surface` — see
[Naming & Grouping](/designers/naming-and-grouping/).

## 🔤 Typography

Create a **text style** for each *role* in your type system — not for each individual size, but for
the jobs text does: titles, subtitles, body, captions, overlines.

1. Select a text layer and set its font, size, weight, line height, and letter spacing.
2. In the **Text** section, click the **style** icon, then **+ Create style**.
3. Name it by role — `Title 1`, `Body`, `Caption` — never by appearance like `Bold 24`.

Each text style becomes a `text` token carrying the full recipe: font family, size, weight, line
height, letter spacing, and text transform.

## 🌑 Effects (shadows)

Create an **effect style** for each elevation level in your system.

1. Add a **Drop shadow** effect to a layer and tune its offset, blur, and color.
2. In the **Effects** section, click the **style** icon, then **+ Create style**.
3. Name it by intent — `Shadow Small`, `Shadow Medium`, `Shadow Large`.

Each one becomes a `dropShadow` token.

> **Good to know:** Figmage currently extracts **drop shadows** only. Inner shadows and layer/
> background blurs are skipped, so don't rely on them for tokens.

## A note on variables

[Figma **variables**](https://help.figma.com/hc/en-us/articles/15145852043927-Create-and-manage-variables-and-collections)
are a newer, more powerful way to store reusable values — and they shine for things like light/dark
modes. Modeling your system with variables is great, future-friendly practice.

> **Heads up: Figmage doesn't read variables yet.** Today Figmage builds tokens from **styles**
> (color, text, and effect styles) and from components — not from variables. The reason is on Figma's
> side: the [Variables REST API](https://developers.figma.com/docs/rest-api/variables/) is gated to
> Enterprise customers ("you must have a Full seat in an Enterprise org"), so Figmage can't reach
> variables on most plans. **If you want a value to become a token today, capture it as a style** (or
> as a component, for things like spacing and sizing).

It's still perfectly fine to use variables in your design work — just make sure anything Figmage
should generate also exists as a published style or component.

In fact, variables and Figmage's component sources pair really well. You can **bind component
properties to variables** — for example, link a component's width, height, or corner radius to a
spacing/sizing variable. Figmage measures the component, so when you update the variable, the
component updates with it and your next sync picks up the new value automatically. That keeps the
component sources Figmage reads perfectly in step with the variables they represent. See
[Components](/designers/components/) for how measured property tokens work.

Whether you use styles, variables, or a mix, what matters most to Figmage is the same three things:
the values are **reusable**, **clearly named**, and part of a **published** library.

## Quick tips

- Use stable, semantic names — avoid `New Color` or `Untitled Style`.
- Keep one consistent naming pattern within each family.
- Use top-level folders (`Light/`, `Dark/`, `Web/`, `Native/`) to control how tokens are grouped.

Next: model the values Figma has no style for — spacing, sizing, icons — over in
[Components](/designers/components/).
