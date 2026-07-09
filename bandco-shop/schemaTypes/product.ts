import { defineField, defineType } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (e.g., £15.00)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'storeName',
      title: 'Platform',
      type: 'string',
      // Enforces strict isolation: an item must be solely Vinted or solely eBay
      options: {
        list: ['Vinted', 'eBay'],
        layout: 'radio', 
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'condition',
      title: 'Condition',
      type: 'string',
    }),
    defineField({
      name: 'size',
      title: 'Size',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'url',
      title: 'Listing URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: ['T-Shirts', 'Jackets', 'Trousers', 'Shirts', 'Accessories', 'Tech'],
        layout: 'dropdown', 
      },
    }),
    // For now, we will keep image URLs as strings pointing to your Astro assets, 
    // or you can upload images directly to Sanity later.
    // Replace the old 'images' field with this native one
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true, // Allows you to crop images directly inside the Sanity dashboard
          }
        }
      ],
      validation: (Rule) => Rule.required().min(1)
    })
  ],
})