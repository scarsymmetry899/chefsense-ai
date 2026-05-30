'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CheckCheck, Share2 } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { BrandLogo } from '@/components/shell/brand-logo';
import { LanguageToggle } from '@/components/shell/language-toggle';
import { SearchBar } from '@/components/home/search-bar';
import { DishCard } from '@/components/home/dish-card';
import { MoodCard } from '@/components/home/mood-card';
import { RecentlyViewedItem } from '@/components/home/recently-viewed-item';
import { DishHeroCard } from '@/components/shared/dish-hero-card';
import { useLanguage } from '@/lib/i18n/language-context';
import { ROUTES } from '@/lib/constants/routes';
import {
  ALL_DISHES,
  FEATURED_DISH_ID,
  getDish,
  getDishOrThrow,
} from '@/lib/data/dishes';
import type { DictionaryKey } from '@/lib/i18n/dictionary';
import { getMostRecentInProgressDishId, getResumeStepForDish, hasInProgressDish } from '@/lib/cooking-session';
import { formatViewedAgo, getRecentlyViewedDishes, getShareActions } from '@/lib/user-state';

const MOOD_META = [
  { id: 'comfort', icon: 'soup', key: 'mood.comfort' as DictionaryKey },
  { id: 'quick', icon: 'zap', key: 'mood.quick' as DictionaryKey },
  { id: 'protein', icon: 'dumbbell', key: 'mood.protein' as DictionaryKey },
  { id: 'weekend', icon: 'star', key: 'mood.weekend' as DictionaryKey },
  { id: 'festive', icon: 'flame', key: 'mood.festive' as DictionaryKey },
] as const;

const HOME_COPY = {
  en: {
    eyebrow: 'Chef-guided Indian cooking',
    headline: 'Cook exactly like a chef, one clear step at a time.',
    subhead:
      'We compare trusted source styles, choose the strongest method, and guide you through every cue until the dish feels restaurant-ready.',
    chipOne: 'Source-backed recipe intelligence',
    chipTwo: 'Guided cues for every major stage',
    guidance: 'chef-guided detail inside',
    ingredients: 'Ingredients',
    recentEmpty: 'Your recently viewed dishes will appear here after you start exploring.',
    shareTitle: 'Share a dish guide',
    shareBody:
      'Send a dish card with time, ingredient access, and the app link so someone else can cook it with the same guided flow.',
    shareFoot: 'shared so far',
  },
  hi: {
    eyebrow: 'शेफ़-गाइडेड इंडियन कुकिंग',
    headline: 'हर डिश शेफ़ जैसी, एकदम साफ़ स्टेप्स के साथ।',
    subhead:
      'हम भरोसेमंद स्रोतों की तुलना करके सबसे सही तरीका चुनते हैं और हर क्यू के साथ आपको रेस्टोरेंट-स्टाइल रिज़ल्ट तक ले जाते हैं।',
    chipOne: 'सोर्स-बैक्ड रेसिपी इंटेलिजेंस',
    chipTwo: 'हर स्टेज के लिए गाइडेड क्यूज़',
    guidance: 'अंदर पूरी गाइडेड डिटेल',
    ingredients: 'इंग्रेडिएंट्स',
    recentEmpty: 'जैसे ही आप डिशेज़ देखना शुरू करेंगे, हाल ही में देखी गई डिशेज़ यहाँ दिखेंगी।',
    shareTitle: 'डिश गाइड शेयर करें',
    shareBody:
      'किसी और को भी वही गाइडेड कुकिंग फ्लो भेजें — समय, इंग्रेडिएंट्स और ऐप लिंक के साथ।',
    shareFoot: 'अब तक शेयर किए गए',
  },
  te: {
    eyebrow: 'చెఫ్-గైడెడ్ ఇండియన్ కుకింగ్',
    headline: 'ప్రతి డిష్ చెఫ్‌లా, స్పష్టమైన స్టెప్‌లతో.',
    subhead:
      'మేము విశ్వసనీయ సోర్సులను పోల్చి సరైన విధానాన్ని ఎంచుకుని, ప్రతి క్యూతో రెస్టారెంట్-స్టైల్ ఫలితం వచ్చే వరకు మీకు మార్గం చూపిస్తాము.',
    chipOne: 'సోర్స్-బ్యాక్డ్ రెసిపీ ఇంటెలిజెన్స్',
    chipTwo: 'ప్రతి దశకు గైడెడ్ క్యూస్',
    guidance: 'లోపల పూర్తి గైడెడ్ వివరాలు',
    ingredients: 'పదార్థాలు',
    recentEmpty: 'మీరు డిష్‌లను చూడటం మొదలుపెట్టిన తర్వాత, ఇటీవలి డిష్‌లు ఇక్కడ కనిపిస్తాయి.',
    shareTitle: 'డిష్ గైడ్‌ను షేర్ చేయండి',
    shareBody:
      'ఇతరులూ అదే గైడెడ్ ఫ్లోతో వండేందుకు టైమ్, ఇంగ్రిడియెంట్ యాక్సెస్, యాప్ లింక్‌తో కార్డ్ పంపండి.',
    shareFoot: 'ఇప్పటివరకు షేర్ చేసినవి',
  },
} as const;

