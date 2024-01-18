<p align='center'>
  <img src="media/figmage.png" alt="Figmage logo" style="border-radius: 10px" />
<p/>

# 🧙‍♂️ Figmage 🧙

A CLI tool that helps you generate design tokens as code from your Figma project.

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
3. Create an `.env` file for [dotenv](https://github.com/motdotla/dotenv)
4. Paste the access token and the file id in the env file

```sh
FIGMA_ACCESS_TOKEN="xxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx"
FIGMA_FILE_ID="xxxxxxxxxxxxxxxxxxxxxx"
```

> [!TIP]
> You can change the env file path with the CLI `--env` or `-e` option.

## Configuration

Create a file called `.figmage.json` or `.figmagerc` in your project or add the config in your `package.json` under `"figmage"` key.

In addition to generic options the config has two concepts that map directly to the available commands: `tokenize` and `codegen`.

```js
{
  "outDir": "tokens",
  "tokenize": {},
  "codegen": {}
}
```

> [!TIP]
> You can change the config file path with the CLI `--config` or `-c` option.

### Tokenize

Fetch meta data about your Figma project and turn them into a generic design token specification.

Command:

```sh
figmage tokenize
```

Under `tokenize` you have the `tokens` property which is a list of all the design tokens that should be handled by Figmage.

```js
{
  "tokenize": {
    "tokens": [
      { "name": "colors", "type": "color" },
      { "name": "gradients", "type": "linear-gradient" },
      { "name": "typography", "type": "text" },
      { "name": "shadows", "type": "drop-shadow" },
      { "name": "icons", "nodeId": "x:x", "type": "svg" },
      { "name": "assets", "nodeId": "x:x", "type": "png" },
      { "name": "spacing", "nodeId": "x:x", "type": "height" },
      { "name": "elevation", "nodeId": "x:x", "type": "width" },
      { "name": "sizing", "nodeId": "x:x", "type": "dimensions" },
      { "name": "radii", "nodeId": "x:x", "type": "radius" }
    ]
  }
}
```

#### Grouping

Figmage will automatically group tokens based on top-level folders in Figma. For example if you have grouped all your colors inside `Light` and `Dark` folders or text styles inside `Web` and `Native` folders they will be also separated into respective groups during tokenization and code generation. This grouping logic applies to any type of token so you can also group things like spacing, sizing, radii, etc. scales by adding the group name to the layer name: `<Group name>/<Token name>`.

#### Supported tokens

> [!IMPORTANT]
> For all tokens that are not valid variables (colors, text styles, or effects) inside Figma you need to turn the layer you want to target into a component! You can turn a layer into a component via ⌥⌘K (option+command+K). Figmage will ignore all layers inside a frame that are not components.

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
  "tokenize": {
    "tokens": [
      { "name": "colors", "type": "color" }
      // Other tokens...
    ]
  }
}
```

##### Typography

Typography tokens are parsed from the global color variables that you have created in Figma so you don't need to define a node id.

```js
{
  "tokenize": {
    "tokens": [
      { "name": "typography", "type": "text" }
      // Other tokens...
    ]
  }
}
```

##### Effects

Effects tokens are parsed from the global color variables that you have created in Figma so you don't need to define a node id.

Effects in Figma include thigns like drop/inner shadows and blurs. Only drop shadows are currently supported.

```js
{
  "tokenize": {
    "tokens": [
      { "name": "shadows", "type": "drop-shadow" }
      // Other tokens...
    ]
  }
}
```

##### Dimensions

Properties: `width` | `height` | `dimensions` (both width and height).

```js
{
  "tokenize": {
    "tokens": [
      { "name": "spacing", "nodeId": "x:x", "type": "height" },
      { "name": "elevation", "nodeId": "x:x", "type": "width" },
      { "name": "sizing", "nodeId": "x:x", "type": "dimensions" }
      // Other tokens...
    ]
  }
}
```

##### Corner radius

Measures the corner radius of the node as a design token.

```js
{
  "tokenize": {
    "tokens": [
      { "name": "radii", "nodeId": "x:x", "type": "radius" }
      // Other tokens...
    ]
  }
}
```

##### Image assets

```js
{
  "tokenize": {
    "tokens": [
      { "name": "icons", "nodeId": "x:x", "type": "svg" }
      { "name": "assets", "nodeId": "x:x", "type": "png" }
      // Other tokens...
    ]
  }
}
```

#### Output example

Below you can see how the output of `figma tokenize` looks like based on the example configuration.

<details>
  <summary>See example JSON</summary>

```json
{
  "colors": {
    "dark": {
      "Muted 4": "#3a3a3c",
      "Press Highlight": "rgba(150, 150, 150, 0.2)",
      "Focus Ring": "#009a48",
      "Error Muted": "#3e1c1d",
      "Error": "#ef4444",
      "Muted 3": "#48484a",
      "Elevated": "#333333",
      "Success": "#10b981",
      "Warn Text": "#ffc93d",
      "Primary Text": "#1cff87",
      "Warn Muted": "#40351a",
      "Error Text": "#ff7070",
      "Muted 2": "#636366",
      "Primary": "#009a48",
      "Primary Muted": "#24392a",
      "Muted 1": "#8e8e93",
      "Muted 6": "#1d1d1f",
      "Text": "#ffffff",
      "Surface": "#222222",
      "Backdrop": "rgba(0, 0, 0, 0.5)",
      "Background": "#111111",
      "Info": "#3b82f6",
      "Info Muted": "#1b2940",
      "Success Text": "#1ee8a5",
      "Muted 5": "#2c2c2e",
      "Text Muted": "#999999",
      "Info Text": "#81aef7",
      "Hover Highlight": "rgba(150, 150, 150, 0.08)",
      "Success Muted": "#193328",
      "Warn": "#fbbf24",
      "Border": "rgba(150, 150, 150, 0.3)"
    },
    "light": {
      "Muted 1": "#8e8e93",
      "Error": "#ef4444",
      "Primary Muted": "#d6ebdb",
      "Warn Text": "#8a6200",
      "Text Muted": "#666666",
      "Muted 4": "#d1d1d6",
      "Muted 6": "#f2f2f7",
      "Muted 3": "#c7c7cc",
      "Text": "#222222",
      "Surface": "#ffffff",
      "Info": "#3b82f6",
      "Elevated": "#ffffff",
      "Success": "#10b981",
      "Muted 2": "#aeaeb2",
      "Info Text": "#0a45a6",
      "Info Muted": "#cfdef7",
      "Success Muted": "#cee8df",
      "Success Text": "#06734e",
      "Error Muted": "#f3d2d3",
      "Background": "#f3f4f6",
      "Primary": "#009a48",
      "Warn Muted": "#f3ead1",
      "Primary Text": "#015227",
      "Backdrop": "rgba(0, 0, 0, 0.5)",
      "Press Highlight": "rgba(150, 150, 150, 0.2)",
      "Border": "rgba(150, 150, 150, 0.3)",
      "Error Text": "#8c0606",
      "Focus Ring": "#009a48",
      "Warn": "#fbbf24",
      "Hover Highlight": "rgba(150, 150, 150, 0.1)",
      "Muted 5": "#e5e5ea"
    }
  },
  "typography": {
    "web": {
      "Title 2": {
        "fontFamily": "Inter",
        "fontWeight": 700,
        "fontSize": 32,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Body Large": {
        "fontFamily": "Inter",
        "fontWeight": 400,
        "fontSize": 18,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Caption": {
        "fontFamily": "Inter",
        "fontWeight": 400,
        "fontSize": 10,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Subtitle": {
        "fontFamily": "Inter",
        "fontWeight": 700,
        "fontSize": 16,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Body": {
        "fontFamily": "Inter",
        "fontWeight": 400,
        "fontSize": 16,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Title 1": {
        "fontFamily": "Inter",
        "fontWeight": 700,
        "fontSize": 48,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Overline": {
        "fontFamily": "Inter",
        "fontWeight": 400,
        "fontSize": 10,
        "textTransform": "uppercase",
        "letterSpacing": 0.5,
        "lineHeight": 1.172
      },
      "Title 3": {
        "fontFamily": "Inter",
        "fontWeight": 700,
        "fontSize": 24,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Body Small": {
        "fontFamily": "Inter",
        "fontWeight": 400,
        "fontSize": 12,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      }
    },
    "native": {
      "Subtitle": {
        "fontFamily": "Inter",
        "fontWeight": 700,
        "fontSize": 16,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Overline": {
        "fontFamily": "Inter",
        "fontWeight": 400,
        "fontSize": 10,
        "textTransform": "uppercase",
        "letterSpacing": 0.5,
        "lineHeight": 1.172
      },
      "Title 3": {
        "fontFamily": "Inter",
        "fontWeight": 700,
        "fontSize": 24,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Caption": {
        "fontFamily": "Inter",
        "fontWeight": 400,
        "fontSize": 10,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Title 2": {
        "fontFamily": "Inter",
        "fontWeight": 700,
        "fontSize": 32,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Title 1": {
        "fontFamily": "Inter",
        "fontWeight": 700,
        "fontSize": 48,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Body Small": {
        "fontFamily": "Inter",
        "fontWeight": 400,
        "fontSize": 12,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Body Large": {
        "fontFamily": "Inter",
        "fontWeight": 400,
        "fontSize": 18,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      },
      "Body": {
        "fontFamily": "Inter",
        "fontWeight": 400,
        "fontSize": 16,
        "textTransform": "none",
        "letterSpacing": 0,
        "lineHeight": 1.172
      }
    }
  },
  "shadows": {
    "Shadow Small": {
      "boxShadow": "0px 2px 6px rgba(0, 0, 0, 0.12)",
      "offset": {
        "x": 0,
        "y": 2
      },
      "radius": 6,
      "opacity": 0.12,
      "color": {
        "hex": "#000000",
        "rgba": "rgba(0, 0, 0, 0.12)"
      }
    },
    "Shadow Normal": {
      "boxShadow": "0px 4px 16px rgba(0, 0, 0, 0.12)",
      "offset": {
        "x": 0,
        "y": 4
      },
      "radius": 16,
      "opacity": 0.12,
      "color": {
        "hex": "#000000",
        "rgba": "rgba(0, 0, 0, 0.12)"
      }
    },
    "Shadow Medium": {
      "boxShadow": "0px 8px 24px rgba(0, 0, 0, 0.12)",
      "offset": {
        "x": 0,
        "y": 8
      },
      "radius": 24,
      "opacity": 0.12,
      "color": {
        "hex": "#000000",
        "rgba": "rgba(0, 0, 0, 0.12)"
      }
    },
    "Shadow Large": {
      "boxShadow": "0px 16px 32px rgba(0, 0, 0, 0.12)",
      "offset": {
        "x": 0,
        "y": 16
      },
      "radius": 32,
      "opacity": 0.12,
      "color": {
        "hex": "#000000",
        "rgba": "rgba(0, 0, 0, 0.12)"
      }
    }
  },
  "icons": {
    "Check Circle": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M22 4L12 14.01L9 11.01\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
    "Arrow Down Left": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M17 7 7 17M17 17H7V7\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
    "Arrow Left Circle": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M12 8 8 12 12 16M16 12H8\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
    "Aperture": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 22C17.5228 22 22 17.5228 22 12 22 6.47715 17.5228 2 12 2 6.47715 2 2 6.47715 2 12 2 17.5228 6.47715 22 12 22ZM14.3101 8 20.0501 17.94M9.68994 8H21.1699M7.38 12.0001 13.12 2.06006M9.68995 16.0001 3.94995 6.06006M14.31 16H2.82996M16.62 12 10.88 21.94\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
    "Camera": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
    "Eye": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
    "Cloud Lightning": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g clip-path=\"url(#a)\"><path d=\"M19.0001 16.9001C20.2152 16.6533 21.2953 15.9639 22.0307 14.9655C22.7662 13.9672 23.1044 12.7312 22.9798 11.4976C22.8552 10.2639 22.2766 9.12052 21.3564 8.28943C20.4362 7.45834 19.24 6.99881 18.0001 7.00006H16.7401C16.4087 5.71737 15.7641 4.53705 14.864 3.56504C13.9638 2.59304 12.8364 1.85979 11.5829 1.43112C10.3294 1.00245 8.98903 0.891787 7.68219 1.10906C6.37535 1.32634 5.14293 1.86475 4.09556 2.67596C3.0482 3.48718 2.21868 4.54579 1.68149 5.75677C1.1443 6.96774 0.916246 8.29317 1.01781 9.61405C1.11937 10.9349 1.54737 12.2099 2.26338 13.3245C2.97939 14.4391 3.96099 15.3585 5.12006 16.0001\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M13 11L9 17H15L11 23\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g><defs><clipPath id=\"a\"><path fill=\"currentColor\" d=\"M0 0H24V24H0z\"/></clipPath></defs></svg>",
    "Heart": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M20.84 4.60999C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.60999L12 5.66999L10.94 4.60999C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.60999C2.1283 5.64169 1.54871 7.04096 1.54871 8.49999C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.49999C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.60999V4.60999Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"
  },
  "spacing": {
    "Xxsmall": 4,
    "Xsmall": 8,
    "Small": 12,
    "Normal": 16,
    "Medium": 24,
    "Large": 32,
    "Xlarge": 48,
    "Xxlarge": 56,
    "Xxxlarge": 72
  },
  "sizing": {
    "Icon Size Large": 32,
    "Icon Size Normal": 24,
    "Icon Size Small": 16,
    "Focus Ring Size": 1,
    "Focus Ring Offset": 2,
    "Button Height Small": 32,
    "Button Height Normal": 44,
    "Button Height Large": 60,
    "Button Padding Horizontal Large": 28,
    "Button Padding Horizontal Normal": 24,
    "Button Padding Horizontal Small ": 16
  },
  "radii": {
    "Full": 24,
    "Large": 999,
    "Medium": 16,
    "Normal": 8,
    "Small": 4
  }
}
```

</details>

### Codegen

Generate code from the output of `figmage tokenize` (design token specification).

Command:

```sh
figmage codegen
```

The `codegen` property allows you to modify the code generation behaviour.

You can configure codegen for all tokens under `"defaults"` key and also for each token type separately by defining the configuration under the token type name.

```json
{
  "codegen": {
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
    },
    "assets": {
      "filetype": "png",
      "tokenCase": "kebab"
    }
  }
}
```

#### Available options

| Field                | Type          | Description                                                       |
| -------------------- | ------------- | ----------------------------------------------------------------- |
| `defaults.filetype`  | `Filetype`    | File type for all tokens by default                               |
| `defaults.tokenCase` | `Casing`      | Casing used for all tokens by default                             |
| `defaults.include`   | `IncludeRule` | What Figma variables and groups should be included for all tokens |
| `defaults.exclude`   | `ExcludeRule` | What Figma variables and groups should be excluded for all tokens |
| `[token].filename`   | `string`      | Filename for the token (defaults to token's name)                 |
| `[token].filetype`   | `Filetype`    | File type for this token                                          |
| `[token].tokenCase`  | `Casing`      | Casing used for this token                                        |
| `[token].include`    | `IncludeRule` | What Figma variables and groups should be included for this token |
| `[token].exclude`    | `ExcludeRule` | What Figma variables and groups should be excluded for this token |

```ts
type Casing = "camel" | "kebab" | "snake";

