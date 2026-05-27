'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ChefHat,
  Eye,
  Flame,
  LifeBuoy,
  MessageCircleMore,
  Mic,
  PauseCircle,
  PlayCircle,
  Send,
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
    timeUp:
      'Time for this step is up. Check the cues once more, then move on only when the pan looks ready.',
    openFullChat: 'Open full chat',
    openMic: 'Open mic',
    voiceRunning: 'Voice can keep guiding while the timer continues.',
    voicePaused: 'Start the timer or open voice help whenever you are ready.',
    voiceHelp:
      'Ask about cues, timing, pan choice, heat, or what to correct before moving ahead.',
    userPrompt: 'You: What should I look for now?',
    chatPlaceholder: 'Type a quick cooking question',
    pauseTimer: 'Pause timer',
    startTimer: 'Start timer',
    resumeTimer: 'Resume timer',
    reopenStep: 'Reopen step',
    markDone: 'Mark step done',
    finishCooking: 'Finish cooking',
    panChecker: 'AI Pan Checker',
    finalCheck:
      'Final taste check: if anything feels off, open AI Pan Checker for a guided analysis and fix path without losing your place.',
    markHint: 'Mark this step done below to unlock the next step.',
    prev: 'Prev',
    next: 'Next',
    voiceAssistant: 'Voice Cook Mode',
    nextReady: 'Next step unlocked above',
    timerHint: 'Start the timer only when you begin actively cooking this step.',
  },
  hi: {
    step: 'कदम',
    of: 'में से',
    timeUp:
      'इस स्टेप का समय पूरा हो गया है। क्यूज़ एक बार और देखें, फिर पैन सही लगे तो आगे बढ़ें।',
    openFullChat: 'पूरा चैट खोलें',
    openMic: 'Open mic',
    voiceRunning: 'टाइमर चलते हुए भी वॉइस गाइड साथ चलता रहेगा।',
    voicePaused: 'जब आप तैयार हों तब टाइमर या वॉइस हेल्प शुरू करें।',
    voiceHelp: 'क्यूज़, टाइमिंग, सही पैन, हीट, या क्या सुधारना है उसके बारे में पूछें।',
    userPrompt: 'आप: अभी मुझे क्या देखना चाहिए?',
    chatPlaceholder: 'अपना कुकिंग सवाल लिखें',
    pauseTimer: 'टाइमर रोकें',
    startTimer: 'टाइमर शुरू करें',
    resumeTimer: 'टाइमर फिर चलाएँ',
    reopenStep: 'स्टेप फिर खोलें',
    markDone: 'स्टेप पूरा करें',
    finishCooking: 'कुकिंग पूरी करें',
    panChecker: 'AI Pan Checker',
    finalCheck:
      'आख़िरी स्वाद जाँच: अगर कुछ भी ठीक न लगे, तो AI Pan Checker खोलें और अपनी जगह खोए बिना guided fix पाएँ।',
    markHint: 'अगला स्टेप खोलने के लिए नीचे Mark step done दबाएँ।',
    prev: 'पीछे',
    next: 'आगे',
    voiceAssistant: 'Voice Cook Mode',
    nextReady: 'अगला स्टेप ऊपर खुल गया है',
    timerHint: 'जब आप सच में यह स्टेप शुरू करें, तभी टाइमर चालू करें।',
  },
  te: {
    step: 'దశ',
    of: 'లో',
    timeUp:
      'ఈ దశ సమయం పూర్తైంది. క్యూ‌లను మరోసారి చూసి, పాన్ సిద్ధంగా కనిపిస్తేనే ముందుకు వెళ్లండి.',
    openFullChat: 'పూర్తి చాట్ తెరవండి',
    openMic: 'Open mic',
    voiceRunning: 'టైమర్ నడుస్తున్నప్పటికీ వాయిస్ గైడ్ కొనసాగుతుంది.',
    voicePaused: 'మీరు సిద్ధమైనప్పుడు టైమర్ లేదా వాయిస్ సహాయాన్ని ప్రారంభించండి.',
    voiceHelp: 'క్యూ‌లు, టైమింగ్, సరైన పాన్, హీట్, లేదా ఏం సరిచేయాలో అడగండి.',
    userPrompt: 'మీరు: ఇప్పుడు నేను ఏమి గమనించాలి?',
    chatPlaceholder: 'మీ కుకింగ్ ప్రశ్నను టైప్ చేయండి',
    pauseTimer: 'టైమర్ ఆపండి',
    startTimer: 'టైమర్ ప్రారంభించండి',
    resumeTimer: 'టైమర్ మళ్లీ ప్రారంభించండి',
    reopenStep: 'దశ మళ్లీ తెరవండి',
    markDone: 'దశ పూర్తి చేయండి',
    finishCooking: 'వంట పూర్తి చేయండి',
    panChecker: 'AI Pan Checker',
    finalCheck:
      'చివరి టేస్ట్ చెక్: ఏదైనా తప్పుగా అనిపిస్తే, AI Pan Checker తెరిచి మీ స్థానాన్ని కోల్పోకుండా guided fix పొందండి.',
    markHint: 'తదుపరి దశకు వెళ్లడానికి ముందు కింద Mark step done నొక్కండి.',
    prev: 'వెనక్కి',
    next: 'తర్వాత',
    voiceAssistant: 'Voice Cook Mode',
    nextReady: 'తదుపరి దశ పైభాగంలో తెరుచుకుంది',
    timerHint: 'ఈ దశను నిజంగా మొదలుపెట్టినప్పుడు మాత్రమే టైమర్ ప్రారంభించండి.',
  },
} as const;