export default function HomePage() {
  const { t, lang } = useLanguage();
  const featured = getDishOrThrow(FEATURED_DISH_ID);

  // Track the most-recently-cooked dish so we can surface it first in the carousel.
  const [inProgressDishId, setInProgressDishId] = useState<string | null>(null);

  const DEFAULT_SLIDES = useMemo(
    () => [
      featured,
      getDishOrThrow('dal-tadka'),
      getDishOrThrow('chicken-biryani'),
      getDishOrThrow('eggs-kejriwal'),
    ],
    [featured],
  );

  // Reorder slides: put the active in-progress dish at position 0.
  const heroSlides = useMemo(() => {
    if (!inProgressDishId) return DEFAULT_SLIDES;
    const inProgressDish = getDish(inProgressDishId);
    if (!inProgressDish) return DEFAULT_SLIDES;
    // Move it to the front; remove it from wherever it currently sits.
    const rest = DEFAULT_SLIDES.filter((d) => d.dishId !== inProgressDishId);
    return [inProgressDish, ...rest];
  }, [DEFAULT_SLIDES, inProgressDishId]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [resumeMap, setResumeMap] = useState<Record<string, number>>({});
  const [recentIds, setRecentIds] = useState<{ dishId: string; viewedAgo: string }[]>([]);
  const [shareCount, setShareCount] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const copy = HOME_COPY[lang];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedMood(params.get('mood'));
  }, []);

  useEffect(() => {
    const map = Object.fromEntries(
      ALL_DISHES.map((dish) => [dish.dishId, getResumeStepForDish(dish.dishId, 1)]),
    );
    setResumeMap(map);
    setRecentIds(
      getRecentlyViewedDishes()
        .map((entry) => ({
          dishId: entry.dishId,
          viewedAgo: formatViewedAgo(entry.viewedAt),
        }))
        .filter((entry) => getDish(entry.dishId)),
    );
    setShareCount(getShareActions().length);
    // Surface in-progress dish in carousel
    const inProgress = getMostRecentInProgressDishId();
    setInProgressDishId(inProgress);
    // Jump carousel to slide 0 (the in-progress dish will be there)
    if (inProgress) setActiveSlide(0);
  }, []);

  useEffect(() => {
    const node = carouselRef.current;
    if (!node) return undefined;

    function handleScroll() {
      const currentNode = carouselRef.current;
      if (!currentNode) return;
      const width = currentNode.clientWidth || 1;
      const nextIndex = Math.round(currentNode.scrollLeft / width);
      setActiveSlide(Math.max(0, Math.min(heroSlides.length - 1, nextIndex)));
    }

    node.addEventListener('scroll', handleScroll, { passive: true });
    return () => node.removeEventListener('scroll', handleScroll);
  }, [heroSlides.length]);

  const filteredDishes = useMemo(() => {
    if (!selectedMood) return ALL_DISHES;
    const moodLabel = MOOD_META.find((m) => m.id === selectedMood)?.key;
    if (!moodLabel) return ALL_DISHES;
    const label = t(moodLabel);
    return ALL_DISHES.filter((dish) => dish.mood.includes(label));
  }, [selectedMood, t]);

  const popular = [
    ...filteredDishes.filter((d) => d.dishId !== FEATURED_DISH_ID),
    ...(filteredDishes.some((d) => d.dishId === FEATURED_DISH_ID) ? [featured] : []),
  ].slice(0, 5);

  const recentlyViewed = recentIds
    .map((entry) => ({ dish: getDish(entry.dishId), viewedAgo: entry.viewedAgo }))
    .filter((entry): entry is { dish: NonNullable<typeof entry.dish>; viewedAgo: string } => Boolean(entry.dish))
    .slice(0, 2);

  function jumpToSlide(index: number) {
    const node = carouselRef.current;
    if (!node) return;
    node.scrollTo({ left: node.clientWidth * index, behavior: 'smooth' });
    setActiveSlide(index);
  }

  function getDishHref(dishId: string) {
    return hasInProgressDish(dishId)
      ? ROUTES.dishCook(dishId, resumeMap[dishId] ?? 1)
      : ROUTES.dish(dishId);
  }

  const activeFeaturedDish = heroSlides[activeSlide] ?? featured;

  const [shareToast, setShareToast] = useState(false);

  const handleShareDishGuide = useCallback(async () => {
    const dish = activeFeaturedDish;
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chefsense.app';

    // Build the top-5 ingredients string
    const ingredientLines = dish.ingredients
      .slice(0, 5)
      .map((ing) => `• ${ing.name}${ing.quantity ? ` — ${ing.quantity}` : ''}`)
      .join('\n');

    const moreCount = dish.ingredients.length - 5;

    const shareText = [
      `🍽️ I just cooked ${dish.dishName} with ChefSense AI!`,
      '',
      `It guides you exactly like a masterchef — step by step, with real timing cues, sensory checkpoints, and AI rescue tips if anything goes wrong. Not like any other recipe app.`,
      '',
      `📋 ${dish.dishName}`,
      `⏱ ${dish.totalTimeMin} min  •  🔥 ${dish.difficulty}  •  📍 ${dish.region}`,
      '',
      `Key ingredients:`,
      ingredientLines,
      moreCount > 0 ? `…and ${moreCount} more` : '',
      '',
      `✨ ${dish.summary}`,
      '',
      `Try it yourself — register on ChefSense AI and cook this dish with the same guided flow:`,
      appUrl,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${dish.dishName} — ChefSense AI`,
          text: shareText,
          url: appUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 3000);
      }
      setShareCount((c) => c + 1);
    } catch {
      // User cancelled share — silently ignore
    }
  }, [activeFeaturedDish]);

  return (
    <AppShell>
      <header className="flex items-center justify-between gap-3 pt-2 animate-fade-up">
        <Link href={ROUTES.home} className="min-w-0">
          <BrandLogo size="md" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle compact />
        </div>
      </header>

      <div className="pt-5 animate-fade-up">
        <SearchBar />
      </div>

      <div className="mt-4 rounded-[24px] border border-border/70 bg-card px-4 py-4 shadow-soft">
        <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-copper">
          {copy.eyebrow}
        </div>
        <div className="mt-2 font-serif text-[27px] leading-[1.02] text-foreground">
          {copy.headline}
        </div>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">
          {copy.subhead}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-primary-soft px-3 py-1.5 text-primary-dark">{copy.chipOne}</span>
          <span className="rounded-full bg-accent-green-soft px-3 py-1.5 text-accent-green">{copy.chipTwo}</span>
        </div>
      </div>

      <section className="pt-6 animate-fade-up">
        <div
          ref={carouselRef}
          className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide"
        >
          {heroSlides.map((dish) => (
            <div key={dish.dishId} className="w-full shrink-0 snap-center">
              <DishHeroCard
                dish={dish}
                featured
                variant="horizontal"
                showInlineCta
                href={getDishHref(dish.dishId)}
                ctaLabel={hasInProgressDish(dish.dishId) ? 'Resume Guided Cook' : undefined}
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          {heroSlides.map((dish, index) => (
            <button
              key={dish.dishId}
              type="button"
              aria-label={`Show ${dish.dishName}`}
              onClick={() => jumpToSlide(index)}
              className={index === activeSlide ? 'h-2.5 w-6 rounded-full bg-primary' : 'h-2.5 w-2.5 rounded-full bg-primary/25'}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-[22px] border border-border/70 bg-card px-4 py-3 shadow-soft">
          <div>
            <div className="text-sm font-semibold text-foreground">{activeFeaturedDish.dishName}</div>
            <div className="mt-1 text-xs text-muted-foreground">{`${activeFeaturedDish.totalTimeMin} min • ${copy.guidance}`}</div>
          </div>
          <Link
            href={ROUTES.dish(activeFeaturedDish.dishId)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-4 py-2 text-sm font-semibold text-primary"
          >
            {copy.ingredients}
            <BookOpen className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="pt-7 animate-fade-up">
        <SectionRow title={t('home.popular')} viewAllHref={ROUTES.dishes} />
        <div className="mt-3 -mx-5 overflow-x-auto scrollbar-hide px-5">
          <div className="flex gap-3 pb-2">
            {popular.map((dish) => (
              <DishCard key={dish.dishId} dish={dish} href={getDishHref(dish.dishId)} />
            ))}
          </div>
        </div>
      </section>

      <section className="pt-7 animate-fade-up">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-[19px] tracking-tight text-foreground">{t('home.mood')}</h2>
        </div>
        <div className="mt-3 flex flex-row items-stretch gap-2">
          {MOOD_META.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMood((current) => (current === m.id ? null : m.id))}
              className="min-w-0 flex-1"
            >
              <MoodCard
                label={t(m.key)}
                icon={m.icon}
                className={selectedMood === m.id ? 'ring-warm-focus' : undefined}
              />
            </button>
          ))}
        </div>
      </section>

      <section className="pt-7 animate-fade-up">
        <SectionRow title={t('home.recent')} viewAllHref={ROUTES.profile} />
        <div className="mt-3 flex flex-row gap-2.5">
          {recentlyViewed.length > 0 ? (
            recentlyViewed.map((entry, idx) => (
              <div key={`${entry.dish.dishId}-${idx}`} className="min-w-0 flex-1">
                <RecentlyViewedItem
                  dish={entry.dish}
                  viewedAgo={entry.viewedAgo}
                  href={getDishHref(entry.dish.dishId)}
                />
              </div>
            ))
          ) : (
            <div className="w-full rounded-2xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground shadow-soft">
              {copy.recentEmpty}
            </div>
          )}
        </div>
      </section>

      <section className="pt-7 pb-2 animate-fade-up">
        <button
          type="button"
          onClick={() => void handleShareDishGuide()}
          className="w-full text-left rounded-[22px] border border-dashed border-border/70 bg-card/40 px-4 py-4 transition-colors hover:bg-card/70 active:scale-[0.99]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-copper/85">
                {copy.shareTitle}
              </div>
              <div className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
                {copy.shareBody}
              </div>
              <div className="mt-2 text-[11.5px] font-medium text-primary">
                Sharing: {activeFeaturedDish.dishName}
              </div>
            </div>
            <span
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${shareToast ? 'bg-accent-green text-white' : 'bg-primary-soft/70 text-primary'}`}
            >
              {shareToast ? <CheckCheck className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            </span>
          </div>
          {shareToast ? (
            <div className="mt-2 text-[11.5px] font-medium text-accent-green">
              Copied to clipboard! Paste anywhere to share.
            </div>
          ) : shareCount > 0 ? (
            <div className="mt-2 text-[11.5px] text-muted-foreground">
              {shareCount} {copy.shareFoot}
            </div>
          ) : null}
        </button>
      </section>
    </AppShell>
  );
}

function SectionRow({
  title,
  viewAllHref,
}: {
  title: string;
  viewAllHref: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="font-serif text-[19px] tracking-tight text-foreground">{title}</h2>
      <Link
        href={viewAllHref}
        className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent-green hover:text-accent-green/80"
      >
        {t('home.viewAll')}
        <BookOpen className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
