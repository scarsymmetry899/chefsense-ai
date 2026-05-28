-- ChefSense AI — voice chat transcript log.
-- Every user prompt + chef reply during a guided cooking session is saved
-- here so a user can replay their session and so the model can be evaluated.

create table if not exists public.voice_turns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dish_id text not null,
  step_index integer,
  locale text not null default 'en' check (locale in ('en', 'hi', 'te')),
  role text not null check (role in ('user', 'assistant')),
  transcript text not null,
  source text check (source in ('openai', 'fallback', 'voice')),
  audio_url text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists voice_turns_user_dish_idx
  on public.voice_turns (user_id, dish_id, created_at desc);

alter table public.voice_turns enable row level security;

drop policy if exists "voice_turns_own_read" on public.voice_turns;
drop policy if exists "voice_turns_own_insert" on public.voice_turns;

create policy "voice_turns_own_read"
  on public.voice_turns for select
  using ((select auth.uid()) = user_id);

create policy "voice_turns_own_insert"
  on public.voice_turns for insert
  with check ((select auth.uid()) = user_id);
