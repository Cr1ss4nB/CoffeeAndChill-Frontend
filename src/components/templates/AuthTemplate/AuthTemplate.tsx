import type { ReactNode } from 'react';

export function AuthTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="bg-gradient-mesh" />
      {children}
    </div>
  );
}
