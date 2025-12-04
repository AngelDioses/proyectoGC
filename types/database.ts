/**
 * Tipos TypeScript para GC-FISI
 * Plataforma de Gestión del Conocimiento Académico - FISI UNMSM
 */

// ============================================
// ENUMS
// ============================================

export type UserRole = 'student' | 'teacher' | 'coordinator' | 'admin';

export type ResourceStatus = 'pending' | 'approved' | 'rejected';

export type ResourceType = 'file' | 'link' | 'text_content' | 'video';

// ============================================
// TABLAS BASE
// ============================================

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  current_syllabus_url: string | null;
  coordinator_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseStructure {
  id: string;
  course_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  order_index: number;
  structure_type: 'category' | 'topic' | 'subcategory';
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  course_id: string;
  structure_id: string;
  uploader_id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  storage_path: string | null;
  url: string | null;
  content: string | null;
  status: ResourceStatus;
  is_visible: boolean;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ============================================
// TIPOS CON RELACIONES
// ============================================

export interface ResourceWithDetails extends Resource {
  course_name: string;
  course_code: string;
  structure_name: string;
  structure_type: string;
  uploader_name: string | null;
  uploader_role: UserRole;
  reviewer_name: string | null;
}

export interface CourseWithStructure extends Course {
  structure: CourseStructure[];
}

// ============================================
// TIPOS PARA INSERCIÓN
// ============================================

export interface ProfileInsert {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: UserRole;
}

export interface CourseInsert {
  code: string;
  name: string;
  description?: string | null;
  current_syllabus_url?: string | null;
  coordinator_id?: string | null;
}

export interface CourseStructureInsert {
  course_id: string;
  parent_id?: string | null;
  name: string;
  description?: string | null;
  order_index?: number;
  structure_type: 'category' | 'topic' | 'subcategory';
}

export interface ResourceInsert {
  course_id: string;
  structure_id: string;
  uploader_id: string;
  title: string;
  description?: string | null;
  resource_type: ResourceType;
  storage_path?: string | null;
  url?: string | null;
  content?: string | null;
  tags?: string[];
}

// ============================================
// TIPOS PARA ACTUALIZACIÓN
// ============================================

export interface ProfileUpdate {
  full_name?: string | null;
  avatar_url?: string | null;
  role?: UserRole;
}

export interface CourseUpdate {
  code?: string;
  name?: string;
  description?: string | null;
  current_syllabus_url?: string | null;
  coordinator_id?: string | null;
}

export interface CourseStructureUpdate {
  parent_id?: string | null;
  name?: string;
  description?: string | null;
  order_index?: number;
  structure_type?: 'category' | 'topic' | 'subcategory';
}

export interface ResourceUpdate {
  title?: string;
  description?: string | null;
  resource_type?: ResourceType;
  storage_path?: string | null;
  url?: string | null;
  content?: string | null;
  status?: ResourceStatus;
  is_visible?: boolean;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  tags?: string[];
}

// ============================================
// TIPOS PARA SUPABASE DATABASE
// ============================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      courses: {
        Row: Course;
        Insert: CourseInsert;
        Update: CourseUpdate;
      };
      course_structure: {
        Row: CourseStructure;
        Insert: CourseStructureInsert;
        Update: CourseStructureUpdate;
      };
      resources: {
        Row: Resource;
        Insert: ResourceInsert;
        Update: ResourceUpdate;
      };
      resources_with_details: {
        Row: ResourceWithDetails;
      };
    };
    Enums: {
      user_role: UserRole;
      resource_status: ResourceStatus;
      resource_type: ResourceType;
    };
  };
};
