-- ============================================
-- GC-FISI - Configuración de Storage
-- Ejecuta este script después del schema.sql
-- ============================================

-- Crear bucket para recursos si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Permitir lectura pública de recursos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

-- Política: Permitir a docentes, coordinadores y admins subir archivos
CREATE POLICY "Teachers can upload resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resources' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('teacher', 'coordinator', 'admin')
  )
);

-- Política: Permitir a docentes actualizar sus propios archivos
CREATE POLICY "Teachers can update own resources"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resources' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('teacher', 'coordinator', 'admin')
  )
);

-- Política: Permitir a coordinadores y admins eliminar archivos
CREATE POLICY "Coordinators can delete resources"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resources' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('coordinator', 'admin')
  )
);

