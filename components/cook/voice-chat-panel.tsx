'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MessageCircleMore,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  ShieldOff,
  Square,
  Volume2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { getSupabaseSession } from '@/lib/persistence/supabase-browser';
import type { LanguageCode } from '@/lib/i18n/dictionary';

// ─── Types ───────────────────────────────────────────────────────────────────

type VoiceChatPanelProps = {
  dishId: string;
  stepIndex: number;
  stepTitle: string;
  primer: string;
  expanded: boolean;
  collapsedHint: string;
  expandedHint: string;
  helperHint: string;
  placeholder: string;
  /** Called when the AI or user signals moving to the next step. */
  onNextStep?: () => void;
  /** Whether there is a next step to navigate to. */
  hasNextStep?: boolean;
  hasPrevStep?: boolean;
  onPrevStep?: () => void;
  remainingSeconds?: number;
  isTimerRunning?: boolean;
  onStartTimer?: () => void;
  onPauseTimer?: () => void;
};

type MicErrorType = 'overlay' | 'denied' | 'notfound' | 'generic';
type MicError = { type: MicErrorType; message: string; retryable: boolean };

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  source?: 'openai' | 'fallback' | 'voice';
};

type VoiceFallbackResponse = {
  ok?: boolean;
  source?: string;
  transcript?: string;
  reply?: string;
  error?: string;
  message?: string;
};

type VoiceCoachResponse = {
  ok: boolean;
  source?: 'openai' | 'fallback';
  reply?: string;
  error?: string;
};

// ─── Command detection ────────────────────────────────────────────────────────

// Tighter next-step detection — avoid false positives from questions about next step
const NEXT_STEP_TRIGGERS = [
  // Direct navigation requests
  'go to next step', 'take me to next step', 'move to next step',
  'skip to next step', 'proceed to next step', 'continue to next step',
  'go ahead to the next', 'go ahead to next', 'please go ahead',
  'go on to the next', 'let\'s move to next', 'let\'s go to next',
  'ready for next step', 'next step please',
  // "done" phrasing — only with explicit action request
  "i'm done, go", "i am done, go", 'done, please proceed', 'done, go to next',
];
// Previous step detection
const PREV_STEP_TRIGGERS = [
  'go back to', 'go to previous', 'take me back to', 'previous step please',
  'back to the previous', 'go back a step', 'back one step',
];
// Timer commands
const START_TIMER_TRIGGERS = ['start the timer', 'start timer', 'begin timer', 'start the clock', 'start counting'];
const PAUSE_TIMER_TRIGGERS = ['pause the timer', 'pause timer', 'stop the timer', 'stop timer'];
const TIME_REMAINING_TRIGGERS = ['how much time', 'time left', 'how long left', 'how long remaining', 'how many minutes left', 'how many seconds'];
// Pan check commands — broad enough to catch natural phrasings
const PAN_CHECK_TRIGGERS = [
  'check my pan', 'check pan', 'check the pan', 'pan checker',
  'analyse my pan', 'analyze my pan', 'analyse the pan', 'analyze the pan',
  'how does my pan', 'how is my pan', 'pan looking', 'look at my pan',
  'use the pan checker', 'open pan checker', 'pan analysis',
];

/**
 * Secondary check: if the user expressed forward intent AND the AI reply
 * explicitly references the next step number, treat it as navigation.
 * Catches phrases like 'Can we go to step 2?' that don't hit keyword triggers.
 */
function aiConfirmsNextStep(userText: string, aiReply: string, currentStepIndex: number): boolean {
  const u = userText.toLowerCase();
  const a = aiReply.toLowerCase();
  const USER_FORWARD = [
    'go to step', 'can we go', 'step 2', 'step 3', 'step 4', 'step 5',
    'step 6', 'step 7', 'step 8', 'step 9', 'step 10', 'step 11', 'step 12',
    'next', 'move on', 'done', 'proceed', 'continue', 'finished', 'ready',
    'i am done', "i'm done", 'yes', 'sure', 'please',
  ];
  if (!USER_FORWARD.some(h => u.includes(h))) return false;
  const nextStep = currentStepIndex + 1;
  return a.includes('step ' + nextStep + ':') || a.includes('step ' + nextStep + ' ');
}

