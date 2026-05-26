'use client';

import { useParams } from 'next/navigation';
import { Mic, Square, Volume2 } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { ScreenCard } from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';

export default function DishVoicePage() {
  const params = useParams<{ id: string }>();
  const dish = getDishOrThrow(params.id);
  const step = dish.cookingSteps[2];

  return (
    <AppShell showBottomNav={false} className="pb-12">
      <Header backHref={ROUTES.dishCook(dish.dishId, step.index)} showLanguageToggle={false} />

      <section className="text-center">
        <h1 className="text-[18px] font-medium text-foreground">Voice Cook Mode</h1>
        <div className="mx-auto mt-7 flex h-56 w-56 items-center justify-center rounded-full border border-primary/25 bg-primary-soft/40 shadow-[0_0_0_18px_rgba(245,156,96,0.08),0_0_0_36px_rgba(245,156,96,0.04)]">
          <div className="text-center">
            <div className="mx-auto h-10 w-24 rounded-full border border-primary/30 bg-white/70" />
            <div className="mt-6 text-[20px] font-medium text-primary">Listening...</div>
            <div className="mt-1 text-muted-foreground">Speak naturally</div>
          </div>
        </div>
      </section>

      <ScreenCard className="mt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[15px] font-medium text-primary">Step 3 of 18</div>
            <h2 className="mt-2 text-[26px] leading-none">{step.title}</h2>
            <p className="mt-3 text-[17px] leading-7 text-muted-foreground">{step.instruction}</p>
          </div>
          <div className="min-w-[92px] text-right">
            <div className="text-sm text-muted-foreground">Est. time left</div>
            <div className="mt-2 font-serif text-[34px] leading-none text-primary">08:24</div>
            <div className="mt-1 text-sm text-muted-foreground">min</div>
          </div>
        </div>
      </ScreenCard>

      <ScreenCard className="mt-4 space-y-4">
        <div className="max-w-[88%] rounded-[22px] bg-white/75 px-4 py-4">
          <div className="text-[17px] leading-8 text-foreground">
            Let&apos;s saute the onions. Heat 2 tbsp oil or ghee in a pan over medium heat. Add
            the sliced onions.
          </div>
          <div className="mt-2 text-xs text-muted-foreground">9:18 AM</div>
        </div>
        <div className="ml-auto max-w-[78%] rounded-[22px] bg-primary-soft/55 px-4 py-3 text-right">
          <div className="text-[17px] leading-7 text-foreground">What should it look like now?</div>
          <div className="mt-2 text-xs text-muted-foreground">9:20 AM</div>
        </div>
        <div className="max-w-[88%] rounded-[22px] bg-white/75 px-4 py-4">
          <div className="text-[17px] leading-8 text-foreground">
            They should be soft, translucent, and just starting to turn light golden at the edges.
            Stir occasionally.
          </div>
          <div className="mt-2 text-xs text-muted-foreground">9:21 AM</div>
        </div>
        <div className="ml-auto max-w-[72%] rounded-[22px] bg-primary-soft/55 px-4 py-3 text-right">
          <div className="text-[17px] leading-7 text-foreground">Mine is sticking.</div>
          <div className="mt-2 text-xs text-muted-foreground">9:22 AM</div>
        </div>
        <div className="max-w-[88%] rounded-[22px] bg-white/75 px-4 py-4">
          <div className="text-[17px] leading-8 text-foreground">
            No worries. Lower the heat slightly and add a splash of water. Stir gently to lift the
            onions off the pan.
          </div>
          <div className="mt-2 text-xs text-muted-foreground">9:22 AM</div>
        </div>
      </ScreenCard>

      <div className="mt-6 flex items-end justify-between gap-3">
        <button type="button" className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-border bg-white/80">
            <Volume2 className="h-6 w-6" />
          </span>
          <span className="text-sm">Speaker</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-2">
          <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-secondary to-primary text-white shadow-cta">
            <Mic className="h-10 w-10" />
          </span>
          <span className="text-base font-medium text-foreground">Tap to Speak</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-2 text-primary">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-white/80">
            <Square className="h-5 w-5 fill-current" />
          </span>
          <span className="text-sm">Stop Cooking</span>
        </button>
      </div>
    </AppShell>
  );
}
