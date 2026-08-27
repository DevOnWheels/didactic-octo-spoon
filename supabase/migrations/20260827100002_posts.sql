create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  body text not null,
  image_path text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

-- Öffentlich sichtbar: nur veröffentlichte Beiträge.
create policy "posts: public select published" on public.posts
  for select using (published = true);

-- Admins sehen und verwalten alles (auch unveröffentlichte Entwürfe).
create policy "posts: admin all" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());