function detectCommand(text: string): 'next' | 'prev' | 'start_timer' | 'pause_timer' | 'time_remaining' | 'pan_check' | null {
  const lower = text.toLowerCase();
  if (NEXT_STEP_TRIGGERS.some(p => lower.includes(p))) return 'next';
  if (PREV_STEP_TRIGGERS.some(p => lower.includes(p))) return 'prev';
  if (START_TIMER_TRIGGERS.some(p => lower.includes(p))) return 'start_timer';
  if (PAUSE_TIMER_TRIGGERS.some(p => lower.includes(p))) return 'pause_timer';
  if (TIME_REMAINING_TRIGGERS.some(p => lower.includes(p))) return 'time_remaining';
  if (PAN_CHECK_TRIGGERS.some(p => lower.includes(p))) return 'pan_check';
  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function localeFromLang(lang: LanguageCode): 'en' | 'hi' | 'te' {
  return lang === 'hi' || lang === 'te' ? lang : 'en';
}

async function classifyMicError(err: unknown): Promise<MicError> {
  const domErr = err instanceof DOMException ? err : null;
  const name = domErr?.name ?? '';
  const msg = domErr?.message?.toLowerCase() ?? '';
  if (name === 'NotAllowedError' && (msg.includes('overlay') || msg.includes('bubble'))) {
    return { type: 'overlay', message: 'Close any floating apps or chat bubbles, then tap Talk to chef again.', retryable: true };
  }
  if (name === 'NotAllowedError') {
    try {
      const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (status.state === 'denied') {
        return { type: 'denied', message: 'Microphone blocked. Open browser settings, allow the mic, then reload.', retryable: false };
      }
    } catch { /* ignore */ }
    return { type: 'overlay', message: 'A floating app blocked the mic. Close overlays and try again.', retryable: true };
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return { type: 'notfound', message: 'No microphone found. Use the Chat tab below.', retryable: false };
  }
  return { type: 'generic', message: 'Could not access the microphone. Use the Chat tab.', retryable: false };
}

/** Play audio bytes via Web Audio API — lower latency than blob URL + <Audio>. */
async function playAudioBuffer(
  buffer: ArrayBuffer,
  ctxRef: React.MutableRefObject<AudioContext | null>,
) {
  if (typeof window === 'undefined' || buffer.byteLength === 0) return;
  if (!ctxRef.current || ctxRef.current.state === 'closed') {
    ctxRef.current = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  const ctx = ctxRef.current;
  if (ctx.state === 'suspended') await ctx.resume();
  const decoded = await ctx.decodeAudioData(buffer.slice(0)); // slice prevents detached buffer error
  const source = ctx.createBufferSource();
  source.buffer = decoded;
  source.connect(ctx.destination);
  source.start(0);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VoiceChatPanel({
  dishId,
  stepIndex,
  stepTitle,
  primer,
  expanded,
  collapsedHint,
  expandedHint,
  helperHint,
  placeholder,
  onNextStep,
  hasNextStep,
  hasPrevStep,
  onPrevStep,
  remainingSeconds,
  isTimerRunning,
  onStartTimer,
  onPauseTimer,
}: VoiceChatPanelProps) {
  const { lang } = useLanguage();
  const locale = localeFromLang(lang);

  // ── Chat state — persisted per dish ──
  const chatStorageKey = `chefsense.chat.${dishId}`;
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(`chefsense.chat.${dishId}`);
      if (raw) return JSON.parse(raw) as ChatMessage[];
    } catch { /* ignore */ }
    return [];
  });

  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatActive, setChatActive] = useState(false);
  const [chatFocusKey, setChatFocusKey] = useState(0);

  // ── Voice recording state ──
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState<MicError | null>(null);

  // ── Next-step navigation prompt ──
  const [showNextStep, setShowNextStep] = useState(false);

  // ── Pan check and fallback tracking ──
  const [showPanCheckOption, setShowPanCheckOption] = useState(false);
  const [consecutiveFallbacks, setConsecutiveFallbacks] = useState(0);

  // ── Refs ──
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<BlobPart[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const greetedRef = useRef(false);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // ── Persist messages ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(chatStorageKey, JSON.stringify(chatMessages.slice(-40))); }
    catch { /* ignore */ }
  }, [chatMessages, chatStorageKey]);

  // ── Auto-scroll to latest message ──
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages, pending]);

  // ── Seed primer ──
  useEffect(() => {
    if (!expanded) return;
    if (greetedRef.current && chatMessages.length > 0) return;
    greetedRef.current = true;
    setChatMessages((c) => c.length > 0 ? c : [{ id: `primer-${stepIndex}`, role: 'assistant', text: primer }]);
  }, [expanded, primer, stepIndex, chatMessages.length]);

  // ── Close panel → also collapse chat ──
  useEffect(() => {
    if (!expanded) setChatActive(false);
  }, [expanded]);

  // ── Clear error on step change ──
  useEffect(() => { setChatError(null); setShowNextStep(false); setShowPanCheckOption(false); setConsecutiveFallbacks(0); }, [stepIndex]);

  // ── Auto-focus ──
  useEffect(() => {
    if (chatFocusKey === 0) return;
    const id = window.setTimeout(() => chatInputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [chatFocusKey]);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      audioStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // TTS helper — speaks any text via ElevenLabs
  // ─────────────────────────────────────────────────────────────────────────

  const speakText = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setSpeaking(true);
    try {
      const resp = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, locale }),
      });
      if (resp.ok && resp.body) {
        const buf = await resp.arrayBuffer();
        await playAudioBuffer(buf, audioCtxRef);
      }
    } catch { /* best-effort */ }
    finally { setSpeaking(false); }
  }, [locale]);

  // ─────────────────────────────────────────────────────────────────────────
  // Voice pipeline
  // ─────────────────────────────────────────────────────────────────────────

  const processVoicePipeline = useCallback(async (blob: Blob) => {
    if (pending) return;
    setPending(true);
    setChatError(null);
    let userSaid = '';
    let aiSaid = '';

    try {
      const session = getSupabaseSession();
      const history = chatMessages.slice(-6).map((m) => ({ role: m.role, text: m.text }));
      const form = new FormData();
      form.append('audio', blob, 'cooking-command.webm');
      form.append('dishId', dishId);
      form.append('stepIndex', String(stepIndex));
      form.append('locale', locale);
      form.append('history', JSON.stringify(history));

      const resp = await fetch('/api/cook/voice-command', {
        method: 'POST',
        headers: session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : undefined,
        body: form,
      });

      if (!resp.ok) {
        const errBody = (await resp.json().catch(() => ({}))) as { message?: string };
        throw new Error(errBody.message ?? `HTTP ${resp.status}`);
      }

      const contentType = resp.headers.get('Content-Type') ?? '';

      if (contentType.includes('audio/')) {
        userSaid = decodeURIComponent(resp.headers.get('X-Chef-Transcript') ?? '');
        aiSaid = decodeURIComponent(resp.headers.get('X-Chef-Reply') ?? '');
        if (userSaid) setChatMessages((c) => [...c, { id: newId(), role: 'user', text: userSaid, source: 'voice' }]);
        if (aiSaid) setChatMessages((c) => [...c, { id: newId(), role: 'assistant', text: aiSaid, source: 'openai' }]);
        const buf = await resp.arrayBuffer();
        if (buf.byteLength > 0) await playAudioBuffer(buf, audioCtxRef);
      } else {
        const payload = (await resp.json()) as VoiceFallbackResponse;
        userSaid = payload.transcript ?? '';
        aiSaid = payload.reply ?? '';
        if (userSaid) setChatMessages((c) => [...c, { id: newId(), role: 'user', text: userSaid, source: 'voice' }]);
        if (aiSaid) {
          setChatMessages((c) => [...c, { id: newId(), role: 'assistant', text: aiSaid, source: 'openai' }]);
          // Speak the reply via TTS since the voice-command path didn't return audio
          void speakText(aiSaid);
        }
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Could not process voice. Try again.');
      setPending(false);
      return;
    }
    setPending(false);
    // Auto-open the chat thread so the user sees the result immediately
    // without having to tap "Open voice & chat" manually.
    setChatActive(true);

    // Check for app-level commands from voice transcript
    if (userSaid) {
      const cmd = detectCommand(userSaid);
      if (cmd === 'next' && hasNextStep && onNextStep) {
        setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: "Moving to the next step now! 🍳", source: 'openai' }]);
        void speakText("Moving to the next step now!");
        window.setTimeout(() => onNextStep!(), 800);
        return;
      }
      if (cmd === 'prev' && hasPrevStep && onPrevStep) {
        setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: "Going back to the previous step.", source: 'openai' }]);
        void speakText("Going back to the previous step.");
        window.setTimeout(() => onPrevStep!(), 800);
        return;
      }
      if (cmd === 'start_timer' && onStartTimer) {
        setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: "Timer started! I'll keep track of time for you.", source: 'openai' }]);
        void speakText("Timer started!");
        onStartTimer();
        return;
      }
      if (cmd === 'pause_timer' && onPauseTimer) {
        setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: "Timer paused.", source: 'openai' }]);
        void speakText("Timer paused.");
        onPauseTimer();
        return;
      }
      if (cmd === 'time_remaining') {
        const mins = Math.floor((remainingSeconds ?? 0) / 60);
        const secs = (remainingSeconds ?? 0) % 60;
        const timeStr = mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''} and ${secs} second${secs !== 1 ? 's' : ''}` : `${secs} second${secs !== 1 ? 's' : ''}`;
        const reply = remainingSeconds && remainingSeconds > 0
          ? `You have ${timeStr} remaining on this step.`
          : isTimerRunning ? "The timer is running — check the countdown on your screen." : "The timer hasn't started yet. Say 'start timer' or tap the Start button.";
        setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: reply, source: 'openai' }]);
        void speakText(reply);
        return;
      }
      if (cmd === 'pan_check') {
        const panReply = "I can help check your pan! Tap the AI Pan Checker button below, or upload a photo right here and I'll analyse it for this step.";
        setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: panReply, source: 'openai' }]);
        void speakText("I can help check your pan! Tap the AI Pan Checker button below to upload a photo.");
        setShowPanCheckOption(true);
        return;
      }
    }

    // Secondary navigation check: user phrased it naturally and AI confirmed the next step
    if (userSaid && aiSaid && hasNextStep && onNextStep && !detectCommand(userSaid)) {
      if (aiConfirmsNextStep(userSaid, aiSaid, stepIndex)) {
        setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: 'Moving to the next step now! 🍳', source: 'openai' }]);
        void speakText('Moving to the next step now!');
        window.setTimeout(() => onNextStep!(), 1000);
        return;
      }
    }

    // Track consecutive fallbacks
    if (aiSaid) {
      if (aiSaid.includes("I'm focused on your")) {
        setConsecutiveFallbacks(f => f + 1);
      } else {
        setConsecutiveFallbacks(0);
      }
    }
  }, [chatMessages, dishId, hasPrevStep, hasNextStep, isTimerRunning, locale, onNextStep, onPauseTimer, onPrevStep, onStartTimer, pending, remainingSeconds, speakText, stepIndex]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    audioStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioStreamRef.current = null;
    setRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError({ type: 'notfound', message: 'Microphone not available. Use the Chat tab.', retryable: false });
      return;
    }
    setMicError(null);
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (err) { setMicError(await classifyMicError(err)); return; }

    audioStreamRef.current = stream;
    mediaChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;
    recorder.addEventListener('dataavailable', (e) => { if (e.data.size > 0) mediaChunksRef.current.push(e.data); });
    recorder.addEventListener('stop', () => {
      const blob = new Blob(mediaChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      mediaChunksRef.current = [];
      if (blob.size > 0) void processVoicePipeline(blob);
    });
    recorder.start();
    setRecording(true);
  }, [processVoicePipeline]);

  // ─────────────────────────────────────────────────────────────────────────
  // Text chat
  // ─────────────────────────────────────────────────────────────────────────

  const sendText = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    // Check for app-level commands first
    const cmd = detectCommand(trimmed);

    if (cmd === 'next' && hasNextStep && onNextStep) {
      setChatMessages(c => [...c, { id: newId(), role: 'user', text: trimmed }]);
      setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: "Moving to the next step now! 🍳", source: 'openai' }]);
      void speakText("Moving to the next step now!");
      window.setTimeout(() => onNextStep!(), 800);
      return;
    }
    if (cmd === 'prev' && hasPrevStep && onPrevStep) {
      setChatMessages(c => [...c, { id: newId(), role: 'user', text: trimmed }]);
      setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: "Going back to the previous step.", source: 'openai' }]);
      void speakText("Going back to the previous step.");
      window.setTimeout(() => onPrevStep!(), 800);
      return;
    }
    if (cmd === 'start_timer' && onStartTimer) {
      setChatMessages(c => [...c, { id: newId(), role: 'user', text: trimmed }]);
      setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: "Timer started! I'll keep track of time for you.", source: 'openai' }]);
      void speakText("Timer started!");
      onStartTimer();
      return;
    }
    if (cmd === 'pause_timer' && onPauseTimer) {
      setChatMessages(c => [...c, { id: newId(), role: 'user', text: trimmed }]);
      setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: "Timer paused.", source: 'openai' }]);
      void speakText("Timer paused.");
      onPauseTimer();
      return;
    }
    if (cmd === 'time_remaining') {
      const mins = Math.floor((remainingSeconds ?? 0) / 60);
      const secs = (remainingSeconds ?? 0) % 60;
      const timeStr = mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''} and ${secs} second${secs !== 1 ? 's' : ''}` : `${secs} second${secs !== 1 ? 's' : ''}`;
      const reply = remainingSeconds && remainingSeconds > 0
        ? `You have ${timeStr} remaining on this step.`
        : isTimerRunning ? "The timer is running — check the countdown on your screen." : "The timer hasn't started yet. Tap 'Talk to chef' then say 'start timer' or tap the Start button.";
      setChatMessages(c => [...c, { id: newId(), role: 'user', text: trimmed }]);
      setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: reply, source: 'openai' }]);
      void speakText(reply);
      return;
    }
    if (cmd === 'pan_check') {
      setChatMessages(c => [...c, { id: newId(), role: 'user', text: trimmed }]);
      const panReply = "I can help check your pan! Tap the AI Pan Checker button below, or upload a photo right here and I'll analyse it for this step.";
      setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: panReply, source: 'openai' }]);
      void speakText("I can help check your pan! Tap the AI Pan Checker button below to upload a photo.");
      setShowPanCheckOption(true);
      return;
    }

    const userMsg: ChatMessage = { id: newId(), role: 'user', text: trimmed };
    setChatMessages((c) => [...c, userMsg]);
    setPending(true);
    setChatError(null);
    let aiSaid = '';

    try {
      const session = getSupabaseSession();
      const history = chatMessages.slice(-8).map((m) => ({ role: m.role, text: m.text }));
      const resp = await fetch('/api/voice-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}) },
        body: JSON.stringify({ dishId, currentStep: stepIndex, question: trimmed, locale, history }),
      });
      const payload = (await resp.json()) as VoiceCoachResponse;
      if (!payload.ok || !payload.reply) throw new Error(payload.error ?? 'No response.');
      aiSaid = payload.reply;
      setChatMessages((c) => [...c, { id: newId(), role: 'assistant', text: aiSaid, source: payload.source }]);
      // Speak the reply so the cook stays hands-free
      void speakText(aiSaid);
      // Track consecutive fallbacks
      if (aiSaid.includes("I'm focused on your")) {
        setConsecutiveFallbacks(f => f + 1);
      } else {
        setConsecutiveFallbacks(0);
      }
      // Secondary navigation check: phrase not in trigger list but AI confirmed next step
      if (hasNextStep && onNextStep && !detectCommand(trimmed)) {
        if (aiConfirmsNextStep(trimmed, aiSaid, stepIndex)) {
          setChatMessages(c => [...c, { id: newId(), role: 'assistant', text: 'Moving to the next step now! 🍳', source: 'openai' }]);
          void speakText('Moving to the next step now!');
          window.setTimeout(() => onNextStep!(), 1000);
        }
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Could not reach ChefSense.');
    } finally {
      setPending(false);
    }
  }, [chatMessages, dishId, hasPrevStep, hasNextStep, isTimerRunning, locale, onNextStep, onPauseTimer, onPrevStep, onStartTimer, pending, remainingSeconds, speakText, stepIndex]);

  const handleSend = () => { const t = draft; setDraft(''); void sendText(t); };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const showThread = expanded || chatActive;

  return (
    <div className="mt-3 rounded-[22px] border border-border/60 bg-background px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      {/* Header */}
      <div className="mb-3">
        <div className="text-sm font-semibold text-foreground">
          {expanded ? expandedHint : collapsedHint}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{helperHint}</div>
      </div>

      {/* ── Action buttons — larger for kitchen use ── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={recording ? stopRecording : () => void startRecording()}
          disabled={pending || speaking}
          aria-label={recording ? 'Stop recording' : 'Talk to ChefSense'}
          className={
            recording
              ? 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-[18px] gradient-cta px-3 py-3 text-white shadow-cta animate-pulse disabled:opacity-50'
              : 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-[18px] border-2 border-primary/30 bg-primary-soft px-3 py-3 text-primary-dark shadow-soft disabled:opacity-50'
          }
        >
          {recording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          <span className="text-[12px] font-semibold leading-none">
            {recording ? 'Stop & send' : 'Talk to chef'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setChatActive(true); setChatFocusKey((k) => k + 1); }}
          disabled={pending}
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[18px] border-2 border-border bg-card px-3 py-3 shadow-soft disabled:opacity-50"
          aria-label="Open chat input"
        >
          <MessageCircleMore className="h-5 w-5 text-primary" />
          <span className="text-[12px] font-semibold leading-none text-foreground">Chat with chef</span>
        </button>
      </div>

      {/* Speaking indicator */}
      {speaking ? (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-primary-dark">
          <Volume2 className="h-3.5 w-3.5 animate-pulse" />
          Chef is speaking…
        </div>
      ) : null}

      {/* Mic error */}
      {micError ? (
        <div className="mt-3 rounded-[16px] border border-primary/25 bg-primary-soft/40 px-3 py-2.5">
          <div className="flex items-start gap-2 text-xs text-primary-dark">
            {micError.type === 'denied' ? <ShieldOff className="h-3.5 w-3.5 shrink-0" /> : <MicOff className="h-3.5 w-3.5 shrink-0" />}
            <span>{micError.message}</span>
          </div>
          {micError.retryable ? (
            <button type="button" onClick={() => { setMicError(null); void startRecording(); }}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background px-3 py-1 text-xs font-semibold text-primary">
              <RefreshCw className="h-3 w-3" /> Try again
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Pan check helper */}
      {showPanCheckOption ? (
        <div className="mt-3 rounded-[16px] border border-primary/25 bg-primary-soft/40 px-3 py-2.5 text-xs text-primary-dark">
          📷 Tap <strong>AI Pan Checker</strong> below the cook steps to upload a photo and get step-specific analysis right now.
        </div>
      ) : null}

      {/* Consecutive fallback banner */}
      {consecutiveFallbacks >= 2 ? (
        <div className="mt-2 rounded-[16px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Voice seems to be having trouble. Try typing your question in the chat box below for a better response.
        </div>
      ) : null}

      {/* ── Conversation thread ── */}
      {showThread ? (
        <div className="mt-4 space-y-2">
          {/* Capped scrollable chat — shows last ~3 messages without page bloat */}
          <div
            ref={chatScrollRef}
            className="max-h-[220px] space-y-2 overflow-y-auto pr-1 scrollbar-hide"
          >
            {chatMessages.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-border bg-card/60 px-3 py-3 text-sm text-muted-foreground">
                Ask anything about{' '}
                <span className="font-medium text-foreground">{stepTitle.toLowerCase()}</span>
                {' '}— cues, timing, heat, what to correct.
              </div>
            ) : null}

            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={
                  msg.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-[18px] bg-primary-soft px-3 py-2.5 text-right text-sm text-primary-dark'
                    : 'mr-auto max-w-[85%] rounded-[18px] bg-card px-3 py-2.5 text-sm text-foreground shadow-soft'
                }
              >
                {msg.text}
              </div>
            ))}
          </div>

          {pending ? (
            <div className="mr-auto inline-flex items-center gap-2 rounded-[18px] bg-card px-3 py-2.5 text-sm text-muted-foreground shadow-soft">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-primary" />
              ChefSense is thinking…
            </div>
          ) : null}

          {chatError ? (
            <div className="rounded-[16px] border border-primary/30 bg-primary-soft/55 px-3 py-2 text-xs text-primary-dark">
              {chatError}
            </div>
          ) : null}

          {/* Text input */}
          <div className="flex items-center gap-2 rounded-[18px] border border-border/60 bg-background px-3 py-2">
            <MessageCircleMore className="h-4 w-4 shrink-0 text-primary" />
            <input
              ref={chatInputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
              placeholder={placeholder}
              disabled={pending}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button type="button" onClick={handleSend} disabled={!draft.trim() || pending}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
              aria-label="Send">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
