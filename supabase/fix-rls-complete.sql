-- ============================================
-- GC-FISI - Fix RLS COMPLETO (Ejecuta este)
-- ============================================

-- PASO 1: Verificar estado actual de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('resources', 'courses', 'course_structure', 'profiles')
ORDER BY tablename;

-- PASO 2: Deshabilitar RLS en todas las tablas
ALTER TABLE public.resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_structure DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- PASO 3: Eliminar TODAS las políticas existentes (por si acaso)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN ('resources', 'courses', 'course_structure', 'profiles')
    ) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- PASO 4: Verificar que RLS está deshabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('resources', 'courses', 'course_structure', 'profiles')
ORDER BY tablename;

-- PASO 5: Verificar políticas restantes (debería estar vacío)
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('resources', 'courses', 'course_structure', 'profiles')
ORDER BY tablename, policyname;

-- ============================================
-- NOTA: Si el error persiste, puede ser Storage
-- ============================================
-- El error también puede venir de Supabase Storage
-- Ve a Storage → resources bucket → Policies
-- Y deshabilita o crea políticas permisivas allí

