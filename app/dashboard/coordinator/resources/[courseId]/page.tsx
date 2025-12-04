'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Video, Link as LinkIcon, BookOpen, ChevronRight, ChevronDown, Folder, FolderOpen, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Course {
  id: string;
  code: string;
  name: string;
}

interface CourseStructure {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  structure_type: string;
  order_index: number;
  children?: CourseStructure[];
  resources?: Resource[];
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  storage_path: string | null;
  url: string | null;
  content: string | null;
  tags: string[];
  reviewed_by: string | null;
}

export default function CoordinatorCourseResourcesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const supabase = createClient();

  // UUID del coordinador (hardcoded para desarrollo)
  const COORDINATOR_ID = 'bc0dd9a2-1427-40da-8bb5-de88e70f3a7e';

  const [course, setCourse] = useState<Course | null>(null);
  const [structures, setStructures] = useState<CourseStructure[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      // Cargar curso
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (!courseData) {
        router.push('/dashboard/coordinator/resources');
        return;
      }

      setCourse(courseData);

      // Cargar estructura
      const { data: structureData } = await supabase
        .from('course_structure')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      // Cargar recursos aprobados por este coordinador
      const { data: resourcesData } = await supabase
        .from('resources_with_details')
        .select('*')
        .eq('course_id', courseId)
        .eq('status', 'approved')
        .eq('is_visible', true)
        .eq('reviewed_by', COORDINATOR_ID)
        .order('created_at', { ascending: false });

      // Organizar recursos por structure_id
      const resourcesByStructure: { [key: string]: Resource[] } = {};
      resourcesData?.forEach((resource: any) => {
        if (!resourcesByStructure[resource.structure_id]) {
          resourcesByStructure[resource.structure_id] = [];
        }
        resourcesByStructure[resource.structure_id].push(resource);
      });

      // Construir árbol con recursos
      const tree = buildTree(structureData || [], resourcesByStructure);
      setStructures(tree);

      // Expandir todos por defecto
      const allIds = new Set<string>();
      const collectIds = (nodes: CourseStructure[]) => {
        nodes.forEach(node => {
          allIds.add(node.id);
          if (node.children) collectIds(node.children);
        });
      };
      collectIds(tree);
      setExpandedNodes(allIds);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      toast.error('Error al cargar el curso', {
        description: err.message || 'No se pudo cargar la información del curso.',
      });
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (
    items: CourseStructure[],
    resourcesByStructure: { [key: string]: Resource[] }
  ): CourseStructure[] => {
    const map = new Map<string, CourseStructure>();
    const roots: CourseStructure[] = [];

    items.forEach(item => {
      map.set(item.id, {
        ...item,
        children: [],
        resources: resourcesByStructure[item.id] || [],
      });
    });

    items.forEach(item => {
      const node = map.get(item.id)!;
      if (item.parent_id) {
        const parent = map.get(item.parent_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    const sortByOrder = (nodes: CourseStructure[]) => {
      nodes.sort((a, b) => a.order_index - b.order_index);
      nodes.forEach(node => {
        if (node.children) sortByOrder(node.children);
      });
    };

    sortByOrder(roots);
    return roots;
  };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      case 'text_content':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setEditTitle(resource.title);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingResource || !editTitle.trim()) {
      toast.error('Título requerido', {
        description: 'El título del recurso no puede estar vacío.',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('resources')
        .update({ title: editTitle.trim() })
        .eq('id', editingResource.id);

      if (error) throw error;

      toast.success('Recurso actualizado', {
        description: 'El título del recurso se ha actualizado correctamente.',
      });

      setShowEditDialog(false);
      setEditingResource(null);
      setEditTitle('');
      await loadCourseData();
    } catch (err: any) {
      console.error('Error al actualizar recurso:', err);
      toast.error('Error al actualizar el recurso', {
        description: err.message || 'No se pudo actualizar el recurso.',
      });
    }
  };

  const handleDeleteResource = (resourceId: string) => {
    setResourceToDelete(resourceId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!resourceToDelete) return;

    try {
      // Eliminar recurso (hard delete)
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceToDelete);

      if (error) throw error;

      toast.success('Recurso eliminado', {
        description: 'El recurso ha sido eliminado permanentemente.',
      });

      setShowDeleteDialog(false);
      setResourceToDelete(null);
      await loadCourseData();
    } catch (err: any) {
      console.error('Error al eliminar recurso:', err);
      toast.error('Error al eliminar el recurso', {
        description: err.message || 'No se pudo eliminar el recurso.',
      });
    }
  };

  const renderNode = (node: CourseStructure, level: number = 0): JSX.Element => {
    const hasChildren = node.children && node.children.length > 0;
    const hasResources = node.resources && node.resources.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const indent = level * 24;

    return (
      <div key={node.id} className="mb-6">
        {/* Nodo de estructura */}
        <div
          className="flex items-center gap-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mb-2"
          style={{ paddingLeft: `${indent + 12}px` }}
        >
          <button
            onClick={() => toggleNode(node.id)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )
            ) : (
              <span className="w-5 h-5 inline-block" />
            )}
          </button>
          
          {isExpanded || !hasChildren ? (
            <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <Folder className="h-5 w-5 text-gray-500 dark:text-gray-500" />
          )}
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{node.name}</h3>
            {node.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{node.description}</p>
            )}
          </div>
          
          {hasResources && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded-full">
              {node.resources!.length} recurso{node.resources!.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Recursos de este nodo */}
        {hasResources && isExpanded && (
          <div className="ml-8 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {node.resources!.map((resource) => (
                <Card
                  key={resource.id}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource.resource_type)}
                        <span className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                          {resource.resource_type}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditResource(resource)}
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteResource(resource.id)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-base line-clamp-2">
                      {resource.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {resource.description || 'Sin descripción'}
                    </p>
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {resource.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link href={`/dashboard/resources/${resource.id}`}>
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Ver Detalles
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Hijos */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
        <div className="container mx-auto">
          <p className="text-center text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/coordinator/resources')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            ← Volver a Recursos Aprobados
          </Button>
          <div className="flex items-center gap-4">
            <BookOpen className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-4xl font-bold">{course.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{course.code}</p>
            </div>
          </div>
        </div>

        {structures.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Folder className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-700 dark:text-gray-300">No hay estructura definida</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">Este curso aún no tiene contenido disponible</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {structures.map(node => renderNode(node))}
          </div>
        )}
      </div>

      {/* Dialog para editar recurso */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Editar Recurso</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Modifica el título del recurso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white mt-2"
                placeholder="Título del recurso"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setEditingResource(null);
                setEditTitle('');
              }}
              className="border-gray-300 dark:border-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para eliminar recurso */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>¿Eliminar Recurso?</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Esta acción no se puede deshacer. El recurso será eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setResourceToDelete(null);
              }}
              className="border-gray-300 dark:border-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

