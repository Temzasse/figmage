// @ts-check
import fs from "fs";
import template from "lodash.template";
import camelCase from "lodash.camelcase";
import kebabCase from "lodash.kebabcase";
import log from "./log";

export default class Codegen {
  constructor({ config }) {
    this.config = config;
    this.tokens = this.readTokens();
  }

  readTokens() {
    const outputDir = this.config.outputDir || "tokens";

    try {
      return JSON.parse(fs.readFileSync(`${outputDir}/tokens.json`, "utf8"));
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
    return camelCase(name);
  }

  write() {
    const outputDir = this.config.outputDir || "tokens";

    Object.entries(this.tokens).map(([name, { values }]) => {
      const config = {
        ...DEFAULT_CONFIG,
        ...this.config.codegen.defaults,
        ...(this.config.codegen[name] || {}),
      };

      const filename = config.filename || name;

      const tokens = Object.entries(values)
        .map(([k, v]) => [this.formatTokenName(k, config.tokenCase), v])
        .filter(this.filterTokens)
        .sort(this.sortTokens);

      if (config.filetype === "ts" || config.filetype === "js") {
        const compiled = template(TEMPLATE, {});

        fs.writeFileSync(
          `${outputDir}/${filename}.${config.filetype}`,
          compiled({ tokens })
        );
      }

      if (config.filetype === "json") {
        const json = tokens.reduce((acc, val) => {
          acc[val[0]] = val[1];
          return acc;
        }, {});

        fs.writeFileSync(
          `${outputDir}/${filename}.json`,
          JSON.stringify(json, null, 2)
        );
      }

      if (config.filetype === "svg") {
        const dirname = `${outputDir}/${config.dirname || name}`;

        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname);
        }

        tokens.forEach((token) => {
          fs.writeFileSync(`${dirname}/${token[0]}.svg`, token[1]);
        });
      }
    });
  }
}

const DEFAULT_CONFIG = {
  filetype: "ts",
  tokenCase: "camel",
};

const TEMPLATE =
  "/* eslint-disable */\n" +
  "<% tokens.forEach(function(token) { %>" +
  "export const <%= token[0] %> = <%= JSON.stringify(token[1], null, 2) %>;\n" +
  "<% }); %>";

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
