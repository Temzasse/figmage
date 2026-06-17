---
title: Recipes
description: Copyable Figmage config patterns for common token setups.
sidebar:
  order: 9
---

These examples are starting points. Adjust source names, output paths, and casing to match your
design system and codebase.

## Light and dark color groups

Ask designers to name styles with top-level folders such as `Light/Surface` and `Dark/Surface`.
Figmage turns those folders into groups in the generated file.

```js
{
  name: "colors",
  type: "color",
  transform: { format: "hsl", casing: "camel" },
}
```

## Typography in `rem`

The default text format is `rem`. Set `baseFontSize` if your product uses a non-16px base.

```js
export default defineConfig({
  transform: {
    defaultTextFormat: "rem",
    baseFontSize: 16,
  },
  tokens: [{ name: "typography", type: "text" }],
});
```

## Spacing scale from components

Create one component per spacing step in Figma. Make each component's width equal the represented
spacing value.

```js
{
  name: "spacing",
  type: "property",
  source: {
    componentSet: "Spacing",
    property: "absoluteBoundingBox.width",
  },
  transform: { format: "px" },
}
```

## Radius scale from components

Create one component per radius step and set each component's corner radius to the value.

```js
{
  name: "radii",
  type: "property",
  source: {
    componentSet: "Radii",
    property: "cornerRadius",
  },
}
```

## SVG icon sprite from Figma

Use this when designers maintain icons as Figma components.

```js
{
  name: "icons",
  type: "imageSprite",
  source: { frame: "Icons" },
  output: {
    directory: "./public",
    fileName: "icon-sprite",
    ids: {
      enabled: true,
      directory: "./src/tokens",
      fileName: "icon-sprite-ids",
      fileType: "ts",
    },
  },
}
```

## Multicolor icons

Keep multicolor icons separate from single-color icons and disable color conversion.

```js
{
  name: "iconsMulticolor",
  type: "imageVector",
  source: { frame: "Icons Multicolor" },
  output: { directory: "./src/assets/icons", fileType: "svg" },
  transform: { optimize: [["convertColors", false]] },
}
```

## JSON output for tools

Use JSON when another design-system tool or build pipeline should consume the tokens.

```js
{
  name: "colors",
  type: "color",
  output: {
    directory: "./tokens",
    fileType: "json",
  },
}
```

## Raster assets

Use raster output for illustrations, logos, and artwork that should be exported as images.

```js
{
  name: "assets",
  type: "imageRaster",
  source: { frame: "Assets" },
  output: { directory: "./public/assets" },
  transform: { format: "png", scale: 2 },
}
```

For failure cases, see [Troubleshooting](/developers/troubleshooting/). For all fields, see
[Configuration](/developers/configuration/) and [Token Types](/developers/token-types/).
