'use client';

import { CircleHelp, ExternalLink } from 'lucide-react';
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
      <Header backHref={ROUTES.home} title="Pantry & Tools" />

      <ScreenCard>
        <SectionEyebrow label="Kitchen readiness" />
        <div className="font-serif text-[28px] leading-none text-foreground">Know what your recipe will need before you begin.</div>
        <div className="mt-3 text-sm leading-6 text-muted-foreground">
          ChefSense now surfaces the pans, appliances, prep tools, and small finishing items that appear across your guided dish flows.
        </div>
      </ScreenCard>

      <div className="mt-5 space-y-3">
        {allTools.map((item) => {
          const ref = getToolReference(item);
          return (
          <ScreenCard key={item} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[17px] font-medium text-foreground">{item}</div>
                <div className="mt-1 text-sm text-muted-foreground">{ref.description}</div>
              </div>
              <a
                href={ref.infoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary shadow-soft"
                aria-label={`Learn more about ${item}`}
              >
                <CircleHelp className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-accent-green">
              <ExternalLink className="h-3.5 w-3.5" />
              Opens a quick reference link so you know what this tool looks like.
            </div>
          </ScreenCard>
          );
        })}
      </div>
    </AppShell>
  );
}
