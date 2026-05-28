-- ChefSense AI — generic per-user state store.
-- Each (user_id, state_key) row is one localStorage-equivalent value,
-- persisted server-side so logout/login keeps the user's data.

create table if not exists public.user_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  state_key text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (user_id, state_key)
);

create index if not exists user_state_updated_at_idx
  on public.user_state (updated_at desc);

alter table public.user_state enable row level security;

-- RLS policies use (select auth.uid()) per Supabase init-plan guidance
-- so they evaluate once per statement instead of once per row.
drop policy if exists "Users can read their own state" on public.user_state;
drop policy if exists "Users can insert their own state" on public.user_state;
drop policy if exists "Users can update their own state" on public.user_state;
drop policy if exists "Users can delete their own state" on public.user_state;
drop policy if exists "user_state_own_read" on public.user_state;
drop policy if exists "user_state_own_insert" on public.user_state;
drop policy if exists "user_state_own_update" on public.user_state;
drop policy if exists "user_state_own_delete" on public.user_state;

create policy "user_state_own_read"
  on public.user_state for select
  using ((select auth.uid()) = user_id);

create policy "user_state_own_insert"
  on public.user_state for insert
  with check ((select auth.uid()) = user_id);

create policy "user_state_own_update"
  on public.user_state for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "user_state_own_delete"
  on public.user_state for delete
  using ((select auth.uid()) = user_id);
