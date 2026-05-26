'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Bookmark, ChefHat, Clock3, Users, Utensils } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import {
  DishVisual,
  GradientButton,
  MetricTile,
  ScreenCard,
  SectionEyebrow,
  StatusPill,
} from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';

export default function DishPage() {
  const params = useParams<{ id: string }>();
  const dish = getDishOrThrow(params.id);

  return (
    <AppShell className="pb-32">
      <Header
        backHref={ROUTES.home}
        showLanguageToggle={false}
        actions={[{ icon: Bookmark, label: 'Save' }]}
      />

      <div className="grid gap-5">
        <section className="grid gap-5 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <DishVisual src={dish.heroImage} alt={dish.dishName} className="h-[280px]" />
          <div>
            <h1 className="text-[32px] leading-[0.95] sm:text-[38px]">{dish.dishName}</h1>
            <div className="mt-3">
              <StatusPill label="AI-Powered Summary" />
            </div>
            <p className="mt-4 text-[16px] leading-8 text-muted-foreground">{dish.summary}</p>
            {dish.isVegetarian ? (
              <div className="mt-4">
                <StatusPill label="Vegetarian" tone="green" />
              </div>
            ) : null}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <MetricTile icon={ChefHat} title="Difficulty" value={dish.difficulty} />
          <MetricTile
            icon={Clock3}
            title="Total Time"
            value={`${dish.totalTimeMin} min`}
            detail={`Prep ${dish.prepTimeMin}m · Cook ${dish.cookTimeMin}m`}
          />
          <MetricTile icon={Users} title="Serves" value={dish.serves} detail="People" />
          <MetricTile icon={Utensils} title="Cuisine" value={dish.region} detail={dish.cuisine} />
        </div>

        <ScreenCard>
          <SectionEyebrow label="Chef Success Variables" />
          <h2 className="text-[18px]">Master these to get restaurant-style results.</h2>
          <div className="mt-4 space-y-3">
            {dish.successVariables.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 border-t border-border/50 pt-3 first:border-t-0 first:pt-0"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <ChefHat className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="text-[18px] font-medium text-foreground">{item.title}</div>
                  <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </div>
                </div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-green text-white">
                  ✓
                </span>
              </div>
            ))}
          </div>
        </ScreenCard>

        <ScreenCard>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[18px]">Common Mistakes</h2>
            <Link href={ROUTES.dishSources(dish.dishId)} className="text-sm font-medium text-primary">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            {dish.commonMistakes.slice(0, 3).map((mistake) => (
              <div
                key={mistake}
                className="rounded-[20px] border border-border/60 bg-white/65 px-4 py-3"
              >
                {mistake}
              </div>
            ))}
          </div>
        </ScreenCard>

        <GradientButton
          href={ROUTES.dishMiseEnPlace(dish.dishId)}
          label="Start Mise en Place"
          subline="Great cooking begins with great prep."
        />
      </div>
    </AppShell>
  );
}
