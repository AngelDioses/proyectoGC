# 🔧 Solución de Problemas - Error RLS

## Error: "new row violates row-level security policy"

Este error puede venir de **dos lugares**:

### 1. Tablas de Base de Datos (public.resources, etc.)

**Solución:** Ejecuta `supabase/fix-rls-complete.sql`

Este script:
- ✅ Deshabilita RLS en todas las tablas
- ✅ Elimina todas las políticas existentes
- ✅ Verifica que todo esté deshabilitado

### 2. Supabase Storage (bucket 'resources')

**Solución:** Ejecuta `supabase/fix-storage-rls.sql`

O manualmente desde el Dashboard:
1. Ve a **Storage** → **Policies** en Supabase
2. Selecciona el bucket `resources`
3. Elimina todas las políticas restrictivas
4. Crea una política permisiva:

```sql
CREATE POLICY "Allow all operations on resources bucket"
ON storage.objects FOR ALL
USING (bucket_id = 'resources')
WITH CHECK (bucket_id = 'resources');
```

## Pasos Completos de Solución

### Paso 1: Verificar RLS en Tablas
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'resources';
```

Si `rowsecurity = true`, entonces RLS está activo.

### Paso 2: Deshabilitar RLS en Tablas
```sql
ALTER TABLE public.resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_structure DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

### Paso 3: Verificar Storage Policies

Ve a Supabase Dashboard → **Storage** → **Policies**

Busca políticas del bucket `resources` y elimínalas o hazlas permisivas.

### Paso 4: Probar de Nuevo

Intenta subir un recurso nuevamente.

## Verificación Final

Ejecuta esto para verificar que todo está deshabilitado:

```sql
-- Verificar RLS en tablas
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('resources', 'courses', 'course_structure', 'profiles');

-- Verificar políticas en tablas (debería estar vacío)
SELECT tablename, policyname
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'resources';

-- Verificar políticas en Storage
SELECT policyname
FROM pg_policies 
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%resources%';
```

## Si el Error Persiste

1. **Verifica la consola del navegador** - Puede haber más detalles del error
2. **Verifica la pestaña Network** - Ve qué request está fallando exactamente
3. **Revisa los logs de Supabase** - Dashboard → Logs → Postgres Logs

## Nota Importante

⚠️ **Deshabilitar RLS es solo para desarrollo**. En producción, deberías:
- Habilitar autenticación real
- Crear políticas RLS apropiadas
- Configurar Storage policies correctamente
