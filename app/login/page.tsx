'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { BrandLogo } from '@/components/shell/brand-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/lib/constants/routes';
import { signInWithPassword, signOutEverywhere, signUpWithPassword } from '@/lib/auth/browser';
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [next, setNext] = useState<string>(ROUTES.home);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('next');
    if (!value?.startsWith('/') || value.startsWith('//')) {
      setNext(ROUTES.home);
      return;
    }
    setNext(value);
  }, []);

  async function submit(selectedMode: 'sign-in' | 'sign-up') {
    setPending(true);
    setError('');
    setMessage('');

    try {
      if (!email.trim() || !password.trim()) {
        setError('Email and password are required.');
        return;
      }

      if (selectedMode === 'sign-in') {
        const result = await signInWithPassword(email.trim(), password);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push(next);
        router.refresh();
        return;
      }

      const result = await signUpWithPassword(email.trim(), password);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (result.requiresConfirmation) {
        setMessage('Account created. Please confirm your email, then sign in.');
        return;
      }

      router.push(next);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <AppShell showBottomNav={false} className="pb-14">
      <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-center py-6">
        <div className="mx-auto mb-6 text-center">
          <BrandLogo size="xl" stacked />
          <div className="mt-5 font-serif text-[18px] text-muted-foreground">
            Cook smarter with an AI masterchef.
          </div>
        </div>

        <div className="rounded-[30px] border border-border/80 bg-card p-6 shadow-card">
          <div className="space-y-4">
            {error ? (
              <div className="rounded-[22px] border border-primary/25 bg-primary-soft/55 px-4 py-3 text-sm text-primary-dark">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-[22px] border border-accent-green/25 bg-accent-green-soft px-4 py-3 text-sm text-accent-green">
                {message}
              </div>
            ) : null}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
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
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
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

              <div className="grid gap-3 pt-1">
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  disabled={pending}
                  onClick={() => {
                    setMode('sign-in');
                    void submit('sign-in');
                  }}
                >
                  <LogIn className="h-4 w-4" />
                  {pending && mode === 'sign-in' ? 'Signing in...' : 'Sign In'}
                </Button>

                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  disabled={pending}
                  onClick={() => {
                    setMode('sign-up');
                    void submit('sign-up');
                  }}
                >
                  <UserPlus className="h-4 w-4 text-primary" />
                  {pending && mode === 'sign-up' ? 'Creating account...' : 'Sign Up'}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/70 pt-5 text-sm text-muted-foreground">
            <Link href={next} className="text-primary hover:text-primary-dark">
              Continue to app
            </Link>

            <button
              type="button"
              onClick={() => void signOutEverywhere()}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
