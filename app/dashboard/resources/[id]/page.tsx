'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, ExternalLink, FileText, Video, Link as LinkIcon, Calendar, User, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  storage_path: string | null;
  url: string | null;
  content: string | null;
  tags: string[];
  status: string;
  created_at: string;
  course_name: string;
  course_code: string;
  structure_name: string;
  uploader_name: string | null;
  rejection_reason: string | null;
}

export default function ResourceViewPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;
  const supabase = createClient();

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'video' | 'text' | 'link' | null>(null);

  useEffect(() => {
    if (resourceId) {
      loadResource();
    }
  }, [resourceId]);

  useEffect(() => {
    if (resource) {
      determinePreviewType();
    }
  }, [resource]);

  const loadResource = async () => {
    try {
      const { data, error } = await supabase
        .from('resources_with_details')
        .select('*')
        .eq('id', resourceId)
        .single();

      if (error) throw error;
      setResource(data);
    } catch (err: any) {
      console.error('Error al cargar recurso:', err);
      toast.error('Error al cargar el recurso', {
        description: err.message || 'No se pudo cargar la información del recurso.',
      });
      setTimeout(() => router.back(), 2000);
    } finally {
      setLoading(false);
    }
  };

  const determinePreviewType = () => {
    if (!resource) return;

    if (resource.resource_type === 'video' || resource.url) {
      setPreviewType('video');
      setPreviewUrl(resource.url || resource.storage_path);
    } else if (resource.resource_type === 'text_content' || resource.content) {
      setPreviewType('text');
      setPreviewUrl(null);
    } else if (resource.resource_type === 'link') {
      setPreviewType('link');
      setPreviewUrl(resource.url);
    } else if (resource.storage_path) {
      const url = resource.storage_path;
      const extension = url.split('.').pop()?.toLowerCase();

      if (extension === 'pdf') {
        setPreviewType('pdf');
        setPreviewUrl(url);
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
        setPreviewType('image');
        setPreviewUrl(url);
      } else if (['mp4', 'webm', 'ogg'].includes(extension || '')) {
        setPreviewType('video');
        setPreviewUrl(url);
      } else {
        setPreviewType(null);
        setPreviewUrl(null);
      }
    }
  };

  const handleDownload = () => {
    if (!resource?.storage_path) return;

    // Crear un enlace temporal para descargar
    const link = document.createElement('a');
    link.href = resource.storage_path;
    link.download = resource.title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'link':
        return <LinkIcon className="h-6 w-6" />;
      case 'text_content':
        return <FileText className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
        <div className="container mx-auto">
          <p className="text-center text-gray-600 dark:text-gray-400">Cargando recurso...</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
        <div className="container mx-auto">
          <p className="text-center text-gray-600 dark:text-gray-400">Recurso no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getResourceIcon(resource.resource_type)}
                <h1 className="text-4xl font-bold">{resource.title}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  resource.status === 'approved' 
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                    : resource.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                    : 'bg-red-500/20 text-red-600 dark:text-red-400'
                }`}>
                  {resource.status === 'approved' ? 'Aprobado' : resource.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">{resource.description || 'Sin descripción'}</p>
            </div>
            
            {resource.storage_path && (
              <Button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            )}
          </div>
        </div>

        {/* Información del recurso */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle>Información del Recurso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Curso</p>
                  <p className="font-semibold">{resource.course_code} - {resource.course_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Categoría</p>
                  <p className="font-semibold">{resource.structure_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Subido por</p>
                  <p className="font-semibold">{resource.uploader_name || 'Desconocido'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de subida</p>
                  <p className="font-semibold">{formatDate(resource.created_at)}</p>
                </div>
              </div>
            </div>

            {resource.tags && resource.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Etiquetas</p>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resource.rejection_reason && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-2">Motivo de rechazo</p>
                <p className="text-gray-700 dark:text-gray-300">{resource.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Previsualización */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Previsualización</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {previewType === 'pdf' && 'Documento PDF'}
              {previewType === 'image' && 'Imagen'}
              {previewType === 'video' && 'Video'}
              {previewType === 'text' && 'Contenido de texto'}
              {previewType === 'link' && 'Enlace externo'}
              {!previewType && 'No hay previsualización disponible'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {previewType === 'pdf' && previewUrl && (
              <div className="w-full" style={{ height: '800px' }}>
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0 rounded-lg"
                  title="PDF Preview"
                />
              </div>
            )}

            {previewType === 'image' && previewUrl && (
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt={resource.title}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            )}

            {previewType === 'video' && previewUrl && (
              <div className="w-full">
                <video
                  src={previewUrl}
                  controls
                  className="w-full rounded-lg"
                  style={{ maxHeight: '600px' }}
                >
                  Tu navegador no soporta la reproducción de video.
                </video>
              </div>
            )}

            {previewType === 'text' && resource.content && (
              <div className="bg-gray-900 p-6 rounded-lg">
                <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm">
                  {resource.content}
                </pre>
              </div>
            )}

            {previewType === 'link' && previewUrl && (
              <div className="text-center py-8">
                <ExternalLink className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Este recurso es un enlace externo</p>
                <Button
                  onClick={() => window.open(previewUrl, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Enlace
                </Button>
              </div>
            )}

            {!previewType && resource.storage_path && (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  Este tipo de archivo no se puede previsualizar
                </p>
                <Button
                  onClick={handleDownload}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Archivo
                </Button>
              </div>
            )}

            {!resource.storage_path && !resource.url && !resource.content && (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No hay contenido disponible para este recurso</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

