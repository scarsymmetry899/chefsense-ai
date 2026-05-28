'use client';

export const PERSISTENCE_EVENT = 'chefsense:persistence-updated';

type PersistenceMeta = {
  updatedAt: number;
};

type SupabaseSession = {
  accessToken: string;
  userId: string;
};

type SupabaseRecord<T> = {
  payload: T;
  updated_at?: string;
};

const META_SUFFIX = '.__meta';
const DEFAULT_TABLE = 'user_state';

function isBrowser() {
  return typeof window !== 'undefined';
}

function getMetaKey(key: string) {
  return `${key}${META_SUFFIX}`;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readLocalMeta(key: string): PersistenceMeta {
  if (!isBrowser()) return { updatedAt: 0 };
  return safeParseJson<PersistenceMeta>(window.localStorage.getItem(getMetaKey(key))) ?? {
    updatedAt: 0,
  };
}

function writeLocalMeta(key: string, updatedAt: number) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(getMetaKey(key), JSON.stringify({ updatedAt } satisfies PersistenceMeta));
  } catch {
    // Ignore persistence failures.
  }
}

function dispatchPersistenceEvent(key: string, source: 'local' | 'remote' | 'sync') {
  if (!isBrowser()) return;
  window.dispatchEvent(
    new CustomEvent(PERSISTENCE_EVENT, {
      detail: { key, source },
    }),
  );
}

function extractSessionShape(value: unknown): SupabaseSession | null {
  if (!value || typeof value !== 'object') return null;

  const obj = value as Record<string, unknown>;
  const accessToken =
    typeof obj.access_token === 'string'
      ? obj.access_token
      : typeof obj.accessToken === 'string'
        ? obj.accessToken
        : null;
  const userId =
    obj.user && typeof obj.user === 'object' && obj.user !== null
      ? typeof (obj.user as Record<string, unknown>).id === 'string'
        ? ((obj.user as Record<string, unknown>).id as string)
        : null
      : null;

  if (accessToken && userId) {
    return { accessToken, userId };
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const nested = extractSessionShape(entry);
      if (nested) return nested;
    }
  }

  for (const nestedValue of Object.values(obj)) {
    const nested = extractSessionShape(nestedValue);
    if (nested) return nested;
  }

  return null;
}

export function getSupabaseSession() {
  if (!isBrowser()) return null;

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !/-auth-token$/.test(key)) continue;
    const parsed = safeParseJson<unknown>(window.localStorage.getItem(key));
    const session = extractSessionShape(parsed);
    if (session) return session;
  }

  return null;
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const table = process.env.NEXT_PUBLIC_SUPABASE_STATE_TABLE ?? DEFAULT_TABLE;
  const session = getSupabaseSession();

  if (!url || !anonKey || !session) return null;

  return {
    url: url.replace(/\/+$/, ''),
    anonKey,
    table,
    session,
  };
}

async function requestSupabase<T>(path: string, init?: RequestInit) {
  const config = getSupabaseConfig();
  if (!config) return null;

  const response = await fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.session.accessToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase persistence request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return (await response.json()) as T;
}

const hydrationPromises = new Map<string, Promise<boolean>>();
const syncPromises = new Map<string, Promise<void>>();
const queuedSyncValues = new Map<string, unknown>();

export function readLocalJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  const parsed = safeParseJson<T>(window.localStorage.getItem(key));
  return parsed ?? fallback;
}

export function writeLocalJson<T>(
  key: string,
  value: T,
  options?: { updatedAt?: number; source?: 'local' | 'remote' | 'sync' },
) {
  if (!isBrowser()) return;

  const updatedAt = options?.updatedAt ?? Date.now();
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    writeLocalMeta(key, updatedAt);
  } catch {
    // Ignore persistence failures.
  }

  dispatchPersistenceEvent(key, options?.source ?? 'local');
}

export function getLocalUpdatedAt(key: string) {
  return readLocalMeta(key).updatedAt;
}

export async function hydrateKeyFromSupabase<T>(key: string) {
  if (!isBrowser()) return false;
  const existing = hydrationPromises.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const config = getSupabaseConfig();
    if (!config) return false;

    try {
      const queryKey = encodeURIComponent(key);
      const rows =
        (await requestSupabase<SupabaseRecord<T>[]>(
          `/rest/v1/${config.table}?select=payload,updated_at&user_id=eq.${encodeURIComponent(config.session.userId)}&state_key=eq.${queryKey}`,
        )) ?? [];
      const remote = rows[0];
      if (!remote) return false;

      const remoteUpdatedAt = remote.updated_at ? Date.parse(remote.updated_at) : 0;
      const localUpdatedAt = getLocalUpdatedAt(key);
      const hasLocalValue = window.localStorage.getItem(key) !== null;

      if (!hasLocalValue || remoteUpdatedAt > localUpdatedAt) {
        writeLocalJson(key, remote.payload, {
          updatedAt: remoteUpdatedAt || Date.now(),
          source: 'remote',
        });
        return true;
      }

      if (localUpdatedAt > remoteUpdatedAt) {
        const localValue = safeParseJson<T>(window.localStorage.getItem(key));
        if (localValue !== null) {
          void syncKeyToSupabase(key, localValue);
        }
      }

      return false;
    } catch {
      return false;
    } finally {
      hydrationPromises.delete(key);
    }
  })();

  hydrationPromises.set(key, promise);
  return promise;
}

export async function hydrateKeysFromSupabase(keys: string[]) {
  if (!isBrowser() || !keys.length) return false;
  const results = await Promise.all(keys.map((key) => hydrateKeyFromSupabase(key)));
  return results.some(Boolean);
}

export async function syncKeyToSupabase<T>(key: string, value: T) {
  if (!isBrowser()) return;
  queuedSyncValues.set(key, value);
  const existing = syncPromises.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const config = getSupabaseConfig();
    if (!config) return;

    try {
      const payload = (queuedSyncValues.get(key) as T | undefined) ?? value;
      queuedSyncValues.delete(key);
      const updatedAt = new Date(getLocalUpdatedAt(key) || Date.now()).toISOString();
      await requestSupabase(
        `/rest/v1/${config.table}?on_conflict=user_id,state_key`,
        {
          method: 'POST',
          headers: {
            Prefer: 'resolution=merge-duplicates,return=minimal',
          },
          body: JSON.stringify([
            {
              user_id: config.session.userId,
              state_key: key,
              payload,
              updated_at: updatedAt,
            },
          ]),
        },
      );
      dispatchPersistenceEvent(key, 'sync');
    } catch {
      // Ignore sync failures and keep local state as source of truth.
    } finally {
      syncPromises.delete(key);
      if (queuedSyncValues.has(key)) {
        void syncKeyToSupabase(key, queuedSyncValues.get(key) as T);
      }
    }
  })();

  syncPromises.set(key, promise);
  return promise;
}

export function subscribeToPersistence(
  listener: (detail: { key: string; source: 'local' | 'remote' | 'sync' }) => void,
) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleEvent = (event: Event) => {
    const detail = (event as CustomEvent<{ key: string; source: 'local' | 'remote' | 'sync' }>).detail;
    if (detail) {
      listener(detail);
    }
  };

  window.addEventListener(PERSISTENCE_EVENT, handleEvent as EventListener);
  return () => window.removeEventListener(PERSISTENCE_EVENT, handleEvent as EventListener);
}

export function isSupabasePersistenceEnabled() {
  return Boolean(getSupabaseConfig());
}
