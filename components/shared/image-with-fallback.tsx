'use client';

/**
 * ImageWithFallback
 *
 * Renders an image; if the source fails to load (or is missing on
 * disk, which is the default state for the Phase 1 prototype since
 * we ship no image assets), it gracefully degrades to a warm
 * gradient placeholder with an optional emoji/icon overlay.
 *
 * No external image dependencies. Drop real images into
 * /public/images/... to upgrade incrementally.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';

type GradientVariant = 'food' | 'spice' | 'herb';

interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  gradient?: GradientVariant;
  /** Emoji or short text rendered on top of the fallback gradient. */
  fallbackGlyph?: string;
  /** Adds an aspect ratio container; pass tailwind class e.g. `aspect-square`. */
  ratioClassName?: string;
  rounded?: 'none' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const GRADIENT_CLASS: Record<GradientVariant, string> = {
  food: 'gradient-placeholder',
  spice: 'gradient-spice',
  herb: 'gradient-herb',
};

const ROUNDED_CLASS = {
  none: '',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const;

export function ImageWithFallback({
  src,
  alt,
  gradient = 'food',
  fallbackGlyph = '🍲',
  className,
  ratioClassName,
  rounded = '2xl',
  ...rest
}: ImageWithFallbackProps) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        ratioClassName,
        ROUNDED_CLASS[rounded],
      )}
    >
      {!errored && (
        // Plain <img>: avoids Next/Image domain config for prototype.
        // Real images can be dropped into /public/images/...
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            className,
          )}
          onError={() => setErrored(true)}
          {...rest}
        />
      )}
      {errored && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            GRADIENT_CLASS[gradient],
          )}
          aria-label={alt}
          role="img"
        >
          <span className="text-4xl opacity-80 drop-shadow-sm" aria-hidden>
            {fallbackGlyph}
          </span>
        </div>
      )}
    </div>
  );
}
