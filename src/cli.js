// @ts-check
require("dotenv").config();

import fs from "fs";
import arg from "arg";
import { main } from "./main";

export function cli(args) {
  const options = parseArgumentsIntoOptions(args);
  const config = JSON.parse(fs.readFileSync(options.config, "utf8"));
  const env = {
    FIGMA_ACCESS_TOKEN: process.env.FIGMA_ACCESS_TOKEN,
    FIGMA_FILE_ID: process.env.FIGMA_FILE_ID,
  };

  if (!env.FIGMA_ACCESS_TOKEN || !env.FIGMA_FILE_ID) {
    throw Error(
      "Missing environment variables for Figma access token and file id!"
    );
  }

  main({ options, config, env });
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
