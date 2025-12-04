-- ============================================
-- GC-FISI - Datos de Ejemplo
-- Ejecuta este script después del setup-complete.sql
-- ============================================

-- NOTA: Asegúrate de tener al menos un usuario creado en auth.users
-- y actualiza el UUID en coordinator_id si es necesario

-- ============================================
-- 1. CURSOS DE EJEMPLO
-- ============================================

INSERT INTO public.courses (code, name, description, current_syllabus_url) VALUES
('CS1101', 'Programación I', 'Introducción a la programación y algoritmos', 'https://example.com/syllabus/cs1101.pdf'),
('CS2102', 'Estructuras de Datos', 'Estudio de estructuras de datos fundamentales', 'https://example.com/syllabus/cs2102.pdf'),
('IA301', 'Inteligencia Artificial', 'Fundamentos de IA y machine learning', 'https://example.com/syllabus/ia301.pdf')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 2. ESTRUCTURA DEL CURSO (Tree Structure)
-- ============================================

-- Obtener IDs de cursos (ajusta según tus datos)
DO $$
DECLARE
    cs1101_id UUID;
    cs2102_id UUID;
    ia301_id UUID;
    
    -- IDs para estructura
    info_general_id UUID;
    material_extra_id UUID;
    evaluaciones_id UUID;
    tema1_id UUID;
    tema2_id UUID;
    ppt_id UUID;
    indicaciones_id UUID;
    faq_id UUID;
    notas_id UUID;
    analytics_id UUID;
    conocimiento_id UUID;
BEGIN
    -- Obtener IDs de cursos
    SELECT id INTO cs1101_id FROM public.courses WHERE code = 'CS1101';
    SELECT id INTO cs2102_id FROM public.courses WHERE code = 'CS2102';
    SELECT id INTO ia301_id FROM public.courses WHERE code = 'IA301';
    
    -- Función para crear estructura completa de un curso
    -- CS1101 - Programación I
    IF cs1101_id IS NOT NULL THEN
        -- Nivel 1: Categorías principales
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs1101_id, NULL, 'Información General', 'Sílabo y documentos generales del curso', 1, 'category')
        RETURNING id INTO info_general_id;
        
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs1101_id, NULL, 'Material Extra', 'Artículos, libros y proyectos adicionales', 2, 'category')
        RETURNING id INTO material_extra_id;
        
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs1101_id, NULL, 'Evaluaciones Pasadas', 'Exámenes y prácticas de semestres anteriores', 3, 'category')
        RETURNING id INTO evaluaciones_id;
        
        -- Nivel 2: Subcategorías de Información General
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs1101_id, info_general_id, 'Sílabo', 'Sílabo oficial del curso', 1, 'subcategory');
        
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs1101_id, info_general_id, 'Excel de Notas', 'Plantilla para registro de notas', 2, 'subcategory');
        
        -- Nivel 2: Subcategorías de Material Extra
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs1101_id, material_extra_id, 'Artículos', 'Artículos académicos relacionados', 1, 'subcategory');
        
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs1101_id, material_extra_id, 'Libros', 'Libros recomendados y referencias', 2, 'subcategory');
        
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs1101_id, material_extra_id, 'Proyectos', 'Proyectos de ejemplo y plantillas', 3, 'subcategory');
        
        -- Nivel 2: Subcategorías de Evaluaciones
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs1101_id, evaluaciones_id, 'Examen Parcial', 'Exámenes parciales anteriores', 1, 'subcategory');
        
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs1101_id, evaluaciones_id, 'Examen Final', 'Exámenes finales anteriores', 2, 'subcategory');
        
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs1101_id, evaluaciones_id, 'Práctica 1', 'Primera práctica calificada', 3, 'subcategory');
        
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs1101_id, evaluaciones_id, 'Práctica 2', 'Segunda práctica calificada', 4, 'subcategory');
        
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs1101_id, evaluaciones_id, 'Práctica 3', 'Tercera práctica calificada', 5, 'subcategory');
        
        -- Nivel 1: Temas (Semanas 1-16)
        FOR i IN 1..16 LOOP
            INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
            VALUES (cs1101_id, NULL, 'Semana ' || i, 'Contenido de la semana ' || i, 3 + i, 'topic')
            RETURNING id INTO tema1_id;
            
            -- Subcategorías dentro de cada tema
            INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
            VALUES (cs1101_id, tema1_id, 'PPTs', 'Presentaciones de la semana', 1, 'subcategory');
            
            INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
            VALUES (cs1101_id, tema1_id, 'Indicaciones', 'Instrucciones y guías', 2, 'subcategory');
            
            INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
            VALUES (cs1101_id, tema1_id, 'FAQs', 'Preguntas frecuentes', 3, 'subcategory');
            
            INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
            VALUES (cs1101_id, tema1_id, 'Notas de Clase', 'Apuntes y resúmenes', 4, 'subcategory');
            
            INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
            VALUES (cs1101_id, tema1_id, 'Analytics', 'Temas a reforzar (Data driven)', 5, 'subcategory');
            
            INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
            VALUES (cs1101_id, tema1_id, 'Conocimiento Tácito', 'Lecciones aprendidas y mejoras', 6, 'subcategory');
        END LOOP;
    END IF;
    
    -- Repetir para CS2102 (estructura similar)
    IF cs2102_id IS NOT NULL THEN
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs2102_id, NULL, 'Información General', 'Sílabo y documentos generales', 1, 'category')
        RETURNING id INTO info_general_id;
        
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs2102_id, NULL, 'Material Extra', 'Material adicional', 2, 'category')
        RETURNING id INTO material_extra_id;
        
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (cs2102_id, NULL, 'Evaluaciones Pasadas', 'Exámenes anteriores', 3, 'category')
        RETURNING id INTO evaluaciones_id;
        
        -- Crear temas para CS2102 (solo primeros 8 como ejemplo)
        FOR i IN 1..8 LOOP
            INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
            VALUES (cs2102_id, NULL, 'Semana ' || i, 'Contenido semana ' || i, 3 + i, 'topic')
            RETURNING id INTO tema1_id;
            
            INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
            VALUES (cs2102_id, tema1_id, 'PPTs', 'Presentaciones', 1, 'subcategory');
            
            INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
            VALUES (cs2102_id, tema1_id, 'Notas de Clase', 'Apuntes', 2, 'subcategory');
        END LOOP;
    END IF;
    
    -- Repetir para IA301 (estructura similar)
    IF ia301_id IS NOT NULL THEN
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (ia301_id, NULL, 'Información General', 'Sílabo y documentos', 1, 'category')
        RETURNING id INTO info_general_id;
        
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (ia301_id, NULL, 'Material Extra', 'Material adicional', 2, 'category')
        RETURNING id INTO material_extra_id;
        
        INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
        VALUES (ia301_id, NULL, 'Evaluaciones Pasadas', 'Exámenes anteriores', 3, 'category')
        RETURNING id INTO evaluaciones_id;
        
        -- Crear temas para IA301 (solo primeros 12 como ejemplo)
        FOR i IN 1..12 LOOP
            INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
            VALUES (ia301_id, NULL, 'Semana ' || i, 'Contenido semana ' || i, 3 + i, 'topic')
            RETURNING id INTO tema1_id;
            
            INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
            VALUES (ia301_id, tema1_id, 'PPTs', 'Presentaciones', 1, 'subcategory');
            
            INSERT INTO public.course_structure (course_id, parent_id, name, description, order_index, structure_type)
            VALUES (ia301_id, tema1_id, 'Notas de Clase', 'Apuntes', 2, 'subcategory');
        END LOOP;
    END IF;
