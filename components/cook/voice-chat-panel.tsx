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
};

type MicErrorType = 'overlay' | 'denied' | 'notfound' | 'generic';
type MicError = { type: MicErrorType; message: string; retryable: boolean };

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  source?: 'openai' | 'fallback' | 'voice';
};

// JSON fallback response shape (when ElevenLabs is unavailable)
type VoiceFallbackResponse = {
  ok: boolean;
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
    return {
      type: 'overlay',
      message: 'Close any floating apps or chat bubbles on your screen, then tap Talk to chef again.',
      retryable: true,
    };
  }
  if (name === 'NotAllowedError') {
    try {
      const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (status.state === 'denied') {
        return {
          type: 'denied',
          message: 'Microphone blocked. Open browser settings, allow the mic for this site, then reload.',
          retryable: false,
        };
      }
      return {
        type: 'overlay',
        message: 'A floating app blocked the mic permission. Close any overlays and try again.',
        retryable: true,
      };
    } catch {
      return {
        type: 'overlay',
        message: 'The mic was blocked by an overlay. Close floating apps and try again.',
        retryable: true,
      };
    }
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return {
      type: 'notfound',
      message: 'No microphone found. Use the Chat tab below to type your question.',
      retryable: false,
    };
  }
  return {
    type: 'generic',
    message: 'Could not access the microphone. Use the Chat tab below.',
    retryable: false,
  };
}

/**
 * Play an ArrayBuffer through the Web Audio API.
 * Lower latency than creating a blob URL + <Audio> element — no object lifecycle,
 * no GC pressure, hardware-accelerated decode.
 */
