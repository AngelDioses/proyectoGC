'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TestConnectionPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const test = async () => {
      const testResults: any = {
        envVars: {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
            process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 'NO CONFIGURADO',
          urlValid: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') || false,
        },
        clientCreation: null,
        directFetch: null,
        authTest: null,
        dbTest: null,
      };

      try {
        // Test 1: Crear cliente
        try {
          const client = createClient();
          testResults.clientCreation = 'OK';
          
          // Test 2: Fetch directo a la URL de Supabase
          try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const startTime = Date.now();
            const response = await fetch(`${url}/rest/v1/`, {
              method: 'GET',
              headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
              },
            });
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            if (response.ok || response.status === 404) {
              testResults.directFetch = `OK (${duration}ms)`;
            } else {
              testResults.directFetch = `Error: ${response.status} ${response.statusText}`;
            }
          } catch (fetchErr: any) {
            testResults.directFetch = `Error: ${fetchErr.message}`;
          }

          // Test 3: Auth con timeout más largo
          try {
            const authPromise = client.auth.getSession();
            const authTimeout = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout después de 10 segundos')), 10000)
            );
            const { data: { session } } = await Promise.race([authPromise, authTimeout]) as any;
            testResults.authTest = session ? 'Sesión encontrada' : 'Sin sesión (OK)';
          } catch (err: any) {
            testResults.authTest = `Error: ${err.message}`;
          }

          // Test 4: DB con timeout más largo
          try {
            const dbPromise = client.from('profiles').select('count').limit(1);
            const dbTimeout = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout después de 10 segundos')), 10000)
            );
            const { data, error } = await Promise.race([dbPromise, dbTimeout]) as any;
            if (error) {
              testResults.dbTest = `Error: ${error.message} (${error.code || 'N/A'})`;
            } else {
              testResults.dbTest = 'OK';
            }
          } catch (err: any) {
            testResults.dbTest = `Error: ${err.message}`;
          }
        } catch (err: any) {
          testResults.clientCreation = `Error: ${err.message}`;
        }
      } catch (err: any) {
        testResults.error = err.message;
      }

      setResults(testResults);
      setLoading(false);
    };

    test();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Verificando conexión...</p>
      </div>
    );
  }

  const allOk = results.envVars.url && results.envVars.key && results.envVars.urlValid && 
                results.clientCreation === 'OK' && 
                (results.authTest?.includes('OK') || results.authTest?.includes('Sin sesión')) &&
                results.dbTest === 'OK';

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Verificación de Conexión a Supabase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Variables de Entorno:</h3>
            <ul className="space-y-1 text-sm">
              <li>
                NEXT_PUBLIC_SUPABASE_URL: {results.envVars.url ? (
                  <span className="text-green-600">✓ Configurado</span>
                ) : (
                  <span className="text-red-600">✗ NO CONFIGURADO</span>
                )}
                {results.envVars.url && (
                  <span className="text-xs text-muted-foreground ml-2">({results.envVars.urlValue})</span>
                )}
              </li>
              <li>
                URL válida (https://): {results.envVars.urlValid ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-red-600">✗</span>
                )}
              </li>
              <li>
                NEXT_PUBLIC_SUPABASE_ANON_KEY: {results.envVars.key ? (
                  <span className="text-green-600">✓ Configurado</span>
                ) : (
                  <span className="text-red-600">✗ NO CONFIGURADO</span>
                )}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Cliente Supabase:</h3>
            <p className="text-sm">
              {results.clientCreation === 'OK' ? (
                <span className="text-green-600">✓ {results.clientCreation}</span>
              ) : (
                <span className="text-red-600">✗ {results.clientCreation}</span>
              )}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Test de Fetch Directo:</h3>
            <p className="text-sm">
              {results.directFetch?.includes('OK') ? (
                <span className="text-green-600">✓ {results.directFetch}</span>
              ) : (
                <span className="text-red-600">✗ {results.directFetch}</span>
              )}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Test de Autenticación:</h3>
            <p className="text-sm">
              {results.authTest?.includes('Error') || results.authTest?.includes('Timeout') ? (
                <span className="text-red-600">✗ {results.authTest}</span>
              ) : (
                <span className="text-green-600">✓ {results.authTest}</span>
              )}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Test de Base de Datos:</h3>
            <p className="text-sm">
              {results.dbTest === 'OK' ? (
                <span className="text-green-600">✓ {results.dbTest}</span>
              ) : (
                <span className="text-red-600">✗ {results.dbTest}</span>
              )}
            </p>
          </div>

          {!allOk && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Problemas Detectados:</p>
              
              {results.directFetch?.includes('Error') && (
                <div className="mb-3 p-3 bg-red-50 rounded">
                  <p className="text-sm font-medium text-red-800 mb-1">Problema de Conectividad:</p>
                  <p className="text-xs text-red-700">
                    No se puede conectar directamente a Supabase. Esto puede indicar:
                  </p>
                  <ul className="text-xs text-red-700 list-disc list-inside mt-1 space-y-1">
                    <li>El proyecto de Supabase está pausado (verifica en el dashboard)</li>
                    <li>Problemas de firewall o red bloqueando la conexión</li>
                    <li>La URL de Supabase es incorrecta</li>
                    <li>Problemas temporales con el servidor de Supabase</li>
                  </ul>
                </div>
              )}

              <div className="p-3 bg-white rounded">
                <p className="text-xs font-medium mb-1">Pasos para Solucionar:</p>
                <ol className="text-xs list-decimal list-inside space-y-1">
                  <li>Ve al dashboard de Supabase y verifica que tu proyecto esté <strong>activo</strong> (no pausado)</li>
                  <li>Verifica que la URL en .env.local sea exactamente la que aparece en Settings → API</li>
                  <li>Verifica que la anon key sea exactamente la que aparece en Settings → API</li>
                  <li>Intenta acceder directamente a: <code className="bg-yellow-100 px-1 rounded">{process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/</code> en tu navegador</li>
                  <li>Si el proyecto está pausado, reactívalo desde el dashboard de Supabase</li>
                </ol>
              </div>
            </div>
          )}

          {allOk && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm font-semibold text-green-800">✓ Todo está configurado correctamente</p>
            </div>
          )}

          <div className="mt-4">
            <Link href="/login">
              <Button className="w-full">Volver al Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
