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
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
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
      options: {
        list: ['Vinted', 'eBay'],
        layout: 'radio', 
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'features',
      title: 'Product Features',
      description: 'Add short bullet points highlighting key details (e.g., "Exclusive colorway", "100% Merino Wool")',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'materials',
      title: 'Materials',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: ['Cotton', 'Merino Wool', 'Polyamide', 'Polyester'],
      }
    }),
    defineField({
      name: 'condition',
      title: 'Condition',
      type: 'string',
      options: {
        list: [
          'New', 
          'New Without Tags', 
          'Opened Never Used', 
          'Very Good', 
          'Good', 
          'Satisfactory'
        ],
        layout: 'dropdown',
      }
    }),
    defineField({
      name: 'size',
      title: 'Size',
      type: 'string',
      options: {
        list: ['One Size', 'Large', 'Medium', 'Small'],
        layout: 'dropdown',
      }
    }),
    defineField({
      name: 'fit',
      title: 'Fit (Clothing Only)',
      type: 'string',
      options: {
        list: ['Regular', 'Oversized'],
        layout: 'radio',
      }
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text', // Standard text is perfect; we will render with whitespace-pre-wrap
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
        list: ['Accessories', 'Bottoms', 'Jackets', 'Jumpers', 'Polo Shirts', 'Pyjamas', 'Shirts', 'T-Shirts', 'Tech'],
        layout: 'dropdown', 
      },
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true, 
          }
        }
      ],
      validation: (Rule) => Rule.required().min(1)
    })
  ],
})