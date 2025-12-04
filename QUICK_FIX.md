# 🔧 Solución Rápida - Error RLS

## Problema
Error: `new row violates row-level security policy`

Esto ocurre porque las políticas RLS verifican `auth.uid()` pero no hay autenticación activa.

## Solución 1: Deshabilitar RLS (RÁPIDO - Solo Desarrollo)

Ejecuta este SQL en Supabase:

```sql
-- Deshabilitar RLS temporalmente
ALTER TABLE public.resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_structure DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

**⚠️ IMPORTANTE:** Esto desactiva la seguridad. Solo para desarrollo local.

## Solución 2: Crear Políticas Permisivas (MEJOR)

Ejecuta este SQL en Supabase:

```sql
-- Eliminar políticas restrictivas
DROP POLICY IF EXISTS "Teachers can create resources" ON public.resources;
DROP POLICY IF EXISTS "Teachers can update own pending resources" ON public.resources;
DROP POLICY IF EXISTS "Coordinators can review resources" ON public.resources;
DROP POLICY IF EXISTS "Coordinators can view all resources" ON public.resources;
DROP POLICY IF EXISTS "Teachers can view own and approved resources" ON public.resources;
DROP POLICY IF EXISTS "Students can view approved visible resources" ON public.resources;

-- Crear políticas permisivas para desarrollo
CREATE POLICY "Allow all operations on resources"
    ON public.resources FOR ALL
    USING (true)
    WITH CHECK (true);
```

## Solución 3: Crear Perfiles con Roles

### Paso 1: Ver usuarios existentes
```sql
SELECT id, full_name, role 
FROM public.profiles;
```

### Paso 2: Asignar roles a perfiles existentes
```sql
-- Asignar el primer perfil como docente
UPDATE public.profiles 
SET role = 'teacher' 
WHERE id IN (
    SELECT id FROM public.profiles LIMIT 1
);

-- Asignar el segundo perfil como coordinador
UPDATE public.profiles 
SET role = 'coordinator' 
WHERE id IN (
    SELECT id FROM public.profiles OFFSET 1 LIMIT 1
);
```

### Paso 3: Si no hay perfiles, crear uno manualmente
```sql
-- Crear un perfil de docente (usa un UUID válido)
INSERT INTO public.profiles (id, full_name, role)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Docente Test', 'teacher')
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role;
```

## Recomendación

Para desarrollo rápido, usa la **Solución 1** (deshabilitar RLS).

Para mantener seguridad pero permitir operaciones, usa la **Solución 2** (políticas permisivas).


