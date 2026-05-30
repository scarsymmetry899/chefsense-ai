'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MessageCircleMore,
  Mic,
  MicOff,
  PhoneOff,
  RefreshCw,
  Send,
  ShieldOff,
  Volume2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { getSupabaseSession } from '@/lib/persistence/supabase-browser';
import { getDish } from '@/lib/data/dishes';
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

type VoiceMode = 'idle' | 'connecting' | 'active' | 'error';

type MicErrorType = 'overlay' | 'denied' | 'notfound' | 'generic';
type MicError = { type: MicErrorType; message: string; retryable: boolean };

type VoiceLine = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  source?: 'openai' | 'fallback';
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
      message:
        'Close any floating apps or chat bubbles on your screen, then tap Voice Mode again.',
      retryable: true,
    };
  }
  if (name === 'NotAllowedError') {
    try {
      const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (status.state === 'denied') {
        return {
          type: 'denied',
          message:
            'Microphone blocked. Open your browser settings, allow the mic for this site, then reload.',
          retryable: false,
        };
      }
      return {
        type: 'overlay',
        message:
          'A floating app blocked the mic permission. Close any overlays or bubbles and try again.',
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

/** Best-effort save of a voice transcript line to Supabase voice_turns. */
async function persistVoiceLine(opts: {
  accessToken: string;
  dishId: string;
  stepIndex: number;
  locale: string;
  role: 'user' | 'assistant';
  text: string;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey || !opts.accessToken) return;
  try {
    await fetch(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/voice_turns`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${opts.accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        dish_id: opts.dishId,
        step_index: opts.stepIndex,
        locale: opts.locale,
        role: opts.role,
        transcript: opts.text,
        source: 'voice',
      }),
    });
  } catch {
    // best-effort
  }
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

  // ── Voice (WebRTC) state ──
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('idle');
  const [voiceLines, setVoiceLines] = useState<VoiceLine[]>([]);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [micError, setMicError] = useState<MicError | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // ── Text chat state ──
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatActive, setChatActive] = useState(false);
  const [chatFocusKey, setChatFocusKey] = useState(0);

  // ── WebRTC refs ──
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepIndexRef = useRef(stepIndex);

  // ── Text chat refs ──
  const greetedRef = useRef(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // ── Keep stepIndexRef current so data-channel updates can read it ──
  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);

  // ── Seed primer when expanded ──
  useEffect(() => {
    if (!expanded) return;
    if (greetedRef.current && chatMessages.length > 0) return;
    greetedRef.current = true;
    setChatMessages([
      { id: `primer-${stepIndex}`, role: 'assistant', text: primer, source: 'fallback' },
    ]);
  }, [expanded, primer, stepIndex, chatMessages.length]);

  useEffect(() => {
    greetedRef.current = false;
    setChatMessages([]);
    setChatError(null);
    // Also push updated step context to an active voice session
    if (voiceMode === 'active' && dataChannelRef.current?.readyState === 'open') {
      pushStepContextUpdate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  // ── Auto-focus chat input ──
  useEffect(() => {
    if (chatFocusKey === 0) return;
    const id = window.setTimeout(() => chatInputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [chatFocusKey]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      teardownVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Background tab handling — mute mic when the page is hidden ──
  useEffect(() => {
    const onVisibilityChange = () => {
      const tracks = localStreamRef.current?.getAudioTracks() ?? [];
      tracks.forEach((t) => {
        t.enabled = document.visibilityState === 'visible';
      });
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // WebRTC voice helpers
  // ─────────────────────────────────────────────────────────────────────────

  function teardownVoice() {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    dataChannelRef.current?.close();
    dataChannelRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    if (audioElRef.current) {
      audioElRef.current.srcObject = null;
    }
  }

  /** Inject the current step's data into an active session via the data channel. */
  function pushStepContextUpdate() {
    const dc = dataChannelRef.current;
    if (!dc || dc.readyState !== 'open') return;
    const dish = getDish(dishId);
    const step = dish?.cookingSteps.find((s) => s.index === stepIndexRef.current);
    if (!step) return;

    const cueFor = (type: string) => step.sensoryCues.find((c) => c.type === type)?.cue;
    const cues = [
      cueFor('visual') && `Visual: ${cueFor('visual')}`,
      cueFor('smell') && `Smell: ${cueFor('smell')}`,
      cueFor('sound') && `Sound: ${cueFor('sound')}`,
      cueFor('texture') && `Texture: ${cueFor('texture')}`,
    ]
      .filter(Boolean)
      .join(' | ');

    const contextPayload = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'system',
        content: [
          {
            type: 'input_text',
            text: [
              `The user has moved to Step ${step.index}: "${step.title}".`,
              `Instruction: ${step.instruction}`,
              `Heat: ${step.heat} | Duration: ~${Math.ceil(step.durationSec / 60)} min`,
              cues ? `Sensory cues: ${cues}` : '',
              step.foodScience ? `Food science: ${step.foodScience}` : '',
            ]
              .filter(Boolean)
              .join('\n'),
          },
        ],
      },
    };

    try {
      dc.send(JSON.stringify(contextPayload));
    } catch {
      // best-effort
    }
  }

  const handleDataChannelMessage = useCallback(
    (event: MessageEvent) => {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(event.data as string) as Record<string, unknown>;
      } catch {
        return;
      }

      const type = parsed.type as string | undefined;

      // ── User transcript completed ──
      if (type === 'conversation.item.input_audio_transcription.completed') {
        const text = (parsed.transcript as string | undefined)?.trim();
        if (text) {
          const line: VoiceLine = { id: newId(), role: 'user', text };
          setVoiceLines((l) => [...l, line]);
          const session = getSupabaseSession();
          if (session?.accessToken) {
            void persistVoiceLine({
              accessToken: session.accessToken,
              dishId,
              stepIndex: stepIndexRef.current,
              locale,
              role: 'user',
              text,
            });
          }
        }
      }

      // ── Assistant text transcript done ──
      if (type === 'response.audio_transcript.done') {
        const text = (parsed.transcript as string | undefined)?.trim();
        if (text) {
          const line: VoiceLine = { id: newId(), role: 'assistant', text };
          setVoiceLines((l) => [...l, line]);
          const session = getSupabaseSession();
          if (session?.accessToken) {
            void persistVoiceLine({
              accessToken: session.accessToken,
              dishId,
              stepIndex: stepIndexRef.current,
              locale,
              role: 'assistant',
              text,
            });
          }
        }
      }

      // ── OpenAI realtime error event ──
      if (type === 'error') {
        const errObj = parsed.error as Record<string, unknown> | undefined;
        const msg = (errObj?.message as string | undefined) ?? 'Unknown voice error.';
        setVoiceError(msg);
      }
    },
    [dishId, locale],
  );

  const startVoiceMode = useCallback(async () => {
    if (voiceMode === 'connecting' || voiceMode === 'active') return;
    setVoiceMode('connecting');
    setVoiceError(null);
    setMicError(null);

    // 1. Acquire mic before spending the API token
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const classified = await classifyMicError(err);
      setMicError(classified);
      setVoiceMode('error');
      return;
    }
    localStreamRef.current = stream;

    // 2. Fetch an ephemeral session token from our backend
    let ephemeralKey: string;
    try {
      const session = getSupabaseSession();
      const resp = await fetch('/api/voice/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({ dishId, stepIndex: stepIndexRef.current, locale }),
      });
      if (!resp.ok) {
        throw new Error(`session_http_${resp.status}`);
      }
      const data = (await resp.json()) as { client_secret?: { value?: string } };
      ephemeralKey = data.client_secret?.value ?? '';
      if (!ephemeralKey) throw new Error('empty_ephemeral_key');
    } catch (err) {
      teardownVoice();
      setVoiceError(
        `Could not start voice session: ${err instanceof Error ? err.message : 'network error'}. Try again or use the Chat tab.`,
      );
      setVoiceMode('error');
      return;
    }

    // 3. Create WebRTC peer connection
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    // Remote audio playback element
    if (!audioElRef.current) {
      audioElRef.current = document.createElement('audio');
      audioElRef.current.autoplay = true;
    }
    pc.ontrack = (e) => {
      if (audioElRef.current) audioElRef.current.srcObject = e.streams[0];
    };

    // Add local mic tracks
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    // 4. Create data channel for events / context injection
    const dc = pc.createDataChannel('oai-events');
    dataChannelRef.current = dc;

    dc.addEventListener('open', () => {
      setVoiceMode('active');
      reconnectCountRef.current = 0;
    });

    dc.addEventListener('message', handleDataChannelMessage);

    dc.addEventListener('error', () => {
      setVoiceError('Data channel error. Tap End and try again.');
    });

    // 5. ICE failure / disconnect detection
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === 'failed') {
        handleVoiceFailure('Connection lost — unable to reconnect. Please retry.');
      } else if (state === 'disconnected') {
        // Attempt a single silent reconnect
        if (reconnectCountRef.current < 3) {
          reconnectCountRef.current += 1;
          reconnectTimerRef.current = setTimeout(() => {
            void startVoiceMode();
          }, 1500 * reconnectCountRef.current);
        } else {
          handleVoiceFailure('Connection dropped after several retries. Please retry manually.');
        }
      }
    };

    // 6. SDP offer → OpenAI → answer
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model =
        process.env.NEXT_PUBLIC_OPENAI_REALTIME_MODEL ?? 'gpt-4o-realtime-preview-2024-12-17';
      const sdpResp = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });
      if (!sdpResp.ok) {
        throw new Error(`sdp_http_${sdpResp.status}`);
      }
      const answerSdp = await sdpResp.text();
      await pc.setRemoteDescription({ type: 'answer' as RTCSdpType, sdp: answerSdp });
    } catch (err) {
      teardownVoice();
      setVoiceError(
        `Failed to connect to voice AI: ${err instanceof Error ? err.message : 'network error'}. Use the Chat tab below.`,
      );
      setVoiceMode('error');
    }
  }, [voiceMode, dishId, locale, handleDataChannelMessage]);

  function handleVoiceFailure(message: string) {
    teardownVoice();
    setVoiceError(message);
    setVoiceMode('error');
  }

  const stopVoiceMode = useCallback(() => {
    teardownVoice();
    setVoiceMode('idle');
    setVoiceError(null);
  }, []);

  const toggleMute = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() ?? [];
    tracks.forEach((t) => {
      t.enabled = isMuted;
    });
    setIsMuted((m) => !m);
  }, [isMuted]);

  // ─────────────────────────────────────────────────────────────────────────
  // Text chat helpers (unchanged from previous implementation)
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
        const resp = await fetch('/api/voice-coach', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
          },
          body: JSON.stringify({ dishId, currentStep: stepIndex, question: trimmed, locale }),
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
    [dishId, locale, pending, stepIndex],
  );

  const handleSend = () => {
    const text = draft;
    setDraft('');
    void sendText(text);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────────

  const voiceStatusLabel =
    voiceMode === 'connecting'
      ? 'Connecting…'
      : voiceMode === 'active'
        ? isMuted
          ? 'Muted'
          : 'Listening…'
        : '';

  const voiceStatusColor =
    voiceMode === 'connecting'
      ? 'text-amber-600'
      : voiceMode === 'active' && !isMuted
        ? 'text-accent-green'
        : 'text-muted-foreground';

  // ─────────────────────────────────────────────────────────────────────────
  // JSX
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

      {/* ── VOICE MODE UI ── */}
      {voiceMode === 'active' || voiceMode === 'connecting' ? (
        <div className="mt-4 space-y-3">
          {/* Status bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-2 w-2 rounded-full ${voiceMode === 'active' && !isMuted ? 'animate-pulse bg-accent-green' : 'bg-amber-400'}`}
              />
              <span className={`text-xs font-medium ${voiceStatusColor}`}>{voiceStatusLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              {voiceMode === 'active' ? (
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute microphone'}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${isMuted ? 'border-primary bg-primary text-white' : 'border-border bg-card text-muted-foreground'}`}
                >
                  {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                </button>
              ) : null}
              <button
                type="button"
                onClick={stopVoiceMode}
                aria-label="End voice session"
                className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white"
              >
                <PhoneOff className="h-3.5 w-3.5" />
                End
              </button>
            </div>
          </div>

          {/* Transcript */}
          {voiceLines.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-border bg-card/60 px-3 py-3 text-sm text-muted-foreground">
              <Volume2 className="mb-1 h-4 w-4 text-primary" />
              Start speaking — ChefSense is listening for questions about{' '}
              <span className="font-medium text-foreground">{stepTitle.toLowerCase()}</span>.
            </div>
          ) : (
            <div className="max-h-52 space-y-2 overflow-y-auto">
              {voiceLines.map((line) => (
                <div
                  key={line.id}
                  className={
                    line.role === 'user'
                      ? 'ml-auto max-w-[88%] rounded-[18px] bg-primary-soft px-3 py-2.5 text-right text-sm text-primary-dark'
                      : 'mr-auto max-w-[88%] rounded-[18px] bg-card px-3 py-2.5 text-sm text-foreground shadow-soft'
                  }
                >
                  {line.text}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── IDLE / ERROR — show action buttons ── */
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => void startVoiceMode()}
            aria-label="Start real-time voice with chef"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-4 py-2.5 text-sm font-semibold text-primary-dark shadow-soft disabled:opacity-50"
          >
            <Mic className="h-4 w-4" />
            <span>Voice Mode</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setChatActive(true);
              setChatFocusKey((k) => k + 1);
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-soft"
            aria-label="Open text chat"
          >
            <MessageCircleMore className="h-4 w-4 text-primary" />
            <span>Chat with chef</span>
          </button>
        </div>
      )}

      {/* ── MIC / VOICE ERROR ── */}
      {micError ? (
        <div className="mt-3 rounded-[16px] border border-primary/25 bg-primary-soft/40 px-3 py-2.5">
          <div className="flex items-start gap-2 text-xs text-primary-dark">
            {micError.type === 'denied' ? (
              <ShieldOff className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <MicOff className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{micError.message}</span>
          </div>
          {micError.retryable ? (
            <button
              type="button"
              onClick={() => { setMicError(null); void startVoiceMode(); }}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background px-3 py-1 text-xs font-semibold text-primary"
            >
              <RefreshCw className="h-3 w-3" />
              Try again
            </button>
          ) : null}
        </div>
      ) : voiceError && voiceMode === 'error' ? (
        <div className="mt-3 rounded-[16px] border border-primary/25 bg-primary-soft/40 px-3 py-2.5">
          <p className="text-xs text-primary-dark">{voiceError}</p>
          <button
            type="button"
            onClick={() => { setVoiceError(null); setVoiceMode('idle'); void startVoiceMode(); }}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background px-3 py-1 text-xs font-semibold text-primary"
          >
            <RefreshCw className="h-3 w-3" />
            Retry voice
          </button>
        </div>
      ) : null}

      {/* ── TEXT CHAT (always available when panel open or chatActive) ── */}
      {(expanded || chatActive) && voiceMode !== 'active' && voiceMode !== 'connecting' ? (
        <div className="mt-4 space-y-2">
          {chatMessages.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-border bg-card/60 px-3 py-3 text-sm text-muted-foreground">
              Ask anything about{' '}
              <span className="font-medium text-foreground">{stepTitle.toLowerCase()}</span> —
              cues, timing, heat, what to correct.
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
              {msg.source === 'fallback' &&
              msg.role === 'assistant' &&
              !msg.id.startsWith('primer-') ? (
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
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
