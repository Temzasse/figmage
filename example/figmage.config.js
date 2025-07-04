// @ts-check
import { defineConfig } from "figmage";

/** @type {import("figmage").Config} */
export default defineConfig({
  output: {
    directory: "./example/tokens",
    fileType: "ts",
    tokenCasing: "camel",
  },
  tokens: [
    {
      name: "colors",
      source: {
        type: "COLOR_STYLE",
        // filter: () => {}, TODO
      },
    },
    {
      name: "typography",
      source: {
        type: "TEXT_STYLE",
      },
    },
    {
      name: "shadows",
      source: {
        type: "DROP_SHADOW_EFFECT",
      },
    },
    {
      name: "spacing",
      source: {
        type: "COMPONENT_PROPERTY",
        parentFrameName: "Spacing",
        property: "absoluteBoundingBox.height",
      },
      output: {
        fileType: "json",
        tokenCasing: "lower",
      },
    },
    {
      name: "radii",
      source: {
        type: "COMPONENT_PROPERTY",
        parentFrameName: "Radii",
        property: "cornerRadius",
      },
    },
    {
      name: "icons",
      source: {
        type: "IMAGE",
        parentFrameName: "Icons",
        imageOptions: {
          format: "svg",
        },
      },
      // output: {
      //   imageOptions: {
      //     convertColors: true,
      //     generateSpriteSheet: true,
      //     spriteSheet: "./example/tokens/assets/icons-multicolor-sprite.svg",
      //     spriteSheetType: "./example/tokens/icons-multicolor-sprite.ids.ts",
      //   },
      // },
    },
    {
      name: "icons-multicolor",
      source: {
        type: "IMAGE",
        parentFrameName: "Multicolor Icons",
        imageOptions: {
          format: "svg",
        },
      },
      // output: {
      //   imageOptions: {
      //     convertColors: false,
      //     spriteSheet: {
      //       svg: "./example/tokens/assets/icons-multicolor-sprite.svg",
      //       ids: "./example/tokens/icons-multicolor-sprite.ids.ts",
      //     },
      //   },
      // },
    },
    {
      name: "assets",
      source: {
        type: "IMAGE",
        parentFrameName: "Assets",
        imageOptions: {
          scale: 2,
          format: "png",
        },
      },
      output: {
        fileType: "png",
        tokenCasing: "kebab",
      },
    },
  ],
});
