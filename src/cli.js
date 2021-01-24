// @ts-check
require("dotenv").config();

import fs from "fs";
import arg from "arg";
import ora from "ora";
import log from "./log";
import { sleep } from "./utils";
import FigmaAPI from "./api";
import Tokenizer from "./tokenizer";

export function cli(args) {
  const options = parseArgumentsIntoOptions(args);
  const config = JSON.parse(fs.readFileSync(options.config, "utf8"));

  if (!process.env.FIGMA_ACCESS_TOKEN || !process.env.FIGMA_FILE_ID) {
    throw Error("Missing environment variables for access token and file id!");
  }

  const figmaAPI = new FigmaAPI({
    accessToken: process.env.FIGMA_ACCESS_TOKEN,
    fileId: process.env.FIGMA_FILE_ID,
  });

  const tokenizer = new Tokenizer({ config, figmaAPI });

  main(figmaAPI, tokenizer, options.watch);
}

async function main(figmaAPI, tokenizer, shouldWatch) {
  const spinner = ora("Fetching and tokenizing Figma file").start();

  try {
    await tokenizer.tokenize();
  } catch (error) {
    spinner.fail("Failed to fetch and tokenize Figma file!");
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

  if (shouldWatch) {
    await watch(figmaAPI, tokenizer);
  }
}

async function watch(figmaAPI, tokenizer) {
  log.info("Watching for changes in Figma file...");
  let currentVersion = await figmaAPI.fetchLatestVersion();

  while (true) {
    await sleep(5000); // TODO: get sleep duration from args?
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

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      "--config": String,
      "-c": "--config",
      "--watch": Boolean,
      "-w": "--watch",
    },
    { argv: rawArgs.slice(2) }
  );
  return {
    config: args["--config"] || ".figma-tokenizer.json",
    watch: args["--watch"] || false,
  };
}
