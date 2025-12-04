# 📦 Guía Rápida: Subir Proyecto a GitHub

Esta guía te ayudará a subir tu proyecto GC-FISI a GitHub paso a paso.

## ✅ Paso 1: Verificar Preparación

Antes de subir, verifica que:

- [ ] Tu proyecto funciona localmente (`npm run dev`)
- [ ] No hay errores de build (`npm run build`)
- [ ] El archivo `.env.local` existe (pero NO se subirá a Git - está en `.gitignore`)

## 🚀 Paso 2: Inicializar Git

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
# Inicializar repositorio Git
git init

# Ver el estado (deberías ver muchos archivos sin rastrear)
git status
```

## 📝 Paso 3: Agregar Archivos al Staging

```bash
# Agregar todos los archivos (excepto los que están en .gitignore)
git add .

# Verificar qué se va a subir (deberías ver tus archivos, pero NO .env.local ni node_modules)
git status
```

**⚠️ IMPORTANTE:** Verifica que estos archivos NO aparecen en `git status`:
- ❌ `.env.local`
- ❌ `node_modules/`
- ❌ `.next/`
- ❌ `.vercel/`

Si alguno aparece, verifica tu `.gitignore`.

## 💾 Paso 4: Hacer el Primer Commit

```bash
git commit -m "Initial commit: GC-FISI Platform - Sistema de Gestión del Conocimiento Académico"
```

## 🌐 Paso 5: Crear Repositorio en GitHub

1. **Ve a GitHub:**
   - Abre [github.com](https://github.com) en tu navegador
   - Inicia sesión (o crea una cuenta si no tienes)

2. **Crear Nuevo Repositorio:**
   - Haz clic en el botón **"+"** (esquina superior derecha)
   - Selecciona **"New repository"**

3. **Configurar el Repositorio:**
   - **Repository name:** `gc-fisi` (o el nombre que prefieras)
   - **Description:** "Plataforma de Gestión del Conocimiento Académico - FISI UNMSM"
   - **Visibility:** 
     - 🔒 **Private** (recomendado si contiene información sensible)
     - 🌍 **Public** (si quieres compartirlo públicamente)
   - **⚠️ NO marques** "Initialize this repository with a README" (ya tienes uno)

4. **Crear Repositorio:**
   - Haz clic en el botón verde **"Create repository"**

## 🔗 Paso 6: Conectar y Subir el Código

GitHub te mostrará comandos después de crear el repositorio. Ejecuta estos (reemplaza `TU_USUARIO` con tu usuario de GitHub):

```bash
# Agregar el remoto de GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/gc-fisi.git

# Cambiar a la rama main (si estás en otra rama)
git branch -M main

# Subir el código a GitHub
git push -u origin main
```

### Si te pide Autenticación:

**Opción 1: Personal Access Token (Recomendado)**
1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un nuevo token con permisos `repo`
3. Úsalo como contraseña cuando Git te lo pida

**Opción 2: GitHub CLI**
```bash
# Instalar GitHub CLI (si no lo tienes)
# Windows: winget install GitHub.cli
# Luego:
gh auth login
git push -u origin main
```

**Opción 3: SSH Keys**
- Configura SSH keys en GitHub (Settings → SSH and GPG keys)
- Usa la URL SSH: `git@github.com:TU_USUARIO/gc-fisi.git`

## ✅ Paso 7: Verificar

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/gc-fisi`
2. Verifica que todos tus archivos están ahí
3. Verifica que `.env.local` NO está (está en `.gitignore`)

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
# Ver qué cambió
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir cambios
git push origin main
```

## 📚 Próximos Pasos

Una vez que el código esté en GitHub:

1. **Desplegar en Vercel:** Consulta [`DEPLOYMENT.md`](./DEPLOYMENT.md)
2. **Configurar CI/CD:** Vercel se conecta automáticamente con GitHub
3. **Colaboradores:** Invita a otros desarrolladores desde GitHub (Settings → Collaborators)

## 🆘 Problemas Comunes

### Error: "fatal: remote origin already exists"

```bash
# Eliminar el remoto existente
git remote remove origin

# Agregar el nuevo remoto
git remote add origin https://github.com/TU_USUARIO/gc-fisi.git
```

### Error: "Permission denied"

- Verifica que estás autenticado en GitHub
- Verifica que el nombre de usuario es correcto
- Usa un Personal Access Token en lugar de contraseña

### Error: "Failed to push some refs"

```bash
# Si GitHub tiene un README que no tienes localmente
git pull origin main --allow-unrelated-histories

# Luego intenta de nuevo
git push -u origin main
```

## ✨ ¡Listo!

Tu código está ahora en GitHub. Sigue con la guía de despliegue en [`DEPLOYMENT.md`](./DEPLOYMENT.md) para ponerlo en producción.

