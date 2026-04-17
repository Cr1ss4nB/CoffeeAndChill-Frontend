import { useState } from 'react';
import { X, Calendar, Users, Clock, Check, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Label } from '@/components/atoms/Label/Label';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Divider } from '@/components/atoms/Divider/Divider';
import { formatCOP } from '@/components/molecules/ProductCard/productCard.utils';
import { formatCOP } from '@/utils/formatCOP';
import { useWorkshops, useCreateReservation } from '@/hooks/useWorkshops';
import toast from 'react-hot-toast';
import type { Workshop } from '@/types';

interface WorkshopBookingModalProps {
  workshop: Workshop;
  onClose: () => void;
}

interface FormErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function WorkshopBookingModal({ workshop, onClose }: WorkshopBookingModalProps) {
  const { data: workshops } = useWorkshops();
  const liveWorkshop = workshops?.find((w) => w.id === workshop.id) ?? workshop;
  const spotsLeft = liveWorkshop.totalSpots - liveWorkshop.reservedSpots;

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [asistentes, setAsistentes] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const createReservation = useCreateReservation();

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!email.trim() || !/.+@.+\..+/.test(email)) newErrors.email = 'Ingresa un email válido';
    if (!telefono.trim() || !/^\d{7,15}$/.test(telefono.replace(/\s/g, '')))
      newErrors.telefono = 'Ingresa un teléfono válido (7–15 dígitos)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (asistentes > spotsLeft) {
      toast.error(`Solo quedan ${spotsLeft} cupo(s) disponibles`);
      return;
    }
    createReservation.mutate(
      { workshopId: workshop.id, name: nombre, email, phone: telefono, attendees: asistentes },
      {
        onSuccess: () => setSubmitted(true),
        onError: () => toast.error('Error al crear la reserva. Intenta de nuevo.'),
      }
    );
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" aria-hidden />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'tween', duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative glass w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-white/40 hover:bg-white/60 flex items-center justify-center focus-ring transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} className="text-text-primary" />
          </button>

          {/* Header gradient */}
          <div className="w-full aspect-[4/3] relative flex items-center justify-center bg-gradient-to-br from-lavender/40 to-sage/40 shrink-0">
            {workshop.imageUrl ? (
              <img src={workshop.imageUrl} alt={workshop.name} className="w-full h-full object-cover" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-text-secondary/40"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
            )}
            <Badge className="absolute top-3 left-3 bg-white/70 text-text-secondary text-xs backdrop-blur-sm">
              Taller
            </Badge>
          </div>

          <div className="p-6 flex flex-col flex-1 overflow-y-auto">
            {submitted ? (
              /* Success state */
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage/40 to-sage/20 flex items-center justify-center mb-4">
                  <Check size={32} className="text-green-600" />
                </div>
                <h2 className="font-display text-2xl font-bold text-text-primary mb-1">
                  ¡Reserva confirmada!
                </h2>
                <p className="text-sm text-text-secondary mb-4">{workshop.name}</p>
                <div className="w-full glass-subtle rounded-xl p-4 text-sm text-left space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Calendar size={15} />
                    <span>{formatDate(workshop.date)} a las {workshop.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Users size={15} />
                    <span>{asistentes} asistente{asistentes > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <p className="text-xs text-text-secondary/70 mb-6">
                  Te esperamos con gusto. Llega 10 minutos antes del inicio.
                </p>
                <Button className="w-full" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-text-primary pr-10">
                  {workshop.name}
                </h2>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  {workshop.description}
                </p>

                {/* Info row */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-white/40 px-3 py-1.5 rounded-xl">
                    <Calendar size={13} />
                    <span>{formatDate(workshop.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-white/40 px-3 py-1.5 rounded-xl">
                    <Clock size={13} />
                    <span>{workshop.time}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl ${
                    spotsLeft === 0
                      ? 'bg-red-50/60 text-red-500'
                      : spotsLeft <= 3
                      ? 'bg-amber-50/60 text-amber-600'
                      : 'bg-sage/30 text-green-700'
                  }`}>
                    <Users size={13} />
                    <span>{spotsLeft === 0 ? 'Agotado' : `${spotsLeft} cupo${spotsLeft !== 1 ? 's' : ''} disponible${spotsLeft !== 1 ? 's' : ''}`}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-xl font-semibold text-text-primary">
                    {formatCOP(workshop.price)}
                  </span>
                  <span className="text-xs text-text-secondary">por persona</span>
                </div>

                <Divider />

                {spotsLeft === 0 ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50/60 flex items-center justify-center mx-auto mb-3">
                      <Users size={24} className="text-red-400" />
                    </div>
                    <p className="font-medium text-text-primary">Este taller está agotado</p>
                    <p className="text-sm text-text-secondary mt-1">
                      Consulta nuestros próximos talleres disponibles.
                    </p>
                    <Button variant="ghost" className="mt-4 w-full" onClick={onClose}>
                      Ver otros talleres
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="font-medium text-text-primary text-sm">Datos de reserva</h3>

                    <div>
                      <Label htmlFor="wb-nombre" className="text-xs text-text-secondary mb-1 block">
                        Nombre completo *
                      </Label>
                      <Input
                        id="wb-nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Tu nombre"
                        error={!!errors.nombre}
                      />
                      {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
                    </div>

                    <div>
                      <Label htmlFor="wb-email" className="text-xs text-text-secondary mb-1 block">
                        Correo electrónico *
                      </Label>
                      <Input
                        id="wb-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        error={!!errors.email}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="wb-tel" className="text-xs text-text-secondary mb-1 block">
                        Teléfono *
                      </Label>
                      <Input
                        id="wb-tel"
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="3001234567"
                        error={!!errors.telefono}
                      />
                      {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>}
                    </div>

                    <div>
                      <Label className="text-xs text-text-secondary mb-1 block">
                        Número de asistentes
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl bg-white/40 border border-white/50 p-1">
                          <button
                            type="button"
                            onClick={() => setAsistentes((n) => Math.max(1, n - 1))}
                            disabled={asistentes <= 1}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-primary hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed focus-ring transition-colors"
                            aria-label="Disminuir asistentes"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-semibold text-text-primary tabular-nums">
                            {asistentes}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAsistentes((n) => Math.min(spotsLeft, n + 1))}
                            disabled={asistentes >= spotsLeft}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-primary hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed focus-ring transition-colors"
                            aria-label="Aumentar asistentes"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className="text-sm text-text-secondary">
                          {formatCOP(workshop.price * asistentes)} total
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full mt-2"
                      loading={createReservation.isPending}
                    >
                      Confirmar reserva
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
