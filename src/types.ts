import type { FrameTraits, GetImagesQueryParams } from "@figma/rest-api-spec";
import type { TOKEN_TYPE } from "./constants";

export type TokenType = typeof TOKEN_TYPE;

export type TokenCasing = "camel" | "kebab" | "snake" | "lower";

export type ColorFormat =
  | "hex"
  | "rgb"
  | "rgba"
  | "hsl"
  | "hwb"
  | "lab"
  | "lch";

export type TextFormat = "none" | "px" | "rem";

export type PropertyFormat = "none" | "px" | "rem";

export type ImageFormat = "png" | "jpg" | "svg";

export interface TokenConfig {
  name: string;
  type: TokenType[keyof TokenType];
  output?: OutputConfig;
}

export interface OutputConfig {
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
}

export interface TokenTransform {
  /**
   * Casing style for the token names.
   * Supported values: `"camel"`, `"kebab"`, `"snake"`, `"lower"`.
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

export interface ImageTransform extends TokenTransform {
  /**
   * The format of the image asset files to be generated.
   * Supported values: `"png"`, `"jpg"`, `"svg"`.
   *
   * If not specified, defaults to `"png"`.
   * @default "png"
   */
  format?: ImageFormat;
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

export interface ColorTokenConfig extends TokenConfig {
  type: TokenType["color"];
  transform?: ColorTransform;
}

export interface TextTokenConfig extends TokenConfig {
  type: TokenType["text"];
  transform?: TextTransform;
}

export interface DropShadowTokenConfig extends TokenConfig {
  type: TokenType["dropShadow"];
  transform?: DropShadowTransform;
}

export interface ComponentPropertyTokenConfig extends TokenConfig {
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
}

type ImageQueryParams = Omit<
  CamelCaseKeys<GetImagesQueryParams>,
  "ids" | "format"
>;

export interface ImageAssetTokenConfig extends TokenConfig {
  type: TokenType["image"];
  transform?: ImageTransform;
  source:
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
}

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
  output?: OutputConfig;
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
     * Default format for image tokens. Supported values: `"svg"`, `"jpg"`, `"png"`.
     *
     * If not specified, defaults to `"svg"`.
     * @default "svg"
     */
    defaultImageFormat?: ImageFormat;
  };
  /**
   * An array of token definitions to sync from the Figma file.
   */
  tokens: (
    | ColorTokenConfig
    | TextTokenConfig
    | DropShadowTokenConfig
    | ComponentPropertyTokenConfig
    | ImageAssetTokenConfig
  )[];
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
export type SyncResult = {
  name: string;
  tokens: { group: string; name: string; value: string | number | object }[];
  output?: OutputConfig;
};

// Helpers

export type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends Array<any> // Avoid traversing arrays
      ? `${Prefix}${K & string}`
      : DotPaths<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

export type NonNullableFields<T> = {
  [K in keyof T]-?: T[K] extends object
    ? NonNullableFields<T[K]>
    : NonNullable<T[K]>;
};

export type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

export type CamelCaseKeys<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends {}
    ? CamelCaseKeys<T[K]>
    : T[K];
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
