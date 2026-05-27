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

const COPY = {
  en: {
    step: 'Step',
    of: 'of',
    stillRunning: 'Your timer is still running. Tap Next step again if you still want to move ahead now.',
    timeUp: 'Time for this step is up. Check the cues once more, then move to the next step when you are ready.',
    openFullChat: 'Open full chat',
    openMic: 'Open mic',
    voiceRunning: 'Voice can keep guiding while the timer continues.',
    voicePaused: 'Resume this step to use live voice help.',
    voiceHelp: 'Ask about cues, timing, or what to correct before moving ahead.',
    userPrompt: 'You: What should I look for now?',
    pauseTimer: 'Pause timer',
    resumeTimer: 'Resume timer',
    reopenStep: 'Reopen step',
    markDone: 'Mark step done',
    finishCooking: 'Finish cooking',
    panChecker: 'AI Pan Checker',
    finishLikeChef: 'Finish Like a Chef',
    timerContinues: 'Your timer keeps running unless you pause it.',
    finishSub: 'Taste balance, finishing touches, and plating come next.',
    finalCheck:
      'Final taste check: if anything feels off, open AI Pan Checker for a guided analysis and fix path without losing your place.',
  },
  hi: {
    step: 'कदम',
    of: 'में से',
    stillRunning: 'टाइमर अभी चल रहा है। अगर आप फिर भी आगे बढ़ना चाहते हैं, तो Next step दोबारा दबाएँ।',
    timeUp: 'इस स्टेप का समय पूरा हो गया है। क्यूज़ एक बार और देखें, फिर तैयार होने पर आगे बढ़ें।',
    openFullChat: 'पूरा चैट खोलें',
    openMic: 'Open mic',
    voiceRunning: 'टाइमर चलते हुए भी वॉइस गाइड साथ चलता रहेगा।',
    voicePaused: 'लाइव वॉइस हेल्प के लिए इस स्टेप को फिर शुरू करें।',
    voiceHelp: 'क्यूज़, टाइमिंग या क्या सुधारना है — उसके बारे में पूछें।',
    userPrompt: 'आप: अभी मुझे क्या देखना चाहिए?',
    pauseTimer: 'टाइमर रोकें',
    resumeTimer: 'टाइमर फिर चलाएँ',
    reopenStep: 'स्टेप फिर खोलें',
    markDone: 'स्टेप पूरा करें',
    finishCooking: 'कुकिंग पूरी करें',
    panChecker: 'AI Pan Checker',
    finishLikeChef: 'Finish Like a Chef',
    timerContinues: 'जब तक आप रोकेंगे नहीं, टाइमर चलता रहेगा।',
    finishSub: 'अब स्वाद संतुलन, अंतिम टच और प्लेटिंग आएगी।',
    finalCheck:
      'आखिरी स्वाद जाँच: अगर कुछ भी ठीक न लगे, तो AI Pan Checker खोलें और अपनी जगह खोए बिना गाइडेड फिक्स पाएँ।',
  },
  te: {
    step: 'దశ',
    of: 'లో',
    stillRunning: 'టైమర్ ఇంకా నడుస్తోంది. అయినా ముందుకు వెళ్లాలనుకుంటే Next step మళ్లీ నొక్కండి.',
    timeUp: 'ఈ దశ సమయం పూర్తైంది. క్యూస్‌ను మరోసారి చూసి, సిద్ధమైతే తదుపరి దశకు వెళ్లండి.',
    openFullChat: 'పూర్తి చాట్ తెరవండి',
    openMic: 'Open mic',
    voiceRunning: 'టైమర్ నడుస్తున్నప్పటికీ వాయిస్ గైడ్ కొనసాగుతుంది.',
    voicePaused: 'లైవ్ వాయిస్ సహాయం కోసం ఈ దశను మళ్లీ ప్రారంభించండి.',
    voiceHelp: 'క్యూస్, టైమింగ్ లేదా ఏమి సరిచేయాలో అడగండి.',
    userPrompt: 'మీరు: ఇప్పుడు నేను ఏమి గమనించాలి?',
    pauseTimer: 'టైమర్ ఆపండి',
    resumeTimer: 'టైమర్ మళ్లీ ప్రారంభించండి',
    reopenStep: 'దశ మళ్లీ తెరవండి',
    markDone: 'దశ పూర్తి చేయండి',
    finishCooking: 'వంట పూర్తి చేయండి',
    panChecker: 'AI Pan Checker',
    finishLikeChef: 'Finish Like a Chef',
    timerContinues: 'మీరు ఆపకపోతే టైమర్ కొనసాగుతుంది.',
    finishSub: 'ఇప్పుడు టేస్ట్ బ్యాలెన్స్, ఫైనల్ టచ్‌లు, ప్లేటింగ్ వస్తాయి.',
    finalCheck:
      'చివరి టేస్ట్ చెక్: ఏదైనా తప్పుగా అనిపిస్తే, AI Pan Checker తెరిచి మీ స్థానాన్ని కోల్పోకుండా గైడెడ్ ఫిక్స్ పొందండి.',
  },
} as const;

const CUE_LABELS = {
  en: { visual: 'Visual Cue', smell: 'Smell Cue', sound: 'Sound Cue', texture: 'Texture Cue' },
  hi: { visual: 'Visual Cue', smell: 'Smell Cue', sound: 'Sound Cue', texture: 'Texture Cue' },
  te: { visual: 'Visual Cue', smell: 'Smell Cue', sound: 'Sound Cue', texture: 'Texture Cue' },
} as const;

