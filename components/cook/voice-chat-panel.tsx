'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircleMore, Mic, MicOff, Send, Square } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { getSupabaseSession } from '@/lib/persistence/supabase-browser';
import type { LanguageCode } from '@/lib/i18n/dictionary';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  source?: 'openai' | 'fallback' | 'voice';
  audioUrl?: string;
};

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

type VoiceTurnResponse = {
  ok: boolean;
  transcript?: string;
  reply?: string;
  audioBase64?: string;
  audioMime?: string;
  source?: 'openai' | 'fallback';
  error?: string;
  warnings?: string[];
};

type VoiceCoachResponse = {
  ok: boolean;
  source?: 'openai' | 'fallback';
  reply?: string;
  warning?: string;
  error?: string;
};

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function localeFromLang(lang: LanguageCode): 'en' | 'hi' | 'te' {
  return lang === 'hi' || lang === 'te' ? lang : 'en';
}

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

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [micUnavailable, setMicUnavailable] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<BlobPart[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const greetedRef = useRef(false);

  // Seed a single chef-voice primer message when the panel first opens for a
  // new step. Re-seeds when stepIndex changes — but never spams the user.
  useEffect(() => {
    if (!expanded) return;
    if (greetedRef.current && messages.length > 0) return;
    greetedRef.current = true;
    setMessages([
      {
        id: `primer-${stepIndex}`,
        role: 'assistant',
        text: primer,
        source: 'fallback',
      },
    ]);
  }, [expanded, primer, stepIndex, messages.length]);

  // Reset the primer flag when step changes so the new step gets its own.
  useEffect(() => {
    greetedRef.current = false;
    setMessages([]);
    setError(null);
  }, [stepIndex]);

  const playAudio = useCallback((base64: string, mime: string) => {
    if (typeof window === 'undefined') return;
    try {
      const binary = window.atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.addEventListener('ended', () => URL.revokeObjectURL(url));
      audio.play().catch(() => URL.revokeObjectURL(url));
    } catch {
      // Audio playback is best-effort. Silent failure is fine.
    }
  }, []);

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;

      const userMessage: ChatMessage = {
        id: newId(),
        role: 'user',
        text: trimmed,
      };
      setMessages((current) => [...current, userMessage]);
      setPending(true);
      setError(null);

      try {
        const session = getSupabaseSession();
        const response = await fetch('/api/voice-coach', {
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
          }),
        });
        const payload = (await response.json()) as VoiceCoachResponse;
        if (!payload.ok || !payload.reply) {
          throw new Error(payload.error || 'No response from chef.');
        }
        setMessages((current) => [
          ...current,
          {
            id: newId(),
            role: 'assistant',
            text: payload.reply!,
            source: payload.source,
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not reach ChefSense.');
      } finally {
        setPending(false);
      }
    },
    [dishId, locale, pending, stepIndex],
  );

  const handleSend = () => {
    const text = draft;
    setDraft('');
    void sendText(text);
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    audioStreamRef.current?.getTracks().forEach((track) => track.stop());
    audioStreamRef.current = null;
    setRecording(false);
  }, []);

  const sendAudioBlob = useCallback(
    async (blob: Blob) => {
      if (pending) return;
      setPending(true);
      setError(null);

      try {
        const session = getSupabaseSession();
        const form = new FormData();
        form.append('audio', blob, 'turn.webm');
        form.append('dishId', dishId);
        form.append('currentStep', String(stepIndex));
        form.append('locale', locale);

        const response = await fetch('/api/voice/turn', {
          method: 'POST',
          headers: session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : undefined,
          body: form,
        });
        const payload = (await response.json()) as VoiceTurnResponse;

        if (!payload.ok) {
          throw new Error(payload.error || 'Voice turn failed.');
        }

        if (payload.transcript) {
          setMessages((current) => [
            ...current,
            { id: newId(), role: 'user', text: payload.transcript!, source: 'voice' },
          ]);
        }

        if (payload.reply) {
          setMessages((current) => [
            ...current,
            {
              id: newId(),
              role: 'assistant',
              text: payload.reply!,
              source: payload.source,
            },
          ]);
        }

        if (payload.audioBase64 && payload.audioMime) {
          playAudio(payload.audioBase64, payload.audioMime);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not process voice.');
      } finally {
        setPending(false);
      }
    },
    [dishId, locale, pending, playAudio, stepIndex],
  );

  const startRecording = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      setMicUnavailable(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      mediaChunksRef.current = [];

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = recorder;

      recorder.addEventListener('dataavailable', (event) => {
        if (event.data && event.data.size > 0) {
          mediaChunksRef.current.push(event.data);
        }
      });
      recorder.addEventListener('stop', () => {
        const blob = new Blob(mediaChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        mediaChunksRef.current = [];
        if (blob.size > 0) {
          void sendAudioBlob(blob);
        }
      });

      recorder.start();
      setRecording(true);
    } catch {
      setMicUnavailable(true);
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  }, [sendAudioBlob]);

  useEffect(() => {
    return () => {
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="mt-3 rounded-[22px] border border-border/60 bg-background px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-foreground">
            {expanded ? expandedHint : collapsedHint}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{helperHint}</div>
        </div>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition ${
            recording
              ? 'bg-primary text-white shadow-cta'
              : 'bg-primary-soft text-primary'
          }`}
          aria-label={recording ? 'Stop recording' : 'Start voice question'}
          disabled={pending}
        >
          {recording ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
        </button>
      </div>

      {micUnavailable ? (
        <div className="mt-3 flex items-center gap-2 rounded-[16px] border border-primary/25 bg-primary-soft/40 px-3 py-2 text-xs text-primary-dark">
          <MicOff className="h-3.5 w-3.5" />
          Microphone unavailable. Use the text box below.
        </div>
      ) : null}

      {expanded ? (
        <div className="mt-4 space-y-2">
          {messages.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-border bg-card/60 px-3 py-3 text-sm text-muted-foreground">
              Ask anything about <span className="font-medium text-foreground">{stepTitle.toLowerCase()}</span> —
              cues, timing, heat, what to correct.
            </div>
          ) : null}

          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === 'user'
                  ? 'ml-auto max-w-[88%] rounded-[18px] bg-primary-soft px-3 py-3 text-right text-sm text-primary-dark'
                  : 'mr-auto max-w-[88%] rounded-[18px] bg-card px-3 py-3 text-sm text-foreground shadow-soft'
              }
            >
              {message.text}
              {message.source === 'fallback' && message.role === 'assistant' && message.id.startsWith('primer-') === false ? (
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

          {error ? (
            <div className="rounded-[16px] border border-primary/30 bg-primary-soft/55 px-3 py-2 text-xs text-primary-dark">
              {error}
            </div>
          ) : null}

          <div className="flex items-center gap-2 rounded-[18px] border border-border/60 bg-background px-3 py-2">
            <MessageCircleMore className="h-4 w-4 text-primary" />
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSend();
                }
              }}
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
