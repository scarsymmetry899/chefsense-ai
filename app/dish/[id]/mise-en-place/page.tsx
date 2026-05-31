'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock3, PlugZap, Soup, UtensilsCrossed } from 'lucide-react';
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
import { VoiceChatPanel } from '@/components/cook/voice-chat-panel';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';
import { formatCountdown } from '@/lib/dish-flow';
import { useLanguage } from '@/lib/i18n/language-context';
import { playSoundEffect } from '@/lib/sound-effects';

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
  const [tipIndex, setTipIndex] = useState(0);
  const [voiceOpen, setVoiceOpen] = useState(false);

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
    en: 'Kitchen Prep Planner',
    hi: 'Kitchen Tayyari Planner',
    te: 'Kitchen Tayyari Planner',
  });
  const prepChecklist = copyForLang(lang, {
    en: 'Kitchen Prep Checklist',
    hi: 'Kitchen Tayyari Checklist',
    te: 'Kitchen Tayyari Checklist',
  });
  const metricCopy = {
    prepTimer: copyForLang(lang, { en: 'Prep Timer', hi: 'Prep Timer', te: 'Prep Timer' }),
    tools: copyForLang(lang, { en: 'Tools Needed', hi: 'Tools Needed', te: 'Tools Needed' }),
    ingredients: copyForLang(lang, { en: 'Ingredients', hi: 'Ingredients', te: 'Ingredients' }),
    running: copyForLang(lang, { en: 'Running now', hi: 'Running now', te: 'Running now' }),
    ready: copyForLang(lang, { en: 'Ready to start', hi: 'Ready to start', te: 'Ready to start' }),
    nearby: copyForLang(lang, { en: 'Keep nearby', hi: 'Keep nearby', te: 'Keep nearby' }),
    checked: copyForLang(lang, { en: 'Already checked', hi: 'Already checked', te: 'Already checked' }),
  };

  function toggleTask(taskId: string) {
    const nextChecked = !checkedSet.has(taskId);
    playSoundEffect(nextChecked ? 'check' : 'tap');
    setChecked((current) =>
      current.includes(taskId)
        ? current.filter((item) => item !== taskId)
        : [...current, taskId],
    );
  }

  function toggleTimer() {
    if (running && startedAt) {
      const nowTs = Date.now();
      playSoundEffect('stop');
      setElapsedBeforePause(elapsedSeconds);
      setStartedAt(null);
      setRunning(false);
      setNow(nowTs);
      return;
    }

    const nowTs = Date.now();
    playSoundEffect('start');
    setNow(nowTs);
    if (!checked.length && elapsedBeforePause === 0) {
      setElapsedBeforePause(0);
    }
    setStartedAt(nowTs);
    setRunning(true);
  }

  const chefTips = [
    'Good prep makes the cook smoother. Keep chopped ingredients, blender jars, and hot water within reach before you begin.',
    'Set your spices in cooking order so you do not overheat the pan while searching for the next one.',
    'Keep one clean spoon and one tasting spoon ready from the start for a calmer cooking flow.',
  ];
  const activeTip = chefTips[tipIndex] ?? chefTips[0];

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
              Slice, soak, marinate, and keep your tools ready before the stove work begins.
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
        <MetricTile icon={Clock3} title={metricCopy.prepTimer} value={formatCountdown(remainingSeconds)} detail={running ? metricCopy.running : metricCopy.ready} />
        <MetricTile icon={UtensilsCrossed} title={metricCopy.tools} value={`${dish.tools.length}`} detail={metricCopy.nearby} />
        <MetricTile icon={Soup} title={metricCopy.ingredients} value={`${dish.ingredients.length}`} detail={metricCopy.checked} />
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
                className="flex w-full items-center gap-3 rounded-[22px] border border-border/60 bg-card px-4 py-3 text-left shadow-soft transition-transform active:scale-[0.995]"
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

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <SectionEyebrow label={`Chef Tip ${tipIndex + 1}`} className="mb-0" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTipIndex((current) => (current === 0 ? chefTips.length - 1 : current - 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setTipIndex((current) => (current + 1) % chefTips.length)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <ScreenCard>
          <p className="text-[17px] leading-8 text-muted-foreground">{activeTip}</p>
        </ScreenCard>
      </div>

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

      <div className="mt-6">
        <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-card px-4 py-3 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span>🎤</span>
            <span>Voice & Chat — Prep Mode</span>
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
          stepIndex={1}
          stepTitle="Mise-en-place preparation"
          primer={[
            `You're preparing to cook ${dish.dishName}. Here's what to get ready before you start cooking.`,
            `Ingredients to prep: ${dish.ingredients.slice(0, 8).map((i) => `${i.name} (${i.quantity})`).join(', ')}.`,
            `Tools needed: ${dish.tools.slice(0, 5).map((t) => t.name).join(', ')}.`,
            dish.miseEnPlace?.length
              ? `Prep checklist: ${dish.miseEnPlace.map((m) => m.label).join(' · ')}.`
              : '',
          ].filter(Boolean).join('\n\n')}
          expanded={voiceOpen}
          collapsedHint="Ask about ingredients, quantities, tools, or prep tips."
          expandedHint="Ask me anything about the ingredients, equipment, or how to prep."
          helperHint="Ask about ingredient substitutions, prep techniques, tool alternatives, or what 'mise-en-place' means."
          placeholder="Ask about ingredients or prep..."
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
