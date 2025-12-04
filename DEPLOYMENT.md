# 🚀 Guía de Despliegue en Producción

Esta guía te ayudará a desplegar tu aplicación GC-FISI en Vercel y conectarla con GitHub.

## 📋 Prerrequisitos

1. ✅ Código funcionando localmente
2. ✅ Cuenta en [GitHub](https://github.com)
3. ✅ Cuenta en [Vercel](https://vercel.com) (puedes usar tu cuenta de GitHub)
4. ✅ Proyecto de Supabase configurado

## 🔐 Paso 1: Configurar Variables de Entorno en Supabase

Antes de desplegar, asegúrate de tener:

1. **URL de tu proyecto Supabase:**
   - Ve a tu proyecto en Supabase
   - Settings → API
   - Copia la **Project URL** (ej: `https://xxxxx.supabase.co`)

2. **Clave Anónima (Anon Key):**
   - En la misma página (Settings → API)
   - Copia la clave **`anon` `public`** (empieza con `eyJ...`)

## 📦 Paso 2: Preparar el Proyecto para Git

### 2.1. Verificar que no hay archivos sensibles

Asegúrate de que estos archivos NO estén en Git (deben estar en `.gitignore`):
- `.env.local`
- `.env`
- `node_modules/`
- `.next/`
- `.vercel/`

El archivo `.gitignore` ya debería incluir estos. Verifícalo:

```bash
cat .gitignore
```

### 2.2. Verificar el estado de Git

```bash
# Ver qué archivos están siendo rastreados
git status

# Si ves archivos que NO deberían estar (como .env.local), elimínalos del tracking:
git rm --cached .env.local  # Solo si está siendo rastreado
```

## 🔧 Paso 3: Subir el Proyecto a GitHub

### 3.1. Inicializar Git (si no está inicializado)

```bash
# Inicializar repositorio (solo si es un proyecto nuevo)
git init

# Verificar estado
git status
```

### 3.2. Agregar todos los archivos

```bash
# Agregar todos los archivos (excepto los que están en .gitignore)
git add .

# Verificar qué se va a subir
git status
```

### 3.3. Hacer el primer commit

```bash
git commit -m "Initial commit: GC-FISI Platform - Ready for production"
```

### 3.4. Crear repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Haz clic en el botón **"+"** en la esquina superior derecha
3. Selecciona **"New repository"**
4. Configura el repositorio:
   - **Name:** `gc-fisi` (o el nombre que prefieras)
   - **Description:** "Plataforma de Gestión del Conocimiento - FISI UNMSM"
   - **Visibility:** Private o Public (tu elección)
   - **NO** marques "Initialize with README" (ya tienes uno)
5. Haz clic en **"Create repository"**

### 3.5. Conectar y subir el código

GitHub te mostrará comandos similares a estos (ajusta el nombre de usuario):

```bash
# Agregar el remoto (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/gc-fisi.git

# Cambiar a la rama main (si estás en otra rama)
git branch -M main

# Subir el código
git push -u origin main
```

Si te pide autenticación:
- **Opción 1 (Recomendada):** Usa GitHub CLI (`gh auth login`)
- **Opción 2:** Usa un Personal Access Token en lugar de contraseña
- **Opción 3:** Configura SSH keys en GitHub

## 🌐 Paso 4: Desplegar en Vercel

### 4.1. Importar Proyecto desde GitHub

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en **"Add New..."** → **"Project"**
4. Importa tu repositorio de GitHub:
   - Selecciona el repositorio `gc-fisi` (o el nombre que usaste)
   - Haz clic en **"Import"**

### 4.2. Configurar el Proyecto en Vercel

Vercel detectará automáticamente que es un proyecto Next.js. Solo necesitas:

1. **Nombre del Proyecto:** `gc-fisi` (o el que prefieras)
2. **Framework Preset:** Next.js (debería estar seleccionado automáticamente)
3. **Root Directory:** `./` (raíz del proyecto)
4. **Build Command:** `npm run build` (por defecto)
5. **Output Directory:** `.next` (por defecto)
6. **Install Command:** `npm install` (por defecto)

### 4.3. Configurar Variables de Entorno

**⚠️ CRÍTICO:** Antes de hacer deploy, configura las variables de entorno:

1. En la sección **"Environment Variables"**, agrega:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
   ```

   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key-completa
   ```

2. Asegúrate de que estén marcadas para:
   - ✅ **Production**
   - ✅ **Preview** (opcional, pero recomendado)
   - ✅ **Development** (opcional)

3. Haz clic en **"Add"** para cada variable

### 4.4. Realizar el Despliegue

1. Haz clic en **"Deploy"**
2. Espera a que Vercel construya y despliegue tu aplicación (2-5 minutos)
3. Una vez completado, verás:
   - ✅ **Build Successful**
   - 🌐 **URL de producción** (ej: `gc-fisi.vercel.app`)

### 4.5. Verificar el Despliegue

1. Haz clic en la URL de producción que te dio Vercel
2. Verifica que la aplicación carga correctamente
3. Si hay errores, revisa los **Build Logs** en Vercel

## 🔄 Paso 5: Configurar Despliegues Automáticos

Vercel está configurado por defecto para desplegar automáticamente cuando:

- **Push a `main`** → Despliega a producción
- **Push a otras ramas** → Crea un preview deployment
- **Pull Requests** → Crea un preview deployment

No necesitas hacer nada adicional.

## ✅ Verificación Post-Despliegue

### Checklist de Verificación

- [ ] La aplicación carga en la URL de Vercel
- [ ] No hay errores en la consola del navegador
- [ ] Las conexiones a Supabase funcionan
- [ ] Los recursos se pueden cargar/visualizar
- [ ] El modo oscuro/claro funciona
- [ ] Las rutas protegidas funcionan correctamente

### Probar Funcionalidades Clave

1. **Página de Inicio:** Debe cargar sin errores
2. **Dashboard de Coordinador:** Verificar que se conecta a Supabase
3. **Dashboard de Docente:** Verificar carga de recursos
4. **Dashboard de Estudiante:** Verificar visualización de recursos aprobados

## 🔧 Solución de Problemas

### Error: "Environment variable not found"

**Solución:**
- Verifica que agregaste las variables en Vercel (Settings → Environment Variables)
- Asegúrate de que las variables empiezan con `NEXT_PUBLIC_`
- Reinicia el deployment después de agregar variables

### Error: "Failed to connect to Supabase"

**Solución:**
- Verifica que la URL y la clave anónima son correctas
- Verifica que tu proyecto de Supabase está activo
- Revisa los logs de Vercel para más detalles

### Error: "Build failed"

**Solución:**
- Revisa los Build Logs en Vercel
- Verifica que `package.json` tiene todas las dependencias
- Verifica que no hay errores de TypeScript (`npm run type-check`)
- Verifica que el build funciona localmente (`npm run build`)

### La aplicación funciona localmente pero no en Vercel

**Solución:**
- Verifica las variables de entorno en Vercel
- Limpia el cache de Vercel (Settings → Clear Build Cache)
- Verifica que estás usando `NEXT_PUBLIC_` para variables del cliente

## 📝 Actualizar el Código

Para actualizar la aplicación en producción:

```bash
# Hacer cambios en tu código local
# ...

# Commit los cambios
git add .
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push origin main

# Vercel desplegará automáticamente
```

## 🔒 Seguridad en Producción

### Variables de Entorno

- ✅ **NO** subas `.env.local` a GitHub (está en `.gitignore`)
- ✅ Usa variables de entorno en Vercel para valores sensibles
- ✅ Usa la clave **`anon public`** (no `service_role` en el frontend)

### Supabase RLS

- ✅ Verifica que las políticas RLS están configuradas correctamente
- ✅ Las políticas deben estar activas en producción
- ✅ Prueba los permisos de cada rol (Estudiante, Docente, Coordinador)

### Dominio Personalizado (Opcional)

Puedes agregar un dominio personalizado en Vercel:

1. Ve a **Settings → Domains**
2. Agrega tu dominio
3. Sigue las instrucciones para configurar DNS

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Variables de Entorno en Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs de Vercel (Deployments → Ver detalles)
2. Revisa los logs del navegador (F12 → Console)
3. Verifica que todo funciona localmente primero
4. Consulta la documentación de los servicios

---

¡Felicitaciones! Tu aplicación GC-FISI está ahora en producción. 🎉

