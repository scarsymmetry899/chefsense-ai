import Image from 'next/image';
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
  sm: 32,
  md: 44,
  lg: 80,
  xl: 112,
};

const WORDMARK_CLASS: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'text-[15px]',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-[42px] leading-none',
};

/**
 * ChefSense brand mark — uses the official PNG logo asset.
 *
 * `stacked` mode shows the icon centred with the wordmark beneath it
 * (used on Welcome). Default inline mode shows icon to the left of the
 * wordmark (used in Home header).
 */
export function BrandLogo({
  withWordmark = true,
  size = 'md',
  stacked = false,
  className,
}: BrandLogoProps) {
  const px = ICON_PX[size];

  const icon = (
    <Image
      src="/logo.png"
      alt="ChefSense AI"
      width={px}
      height={px}
      priority={size === 'xl' || size === 'lg'}
      className="select-none"
      style={{
        filter: 'drop-shadow(0 3px 10px rgba(230, 90, 46, 0.18))',
        // The logo PNG has slight off-white halos around the chef-hat
        // outline from JPEG-decompression artefacts; this isolates the
        // shape so it blends cleanly into the cream canvas.
      }}
    />
  );

  const wordmark = withWordmark && (
    <div
      className={cn(
        'leading-none font-serif tracking-tight',
        WORDMARK_CLASS[size],
      )}
    >
      <span className="text-foreground">ChefSense</span>
      <span className="italic text-primary"> AI</span>
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
    <div className={cn('flex items-center gap-2.5', className)}>
      {icon}
      {wordmark}
    </div>
  );
}
