'use client';

import Link from 'next/link';
import { ChefHat, Eye, LifeBuoy, TimerReset, Waves } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import {
  AlertCard,
  DishVisual,
  GradientButton,
  HeatDots,
  ScreenCard,
  SectionEyebrow,
  StepDots,
  cueMeta,
} from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';

export default function DishCookPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const dish = getDishOrThrow(params.id);
  const stepIndex = Number(searchParams.get('step') ?? 7);
  const step = dish.cookingSteps.find((item) => item.index === stepIndex) ?? dish.cookingSteps[0];
  const progress = Math.round((step.index / dish.cookingSteps.length) * 100);
  const timer = new Date(step.durationSec * 1000).toISOString().substring(14, 19);

  return (
    <AppShell showBottomNav={false} className="pb-12">
      <Header
        backHref={ROUTES.dishMiseEnPlace(dish.dishId)}
        showBrand={false}
        showLanguageToggle={false}
        title={dish.dishName}
        actions={[{ icon: Waves, label: 'Exit', href: ROUTES.home }]}
        className="mb-2"
      />

      <div className="text-center">
        <div className="text-[14px] font-medium text-copper">{dish.dishName}</div>
        <div className="mx-auto mt-3 inline-flex rounded-full border border-border bg-card px-5 py-2 text-[15px] text-foreground">
          Step {step.index} of {dish.cookingSteps.length}
        </div>
        <div className="mt-4">
          <StepDots count={Math.min(dish.cookingSteps.length, 8)} active={Math.min(step.index, 8)} />
        </div>
      </div>

      <div className="mt-5">
        <DishVisual src={step.image} alt={step.title} className="h-[295px]" />
      </div>

      <section className="mt-6 text-center">
        <h1 className="mx-auto max-w-[340px] text-[40px] leading-[0.95]">
          {step.title.includes('tomato-cashew') ? (
            <>
              Cook the <span className="text-primary">tomato-cashew</span> masala
            </>
          ) : (
            step.title
          )}
        </h1>
        <p className="mx-auto mt-4 max-w-[340px] text-[18px] leading-8 text-muted-foreground">
          {step.instruction}
        </p>
      </section>

      <ScreenCard className="mt-6">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="border-r border-border/60 pr-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <ChefHat className="h-4 w-4" />
              Heat
            </div>
            <div className="mt-3 font-serif text-[22px] text-primary-dark">{step.heat}</div>
            <div className="mt-3">
              <HeatDots level={step.heat} />
            </div>
          </div>
          <div className="border-r border-border/60 px-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <TimerReset className="h-4 w-4" />
              Timer
            </div>
            <div className="mt-3 font-serif text-[34px] leading-none text-primary">{timer}</div>
            <div className="mt-2 text-sm text-muted-foreground">min remaining</div>
          </div>
          <div className="pl-3">
            <div className="text-primary">Step Progress</div>
            <div className="mx-auto mt-2 flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-primary/80 font-serif text-[28px] text-foreground">
              {progress}%
            </div>
          </div>
        </div>
      </ScreenCard>

      <div className="mt-5">
        <SectionEyebrow icon={Eye} label="Sensory Cues - Trust Your Senses" />
        <div className="grid grid-cols-2 gap-3">
          {step.sensoryCues.map((cue) => {
            const meta = cueMeta[cue.type];
            const Icon = meta?.icon ?? Eye;
            return (
              <ScreenCard key={`${cue.type}-${cue.cue}`} className="p-4">
                <Icon className="h-6 w-6 text-accent-green" />
                <div className="mt-3 text-[17px] font-medium text-accent-green">
                  {meta?.label ?? cue.type}
                </div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">{cue.cue}</div>
              </ScreenCard>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <AlertCard title="Why this matters" detail={step.whyThisMatters} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Link
          href={ROUTES.dishPanCheck(dish.dishId)}
          className="inline-flex items-center justify-center rounded-[22px] border border-border bg-white/80 px-3 py-4 text-center text-[15px] font-medium text-foreground"
        >
          Mine looks different
        </Link>
        <Link
          href={ROUTES.dishRescue(dish.dishId, 'raw-masala-taste')}
          className="inline-flex items-center justify-center rounded-[22px] border border-border bg-white/80 px-3 py-4 text-center text-[15px] font-medium text-foreground"
        >
          <LifeBuoy className="mr-2 h-4 w-4 text-primary" />
          Fix my dish
        </Link>
        <GradientButton
          href={ROUTES.dishVoice(dish.dishId)}
          label="Next step"
          icon={ChefHat}
          className="px-4 py-4 [&_.font-serif]:text-[18px]"
        />
      </div>

      <div className="mt-5 text-center text-sm text-accent-green">You&apos;re doing great!</div>
    </AppShell>
  );
}
