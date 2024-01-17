// @ts-check
import fs from "fs";
import get from "lodash.get";
import template from "lodash.template";
import camelCase from "lodash.camelcase";
import kebabCase from "lodash.kebabcase";
import snakeCase from "lodash.snakecase";
import log from "./log";
import { isEmptyObject } from "./utils";

export default class Codegen {
  constructor({ config, figmaAPI }) {
    this.config = config;
    this.figmaAPI = figmaAPI;
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

  /**
   * Filter out tokens that are reserved JavaScript keywords
   * @param {string} tokenName
   * @returns {boolean}
   */
  filterReservedKeywords(tokenName) {
    if (RESERVED_KEYWORDS.includes(tokenName)) {
      log.error(
        `Invalid token name! The following token name is a reserved JavaScript keyword: ${tokenName}.`
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

  /**
   * Format a token name based on the token case
   * @param {string} name
   * @param {'camel' | 'kebab' | 'snake'} tokenCase
   * @returns {string}
   */
  formatTokenName(name, tokenCase) {
    if (tokenCase === "kebab") return kebabCase(name);
    if (tokenCase === "snake") return snakeCase(name);
    return camelCase(name);
  }

  /**
   * Check if a token value is a group of tokens
   * @param {string} key
   * @param {*} value
   * @returns {boolean}
   */
  isGroup(key, value) {
    return (
      typeof value === "object" &&
      (key === "colors" || (key === "typography" && !("fontSize" in value)))
    );
  }

  /**
   * Get the rules for a token type and rule type
   * @param {string} tokenType
   * @param {'include' | 'exclude'} ruleType
   * @returns {object}
   */
  getRules(tokenType, ruleType) {
    const config = this.config.codegen;
    const defaultRules = get(config, `defaults.${ruleType}`);
    const specificRules = get(config, `${tokenType}.${ruleType}`);
    return specificRules || defaultRules;
  }

  /**
   * Check if a token or group should be included or excluded based on the rules
   * @param {*} rules
   * @param {string} tokenName
   * @param {'token' | 'group'} type
   * @returns {boolean}
   */
  checkRule(rules, tokenName, type) {
    const rule = rules[type];

    if (Array.isArray(rule)) {
      return rule.includes(tokenName);
    } else {
      const regex = new RegExp(rules[type]);
      return regex.test(tokenName);
    }
  }

  /**
   * Check if a token should be included or excluded based on the rules
   * @param {string} tokenType
   * @param {string} tokenName
   * @param {'token' | 'group'} type
   * @returns {boolean}
   */
  filterByRules(tokenType, tokenName, type) {
    let shouldInclude = true;

    const includeRules = this.getRules(tokenType, "include");

    if (includeRules && includeRules[type]) {
      shouldInclude = this.checkRule(includeRules, tokenName, type);
    }

    if (!shouldInclude) return false;

    const excludeRules = this.getRules(tokenType, "exclude");

    if (excludeRules && excludeRules[type]) {
      shouldInclude = !this.checkRule(excludeRules, tokenName, type);
    }

    return shouldInclude;
  }

  async write() {
    const outDir = this.config.outDir || "tokens";

    // `tokenType` is one of `colors`, `typography`, `spacing`, etc.
    for (const [tokenType, tokenValues] of Object.entries(this.tokens)) {
      const config = {
        ...DEFAULT_CONFIG,
        ...this.config.codegen.defaults,
        ...(this.config.codegen[tokenType] || {}),
      };

      const filename = config.filename || tokenType;
      const tokenNames = new Set();

      const tokens = Object.entries(tokenValues)
        .filter(([tokenNameOrGroupName, tokenValueOrGroupValues]) => {
          if (this.isGroup(tokenType, tokenValueOrGroupValues)) {
            return this.filterByRules(tokenType, tokenNameOrGroupName, "group");
          }

          return this.filterByRules(tokenType, tokenNameOrGroupName, "token");
        })
        .map(([tokenNameOrGroupName, tokenValueOrGroupValues]) => {
          const tokenName = this.formatTokenName(
            tokenNameOrGroupName,
            config.tokenCase
          );

          let tokenValue = tokenValueOrGroupValues;

          // Format token value object keys for Figma variable groups
          // Eg. `typography.native/web` or `colors.light/dark`
          if (this.isGroup(tokenType, tokenValueOrGroupValues)) {
            tokenValue = Object.entries(tokenValueOrGroupValues)
              .filter((entry) =>
                this.filterByRules(tokenType, entry[0], "token")
              )
              .reduce((acc, entry) => {
                const tokenNameInGroup = this.formatTokenName(
                  entry[0],
                  config.tokenCase
                );

                tokenNames.add(tokenNameInGroup);

                return { ...acc, [tokenNameInGroup]: entry[1] };
              }, {});

            // Sort group token values alphabetically as well
            tokenValue = Object.entries(tokenValue)
              .sort(this.sortTokens)
              .reduce((acc, entry) => ({ ...acc, [entry[0]]: entry[1] }), {});
          } else {
            tokenNames.add(tokenName);
          }

          return [tokenName, tokenValue];
        })
        .filter((entry) => this.filterReservedKeywords(entry[0]))
        .filter((entry) => !isEmptyObject(entry[1]))
        .sort(this.sortTokens); // Sort tokens alphabetically

      if (config.filetype === "ts" || config.filetype === "js") {
        const compiled = template(TOKEN_TEMPLATE, {});

        fs.writeFileSync(
          `${outDir}/${filename}.${config.filetype}`,
          compiled({
            name: tokenType,
            tokens,
            tokenNames: Array.from(tokenNames).sort(),
          })
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
          const dirname = `${outDir}/${config.dirname || tokenType}`;

          if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname);
          }

          tokens.forEach((token) => {
            fs.writeFileSync(`${dirname}/${token[0]}.svg`, token[1]);
          });
        }
      }

      if (config.filetype === "png") {
        const dirname = `${outDir}/${config.dirname || tokenType}`;

        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname);
        }

        const promises = tokens.map((token) => {
          const [name, url] = token;
          return this.figmaAPI.downloadFile(url, `${dirname}/${name}.png`);
        });

        await Promise.all(promises);
      }
    }
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
  "export type <%= name.charAt(0).toUpperCase() + name.slice(1) %>Token = " +
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
