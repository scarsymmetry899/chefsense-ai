'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { BrandLogo } from '@/components/shell/brand-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/lib/constants/routes';
import { consumeAuthHashFromUrl, signInWithPassword, signUpWithPassword } from '@/lib/auth/browser';
import { getProfileSettings, saveProfileSettings } from '@/lib/user-state';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [forgotShown, setForgotShown] = useState(false);
  const [authBootstrapping, setAuthBootstrapping] = useState(true);
  const [next, setNext] = useState<string>(ROUTES.welcome);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('next');
    const safeNext =
      value?.startsWith('/') && !value.startsWith('//') ? value : ROUTES.welcome;
    setNext(safeNext);

    let cancelled = false;

    async function bootstrapAuth() {
      try {
        if (window.location.hash.includes('access_token=')) {
          const result = await consumeAuthHashFromUrl();
          if (cancelled) return;

          if (!result.ok) {
            setError(result.error);
          } else {
            setMessage('Email verified — you are signed in.');
            router.replace(safeNext);
            router.refresh();
            return;
          }
        }

        const messageFromSearch = new URLSearchParams(window.location.search).get('message');
        if (!cancelled && messageFromSearch) {
          setMessage(messageFromSearch);
        }
      } finally {
        if (!cancelled) {
          setAuthBootstrapping(false);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  function hydrateProfileFromSession() {
    const current = getProfileSettings();
    const normalizedPhone = phone.trim() || current.phone;
    const normalizedName = name.trim() || current.name;

    saveProfileSettings({
      name: normalizedName,
      phone: normalizedPhone,
      tagline: current.tagline,
      avatarUrl: current.avatarUrl,
    });
  }

  async function submit(selectedMode: 'sign-in' | 'sign-up') {
    setPending(true);
    setError('');
    setMessage('');

    try {
      if (!email.trim() || !password.trim()) {
        setError('Pop in both your email and password before we open the kitchen.');
        return;
      }

      if (selectedMode === 'sign-in') {
        const result = await signInWithPassword(email.trim(), password);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        hydrateProfileFromSession();
        router.push(next);
        router.refresh();
        return;
      }

      if (!name.trim() || !phone.trim()) {
        setError('We need a name and phone so we know who is at the stove.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Those two passwords do not match yet — try once more.');
        return;
      }

      const result = await signUpWithPassword(email.trim(), password, {
        name,
        phone,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      hydrateProfileFromSession();

      if (result.requiresConfirmation) {
        setMessage('Account ready. Confirm your email, then sign in to start cooking.');
        setMode('sign-in');
        return;
      }

      router.push(next);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <AppShell showBottomNav={false} className="pb-0">
      {/* Flex column: scrollable form above, sticky CTA pinned at the bottom of the viewport. */}
      <div className="flex min-h-[calc(100dvh-2rem)] flex-col">
        <div className="flex-1 pt-4">
          <div className="mx-auto mb-5 text-center">
            <BrandLogo size="xl" stacked />
            <div className="t-body-lg mt-5 text-muted-foreground">
              Cook smarter with an AI masterchef.
            </div>
          </div>

          <div className="rounded-[30px] border border-border/80 bg-card p-5 shadow-card">
            {authBootstrapping ? (
              <div className="t-body rounded-[22px] border border-border/70 bg-background px-4 py-3 text-muted-foreground">
                Warming up the kitchen…
              </div>
            ) : null}

            <div className="space-y-4">
              <div className="flex rounded-full border border-border/70 bg-background p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('sign-in');
                    setError('');
                    setMessage('');
                  }}
                  className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    mode === 'sign-in'
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-muted-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('sign-up');
                    setError('');
                    setMessage('');
                  }}
                  className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    mode === 'sign-up'
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-muted-foreground'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {error ? (
                <div className="t-body rounded-[22px] border border-primary/25 bg-primary-soft/55 px-4 py-3 text-primary-dark">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="t-body rounded-[22px] border border-accent-green/25 bg-accent-green-soft px-4 py-3 text-accent-green">
                  {message}
                </div>
              ) : null}

              {forgotShown ? (
                <div className="t-body rounded-[22px] border border-secondary/35 bg-secondary-soft/60 px-4 py-3 text-foreground/85">
                  Password reset is coming soon. For now, sign back in with your existing password or create a new account.
                </div>
              ) : null}

              <div className="space-y-4">
                {mode === 'sign-up' ? (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="name" className="t-body font-medium text-foreground">
                        Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your full name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="t-body font-medium text-foreground">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        required
                      />
                    </div>
                  </>
                ) : null}

                <div className="space-y-2">
                  <label htmlFor="email" className="t-body font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="password" className="t-body font-medium text-foreground">
                      Password
                    </label>
                    {mode === 'sign-in' ? (
                      <button
                        type="button"
                        onClick={() => setForgotShown((current) => !current)}
                        className="text-[12px] font-semibold text-primary hover:text-primary-dark"
                      >
                        Forgot password?
                      </button>
                    ) : null}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void submit(mode);
                      }
                    }}
                    minLength={6}
                    required
                  />
                </div>

                {mode === 'sign-up' ? (
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="t-body font-medium text-foreground">
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          void submit('sign-up');
                        }
                      }}
                      minLength={6}
                      required
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky bottom-anchored primary CTA — sits in the thumb zone on every viewport. */}
        <div className="sticky bottom-0 -mx-5 mt-6 border-t border-border/40 bg-background/95 px-5 pb-4 pt-3 backdrop-blur-sm">
          {mode === 'sign-in' ? (
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={pending || authBootstrapping}
              onClick={() => void submit('sign-in')}
            >
              <LogIn className="h-4 w-4" />
              {pending ? 'Signing in…' : 'Sign In'}
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={pending || authBootstrapping}
              onClick={() => void submit('sign-up')}
            >
              <UserPlus className="h-4 w-4" />
              {pending ? 'Creating account…' : 'Sign Up'}
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
