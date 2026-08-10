import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const architecture = defineCollection({
  schema: z.object({
    title: z.string(),
    author: z.string(),
    img: z.string(),
    readtime: z.number(),
    description: z.string().default(""),
    tags: z
      .string()
      .transform((val) =>
        val
          .split(/\s+/)
          .map((tag) => tag.replace(/^#/, "").trim())
          .filter(Boolean)
      ),
    created: z.string().optional(),
    updated: z.string().optional(),
  }),
});

export const collections = { architecture };