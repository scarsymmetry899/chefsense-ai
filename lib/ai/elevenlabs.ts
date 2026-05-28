/**
 * ElevenLabs text-to-speech helper.
 * Separate from openai.ts because it's a different vendor with a different
 * auth scheme and a binary audio response shape.
 */

const ELEVENLABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Bella
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

export type ElevenLabsLocale = 'en' | 'hi' | 'te';

export function hasElevenLabsKey(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

export function voiceIdForLocale(locale: ElevenLabsLocale): string {
  const en = process.env.ELEVENLABS_VOICE_ID_EN?.trim();
  const hi = process.env.ELEVENLABS_VOICE_ID_HI?.trim();
  const te = process.env.ELEVENLABS_VOICE_ID_TE?.trim();

  if (locale === 'hi') return hi || en || DEFAULT_VOICE_ID;
  if (locale === 'te') return te || en || DEFAULT_VOICE_ID;
  return en || DEFAULT_VOICE_ID;
}

export type SynthesizeResult =
  | { ok: true; audioBase64: string; mime: string }
  | { ok: false; error: string };

export async function synthesizeSpeech(opts: {
  text: string;
  locale: ElevenLabsLocale;
  modelId?: string;
}): Promise<SynthesizeResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'missing_api_key' };
  }

  const text = opts.text?.trim();
  if (!text) {
    return { ok: false, error: 'empty_text' };
  }

  const voiceId = voiceIdForLocale(opts.locale);
  const modelId =
    opts.modelId?.trim() ||
    process.env.ELEVENLABS_MODEL_ID?.trim() ||
    DEFAULT_MODEL_ID;

  try {
    const response = await fetch(`${ELEVENLABS_TTS_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      return { ok: false, error: `elevenlabs_http_${response.status}` };
    }

    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return { ok: false, error: 'empty_audio_response' };
    }

    const audioBase64 = Buffer.from(arrayBuffer).toString('base64');
    return { ok: true, audioBase64, mime: 'audio/mpeg' };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `elevenlabs_fetch_failed:${error.message}`
          : 'elevenlabs_fetch_failed',
    };
  }
}
