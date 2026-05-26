'use client';

import Link from 'next/link';
import { Soup, Zap, Dumbbell, Star, Flame, type LucideIcon } from 'lucide-react';
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

export function MoodCard({ label, icon, href, className }: MoodCardProps) {
  const Icon = ICON_MAP[icon] ?? Soup;

  const card = (
    <div
      className={cn(
        'group relative flex h-[80px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-1.5 py-2 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:bg-surface-warm hover:shadow-card',
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-2xl before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent',
        className,
      )}
    >
      <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.7} />
      <span className="text-[10.5px] font-medium leading-[1.15] text-foreground text-balance">
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
