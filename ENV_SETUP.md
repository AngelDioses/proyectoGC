# 📝 Configuración de Variables de Entorno

## 🔑 Variables Necesarias

Tu proyecto necesita las siguientes variables de entorno para funcionar correctamente.

## 🚀 Pasos para Configurar

### 1. Crear el Archivo `.env.local`

En la raíz de tu proyecto (donde está `package.json`), crea un archivo llamado `.env.local`.

**Windows (PowerShell):**
```powershell
New-Item -Path .env.local -ItemType File
```

**Windows (CMD):**
```cmd
type nul > .env.local
```

**Mac/Linux:**
```bash
touch .env.local
```

O simplemente crea el archivo manualmente desde tu editor.

### 2. Obtener las Credenciales de Supabase

#### Paso 2.1: Ve al Dashboard de Supabase

1. Abre tu navegador y ve a [supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto (o créalo si aún no lo tienes)

#### Paso 2.2: Obtener la URL del Proyecto

1. En el menú lateral, ve a **Settings** (⚙️ Configuración)
2. Haz clic en **API**
3. En la sección **Project URL**, copia la URL
   - Se ve algo como: `https://xxxxxxxxxxxxx.supabase.co`

#### Paso 2.3: Obtener la Clave Anónima (Anon Key)

1. En la misma página de **Settings → API**
2. En la sección **Project API keys**
3. Busca la clave **`anon` `public`**
4. Haz clic en el icono de "copiar" o selecciona y copia toda la clave
   - Es una cadena larga de caracteres que empieza con `eyJ...`

### 3. Configurar el Archivo `.env.local`

Abre el archivo `.env.local` que creaste y agrega las siguientes líneas:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key-aqui-muy-larga
```

**Ejemplo real (reemplaza con tus valores):**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxOTUwMTQzODkwfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

### 4. Verificar la Configuración

**⚠️ IMPORTANTE:**
- El archivo `.env.local` está en `.gitignore`, así que no se subirá a Git (es seguro)
- **NO** compartas tus claves públicamente
- Si las claves se exponen, regenera las keys en Supabase (Settings → API → Regenerate)

### 5. Reiniciar el Servidor de Desarrollo

Después de crear o modificar `.env.local`, **debes reiniciar** el servidor de Next.js:

1. Detén el servidor (Ctrl + C en la terminal)
2. Inicia nuevamente:
   ```bash
   npm run dev
   ```

Next.js solo carga las variables de entorno al iniciar, así que los cambios requieren un reinicio.

## ✅ Verificar que Funciona

### Opción 1: Verificar en el Código

Puedes verificar temporalmente en cualquier componente o página:

```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
```

**⚠️ No hagas esto en producción**, solo para debug.

### Opción 2: Probar la Conexión

Si tienes alguna página que use Supabase, intenta hacer una consulta simple:

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function TestPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').select('count');
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return <div>Conectado correctamente a Supabase!</div>;
}
```

## 🐛 Problemas Comunes

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solución:**
- Verifica que el archivo se llama exactamente `.env.local` (con el punto al inicio)
- Verifica que está en la raíz del proyecto (mismo nivel que `package.json`)
- Reinicia el servidor de desarrollo
- Verifica que no hay espacios antes o después del `=` en el archivo `.env.local`

### Error: "Invalid API key"

**Solución:**
- Verifica que copiaste la clave completa (son muy largas)
- Verifica que no hay espacios adicionales
- Verifica que estás usando la clave **`anon public`** y no la `service_role` (esa es secreta)

### Las variables no se cargan

**Solución:**
- Asegúrate de que las variables empiezan con `NEXT_PUBLIC_` (si se usan en el cliente)
- Reinicia completamente el servidor (Ctrl + C y luego `npm run dev` nuevamente)
- Verifica que el archivo está guardado correctamente

## 📋 Checklist de Configuración

- [ ] Proyecto creado en Supabase
- [ ] Archivo `.env.local` creado en la raíz del proyecto
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurado con la URL correcta
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado con la clave anon public
- [ ] Servidor de desarrollo reiniciado
- [ ] Variables cargadas correctamente (verificado con un console.log o prueba de conexión)

## 🔒 Seguridad

- ✅ El archivo `.env.local` está en `.gitignore` (no se sube a Git)
- ✅ La clave `anon public` es segura para usar en el frontend
- ⚠️ **NUNCA** uses la clave `service_role` en el frontend
- ⚠️ **NUNCA** subas tu archivo `.env.local` a repositorios públicos

## 📚 Recursos Adicionales

- [Documentación de Next.js sobre Variables de Entorno](https://nextjs.org/docs/basic-features/environment-variables)
- [Documentación de Supabase sobre API Keys](https://supabase.com/docs/guides/api/api-keys)

