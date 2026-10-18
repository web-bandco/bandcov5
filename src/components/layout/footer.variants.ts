import { cva, type VariantProps } from 'class-variance-authority';

export const footerVariants = cva('py-[var(--space-stack-lg)]', {
  variants: {
    background: {
      default: 'bg-background border-t border-border',
      // 👇 Swapped bg-surface-secondary for bg-background-secondary
      secondary: 'bg-background-secondary border-t border-border', 
      invert: 'invert-section bg-background border-t border-border',
    },
  },
  defaultVariants: {
    background: 'default',
  },
});

export const footerColumnGridVariants = cva('grid gap-[var(--space-stack-lg)]', {
  variants: {
    columns: {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      // Two columns on mobile; the logo and last column span the full width
      4: 'grid-cols-2 md:grid-cols-4',
    },
  },
  defaultVariants: {
    columns: 3,
  },
});

export type FooterVariants = VariantProps<typeof footerVariants>;
export type FooterColumnGridVariants = VariantProps<typeof footerColumnGridVariants>;