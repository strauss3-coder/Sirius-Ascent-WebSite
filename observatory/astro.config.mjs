// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// The Observatory — Sirius Ascent. Static output for GitHub Pages.
// SITE_URL / SITE_BASE let the same build target either the custom domain
// (siriusascent.co.za at root) or a project-page preview
// (strauss3-coder.github.io/sirius-observatory/). Defaults = production.
const site = process.env.SITE_URL || "https://siriusascent.co.za";
const base = process.env.SITE_BASE || "/";

export default defineConfig({
  site,
  base,
  output: "static",
  compressHTML: true,
  integrations: [sitemap()],
  build: { inlineStylesheets: "auto" },
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
});
