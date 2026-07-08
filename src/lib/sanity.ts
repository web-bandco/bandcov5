import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: '63lsf8co', // Find this in your sanity.cli.ts or sanity.config.ts
  dataset: 'shop-dataset1',
  useCdn: false, // Critical: Set to false so you instantly get live price changes
  apiVersion: '2024-01-01',
})