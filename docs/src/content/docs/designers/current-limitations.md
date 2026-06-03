---
title: Current Limitations
description: Known constraints to consider when preparing Figma data for Figmage.
---

## Scope limits to account for

1. Figmage token extraction is based on currently supported token types in config.
2. Core style extraction is focused on color, text, and drop shadow styles.
3. Property and image extraction require component-based sources.

## Practical implications

1. If a value is not represented as a supported style or component source, it will not be synced.
2. Unstable naming in Figma causes unstable token names in output.
3. Mixed responsibilities in one source frame make code output harder to maintain.
