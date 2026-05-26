'use client';

import { Clock3, Leaf, ListChecks, UtensilsCrossed } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import {
  DishVisual,
  GradientButton,
  MetricTile,
  ProgressBar,
  ScreenCard,
  SectionEyebrow,
} from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';

export default function DishMiseEnPlacePage({ params }: { params: { id: string } }) {
  const dish = getDishOrThrow(params.id);
  const completed = dish.miseEnPlace.filter((item) => item.done).length;
  const progress = Math.round((completed / dish.miseEnPlace.length) * 100);

  return (
    <AppShell className="pb-32">
      <Header backHref={ROUTES.dishSources(dish.dishId)} showLanguageToggle={false} />

      <ScreenCard className="overflow-hidden p-0">
        <div className="grid gap-0 md:grid-cols-[1fr_1.1fr]">
          <DishVisual
            src={dish.heroImage}
            alt={dish.dishName}
            className="h-[220px] rounded-none border-0 md:h-full"
          />
          <div className="p-5">
            <SectionEyebrow label="Mise en Place Planner" />
            <h1 className="text-[34px] leading-[0.95]">{dish.dishName}</h1>
            <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
              Let&apos;s get everything ready before you start cooking.
            </p>
          </div>
        </div>

        <div className="border-t border-border/70 px-5 py-5">
          <div className="flex items-center justify-between gap-3 text-[16px]">
            <span className="font-medium text-foreground">Prep Progress</span>
            <span className="text-muted-foreground">
              {completed} of {dish.miseEnPlace.length} tasks done
            </span>
          </div>
          <ProgressBar value={progress} className="mt-4" />
        </div>
      </ScreenCard>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <MetricTile icon={Clock3} title="Prep Time" value={`${dish.prepTimeMin} min`} detail="Estimated" />
        <MetricTile icon={UtensilsCrossed} title="Tools Needed" value={`${dish.tools.length}`} detail="Items" />
        <MetricTile icon={Leaf} title="Ingredients" value={`${dish.ingredients.length}`} detail="Total" />
      </div>

      <ScreenCard className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px]">Mise en Place Checklist</h2>
          <span className="text-sm font-medium text-accent-green">
            {completed} / {dish.miseEnPlace.length}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {dish.miseEnPlace.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-[22px] border border-border/60 bg-white/65 px-4 py-3"
            >
              <span
                className={
                  task.done
                    ? 'inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-green text-white'
                    : 'inline-flex h-7 w-7 rounded-full border border-border bg-white'
                }
              >
                {task.done ? '✓' : ''}
              </span>
              <span
                className={
                  task.done
                    ? 'text-base text-muted-foreground line-through'
                    : 'text-base text-foreground'
                }
              >
                {task.label}
              </span>
              <span className="ml-auto text-border">::</span>
            </div>
          ))}
        </div>
      </ScreenCard>

      <ScreenCard className="mt-5">
        <SectionEyebrow icon={ListChecks} label="Chef Tip" />
        <p className="text-[17px] leading-8 text-muted-foreground">
          Getting everything prepped makes the cooking smooth, fast and more enjoyable.
        </p>
      </ScreenCard>

      <div className="mt-6">
        <GradientButton
          href={ROUTES.dishCook(dish.dishId, 7)}
          label="Start Cooking Session"
          subline="Good prep, great cooking."
        />
      </div>
    </AppShell>
  );
}
