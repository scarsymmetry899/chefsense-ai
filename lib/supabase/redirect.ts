import type { NextRequest } from 'next/server';

function toSingle(value: FormDataEntryValue | string | null | undefined) {
  return typeof value === 'string' ? value : '';
}

export function getSafeRedirectPath(
  value: FormDataEntryValue | string | null | undefined,
  fallback = '/home',
) {
  const candidate = toSingle(value).trim();

  if (!candidate.startsWith('/')) {
    return fallback;
  }

  if (candidate.startsWith('//')) {
    return fallback;
  }

  return candidate;
}

export function buildAppUrl(request: NextRequest, pathname: string) {
  return new URL(pathname, request.url);
}

export function setSearchMessage(
  pathname: string,
  key: 'error' | 'message',
  value: string,
  extra?: Record<string, string>,
) {
  const params = new URLSearchParams(extra);
  params.set(key, value);
  return params.toString() ? `${pathname}?${params.toString()}` : pathname;
}

