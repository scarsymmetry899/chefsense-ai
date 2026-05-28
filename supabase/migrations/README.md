# Supabase migrations

These files are the source of truth for the ChefSense database schema.

- `0001_user_state.sql` — the per-user generic state store (was previously applied
  ad-hoc in the dashboard; this file captures it as a migration). Re-running
  is safe (uses `if not exists` and drops/recreates RLS policies).
- `0002_voice_turns.sql` — voice chat transcript log (user prompts + chef
  replies) keyed by `(user_id, dish_id)`.

## Applying

If you're using the Supabase CLI:

```sh
supabase link --project-ref axucxkbhjjcbimdswsil
supabase db push
```

Or, paste each file into the Supabase dashboard SQL editor in order.

> **Note:** `0001_user_state.sql` was applied to the live DB on 2026-05-28 via
> the MCP `apply_migration` tool, including the RLS init-plan fix. Future
> changes should be checked in here first, then applied.
