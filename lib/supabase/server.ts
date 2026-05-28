import { getSupabaseAnonKey, getSupabaseUrl } from './env';

export function getSupabaseServerConfig() {
  return {
    url: getSupabaseUrl(),
    anonKey: getSupabaseAnonKey(),
  };
}

export async function supabaseServerFetch<T>(
  path: string,
  init?: RequestInit & { accessToken?: string },
) {
  const { url, anonKey } = getSupabaseServerConfig();

  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
      ...(init?.accessToken ? { Authorization: `Bearer ${init.accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase server request failed with ${response.status}`);
  }

  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}
