-- Migration 0003: Real-time voice session tables
-- Run this in Supabase SQL Editor → New Query → Run
-- These tables log every WebRTC voice session and its individual transcript turns.

-- ─── voice_cooking_sessions ───────────────────────────────────────────────
-- One row per WebRTC session (user connects, cooks, disconnects).
create table if not exists voice_cooking_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  dish_id     text not null,
  locale      text not null default 'en',
  started_at  timestamp with time zone default timezone('utc', now()) not null,
  ended_at    timestamp with time zone,
  step_count  int default 0
);

alter table voice_cooking_sessions enable row level security;

-- Users can only see and write their own sessions.
create policy "Users manage own voice sessions"
  on voice_cooking_sessions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── voice_realtime_logs ──────────────────────────────────────────────────
-- One row per transcript turn (user speech or assistant reply) within a session.
create table if not exists voice_realtime_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  dish_id     text not null,
  step_index  int,
  locale      text not null default 'en',
  role        text not null check (role in ('user', 'assistant')),
  transcript  text not null,
  source      text default 'voice',
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

alter table voice_realtime_logs enable row level security;

create policy "Users manage own voice logs"
  on voice_realtime_logs
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast per-user, per-dish queries (analytics / history views).
create index if not exists voice_realtime_logs_user_dish_idx
  on voice_realtime_logs (user_id, dish_id, created_at desc);
