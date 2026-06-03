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
  },
  transform: {
    defaultCasing: "camel",
    defaultColorFormat: "hsl",
    defaultImageFormat: "svg",
    defaultTextFormat: "rem",
    defaultPropertyFormat: "px",
    baseFontSize: 16,
  },
  tokens: [
    {
      name: "colors",
      type: "color",
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
      type: "image",
      source: {
        componentSet: "Icon",
      },
      output: {
        fileName: "icons-component-set",
      },
    },
    {
      name: "icons",
      type: "image",
      source: {
        frame: "Figmage - Icons",
      },
      output: {
        fileName: "icon-sprite",
        directory: "./tokens/static",
        sprite: {
          idsEnabled: true,
          idsDirectory: "./tokens",
          idsFileName: "icon-sprite-ids",
          idsFileType: "ts",
        },
      },
    },
    {
      name: "icons-multicolor",
      type: "image",
      source: {
        frame: "Figmage - Multicolor Icons",
      },
      output: {
        directory: "./tokens/static",
      },
      transform: {
        svgo: [["convertColors", false]],
      },
    },
  ],
});
