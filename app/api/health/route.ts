import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Lightweight diagnostic. Returns which AI integrations are wired without
 * leaking the keys themselves. Visit /api/health in the browser to verify
 * Vercel env is set correctly.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    integrations: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
      elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    },
    models: {
      openai: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      gemini: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
      elevenlabsModel: process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2',
    },
  });
}
