-- ============================================
-- GC-FISI - Fix RLS Policies para Desarrollo
-- Ejecuta este script si tienes problemas con RLS
-- ============================================

-- Opción 1: Deshabilitar RLS temporalmente (SOLO PARA DESARROLLO)
-- ⚠️ NO USAR EN PRODUCCIÓN
ALTER TABLE public.resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_structure DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Opción 2: Políticas más permisivas para desarrollo
-- (Comentar la opción 1 y descomentar esta si prefieres mantener RLS)

/*
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Students can view approved visible resources" ON public.resources;
DROP POLICY IF EXISTS "Teachers can view own and approved resources" ON public.resources;
DROP POLICY IF EXISTS "Coordinators can view all resources" ON public.resources;
DROP POLICY IF EXISTS "Teachers can create resources" ON public.resources;
DROP POLICY IF EXISTS "Teachers can update own pending resources" ON public.resources;
DROP POLICY IF EXISTS "Coordinators can review resources" ON public.resources;

-- Políticas permisivas para desarrollo (permiten todo)
CREATE POLICY "Allow all SELECT on resources"
    ON public.resources FOR SELECT
    USING (true);

CREATE POLICY "Allow all INSERT on resources"
    ON public.resources FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on resources"
    ON public.resources FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all DELETE on resources"
    ON public.resources FOR DELETE
    USING (true);
*/

