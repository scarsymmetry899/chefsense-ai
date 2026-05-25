'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chipVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
  {
    variants: {
      variant: {
        default:
          'bg-card text-foreground border border-border hover:bg-surface-warm',
        active:
          'gradient-cta text-white border border-transparent shadow-cta',
        ghost: 'bg-transparent text-foreground hover:bg-surface-warm',
      },
      size: {
        sm: 'h-9 text-xs px-3',
        md: 'h-11 text-sm px-3.5',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  active?: boolean;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, size, active, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        chipVariants({ variant: active ? 'active' : variant, size }),
        className,
      )}
      {...props}
    />
  ),
);
Chip.displayName = 'Chip';
