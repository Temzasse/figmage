import type { SyncResult } from "./types";
import { pascalCase } from "./utils";

const ignoreComments = "/* eslint-disable */\n" + "/* prettier-ignore */\n";

export function renderTS(name: string, tokens: SyncResult["tokens"]) {
  const { sortedTokens, templateTokens } = prepareTemplateTokens(tokens);

  const exports = templateTokens
    .map(([tokenName, value]) => {
      return `export const ${tokenName} = ${JSON.stringify(value, null, 2)};`;
    })
    .join("\n");

  const typeName = `${pascalCase(name)}Token`;
  const tokenNames = sortedTokens.map((t) => JSON.stringify(t.name)).join(" | ");

  return `${ignoreComments}${exports}\n\nexport type ${typeName} = ${tokenNames};\n`;
}

export function renderJS(tokens: SyncResult["tokens"]) {
  const { templateTokens } = prepareTemplateTokens(tokens);

  const exports = templateTokens
    .map(([tokenName, value]) => {
      return `export const ${tokenName} = ${JSON.stringify(value, null, 2)};`;
    })
    .join("\n");

  return `${ignoreComments}${exports}\n`;
}

export function renderJSON(tokens: SyncResult["tokens"]) {
  const { templateTokens } = prepareTemplateTokens(tokens);
  return JSON.stringify(Object.fromEntries(templateTokens), null, 2);
}

// Helpers

function prepareTemplateTokens(tokens: SyncResult["tokens"]) {
  const sortedTokens = [...tokens].sort((a, b) => a.name.localeCompare(b.name));
  const templateTokens: [string, unknown][] = [];
  const groupedTokens = Object.groupBy(sortedTokens, (t) =>
    "group" in t && t.group ? t.group : "_",
  );
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

  return { sortedTokens, templateTokens };
}
