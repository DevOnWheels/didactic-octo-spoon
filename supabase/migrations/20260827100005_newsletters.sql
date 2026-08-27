create table public.newsletters (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  sent_at timestamptz,
  recipient_count integer,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.newsletters enable row level security;

-- Newsletter-Inhalte sind ausschließlich Admin-Sache, kein öffentlicher Zugriff.
create policy "newsletters: admin all" on public.newsletters
  for all using (public.is_admin()) with check (public.is_admin());
