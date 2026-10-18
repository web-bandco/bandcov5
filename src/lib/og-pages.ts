/**
 * Social-share (Open Graph) images
 *
 * Every page listed here gets a generated image at /og/<slug>.png (see
 * src/pages/og/[...slug].png.ts). Pages not listed fall back to the
 * homepage image (see SEO.astro). Product pages use their own photo instead.
 */
import { getCollection } from 'astro:content';
import siteConfig from '@/config/site.config';
import { policies } from '@/config/policies.config';
import type { OGImageOptions } from '@/lib/og';

export interface OgPage extends OGImageOptions {
  /** Page path without the leading slash ('index' for the homepage) */
  slug: string;
}

export async function getOgPages(): Promise<OgPage[]> {
  const holidays = await getCollection('holidays');
  const posts = await getCollection('blog', ({ data }) => (import.meta.env.PROD ? data.draft !== true : true));

  return [
    { slug: 'index', title: siteConfig.name, description: siteConfig.description, label: 'Welcome' },
    { slug: 'about', title: 'About', description: `Learn more about ${siteConfig.name}`, label: 'About' },
    { slug: 'shop', title: 'Shop', description: 'Pre-loved clothing, tech and more, from the B&Co Vinted and eBay inventories.', label: 'SHOP: B&Co' },
    { slug: 'contact', title: 'Contact', description: `Get in touch with ${siteConfig.name}`, label: 'Contact' },
    { slug: 'blog', title: 'Blog', description: `Latest articles and updates from ${siteConfig.name}`, label: 'Blog' },
    { slug: 'photography', title: 'Photography', description: 'A selection of high-resolution original photography from Harry B.', label: 'Photography' },
    { slug: 'photography/holidays', title: 'Holiday Galleries', description: 'A complete directory of all holiday and travel photography galleries.', label: 'Photography' },
    ...holidays.map((holiday) => ({
      slug: `photography/holidays/${holiday.id}`,
      title: holiday.data.title,
      description: `${holiday.data.location} • ${holiday.data.date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`,
      label: 'Holiday Gallery',
    })),
    ...policies.map((policy) => ({
      slug: policy.href.slice(1),
      title: policy.title,
      description: policy.description,
      label: 'Policy Hub',
    })),
    ...posts.map((post) => ({
      slug: `blog/${post.id.replace('en/', '')}`, // same URL rule as src/pages/blog/[...slug].astro
      title: post.data.title,
      description: post.data.description,
      type: 'article' as const,
      label: 'Article',
    })),
  ];
}
