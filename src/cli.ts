import { parseCliArgs } from "./args";
import { loadConfig } from "./config";
import { log } from "./log";
import { sync } from "./sync";
import { getVersion } from "./version";

export async function cli(args: string[]) {
  const { values, positionals } = await parseCliArgs(args);

  if (values.help) {
    log.info("Usage: figmage <command> [options]");
    process.exit(0);
  }

  if (values.version) {
    const version = await getVersion();
    log.info(`Figmage v${version}`);
    process.exit(0);
  }

  if (positionals.length === 0) {
    log.error("No command provided. Use --help for usage information.");
    process.exit(1);
  }

  const command = positionals[0];
  const configPath = values.config || "figmage.config.js";
  const config = await loadConfig(configPath);

  if (!config.accessToken || !config.fileId) {
    log.error(
      "Missing required configuration: `accessToken` and `fileId` must be set."
    );
    process.exit(1);
  }

  switch (command) {
    case "sync":
      log.start("Syncing design tokens from Figma...");
      await sync(config);
      log.success("Design tokens synced successfully.");
      break;
    default:
      log.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}
