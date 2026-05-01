import React from 'react';

interface PowerBIVisualProps {
  embedUrl: string;
  title?: string;
}

export const PowerBIVisual: React.FC<PowerBIVisualProps> = ({ embedUrl, title = 'Power BI Dashboard' }) => {
  if (!embedUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass rounded-3xl border-2 border-dashed border-text-secondary/20">
        <div className="w-16 h-16 mb-4 bg-lavender/30 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-display font-bold text-text-primary mb-2">Sin Dashboard Configurado</h3>
        <p className="text-text-secondary text-center max-w-md">
          Para visualizar un tablero de Power BI, por favor configura la URL de inserción en los ajustes del sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] glass rounded-3xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-lavender/5 to-sky/5 pointer-events-none" />
      <iframe
        title={title}
        src={embedUrl}
        className="w-full h-full min-h-[600px] border-none"
        allowFullScreen={true}
      />
    </div>
  );
};
