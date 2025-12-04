-- ============================================
-- GC-FISI - Setup Completo (Ejecutar en este orden)
-- ============================================

-- PASO 1: Deshabilitar RLS temporalmente (para desarrollo)
ALTER TABLE public.resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_structure DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- PASO 2: Asignar roles a usuarios específicos
UPDATE public.profiles 
SET role = 'teacher' 
WHERE id = 'b2b7f884-16fb-4023-a0f3-d2bc27215d19';

UPDATE public.profiles 
SET role = 'coordinator' 
WHERE id = 'bc0dd9a2-1427-40da-8bb5-de88e70f3a7e';

UPDATE public.profiles 
SET role = 'student' 
WHERE id = '25cea065-832e-4e68-83d4-461333ade0e5';

-- PASO 3: Verificar asignación
SELECT 
    id, 
    full_name, 
    role,
    CASE 
        WHEN id = 'b2b7f884-16fb-4023-a0f3-d2bc27215d19' THEN '✓ Docente'
        WHEN id = 'bc0dd9a2-1427-40da-8bb5-de88e70f3a7e' THEN '✓ Coordinador'
        WHEN id = '25cea065-832e-4e68-83d4-461333ade0e5' THEN '✓ Estudiante'
        ELSE ''
    END as estado
FROM public.profiles 
WHERE id IN (
    'b2b7f884-16fb-4023-a0f3-d2bc27215d19',
    'bc0dd9a2-1427-40da-8bb5-de88e70f3a7e',
    '25cea065-832e-4e68-83d4-461333ade0e5'
)
ORDER BY role;

-- ============================================
-- NOTAS:
-- ============================================
-- 1. RLS está deshabilitado para desarrollo
-- 2. Los roles están asignados a los UUIDs especificados
-- 3. Ahora deberías poder:
--    - Subir recursos como docente
--    - Aprobar/rechazar recursos como coordinador
--    - Ver recursos aprobados como estudiante

