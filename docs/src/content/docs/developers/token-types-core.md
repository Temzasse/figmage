---
title: Token Types Core
description: Style-based token types extracted directly from Figma styles.
---

These token types do not require a `source` field.

## color

Reads Figma color styles.

```js
{ name: "colors", type: "color" }
```

## text

Reads Figma text styles.

```js
{ name: "typography", type: "text" }
```

## dropShadow

Reads Figma effect styles where the effect is a drop shadow.

```js
{ name: "shadows", type: "dropShadow" }
```

## Example

```js
tokens: [
  { name: "colors", type: "color" },
  { name: "typography", type: "text" },
  { name: "shadows", type: "dropShadow" },
];
```
