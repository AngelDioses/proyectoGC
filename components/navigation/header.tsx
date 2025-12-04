'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-gray-900/75 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            GC-FISI
          </Link>
          <nav className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Link href="/dashboard/coordinator">
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Coordinador</Button>
              </Link>
              <Link href="/dashboard/teacher">
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Docente</Button>
              </Link>
              <Link href="/dashboard/student">
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Estudiante</Button>
              </Link>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
