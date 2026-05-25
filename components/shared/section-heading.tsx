import Link from 'next/link';
import { LeafGlyph } from './leaf-divider';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  viewAllLabel?: string;
  viewAllHref?: string;
  leaf?: boolean;
  className?: string;
}

export function SectionHeading({
  title,
  viewAllLabel,
  viewAllHref,
  leaf = false,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex items-end justify-between gap-3', className)}>
      <h2 className="font-serif text-2xl text-foreground inline-flex items-center gap-2">
        {leaf && <LeafGlyph />}
        {title}
      </h2>
      {viewAllLabel && viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-accent-green hover:text-accent-green/80"
        >
          {viewAllLabel} ›
        </Link>
      )}
    </div>
  );
}
