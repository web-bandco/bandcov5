/**
 * Project-specific content, merged into src/content.config.ts.
 *
 * Add collections here rather than in content.config.ts, which upgrades replace.
 * Upgrades never overwrite this file.
 *
 *   siteCollections  your own collections, by name
 *   blogFields       extra frontmatter fields for Velocity's blog, e.g.
 *
 *     import { z } from 'astro/zod';
 *     import type { SchemaContext } from 'astro:content';
 *     export const blogFields = ({ image }: SchemaContext) => ({
 *       category: z.enum(['guide', 'news']).default('news'),
 *       cover: image().optional(),
 *     });
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Holiday photo galleries: src/content/holidays/<slug>.md → /photography/holidays/<slug> */
const holidays = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/holidays' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      location: z.string(),
      date: z.coerce.date(),
      coverImage: image(),
      images: z.array(z.object({ src: image(), alt: z.string() })),
    }),
});

export const siteCollections = { holidays };
