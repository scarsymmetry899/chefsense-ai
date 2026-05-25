import { cn } from '@/lib/utils';
import { BottomNav } from './bottom-nav';

interface AppShellProps {
  children: React.ReactNode;
  /** Hide the bottom nav on screens where it shouldn't appear (e.g. full-bleed cook mode). */
  showBottomNav?: boolean;
  className?: string;
}

/**
 * Mobile-first phone frame.
 * - Centred container, max width 440px
 * - Warm ivory background flows through globals.css
 * - Safe-area padding top and bottom
 */
export function AppShell({
  children,
  showBottomNav = true,
  className,
}: AppShellProps) {
  return (
    <>
      <div
        className={cn(
          'app-frame',
          // When the floating bottom nav is hidden, drop the 7rem
          // reservation so content doesn't float in empty space.
          !showBottomNav && 'pb-8',
          className,
        )}
      >
        {children}
      </div>
      {showBottomNav && <BottomNav />}
    </>
  );
}
