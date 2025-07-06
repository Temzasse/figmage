import groupBy from "lodash.groupby";
import template from "lodash.template";
import { TOKEN_TEMPLATE } from "./constants";
import type { SyncResult } from "./types";

export function renderTokensTemplate(
  name: SyncResult["name"],
  tokens: SyncResult["tokens"]
): string {
  const sortedTokens = tokens.sort((a, b) => a.name.localeCompare(b.name));
  const templateTokens: [string, unknown][] = [];

  const { _: groupless, ...groups } = groupBy(sortedTokens, (t) => t.group);

  if (groupless) {
    groupless.forEach((t) => {
      templateTokens.push([t.name, t.value]);
    });
  }

  Object.entries(groups).forEach(([k, v]) => {
    templateTokens.push([
      k,
      v.reduce<Record<string, unknown>>((acc, t) => {
        acc[t.name] = t.value;
        return acc;
      }, {}),
    ]);
  });

  const compiled = template(TOKEN_TEMPLATE, {});

  return compiled({
    name,
    tokens: templateTokens,
    tokenNames: sortedTokens.map((t) => t.name),
  });
}
