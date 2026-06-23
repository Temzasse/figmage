import type { FrameTraits, GetImagesQueryParams } from "@figma/rest-api-spec";
import type { TOKEN_TYPE } from "./constants";

export type TokenType = typeof TOKEN_TYPE;

export type TokenCasing = "camel" | "kebab" | "snake" | "lower" | "pascal";

export type ColorFormat = "hex" | "rgb" | "rgba" | "hsl" | "hwb" | "lab" | "lch";

export type TextFormat = "none" | "px" | "rem";

export type PropertyFormat = "none" | "px" | "rem";

export type ImageRasterFormat = "png" | "jpg";

export type ImageVectorFormat = "ts" | "js" | "json" | "svg";

export type IgnoreComment = "eslint" | "prettier" | "oxlint" | "oxfmt" | "biome";

export interface CodeOutput {
  /**
   * Directory where the generated files will be saved.
   *
   * If not specified, defaults to `./tokens`.
   * @default "./tokens"
   */
  directory?: string;
  /**
   * Type of the output files.
   * Supported values: `"ts"`, `"js"`, `"json"`.
   *
   * If not specified, defaults to `"ts"`.
   * @default "ts"
   */
  fileType?: "ts" | "js" | "json";
  /**
   * Optional file name for the generated token file (without extension).
   * If not specified, the file name will be derived from the token name.
   */
  fileName?: string;
}

export interface GlobalOutput extends Omit<CodeOutput, "fileName"> {
  /**
   * Ignore comments to add to generated TS/JS files.
   *
   * Supported values: `"eslint"`, `"prettier"`, `"oxlint"`, `"oxfmt"`, `"biome"`.
   *
   * If not specified, no ignore comments will be added.
   */
  ignoreComments?: readonly IgnoreComment[];
}

export type VectorImageOutput =
  | { directory?: string; fileType?: "svg" }
  | {
      /**
       * Directory where the generated files will be saved.
       *
       * If not specified, defaults to `./tokens`.
       * @default "./tokens"
       */
      directory?: string;
      /**
       * Type of the output files for vector image tokens. Supported values: `"ts"`, `"js"`, `"json"`, `"svg"`.
       *
       * If the file type is set to `"svg"`, each token will be saved as an individual SVG file.
       * For other file types, all tokens will be saved in a single file.
       *
       * If not specified, defaults to `"ts"`.
       * @default "ts"
       */
      fileType?: "ts" | "js" | "json";
      /**
       * Optional file name for the generated token file (without extension).
       * If not specified, the file name will be derived from the token name.
       */
      fileName?: string;
    };

export interface SpriteImageOutput {
  /**
   * Directory where the generated files will be saved.
   *
   * If not specified, defaults to `./tokens`.
   * @default "./tokens"
   */
  directory?: string;
  /**
   * Optional file name for the generated token file (without extension).
   * If not specified, the file name will be derived from the token name.
   */
  fileName?: string;
  /**
   * Options for sprite symbol IDs.
   */
  ids?: {
    /**
     * Whether to also generate TS file with all the IDs of the icons in the sprite.
     * This is useful for type safety when using the icons in code.
     *
     * @default false
     */
    enabled?: boolean;
    /**
     * Directory where the generated TS file with the IDs will be saved.
     * If not specified, defaults to the same directory as the sprite.
     */
    directory?: string;
    /**
     * Optional file name for the generated file with the IDs (without extension).
     * If not specified, the file name will be derived from the sprite file name.
     */
    fileName?: string;
    /**
     * The file type of the generated file with the IDs.
     * Supported values: `"ts"`, `"js"`, `"json"`.
     *
     * If not specified, defaults to `"ts"`.
     * @default "ts"
     */
    fileType?: "ts" | "js" | "json";
  };
}

export interface RasterImageOutput {
  /**
   * Directory where the generated files will be saved.
   *
   * If not specified, defaults to `./tokens`.
   * @default "./tokens"
   */
  directory?: string;
}

export interface TokenTransform {
  /**
   * Casing style for the token names.
   * Supported values: `"camel"`, `"kebab"`, `"snake"`, `"lower"`, `"pascal"`.
   *
   * If not specified, defaults to `"camel"`.
   * @default "camel"
   */
  casing?: TokenCasing;
}

