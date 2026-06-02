import type { Node } from "@figma/rest-api-spec";
import type { TokenCasing } from "./types";

export async function promiseAllInBatches<T, R>(
  task: (item: T, index: number) => Promise<R>,
  items: T[],
  batchSize: number,
): Promise<R[]> {
  let cursor = 0;
  let results: R[] = [];

  while (cursor < items.length) {
    const batch = items.slice(cursor, cursor + batchSize);
    results = [
      ...results,
      ...(await Promise.all(batch.map((item, i) => task(item, cursor + i)))),
    ];
    cursor += batchSize;
  }

  return results;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function roundToDecimal(num: number): number {
  return Math.abs(Math.round(num * 10) / 10);
}

export function toFixed(num: number, dec: number): number {
  return parseFloat(num.toFixed(dec));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isObject(obj: unknown): obj is object {
  return typeof obj === "object" && obj !== null;
}

export function isString(str: unknown): str is string {
  return typeof str === "string" && str.length > 0;
}

export function isNumber(num: unknown): num is number {
  return typeof num === "number" && !Number.isNaN(num);
}

export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function normalizeFrames(rootNode: Node): Record<string, string> {
  const nodesByName: Record<string, string> = {};

  function traverse(node: Node): void {
    if ("children" in node) {
      node.children.forEach(traverse);
    }

    if (node.type === "FRAME") {
      nodesByName[node.name] = node.id;
    }
  }

  traverse(rootNode);

  return nodesByName;
}

function splitWords(str: string): string[] {
  if (!str) return [];

  const normalized = str
    // Replace common separators with spaces first.
    .replace(/[\s._\-/\\]+/g, " ")
    // Handle camelCase and PascalCase boundaries.
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    // Handle acronym boundaries like "APIResponse" -> "API Response".
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    // Split alpha/number boundaries.
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2")
    // Keep only letters, numbers, and spaces.
    .replace(/[^A-Za-z0-9 ]+/g, " ")
    .trim();

  if (!normalized) return [];

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

function capitalize(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function camelCase(str: string): string {
  const words = splitWords(str);
  if (words.length === 0) return "";

  const [first, ...rest] = words;
  return first + rest.map(capitalize).join("");
}

export function kebabCase(str: string): string {
  return splitWords(str).join("-");
}

export function snakeCase(str: string): string {
  return splitWords(str).join("_");
}

export function lowerCase(str: string): string {
  return splitWords(str).join("");
}

export function pascalCase(str: string): string {
  return splitWords(str).map(capitalize).join("");
}

/**
 * Read a nested object value with dot notation path like "a.b.c".
 * Array indexing and bracket syntax are intentionally not supported.
 */
export function get<T = unknown>(value: unknown, path: string): T | undefined {
  if (!path) {
    return value as T;
  }

  return path
    .split(".")
    .filter(Boolean)
    .reduce<unknown>((acc, key) => {
      if (acc === null || acc === undefined || typeof acc !== "object") {
        return undefined;
      }

      return (acc as Record<string, unknown>)[key];
    }, value) as T | undefined;
}

/**
 * Converts a string to a specific case.
 */
export function toCase(str: string, casing: TokenCasing = "camel"): string {
  if (casing === "kebab") return kebabCase(str);
  if (casing === "snake") return snakeCase(str);
  if (casing === "lower") return lowerCase(str);
  if (casing === "pascal") return pascalCase(str);
  return camelCase(str);
}
