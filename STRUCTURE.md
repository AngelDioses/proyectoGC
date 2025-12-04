# Estructura del Proyecto - Plataforma de Gestión del Conocimiento

## 📁 Estructura de Carpetas Detallada

```
GC_Proyecto/
├── app/                                    # Next.js 14 App Router
│   ├── (auth)/                            # Grupo de rutas de autenticación
│   │   ├── login/
│   │   │   └── page.tsx                   # Página de login
│   │   └── register/
│   │       └── page.tsx                   # Página de registro
│   │
│   ├── (student)/                         # Rutas protegidas para estudiantes
│   │   ├── resources/
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # Formulario para subir recursos
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Ver detalle de recurso
│   │   └── my-resources/
│   │       └── page.tsx                  # Mis recursos subidos
│   │
│   ├── (teacher)/                         # Rutas protegidas para docentes
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Dashboard de recursos pendientes
│   │   └── resources/
│   │       └── review/
│   │           └── [id]/
│   │               └── page.tsx          # Revisar recurso específico
│   │
│   ├── (admin)/                           # Rutas protegidas para administradores
│   │   ├── courses/
│   │   │   ├── page.tsx                  # Lista de cursos
│   │   │   ├── new/
│   │   │   │   └── page.tsx             # Crear curso
│   │   │   └── [id]/
│   │   │       └── page.tsx             # Editar curso
│   │   ├── syllabi/
│   │   │   └── page.tsx                 # Gestión de sílabos
│   │   └── periods/
│   │       └── page.tsx                 # Gestión de períodos académicos
│   │
│   ├── api/                               # API Routes (si es necesario)
│   │   └── ...
│   │
│   ├── layout.tsx                         # Layout raíz
│   ├── page.tsx                           # Página principal (home)
│   └── globals.css                        # Estilos globales
│
├── components/                            # Componentes reutilizables
│   ├── ui/                                # Componentes de Shadcn/ui
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── protected-route.tsx               # Componente para proteger rutas
│   ├── navigation/
│   │   ├── header.tsx                    # Header/Navbar
│   │   └── sidebar.tsx                   # Sidebar (si aplica)
│   ├── resources/
│   │   ├── resource-card.tsx             # Card de recurso
│   │   ├── resource-form.tsx             # Formulario de recurso
│   │   └── resource-filters.tsx          # Filtros de búsqueda
│   └── ...
│
├── lib/                                   # Utilidades y configuraciones
│   ├── supabase/
│   │   ├── client.ts                     # Cliente Supabase (browser)
│   │   ├── server.ts                     # Cliente Supabase (server)
│   │   └── middleware.ts                 # Middleware Supabase
│   │
│   ├── auth.ts                           # Funciones de autenticación
│   ├── utils.ts                          # Utilidades generales
│   ├── constants.ts                      # Constantes de la app
│   │
│   └── queries/                          # Funciones de consulta a la BD
│       ├── courses.ts                    # Queries de cursos
│       ├── syllabi.ts                    # Queries de sílabos
│       ├── resources.ts                  # Queries de recursos
│       └── profiles.ts                   # Queries de perfiles
│
├── types/                                 # Tipos TypeScript
│   └── database.ts                       # Tipos de la base de datos
│
├── supabase/                              # Scripts y esquemas SQL
│   └── schema.sql                        # Esquema completo de BD
│
├── public/                                # Archivos estáticos
│   └── ...
│
├── middleware.ts                          # Middleware de Next.js
├── next.config.js                         # Configuración de Next.js
├── tailwind.config.ts                     # Configuración de Tailwind
├── tsconfig.json                          # Configuración de TypeScript
├── package.json                           # Dependencias
└── README.md                              # Documentación principal
```

## 🔐 Rutas Protegidas

### Estudiantes (`/student/*`)
- Acceso: `student`, `teacher`, `admin`
- Funcionalidad:
  - Subir recursos
  - Ver sus recursos propios
  - Ver recursos aprobados

### Docentes (`/teacher/*`)
- Acceso: `teacher`, `admin`
- Funcionalidad:
  - Ver recursos pendientes
  - Aprobar/rechazar recursos
  - Dar feedback

### Administradores (`/admin/*`)
- Acceso: `admin` solamente
- Funcionalidad:
  - Gestionar cursos
  - Crear sílabos
  - Gestionar períodos académicos
  - Asignar roles

## 🔄 Flujo de Datos

### Subida de Recurso (Estudiante)
1. Usuario selecciona Curso
2. Sistema carga semanas/temas del sílabo activo
3. Usuario selecciona semana/tema
4. Usuario sube archivo o escribe conocimiento tácito
5. Recurso se crea con `status = 'pending'`

### Revisión (Docente)
1. Docente ve recursos pendientes en dashboard
2. Docente revisa recurso
3. Docente aprueba o rechaza con feedback
4. Si aprueba: `status = 'approved'` → visible públicamente
5. Si rechaza: `status = 'rejected'` → visible solo para el subidor

## 📊 Estructura de Base de Datos

Ver `supabase/schema.sql` para el esquema completo.

### Relaciones Principales
```
courses (1) ──< syllabi (n)
academic_periods (1) ──< syllabi (n)
syllabi (1) ──< syllabus_units (n)
syllabus_units (1) ──< resources (n)
profiles (1) ──< resources (n) [uploader]
profiles (1) ──< resources (n) [reviewer]
```

## 🎨 Componentes Clave

### ResourceForm
Formulario en cascada:
- Select de Curso → carga sílabo activo
- Select de Semana/Tema → unidades del sílabo
- Campo de archivo o texto (conocimiento tácito)
- Campo de contexto/lecciones aprendidas

### ResourceCard
Muestra:
- Título y descripción
- Tipo de recurso
- Estado (badge)
- Información del curso/semana
- Acciones según rol

### TeacherDashboard
Muestra:
- Lista de recursos pendientes
- Filtros por curso/tipo
- Acciones rápidas (aprobar/rechazar)

## 🔐 Seguridad (RLS)

Todas las políticas están en `supabase/schema.sql`. Resumen:

- **Recursos:** Solo aprobados son públicos
- **Pendientes:** Solo visible para subidor y docentes/admins
- **Cursos/Sílabos:** Lectura pública, escritura solo admin
- **Perfiles:** Lectura pública, edición propia (roles solo admin)

## 📝 Próximos Pasos de Desarrollo

1. **Autenticación**
   - Implementar login/register con Supabase Auth
   - Configurar redirects post-login

2. **Carga de Archivos**
   - Configurar Supabase Storage buckets
   - Implementar upload de archivos
   - Generar URLs públicas

3. **Componentes UI**
   - Instalar Shadcn/ui
   - Crear formularios con validación (Zod)
   - Implementar selects en cascada

4. **Dashboard Docente**
   - Lista de recursos pendientes
   - Modal de revisión
   - Filtros y búsqueda

5. **Búsqueda y Filtrado**
   - Búsqueda por texto
   - Filtros por curso/período/tipo
   - Paginación

