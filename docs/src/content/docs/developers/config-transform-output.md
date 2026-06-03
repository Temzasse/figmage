---
title: Config Transform and Output
description: Set global formatting defaults and per-token output overrides.
---

## Global transform defaults

Use `transform` at config root to set shared behavior:

```js
transform: {
  defaultCasing: "camel",
  defaultColorFormat: "hsl",
  defaultTextFormat: "rem",
  defaultPropertyFormat: "px",
  defaultImageFormat: "svg",
  baseFontSize: 16,
}
```

## Global output defaults

Use root `output` to define default location and file type:

```js
output: {
  directory: "./tokens",
  fileType: "ts",
}
```

## Per-token overrides

Each token can override transform and output:

```js
{
  name: "spacing",
  type: "property",
  transform: { casing: "lower", format: "px" },
  output: { fileName: "spacing-scale", fileType: "json" }
}
```

## Sprite output options for image tokens

For `type: "image"`, output supports sprite options:

```js
output: {
  fileName: "icon-sprite",
  directory: "./tokens/static",
  sprite: {
    idsEnabled: true,
    idsDirectory: "./tokens",
    idsFileName: "icon-sprite-ids",
    idsFileType: "ts"
  }
}
```
