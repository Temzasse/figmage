# Figma Tokenizer

## Quick start

### Installation

```sh
npm install -g figma-tokenizer
```

### Create a config

Create a file called `.figma-tokenizer.json` at the root of your project.

The config file should include two properties: `tokens` and `output`.

The `tokens` property is a list of all the design tokens that should be handled by Figma Tokenizer.

The `output` property tells Figma Tokenizer where to output the final tokens as JSON files.

```js
{
  "tokens": [
    { "name": "colors", "type": "color" },
    { "name": "gradients", "type": "linear-gradient" },
    { "name": "typography", "type": "text" },
    { "name": "shadows", "type": "drop-shadow" },
    { "name": "icons", "nodeId": "x:x", "type": "svg" },
    { "name": "spacing", "nodeId": "x:x", "type": "height" },
    { "name": "elevation", "nodeId": "x:x", "type": "width" },
    { "name": "sizing", "nodeId": "x:x", "type": "dimensions" },
    { "name": "radii", "nodeId": "x:x", "type": "radius" }
  ],
  "output": {
    "tokens": "./design-system/tokens.json",
    "icons": "./design-system/icons.json"
  }
}
```

### Setup environment variables

1. Get an [access token](https://www.figma.com/developers/api#access-tokens) for Figma API
2. Retrieve the file id of the Figma file
3. Create `.env` file (or any env file that is supported by [dotenv](https://github.com/motdotla/dotenv))
4. Paste the access token and the file id in the env file

```sh
FIGMA_ACCESS_TOKEN="xxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx"
FIGMA_FILE_ID="xxxxxxxxxxxxxxxxxxxxxx"
```

## Supported tokens

| Property          | Description                       |
| ----------------- | --------------------------------- |
| `color`           | Color fill styles                 |
| `linear-gradient` | Color linear gradient styles      |
| `text`            | Text styles                       |
| `drop-shadow`     | Drop/box shadow effect            |
| `width`           | Width of the node                 |
| `heigth`          | Height of the node                |
| `dimensions`      | Both width and height of the node |
| `radius`          | Border/corner radius of the node  |
| `svg`             | SVG asset (eg. an icon)           |

### Colors

Color tokens don't need a node id.

```js
{
  "tokens": [
    { "name": "colors", "type": "color" },
    // Other tokens...
  ]
}
```

### Typography

Typography tokens don't need a node id.

```js
{
  "tokens": [
    { "name": "typography", "type": "text" },
    // Other tokens...
  ]
}
```

### Effects

Effects in Figma include thigns like drop/inner shadows and blurs.

Only drop shadows are currently supported.

```js
{
  "tokens": [
    { "name": "shadows", "type": "drop-shadow" },
    // Other tokens...
  ]
}
```

### Dimensions

Properties: `width` | `height` | `dimensions` (both width and height).

```js
{
  "tokens": [
    { "name": "spacing", "nodeId": "x:x", "type": "height" },
    { "name": "elevation", "nodeId": "x:x", "type": "width" },
    { "name": "sizing", "nodeId": "x:x", "type": "dimensions" },
    // Other tokens...
  ]
}
```

### Border/corner radius

```js
{
  "tokens": [
    { "name": "radii", "nodeId": "x:x", "type": "radius" },
    // Other tokens...
  ]
}
```

### SVG assets

```js
{
  "tokens": [
    { "name": "icons", "nodeId": "x:x", "type": "svg" },
    // Other tokens...
  ]
}
```

## Name ideas

- figmaker
- figmain
- figmaster
- figmania
