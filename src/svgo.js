// @ts-check
import { optimize } from "svgo";

/**
 * Optimize SVG
 * @param {string} svg
 */
export function optimizeSvg(svg) {
  const { data } = optimize(svg, {
    plugins: [
      { name: "cleanupAttrs", active: true },
      { name: "removeDoctype", active: true },
      { name: "removeXMLProcInst", active: true },
      { name: "removeComments", active: true },
      { name: "removeMetadata", active: true },
      { name: "removeTitle", active: true },
      { name: "removeDesc", active: true },
      { name: "removeUselessDefs", active: true },
      { name: "removeEditorsNSData", active: true },
      { name: "removeEmptyAttrs", active: true },
      { name: "removeHiddenElems", active: true },
      { name: "removeEmptyText", active: true },
      { name: "removeEmptyContainers", active: true },
      { name: "removeViewBox", active: false },
      { name: "convertColors", active: true, params: { currentColor: true } },
      { name: "convertTransform", active: true },
      { name: "removeUselessStrokeAndFill", active: true },
      { name: "cleanupIDs", active: true },
      { name: "mergePaths", active: true },
      { name: "convertShapeToPath", active: true },
    ],
  });

  return data;
}
