// @ts-check
import "dotenv/config"; // read .env file for environment variables
import { defineConfig } from "figmage";

const accessToken = process.env.FIGMA_ACCESS_TOKEN;
const fileId = process.env.FIGMA_FILE_ID;

if (!accessToken || !fileId) {
  throw new Error("Please set `FIGMA_ACCESS_TOKEN` and `FIGMA_FILE_ID` in your `.env` file.");
}

/** @type {import("figmage").Config} */
export default defineConfig({
  accessToken,
  fileId,
  output: {
    directory: "./tokens",
    fileType: "ts",
    ignoreComments: ["eslint", "prettier", "oxlint", "oxfmt", "biome"],
  },
  transform: {
    defaultCasing: "camel",
    defaultColorFormat: "hsl",
    defaultImageRasterFormat: "png",
    defaultTextFormat: "rem",
    defaultPropertyFormat: "px",
    baseFontSize: 16,
  },
  tokens: [
    {
      name: "colors",
      type: "color",
      filter: ({ name, group }) => {
        if (group === "visualization") return false;
        if (name.startsWith("env")) return false;
        return true;
      },
    },
    {
      name: "typography",
      type: "text",
    },
    {
      name: "shadows",
      type: "dropShadow",
    },
    {
      name: "spacing",
      type: "property",
      source: {
        componentSet: "Spacing",
        property: "absoluteBoundingBox.width",
      },
      transform: {
        casing: "lower",
      },
      output: {
        fileName: "spacing-component-set",
      },
    },
    {
      name: "spacing",
      type: "property",
      source: {
        frame: "Figmage - Spacing",
        property: "absoluteBoundingBox.width",
      },
      transform: {
        casing: "lower",
      },
      output: {
        fileName: "spacing-frame",
        fileType: "json",
      },
    },
    {
      name: "radii",
      type: "property",
      source: {
        componentSet: "Radii",
        property: "cornerRadius",
      },
    },
    {
      name: "icons",
      type: "imageSprite",
      source: {
        frame: "Figmage - Icons",
      },
      output: {
        fileName: "icon-sprite",
        directory: "./tokens/static",
        ids: {
          enabled: true,
          directory: "./tokens",
          fileName: "icon-sprite-ids",
          fileType: "ts",
        },
      },
    },
    {
      name: "icons",
      type: "imageVector",
      source: {
        componentSet: "Icon",
      },
      output: {
        fileType: "ts",
        fileName: "icons-component-set",
      },
    },
    {
      name: "icons-multicolor",
      type: "imageVector",
      source: {
        frame: "Figmage - Multicolor Icons",
      },
      transform: {
        casing: "kebab",
        optimize: [["convertColors", false]],
      },
      output: {
        fileType: "svg",
        directory: "./tokens/static",
      },
    },
    {
      name: "image-assets",
      type: "imageRaster",
      source: {
        frame: "Figmage - Image Assets",
      },
      transform: {
        format: "jpg",
        scale: 2,
        casing: "kebab",
      },
      output: {
        directory: "./tokens/static",
      },
    },
  ],
});
