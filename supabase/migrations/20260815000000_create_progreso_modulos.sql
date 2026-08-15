-- Bloque "Persistencia de progreso del alumno" — Etapa A
-- Tabla de progreso por módulo (1 fila por alumno+módulo), RLS de
-- self-service (el alumno lee/escribe únicamente sus propias filas) y
-- trigger de updated_at reutilizando la función ya creada en
-- 20260725000000_create_profiles.sql. Este archivo es la fuente de
-- verdad del esquema: ejecutar en el SQL Editor de Supabase (o vía
-- `supabase db push` una vez vinculado el proyecto remoto).

-- ============================================================
-- 1. Tabla progreso_modulos
-- ============================================================

create table public.progreso_modulos (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references auth.users (id) on delete cascade,
  modulo_slug text not null,
  visitado_at timestamptz,
  completado boolean not null default false,
  completado_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (alumno_id, modulo_slug)
);

comment on table public.progreso_modulos is
  'Progreso del alumno por módulo del curso: última visita y estado de completado. 1 fila por (alumno_id, modulo_slug).';

create index idx_progreso_modulos_alumno_id on public.progreso_modulos (alumno_id);

-- ============================================================
-- 2. Row Level Security
-- ============================================================
-- A diferencia de `profiles`, este dato le pertenece al alumno: puede
-- leer, insertar y actualizar únicamente sus propias filas. Las Server
-- Actions de la aplicación usan el cliente autenticado normal (nunca
-- SUPABASE_SERVICE_ROLE_KEY) y siempre obtienen alumno_id de la sesión
-- server-side (auth.getUser()), nunca de un valor enviado por el
-- navegador — RLS es la barrera real, pero la app tampoco confía en el
-- cliente. Sin política de DELETE: desmarcar un módulo es un UPDATE
-- (completado = false), nunca un borrado de fila.

alter table public.progreso_modulos enable row level security;

create policy "progreso_modulos_select_own"
  on public.progreso_modulos
  for select
  to authenticated
  using (auth.uid() = alumno_id);

create policy "progreso_modulos_insert_own"
  on public.progreso_modulos
  for insert
  to authenticated
  with check (auth.uid() = alumno_id);

create policy "progreso_modulos_update_own"
  on public.progreso_modulos
  for update
  to authenticated
  using (auth.uid() = alumno_id)
  with check (auth.uid() = alumno_id);

-- Intencionalmente NO se crea política de delete: sin política que
-- cubra ese comando, Postgres lo deniega por default. No es un olvido.

-- ============================================================
-- 3. updated_at automático
-- ============================================================
-- Reutiliza public.set_updated_at(), ya creada en
-- 20260725000000_create_profiles.sql — no se redefine acá.

create trigger progreso_modulos_set_updated_at
  before update on public.progreso_modulos
  for each row execute function public.set_updated_at();
