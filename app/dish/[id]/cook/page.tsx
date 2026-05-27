'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ChefHat,
  Eye,
  Flame,
  LifeBuoy,
  Mic,
  PauseCircle,
  PlayCircle,
  TimerReset,
  Waves,
} from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import {
  AlertCard,
  HeatMeter,
  ScreenCard,
  SectionEyebrow,
  StepDots,
  cueMeta,
} from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';
import {
  formatCountdown,
  getDefaultRescueIssue,
  getHeatMeta,
  getStepProgress,
  getStructuredCues,
} from '@/lib/dish-flow';
import { useCookingSession } from '@/lib/cooking-session';
import { useLanguage } from '@/lib/i18n/language-context';
import { playSoundEffect } from '@/lib/sound-effects';
import { recordRecentlyViewedDish } from '@/lib/user-state';

export default function DishCookPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const dish = getDishOrThrow(params.id);
  const requestedStep = Number(searchParams.get('step') ?? 1);
  const step = dish.cookingSteps.find((item) => item.index === requestedStep) ?? dish.cookingSteps[0];
  const nextStep = dish.cookingSteps.find((item) => item.index === step.index + 1);
  const prevStep = dish.cookingSteps.find((item) => item.index === step.index - 1);

  const { session, getElapsedForStep, startStep, pauseStep, markStepComplete, reopenStep } =
    useCookingSession(dish.dishId, step.index);

  const [skipIntent, setSkipIntent] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [timeAlerted, setTimeAlerted] = useState(false);

  useEffect(() => {
    recordRecentlyViewedDish(dish.dishId);
  }, [dish.dishId]);

  const elapsedSeconds = getElapsedForStep(step.index);
  const remainingSeconds = Math.max(0, step.durationSec - elapsedSeconds);
  const isRunning = session.runningStep === step.index;
  const isCompleted = session.completedSteps.includes(step.index);
  const progress = getStepProgress(step.index, session.completedSteps, dish.cookingSteps.length);
  const heatMeta = getHeatMeta(step.heat);
  const rescueIssue = getDefaultRescueIssue(dish, step.index);
  const sensoryCards = getStructuredCues(step.title, step.sensoryCues);

  useEffect(() => {
    setSkipIntent(false);
  }, [step.index]);

  useEffect(() => {
    if (remainingSeconds !== 0 || timeAlerted) return;
    playSoundEffect('stop');
    setTimeAlerted(true);
  }, [remainingSeconds, timeAlerted]);

  useEffect(() => {
    if (remainingSeconds > 0 && timeAlerted) {
      setTimeAlerted(false);
    }
  }, [remainingSeconds, timeAlerted]);

  const voiceRecap = useMemo(() => {
    const sensory = sensoryCards
      .map((cue) => `${cueMeta[cue.type]?.label ?? cue.type}: ${cue.cue}`)
      .join(' ');
    return `${step.title}. ${sensory} Why this matters: ${step.whyThisMatters}`;
  }, [sensoryCards, step.title, step.whyThisMatters]);

  function moveForward() {
    if (!isCompleted && remainingSeconds > 0 && !skipIntent) {
      setSkipIntent(true);
      return;
    }

    playSoundEffect('tap');
    setSkipIntent(false);
    if (nextStep) {
      markStepComplete(step.index, nextStep.index);
      router.push(ROUTES.dishCook(dish.dishId, nextStep.index));
      return;
    }

    markStepComplete(step.index);
    router.push(ROUTES.dishFinish(dish.dishId));
  }

  function handlePrimaryAction() {
    if (isCompleted) {
      playSoundEffect('tap');
      reopenStep(step.index);
      return;
    }

    playSoundEffect('check');
    if (nextStep) {
      markStepComplete(step.index, nextStep.index);
      router.push(ROUTES.dishCook(dish.dishId, nextStep.index));
      return;
    }

    markStepComplete(step.index);
    router.push(ROUTES.dishFinish(dish.dishId));
  }

  function toggleTimer() {
    if (isRunning) {
      playSoundEffect('stop');
      pauseStep();
      return;
    }

    playSoundEffect('start');
    startStep(step.index);
  }

  return (
    <AppShell className="pb-32">
      <Header
        backHref={prevStep ? ROUTES.dishCook(dish.dishId, prevStep.index) : ROUTES.dishMiseEnPlace(dish.dishId)}
        showBrand={false}
        title={dish.dishName}
        actions={[{ icon: Waves, label: t('cook.exit'), href: ROUTES.home }]}
        className="mb-2"
      />

      <div className="text-center">
        <div className="text-[15px] font-medium text-copper">{dish.dishName}</div>
        <div className="mx-auto mt-3 inline-flex rounded-full border border-border bg-card px-6 py-2.5 text-[18px] font-medium text-foreground shadow-soft">
          Step {step.index} of {dish.cookingSteps.length}
        </div>
        <div className="mt-4">
          <StepDots count={Math.min(dish.cookingSteps.length, 8)} active={Math.min(step.index, 8)} />
        </div>
      </div>

      <section className="mt-5 text-center">
        <h1 className="mx-auto max-w-[360px] text-[52px] leading-[0.94]">{step.title}</h1>
        <p className="mx-auto mt-4 max-w-[340px] text-[20px] leading-8 text-muted-foreground">
          {step.instruction}
        </p>
      </section>

      <ScreenCard className="mt-6 p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="border-r border-border/60 pr-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Flame className="h-4 w-4" />
              {t('cook.heat')}
            </div>
            <div className="mt-2 font-serif text-[24px] text-primary-dark">{step.heat}</div>
            <div className="mt-1 text-xs text-muted-foreground">{heatMeta.tempC.replace('C', ' degrees C')}</div>
            <div className="mt-2">
              <HeatMeter level={step.heat} tempLabel={heatMeta.tempLabel} />
            </div>
          </div>
          <div className="border-r border-border/60 px-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <TimerReset className="h-4 w-4" />
              {t('cook.timer')}
            </div>
            <div className="mt-2 font-serif text-[34px] leading-none text-primary tabular-nums">
              {formatCountdown(remainingSeconds)}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{t('cook.timeRemaining')}</div>
          </div>
          <div className="pl-3">
            <div className="text-primary">{t('cook.progress')}</div>
            <div className="mx-auto mt-2 flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-primary/80 font-serif text-[28px] text-foreground shadow-inner">
              {progress}%
            </div>
          </div>
        </div>
      </ScreenCard>

      {skipIntent ? (
        <div className="mt-4 rounded-[22px] border border-secondary/55 bg-secondary-soft px-4 py-4 text-sm leading-6 text-foreground">
          Your timer is still running. Tap <span className="font-semibold">Next step</span> again if you still want to move ahead now.
        </div>
      ) : null}

      {remainingSeconds === 0 ? (
        <div className="mt-4 rounded-[22px] border border-primary/30 bg-primary-soft/55 px-4 py-4 text-sm leading-6 text-primary-dark">
          Time for this step is up. Check the cues once more, then move to the next step when you are ready.
        </div>
      ) : null}

      <ScreenCard className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow icon={Mic} label={t('voice.title')} className="mb-0" />
          <button
            type="button"
            onClick={() => setVoiceOpen((current) => !current)}
            className="rounded-full border border-primary/25 px-4 py-2 text-sm font-semibold text-primary"
          >
            {voiceOpen ? 'Open full chat' : 'Open mic'}
          </button>
        </div>
        <div className="mt-3 rounded-[22px] border border-border/60 bg-background px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-foreground">
                {isRunning ? 'Voice can keep guiding while the timer continues.' : 'Resume this step to use live voice help.'}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Ask about cues, timing, or what to correct before moving ahead.
              </div>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Mic className="h-5 w-5" />
            </span>
          </div>
          {voiceOpen ? (
            <div className="mt-4 space-y-2">
              <div className="rounded-[18px] bg-card px-3 py-3 text-sm text-foreground">ChefSense: {step.beginnerExplanation}</div>
              <div className="rounded-[18px] bg-primary-soft px-3 py-3 text-right text-sm text-primary-dark">You: What should I look for now?</div>
              <div className="rounded-[18px] bg-card px-3 py-3 text-sm text-foreground">ChefSense: {voiceRecap}</div>
              <Link href={ROUTES.dishVoice(dish.dishId, step.index)} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Open full voice chat →
              </Link>
            </div>
          ) : null}
        </div>
      </ScreenCard>

      <div className="mt-5">
        <SectionEyebrow icon={Eye} label={`${t('cook.sensoryHeading')} - ${t('cook.sensoryTagline')}`} />
        <div className="grid grid-cols-2 gap-3">
          {sensoryCards.map((cue) => {
            const meta = cueMeta[cue.type];
            const Icon = meta?.icon ?? Eye;
            return (
              <ScreenCard
                key={`${cue.type}-${cue.cue}`}
                className="border border-secondary/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,247,239,0.98))] p-4"
              >
                <div className="flex items-center gap-2 text-accent-green">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-green-soft">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="text-[16px] font-medium">{meta?.label ?? cue.type}</div>
                </div>
                <div className="mt-3 text-sm leading-6 text-muted-foreground">{cue.cue}</div>
              </ScreenCard>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <AlertCard title={t('cook.whyMatters')} detail={step.whyThisMatters} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={toggleTimer}
          className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-border bg-card px-4 py-4 text-center text-[15px] font-medium text-foreground shadow-soft"
        >
          {isRunning ? <PauseCircle className="h-5 w-5 text-primary" /> : <PlayCircle className="h-5 w-5 text-primary" />}
          {isRunning ? 'Pause timer' : 'Resume timer'}
        </button>
        <button
          type="button"
          onClick={handlePrimaryAction}
          className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-primary/20 gradient-cta px-4 py-4 text-center text-[15px] font-medium text-white shadow-cta"
        >
          <ChefHat className="h-5 w-5" />
          {isCompleted ? 'Reopen step' : nextStep ? 'Mark step done' : 'Finish cooking'}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => prevStep && router.push(ROUTES.dishCook(dish.dishId, prevStep.index))}
          disabled={!prevStep}
          className="inline-flex items-center justify-center rounded-[22px] border border-border bg-card px-3 py-4 text-center text-[15px] font-medium text-foreground shadow-soft disabled:opacity-45"
        >
          {t('cta.previousStep')}
        </button>
        <Link
          href={ROUTES.dishPanCheck(dish.dishId, step.index)}
          className="inline-flex items-center justify-center rounded-[22px] border border-border bg-card px-3 py-4 text-center text-[15px] font-medium text-foreground shadow-soft"
        >
          <LifeBuoy className="mr-2 h-4 w-4 text-primary" />
          AI Pan Checker
        </Link>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={moveForward}
          className="flex w-full items-center justify-between rounded-[26px] gradient-cta px-6 py-4 text-white shadow-cta transition-transform active:scale-[0.985]"
        >
          <span className="flex items-center gap-3">
            <ChefHat className="h-6 w-6" />
            <span className="flex flex-col leading-tight text-left">
              <span className="font-serif text-[20px]">{nextStep ? t('cta.nextStep') : 'Finish Like a Chef'}</span>
              <span className="text-sm text-white/90">
                {nextStep ? 'Your timer keeps running unless you pause it.' : 'Taste balance, finishing touches, and plating come next.'}
              </span>
            </span>
          </span>
          <span className="text-lg">→</span>
        </button>
      </div>

      <div className="mt-4 rounded-[22px] border border-border bg-card px-4 py-4 text-sm leading-6 text-muted-foreground shadow-soft">
        Final taste check: if anything feels off, open <span className="font-semibold text-foreground">AI Pan Checker</span> for a guided analysis and fix path without losing your place.
      </div>
    </AppShell>
  );
}
