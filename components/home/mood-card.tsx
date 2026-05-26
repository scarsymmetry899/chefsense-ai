'use client';

import Link from 'next/link';
import {
  Soup,
  Zap,
  Dumbbell,
  Star,
  Flame,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  soup: Soup,
  zap: Zap,
  dumbbell: Dumbbell,
  star: Star,
  flame: Flame,
};

interface MoodCardProps {
  label: string;
  icon: string;
  href?: string;
  className?: string;
}

/**
 * Mood card — outlined icon on translucent cream, label below.
 *
 * Subtle glass-morphism treatment: bg-card at 75% opacity with
 * backdrop blur and a soft inner highlight border. This gives the
 * "frosted card" feel the user asked for without forcing a dark
 * background to make the effect visible.
 *
 * Fixed minimum height ensures consistent card sizes across
 * variable label lengths (especially important for HI/TE which
 * have different word-break behaviour than EN).
 */
export function MoodCard({
  label,
  icon,
  href,
  className,
}: MoodCardProps) {
  const Icon = ICON_MAP[icon] ?? Soup;

  const card = (
    <div
      className={cn(
        'group relative flex h-[78px] flex-col items-center justify-center gap-1.5',
        'rounded-2xl border border-white/50 bg-card/75 backdrop-blur-sm',
        'px-1.5 py-2 text-center shadow-soft',
        'transition-all hover:shadow-card hover:-translate-y-0.5',
        // Inner top highlight to suggest depth
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-2xl before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent',
        className,
      )}
    >
      <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.7} />
      <span className="text-[10.5px] font-semibold leading-[1.15] text-foreground text-balance">
        {label}
      </span>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}
