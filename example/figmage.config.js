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
    token.color("colors", {
      format: "hsl",
    }),
    token.text("typography", {
      format: "rem",
      baseFontSize: 16,
    }),
    token.dropShadow("shadows"),
    token.height("spacing", {
      componentSetName: "Spacing",
    }),
    token.height("spacing", {
      parentFrameName: "Figmage - Spacing",
    }),
    token.cornerRadius("radii", {
      componentSetName: "Radii",
    }),
    token.svg("icons", {
      componentSetName: "Icons",
    }),
    // tokwen.svg("icons-multicolor", {
    //   parentFrameName: "Multicolor Icons",
    // }),
    // token.png("assets", {
    //   parentFrameName: "Assets",
    //   tokenCasing: "kebab",
    //   scale: 2,
    // }),
    // {
    //   name: "icons",
    //   type: tokenType.image,
    //   source: {
    //     parentFrameName: "Icons",
    //     format: "svg",
    //   },
    //   output: {
    //     imageOptions: {
    //       convertColors: true,
    //       generateSpriteSheet: true,
    //       spriteSheet: "./example/tokens/assets/icons-multicolor-sprite.svg",
    //       spriteSheetType: "./example/tokens/icons-multicolor-sprite.ids.ts",
    //     },
    //   },
    // },
  ],
});
