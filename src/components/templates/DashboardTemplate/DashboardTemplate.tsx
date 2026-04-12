import type { ReactNode } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar/Sidebar';
import { Navbar } from '@/components/organisms/Navbar/Navbar';
import { useUIStore } from '@/store/ui.store';

interface DashboardTemplateProps {
  title: string;
  children: ReactNode;
}

export function DashboardTemplate({ title, children }: DashboardTemplateProps) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen relative">
      <div className="bg-gradient-mesh" />
      <Sidebar />
      <main
        className={`transition-all duration-300 p-4 md:p-6 pb-24 md:pb-6 ${
          sidebarOpen ? 'md:ml-60' : 'md:ml-[72px]'
        }`}
      >
        <Navbar title={title} />
        <div className="page-enter">{children}</div>
      </main>
    </div>
  );
}
