import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-surface-warm text-foreground border border-border',
        veg: 'bg-accent-green-soft text-accent-green border border-accent-green/30',
        nonveg: 'bg-primary-soft text-primary-dark border border-primary/30',
        featured: 'bg-secondary-soft text-primary-dark border border-secondary/40',
        chilli: 'bg-primary-soft text-primary-dark border border-primary/30',
        copper: 'bg-secondary-soft text-copper border border-copper/30',
        success: 'bg-accent-green-soft text-accent-green border border-accent-green/30',
        warning: 'bg-secondary-soft text-copper border border-secondary/40',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
