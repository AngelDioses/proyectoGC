'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Link as LinkIcon, Video, Type, X } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  code: string;
  name: string;
}

interface CourseStructure {
  id: string;
  name: string;
  parent_id: string | null;
  structure_type: string;
  order_index: number;
  children?: CourseStructure[];
}

export default function TeacherUploadPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseStructures, setCourseStructures] = useState<CourseStructure[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    course_id: '',
    structure_id: '',
    title: '',
    description: '',
    resource_type: 'file' as 'file' | 'link' | 'text_content' | 'video',
    file: null as File | null,
    url: '',
    content: '',
    tags: '',
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (formData.course_id) {
      loadCourseStructures(formData.course_id);
    } else {
      setCourseStructures([]);
      setFormData(prev => ({ ...prev, structure_id: '' }));
    }
  }, [formData.course_id]);

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
        description: err.message || 'No se pudieron cargar los cursos.',
      });
    }
  };

  const loadCourseStructures = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_structure')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      
      // Organizar en árbol jerárquico
      const structures = data || [];
      const tree = buildTree(structures);
      setCourseStructures(tree);
    } catch (err: any) {
      console.error('Error al cargar estructura del curso:', err);
      toast.error('Error al cargar la estructura', {
        description: err.message || 'No se pudo cargar la estructura del curso.',
      });
    }
  };

  const buildTree = (items: CourseStructure[]): CourseStructure[] => {
    const map = new Map<string, CourseStructure>();
    const roots: CourseStructure[] = [];

    // Crear mapa de todos los items
    items.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    // Construir árbol
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

    // Ordenar por order_index
    const sortByOrder = (nodes: CourseStructure[]) => {
      nodes.sort((a, b) => a.order_index - b.order_index);
      nodes.forEach(node => {
        if (node.children) {
          sortByOrder(node.children);
        }
      });
    };

    sortByOrder(roots);
    return roots;
  };

  const renderStructureOptions = (structures: CourseStructure[], level = 0): JSX.Element[] => {
    const options: JSX.Element[] = [];
    
    structures.forEach(structure => {
      const indent = '  '.repeat(level);
      options.push(
        <option key={structure.id} value={structure.id}>
          {indent}{structure.name}
        </option>
      );
      
      if (structure.children && structure.children.length > 0) {
        options.push(...renderStructureOptions(structure.children, level + 1));
      }
    });
    
    return options;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Archivo demasiado grande', {
          description: 'El archivo excede el tamaño máximo de 50MB.',
        });
        return;
      }
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.course_id || !formData.structure_id || !formData.title) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa todos los campos obligatorios.',
      });
      return;
    }

    // Validar según tipo de recurso
    if (formData.resource_type === 'file' && !formData.file) {
      toast.error('Archivo requerido', {
        description: 'Por favor selecciona un archivo para subir.',
      });
      return;
    }
    if (formData.resource_type === 'link' && !formData.url.trim()) {
      toast.error('URL requerida', {
        description: 'Por favor ingresa una URL válida.',
      });
      return;
    }
    if (formData.resource_type === 'text_content' && !formData.content.trim()) {
      toast.error('Contenido requerido', {
        description: 'Por favor ingresa el contenido del recurso.',
      });
      return;
    }

    setUploading(true);

    try {
      // Obtener el docente específico (temporal - en producción usar auth real)
      // UUID del docente: b2b7f884-16fb-4023-a0f3-d2bc27215d19
      const { data: teacher, error: teacherError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', 'b2b7f884-16fb-4023-a0f3-d2bc27215d19')
        .eq('role', 'teacher')
        .single();
      
      let uploaderId: string;
      
      if (teacherError || !teacher) {
        // Fallback: buscar cualquier docente
        const { data: teachers } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'teacher')
          .limit(1);
        
        if (teachers && teachers.length > 0) {
          uploaderId = teachers[0].id;
        } else {
          // Último recurso: usar el UUID específico directamente
          console.warn('Usando UUID de docente por defecto');
          uploaderId = 'b2b7f884-16fb-4023-a0f3-d2bc27215d19';
        }
      } else {
        uploaderId = teacher.id;
      }

      let storagePath: string | null = null;

      // Si es archivo, subirlo a Storage
      if (formData.resource_type === 'file' && formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `resources/${uploaderId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(filePath, formData.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('resources')
          .getPublicUrl(filePath);

        storagePath = urlData.publicUrl;
      }

      // Preparar tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Insertar recurso
      const resourceData: any = {
        course_id: formData.course_id,
        structure_id: formData.structure_id,
        uploader_id: uploaderId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        resource_type: formData.resource_type,
        status: 'pending',
        is_visible: true,
        tags: tagsArray,
      };

      // Agregar campos según tipo
      if (formData.resource_type === 'file') {
        resourceData.storage_path = storagePath;
      } else if (formData.resource_type === 'link') {
        resourceData.url = formData.url.trim();
      } else if (formData.resource_type === 'text_content') {
        resourceData.content = formData.content.trim();
      }

      const { error: insertError } = await supabase
        .from('resources')
        .insert(resourceData);

      if (insertError) throw insertError;

      toast.success('Recurso subido exitosamente', {
        description: 'El recurso está pendiente de aprobación por el coordinador.',
      });
      
      // Esperar un momento antes de redirigir para que el usuario vea el mensaje
      setTimeout(() => {
        router.push('/dashboard/teacher');
      }, 1500);
    } catch (err: any) {
      console.error('Error al subir recurso:', err);
      toast.error('Error al subir el recurso', {
        description: err.message || 'No se pudo subir el recurso. Intenta nuevamente.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            ← Volver
          </Button>
          <h1 className="text-4xl font-bold mb-2">Subir Nuevo Recurso</h1>
          <p className="text-gray-600 dark:text-gray-400">Completa el formulario para subir un recurso al curso</p>
        </div>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Información del Recurso</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              El recurso quedará pendiente hasta que el coordinador lo apruebe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Curso */}
              <div className="space-y-2">
                <Label htmlFor="course_id">Curso *</Label>
                <select
                  id="course_id"
                  value={formData.course_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, course_id: e.target.value, structure_id: '' }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona un curso</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estructura del curso */}
              <div className="space-y-2">
                <Label htmlFor="structure_id">Categoría/Tema *</Label>
                <select
                  id="structure_id"
                  value={formData.structure_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, structure_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.course_id || courseStructures.length === 0}
                >
                  <option value="">
                    {!formData.course_id 
                      ? 'Primero selecciona un curso'
                      : courseStructures.length === 0
                      ? 'Cargando estructura...'
                      : 'Selecciona una categoría'}
                  </option>
                  {renderStructureOptions(courseStructures)}
                </select>
                {courseStructures.length === 0 && formData.course_id && (
                  <p className="text-sm text-yellow-500">
                    Este curso aún no tiene estructura definida. Contacta al coordinador.
                  </p>
                )}
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Presentación Semana 1 - Introducción"
                  required
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del recurso..."
                  rows={3}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Tipo de recurso */}
              <div className="space-y-2">
                <Label htmlFor="resource_type">Tipo de Recurso *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'file', label: 'Archivo', icon: FileText },
                    { value: 'link', label: 'Enlace', icon: LinkIcon },
                    { value: 'text_content', label: 'Texto', icon: Type },
                    { value: 'video', label: 'Video', icon: Video },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, resource_type: value as any, file: null, url: '', content: '' }))}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.resource_type === value
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Icon className="h-6 w-6 mx-auto mb-2" />
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campos dinámicos según tipo */}
              {formData.resource_type === 'file' && (
                <div className="space-y-2">
                  <Label htmlFor="file">Archivo *</Label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                    {formData.file ? (
                      <div className="space-y-2">
                        <FileText className="h-12 w-12 mx-auto text-blue-400" />
                        <p className="text-sm">{formData.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                          className="mt-2"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                        <p className="text-sm text-gray-400 mb-2">
                          Haz clic para seleccionar un archivo
                        </p>
                        <p className="text-xs text-gray-500">Máximo 50MB</p>
                        <input
                          type="file"
                          id="file"
                          onChange={handleFileChange}
                          className="hidden"
                          required={formData.resource_type === 'file'}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {formData.resource_type === 'link' && (
                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                    required
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {formData.resource_type === 'text_content' && (
                <div className="space-y-2">
                  <Label htmlFor="content">Contenido *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Escribe el contenido aquí..."
                    rows={8}
                    required
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono"
                  />
                </div>
              )}

              {formData.resource_type === 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="url">URL del Video *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://youtube.com/... o https://..."
                    required
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500">
                    Puedes usar enlaces de YouTube, Vimeo u otros servicios de video
                  </p>
                </div>
              )}

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Etiquetas (opcional)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Ej: introducción, fundamentos, práctica"
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500">
                  Separa las etiquetas con comas
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  {uploading ? 'Subiendo...' : 'Subir Recurso'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-gray-700"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

