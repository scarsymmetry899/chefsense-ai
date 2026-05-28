import { cn } from '@/lib/utils';
import { BottomNav } from './bottom-nav';
import { ResumeCookBanner } from './resume-cook-banner';

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
 *
 * The ResumeCookBanner floats above the bottom nav whenever a user is mid-
 * cook but has wandered off the cook flow — one tap returns them to the
 * step they were on, eliminating the previous "I lost my place" complaint.
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
      {showBottomNav && (
        <>
          <ResumeCookBanner />
          <BottomNav />
        </>
      )}
    </>
  );
}
