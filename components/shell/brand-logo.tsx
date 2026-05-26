import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  withWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
      }}
    />
  );

  const wordmark = withWordmark && (
    <div
      className={cn(
        'leading-none font-serif font-semibold tracking-[-0.04em]',
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
