-- El permiso permanente de Google se guarda cifrado en Supabase Vault; la tabla solo guarda la referencia.
-- (Aplicada el 26-11-2026 con el nombre token_google_en_vault.)
alter table public.google_tokens add column if not exists refresh_secret uuid;
alter table public.google_tokens alter column refresh_token drop not null;
-- Funciones (solo service_role): guardar_refresh_google(uuid,text), leer_refresh_google(uuid), borrar_google(uuid).
-- Ver la definición completa en la base: select pg_get_functiondef('public.guardar_refresh_google(uuid,text)'::regprocedure);
