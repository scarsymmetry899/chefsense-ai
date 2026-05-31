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
// import { VoiceChatPanel } from '@/components/cook/voice-chat-panel'; // Phase 2
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

const MEP_COPY = {
  en: {
    prepLabel: 'Kitchen Prep Planner',
    prepChecklist: 'Kitchen Prep Checklist',
    prepTimer: 'Prep Timer', tools: 'Tools Needed', ingredientsLabel: 'Ingredients',
    running: 'Running now', ready: 'Ready to start', nearby: 'Keep nearby', checked: 'Already checked',
    prepTimerTitle: 'Start your kitchen prep clock',
    startPrepTimer: 'Start prep timer', pausePrepTimer: 'Pause prep timer',
    prepProgress: 'Prep Progress', tasksOf: (done: number, total: number) => `${done} of ${total} tasks done`,
    timerRunning: 'Timer running', timerPaused: 'Timer paused',
    doneOf: (done: number, total: number) => `${done}/${total} done`,
    startCooking: 'Start Cooking Session',
    startCookingSub: 'Your prep progress will stay saved while you cook.',
    chefTip: (n: number) => `Chef Tip ${n}`,
    tips: [
      'Good prep makes the cook smoother. Keep chopped ingredients, blender jars, and hot water within reach before you begin.',
      'Set your spices in cooking order so you do not overheat the pan while searching for the next one.',
      'Keep one clean spoon and one tasting spoon ready from the start for a calmer cooking flow.',
    ],
    sliceAndPrep: 'Slice, soak, marinate, and keep your tools ready before the stove work begins.',
  },
  hi: {
    prepLabel: 'किचन तैयारी प्लानर',
    prepChecklist: 'किचन तैयारी चेकलिस्ट',
    prepTimer: 'प्रेप टाइमर', tools: 'ज़रूरी उपकरण', ingredientsLabel: 'सामग्री',
    running: 'अभी चल रहा है', ready: 'शुरू करने के लिए तैयार', nearby: 'पास रखें', checked: 'पहले से जाँचा',
    prepTimerTitle: 'अपना किचन प्रेप क्लॉक शुरू करें',
    startPrepTimer: 'प्रेप टाइमर शुरू करें', pausePrepTimer: 'प्रेप टाइमर रोकें',
    prepProgress: 'तैयारी की प्रगति', tasksOf: (done: number, total: number) => `${done} में से ${total} काम पूरे`,
    timerRunning: 'टाइमर चल रहा है', timerPaused: 'टाइमर रुका है',
    doneOf: (done: number, total: number) => `${done}/${total} पूरे`,
    startCooking: 'कुकिंग सेशन शुरू करें',
    startCookingSub: 'पकाते समय आपकी तैयारी की प्रगति सेव रहेगी।',
    chefTip: (n: number) => `शेफ टिप ${n}`,
    tips: [
      'अच्छी तैयारी से पकाना आसान हो जाता है। कटी हुई सामग्री, ब्लेंडर जार और गर्म पानी पहले से पास रखें।',
      'मसालों को पकाने के क्रम में सजाएँ ताकि अगले मसाले को ढूंढते समय पैन ज़्यादा न जले।',
      'शुरू से ही एक साफ़ चम्मच और एक चखने का चम्मच तैयार रखें, इससे पकाना आरामदायक रहेगा।',
    ],
    sliceAndPrep: 'चूल्हे पर काम शुरू करने से पहले काटें, भिगोएँ, मैरिनेट करें और अपने उपकरण तैयार रखें।',
  },
  te: {
    prepLabel: 'కిచెన్ తయారీ ప్లానర్',
    prepChecklist: 'కిచెన్ తయారీ చెక్‌లిస్ట్',
    prepTimer: 'ప్రెప్ టైమర్', tools: 'అవసరమైన పరికరాలు', ingredientsLabel: 'సామగ్రి',
    running: 'ఇప్పుడు నడుస్తోంది', ready: 'ప్రారంభించడానికి సిద్ధం', nearby: 'దగ్గర ఉంచండి', checked: 'ఇప్పటికే చెక్ చేశారు',
    prepTimerTitle: 'మీ కిచెన్ ప్రెప్ క్లాక్ ప్రారంభించండి',
    startPrepTimer: 'ప్రెప్ టైమర్ ప్రారంభించండి', pausePrepTimer: 'ప్రెప్ టైమర్ ఆపండి',
    prepProgress: 'తయారీ ప్రగతి', tasksOf: (done: number, total: number) => `${total} లో ${done} పనులు పూర్తి`,
    timerRunning: 'టైమర్ నడుస్తోంది', timerPaused: 'టైమర్ ఆగింది',
    doneOf: (done: number, total: number) => `${done}/${total} పూర్తి`,
    startCooking: 'వంట సెషన్ ప్రారంభించండి',
    startCookingSub: 'వంట చేస్తున్నప్పుడు మీ తయారీ ప్రగతి సేవ్ అవుతూ ఉంటుంది.',
    chefTip: (n: number) => `చెఫ్ టిప్ ${n}`,
    tips: [
      'మంచి తయారీ వంటను సులభం చేస్తుంది. కోసిన సామగ్రి, బ్లెండర్ జార్‌లు, వేడి నీరు ముందే దగ్గర ఉంచుకోండి.',
      'మసాలాలను వంట క్రమంలో అమర్చండి, తద్వారా తర్వాతి మసాల వెతికేటప్పుడు పాన్ అతిగా వేడి కాదు.',
      'మొదటి నుండే ఒక శుభ్రమైన గరిటె మరియు ఒక రుచి చూసే గరిటె సిద్ధంగా ఉంచుకోండి.',
    ],
    sliceAndPrep: 'పొయ్యిపై పని ప్రారంభించే ముందు కోయండి, నానబెట్టండి, మారినేట్ చేయండి, పరికరాలు సిద్ధం చేసుకోండి.',
  },
} as const;

