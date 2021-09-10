<p align='center'>
  <img src="media/figmage.png" alt="Figmage logo"/>
<p/>

# 🧙‍♂️ Figmage 🧙

A simple CLI tool that helps you generate design tokens as code from your Figma project.

## Installation

This tool can be used as a global package if you don't want to include it as a dependency in each of your projects:

```sh
npm install -g figmage
```

You can also utilize `npx` to run this tool without installing it:

```sh
npx figmage tokenize --config ./path/to/.figmage.json
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

The config has two concepts that map directly to the available commands: `tokenize` and `codegen`.

### Tokenize

Fetch meta data about your Figma project and turn them into a generic design token specification.

Command:

```sh
figmage tokenize
```

Under `tokenize` you have the `tokens` property which is a list of all the design tokens that should be handled by Figmage.

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

In addition to the `tokens` field you can provide an optional `groupSeparator` that tells Figmage which character in the Figma layer name acts as a split point for grouping logic. This can be very useful for example when you want to have two sets of colors: one for light mode and one dark mode. For this scenario you could name your colors like this: `Primary | Light` + `Primary | Dark` and set the `groupdSeparator` to be `|` character. Combined with the other config options this would yield to two sets of code generated colors in the output file.

#### Supported tokens

> ⚠️ NOTE: for all tokens that are not valid variables (colors, text styles, or effects) inside Figma you need to turn the layer you want to target into a component! You can turn a layer into a component via ⌥⌘K (option+command+K). Figmage will ignore all layers inside a frame that are not components.

| Property          | Description                                                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`           | [Fill color styles](https://help.figma.com/hc/en-us/articles/360038746534-Create-styles-for-colors-text-effects-and-layout-grids#Colors_paints)            |
| `linear-gradient` | [Linear gradient color styles](https://help.figma.com/hc/en-us/articles/360038746534-Create-styles-for-colors-text-effects-and-layout-grids#Colors_paints) |
| `text`            | [Text styles](https://help.figma.com/hc/en-us/articles/360038746534-Create-styles-for-colors-text-effects-and-layout-grids#Text)                           |
| `drop-shadow`     | [Drop shadow effect](https://help.figma.com/hc/en-us/articles/360038746534-Create-styles-for-colors-text-effects-and-layout-grids#Effects)                 |
| `width`           | Width of the component                                                                                                                                     |
| `height`          | Height of the component                                                                                                                                    |
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

Generate code from the design token specification produced by `figmage tokenize`.

Command:

```sh
figmage codegen
```

The `codegen` property allows you to modify the code generation behaviour.

```js
{
  "tokens": [
    /* ... */
  ],
  "codegen": {
    "outDir": "tokens",
    "defaults": {
      "filetype": "ts",
      "tokenCase": "camel"
    },
    "typography": {
      "filetype": "json",
      "tokenCase": "kebab"
    },
    "icons": {
      "dirname": "icons",
      "filetype": "svg",
      "tokenCase": "kebab"
    }
  }
}
```

### Available options

| Field                | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `outDir`             | Output directory where the generated code for tokens is put. |
| `defaults.filetype`  | File type for the token: `ts`, `js`, `json`, `svg`           |
| `defaults.tokenCase` | How should the token value be named: `camel`, `kebab`        |
| `[token].filename`   | Filename for the token (defaults to token's name)            |
| `[token].filetype`   | `ts`, `js`, `json`, `svg`                                    |
| `[token].tokenCase`  | `camel`, `kebab`                                             |

## Figma template

In the screenshot below you can see how the example Figma template looks like that is used in the `/example` folder of this repo.

<p align='center'>
  <img src="media/figma_template.png" alt="Example Figma template"/>
<p/>
