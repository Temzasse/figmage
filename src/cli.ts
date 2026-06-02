import { createConsola } from "consola";
import { parseCliArgs } from "./args";
import { loadConfig } from "./config";
import { generateSpritesheet, readSpritesheetInput } from "./sprite";
import { Sync } from "./sync";
import { getVersion } from "./version";
import type { TokenCasing } from "./types";

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

  switch (command) {
    case "sync": {
      const configPath = values.config || "figmage.config.js";
      const config = await loadConfig(configPath);

      if (!config.accessToken || !config.fileId) {
        log.error(
          "Missing required configuration: `accessToken` and `fileId` must be set.",
        );
        process.exit(1);
      }

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
    case "spritesheet": {
      const spriteInput = values["sprite-input"];
      const spriteDir = values["sprite-output"];
      const spriteFilename = values["sprite-filename"];
      const spriteCase = values["sprite-case"] || "kebab";
      const spriteConvertColors = values["sprite-convert-colors"] || true;
      const idsEnabledValue = values["sprite-ids-enabled"];
      const idsFilename = values["sprite-ids-filename"];
      const idsFileTypeValue = values["sprite-ids-filetype"] || "ts";
      const idsDir = values["sprite-ids-output"];

      if (!spriteInput) {
        log.error("Missing required argument: --sprite-input");
        process.exit(1);
      }

      if (!spriteDir) {
        log.error("Missing required argument: --sprite-dir");
        process.exit(1);
      }

      if (!spriteFilename) {
        log.error("Missing required argument: --sprite-filename");
        process.exit(1);
      }

      const idsFileTypeRaw = idsFileTypeValue || "ts";
      if (!["ts", "js", "json"].includes(idsFileTypeRaw)) {
        log.error("Invalid value for ids file type. Use one of: ts, js, json");
        process.exit(1);
      }

      if (
        !["camel", "kebab", "snake", "lower", "pascal"].includes(spriteCase)
      ) {
        log.error(
          "Invalid value for sprite case. Use one of: camel, kebab, snake, lower, pascal",
        );
        process.exit(1);
      }

      const idsEnabled =
        idsEnabledValue !== undefined
          ? idsEnabledValue
          : Boolean(idsFilename || idsDir || idsFileTypeValue);

      log.start("Generating spritesheet...");

      const tokens = await readSpritesheetInput({
        input: spriteInput,
        nameCase: spriteCase as TokenCasing,
        convertColors: spriteConvertColors || false,
      });

      await generateSpritesheet({
        tokens,
        spriteDir,
        spriteFilename,
        idsEnabled,
        idsDir: idsDir || spriteDir,
        idsFilename: idsFilename || `${spriteFilename}-ids`,
        idsFileType: idsFileTypeRaw as "ts" | "js" | "json",
      });

      log.success("Spritesheet generated successfully.");
      break;
    }
    default: {
      log.error(`Unknown command: ${command}`);
      process.exit(1);
    }
  }
}
