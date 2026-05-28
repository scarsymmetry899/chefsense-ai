/**
 * OpenAI Whisper speech-to-text helper.
 * Kept separate from openai.ts because it uses a different endpoint
 * and multipart/form-data instead of JSON.
 */

const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';
const WHISPER_MODEL = 'whisper-1';

export type TranscribeResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

function localeToIso(locale?: string): string | null {
  if (!locale) return null;
  const trimmed = locale.trim().toLowerCase();
  if (!trimmed) return null;
  // Strip region suffixes like en-IN -> en, hi-IN -> hi
  const base = trimmed.split(/[-_]/)[0];
  if (!base) return null;
  return base;
}

export async function transcribeAudio(opts: {
  audio: Blob | File | ArrayBuffer;
  mimeType?: string;
  locale?: string;
}): Promise<TranscribeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'missing_api_key' };
  }

  let fileBlob: Blob;
  const mime = opts.mimeType?.trim() || 'audio/webm';

  if (opts.audio instanceof ArrayBuffer) {
    fileBlob = new Blob([opts.audio], { type: mime });
  } else {
    fileBlob = opts.audio;
  }

  if (!fileBlob || fileBlob.size === 0) {
    return { ok: false, error: 'empty_audio' };
  }

  // Whisper needs a filename hint to infer the container format.
  const filename = inferFilename(mime);

  const form = new FormData();
  form.append('model', WHISPER_MODEL);
  form.append('file', fileBlob, filename);

  const language = localeToIso(opts.locale);
  if (language) {
    form.append('language', language);
  }

  try {
    const response = await fetch(WHISPER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    if (!response.ok) {
      return { ok: false, error: `whisper_http_${response.status}` };
    }

    const payload = (await response.json()) as { text?: string };
    const text = payload.text?.trim();
    if (!text) {
      return { ok: false, error: 'empty_transcription' };
    }

    return { ok: true, text };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `whisper_fetch_failed:${error.message}`
          : 'whisper_fetch_failed',
    };
  }
}

function inferFilename(mime: string): string {
  const lower = mime.toLowerCase();
  if (lower.includes('mp4') || lower.includes('m4a')) return 'audio.m4a';
  if (lower.includes('mpeg') || lower.includes('mp3')) return 'audio.mp3';
  if (lower.includes('wav')) return 'audio.wav';
  if (lower.includes('ogg')) return 'audio.ogg';
  if (lower.includes('flac')) return 'audio.flac';
  return 'audio.webm';
}
