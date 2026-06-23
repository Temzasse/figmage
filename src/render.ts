import type { IgnoreComment, SyncResult } from "./types";
import { pascalCase } from "./utils";

const ignoreCommentMap = {
  eslint: "/* eslint-disable */",
  prettier: "/* prettier-ignore */",
  oxlint: "/* oxlint-disable */",
  oxfmt: "/* oxfmt-ignore */",
  biome: "// biome-ignore-all lint: generated file",
} satisfies Record<IgnoreComment, string>;

type RenderTSOptions = {
  name: string;
  tokens: SyncResult["tokens"];
  ignoreComments?: readonly IgnoreComment[];
};

type RenderJSOptions = {
  tokens: SyncResult["tokens"];
  ignoreComments?: readonly IgnoreComment[];
};

export function renderIgnoreComments(ignoreComments: readonly IgnoreComment[] = []) {
  return ignoreComments.map((comment) => `${ignoreCommentMap[comment]}\n`).join("");
}

export function renderTS({ name, tokens, ignoreComments }: RenderTSOptions) {
  const { sortedTokens, templateTokens } = prepareTemplateTokens(tokens);
  const renderedIgnoreComments = renderIgnoreComments(ignoreComments);

  const exports = templateTokens
    .map(([tokenName, value]) => {
      return `export const ${tokenName} = ${JSON.stringify(value, null, 2)};`;
    })
    .join("\n");

  const typeName = `${pascalCase(name)}Token`;
  const tokenNames = sortedTokens.map((t) => JSON.stringify(t.name)).join(" | ");

  return `${renderedIgnoreComments}${exports}\n\nexport type ${typeName} = ${tokenNames};\n`;
}

export function renderJS({ tokens, ignoreComments }: RenderJSOptions) {
  const { templateTokens } = prepareTemplateTokens(tokens);
  const renderedIgnoreComments = renderIgnoreComments(ignoreComments);

  const exports = templateTokens
    .map(([tokenName, value]) => {
      return `export const ${tokenName} = ${JSON.stringify(value, null, 2)};`;
    })
    .join("\n");

  return `${renderedIgnoreComments}${exports}\n`;
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
