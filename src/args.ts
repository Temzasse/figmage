import { parseArgs } from "node:util";

export async function parseCliArgs(rawArgs: string[]) {
  return parseArgs({
    args: rawArgs.slice(2),
    allowPositionals: true,
    options: {
      config: { type: "string", short: "c" },
      only: { type: "string" },
      skip: { type: "string" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
      verbose: { type: "boolean", short: "V" },
      // Spritesheet options
      "sprite-input": { type: "string" },
      "sprite-case": { type: "string" },
      "sprite-convert-colors": { type: "boolean" },
      "sprite-filename": { type: "string" },
      "sprite-output": { type: "string" },
      "sprite-ids-enabled": { type: "boolean" },
      "sprite-ids-filename": { type: "string" },
      "sprite-ids-filetype": { type: "string" },
      "sprite-ids-output": { type: "string" },
    },
  });
}
