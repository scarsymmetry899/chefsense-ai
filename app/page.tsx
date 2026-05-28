'use client';

import Link from 'next/link';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Thermometer, Leaf, ChevronRight, BookOpen, ChefHat } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { BrandLogo } from '@/components/shell/brand-logo';
import { LanguageToggle } from '@/components/shell/language-toggle';
import { FeaturePill } from '@/components/shared/feature-pill';
import { ImageWithFallback } from '@/components/shared/image-with-fallback';
import { useLanguage } from '@/lib/i18n/language-context';
import { ROUTES } from '@/lib/constants/routes';
import { getDishOrThrow, listDishSummaries } from '@/lib/data/dishes';
import { hasAuthSession } from '@/lib/auth/browser';
import { cn } from '@/lib/utils';

export default function WelcomePage() {
  const router = useRouter();
  const { t, tx, lang } = useLanguage();
  const isAuthed = hasAuthSession();
  const featuredDishes = useMemo(() => listDishSummaries().slice(0, 3), []);
  const [selectedDishId, setSelectedDishId] = useState(featuredDishes[0]?.dishId ?? 'paneer-butter-masala');

  useEffect(() => {
    if (!isAuthed) {
      router.replace(`${ROUTES.login}?next=${encodeURIComponent(ROUTES.welcome)}`);
    }
  }, [isAuthed, router]);

  const selectedDish = getDishOrThrow(selectedDishId);
  const trans = selectedDish.translations as
    | { hi?: Record<string, string>; te?: Record<string, string> }
    | undefined;
  const langMap = trans?.[lang as 'hi' | 'te'];
  const dishName = tx('dish.name', selectedDish.dishName, langMap);
  const startHref = ROUTES.dish(selectedDish.dishId);

  if (!isAuthed) {
    return null;
  }

  return (
    <AppShell showBottomNav={false}>
      <div className="absolute right-5 top-4 z-10 animate-fade-up">
        <LanguageToggle compact />
      </div>

      <div className="flex flex-col items-center pt-8 animate-fade-up">
        <BrandLogo size="xl" stacked />
      </div>

      <DecorativeDivider className="mt-6 animate-fade-up" />

      <section className="mt-7 text-center animate-fade-up">
        <h1 className="font-serif text-[40px] font-bold leading-[0.98] tracking-[-0.04em] text-foreground text-balance px-2 sm:text-[44px]">
          <HeadlineLine
            pre={t('app.headline.line1Pre')}
            em={t('app.headline.line1Em')}
            post={t('app.headline.line1Post')}
          />
          <br />
          <HeadlineLine
            pre={t('app.headline.line2Pre')}
            em={t('app.headline.line2Em')}
            post={t('app.headline.line2Post')}
          />
        </h1>

        <p className="mx-auto mt-4 max-w-[340px] text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
          {t('app.subtitle')}
        </p>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 animate-fade-up">
        <FeaturePill
          icon={Thermometer}
          label="Chef-guided cues"
          accent="primary"
        />
        <FeaturePill
          icon={Leaf}
          label="Source-backed recipes"
          accent="green"
        />
      </div>

      <section className="mt-7 animate-fade-up">
        <FoodHeroIllustration
          dishes={featuredDishes.map((dish) => ({
            ...dish,
            localizedName:
              tx(
                'dish.name',
                dish.dishName,
                (getDishOrThrow(dish.dishId).translations as
                  | { hi?: Record<string, string>; te?: Record<string, string> }
                  | undefined)?.[lang as 'hi' | 'te'],
              ),
          }))}
          selectedDishId={selectedDish.dishId}
          onSelect={setSelectedDishId}
        />
      </section>

      <section className="mt-7 flex flex-col items-center gap-3 animate-fade-up">
        <Link href={startHref} className="inline-flex w-full max-w-[320px]">
          <button
            type="button"
            className="inline-flex w-full items-center justify-between rounded-[26px] gradient-cta px-6 py-4 text-white shadow-cta transition-transform active:scale-95"
          >
            <span className="flex flex-1 items-center justify-center gap-2 font-serif text-[18px]">
              <ChefHat className="h-5 w-5" />
              {t('cta.startCooking')}
            </span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </Link>

        <Link href={ROUTES.home} className="inline-flex w-full max-w-[320px]">
          <button
            type="button"
            className="inline-flex w-full items-center justify-between rounded-[26px] border border-border/70 bg-card px-6 py-4 text-[16px] font-medium text-foreground shadow-soft transition-transform hover:bg-surface-warm active:scale-95"
          >
            <span className="flex flex-1 items-center justify-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Browse Dish Guides
            </span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </Link>
      </section>

      <FooterMicrocopy className="mt-9" />
    </AppShell>
  );
}

