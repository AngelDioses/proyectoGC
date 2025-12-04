# 🚀 Inicio Rápido - Primer Vistazo

## ✅ Pasos Completados

1. ✅ Esquema SQL ejecutado en Supabase
2. ✅ Variables de entorno configuradas (`.env.local`)
3. ✅ Dependencias instaladas (`npm install`)
4. ✅ Servidor de desarrollo ejecutándose (`npm run dev`)

## 🌐 Acceder a la Aplicación

Abre tu navegador y ve a:

**http://localhost:3000**

Deberías ver la página principal de la Plataforma de Gestión del Conocimiento.

## 📱 Lo que Verás

### Página Principal (`/`)

- Título: "Plataforma de Gestión del Conocimiento"
- Subtítulo: "FISI - UNMSM"
- Tres tarjetas informativas:
  - **Estudiantes:** Sube recursos y comparte tu conocimiento
  - **Docentes:** Valida y aprueba recursos subidos
  - **Administradores:** Gestiona cursos y sílabos

## 🔍 Rutas Disponibles (Parciales)

### Autenticación
- `/login` - Página de login (pendiente de implementar formulario)

### Estudiantes
- `/resources/new` - Formulario para subir recursos (protegido, pendiente de implementar)

### Docentes
- `/dashboard` - Dashboard de recursos pendientes (protegido, pendiente de implementar)

### Administradores
- `/courses` - Gestión de cursos (protegido, pendiente de implementar)

## ⚠️ Notas Importantes

1. **Autenticación pendiente:** Las rutas protegidas aún no tienen formularios de login funcionales.

2. **Base de datos:** Asegúrate de que el esquema SQL se ejecutó correctamente en Supabase.

3. **Datos de prueba:** Puedes crear algunos datos de prueba:
   - Período académico
   - Curso
   - Sílabo
   - Unidades del sílabo

   Consulta [`SETUP.md`](./SETUP.md) sección "Crear Datos Iniciales".

## 🐛 Si No Funciona

### Error: "Cannot connect to Supabase"

- Verifica que `.env.local` tiene las credenciales correctas
- Verifica que el proyecto de Supabase está activo
- Reinicia el servidor (`Ctrl + C` y luego `npm run dev`)

### Error: "Module not found"

- Reinstala dependencias: `npm install`
- Limpia caché: elimina la carpeta `.next` y reinicia

### La página no carga

- Verifica que el servidor está corriendo (deberías ver mensajes en la terminal)
- Verifica que no hay errores en la consola del navegador (F12)
- Verifica que estás usando el puerto 3000 (o el que te indique Next.js)

## 📝 Próximos Pasos de Desarrollo

1. **Implementar autenticación:**
   - Formulario de login con Supabase Auth
   - Formulario de registro
   - Redirección post-login

2. **Implementar formulario de recursos:**
   - Selects en cascada (Curso → Semana/Tema)
   - Carga de archivos
   - Campo de conocimiento tácito

3. **Implementar dashboard docente:**
   - Lista de recursos pendientes
   - Modal de revisión
   - Aprobación/rechazo

## 📚 Documentación

- [`SETUP.md`](./SETUP.md) - Configuración inicial completa
- [`ENV_SETUP.md`](./ENV_SETUP.md) - Variables de entorno
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) - Solución de problemas
- [`STRUCTURE.md`](./STRUCTURE.md) - Estructura del proyecto

## 🎉 ¡Felicitaciones!

Ya tienes el proyecto funcionando. Ahora puedes comenzar a desarrollar las funcionalidades específicas.

