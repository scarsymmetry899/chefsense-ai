'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, Clock3, PlugZap, Soup, UtensilsCrossed } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
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
import { formatCountdown } from '@/lib/dish-flow';
import { useLanguage } from '@/lib/i18n/language-context';

const STORAGE_PREFIX = 'chefsense.prep.';

type PrepState = {
  checked: string[];
  startedAt: number | null;
  elapsedBeforePause: number;
  running: boolean;
};

export default function DishMiseEnPlacePage() {
  const params = useParams<{ id: string }>();
  const dish = getDishOrThrow(params.id);
  const { lang } = useLanguage();
  const storageKey = `${STORAGE_PREFIX}${dish.dishId}`;

  const [checked, setChecked] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedBeforePause, setElapsedBeforePause] = useState(0);
  const [running, setRunning] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PrepState>;
      if (Array.isArray(parsed.checked)) setChecked(parsed.checked);
      if (typeof parsed.startedAt === 'number' || parsed.startedAt === null) setStartedAt(parsed.startedAt ?? null);
      if (typeof parsed.elapsedBeforePause === 'number') setElapsedBeforePause(parsed.elapsedBeforePause);
      if (typeof parsed.running === 'boolean') setRunning(parsed.running);
    } catch {
      // Ignore malformed saved state.
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          checked,
          startedAt,
          elapsedBeforePause,
          running,
        } satisfies PrepState),
      );
    } catch {
      // Ignore storage write failures.
    }
  }, [checked, elapsedBeforePause, running, startedAt, storageKey]);

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const elapsedSeconds = useMemo(() => {
    if (!running || !startedAt) return elapsedBeforePause;
    return elapsedBeforePause + Math.floor((now - startedAt) / 1000);
  }, [elapsedBeforePause, now, running, startedAt]);

  const totalPrepSeconds = dish.prepTimeMin * 60;
  const remainingSeconds = Math.max(0, totalPrepSeconds - elapsedSeconds);
  const checkedSet = useMemo(() => new Set(checked), [checked]);
  const completed = checked.length;
  const progress = Math.round((completed / dish.miseEnPlace.length) * 100);
  const prepLabel = copyForLang(lang, {
    en: 'Kitchen Tayyari Planner',
    hi: 'किचन तैयारी प्लानर',
    te: 'కిచెన్ తయారీ ప్లానర్',
  });
  const prepChecklist = copyForLang(lang, {
    en: 'Kitchen Tayyari Checklist',
    hi: 'किचन तैयारी चेकलिस्ट',
    te: 'కిచెన్ తయారీ చెక్‌లిస్ట్',
  });

  function toggleTask(taskId: string) {
    setChecked((current) =>
      current.includes(taskId)
        ? current.filter((item) => item !== taskId)
        : [...current, taskId],
    );
  }

  function toggleTimer() {
    if (running && startedAt) {
      setElapsedBeforePause(elapsedSeconds);
      setStartedAt(null);
      setRunning(false);
      return;
    }

    setStartedAt(Date.now());
    setRunning(true);
  }

  return (
    <AppShell className="pb-32">
      <Header backHref={ROUTES.dish(dish.dishId)} />

      <ScreenCard className="overflow-hidden p-0">
        <div className="grid gap-0 md:grid-cols-[1fr_1.05fr]">
          <DishVisual
            src={dish.heroImage}
            alt={dish.dishName}
            className="h-[220px] rounded-none border-0 md:h-full"
          />
          <div className="p-5">
            <SectionEyebrow label={prepLabel} />
            <h1 className="text-[34px] leading-[0.95]">{dish.dishName}</h1>
            <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
              {copyForLang(lang, {
                en: 'Slice, soak, marinate, and keep your tools ready before the stove work begins.',
                hi: 'काटना, भिगोना, मेरिनेट करना और ज़रूरी उपकरण तैयार रखना यहीं पूरा करें।',
                te: 'తరిగి పెట్టడం, నానబెట్టడం, మరినేట్ చేయడం, కావాల్సిన సాధనాలు సిద్ధం చేయడం ఇక్కడ పూర్తి చేయండి.',
              })}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill label={`${completed}/${dish.miseEnPlace.length} done`} tone="green" />
              <StatusPill label={running ? 'Timer running' : 'Timer paused'} />
            </div>
          </div>
        </div>

        <div className="border-t border-border/70 px-5 py-5">
          <div className="flex items-center justify-between gap-3 text-[16px]">
            <span className="font-medium text-foreground">Prep Progress</span>
            <span className="text-muted-foreground">{completed} of {dish.miseEnPlace.length} tasks done</span>
          </div>
          <ProgressBar value={progress} className="mt-4" />
        </div>
      </ScreenCard>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <MetricTile icon={Clock3} title="Prep Timer" value={formatCountdown(remainingSeconds)} detail={running ? 'Running now' : 'Ready to start'} />
        <MetricTile icon={UtensilsCrossed} title="Tools Needed" value={`${dish.tools.length}`} detail="Keep nearby" />
        <MetricTile icon={Soup} title="Ingredients" value={`${dish.ingredients.length}`} detail="Already checked" />
      </div>

      <ScreenCard className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <SectionEyebrow icon={PlugZap} label="Prep Timer" className="mb-1" />
            <h2 className="text-[22px]">Start your kitchen prep clock</h2>
          </div>
          <button
            type="button"
            onClick={toggleTimer}
            className={
              running
                ? 'rounded-full border border-primary/20 bg-primary-soft px-5 py-2.5 text-sm font-semibold text-primary-dark'
                : 'rounded-full border border-primary/20 gradient-cta px-5 py-2.5 text-sm font-semibold text-white shadow-cta'
            }
          >
            {running ? 'Pause prep timer' : 'Start prep timer'}
          </button>
        </div>
      </ScreenCard>

      <ScreenCard className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[22px]">{prepChecklist}</h2>
          <span className="text-sm font-semibold text-accent-green">{completed} / {dish.miseEnPlace.length}</span>
        </div>

        <div className="mt-4 space-y-3">
          {dish.miseEnPlace.map((task) => {
            const isChecked = checkedSet.has(task.id);
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => toggleTask(task.id)}
                className="flex w-full items-center gap-3 rounded-[22px] border border-border/60 bg-card px-4 py-3 text-left transition-transform active:scale-[0.995]"
              >
                <span
                  className={
                    isChecked
                      ? 'inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-green text-white'
                      : 'inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-transparent'
                  }
                >
                  ✓
                </span>
                <span className={isChecked ? 'text-base text-muted-foreground line-through' : 'text-base text-foreground'}>
                  {task.label}
                </span>
                <span className="ml-auto text-border">⋮⋮</span>
              </button>
            );
          })}
        </div>
      </ScreenCard>

      <ScreenCard className="mt-5">
        <SectionEyebrow label="Chef Tip" />
        <p className="text-[17px] leading-8 text-muted-foreground">
          {copyForLang(lang, {
            en: 'Good prep makes the cook smoother. Keep chopped ingredients, blender jars, and hot water within reach before you begin.',
            hi: 'अच्छी तैयारी से आगे की कुकिंग आसान होती है। कटी हुई सामग्री, मिक्सर जार और गरम पानी पहले से पास रखें।',
            te: 'మంచి ముందస్తు సిద్ధతతో తర్వాతి వంట సాఫీగా సాగుతుంది. తరిగిన పదార్థాలు, మిక్సీ జార్, వేడి నీళ్లు దగ్గర ఉంచండి.',
          })}
        </p>
      </ScreenCard>

      <div className="mt-6">
        <Link
          href={ROUTES.dishCook(dish.dishId, 1)}
          className="flex w-full items-center justify-between rounded-[26px] gradient-cta px-6 py-4 text-white shadow-cta transition-transform active:scale-[0.985]"
        >
          <span className="flex items-center gap-3">
            <Soup className="h-6 w-6" />
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-[20px]">Start Cooking Session</span>
              <span className="text-sm text-white/90">Your prep progress will stay saved while you cook.</span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5" />
        </Link>
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
