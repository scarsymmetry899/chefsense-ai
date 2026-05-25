'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 ' +
    'active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        primary:
          'gradient-cta text-white shadow-cta hover:brightness-[1.04] [&_svg]:text-white',
        secondary:
          'bg-surface text-foreground border border-border hover:bg-surface-warm shadow-soft',
        ghost: 'bg-transparent text-foreground hover:bg-surface-warm',
        outline:
          'bg-card text-foreground border border-border hover:bg-surface-warm',
        soft:
          'bg-primary-soft text-primary-dark hover:bg-primary-soft/80',
      },
      size: {
        sm: 'h-9 rounded-full px-4 text-sm',
        md: 'h-11 rounded-full px-5 text-sm',
        lg: 'h-14 rounded-full px-6 text-base',
        xl: 'h-16 rounded-2xl px-7 text-lg',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