const CUE_LABELS = {
  en: { visual: 'Visual Cue', smell: 'Smell Cue', sound: 'Sound Cue', texture: 'Texture Cue' },
  hi: { visual: 'Visual Cue', smell: 'Smell Cue', sound: 'Sound Cue', texture: 'Texture Cue' },
  te: { visual: 'Visual Cue', smell: 'Smell Cue', sound: 'Sound Cue', texture: 'Texture Cue' },
} as const;

const CUE_PALETTE = {
  visual: {
    text: 'text-accent-green',
    bg: 'bg-[linear-gradient(180deg,rgba(240,247,231,0.96),rgba(251,252,247,0.98))]',
    bubble: 'bg-accent-green-soft',
  },
  smell: {
    text: 'text-[#8a9a46]',
    bg: 'bg-[linear-gradient(180deg,rgba(245,247,229,0.96),rgba(252,252,246,0.98))]',
    bubble: 'bg-[rgba(229,238,197,0.9)]',
  },
  sound: {
    text: 'text-copper',
    bg: 'bg-[linear-gradient(180deg,rgba(255,245,234,0.96),rgba(255,251,247,0.98))]',
    bubble: 'bg-primary-soft',
  },
  texture: {
    text: 'text-primary-dark',
    bg: 'bg-[linear-gradient(180deg,rgba(255,241,232,0.96),rgba(255,250,246,0.98))]',
    bubble: 'bg-[rgba(255,228,212,0.9)]',
  },
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

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [timeAlerted, setTimeAlerted] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);

  useEffect(() => {
    recordRecentlyViewedDish(dish.dishId);
  }, [dish.dishId]);

  const elapsedSeconds = getElapsedForStep(step.index);
  const remainingSeconds = Math.max(0, step.durationSec - elapsedSeconds);
  const isRunning = session.runningStep === step.index;
  const isCompleted = session.completedSteps.includes(step.index);
  const progress = getStepProgress(step.index, session.completedSteps, dish.cookingSteps.length);
  const heatMeta = getHeatMeta(step.heat);
  const sensoryCards = getStructuredCues(step.title, step.sensoryCues);

  useEffect(() => {
    if (elapsedSeconds <= 0 || remainingSeconds !== 0 || timeAlerted) return;
    playSoundEffect('stop');
    setTimeAlerted(true);
  }, [elapsedSeconds, remainingSeconds, timeAlerted]);

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

  function handlePrimaryAction() {
    if (isCompleted) {
      playSoundEffect('tap');
      reopenStep(step.index);
      return;
    }

    playSoundEffect('check');
    if (nextStep) {
      markStepComplete(step.index, nextStep.index);
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

  function sendChatPrompt() {
    const trimmed = chatDraft.trim();
    if (!trimmed) return;
    setChatMessages((current) =>
      [...current, `You: ${trimmed}`, `ChefSense: ${buildReply(trimmed, step.title)}`].slice(-4),
    );
    setChatDraft('');
    if (!isRunning && !isCompleted) {
      startStep(step.index);
    }
  }

  const progressColor =
    progress < 40 ? 'text-primary' : progress < 75 ? 'text-copper' : 'text-accent-green';
  const progressRing =
    progress < 40 ? 'border-primary/80' : progress < 75 ? 'border-secondary' : 'border-accent-green';

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
        <div className="mx-auto mt-3 flex max-w-[360px] items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => prevStep && router.push(ROUTES.dishCook(dish.dishId, prevStep.index))}
            disabled={!prevStep}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-soft disabled:opacity-45"
          >
            {copy.prev}
          </button>
          <div className="inline-flex rounded-full border border-border bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(254,245,236,0.96))] px-6 py-2.5 font-sans text-[20px] font-semibold text-foreground shadow-soft tabular-nums">
            {copy.step} {step.index} {copy.of} {dish.cookingSteps.length}
          </div>
          <button
            type="button"
            onClick={() => nextStep && router.push(ROUTES.dishCook(dish.dishId, nextStep.index))}
            disabled={!nextStep || !isCompleted}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-soft disabled:opacity-45"
          >
            {copy.next}
          </button>
        </div>
        <div className="mt-4 scale-110">
          <StepDots count={Math.min(dish.cookingSteps.length, 8)} active={Math.min(step.index, 8)} />
        </div>
      </div>

      {!isCompleted && nextStep ? (
        <div className="mt-3 text-center text-sm text-muted-foreground">{copy.markHint}</div>
      ) : null}

      <section className="mt-5 text-center">
        <h1 className="mx-auto max-w-[360px] text-[58px] font-serif leading-[0.9] tracking-[-0.06em]">{step.title}</h1>
        <p className="mx-auto mt-4 max-w-[360px] text-[19px] leading-8 text-muted-foreground">{step.instruction}</p>
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
            <div className={`mx-auto mt-3 flex h-24 w-24 items-center justify-center rounded-full border-[6px] ${progressRing} bg-white/70 font-sans text-[31px] font-semibold tracking-[-0.05em] ${progressColor} shadow-inner tabular-nums`}>
              {progress}%
            </div>
          </div>
        </div>
      </ScreenCard>

      {elapsedSeconds > 0 && remainingSeconds === 0 ? (
        <div className="mt-4 rounded-[22px] border border-primary/30 bg-primary-soft/55 px-4 py-4 text-sm leading-6 text-primary-dark">
          {copy.timeUp}
        </div>
      ) : null}

      <ScreenCard className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow icon={Mic} label={copy.voiceAssistant} className="mb-0" />
          <button
            type="button"
            onClick={() => {
              if (!isRunning && !isCompleted) startStep(step.index);
              setVoiceOpen((current) => !current);
            }}
            className="rounded-full border border-primary/25 px-4 py-2 text-sm font-semibold text-primary"
          >
            {voiceOpen ? copy.openFullChat : copy.openMic}
          </button>
        </div>
        <div className="mt-3 rounded-[22px] border border-border/60 bg-background px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-foreground">{isRunning ? copy.voiceRunning : copy.voicePaused}</div>
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
              {chatMessages.map((message) => (
                <div
                  key={message}
                  className={
                    message.startsWith('You:')
                      ? 'rounded-[18px] bg-primary-soft px-3 py-3 text-right text-sm text-primary-dark'
                      : 'rounded-[18px] bg-card px-3 py-3 text-sm text-foreground'
                  }
                >
                  {message}
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-[18px] border border-border/60 bg-background px-3 py-2">
                <MessageCircleMore className="h-4 w-4 text-primary" />
                <input
                  value={chatDraft}
                  onChange={(event) => setChatDraft(event.target.value)}
                  placeholder={copy.chatPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={sendChatPrompt}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
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
            const palette = CUE_PALETTE[cue.type as keyof typeof CUE_PALETTE] ?? CUE_PALETTE.visual;
            return (
              <ScreenCard key={`${cue.type}-${cue.cue}`} className={`border border-secondary/35 p-4 ${palette.bg}`}>
                <div className={`flex items-center gap-2 ${palette.text}`}>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${palette.bubble}`}>
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
          {isRunning ? copy.pauseTimer : elapsedSeconds > 0 ? copy.resumeTimer : copy.startTimer}
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

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href={ROUTES.dishPanCheck(dish.dishId, step.index)}
          className="inline-flex items-center justify-center rounded-[22px] border border-border bg-card px-3 py-4 text-center text-[15px] font-medium text-foreground shadow-soft"
        >
          <LifeBuoy className="mr-2 h-4 w-4 text-primary" />
          {copy.panChecker}
        </Link>
        {isCompleted ? (
          <Link
            href={nextStep ? ROUTES.dishCook(dish.dishId, nextStep.index) : ROUTES.dishFinish(dish.dishId)}
            className="inline-flex items-center justify-center rounded-[22px] border border-primary/20 gradient-cta px-4 py-4 text-center text-[15px] font-medium text-white shadow-cta"
          >
            {nextStep ? copy.next : copy.finishCooking}
          </Link>
        ) : (
          <div className="inline-flex items-center justify-center rounded-[22px] border border-border/70 bg-background px-4 py-4 text-center text-[15px] font-medium text-muted-foreground">
            {copy.markHint}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-[22px] border border-border bg-card px-4 py-4 text-sm leading-6 text-muted-foreground shadow-soft">
        {copy.finalCheck}
      </div>

      {!isRunning && !isCompleted ? (
        <div className="mt-3 text-center text-sm text-muted-foreground">{copy.timerHint}</div>
      ) : null}
    </AppShell>
  );
}

function buildReply(input: string, stepTitle: string) {
  const lower = input.toLowerCase();
  if (lower.includes('pan')) {
    return `Use the pan mentioned for ${stepTitle.toLowerCase()} and keep the flame exactly where the heat card shows before moving ahead.`;
  }
  if (lower.includes('sticking') || lower.includes('stick')) {
    return 'Lower the heat slightly, add a spoon of hot water, and scrape gently so the masala loosens without burning.';
  }
  if (lower.includes('look') || lower.includes('ready')) {
    return `For ${stepTitle.toLowerCase()}, watch the sensory cues on screen first - colour, aroma, sound, and texture should all line up before you move on.`;
  }
  return 'Keep following the on-screen cues. If something looks off, ask about colour, texture, aroma, or pan control and ChefSense will guide you.';
}
