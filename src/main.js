import ora from "ora";
import log from "./log";
import { sleep } from "./utils";
import FigmaAPI from "./api";
import Tokenizer from "./tokenizer";

export async function main({ options, config, env }) {
  const figmaAPI = new FigmaAPI({
    accessToken: env.FIGMA_ACCESS_TOKEN,
    fileId: env.FIGMA_FILE_ID,
  });

  const tokenizer = new Tokenizer({ config, figmaAPI });

  const spinner = ora("Generating desing tokens from Figma file").start();

  try {
    await tokenizer.tokenize();
  } catch (error) {
    spinner.fail("Failed to tokenize Figma file!");
    throw error;
  }

  try {
    spinner.text = "Writing design tokens to disk";
    await tokenizer.write();
    spinner.succeed("Design tokens successfully saved!");
  } catch (error) {
    spinner.fail("Failed to write tokens to disk!");
    throw error;
  }

  if (options.watch) {
    await watch({ figmaAPI, tokenizer });
  }
}

async function watch({ figmaAPI, tokenizer }) {
  log.info("Watching for changes in Figma file...");
  let currentVersion = await figmaAPI.fetchLatestVersion();

  while (true) {
    await sleep(5000); // TODO: get sleep duration from options?
    const latestVersion = await figmaAPI.fetchLatestVersion();

    if (latestVersion !== currentVersion) {
      log.info("Detected changes in Figma file!");
      const spinner = ora("Loading new design tokens").start();

      try {
        await tokenizer.tokenize();
        await tokenizer.write();
        spinner.succeed("Design tokens are up-to-date!");
      } catch (error) {
        spinner.fail("Failed to load design tokens!");
        throw error;
      } finally {
        currentVersion = latestVersion;
      }
    }
  }
}
