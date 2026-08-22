-- Bloque "Certificado de finalización" — Etapa 2
-- Registro persistente e inmutable de certificados emitidos. A diferencia
-- de `progreso_modulos`/`intentos_evaluacion`, esta tabla está diseñada
-- para sobrevivir a la eliminación de la cuenta del alumno: todo lo que
-- hace falta para verificar el certificado (nombre, curso, fechas) queda
-- congelado en la propia fila al momento de emitir, y `alumno_id` usa
-- ON DELETE SET NULL (nunca CASCADE) precisamente para que borrar una
-- cuenta nunca borre un certificado ya emitido.
-- PREPARADA, NO EJECUTADA — fuente de verdad del esquema una vez
-- aprobada: ejecutar en el SQL Editor de Supabase.

-- ============================================================
-- 1. Tabla certificados_emitidos
-- ============================================================

create table public.certificados_emitidos (
  id uuid primary key default gen_random_uuid(),

  -- Referencia al alumno vivo, cuando existe. NO es la fuente de verdad
  -- para verificar el certificado (eso son las columnas congeladas de
  -- abajo) ni para identificarlo públicamente (eso es `id`) — solo sirve
  -- para que el propio alumno, mientras su cuenta exista, encuentre "mi
  -- certificado", y para un futuro listado admin por alumno.
  -- ON DELETE SET NULL, nunca CASCADE: ver el bloque de comentarios sobre
  -- unicidad más abajo para el razonamiento completo.
  alumno_id uuid references auth.users (id) on delete set null,

  -- ---- Snapshot congelado al momento de emitir. Ninguna de estas
  -- columnas se vuelve a leer desde `profiles` ni desde `curso.json`
  -- después del insert — el certificado tiene que poder mostrarse igual
  -- dentro de años, aunque esas fuentes cambien o el alumno sea eliminado.
  curso_slug text not null,
  curso_titulo text not null,
  curso_version text not null,
  carga_horaria_horas integer not null,
  nombre_completo text not null,
  emisor text not null default 'Linkamp Precisión SRL',
  fecha_finalizacion timestamptz not null,
  fecha_emision timestamptz not null default now(),

  constraint carga_horaria_positiva check (carga_horaria_horas > 0),

  -- Un alumno no puede tener más de un certificado del mismo curso.
  -- IMPORTANTE (ver análisis completo en el mensaje de la sesión): en un
  -- UNIQUE estándar de Postgres, NULL nunca se considera igual a otro
  -- NULL, así que dos filas con alumno_id=NULL y el mismo curso_slug NO
  -- violan esta restricción. Esto es intencional y correcto, no un hueco:
  -- alumno_id solo llega a NULL vía el ON DELETE SET NULL de una cuenta ya
  -- eliminada. No hay política de insert para 'authenticated' (ver sección
  -- RLS) — el único camino de escritura es la Server Action vía
  -- service_role, que siempre setea alumno_id al user.id real de la
  -- sesión autenticada, nunca NULL a mano; un insert directo con
  -- alumno_id=NULL no es alcanzable desde el navegador bajo ningún
  -- escenario. Dos certificados de dos alumnos distintos, ambos eliminados
  -- después, comparten NULL y eso está bien: son dos registros históricos
  -- legítimos de personas distintas — cada uno se identifica por su propio
  -- `id`, nunca por `alumno_id`.
  constraint un_certificado_por_alumno_y_curso unique (alumno_id, curso_slug)
);

comment on table public.certificados_emitidos is
  'Registro inmutable de certificados emitidos. Sobrevive a la eliminación de la cuenta del alumno (alumno_id on delete set null): todos los datos necesarios para verificar el certificado quedan congelados en la propia fila.';

-- Sin índice adicional sobre alumno_id solo: el UNIQUE compuesto de arriba
-- ya lo cubre como prefijo izquierdo (mismo criterio ya aplicado en
-- intentos_evaluacion). Sin índice sobre curso_slug: no hay consulta
-- planeada que lo necesite todavía.

