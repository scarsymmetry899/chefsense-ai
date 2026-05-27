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
import { useLanguage } from '@/lib/i18n/language-context';

export default function DishPlatePage() {
  const params = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const dish = getDishOrThrow(params.id);
  const guide = getPlatingGuide(dish);
  const [style, setStyle] = useState(guide.defaultStyle);
  const copy = {
    en: {
      title: 'Plate like a chef',
      subtitle: 'Turn your dish into a restaurant-style presentation.',
      choose: 'Choose a plating style',
      garnish: 'Garnish suggestions',
      photoTips: 'Photo tips',
      capture: 'Capture Final Plate',
      captureSub: 'Upload the finished presentation and get share-ready feedback.',
    },
    hi: {
      title: 'Plate like a chef',
      subtitle: 'अपनी डिश को रेस्टोरेंट-स्टाइल प्रेज़ेंटेशन दें।',
      choose: 'प्लेटिंग स्टाइल चुनें',
      garnish: 'गार्निश सुझाव',
      photoTips: 'फोटो टिप्स',
      capture: 'Capture Final Plate',
      captureSub: 'फाइनल प्रेज़ेंटेशन अपलोड करें और शेयर-रेडी फीडबैक पाएँ।',
    },
    te: {
      title: 'Plate like a chef',
      subtitle: 'మీ డిష్‌ను రెస్టారెంట్-స్టైల్ ప్రెజెంటేషన్‌గా మార్చండి.',
      choose: 'ప్లేటింగ్ స్టైల్ ఎంచుకోండి',
      garnish: 'గార్నిష్ సూచనలు',
      photoTips: 'ఫోటో సూచనలు',
      capture: 'Capture Final Plate',
      captureSub: 'ఫైనల్ ప్రెజెంటేషన్‌ను అప్‌లోడ్ చేసి షేర్-రెడీ ఫీడ్‌బ్యాక్ పొందండి.',
    },
  }[lang];

  const filteredSteps = useMemo(() => guide.steps, [guide.steps]);
  const styleDescription = useMemo(() => {
    switch (style) {
      case 'Classic Indian':
        return 'Warm bowl, generous portioning, and familiar garnish balance for a premium home-style serve.';
      case 'Fine Dining':
        return 'Tighter plating, more negative space, and one sharp visual focal point.';
      case 'Modern Minimal':
        return 'Cleaner lines, smaller garnish moments, and a quieter plate around the food.';
      case 'Dhaba Luxe':
        return 'Bold warmth, lush finish, and slightly more indulgent garnish energy.';
      case 'Festive Serve':
        return 'Richer garnish layering, celebratory colour, and a more abundant presentation.';
      default:
        return 'Choose the plating mood that feels right for this dish.';
    }
  }, [style]);

  return (
    <AppShell className="pb-32">
      <Header backHref={ROUTES.dishFinish(dish.dishId)} />

      <section className="text-center">
        <h1 className="text-[40px] leading-none">{copy.title}</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
          {copy.subtitle}
        </p>
      </section>

      <ScreenCard className="mt-5 overflow-hidden p-0">
        <div className="relative h-[220px]">
          <img src={dish.heroImage} alt={dish.dishName} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
            <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
              Your plate
            </span>
            <span className="rounded-full bg-accent-green-soft px-3 py-1 text-xs font-semibold text-accent-green">
              Ready
            </span>
          </div>
        </div>
      </ScreenCard>

      <ScreenCard className="mt-4">
        <SectionEyebrow label={copy.choose} />
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
        <div className="mt-4 rounded-[22px] border border-border/60 bg-background px-4 py-4 text-sm leading-6 text-muted-foreground">
          {styleDescription}
        </div>
      </ScreenCard>

      <ScreenCard className="mt-4">
        <SectionEyebrow label={`${style} guide`} />
        <div className="space-y-3">
          {filteredSteps.map((item, index) => (
            <div key={item.id} className="rounded-[24px] border border-border/60 bg-card px-4 py-4 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft font-sans text-[16px] font-semibold text-primary">
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
        <SectionEyebrow label={copy.garnish} />
        <div className="flex flex-wrap gap-2">
          {guide.garnishSuggestions.map((item) => (
            <span key={item} className="rounded-full bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary-dark">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-[20px] border border-border/60 bg-background px-4 py-4">
          <div className="text-sm font-semibold text-foreground">{copy.photoTips}</div>
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
          label={copy.capture}
          subline={copy.captureSub}
          icon={Camera}
        />
      </div>
    </AppShell>
  );
}
