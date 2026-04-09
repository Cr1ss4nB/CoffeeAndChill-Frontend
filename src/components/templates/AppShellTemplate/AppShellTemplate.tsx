import { Sidebar } from '@/components/organisms/Sidebar/Sidebar';
import { Topbar } from '@/components/organisms/Topbar/Topbar';

interface AppShellTemplateProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShellTemplate({ children, title }: AppShellTemplateProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="bg-gradient-mesh" />
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
