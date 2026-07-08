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