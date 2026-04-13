import type { ReactNode } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar/Sidebar';
import { Navbar } from '@/components/organisms/Navbar/Navbar';

interface DashboardTemplateProps {
  title: string;
  children: ReactNode;
}

export function DashboardTemplate({ title, children }: DashboardTemplateProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="bg-gradient-mesh" />
      {/* Sidebar ocupa su propio ancho; el main toma el resto con flex-1 */}
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
        <Navbar title={title} />
        <div className="page-enter">{children}</div>
      </main>
    </div>
  );
}
