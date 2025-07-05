export const TOKEN_TYPE = {
  color: "COLOR",
  text: "TEXT",
  dropShadow: "DROP_SHADOW",
  property: "PROPERTY",
  image: "IMAGE",
} as const;

export const TOKEN_TEMPLATE =
  "/* eslint-disable */\n" +
  "<% tokens.forEach(function(x) { %>" +
  "export const <%= x[0] %> = <%= JSON.stringify(x[1], null, 2) %>;\n" +
  "<% }); %>\n" +
  "export type <%= name.charAt(0).toUpperCase() + name.slice(1) %>Token = " +
  "<%= tokenNames.map(t => JSON.stringify(t)).join(' | ') %>;\n";

export const RESERVED_KEYWORDS = [
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
