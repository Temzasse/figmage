// @ts-check

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
