'use client';

/**
 * Browser-side helpers for the /api/voice/turn endpoint.
 * Handles multipart upload and base64 audio playback.
 */

export type VoiceTurnLocale = 'en' | 'hi' | 'te';

export type TurnResponseOk = {
  ok: true;
  transcript: string;
  reply: string;
  locale: VoiceTurnLocale;
  audioBase64?: string;
  audioMime?: string;
  source: 'openai' | 'fallback';
  warnings: string[];
};

export type TurnResponseErr = {
  ok: false;
  error: string;
  warnings?: string[];
};

export type TurnResponse = TurnResponseOk | TurnResponseErr;

export async function postVoiceTurn(opts: {
  audio: Blob;
  dishId: string;
  currentStep?: number;
  locale?: VoiceTurnLocale;
  transcriptOnly?: boolean;
}): Promise<TurnResponse> {
  const form = new FormData();
  form.append('audio', opts.audio, inferFilename(opts.audio.type));
  form.append('dishId', opts.dishId);
  if (typeof opts.currentStep === 'number') {
    form.append('currentStep', String(opts.currentStep));
  }
  if (opts.locale) {
    form.append('locale', opts.locale);
  }
  if (opts.transcriptOnly) {
    form.append('transcriptOnly', 'true');
  }

  try {
    const response = await fetch('/api/voice/turn', {
      method: 'POST',
      body: form,
    });
    const data = (await response.json()) as TurnResponse;
    return data;
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `voice_turn_request_failed:${error.message}`
          : 'voice_turn_request_failed',
    };
  }
}

export function playAudioBase64(base64: string, mime: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!base64) return null;

  try {
    const byteString = window.atob(base64);
    const len = byteString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      bytes[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime || 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.removeEventListener('ended', cleanup);
      audio.removeEventListener('error', cleanup);
    };
    audio.addEventListener('ended', cleanup);
    audio.addEventListener('error', cleanup);

    void audio.play().catch(() => {
      // Autoplay blocked or user gesture missing — leave the element for the caller.
    });

    return audio;
  } catch {
    return null;
  }
}

function inferFilename(mime: string): string {
  const lower = (mime || '').toLowerCase();
  if (lower.includes('mp4') || lower.includes('m4a')) return 'audio.m4a';
  if (lower.includes('mpeg') || lower.includes('mp3')) return 'audio.mp3';
  if (lower.includes('wav')) return 'audio.wav';
  if (lower.includes('ogg')) return 'audio.ogg';
  return 'audio.webm';
}
