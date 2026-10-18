import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOGImage, type OGImageOptions } from '@/lib/og';
import { getOgPages } from '@/lib/og-pages';

// One social-share image per page listed in src/lib/og-pages.ts
export const getStaticPaths: GetStaticPaths = async () => {
  const pages = await getOgPages();
  return pages.map(({ slug, ...options }) => ({ params: { slug }, props: options }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await generateOGImage(props as OGImageOptions);

  // Convert Buffer to Uint8Array for Response compatibility
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
