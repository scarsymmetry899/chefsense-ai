import { cn } from '@/lib/utils';

interface BrandLogoProps {
  withWordmark?: boolean;
  /** 'sm' (header), 'md' (default), 'lg' (welcome hero), 'xl' (welcome centerpiece). */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** When true, stacks icon-above-wordmark and centers everything. */
  stacked?: boolean;
  className?: string;
}

const ICON_PX: Record<NonNullable<BrandLogoProps['size']>, number> = {
  sm: 30,
  md: 42,
  lg: 72,
  xl: 96,
};

const WORDMARK_CLASS: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-[40px] leading-none',
};

/**
 * ChefSense brand mark — chef's toque (puffy hat) with a band,
 * sitting above a spoon-with-brain-coil emblem and a small leaf.
 *
 * Designed to read clearly at any size: the chef hat silhouette
 * dominates, with the brain-spoon as a smaller supporting motif.
 */
export function BrandLogo({
  withWordmark = true,
  size = 'md',
  stacked = false,
  className,
}: BrandLogoProps) {
  const px = ICON_PX[size];

  const icon = (
    <svg
      width={px}
      height={px}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden
      style={{ filter: 'drop-shadow(0 3px 8px rgba(230, 90, 46, 0.22))' }}
    >
      <defs>
        <linearGradient id="cs-hat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(16 78% 64%)" />
          <stop offset="100%" stopColor="hsl(16 78% 48%)" />
        </linearGradient>
        <linearGradient id="cs-spoon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(37 91% 56%)" />
          <stop offset="100%" stopColor="hsl(29 60% 46%)" />
        </linearGradient>
      </defs>

      {/* Chef hat — three rounded puffs forming the iconic toque silhouette */}
      <g>
        {/* Left puff */}
        <circle cx="22" cy="22" r="11" fill="url(#cs-hat)" />
        {/* Right puff */}
        <circle cx="58" cy="22" r="11" fill="url(#cs-hat)" />
        {/* Center puff (largest, frontmost) */}
        <circle cx="40" cy="18" r="13" fill="url(#cs-hat)" />
        {/* Lower body of hat connecting puffs to band */}
        <path
          d="M14 28 Q14 38 22 40 L58 40 Q66 38 66 28 Q60 32 50 32 L30 32 Q20 32 14 28 Z"
          fill="url(#cs-hat)"
        />
      </g>

      {/* Hat band */}
      <rect
        x="20"
        y="40"
        width="40"
        height="7"
        rx="2"
        fill="hsl(19 43% 16%)"
        opacity="0.88"
      />
      {/* Band highlight */}
      <rect
        x="20"
        y="40"
        width="40"
        height="2"
        rx="1"
        fill="#FFFFFF"
        opacity="0.25"
      />

      {/* Spoon bowl (below the hat) with brain-coil emblem inside */}
      <ellipse cx="40" cy="58" rx="11" ry="9" fill="url(#cs-spoon)" />
      {/* Brain coil — signature mark inside spoon */}
      <path
        d="M33 58 Q33 53 40 53 Q47 53 47 58"
        stroke="hsl(19 43% 16%)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.85"
        fill="none"
      />
      <path
        d="M35 60 Q35 62.5 40 62.5 Q45 62.5 45 60"
        stroke="hsl(19 43% 16%)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
        fill="none"
      />

      {/* Spoon stem */}
      <rect
        x="37.5"
        y="65"
        width="5"
        height="9"
        rx="2.5"
        fill="hsl(29 60% 46%)"
      />

      {/* Leaf accent — top right corner */}
      <g transform="translate(63 12)">
        <path
          d="M0 0 Q5 -3 8 1 Q5 3 0 0 Z"
          fill="hsl(78 41% 40%)"
          opacity="0.92"
        />
        <path
          d="M0 0 L7 0"
          stroke="hsl(78 41% 30%)"
          strokeWidth="0.6"
          opacity="0.6"
        />
      </g>
    </svg>
  );

  const wordmark = withWordmark && (
    <div
      className={cn(
        'leading-none font-serif tracking-tight',
        WORDMARK_CLASS[size],
      )}
    >
      <span className="font-semibold text-foreground">ChefSense</span>
      <span className="font-semibold text-primary"> AI</span>
    </div>
  );

  if (stacked && withWordmark) {
    return (
      <div className={cn('flex flex-col items-center gap-3', className)}>
        {icon}
        {wordmark}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {icon}
      {wordmark}
    </div>
  );
}
