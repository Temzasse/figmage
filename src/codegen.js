// @ts-check
import fs from "fs";
import template from "lodash.template";
import camelCase from "lodash.camelcase";
import kebabCase from "lodash.kebabcase";
import snakeCase from "lodash.snakecase";
import log from "./log";

export default class Codegen {
  constructor({ config }) {
    this.config = config;
    this.tokens = this.readTokens();
  }

  readTokens() {
    const outDir = this.config.outDir || "tokens";

    try {
      return JSON.parse(fs.readFileSync(`${outDir}/tokens.json`, "utf8"));
    } catch (error) {
      log.error(
        "No tokens found! Make sure to run `figmage tokenize` before generating code from the design tokens."
      );
      throw error;
    }
  }

  filterTokens(token) {
    if (RESERVED_KEYWORDS.includes(token[0])) {
      log.error(
        `Invalid token name! The following token name is a reserved JavaScript keyword: ${token[0]}.`
      );
      return false;
    }
    return true;
  }

  sortTokens(a, b) {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  }

  formatTokenName(name, tokenCase) {
    if (tokenCase === "kebab") return kebabCase(name);
    if (tokenCase === "snake") return snakeCase(name);
    return camelCase(name);
  }

  write() {
    const outDir = this.config.outDir || "tokens";

    Object.entries(this.tokens).map(([name, values]) => {
      const config = {
        ...DEFAULT_CONFIG,
        ...this.config.codegen.defaults,
        ...(this.config.codegen[name] || {}),
      };

      const filename = config.filename || name;

      const tokenNames = new Set();
      const tokens = Object.entries(values)
        .map(([k, v]) => {
          const tokenName = this.formatTokenName(k, config.tokenCase);
          let tokenValue = v;

          if (
            typeof v === "object" &&
            (name === "colors" || name === "typography")
          ) {
            // Format token value object keys for Figma variable groups
            // Eg. `typography.native/web` or `colors.light/dark`
            tokenValue = Object.entries(v).reduce((acc, entry) => {
              const _tokenName = this.formatTokenName(
                entry[0],
                config.tokenCase
              );

              tokenNames.add(_tokenName);

              return { ...acc, [_tokenName]: entry[1] };
            }, {});
          } else {
            tokenNames.add(tokenName);
          }

          return [tokenName, tokenValue];
        })
        .filter(this.filterTokens)
        .sort(this.sortTokens);

      if (config.filetype === "ts" || config.filetype === "js") {
        const compiled = template(TOKEN_TEMPLATE, {});

        fs.writeFileSync(
          `${outDir}/${filename}.${config.filetype}`,
          compiled({ tokens, tokenNames: Array.from(tokenNames).sort() })
        );
      }

      if (config.filetype === "json") {
        const json = tokens.reduce((acc, val) => {
          acc[val[0]] = val[1];
          return acc;
        }, {});

        fs.writeFileSync(
          `${outDir}/${filename}.json`,
          JSON.stringify(json, null, 2)
        );
      }

      if (config.filetype === "svg") {
        if (config.sprite) {
          const spriteCompiled = template(SVG_SPRITE_TEMPLATE, {});
          const rgx = /<svg.*?>([\s\S]*)<\/svg>/i; // remove wrapping svg tag
          const svgs = tokens.map(([k, v]) => [k, v.match(rgx)[1]]);

          let spriteDir = outDir;
          let writeIds = false;

          if (typeof config.sprite === "object") {
            writeIds = Boolean(config.sprite.writeIds);

            if (typeof config.sprite.spriteDir === "string") {
              spriteDir = config.sprite.spriteDir;
            }
          }

          fs.writeFileSync(
            `${spriteDir}/${filename}.svg`,
            spriteCompiled({ svgs })
          );

          // Write ids so that we can more easily reference them in TS
          if (writeIds) {
            const idsCompiled = template(SVG_SPRITE_IDS_TEMPLATE, {});
            const idsFilename = config.sprite.idsFilename || `${filename}-ids`;

            fs.writeFileSync(
              `${outDir}/${idsFilename}.ts`,
              idsCompiled({ ids: svgs.map(([name]) => name) })
            );
          }
        } else {
          const dirname = `${outDir}/${config.dirname || name}`;

          if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname);
          }

          tokens.forEach((token) => {
            fs.writeFileSync(`${dirname}/${token[0]}.svg`, token[1]);
          });
        }
      }
    });
  }
}

const DEFAULT_CONFIG = {
  filetype: "ts",
  tokenCase: "camel",
};

const TOKEN_TEMPLATE =
  "/* eslint-disable */\n" +
  "<% tokens.forEach(function(x) { %>" +
  "export const <%= x[0] %> = <%= JSON.stringify(x[1], null, 2) %>;\n" +
  "<% }); %>\n" +
  "export type Token = " +
  "<%= tokenNames.map(t => JSON.stringify(t)).join(' | ') %>;\n";

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

const RESERVED_KEYWORDS = [
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "type",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
];
