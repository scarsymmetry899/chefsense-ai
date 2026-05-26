'use client';

import { useParams } from 'next/navigation';
import { Bell, Citrus, Flame, Leaf, Sparkles, Wheat } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import {
  CheckRow,
  DishVisual,
  GradientButton,
  ScreenCard,
  SectionEyebrow,
  StatusPill,
} from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';

const AXIS_META = {
  salt: { icon: Sparkles, label: 'Salt' },
  acid: { icon: Citrus, label: 'Acid' },
  richness: { icon: Wheat, label: 'Richness' },
  heat: { icon: Flame, label: 'Heat' },
  aroma: { icon: Leaf, label: 'Aroma' },
};

export default function DishFinishPage() {
  const params = useParams<{ id: string }>();
  const dish = getDishOrThrow(params.id);

  return (
    <AppShell className="pb-32">
      <Header
        backHref={ROUTES.dishRescue(dish.dishId, 'raw-masala-taste')}
        showLanguageToggle={false}
        actions={[{ icon: Bell, label: 'Alerts' }]}
      />

      <section className="text-center">
        <h1 className="text-[36px] leading-none">Finish like a chef</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
          Let&apos;s balance the flavours and plate it beautifully.
        </p>
      </section>

      <ScreenCard className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow label="Taste Balance Meter" className="mb-0" />
          <StatusPill label="Very Well Balanced" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {dish.tasteBalancing.map((axis) => {
            const meta = AXIS_META[axis.axis];
            const Icon = meta.icon;
            return (
              <div key={axis.axis} className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-secondary bg-white">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div className="mt-3 text-[15px] text-foreground">{meta.label}</div>
                <div className="mt-1 font-serif text-[28px] leading-none text-foreground">
                  {axis.value}%
                </div>
              </div>
            );
          })}
        </div>
      </ScreenCard>

      <ScreenCard className="mt-4">
        <SectionEyebrow label="Recommended Finishing Touches" />
        <div className="space-y-3">
          {dish.finishingTouches.map((touch) => (
            <div
              key={touch.id}
              className="flex items-center gap-3 rounded-[22px] border border-border/60 bg-white/65 px-4 py-4"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="text-[18px] font-medium text-foreground">{touch.label}</div>
                <div className="mt-1 text-sm leading-6 text-muted-foreground">{touch.reason}</div>
              </div>
              <button type="button" className="rounded-full border border-primary/25 px-5 py-2 text-primary">
                Add
              </button>
            </div>
          ))}
        </div>
      </ScreenCard>

      <ScreenCard className="mt-4">
        <SectionEyebrow label="Serving Preview" />
        <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
          <DishVisual src={dish.heroImage} alt={dish.dishName} className="h-[190px]" />
          <div>
            <h2 className="text-[30px] leading-none">{dish.dishName}</h2>
            <div className="mt-4 space-y-3">
              {dish.plating.notes.map((note) => (
                <CheckRow key={note} label={note} />
              ))}
            </div>
            <div className="mt-4">
              <StatusPill label={`Serves ${dish.plating.serves}`} />
            </div>
          </div>
        </div>
      </ScreenCard>

      <div className="mt-6">
        <GradientButton
          href={ROUTES.home}
          label="Dish Ready"
          subline="It's time to serve and enjoy."
        />
      </div>
    </AppShell>
  );
}
