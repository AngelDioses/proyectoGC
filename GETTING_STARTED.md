# 🚀 Guía de Inicio - Plataforma de Gestión del Conocimiento

## ✅ Todo Está Listo

Has completado la configuración básica y las funcionalidades principales están implementadas. Ahora puedes comenzar a usar la plataforma.

## 📋 Checklist de Configuración

- [x] Esquema SQL ejecutado en Supabase
- [x] Variables de entorno configuradas (`.env.local`)
- [x] Dependencias instaladas
- [x] Servidor de desarrollo corriendo

## 🎯 Próximos Pasos para Empezar

### 1. Crear Datos Iniciales en Supabase

Necesitas crear algunos datos básicos para que la plataforma funcione:

#### a) Crear un Período Académico

En Supabase SQL Editor, ejecuta:

```sql
INSERT INTO academic_periods (code, name, start_date, end_date, is_active)
VALUES ('2025-I', 'Periodo Académico 2025-I', '2025-03-01', '2025-07-31', true);
```

#### b) Crear un Curso

```sql
INSERT INTO courses (code, name, description, credits)
VALUES ('IA301', 'Inteligencia Artificial', 'Curso de fundamentos de IA', 4);
```

#### c) Crear un Sílabo

Primero obtén los IDs del período y curso que acabas de crear (puedes verlos en Table Editor), luego:

```sql
-- Reemplaza los UUIDs con los IDs reales de tu BD
INSERT INTO syllabi (course_id, academic_period_id, version, description)
VALUES (
  'TU_COURSE_ID_AQUI',
  'TU_PERIOD_ID_AQUI',
  '1.0',
  'Sílabo unificado de IA 2025-I'
);
```

#### d) Crear Unidades del Sílabo (Temas)

```sql
-- Reemplaza SYLLABUS_ID con el ID del sílabo que creaste
INSERT INTO syllabus_units (syllabus_id, week_number, topic_name, learning_objective, order_index)
VALUES 
  (TU_SYLLABUS_ID, 1, 'Introducción a la IA', 'Comprender los conceptos básicos', 0),
  (TU_SYLLABUS_ID, 2, 'Machine Learning', 'Entender los fundamentos de ML', 0),
  (TU_SYLLABUS_ID, 3, 'Deep Learning', 'Aplicar redes neuronales', 0);
```

### 2. Crear el Bucket de Storage (para archivos)

1. Ve a Supabase Dashboard → **Storage**
2. Clic en **New bucket**
3. Nombre: `resources`
4. Marca como **Public** (para que los recursos aprobados sean accesibles)
5. Crea el bucket

### 3. Crear Tu Primera Cuenta

1. Ve a `http://localhost:3000/register`
2. Crea una cuenta de estudiante
3. Inicia sesión en `http://localhost:3000/login`

**Nota:** Por defecto, todas las cuentas nuevas tienen rol `student`. Para cambiar a docente o admin, ve a Supabase Table Editor → `profiles` → edita el campo `role`.

## 🎓 Cómo Usar la Plataforma

### Como Estudiante

1. **Regístrate/Inicia sesión**
   - Ve a `/register` o `/login`

2. **Sube un Recurso**
   - Haz clic en "Subir Recurso" en el header
   - Selecciona un curso
   - Selecciona semana/tema
   - Elige el tipo de recurso:
     - **Documento**: Sube PDF, PPT, etc.
     - **Código**: Sube archivo o pega URL de Github/Replit
     - **Multimedia**: Sube imágenes, videos
     - **Conocimiento Tácito**: Escribe tus lecciones aprendidas
   - Completa título y descripción
   - Sube el recurso

3. **Ve Tus Recursos**
   - Ve a "Mis Recursos" (próximamente en el header)
   - Verás el estado de tus recursos (pendiente/aprobado/rechazado)
   - Verás el feedback del docente si hay

### Como Docente

1. **Asigna el rol de docente:**
   - En Supabase, ve a Table Editor → `profiles`
   - Encuentra tu usuario
   - Cambia `role` a `teacher`
   - Guarda

2. **Inicia sesión**
   - Ve a `/login`
   - Serás redirigido automáticamente al dashboard docente

3. **Revisa Recursos Pendientes**
   - En el dashboard verás todos los recursos pendientes
   - Filtra por curso o tipo si quieres
   - Haz clic en "Revisar Recurso"

4. **Aprueba o Rechaza**
   - Lee el recurso completamente
   - Opcional: Escribe feedback
   - Clic en "Aprobar" o "Rechazar"
   - El recurso se actualiza automáticamente

### Como Administrador

1. **Asigna el rol de admin:**
   - Similar a docente, pero cambia `role` a `admin`

2. **Gestiona el sistema:**
   - Acceso a rutas administrativas (aún en desarrollo)
   - Puedes crear cursos, períodos, sílabos directamente en Supabase

## 🔍 Rutas Disponibles

### Públicas
- `/` - Página principal
- `/login` - Iniciar sesión
- `/register` - Crear cuenta

### Protegidas - Estudiantes
- `/student/resources/new` - Subir nuevo recurso
- `/student/my-resources` - Ver mis recursos

### Protegidas - Docentes
- `/teacher/dashboard` - Dashboard de revisión

### Protegidas - Administradores
- `/admin/courses` - Gestión de cursos (UI pendiente)

## 🐛 Solución de Problemas Comunes

### "No hay período académico activo"
- Verifica que creaste un período académico
- Asegúrate que `is_active = true`

### "No hay sílabo disponible para este curso"
- Verifica que creaste un sílabo para el curso seleccionado
- Asegúrate que el sílabo está vinculado al período activo

### "Error al subir archivo"
- Verifica que creaste el bucket `resources` en Storage
- Verifica que el bucket es público o tiene las políticas correctas

### "No puedo ver el dashboard docente"
- Verifica que tu usuario tiene `role = 'teacher'` en la tabla `profiles`
- Cierra sesión y vuelve a iniciar

## 📝 Tips

1. **Datos de Prueba**: Crea varios cursos y temas para probar los selects en cascada
2. **Conocimiento Tácito**: Este tipo de recurso es muy valioso - anímate a compartir tus experiencias
3. **Feedback Docente**: Los docentes pueden dejar comentarios útiles al aprobar/rechazar

## 🎉 ¡Listo!

Ya puedes empezar a usar la plataforma. Las funcionalidades principales están completamente operativas:

- ✅ Autenticación completa
- ✅ Subida de recursos con selects en cascada
- ✅ Dashboard docente para validación
- ✅ Gestión de recursos del estudiante

## 📚 Documentación Adicional

- [`FEATURES_IMPLEMENTED.md`](./FEATURES_IMPLEMENTED.md) - Lista completa de funcionalidades
- [`SETUP.md`](./SETUP.md) - Configuración inicial
- [`ENV_SETUP.md`](./ENV_SETUP.md) - Variables de entorno
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) - Solución de problemas

## 🚀 Próximas Mejoras (Opcional)

- Vista pública de recursos aprobados
- Búsqueda avanzada
- CRUD completo de cursos en la UI
- Estadísticas y reportes
- Notificaciones

¡Disfruta usando la plataforma! 🎓

