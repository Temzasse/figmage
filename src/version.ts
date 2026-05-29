import { readFile } from "node:fs/promises";

export async function getVersion() {
  try {
    const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf-8"));
    return pkg.version;
  } catch (error) {
    console.error("Failed to read package version:", error);
    return "unknown";
  }
}
