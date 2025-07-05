import type { FrameTraits, GetImagesQueryParams } from "@figma/rest-api-spec";
import type { TOKEN_TYPE } from "./constants";

export interface OutputConfig {
  /**
   * Directory where the generated files will be saved.
   * If not specified, defaults to `./tokens`.
   * @default "./tokens"
   */
  directory?: string;
  /**
   * Type of the output files.
   * Supported values: "ts", "js", "json".
   * If not specified, defaults to "ts".
   * @default "ts"
   */
  fileType?: string;
  /**
   * Casing style for the token names.
   * Supported values: "camel", "kebab", "snake", "lower".
   * If not specified, defaults to "camel".
   * @default "camel"
   */
  tokenCasing?: "camel" | "kebab" | "snake" | "lower";
}

export interface ImageOutputConfig {
  /**
   * Directory where the generated files will be saved.
   * If not specified, defaults to `./tokens`.
   * @default "./tokens"
   */
  directory?: string;
  /**
   * Casing style for the token names.
   * Supported values: "camel", "kebab", "snake", "lower".
   * If not specified, defaults to "camel".
   * @default "camel"
   */
  tokenCasing?: "camel" | "kebab" | "snake" | "lower";
}

interface Token {
  name: string;
  output?: OutputConfig;
}

export type TokenType = typeof TOKEN_TYPE;

export interface ColorToken extends Token {
  type: TokenType["color"];
}

export interface TextToken extends Token {
  type: TokenType["text"];
}

export interface DropShadowToken extends Token {
  type: TokenType["dropShadow"];
}

export interface PropertyToken extends Token {
  type: TokenType["property"];
  source: {
    parentFrameName?: string;
    parentFrameId?: string;
    property: NonNullable<DotPaths<NonNullableFields<FrameTraits>>>;
  };
}

export interface ImageToken extends Token {
  type: TokenType["image"];
  output?: ImageOutputConfig;
  source: {
    parentFrameName?: string;
    parentFrameId?: string;
  } & Omit<GetImagesQueryParams, "ids">;
}

export interface Config {
  /**
   * Personal access token for the Figma API.
   * You can generate a token from your Figma account settings.
   * See: https://www.figma.com/developers/api#access-tokens
   */
  accessToken: string;
  /**
   * The ID of the Figma file to sync tokens from.
   * You can find the file ID in the URL of the Figma file.
   * Example: https://www.figma.com/file/<fileId>/...
   */
  fileId: string;
  /**
   * The output configuration for the generated tokens.
   * If not specified, defaults to saving tokens in `./tokens` directory
   * with TypeScript files.
   * @default { directory: "./tokens", fileType: "ts", tokenCasing: "camel" }
   */
  output?: OutputConfig;
  /**
   * An array of token definitions to sync from the Figma file.
   */
  tokens: (
    | ColorToken
    | TextToken
    | DropShadowToken
    | PropertyToken
    | ImageToken
  )[];
}

// Helpers

type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? // biome-ignore lint/suspicious/noExplicitAny: Ignore
      T[K] extends Array<any> // Avoid traversing arrays
      ? `${Prefix}${K & string}`
      : DotPaths<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

type NonNullableFields<T> = {
  [K in keyof T]-?: T[K] extends object
    ? NonNullableFields<T[K]>
    : NonNullable<T[K]>;
};
