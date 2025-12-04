-- ============================================
-- K-NEXUS - Crear Usuarios de Prueba
-- Ejecuta este script después de crear usuarios en auth.users
-- ============================================

-- PASO 1: Crear usuarios en Supabase Auth (desde el Dashboard)
-- Ve a Authentication → Users → Add User
-- Crea al menos 3 usuarios y copia sus UUIDs

-- PASO 2: Actualiza los UUIDs abajo con los de tus usuarios reales
-- Luego ejecuta este script

-- Ejemplo (reemplaza con tus UUIDs reales):
/*
UPDATE public.profiles 
SET role = 'teacher' 
WHERE id = 'UUID_DEL_DOCENTE_AQUI';

UPDATE public.profiles 
SET role = 'coordinator' 
WHERE id = 'UUID_DEL_COORDINADOR_AQUI';

UPDATE public.profiles 
SET role = 'student' 
WHERE id = 'UUID_DEL_ESTUDIANTE_AQUI';
*/

-- ============================================
-- ALTERNATIVA: Crear perfiles manualmente
-- ============================================

-- Si no tienes usuarios en auth.users aún, puedes crear perfiles directamente
-- (aunque idealmente deberían crearse automáticamente con el trigger)

-- Ejemplo de creación manual (usa UUIDs válidos):
/*
INSERT INTO public.profiles (id, full_name, role)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Docente de Prueba', 'teacher'),
    ('00000000-0000-0000-0000-000000000002', 'Coordinador de Prueba', 'coordinator'),
    ('00000000-0000-0000-0000-000000000003', 'Estudiante de Prueba', 'student')
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role;
*/

-- ============================================
-- VERIFICAR PERFILES EXISTENTES
-- ============================================

-- Ejecuta esto para ver todos los perfiles y sus roles:
SELECT id, full_name, role, created_at 
FROM public.profiles 
ORDER BY role, created_at;

-- ============================================
-- ASIGNAR ROLES A PERFILES EXISTENTES
-- ============================================

-- Si ya tienes perfiles pero sin roles asignados:
-- Actualiza el primer perfil como docente
UPDATE public.profiles 
SET role = 'teacher' 
WHERE role = 'student' 
LIMIT 1;

-- Actualiza el segundo perfil como coordinador
UPDATE public.profiles 
SET role = 'coordinator' 
WHERE role = 'student' 
LIMIT 1;

-- O asigna roles específicos por ID:
-- UPDATE public.profiles SET role = 'teacher' WHERE id = 'TU_UUID';
-- UPDATE public.profiles SET role = 'coordinator' WHERE id = 'TU_UUID';

