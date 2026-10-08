-- Cartario — Fase 1: cuentas, datos y suscripción
-- Ejecuta este archivo completo en Supabase → SQL Editor → New query.
-- Es idempotente (se puede correr más de una vez) y no necesita que hayas
-- corrido 0003 antes: incluye las columnas de Stripe por si faltan.

-- ---------------------------------------------------------------------------
-- profiles: is_subscriber pasa a llamarse is_premium (Premium = plan único
-- "Sin anuncios"); se añade display_name (nombre que verá quien reciba la carta).
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'profiles'
         and column_name = 'is_subscriber')
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'profiles'
         and column_name = 'is_premium')
  then
    alter table public.profiles rename column is_subscriber to is_premium;
  end if;
end $$;

alter table public.profiles
  add column if not exists is_premium          boolean not null default false,
  add column if not exists display_name        text,
  add column if not exists stripe_customer_id  text,
  add column if not exists subscription_status text;

create unique index if not exists profiles_stripe_customer_id_key
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

alter table public.profiles
  drop constraint if exists profiles_display_name_len;
alter table public.profiles
  add constraint profiles_display_name_len
  check (display_name is null or char_length(display_name) <= 60);

-- SEGURIDAD: la política "actualizar el propio" de 0001 permitía editar
-- cualquier columna de la propia fila (incluido is_premium). Ahora el usuario
-- solo puede cambiar display_name; is_premium, email y los datos de Stripe los
-- escribe únicamente el webhook con la service_role key.
revoke update on public.profiles from anon, authenticated;
grant  update (display_name) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- cards: estado de la carta.
-- ---------------------------------------------------------------------------
alter table public.cards
  add column if not exists status text not null default 'draft';

alter table public.cards drop constraint if exists cards_status_check;
alter table public.cards
  add constraint cards_status_check check (status in ('draft', 'sent'));

-- ---------------------------------------------------------------------------
-- ad_unlocks: bloques desbloqueados con anuncio, POR CARTA.
--   block = 'content' (stickers premium + imágenes sin límite)
--         | 'style'   (tipografías + fondos premium)
-- Máximo 2 por carta: lo garantizan la clave única (card_id, block) y, además,
-- el trigger de abajo (por si algún día se añade un tercer bloque).
-- No hay políticas de UPDATE ni DELETE: un desbloqueo no se puede deshacer.
-- ---------------------------------------------------------------------------
create table if not exists public.ad_unlocks (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references public.cards (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  block       text not null check (block in ('content', 'style')),
  unlocked_at timestamptz not null default now(),
  unique (card_id, block)
);

create index if not exists ad_unlocks_user_idx on public.ad_unlocks (user_id);

alter table public.ad_unlocks enable row level security;

drop policy if exists "ad_unlocks: leer propios" on public.ad_unlocks;
create policy "ad_unlocks: leer propios"
  on public.ad_unlocks for select
  using (auth.uid() = user_id);

-- Solo se puede desbloquear una carta que es tuya.
drop policy if exists "ad_unlocks: insertar en cartas propias" on public.ad_unlocks;
create policy "ad_unlocks: insertar en cartas propias"
  on public.ad_unlocks for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.cards c
      where c.id = card_id and c.user_id = auth.uid()
    )
  );

create or replace function public.enforce_ad_unlock_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.ad_unlocks where card_id = new.card_id) >= 2 then
    raise exception 'Una carta admite como máximo 2 desbloqueos por anuncio'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists ad_unlocks_limit on public.ad_unlocks;
create trigger ad_unlocks_limit
  before insert on public.ad_unlocks
  for each row execute function public.enforce_ad_unlock_limit();

-- ---------------------------------------------------------------------------
-- sent_cards: envíos de una carta (Fase 2 y 4 los usan).
-- opened_at lo marcará la página de recepción desde el servidor (service_role).
-- ---------------------------------------------------------------------------
create table if not exists public.sent_cards (
  id           uuid primary key default gen_random_uuid(),
  card_id      uuid not null references public.cards (id) on delete cascade,
  sender_id    uuid not null references auth.users (id) on delete cascade,
  recipient    text,
  channel      text not null default 'link',
  scheduled_at timestamptz,
  sent_at      timestamptz,
  opened_at    timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists sent_cards_sender_idx on public.sent_cards (sender_id, created_at desc);
create index if not exists sent_cards_card_idx   on public.sent_cards (card_id);
create index if not exists sent_cards_due_idx    on public.sent_cards (scheduled_at)
  where sent_at is null and scheduled_at is not null;

alter table public.sent_cards enable row level security;

drop policy if exists "sent_cards: leer propios" on public.sent_cards;
create policy "sent_cards: leer propios"
  on public.sent_cards for select
  using (auth.uid() = sender_id);

drop policy if exists "sent_cards: insertar de cartas propias" on public.sent_cards;
create policy "sent_cards: insertar de cartas propias"
  on public.sent_cards for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.cards c
      where c.id = card_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "sent_cards: actualizar propios" on public.sent_cards;
create policy "sent_cards: actualizar propios"
  on public.sent_cards for update
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

drop policy if exists "sent_cards: borrar propios" on public.sent_cards;
create policy "sent_cards: borrar propios"
  on public.sent_cards for delete
  using (auth.uid() = sender_id);

-- ---------------------------------------------------------------------------
-- ai_generations: una fila por generación del agente (límite de 3 al día,
-- se comprobará en el servidor en la Fase 3). Sin UPDATE ni DELETE para que
-- nadie pueda "devolver" sus generaciones.
-- ---------------------------------------------------------------------------
create table if not exists public.ai_generations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists ai_generations_user_day_idx
  on public.ai_generations (user_id, created_at desc);

alter table public.ai_generations enable row level security;

drop policy if exists "ai_generations: leer propias" on public.ai_generations;
create policy "ai_generations: leer propias"
  on public.ai_generations for select
  using (auth.uid() = user_id);

drop policy if exists "ai_generations: insertar propias" on public.ai_generations;
create policy "ai_generations: insertar propias"
  on public.ai_generations for insert
  with check (auth.uid() = user_id);
