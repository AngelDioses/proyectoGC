import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const error = '[Supabase Client] Variables de entorno no configuradas';
    console.error(error);
    throw new Error(error);
  }

  // Verificar que la URL sea válida
  if (!supabaseUrl.startsWith('https://')) {
    console.error('[Supabase Client] URL inválida:', supabaseUrl);
    throw new Error('La URL de Supabase debe comenzar con https://');
  }

  try {
    // createBrowserClient de @supabase/ssr maneja las cookies automáticamente usando localStorage
    // No necesitamos pasar opciones adicionales - el cliente se configura automáticamente
    const client = createBrowserClient<Database>(
      supabaseUrl.trim(),
      supabaseKey.trim()
    );
    return client;
  } catch (error) {
    console.error('[Supabase Client] Error al crear cliente:', error);
    throw error;
  }
}
