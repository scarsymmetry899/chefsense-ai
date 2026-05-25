import { cn } from '@/lib/utils';

interface LeafDividerProps {
  className?: string;
}

/**
 * Decorative leaf-flourish-leaf divider seen in the welcome /
 * sources screens. Pure SVG, no asset dependency.
 */
export function LeafDivider({ className }: LeafDividerProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 text-copper/70',
        className,
      )}
      aria-hidden
    >
      <span className="h-px w-12 bg-current opacity-40" />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1c2.5 2 5 4 5 6.5S9 13 7 13s-5-1.5-5-5.5S4.5 3 7 1z"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.55"
        />
      </svg>
      <span className="h-px w-12 bg-current opacity-40" />
    </div>
  );
}

/** Tiny leaf glyph for inline accents next to headings. */
export function LeafGlyph({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={cn('inline-block text-accent-green', className)}
      aria-hidden
    >
      <path
        d="M2 13c0-5 4-9 9-11-1 7-4 11-9 11z"
        fill="currentColor"
        opacity="0.85"
      />
      <path d="M2 13l5-5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}
