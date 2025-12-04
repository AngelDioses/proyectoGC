-- ============================================
-- GC-FISI - Script Completo de Setup
-- Ejecuta ESTE archivo completo en Supabase SQL Editor
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- LIMPIEZA PREVIA
-- ============================================

-- Eliminar vistas
DROP VIEW IF EXISTS public.resources_with_details CASCADE;

-- Eliminar triggers de forma segura
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resources') THEN
        DROP TRIGGER IF EXISTS set_updated_at_resources ON public.resources;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_structure') THEN
        DROP TRIGGER IF EXISTS set_updated_at_course_structure ON public.course_structure;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
        DROP TRIGGER IF EXISTS set_updated_at_courses ON public.courses;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
    END IF;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Eliminar todas las políticas RLS
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Eliminar tablas
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.course_structure CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Eliminar tipos ENUM
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS resource_status CASCADE;
DROP TYPE IF EXISTS resource_type CASCADE;

-- Eliminar funciones
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- CREACIÓN DE ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'coordinator', 'admin');
CREATE TYPE resource_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE resource_type AS ENUM ('file', 'link', 'text_content', 'video');

-- ============================================
-- CREACIÓN DE TABLAS
-- ============================================

-- Tabla de perfiles de usuario
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'student' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de cursos
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    current_syllabus_url TEXT,
    coordinator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de estructura jerárquica del curso (Tree Structure)
CREATE TABLE public.course_structure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.course_structure(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0 NOT NULL,
    structure_type TEXT NOT NULL, -- 'category', 'topic', 'subcategory'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla central de recursos
CREATE TABLE public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    structure_id UUID NOT NULL REFERENCES public.course_structure(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    resource_type resource_type NOT NULL,
    storage_path TEXT, -- URL del archivo en Supabase Storage
    url TEXT, -- Enlace externo (si resource_type = 'link')
    content TEXT, -- Contenido de texto (si resource_type = 'text_content')
    status resource_status DEFAULT 'pending' NOT NULL,
    is_visible BOOLEAN DEFAULT true NOT NULL, -- Soft delete: false si está rechazado
    rejection_reason TEXT, -- Motivo de rechazo (solo coordinador)
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[], -- Array de etiquetas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_courses_coordinator ON public.courses(coordinator_id);
CREATE INDEX idx_course_structure_course ON public.course_structure(course_id);
CREATE INDEX idx_course_structure_parent ON public.course_structure(parent_id);
CREATE INDEX idx_resources_course ON public.resources(course_id);
CREATE INDEX idx_resources_structure ON public.resources(structure_id);
CREATE INDEX idx_resources_status ON public.resources(status);
CREATE INDEX idx_resources_visible ON public.resources(is_visible);
CREATE INDEX idx_resources_uploader ON public.resources(uploader_id);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Triggers para updated_at
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_courses
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_course_structure
    BEFORE UPDATE ON public.course_structure
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_resources
    BEFORE UPDATE ON public.resources
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'));
    RETURN NEW;
END;
$$;

-- Trigger para crear perfil al registrarse
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - PROFILES
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Políticas RLS - COURSES
CREATE POLICY "Courses are viewable by everyone"
    ON public.courses FOR SELECT
    USING (true);

CREATE POLICY "Coordinators can manage courses"
    ON public.courses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('coordinator', 'admin')
        )
    );

-- Políticas RLS - COURSE_STRUCTURE
CREATE POLICY "Course structure is viewable by everyone"
    ON public.course_structure FOR SELECT
    USING (true);

CREATE POLICY "Coordinators can manage course structure"
    ON public.course_structure FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('coordinator', 'admin')
        )
    );

-- Políticas RLS - RESOURCES
-- Estudiantes: Solo ven recursos aprobados y visibles
CREATE POLICY "Students can view approved visible resources"
    ON public.resources FOR SELECT
    USING (
        status = 'approved' AND is_visible = true
    );

-- Docentes: Ven sus propios recursos (cualquier estado) y todos los aprobados
CREATE POLICY "Teachers can view own and approved resources"
    ON public.resources FOR SELECT
    USING (
        uploader_id = auth.uid() OR (status = 'approved' AND is_visible = true)
    );

-- Coordinadores: Ven TODO (incluyendo pendientes y rechazados)
CREATE POLICY "Coordinators can view all resources"
    ON public.resources FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('coordinator', 'admin')
        )
    );

-- Docentes pueden crear recursos
CREATE POLICY "Teachers can create resources"
    ON public.resources FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('teacher', 'coordinator', 'admin')
        ) AND uploader_id = auth.uid()
    );

-- Docentes pueden actualizar sus propios recursos pendientes
CREATE POLICY "Teachers can update own pending resources"
    ON public.resources FOR UPDATE
    USING (
        uploader_id = auth.uid() AND status = 'pending'
    );

-- Coordinadores pueden aprobar/rechazar recursos
CREATE POLICY "Coordinators can review resources"
    ON public.resources FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('coordinator', 'admin')
        )
    );

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista para recursos con información completa
CREATE OR REPLACE VIEW public.resources_with_details AS
SELECT 
    r.*,
    c.name AS course_name,
    c.code AS course_code,
    cs.name AS structure_name,
    cs.structure_type,
    uploader.full_name AS uploader_name,
    uploader.role AS uploader_role,
    reviewer.full_name AS reviewer_name
FROM public.resources r
JOIN public.courses c ON r.course_id = c.id
JOIN public.course_structure cs ON r.structure_id = cs.id
JOIN public.profiles uploader ON r.uploader_id = uploader.id
LEFT JOIN public.profiles reviewer ON r.reviewed_by = reviewer.id;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE public.profiles IS 'Perfiles de usuario con roles: student, teacher, coordinator, admin';
COMMENT ON TABLE public.courses IS 'Cursos de la facultad con coordinador asignado';
COMMENT ON TABLE public.course_structure IS 'Estructura jerárquica tipo tree del curso (categorías, temas, subcategorías)';
COMMENT ON TABLE public.resources IS 'Recursos subidos por docentes. Estado: pending -> coordinator aprueba/rechaza';
COMMENT ON COLUMN public.resources.is_visible IS 'Soft delete: false cuando está rechazado, oculto para estudiantes';
COMMENT ON COLUMN public.resources.rejection_reason IS 'Motivo de rechazo escrito por el coordinador';

