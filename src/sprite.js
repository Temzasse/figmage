// @ts-check
import fs from "fs";
import template from "lodash.template";
import { toCase } from "./utils";
import { optimizeSvg } from "./svgo";

/**
 * Read SVG files from a directory and return an array of tuples with the file name and the SVG content
 * @param {Object} param0
 * @param {string} param0.input
 * @param {'camel' | 'kebab' | 'snake'} param0.nameCase
 * @returns {Promise<string[][]>}
 */
export async function readSpritesheetInput({ input, nameCase }) {
  const svgFiles = fs
    .readdirSync(input)
    .filter((file) => file.endsWith(".svg"));

  const spriteTokens = [];

  for (const file of svgFiles) {
    const name = toCase(file.replace(/\.svg$/, ""), nameCase || "kebab");
    const svg = fs.readFileSync(`${input}/${file}`, "utf8");
    const optimizedSvg = await optimizeSvg(svg);
    spriteTokens.push([name, optimizedSvg]);
  }

  return spriteTokens;
}

/**
 * Generate a spritesheet from an array of SVG tokens
 * @param {Object} param0
 * @param {string[][]} param0.spriteTokens
 * @param {string} param0.spriteOutDir
 * @param {string} param0.spriteFilename
 * @param {string | undefined} param0.idsFilename
 * @param {string | undefined} param0.idsOutDir
 * @param {boolean | undefined} param0.writeIds
 * @returns {void}
 */
export function generateSpritesheet({
  spriteTokens,
  spriteOutDir,
  spriteFilename,
  idsFilename,
  idsOutDir,
  writeIds,
}) {
  const spriteCompiled = template(SVG_SPRITE_TEMPLATE, {});
  const rgx = /<svg.*?>([\s\S]*)<\/svg>/i; // remove wrapping svg tag

  const svgs = spriteTokens.map(([name, svg]) => {
    const match = svg.match(rgx);
    const svgContent = match ? match[1] : "";
    return [name, svgContent];
  });

  // Compile the spritesheet and remove newlines
  const spritesheet = spriteCompiled({ svgs }).replace(/\n/g, "");

  fs.writeFileSync(`${spriteOutDir}/${spriteFilename}.svg`, spritesheet);

  if (writeIds && idsOutDir && idsFilename) {
    const idsCompiled = template(SVG_SPRITE_IDS_TEMPLATE, {});

    fs.writeFileSync(
      `${idsOutDir}/${idsFilename}.ts`,
      idsCompiled({ ids: svgs.map(([name]) => name) })
    );
  }
}

const SVG_SPRITE_TEMPLATE =
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
  "<defs><% svgs.forEach(function(x) { %>" +
  '<symbol viewBox="0 0 24 24" id="<%= x[0] %>">' +
  "<%= x[1] %>" +
  "</symbol><% }); %>" +
  "</defs>" +
  "</svg>";

const SVG_SPRITE_IDS_TEMPLATE =
  "/* eslint-disable */\n" +
  "export const ids = [" +
  "<% ids.forEach(function(x) { %>" +
  "<%= JSON.stringify(x) %>," +
  "<% }); %>" +
  "] as const;\n";
