import template from "lodash.template";
import snakeCase from "lodash.snakecase";
import camelCase from "lodash.camelcase";

const TEMPLATE = `
<% tokens.forEach(function(token) { %>
export const <%- token[0] %> = '<%- JSON.stringify(token[1]) %>';
<% }); %>`;

export default class Codegen {
  constructor({ config, tokens }) {
    this.config = config;
    this.tokens = tokens;
  }

  write() {
    // TODO: implement
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
