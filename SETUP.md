# Guía de Configuración Inicial

Esta guía te ayudará a configurar el proyecto desde cero.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta en Supabase (gratuita en [supabase.com](https://supabase.com))
- Git (opcional)

## 🚀 Pasos de Configuración

### 1. Instalar Dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### 2. Configurar Supabase

#### 2.1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se complete la configuración (2-3 minutos)

#### 2.2. Ejecutar el Esquema SQL

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Crea una nueva consulta
3. Abre el archivo `supabase/schema.sql`
4. Copia todo el contenido
5. Pégalo en el editor SQL de Supabase
6. Ejecuta la consulta (Run)

**⚠️ Importante:** Verifica que todas las tablas se hayan creado correctamente en **Table Editor**.

#### 2.3. Configurar Storage (Opcional para archivos)

1. Ve a **Storage** en el menú de Supabase
2. Crea un bucket llamado `resources`
3. Configura las políticas RLS según sea necesario:
   - Lectura pública para archivos aprobados
   - Escritura solo para usuarios autenticados

```sql
-- Política de lectura pública para recursos aprobados
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

-- Política de escritura para usuarios autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resources' 
  AND auth.role() = 'authenticated'
);
```

### 3. Configurar Variables de Entorno

**📖 Guía Detallada:** Ver el archivo [`ENV_SETUP.md`](./ENV_SETUP.md) para instrucciones paso a paso con capturas de pantalla.

**Resumen rápido:**
1. Crea un archivo `.env.local` en la raíz del proyecto
2. En Supabase: **Settings** → **API**
3. Copia la **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copia la clave **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Reinicia el servidor de desarrollo (`npm run dev`)

Tu archivo `.env.local` debería verse así:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key-aqui
```

### 4. Configurar el Primer Usuario Admin

Por defecto, los usuarios que se registren tendrán el rol `student`. Para asignar roles de `admin` o `teacher`, necesitas hacerlo manualmente en la base de datos.

1. Registra un usuario normalmente (a través de Supabase Auth o tu app)
2. En Supabase, ve a **Table Editor** → **profiles**
3. Encuentra tu perfil y cambia el campo `role` de `student` a `admin`

Alternativamente, puedes usar SQL:

```sql
-- Reemplaza 'tu-email@ejemplo.com' con tu email
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'tu-email@ejemplo.com'
);
```

### 5. Ejecutar el Proyecto

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## ✅ Verificación

### Verificar Base de Datos

1. En Supabase, ve a **Table Editor**
2. Deberías ver las siguientes tablas:
   - `profiles`
   - `academic_periods`
   - `courses`
   - `syllabi`
   - `syllabus_units`
   - `resources`

### Verificar Tipos TypeScript

Ejecuta el type-check:

```bash
npm run type-check
```

No debería haber errores de tipos.

## 🔧 Próximos Pasos

### Crear Datos Iniciales

1. **Crear Período Académico:**
   ```sql
   INSERT INTO academic_periods (code, name, start_date, end_date, is_active)
   VALUES ('2025-I', 'Periodo Académico 2025-I', '2025-03-01', '2025-07-31', true);
   ```

2. **Crear un Curso:**
   ```sql
   INSERT INTO courses (code, name, description, credits)
   VALUES ('IA301', 'Inteligencia Artificial', 'Curso de IA', 4);
   ```

3. **Crear un Sílabo:**
   ```sql
   -- Primero obtén los IDs del período y curso creados
   INSERT INTO syllabi (course_id, academic_period_id, version, description)
   VALUES (
     (SELECT id FROM courses WHERE code = 'IA301'),
     (SELECT id FROM academic_periods WHERE code = '2025-I'),
     '1.0',
     'Sílabo unificado de IA 2025-I'
   );
   ```

4. **Crear Unidades del Sílabo:**
   ```sql
   INSERT INTO syllabus_units (syllabus_id, week_number, topic_name, learning_objective, order_index)
   VALUES (
     (SELECT id FROM syllabi WHERE version = '1.0' LIMIT 1),
     1,
     'Introducción a la IA',
     'Comprender los conceptos básicos de IA',
     0
   );
   ```

## 🐛 Solución de Problemas

### Error: "relation does not exist"
- Verifica que hayas ejecutado el esquema SQL completo
- Revisa que no haya errores en la ejecución del SQL

### Error: "permission denied"
- Verifica que las políticas RLS estén configuradas
- Asegúrate de estar autenticado correctamente

### Error: "invalid API key"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de haber copiado las claves correctas de Supabase

### Los tipos TypeScript no coinciden
- Ejecuta `npm run type-check` para ver errores específicos
- Verifica que el esquema de la BD coincida con `types/database.ts`

## 📚 Recursos Adicionales

- [Documentación de Next.js 14](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com)

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs en la consola del navegador
2. Revisa los logs de Supabase en el dashboard
3. Verifica que todas las dependencias estén instaladas
4. Asegúrate de estar usando Node.js 18+

