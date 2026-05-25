'use client';

import * as React from 'react';
import { cn, clamp } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Value 0..100 */
  value: number;
  trackClassName?: string;
  fillClassName?: string;
}

export function Progress({
  value,
  className,
  trackClassName,
  fillClassName,
  ...props
}: ProgressProps) {
  const v = clamp(value, 0, 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('w-full', className)}
      {...props}
    >
      <div
        className={cn(
          'h-2 w-full rounded-full bg-primary-soft/70 overflow-hidden',
          trackClassName,
        )}
      >
        <div
          className={cn('h-full gradient-cta rounded-full transition-[width] duration-500', fillClassName)}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
