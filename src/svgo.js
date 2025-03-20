// @ts-check
import { optimize } from "svgo";

/**
 * Optimize SVG
 * @param {string} svg
 * @param {object} options
 * @param {boolean} options.convertColors
 */
export function optimizeSvg(
  svg,
  options = {
    convertColors: true,
  }
) {
  /** @type {import("svgo").PluginConfig[]} */
  const plugins = [
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
    "convertTransform",
    "removeUselessStrokeAndFill",
    "cleanupIds",
    "mergePaths",
    "convertShapeToPath",
  ];

  if (options.convertColors) {
    plugins.push({
      name: "convertColors",
      params: { currentColor: true },
    });
  }
  const { data } = optimize(svg, { plugins });

  return data;
}
