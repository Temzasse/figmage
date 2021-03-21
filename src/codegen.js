import fs from "fs";
import template from "lodash.template";
import camelCase from "lodash.camelcase";
import log from "./log";

export default class Codegen {
  constructor({ config }) {
    this.config = config;
    this.tokens = this.readTokens();
  }

  readTokens() {
    try {
      return JSON.parse(fs.readFileSync("tokens/base.json", "utf8"));
    } catch (error) {
      log.error(
        "No tokens found! Make sure to run `figma-tokenizer tokenize before generating code from the design tokens.`"
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

  handleTokens(filename, values, temp) {
    const compiled = template(temp);
    const tokens = Object.entries(values)
      .map(([k, v]) => [camelCase(k), v])
      .filter(this.filterTokens)
      .sort(this.sortTokens);

    fs.writeFileSync(`tokens/${filename}.ts`, compiled({ tokens }));
  }

  write() {
    Object.entries(this.tokens).map(([key, { type, values }]) => {
      if (type === "color" || type === "svg") {
        this.handleTokens(key, values, STRING_TEMPLATE);
      } else if (type === "height" || type === "width" || type === "radius") {
        this.handleTokens(key, values, NUMBER_TEMPLATE);
      } else {
        this.handleTokens(key, values, OBJECT_TEMPLATE);
      }
    });
  }
}

const STRING_TEMPLATE =
  "<% tokens.forEach(function(token) { %>" +
  "export const <%= token[0] %> = '<%= token[1] %>';\n" +
  "<% }); %>";

const NUMBER_TEMPLATE =
  "<% tokens.forEach(function(token) { %>" +
  "export const <%= token[0] %> = <%= token[1] %>;\n" +
  "<% }); %>";

const OBJECT_TEMPLATE =
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
