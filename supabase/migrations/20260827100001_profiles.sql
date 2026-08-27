-- Profiles: eine Zeile pro auth.users-Eintrag, hält die Rolle für die Admin-Prüfung.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- SECURITY DEFINER, damit Policies auf anderen Tabellen die Rolle prüfen können,
-- ohne dass die RLS-Policy auf profiles selbst dabei erneut ausgewertet wird
-- (sonst Endlos-Rekursion: Policy auf profiles würde profiles abfragen).
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Jeder eingeloggte Nutzer darf sein eigenes Profil lesen/ändern (nicht die Rolle).
create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: update own display_name" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- Admins dürfen alle Profile lesen (z.B. für Statistiken/Verwaltung).
create policy "profiles: admin select all" on public.profiles
  for select using (public.is_admin());

-- Legt bei jeder neuen Registrierung automatisch ein profiles-Row mit Rolle 'user' an.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
