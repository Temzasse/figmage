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

export function camelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
}

export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
}

export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
}

/**
 * Converts a string to a specific case.
 */
export function toCase(str: string, casing: TokenCasing = "camel"): string {
  if (casing === "kebab") return kebabCase(str);
  if (casing === "snake") return snakeCase(str);
  if (casing === "lower") return str.toLowerCase();
  return camelCase(str);
}
