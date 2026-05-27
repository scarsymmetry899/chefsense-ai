'use client';

type RecentDishEntry = {
  dishId: string;
  viewedAt: number;
};

type ShareEntry = {
  dishId: string;
  sharedAt: number;
  channel: 'share' | 'copy' | 'save';
};

const RECENT_KEY = 'chefsense.recent';
const SHARES_KEY = 'chefsense.shares';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore persistence failures.
  }
}

export function recordRecentlyViewedDish(dishId: string) {
  const current = readJson<RecentDishEntry[]>(RECENT_KEY, []);
  const next = [
    { dishId, viewedAt: Date.now() },
    ...current.filter((entry) => entry.dishId !== dishId),
  ].slice(0, 8);
  writeJson(RECENT_KEY, next);
}

export function getRecentlyViewedDishes() {
  return readJson<RecentDishEntry[]>(RECENT_KEY, []);
}

export function recordShareAction(dishId: string, channel: ShareEntry['channel']) {
  const current = readJson<ShareEntry[]>(SHARES_KEY, []);
  const next = [{ dishId, sharedAt: Date.now(), channel }, ...current].slice(0, 20);
  writeJson(SHARES_KEY, next);
}

export function getShareActions() {
  return readJson<ShareEntry[]>(SHARES_KEY, []);
}

export function formatViewedAgo(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins} mins`;
  const hours = Math.round(mins / 60);
  return `${hours} hr`;
}
