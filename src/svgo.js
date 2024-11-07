// @ts-check
import { optimize } from "svgo";

/**
 * Optimize SVG
 * @param {string} svg
 */
export function optimizeSvg(svg) {
  const { data } = optimize(svg, {
    plugins: [
      "cleanupAttrs",
      "removeDoctype",
      "removeXMLProcInst",
      "removeComments",
      "removeMetadata",
      "removeTitle",
      "removeDesc",
      "removeUselessDefs",
      "removeEditorsNSData",
      "removeEmptyAttrs",
      "removeHiddenElems",
      "removeEmptyText",
      "removeEmptyContainers",
      { name: "convertColors", params: { currentColor: true } },
      "convertTransform",
      "removeUselessStrokeAndFill",
      "cleanupIds",
      "mergePaths",
      "convertShapeToPath",
    ],
  });

  return data;
}
