export const DEFAULT_BASE_FONT_SIZE = 16;
export const DEFAULT_TEXT_FORMAT = "rem";
export const DEFAULT_COLOR_FORMAT = "hsl";
export const DEFAULT_PROPERTY_FORMAT = "px";
export const DEFAULT_IMAGE_FORMAT = "svg";

export const TOKEN_TYPE = {
  text: "text",
  color: "color",
  dropShadow: "dropShadow",
  property: "property",
  imageVector: "imageVector",
  imageSprite: "imageSprite",
  imageRaster: "imageRaster",
} as const;

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
