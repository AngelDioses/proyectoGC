'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, Folder, FolderOpen, BookOpen } from 'lucide-react';
import Link from 'next/link';
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
  order_index: number;
  structure_type: string;
  children?: CourseStructure[];
}

function CourseStructureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [structures, setStructures] = useState<CourseStructure[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStructure, setEditingStructure] = useState<CourseStructure | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    order_index: 0,
    structure_type: 'category' as 'category' | 'topic' | 'subcategory',
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    // Si hay un courseId en la URL, pre-seleccionarlo
    const courseIdFromUrl = searchParams.get('courseId');
    if (courseIdFromUrl && courses.length > 0) {
      setSelectedCourseId(courseIdFromUrl);
    }
  }, [searchParams, courses]);

  useEffect(() => {
    if (selectedCourseId) {
      loadStructures();
    } else {
      setStructures([]);
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, code, name')
        .order('name');

      if (error) throw error;
      setCourses(data || []);
    } catch (err: any) {
      console.error('Error al cargar cursos:', err);
      toast.error('Error al cargar los cursos', {
        description: err.message || 'No se pudieron cargar los cursos. Intenta nuevamente.',
      });
    }
  };

  const loadStructures = async () => {
    if (!selectedCourseId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_structure')
        .select('*')
        .eq('course_id', selectedCourseId)
        .order('order_index');

      if (error) throw error;
      
      const tree = buildTree(data || []);
      setStructures(tree);
      
      // Expandir todos los nodos por defecto
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
      console.error('Error al cargar estructura:', err);
      toast.error('Error al cargar la estructura', {
        description: err.message || 'No se pudo cargar la estructura del curso.',
      });
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (items: CourseStructure[]): CourseStructure[] => {
    const map = new Map<string, CourseStructure>();
    const roots: CourseStructure[] = [];

    items.forEach(item => {
      map.set(item.id, { ...item, children: [] });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourseId || !formData.name.trim()) {
      toast.error('Campos requeridos', {
        description: 'Por favor selecciona un curso y completa el nombre del elemento.',
      });
      return;
    }

    try {
      const dataToInsert = {
        course_id: selectedCourseId,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        parent_id: formData.parent_id || null,
        order_index: formData.order_index,
        structure_type: formData.structure_type,
      };

      if (editingStructure) {
        const { error } = await supabase
          .from('course_structure')
          .update(dataToInsert)
          .eq('id', editingStructure.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('course_structure')
          .insert(dataToInsert);

        if (error) throw error;
      }

      toast.success(editingStructure ? 'Elemento actualizado' : 'Elemento creado', {
        description: editingStructure 
          ? 'La estructura se ha actualizado correctamente.'
          : 'El nuevo elemento se ha agregado a la estructura.',
      });

      setShowForm(false);
      setEditingStructure(null);
      setFormData({
        name: '',
        description: '',
        parent_id: '',
        order_index: 0,
        structure_type: 'category',
      });
      await loadStructures();
    } catch (err: any) {
      console.error('Error al guardar estructura:', err);
      toast.error('Error al guardar', {
        description: err.message || 'No se pudo guardar el elemento. Intenta nuevamente.',
      });
    }
  };

  const handleEdit = (structure: CourseStructure) => {
    setEditingStructure(structure);
    setFormData({
      name: structure.name,
      description: structure.description || '',
      parent_id: structure.parent_id || '',
      order_index: structure.order_index,
      structure_type: structure.structure_type as any,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const structure = getAllStructuresFlat(structures).find(s => s.id === id);
    const structureName = structure?.name || 'este elemento';
    
    // Usar toast.promise para mostrar confirmación
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const { error } = await supabase
            .from('course_structure')
            .delete()
            .eq('id', id);

          if (error) throw error;
          await loadStructures();
          resolve(true);
        } catch (err: any) {
          console.error('Error al eliminar:', err);
          reject(err);
        }
      }),
      {
        loading: 'Eliminando elemento...',
        success: () => {
          return `"${structureName}" ha sido eliminado correctamente.`;
        },
        error: (err: any) => {
          return `Error al eliminar: ${err.message || 'No se pudo eliminar el elemento.'}`;
        },
      }
    );
  };

  const getAllStructuresFlat = (nodes: CourseStructure[]): CourseStructure[] => {
    const result: CourseStructure[] = [];
    const traverse = (items: CourseStructure[]) => {
      items.forEach(item => {
        result.push(item);
        if (item.children) traverse(item.children);
      });
    };
    traverse(nodes);
    return result;
  };

  const renderNode = (node: CourseStructure, level: number = 0): JSX.Element => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const indent = level * 24;

    return (
      <div key={node.id} className="mb-2">
        <div
          className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          style={{ paddingLeft: `${indent + 8}px` }}
        >
          <button
            onClick={() => toggleNode(node.id)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <span className="w-4 h-4 inline-block" />
            )}
          </button>
          
          {isExpanded || !hasChildren ? (
            <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Folder className="h-4 w-4 text-gray-500 dark:text-gray-500" />
          )}
          
          <span className="flex-1 text-sm">
            {node.name}
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
              ({node.structure_type})
            </span>
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(node)}
              className="h-7 px-2"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(node.id)}
              className="h-7 px-2 text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Volver
            </Button>
            <Link href="/dashboard/coordinator/courses">
              <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-700">
                <BookOpen className="h-4 w-4 mr-2" />
                Gestionar Cursos
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">Gestión de Estructura de Cursos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona la estructura jerárquica de cada curso</p>
        </div>

        {/* Selector de curso */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle>Seleccionar Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un curso</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {selectedCourseId && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Estructura del Curso</h2>
              <Button
                onClick={() => {
                  setShowForm(true);
                  setEditingStructure(null);
                  setFormData({
                    name: '',
                    description: '',
                    parent_id: '',
                    order_index: structures.length > 0 ? Math.max(...getAllStructuresFlat(structures).map(s => s.order_index)) + 1 : 0,
                    structure_type: 'category',
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Elemento
              </Button>
            </div>

            {loading ? (
              <p className="text-center text-gray-600 dark:text-gray-400">Cargando...</p>
            ) : structures.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    No hay estructura definida. Crea la primera categoría.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  {structures.map(node => renderNode(node))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Dialog para crear/editar */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>{editingStructure ? 'Editar' : 'Nuevo'} Elemento</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {editingStructure ? 'Modifica' : 'Crea'} un elemento en la estructura del curso
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del elemento *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Sílabo, Material Extra, Tema 1"
                  required
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white mt-2"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Nombre que aparecerá en la estructura del curso
                </p>
              </div>
              
              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción adicional del elemento..."
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white mt-2"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="structure_type">Tipo de elemento *</Label>
                  <select
                    id="structure_type"
                    value={formData.structure_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, structure_type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                    required
                  >
                    <option value="category">Categoría Principal</option>
                    <option value="topic">Tema</option>
                    <option value="subcategory">Subcategoría</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Define el nivel jerárquico
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="order_index">Posición en la lista</Label>
                  <Input
                    id="order_index"
                    type="number"
                    min="0"
                    value={formData.order_index}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white mt-2"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Número menor = aparece primero
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="parent_id">Elemento padre (opcional)</Label>
                <select
                  id="parent_id"
                  value={formData.parent_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                >
                  <option value="">Ninguno - Crear en el nivel raíz</option>
                  {getAllStructuresFlat(structures)
                    .filter(s => !editingStructure || s.id !== editingStructure.id)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.structure_type === 'category' ? 'Categoría' : s.structure_type === 'topic' ? 'Tema' : 'Subcategoría'})
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Selecciona un elemento padre para crear una subcategoría. Déjalo vacío para crear en el nivel principal.
                </p>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingStructure(null);
                  }}
                  className="border-gray-700"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingStructure ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function CourseStructurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8"><div className="container mx-auto"><p className="text-center text-gray-600 dark:text-gray-400">Cargando...</p></div></div>}>
      <CourseStructureContent />
    </Suspense>
  );
}

