// @ts-check
const dotenv = require("dotenv");

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
    if (fs.existsSync(".figmage.json")) {
      config = JSON.parse(fs.readFileSync(".figmage.json", "utf8"));
    } else if (fs.existsSync(".figmagerc")) {
      config = JSON.parse(fs.readFileSync(".figmagerc", "utf8"));
    } else if (fs.existsSync("package.json")) {
      const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
      config = pkg["figmage"];
    }
  }

  if (!config) {
    throw Error("No config found!");
  }

  if (options.env) {
    dotenv.config({ path: options.env });
  } else {
    dotenv.config();
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
      "--env": String,
      "-e": "--env",
      "--watch": Boolean,
      "-w": "--watch",
      "--only-new": Boolean,
    },
    { argv: rawArgs.slice(2) }
  );
  return {
    commands: args["_"],
    config: args["--config"],
    env: args["--env"],
    watch: args["--watch"] || false,
    onlyNew: args["--only-new"] || false,
  };
}
