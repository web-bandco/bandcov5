import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url' // Updated import

export const sanityClient = createClient({
  projectId: '63lsf8co', 
  dataset: 'shop-dataset1',
  useCdn: false,
  apiVersion: '2024-01-01',
})

// Updated initialization
const builder = createImageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}

// Responsive product images. `auto=format` lets the Sanity CDN serve AVIF/WebP
// to browsers that support them, falling back to JPEG.
export interface ProductImage { src: string; srcset: string; thumb: string; full: string }
export interface CardImage { src: string; srcset: string }

const sized = (source: any, width: number, quality = 75) =>
  urlFor(source).width(width).auto('format').quality(quality).url()

const srcsetFor = (source: any, widths: number[]) =>
  widths.map((w) => `${sized(source, w)} ${w}w`).join(', ')

/** Product page gallery: main images, small thumbnails and a large lightbox version */
export function productImage(source: any): ProductImage {
  return {
    src: sized(source, 800),
    srcset: srcsetFor(source, [400, 640, 800, 1000, 1200, 1600]),
    thumb: sized(source, 240),
    full: sized(source, 1600, 80),
  }
}

/** Shop grid product cards */
export function cardImage(source: any): CardImage {
  return {
    src: sized(source, 480),
    srcset: srcsetFor(source, [320, 480, 640]),
  }
}