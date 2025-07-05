import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import consola from "consola";
import type { Config } from "./types";

export function defineConfig(config: Config) {
  return config;
}

export async function loadConfig(
  configPath: string,
  cwd = process.cwd()
): Promise<Config> {
  const foundConfig = [configPath, "figmage.config.js"]
    .map((file) => path.join(cwd, file))
    .find(fs.existsSync);

  if (!foundConfig) {
    consola.error(
      new Error(
        "No config file found. Expected figmage.config.js or a custom path."
      )
    );
    process.exit(1);
  }

  const { default: config } = await import(pathToFileURL(foundConfig).href);
  return config;
}
