'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const [loading, setLoading] = useState(false);

  // No hacer ninguna llamada a Supabase en la página principal
  // El header ya maneja la autenticación
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Plataforma de Gestión del Conocimiento
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            FISI - UNMSM
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sistema para centralizar, preservar y transferir el conocimiento académico entre semestres
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Estudiantes</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Accede a recursos aprobados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                <li>• Ver recursos aprobados por curso</li>
                <li>• Explorar material por estructura jerárquica</li>
                <li>• Material organizado por temas y categorías</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Docentes</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Sube material inicial del curso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                <li>• Subir recursos del curso</li>
                <li>• Ver estado de tus recursos</li>
                <li>• Material pendiente de aprobación</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Coordinador Académico</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Gestiona y valida recursos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                <li>• Revisar recursos pendientes</li>
                <li>• Aprobar o rechazar recursos</li>
                <li>• Gestionar estructura de cursos</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Accede a tu panel
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard/coordinator">
              <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">Coordinador Académico</Button>
            </Link>
            <Link href="/dashboard/teacher">
              <Button variant="outline" className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">Docente</Button>
            </Link>
            <Link href="/dashboard/student">
              <Button variant="outline" className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">Estudiante</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
