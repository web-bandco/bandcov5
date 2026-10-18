import { cva, type VariantProps } from 'class-variance-authority';

export const cardVariants = cva(
  ['rounded-xl'],
  {
    variants: {
      variant: {
        default: 'bg-card border border-card-border',
        solid: 'bg-secondary border border-transparent',
        outline: 'bg-transparent border-2 border-border',
        ghost: 'bg-transparent border border-transparent',
        elevated: 'bg-card border border-border shadow-lg',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        // Lifts on hover (see .hover-lift in global.css)
        true: 'hover-lift cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export type CardVariants = VariantProps<typeof cardVariants>;
