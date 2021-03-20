import fs from "fs";
import template from "lodash.template";
import snakeCase from "lodash.snakecase";
import camelCase from "lodash.camelcase";
import log from "./log";

const TEMPLATE = `
<% tokens.forEach(function(token) { %>
export const <%- token[0] %> = '<%= JSON.stringify(token[1]) %>';
<% }); %>`;

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

  write() {
    Object.entries(this.tokens).map(([key, { type, values }]) => {
      if (type === "color") {
        console.log("Handle colors");
      } else if (type === "text") {
        console.log("Handle text");
      } else if (type === "linear-gradient") {
        console.log("Handle gradients");
      } else if (type === "drop-shadow") {
        console.log("Handle shadows");
      } else if (type === "height" || type === "width" || type === "radius") {
        console.log("Handle simple values");
      } else if (type === "dimensions") {
        console.log("Handle dimensions");
      } else if (type === "svg") {
        console.log("Handle svgs");
      }
    });
  }
}

// const { tokens: tokensConfig, ...rest } = this.config.output;

// Object.entries(rest).forEach(([tokenName, config]) => {
//   const data = this.tokens[tokenName];
//   fs.writeFileSync(config.filename, JSON.stringify(data, null, 2));
//   delete this.tokens[tokenName];
// });

// if (this.config.formatting && this.config.formatting.tokenCase) {
//   switch (this.config.formatting.tokenCase) {
//     case "snake":
//       return snakeCase(name);
//     case "kebab":
//       return kebabCase(name);
//     case "camel":
//       return camelCase(name);
//     case "lower":
//       return name.toLowerCase().replace(/\s/g, "");
//     case "upper":
//       return name.toUpperCase().replace(/\s/g, "");
//     default:
//       break;
//   }
// }
