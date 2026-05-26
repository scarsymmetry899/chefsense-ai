'use client';

import { useMemo, useState } from 'react';
import { Camera } from 'lucide-react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { GradientButton, ScreenCard, SectionEyebrow } from '@/components/dish/screen-kit';
import { ROUTES } from '@/lib/constants/routes';
import { getDishOrThrow } from '@/lib/data/dishes';
import { getPlatingGuide } from '@/lib/dish-flow';

export default function DishPlatePage() {
  const params = useParams<{ id: string }>();
  const dish = getDishOrThrow(params.id);
  const guide = getPlatingGuide(dish);
  const [style, setStyle] = useState(guide.defaultStyle);

  const filteredSteps = useMemo(() => guide.steps, [guide.steps]);

  return (
    <AppShell className="pb-32">
      <Header backHref={ROUTES.dishFinish(dish.dishId)} />

      <section className="text-center">
        <h1 className="text-[36px] leading-none">Plate like a chef</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
          Turn your dish into a restaurant-style presentation.
        </p>
      </section>

      <ScreenCard className="mt-5">
        <SectionEyebrow label="Choose a plating style" />
        <div className="mt-3 flex flex-wrap gap-3">
          {guide.styles.map((option) => {
            const active = option === style;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setStyle(option)}
                className={
                  active
                    ? 'rounded-full border border-primary/20 gradient-cta px-5 py-2.5 text-sm font-semibold text-white shadow-cta'
                    : 'rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-soft'
                }
              >
                {option}
              </button>
            );
          })}
        </div>
      </ScreenCard>

      <ScreenCard className="mt-4">
        <SectionEyebrow label={`${style} guide`} />
        <div className="space-y-3">
          {filteredSteps.map((item, index) => (
            <div key={item.id} className="rounded-[22px] border border-border/60 bg-card px-4 py-4 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                  {index + 1}
                </span>
                <div>
                  <div className="text-[18px] font-medium text-foreground">{item.title}</div>
                  <div className="mt-1 text-sm leading-6 text-muted-foreground">{item.instruction}</div>
                </div>
              </div>
              <div className="mt-3 rounded-[18px] border border-border/60 bg-background px-4 py-3 text-sm leading-6 text-muted-foreground">
                Visual tip: {item.visualTip}
              </div>
            </div>
          ))}
        </div>
      </ScreenCard>

      <div className="mt-4 -mx-5 overflow-x-auto px-5 scrollbar-hide">
        <div className="flex gap-3 pb-1">
          {guide.principles.map((principle) => (
            <ScreenCard key={principle.title} className="w-[240px] shrink-0">
              <SectionEyebrow label={principle.title} />
              <p className="text-sm leading-6 text-muted-foreground">{principle.explanation}</p>
            </ScreenCard>
          ))}
        </div>
      </div>

      <ScreenCard className="mt-4">
        <SectionEyebrow label="Garnish suggestions" />
        <div className="flex flex-wrap gap-2">
          {guide.garnishSuggestions.map((item) => (
            <span key={item} className="rounded-full bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary-dark">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-[20px] border border-border/60 bg-background px-4 py-4">
          <div className="text-sm font-semibold text-foreground">Photo tips</div>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
            {guide.photoTips.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </div>
      </ScreenCard>

      <div className="mt-6">
        <GradientButton
          href={ROUTES.dishShare(dish.dishId)}
          label="Capture Final Plate"
          subline="Upload the finished presentation and get share-ready feedback."
          icon={Camera}
        />
      </div>
    </AppShell>
  );
}
