'use client';

import { useMemo } from 'react';
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
  DishVisual,
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
  getStepFallbackGlyph,
  getStepProgress,
  isLateTasteStage,
} from '@/lib/dish-flow';
import { useCookingSession } from '@/lib/cooking-session';
import { useLanguage } from '@/lib/i18n/language-context';
import { playSoundEffect } from '@/lib/sound-effects';

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

  const elapsedSeconds = getElapsedForStep(step.index);
  const remainingSeconds = Math.max(0, step.durationSec - elapsedSeconds);
  const isRunning = session.runningStep === step.index;
  const isCompleted = session.completedSteps.includes(step.index);
  const progress = getStepProgress(step.index, session.completedSteps, dish.cookingSteps.length);
  const heatMeta = getHeatMeta(step.heat);
  const rescueIssue = getDefaultRescueIssue(dish, step.index);
  const canTasteFix = isLateTasteStage(step.index, dish.cookingSteps.length);

  const voiceRecap = useMemo(() => {
    const sensory = step.sensoryCues
      .map((cue) => `${cueMeta[cue.type]?.label ?? cue.type}: ${cue.cue}`)
      .join(' ');
    return `${step.title}. ${sensory} Why this matters: ${step.whyThisMatters}`;
  }, [step]);

  function goToStep(target: number) {
    router.push(ROUTES.dishCook(dish.dishId, target));
  }

  function moveForward() {
    if (!isCompleted && remainingSeconds > 0) {
      const confirmed = window.confirm('The timer is still running for this step. Are you sure you want to move to the next step?');
      if (!confirmed) return;
    }

    playSoundEffect('tap');
    if (nextStep) {
      router.push(ROUTES.dishCook(dish.dishId, nextStep.index));
      return;
    }
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

  const title = step.title.includes('tomato-cashew')
    ? (
      <>
        Cook the <span className="text-primary">tomato-cashew</span> masala
      </>
    )
    : step.title;

  return (
    <AppShell showBottomNav={false} className="pb-12">
      <Header
        backHref={prevStep ? ROUTES.dishCook(dish.dishId, prevStep.index) : ROUTES.dishMiseEnPlace(dish.dishId)}
        showBrand={false}
        title={dish.dishName}
        actions={[{ icon: Waves, label: t('cook.exit'), href: ROUTES.home }]}
        className="mb-2"
      />

      <div className="text-center">
        <div className="text-[14px] font-medium text-copper">{dish.dishName}</div>
        <div className="mx-auto mt-3 inline-flex rounded-full border border-border bg-card px-5 py-2 text-[15px] text-foreground shadow-soft">
          {t('cook.step')} {step.index} {t('cook.of')} {dish.cookingSteps.length}
        </div>
        <div className="mt-4">
          <StepDots count={Math.min(dish.cookingSteps.length, 8)} active={Math.min(step.index, 8)} />
        </div>
      </div>

      <div className="mt-5">
        <DishVisual
          src={step.image}
          alt={step.title}
          fallbackGlyph={getStepFallbackGlyph(step.title, step.instruction)}
          className="h-[260px] shadow-[0_18px_30px_-18px_rgba(114,66,35,0.38)]"
        />
      </div>

      <section className="mt-6 text-center">
        <h1 className="mx-auto max-w-[340px] text-[40px] leading-[0.95]">{title}</h1>
        <p className="mx-auto mt-4 max-w-[340px] text-[18px] leading-8 text-muted-foreground">
          {step.instruction}
        </p>
      </section>

      <ScreenCard className="mt-6">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="border-r border-border/60 pr-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Flame className="h-4 w-4" />
              {t('cook.heat')}
            </div>
            <div className="mt-2 font-serif text-[22px] text-primary-dark">{step.heat}</div>
            <div className="mt-2 text-xs text-muted-foreground">{heatMeta.tempC}</div>
            <div className="mt-3">
              <HeatMeter level={step.heat} tempLabel={heatMeta.tempLabel} />
            </div>
          </div>
          <div className="border-r border-border/60 px-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <TimerReset className="h-4 w-4" />
              {t('cook.timer')}
            </div>
            <div className="mt-3 font-serif text-[34px] leading-none text-primary tabular-nums">
              {formatCountdown(remainingSeconds)}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{t('cook.timeRemaining')}</div>
          </div>
          <div className="pl-3">
            <div className="text-primary">{t('cook.progress')}</div>
            <div className="mx-auto mt-2 flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-primary/80 font-serif text-[28px] text-foreground shadow-inner">
              {progress}%
            </div>
          </div>
        </div>
      </ScreenCard>

      <ScreenCard className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow icon={Mic} label={t('voice.title')} className="mb-0" />
          <Link
            href={ROUTES.dishVoice(dish.dishId, step.index)}
            className="rounded-full border border-primary/25 px-4 py-2 text-sm font-semibold text-primary"
          >
            Open mic
          </Link>
        </div>
        <div className="mt-3 rounded-[22px] border border-border/60 bg-background px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-foreground">
                {isRunning ? 'Voice can keep guiding while the timer continues.' : 'Resume this step to use live voice help.'}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Narrate the cues, ask what to look for, or get help before moving ahead.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playSoundEffect('tap');
                void navigator.clipboard?.writeText(voiceRecap);
              }}
              className="rounded-full bg-primary-soft px-3 py-2 text-xs font-semibold text-primary-dark"
            >
              Copy cues
            </button>
          </div>
        </div>
      </ScreenCard>

      <div className="mt-5">
        <SectionEyebrow icon={Eye} label={`${t('cook.sensoryHeading')} - ${t('cook.sensoryTagline')}`} />
        <div className="grid grid-cols-2 gap-3">
          {step.sensoryCues.map((cue) => {
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
                  <div className="text-[17px] font-medium">{meta?.label ?? cue.type}</div>
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
          className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-border bg-card px-4 py-4 text-center text-[15px] font-medium text-foreground"
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

      <div className="mt-3 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => prevStep && goToStep(prevStep.index)}
          disabled={!prevStep}
          className="inline-flex items-center justify-center rounded-[22px] border border-border bg-card px-3 py-4 text-center text-[15px] font-medium text-foreground disabled:opacity-45"
        >
          {t('cta.previousStep')}
        </button>
        <Link
          href={ROUTES.dishPanCheck(dish.dishId, step.index)}
          className="inline-flex items-center justify-center rounded-[22px] border border-border bg-card px-3 py-4 text-center text-[15px] font-medium text-foreground"
        >
          {t('cta.mineLooksDifferent')}
        </Link>
        <Link
          href={ROUTES.dishRescue(dish.dishId, rescueIssue.id, step.index)}
          className="inline-flex items-center justify-center rounded-[22px] border border-border bg-card px-3 py-4 text-center text-[15px] font-medium text-foreground"
        >
          <LifeBuoy className="mr-2 h-4 w-4 text-primary" />
          {canTasteFix ? t('cta.fixMyDish') : 'Fix this step'}
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
              <span className="font-serif text-[20px]">{nextStep ? t('cta.nextStep') : t('cta.dishReady')}</span>
              <span className="text-sm text-white/90">
                {remainingSeconds > 0 && !isCompleted ? 'Progress saved for this dish.' : t('cook.encourage')}
              </span>
            </span>
          </span>
          <span className="text-lg">→</span>
        </button>
      </div>
    </AppShell>
  );
}
