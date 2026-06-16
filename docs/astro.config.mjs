// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { unified } from "@astrojs/markdown-remark";
import remarkBasePath from "./remark-base-path.mjs";

const base = `/figmage`;

// https://astro.build/config
export default defineConfig({
  site: `https://temzasse.github.io`,
  base,
  markdown: {
    processor: unified({
      remarkPlugins: [[remarkBasePath, { base }]],
    }),
  },
  integrations: [
    starlight({
      title: "Figmage",
      logo: {
        src: "./src/assets/figmage.png",
      },
      customCss: [
        "@fontsource/geist/400.css",
        "@fontsource/geist/600.css",
        "./src/styles/custom.css",
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Temzasse/figmage",
        },
      ],
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
