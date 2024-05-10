// @ts-check
import camelCase from "lodash.camelcase";
import kebabCase from "lodash.kebabcase";
import snakeCase from "lodash.snakecase";

export async function promiseAllInBatches(task, items, batchSize) {
  let cursor = 0;
  let results = [];

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

export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function roundToDecimal(num) {
  return Math.abs(Math.round(num * 10) / 10);
}

export function toFixed(num, dec) {
  return parseFloat(num.toFixed(dec));
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isObject(obj) {
  return typeof obj === "object" && obj !== null;
}

export function isString(str) {
  return typeof str === "string" && str.length > 0;
}

export function isNumber(num) {
  return typeof num === "number" && !isNaN(num);
}

export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function normalizeFrames(rootNode) {
  const nodesByName = {};

  function traverse(node) {
    if (node.children) {
      node.children.forEach(traverse);
    }

    if (node.type === "FRAME") {
      nodesByName[node.name] = node.id;
    }
  }

  traverse(rootNode);

  return nodesByName;
}

/**
 * Converts a string to a specific case.
 * @param {string} str
 * @param {'kebab' | 'snake' | 'camel' | 'lower'} casing
 * @returns string
 */
export function toCase(str, casing) {
  if (casing === "kebab") return kebabCase(str);
  if (casing === "snake") return snakeCase(str);
  if (casing === "lower") return str.toLowerCase();
  return camelCase(str);
}
