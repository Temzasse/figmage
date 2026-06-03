// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

const repositoryOwner = process.env.GITHUB_REPOSITORY_OWNER || "Temzasse";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "figmage";

// https://astro.build/config
export default defineConfig({
  site: `https://${repositoryOwner}.github.io`,
  base: `/${repositoryName}`,
  integrations: [
    starlight({
      title: "Figmage Docs",
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/Temzasse/figmage" }],
      sidebar: [
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
