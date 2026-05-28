'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Mic, Send, Square, Volume2, Waves } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { ScreenCard } from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { API_ROUTES, ROUTES } from '@/lib/constants/routes';
import { formatCountdown } from '@/lib/dish-flow';
import { useCookingSession } from '@/lib/cooking-session';
import { useLanguage } from '@/lib/i18n/language-context';

type BrowserRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type VoiceMessage = {
  role: 'assistant' | 'user';
  text: string;
  time: string;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => BrowserRecognition;
    SpeechRecognition?: new () => BrowserRecognition;
  }
}

export default function DishVoicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, t } = useLanguage();
  const dish = getDishOrThrow(params.id);
  const requestedStep = Number(searchParams.get('step') ?? 1);
  const step = dish.cookingSteps.find((item) => item.index === requestedStep) ?? dish.cookingSteps[0];

  const { getElapsedForStep } = useCookingSession(dish.dishId, step.index);
  const remainingSeconds = Math.max(0, step.durationSec - getElapsedForStep(step.index));

  const recognitionRef = useRef<BrowserRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [draft, setDraft] = useState('');
  const [replyPending, setReplyPending] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([
    { role: 'assistant' as const, text: step.instruction, time: nowTime() },
    {
      role: 'assistant' as const,
      text: step.beginnerExplanation,
      time: nowTime(),
    },
  ]);

  const locale = useMemo(() => {
    if (lang === 'hi') return 'hi-IN';
    if (lang === 'te') return 'te-IN';
    return 'en-IN';
  }, [lang]);

  const cueNarration = useMemo(() => {
    const cues = step.sensoryCues
      .map((cue) => `${cue.type} cue: ${cue.cue}`)
      .join(' ');
    return `${step.title}. ${cues}. Why this matters: ${step.whyThisMatters}`;
  }, [step]);

  useEffect(() => {
    const SpeechCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechCtor) return;

    const recognition = new SpeechCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = locale;
    recognition.onresult = (event) => {
      const heard = event.results[0]?.[0]?.transcript?.trim();
      if (!heard) return;
      setMessages((current) => [...current, { role: 'user', text: heard, time: nowTime() }]);
      void sendQuestion(heard);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [dish.dishId, locale, step.beginnerExplanation, step.index, step.title]);

  useEffect(() => {
    if (!speakerOn) return;
    const lastAssistant = [...messages].reverse().find((item) => item.role === 'assistant');
    if (!lastAssistant) return;
    const utterance = new SpeechSynthesisUtterance(lastAssistant.text);
    utterance.lang = locale;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [locale, messages, speakerOn]);

  function startListening() {
    if (!recognitionRef.current) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: 'Browser voice input is not available here yet. You can still continue the cooking steps on screen.',
          time: nowTime(),
        },
      ]);
      return;
    }
    setIsListening(true);
    recognitionRef.current.lang = locale;
    recognitionRef.current.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function narrateCurrentCues() {
    setMessages((current) => [
      ...current,
      { role: 'assistant', text: cueNarration, time: nowTime() },
    ]);
  }

  async function sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;

    setReplyPending(true);

    try {
      const response = await fetch(API_ROUTES.voiceCoach, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dishId: dish.dishId,
          currentStep: step.index,
          question: trimmed,
          locale,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; reply?: string; warning?: string }
        | null;

      const reply =
        response.ok && payload?.reply?.trim()
          ? payload.reply.trim()
          : buildReply(trimmed, step.title);

      setMessages((current) => [...current, { role: 'assistant', text: reply, time: nowTime() }]);

      const warning = typeof payload?.warning === 'string' ? payload.warning.trim() : '';
      if (warning) {
        setMessages((current) => [
          ...current,
          { role: 'assistant', text: warning, time: nowTime() },
        ]);
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: buildReply(trimmed, step.title),
          time: nowTime(),
        },
      ]);
    } finally {
      setReplyPending(false);
    }
  }

  function handleSendDraft() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setMessages((current) => [...current, { role: 'user', text: trimmed, time: nowTime() }]);
    setDraft('');
    void sendQuestion(trimmed);
  }

  return (
    <AppShell showBottomNav={false} className="pb-12">
      <Header
        backHref={ROUTES.dishCook(dish.dishId, step.index)}
        showBrand={false}
        title={dish.dishName}
        actions={[{ icon: Waves, label: t('cook.exit'), href: ROUTES.home }]}
      />

      <ScreenCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[15px] font-medium text-primary">
              {t('cook.step')} {step.index} {t('cook.of')} {dish.cookingSteps.length}
            </div>
            <h1 className="mt-2 text-[28px] leading-none">{t('voice.title')}</h1>
            <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
              Ask follow-up questions without leaving the live cooking screen.
            </p>
          </div>
          <div className="min-w-[92px] text-right">
            <div className="text-sm text-muted-foreground">{t('voice.estTimeLeft')}</div>
            <div className="mt-2 font-serif text-[34px] leading-none text-primary">
              {formatCountdown(remainingSeconds)}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{t('common.min')}</div>
          </div>
        </div>
      </ScreenCard>

      <section className="mt-6 text-center">
        <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full border border-primary/25 bg-primary-soft/40 shadow-[0_0_0_18px_rgba(245,156,96,0.08),0_0_0_36px_rgba(245,156,96,0.04)]">
          <div className="text-center">
            <div className="mx-auto h-10 w-24 rounded-full border border-primary/30 bg-white/70" />
            <div className="mt-6 text-[20px] font-medium text-primary">
              {isListening ? t('voice.listening') : 'Ready to help'}
            </div>
            <div className="mt-1 text-muted-foreground">
              {isListening ? t('voice.speakNaturally') : 'Tap the mic and ask your next cooking question.'}
            </div>
          </div>
        </div>
      </section>

      <ScreenCard className="mt-6">
        <div className="rounded-[22px] border border-border/60 bg-background px-4 py-3">
          <div className="text-[15px] font-medium text-primary">{step.title}</div>
          <div className="mt-2 text-[16px] leading-7 text-muted-foreground">{step.beginnerExplanation}</div>
          <button
            type="button"
            onClick={narrateCurrentCues}
            className="mt-4 rounded-full border border-primary/25 px-4 py-2 text-sm font-semibold text-primary"
          >
            Narrate cues and why this matters
          </button>
        </div>
      </ScreenCard>

      <ScreenCard className="mt-4">
        <div className="rounded-[24px] border border-border/70 bg-white/85 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[15px] font-medium text-primary">Quick chef chat</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Type a question if you do not want to use voice right now.
              </div>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft/45 text-primary">
              <Send className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-border/70 bg-background px-3 py-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSendDraft();
                }
              }}
              placeholder="Ask about texture, smell, heat, or what to do next."
              className="h-11 flex-1 border-0 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={handleSendDraft}
              disabled={!draft.trim() || replyPending}
              className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-secondary to-primary px-4 text-sm font-semibold text-white shadow-cta disabled:cursor-not-allowed disabled:opacity-55"
            >
              Ask
            </button>
          </div>
        </div>
      </ScreenCard>

      <ScreenCard className="mt-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === 'assistant'
                ? 'max-w-[88%] rounded-[22px] bg-white/75 px-4 py-4'
                : 'ml-auto max-w-[78%] rounded-[22px] bg-primary-soft/55 px-4 py-3 text-right'
            }
          >
            <div className="text-[17px] leading-8 text-foreground">{message.text}</div>
            <div className="mt-2 text-xs text-muted-foreground">{message.time}</div>
          </div>
        ))}
        {replyPending ? (
          <div className="max-w-[88%] rounded-[22px] bg-white/75 px-4 py-4">
            <div className="text-[17px] leading-8 text-foreground">ChefSense is thinking...</div>
            <div className="mt-2 text-xs text-muted-foreground">{nowTime()}</div>
          </div>
        ) : null}
      </ScreenCard>

      <div className="mt-6 flex items-end justify-between gap-3">
        <button
          type="button"
          onClick={() => setSpeakerOn((current) => !current)}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-border bg-white/80">
            <Volume2 className="h-6 w-6" />
          </span>
          <span className="text-sm">{speakerOn ? 'Speaker on' : t('voice.speaker')}</span>
        </button>
        <button type="button" onClick={startListening} className="flex flex-col items-center gap-2">
          <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-secondary to-primary text-white shadow-cta">
            <Mic className="h-10 w-10" />
          </span>
          <span className="text-base font-medium text-foreground">{t('voice.tapToSpeak')}</span>
        </button>
        <button type="button" onClick={stopListening} className="flex flex-col items-center gap-2 text-primary">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-white/80">
            <Square className="h-5 w-5 fill-current" />
          </span>
          <span className="text-sm">{t('voice.stop')}</span>
        </button>
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => router.push(ROUTES.dishCook(dish.dishId, step.index))}
          className="w-full rounded-[24px] border border-border bg-card px-5 py-4 text-[16px] font-medium text-foreground"
        >
          Return to live cook screen
        </button>
      </div>
    </AppShell>
  );
}

function nowTime() {
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
}

function buildReply(input: string, stepTitle: string) {
  const lower = input.toLowerCase();
  if (lower.includes('sticking') || lower.includes('stick')) {
    return 'Lower the heat slightly, add a spoon of hot water, and scrape gently so the masala loosens without burning.';
  }
  if (lower.includes('look') || lower.includes('ready')) {
    return `For ${stepTitle.toLowerCase()}, watch for thicker bubbles, deeper colour, and a richer aroma before you move on.`;
  }
  return 'Keep following the on-screen cues. If something looks off, ask about colour, texture, or aroma and ChefSense will guide you.';
}
