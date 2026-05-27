'use client';

import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { ScreenCard, SectionEyebrow } from '@/components/dish/screen-kit';
import { ROUTES } from '@/lib/constants/routes';

const ESSENTIALS = [
  'Heavy kadhai or saute pan',
  'Mixer or blender jar',
  'Fine strainer',
  'Pressure cooker or deep pot',
  'Tasting spoons',
  'Hot water kettle',
];

export default function PantryPage() {
  return (
    <AppShell>
      <Header backHref={ROUTES.home} title="Pantry & Tools" />

      <ScreenCard>
        <SectionEyebrow label="Kitchen readiness" />
        <div className="font-serif text-[28px] leading-none text-foreground">Know what your recipe will need before you begin.</div>
        <div className="mt-3 text-sm leading-6 text-muted-foreground">
          ChefSense will surface required pans, appliances, and prep tools here as the guided pantry grows.
        </div>
      </ScreenCard>

      <div className="mt-5 space-y-3">
        {ESSENTIALS.map((item) => (
          <ScreenCard key={item} className="p-4">
            <div className="text-[17px] font-medium text-foreground">{item}</div>
            <div className="mt-1 text-sm text-muted-foreground">Useful across restaurant-style Indian gravy, rice, and tawa dishes.</div>
          </ScreenCard>
        ))}
      </div>
    </AppShell>
  );
}
