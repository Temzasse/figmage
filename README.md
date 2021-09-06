# 🧙‍♂️ Figmage

## Installation

This tool can be used as a global package if you don't want to include it as a dependency in each of your projects:

```sh
npm install -g figmage
```

You can also utilize `npx` to run this tool without installing it:

```sh
npx figmage --config ./path/to/.figmage.json
```

Or you can install it locally in your project:

```sh
npm install figmage
```

### Environment variables

1. Get an [access token](https://www.figma.com/developers/api#access-tokens) for Figma API
2. Retrieve the file id of the Figma file
3. Create `.env` file (or any env file that is supported by [dotenv](https://github.com/motdotla/dotenv))
4. Paste the access token and the file id in the env file

```sh
FIGMA_ACCESS_TOKEN="xxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx"
FIGMA_FILE_ID="xxxxxxxxxxxxxxxxxxxxxx"
```

## Configuration

Create a file called `.figmage.json` or `.figmagerc` in your project or add the config in your `package.json` under `"figmage"` key.

The config has two concepts: `tokens` and `codegen`.

### Tokens

The `tokens` property is a list of all the design tokens that should be handled by Figma Tokenizer.

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
  ]
}
```

#### Supported tokens

| Property          | Description                                                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`           | [Fill color styles](https://help.figma.com/hc/en-us/articles/360038746534-Create-styles-for-colors-text-effects-and-layout-grids#Colors_paints)            |
| `linear-gradient` | [Linear gradient color styles](https://help.figma.com/hc/en-us/articles/360038746534-Create-styles-for-colors-text-effects-and-layout-grids#Colors_paints) |
| `text`            | [Text styles](https://help.figma.com/hc/en-us/articles/360038746534-Create-styles-for-colors-text-effects-and-layout-grids#Text)                           |
| `drop-shadow`     | [Drop shadow effect](https://help.figma.com/hc/en-us/articles/360038746534-Create-styles-for-colors-text-effects-and-layout-grids#Effects)                 |
| `width`           | Width of the component                                                                                                                                     |
| `heigth`          | Height of the component                                                                                                                                    |
| `dimensions`      | Both width and height of the component                                                                                                                     |
| `radius`          | Corner radius of the component                                                                                                                             |
| `svg`             | Vector graphics component (eg. an icon)                                                                                                                    |

##### Colors

Color tokens are parsed from the global color variables that you have created in Figma so you don't need to define a node id.

```js
{
  "tokens": [
    { "name": "colors", "type": "color" },
    // Other tokens...
  ]
}
```

##### Typography

Typography tokens are parsed from the global color variables that you have created in Figma so you don't need to define a node id.

```js
{
  "tokens": [
    { "name": "typography", "type": "text" },
    // Other tokens...
  ]
}
```

##### Effects

Effects tokens are parsed from the global color variables that you have created in Figma so you don't need to define a node id.

Effects in Figma include thigns like drop/inner shadows and blurs. Only drop shadows are currently supported.

```js
{
  "tokens": [
    { "name": "shadows", "type": "drop-shadow" },
    // Other tokens...
  ]
}
```

##### Dimensions

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

##### Corner radius

Measures the corner radius of the node as a design token.

```js
{
  "tokens": [
    { "name": "radii", "nodeId": "x:x", "type": "radius" },
    // Other tokens...
  ]
}
```

##### SVG assets

```js
{
  "tokens": [
    { "name": "icons", "nodeId": "x:x", "type": "svg" },
    // Other tokens...
  ]
}
```

### Codegen

The `codegen` property allows you to modify the code generation behaviour.

```js
{
  "tokens": [
    /* ... */
  ],
  "codegen": {
    "defaults": {
      "type": "ts",
      "tokenCase": "camel"
    },
    "typography": {
      "type": "json",
      "filename": "typography.json",
      "tokenCase": "kebab"
    },
    "icons": {
      "type": "svg",
      "dirname": "icons",
      "tokenCase": "kebab"
    }
  }
}
```
