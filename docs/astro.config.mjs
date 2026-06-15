// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
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
