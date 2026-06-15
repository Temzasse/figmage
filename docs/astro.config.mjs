// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import mermaid from "astro-mermaid";
import remarkBasePath from "./remark-base-path.mjs";

const base = `/figmage`;

// https://astro.build/config
export default defineConfig({
  site: `https://temzasse.github.io`,
  base,
  markdown: {
    remarkPlugins: [[remarkBasePath, { base }]],
  },
  integrations: [
    // `mermaid` must come before `starlight` so it can transform code blocks first.
    mermaid({
      theme: "default",
      autoTheme: true,
      mermaidConfig: {
        flowchart: { curve: "basis" },
      },
    }),
    starlight({
      title: "Figmage",
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/Temzasse/figmage" }],
      sidebar: [
        {
          label: "Introduction",
          items: [{ autogenerate: { directory: "introduction" } }],
        },
        {
          label: "Developers",
          items: [{ autogenerate: { directory: "developers" } }],
        },
        {
          label: "Designers",
          items: [{ autogenerate: { directory: "designers" } }],
        },
      ],
    }),
  ],
});
