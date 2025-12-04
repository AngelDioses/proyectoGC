-- ============================================
-- GC-FISI - Script de Migración
-- Ejecuta este script en Supabase SQL Editor
-- ============================================

-- Paso 1: Eliminar dependencias en orden inverso
DROP VIEW IF EXISTS public.resources_with_details CASCADE;

-- Paso 2: Eliminar triggers
DROP TRIGGER IF EXISTS set_updated_at_resources ON public.resources;
DROP TRIGGER IF EXISTS set_updated_at_course_structure ON public.course_structure;
DROP TRIGGER IF EXISTS set_updated_at_courses ON public.courses;
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Paso 3: Eliminar políticas RLS (si existen)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Paso 4: Eliminar tablas
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.course_structure CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Paso 5: Eliminar tipos ENUM
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS resource_status CASCADE;
DROP TYPE IF EXISTS resource_type CASCADE;

-- Paso 6: Eliminar funciones
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Ahora ejecutar el schema.sql completo desde aquí o copiar su contenido

