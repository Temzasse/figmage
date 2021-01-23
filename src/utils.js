// @ts-check

// Figma API seems to have some sort of rate limit so execute API requests in batches
const MAX_PARALLEL_REQUESTS = 40;

export async function promiseAllInBatches(
  task,
  items,
  batchSize = MAX_PARALLEL_REQUESTS
) {
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

export const rgbToHex = (r, g, b) =>
  "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

export const roundToDecimal = (n) => Math.abs(Math.round(n * 10) / 10);

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
