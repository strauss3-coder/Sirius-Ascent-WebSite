// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// The Observatory — Sirius Ascent. Static output for GitHub Pages behind the
// custom domain (siriusascent.co.za), so base stays at root.
export default defineConfig({
  site: "https://siriusascent.co.za",
  output: "static",
  compressHTML: true,
  integrations: [sitemap()],
  build: { inlineStylesheets: "auto" },
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
});
