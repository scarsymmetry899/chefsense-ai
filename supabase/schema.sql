create extension if not exists "pgcrypto";

create table if not exists public.user_state (
  user_id uuid not null,
  state_key text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint user_state_pkey primary key (user_id, state_key)
);

create index if not exists user_state_updated_at_idx
  on public.user_state (updated_at desc);

alter table public.user_state enable row level security;

drop policy if exists "Users can read their own state" on public.user_state;
create policy "Users can read their own state"
on public.user_state
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own state" on public.user_state;
create policy "Users can insert their own state"
on public.user_state
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own state" on public.user_state;
create policy "Users can update their own state"
on public.user_state
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own state" on public.user_state;
create policy "Users can delete their own state"
on public.user_state
for delete
to authenticated
using (auth.uid() = user_id);
