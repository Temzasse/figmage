import ora from "ora";
import { sleep } from "./utils";
import FigmaAPI from "./api";
import Tokenizer from "./tokenizer";
import Codegen from "./codegen";

export async function main({ options, config, env }) {
  const figmaAPI = new FigmaAPI({
    accessToken: env.FIGMA_ACCESS_TOKEN,
    fileId: env.FIGMA_FILE_ID,
  });

  const spinner = ora().start();

  if (options.commands[0] === "tokenize") {
    const tokenizer = new Tokenizer({
      config,
      figmaAPI,
      onlyNew: options.onlyNew,
    });

    try {
      spinner.text = "Generating design tokens from Figma file...";
      await tokenizer.tokenize();
    } catch (error) {
      spinner.fail("Failed to tokenize Figma file!");
      throw error;
    }

    try {
      tokenizer.write();
      spinner.succeed("Design tokens successfully saved!");
    } catch (error) {
      spinner.fail("Failed to write design tokens to disk!");
      throw error;
    }
  } else if (options.commands[0] === "codegen") {
    try {
      spinner.text = "Generating code from design tokens...";
      const codegen = new Codegen({ config });
      codegen.write();
      await sleep(2000);
      spinner.succeed("Codegen complete!");
    } catch (error) {
      spinner.fail("Codegen failed!");
      throw error;
    }
  } else {
    if (!options.commands || options.commands.length === 0) {
      spinner.fail("No command given");
    } else {
      spinner.fail(`Unknow command: ${options.commands[0]}`);
    }
  }
}

// async function watch({ figmaAPI, tokenizer }) {
//   log.info("Watching for changes in Figma file...");
//   let currentVersion = await figmaAPI.fetchLatestVersion();

//   while (true) {
//     await sleep(5000); // TODO: get sleep duration from options?
//     const latestVersion = await figmaAPI.fetchLatestVersion();

//     if (latestVersion !== currentVersion) {
//       log.info("Detected changes in Figma file!");
//       const spinner = ora("Loading new design tokens").start();

//       try {
//         await tokenizer.tokenize();
//         await tokenizer.write();
//         spinner.succeed("Design tokens are up-to-date!");
//       } catch (error) {
//         spinner.fail("Failed to load design tokens!");
//         throw error;
//       } finally {
//         currentVersion = latestVersion;
//       }
//     }
//   }
// }
