'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
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
import { useLanguage } from '@/lib/i18n/language-context';

const AXIS_META = {
  salt: { icon: Sparkles, label: 'Salt' },
  acid: { icon: Citrus, label: 'Acid' },
  richness: { icon: Wheat, label: 'Richness' },
  heat: { icon: Flame, label: 'Heat' },
  aroma: { icon: Leaf, label: 'Aroma' },
};

export default function DishFinishPage() {
  const params = useParams<{ id: string }>();
  const { t, lang } = useLanguage();
  const dish = getDishOrThrow(params.id);
  const [selectedTouches, setSelectedTouches] = useState<string[]>([]);
  const copy = {
    en: {
      almostReady: 'Almost ready',
      added: 'Added',
      plate: 'Plate Like a Chef',
      plateSub: 'Turn your dish into a restaurant-style presentation.',
      share: 'Share My Plate',
      shareSub: 'Upload the final plate, rate it, and grab a premium caption.',
    },
    hi: {
      almostReady: 'Almost ready',
      added: 'Added',
      plate: 'Plate Like a Chef',
      plateSub: 'अपनी डिश को रेस्टोरेंट-स्टाइल प्रेज़ेंटेशन दें।',
      share: 'Share My Plate',
      shareSub: 'फाइनल प्लेट अपलोड करें, रेट करें और एक प्रीमियम कैप्शन लें।',
    },
    te: {
      almostReady: 'Almost ready',
      added: 'Added',
      plate: 'Plate Like a Chef',
      plateSub: 'మీ డిష్‌ను రెస్టారెంట్-స్టైల్ ప్రెజెంటేషన్‌గా మార్చండి.',
      share: 'Share My Plate',
      shareSub: 'ఫైనల్ ప్లేట్‌ను అప్‌లోడ్ చేసి, రేట్ చేసి, ప్రీమియం క్యాప్షన్ పొందండి.',
    },
  }[lang];

  const balanceLabel = useMemo(() => {
    if (selectedTouches.length >= 3) return t('finish.veryWellBalanced');
    return copy.almostReady;
  }, [copy.almostReady, selectedTouches.length, t]);

  return (
    <AppShell className="pb-32">
      <Header
        backHref={ROUTES.dishCook(dish.dishId, dish.cookingSteps[dish.cookingSteps.length - 1]?.index ?? 1)}
        actions={[{ icon: Bell, label: 'Alerts' }]}
      />

      <section className="text-center">
        <h1 className="text-[36px] leading-none">{t('finish.title')}</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
          {t('finish.subtitle')}
        </p>
      </section>

      <ScreenCard className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow label={t('finish.balanceMeter')} className="mb-0" />
          <StatusPill label={balanceLabel} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {dish.tasteBalancing.map((axis) => {
            const meta = AXIS_META[axis.axis];
            const Icon = meta.icon;
            return (
              <div key={axis.axis} className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-secondary bg-white shadow-soft">
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
        <SectionEyebrow label={t('finish.touches')} />
        <div className="space-y-3">
          {dish.finishingTouches.map((touch) => {
            const active = selectedTouches.includes(touch.id);
            return (
              <button
                key={touch.id}
                type="button"
                onClick={() =>
                  setSelectedTouches((current) =>
                    current.includes(touch.id)
                      ? current.filter((item) => item !== touch.id)
                      : [...current, touch.id],
                  )
                }
                className="flex w-full items-center gap-3 rounded-[22px] border border-border/60 bg-card px-4 py-4 text-left shadow-soft"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="text-[18px] font-medium text-foreground">{touch.label}</div>
                  <div className="mt-1 text-sm leading-6 text-muted-foreground">{touch.reason}</div>
                </div>
                <span
                  className={
                    active
                      ? 'rounded-full border border-primary/20 bg-primary-soft px-5 py-2 text-primary'
                      : 'rounded-full border border-primary/25 px-5 py-2 text-primary'
                  }
                >
                  {active ? copy.added : t('finish.add')}
                </span>
              </button>
            );
          })}
        </div>
      </ScreenCard>

      <ScreenCard className="mt-4">
        <SectionEyebrow label={t('finish.servingPreview')} />
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

      <div className="mt-6 space-y-3">
        <GradientButton
          href={ROUTES.dishPlate(dish.dishId)}
          label={copy.plate}
          subline={copy.plateSub}
        />
        <Link
          href={ROUTES.dishShare(dish.dishId)}
          className="flex w-full items-center justify-between rounded-[26px] border border-border bg-card px-6 py-4 text-foreground shadow-soft transition-transform active:scale-[0.985]"
        >
          <span className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="flex flex-col leading-tight text-left">
              <span className="font-serif text-[20px]">{copy.share}</span>
              <span className="text-sm text-muted-foreground">{copy.shareSub}</span>
            </span>
          </span>
          <span className="text-lg text-primary">→</span>
        </Link>
      </div>
    </AppShell>
  );
}
