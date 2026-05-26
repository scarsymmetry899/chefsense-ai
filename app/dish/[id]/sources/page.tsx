'use client';

import { useParams } from 'next/navigation';
import { BookOpen, ChefHat, FlaskConical, MapPin, PlaySquare } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';
import {
  getSourceMeta,
  GradientButton,
  ProgressBar,
  ScreenCard,
  SectionEyebrow,
  StatusPill,
  TinyCheck,
} from '@/components/dish/screen-kit';

const SOURCE_ICON = [ChefHat, MapPin, PlaySquare, BookOpen, FlaskConical];

export default function DishSourcesPage() {
  const params = useParams<{ id: string }>();
  const dish = getDishOrThrow(params.id);

  return (
    <AppShell className="pb-32">
      <Header backHref={ROUTES.dish(dish.dishId)} showLanguageToggle={false} />

      <section className="text-center">
        <h1 className="mx-auto max-w-[330px] text-[34px] leading-[0.98]">
          Building your master-chef guide
        </h1>
        <p className="mx-auto mt-4 max-w-[330px] text-[16px] leading-7 text-muted-foreground">
          We compared 5 trusted source styles to create your most reliable version.
        </p>
      </section>

      <ScreenCard className="mt-6">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary/75 font-serif text-3xl text-foreground">
            5/5
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-medium text-foreground">
                Comparing 5 trusted source styles
              </div>
              <TinyCheck />
            </div>
            <ProgressBar value={100} className="mt-4" />
          </div>
        </div>
      </ScreenCard>

      <div className="mt-7">
        <SectionEyebrow label="Source consensus" />
        <div className="space-y-3">
          {dish.sourceConsensus.sources.map((source, index) => {
            const Icon = SOURCE_ICON[index] ?? ChefHat;
            const meta = getSourceMeta(source.category);
            return (
              <ScreenCard key={source.category} className="p-4">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[17px] font-medium text-foreground">{meta.label}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{meta.description}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {source.tags.map((tag) => (
                        <StatusPill key={tag} label={tag} />
                      ))}
                    </div>
                  </div>
                  <div className="min-w-[72px] text-right">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Trust
                    </div>
                    <div className="mt-1 font-serif text-[30px] leading-none text-accent-green">
                      {source.trustScore}%
                    </div>
                    <div className="mt-2">
                      <StatusPill label="High" tone="green" />
                    </div>
                  </div>
                </div>
              </ScreenCard>
            );
          })}
        </div>
      </div>

      <ScreenCard className="mt-5">
        <SectionEyebrow label="What top chef-style methods agree on" />
        <div className="space-y-3 text-[16px] leading-7 text-foreground">
          {dish.sourceConsensus.insights.slice(0, 4).map((insight) => (
            <div
              key={insight}
              className="border-t border-dashed border-border/70 pt-3 first:border-t-0 first:pt-0"
            >
              {insight}
            </div>
          ))}
        </div>
      </ScreenCard>

      <div className="mt-6">
        <GradientButton href={ROUTES.dishMiseEnPlace(dish.dishId)} label="View Guided Plan" />
      </div>
    </AppShell>
  );
}
