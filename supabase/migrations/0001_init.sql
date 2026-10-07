-- Cartario — esquema inicial (Fase 1)
-- Ejecuta este archivo completo en Supabase → SQL Editor → New query.

-- ---------------------------------------------------------------------------
-- profiles: una fila por usuario registrado. is_subscriber lo actualizará
-- más adelante el webhook de Stripe (Fase 3) usando la service_role key.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  is_subscriber boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: leer el propio" on public.profiles;
create policy "profiles: leer el propio"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: actualizar el propio" on public.profiles;
create policy "profiles: actualizar el propio"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Crea el profile automáticamente al registrarse un usuario nuevo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- cards: una carta. user_id nullable para permitir, más adelante, importar
-- cartas de invitado. content_json guarda el array `elements` del canvas.
-- ---------------------------------------------------------------------------
create table if not exists public.cards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users (id) on delete cascade,
  title        text not null default 'Tarjeta sin título',
  content_json jsonb not null default '{"elements": []}'::jsonb,
  is_public    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists cards_user_id_idx on public.cards (user_id);
create index if not exists cards_public_idx on public.cards (id) where is_public;

alter table public.cards enable row level security;

-- Lectura: el dueño siempre; cualquiera si la carta es pública (Fase 4).
drop policy if exists "cards: leer propias o públicas" on public.cards;
create policy "cards: leer propias o públicas"
  on public.cards for select
  using (is_public or auth.uid() = user_id);

drop policy if exists "cards: insertar propias" on public.cards;
create policy "cards: insertar propias"
  on public.cards for insert
  with check (auth.uid() = user_id);

drop policy if exists "cards: actualizar propias" on public.cards;
create policy "cards: actualizar propias"
  on public.cards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "cards: borrar propias" on public.cards;
create policy "cards: borrar propias"
  on public.cards for delete
  using (auth.uid() = user_id);

-- Mantiene updated_at al día en cada UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cards_set_updated_at on public.cards;
create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();
