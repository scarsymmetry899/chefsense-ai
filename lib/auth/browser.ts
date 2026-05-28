'use client';

const AUTH_STORAGE_KEY = 'sb-chefsense-auth-token';
const AUTH_EVENT = 'chefsense:auth-changed';
const AUTH_COOKIE = 'chefsense_session';

export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type AuthSession = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  user: AuthUser;
};

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase public environment variables are missing.');
  }

  return {
    url: url.replace(/\/+$/, ''),
    anonKey,
  };
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function dispatchAuthChange() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(AUTH_EVENT));
}

function setAuthCookie(active: boolean) {
  if (!isBrowser()) return;
  if (active) {
    document.cookie = `${AUTH_COOKIE}=1; Path=/; Max-Age=2592000; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

export function getStoredAuthSession() {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function hasAuthSession() {
  return Boolean(getStoredAuthSession()?.access_token);
}

export function getAuthUser() {
  return getStoredAuthSession()?.user ?? null;
}

export function persistAuthSession(session: AuthSession) {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  setAuthCookie(true);
  dispatchAuthChange();
}

export function clearAuthSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  setAuthCookie(false);
  dispatchAuthChange();
}

export function subscribeToAuth(listener: () => void) {
  if (!isBrowser()) return () => undefined;
  window.addEventListener(AUTH_EVENT, listener);
  return () => window.removeEventListener(AUTH_EVENT, listener);
}

async function getUserFromAccessToken(accessToken: string) {
  const { url, anonKey } = getConfig();

  const response = await fetch(`${url}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as AuthUser | null;
  return payload;
}

async function authRequest<T>(path: string, body?: unknown, accessToken?: string) {
  const { url, anonKey } = getConfig();

  const response = await fetch(`${url}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = response.headers.get('content-type')?.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    return {
      ok: false as const,
      error:
        typeof payload?.msg === 'string'
          ? payload.msg
          : typeof payload?.error_description === 'string'
            ? payload.error_description
            : typeof payload?.message === 'string'
              ? payload.message
              : 'Something went wrong while talking to Supabase auth.',
    };
  }

  return {
    ok: true as const,
    data: payload as T,
  };
}

type SignInPayload = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  user: AuthUser;
};

type SignUpPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  user?: AuthUser;
  session?: SignInPayload | null;
};

type SignUpMetadata = {
  name: string;
  phone: string;
};

export async function signInWithPassword(email: string, password: string) {
  const result = await authRequest<SignInPayload>(
    'token?grant_type=password',
    { email, password },
  );

  if (!result.ok) return result;

  const session: AuthSession = {
    access_token: result.data.access_token,
    refresh_token: result.data.refresh_token,
    expires_at: result.data.expires_at,
    expires_in: result.data.expires_in,
    token_type: result.data.token_type,
    user: result.data.user,
  };

  persistAuthSession(session);

  return {
    ok: true as const,
    session,
  };
}

export async function signUpWithPassword(
  email: string,
  password: string,
  metadata?: Partial<SignUpMetadata>,
) {
  // Point the confirmation email back to /auth/callback on the same origin so
  // consumeAuthHashFromUrl() can pick up the session after email verification.
  const emailRedirectTo = isBrowser()
    ? `${window.location.origin}/auth/callback`
    : undefined;

  const result = await authRequest<SignUpPayload>('signup', {
    email,
    password,
    data: {
      name: metadata?.name?.trim() || undefined,
      phone: metadata?.phone?.trim() || undefined,
    },
    ...(emailRedirectTo ? { email_redirect_to: emailRedirectTo } : {}),
  });

  if (!result.ok) return result;

  if (result.data.session?.access_token && result.data.session.user) {
    persistAuthSession(result.data.session as AuthSession);
    return {
      ok: true as const,
      session: result.data.session as AuthSession,
      requiresConfirmation: false,
    };
  }

  return {
    ok: true as const,
    session: null,
    requiresConfirmation: true,
  };
}

export async function signOutEverywhere() {
  const session = getStoredAuthSession();

  if (session?.access_token) {
    await authRequest('logout', undefined, session.access_token).catch(() => null);
  }

  clearAuthSession();
}

export async function consumeAuthHashFromUrl() {
  if (!isBrowser()) {
    return { ok: false as const, error: 'Browser session not available.' };
  }

  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;

  if (!hash) {
    return { ok: false as const, error: 'No auth hash found.' };
  }

  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token')?.trim();
  const refreshToken = params.get('refresh_token')?.trim();
  const expiresAt = params.get('expires_at');
  const expiresIn = params.get('expires_in');
  const tokenType = params.get('token_type')?.trim() || 'bearer';
  const errorDescription = params.get('error_description')?.trim();

  if (errorDescription) {
    return { ok: false as const, error: errorDescription };
  }

  if (!accessToken) {
    return { ok: false as const, error: 'No access token found in verification link.' };
  }

  const user = await getUserFromAccessToken(accessToken);
  if (!user?.id) {
    return { ok: false as const, error: 'Could not load the verified user session.' };
  }

  persistAuthSession({
    access_token: accessToken,
    refresh_token: refreshToken || undefined,
    expires_at: expiresAt ? Number(expiresAt) : undefined,
    expires_in: expiresIn ? Number(expiresIn) : undefined,
    token_type: tokenType,
    user,
  });

  window.history.replaceState(
    {},
    document.title,
    `${window.location.pathname}${window.location.search}`,
  );

  return { ok: true as const, user };
}
