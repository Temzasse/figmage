import { createConsola } from "consola";
import { parseCliArgs } from "./args";
import { loadConfig } from "./config";
import { Sync } from "./sync";
import { getVersion } from "./version";

export async function cli(args: string[]) {
  const { values, positionals } = await parseCliArgs(args);

  const log = createConsola({
    level: values.verbose ? 4 : 3,
  });

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
    case "sync": {
      const sync = new Sync({ config, log });

      log.start("Syncing design tokens from Figma...");

      const result = await sync.run();

      if (result.length === 0) {
        log.info("No tokens to write.");
        return;
      }

      await sync.write(result);

      log.success("Design tokens synced successfully.");
      break;
    }
    default: {
      log.error(`Unknown command: ${command}`);
      process.exit(1);
    }
  }
}
