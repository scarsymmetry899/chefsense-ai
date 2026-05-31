'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CircleHelp,
  ChevronRight,
  Leaf,
  Scale,
  ShoppingBasket,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { VoiceChatPanel } from '@/components/cook/voice-chat-panel';
import { Header } from '@/components/shell/header';
import {
  DishVisual,
  MetricTile,
  ProgressBar,
  ScreenCard,
  SectionEyebrow,
  StatusPill,
} from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';
import { getBaseServings, getToolReference, scaleQuantity } from '@/lib/dish-flow';
import { useLanguage } from '@/lib/i18n/language-context';
import { useLocalizedDishView } from '@/lib/i18n/use-localized-dish';
import { TT } from '@/components/shared/translated';
import { playSoundEffect } from '@/lib/sound-effects';
import { getResumeStepForDish, hasInProgressDish } from '@/lib/cooking-session';
import { recordRecentlyViewedDish } from '@/lib/user-state';

const STORAGE_PREFIX = 'chefsense.ingredients.';
const SERVING_OPTIONS = [1, 2, 4, 6];

type IngredientState = {
  servings: number;
  checked: string[];
};

export default function DishPage() {
  const params = useParams<{ id: string }>();
  const dish = getDishOrThrow(params.id);
  const { lang } = useLanguage();
  const localized = useLocalizedDishView(dish);
  const localizedIngredientById = useMemo(() => {
    return new Map(localized.ingredients.map((item) => [item.id, item]));
  }, [localized.ingredients]);
  const localizedToolById = useMemo(() => {
    return new Map(localized.tools.map((item) => [item.id, item.name]));
  }, [localized.tools]);

  const baseServings = useMemo(() => getBaseServings(dish.serves), [dish.serves]);
  const storageKey = `${STORAGE_PREFIX}${dish.dishId}`;

  const [servings, setServings] = useState(baseServings);
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    recordRecentlyViewedDish(dish.dishId);
  }, [dish.dishId]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<IngredientState>;
      if (typeof parsed.servings === 'number') setServings(parsed.servings);
      if (Array.isArray(parsed.checked)) setChecked(parsed.checked);
    } catch {
      // Ignore malformed saved state.
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ servings, checked } satisfies IngredientState),
      );
    } catch {
      // Ignore storage write failures.
    }
  }, [checked, servings, storageKey]);

  const checkedSet = useMemo(() => new Set(checked), [checked]);
  const progress = Math.round((checked.length / dish.ingredients.length) * 100);
  const allChecked = checked.length === dish.ingredients.length;
  const ingredientTitle = copyForLang(lang, {
    en: 'Ingredient Checklist',
    hi: 'सामग्री चेकलिस्ट',
    te: 'పదార్థాల చెక్‌లిస్ట్',
  });
  const setupLabel = copyForLang(lang, {
    en: 'Before you start cooking',
    hi: 'पकाना शुरू करने से पहले',
    te: 'వంట మొదలుపెట్టే ముందు',
  });
  const setupBody = copyForLang(lang, {
    en: 'Check off what you have, then set how many people you are cooking for. We will tune the visible ingredient quantities for that serving size.',
    hi: 'जो सामग्री आपके पास है उसे टिक करें, फिर बताइए आप कितने लोगों के लिए बना रहे हैं। हम उसी हिसाब से मात्रा दिखाएँगे।',
    te: 'మీ దగ్గర ఉన్న పదార్థాలను టిక్ చేయండి. తర్వాత ఎన్ని మందికి వండుతున్నారో ఎంచుకోండి. దానికి అనుగుణంగా పరిమాణాలు చూపిస్తాము.',
  });
  const resumeStep = getResumeStepForDish(dish.dishId, 1);
  const hasProgress = hasInProgressDish(dish.dishId);
  const [voiceOpen, setVoiceOpen] = useState(false);

  return (
    <AppShell className="pb-32">
      <Header backHref={ROUTES.home} />

      <ScreenCard className="overflow-hidden p-0">
        <div className="grid gap-0 md:grid-cols-[1fr_1.05fr]">
          <DishVisual
            src={dish.heroImage}
            alt={localized.dishName}
            className="h-[220px] rounded-none border-0 md:h-full"
          />
          <div className="p-5">
            <SectionEyebrow label={setupLabel} />
            <h1 className="h-section">{localized.dishName}</h1>
            <p className="mt-3 t-body-lg text-muted-foreground">{setupBody}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill label={<>{servings} {servings === 1 ? <TT>person</TT> : <TT>people</TT>}</>} />
              <StatusPill label={<>{checked.length}/{dish.ingredients.length} <TT>ready</TT></>} tone="green" />
            </div>
          </div>
        </div>

        <div className="border-t border-border/70 px-5 py-5">
          <div className="flex items-center justify-between gap-3 t-body-lg">
            <span className="font-medium text-foreground">{ingredientTitle}</span>
            <span className="text-muted-foreground">{progress}% <TT>ready</TT></span>
          </div>
          <ProgressBar value={progress} className="mt-4" />
        </div>
      </ScreenCard>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <MetricTile icon={Users} title={<TT>Servings</TT>} value={`${servings}`} detail={<TT>Selected for this cook</TT>} />
        <MetricTile icon={ShoppingBasket} title={<TT>Ingredients</TT>} value={`${dish.ingredients.length}`} detail={<TT>Checklist items</TT>} />
        <MetricTile icon={UtensilsCrossed} title={<TT>Tools</TT>} value={`${dish.tools.length}`} detail={<TT>To keep ready</TT>} />
      </div>

      <ScreenCard className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <SectionEyebrow icon={Scale} label={<TT>Serving Size</TT>} className="mb-1" />
            <h2 className="h-card"><TT>How many people are you cooking for?</TT></h2>
          </div>
          <StatusPill label={<>{servings} {servings === 1 ? <TT>person</TT> : <TT>people</TT>}</>} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {SERVING_OPTIONS.map((option) => {
            const active = option === servings;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  playSoundEffect('tap');
                  setServings(option);
                }}
                className={
                  active
                    ? 'rounded-full border border-primary/20 gradient-cta px-5 py-2.5 text-sm font-semibold text-white shadow-cta'
                    : 'rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground'
                }
              >
                {option} {option === 1 ? <TT>person</TT> : <TT>people</TT>}
              </button>
            );
          })}
        </div>
      </ScreenCard>

      <ScreenCard className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <SectionEyebrow icon={Leaf} label={<TT>What you need</TT>} className="mb-1" />
            <h2 className="h-card">{ingredientTitle}</h2>
          </div>
          <Link href={ROUTES.dishSources(dish.dishId)} className="text-sm font-semibold text-accent-green">
            <TT>Source-backed plan</TT>
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {dish.ingredients.map((ingredient) => {
            const isChecked = checkedSet.has(ingredient.id);
            const scaledQuantity = scaleQuantity(ingredient.quantity, servings, baseServings);
            const localizedIngredient = localizedIngredientById.get(ingredient.id);
            const displayName = localizedIngredient?.name ?? ingredient.name;
            const displayNote = localizedIngredient?.note ?? ingredient.note;
            return (
              <button
                key={ingredient.id}
                type="button"
                onClick={() => {
                  playSoundEffect(isChecked ? 'tap' : 'check');
                  setChecked((current) =>
                    current.includes(ingredient.id)
                      ? current.filter((item) => item !== ingredient.id)
                      : [...current, ingredient.id],
                  );
                }}
                className="flex w-full items-start gap-3 rounded-[22px] border border-border/60 bg-card px-4 py-3 text-left transition-transform active:scale-[0.995]"
              >
                <span
                  className={
                    isChecked
                      ? 'mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-green text-white'
                      : 'mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-transparent'
                  }
                >
                  ✓
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <span className={isChecked ? 'text-base text-muted-foreground line-through' : 'text-base text-foreground'}>
                      {displayName}
                    </span>
                    <span className="shrink-0 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-dark">
                      {scaledQuantity}
                    </span>
                  </div>
                  {displayNote ? (
                    <div className="mt-1 text-sm leading-6 text-muted-foreground">{displayNote}</div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </ScreenCard>

      <ScreenCard className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <SectionEyebrow icon={UtensilsCrossed} label={<TT>Tools checklist</TT>} className="mb-1" />
            <h2 className="h-card"><TT>Pans and equipment for this dish</TT></h2>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {dish.tools.map((tool) => {
            const ref = getToolReference(tool.name);
            const displayName = localizedToolById.get(tool.id) ?? tool.name;
            return (
              <div key={tool.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-foreground shadow-soft">
                <span>{displayName}</span>
                <a
                  href={tool.infoUrl ?? ref.infoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-primary"
                  aria-label={`Learn more about ${displayName}`}
                >
                  <CircleHelp className="h-3.5 w-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </ScreenCard>

      <div className="mt-6">
        <Link
          href={hasProgress ? ROUTES.dishCook(dish.dishId, resumeStep) : ROUTES.dishMiseEnPlace(dish.dishId)}
          className="flex w-full items-center justify-between rounded-[26px] gradient-cta px-6 py-4 text-white shadow-cta transition-transform active:scale-[0.985]"
        >
          <span className="flex items-center gap-3">
            <ShoppingBasket className="h-6 w-6" />
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-[20px]">
                {hasProgress
                  ? <TT>{`Resume from Step ${resumeStep}`}</TT>
                  : allChecked
                    ? <TT>Start Kitchen Prep</TT>
                    : <TT>Continue to Kitchen Prep</TT>}
              </span>
              <span className="text-sm text-white/90">
                {hasProgress
                  ? <TT>Your timer and progress are still saved.</TT>
                  : allChecked
                    ? <TT>Everything is in place for the next step.</TT>
                    : <TT>You can still update this checklist anytime.</TT>}
              </span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      {/* Voice & Chat — Ingredients & Prep Mode */}
      <div className="mt-6 pb-4">
        <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-card px-4 py-3 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span>🎤</span>
            <span>Voice & Chat — Ingredients & Prep</span>
          </div>
          <button
            type="button"
            onClick={() => setVoiceOpen((v) => !v)}
            className="rounded-full border border-primary/25 px-4 py-2 text-sm font-semibold text-primary"
          >
            {voiceOpen ? 'Close' : 'Open'}
          </button>
        </div>
        <VoiceChatPanel
          dishId={dish.dishId}
          stepIndex={0}
          stepTitle="Ingredients & Kitchen Prep"
          primer={[
            `You're preparing to cook ${dish.dishName} (${dish.region}, ${dish.difficulty}). ${dish.summary}`,
            `\nIngredients needed (${dish.ingredients.length} total):\n${dish.ingredients.map(i => `• ${i.name}: ${i.quantity}${i.note ? ` — ${i.note}` : ''}`).join('\n')}`,
            dish.tools.length ? `\nKitchen tools required:\n${dish.tools.map(t => `• ${t.name}${t.note ? ` — ${t.note}` : ''}`).join('\n')}` : '',
            dish.miseEnPlace?.length ? `\nPrep checklist:\n${dish.miseEnPlace.map(m => `• ${m.label}`).join('\n')}` : '',
            `\nTotal time: ${dish.totalTimeMin} min | Serves: ${dish.plating.serves}`,
          ].filter(Boolean).join('\n')}
          expanded={voiceOpen}
          collapsedHint="Ask about ingredients, quantities, tools, or prep tips."
          expandedHint="Ask me anything about the ingredients, tools, or prep for this dish."
          helperHint="Ask about substitutions, quantities, equipment alternatives, or how to prepare ingredients."
          placeholder="Ask about ingredients or kitchen prep..."
        />
      </div>
    </AppShell>
  );
}

function copyForLang(
  lang: 'en' | 'hi' | 'te',
  copy: Record<'en' | 'hi' | 'te', string>,
) {
  return copy[lang] ?? copy.en;
}