export interface ColorTransform extends TokenTransform {
  /**
   * The format in which the color token should be generated.
   * Supported values: `"hex"`, `"rgb"`, `"rgba"`, `"hsl"`, `"hwb"`, `"lab"`, `"lch"`.
   *
   * If not specified, defaults to `"hex"`.
   * @default "hex"
   */
  format?: ColorFormat;
}

export type OptimizeSvgOptions = Array<[string, boolean | Record<string, unknown>]>;

export interface VectorImageTransform extends TokenTransform {
  /**
   * SVG optimization options when the image format is set to `"svg"`.
   * These options will be ignored for other formats.
   *
   * By default the following SVGO plugins are applied to optimize the SVGs:
   *
   * ```ts
   * [
   *   "cleanupAttrs",
   *   "removeDoctype",
   *   "removeXMLProcInst",
   *   "removeComments",
   *   "removeMetadata",
   *   "removeTitle",
   *   "removeDesc",
   *   "removeUselessDefs",
   *   "removeEditorsNSData",
   *   "removeEmptyAttrs",
   *   "removeHiddenElems",
   *   "removeEmptyText",
   *   "removeEmptyContainers",
   *   "convertTransform",
   *   "removeUselessStrokeAndFill",
   *   "cleanupIds",
   *   "mergePaths",
   *   "convertShapeToPath",
   *   {
   *     name: "convertColors",
   *     params: { currentColor: true },
   *   },
   * ]
   * ```
   *
   * See available plugins: https://svgo.dev/docs/plugins/
   *
   * @example
   * ```ts
   * [
   *   ["removeRasterImages", true],
   *   ["convertColors", false],
   * ]
   * ```
   */
  optimize?: OptimizeSvgOptions;
}

export interface RasterImageTransform extends TokenTransform {
  /**
   * The format of the image asset files to be generated.
   * Supported values: `"png"`, `"jpg"`
   *
   * If not specified, defaults to `"png"`.
   * @default "png"
   */
  format?: ImageRasterFormat;
  /**
   * A number between 0.01 and 4, the image scaling factor.
   * For example, a value of `2` will generate images at double the size of the original.
   *
   * If not specified, defaults to `1` (no scaling).
   */
  scale?: number;
}

export interface TextTransform extends TokenTransform {
  /**
   * The format of the text token files to be generated.
   * Supported values: `"none"`, `"px"`, `"rem"`.
   *
   * If not specified, defaults to `"none"`.
   * @default "none"
   */
  format?: TextFormat;
}

export interface DropShadowTransform extends TokenTransform {
  /**
   * The format in which the color parts of the drop shadow token should be generated.
   * Supported values: `"hex"`, `"rgb"`, `"rgba"`, `"hsl"`, `"hwb"`, `"lab"`, `"lch"`.
   *
   * If not specified, defaults to `"rgba"`.
   * @default "rgba"
   */
  format?: ColorFormat;
}

export interface ComponentPropertyTransform extends TokenTransform {
  /**
   * The format in which the property token should be generated.
   * Supported values: `"none"` for unitless, `"px"` for pixels, `"rem"` for rem units.
   *
   * If not specified, defaults to `"none"`.
   * @default "none"
   */
  format?: PropertyFormat;
}

export type TokenFilterFn = (context: { name: string; value: unknown; group?: string }) => boolean;

export interface TokenConfigBase {
  name: string;
  /**
   * Optional predicate to include or exclude generated design tokens for this token set.
   *
   * Return `true` to keep a token, `false` to exclude it from the final output.
   */
  filter?: TokenFilterFn;
}

export interface ColorTokenConfig extends TokenConfigBase {
  type: TokenType["color"];
  transform?: ColorTransform;
  output?: CodeOutput;
}

export interface TextTokenConfig extends TokenConfigBase {
  type: TokenType["text"];
  transform?: TextTransform;
  output?: CodeOutput;
}

export interface DropShadowTokenConfig extends TokenConfigBase {
  type: TokenType["dropShadow"];
  transform?: DropShadowTransform;
  output?: CodeOutput;
}

