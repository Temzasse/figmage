import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { cli } from "../dist/index.mjs";

test("sprites preserve attributes from the source svg element", async (context) => {
  const testDir = await fs.mkdtemp(path.join(os.tmpdir(), "figmage-sprite-"));
  const inputDir = path.join(testDir, "icons");
  const outputDir = path.join(testDir, "output");

  context.after(() => fs.rm(testDir, { recursive: true, force: true }));

  await Promise.all([fs.mkdir(inputDir), fs.mkdir(outputDir)]);
  await fs.writeFile(
    path.join(inputDir, "user-round.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg" id="source-id" width="32" height="20" viewBox="0 0 32 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide user-round"><circle cx="16" cy="7" r="5"/><path d="M24 20a8 8 0 0 0-16 0"/></svg>',
    "utf8",
  );

  await cli([
    "node",
    "figmage",
    "spritesheet",
    "--sprite-input",
    inputDir,
    "--sprite-output",
    outputDir,
    "--sprite-filename",
    "icons",
  ]);

  const spritesheet = await fs.readFile(path.join(outputDir, "icons.svg"), "utf8");

  assert.match(
    spritesheet,
    /<symbol[^>]*width="32"[^>]*height="20"[^>]*viewBox="0 0 32 20"[^>]*fill="none"[^>]*stroke="currentColor"[^>]*stroke-width="2"[^>]*stroke-linecap="round"[^>]*stroke-linejoin="round"[^>]*class="lucide user-round"[^>]*id="user-round">/,
  );
  assert.doesNotMatch(spritesheet, /id="source-id"/);
  assert.equal((spritesheet.match(/xmlns=/g) ?? []).length, 1);
});
