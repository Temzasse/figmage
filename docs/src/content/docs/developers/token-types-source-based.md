---
title: Token Types Source Based
description: Configure property and image token extraction from component sets or frames.
---

`property` and `image` tokens require a `source` configuration.

## Source patterns

Use one of these source strategies:

1. `componentSet: "<Published component set name>"`
2. `frame: "<Frame name>"`
3. `frameId: "<node-id like 123:456>"`

## property tokens

`property` tokens read a value using a dot path from each source component.

```js
{
  name: "spacing",
  type: "property",
  source: {
    componentSet: "Spacing",
    property: "absoluteBoundingBox.width",
  },
}
```

## image tokens

`image` tokens export image assets from components.

```js
{
  name: "icons",
  type: "image",
  source: { frame: "Figmage - Icons" },
  transform: { format: "svg" },
}
```

## Example with both

```js
tokens: [
  {
    name: "radii",
    type: "property",
    source: { componentSet: "Radii", property: "cornerRadius" },
  },
  {
    name: "icons",
    type: "image",
    source: { frameId: "123:456" },
    output: {
      fileName: "icon-sprite",
      sprite: { idsEnabled: true },
    },
  },
];
```