export interface ComponentPropertyTokenConfig extends TokenConfigBase {
  type: TokenType["property"];
  transform?: ComponentPropertyTransform;
  source:
    | {
        /**
         * The name of the published component set to sync properties from.
         * This is used to identify the component set in the Figma file.
         * Example: "Spacing" or "Radii".
         */
        componentSet: string;
        /**
         * The property in dot notation to extract the value of the token from.
         *
         * For example, "absoluteBoundingBox.height" or "absoluteBoundingBox.width".
         * See: https://www.figma.com/developers/api#frame-props
         */
        property: NonNullable<DotPaths<NonNullableFields<FrameTraits>>>;
      }
    | {
        /**
         * The name of the parent frame where the components are located.
         * Components within this frame will be used as the source for the property
         * value token.
         *
         * For example: `"Spacing"` or `"Radii"`.
         *
         * Either `frame` or `frameId` must be specified.
         */
        frame?: string;
        /**
         * The ID of the parent frame where the components are located.
         * Components within this frame will be used as the source for the property
         * value token.
         *
         * The ID looks like `123:456` and can be found in the Figma file URL when
         * selecting the frame.
         *
         * Either `frame` or `frameId` must be specified.
         */
        frameId?: string;
        /**
         * The property in dot notation to extract the value of the token from.
         *
         * For example, "absoluteBoundingBox.height" or "absoluteBoundingBox.width".
         * See: https://www.figma.com/developers/api#frame-props
         */
        property: NonNullable<DotPaths<NonNullableFields<FrameTraits>>>;
      };
  output?: CodeOutput;
}

type ImageQueryParams = Omit<CamelCaseKeys<GetImagesQueryParams>, "ids" | "format">;

type ImageSource =
  | (ImageQueryParams & {
      /**
       * The name of the published component set to sync properties from.
       * This is used to identify the component set in the Figma file.
       * Example: "Spacing" or "Radii".
       */
      componentSet: string;
      /**
       * The property in dot notation to extract the value of the token from.
       *
       * For example, "absoluteBoundingBox.height" or "absoluteBoundingBox.width".
       * See: https://www.figma.com/developers/api#frame-props
       */
    })
  | (ImageQueryParams & {
      /**
       * The name of the parent frame where the components are located.
       * Components within this frame will be used as the source for the property
       * value token.
       *
       * For example: `"Spacing"` or `"Radii"`.
       *
       * Either `frame` or `frameId` must be specified.
       */
      frame?: string;
      /**
       * The ID of the parent frame where the components are located.
       * Components within this frame will be used as the source for the property
       * value token.
       *
       * The ID looks like `123:456` and can be found in the Figma file URL when
       * selecting the frame.
       *
       * Either `frame` or `frameId` must be specified.
       */
      frameId?: string;
    });

export interface VectorImageTokenConfig extends TokenConfigBase {
  type: TokenType["imageVector"];
  source: ImageSource;
  transform?: VectorImageTransform;
  output?: VectorImageOutput;
}

export interface SpriteImageTokenConfig extends TokenConfigBase {
  type: TokenType["imageSprite"];
  source: ImageSource;
  transform?: VectorImageTransform;
  output?: SpriteImageOutput;
}

export interface RasterImageTokenConfig extends TokenConfigBase {
  type: TokenType["imageRaster"];
  source: ImageSource;
  transform?: RasterImageTransform;
  output?: RasterImageOutput;
}

export type TokenConfig =
  | ColorTokenConfig
  | TextTokenConfig
  | DropShadowTokenConfig
  | ComponentPropertyTokenConfig
  | VectorImageTokenConfig
  | SpriteImageTokenConfig
  | RasterImageTokenConfig;

