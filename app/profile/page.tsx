'use client';

import { useEffect, useMemo, useState } from 'react';
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

export default function ProfilePage() {
  const recent = getRecentlyViewedDishes();
  const shares = getShareActions();
  const completed = getCompletedDishEntries();
  const totalMinutes = ALL_DISHES.reduce((sum, dish) => sum + getTotalCookingMinutes(dish.dishId), 0);
  const inProgress = ALL_DISHES.filter((dish) => hasInProgressDish(dish.dishId)).length;
  const [profile, setProfile] = useState(getProfileSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(getProfileSettings());
  }, []);

  const averageScore = useMemo(() => {
    if (!completed.length) return 0;
    return Math.round(completed.reduce((sum, item) => sum + item.score, 0) / completed.length);
  }, [completed]);

  const recentlyCompleted = completed
    .map((entry) => ({ entry, dish: getDish(entry.dishId) }))
    .filter((item): item is { entry: (typeof completed)[number]; dish: NonNullable<ReturnType<typeof getDish>> } => Boolean(item.dish))
    .slice(0, 4);

  return (
    <AppShell>
      <Header backHref={ROUTES.home} title="Profile" />

      <ScreenCard>
        <SectionEyebrow label="Your cooking profile" />
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <input
              value={profile.name}
              onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
              className="w-full bg-transparent font-serif text-[28px] leading-none text-foreground outline-none"
            />
            <input
              value={profile.phone}
              onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}
              className="mt-3 w-full bg-transparent text-sm leading-6 text-muted-foreground outline-none"
            />
            <textarea
              value={profile.tagline}
              onChange={(event) => setProfile((current) => ({ ...current, tagline: event.target.value }))}
              className="mt-2 min-h-[72px] w-full resize-none rounded-[18px] border border-border bg-background px-3 py-3 text-sm leading-6 text-muted-foreground outline-none"
            />
          </div>
          <div className="flex flex-col justify-between gap-3 rounded-[24px] border border-border/60 bg-background p-4">
            <div>
              <div className="text-sm text-muted-foreground">ChefScore average</div>
              <div className="mt-2 font-sans text-[42px] font-semibold tracking-[-0.05em] text-foreground tabular-nums">
                {averageScore || 0}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {completed.length ? `${completed.length} completed cooking sessions tracked` : 'Your completed sessions will appear here once you finish a full guided cook.'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                saveProfileSettings(profile);
                setSaved(true);
                window.setTimeout(() => setSaved(false), 1600);
              }}
              className="rounded-full border border-primary/20 gradient-cta px-5 py-3 text-sm font-semibold text-white shadow-cta"
            >
              Save profile
            </button>
            {saved ? <StatusPill label="Profile updated" tone="green" /> : null}
          </div>
        </div>
      </ScreenCard>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ScreenCard className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Minutes cooking</div>
          <div className="mt-2 font-sans text-[30px] font-semibold text-foreground tabular-nums">{totalMinutes}</div>
        </ScreenCard>
        <ScreenCard className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Dishes in progress</div>
          <div className="mt-2 font-sans text-[30px] font-semibold text-foreground tabular-nums">{inProgress}</div>
        </ScreenCard>
        <ScreenCard className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Recently viewed</div>
          <div className="mt-2 font-sans text-[30px] font-semibold text-foreground tabular-nums">{recent.length}</div>
        </ScreenCard>
        <ScreenCard className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Shared dishes</div>
          <div className="mt-2 font-sans text-[30px] font-semibold text-foreground tabular-nums">{shares.length}</div>
        </ScreenCard>
      </div>

      <div className="mt-5 -mx-5 overflow-x-auto px-5 scrollbar-hide">
        <div className="flex gap-3 pb-1">
          {recentlyCompleted.length > 0 ? (
            recentlyCompleted.map(({ entry, dish }) => (
              <ScreenCard key={`${entry.dishId}-${entry.finishedAt}`} className="w-[250px] shrink-0">
                <SectionEyebrow label="Completed session" />
                <div className="font-serif text-[22px] leading-none text-foreground">{dish.dishName}</div>
                <div className="mt-3 font-sans text-[34px] font-semibold tracking-[-0.05em] text-primary tabular-nums">
                  {entry.score}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{entry.minutes} minutes of guided cooking</div>
                <div className="mt-3 text-sm leading-6 text-muted-foreground">{entry.summary}</div>
              </ScreenCard>
            ))
          ) : (
            <ScreenCard className="w-[260px] shrink-0">
              <SectionEyebrow label="Completed session" />
              <div className="text-sm leading-6 text-muted-foreground">
                Finish a full cooking session and your breakdown will show up here with score, time, and what to improve next.
              </div>
            </ScreenCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
