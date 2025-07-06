import type {
  ColorTokenConfig,
  DropShadowTokenConfig,
  ImageOutputConfig,
  ImageTokenConfig,
  PropertyTokenConfig,
  TextTokenConfig,
} from "./types";

type PropertyOptions = Omit<PropertyTokenConfig["source"], "property"> &
  PropertyTokenConfig["output"];

type ImageOptions = Omit<ImageTokenConfig["source"], "format"> &
  ImageOutputConfig;

export const token = {
  color: (
    name: string,
    opts?: { format?: ColorTokenConfig["format"] }
  ): ColorTokenConfig => ({
    name,
    type: "COLOR",
    ...opts,
  }),
  text: (name: string): TextTokenConfig => ({
    name,
    type: "TEXT",
  }),
  dropShadow: (name: string): DropShadowTokenConfig => ({
    name,
    type: "DROP_SHADOW",
  }),
  height: (
    name: string,
    { directory, fileType, tokenCasing, ...source }: PropertyOptions
  ): PropertyTokenConfig => ({
    name,
    type: "PROPERTY",
    source: { ...source, property: "absoluteBoundingBox.height" },
    output: { directory, fileType, tokenCasing },
  }),
  width: (
    name: string,
    { directory, fileType, tokenCasing, ...source }: PropertyOptions
  ): PropertyTokenConfig => ({
    name,
    type: "PROPERTY",
    source: { ...source, property: "absoluteBoundingBox.width" },
    output: { directory, fileType, tokenCasing },
  }),
  cornerRadius: (
    name: string,
    { directory, fileType, tokenCasing, ...source }: PropertyOptions
  ): PropertyTokenConfig => ({
    name,
    type: "PROPERTY",
    source: { ...source, property: "cornerRadius" },
    output: { directory, fileType, tokenCasing },
  }),
  svg: (
    name: string,
    { directory, tokenCasing, ...source }: ImageOptions
  ): ImageTokenConfig => ({
    name,
    type: "IMAGE",
    source: { ...source, format: "svg" },
    output: { directory, tokenCasing },
  }),
  png: (
    name: string,
    { directory, tokenCasing, ...source }: ImageOptions
  ): ImageTokenConfig => ({
    name,
    type: "IMAGE",
    source: { ...source, format: "png" },
    output: { directory, tokenCasing },
  }),
  jpg: (
    name: string,
    { directory, tokenCasing, ...source }: ImageOptions
  ): ImageTokenConfig => ({
    name,
    type: "IMAGE",
    source: { ...source, format: "jpg" },
    output: { directory, tokenCasing },
  }),
};
