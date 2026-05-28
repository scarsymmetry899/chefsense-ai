'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Thermometer, Leaf, ChevronRight, BookOpen, ChefHat, Sprout } from 'lucide-react';
import { motion, type PanInfo } from 'framer-motion';
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
  const [selectedDishId, setSelectedDishId] = useState(
    featuredDishes[0]?.dishId ?? 'paneer-butter-masala',
  );

  useEffect(() => {
    if (!isAuthed) {
      router.replace(`${ROUTES.login}?next=${encodeURIComponent(ROUTES.welcome)}`);
    }
  }, [isAuthed, router]);

  const selectedDish = getDishOrThrow(selectedDishId);
  const startHref = ROUTES.dish(selectedDish.dishId);

  if (!isAuthed) {
    return null;
  }

  const localizedDishes = featuredDishes.map((dish) => {
    const trans = getDishOrThrow(dish.dishId).translations as
      | { hi?: Record<string, string>; te?: Record<string, string> }
      | undefined;
    return {
      ...dish,
      localizedName: tx('dish.name', dish.dishName, trans?.[lang as 'hi' | 'te']),
    };
  });

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
        <h1 className="h-section px-2 text-balance">
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

        <p className="t-body-lg mx-auto mt-5 max-w-[340px] text-muted-foreground text-pretty">
          {t('app.subtitle')}
        </p>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 animate-fade-up">
        <FeaturePill icon={Thermometer} label="Chef-guided cues" accent="primary" />
        <FeaturePill icon={Leaf} label="Source-backed recipes" accent="green" />
      </div>

      <section className="mt-8 animate-fade-up">
        <CoverflowCarousel
          dishes={localizedDishes}
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

type CarouselDish = {
  dishId: string;
  dishName: string;
  localizedName: string;
  heroImage: string;
};

function CoverflowCarousel({
  dishes,
  selectedDishId,
  onSelect,
}: {
  dishes: CarouselDish[];
  selectedDishId: string;
  onSelect: (dishId: string) => void;
}) {
  const selectedIndex = Math.max(
    0,
    dishes.findIndex((dish) => dish.dishId === selectedDishId),
  );

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 60;
      if (info.offset.x < -threshold && selectedIndex < dishes.length - 1) {
        onSelect(dishes[selectedIndex + 1].dishId);
      } else if (info.offset.x > threshold && selectedIndex > 0) {
        onSelect(dishes[selectedIndex - 1].dishId);
      }
    },
    [dishes, onSelect, selectedIndex],
  );

  return (
    <div className="flex flex-col items-center">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className="relative mx-auto h-[320px] w-full max-w-[440px] touch-pan-y select-none"
        style={{ perspective: '1200px' }}
      >
        {dishes.map((dish, index) => {
          const offset = index - selectedIndex;
          const abs = Math.abs(offset);
          if (abs > 1) return null;

          const isCenter = offset === 0;
          const sign = offset === 0 ? 0 : offset > 0 ? 1 : -1;
          const translateX = sign * 132;
          const translateZ = isCenter ? 0 : -220;
          const rotateY = sign * -34;
          const scale = isCenter ? 1 : 0.82;

          return (
            <motion.div
              key={dish.dishId}
              className="absolute left-1/2 top-1/2"
              style={{
                transformStyle: 'preserve-3d',
                zIndex: 10 - abs,
                marginLeft: '-105px',
                marginTop: '-145px',
              }}
              initial={false}
              animate={{
                x: translateX,
                z: translateZ,
                rotateY,
                scale,
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            >
              <CarouselCard
                dish={dish}
                isCenter={isCenter}
                onSelect={() => onSelect(dish.dishId)}
              />
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {dishes.map((dish) => (
          <button
            key={dish.dishId}
            type="button"
            onClick={() => onSelect(dish.dishId)}
            className={cn(
              'h-2 rounded-full transition-all',
              dish.dishId === selectedDishId ? 'w-8 bg-primary' : 'w-2 bg-primary/25',
            )}
            aria-label={`Select ${dish.localizedName}`}
          />
        ))}
      </div>
    </div>
  );
}

function CarouselCard({
  dish,
  isCenter,
  onSelect,
}: {
  dish: CarouselDish;
  isCenter: boolean;
  onSelect: () => void;
}) {
  const cardInner = (
    <div className="relative h-[290px] w-[210px] overflow-hidden rounded-[28px] shadow-card ring-1 ring-black/5">
      <ImageWithFallback
        src={dish.heroImage}
        alt={dish.localizedName}
        gradient="spice"
        fallbackGlyph={'\u{1F35B}'}
        ratioClassName="h-full"
        rounded="none"
      />
      {isCenter ? (
        <>
          <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-copper shadow-soft">
            Featured
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-4 pt-12">
            <div className="font-serif text-[20px] font-semibold leading-tight text-white text-balance">
              {dish.localizedName}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/85">
              <ChefHat className="h-3 w-3" />
              <span>Tap to start cooking</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  if (isCenter) {
    return (
      <Link
        href={ROUTES.dish(dish.dishId)}
        draggable={false}
        className="block rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        aria-label={`Start cooking ${dish.localizedName}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {cardInner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="block rounded-[28px] opacity-55 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      aria-label={`Select ${dish.localizedName}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {cardInner}
    </button>
  );
}

function FooterMicrocopy({ className }: { className?: string }) {
  const { t } = useLanguage();
  const heart = '♥';
  const parts = t('app.madeFor').split(heart);

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2.5 text-xs text-muted-foreground',
        className,
      )}
    >
      <Sprout className="h-3.5 w-3.5 text-accent-green" aria-hidden />
      <span>
        {parts[0]}
        <span className="text-primary">{heart}</span>
        {parts[1] ?? ''}
      </span>
      <Sprout className="h-3.5 w-3.5 -scale-x-100 text-accent-green" aria-hidden />
    </div>
  );
}
