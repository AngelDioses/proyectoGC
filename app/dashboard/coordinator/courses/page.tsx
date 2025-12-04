'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, BookOpen, ArrowLeft } from 'lucide-react';
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
  description: string | null;
  current_syllabus_url: string | null;
  coordinator_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function CoursesManagementPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    current_syllabus_url: '',
  });
  const [courseStructures, setCourseStructures] = useState<Record<string, boolean>>({});
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [courseToReset, setCourseToReset] = useState<string | null>(null);

  // UUID del coordinador (hardcoded para desarrollo)
  // En producción, esto vendría de auth.uid()
  const COORDINATOR_ID = 'bc0dd9a2-1427-40da-8bb5-de88e70f3a7e';

  // Verificar si un curso ya tiene estructura (verificación más robusta)
  const checkCourseStructure = async (courseId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('course_structure')
        .select('id, name')
        .eq('course_id', courseId);

      if (error) throw error;
      
      // Si hay cualquier estructura, retornar true
      const hasStructure = (data && data.length > 0) || false;
      
      if (hasStructure) {
        console.log(`Curso ${courseId} ya tiene ${data.length} elementos de estructura`);
      }
      
      return hasStructure;
    } catch (err) {
      console.error('Error al verificar estructura:', err);
      // En caso de error, asumir que SÍ existe para evitar duplicados
      return true;
    }
  };

  // Cargar el estado de estructuras para todos los cursos (optimizado)
  const loadCourseStructures = async () => {
    if (courses.length === 0) return;
    
    try {
      // Obtener todos los course_ids que tienen estructura en una sola consulta
      const courseIds = courses.map(c => c.id);
      const { data, error } = await supabase
        .from('course_structure')
        .select('course_id')
        .in('course_id', courseIds);

      if (error) throw error;

      // Crear un Set de IDs que tienen estructura
      const coursesWithStructure = new Set(
        (data || []).map(item => item.course_id)
      );

      // Crear el mapa de estructuras
      const structuresMap: Record<string, boolean> = {};
      courses.forEach(course => {
        structuresMap[course.id] = coursesWithStructure.has(course.id);
      });

      setCourseStructures(structuresMap);
    } catch (err) {
      console.error('Error al cargar estructuras:', err);
    }
  };

  const createDefaultStructure = async (courseId: string, force: boolean = false) => {
    try {
      // Verificar si ya existe estructura (a menos que sea forzado)
      if (!force) {
        const hasStructure = await checkCourseStructure(courseId);
        if (hasStructure) {
          toast.warning('Estructura ya existe', {
            description: 'Este curso ya tiene una estructura. Usa "Gestionar Estructura" para modificarla o "Reiniciar Estructura" para recrearla.',
          });
          return;
        }
      } else {
        // Si es forzado, eliminar TODA la estructura existente primero
        toast.info('Eliminando estructura existente...', {
          description: 'Esto puede tardar unos segundos.',
        });
        
        // Eliminar todos los elementos de estructura del curso (el CASCADE debería manejar hijos automáticamente)
        const { data: existingStructures, error: fetchError } = await supabase
          .from('course_structure')
          .select('id')
          .eq('course_id', courseId);
        
        if (fetchError) {
          console.error('Error al obtener estructura existente:', fetchError);
        }
        
        if (existingStructures && existingStructures.length > 0) {
          console.log(`Eliminando ${existingStructures.length} elementos de estructura existentes...`);
        }
        
        // Eliminar TODOS los elementos del curso (incluyendo hijos por CASCADE)
        const { error: deleteError } = await supabase
          .from('course_structure')
          .delete()
          .eq('course_id', courseId);
        
        if (deleteError) {
          console.error('Error al eliminar estructura existente:', deleteError);
          toast.error('Error al eliminar estructura existente', {
            description: deleteError.message || 'No se pudo eliminar la estructura anterior.',
          });
          return;
        }
        
        console.log(`Estructura eliminada. Elementos eliminados: ${existingStructures?.length || 0}`);
        
        // Esperar un momento para asegurar que la eliminación se completó en la BD
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar múltiples veces que no quede ninguna estructura
        let attempts = 0;
        let stillHasStructure = true;
        while (stillHasStructure && attempts < 3) {
          stillHasStructure = await checkCourseStructure(courseId);
          if (stillHasStructure) {
            attempts++;
            console.log(`Intento ${attempts}: Aún hay estructura, esperando...`);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Intentar eliminar de nuevo
            await supabase
              .from('course_structure')
              .delete()
              .eq('course_id', courseId);
          }
        }
        
        if (stillHasStructure) {
          toast.error('No se pudo eliminar completamente la estructura', {
            description: 'Por favor, elimina manualmente desde "Gestionar Estructura" y luego reinicia.',
          });
          await loadCourseStructures(); // Recargar estado
          return;
        }
        
        console.log('Estructura eliminada completamente. Procediendo a crear nueva...');
      }

      // Verificar una vez más antes de crear (por si acaso)
      const finalCheck = await checkCourseStructure(courseId);
      if (finalCheck) {
        if (!force) {
          toast.warning('Estructura ya existe', {
            description: 'Se detectó una estructura existente. No se creará una duplicada.',
          });
          return;
        } else {
          // Si es forzado pero aún hay estructura, intentar eliminarla de nuevo
          toast.warning('Eliminando estructura duplicada...', {
            description: 'Se detectó estructura residual. Eliminando antes de crear nueva.',
          });
          
          // Eliminar nuevamente de forma más agresiva
          await supabase
            .from('course_structure')
            .delete()
            .eq('course_id', courseId);
          
          // Esperar y verificar de nuevo
          await new Promise(resolve => setTimeout(resolve, 1000));
          const stillExists = await checkCourseStructure(courseId);
          if (stillExists) {
            toast.error('No se pudo eliminar la estructura existente', {
              description: 'Por favor, elimina manualmente desde "Gestionar Estructura" antes de reiniciar.',
            });
            return;
          }
        }
      }

      // Verificación FINAL antes de insertar - verificar que NO haya ninguna estructura
      const finalVerification = await checkCourseStructure(courseId);
      if (finalVerification) {
        toast.error('Error: Aún hay estructura existente', {
          description: 'No se puede crear estructura porque aún existe estructura en el curso. Por favor, elimina manualmente primero.',
        });
        console.error(`ERROR: Se detectó estructura duplicada en curso ${courseId} antes de crear`);
        return;
      }

      const defaultStructure = [
        // Nivel raíz - Categorías principales
        { name: 'Sílabo', structure_type: 'category', parent_id: null, order_index: 1 },
        { name: 'Formato de Evaluación del Curso (Excel de notas)', structure_type: 'category', parent_id: null, order_index: 2 },
        { name: 'Material Extra', structure_type: 'category', parent_id: null, order_index: 3 },
        { name: 'Evaluaciones Pasados', structure_type: 'category', parent_id: null, order_index: 4 },
        { name: 'Temas (Puede ver todo el material que el docente subió)', structure_type: 'category', parent_id: null, order_index: 5 },
      ];

      // Insertar categorías principales con verificación de duplicados
      const { data: categories, error: categoriesError } = await supabase
        .from('course_structure')
        .insert(
          defaultStructure.map(item => ({
            course_id: courseId,
            ...item,
          }))
        )
        .select();

      if (categoriesError) {
        // Si hay error de duplicado, verificar y limpiar
        if (categoriesError.message?.includes('duplicate') || categoriesError.message?.includes('unique')) {
          toast.error('Error: Se detectó estructura duplicada', {
            description: 'Parece que ya existe una estructura. Por favor, elimina manualmente desde "Gestionar Estructura" y vuelve a intentar.',
          });
          return;
        }
        throw categoriesError;
      }

      // Encontrar los IDs de las categorías creadas
      const materialExtra = categories?.find(c => c.name === 'Material Extra');
      const evaluaciones = categories?.find(c => c.name === 'Evaluaciones Pasados');
      const temas = categories?.find(c => c.name === 'Temas (Puede ver todo el material que el docente subió)');

      // Subcategorías de Material Extra
      if (materialExtra) {
        const materialExtraSubs = [
          { name: 'Artículos', structure_type: 'subcategory', parent_id: materialExtra.id, order_index: 1 },
          { name: 'Libros', structure_type: 'subcategory', parent_id: materialExtra.id, order_index: 2 },
          { name: 'Proyectos', structure_type: 'subcategory', parent_id: materialExtra.id, order_index: 3 },
        ];

        await supabase
          .from('course_structure')
          .insert(
            materialExtraSubs.map(item => ({
              course_id: courseId,
              ...item,
            }))
          );
      }

      // Subcategorías de Evaluaciones Pasados
      if (evaluaciones) {
        const evaluacionesSubs = [
          { name: 'Examen Parcial', structure_type: 'subcategory', parent_id: evaluaciones.id, order_index: 1 },
          { name: 'Práctica 1', structure_type: 'subcategory', parent_id: evaluaciones.id, order_index: 2 },
          { name: 'Práctica 2', structure_type: 'subcategory', parent_id: evaluaciones.id, order_index: 3 },
          { name: 'Práctica 3', structure_type: 'subcategory', parent_id: evaluaciones.id, order_index: 4 },
          { name: 'Examen Final', structure_type: 'subcategory', parent_id: evaluaciones.id, order_index: 5 },
        ];

        await supabase
          .from('course_structure')
          .insert(
            evaluacionesSubs.map(item => ({
              course_id: courseId,
              ...item,
            }))
          );
      }

      // Temas (Tema 1 hasta Tema 16, cada uno con sus subcategorías)
      if (temas) {
        // Subcategorías estándar que se repetirán en cada tema
        const subcategoriasEstandar = [
          { name: 'PPTs', order_index: 1 },
          { name: 'Indicaciones de Trabajo en Equipo', order_index: 2 },
          { name: 'Preguntas y Respuestas Usuales', order_index: 3 },
          { name: 'Notas de clase (Apunte)', order_index: 4 },
          { name: 'Lista de temas a reforzar (Indicadores: 80% falló en el tema de modelo SECI)', order_index: 5 },
          { name: 'Propuestas de mejora (lecciones aprendidas)', order_index: 6 },
          { name: 'Casos de estudio', order_index: 7 },
        ];

        // Crear Temas 1 al 16
        for (let i = 1; i <= 16; i++) {
          const { data: tema, error: temaError } = await supabase
            .from('course_structure')
            .insert({
              course_id: courseId,
              name: `Tema ${i}`,
              structure_type: 'topic',
              parent_id: temas.id,
              order_index: i,
            })
            .select()
            .single();

          if (!temaError && tema) {
            // Crear las subcategorías para este tema
            await supabase
              .from('course_structure')
              .insert(
                subcategoriasEstandar.map(sub => ({
                  course_id: courseId,
                  name: sub.name,
                  structure_type: 'subcategory',
                  parent_id: tema.id,
                  order_index: sub.order_index,
                }))
              );
          }
        }
      }

      // Actualizar el estado de estructuras
      setCourseStructures(prev => ({ ...prev, [courseId]: true }));

      toast.success('Estructura creada', {
        description: 'Se ha creado la estructura estándar del curso.',
      });
    } catch (err: any) {
      console.error('Error al crear estructura:', err);
      toast.error('Error al crear estructura', {
        description: err.message || 'No se pudo crear la estructura estándar.',
      });
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      loadCourseStructures();
    }
  }, [courses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('code');

      if (error) throw error;
      setCourses(data || []);
    } catch (err: any) {
      console.error('Error al cargar cursos:', err);
      toast.error('Error al cargar los cursos', {
        description: err.message || 'No se pudieron cargar los cursos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa el código y nombre del curso.',
      });
      return;
    }

    try {
      const courseData: any = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        current_syllabus_url: formData.current_syllabus_url.trim() || null,
        coordinator_id: COORDINATOR_ID, // Asignar el coordinador actual
      };

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);

        if (error) throw error;
        toast.success('Curso actualizado', {
          description: 'El curso se ha actualizado correctamente.',
        });
      } else {
        const { error } = await supabase
          .from('courses')
          .insert(courseData);

        if (error) throw error;
        
        toast.success('Curso creado', {
          description: 'El curso se ha creado exitosamente. Recuerda crear la estructura estándar desde el botón correspondiente.',
        });
      }

      setShowForm(false);
      setEditingCourse(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        current_syllabus_url: '',
      });
      await loadCourses();
    } catch (err: any) {
      console.error('Error al guardar curso:', err);
      toast.error('Error al guardar el curso', {
        description: err.message || 'No se pudo guardar el curso. Intenta nuevamente.',
      });
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      description: course.description || '',
      current_syllabus_url: course.current_syllabus_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const course = courses.find(c => c.id === id);
    const courseName = course ? `${course.code} - ${course.name}` : 'este curso';
    
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', id);

          if (error) throw error;
          await loadCourses();
          resolve(true);
        } catch (err: any) {
          console.error('Error al eliminar curso:', err);
          reject(err);
        }
      }),
      {
        loading: 'Eliminando curso...',
        success: () => {
          return `"${courseName}" ha sido eliminado correctamente.`;
        },
        error: (err: any) => {
          return `Error al eliminar: ${err.message || 'No se pudo eliminar el curso.'}`;
        },
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
        <div className="container mx-auto">
          <p className="text-center text-gray-600 dark:text-gray-400">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Gestión de Cursos</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Crea y gestiona los cursos de la plataforma
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingCourse(null);
                setFormData({
                  code: '',
                  name: '',
                  description: '',
                  current_syllabus_url: '',
                });
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Curso
            </Button>
          </div>
        </div>

        {/* Lista de cursos */}
        {courses.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-700 dark:text-gray-300">No hay cursos</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">
                  Comienza creando tu primer curso
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{course.name}</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Código: {course.code}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(course)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {course.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <span>
                      Creado: {new Date(course.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    {courseStructures[course.id] ? (
                      <>
                        <Link href={`/dashboard/coordinator/structure?courseId=${course.id}`}>
                          <Button variant="default" size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            Gestionar Estructura
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCourseToReset(course.id);
                            setShowResetDialog(true);
                          }}
                          className="w-full text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-500"
                        >
                          Reiniciar Estructura
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => createDefaultStructure(course.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Crear Estructura Estándar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para crear/editar curso */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {editingCourse
                  ? 'Modifica la información del curso'
                  : 'Completa los datos para crear un nuevo curso'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {/* Código del curso */}
                <div className="space-y-2">
                  <Label htmlFor="code">Código del Curso *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="Ej: CS101, MAT201"
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Código único del curso (se convertirá a mayúsculas)
                  </p>
                </div>

                {/* Nombre del curso */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Curso *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Programación I, Cálculo Diferencial"
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descripción del curso..."
                    rows={3}
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* URL del sílabo */}
                <div className="space-y-2">
                  <Label htmlFor="current_syllabus_url">URL del Sílabo (Opcional)</Label>
                  <Input
                    id="current_syllabus_url"
                    type="url"
                    value={formData.current_syllabus_url}
                    onChange={(e) =>
                      setFormData({ ...formData, current_syllabus_url: e.target.value })
                    }
                    placeholder="https://..."
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Enlace al sílabo actual del curso
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCourse(null);
                  }}
                  className="border-gray-300 dark:border-gray-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingCourse ? 'Actualizar' : 'Crear'} Curso
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para confirmar reinicio de estructura */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>¿Reiniciar Estructura?</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Esta acción eliminará toda la estructura actual del curso y creará una nueva estructura estándar.
                <br /><br />
                <strong>Importante:</strong> Los recursos asociados no se eliminarán, pero deberás reasignarlos a las nuevas categorías.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResetDialog(false);
                  setCourseToReset(null);
                }}
                className="border-gray-300 dark:border-gray-700"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (courseToReset) {
                    await createDefaultStructure(courseToReset, true);
                    setShowResetDialog(false);
                    setCourseToReset(null);
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Reiniciar Estructura
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

