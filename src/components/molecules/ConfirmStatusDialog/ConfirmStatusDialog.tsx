import { ToggleLeft, ToggleRight } from 'lucide-react';

interface Props {
  readonly open: boolean;
  readonly itemName: string;
  readonly itemLabel: string;
  readonly activating: boolean;
  readonly loading: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function ConfirmStatusDialog({ open, itemName, itemLabel, activating, loading, onConfirm, onCancel }: Props) {
  if (!open) return null;
  const confirmLabel = activating ? 'Activar' : 'Desactivar';

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[3px]"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="glass rounded-3xl p-6 w-full max-w-sm shadow-2xl pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4 mb-5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                activating ? 'bg-sage/30' : 'bg-red-100/60'
              }`}
            >
              {activating ? (
                <ToggleRight size={20} className="text-green-600" />
              ) : (
                <ToggleLeft size={20} className="text-red-500" />
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-text-primary text-base leading-snug">
                {activating ? `Activar ${itemLabel}` : `Desactivar ${itemLabel}`}
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                <span className="font-medium text-text-primary">{itemName}</span>{' '}
                {activating
                  ? 'volverá a aparecer en el menú y estará disponible.'
                  : 'dejará de estar disponible en el menú público.'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary bg-white/40 hover:bg-white/60 border border-white/30 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 ${
                activating
                  ? 'bg-sage/60 hover:bg-sage/80 text-green-800'
                  : 'bg-red-100/60 hover:bg-red-200/70 text-red-700'
              }`}
            >
              {loading ? 'Guardando…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
