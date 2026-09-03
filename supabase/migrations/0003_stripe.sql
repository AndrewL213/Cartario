-- Papelera — suscripciones con Stripe (Fase 3)
-- Ejecuta este archivo completo en Supabase → SQL Editor → New query.
-- (Es idempotente.)

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists subscription_status text;

-- Un customer de Stripe por perfil como máximo.
create unique index if not exists profiles_stripe_customer_id_key
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

-- Nota: el webhook de Stripe escribe is_subscriber / subscription_status /
-- stripe_customer_id usando la service_role key (salta la RLS). El usuario
-- solo puede LEER su propio profile (política de 0001_init.sql).