END $$;

-- ============================================
-- 3. RECURSOS DE EJEMPLO (opcional - solo si tienes usuarios)
-- ============================================

-- NOTA: Descomenta y ajusta los UUIDs si tienes usuarios creados
/*
DO $$
DECLARE
    teacher_id UUID;
    course_id UUID;
    structure_id UUID;
BEGIN
    -- Obtener un docente (ajusta según tu caso)
    SELECT id INTO teacher_id FROM public.profiles WHERE role = 'teacher' LIMIT 1;
    SELECT id INTO course_id FROM public.courses WHERE code = 'CS1101' LIMIT 1;
    SELECT id INTO structure_id FROM public.course_structure WHERE course_id = course_id AND name = 'PPTs' LIMIT 1;
    
    IF teacher_id IS NOT NULL AND course_id IS NOT NULL AND structure_id IS NOT NULL THEN
        INSERT INTO public.resources (
            course_id, structure_id, uploader_id, title, description,
            resource_type, status, is_visible, tags
        ) VALUES (
            course_id, structure_id, teacher_id,
            'Presentación Semana 1 - Introducción',
            'Presentación sobre los conceptos básicos de programación',
            'file',
            'pending',
            true,
            ARRAY['introducción', 'programación', 'básicos']
        );
    END IF;
END $$;
*/

COMMENT ON TABLE public.courses IS 'Cursos de ejemplo: CS1101, CS2102, IA301';
COMMENT ON TABLE public.course_structure IS 'Estructura jerárquica completa para CS1101, parcial para otros cursos';

