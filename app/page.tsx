'use client';

/**
 * ChefSense AI — Welcome screen at /.
 *
 * Match-reference layout:
 *   [centered logo + wordmark]
 *   [decorative leaf divider]
 *   [BIG centered serif headline with one emphasised word]
 *   [centered subtitle]
 *   [two feature pills, centered row]
 *   [food hero card]
 *   [primary CTA — Start Cooking]
 *   [secondary CTA — Explore Demo Dish]
 *   [leaves + ♥ footer]
 *
 * Mobile-first, no bottom nav (welcome is a one-shot intro).
 */

import Link from 'next/link';
import { Thermometer, Leaf, ChefHat, Soup, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { BrandLogo } from '@/components/shell/brand-logo';
import { LanguageToggle } from '@/components/shell/language-toggle';
import { FeaturePill } from '@/components/shared/feature-pill';
import { ImageWithFallback } from '@/components/shared/image-with-fallback';
import { useLanguage } from '@/lib/i18n/language-context';
import { ROUTES } from '@/lib/constants/routes';
import { getDishOrThrow, FEATURED_DISH_ID } from '@/lib/data/dishes';
import { cn } from '@/lib/utils';

export default function WelcomePage() {
  const { t, tx, lang } = useLanguage();
  const featured = getDishOrThrow(FEATURED_DISH_ID);
  const trans = featured.translations as
    | { hi?: Record<string, string>; te?: Record<string, string> }
    | undefined;
  const langMap = trans?.[lang as 'hi' | 'te'];
  const dishName = tx('dish.name', featured.dishName, langMap);

  return (
    <AppShell showBottomNav={false}>
      {/* Language toggle floats so it doesn't disrupt the centered brand block */}
      <div className="absolute right-5 top-4 z-10 animate-fade-up">
        <LanguageToggle compact />
      </div>

      {/* Centered brand */}
      <div className="flex flex-col items-center pt-8 animate-fade-up">
        <BrandLogo size="xl" stacked />
      </div>

      {/* Decorative divider */}
      <DecorativeDivider className="mt-6 animate-fade-up" />

      {/* Hero headline — template-rendered so emphasis word is per-language correct */}
      <section className="mt-7 text-center animate-fade-up">
        <h1 className="font-serif font-semibold text-[36px] leading-[1.06] tracking-tight text-foreground text-balance px-2">
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

        <p className="mt-4 text-[14.5px] leading-relaxed text-muted-foreground text-pretty mx-auto max-w-[340px]">
          {t('app.subtitle')}
        </p>
      </section>

      {/* Feature pills */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 animate-fade-up">
        <FeaturePill
          icon={Thermometer}
          label={t('welcome.featurePill.temp')}
          accent="primary"
        />
        <FeaturePill
          icon={Leaf}
          label={t('welcome.featurePill.intelligence')}
          accent="green"
        />
      </div>

      {/* Food hero photo */}
      <section className="mt-7 animate-fade-up">
        <FoodHeroIllustration
          dishName={dishName}
          heroImage={featured.heroImage}
        />
      </section>

      {/* CTAs */}
      <section className="mt-7 space-y-3 animate-fade-up">
        <Link href={ROUTES.home} className="block">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-full gradient-cta px-6 py-4 text-white shadow-cta active:scale-[0.99] transition-transform"
          >
            <span className="flex items-center gap-3">
              <ChefHat className="h-5 w-5" />
              <span className="text-[17px] font-semibold tracking-wide font-serif">
                {t('cta.startCooking')}
              </span>
            </span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </Link>

        <Link href={ROUTES.home} className="block">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-full border border-border bg-card px-6 py-3.5 text-foreground shadow-soft hover:bg-surface-warm active:scale-[0.99] transition-all"
          >
            <span className="flex items-center gap-3">
              <Soup className="h-5 w-5 text-copper" />
              <span className="text-[15px] font-semibold">
                {t('cta.exploreDemo')}
              </span>
            </span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </Link>
      </section>

      {/* Footer */}
      <FooterMicrocopy className="mt-9" />
    </AppShell>
  );
}

/* ────────────────────────────────────────────────────────────── */

/** Renders one line of the hero headline with an optional emphasis word in primary. */
function HeadlineLine({ pre, em, post }: { pre: string; em: string; post: string }) {
  return (
    <>
      {pre}
      {em && <span className="text-primary">{em}</span>}
      {post}
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

/** Big, photo-led hero card on the Welcome screen. */
function FoodHeroIllustration({
  dishName,
  heroImage,
}: {
  dishName: string;
  heroImage: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-border shadow-card">
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={heroImage}
          alt={dishName}
          gradient="spice"
          fallbackGlyph="🍛"
          ratioClassName="h-full"
          rounded="none"
        />
      </div>
      <div className="border-t border-border bg-card px-5 py-3 text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-copper">
          Featured Demo
        </div>
        <div className="mt-1 font-serif text-lg text-foreground">{dishName}</div>
      </div>
    </div>
  );
}

/** SVG illustration of a bowl with paneer butter masala — now imported from shared component. */

function FooterMicrocopy({ className }: { className?: string }) {
  const { t } = useLanguage();
  const parts = t('app.madeFor').split('♥');
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
        <span className="text-primary">♥</span>
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
