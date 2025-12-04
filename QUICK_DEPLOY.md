# ⚡ Despliegue Rápido - Comandos Listos para Copiar

Esta guía contiene los comandos exactos que necesitas ejecutar para subir tu proyecto a GitHub y desplegarlo en Vercel.

## 📋 Checklist Pre-Despliegue

Antes de comenzar, verifica:

- [ ] Tu proyecto funciona localmente (`npm run dev`)
- [ ] El build funciona sin errores (`npm run build`)
- [ ] Tienes una cuenta en [GitHub](https://github.com)
- [ ] Tienes una cuenta en [Vercel](https://vercel.com)
- [ ] Tienes tus credenciales de Supabase a la mano:
  - URL del proyecto: `https://tu-proyecto.supabase.co`
  - Clave anónima (anon key)

---

## 🚀 PASO 1: Subir a GitHub

### 1.1 Inicializar Git

```powershell
git init
```

### 1.2 Agregar Archivos

```powershell
git add .
```

### 1.3 Verificar qué se va a subir

```powershell
git status
```

**⚠️ IMPORTANTE:** Verifica que NO aparece `.env.local` en la lista. Si aparece, verifica tu `.gitignore`.

### 1.4 Hacer el Primer Commit

```powershell
git commit -m "Initial commit: GC-FISI Platform - Sistema de Gestión del Conocimiento Académico"
```

### 1.5 Crear Repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. **Repository name:** `gc-fisi`
3. **Description:** "Plataforma de Gestión del Conocimiento Académico - FISI UNMSM"
4. Elige **Private** o **Public**
5. **⚠️ NO marques** "Initialize this repository with a README"
6. Haz clic en **"Create repository"**

### 1.6 Conectar y Subir (Reemplaza TU_USUARIO)

```powershell
# Reemplaza TU_USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/gc-fisi.git

git branch -M main

git push -u origin main
```

**Si te pide autenticación:**
- Usa un **Personal Access Token** de GitHub (no tu contraseña)
- Para crear uno: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

---

## 🌐 PASO 2: Desplegar en Vercel

### 2.1 Importar Proyecto

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Inicia sesión con GitHub
3. Selecciona el repositorio `gc-fisi`
4. Haz clic en **"Import"**

### 2.2 Configurar Variables de Entorno

**ANTES de hacer clic en "Deploy", configura las variables:**

1. En la sección **"Environment Variables"**, agrega:

   ```
   Variable: NEXT_PUBLIC_SUPABASE_URL
   Value: https://tu-proyecto-id.supabase.co
   ```

   ✅ Marca: Production, Preview, Development

2. Agrega la segunda variable:

   ```
   Variable: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: tu-clave-anon-key-completa-aqui
   ```

   ✅ Marca: Production, Preview, Development

3. Haz clic en **"Add"** para cada variable

### 2.3 Desplegar

1. Haz clic en **"Deploy"**
2. Espera 2-5 minutos
3. ✅ Una vez completado, tendrás tu URL de producción

### 2.4 Verificar

1. Abre la URL que te dio Vercel
2. Verifica que la aplicación carga
3. Prueba las funcionalidades principales

---

## ✅ Verificación Post-Despliegue

### Checklist:

- [ ] La aplicación carga en la URL de Vercel
- [ ] No hay errores en la consola del navegador (F12)
- [ ] Los dashboards se conectan a Supabase
- [ ] Puedes ver recursos (si hay datos de prueba)
- [ ] El modo oscuro/claro funciona

### Si hay Problemas:

1. **Revisa los Build Logs en Vercel:**
   - Ve a tu proyecto en Vercel
   - Click en el último deployment
   - Revisa los logs de build

2. **Verifica Variables de Entorno:**
   - Settings → Environment Variables
   - Verifica que estén escritas correctamente

3. **Revisa la Consola del Navegador:**
   - F12 → Console
   - Busca errores relacionados con Supabase

---

## 🔄 Actualizar el Código

Después de hacer cambios:

```powershell
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

Vercel desplegará automáticamente.

---

## 📚 Documentación Completa

Para más detalles, consulta:

- **[GITHUB_SETUP.md](./GITHUB_SETUP.md)** - Guía detallada de GitHub
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía detallada de Vercel
- **[README.md](./README.md)** - Documentación general del proyecto

---

## 🆘 Problemas Comunes

### "Environment variable not found"
→ Verifica que agregaste las variables en Vercel antes del deploy

### "Failed to connect to Supabase"
→ Verifica que la URL y la clave son correctas

### "Build failed"
→ Revisa los Build Logs en Vercel para ver el error específico

### "Permission denied" al hacer push
→ Usa un Personal Access Token en lugar de contraseña

---

¡Listo! Tu aplicación está en producción. 🎉

