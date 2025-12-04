-- ============================================
-- GC-FISI - Fix Storage RLS Policies
-- El error también puede venir de Supabase Storage
-- ============================================

-- Eliminar todas las políticas de Storage existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname LIKE '%resources%'
    ) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
    END LOOP;
END $$;

-- Crear política permisiva para Storage (permite todo en bucket resources)
CREATE POLICY "Allow all operations on resources bucket"
ON storage.objects FOR ALL
USING (bucket_id = 'resources')
WITH CHECK (bucket_id = 'resources');

-- O si prefieres deshabilitar RLS en Storage completamente:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
-- (Nota: Esto puede no estar permitido dependiendo de tu plan de Supabase)

-- ============================================
-- ALTERNATIVA: Políticas específicas permisivas
-- ============================================

-- Política para SELECT (lectura pública)
DROP POLICY IF EXISTS "Public read resources" ON storage.objects;
CREATE POLICY "Public read resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

-- Política para INSERT (subida)
DROP POLICY IF EXISTS "Public insert resources" ON storage.objects;
CREATE POLICY "Public insert resources"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resources');

-- Política para UPDATE (actualización)
DROP POLICY IF EXISTS "Public update resources" ON storage.objects;
CREATE POLICY "Public update resources"
ON storage.objects FOR UPDATE
USING (bucket_id = 'resources')
WITH CHECK (bucket_id = 'resources');

-- Política para DELETE (eliminación)
DROP POLICY IF EXISTS "Public delete resources" ON storage.objects;
CREATE POLICY "Public delete resources"
ON storage.objects FOR DELETE
USING (bucket_id = 'resources');

