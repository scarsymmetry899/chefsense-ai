import { getSupabaseServiceRoleKey, getSupabaseUrl } from './env';

export async function supabaseAdminFetch<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${getSupabaseUrl()}${path}`, {
    ...init,
    headers: {
      apikey: getSupabaseServiceRoleKey(),
      Authorization: `Bearer ${getSupabaseServiceRoleKey()}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase admin request failed with ${response.status}`);
  }

  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}
