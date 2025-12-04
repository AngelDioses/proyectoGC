# 📊 Configuración de Datos de Ejemplo - K-NEXUS

## 🚀 Pasos para Configurar el Sistema Completo

### 1. Ejecutar el Schema Base

Ejecuta `supabase/setup-complete.sql` en el SQL Editor de Supabase para crear todas las tablas, políticas RLS y funciones.

### 2. Configurar Storage

Ejecuta `supabase/storage-setup.sql` para crear el bucket `resources` y configurar las políticas de acceso.

**O manualmente:**
1. Ve a **Storage** en Supabase Dashboard
2. Crea un bucket llamado `resources`
3. Márcalo como público
4. Configura las políticas RLS según el script

### 3. Cargar Datos de Ejemplo

Ejecuta `supabase/seed-data.sql` en el SQL Editor de Supabase.

Este script crea:
- ✅ 3 cursos de ejemplo (CS1101, CS2102, IA301)
- ✅ Estructura completa para CS1101:
  - Información General (Sílabo, Excel de Notas)
  - Material Extra (Artículos, Libros, Proyectos)
  - Evaluaciones Pasadas (Examen Parcial, Final, Prácticas 1-3)
  - Temas Semanas 1-16 con subcategorías:
    - PPTs
    - Indicaciones
    - FAQs
    - Notas de Clase
    - Analytics
    - Conocimiento Tácito
- ✅ Estructura parcial para CS2102 e IA301

### 4. Crear Usuarios de Prueba

**Opción A: Desde Supabase Dashboard**
1. Ve a **Authentication** → **Users**
2. Crea usuarios manualmente
3. Asigna roles en la tabla `profiles`:
   - `student` - Estudiante
   - `teacher` - Docente
   - `coordinator` - Coordinador Académico
   - `admin` - Administrador

**Opción B: Desde SQL**
```sql
-- Después de crear un usuario en auth.users, actualiza su rol:
UPDATE public.profiles 
SET role = 'teacher' 
WHERE id = 'UUID_DEL_USUARIO';
```

### 5. Verificar que Todo Funcione

1. **Como Coordinador:**
   - Accede a `/dashboard/coordinator`
   - Ve a "Gestionar Estructura de Cursos"
   - Verifica que puedas ver y editar la estructura

2. **Como Docente:**
   - Accede a `/dashboard/teacher`
   - Ve a "Subir Nuevo Recurso"
   - Selecciona un curso y estructura
   - Sube un recurso de prueba

3. **Como Estudiante:**
   - Accede a `/dashboard/student`
   - Verifica que veas los cursos
   - Haz clic en "Ver todo" de un curso
   - Verifica la estructura jerárquica

## 📋 Estructura de Datos Creada

### Cursos
- **CS1101** - Programación I (estructura completa)
- **CS2102** - Estructuras de Datos (estructura parcial)
- **IA301** - Inteligencia Artificial (estructura parcial)

### Estructura de CS1101 (Ejemplo Completo)

```
📁 Información General
  ├── Sílabo
  └── Excel de Notas

📁 Material Extra
  ├── Artículos
  ├── Libros
  └── Proyectos

📁 Evaluaciones Pasadas
  ├── Examen Parcial
  ├── Examen Final
  ├── Práctica 1
  ├── Práctica 2
  └── Práctica 3

📁 Semana 1
  ├── PPTs
  ├── Indicaciones
  ├── FAQs
  ├── Notas de Clase
  ├── Analytics
  └── Conocimiento Tácito

... (Semanas 2-16 con la misma estructura)
```

## 🔧 Funcionalidades Implementadas

### ✅ Coordinador
- [x] Bandeja de entrada con recursos pendientes
- [x] Aprobar/Rechazar recursos con motivo
- [x] Gestión de estructura de cursos (CRUD completo)
- [x] Vista jerárquica de estructura

### ✅ Docente
- [x] Subir recursos (archivo, enlace, texto, video)
- [x] Ver recursos propios (pendientes/aprobados)
- [x] Selector de estructura jerárquica
- [x] Dashboard con estado de recursos

### ✅ Estudiante
- [x] Vista de biblioteca por cursos
- [x] Vista detallada de curso con estructura jerárquica
- [x] Solo ve recursos aprobados
- [x] Navegación estilo Netflix

## 🎯 Próximos Pasos Sugeridos

1. **Crear más cursos** usando la interfaz del coordinador
2. **Completar estructura** de CS2102 e IA301
3. **Subir recursos de prueba** como docente
4. **Aprobar recursos** como coordinador
5. **Verificar flujo completo** como estudiante

## ⚠️ Notas Importantes

- Los recursos empiezan con `status = 'pending'`
- Solo el coordinador puede cambiar el estado
- Los estudiantes NO ven recursos rechazados o pendientes
- La estructura del curso es jerárquica (tree structure)
- Los archivos se suben a Supabase Storage en el bucket `resources`

## 🐛 Solución de Problemas

**Error: "No hay estructura definida"**
- Ejecuta `seed-data.sql` nuevamente
- Verifica que los cursos existan en la tabla `courses`

**Error: "Bucket no encontrado"**
- Ejecuta `storage-setup.sql`
- O crea el bucket manualmente en Supabase Storage

**Error: "No puedo ver recursos"**
- Verifica que el recurso tenga `status = 'approved'`
- Verifica que `is_visible = true`
- Verifica las políticas RLS en Supabase

