import { parseArgs } from "node:util";

export async function parseCliArgs(rawArgs: string[]) {
  return parseArgs({
    args: rawArgs.slice(2),
    allowPositionals: true,
    options: {
      config: { type: "string", short: "c" },
      env: { type: "string", short: "e" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
      verbose: { type: "boolean", short: "V" },
    },
  });
}
