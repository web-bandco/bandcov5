import { cva, type VariantProps } from 'class-variance-authority';

export const heroSectionVariants = cva(
  // CHANGED: mt-6 is now mt-12 to push the card down and clear the new bar header
  'relative overflow-hidden bg-card rounded-3xl px-8 sm:px-12 lg:px-20 mx-4 mt-12 mb-16 md:mx-auto md:max-w-3xl shadow-xl border border-border/50',  {
    variants: {
      size: {
        sm: 'pt-[calc(var(--space-page-top-sm)_-_1rem)] pb-[var(--space-section-sm)]',
        md: 'pt-[calc(var(--space-page-top)_-_1rem)] pb-[var(--space-section-md)]',
        lg: 'pt-[calc(var(--space-page-top)_+_1rem)] pb-[var(--space-section-lg)]',
        xl: 'pt-[calc(var(--space-page-top)_+_3rem)] pb-[var(--space-section-xl)]',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  }
);

export const heroBlobVariants = cva(
  'bg-brand-200/20 pointer-events-none absolute h-64 w-64 rounded-full blur-3xl',
  {
    variants: {
      position: {
        left: '-left-20 -top-20',
        right: '-right-20 -top-20',
        center: 'left-1/2 -translate-x-1/2 -top-20',
      },
    },
    defaultVariants: {
      position: 'right',
    },
  }
);

export type HeroSectionVariants = VariantProps<typeof heroSectionVariants>;
export type HeroBlobVariants = VariantProps<typeof heroBlobVariants>;
