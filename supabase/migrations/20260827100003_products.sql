create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  price_cents integer not null check (price_cents >= 0),
  image_path text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products: public select active" on public.products
  for select using (active = true);

create policy "products: admin all" on public.products
  for all using (public.is_admin()) with check (public.is_admin());
