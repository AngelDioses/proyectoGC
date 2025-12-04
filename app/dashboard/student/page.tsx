'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Video, Link as LinkIcon, BookOpen, ChevronRight } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  storage_path: string | null;
  url: string | null;
  structure_name: string;
  course_name: string;
}

interface CourseResources {
  course: Course;
  resources: Resource[];
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseResources, setCourseResources] = useState<CourseResources[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar cursos
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, name, code')
        .order('name');

      if (!coursesData) return;

      setCourses(coursesData);

      // Cargar recursos aprobados agrupados por curso
      const { data: resourcesData } = await supabase
        .from('resources_with_details')
        .select('*')
        .eq('status', 'approved')
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (!resourcesData) return;

      // Agrupar recursos por curso
      const grouped: { [key: string]: CourseResources } = {};

      resourcesData.forEach((resource: any) => {
        const courseId = resource.course_id;
        if (!grouped[courseId]) {
          const course = coursesData.find(c => c.id === courseId);
          if (course) {
            grouped[courseId] = {
              course,
              resources: [],
            };
          }
        }
        if (grouped[courseId]) {
          grouped[courseId].resources.push(resource);
        }
      });

      setCourseResources(Object.values(grouped));
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'link':
        return <LinkIcon className="h-5 w-5" />;
      case 'text_content':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mi Biblioteca</h1>
          <p className="text-gray-600 dark:text-gray-400">Recursos aprobados por curso</p>
        </div>

        {courseResources.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-700 dark:text-gray-300">No hay recursos disponibles</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">Los recursos aparecerán aquí una vez que sean aprobados</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {courseResources.map(({ course, resources }) => (
              <div key={course.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{course.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{course.code}</p>
                  </div>
                  <Link href={`/dashboard/student/${course.id}`}>
                    <Button variant="ghost" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      Ver todo <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                {/* Carrusel estilo Netflix */}
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {resources.map((resource) => (
                    <Card
                      key={resource.id}
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all min-w-[280px] flex-shrink-0 cursor-pointer group"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          {getResourceIcon(resource.resource_type)}
                          <span className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                            {resource.resource_type}
                          </span>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {resource.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {resource.description || 'Sin descripción'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                          {resource.structure_name}
                        </p>
                        <Link href={`/dashboard/resources/${resource.id}`} className="w-full">
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
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

