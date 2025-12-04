import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/navigation/header';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GC-FISI - Plataforma de Gestión del Conocimiento Académico',
  description: 'Sistema para centralizar, preservar y transferir el conocimiento académico - FISI UNMSM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}

