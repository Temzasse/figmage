import { optimize, type PluginConfig } from "svgo";
import type { OptimizeSvgOptions } from "./types";
import { get } from "./utils";

export function optimizeSvg(svg: string, options?: OptimizeSvgOptions) {
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
    {
      name: "convertColors",
      params: { currentColor: true },
    },
  ];

  options?.forEach(([name, value]) => {
    const isEnabled = Boolean(value);
    const params = typeof value !== "boolean" ? value : undefined;

    const pluginIndex = plugins.findIndex(
      (plugin) => plugin === name || get(plugin, "name") === name,
    );

    if (!isEnabled && pluginIndex !== -1) {
      // Remove the plugin config if it exists in the plugins array
      plugins.splice(pluginIndex, 1);
    } else if (isEnabled && pluginIndex === -1) {
      // Add the plugin config if it doesn't exist in the plugins array
      plugins.push({ name, params } as PluginConfig);
    } else if (isEnabled && pluginIndex !== -1) {
      // Replace the existing plugin config with the new params
      plugins[pluginIndex] = { name, params } as PluginConfig;
    }
  });

  const { data } = optimize(svg, { plugins });

  return data;
}
