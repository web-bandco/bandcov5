/**
 * Image helpers for the React photo components (ImageCarousel, MasonryGallery).
 * Generates a responsive AVIF srcset for the in-page image, a large version
 * for the lightbox, and the image's dimensions so space is reserved before it loads.
 */
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

export interface GalleryImage {
  src: string;
  srcset: string;
  fullSrc: string;
  width: number;
  height: number;
  alt: string;
}

export async function toGalleryImages(photos: { img: ImageMetadata; alt: string }[]): Promise<GalleryImage[]> {
  return Promise.all(
    photos.map(async ({ img, alt }) => {
      const thumb = await getImage({ src: img, format: 'avif', width: 800, widths: [400, 640, 800, 1200], quality: 60 });
      // Never larger than the original (Astro does not enlarge), so `width` is the file's true width
      const full = await getImage({ src: img, format: 'avif', width: Math.min(1600, img.width), quality: 80 });

      return {
        src: thumb.src,
        srcset: thumb.srcSet.attribute,
        fullSrc: full.src,
        width: Number(full.attributes.width),
        height: Number(full.attributes.height),
        alt,
      };
    })
  );
}
