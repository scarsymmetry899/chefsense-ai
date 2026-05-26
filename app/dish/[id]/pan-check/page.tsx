'use client';

import Link from 'next/link';
import { Camera, Flame, LifeBuoy, RotateCcw, ThermometerSun } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { DishVisual, GradientButton, ScreenCard, SectionEyebrow } from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';

export default function DishPanCheckPage({ params }: { params: { id: string } }) {
  const dish = getDishOrThrow(params.id);
  const step = dish.cookingSteps[6];

  return (
    <AppShell showBottomNav={false} className="pb-12">
      <Header backHref={ROUTES.dishCook(dish.dishId, 7)} showLanguageToggle={false} />

      <section className="text-center">
        <h1 className="text-[36px] leading-none">Visual Pan Check</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
          AI-powered diagnosis of your cooking
        </p>
      </section>

      <div className="mt-5">
        <div className="relative">
          <DishVisual src={step.image} alt={step.title} className="h-[420px]" />
          <div className="absolute left-4 top-4 rounded-[24px] bg-black/60 px-4 py-3 text-white">
            <div className="text-sm">AI Confidence</div>
            <div className="mt-2 flex items-center gap-2 font-serif text-[24px]">
              <span className="inline-block h-10 w-10 rounded-full border-4 border-secondary" />
              85%
            </div>
          </div>
          <div className="absolute right-4 top-4 rounded-[20px] bg-black/60 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Flash
            </div>
          </div>
        </div>
      </div>

      <ScreenCard className="mt-5">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionEyebrow label="Current Stage" />
            <h2 className="text-[26px] leading-none">Nearly reduced</h2>
            <p className="mt-3 text-[17px] leading-8 text-muted-foreground">
              The masala has thickened well and the raw smell has gone down.
            </p>
          </div>
          <div className="rounded-[24px] border border-primary/20 bg-primary-soft/45 p-4">
            <div className="font-medium text-primary-dark">Slight sticking</div>
            <div className="mt-2 text-sm leading-6 text-muted-foreground">
              Watch the bottom closely.
            </div>
          </div>
        </div>
      </ScreenCard>

      <ScreenCard className="mt-4">
        <SectionEyebrow label="AI Suggestion" />
        <div className="text-[20px] leading-8 text-foreground">Lower heat and add 1 tbsp hot water</div>
      </ScreenCard>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <ScreenCard className="p-4 text-center">
          <ThermometerSun className="mx-auto h-6 w-6 text-primary" />
          <div className="mt-3 text-sm text-muted-foreground">Onion Stage</div>
          <div className="mt-1 text-[18px] text-accent-green">Well browned</div>
        </ScreenCard>
        <ScreenCard className="p-4 text-center">
          <Camera className="mx-auto h-6 w-6 text-primary" />
          <div className="mt-3 text-sm text-muted-foreground">Masala Thickness</div>
          <div className="mt-1 text-[18px] text-primary">Thick</div>
        </ScreenCard>
        <ScreenCard className="p-4 text-center">
          <RotateCcw className="mx-auto h-6 w-6 text-primary" />
          <div className="mt-3 text-sm text-muted-foreground">Oil Separation</div>
          <div className="mt-1 text-[18px] text-accent-green">Good</div>
        </ScreenCard>
        <ScreenCard className="p-4 text-center">
          <Flame className="mx-auto h-6 w-6 text-primary" />
          <div className="mt-3 text-sm text-muted-foreground">Burn Risk</div>
          <div className="mt-1 text-[18px] text-accent-green">Low</div>
        </ScreenCard>
      </div>

      <div className="mt-4 rounded-full border border-border/70 bg-secondary-soft/45 px-4 py-3 text-sm text-accent-green">
        Tip: Stir every 30-40 seconds to avoid sticking.
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          href={ROUTES.dishPanCheck(dish.dishId)}
          className="inline-flex items-center justify-center gap-2 rounded-[24px] border border-primary/40 bg-white/80 px-5 py-4 text-[18px] font-medium text-primary"
        >
          <RotateCcw className="h-5 w-5" />
          Analyze Again
        </Link>
        <GradientButton
          href={ROUTES.dishRescue(dish.dishId, 'raw-masala-taste')}
          label="Open Rescue"
          icon={LifeBuoy}
          className="px-5 py-4 [&_.font-serif]:text-[18px]"
        />
      </div>

      <div className="mt-5 flex items-center justify-center gap-3 text-sm text-muted-foreground">
        <span>Auto-check at intervals</span>
        <span className="inline-flex h-7 w-12 items-center rounded-full bg-accent-green px-1">
          <span className="ml-auto inline-block h-5 w-5 rounded-full bg-white" />
        </span>
      </div>
    </AppShell>
  );
}
