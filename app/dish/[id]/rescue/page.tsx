'use client';

import { Bell, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { DishVisual, GradientButton, ScreenCard, SectionEyebrow } from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';

export default function DishRescuePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const dish = getDishOrThrow(params.id);
  const issueId = searchParams.get('issue') ?? 'raw-masala-taste';
  const issue =
    dish.rescueIssues.find((item) => item.id === issueId) ?? {
      id: 'raw-masala-taste',
      label: 'Raw masala taste',
      icon: 'flame',
      diagnosis:
        'The spices were added too early or not cooked long enough. This leaves a raw, powdery flavour in the dish.',
      immediateFix: [
        'Add 1-2 tsp oil or ghee.',
        'Add 2 tbsp tomato puree or curd.',
        'Cook on medium heat for 5-7 min, stirring till the raw smell disappears.',
      ],
      preventNextTime: [
        'Saute spices on medium-low heat till aromatic.',
        'Add a splash of water if they start to stick.',
        'Use fresh spices and grind in small batches for best flavour.',
      ],
      foodScience:
        'Spices contain essential oils that need heat and time to release their aroma. Proper cooking changes their flavour compounds from harsh and raw to rich and balanced.',
    };

  return (
    <AppShell>
      <Header
        backHref={ROUTES.dishCook(dish.dishId, 7)}
        showLanguageToggle={false}
        actions={[{ icon: Bell, label: 'Alerts' }]}
      />

      <section className="text-center">
        <h1 className="text-[36px] leading-none">Fix your dish</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
          Tell us what&apos;s wrong, we&apos;ll help you fix it.
        </p>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          'Too salty',
          'Too spicy',
          'Too watery',
          'Too sour',
          'Raw masala taste',
          'Burnt smell',
          'Gravy split',
          'Paneer rubbery',
          'Flat taste',
        ].map((label) => (
          <div
            key={label}
            className={
              label === 'Raw masala taste'
                ? 'rounded-[18px] border border-primary/30 bg-gradient-to-r from-primary to-primary-dark px-3 py-3 text-center text-sm font-medium text-white'
                : 'rounded-[18px] border border-border bg-white/75 px-3 py-3 text-center text-sm text-foreground'
            }
          >
            {label}
          </div>
        ))}
      </div>

      <ScreenCard className="mt-5">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionEyebrow icon={Search} label="Likely Diagnosis" />
            <p className="text-[18px] leading-8 text-muted-foreground">{issue.diagnosis}</p>
          </div>
          <DishVisual src={dish.cookingSteps[6].image} alt={issue.label} className="h-[150px]" />
        </div>
      </ScreenCard>

      <ScreenCard className="mt-4">
        <SectionEyebrow icon={Sparkles} label="Immediate Fix" />
        <ol className="space-y-3 pl-6 text-[18px] leading-8 text-foreground">
          {issue.immediateFix.map((fix) => (
            <li key={fix}>{fix}</li>
          ))}
        </ol>
      </ScreenCard>

      <ScreenCard className="mt-4">
        <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <SectionEyebrow icon={ShieldCheck} label="Prevent Next Time" />
            <ul className="space-y-2 text-[17px] leading-8 text-foreground">
              {issue.preventNextTime.map((tip) => (
                <li key={tip}>- {tip}</li>
              ))}
            </ul>
          </div>
          <DishVisual src={dish.heroImage} alt={dish.dishName} className="h-[170px]" />
        </div>
      </ScreenCard>

      <ScreenCard className="mt-4">
        <SectionEyebrow label="Food Science" />
        <p className="text-[17px] leading-8 text-muted-foreground">{issue.foodScience}</p>
      </ScreenCard>

      <div className="mt-6">
        <GradientButton href={ROUTES.dishFinish(dish.dishId)} label="Apply this fix" />
      </div>
    </AppShell>
  );
}
