import template from "lodash.template";
import { JS_TEMPLATE, TS_TEMPLATE } from "./constants";
import type { SyncResult } from "./types";

export function renderTemplateJSON(tokens: SyncResult["tokens"]) {
  const sortedTokens = tokens.sort((a, b) => a.name.localeCompare(b.name));

  const templateTokens: [string, unknown][] = [];

  const groupedTokens = Object.groupBy(sortedTokens, (t) => t.group ?? "_");
  const { _: groupless, ...groups } = groupedTokens;

  if (groupless) {
    groupless.forEach((t) => {
      templateTokens.push([t.name, t.value]);
    });
  }

  Object.entries(groups).forEach(([k, v]) => {
    if (!v) return;
    templateTokens.push([
      k,
      v.reduce<Record<string, unknown>>((acc, t) => {
        acc[t.name] = t.value;
        return acc;
      }, {}),
    ]);
  });

  return JSON.stringify(Object.fromEntries(templateTokens), null, 2);
}

export function renderTemplateTS(
  name: SyncResult["name"],
  tokens: SyncResult["tokens"],
): string {
  const sortedTokens = tokens.sort((a, b) => a.name.localeCompare(b.name));
  const templateTokens: [string, unknown][] = [];

  const groupedTokens = Object.groupBy(sortedTokens, (t) => t.group ?? "_");
  const { _: groupless, ...groups } = groupedTokens;

  if (groupless) {
    groupless.forEach((t) => {
      templateTokens.push([t.name, t.value]);
    });
  }

  Object.entries(groups).forEach(([k, v]) => {
    if (!v) return;
    templateTokens.push([
      k,
      v.reduce<Record<string, unknown>>((acc, t) => {
        acc[t.name] = t.value;
        return acc;
      }, {}),
    ]);
  });

  const compiled = template(TS_TEMPLATE, {});

  return compiled({
    name,
    tokens: templateTokens,
    tokenNames: sortedTokens.map((t) => t.name),
  });
}

export function renderTemplateJS(
  name: SyncResult["name"],
  tokens: SyncResult["tokens"],
): string {
  const sortedTokens = tokens.sort((a, b) => a.name.localeCompare(b.name));
  const templateTokens: [string, unknown][] = [];

  const groupedTokens = Object.groupBy(sortedTokens, (t) => t.group ?? "_");
  const { _: groupless, ...groups } = groupedTokens;

  if (groupless) {
    groupless.forEach((t) => {
      templateTokens.push([t.name, t.value]);
    });
  }

  Object.entries(groups).forEach(([k, v]) => {
    if (!v) return;
    templateTokens.push([
      k,
      v.reduce<Record<string, unknown>>((acc, t) => {
        acc[t.name] = t.value;
        return acc;
      }, {}),
    ]);
  });
  const compiled = template(JS_TEMPLATE, {});

  return compiled({
    name,
    tokens: templateTokens,
  });
}
