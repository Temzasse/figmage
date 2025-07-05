import type {
  ColorToken,
  DropShadowToken,
  ImageOutputConfig,
  ImageToken,
  PropertyToken,
  TextToken,
} from "./types";

type PropertyOptions = Omit<PropertyToken["source"], "property"> &
  PropertyToken["output"];

type ImageOptions = Omit<ImageToken["source"], "format"> & ImageOutputConfig;

export const token = {
  color: (name: string): ColorToken => ({
    name,
    type: "COLOR",
  }),
  text: (name: string): TextToken => ({
    name,
    type: "TEXT",
  }),
  dropShadow: (name: string): DropShadowToken => ({
    name,
    type: "DROP_SHADOW",
  }),
  height: (
    name: string,
    { directory, fileType, tokenCasing, ...rest }: PropertyOptions
  ): PropertyToken => ({
    name,
    type: "PROPERTY",
    source: { ...rest, property: "absoluteBoundingBox.height" },
    output: { directory, fileType, tokenCasing },
  }),
  width: (
    name: string,
    { directory, fileType, tokenCasing, ...rest }: PropertyOptions
  ): PropertyToken => ({
    name,
    type: "PROPERTY",
    source: { ...rest, property: "absoluteBoundingBox.width" },
    output: { directory, fileType, tokenCasing },
  }),
  cornerRadius: (
    name: string,
    { directory, fileType, tokenCasing, ...rest }: PropertyOptions
  ): PropertyToken => ({
    name,
    type: "PROPERTY",
    source: { ...rest, property: "cornerRadius" },
    output: { directory, fileType, tokenCasing },
  }),
  svg: (
    name: string,
    { directory, tokenCasing, ...rest }: ImageOptions
  ): ImageToken => ({
    name,
    type: "IMAGE",
    source: { ...rest, format: "svg" },
    output: { directory, tokenCasing },
  }),
  png: (
    name: string,
    { directory, tokenCasing, ...rest }: ImageOptions
  ): ImageToken => ({
    name,
    type: "IMAGE",
    source: { ...rest, format: "png" },
    output: { directory, tokenCasing },
  }),
  jpg: (
    name: string,
    { directory, tokenCasing, ...rest }: ImageOptions
  ): ImageToken => ({
    name,
    type: "IMAGE",
    source: { ...rest, format: "jpg" },
    output: { directory, tokenCasing },
  }),
};
