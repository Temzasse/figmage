// @ts-check
import dotenv from "dotenv";
import fs from "fs";
import arg from "arg";

import { tokenize, codegen, spritesheet } from "./main.js";

export function cli(args) {
  const options = parseArgumentsIntoOptions(args);
  const command = options.commands[0];

  if (command === "tokenize") {
    const config = getConfig(options);
    const env = getEnv(options);
    tokenize({ options, config, env });
  } else if (command === "codegen") {
    const config = getConfig(options);
    const env = getEnv(options);
    codegen({ options, config, env });
  } else if (command === "spritesheet") {
    spritesheet(options);
  } else {
    console.error(`Invalid command ${command}!`);
    process.exit(1);
  }
}

function getConfig(options) {
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

  return config;
}

function getEnv(options) {
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

  return env;
}

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      "--config": String,
      "-c": "--config",
      "--env": String,
      "-e": "--env",
      "--verbose": Boolean,
      "-v": "--verbose",
      // Spritesheet options
      "--sprite-input": String,
      "--sprite-case": String, // kebab, snake, camel
      "--sprite-out-dir": String,
      "--sprite-ids-out-dir": String,
    },
    { argv: rawArgs.slice(2) }
  );
  return {
    commands: args["_"],
    config: args["--config"],
    env: args["--env"],
    verbose: args["--verbose"] || false,
    // Spritesheet options
    spriteInput: args["--sprite-input"],
    spriteCase: args["--sprite-case"],
    spriteOutDir: args["--sprite-out-dir"],
    spriteIdsOutDir: args["--sprite-ids-out-dir"],
  };
}
