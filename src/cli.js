// @ts-check
require("dotenv").config();

import fs from "fs";
import arg from "arg";
import { main } from "./main";

export function cli(args) {
  const options = parseArgumentsIntoOptions(args);

  let config;

  if (options.config) {
    config = JSON.parse(fs.readFileSync(options.config, "utf8"));
  } else {
    // Read from default locations
    if (fs.existsSync(".figma-tokenizer.json")) {
      config = JSON.parse(fs.readFileSync(".figma-tokenizer.json", "utf8"));
    } else if (fs.existsSync(".figma-tokenizerrc")) {
      config = JSON.parse(fs.readFileSync(".figma-tokenizerrc", "utf8"));
    } else if (fs.existsSync("package.json")) {
      const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
      config = pkg["figma-tokenizer"];
    }
  }

  if (!config) {
    throw Error("No config found!");
  }

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
      "--only-new": Boolean,
    },
    { argv: rawArgs.slice(2) }
  );
  return {
    commands: args["_"],
    config: args["--config"],
    watch: args["--watch"] || false,
    onlyNew: args["--only-new"] || false,
  };
}
