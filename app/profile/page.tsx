'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Clock, Eye, Flame, Loader2, Pencil, Share2 } from 'lucide-react';
import { TT } from '@/components/shared/translated';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { ScreenCard, SectionEyebrow, StatusPill } from '@/components/dish/screen-kit';
import { ROUTES } from '@/lib/constants/routes';
import { ALL_DISHES, getDish } from '@/lib/data/dishes';
import {
  getCompletedDishEntries,
  getProfileSettings,
  getShareActions,
  getRecentlyViewedDishes,
  saveProfileSettings,
} from '@/lib/user-state';
import { getTotalCookingMinutes, hasInProgressDish } from '@/lib/cooking-session';
import { uploadAvatar } from '@/lib/persistence/storage';
import { getSupabaseSession } from '@/lib/persistence/supabase-browser';
import { getAuthUser } from '@/lib/auth/browser';

function ScoreGauge({
  score,
  size = 168,
  stroke = 14,
  label,
  variant = 'primary',
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
  variant?: 'primary' | 'compact';
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 135;
  const endAngle = 45;
  const sweep = 360 - (startAngle - endAngle); // 270
  const arcLength = (sweep / 360) * 2 * Math.PI * radius;
  const dashOffset = arcLength * (1 - clamped / 100);

  function polar(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }
  const start = polar(startAngle);
  const end = polar(endAngle);
  const largeArc = sweep > 180 ? 1 : 0;
  const arcPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;

  const numberSize = variant === 'compact' ? 'text-[28px]' : 'text-[44px]';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <linearGradient id={`gauge-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary-dark))" />
          </linearGradient>
        </defs>
        <path
          d={arcPath}
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.18)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={arcPath}
          fill="none"
          stroke={`url(#gauge-gradient-${size})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div
          className={`font-sans ${numberSize} font-semibold leading-none tracking-[-0.05em] text-foreground tabular-nums`}
        >
          {clamped}
        </div>
        {label ? (
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <TT>{label}</TT>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof Clock;
  label: string;
  value: number | string;
  tint: 'primary' | 'copper' | 'neutral' | 'green';
}) {
  const tintStyles = {
    primary: { wrap: 'bg-primary-soft/70 text-primary', stripe: 'bg-primary' },
    copper: { wrap: 'bg-secondary-soft text-copper', stripe: 'bg-copper' },
    neutral: { wrap: 'bg-muted text-foreground/80', stripe: 'bg-muted-foreground/40' },
    green: { wrap: 'bg-accent-green-soft text-accent-green', stripe: 'bg-accent-green' },
  }[tint];

  return (
    <ScreenCard className="relative overflow-hidden p-4">
      <span className={`absolute left-0 top-0 h-full w-1 ${tintStyles.stripe}`} aria-hidden />
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${tintStyles.wrap}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        <TT>{label}</TT>
      </div>
      <div className="mt-1 font-sans text-[30px] font-semibold leading-none tracking-[-0.04em] text-foreground tabular-nums">
        {value}
      </div>
    </ScreenCard>
  );
}

type UploadState = { status: 'idle' } | { status: 'uploading' } | { status: 'error'; message: string };

function readString(meta: Record<string, unknown> | undefined, key: string): string {
  const v = meta?.[key];
  return typeof v === 'string' ? v : '';
}

export default function ProfilePage() {
  const recent = getRecentlyViewedDishes();
  const shares = getShareActions();
  const completed = getCompletedDishEntries();
  const totalMinutes = ALL_DISHES.reduce(
    (sum, dish) => sum + getTotalCookingMinutes(dish.dishId),
    0,
  );
  const inProgress = ALL_DISHES.filter((dish) => hasInProgressDish(dish.dishId)).length;

  // Auth-derived identity. These are display-only and don't get edited from this screen.
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authEmail, setAuthEmail] = useState('');

  const [profile, setProfile] = useState(() => ({
    name: '',
    phone: '',
    tagline: 'ChefSense home cook • guided Indian cooking enthusiast',
    avatarUrl: null as string | null,
  }));
  // Snapshot of the last-saved tagline+avatar, used to detect dirtiness.
  const [savedSnapshot, setSavedSnapshot] = useState({
    tagline: '',
    avatarUrl: null as string | null,
  });
  const [saved, setSaved] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // First-load hydration: read auth identity + stored tagline/avatar.
  useEffect(() => {
    const user = getAuthUser();
    const meta = user?.user_metadata;
    const metaName = readString(meta, 'name');
    const metaPhone = readString(meta, 'phone');
    setAuthName(metaName);
    setAuthPhone(metaPhone);
    setAuthEmail(user?.email ?? '');

    const stored = getProfileSettings();
    // Prefer auth metadata for name/phone; fall back to stored, then to email handle.
    const resolvedName =
      metaName || (stored.name && stored.name !== 'Abhit' ? stored.name : '') || (user?.email?.split('@')[0] ?? '');
    const resolvedPhone = metaPhone || (stored.phone && stored.phone !== '+91' ? stored.phone : '');
    const tagline = stored.tagline;
    const avatarUrl = stored.avatarUrl;

    setProfile({
      name: resolvedName,
      phone: resolvedPhone,
      tagline,
      avatarUrl,
    });
    setSavedSnapshot({ tagline, avatarUrl });

    // Ensure storage stays in sync with the auth-derived identity so other
    // surfaces (e.g. recipe-card sharing) see the right name.
    if (resolvedName !== stored.name || resolvedPhone !== stored.phone) {
      saveProfileSettings({
        name: resolvedName,
        phone: resolvedPhone,
        tagline,
        avatarUrl,
      });
    }
  }, []);

  const averageScore = useMemo(() => {
    if (!completed.length) return 0;
    return Math.round(completed.reduce((sum, item) => sum + item.score, 0) / completed.length);
  }, [completed]);

  const scoreDeltas = useMemo(() => {
    return completed.map((entry, index) => {
      const older = completed[index + 1];
      if (!older) return null;
      return entry.score - older.score;
    });
  }, [completed]);

  const recentlyCompleted = completed
    .map((entry, index) => ({ entry, dish: getDish(entry.dishId), delta: scoreDeltas[index] }))
    .filter(
      (item): item is {
        entry: (typeof completed)[number];
        dish: NonNullable<ReturnType<typeof getDish>>;
        delta: number | null;
      } => Boolean(item.dish),
    )
    .slice(0, 4);

  const displayAvatar = avatarPreview ?? profile.avatarUrl;
  const isDirty =
    profile.tagline !== savedSnapshot.tagline || profile.avatarUrl !== savedSnapshot.avatarUrl;

  function handleAvatarClick() {
    if (uploadState.status === 'uploading') return;
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || typeof window === 'undefined') return;

    if (!file.type.startsWith('image/')) {
      setUploadState({ status: 'error', message: 'Please choose an image file.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);

    setUploadState({ status: 'uploading' });

    const session = getSupabaseSession();
    if (!session) {
      setUploadState({
        status: 'error',
        message: 'Sign in first to upload a profile picture.',
      });
      return;
    }

    const result = await uploadAvatar(file, session.userId);
    if ('error' in result) {
      setUploadState({ status: 'error', message: result.error });
      return;
    }

    // Avatar is saved immediately (no need to wait for the explicit Save).
    const next = { ...profile, avatarUrl: result.url };
    setProfile(next);
    saveProfileSettings(next);
    setSavedSnapshot((prev) => ({ ...prev, avatarUrl: result.url }));
    setAvatarPreview(null);
    setUploadState({ status: 'idle' });
  }

  function handleSaveProfile() {
    saveProfileSettings(profile);
    setSavedSnapshot({ tagline: profile.tagline, avatarUrl: profile.avatarUrl });
    setSaved(true);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => setSaved(false), 1600);
    }
  }

  const displayName = profile.name || 'Cook';
  const displayPhone = profile.phone || (authEmail ? authEmail : 'Add a phone number when you sign up');

  return (
    <AppShell>
      <Header backHref={ROUTES.home} title={<TT>Profile</TT>} />

      {/* IDENTITY CARD — avatar + name/phone (display from auth) + editable tagline. */}
      <ScreenCard>
        <SectionEyebrow label={<TT>Your cooking profile</TT>} />

        <div className="flex flex-col items-center gap-4 text-center">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={uploadState.status === 'uploading'}
            className="group relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/40 bg-primary-soft/40 text-primary transition-all hover:border-primary/70 hover:bg-primary-soft/60 disabled:cursor-wait"
            aria-label={displayAvatar ? 'Change profile picture' : 'Add profile picture'}
          >
            {displayAvatar ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayAvatar}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-1 right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-white shadow-md">
                  <Pencil className="h-3.5 w-3.5" />
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 px-2 text-center">
                <Camera className="h-6 w-6" />
                <span className="text-[10px] font-medium uppercase tracking-[0.1em]">
                  <TT>Add picture</TT>
                </span>
              </div>
            )}
            {uploadState.status === 'uploading' ? (
              <span className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </span>
            ) : null}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void handleFileChange(event)}
          />

          <div>
            <div className="font-serif text-[28px] leading-tight text-foreground">{displayName}</div>
            <div className="mt-1 text-sm leading-6 text-muted-foreground">{displayPhone}</div>
            {authEmail && profile.phone ? (
              <div className="mt-0.5 text-[12px] text-muted-foreground/80">{authEmail}</div>
            ) : null}
          </div>
        </div>

        {uploadState.status === 'error' ? (
          <div className="mt-4 rounded-full bg-primary-soft px-3 py-1.5 text-center text-xs font-medium text-primary-dark">
            {uploadState.message}
          </div>
        ) : null}

        <textarea
          value={profile.tagline}
          onChange={(event) =>
            setProfile((current) => ({ ...current, tagline: event.target.value }))
          }
          placeholder="A line about how you cook…"
          className="mt-4 min-h-[72px] w-full resize-none rounded-[18px] border border-border bg-background px-4 py-3 text-sm leading-6 text-muted-foreground outline-none transition focus:border-primary/40 focus:bg-card"
        />

        {/* Save button only appears when there are unsynced edits. */}
        {isDirty ? (
          <button
            type="button"
            onClick={handleSaveProfile}
            className="mt-3 w-full rounded-full border border-primary/20 gradient-cta px-5 py-3 text-sm font-semibold text-white shadow-cta"
          >
            <TT>Save profile</TT>
          </button>
        ) : null}
        {saved ? (
          <div className="mt-3 flex justify-center">
            <StatusPill label={<TT>Profile synced</TT>} tone="green" />
          </div>
        ) : null}
      </ScreenCard>

      {/* CHEFSCORE CARD — centered gauge with summary. */}
      <ScreenCard className="mt-5">
        <SectionEyebrow label={<TT>ChefScore average</TT>} />
        <div className="flex flex-col items-center gap-3">
          <ScoreGauge score={averageScore || 0} label="Avg score" />
          <div className="text-center text-xs leading-5 text-muted-foreground">
            {completed.length
              ? `${completed.length} completed cooking session${completed.length === 1 ? '' : 's'} tracked`
              : <TT>Your completed sessions will appear here once you finish a full guided cook.</TT>}
          </div>
        </div>
      </ScreenCard>

      {/* STATS GRID */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatCard icon={Clock} label="Minutes cooking" value={totalMinutes} tint="primary" />
        <StatCard icon={Flame} label="In progress" value={inProgress} tint="copper" />
        <StatCard icon={Eye} label="Recently viewed" value={recent.length} tint="neutral" />
        <StatCard icon={Share2} label="Shared dishes" value={shares.length} tint="green" />
      </div>

      {/* COMPLETED SESSIONS */}
      <div className="mt-5 -mx-5 overflow-x-auto px-5 scrollbar-hide">
        <div className="flex gap-3 pb-1">
          {recentlyCompleted.length > 0 ? (
            recentlyCompleted.map(({ entry, dish, delta }) => (
              <ScreenCard
                key={`${entry.dishId}-${entry.finishedAt}`}
                className="w-[260px] shrink-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <SectionEyebrow label={<TT>Completed session</TT>} />
                    <div className="font-serif text-[22px] leading-tight text-foreground">
                      {dish.dishName}
                    </div>
                  </div>
                  <ScoreGauge score={entry.score} size={84} stroke={8} variant="compact" />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {typeof delta === 'number' && delta !== 0 ? (
                    <span
                      className={
                        delta > 0
                          ? 'inline-flex items-center gap-0.5 rounded-full bg-accent-green-soft px-2.5 py-1 text-[11px] font-semibold text-accent-green'
                          : 'inline-flex items-center gap-0.5 rounded-full bg-secondary-soft px-2.5 py-1 text-[11px] font-semibold text-copper'
                      }
                    >
                      {delta > 0 ? '+' : ''}
                      {delta} vs last
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {entry.minutes} min
                  </span>
                </div>

                <div className="mt-3 text-sm leading-6 text-muted-foreground">
                  {entry.summary}
                </div>
              </ScreenCard>
            ))
          ) : (
            <ScreenCard className="w-[260px] shrink-0">
              <SectionEyebrow label={<TT>Completed session</TT>} />
              <div className="text-sm leading-6 text-muted-foreground">
                <TT>Finish a full cooking session and your breakdown will show up here with score, time, and what to improve next.</TT>
              </div>
            </ScreenCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
