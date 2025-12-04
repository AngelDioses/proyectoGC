-- ============================================
-- GC-FISI - Asignar Roles a Usuarios Específicos
-- Ejecuta este script en Supabase SQL Editor
-- ============================================

-- Asignar rol de docente
UPDATE public.profiles 
SET role = 'teacher' 
WHERE id = 'b2b7f884-16fb-4023-a0f3-d2bc27215d19';

-- Asignar rol de coordinador
UPDATE public.profiles 
SET role = 'coordinator' 
WHERE id = 'bc0dd9a2-1427-40da-8bb5-de88e70f3a7e';

-- Asignar rol de estudiante
UPDATE public.profiles 
SET role = 'student' 
WHERE id = '25cea065-832e-4e68-83d4-461333ade0e5';

-- Verificar que se asignaron correctamente
SELECT id, full_name, role, created_at 
FROM public.profiles 
WHERE id IN (
    'b2b7f884-16fb-4023-a0f3-d2bc27215d19',
    'bc0dd9a2-1427-40da-8bb5-de88e70f3a7e',
    '25cea065-832e-4e68-83d4-461333ade0e5'
)
ORDER BY role;