async function playAudioBuffer(
  buffer: ArrayBuffer,
  audioCtxRef: React.MutableRefObject<AudioContext | null>,
) {
  if (typeof window === 'undefined') return;
  if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
    audioCtxRef.current = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  const ctx = audioCtxRef.current;
  if (ctx.state === 'suspended') await ctx.resume();
  const decoded = await ctx.decodeAudioData(buffer);
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
}: VoiceChatPanelProps) {
  const { lang } = useLanguage();
  const locale = localeFromLang(lang);

  // ── Chat state — persisted to localStorage per dish ──
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
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatActive, setChatActive] = useState(false);
  const [chatFocusKey, setChatFocusKey] = useState(0);

  // ── Voice recording state ──
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState<MicError | null>(null);

  // ── Refs ──
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<BlobPart[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const greetedRef = useRef(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // ── Persist chat messages ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(chatStorageKey, JSON.stringify(chatMessages.slice(-40)));
    } catch { /* ignore */ }
  }, [chatMessages, chatStorageKey]);

  // ── Seed primer once per dish ──
  useEffect(() => {
    if (!expanded) return;
    if (greetedRef.current && chatMessages.length > 0) return;
    greetedRef.current = true;
    setChatMessages((current) => {
      if (current.length > 0) return current;
      return [{ id: `primer-${stepIndex}`, role: 'assistant', text: primer, source: 'fallback' }];
    });
  }, [expanded, primer, stepIndex, chatMessages.length]);

  useEffect(() => {
    setChatError(null);
    // History persists across steps for full dish context.
  }, [stepIndex]);

  // ── Auto-focus chat input ──
  useEffect(() => {
    if (chatFocusKey === 0) return;
    const id = window.setTimeout(() => chatInputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [chatFocusKey]);

  // ── Clean up mic + AudioContext on unmount ──
  useEffect(() => {
    return () => {
      audioStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Voice pipeline: MediaRecorder → /api/cook/voice-command → AudioContext
  // ─────────────────────────────────────────────────────────────────────────

  const processVoicePipeline = useCallback(
    async (blob: Blob) => {
      if (pending) return;
      setPending(true);
      setChatError(null);

      try {
        const session = getSupabaseSession();
        const historySnapshot = chatMessages.slice(-6).map((m) => ({ role: m.role, text: m.text }));

        const form = new FormData();
        form.append('audio', blob, 'cooking-command.webm');
        form.append('dishId', dishId);
        form.append('stepIndex', String(stepIndex));
        form.append('locale', locale);
        form.append('history', JSON.stringify(historySnapshot));

        const resp = await fetch('/api/cook/voice-command', {
          method: 'POST',
          headers: session?.accessToken
            ? { Authorization: `Bearer ${session.accessToken}` }
            : undefined,
          body: form,
        });

        if (!resp.ok) {
          const errBody = (await resp.json().catch(() => ({}))) as { message?: string; error?: string };
          const msg = errBody.message ?? errBody.error ?? `HTTP ${resp.status}`;
          if (msg.includes('transcription_empty') || msg.includes("didn't catch")) {
            throw new Error("We didn't catch that. Speak clearly and try again.");
          }
          throw new Error(msg);
        }

        const contentType = resp.headers.get('Content-Type') ?? '';

        if (contentType.includes('audio/')) {
          // ── Streaming audio path: extract headers then decode + play ──
          const transcript = decodeURIComponent(resp.headers.get('X-Chef-Transcript') ?? '');
          const chefReply = decodeURIComponent(resp.headers.get('X-Chef-Reply') ?? '');

          if (transcript) {
            setChatMessages((c) => [...c, { id: newId(), role: 'user', text: transcript, source: 'voice' }]);
          }
          if (chefReply) {
            setChatMessages((c) => [...c, { id: newId(), role: 'assistant', text: chefReply, source: 'openai' }]);
          }

          // Play through Web Audio API — lower latency than blob URL + <Audio>
          const arrayBuffer = await resp.arrayBuffer();
          if (arrayBuffer.byteLength > 0) {
            await playAudioBuffer(arrayBuffer, audioCtxRef);
          }
        } else {
          // ── JSON fallback path (ElevenLabs unavailable) ──
          const payload = (await resp.json()) as VoiceFallbackResponse;
          if (payload.transcript) {
            setChatMessages((c) => [...c, { id: newId(), role: 'user', text: payload.transcript!, source: 'voice' }]);
          }
          if (payload.reply) {
            setChatMessages((c) => [...c, { id: newId(), role: 'assistant', text: payload.reply!, source: 'fallback' }]);
          }
        }
      } catch (err) {
        setChatError(err instanceof Error ? err.message : 'Could not process voice. Try again.');
      } finally {
        setPending(false);
      }
    },
    [chatMessages, dishId, locale, pending, stepIndex],
  );

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    audioStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioStreamRef.current = null;
    setRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicError({ type: 'notfound', message: 'Microphone not available in this browser. Use the Chat tab.', retryable: false });
      return;
    }
    setMicError(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setMicError(await classifyMicError(err));
      return;
    }

    audioStreamRef.current = stream;
    mediaChunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.addEventListener('dataavailable', (e) => {
      if (e.data && e.data.size > 0) mediaChunksRef.current.push(e.data);
    });
    recorder.addEventListener('stop', () => {
      const blob = new Blob(mediaChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      mediaChunksRef.current = [];
      if (blob.size > 0) void processVoicePipeline(blob);
    });

    recorder.start();
    setRecording(true);
  }, [processVoicePipeline]);

  // ─────────────────────────────────────────────────────────────────────────
  // Text chat (GPT-4o via /api/voice-coach with conversation history)
  // ─────────────────────────────────────────────────────────────────────────

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;
      setChatMessages((c) => [...c, { id: newId(), role: 'user', text: trimmed }]);
      setPending(true);
      setChatError(null);

      try {
        const session = getSupabaseSession();
        const historySnapshot = chatMessages.slice(-8).map((m) => ({ role: m.role, text: m.text }));

        const resp = await fetch('/api/voice-coach', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
          },
          body: JSON.stringify({
            dishId,
            currentStep: stepIndex,
            question: trimmed,
            locale,
            history: historySnapshot,
          }),
        });
        const payload = (await resp.json()) as VoiceCoachResponse;
        if (!payload.ok || !payload.reply) throw new Error(payload.error ?? 'No response.');
        setChatMessages((c) => [
          ...c,
          { id: newId(), role: 'assistant', text: payload.reply!, source: payload.source },
        ]);
      } catch (err) {
        setChatError(err instanceof Error ? err.message : 'Could not reach ChefSense.');
      } finally {
        setPending(false);
      }
    },
    [chatMessages, dishId, locale, pending, stepIndex],
  );

  const handleSend = () => {
    const text = draft;
    setDraft('');
    void sendText(text);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="mt-3 rounded-[22px] border border-border/60 bg-background px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-sm font-medium text-foreground">
          {expanded ? expandedHint : collapsedHint}
        </div>
        <div className="text-sm text-muted-foreground">{helperHint}</div>
      </div>

      {/* Action buttons */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={recording ? stopRecording : () => void startRecording()}
          disabled={pending}
          aria-label={recording ? 'Stop recording' : 'Talk to ChefSense'}
          className={
            recording
              ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full gradient-cta px-4 py-2.5 text-sm font-semibold text-white shadow-cta animate-pulse disabled:opacity-50'
              : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-4 py-2.5 text-sm font-semibold text-primary-dark shadow-soft disabled:opacity-50'
          }
        >
          {recording ? (
            <>
              <Square className="h-4 w-4" />
              <span>Stop &amp; send</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>Talk to chef</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setChatActive(true);
            setChatFocusKey((k) => k + 1);
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-soft"
          aria-label="Open chat input"
        >
          <MessageCircleMore className="h-4 w-4 text-primary" />
          <span>Chat with chef</span>
        </button>
      </div>

      {/* Mic error */}
      {micError ? (
        <div className="mt-3 rounded-[16px] border border-primary/25 bg-primary-soft/40 px-3 py-2.5">
          <div className="flex items-start gap-2 text-xs text-primary-dark">
            {micError.type === 'denied'
              ? <ShieldOff className="h-3.5 w-3.5 shrink-0" />
              : <MicOff className="h-3.5 w-3.5 shrink-0" />}
            <span>{micError.message}</span>
          </div>
          {micError.retryable ? (
            <button
              type="button"
              onClick={() => { setMicError(null); void startRecording(); }}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background px-3 py-1 text-xs font-semibold text-primary"
            >
              <RefreshCw className="h-3 w-3" />
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Conversation thread — voice + text messages share one history */}
      {(expanded || chatActive) ? (
        <div className="mt-4 space-y-2">
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
                  ? 'ml-auto max-w-[88%] rounded-[18px] bg-primary-soft px-3 py-3 text-right text-sm text-primary-dark'
                  : 'mr-auto max-w-[88%] rounded-[18px] bg-card px-3 py-3 text-sm text-foreground shadow-soft'
              }
            >
              {msg.text}
              {msg.source === 'fallback' && msg.role === 'assistant' && !msg.id.startsWith('primer-') ? (
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  offline guidance
                </div>
              ) : null}
            </div>
          ))}

          {pending ? (
            <div className="mr-auto inline-flex max-w-[88%] items-center gap-2 rounded-[18px] bg-card px-3 py-3 text-sm text-muted-foreground shadow-soft">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-primary" />
              ChefSense is thinking…
            </div>
          ) : null}

          {chatError ? (
            <div className="rounded-[16px] border border-primary/30 bg-primary-soft/55 px-3 py-2 text-xs text-primary-dark">
              {chatError}
            </div>
          ) : null}

          <div className="flex items-center gap-2 rounded-[18px] border border-border/60 bg-background px-3 py-2">
            <MessageCircleMore className="h-4 w-4 text-primary" />
            <input
              ref={chatInputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
              placeholder={placeholder}
              disabled={pending}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim() || pending}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
