import { optimize, type PluginConfig } from "svgo";

export function optimizeSvg(
  svg: string,
  options = {
    convertColors: true,
  },
) {
  const plugins: PluginConfig[] = [
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
