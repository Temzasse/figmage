import { parseArgs } from "node:util";

export async function parseCliArgs(rawArgs: string[]) {
  return parseArgs({
    args: rawArgs.slice(2),
    allowPositionals: true,
    options: {
      config: { type: "string", short: "c" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });
}
