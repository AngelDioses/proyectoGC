'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  status: string;
  course_name: string;
  structure_name: string;
  rejection_reason: string | null;
  created_at: string;
}

export default function TeacherDashboard() {
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [approvedResources, setApprovedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      // Obtener ID del usuario actual (simulado - en producción usar auth)
      // Por ahora cargamos todos los recursos del docente
      const { data: resourcesData } = await supabase
        .from('resources_with_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (!resourcesData) return;

      // Separar por estado
      const myPending = resourcesData.filter((r: any) => r.status === 'pending');
      const myApproved = resourcesData.filter((r: any) => r.status === 'approved');

      setMyResources(myPending);
      setApprovedResources(myApproved);
    } catch (err: any) {
      console.error('Error al cargar recursos:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
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
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Docente</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona tus recursos subidos</p>
        </div>

        <div className="mb-6">
          <Link href="/dashboard/teacher/upload">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              Subir Nuevo Recurso
            </Button>
          </Link>
        </div>

        {/* Recursos Pendientes */}
        {myResources.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Recursos Pendientes</h2>
            <div className="space-y-4">
              {myResources.map((resource) => (
                <Card key={resource.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(resource.status)}
                        <CardTitle>{resource.title}</CardTitle>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{resource.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-500">
                      <span>{resource.course_name}</span>
                      <span>{resource.structure_name}</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recursos Aprobados */}
        {approvedResources.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Recursos Aprobados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedResources.map((resource) => (
                <Card key={resource.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(resource.status)}
                      <span className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                        {resource.resource_type}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {resource.description || 'Sin descripción'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {resource.course_name} • {resource.structure_name}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {myResources.length === 0 && approvedResources.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-700 dark:text-gray-300">No hay recursos</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">Comienza subiendo tu primer recurso</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