type Filetype = "ts" | "js" | "json" | "svg" | "png";

// For example: "\\bFoobar\\b$" (NOTE: that you don't need the wrapping //)
type EscapedRegexString = string;

type ExactMatchString = string;

type Rule = EscapedRegexString | ExactMatchString[];

type IncludeRule = {
  include: {
    groups: Rule;
    tokens: Rule;
  };
};

type ExcludeRule = {
  exclude: {
    groups: Rule;
    tokens: Rule;
  };
};
```

#### Including and excluding

For example if you want to apply rules for all tokens:

```js
{
  "codegen": {
    "defaults": {
      "include": {
        // Only include variable groups that have a name of "System"
        "groups": "\\bSystem\\b$",
        // Only include variables which name starts with "System"
        "tokens": "^\\bSystem\\b.*"
      }
    }
  }
}
```

Or if you want to apply rules for a specific token types only:

```js
{
  "codegen": {
    "colors": {
      "exclude": {
        // Exclude all colors which name starts with "Figma"
        "token": "^\\bFigma\\b.*"
      }
    },
    "typography": {
      "include": {
        // Only include text style groups that have a name of "Web"
        "groups": ["Web"]
      }
    }
  }
}
```

#### SVG sprites

For SVGs it is possible to bundle all generated SVG tokens into one SVG sprite.

You can achieve this by setting the `sprite` key to `true` for the token that has `"filetype": "svg"`.

It is also possible to set the value to `{ writeIds: true }` if you want to write the token names which are used as ids of the SVG sprite parts into a separate file (for usage in TypeScript etc.).

> [!IMPORTANT]  
> By setting the `sprite` key only one SVG file will be generated instead of multiple separate SVG files.

```js
{
  "codegen": {
    "icons": {
      "filetype": "svg",
      "filename": "icon-sprite",
      "sprite": {
        "writeIds": true
      }
    }
  }
}
```

With the config above Figmage would generate two files: `icon-sprite.svg` and `icon-sprite-ids.ts`.

## Figma template

In the screenshot below you can see how the example Figma template looks like that is used in the `/example` folder of this repo.

> ⚠️ TODO: add instructions about Figma.

<p align='center'>
  <img src="media/figma_template.png" alt="Example Figma template"/>
<p/>
