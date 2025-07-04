import { consola } from "consola";
import { parseCliArgs } from "./args";
import { getVersion } from "./version";
import { loadConfig } from "./config";

export async function cli(args: string[]) {
  const { values, positionals } = await parseCliArgs(args);

  if (values.help) {
    consola.info("Usage: figmage <command> [options]");
    process.exit(0);
  }

  if (values.version) {
    const version = await getVersion();
    consola.info(`Figmage v${version}`);
    process.exit(0);
  }

  const command = positionals[0];
  const configPath = values.config || "figmage.config.js";
  const config = await loadConfig(configPath);

  consola.log("Loaded config:", config);

  switch (command) {
    case "tokenize":
      consola.start("Running tokenize...");
      break;
    case "codegen":
      consola.start("Running codegen...");
      break;
    default:
      consola.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}
