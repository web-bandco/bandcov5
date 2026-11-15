/**
 * Photo helpers for PhotoCarousel, PhotoGallery and the holiday pages.
 */
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { getCollection } from 'astro:content';

export interface GalleryImage {
  /** In-page image (AVIF, responsive) */
  src: string;
  srcset: string;
  /** Lightbox image (AVIF, at most 1600px wide) */
  full: { src: string; width: number; height: number; alt: string };
  alt: string;
}

export function toGalleryImages(photos: { img: ImageMetadata; alt: string }[]): Promise<GalleryImage[]> {
  return Promise.all(
    photos.map(async ({ img, alt }) => {
      const thumb = await getImage({ src: img, format: 'avif', width: 800, widths: [400, 640, 800, 1200], quality: 60 });
      // Never larger than the original (Astro does not enlarge)
      const full = await getImage({ src: img, format: 'avif', width: Math.min(1600, img.width), quality: 80 });
      return {
        src: thumb.src,
        srcset: thumb.srcSet.attribute,
        full: { src: full.src, width: Number(full.attributes.width), height: Number(full.attributes.height), alt },
        alt,
      };
    }),
  );
}

/** All holidays, newest first */
export async function getHolidays() {
  const holidays = await getCollection('holidays');
  return holidays.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const holidayUrl = (id: string) => `/photography/holidays/${id}`;

/** "August 2025" */
export const holidayDate = (date: Date) => date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
