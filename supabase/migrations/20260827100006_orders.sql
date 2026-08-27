-- Nur Protokoll des "Kauf"-Klicks — keine Zahlung, kein Status-Workflow (siehe CLAUDE.md §7).
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id),
  items jsonb not null,
  total_cents integer not null check (total_cents >= 0),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Kauf-Button funktioniert auch ohne Login (Gastbestellung): user_id ist dann null.
create policy "orders: insert own or guest" on public.orders
  for insert with check (user_id = auth.uid() or user_id is null);

create policy "orders: select own" on public.orders
  for select using (user_id = auth.uid());

create policy "orders: admin select all" on public.orders
  for select using (public.is_admin());
