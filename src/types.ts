import type { FrameTraits, GetImagesQueryParams } from "@figma/rest-api-spec";
import type { TOKEN_TYPE } from "./constants";

export type TokenType = typeof TOKEN_TYPE;

export type TokenCasing = "camel" | "kebab" | "snake" | "lower";

export type ColorFormat = "hex" | "rgb" | "hsl" | "hwb" | "lab" | "lch";

export type TextFormat = "none" | "px" | "rem";

export type PropertyFormat = "none" | "px" | "rem";

export type OutputConfig = {
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
  fileType?: string;
  /**
   * Casing style for the token names.
   * Supported values: `"camel"`, `"kebab"`, `"snake"`, `"lower"`.
   *
   * If not specified, defaults to `"camel"`.
   * @default "camel"
   */
  tokenCasing?: TokenCasing;
};

export type ImageOutputConfig = {
  /**
   * Directory where the generated files will be saved.
   *
   * If not specified, defaults to `./tokens`.
   * @default "./tokens"
   */
  directory?: string;
  /**
   * Casing style for the token names.
   * Supported values: `"camel"`, `"kebab"`, `"snake"`, `"lower"`.
   *
   * If not specified, defaults to `"camel"`.
   * @default "camel"
   */
  tokenCasing?: TokenCasing;
};

interface TokenConfig {
  name: string;
  output?: OutputConfig;
}

type ComponentSource = {
  /**
   * The name of the parent frame where the components are located.
   * Components within this frame will be used as the source for the property
   * value token.
   *
   * For example: `"Spacing"` or `"Radii"`.
   *
   * Either `parentFrameName` or `parentFrameId` must be specified.
   */
  parentFrameName?: string;
  /**
   * The ID of the parent frame where the components are located.
   * Components within this frame will be used as the source for the property
   * value token.
   *
   * The ID looks like `123:456` and can be found in the Figma file URL when
   * selecting the frame.
   *
   * Either `parentFrameName` or `parentFrameId` must be specified.
   */
  parentFrameId?: string;
  /**
   * The name of the published component set to sync properties from.
   * This is used to identify the component set in the Figma file.
   * Example: "Spacing" or "Radii".
   */
  componentSetName?: string;
};

export interface ColorTokenConfig extends TokenConfig {
  type: TokenType["color"];
  /**
   * The format in which the color token should be generated.
   * Supported values: `"hex"`, `"rgb"`, `"hsl"`, `"hwb"`, `"lab"`, `"lch"`.
   *
   * If not specified, defaults to `"hex"`.
   * @default "hex"
   */
  format?: ColorFormat;
}

export interface TextTokenConfig extends TokenConfig {
  type: TokenType["text"];
  /**
   * The format in which the text token should be generated.
   * Supported values: `"none"` for unitless, `"px"` for pixels, `"rem"` for rem units.
   *
   * If not specified, defaults to `"none"`.
   * @default { unit: "none" }
   */
  format?: TextFormat;
  /**
   * The base font size to use for rem calculations.
   *
   * If not specified, defaults to `16px`.
   * @default 16
   */
  baseFontSize?: number;
}

export interface DropShadowTokenConfig extends TokenConfig {
  type: TokenType["dropShadow"];
}

export interface ComponentPropertyTokenConfig extends TokenConfig {
  type: TokenType["property"];
  source: ComponentSource & {
    /**
     * The property in dot notation to extract the value of the token from.
     *
     * For example, "absoluteBoundingBox.height" or "absoluteBoundingBox.width".
     * See: https://www.figma.com/developers/api#frame-props
     */
    property: NonNullable<DotPaths<NonNullableFields<FrameTraits>>>;
    /**
     * The format in which the property token should be generated.
     * Supported values: `"none"` for unitless, `"px"` for pixels, `"rem"` for rem units.
     *
     * If not specified, defaults to `"none"`.
     * @default "none"
     */
    format?: PropertyFormat;
  };
}

export interface ImageTokenConfig extends TokenConfig {
  type: TokenType["image"];
  output?: ImageOutputConfig;
  source: Omit<GetImagesQueryParams, "ids"> & ComponentSource;
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
   * @default { directory: "./tokens", fileType: "ts", tokenCasing: "camel" }
   */
  output?: OutputConfig;
  /**
   * An array of token definitions to sync from the Figma file.
   */
  tokens: (
    | ColorTokenConfig
    | TextTokenConfig
    | DropShadowTokenConfig
    | ComponentPropertyTokenConfig
    | ImageTokenConfig
  )[];
};

export type SyncResult = {
  name: string;
  tokens: { group: string; name: string; value: string | number | object }[];
  output?: OutputConfig;
};

// Helpers

type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends Array<any> // Avoid traversing arrays
      ? `${Prefix}${K & string}`
      : DotPaths<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

type NonNullableFields<T> = {
  [K in keyof T]-?: T[K] extends object
    ? NonNullableFields<T[K]>
    : NonNullable<T[K]>;
};
