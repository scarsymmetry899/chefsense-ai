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
 * Mood card — outlined icon on cream, label below.
 * Matches the reference: light card, primary-coloured outlined icon,
 * no heavy gradient background.
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
        'group flex flex-col items-center justify-start gap-2 rounded-2xl border border-border bg-card px-2 py-3 text-center shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5',
        className,
      )}
    >
      <Icon className="h-7 w-7 text-primary" strokeWidth={1.6} />
      <span className="text-[11px] font-semibold leading-tight text-foreground text-balance">
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
