-- Sprint 5.1.1 — Configuración de Supabase
-- Tabla de perfiles de negocio (1:1 con auth.users), roles y protección de escritura.
-- Este archivo es la fuente de verdad del esquema: ejecutar en el SQL Editor
-- de Supabase (o vía `supabase db push` una vez vinculado el proyecto remoto).

-- ============================================================
-- 1. Tabla profiles
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  apellido text not null default '',
  empresa text not null default '',
  rol text not null default 'alumno' check (rol in ('admin', 'alumno')),
  activo boolean not null default true,
  fecha_inicio date not null default current_date,
  fecha_vencimiento timestamptz,
  ultimo_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Información de negocio del usuario (rol, vigencia, datos personales). 1:1 con auth.users.';

create index idx_profiles_rol on public.profiles (rol);
create index idx_profiles_fecha_vencimiento on public.profiles (fecha_vencimiento);

-- ============================================================
-- 2. Row Level Security
-- ============================================================
-- Regla de seguridad acordada: ningún alumno puede escribir su propio
-- perfil (ni rol, ni vigencia, ni nada). Solo puede LEER su propia fila.
-- Toda escritura ocurre exclusivamente server-side con la
-- SUPABASE_SERVICE_ROLE_KEY (que bypassa RLS), después de validar en
-- código que quien pide el cambio tiene rol = 'admin'.

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Intencionalmente NO se crean políticas de insert/update/delete para
-- 'authenticated': sin política que cubra esos comandos, Postgres los
-- deniega por default. No es un olvido.

-- ============================================================
-- 3. Trigger: crear el profile automáticamente al crear el usuario en Auth
-- ============================================================
-- El futuro flujo de alta de alumnos (Server Action del panel admin) crea
-- el usuario con supabase.auth.admin.inviteUserByEmail(email, { data: {...} }),
-- pasando nombre/apellido/empresa/fecha_inicio/fecha_vencimiento como
-- user_metadata. Este trigger los copia a la fila de profiles en el mismo
-- paso, sin necesidad de un segundo UPDATE desde la aplicación.
--
-- El rol queda SIEMPRE hardcodeado en 'alumno' acá, sin importar qué
-- venga en el metadata: la promoción a admin nunca ocurre por este camino,
-- solo por una actualización manual directa en la base (ver checklist de
-- bootstrap del primer admin).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, nombre, apellido, empresa, rol, activo, fecha_inicio, fecha_vencimiento
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    coalesce(new.raw_user_meta_data ->> 'apellido', ''),
    coalesce(new.raw_user_meta_data ->> 'empresa', ''),
    'alumno',
    true,
    coalesce((new.raw_user_meta_data ->> 'fecha_inicio')::date, current_date),
    coalesce(
      (new.raw_user_meta_data ->> 'fecha_vencimiento')::timestamptz,
      now() + interval '30 days'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 4. updated_at automático
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
