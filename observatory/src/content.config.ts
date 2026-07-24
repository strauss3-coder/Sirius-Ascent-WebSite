import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Each case study is a charted star system: observatory-catalogue metadata up
// top, then a mission log — Brief → Research → Design → Development →
// Performance → Result — driven from structured fields so every page is
// consistently designed, not freeform.
const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: () =>
    z.object({
      // catalogue header
      system: z.number(), // travel order → "System 03"
      name: z.string(),
      client: z.string(),
      classification: z.string(),
      status: z.enum(["risen", "plotted"]), // live vs demo
      missionYear: z.number(),
      designation: z.string(), // α, β, …
      magnitude: z.number(),
      coordinates: z.object({ ra: z.string(), dec: z.string() }),
      url: z.string().url(),
      accent: z.string(), // project atmosphere hex; layered over Sirius base
      summary: z.string(),

      // mission log (each 1–3 sentences)
      brief: z.string(),
      research: z.string(),
      design: z.string(),
      development: z.string(),
      performance: z.string(),
      result: z.string(),

      // optional supporting data
      stack: z.array(z.string()).default([]),
      metrics: z
        .object({
          performance: z.number(),
          accessibility: z.number(),
          bestPractices: z.number(),
          seo: z.number(),
        })
        .optional(),
    }),
});

export const collections = { work };
