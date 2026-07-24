import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Case studies = charted star systems. Each carries star-map metadata (a
// designation + coordinates + magnitude) alongside the real project record,
// and a mission-log body: Challenge → Research → Design → Development →
// Performance → Result.
const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      client: z.string(),
      industry: z.string(),
      status: z.enum(["risen", "plotted"]), // live vs demo
      url: z.string().url().optional(),
      designation: z.string(), // α, β, …
      magnitude: z.number(),
      coordinates: z
        .object({ ra: z.string(), dec: z.string() })
        .optional(),
      summary: z.string(),
      order: z.number().default(99),
      publishDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});

export const collections = { work };
