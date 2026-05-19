# Noxyera Supabase

## Migration

The initial schema lives in:

`supabase/migrations/20260518134359_init_noxyera_schema.sql`

It creates:

- `profiles`
- `sites`
- `contracts`
- `interventions`
- `rapports`
- `leads`
- private Storage buckets `haccp-reports` and `intervention-photos`

## Local Apply

Docker Desktop must be running before applying migrations locally:

```bash
supabase db reset --local
```

The current RLS model stores authorization in `public.profiles.user_id`, not in user-editable metadata.
Admin reads/writes are intended to go through server-side service role operations.
