import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatTileProps {
  icon?: LucideIcon;
  label: string;
  value: string;
  accent?: 'default' | 'primary' | 'copper' | 'green';
  className?: string;
}

const ACCENT: Record<NonNullable<StatTileProps['accent']>, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  copper: 'text-copper',
  green: 'text-accent-green',
};

export function StatTile({
  icon: Icon,
  label,
  value,
  accent = 'default',
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-2xl bg-card border border-border px-3 py-3 shadow-soft',
        className,
      )}
    >
      {Icon && <Icon className={cn('h-5 w-5', ACCENT[accent])} aria-hidden />}
      <span className={cn('text-base font-semibold leading-tight', ACCENT[accent])}>
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
