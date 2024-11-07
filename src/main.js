// @ts-check

import ora from "ora";

import { sleep } from "./utils.js";
import { log } from "./log.js";
import { generateSpritesheet, readSpritesheetInput } from "./sprite.js";
import { FigmaAPI } from "./api.js";
import { Tokenizer } from "./tokenizer.js";
import { Codegen } from "./codegen.js";

export async function tokenize({ options, env, config }) {
  const spinner = ora().start();

  const figmaAPI = new FigmaAPI({
    accessToken: env.FIGMA_ACCESS_TOKEN,
    fileId: env.FIGMA_FILE_ID,
  });

  const tokenizer = new Tokenizer({ config, figmaAPI });

  try {
    spinner.text = "Generating design tokens from Figma file...";
    await tokenizer.tokenize();
  } catch (error) {
    spinner.fail("Failed to tokenize Figma file!");
    logError(options, error);
    process.exit(1);
  }

  try {
    tokenizer.write();
    spinner.succeed("Design tokens successfully saved!");
  } catch (error) {
    spinner.fail("Failed to write design tokens to disk!");
    logError(options, error);
    process.exit(1);
  }
}

export async function codegen({ options, env, config }) {
  const spinner = ora().start();

  const figmaAPI = new FigmaAPI({
    accessToken: env.FIGMA_ACCESS_TOKEN,
    fileId: env.FIGMA_FILE_ID,
  });

  spinner.text = "Generating code from design tokens...";

  try {
    const codegen = new Codegen({ config, figmaAPI });
    await codegen.write();
    await sleep(2000);
    spinner.succeed("Codegen complete!");
  } catch (error) {
    spinner.fail("Codegen failed!");
    logError(options, error);
    process.exit(1);
  }
}

export async function spritesheet(options) {
  const spinner = ora().start();

  spinner.text = "Generating spritesheet...";

  if (!options.spriteInput) {
    spinner.fail("No spritesheet input file provided!");
    process.exit(1);
  }

  if (!options.spriteOutDir) {
    spinner.fail("No spritesheet output directory provided!");
    process.exit(1);
  }

  try {
    const spriteInputDirname = options.spriteInput.split("/").pop();

    const spriteTokens = await readSpritesheetInput({
      input: options.spriteInput,
      nameCase: options.spriteCase || "kebab",
    });

    generateSpritesheet({
      spriteTokens,
      spriteOutDir: options.spriteOutDir,
      spriteFilename: `${spriteInputDirname}-sprite`,
      idsOutDir: options.spriteIdsOutDir,
      idsFilename: `${spriteInputDirname}-ids`,
      writeIds: Boolean(options.spriteIdsOutDir),
    });

    spinner.succeed("Spritesheet generated!");
  } catch (error) {
    spinner.fail("Spritesheet generation failed!");
    logError(options, error);
    process.exit(1);
  }
}

function logError(options, error) {
  if (options.verbose) {
    throw error;
  }

  if (error.isAxiosError) {
    log.error("Request to Figma API failed");
  }

  log.error(error.message);
}
