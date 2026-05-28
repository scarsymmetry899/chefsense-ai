'use client';

import { CircleHelp } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { ScreenCard, SectionEyebrow } from '@/components/dish/screen-kit';
import { ROUTES } from '@/lib/constants/routes';
import { ALL_DISHES } from '@/lib/data/dishes';
import { getToolReference } from '@/lib/dish-flow';

export default function PantryPage() {
  const dishTools = Array.from(
    new Map(
      ALL_DISHES.flatMap((dish) => dish.tools.map((tool) => [tool.name, tool])),
    ).values(),
  );

  const extraEssentials = [
    'Microwave oven',
    'Salt and pepper shaker',
    'Measuring spoons',
    'Tasting spoon set',
  ];

  const allTools = [
    ...dishTools.map((tool) => tool.name),
    ...extraEssentials.filter((item) => !dishTools.some((tool) => tool.name === item)),
  ];

  return (
    <AppShell>
      <Header backHref={ROUTES.home} title="Tools" />

      <ScreenCard>
        <SectionEyebrow label="Kitchen reference" />
        <div className="h-section">Pans, appliances, and prep tools used in your guided dishes.</div>
        <div className="mt-3 t-body text-muted-foreground">
          Tap any tool to open a quick reference image so you know exactly what to grab from the kitchen.
        </div>
      </ScreenCard>

      <div className="mt-5 space-y-3">
        {allTools.map((item) => {
          const ref = getToolReference(item);
          return (
          <ScreenCard key={item} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="h-card text-[18px]">{item}</div>
                <div className="mt-1 t-body text-muted-foreground">{ref.description}</div>
              </div>
              <a
                href={ref.infoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary shadow-soft"
                aria-label={`Learn more about ${item}`}
              >
                <CircleHelp className="h-4 w-4" />
              </a>
            </div>
          </ScreenCard>
          );
        })}
      </div>
    </AppShell>
  );
}
