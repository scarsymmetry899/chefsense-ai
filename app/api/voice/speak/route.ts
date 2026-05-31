/**
 * /api/voice/speak — lightweight TTS endpoint
 *
 * Accepts { text, locale } and returns an audio/mpeg stream from ElevenLabs.
 * Used by the voice panel to speak text-chat replies so cooks stay hands-free.
 */

import { voiceIdForLocale } from '@/lib/ai/elevenlabs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SupportedLocale = 'en' | 'hi' | 'te';

function normalise(raw: unknown): SupportedLocale {
  if (typeof raw !== 'string') return 'en';
  const l = raw.trim().toLowerCase();
  if (l.startsWith('hi')) return 'hi';
  if (l.startsWith('te')) return 'te';
  return 'en';
}

export async function POST(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'missing_elevenlabs_key' }, { status: 500 });
  }

  let text = '';
  let locale: SupportedLocale = 'en';
  try {
    const body = (await req.json()) as { text?: unknown; locale?: unknown };
    text = typeof body.text === 'string' ? body.text.trim() : '';
    locale = normalise(body.locale);
  } catch {
    return Response.json({ error: 'invalid_body' }, { status: 400 });
  }

  if (!text) {
    return Response.json({ error: 'empty_text' }, { status: 400 });
  }

  const voiceId = voiceIdForLocale(locale);
  // eleven_multilingual_v2 — high quality, available on all paid tiers.
  // Override via ELEVENLABS_MODEL_ID env var if you want to use flash.
  const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() ?? 'eleven_multilingual_v2';

  const resp = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: { stability: 0.45, similarity_boost: 0.8 },
      }),
    },
  );

  if (!resp.ok || !resp.body) {
    return Response.json({ error: `elevenlabs_http_${resp.status}` }, { status: 502 });
  }

  return new Response(resp.body, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  });
}
