-- Bloque "Persistencia de evaluaciones" — Etapa A
-- Historial inmutable de intentos de evaluación por alumno y módulo.
-- Puntaje y aprobado se calculan y escriben exclusivamente server-side
-- (Etapa B) a partir del banco real de preguntas — esta tabla nunca
-- recibe ni confía en un puntaje calculado en el navegador.
-- Fuente de verdad del esquema: ejecutar en el SQL Editor de Supabase.

-- ============================================================
-- 1. Tabla intentos_evaluacion
-- ============================================================

create table public.intentos_evaluacion (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references auth.users (id) on delete cascade,
  modulo_slug text not null,
  puntaje integer not null check (puntaje >= 0 and puntaje <= 100),
  aprobado boolean not null,
  cantidad_preguntas integer not null check (cantidad_preguntas > 0),
  cantidad_correctas integer not null check (cantidad_correctas >= 0),
  created_at timestamptz not null default now(),
  constraint correctas_no_exceden_preguntas check (cantidad_correctas <= cantidad_preguntas)
);

comment on table public.intentos_evaluacion is
  'Historial inmutable de intentos de evaluación. Insert-only: nunca se actualiza ni se borra una fila ya escrita. Un intento = un envío válido de respuestas, con puntaje y aprobado ya calculados y verificados server-side.';

create index idx_intentos_evaluacion_alumno_modulo on public.intentos_evaluacion (alumno_id, modulo_slug);

-- ============================================================
-- 2. Row Level Security
-- ============================================================
-- Mismo patrón self-service que progreso_modulos (el alumno opera sobre
-- sus propias filas, las Server Actions usan el cliente autenticado
-- normal — nunca SUPABASE_SERVICE_ROLE_KEY — y alumno_id sale siempre
-- de la sesión server-side, nunca del navegador), pero más restrictivo:
-- un intento ya insertado es un registro histórico inmutable, así que
-- ni siquiera existe una política de UPDATE. La futura pantalla de
-- administrador (no incluida en este bloque) leerá esta tabla con
-- SUPABASE_SERVICE_ROLE_KEY, igual que ya hace con `profiles` — no
-- necesita una política propia acá.

alter table public.intentos_evaluacion enable row level security;

create policy "intentos_evaluacion_select_own"
  on public.intentos_evaluacion
  for select
  to authenticated
  using (auth.uid() = alumno_id);

create policy "intentos_evaluacion_insert_own"
  on public.intentos_evaluacion
  for insert
  to authenticated
  with check (auth.uid() = alumno_id);

-- Intencionalmente NO se crean políticas de update/delete para
-- 'authenticated': sin política que cubra esos comandos, Postgres los
-- deniega por default. No es un olvido.
