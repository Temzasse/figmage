---
title: Component Sets for Properties
description: Build component sources for spacing, sizing, radii, and other measured properties.
---

Property tokens are extracted from components, not from style definitions.

## Source options developers can use

1. Published component set name
2. Frame name
3. Frame node ID

## How to structure property sources

1. Create dedicated component sets for scales like spacing and radii.
2. Keep one semantic value per component.
3. Use explicit names such as `Spacing/Small` and `Radii/Medium`.

## Common measured properties

1. `absoluteBoundingBox.width`
2. `absoluteBoundingBox.height`
3. `cornerRadius`