-- ============================================================
-- 2. Row Level Security
-- ============================================================
-- A diferencia de progreso_modulos/intentos_evaluacion, esta tabla NO usa
-- insert self-service. certificados_emitidos es una credencial emitida
-- por Linkamp, no un dato autoreportado del alumno: un INSERT propio con
-- with check (auth.uid() = alumno_id) solo valida la identidad del que
-- escribe, no el contenido — un alumno podría fabricar nombre_completo,
-- curso_titulo, carga_horaria_horas, fecha_finalizacion o emisor a mano,
-- sin pasar por calcularFinalizacion() ni por ninguna validación real.
-- Mismo patrón que 'profiles': toda escritura pasa exclusivamente por
-- SUPABASE_SERVICE_ROLE_KEY, desde la futura Server Action de emisión,
-- que autentica al usuario con el cliente normal, obtiene `user.id`
-- server-side, corre calcularFinalizacion() contra progreso_modulos e
-- intentos_evaluacion reales, arma el snapshot completo server-side y
-- recién ahí inserta con el cliente admin. El alumno solo puede LEER su
-- propio certificado — nunca crearlo directamente.

alter table public.certificados_emitidos enable row level security;

create policy "certificados_emitidos_select_own"
  on public.certificados_emitidos
  for select
  to authenticated
  using (auth.uid() = alumno_id);

-- Intencionalmente SIN políticas de insert/update/delete para
-- 'authenticated': sin política que cubra esos comandos, Postgres los
-- deniega por default. La emisión ocurre exclusivamente vía service_role
-- desde la Server Action — no es un olvido.
--
-- Todavía SIN política de select para 'anon': la futura página pública de
-- verificación no lee esta tabla vía RLS — usa el cliente admin
-- (service_role) server-side, con un select explícito de columnas
-- públicas, nunca `select *` ni alumno_id. Igual que /admin ya hace con
-- profiles. No se agrega acceso público por RLS en esta etapa.

-- ============================================================
-- 3. Inmutabilidad reforzada a nivel de tabla (más allá de RLS)
-- ============================================================
-- RLS por sí sola solo protege al rol 'authenticated' — no protege contra
-- SUPABASE_SERVICE_ROLE_KEY (el mismo cliente que usa /admin), que
-- bypassea RLS por diseño de Supabase. Para un registro pensado como
-- verificable y confiable por terceros, un UPDATE por error desde código
-- admin no debería ser posible. Este trigger corre para cualquier rol y
-- bloquea todo UPDATE salvo exactamente el que produce la baja de cuenta
-- (alumno_id pasa de un valor real a NULL, y ningún otro campo cambia en
-- simultáneo). DELETE queda deliberadamente FUERA de este trigger — sigue
-- bloqueado para 'authenticated' solo por ausencia de política RLS, igual
-- que el resto de la tabla, para no complicar la limpieza de certificados
-- de prueba durante validaciones (que sí necesita poder borrar filas de
-- prueba con service_role). Si se prefiere bloquear también el DELETE
-- para todo rol, es un cambio a evaluar aparte.

create or replace function public.proteger_certificado_emitido()
returns trigger
language plpgsql
as $$
begin
  if new.alumno_id is null
     and old.alumno_id is not null
     and new.id = old.id
     and new.curso_slug = old.curso_slug
     and new.curso_titulo = old.curso_titulo
     and new.curso_version = old.curso_version
     and new.carga_horaria_horas = old.carga_horaria_horas
     and new.nombre_completo = old.nombre_completo
     and new.emisor = old.emisor
     and new.fecha_finalizacion = old.fecha_finalizacion
     and new.fecha_emision = old.fecha_emision
  then
    return new; -- único caso permitido: la baja de cuenta del alumno
  end if;

  raise exception 'Un certificado emitido es inmutable: no se puede modificar.';
end;
$$;

create trigger certificados_emitidos_proteger
  before update on public.certificados_emitidos
  for each row execute function public.proteger_certificado_emitido();
