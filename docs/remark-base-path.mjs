import { visit } from "unist-util-visit";

/**
 * Prepends the site `base` path to root-absolute links in Markdown content
 * (e.g. `/developers/cli/` -> `/figmage/developers/cli/`). Starlight already
 * resolves the base for its own UI links, but raw Markdown links are left as-is,
 * which breaks them when the site is served from a sub-path like on GitHub Pages.
 */
export default function remarkBasePath({ base = "" } = {}) {
  const normalizedBase = base.replace(/\/$/, "");

  return (tree) => {
    if (!normalizedBase) return;

    visit(tree, "link", (node) => {
      const url = node.url;
      if (
        typeof url === "string" &&
        url.startsWith("/") &&
        !url.startsWith("//") &&
        url !== normalizedBase &&
        !url.startsWith(`${normalizedBase}/`)
      ) {
        node.url = `${normalizedBase}${url}`;
      }
    });
  };
}
