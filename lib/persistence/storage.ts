// SETUP: Create a public bucket named 'avatars' in Supabase Storage with policy allowing authenticated insert/select on own path.
'use client';

import { getSupabaseSession } from '@/lib/persistence/supabase-browser';

type UploadResult = { url: string } | { error: string };

function getExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  const fromType = file.type.split('/').pop()?.toLowerCase();
  if (fromType && /^[a-z0-9]{2,5}$/.test(fromType)) return fromType;
  return 'jpg';
}

export async function uploadAvatar(file: File, userId: string): Promise<UploadResult> {
  if (typeof window === 'undefined') {
    return { error: 'Avatar upload is only available in the browser.' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return { error: 'Supabase storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' };
  }

  const session = getSupabaseSession();
  if (!session) {
    return { error: 'You need to be signed in to upload a profile picture.' };
  }

  const trimmedUrl = supabaseUrl.replace(/\/+$/, '');
  const safeUserId = encodeURIComponent(userId || session.userId);
  const ext = getExtension(file);
  const path = `${safeUserId}/avatar-${Date.now()}.${ext}`;
  const endpoint = `${trimmedUrl}/storage/v1/object/avatars/${path}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        apikey: anonKey,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
        'cache-control': '3600',
      },
      body: file,
    });

    if (!response.ok) {
      let message = `Upload failed with status ${response.status}`;
      try {
        const data = (await response.json()) as { message?: string; error?: string };
        message = data.message ?? data.error ?? message;
      } catch {
        // ignore parse errors
      }
      return { error: message };
    }

    const publicUrl = `${trimmedUrl}/storage/v1/object/public/avatars/${path}`;
    return { url: publicUrl };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Could not upload the picture. Please try again.',
    };
  }
}
