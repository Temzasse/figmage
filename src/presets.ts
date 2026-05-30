import type {
  ColorTokenConfig,
  ComponentPropertyTokenConfig,
  DropShadowTokenConfig,
  ImageAssetTokenConfig,
  ImageOutputConfig,
  Prettify,
  TextTokenConfig,
} from "./types";

export const token = {
  color: (
    name: string,
    opts?: Pick<ColorTokenConfig, "format">,
  ): ColorTokenConfig => ({
    name,
    type: "color",
    ...opts,
  }),
  text: (
    name: string,
    opts?: Pick<TextTokenConfig, "format" | "baseFontSize">,
  ): TextTokenConfig => ({
    name,
    type: "text",
    ...opts,
  }),
  dropShadow: (
    name: string,
    opts?: Pick<DropShadowTokenConfig, "format">,
  ): DropShadowTokenConfig => ({
    name,
    type: "drop-shadow",
    ...opts,
  }),
  height: (
    name: string,
    { directory, fileType, tokenCasing, ...source }: ComponentFlatOptions,
  ): ComponentPropertyTokenConfig => {
    ensureComponentSource(source);
    return {
      name,
      type: "property",
      source: { ...source, property: "absoluteBoundingBox.height" },
      output: { directory, fileType, tokenCasing },
    };
  },
  width: (
    name: string,
    { directory, fileType, tokenCasing, ...source }: ComponentFlatOptions,
  ): ComponentPropertyTokenConfig => {
    ensureComponentSource(source);
    return {
      name,
      type: "property",
      source: { ...source, property: "absoluteBoundingBox.width" },
      output: { directory, fileType, tokenCasing },
    };
  },
  cornerRadius: (
    name: string,
    { directory, fileType, tokenCasing, ...source }: ComponentFlatOptions,
  ): ComponentPropertyTokenConfig => {
    ensureComponentSource(source);
    return {
      name,
      type: "property",
      source: { ...source, property: "cornerRadius" },
      output: { directory, fileType, tokenCasing },
    };
  },
  svg: (
    name: string,
    { directory, tokenCasing, ...source }: ImageFlatOptions,
  ): ImageAssetTokenConfig => {
    ensureComponentSource(source);
    return {
      name,
      type: "image",
      source: { ...source, format: "svg" },
      output: { directory, tokenCasing },
    };
  },
  png: (
    name: string,
    { directory, tokenCasing, ...source }: ImageFlatOptions,
  ): ImageAssetTokenConfig => {
    ensureComponentSource(source);
    return {
      name,
      type: "image",
      source,
      output: { directory, tokenCasing, format: "png" },
    };
  },
  jpg: (
    name: string,
    { directory, tokenCasing, ...source }: ImageFlatOptions,
  ): ImageAssetTokenConfig => {
    ensureComponentSource(source);
    return {
      name,
      type: "image",
      source,
      output: { directory, tokenCasing, format: "jpg" },
    };
  },
};

// Helpers

function ensureComponentSource(source: Record<string, unknown>) {
  if (
    !source.componentSetName &&
    !source.parentFrameId &&
    !source.parentFrameName
  ) {
    throw new Error(
      "Either `componentSetName`, `parentFrameId`, or `parentFrameName` must be specified!",
    );
  }
}

type ComponentFlatOptions = Prettify<
  Omit<
    ComponentPropertyTokenConfig["output"] &
      ComponentPropertyTokenConfig["source"],
    "property"
  >
>;

type ImageFlatOptions = Prettify<
  ImageAssetTokenConfig["source"] &
    Omit<ImageAssetTokenConfig["output"], "format">
>;
