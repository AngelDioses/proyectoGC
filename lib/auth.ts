import { createClient } from '@/lib/supabase/server';
import { UserRole } from '@/types/database';

/**
 * Obtiene el usuario actual autenticado
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Obtener el perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    profile,
  };
}

/**
 * Obtiene el rol del usuario actual
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  return user?.profile?.role || null;
}

/**
 * Verifica si el usuario tiene uno de los roles especificados
 */
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role !== null && allowedRoles.includes(role);
}

/**
 * Verifica si el usuario es admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(['admin']);
}

/**
 * Verifica si el usuario es docente o admin
 */
export async function isTeacherOrAdmin(): Promise<boolean> {
  return hasRole(['teacher', 'admin']);
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