export type Config = {
  /**
   * Personal access token for the Figma API.
   * You can generate a token from your Figma account settings.
   *
   * See: https://www.figma.com/developers/api#access-tokens
   */
  accessToken: string;
  /**
   * The ID of the Figma file to sync tokens from.
   * You can find the file ID in the URL of the Figma file.
   *
   * Example: `https://www.figma.com/file/<fileId>/...`
   */
  fileId: string;
  /**
   * The output configuration for the generated tokens.
   *
   * If not specified, defaults to saving tokens in `./tokens` directory
   * with TypeScript files.
   *
   * @default { directory: "./tokens", fileType: "ts", casing: "camel" }
   */
  output?: GlobalOutput;
  /**
   * Default transformation options for all tokens. These can be overridden by
   * individual token configurations.
   */
  transform?: {
    /**
     * Default casing style for token names when generating output files.
     * Supported values: `"camel"`, `"kebab"`, `"snake"`, `"lower"`.
     *
     * If not specified, defaults to `"camel"`.
     * @default "camel"
     */
    defaultCasing?: TokenCasing;
    /**
     * Default format for color tokens. Supported values: `"hex"`, `"rgb"`, `"rgba"`, `"hsl"`, `"hwb"`, `"lab"`, `"lch"`.
     *
     * If not specified, defaults to `"hex"`.
     * @default "hex"
     */
    defaultColorFormat?: ColorFormat;
    /**
     * Default format for text tokens. Supported values: `"none"`, `"px"`, `"rem"`.
     *
     * If not specified, defaults to `"px"`.
     * @default "px"
     */
    defaultTextFormat?: TextFormat;
    /**
     * The base font size to use for rem calculations in text tokens.
     *
     * If not specified, defaults to `16px`.
     * @default 16
     */
    baseFontSize?: number;
    /**
     * Default format for property tokens. Supported values: `"none"`, `"px"`, `"rem"`.
     *
     * If not specified, defaults to `"px"`.
     * @default "px"
     */
    defaultPropertyFormat?: PropertyFormat;
    /**
     * Default format for raster image tokens. Supported values: `"jpg"`, `"png"`.
     *
     * If not specified, defaults to `"png"`.
     * @default "png"
     */
    defaultImageRasterFormat?: ImageRasterFormat;
  };
  /**
   * An array of token definitions to sync from the Figma file.
   */
  tokens: TokenConfig[];
};

/*
  [
    { group: '_', name: 'Neutral 1', value: '#EEEEEE' },
    { group: '_', name: 'Neutral 2', value: '#CCCCCC' },
    { group: 'Primary', name: 'Primary Muted', value: '#F0F0F0' },
    { group: 'Primary', name: 'Primary Contrast', value: '#000000' },
    ...etc.
  ]
*/
export type VectorImageSyncResult = {
  config: VectorImageTokenConfig;
  tokens: { name: string; value: string }[];
};

export type SpriteImageSyncResult = {
  config: SpriteImageTokenConfig;
  tokens: { name: string; value: string }[];
};

export type RasterImageSyncResult = {
  config: RasterImageTokenConfig;
  tokens: { name: string; value: string }[];
};

type DefaultTokenResult = {
  group: string;
  name: string;
  value: string | number | object;
}[];

export type ColorSyncResult = {
  config: ColorTokenConfig;
  tokens: DefaultTokenResult;
};

export type DropShadowSyncResult = {
  config: DropShadowTokenConfig;
  tokens: DefaultTokenResult;
};

export type TextSyncResult = {
  config: TextTokenConfig;
  tokens: DefaultTokenResult;
};

export type ComponentPropertySyncResult = {
  config: ComponentPropertyTokenConfig;
  tokens: DefaultTokenResult;
};

export type CodeSyncResult =
  | ColorSyncResult
  | DropShadowSyncResult
  | TextSyncResult
  | ComponentPropertySyncResult;

export type SyncResult =
  | VectorImageSyncResult
  | SpriteImageSyncResult
  | RasterImageSyncResult
  | ColorSyncResult
  | DropShadowSyncResult
  | TextSyncResult
  | ComponentPropertySyncResult;

// Helpers

export type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends Array<any> // Avoid traversing arrays
      ? `${Prefix}${K & string}`
      : DotPaths<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

export type NonNullableFields<T> = {
  [K in keyof T]-?: T[K] extends object ? NonNullableFields<T[K]> : NonNullable<T[K]>;
};

export type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>;

export type CamelCaseKeys<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends {} ? CamelCaseKeys<T[K]> : T[K];
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
