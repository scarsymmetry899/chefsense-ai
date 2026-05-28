'use client';

import {
  hydrateKeysFromSupabase,
  readLocalJson,
  syncKeyToSupabase,
  writeLocalJson,
} from '@/lib/persistence/supabase-browser';

type RecentDishEntry = {
  dishId: string;
  viewedAt: number;
};

type ShareEntry = {
  dishId: string;
  sharedAt: number;
  channel: 'share' | 'copy' | 'save';
};

type ProfileSettings = {
  name: string;
  phone: string;
  tagline: string;
  avatarUrl: string | null;
};

type CompletedDishEntry = {
  dishId: string;
  finishedAt: number;
  minutes: number;
  score: number;
  summary: string;
};

const RECENT_KEY = 'chefsense.recent';
const SHARES_KEY = 'chefsense.shares';
const PROFILE_KEY = 'chefsense.profile';
const COMPLETED_KEY = 'chefsense.completed';
const LANG_KEY = 'chefsense.lang';

export const USER_STATE_KEYS = [
  RECENT_KEY,
  SHARES_KEY,
  PROFILE_KEY,
  COMPLETED_KEY,
  LANG_KEY,
] as const;

function persist<T>(key: string, value: T) {
  writeLocalJson(key, value);
  void syncKeyToSupabase(key, value);
}

export function recordRecentlyViewedDish(dishId: string) {
  const current = readLocalJson<RecentDishEntry[]>(RECENT_KEY, []);
  const next = [
    { dishId, viewedAt: Date.now() },
    ...current.filter((entry) => entry.dishId !== dishId),
  ].slice(0, 8);
  persist(RECENT_KEY, next);
}

export function getRecentlyViewedDishes() {
  return readLocalJson<RecentDishEntry[]>(RECENT_KEY, []);
}

export function recordShareAction(dishId: string, channel: ShareEntry['channel']) {
  const current = readLocalJson<ShareEntry[]>(SHARES_KEY, []);
  const next = [{ dishId, sharedAt: Date.now(), channel }, ...current].slice(0, 20);
  persist(SHARES_KEY, next);
}

export function getShareActions() {
  return readLocalJson<ShareEntry[]>(SHARES_KEY, []);
}

export function getProfileSettings(): ProfileSettings {
  const stored = readLocalJson<Partial<ProfileSettings>>(PROFILE_KEY, {});
  return {
    name: stored.name ?? 'Abhit',
    phone: stored.phone ?? '+91',
    tagline: stored.tagline ?? 'ChefSense home cook • guided Indian cooking enthusiast',
    avatarUrl: stored.avatarUrl ?? null,
  };
}

export function saveProfileSettings(settings: ProfileSettings) {
  persist(PROFILE_KEY, settings);
}

export function getCompletedDishEntries() {
  return readLocalJson<CompletedDishEntry[]>(COMPLETED_KEY, []);
}

export function recordCompletedDish(entry: CompletedDishEntry) {
  const current = readLocalJson<CompletedDishEntry[]>(COMPLETED_KEY, []);
  const next = [
    entry,
    ...current.filter(
      (item) => !(item.dishId === entry.dishId && item.finishedAt === entry.finishedAt),
    ),
  ].slice(0, 20);
  persist(COMPLETED_KEY, next);
}

export function formatViewedAgo(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins} mins`;
  const hours = Math.round(mins / 60);
  return `${hours} hr`;
}

/**
 * Pull every user-state key from Supabase into localStorage (last-write-wins by
 * timestamp). Safe to call repeatedly; the persistence layer dedupes in-flight
 * hydrations per key.
 */
export async function hydrateAllUserState() {
  return hydrateKeysFromSupabase([...USER_STATE_KEYS]);
}