export default function DishMiseEnPlacePage() {
  const params = useParams<{ id: string }>();
  const dish = getDishOrThrow(params.id);
  const { lang } = useLanguage();
  const mc = MEP_COPY[lang];
  const storageKey = `${STORAGE_PREFIX}${dish.dishId}`;

  const [checked, setChecked] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedBeforePause, setElapsedBeforePause] = useState(0);
  const [running, setRunning] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [tipIndex, setTipIndex] = useState(0);

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

  const chefTips = mc.tips;
  const activeTip = mc.tips[tipIndex] ?? mc.tips[0];

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
            <SectionEyebrow label={mc.prepLabel} />
            <h1 className="text-[34px] leading-[0.95]">{dish.dishName}</h1>
            <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
              {mc.sliceAndPrep}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill label={mc.doneOf(completed, dish.miseEnPlace.length)} tone="green" />
              <StatusPill label={running ? mc.timerRunning : mc.timerPaused} />
            </div>
          </div>
        </div>

        <div className="border-t border-border/70 px-5 py-5">
          <div className="flex items-center justify-between gap-3 text-[16px]">
            <span className="font-medium text-foreground">{mc.prepProgress}</span>
            <span className="text-muted-foreground">{mc.tasksOf(completed, dish.miseEnPlace.length)}</span>
          </div>
          <ProgressBar value={progress} className="mt-4" />
        </div>
      </ScreenCard>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <MetricTile icon={Clock3} title={mc.prepTimer} value={formatCountdown(remainingSeconds)} detail={running ? mc.running : mc.ready} />
        <MetricTile icon={UtensilsCrossed} title={mc.tools} value={`${dish.tools.length}`} detail={mc.nearby} />
        <MetricTile icon={Soup} title={mc.ingredientsLabel} value={`${dish.ingredients.length}`} detail={mc.checked} />
      </div>

      <ScreenCard className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <SectionEyebrow icon={PlugZap} label={mc.prepTimer} className="mb-1" />
            <h2 className="text-[22px]">{mc.prepTimerTitle}</h2>
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
            {running ? mc.pausePrepTimer : mc.startPrepTimer}
          </button>
        </div>
      </ScreenCard>

      <ScreenCard className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[22px]">{mc.prepChecklist}</h2>
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
          <SectionEyebrow label={mc.chefTip(tipIndex + 1)} className="mb-0" />
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
              <span className="font-serif text-[20px]">{mc.startCooking}</span>
              <span className="text-sm text-white/90">{mc.startCookingSub}</span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      {/* PHASE 2 — Voice & Chat for Kitchen Prep (Mise-en-Place)
          Will sit below the Prep Timer / Tools / Ingredients metric tiles,
          styled identically to the cook-page voice panel.
          Awaiting: serving-size-aware quantity scaling so the AI mirrors
          exactly what the checklist shows (e.g., 2-person portions).
      */}
    </AppShell>
  );
}

