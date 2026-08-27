create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  confirmed boolean not null default false,
  confirm_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- Jeder darf sich eintragen (Newsletter-Formular), aber nur unbestätigt und
-- ohne den confirm_token selbst zu setzen — der wird serverseitig generiert.
create policy "subscribers: public insert unconfirmed" on public.subscribers
  for insert with check (confirmed = false);

-- Kein öffentliches select/update: die Bestätigung per Double-Opt-In-Link läuft
-- über die Edge Function "confirm-subscriber" mit dem service_role key (umgeht RLS).
create policy "subscribers: admin select all" on public.subscribers
  for select using (public.is_admin());

create policy "subscribers: admin delete" on public.subscribers
  for delete using (public.is_admin());