export default function DishCookPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();
  const copy = COPY[lang];
  const cueLabels = CUE_LABELS[lang];
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
      .map((cue) => `${cueLabels[cue.type as keyof typeof cueLabels] ?? cue.type}: ${cue.cue}`)
      .join(' ');
    return `${step.title}. ${sensory} Why this matters: ${step.whyThisMatters}`;
  }, [cueLabels, sensoryCards, step.title, step.whyThisMatters]);

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
        <div className="mx-auto mt-3 inline-flex rounded-full border border-border bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(254,245,236,0.96))] px-6 py-2.5 text-[18px] font-medium text-foreground shadow-soft">
          {copy.step} {step.index} {copy.of} {dish.cookingSteps.length}
        </div>
        <div className="mt-4 scale-110">
          <StepDots count={Math.min(dish.cookingSteps.length, 8)} active={Math.min(step.index, 8)} />
        </div>
      </div>

      <section className="mt-5 text-center">
        <h1 className="mx-auto max-w-[360px] text-[56px] font-serif leading-[0.92] tracking-[-0.06em]">{step.title}</h1>
        <p className="mx-auto mt-4 max-w-[360px] text-[19px] leading-8 text-muted-foreground">
          {step.instruction}
        </p>
      </section>

      <ScreenCard className="mt-6 overflow-hidden p-0">
        <div className="grid grid-cols-[1.05fr_1.05fr_0.9fr] gap-0 text-center">
          <div className="px-4 py-5">
            <div className="flex items-center justify-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
              <Flame className="h-4 w-4" />
              {t('cook.heat')}
            </div>
            <div className="mt-3 font-sans text-[28px] font-semibold tracking-[-0.05em] text-primary-dark">{step.heat}</div>
            <div className="mt-1 text-[12px] text-muted-foreground">{heatMeta.tempC.replace('C', ' degrees C')}</div>
            <div className="mt-3">
              <HeatMeter level={step.heat} tempLabel={heatMeta.tempLabel} />
            </div>
          </div>
          <div className="border-x border-border/60 px-4 py-5">
            <div className="flex items-center justify-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
              <TimerReset className="h-4 w-4" />
              {t('cook.timer')}
            </div>
            <div className="mt-3 font-sans text-[40px] font-semibold leading-none tracking-[-0.06em] text-primary tabular-nums">
              {formatCountdown(remainingSeconds)}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{t('cook.timeRemaining')}</div>
          </div>
          <div className="px-4 py-5">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">{t('cook.progress')}</div>
            <div className="mx-auto mt-3 flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-primary/80 bg-white/70 font-sans text-[31px] font-semibold tracking-[-0.05em] text-foreground shadow-inner tabular-nums">
              {progress}%
            </div>
          </div>
        </div>
      </ScreenCard>

      {skipIntent ? (
        <div className="mt-4 rounded-[22px] border border-secondary/55 bg-secondary-soft px-4 py-4 text-sm leading-6 text-foreground">
          {copy.stillRunning}
        </div>
      ) : null}

      {remainingSeconds === 0 ? (
        <div className="mt-4 rounded-[22px] border border-primary/30 bg-primary-soft/55 px-4 py-4 text-sm leading-6 text-primary-dark">
          {copy.timeUp}
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
            {voiceOpen ? copy.openFullChat : copy.openMic}
          </button>
        </div>
        <div className="mt-3 rounded-[22px] border border-border/60 bg-background px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-foreground">
                {isRunning ? copy.voiceRunning : copy.voicePaused}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{copy.voiceHelp}</div>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Mic className="h-5 w-5" />
            </span>
          </div>
          {voiceOpen ? (
            <div className="mt-4 space-y-2">
              <div className="rounded-[18px] bg-card px-3 py-3 text-sm text-foreground">ChefSense: {step.beginnerExplanation}</div>
              <div className="rounded-[18px] bg-primary-soft px-3 py-3 text-right text-sm text-primary-dark">{copy.userPrompt}</div>
              <div className="rounded-[18px] bg-card px-3 py-3 text-sm text-foreground">ChefSense: {voiceRecap}</div>
              <Link href={ROUTES.dishVoice(dish.dishId, step.index)} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                {copy.openFullChat} →
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
                  <div className="text-[16px] font-medium">{cueLabels[cue.type as keyof typeof cueLabels] ?? cue.type}</div>
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
          {isRunning ? copy.pauseTimer : copy.resumeTimer}
        </button>
        <button
          type="button"
          onClick={handlePrimaryAction}
          className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-primary/20 gradient-cta px-4 py-4 text-center text-[15px] font-medium text-white shadow-cta"
        >
          <ChefHat className="h-5 w-5" />
          {isCompleted ? copy.reopenStep : nextStep ? copy.markDone : copy.finishCooking}
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
          {copy.panChecker}
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
              <span className="font-serif text-[20px]">{nextStep ? t('cta.nextStep') : copy.finishLikeChef}</span>
              <span className="text-sm text-white/90">
                {nextStep ? copy.timerContinues : copy.finishSub}
              </span>
            </span>
          </span>
          <span className="text-lg">→</span>
        </button>
      </div>

      <div className="mt-4 rounded-[22px] border border-border bg-card px-4 py-4 text-sm leading-6 text-muted-foreground shadow-soft">
        {copy.finalCheck}
      </div>
    </AppShell>
  );
}
