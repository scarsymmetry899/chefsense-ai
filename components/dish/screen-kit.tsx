import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Archive,
  Beaker,
  Bell,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChefHat,
  Clock3,
  Droplets,
  Eye,
  Flame,
  Leaf,
  LifeBuoy,
  MapPin,
  Mic,
  MoveRight,
  Search,
  Sparkles,
  Star,
  Thermometer,
  TimerReset,
  User,
  Users,
  Utensils,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageWithFallback } from '@/components/shared/image-with-fallback';

const ICON_MAP: Record<string, LucideIcon> = {
  archive: Archive,
  beaker: Beaker,
  bell: Bell,
  book: BookOpen,
  bot: Bot,
  chef: ChefHat,
  chilli: Flame,
  clock: Clock3,
  cuboid: Utensils,
  droplet: Droplets,
  eye: Eye,
  flame: Flame,
  leaf: Leaf,
  life: LifeBuoy,
  map: MapPin,
  mic: Mic,
  search: Search,
  shaker: Sparkles,
  soup: Utensils,
  star: Star,
  thermometer: Thermometer,
  timer: TimerReset,
  user: User,
  users: Users,
  waves: Waves,
};

const SOURCE_LABELS: Record<string, string> = {
  'top-chef-style': 'Top chef-style sources',
  regional: 'Regional cooking reference',
  'technique-video': 'Technique video reference',
  'recipe-database': 'Recipe database',
  'food-science': 'Food science reference',
};

const SOURCE_DESCRIPTIONS: Record<string, string> = {
  'top-chef-style': 'Professional kitchen methods and heuristics',
  regional: 'Traditional regional preparations',
  'technique-video': 'Visual techniques and process accuracy',
  'recipe-database': 'Tested recipes and user-validated data',
  'food-science': 'Ingredients, reactions and science-backed guidance',
};

export const cueMeta: Record<string, { label: string; icon: LucideIcon }> = {
  visual: { label: 'Visual Cue', icon: Eye },
  smell: { label: 'Smell Cue', icon: Waves },
  sound: { label: 'Sound Cue', icon: Bell },
  texture: { label: 'Texture Cue', icon: Sparkles },
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Sparkles;
}

export function getSourceMeta(category: string) {
  return {
    label: SOURCE_LABELS[category] ?? 'Trusted source',
    description: SOURCE_DESCRIPTIONS[category] ?? 'Reliable cooking guidance',
  };
}

export function ScreenCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn('card-warm paper-panel p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg', className)}>{children}</section>;
}

export function SectionEyebrow({
  icon: Icon = Leaf,
  label,
  className,
}: {
  icon?: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-3 inline-flex items-center gap-2 text-[13px] font-medium text-accent-green', className)}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}

export function MetricTile({
  icon: Icon,
  title,
  value,
  detail,
  className,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  detail?: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded-[24px] border border-border/80 bg-card px-4 py-4 text-center shadow-sm shadow-[0_12px_28px_-24px_rgba(114,66,35,0.42)]', className)}>
      <Icon className="mx-auto h-5 w-5 text-primary" />
      <div className="mt-3 text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{title}</div>
      <div className="mt-2 font-sans text-[30px] font-semibold leading-none tracking-[-0.04em] text-foreground tabular-nums">{value}</div>
      {detail ? <div className="mt-2 text-[12px] leading-5 text-muted-foreground">{detail}</div> : null}
    </div>
  );
}

export function SoftButton({
  href,
  label,
  icon: Icon,
  className,
}: {
  href: string;
  label: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border border-border/80 bg-card px-5 py-3 text-sm font-medium text-foreground shadow-sm transition-transform active:scale-[0.98]',
        className,
      )}
    >
      {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
      <span>{label}</span>
    </Link>
  );
}

export function GradientButton({
  href,
  label,
  subline,
  icon: Icon = ChefHat,
  className,
}: {
  href: string;
  label: string;
  subline?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex w-full items-center justify-between rounded-[26px] gradient-cta px-6 py-4 text-white shadow-cta transition-transform active:scale-[0.985]',
        className,
      )}
    >
      <span className="flex items-center gap-3">
        <Icon className="h-6 w-6" />
        <span className="flex flex-col leading-tight">
          <span className="font-serif text-[20px]">{label}</span>
          {subline ? <span className="text-sm text-white/90">{subline}</span> : null}
        </span>
      </span>
      <MoveRight className="h-5 w-5" />
    </Link>
  );
}

export function DishVisual({
  src,
  alt,
  fallbackGlyph = '🍳',
  className,
}: {
  src: string;
  alt: string;
  fallbackGlyph?: string;
  className?: string;
}) {
  return (
    <div className={cn('overflow-hidden rounded-[26px] border border-border/70 bg-card', className)}>
      <ImageWithFallback
        src={src}
        alt={alt}
        gradient="spice"
        fallbackGlyph={fallbackGlyph}
        rounded="none"
        ratioClassName="h-full"
      />
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-3 overflow-hidden rounded-full bg-primary-soft/60', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-secondary to-primary"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function StepDots({
  count,
  active,
}: {
  count: number;
  active: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className={cn(
            'h-2.5 rounded-full transition-all',
            index + 1 === active ? 'w-6 bg-primary' : 'w-2.5 bg-border',
          )}
        />
      ))}
    </div>
  );
}

export function CheckRow({
  label,
  detail,
  icon: Icon = CheckCircle2,
  className,
}: {
  label: string;
  detail?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start gap-3 rounded-[22px] border border-border/60 bg-card px-4 py-3', className)}>
      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-green-soft text-accent-green">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[16px] font-medium text-foreground">{label}</div>
        {detail ? <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</div> : null}
      </div>
    </div>
  );
}

export function StatusPill({
  label,
  tone = 'warm',
}: {
  label: string;
  tone?: 'warm' | 'green' | 'danger';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        tone === 'green' && 'bg-accent-green-soft text-accent-green',
        tone === 'danger' && 'bg-primary-soft text-primary-dark',
        tone === 'warm' && 'bg-secondary-soft text-copper',
      )}
    >
      {label}
    </span>
  );
}

export function HeatDots({ level }: { level: string }) {
  const labels = ['Low', 'Medium-low', 'Medium', 'Medium-high'];
  const active = Math.max(1, labels.findIndex((item) => item === level) + 1);

  return (
    <div className="flex items-center justify-center gap-2">
      {labels.map((item, index) => (
        <span
          key={item}
          className={cn(
            'h-2.5 w-2.5 rounded-full',
            index < active ? 'bg-primary' : 'bg-border/80',
          )}
        />
      ))}
    </div>
  );
}

export function HeatMeter({
  level,
  tempLabel,
}: {
  level: string;
  tempLabel: string;
}) {
  const labels = ['Low', 'Medium-low', 'Medium', 'Medium-high', 'High'];
  const active = Math.max(0, labels.findIndex((item) => item === level) + 1);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-1.5">
        {labels.map((item, index) => (
          <Flame
            key={item}
            className={cn(
              'h-4 w-4 transition-transform',
              index < active ? 'fill-current text-primary drop-shadow-[0_3px_6px_rgba(212,96,48,0.25)]' : 'text-border/90',
            )}
          />
        ))}
      </div>
      <div className="text-xs text-muted-foreground">{tempLabel}</div>
    </div>
  );
}

export function AlertCard({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-[22px] border border-primary/20 bg-primary-soft/50 px-4 py-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-primary" />
        <div>
          <div className="font-medium text-primary-dark">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</div>
        </div>
      </div>
    </div>
  );
}

export function TinyCheck() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-green text-white">
      <Check className="h-4 w-4" />
    </span>
  );
}
