'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Bell,
  Citrus,
  Flame,
  Info,
  Leaf,
  Loader2,
  Sparkles,
  Wheat,
} from 'lucide-react';
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
import { getStoredCookingSession, getTotalCookingMinutes } from '@/lib/cooking-session';
import { recordCompletedDish } from '@/lib/user-state';

type AxisKey = 'salt' | 'acid' | 'richness' | 'heat' | 'aroma';
type SelfRating = 'low' | 'right' | 'high';

const AXIS_META: Record<AxisKey, { icon: typeof Sparkles; label: string }> = {
  salt: { icon: Sparkles, label: 'Salt' },
  acid: { icon: Citrus, label: 'Acid' },
  richness: { icon: Wheat, label: 'Richness' },
  heat: { icon: Flame, label: 'Heat' },
  aroma: { icon: Leaf, label: 'Aroma' },
};

type ExplainResponse = {
  ok: boolean;
  source?: 'openai' | 'fallback';
  guide?: string;
  justRightHint?: string;
  quickFix?: string;
  warning?: string;
  error?: string;
};

function ScoreGauge({
  score,
  size = 168,
  stroke = 14,
  label,
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 135;
  const endAngle = 45;
  const sweep = 360 - (startAngle - endAngle); // 270
  const arcLength = (sweep / 360) * 2 * Math.PI * radius;
  const dashOffset = arcLength * (1 - clamped / 100);

  function polar(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }
  const start = polar(startAngle);
  const end = polar(endAngle);
  const largeArc = sweep > 180 ? 1 : 0;
  const arcPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <linearGradient id={`finish-gauge-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary-dark))" />
          </linearGradient>
        </defs>
        <path
          d={arcPath}
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.18)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={arcPath}
          fill="none"
          stroke={`url(#finish-gauge-gradient-${size})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-sans text-[44px] font-semibold leading-none tracking-[-0.05em] text-foreground tabular-nums">
          {clamped}
        </div>
        {label ? (
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function adjustForRating(value: number, rating: SelfRating | undefined) {
  if (!rating) return value;
  if (rating === 'low') return Math.max(value - 15, 30);
  if (rating === 'high') return Math.min(value + 15, 100);
  return value;
}

export default function DishFinishPage() {
  const params = useParams<{ id: string }>();
  const { t, lang } = useLanguage();
  const dish = getDishOrThrow(params.id);
  const [selectedTouches, setSelectedTouches] = useState<string[]>([]);
  const [selfRatings, setSelfRatings] = useState<Partial<Record<AxisKey, SelfRating>>>({});
  const [openAxis, setOpenAxis] = useState<AxisKey | null>(null);
  const [explainCache, setExplainCache] = useState<
    Record<string, { loading: boolean; data?: ExplainResponse }>
  >({});

  const copy = {
    en: {
      almostReady: 'Almost ready',
      added: 'Added',
      plate: 'Plate Like a Chef',
      plateSub: 'Turn your dish into a restaurant-style presentation.',
      share: 'Share My Plate',
      shareSub: 'Upload the final plate, rate it, and grab a premium caption.',
      overall: 'Overall balance',
      chefScore: 'ChefSense',
      yourScore: 'Your taste',
      ratePrompt: 'How did it actually taste?',
      tooLow: 'Too low',
      justRight: 'Just right',
      tooHigh: 'Too high',
      checking: `ChefSense is checking how to taste this for ${dish.dishName}…`,
      howTaste: 'How to taste',
      justRightLabel: 'Just right',
      quickFix: 'Quick fix',
    },
    hi: {
      almostReady: 'Almost ready',
      added: 'Added',
      plate: 'Plate Like a Chef',
      plateSub: 'अपनी डिश को रेस्टोरेंट-स्टाइल प्रेज़ेंटेशन दें।',
      share: 'Share My Plate',
      shareSub: 'फाइनल प्लेट अपलोड करें, रेट करें और एक प्रीमियम कैप्शन लें।',
      overall: 'कुल संतुलन',
      chefScore: 'ChefSense',
      yourScore: 'आपका स्वाद',
      ratePrompt: 'असल में कैसा लगा?',
      tooLow: 'कम है',
      justRight: 'सही है',
      tooHigh: 'ज़्यादा है',
      checking: `ChefSense ${dish.dishName} के लिए जाँच रहा है…`,
      howTaste: 'कैसे चखें',
      justRightLabel: 'सही स्वाद',
      quickFix: 'झटपट सुधार',
    },
    te: {
      almostReady: 'Almost ready',
      added: 'Added',
      plate: 'Plate Like a Chef',
      plateSub: 'మీ డిష్‌ను రెస్టారెంట్-స్టైల్ ప్రెజెంటేషన్‌గా మార్చండి.',
      share: 'Share My Plate',
      shareSub: 'ఫైనల్ ప్లేట్‌ను అప్‌లోడ్ చేసి, రేట్ చేసి, ప్రీమియం క్యాప్షన్ పొందండి.',
      overall: 'మొత్తం సమతుల్యత',
      chefScore: 'ChefSense',
      yourScore: 'మీ రుచి',
      ratePrompt: 'నిజంగా ఎలా ఉంది?',
      tooLow: 'తక్కువ',
      justRight: 'సరిగ్గా',
      tooHigh: 'ఎక్కువ',
      checking: `ChefSense ${dish.dishName} కోసం చూస్తోంది…`,
      howTaste: 'ఎలా రుచి చూడాలి',
      justRightLabel: 'సరైన రుచి',
      quickFix: 'తక్షణ పరిష్కారం',
    },
  }[lang];

  const balanceAxes = useMemo(() => {
    const added = new Set(selectedTouches);
    return dish.tasteBalancing.map((axis) => {
      let bonus = 0;
      if (axis.axis === 'richness' && added.has('butter-knob')) bonus += 5;
      if (axis.axis === 'aroma' && added.has('crush-kasuri')) bonus += 6;
      if (axis.axis === 'salt' && added.has('adjust-salt')) bonus += 4;
      if (axis.axis === 'richness' && added.has('cream-swirl')) bonus += 4;
      if (axis.axis === 'heat' && added.has('chilli-oil')) bonus += 3;
      const base = Math.min(100, axis.value + bonus);
      const adjusted = adjustForRating(base, selfRatings[axis.axis as AxisKey]);
      return {
        axis: axis.axis as AxisKey,
        base,
        value: adjusted,
      };
    });
  }, [dish.tasteBalancing, selectedTouches, selfRatings]);

  const chefBalance = useMemo(
    () => Math.round(balanceAxes.reduce((sum, axis) => sum + axis.base, 0) / balanceAxes.length),
    [balanceAxes],
  );
  const overallBalance = useMemo(
    () => Math.round(balanceAxes.reduce((sum, axis) => sum + axis.value, 0) / balanceAxes.length),
    [balanceAxes],
  );
  const hasUserRated = Object.keys(selfRatings).length > 0;

  useEffect(() => {
    const stored = getStoredCookingSession(dish.dishId);
    if (!stored?.finishedAt) return;
    recordCompletedDish({
      dishId: dish.dishId,
      finishedAt: stored.finishedAt,
      minutes: getTotalCookingMinutes(dish.dishId),
      score: overallBalance,
      summary: 'Completed the full guided flow and reached the finish stage.',
    });
  }, [dish.dishId, overallBalance]);

  const balanceLabel = useMemo(() => {
    if (selectedTouches.length >= 3) return t('finish.veryWellBalanced');
    return copy.almostReady;
  }, [copy.almostReady, selectedTouches.length, t]);

  async function ensureExplain(axis: AxisKey) {
    const key = `${dish.dishId}:${axis}:${lang}`;
    if (explainCache[key]?.data || explainCache[key]?.loading) return;
    setExplainCache((current) => ({ ...current, [key]: { loading: true } }));
    try {
      const response = await fetch('/api/explain-axis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishId: dish.dishId, axis, locale: lang }),
      });
      const data = (await response.json()) as ExplainResponse;
      setExplainCache((current) => ({ ...current, [key]: { loading: false, data } }));
    } catch {
      setExplainCache((current) => ({
        ...current,
        [key]: {
          loading: false,
          data: { ok: false, error: 'network_error' },
        },
      }));
    }
  }

  function handleToggleInfo(axis: AxisKey) {
    setOpenAxis((current) => (current === axis ? null : axis));
    void ensureExplain(axis);
  }

  const openKey = openAxis ? `${dish.dishId}:${openAxis}:${lang}` : null;
  const openEntry = openKey ? explainCache[openKey] : undefined;

  return (
    <AppShell className="pb-32">
      <Header
        backHref={ROUTES.dishCook(dish.dishId, dish.cookingSteps[dish.cookingSteps.length - 1]?.index ?? 1)}
        actions={[{ icon: Bell, label: 'Alerts' }]}
      />

      <section className="text-center">
        <h1 className="text-[40px] leading-none">{t('finish.title')}</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
          {t('finish.subtitle')}
        </p>
      </section>

      <ScreenCard className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow label={t('finish.balanceMeter')} className="mb-0" />
          <StatusPill label={balanceLabel} />
        </div>

        <div className="mt-4 flex flex-col items-center">
          <ScoreGauge score={overallBalance} label={copy.overall} />
          {hasUserRated ? (
            <div className="mt-3 flex items-center gap-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {copy.yourScore} {overallBalance}%
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                {copy.chefScore} {chefBalance}%
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {balanceAxes.map((axis) => {
            const meta = AXIS_META[axis.axis];
            const Icon = meta.icon;
            const isOpen = openAxis === axis.axis;
            return (
              <div key={axis.axis} className="flex flex-col items-center text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-[4px] border-secondary bg-white shadow-soft">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <span className="text-[12px] font-medium text-foreground">{meta.label}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleInfo(axis.axis)}
                    aria-label={`How to taste ${meta.label}`}
                    aria-expanded={isOpen}
                    className={
                      isOpen
                        ? 'inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white'
                        : 'inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground'
                    }
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-0.5 font-sans text-[20px] font-semibold leading-none tracking-[-0.04em] text-foreground tabular-nums">
                  {axis.value}%
                </div>
              </div>
            );
          })}
        </div>

        {openAxis ? (
          <div className="mt-4 rounded-[20px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(254,245,236,0.96))] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-primary">
                {AXIS_META[openAxis].label} · {copy.howTaste}
              </div>
              <button
                type="button"
                onClick={() => setOpenAxis(null)}
                className="text-xs font-medium text-muted-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {openEntry?.loading ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                {copy.checking}
              </div>
            ) : openEntry?.data?.ok ? (
              <div className="mt-3 space-y-3 text-sm leading-6 text-foreground">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {copy.howTaste}
                  </div>
                  <div className="mt-1">{openEntry.data.guide}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {copy.justRightLabel}
                  </div>
                  <div className="mt-1">{openEntry.data.justRightHint}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {copy.quickFix}
                  </div>
                  <div className="mt-1">{openEntry.data.quickFix}</div>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-muted-foreground">
                Could not load guidance. Try again in a moment.
              </div>
            )}

            <div className="mt-4 border-t border-border/60 pt-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {copy.ratePrompt}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(['low', 'right', 'high'] as const).map((option) => {
                  const active = selfRatings[openAxis] === option;
                  const optionLabel =
                    option === 'low' ? copy.tooLow : option === 'right' ? copy.justRight : copy.tooHigh;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setSelfRatings((current) => {
                          const next = { ...current };
                          if (next[openAxis] === option) {
                            delete next[openAxis];
                          } else {
                            next[openAxis] = option;
                          }
                          return next;
                        })
                      }
                      className={
                        active
                          ? 'rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white shadow-cta'
                          : 'rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground'
                      }
                    >
                      {optionLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
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
