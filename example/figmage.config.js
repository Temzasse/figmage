// @ts-check
import "dotenv/config"; // read .env file for environment variables
import { defineConfig, token } from "figmage";

const accessToken = process.env.FIGMA_ACCESS_TOKEN;
const fileId = process.env.FIGMA_FILE_ID;

if (!accessToken || !fileId) {
  throw new Error(
    "Please set `FIGMA_ACCESS_TOKEN` and `FIGMA_FILE_ID` in your `.env` file.",
  );
}

/** @type {import("figmage").Config} */
export default defineConfig({
  accessToken,
  fileId,
  output: {
    directory: "./tokens-v2",
    fileType: "ts",
    tokenCasing: "camel",
  },
  tokens: [
    {
      name: "colors",
      type: "color",
      transform: {
        format: "hsl",
      },
    },
    {
      name: "typography",
      type: "text",
      transform: {
        format: "rem",
        baseFontSize: 16,
      },
    },
    {
      name: "shadows",
      type: "dropShadow",
      transform: {
        format: "hsl",
      },
    },
    {
      name: "spacing",
      type: "property",
      source: {
        componentSet: "Spacing",
        property: "absoluteBoundingBox.width",
      },
    },
    {
      name: "spacing2",
      type: "property",
      source: {
        frame: "Figmage - Spacing",
        property: "absoluteBoundingBox.width",
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
        componentSet: "Icons",
      },
    },
  ],
});
