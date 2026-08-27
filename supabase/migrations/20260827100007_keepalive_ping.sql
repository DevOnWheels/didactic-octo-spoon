-- Dient ausschließlich dem GitHub-Actions-Keep-Alive-Cron (siehe .github/workflows/keepalive.yml):
-- Supabase pausiert Free-Projekte nach 7 Tagen ohne Datenbankaktivität. Ein täglicher Insert
-- hier verhindert das. Zugriff läuft über den service_role key (umgeht RLS), daher keine Policies
-- für anon/authenticated nötig.
create table public.ping (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.ping enable row level security;
