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

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const roundToDecimal = (num) => Math.abs(Math.round(num * 10) / 10);

export const toFixed = (num, dec) => parseFloat(num.toFixed(dec));

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
