import { AppShellTemplate } from '@/components/templates/AppShellTemplate/AppShellTemplate';
import { WorkshopList } from '@/components/organisms/WorkshopList/WorkshopList';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function WorkshopsPublicPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <AppShellTemplate title="Talleres y Experiencias">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <p className="text-text-secondary text-lg max-w-2xl">
            Aprende sobre el arte del café, cerámica y más en nuestras experiencias guiadas por expertos.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar 
              value={searchTerm} 
              onChange={setSearchTerm} 
              placeholder="Buscar por nombre de taller..." 
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-accent-primary/10 text-accent-primary rounded-2xl border border-accent-primary/20">
            <Sparkles size={18} />
            <span className="text-sm font-medium">Nuevas fechas disponibles</span>
          </div>
        </div>

        <WorkshopList searchTerm={searchTerm} />

        <div className="mt-16 p-8 glass rounded-[2rem] text-center border-dashed border-2 border-text-secondary/20">
          <h3 className="text-xl font-display font-bold text-text-primary mb-2">
            ¿Quieres organizar un evento privado?
          </h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Ofrecemos talleres personalizados para grupos, empresas y celebraciones especiales.
          </p>
          <button className="text-accent-primary font-semibold hover:underline decoration-2 underline-offset-4 transition-all">
            Contáctanos para más información
          </button>
        </div>
      </div>
    </AppShellTemplate>
  );
}
