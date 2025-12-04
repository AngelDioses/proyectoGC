# Plataforma de Gestión del Conocimiento - FISI UNMSM

Sistema para centralizar, preservar y transferir el conocimiento académico entre semestres en la Facultad de Ingeniería de Sistemas e Informática de la UNMSM.

## 🚀 Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend/DB:** Supabase (Auth, Database, Storage, RLS)
- **Componentes:** Shadcn/ui (a instalar), Lucide React (iconos)

## 📋 Características

- **Gestión de Roles:** Admin, Teacher, Student con políticas RLS
- **Gestión de Cursos y Sílabos:** Organización por período académico
- **Carga de Recursos:** Archivos, código, multimedia y conocimiento tácito
- **Validación Docente:** Aprobación/rechazo de recursos con feedback
- **Búsqueda y Filtrado:** Recursos por curso, período, semana, tipo

## 🗄️ Estructura de Base de Datos

### Tablas Principales

- `profiles`: Perfiles de usuario vinculados a auth.users
- `academic_periods`: Períodos académicos (2025-I, 2025-II, etc.)
- `courses`: Cursos de la facultad
- `syllabi`: Sílabos unificados por curso y período
- `syllabus_units`: Unidades/temas del sílabo por semana
- `resources`: Recursos subidos por estudiantes

### Enums

- `user_role`: admin, teacher, student
- `resource_status`: pending, approved, rejected
- `resource_type`: document, code, multimedia, tacit_knowledge

## 🛠️ Configuración Inicial

### 1. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el esquema SQL en el editor SQL de Supabase:
   ```bash
   # Copia y pega el contenido de supabase/schema.sql
   ```

### 2. Configurar Variables de Entorno

📖 **Guía Detallada:** Ver [`ENV_SETUP.md`](./ENV_SETUP.md) para instrucciones paso a paso.

**Resumen:**
1. Crea un archivo `.env.local` en la raíz del proyecto
2. Obtén las credenciales de Supabase (Settings → API)
3. Agrega las variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima (anon public) de Supabase
4. Reinicia el servidor de desarrollo

### 3. Instalar Dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### 4. Ejecutar el Proyecto

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura de Carpetas

```
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (student)/         # Rutas para estudiantes
│   ├── (teacher)/         # Rutas para docentes
│   ├── (admin)/           # Rutas para administradores
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de Shadcn/ui
│   └── ...
├── lib/                  # Utilidades y configuraciones
│   ├── supabase/        # Clientes de Supabase
│   ├── auth.ts          # Funciones de autenticación
│   └── ...
├── types/                # Tipos TypeScript
│   └── database.ts      # Tipos de la base de datos
├── supabase/            # Scripts y esquemas SQL
│   └── schema.sql       # Esquema completo de BD
└── public/              # Archivos estáticos
```

## 🔐 Políticas de Seguridad (RLS)

El esquema incluye Row Level Security (RLS) configurado:

- **Recursos:** Solo recursos aprobados son visibles públicamente
- **Profiles:** Todos pueden leer, solo propio usuario puede editar
- **Cursos/Sílabos:** Lectura pública, solo admins pueden gestionar
- **Recursos pendientes:** Solo visible para el subidor y docentes/admins

## 📝 Flujos Principales

### Estudiante
1. Selecciona un curso
2. Elige semana/tema del sílabo activo
3. Sube recurso o escribe conocimiento tácito
4. Espera validación docente

### Docente
1. Ve recursos pendientes en dashboard
2. Revisa y aprueba/rechaza con feedback
3. Los recursos aprobados quedan públicos

### Administrador
1. Gestiona cursos y períodos académicos
2. Crea sílabos unificados
3. Asigna roles de docente/admin

## ✅ Funcionalidades Implementadas

- ✅ Sistema de autenticación completo (login/registro)
- ✅ Formulario de carga de recursos con selects en cascada
- ✅ Dashboard docente para validar recursos
- ✅ Gestión de recursos del estudiante
- ✅ Componentes UI básicos
- ✅ Navegación y protección de rutas

Ver [`FEATURES_IMPLEMENTED.md`](./FEATURES_IMPLEMENTED.md) para lista completa.

## 🔄 Próximos Pasos (Opcional)

- [ ] Vista pública de recursos aprobados
- [ ] Búsqueda avanzada de recursos
- [ ] CRUD completo de cursos en la UI (admin)
- [ ] Estadísticas y reportes
- [ ] Notificaciones por email

## 📚 Documentación Adicional

- [`GETTING_STARTED.md`](./GETTING_STARTED.md) - ⭐ **Comienza aquí** - Guía rápida de uso
- [`FEATURES_IMPLEMENTED.md`](./FEATURES_IMPLEMENTED.md) - Lista completa de funcionalidades
- [`SETUP.md`](./SETUP.md) - Guía completa de configuración inicial
- [`ENV_SETUP.md`](./ENV_SETUP.md) - Configuración detallada de variables de entorno
- [`STRUCTURE.md`](./STRUCTURE.md) - Estructura detallada del proyecto
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) - Solución de problemas comunes
- [`IMPLEMENTATION_NOTES.md`](./IMPLEMENTATION_NOTES.md) - Notas de implementación

## 🐛 Problemas Comunes

Si encuentras errores al ejecutar el SQL o configurar el proyecto, consulta:
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) - Soluciones a errores comunes
- Error con vistas SQL → Ver sección "Error: resources_with_details is not a table"
- Variables de entorno no funcionan → Ver [`ENV_SETUP.md`](./ENV_SETUP.md)

## 🚀 Despliegue en Producción

### Paso 1: Subir a GitHub

📖 **[GITHUB_SETUP.md](./GITHUB_SETUP.md)** - Guía paso a paso para subir el código a GitHub

### Paso 2: Desplegar en Vercel

📖 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía paso a paso para desplegar en Vercel

### Resumen Rápido:

1. **Subir a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: GC-FISI Platform"
   git remote add origin https://github.com/TU_USUARIO/gc-fisi.git
   git push -u origin main
   ```

2. **Desplegar en Vercel:**
   - Importa el repositorio desde GitHub
   - Configura las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Haz clic en "Deploy"

Ver las guías completas:
- [Guía de GitHub](./GITHUB_SETUP.md)
- [Guía de Vercel](./DEPLOYMENT.md)

## 📄 Licencia

Este proyecto es para uso académico en la FISI - UNMSM.

