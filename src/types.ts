import type { FrameTraits, GetImagesQueryParams } from "@figma/rest-api-spec";

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
   * Supported values: "camel", "pascal", "snake", "lower".
   * If not specified, defaults to "camel".
   * @default "camel"
   */
  tokenCasing?: "camel" | "pascal" | "snake" | "lower" | "kebab";
}

interface Token {
  name: string;
  output?: OutputConfig;
}

export interface ColorToken extends Token {
  source: {
    type: "COLOR_STYLE";
  };
}

export interface TextToken extends Token {
  source: {
    type: "TEXT_STYLE";
  };
}

export interface ShadowToken extends Token {
  source: {
    type: "DROP_SHADOW_EFFECT";
  };
}

export interface PropertyToken extends Token {
  source: {
    type: "COMPONENT_PROPERTY";
    parentFrameName?: string;
    parentFrameId?: string;
    property: NonNullable<DotPaths<NonNullableFields<FrameTraits>>>;
  };
}

export interface ImageToken extends Token {
  source: {
    type: "IMAGE";
    parentFrameName?: string;
    parentFrameId?: string;
    imageOptions: Omit<GetImagesQueryParams, "ids">;
  };
}

export interface Config {
  output?: OutputConfig;
  tokens: (ColorToken | TextToken | ShadowToken | PropertyToken | ImageToken)[];
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
