/**
 * SHOP: B&Co products from Sanity, read at build time with plain fetch (no
 * Sanity packages). The dataset is public, so no token is needed.
 * When a product changes in Sanity, a Cloudflare deploy hook rebuilds the site.
 */
const PROJECT = '63lsf8co';
const DATASET = 'shop-dataset1';
const API = `https://${PROJECT}.api.sanity.io/v2024-01-01/data/query/${DATASET}`;

interface SanityImage {
  asset?: { _ref?: string };
}

export interface Product {
  id: string;
  slug: string;
  createdAt: string;
  title: string;
  price: string;
  storeName: 'Vinted' | 'eBay';
  url: string;
  description?: string;
  condition?: string;
  size?: string;
  fit?: string;
  category?: string;
  features?: string[];
  materials?: string[];
  images: SanityImage[];
}

const QUERY = `*[_type == "product" && defined(slug.current)] | order(_createdAt desc) {
  "id": _id,
  "slug": slug.current,
  "createdAt": _createdAt,
  title, price, storeName, url, description, condition, size, fit, category, features, materials,
  images
}`;

let cache: Promise<Product[]> | undefined;

/** All products, newest first (fetched once per build) */
export function getProducts(): Promise<Product[]> {
  cache ??= fetch(`${API}?query=${encodeURIComponent(QUERY)}`)
    .then((response) => {
      if (!response.ok) throw new Error(`Sanity request failed: ${response.status}`);
      return response.json() as Promise<{ result: Product[] }>;
    })
    .then(({ result }) => result.map((product) => ({ ...product, images: product.images ?? [] })));
  return cache;
}

/**
 * Sanity CDN URL for an image at a width. `auto=format` serves AVIF or WebP.
 * An asset ref looks like "image-<id>-<width>x<height>-<ext>".
 */
export function imageUrl(image: SanityImage, width: number, quality = 75): string {
  const [, id, dimensions, ext] = image.asset?._ref?.split('-') ?? [];
  if (!id) return '';
  return `https://cdn.sanity.io/images/${PROJECT}/${DATASET}/${id}-${dimensions}.${ext}?w=${width}&q=${quality}&auto=format`;
}

/** The original width and height, from the asset ref */
export function imageSize(image: SanityImage): { width: number; height: number } {
  const [width, height] = (image.asset?._ref?.split('-')[2] ?? '0x0').split('x').map(Number);
  return { width, height };
}

export const srcset = (image: SanityImage, widths: number[], quality = 75) =>
  widths.map((width) => `${imageUrl(image, width, quality)} ${width}w`).join(', ');

/** "£12.00" → 12 (for sorting) */
export const priceValue = (price: string) => parseFloat(price.replace(/[^0-9.-]+/g, '')) || 0;
