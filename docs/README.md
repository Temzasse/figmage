# Figmage Docs

This is the Astro Starlight documentation site for Figmage.

## Local development

```bash
npm install
npm run dev
```

The site runs at `http://localhost:4321/figmage/` because the production site is deployed under the
`/figmage` base path.

## Build

```bash
npm run build
npm run preview
```

## Content structure

- `src/content/docs/introduction/` explains what Figmage is and routes readers to the right track.
- `src/content/docs/designers/` is for non-technical designers preparing the Figma source library.
- `src/content/docs/developers/` is for developers configuring and running the CLI.
- `src/components/Flow.astro` is the custom Figmage flow diagram component used on overview pages.

Keep designer pages free of implementation-heavy CLI details. Keep developer pages precise enough to
copy into a working project.
