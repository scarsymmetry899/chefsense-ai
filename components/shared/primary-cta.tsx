'use client';

import Link from 'next/link';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PrimaryCTAProps {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  trailing?: React.ReactNode;
  subline?: string;
  size?: 'lg' | 'xl';
  fullWidth?: boolean;
  className?: string;
}

export function PrimaryCTA({
  label,
  href,
  onClick,
  icon: Icon,
  trailing = <ChevronRight className="h-5 w-5" />,
  subline,
  size = 'xl',
  fullWidth = true,
  className,
}: PrimaryCTAProps) {
  const inner = (
    <Button
      size={size}
      onClick={onClick}
      className={cn(
        fullWidth && 'w-full',
        'gap-3 justify-between text-balance',
        className,
      )}
    >
      <span className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5" />}
        <span className="flex flex-col items-start leading-tight">
          <span className="font-medium tracking-wide">{label}</span>
          {subline && (
            <span className="text-xs font-normal opacity-90">{subline}</span>
          )}
        </span>
      </span>
      <span className="text-white/90">{trailing}</span>
    </Button>
  );

  if (href) {
    return (
      <Link href={href} className={cn(fullWidth && 'block w-full')}>
        {inner}
      </Link>
    );
  }
  return inner;
}
