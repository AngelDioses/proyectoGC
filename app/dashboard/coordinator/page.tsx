'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock, FileText, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  uploader_name: string | null;
  course_name: string;
  structure_name: string;
  created_at: string;
}

export default function CoordinatorDashboard() {
  const router = useRouter();
  const [pendingResources, setPendingResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadPendingResources();
  }, []);

  const loadPendingResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources_with_details')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingResources(data || []);
    } catch (err: any) {
      console.error('Error al cargar recursos pendientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (resourceId: string) => {
    try {
      // Obtener el coordinador específico (temporal - en producción usar auth)
      // UUID del coordinador: bc0dd9a2-1427-40da-8bb5-de88e70f3a7e
      const { data: coordinator } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', 'bc0dd9a2-1427-40da-8bb5-de88e70f3a7e')
        .eq('role', 'coordinator')
        .single();
      
      let reviewerId: string | null;
      
      if (coordinator) {
        reviewerId = coordinator.id;
      } else {
        // Fallback: buscar cualquier coordinador
        const { data: coordinators } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'coordinator')
          .limit(1);
        
        reviewerId = coordinators && coordinators.length > 0 
          ? coordinators[0].id 
          : 'bc0dd9a2-1427-40da-8bb5-de88e70f3a7e'; // UUID por defecto
      }
      
      const { error } = await supabase
        .from('resources')
        .update({
          status: 'approved',
          is_visible: true,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', resourceId);

      if (error) throw error;
      toast.success('Recurso aprobado', {
        description: 'El recurso ha sido aprobado y ahora es visible para los estudiantes.',
      });
      await loadPendingResources();
    } catch (err: any) {
      console.error('Error al aprobar recurso:', err);
      toast.error('Error al aprobar el recurso', {
        description: err.message || 'No se pudo aprobar el recurso. Intenta nuevamente.',
      });
    }
  };

  const handleReject = async () => {
    if (!reviewingId) return;

    try {
      // Obtener el coordinador específico (temporal - en producción usar auth)
      // UUID del coordinador: bc0dd9a2-1427-40da-8bb5-de88e70f3a7e
      const { data: coordinator } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', 'bc0dd9a2-1427-40da-8bb5-de88e70f3a7e')
        .eq('role', 'coordinator')
        .single();
      
      let reviewerId: string | null;
      
      if (coordinator) {
        reviewerId = coordinator.id;
      } else {
        // Fallback: buscar cualquier coordinador
        const { data: coordinators } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'coordinator')
          .limit(1);
        
        reviewerId = coordinators && coordinators.length > 0 
          ? coordinators[0].id 
          : 'bc0dd9a2-1427-40da-8bb5-de88e70f3a7e'; // UUID por defecto
      }
      
      const { error } = await supabase
        .from('resources')
        .update({
          status: 'rejected',
          is_visible: false,
          rejection_reason: rejectionReason,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reviewingId);

      if (error) throw error;
      toast.success('Recurso rechazado', {
        description: 'El recurso ha sido rechazado y no será visible para los estudiantes.',
      });
      setShowRejectDialog(false);
      setRejectionReason('');
      setReviewingId(null);
      await loadPendingResources();
    } catch (err: any) {
      console.error('Error al rechazar recurso:', err);
      toast.error('Error al rechazar el recurso', {
        description: err.message || 'No se pudo rechazar el recurso. Intenta nuevamente.',
      });
    }
  };

  const openRejectDialog = (resourceId: string) => {
    setReviewingId(resourceId);
    setShowRejectDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
        <div className="container mx-auto">
          <p className="text-center text-gray-600 dark:text-gray-400">Cargando bandeja de entrada...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Bandeja de Entrada</h1>
              <p className="text-gray-600 dark:text-gray-400">Revisa y aprueba los recursos pendientes</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push('/dashboard/coordinator/resources')}
                variant="outline"
                className="border-gray-300 dark:border-gray-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Recursos Aprobados
              </Button>
              <Button
                onClick={() => router.push('/dashboard/coordinator/courses')}
                variant="outline"
                className="border-gray-300 dark:border-gray-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Gestionar Cursos
              </Button>
              <Button
                onClick={() => router.push('/dashboard/coordinator/structure')}
                variant="outline"
                className="border-gray-300 dark:border-gray-700"
              >
                Gestionar Estructura
              </Button>
            </div>
          </div>
        </div>

        {pendingResources.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-xl text-gray-700 dark:text-gray-300">No hay recursos pendientes</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">Todos los recursos han sido revisados</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingResources.map((resource) => (
              <Card key={resource.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <CardTitle className="text-xl">{resource.title}</CardTitle>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs rounded-full">
                          {resource.resource_type}
                        </span>
                      </div>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {resource.description || 'Sin descripción'}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {resource.course_name}
                        </span>
                        <span>{resource.structure_name}</span>
                        <span>Subido por: {resource.uploader_name || 'Desconocido'}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/resources/${resource.id}`}>
                      <Button
                        variant="outline"
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleApprove(resource.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Aprobar
                    </Button>
                    <Button
                      onClick={() => openRejectDialog(resource.id)}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para rechazar */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>Rechazar Recurso</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Por favor, indica el motivo del rechazo. Este mensaje será visible para el docente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="reason">Motivo del rechazo *</Label>
                <Textarea
                  id="reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ej: El contenido no cumple con los estándares del curso..."
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white mt-2"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
                className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                variant="destructive"
              >
                Rechazar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

