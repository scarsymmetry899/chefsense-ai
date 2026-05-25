import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Accent = 'primary' | 'green' | 'copper' | 'gold';

const ACCENT_STYLES: Record<Accent, string> = {
  primary:
    'bg-primary-soft text-primary-dark border-primary/20',
  green:
    'bg-accent-green-soft text-accent-green border-accent-green/30',
  copper:
    'bg-secondary-soft text-copper border-secondary/30',
  gold:
    'bg-secondary-soft text-primary-dark border-secondary/40',
};

interface FeaturePillProps {
  icon?: LucideIcon;
  label: string;
  accent?: Accent;
  className?: string;
}

export function FeaturePill({
  icon: Icon,
  label,
  accent = 'primary',
  className,
}: FeaturePillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold',
        ACCENT_STYLES[accent],
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