function HeadlineLine({ pre, em, post }: { pre: string; em: string; post: string }) {
  const parts = [
    pre ? { type: 'text' as const, value: pre } : null,
    em ? { type: 'em' as const, value: em } : null,
    post ? { type: 'text' as const, value: post } : null,
  ].filter(Boolean) as { type: 'text' | 'em'; value: string }[];

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={`${part.type}-${index}`}>
          {index > 0 ? ' ' : null}
          {part.type === 'em' ? (
            <span className="text-primary">{part.value}</span>
          ) : (
            part.value
          )}
        </Fragment>
      ))}
    </>
  );
}

function DecorativeDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex items-center justify-center gap-3 text-copper/60', className)}
      aria-hidden
    >
      <span className="h-px w-20 bg-current opacity-50" />
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 1c2 3 5 4 7 6-2 2-5 3-7 6-2-3-5-4-7-6 2-2 5-3 7-6z"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.7"
        />
        <circle cx="9" cy="9" r="1.5" fill="currentColor" opacity="0.5" />
      </svg>
      <span className="h-px w-20 bg-current opacity-50" />
    </div>
  );
}

function FoodHeroIllustration({
  dishes,
  selectedDishId,
  onSelect,
}: {
  dishes: Array<{
    dishId: string;
    dishName: string;
    localizedName: string;
    heroImage: string;
  }>;
  selectedDishId: string;
  onSelect: (dishId: string) => void;
}) {
  const selectedIndex = Math.max(
    0,
    dishes.findIndex((dish) => dish.dishId === selectedDishId),
  );

  return (
    <div className="relative h-[360px]">
      {dishes.map((dish, index) => {
        const offset = index - selectedIndex;
        const isSelected = dish.dishId === selectedDishId;
        const translateX = offset * 34;
        const scale = isSelected ? 1 : 0.94;
        const opacity = Math.abs(offset) > 1 ? 0 : 1;

        return (
          <button
            key={dish.dishId}
            type="button"
            onClick={() => onSelect(dish.dishId)}
            className="absolute inset-x-0 top-0 mx-auto w-[90%] text-left transition-all duration-300"
            style={{
              transform: `translateX(${translateX}px) scale(${scale})`,
              zIndex: 10 - Math.abs(offset),
              opacity,
            }}
          >
            <div className="card-warm paper-panel relative overflow-hidden rounded-[32px] shadow-card">
              <div className="absolute left-4 top-4 z-20 rounded-full bg-card/95 px-3 py-1 text-[11px] font-semibold text-copper shadow-soft">
                Featured
              </div>

              <div className="relative h-[320px] overflow-hidden">
                <ImageWithFallback
                  src={dish.heroImage}
                  alt={dish.localizedName}
                  gradient="spice"
                  fallbackGlyph={'\u{1F35B}'}
                  ratioClassName="h-full"
                  rounded="none"
                />

                <div className="absolute inset-y-4 left-4 z-10 flex w-[42%] max-w-[165px] flex-col justify-end rounded-[28px] bg-card/90 px-4 py-5 shadow-soft backdrop-blur-sm">
                  <div className="font-serif text-[20px] font-semibold leading-[0.95] text-foreground">
                    {dish.localizedName}
                  </div>
                  {isSelected ? (
                    <div className="mt-4 text-xs font-medium text-primary">Swipe or tap to choose</div>
                  ) : (
                    <div className="mt-4 text-xs font-medium text-muted-foreground">Available guide</div>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2">
        {dishes.map((dish) => (
          <button
            key={dish.dishId}
            type="button"
            onClick={() => onSelect(dish.dishId)}
            className={cn(
              'h-2.5 rounded-full transition-all',
              dish.dishId === selectedDishId ? 'w-8 bg-primary' : 'w-2.5 bg-primary/25',
            )}
            aria-label={`Select ${dish.localizedName}`}
          />
        ))}
      </div>
    </div>
  );
}

function FooterMicrocopy({ className }: { className?: string }) {
  const { t } = useLanguage();
  const heart = '\u2665';
  const parts = t('app.madeFor').split(heart);

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2.5 text-xs text-muted-foreground',
        className,
      )}
    >
      <span className="inline-block text-accent-green" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 13c0-5 4-9 9-11-1 7-4 11-9 11z" opacity="0.85" />
          <path d="M2 13l5-5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" fill="none" />
        </svg>
      </span>
      <span>
        {parts[0]}
        <span className="text-primary">{heart}</span>
        {parts[1] ?? ''}
      </span>
      <span className="inline-block scale-x-[-1] text-accent-green" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 13c0-5 4-9 9-11-1 7-4 11-9 11z" opacity="0.85" />
          <path d="M2 13l5-5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" fill="none" />
        </svg>
      </span>
    </div>
  );
}
