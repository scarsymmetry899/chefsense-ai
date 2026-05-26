'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChefHat, Eye, LifeBuoy, Mic, PauseCircle, PlayCircle, TimerReset, Waves } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import {
  AlertCard,
  DishVisual,
  GradientButton,
  HeatDots,
  ScreenCard,
  SectionEyebrow,
  StepDots,
  cueMeta,
} from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';
import { formatCountdown } from '@/lib/dish-flow';
import { useCookingSession } from '@/lib/cooking-session';
import { useLanguage } from '@/lib/i18n/language-context';

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
  const completedCount = session.completedSteps.length;
  const progress = Math.round((completedCount / dish.cookingSteps.length) * 100);

  function goToStep(target: number) {
    router.push(ROUTES.dishCook(dish.dishId, target));
  }

  function handlePrimaryAction() {
    if (isCompleted) {
      reopenStep(step.index);
      return;
    }

    if (nextStep) {
      markStepComplete(step.index, nextStep.index);
      router.push(ROUTES.dishCook(dish.dishId, nextStep.index));
      return;
    }

    markStepComplete(step.index);
    router.push(ROUTES.dishFinish(dish.dishId));
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
        backHref={ROUTES.dishMiseEnPlace(dish.dishId)}
        showBrand={false}
        title={dish.dishName}
        actions={[{ icon: Waves, label: t('cook.exit'), href: ROUTES.home }]}
        className="mb-2"
      />

      <div className="text-center">
        <div className="text-[14px] font-medium text-copper">{dish.dishName}</div>
        <div className="mx-auto mt-3 inline-flex rounded-full border border-border bg-card px-5 py-2 text-[15px] text-foreground">
          {t('cook.step')} {step.index} {t('cook.of')} {dish.cookingSteps.length}
        </div>
        <div className="mt-4">
          <StepDots count={Math.min(dish.cookingSteps.length, 8)} active={Math.min(step.index, 8)} />
        </div>
      </div>

      <div className="mt-5">
        <DishVisual src={step.image} alt={step.title} className="h-[295px]" />
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
              <ChefHat className="h-4 w-4" />
              {t('cook.heat')}
            </div>
            <div className="mt-3 font-serif text-[22px] text-primary-dark">{step.heat}</div>
            <div className="mt-3">
              <HeatDots level={step.heat} />
            </div>
          </div>
          <div className="border-r border-border/60 px-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <TimerReset className="h-4 w-4" />
              {t('cook.timer')}
            </div>
            <div className="mt-3 font-serif text-[34px] leading-none text-primary">
              {formatCountdown(remainingSeconds)}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{t('cook.timeRemaining')}</div>
          </div>
          <div className="pl-3">
            <div className="text-primary">{t('cook.progress')}</div>
            <div className="mx-auto mt-2 flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-primary/80 font-serif text-[28px] text-foreground">
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
        <div className="mt-3 flex items-center justify-between gap-3 rounded-[22px] border border-border/60 bg-background px-4 py-3">
          <div>
            <div className="text-sm font-medium text-foreground">
              {isRunning ? 'Voice can listen while the timer continues.' : 'Resume this step to use live voice help.'}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Ask what to look for, how to fix sticking, or when to move ahead.
            </div>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Mic className="h-5 w-5" />
          </span>
        </div>
      </ScreenCard>

      <div className="mt-5">
        <SectionEyebrow icon={Eye} label={`${t('cook.sensoryHeading')} - ${t('cook.sensoryTagline')}`} />
        <div className="grid grid-cols-2 gap-3">
          {step.sensoryCues.map((cue) => {
            const meta = cueMeta[cue.type];
            const Icon = meta?.icon ?? Eye;
            return (
              <ScreenCard key={`${cue.type}-${cue.cue}`} className="p-4">
                <Icon className="h-6 w-6 text-accent-green" />
                <div className="mt-3 text-[17px] font-medium text-accent-green">
                  {meta?.label ?? cue.type}
                </div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">{cue.cue}</div>
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
          onClick={() => (isRunning ? pauseStep() : startStep(step.index))}
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
          href={ROUTES.dishPanCheck(dish.dishId)}
          className="inline-flex items-center justify-center rounded-[22px] border border-border bg-card px-3 py-4 text-center text-[15px] font-medium text-foreground"
        >
          {t('cta.mineLooksDifferent')}
        </Link>
        <Link
          href={ROUTES.dishRescue(dish.dishId)}
          className="inline-flex items-center justify-center rounded-[22px] border border-border bg-card px-3 py-4 text-center text-[15px] font-medium text-foreground"
        >
          <LifeBuoy className="mr-2 h-4 w-4 text-primary" />
          {t('cta.fixMyDish')}
        </Link>
      </div>

      <div className="mt-4">
        <GradientButton
          href={nextStep ? ROUTES.dishCook(dish.dishId, nextStep.index) : ROUTES.dishFinish(dish.dishId)}
          label={nextStep ? t('cta.nextStep') : t('cta.dishReady')}
          subline={isCompleted ? 'Progress saved for this dish.' : t('cook.encourage')}
          icon={ChefHat}
        />
      </div>
    </AppShell>
  );
}
