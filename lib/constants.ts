import { ResourceType, UserRole } from '@/types/database';

/**
 * Constantes de la aplicación
 */

export const APP_NAME = 'Plataforma de Gestión del Conocimiento';
export const APP_DESCRIPTION = 'Sistema para centralizar, preservar y transferir el conocimiento académico - FISI UNMSM';

/**
 * Roles de usuario
 */
export const USER_ROLES: Record<UserRole, string> = {
  admin: 'Administrador',
  teacher: 'Docente',
  coordinator: 'Coordinador Académico',
  student: 'Estudiante',
};

/**
 * Tipos de recursos
 */
export const RESOURCE_TYPES: Record<ResourceType, { label: string; description: string }> = {
  file: {
    label: 'Archivo',
    description: 'PDF, PowerPoint, Word, Excel, etc.',
  },
  link: {
    label: 'Enlace',
    description: 'URL externa a recursos en línea',
  },
  text_content: {
    label: 'Texto',
    description: 'Contenido escrito directamente',
  },
  video: {
    label: 'Video',
    description: 'Videos de YouTube, Vimeo, etc.',
  },
};

/**
 * Estados de recursos
 */
export const RESOURCE_STATUSES = {
  pending: {
    label: 'Pendiente',
    color: 'yellow',
  },
  approved: {
    label: 'Aprobado',
    color: 'green',
  },
  rejected: {
    label: 'Rechazado',
    color: 'red',
  },
} as const;

/**
 * Rutas protegidas por rol
 */
export const PROTECTED_ROUTES = {
  admin: ['/admin'],
  teacher: ['/dashboard/teacher', '/admin'],
  coordinator: ['/dashboard/coordinator', '/admin'],
  student: ['/dashboard/student'],
} as const;

/**
 * Límites de paginación
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

