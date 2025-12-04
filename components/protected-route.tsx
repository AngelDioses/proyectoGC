import { redirect } from 'next/navigation';
import { getCurrentUserRole, isAuthenticated } from '@/lib/auth';
import { UserRole } from '@/types/database';
import { PROTECTED_ROUTES } from '@/lib/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * Componente para proteger rutas basado en roles
 */
export async function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/',
}: ProtectedRouteProps) {
  const isAuth = await isAuthenticated();
  
  if (!isAuth) {
    redirect('/login');
  }

  const role = await getCurrentUserRole();
  
  if (!role || !allowedRoles.includes(role)) {
    redirect(redirectTo);
  }

  return <>{children}</>;
}

/**
 * Hook/helper para verificar acceso a rutas en el cliente
 */
export function checkRouteAccess(userRole: UserRole | null, route: string): boolean {
  if (!userRole) return false;

  const allowedRoutes = PROTECTED_ROUTES[userRole];
  return allowedRoutes.some((allowedRoute) => route.startsWith(allowedRoute));
}

